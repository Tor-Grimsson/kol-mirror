import { getDefaultCanvasFxParams } from './useCanvasFx'

/* FOUR SLOTS PER FX MODULE (plan 16 W3, user 2026-10-25: *"why dont we allow more then one fx per fx module? …
   fx module colud have 4 slots"*). A module is `{ id, slots: [slot | null × 4], enabled, input }`, a slot
   `{ type, params, enabled }`. A module saved before this carried one `type` / `params` — it reads as slot 1. */
export const FX_SLOT_COUNT = 4

export function slotsOf(m) {
  if (Array.isArray(m?.slots)) return Array.from({ length: FX_SLOT_COUNT }, (_, i) => m.slots[i] ?? null)
  const first = m?.type ? { type: m.type, params: m.params ?? getDefaultCanvasFxParams(m.type), enabled: true } : null
  return [first, null, null, null]
}

/* the chain the frame buffer runs: the filled, switched-on slots in order */
export const chainOf = (m) => slotsOf(m).filter((s) => s?.enabled).map((s) => ({ type: s.type, enabled: true, params: s.params }))

/* a patch for one slot → the module's next `slots`; `null` empties it, a new `type` resets its params */
export function withSlot(m, i, patch) {
  const slots = slotsOf(m)
  if (patch === null) slots[i] = null
  else {
    const prev = slots[i]
    const type = patch.type ?? prev?.type
    const fresh = !prev || (patch.type && patch.type !== prev.type)
    slots[i] = { type, enabled: prev?.enabled ?? true, params: fresh ? getDefaultCanvasFxParams(type) : prev.params, ...patch, ...(patch.params && !fresh ? { params: { ...prev.params, ...patch.params } } : null) }
  }
  return { slots, type: slots.find(Boolean)?.type ?? null }
}
