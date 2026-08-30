import { useSyncExternalStore } from 'react'

/**
 * renderStats — where the frame actually goes.
 *
 * The mixer's cost was guesswork: one fps number tells you it's slow, never
 * which stage is slow. This accumulates wall time per stage inside the frame
 * loop and publishes a snapshot ten times a second (F toggles the readout).
 *
 * Deliberately outside React — `mark()` runs several times per frame on the hot
 * path, so it must not touch state. Cost of a sample is two `performance.now()`
 * calls; `enabled` gates even that, so an unobserved app pays nothing.
 */
const STAGES = ['capture', 'canvasFx', 'feedback', 'buses', 'paint']

let enabled = false
const consumers = new Set()
const acc = Object.create(null)   // stage -> ms accumulated this window
let frames = 0
let windowStart = 0
let snapshot = { fps: 0, frameMs: 0, p95: 0, jank: 0, stages: {}, perChannel: {}, pixels: 0, channels: 0 }
/* Per-CHANNEL cost. imweb measures the frame and never the layer; with three
   channels we can say which one is expensive, which is the question actually
   worth answering when a patch gets slow. Pixi channels self-report via
   usePixiApp; the DOM-capture path (SVG filters, the costly one) reports here. */
const chAcc = Object.create(null)
/* An average fps hides the stalls that are actually felt, so keep the frame
   deltas and report p95 + a jank count (>20ms = a dropped frame at 60). */
const deltas = []
let lastFrame = 0
const JANK_MS = 20
const listeners = new Set()

/**
 * Sampling runs while ANY consumer wants it — the F readout, or the adaptive
 * controller, which needs numbers whether or not anyone is looking.
 */
export function setStatsConsumer(name, on) {
  if (on) consumers.add(name); else consumers.delete(name)
  const next = consumers.size > 0
  if (next === enabled) return
  enabled = next
  if (enabled) { reset(); windowStart = performance.now(); lastFrame = 0 }
}
export const setStatsEnabled = (on) => setStatsConsumer('readout', on)
export const statsEnabled = () => enabled

function reset() {
  for (const s of STAGES) acc[s] = 0
  for (const k of Object.keys(chAcc)) delete chAcc[k]
  frames = 0
}

/** Attribute wall time to one channel (call with the ms it took). */
export function markChannel(index, ms) {
  if (!enabled) return
  chAcc[index] = (chAcc[index] || 0) + ms
}

/** Time one stage: `const t = begin(); …work…; end('capture', t)`. */
export const begin = () => (enabled ? performance.now() : 0)
export function end(stage, t0) {
  if (!enabled || !t0) return
  acc[stage] = (acc[stage] || 0) + (performance.now() - t0)
}

/** Call once per frame loop iteration, after the stages. */
export function endFrame(meta) {
  if (!enabled) return
  frames++
  const now = performance.now()
  if (lastFrame) deltas.push(now - lastFrame)
  lastFrame = now
  const elapsed = now - windowStart
  if (elapsed < 500) return
  const stages = {}
  for (const s of STAGES) stages[s] = +((acc[s] || 0) / frames).toFixed(2)
  const sorted = [...deltas].sort((a, b) => a - b)
  const p95 = sorted.length ? sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95))] : 0
  const jank = deltas.filter((d) => d > JANK_MS).length
  deltas.length = 0
  const perChannel = {}
  for (const k of Object.keys(chAcc)) perChannel[k] = +(chAcc[k] / frames).toFixed(2)
  snapshot = {
    fps: Math.round((frames * 1000) / elapsed),
    frameMs: +(Object.values(stages).reduce((a, b) => a + b, 0)).toFixed(2),
    p95: +p95.toFixed(1),
    jank,
    stages,
    perChannel,
    pixels: meta?.pixels ?? snapshot.pixels,
    channels: meta?.channels ?? snapshot.channels,
  }
  reset()
  windowStart = now
  listeners.forEach((l) => l())
}

/** The paint loop may be idle (no routing/sends/feedback) — keep fps honest. */
export function tickIdle() {
  if (!enabled) return
  frames++
  const now = performance.now()
  if (now - windowStart < 500) return
  snapshot = { ...snapshot, fps: Math.round((frames * 1000) / (now - windowStart)), frameMs: 0, stages: {} }
  lastFrame = 0
  reset()
  windowStart = now
  listeners.forEach((l) => l())
}

export const subscribeStats = (l) => { listeners.add(l); return () => listeners.delete(l) }
export const getStats = () => snapshot

export const useRenderStats = () =>
  useSyncExternalStore((l) => { listeners.add(l); return () => listeners.delete(l) }, () => snapshot)
