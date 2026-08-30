import { CANVAS_FX_DEFS } from '../hooks/useCanvasFx'
import { DISPLACEMENT_VARIANTS, MOVEMENT_VARIANTS, COPIES_VARIANTS, GENERATOR_VARIANTS } from './mirrorVariants'
import { MIXER_MODULES } from './mixerModules'

/**
 * MODULE_REGISTRY — one list of every unit the instrument has, and how each is
 * ADDED (user 2026-08-28: "where are all the modules, I want to add them in").
 *
 * Mirror had no such list: the desk is hardcoded in `SymphonyMixer`'s track and
 * the catalogues live in three separate files. kol-monitor's ⌘K palette and its
 * E shelf are both thin views over ITS registry — so the registry is the piece
 * that has to exist first, and both views here read this one array.
 *
 * Every entry carries `add`, a verb the caller runs against the studio's state.
 * That is the whole contract: a view lists entries and calls `add`; it never
 * knows what kind of thing it is adding. Adding a hall variant, a generator, a
 * canvas FX and a whole channel are four different operations and none of them
 * belong in the palette.
 *
 * The lists are READ from the live definitions, so a variant or an FX unit
 * added to the instrument appears here without anyone remembering this file.
 */

export const KINDS = ['Channel', 'Source', 'FX', 'Desk', 'Patch']

const variant = (v, hall) => ({
  id: `variant:${v.id}`,
  name: v.title,
  kind: 'Source',
  group: hall,
  detail: hall,
  tags: v.tags || [],
  /* a variant loads into the FOCUSED channel — the desk's own LOAD tab does the
     same thing, this is the shortcut to it */
  add: (api) => api.loadVariant(v.id),
})

const generator = (g) => ({
  id: `gen:${g.id}`,
  name: g.title,
  kind: 'Source',
  group: 'Generators',
  detail: 'Generator',
  tags: g.tags || [],
  add: (api) => api.loadVariant(g.id),
})

const canvasFx = (f) => ({
  id: `fx:${f.id}`,
  name: f.label,
  kind: 'FX',
  group: 'Canvas FX',
  detail: 'Pixel processor',
  tags: ['fx', 'canvas'],
  add: (api) => api.addCanvasFx(f.id),
})

/* the desk's own units — the ones with a front panel. Only Channel can be
   ADDED; the rest are one-per-desk, so the palette shows them and says so. */
const desk = (m) => ({
  id: `module:${m.id}`,
  name: m.name,
  kind: m.id === 'channel' ? 'Channel' : 'Desk',
  group: m.kind,
  detail: m.id === 'channel' ? 'Adds a strip' : 'One per desk',
  tags: [m.kind.toLowerCase()],
  add: m.id === 'channel' ? (api) => api.addChannel() : null,
})

/* PATCHES — a source and the FX that finish it, added as ONE unit. Both halves
   are already in the registry; what the registry could not express is the
   PAIRING, because `add` ran a single verb. It runs an api, so a patch is just
   an entry whose `add` calls more than one — no new machinery, and the two
   land on the same strip because the api tracks the channel it is building. */
const PATCHES = [
  {
    id: 'patch:slitscan-camera',
    name: 'Slit-Scan Camera',
    kind: 'Patch',
    group: 'Patches',
    detail: 'Live Input → Slitscan',
    tags: ['patch', 'camera', 'webcam', 'phone', 'live', 'slitscan', 'time', 'smear'],
    add: (api) => {
      api.loadVariant('gen-live')
      api.addCanvasFx('slitscan')
      api.patchToMaster()
    },
  },
]

export const MODULE_REGISTRY = [
  ...PATCHES,
  ...MIXER_MODULES.map(desk),
  ...DISPLACEMENT_VARIANTS.map((v) => variant(v, 'Displacement')),
  ...MOVEMENT_VARIANTS.map((v) => variant(v, 'Movement')),
  ...COPIES_VARIANTS.map((v) => variant(v, 'Copies')),
  ...GENERATOR_VARIANTS.map(generator),
  ...CANVAS_FX_DEFS.map(canvasFx),
]

/* the search: name, group and tags, all case-folded. Nothing clever — a fuzzy
   matcher on 60 items is a library for a problem that does not exist. */
export const searchModules = (q) => {
  const s = q.trim().toLowerCase()
  if (!s) return MODULE_REGISTRY
  return MODULE_REGISTRY.filter((m) =>
    m.name.toLowerCase().includes(s)
    || m.group.toLowerCase().includes(s)
    || m.kind.toLowerCase().includes(s)
    || m.tags.some((t) => String(t).toLowerCase().includes(s))
  )
}
