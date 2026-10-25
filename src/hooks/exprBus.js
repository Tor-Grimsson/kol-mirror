import { useSyncExternalStore } from 'react'
import { compile } from './useExpressionValue'
import { transport } from './transport'

/**
 * The expression OUTPUTS — four slots, A–D, whose live values any knob can read
 * (user 2026-10-15: *"a module in the mixer connected to it … a couple of slots
 * and output them through the expression module"*).
 *
 * The Expressions tab stays the editor; this is the patch point. Each slot holds
 * a formula; one rAF loop evaluates all four on the transport's clock into
 * `exprBusRef.current` (`{ A, B, C, D }`, each 0–100). A knob patched to slot A
 * — right-click → A, which commits the expression `A` — reads it through the
 * compiler's bus, the same seam `useExpressionValue` already had for buses.
 *
 * ponytail: slots are session state, not saved in a patch — add them to
 * `serializePatch` the day a patch needs to carry its modulation.
 */
export const SLOT_KEYS = ['A', 'B', 'C', 'D']

export const exprBusRef = { current: { A: 0, B: 0, C: 0, D: 0 } }

let slots = ['wave(t)', '', '', '']
let fns = slots.map((e) => (e ? compile(e, []) : null))
const listeners = new Set()
const emit = () => listeners.forEach((l) => l())

export function setSlot(i, expr) {
  slots = slots.map((e, n) => (n === i ? expr : e))
  fns = fns.map((f, n) => (n === i ? (expr.trim() ? compile(expr, []) : null) : f))
  emit()
  ensureLoop()
}
export const slotValid = (i) => !slots[i].trim() || !!fns[i]
export const useSlots = () => useSyncExternalStore((l) => { listeners.add(l); return () => listeners.delete(l) }, () => slots)

/* HOLD (plan 16 W5): the Expression module's power — off freezes A–D at their last values; the loop keeps
   running so on picks up from the clock, not from where it stopped */
let held = false
const heldListeners = new Set()
export const setExprHeld = (v) => { held = v; heldListeners.forEach((l) => l()) }
export const useExprHeld = () => useSyncExternalStore((l) => { heldListeners.add(l); return () => heldListeners.delete(l) }, () => held)
/* each slot's own on / off (plan 16 W9) — an off slot holds its value and keeps its OUT */
let slotOn = [true, true, true, true]
export const setSlotOn = (i, on) => { slotOn = slotOn.map((v, n) => (n === i ? on : v)); heldListeners.forEach((l) => l()) }
export const useSlotOn = () => useSyncExternalStore((l) => { heldListeners.add(l); return () => heldListeners.delete(l) }, () => slotOn)

let raf = null
let frame = 0
function ensureLoop() {
  if (raf || !fns.some(Boolean)) return
  const tick = () => {
    if (!fns.some(Boolean)) { raf = null; return }
    raf = requestAnimationFrame(tick)
    if (held) return
    const t = transport.now()
    const f = frame++
    const v = { ...exprBusRef.current }
    SLOT_KEYS.forEach((k, i) => {
      if (!slotOn[i]) return
      if (!fns[i]) { v[k] = 0; return }
      try { v[k] = Math.max(0, Math.min(100, fns[i](t, f, 0, 100, {}))) } catch { /* a bad frame holds the last value */ }
    })
    exprBusRef.current = v
  }
  raf = requestAnimationFrame(tick)
}
ensureLoop()
