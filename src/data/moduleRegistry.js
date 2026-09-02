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
 *
 * `front` — 2026-09-02. kol-monitor's registry entry is
 * `{ component, hp, u, category, label, controls }` and the component declares
 * its own `inputs` / `outputs` / `process`; that is what makes a module a
 * self-contained unit rather than a catalogue row (user: *"a module is self
 * contained unit i can load into the channel strip"*). Mirror's equivalent is
 * this field: `{ kind, id }`, resolved by `ModuleFront` to a real panel. An
 * entry WITHOUT `front` is listed and says so — it is a unit you can add but
 * cannot yet look at.
 */

/**
 * MODULE_HEIGHT — every module on the desk is THIS TALL. Not its content's
 * height, and not the row's tallest sibling.
 *
 * User, 2026-09-02: *"i have said about 500 times that modules should be fixed
 * height NOT RESPONSIVE HEIGHT"*. It is the eurorack contract and it is the
 * same one monitor's rack runs on — a row is a fixed `u` and a module fills it;
 * a module with less to say gets blank panel below its controls, exactly like
 * real hardware. A desk where a 152px FX unit stands beside a 490px channel
 * strip is not a desk.
 *
 * 490 is measured, not chosen: the channel strip's natural height at zoom 1,
 * which is the tallest front the instrument has. Nothing is clipped by it.
 */
export const MODULE_HEIGHT = 490

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
  /* a hall variant's panel IS a loaded channel strip: the variant's own
     controls render in the strip's PARAMS shelf */
  front: { kind: 'variant', id: v.id },
  /* THE PREVIEW THE REPO ALREADY HAS. `pnpm generate-previews` fills
     `/previews/variants/` (sources, generators included) and `/previews/fx/`;
     the cards were pointing at `/previews/modules/`, which no generator writes
     and which is empty — so every card drew the glyph (2026-09-02). */
  preview: `/previews/variants/${v.id}.png`,
})

const generator = (g) => ({
  id: `gen:${g.id}`,
  name: g.title,
  kind: 'Source',
  group: 'Generators',
  detail: 'Generator',
  tags: g.tags || [],
  add: (api) => api.loadVariant(g.id),
  /* the generator's own front — `GeneratorModule` drives one generator with
     its params, a quality knob and a live fps readout */
  front: { kind: 'generator', id: g.id },
  /* generators sit with the variants on purpose — the generator script's own
     docstring: "they ARE sources … no branch" */
  preview: `/previews/variants/${g.id}.png`,
})

const canvasFx = (f) => ({
  id: `fx:${f.id}`,
  name: f.label,
  kind: 'FX',
  group: 'Canvas FX',
  detail: 'Pixel processor',
  tags: ['fx', 'canvas'],
  /* PLACED AS ITS OWN PANEL, not appended to a channel's chain. User,
     2026-09-02: *"i also need a self contained fx module that I can load into
     for example the pixi effects and stuff like that"* — so an FX unit off the
     palette is a module on the desk with its own params and its own IN/OUT,
     the way a Eurorack effect is a module and not a checkbox on the mixer.
     `api.addCanvasFx` still exists and still appends to a chain; that is what
     a PATCH wants, because a patch is a finished strip. */
  add: (api) => api.placeUnit(`fx:${f.id}`),
  /* ONE unit, one panel — `FxModule`, built 2026-09-02. Not the channel's FX
     RACK, which is a tab strip over the whole chain. */
  front: { kind: 'fx', id: f.id },
  preview: `/previews/fx/${f.id}.png`,
})

/* THE DESK'S OWN MODULES — and only those. The user named them (2026-09-01):
   *"its 1 a channel module 2 a mixer module 3 matrix module 4 playback/clock
   5 generator"*. The generator is the seven `gen:` entries above; these are the
   other four, plus the patch bay.

   The catalogue's other nine entries are NOT modules and are not listed here.
   `canvas-fx`, `feedback` and `recorder` are TABS on a channel strip;
   `generators` and `field` are the strip's source shelf; `expressions` and
   `memory` are desk-wide surfaces. They stayed in `mixerModules.js` as written
   specs, which is what that file is — a catalogue of the desk's parts, not a
   registry of loadable units. Listing them as placeable is the category error
   the user caught: *"in modules you list effexts? why dont you not know what a
   module for the mixer is?"* */
const DESK_IDS = ['input', 'channel', 'master', 'routing', 'playback', 'patch']
const ONE_PER = new Set(['master', 'routing', 'playback', 'patch'])

const desk = (m) => ({
  id: `module:${m.id}`,
  name: m.name,
  kind: m.id === 'channel' ? 'Channel' : m.id === 'patch' ? 'Patch' : m.id === 'input' ? 'Source' : 'Desk',
  group: m.kind,
  detail: m.id === 'channel' ? 'Adds a strip' : m.id === 'input' ? 'Camera · image · video · SVG' : 'One per desk',
  tags: [m.kind.toLowerCase()],
  /* one-per-desk furniture is still ADDED — the desk starts empty and he has
     to be able to put a master on it. `placeDesk` is the api verb that both
     places it and refuses a second one. */
  add: m.id === 'channel' ? (api) => api.addChannel() : (api) => api.placeUnit(`module:${m.id}`),
  onePerDesk: ONE_PER.has(m.id),
  front: { kind: 'desk', id: m.id },
  /* a photograph of the module itself — `pnpm generate-previews` captures the
     front through `/dev/capture?module=<id>` */
  preview: `/previews/modules/${m.id}.png`,
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
  ...DESK_IDS.map((id) => MIXER_MODULES.find((m) => m.id === id)).filter(Boolean).map(desk),
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

/* THE URL FORM of an entry id. `variant:pixi-slices` → `variant-pixi-slices`,
   because a colon in a path segment is legal but reads as a scheme and gets
   escaped by half the things that touch a URL. One function so the link and
   the lookup can never drift (2026-09-02). */
export function slugFor(entry) {
  return entry.id.replace(/:/g, '-')
}
