# Symphony Mixer

Compositing canvas where multiple effect channels layer together with independent controls, FX chains, send/return buses, and a master output.

---

## Architecture

```
SymphonyViewport
├── Canvas container (ratio-constrained, ResizeObserver)
│   └── Master wrapper (master FX + opacity + blend)
│       ├── ChannelLayer[0] (bottom)
│       ├── ChannelLayer[1]
│       └── ChannelLayer[N] (top)
└── SymphonyMixer (below canvas)
    ├── ChannelWireDiagram (SVG signal flow)
    ├── Tab bar: [Channels] / [Output] / [Expressions]
    ├── Channels tab: horizontal strip per channel + [+] add
    ├── Output tab: MasterModule + RoutingMatrix (side by side)
    └── Expressions tab: ExpressionReference (5-column wave reference + oscilloscope)
```

| Component | File |
|-----------|------|
| SymphonyViewport | `src/components/mirror/SymphonyViewport.jsx` |
| SymphonyMixer | `src/components/hall-of-mirrors/SymphonyMixer.jsx` |
| ChannelLayer | `src/components/mirror/ChannelLayer.jsx` |
| MasterModule | `src/components/hall-of-mirrors/MasterModule.jsx` |
| RoutingMatrix | `src/components/hall-of-mirrors/RoutingMatrix.jsx` |
| ChannelMaster | `src/components/mixer/ChannelMaster.jsx` |
| ChannelWireDiagram | `src/components/hall-of-mirrors/ChannelWireDiagram.jsx` |
| ExpressionReference | `src/components/hall-of-mirrors/ExpressionReference.jsx` |
| RotaryDial | `src/components/hall-of-mirrors/RotaryDial.jsx` |
| useChannelRecorder | `src/hooks/useChannelRecorder.js` |
| useFrameBuffer | `src/hooks/useFrameBuffer.js` |
| useExpressionValue | `src/hooks/useExpressionValue.js` |

---

## Channel Data Model

`EMPTY_CHANNEL` in `src/hooks/useMirrorState.js`. Default: 3 channels (first enabled).

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `variantId` | string\|null | null | Effect variant |
| `params` | object\|null | {} | Local params (null = resolve from global `variantParams`) |
| `slotIndex` | number\|null | null | Archive slot reference |
| `enabled` | bool | false | Channel on/off |
| `intensity` | number | 30 | Dial value |
| `boosted` | bool | false | 2× multiplier |
| `speed` | number | 100 | Animation speed % |
| `opacity` | number | 100 | Layer opacity % |
| `name` | string\|null | null | Display label |
| `fx` | array | [] | Post-FX chain |
| `blendMode` | string | `'normal'` | CSS mix-blend-mode |
| `vectorColor` | string | `'currentColor'` | Per-channel SVG color |
| `backgroundColor` | string | `'transparent'` | Per-channel bg (alt+click label to toggle) |
| `rasterTheme` | string | `'dark'` | Raster fill context |
| `rasterTierOverride` | string\|null | null | Force `'mid'` or `'high'` |
| `customImageSrc` | string\|null | null | Per-channel image |
| `customRasterSrc` | string\|null | null | Per-channel raster |
| `customImageName` | string\|null | null | Filename for display |
| `loadMode` | string | `'effect'` | `'effect'` or `'source'` |
| `vectorPadding` | number | 0 | SVG padding (-100% to +100%) |
| `recSlots` | array | [null×4] | Recording slots (max 8) |
| `activeRecSlot` | number\|null | null | Active playback slot |
| `isArmedForRec` | bool | false | Recording standby |
| `sendA` | number | 0 | AUX bus send level (0-100) |
| `sendB` | number | 0 | FX bus send level (0-100) |
| `routeFrom` | null\|number | null | Cross-channel input source |
| `routeSendLevels` | object | {} | Multi-source send levels `{ [chIndex]: 0-100 }` |

---

## Channel Strip (Channels tab)

### Top row
- **Enable dot** — red when on, grey when off
- **[RST]** — reset channel (Alt+click: reset all channels)
- **[REC]** — opens shelf to REC tab
- **Load button** — archive slots + hall presets dropdown
- **Shelf toggle** — opens right shelf
- **FX toggle** — opens bottom shelf

### Center
- **Knob grid** — 2×3 CSS grid: INT, HUE, SAT, BRT, CTR, BLR
- Each knob reads/writes channel FX via getFxValue/setFxValue helpers

### Bottom
- **Boost** — [ON/OFF] toggle
- **Speed** — 0–200% slider
- **Opacity** — 0–100% slider

### Shelf — Right (280px)

Tabs: **SRC** | **RES** | **LOAD** | **PARAMS** | **REC**

| Tab | Content |
|-----|---------|
| SRC | Thumbnail, [Clear], [Load] default SVG, recolor/normal upload |
| RES | Raster tier override, raster theme, [RECALC] |
| LOAD | Loaded/Reloaded rows, variant dropdowns, color/blend/blur/brightness/vector/scale randomizers, shapes/forms/logos dropdowns |
| PARAMS | Variant controls (paginated 7/page), greyed out when frozen |
| REC | Duration, framerate, record/stop, slot list, trim slider, transport |

### Shelf — Bottom (124px)

Tabs: **COLOR** | **BLEND** | **FX**

| Tab | Content |
|-----|---------|
| COLOR | Vector + background color pickers, context color selector |
| BLEND | Blend mode dropdown (16 modes) |
| FX | Post-FX chain (max 8), add/remove/toggle/slider per FX |

---

## Output Tab

Two components rendered side by side with horizontal scroll.

### Master Module

6 channel strips: Ch 1-3, RTN 1-2, MST

**Channel strips (Ch 1-3):**
- Wired to actual `channels[i]` state (not master FX)
- Fader → `channels[i].opacity`
- Enable → `channels[i].enabled`
- Knobs → `channels[i].intensity` + `channels[i].fx` (via buildChannelKnobs)

**Return strips (RTN 1-2):**
- Fader → `busA.returnLevel` / `busB.returnLevel`
- Enable → `busA.enabled` / `busB.enabled`
- Knobs → bus FX (via buildFxKnobs)
- Blue accent (#3b82f6)

**Master strip (MST):**
- Fader → `master.opacity`
- Enable → `master.enabled`
- Knobs → master FX (via buildFxKnobs)
- Teal accent (#2dd4bf)

**A/B Knob Banks (ChannelMaster component):**

Each strip has A/B toggle buttons that control knob visibility:

| State | Knobs shown |
|-------|-------------|
| Neither | First 2 from bank A |
| A pressed | Bank A (3 knobs) |
| B pressed | Bank B (3 knobs) |
| Both | All 6 knobs |

Channel banks: A = INT, HUE, SAT. B = BRT, CTR, BLR.
Bus/master banks: A = HUE, SAT, BRT. B = CTR, BLR, INV.

**Bottom tabs:**

| Tab | Content |
|-----|---------|
| AUX SND | Per-channel `sendA` knobs aligned to strips |
| AUX RTN | busA controls: level slider, blend, solo, ON/OFF |
| FX SND | Per-channel `sendB` knobs aligned to strips |
| FX RTN | busB controls: level slider, blend, solo, ON/OFF |

**Right shelf (280px, 5 tabs):**

| Tab | Content |
|-----|---------|
| FILES | Per-channel loaded source (`customImageName`) + recording clip counts |
| FX | Interactive per-channel FX lists + master FX (add/remove/toggle/slider) |
| COLOR | Per-channel vectorColor, backgroundColor (ColorPicker), blendMode (Dropdown) |
| MST | Master opacity, blend mode, master FX chain |
| AUX/FX | RTN 1-2 full controls: enable, return level, blend, solo, FX chain |

### Routing Matrix

5×5 matrix (Ch 1-3 + RTN 1-2) as both sources and destinations.

- **Flex column layout** via MatrixColumn component
- **Row labels** — click-to-cycle source selectors (Own → Ch 1 → Ch 2 → ..., skipping self). Accent color when routed.
- **Send knobs** — RotaryDial dense variant per cell
- **FB column** — self-feedback toggles per channel (sets diagonal routeSendLevels to 50)
- **Vertical divider** between Ch and RTN column groups
- **Bottom section** — Channel Output: dense knobs for per-channel opacity (Ch 1-3) and return level (RTN 1-2)
- **Right shelf** — Output detail: level slider, blend dropdown, ON/OFF per channel

---

## Master State

`symphonyMaster` in `src/hooks/useMirrorState.js`:

```js
{
  enabled: true,
  opacity: 80,
  blendMode: 'normal',
  fx: [],
  busA: { enabled: true, returnLevel: 0, fx: [], blendMode: 'normal', solo: false },
  busB: { enabled: true, returnLevel: 0, fx: [], blendMode: 'normal', solo: false },
}
```

---

## Sidebar Controls (Symphony)

When `activeHall === 'symphony'`:

| Row | Action |
|-----|--------|
| Animate [ON/OFF] | Toggle global animation (syncs all channels) |
| Loaded [Random] | Load random variant into Ch 1 (`state.symphonyLoaded`) |
| Reloaded [Random] | Randomize all 3 channels: variant + colors + blend + FX + vector (`state.symphonyReloaded`) |
| Canvas Ratio | Dropdown: 16:9, 5:3, 4:3, 1:1, 3:4, 3:5, 9:16, custom |
| Image Fit | Dropdown: contain, fit-width, fit-height, manual |
| Mixer Layout | Dropdown: default, compact, expanded |
| Undo/Redo | 30-deep channel state history |

---

## Slot Systems

### Archive slots (9 total, global)
Save/load any variant + params + image. Loading into a channel sets `channel.slotIndex` — params resolve live from `variantParams`.

### Rec slots (4–8 per channel)
Video recordings per channel. Stored as WebM blob URLs. Independent per channel.

---

## Recording

Per-channel canvas capture to WebM video via `useChannelRecorder` hook.

### State machine
```
idle → armed → recording → done
       ↑                     │
       └── disarm/clear ←────┘
```

### Capture types
- **Pixi variants**: `captureStream(fps)` directly from WebGL canvas
- **DOM variants** (displacement/movement): `useDomCaptureCanvas` — hidden canvas captures DOM output

### Rec slot data

| Field | Description |
|-------|-------------|
| `blobUrl` | Object URL to WebM blob |
| `fps` | 30 or 60 |
| `duration` | seconds |
| `mark1` / `mark2` | trim in/out |
| `frozenParams` | param snapshot |

---

## Known Issues

- **RTN→Ch and RTN→RTN** knobs in routing matrix not wired (`onChange={() => {}}`)
- **Bus rendering** — sends/returns UI is wired, but actual video compositing not implemented
- **Send data split** — `sendA`/`sendB` vs `routeSendLevels['rtn-1']`/`['rtn-2']` are separate state, need unification
- **Tier recalc broken** — switching raster tier + RECALC doesn't change resolution on Pixi variants
- **Displacement capture scale** — DOM capture canvas output cropped vs live
