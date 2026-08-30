/**
 * patchFile — a mixer patch as a portable, versioned object.
 *
 * The wire format is the library entry shape (`useLibraryStore`), so patches,
 * effects and expressions all export, import and list through one path:
 *
 *   { version, kind: 'patch', name, description, tags, savedAt, data }
 *
 * `data` is the whole desk: channels (what each holds and how it is processed),
 * master (levels, buses, and the INPUT SLOTS that are the patch itself), and
 * the canvas settings that decide what the result looks like.
 *
 * What is deliberately NOT saved:
 *  - `customImageSrc` / `customRasterSrc` when they are data URLs. A single
 *    uploaded image can be megabytes; a nine-slot store of them blows the
 *    ~5MB localStorage quota and takes the whole library with it. Memory slots
 *    already learned this. A patch reloads against the default source.
 *  - `recSlots` — recorded video blobs are session-scoped object URLs; they are
 *    dead links in any later session, so saving them saves a broken reference.
 *  - Transient UI (armed-for-record, active rec slot).
 */

export const PATCH_VERSION = 1

/* Channel fields worth carrying. An allow-list rather than a delete-list: a new
   transient field added to EMPTY_CHANNEL should not silently start being saved. */
const CHANNEL_KEYS = [
  'variantId', 'params', 'slotIndex', 'enabled', 'intensity', 'boosted', 'speed',
  'opacity', 'name', 'fx', 'canvasFx', 'blendMode', 'vectorColor', 'backgroundColor',
  'rasterTheme', 'rasterTierOverride', 'loadMode', 'vectorPadding',
  'sends', 'routeFrom', 'routeSendLevels', 'feedback',
]

const MASTER_KEYS = [
  'enabled', 'inputs', 'opacity', 'blendMode', 'fx', 'inserts',
  'aux1', 'aux2', 'rtn1', 'rtn2', 'fx1', 'fx2',
]

const pick = (obj, keys) => {
  const out = {}
  for (const k of keys) if (obj && obj[k] !== undefined) out[k] = obj[k]
  return out
}

const isDataUrl = (v) => typeof v === 'string' && v.startsWith('data:')

/** Current mixer state → the `data` half of a patch entry. */
export function serializePatch({ channels = [], master = {}, canvas = {} }) {
  return {
    channels: channels.map((ch) => {
      const out = pick(ch, CHANNEL_KEYS)
      // A named source survives; an inlined upload does not (see the docblock).
      if (ch.customImageSrc && !isDataUrl(ch.customImageSrc)) out.customImageSrc = ch.customImageSrc
      if (ch.customRasterSrc && !isDataUrl(ch.customRasterSrc)) out.customRasterSrc = ch.customRasterSrc
      if (ch.customImageName) out.customImageName = ch.customImageName
      return out
    }),
    master: pick(master, MASTER_KEYS),
    canvas: pick(canvas, ['ratio', 'layout', 'customWidth', 'customHeight', 'loadMode', 'rasterTheme', 'screen2']),
  }
}

/**
 * A patch's `data` → the state to apply. Missing fields fall back to the
 * defaults passed in, so a patch saved by an older version still loads and a
 * hand-written preset can carry only what it cares about.
 *
 * Channel count follows the patch: a 2-channel patch loaded over a 3-channel
 * desk leaves the third empty rather than keeping a stale one that no master
 * input can address.
 */
export function applyPatch(data, { emptyChannel = {}, master: currentMaster = {} } = {}) {
  const channels = (data?.channels || []).map((ch) => ({ ...emptyChannel, ...ch }))
  const master = { ...currentMaster, ...(data?.master || {}) }
  // Never let a patch hand us an input pointing past the end of the desk.
  master.inputs = (master.inputs || [null, null, null]).map((i) =>
    typeof i === 'number' && i >= 0 && i < channels.length ? i : null)
  return { channels, master, canvas: data?.canvas || {} }
}

/** A complete library entry for the current desk. */
export const buildPatchEntry = (state, { name, description = '', tags = [] }) => ({
  version: PATCH_VERSION,
  kind: 'patch',
  name,
  description,
  tags,
  data: serializePatch(state),
})
