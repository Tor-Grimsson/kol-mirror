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
      genFrom: null,
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

/* ── FX MODULES (2026-10-03) ──────────────────────────────────────────────────────────────────
 * An FX module is a node of its own: one effect, one IN, one OUT, and no cable it did not get
 * from the user (*"no preconfigured paths ever … the whole point is to patch yourself"*). Its
 * `input` is stored the way a channel's `routeFrom` is — a channel INDEX, or a string key for a
 * bus or another module — and its OUT is the key below, which goes wherever a bus key goes:
 * a channel's `routeFrom`, another module's `input` (its own included — a one-frame loop, his
 * choice), a master input slot. */

/** The frame key of an FX module's OUT. */
export const fxKey = (id) => `fxm:${id}`
export const isFxKey = (v) => typeof v === 'string' && v.startsWith('fxm:')

/** Numeric channel indices the FX modules read a frame from. */
export function fxModuleChannels(modules = []) {
  const needed = new Set()
  for (const m of modules) if (typeof m.input === 'number') needed.add(m.input)
  return needed
}

/** A channel was removed: a module input that is a channel index shifts like every other reference. */
export function shiftFxModules(modules = [], removed) {
  return modules.map((m) => (typeof m.input === 'number' ? { ...m, input: shift(m.input, removed) } : m))
}

/**
 * Remove an FX module AND every cable into or out of it.
 * @returns {{modules: Array, channels: Array, master: Object}} new state
 */
export function removeFxModule(modules = [], channels = [], master, id) {
  const key = fxKey(id)
  return {
    modules: modules.filter((m) => m.id !== id).map((m) => (m.input === key ? { ...m, input: null } : m)),
    channels: channels.map((ch) => (ch.routeFrom === key ? { ...ch, routeFrom: null } : ch)),
    master: { ...master, inputs: (master?.inputs || []).map((src) => (src === key ? null : src)) },
  }
}

/* ── THE CABLE LIST (plan 10 § 4.2, 2026-10-24) ─────────────────────────────────────────────────
 * The user: *"everything should be cable connected … we have to conform and unify how we do things,
 * visually and logically."* The fields above stay the storage (saved patches keep loading), and this is
 * the ONE reading of them: every connection the desk holds, as `{ key, from, to, level? }`, plus the one
 * way to make and break one. The patch table, the routing bay's list and the drawn cables all read
 * `listCables`, so a connection can't exist in one and not another.
 *
 *   from  a source: a channel index · a bus key (`rtn1` …) · an FX module key (`fxm:<id>`) · a generator (`gen:<id>`)
 *   to    `mst-in:<n>` · `mon` (Screen 2) · `ch-in:<i>` · `bus:<key>` · `ch-x:<j>` · `fb:<i>` · `fxm-in:<id>`
 */

/** Every cable in this patch state. `level` is a send's amount (0–100) where the connection has one. */
export function listCables({ channels = [], master, screen2 = 'off', fxModules = [] }) {
  const out = []
  ;(master?.inputs || []).forEach((src, n) => { if (src != null) out.push({ key: `mst-in:${n}`, from: src, to: `mst-in:${n}` }) })
  if (/^\d+$/.test(String(screen2))) out.push({ key: 'mon', from: parseInt(String(screen2)), to: 'mon' })
  channels.forEach((ch, i) => {
    if (ch.routeFrom != null) out.push({ key: `ch-in:${i}`, from: ch.routeFrom, to: `ch-in:${i}` })
    /* a generator cabled into a channel IN (plan 11 § 3.3) — it is the channel's SOURCE, kept live, not a frame route */
    if (ch.genFrom) out.push({ key: `gen>ch-in:${i}`, from: ch.genFrom, to: `ch-in:${i}` })
    for (const [bus, lvl] of Object.entries(ch.sends || {})) if (lvl > 0) out.push({ key: `bus:${bus}:${i}`, from: i, to: `bus:${bus}`, level: lvl })
    for (const [k, lvl] of Object.entries(ch.routeSendLevels || {})) {
      const j = parseInt(k)
      if (!isNaN(j) && lvl > 0) out.push({ key: `ch-x:${j}:${i}`, from: i, to: `ch-x:${j}`, level: lvl })
    }
    if (ch.feedback?.enabled) out.push({ key: `fb:${i}`, from: i, to: `fb:${i}` })
  })
  for (const m of fxModules) if (m.input != null) out.push({ key: `fxm-in:${m.id}`, from: m.input, to: `fxm-in:${m.id}` })
  return out
}

const SPLIT = (to) => { const c = to.indexOf(':'); return c < 0 ? [to, ''] : [to.slice(0, c), to.slice(c + 1)] }

/** Which sources a destination takes — a send, a cross-send and Screen 2 read a channel only. */
export function accepts(to, from) {
  const [kind] = SPLIT(to)
  if (kind === 'bus' || kind === 'ch-x' || kind === 'mon' || kind === 'fb') return typeof from === 'number'
  return from != null
}

/**
 * Make (any accepted source) or break (`from` null) one level-less connection — sends are `setSend`.
 * @returns {{channels: Array, master: Object, screen2: string, fxModules: Array}} new state — every part, changed or not
 */
export function setCable(state, to, from) {
  const { channels = [], master, screen2 = 'off', fxModules = [] } = state
  const next = { channels, master, screen2, fxModules }
  const [kind, arg] = SPLIT(to)
  const ch = (i, patch) => channels.map((c, k) => (k === i ? { ...c, ...patch } : c))
  if (from != null && !accepts(to, from)) return next
  if (kind === 'mst-in') next.master = { ...master, inputs: (master?.inputs || []).map((v, n) => (n === +arg ? from ?? null : v)) }
  else if (kind === 'mon') next.screen2 = from == null ? 'off' : String(from)
  else if (kind === 'ch-in') next.channels = ch(+arg, { routeFrom: from ?? null })
  else if (kind === 'fxm-in') next.fxModules = fxModules.map((m) => (m.id === arg ? { ...m, input: from ?? null } : m))
  else if (kind === 'fb') next.channels = ch(+arg, { feedback: { ...(channels[+arg]?.feedback || {}), enabled: from != null } })
  return next
}

/** A level-carrying connection (`bus:<key>` · `ch-x:<j>`) from channel `i` — 0 breaks it. */
export function setSend(state, to, i, level) {
  const { channels = [] } = state
  const [kind, arg] = SPLIT(to)
  const c = channels[i]
  if (!c) return { ...state }
  const patch = kind === 'bus' ? { sends: { ...c.sends, [arg]: level } } : kind === 'ch-x' ? { routeSendLevels: { ...c.routeSendLevels, [arg]: level } } : null
  return { ...state, channels: patch ? channels.map((x, k) => (k === i ? { ...x, ...patch } : x)) : channels }
}

export const isGenKey = (v) => typeof v === 'string' && v.startsWith('gen:')

/** Break the cable `listCables` returned. A generator's cable unpatches the source and leaves the channel loaded. */
export function removeCable(state, cable) {
  if (isGenKey(cable.from)) {
    const i = +cable.to.slice(6)
    return { ...state, channels: (state.channels || []).map((c, k) => (k === i ? { ...c, genFrom: null } : c)) }
  }
  return cable.level != null ? setSend(state, cable.to, cable.from, 0) : setCable(state, cable.to, null)
}
