/**
 * patchGraph — the patch model as pure functions.
 *
 * Every connection in the mixer is stored as a CHANNEL INDEX: `master.inputs[n]`,
 * a numeric `routeFrom`, the keys of `routeSendLevels`, and Screen 2's source.
 * That is fine until the channel list changes shape — and `onRemoveChannel` used
 * to be a bare `filter`, so removing channel 2 left every patch above it pointing
 * one slot too high: cables silently re-attached to a different channel, and a
 * patch to the removed channel became a dangling index into `undefined`.
 *
 * Kept pure and out of the component so the rules can be exercised by
 * `node src/hooks/patchGraph.test.mjs` — index remapping is exactly the kind of
 * logic that looks right and is off by one.
 */

/** Numeric channel indices this patch state actually consumes a frame from. */
export function consumedChannels(channels, screen2 = 'off') {
  const needed = new Set()
  for (let i = 0; i < channels.length; i++) {
    const ch = channels[i]
    if (!ch?.enabled) continue
    if (ch.canvasFx?.length > 0) needed.add(i)
    if (ch.feedback?.enabled) needed.add(i)
    if (ch.sends && Object.values(ch.sends).some((v) => v > 0)) needed.add(i)
    if (typeof ch.routeFrom === 'number') needed.add(ch.routeFrom)
    for (const [k, v] of Object.entries(ch.routeSendLevels || {})) {
      const n = parseInt(k)
      if (!isNaN(n) && v > 0) needed.add(n)
    }
  }
  if (/^\d+$/.test(String(screen2))) needed.add(parseInt(String(screen2)))
  return needed
}

/** Index after removing `removed`: itself → null, above → shifts down one. */
const shift = (i, removed) => (i == null ? null : i === removed ? null : i > removed ? i - 1 : i)

/**
 * Remove a channel AND every reference to it, remapping the indices that shift.
 * @returns {{channels: Array, master: Object, screen2: string}} new state
 */
export function removeChannelAt(channels, master, screen2, removed) {
  const nextChannels = channels
    .filter((_, i) => i !== removed)
    .map((ch) => {
      const routeFrom = typeof ch.routeFrom === 'number' ? shift(ch.routeFrom, removed) : ch.routeFrom
      const routeSendLevels = {}
      for (const [k, v] of Object.entries(ch.routeSendLevels || {})) {
        const n = parseInt(k)
        if (isNaN(n)) { routeSendLevels[k] = v; continue }   // bus keys pass through
        const s = shift(n, removed)
        if (s != null) routeSendLevels[s] = v
      }
      return { ...ch, routeFrom, routeSendLevels }
    })

  const inputs = (master?.inputs || []).map((src) => shift(src, removed))
  const s2 = /^\d+$/.test(String(screen2)) ? shift(parseInt(String(screen2)), removed) : null
  return {
    channels: nextChannels,
    master: { ...master, inputs },
    screen2: /^\d+$/.test(String(screen2)) ? (s2 == null ? 'off' : String(s2)) : screen2,
  }
}

/** Clear every patch without touching what each channel holds. */
export function clearAllPatches(channels, master) {
  return {
    channels: channels.map((ch) => ({
      ...ch,
      routeFrom: null,
      routeSendLevels: {},
      sends: Object.fromEntries(Object.keys(ch.sends || {}).map((k) => [k, 0])),
      feedback: { ...(ch.feedback || {}), enabled: false },
    })),
    master: { ...master, inputs: (master?.inputs || []).map(() => null) },
  }
}

/**
 * A channel that just received content should be audible. Startup stays empty
 * — the modular law is that nothing is wired until someone wires it — but a
 * LOAD is someone acting, and a load whose result renders nothing reads as a
 * broken app. So: if this channel is not already in a master input and a slot
 * is free, claim the first free one. Never steals an occupied slot, never
 * re-patches a channel that is already patched.
 *
 * @returns {number[]|null} the new inputs array, or null if nothing to change
 */
export function patchIntoFreeInput(master, idx) {
  const inputs = [...(master?.inputs || [])]
  if (inputs.includes(idx)) return null
  const free = inputs.indexOf(null)
  if (free === -1) return null
  inputs[free] = idx
  return inputs
}
