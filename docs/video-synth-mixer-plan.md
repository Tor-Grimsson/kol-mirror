# Video Synth Mixer — Architecture Plan

## Vision

Turn the Symphony mixer into a modular visual synthesizer. Channels become processing nodes. Any output routes to any input. Feedback loops create evolving textures. Generators create signals from nothing. The expression engine drives everything.

```
GENERATORS ──┐
              ├──→ CHANNELS (process) ──→ ROUTING MATRIX ──→ MASTER OUT
IMAGES ──────┘         ↑                        │
                       └────── feedback ─────────┘
```

---

## Roadmap

| # | Name | Depends on | Status |
|---|------|-----------|--------|
| 1 | Frame buffer + routing | — | **Done** |
| 2 | Output tab UI (strips, sends, shelf) | 1 | **Done** |
| 3 | Bus rendering pipeline | 1, 2 | **Next** |
| 4 | Unify sends + return-to-channel | 3 | Planned |
| 5 | Feedback loops (decay/mix/freeze) | 3 | Planned |
| 6 | Generators (noise, patterns, gradients) | 1 | Planned |
| 7 | Canvas FX modules (chromatic, edge, pixel sort) | 1 | Planned |
| 8 | Modulator UI (LFO, envelope, step seq) | — | Planned |
| 9 | Modular extensions (in/out jacks, multiples, logic) | 3-8 | Future |

---

## Signal Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                        SYMPHONY MIXER                             │
│                                                                   │
│  CHANNELS TAB                             OUTPUT TAB              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                       │
│  │  SOURCE   │  │  SOURCE   │  │  SOURCE   │  ← image / vector   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘    / generator        │
│       │              │              │                              │
│  ┌────▼─────┐  ┌────▼─────┐  ┌────▼─────┐                       │
│  │ CHANNEL 1│  │ CHANNEL 2│  │ CHANNEL 3│  ← variant + CSS FX   │
│  │ 6 knobs  │  │ 6 knobs  │  │ 6 knobs  │    (editable from     │
│  │ (A/B)    │  │ (A/B)    │  │ (A/B)    │     Channels OR        │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘     Output tab)       │
│       │              │              │                              │
│  ═════╪══════════════╪══════════════╪═══════════════════════════  │
│       │              │              │                              │
│       ├──────────────┼──────────────┤                             │
│       │      ROUTING MATRIX (NxN)   │                             │
│       │    ┌──┬──┬──┬────┬────┐     │                             │
│       │    │--│50│ 0│sndA│sndB│ Ch1 │  Ch→Ch: cross-channel      │
│       │    │ 0│--│80│sndA│sndB│ Ch2 │  Ch→RTN: bus sends         │
│       │    │30│ 0│--│sndA│sndB│ Ch3 │  RTN→Ch: return routing    │
│       │    └──┴──┴──┴────┴────┘     │  FB: self-feedback         │
│       │              │              │                             │
│       │         sendA│sendB         │                             │
│       │           ┌──▼──┐           │                             │
│       │           │ BUS │           │                             │
│       │           │ A+B │  ← composite channels at send levels   │
│       │           │ +FX │    + apply bus FX chain                 │
│       │           └──┬──┘    (NOT YET RENDERING)                 │
│       │              │                                            │
│       │         RTN 1│RTN 2                                      │
│       │              │                                            │
│  ┌────▼──────────────▼──────────────────┐                        │
│  │           MASTER MODULE               │                        │
│  │  ┌────┐┌────┐┌────┐ ┌─────┐┌─────┐  │                        │
│  │  │Ch 1││Ch 2││Ch 3│ │RTN 1││RTN 2│  │  ← faders + 6 knobs   │
│  │  │ A B ││ A B ││ A B │ │ A B  ││ A B  │  │    (A/B banks)      │
│  │  └──┬─┘└──┬─┘└──┬─┘ └──┬──┘└──┬──┘  │                        │
│  │     │     │     │      │      │     ┌────┐                    │
│  │     └─────┴─────┴──────┴──────┘     │MST │ ← master fader    │
│  │                                      │ A B│   + master FX     │
│  │  Bottom: AUX SND│FX SND│AUX RTN│FX RTN └──┬─┘                │
│  │  Shelf:  FILES │ FX │ COLOR │ MST │ AUX/FX │                  │
│  └─────────────────────────────────────────┬──┘                  │
│                                            │                      │
│                                      ┌─────▼─────┐               │
│                                      │  OUTPUT    │ → viewport   │
│                                      └───────────┘   / recording │
└──────────────────────────────────────────────────────────────────┘
```

### Two views, one truth

The routing matrix and master module bottom tabs show the same send data:
- **AUX SND tab** = channel `sendA` knobs aligned to master strips
- **RTN 1 column** in routing matrix = same `sendA` values in matrix view
- Currently these are separate state (`sendA` vs `routeSendLevels['rtn-1']`) — unification is chunk 4

### Return paths

1. **Into master mix** — RTN fader (returnLevel) controls how much return enters the final composite
2. **Into a channel** — via routing matrix RTN→Ch sends. Channel re-renders with bus frame as input (1-frame delay). Enables insert-loop effects.

---

## What's Built

### Frame Buffer + Routing (chunk 1)

- **useFrameBuffer** — OffscreenCanvas per channel, `registerCanvas`, `getChannelFrame`, `captureAll`, `resolveRenderOrder` (topological sort, circular deps use previous frame)
- **Channel state** — `routeFrom` (null = own image, index = other channel), `routeSendLevels` (keyed multi-source mixing), `sendA`/`sendB` (bus send levels)
- **Routing matrix UI** — flex columns via MatrixColumn, 5x5 (Ch 1-3 + RTN 1-2), click-to-cycle source, FB toggles, channel output knobs, right shelf with output detail

### Output Tab UI (chunk 2)

**Master Module — 6 channel strips:**
- Ch 1-3 wired to `channels[i]` (fader→opacity, enable→enabled, knobs→intensity+fx)
- RTN 1-2 wired to `busA`/`busB` (fader→returnLevel, enable→enabled, knobs→bus fx)
- MST wired to master (fader→opacity, enable→enabled, knobs→master fx)

**A/B knob banks (ChannelMaster component):**
- Accepts `knobsA`/`knobsB` props. A/B buttons toggle visibility.
- Neither = first 2 knobs. A = bank A (3). B = bank B (3). Both = all 6.
- Channel banks: A = INT, HUE, SAT. B = BRT, CTR, BLR.
- Bus/master banks: A = HUE, SAT, BRT. B = CTR, BLR, INV.

**Bottom tabs:**
- AUX SND — per-channel `sendA` knobs with active indicators
- FX SND — per-channel `sendB` knobs
- AUX RTN — busA controls (level, blend, solo, ON/OFF)
- FX RTN — busB controls

**Right shelf tabs:**
- FILES — `customImageName` per channel + `recSlots` clip counts
- FX — interactive per-channel FX lists + master FX (add/remove/toggle/slider)
- COLOR — per-channel vectorColor + backgroundColor (ColorPicker) + blendMode (Dropdown)
- MST — master opacity slider, blend mode, master FX chain
- AUX/FX — full RTN 1-2 controls (enable, return level, blend, solo, FX chain)

**Helpers** (in MasterModule.jsx):
```js
readFx(fxArr, fxId, paramKey)              // read param from FX array
writeFx(fxArr, fxId, paramKey, val)        // return new FX array with changed param
buildChannelKnobs(ch, i, onChannelUpdate)  // channel A/B banks
buildFxKnobs(fxArr, updateFx)              // bus/master A/B banks
```

### Sidebar

- **Loaded [Random]** — loads random variant into Ch 1 (`state.symphonyLoaded`)
- **Reloaded [Random]** — randomizes all 3 channels: variant + colors + blend + FX + vector (`state.symphonyReloaded`)

### Other

- **Background toggle** — alt+click "Background" label in channel COLOR section toggles transparent/black, label dims when transparent

---

## What's Next

### Chunk 3: Bus Rendering Pipeline

The controls are wired. Now make sends/returns actually produce video.

**Each frame:**
1. Channels render variants (SymphonyViewport — already working)
2. Frame buffer captures outputs (`captureAll` — already working)
3. **Bus compositing** (NEW):
   - For each bus, collect channel frames where send level > 0
   - Composite onto bus canvas (opacity = sendLevel/100)
   - Apply bus FX chain
   - Store as bus frame (RTN 1 / RTN 2)
4. Master mix composites channels @ fader + returns @ returnLevel + master FX

**State** — current is sufficient:
```js
// channel:  sendA: 0, sendB: 0
// master:   busA: { enabled, returnLevel, fx[], blendMode, solo }
//           busB: { ... }
```

**useFrameBuffer extension:**
- Bus buffer canvases (OffscreenCanvas for AUX and FX composites)
- `compositeBus(busId, channelFrames, sendLevels, blendMode)` — new method
- `getBusFrame('aux')` / `getBusFrame('fx')` — access bus results

**Files:** `useFrameBuffer.js`, `SymphonyViewport.jsx`, `ChannelLayer.jsx`

### Chunk 4: Unify Sends + Return-to-Channel

**Problem:** `sendA`/`sendB` on channels and `routeSendLevels['rtn-1']`/`['rtn-2']` on routing matrix are separate state. Master AUX SND tab and routing matrix RTN 1 column should show the same data.

**Recommendation:** use `routeSendLevels` as single source of truth for ALL sends. Remove `sendA`/`sendB`. Matrix RTN columns and master bottom tabs both read/write `routeSendLevels['rtn-1']`/`['rtn-2']`.

**Return-to-channel:** RTN rows in routing matrix send to channel destinations. Bus frames become routable sources via `routeFrom: 'rtn-1'`.

**Files:** `RoutingMatrix.jsx`, `MasterModule.jsx`, `useMirrorState.js`, `useFrameBuffer.js`

---

## Future Chunks

### Chunk 5: Feedback Loops

Routing already handles circular deps (1-frame delay). Controls add precision:

| Control | Range | What |
|---------|-------|------|
| Decay | 0-100% | Previous frame persistence. 100% = infinite |
| Mix | 0-100% | Dry/wet between fresh input and feedback |
| Freeze | on/off | Hold buffer, stop updating |

```js
bufferCtx.globalAlpha = decay / 100
bufferCtx.drawImage(newFrame, 0, 0)
```

Applications: video feedback fractals, motion trails, freeze + distort.

### Chunk 6: Generators

Channels with no input image — signal from math. Generator = channel variant rendering to canvas via rAF.

| Generator | Parameters |
|-----------|-----------|
| Noise (Perlin/simplex) | scale, speed, octaves, seed |
| Gradient (linear/radial/conic) | angle, colors, speed |
| Pattern (stripes/dots/checker) | spacing, angle, duty |
| Color Field | color (expression-driven) |
| Oscillator | wave type, rate, range |

Applications: noise as displacement map, gradient as LFO source, pattern + feedback = cellular automata.

### Chunk 7: Canvas FX Modules

Post-processing beyond CSS filters. Pixel-level manipulation via `canvasFx` array on OffscreenCanvas.

| FX | Key params |
|----|-----------|
| Chromatic Aberration | offsetX/Y per R/G/B |
| Edge Detect (Sobel) | threshold, invert |
| Posterize | levels (2-32) |
| Pixel Sort | direction, threshold, length |
| Feedback Blur | angle, amount |
| Datamosh | intensity, blockSize |

Applications: RGB split + displacement = analog video, edge detect + feedback = wireframe hallucinations.

### Chunk 8: Modulator UI

Visual UI on top of the expression engine (`useExpressionValue`):

| Module | Expression | UI |
|--------|-----------|-----|
| LFO | `wave(t*rate)*depth+offset` | wave shape + rate/depth/offset knobs |
| Envelope | ADSR curve | A/D/S/R sliders |
| Step Sequencer | stepped values | grid of value cells |
| Random S&H | `step(rand(), rate)` | rate + range knobs |

All generate expression strings. Oscilloscope previews them.

### Chunk 9: Modular Extensions

- **In/Out on everything** — every parameter gets input/output jacks
- **Signal multiples** — split one signal to many destinations
- **Logic gates** — AND/OR/XOR on binary (threshold-based) signals
- **Standalone generators** — signal sources independent of channels

---

## Technical Notes

### Canvas-to-Canvas Routing
- Pixi variants: `Texture.from(bufferCanvas)` + `texture.update()` each frame
- DOM variants: `ctx.drawImage(bufferCanvas, ...)` in capture loop
- Avoid `toDataURL()` — expensive, GC-heavy. Pass canvas elements directly.

### Performance
- Frame buffers only allocated for channels with active routes
- Bus layers only render when returnLevel > 0 AND sends > 0
- Render order computed once when routing changes (memoized topological sort)
- Canvas FX use Web Workers if available

### Backward Compatibility
- New fields default to null/0/{} — existing saved states work unchanged
- Routing disabled by default (routeFrom: null)
- No performance impact when routing unused

### Open Questions
1. **Pre vs post fader sends** — post-fader simpler, add toggle later
2. **Bus composite blend mode** — normal (layered) default, screen/additive optional
3. **sendA/sendB vs routeSendLevels** — recommend unifying in chunk 4

---

## Key Files

| File | What |
|------|------|
| `src/hooks/useFrameBuffer.js` | OffscreenCanvas per channel, captureAll, resolveRenderOrder |
| `src/hooks/useMirrorState.js` | EMPTY_CHANNEL (sendA, sendB, routeFrom, routeSendLevels), symphonyMaster |
| `src/components/hall-of-mirrors/MasterModule.jsx` | 6 strips, A/B banks, bottom tabs, shelf, readFx/writeFx helpers |
| `src/components/hall-of-mirrors/RoutingMatrix.jsx` | NxN matrix, source cycling, FB, output section |
| `src/components/mixer/ChannelMaster.jsx` | Strip: fader, knobsA/knobsB, A/B toggles, enable |
| `src/components/hall-of-mirrors/RotaryDial.jsx` | Dense variant for matrix/bottom knobs |
| `src/components/mirror/SymphonyViewport.jsx` | Frame loop, handleLoaded, handleReloaded |
| `src/components/hall-of-mirrors/SymphonyMixer.jsx` | Channel mixer, LOAD/REC/SRC/PARAMS shelves |
