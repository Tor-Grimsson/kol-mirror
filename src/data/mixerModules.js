import { CANVAS_FX_DEFS } from '../hooks/useCanvasFx'
import { CHANNEL_FX_DEFS, GENERATOR_VARIANTS } from './mirrorVariants'

/**
 * MIXER_MODULES — the desk's units, written as specs (user 2026-08-28: a page
 * "where you can see every module and read its specs").
 *
 * A module here is a piece of the INSTRUMENT — a thing with a front panel,
 * inputs and outputs — not a React component and not a filter variant. The
 * variants and FX units are catalogued on `/library`’s CREATE view; this page is the rack.
 *
 * Counts that come from code are READ from it (`CANVAS_FX_DEFS`,
 * `CHANNEL_FX_DEFS`, `GENERATOR_VARIANTS`, `BUS_KEYS`) so a spec cannot drift
 * from the instrument by someone adding an FX unit and forgetting this file.
 * Everything else is prose about behaviour and has to be maintained by hand —
 * `docs/documentation/01-video-synth/overview.md` is the long form.
 */

export const BUS_KEYS = ['aux1', 'aux2', 'rtn1', 'rtn2', 'fx1', 'fx2']

const list = (xs) => xs.join(' · ')

export const MIXER_MODULES = [
  {
    id: 'channel',
    name: 'Channel Strip',
    kind: 'Channel',
    role: 'One video source and everything done to it before the desk sees it. Three strips by default; the desk is an endless loop, so they scroll in either direction.',
    io: {
      in: 'A source — a hall variant, a generator, an uploaded image or vector, or another channel via routeFrom',
      out: 'Channel OUT → the master inputs, the six buses, and any other channel’s source',
    },
    controls: [
      ['Knobs', 'INT · HUE · SAT · BRT · CTR · BLR, in a 2 × 3 grid; A/B paging swaps the bank'],
      ['Shelf tabs', 'SRC (what it holds) · RES (raster tier) · LOAD (source picker + randomisers) · PARAMS (the variant’s own controls) · REC (loop recording)'],
      ['FX rack', `COLOR · BLEND · FX · FB — ${CHANNEL_FX_DEFS.length} channel FX (${list(CHANNEL_FX_DEFS.slice(0, 4).map(d => d.label))} …)`],
      ['Per-channel', 'Vector colour · background colour · vector padding · animate (independent of the global transport)'],
      ['Flip', 'The card turns to its patch bay — jacks for IN, OUT, six sends and feedback'],
    ],
  },
  {
    id: 'input',
    name: 'Input',
    kind: 'Source',
    role: 'Where a picture enters the instrument — the camera, an image, a video or an SVG — and the strip it feeds. One module for the four ways in that used to be split across the strip’s SRC shelf, the Live Input generator and the Recorder.',
    io: {
      in: 'The camera (any device), an image or SVG file, a video file — by button or by dropping it on the panel',
      out: 'OUT → one channel strip, chosen on the panel; the strip sees exactly what its own SRC shelf would have loaded',
    },
    controls: [
      ['Camera', 'Points the strip at the live input — gen-live, source camera, mirrored'],
      ['Image · SVG', 'Rasterised through the same upload path as the shelf, capped at 2.1 MP'],
      ['Video', 'The live input pointed at a file — a frame stream, not a still'],
      ['Drop', 'The whole panel is a drop zone; image or video decided by type'],
      ['OUT', 'Which strip this feeds — defaults to the newest'],
    ],
  },
  {
    id: 'master',
    name: 'Master Module',
    kind: 'Output',
    role: 'Where the channels are summed and where the picture leaves the instrument. Six strips: Ch 1–3, RTN 1–2, MST.',
    io: {
      in: 'Channel OUTs patched to IN 1–3, plus MON for Screen 2',
      out: 'The composited frame — the viewport, and the recorder',
    },
    controls: [
      ['Strips', 'Six, each with fader and knobs; A/B knob paging'],
      ['Sends', `Six bus send tabs — ${list(BUS_KEYS.map(k => k.toUpperCase()))}`],
      ['Right shelf', 'Five buttons — FX list, canvas FX list, and the master’s own rack'],
      ['Patch back', 'Bus IN jacks and RTN OUT jacks; click a lit jack to clear every send into that bus'],
    ],
  },
  {
    id: 'routing',
    name: 'Routing Matrix',
    kind: 'Routing',
    role: 'The N×N grid: any source into any destination. Sources cycle through the channels and the buses, so a bus can feed a channel.',
    io: {
      in: 'Channels and buses as sources (routeFrom takes a bus key like a channel index)',
      out: 'Send levels into channels and returns; RTN→Ch and RTN→RTN cross-sends',
    },
    controls: [
      ['Cells', 'A send knob per crossing'],
      ['Source cycling', 'Click a source header to step it through channels and buses'],
      ['Known limit', '`master.inputs` holds channel indices only — a bus cannot feed a master strip, and buses cannot feed buses'],
    ],
  },
  {
    id: 'feedback',
    name: 'Feedback',
    kind: 'Channel',
    role: 'Per-channel frame feedback — last frame fed back into this one. The FeedbackLayer renders before its ChannelLayer, so the trail sits under the live image.',
    io: { in: 'The channel’s own previous frame', out: 'Composited under the channel' },
    controls: [
      ['Decay', 'How fast the trail dies'],
      ['Mix', 'How much of it returns'],
      ['Freeze', 'Hold the buffer — the trail stops updating and stays on screen'],
    ],
  },
  {
    id: 'canvas-fx',
    name: 'Canvas FX',
    kind: 'FX',
    role: `Pixel processors that run on the composited canvas rather than inside a channel’s renderer. ${CANVAS_FX_DEFS.length} units.`,
    io: { in: 'A channel or bus frame', out: 'The same frame, processed' },
    controls: [['Units', list(CANVAS_FX_DEFS.map(d => d.label))]],
  },
  {
    id: 'generators',
    name: 'Generators',
    kind: 'Source',
    role: `Procedural channel sources — no image required. ${GENERATOR_VARIANTS.length} units, selectable from the LOAD tab.`,
    io: { in: 'None — they synthesise', out: 'A channel source' },
    controls: [
      ['Units', list(GENERATOR_VARIANTS.map(g => g.title))],
      ['Motion', 'Each has its own toggle; pausing holds the exact current frame, and changing a parameter mid-play does not snap time back to zero'],
      ['Resolution', 'Internal canvas capped at 384px so cost stays bounded at high DPI'],
    ],
  },
  {
    id: 'field',
    name: 'Field',
    kind: 'Source',
    role: 'The generative-pattern generator. Six scalar fields sampled per pixel — clouds, sea, swirl, voronoi, noise, stripes — each colourable between two stops.',
    io: { in: 'None — it synthesises', out: 'A channel source' },
    controls: [
      ['Modes', 'Clouds (domain-warped fbm) · Sea (stacked swells + chop) · Swirl (polar rotation toward the centre) · Voronoi (F2−F1 cell walls) · Noise (fbm) · Stripes'],
      ['Scale · Detail', 'Field frequency, and fbm octaves'],
      ['Warp', 'How far the field distorts its own coordinates — the difference between grey static and clouds'],
      ['Contrast', 'The ramp’s steepness around the midpoint'],
      ['Colour', 'A two-stop ramp from Background to Color'],
      ['Motion', 'Off by default; time advances by delta, so pausing holds the exact frame'],
    ],
  },
  {
    id: 'generator-module',
    name: 'Generator Module',
    kind: 'Source',
    role: 'The generators as a front panel rather than a dropdown — live preview, the six sources as a button row, their scalars on knobs, and a quality control with the frame cost beside it. A bench: [Load] hands the built source to a channel, it never holds channel state itself.',
    io: { in: 'None — it synthesises', out: '[Load] → the first free channel' },
    controls: [
      ['Source', list(GENERATOR_VARIANTS.map(g => g.title))],
      ['Knobs', 'The selected source\u2019s first three scalars, at 40px'],
      ['Quality', 'Sweeps the internal buffer edge 128 \u2192 1024px, with buffer size, megapixels and live FPS read out next to it — the trade is visible while you make it'],
      ['Preview', 'Click to collapse to a sliver; the generator keeps running so its phase survives the toggle'],
    ],
  },
  {
    id: 'playback',
    name: 'Playback',
    kind: 'Transport',
    role: 'One clock for everything time-driven — expressions, the oscilloscope, every channel’s animate. Nothing autoplays; Space starts it.',
    io: { in: 'Space, and the module’s own transport', out: '`transport.now()` — the shaped time in seconds' },
    controls: [
      ['Transport', 'Play / pause / stop'],
      ['Direction', 'Forward · Reverse · Ping-pong'],
      ['Speed · Loop · Ease', 'Rate, the fold length in seconds, and ease-in-out on the ping-pong turnarounds'],
      ['Readout', 'MM:SS.mmm'],
    ],
  },
  {
    id: 'expressions',
    name: 'Expression Engine',
    kind: 'Modulation',
    role: 'Any knob can take a formula instead of a value. Click a knob’s number to type one; alt-click cancels.',
    io: { in: 't (seconds), f (frames), min, max, and the live bus values', out: 'The knob’s value, per frame' },
    controls: [
      ['Waves', 'wave · saw · tri · pulse (PWM) · rand · ease(curve) · bell · exp · log · step'],
      ['Math', 'sin · cos · abs · floor · ceil · round · sqrt · pow · PI · PHI'],
      ['Oscilloscope', 'Live preview with zoom X/Y/scale, min/max/sec/offset, grab-to-pan, and a 0–100 reference line'],
    ],
  },
  {
    id: 'recorder',
    name: 'Loop Recorder',
    kind: 'Capture',
    role: 'Records any of the variants to a loop. Pixi variants capture via `captureStream`; the DOM ones go through a hidden canvas.',
    io: { in: 'A channel’s render', out: 'A trimmed loop' },
    controls: [
      ['Flow', 'idle → armed → recording → done'],
      ['Rate', '30 or 60 fps'],
      ['Trim', 'Dual-thumb slider with a draggable playhead; i/o mark in and out, arrows step a frame, up/down jump to the marks'],
    ],
  },
  {
    id: 'memory',
    name: 'Memory',
    kind: 'Storage',
    role: 'Nine slots in this browser’s localStorage. No database, no accounts.',
    io: { in: 'Save to Slot, from the studio sidebar', out: 'Load from Home, Library, or the studio’s Memory list' },
    controls: [
      ['Slots', 'Nine — [M1] Hall: Variant [USR]'],
      ['Actions', 'LOAD · RELOAD · CLEAR'],
      ['Caveat', 'A custom-uploaded image is not persisted with a slot — reloading falls back to the default source'],
    ],
  },
  {
    id: 'patch',
    name: 'Patch',
    kind: 'Storage',
    role: 'The whole desk out and back. A patch is channels, master and the canvas settings together — `master.inputs` is half of every cable, so the three cannot be saved apart. Distinct from Memory, which stores ONE hall variant per slot.',
    io: {
      in: 'The live desk, on [Save]; a library entry on [Load]; a .json file on [Import]',
      out: 'A named entry in the library, listed on /library; a .json file on [Export]',
    },
    controls: [
      ['Preset tab', 'The library’s patches in a dropdown — Load · Clear · a name field and [Save]. A user save can be deleted; a shipped preset cannot'],
      ['File tab', 'Export writes the selected patch to .json; Import reads one onto the desk and keeps it in the library'],
      ['Clear', 'Pulls the master input cables and leaves the channels loaded — the patch, not the desk'],
      ['Readout', 'Inputs wired, and channels loaded out of channels present'],
      ['Not carried', 'Uploaded images (data URLs blow the localStorage quota) and recorded takes (session-scoped object URLs, dead links in any later session)'],
    ],
  },
]

/* The modules that exist ONCE on a desk. `ModulePalette` lists them and says
   so ("one per desk") rather than pretending they are addable twice. Data,
   not component code — beside the catalogue so react-refresh keeps
   `ModuleFront.jsx` a components-only file. */
export const ONE_PER_DESK = new Set(['master', 'routing', 'playback'])

/* The ids `ModuleFront` can draw. Anything else above is a catalogue entry
   with no standalone front yet. */
export const HAS_FRONT = new Set([
  'channel', 'master', 'routing', 'playback', 'generators', 'field', 'generator-module',
  /* wired 2026-09-02 — these three had real components all along (`PatchModule`,
     `RecorderUnit`, `FxUnit`) and were only missing from the id → component map */
  'patch', 'recorder', 'canvas-fx',
])
