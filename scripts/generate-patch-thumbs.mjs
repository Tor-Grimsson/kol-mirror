#!/usr/bin/env node
// generate-patch-thumbs.mjs — the shipped patches' REAL output as their card image.
// Usage: pnpm generate-patch-thumbs [--only <file-stem>]
//
// User 2026-10-15: *"just print the fucking output like fxr does right? thats a
// saved patch right?"*. A user's save captures its frame on save (`entry.thumb`);
// a shipped preset has no save, so this does the same thing at build time: open
// each preset in the studio through its Library page's Load and photograph the docked
// Monitor's frame → public/previews/patches/<file-stem>.jpg. The literal output,
// canvas FX and buses included.
// Own dev server on its own port, killed at the end (generate-previews' pattern).

import { spawn } from 'node:child_process'
import { mkdirSync, readdirSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const PORT = 5179
const BASE = `http://localhost:${PORT}`
const SRC = join(ROOT, 'src/data/presets/patches')
const OUT = join(ROOT, 'public/previews/patches')
const ONLY = process.argv.includes('--only') ? process.argv[process.argv.indexOf('--only') + 1] : null

const presets = readdirSync(SRC).filter((f) => f.endsWith('.json'))
  .map((f) => ({ stem: f.replace(/\.json$/, ''), kind: JSON.parse(readFileSync(join(SRC, f), 'utf8')).kind }))
  .filter((p) => !ONLY || p.stem === ONLY)

function startServer() {
  const server = spawn('npx', ['vite', '--port', String(PORT), '--strictPort'], { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, BROWSER: 'none' } })
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('dev server startup timeout')), 30000)
    server.stdout.on('data', (d) => { if (/Local:|ready in/.test(d.toString())) { clearTimeout(t); resolve(server) } })
    server.stderr.on('data', (d) => { if (d.toString().includes('EADDRINUSE')) { clearTimeout(t); reject(new Error(`port ${PORT} in use`)) } })
  })
}

mkdirSync(OUT, { recursive: true })
const server = await startServer()
const browser = await chromium.launch()
try {
  for (const { stem, kind } of presets) {
    process.stdout.write(`  patches/${stem}... `)
    const page = await browser.newPage({ viewport: { width: 2600, height: 1500 }, colorScheme: 'dark' })
    await page.goto(`${BASE}/library`, { waitUntil: 'networkidle' })
    await page.evaluate(() => localStorage.setItem('mirror-library', '[]'))
    await page.reload({ waitUntil: 'networkidle' })
    /* a Library card opens the patch's page (2026-10-24), and Load there opens the studio — the id is the
       store's `preset:<kind>:<file-stem>` */
    await page.goto(`${BASE}/library/patch/${encodeURIComponent(`preset:${kind}:${stem}`)}`, { waitUntil: 'networkidle' })
    await page.getByRole('button', { name: 'Load', exact: true }).click()
    await page.waitForTimeout(2500)
    /* THE FRAME ITSELF, photographed — the docked Monitor's slot is exactly where the
       output sits. A recomposition from channel buffers misses canvas FX and the bus
       layers (Monochrome came out black, Bus Wash empty, 2026-10-15); a picture of
       the frame cannot. */
    const slot = page.locator('[data-monitor-slot]').first()
    await slot.scrollIntoViewIfNeeded().catch(() => {})
    const box = await slot.boundingBox()
    if (box && box.width > 0) {
      await page.screenshot({ path: join(OUT, `${stem}.jpg`), type: 'jpeg', quality: 82, clip: box })
      console.log('ok')
    } else console.log('NO FRAME — the Monitor slot is not on screen')
    await page.close()
  }
} finally {
  await browser.close()
  server.kill()
}
console.log('Done.')
