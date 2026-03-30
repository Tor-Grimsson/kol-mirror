# Symphony Mixer

Compositing canvas where multiple effect channels layer together with independent controls, FX chains, and a master bus.

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
    ├── Tab bar: [A Channels] / [B Output]
    ├── A Channels: horizontal strip per channel + [+] add
    └── B Output: 3-col grid (Master / Info / Export)
```

| Component | File |
|-----------|------|
| SymphonyViewport | `src/components/mirror/SymphonyViewport.jsx` |
| SymphonyMixer | `src/components/hall-of-mirrors/SymphonyMixer.jsx` |
| ChannelLayer | `src/components/mirror/ChannelLayer.jsx` |
| ChannelWireDiagram | `src/components/hall-of-mirrors/ChannelWireDiagram.jsx` |
| ChannelVideo | in `ChannelLayer.jsx` |
| RotaryDial | `src/components/hall-of-mirrors/RotaryDial.jsx` |
| useChannelRecorder | `src/hooks/useChannelRecorder.js` |

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
| `baseIntensity` | number | 100 | 1× reference |
| `boosted` | bool | false | 2× multiplier |
| `speed` | number | 100 | Animation speed % |
| `opacity` | number | 100 | Layer opacity % |
| `name` | string\|null | null | Display label |
| `fx` | array | [] | Post-FX chain |
| `blendMode` | string | `'normal'` | CSS mix-blend-mode |
| `vectorColor` | string | `'currentColor'` | Per-channel SVG color |
| `backgroundColor` | string | `'transparent'` | Per-channel bg |
| `rasterTheme` | string | `'dark'` | Raster fill context |
| `rasterTierOverride` | string\|null | null | Force `'mid'` or `'high'` |
| `customImageSrc` | string\|null | null | Per-channel image |
| `customRasterSrc` | string\|null | null | Per-channel raster |
| `loadMode` | string | `'effect'` | `'effect'` or `'source'` |
| `recSlots` | array | [null×4] | Recording slots (max 8) |
| `activeRecSlot` | number\|null | null | Active playback slot |
| `isArmedForRec` | bool | false | Recording standby |

---

## Channel Strip (320px width)

### Top row
- **Enable dot** — red when on, grey when off. Right-click → Remove Channel context menu.
- **[RST]** — reset channel (Alt+click: reset all channels)
- **[REC]** — opens shelf to REC tab
- **Load button** — archive slots + hall presets dropdown (portal to body to escape overflow)
- **Shelf toggle** — opens right shelf
- **FX toggle** — opens bottom shelf (Alt+click: toggle all channels)

### Center
- **Rotary dial** (120px) — intensity value

### Bottom
- **Boost** — [ON/OFF] toggle
- **Speed** — 0–200% slider
- **Opacity** — 0–100% slider

### Intensity math
See [signal-path.md](signal-path.md#intensity-scaling). The dial is a multiplier, not an absolute value. At `baseIntensity` the dial reads 1×. Above = overdrive. Boost doubles it. Applied only to `variant.intensityKeys`.

---

## Shelf — Right (280–840px, draggable)

Tabs: **PARAMS** | **SRC** | **REC**

### PARAMS
- Tab controls pinned at top (for kaleidoscope Comp A/B)
- Paginated: 7 rows per page
- Controls greyed out when frozen recording active (`disabledKeys` from `frozenParams`)
- Real-time param updates

### SRC
- 80px thumbnail (custom or global image)
- Source indicator: Custom / Global
- Mode: Effect Only / Effect + Source
- Upload / Clear per-channel image

### REC
See Recording section below.

---

## Shelf — Bottom (124px fixed)

Tabs: **FX** | **BLEND** | **COLOR** | **RES**

### FX
Post-FX chain (max 8). Each slot: enable dot, type dropdown, param sliders, × remove. `[+ ADD FX]`.

### BLEND
CSS `mix-blend-mode` dropdown (16 modes).

### COLOR
Vector + Background color pickers. Context Color (raster theme) dark/light selector.

### RES
Raster tier override (Auto / Mid 6× / High 12×). `[+ Recalculate]` button.

---

## Slot Systems

Two distinct slot types:

### Archive slots (9 total, global)
Save/load any variant + params + image. Shared across the app. Loading into a channel sets `channel.slotIndex` — params resolve live from `variantParams[variantId]`, so hall edits propagate.

### Rec slots (4–8 per channel)
Video recordings per channel. Stored as WebM blob URLs. Independent per channel — not shared.

When a channel has `slotIndex` set (archive reference):
- `resolvedChannel.params` = `state.getVariantParams(archiveSlots[slotIndex].variantId)`
- Param edits go to global `variantParams`, not the channel's local `params`

When a channel has no `slotIndex`:
- Uses `channel.params` directly (local copy)

---

## Master Bus

`symphonyMaster`: `{ fx: [], blendMode: 'normal', opacity: 100 }`

Wraps all channels in a single div. Same FX types as channels (max 8). Controls in B Output tab.

### B Output tab (3-column grid)

| Master Output | Project Info | Export |
|---------------|-------------|--------|
| Opacity slider | Channel count | (placeholder) |
| Blend mode dropdown | Active count | |
| [FX] → master FX rack | Master FX count | |

---

## Recording

Per-channel canvas capture to WebM video via `useChannelRecorder` hook.

### State machine
```
idle → armed → recording → done
       ↑                     │
       └── disarm/clear ←────┘
```

### Hook API (`useChannelRecorder`)

| Method | Description |
|--------|-------------|
| `arm(canvas, duration, params, fps)` | Set up stream + MediaRecorder. Snapshots `frozenParams`. |
| `start(duration?)` | Begin capture. 100ms timer. Auto-stop at duration. |
| `stop()` | Finalize early → `done`. |
| `disarm()` / `clear()` | Cancel, revoke blob → `idle`. |

Uses `captureStream(fps)` + `MediaRecorder`. Codec: VP9 → VP8 → WebM fallback. Data in 100ms chunks.

### Flow

1. Open REC tab → Duration (10/20/40/80/160s), Framerate (30/60fps)
2. Click record dot → **armed**
   - `isArmedForRec: true` → Pixi remounts with `preserveDrawingBuffer: true`
   - Canvas registered in `canvasRegistryRef` Map (polling: 120ms + 50ms retry)
3. `[Start]` → capture begins, progress bar + frame counter
4. Auto-stop at duration or `[Stop]`
5. Panel shows file size → `[Save]` or `[Discard]`
6. Save pushes to first empty `recSlots` entry

### Rec slot data

| Field | Description |
|-------|-------------|
| `blobUrl` | Object URL to WebM blob |
| `fileName` | `rec-01.webm` etc. |
| `size` | bytes |
| `codec` | `'webm'` |
| `fps` | 30 or 60 |
| `resolution` | e.g. `1920x1080` |
| `duration` | seconds |
| `mark1` / `mark2` | trim in/out |
| `frozenParams` | param snapshot |
| `source` | `'recorded'` or `'uploaded'` |

### Slot UI
- Slot list with `[Info]` toggle
- Dual-handle trim slider with playhead indicator
- Transport: Play (activate) / Pause / Stop (deactivate)
- `[Download]`, `×` remove, `[Upload]` on empty slots
- `[+ Add Slot]` up to 8

### Frozen playback
When `activeRecSlot` is set, `ChannelLayer` renders `ChannelVideo` (`<video>`) instead of live Pixi. Loops between trim points, supports seek, respects animation state and `recPaused`. PARAMS tab greys out `frozenParams` keys.

### preserveDrawingBuffer
Armed channels get key-based Pixi remount with `preserveDrawingBuffer: true` (required for `captureStream`). Key includes armed state to force WebGL context recreation.

---

## Known Issues

- **Save-to-slot timing**: Slot population can fail — closure/timing issue in save handler when `recSlots` array is modified asynchronously.
- **Canvas detection**: Polling (120ms + 50ms retry) works around usePixiApp's 100ms init delay. Fragile.
- **Legacy channels**: Pre-recSlots channels have `recSlots: undefined` — `|| []` fallback handles it but no empty slot placeholders.
