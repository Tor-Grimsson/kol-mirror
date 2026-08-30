import { useSyncExternalStore } from 'react'

/**
 * The timeline — one clock for everything time-driven (knob expressions, the
 * scope, the studio's animate) and one transport for all of it: Space is
 * play/pause (bound in App's Shell, every route); the desk's Playback module
 * adds stop, direction, speed, loop and ease. `now()` is the SHAPED time in
 * seconds: it stands still while paused, runs at `rate`, and in reverse /
 * ping-pong folds over `loop` seconds (ease-in-out on the turnarounds by
 * `ease`). The studio subscribes and mirrors `playing` into its animate.
 */
export const MODES = ['forward', 'reverse', 'pingpong']
/* NOTHING AUTOPLAYS (user, 2026-08-28): the clock boots paused everywhere —
   expressions, the scope, the studio's animate — and Space starts it. `reset()`
   restores the transport's shape, not this, so it never starts the clock. */
const DEFAULTS = { playing: false, rate: 1, mode: 'forward', loopIn: 0, loopOut: 8, swing: 0, ease: 0, looping: false, hold: false }
let state = { ...DEFAULTS }
let base = 0 // rate-scaled seconds banked up to `anchor`
let anchor = performance.now() / 1000
const listeners = new Set()
const emit = () => listeners.forEach((l) => l())

const raw = () => (state.playing ? base + (performance.now() / 1000 - anchor) * state.rate : base)
const easeInOut = (u) => (u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2)
const wrap = (x, m) => ((x % m) + m) % m

/* SWING — "two ticks on one clock" (user, 2026-08-28). Every loop cycle
   carries two beats; swing slides the midpoint between them, so the first runs
   long in wall time and the second catches up. `u` is the cycle phase 0..1 in
   and out, so swing is a pure reparameterisation of the clock — it never
   changes where a cycle starts or ends, only where its halfway point falls. */
const swingU = (u, s) => {
  if (!s) return u
  const m = 0.5 + s * 0.4 // the moved midpoint: 0.5 (straight) → 0.9 (hard shuffle)
  return u < m ? (u / m) * 0.5 : 0.5 + ((u - m) / (1 - m)) * 0.5
}
const swung = (r, L, s) => (s ? (Math.floor(r / L) + swingU(wrap(r, L) / L, s)) * L : r)

/* The loop is a WINDOW, not a length (user, 2026-08-28: "loop in/out"). IN and
   OUT are absolute seconds on the timeline and either may be dragged past the
   other, so the window is read min-first. `looping` arms it for FORWARD; the
   two folding modes are a loop by definition and always use it. */
function shape(r) {
  const { mode, loopIn, loopOut, swing, ease, looping } = state
  const a = Math.min(loopIn, loopOut)
  const L = Math.max(0.1, Math.abs(loopOut - loopIn))
  const s = swing / 100
  if (mode === 'forward' && !looping) return swung(r, L, s)
  const t = swung(r, L, s)
  if (mode === 'forward') return a + wrap(t, L)
  if (mode === 'reverse') return a + (L - wrap(t, L))
  const p = wrap(t, 2 * L) / L // 0..2 — out and back
  const leg = p <= 1 ? p : 2 - p
  return a + (leg + (easeInOut(leg) - leg) * ease) * L
}
// Bank the elapsed time at the OLD rate before anything changes, so the clock never jumps.
let held = 0
const set = (patch) => {
  // HOLD freezes the OUTPUT, not the clock — time keeps accumulating underneath,
  // so releasing hold jumps to where the transport actually got to. That is what
  // separates it from pause, which banks time and stands still.
  if (patch.hold === true && !state.hold) held = shape(raw())
  base = raw()
  anchor = performance.now() / 1000
  state = { ...state, ...patch }
  emit()
}

export const transport = {
  now: () => (state.hold ? held : shape(raw())),
  get playing() { return state.playing },
  get state() { return state },
  play() { if (!state.playing) set({ playing: true }) },
  pause() { if (state.playing) set({ playing: false }) },
  toggle() { if (state.playing) transport.pause(); else transport.play() },
  stop() { base = 0; anchor = performance.now() / 1000; state = { ...state, playing: false }; emit() },
  /* Restores the clock's SHAPE, never its run state — see the boot note above. */
  reset() { set({ rate: DEFAULTS.rate, mode: DEFAULTS.mode, loopIn: DEFAULTS.loopIn, loopOut: DEFAULTS.loopOut, swing: DEFAULTS.swing, ease: DEFAULTS.ease, looping: DEFAULTS.looping, hold: DEFAULTS.hold }) },
  set,
  subscribe(l) { listeners.add(l); return () => listeners.delete(l) },
}

export const useTransport = () => useSyncExternalStore(transport.subscribe, () => state)
export const useTransportPlaying = () => useSyncExternalStore(transport.subscribe, () => state.playing)
