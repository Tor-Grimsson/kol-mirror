#!/usr/bin/env node
// generate-previews.mjs — captures preview PNGs via Playwright.
// Usage: pnpm generate-previews [--only <id>] [--kind variants|generators|fx]
// Starts a dev server, walks /dev/capture for every capturable thing, and saves
// PNGs to public/previews/. Ported from kol-monitor's generate-previews.js
// (puppeteer-core + system Chrome there; @playwright/test is already a
// devDependency here, so its chromium is used instead).
//
// THREE KINDS, TWO FOLDERS (2026-08-28, plan 1.3):
//   variants + generators → public/previews/variants/<id>.png
//   canvas FX units       → public/previews/fx/<id>.png
// Generators sit with the variants because they ARE sources — the card asks for
// `/previews/variants/${id}.png` and gets one, no branch. FX units are a
// different kind of thing (a unit applied to a still, not a source), so they get
// their own folder rather than making the card's fallback guess.

import { spawn } from 'node:child_process'
import { mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const PORT = 5177
const BASE = `http://localhost:${PORT}`
const VARIANT_DIR = join(ROOT, 'public/previews/variants')
const FX_DIR = join(ROOT, 'public/previews/fx')

const arg = (flag) => {
  const i = process.argv.indexOf(flag)
  return i !== -1 ? process.argv[i + 1] : null
}
const ONLY = arg('--only')
const KIND = arg('--kind')

async function startDevServer() {
  const server = spawn('npx', ['vite', '--port', String(PORT), '--strictPort'], {
    cwd: ROOT,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, BROWSER: 'none' },
  })

  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Dev server startup timeout')), 30000)
    server.stdout.on('data', (data) => {
      const msg = data.toString()
      if (msg.includes('Local:') || msg.includes('ready in')) {
        clearTimeout(timeout)
        resolve()
      }
    })
    server.stderr.on('data', (data) => {
      if (data.toString().includes('EADDRINUSE')) {
        clearTimeout(timeout)
        reject(new Error(`Port ${PORT} already in use`))
      }
    })
    server.on('error', (err) => { clearTimeout(timeout); reject(err) })
  })

  return server
}

async function main() {
  mkdirSync(VARIANT_DIR, { recursive: true })
  mkdirSync(FX_DIR, { recursive: true })

  console.log('Starting dev server...')
  const server = await startDevServer()
  console.log(`Dev server ready on port ${PORT}`)

  let browser
  try {
    // System Chrome, not the headless shell — Pixi's WebGL (TilingSprite +
    // mask) is unreliable on the shell's SwiftShader; monitor's script uses
    // real Chrome for the same reason. The fake device is Live Input's: with no
    // camera it renders nothing and bakes a blank, and on a machine WITH one it
    // would bake whatever the webcam is pointed at into a committed asset.
    browser = await chromium.launch({
      channel: 'chrome',
      args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'],
    })
    const page = await browser.newPage({
      viewport: { width: 900, height: 600 },
      deviceScaleFactor: 2,
      permissions: ['camera'],
    })

    await page.goto(`${BASE}/dev/capture?kind=list`, { waitUntil: 'networkidle', timeout: 15000 })
    const { variantIds, generatorIds, fxIds } = JSON.parse(await page.locator('#capture-list').textContent({ timeout: 10000 }))

    /* One flat job list — the only differences are the query key, the output
       folder and how long the thing needs before it is worth photographing. */
    const jobs = [
      ...variantIds.map((id) => ({ id, kind: 'variants', url: `variant=${id}`, dir: VARIANT_DIR, settle: 1200 })),
      // A generator has to run before it has an image; its first frame is often
      // flat (noise seeds dark, gradients start at one stop).
      ...generatorIds.map((id) => ({ id, kind: 'generators', url: `variant=${id}`, dir: VARIANT_DIR, settle: 2000 })),
      // FX drift the still for 24 frames and then flag ready themselves.
      ...fxIds.map((id) => ({ id, kind: 'fx', url: `fx=${id}`, dir: FX_DIR, settle: 0, waitReady: true })),
    ].filter((j) => (!KIND || j.kind === KIND) && (!ONLY || j.id === ONLY))

    console.log(`Capturing ${jobs.length} of ${variantIds.length + generatorIds.length + fxIds.length}`)

    let failed = 0
    for (const job of jobs) {
      process.stdout.write(`  ${job.kind}/${job.id}...`)
      try {
        await page.goto(`${BASE}/dev/capture?${job.url}`, { waitUntil: 'networkidle', timeout: 15000 })
        await page.waitForSelector('#capture-target', { timeout: 10000 })
        if (job.waitReady) {
          // Set by FxCapture once its drift frames have run — or to 'skip' when
          // the unit cannot run on this machine at all.
          const state = await page.waitForFunction(
            () => {
              const c = document.getElementById('capture-canvas')
              return c?.dataset.captureReady ? { ready: c.dataset.captureReady, reason: c.dataset.captureReason || '' } : null
            },
            null,
            { timeout: 10000 },
          ).then((h) => h.jsonValue())
          if (state.ready === 'skip') {
            // No PNG rather than a false one — the card degrades to the glyph.
            console.log(` skipped: ${state.reason}`)
            continue
          }
        }
        // Settle: Pixi textures load, GSAP variants reach mid-motion.
        if (job.settle) await page.waitForTimeout(job.settle)
        await page.locator('#capture-target').screenshot({ path: join(job.dir, `${job.id}.png`), type: 'png' })
        console.log(' ok')
      } catch (err) {
        failed++
        console.log(` FAILED: ${err.message}`)
      }
    }

    console.log(failed ? `\nDone with ${failed} failure(s).` : '\nDone.')
    process.exitCode = failed ? 1 : 0
  } finally {
    if (browser) await browser.close()
    server.kill()
  }
}

main().catch(err => {
  console.error('Fatal:', err)
  process.exit(1)
})
