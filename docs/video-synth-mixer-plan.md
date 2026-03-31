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

| Chunk | Name | Depends on | What it unlocks |
|-------|------|-----------|-----------------|
| 1 | Frame Buffer + Routing | — | Cross-channel patching, serial chains |
| 2 | Feedback Loops | Chunk 1 | Video feedback art, accumulation, decay |
| 3 | Generators | Chunk 1 | Noise, patterns, gradients as signal sources |
| 4 | FX Modules | Chunk 1 | Chromatic aberration, edge detect, posterize, pixel sort |
| 5 | Modulator UI | — | LFO, envelope, step sequencer (UI on top of expression engine) |

---

## Chunk 1: Frame Buffer + Cross-Channel Routing

### Concept

Any channel's rendered output can be used as the input image for any other channel.

- **Serial chain**: A processes photo → B processes A's output → C processes B's output
- **Parallel**: A and B both process same source, C mixes them
- **Feedback**: A→B→A creates accumulating distortion (1-frame delay)

### How it works

```
Frame N:
  1. Capture all channel outputs from frame N-1 buffers
  2. For each channel, resolve input:
     - Static image (default, current behavior)
     - Another channel's buffered output (routed)
     - Mix of multiple channels at send levels
  3. Render each channel with resolved input
  4. Capture outputs to buffers for frame N+1
```

### New infrastructure

**useFrameBuffer hook** — OffscreenCanvas per channel, central capture loop
- `registerCanvas(index, canvasEl)` — called by ChannelLayer
- `getChannelFrame(index)` — returns buffer canvas for routing
- `captureAll()` — copies all registered canvases to buffers

**Render order** — topological sort based on routing dependencies. Circular deps (feedback) use previous frame's buffer.

**Routing matrix UI** — NxN grid in MasterModule shelf:
```
         → Ch1  → Ch2  → Ch3
Ch1 out:  [--]  [50%]  [  0]
Ch2 out:  [  0]  [--]  [80%]
Ch3 out:  [30%]  [  0]  [--]
```
Diagonal = self-feedback. Each cell = send level 0-100%.

### State

Channel additions:
```js
routeFrom: null,         // null = own image, number = channel index
routeSendLevels: {},      // { [channelIndex]: 0-100 } for multi-source mixing
```

### Files

| File | Change |
|------|--------|
| `src/hooks/useFrameBuffer.js` | NEW |
| `src/hooks/useMirrorState.js` | Add route fields to EMPTY_CHANNEL |
| `src/components/mirror/SymphonyViewport.jsx` | Integrate frame buffers |
| `src/components/mirror/ChannelLayer.jsx` | Resolve routed input |
| `src/components/hall-of-mirrors/MasterModule.jsx` | NxN routing matrix UI |

### Estimate: ~260 lines new code

---

## Chunk 2: Feedback Loops

With routing, feedback is automatic (circular routes use frame N-1). Controls add precision:

| Control | Range | What |
|---------|-------|------|
| Decay | 0-100% | How much previous frame persists. 100% = infinite |
| Mix | 0-100% | Dry/wet between fresh input and feedback |
| Freeze | on/off | Hold current buffer, stop updating |

Implementation: blend previous buffer with new frame in capture step.

```js
bufferCtx.globalAlpha = decay / 100
bufferCtx.drawImage(newFrame, 0, 0)
```

### Creative applications
- **Video feedback**: Route C→A with displacement, slight hue shift → evolving fractal textures
- **Echo/trail**: Low decay + movement variant → motion trails
- **Freeze + process**: Freeze a frame, apply increasing distortion over time

---

## Chunk 3: Generators

Channels with no input image — they create signal from math.

| Generator | Output | Parameters |
|-----------|--------|-----------|
| Noise | Perlin/simplex texture | scale, speed, octaves, seed |
| Gradient | Linear/radial/conic | angle, colors, speed |
| Pattern | Stripes/dots/checker | spacing, angle, speed, duty |
| Color Field | Solid/animated color | color (expression-driven) |
| Oscillator | Brightness/hue cycle | wave type, rate, range |

Architecture: Generator = channel variant. Renders to canvas via rAF. Parameters driven by expression engine. Output enters frame buffer like any variant.

```js
{ id: 'gen-noise', name: 'Noise', hall: 'generator', controls: [...] }
```

### Creative applications
- **Noise → displacement map**: Feed noise generator output to displacement variant input → organic distortion
- **Gradient → hue modulation**: Use gradient as LFO source mapped to another channel's hue
- **Pattern + feedback**: Checkerboard with feedback creates cellular automata-like patterns

---

## Chunk 4: FX Modules

Canvas-based post-processing (beyond CSS filters). Runs on frame buffer after variant renders.

| FX | What | Key params |
|----|------|-----------|
| Chromatic Aberration | RGB channel offset | offsetX, offsetY per R/G/B |
| Edge Detect | Sobel/Laplacian | threshold, invert |
| Posterize | Reduce color levels | levels (2-32) |
| Threshold | Binary B/W | level, smoothness |
| Pixel Sort | Glitch art sorting | direction, threshold, length |
| Feedback Blur | Motion blur from prev frame | angle, amount |
| Datamosh | Frame displacement | intensity, blockSize |

Architecture: `canvasFx` array alongside CSS `fx` array. Canvas FX process the OffscreenCanvas directly — pixel-level manipulation.

### Creative applications
- **Chromatic aberration + displacement**: RGB split creates analog video distortion
- **Edge detect → feedback**: Edges accumulate into wire-frame hallucinations
- **Pixel sort + slow movement**: Glitch art that flows

---

## Chunk 5: Modulator UI

The expression engine (`useExpressionValue`) already IS the modulator system. This chunk adds visual UI:

| Module | What it generates | UI |
|--------|------------------|-----|
| LFO | `wave(t*rate)*depth+offset` | Wave shape selector + rate/depth/offset knobs |
| Envelope | ADSR curve | Attack/Decay/Sustain/Release sliders |
| Step Sequencer | Stepped values at rate | Grid of value cells |
| Random S&H | `step(rand(), rate)` | Rate knob + range |

All generate expression strings under the hood. The oscilloscope previews them.

---

## Signal Flow (Complete Architecture)

```
┌─────────────────────────────────────────────────────────────┐
│                      SYMPHONY MIXER                          │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │ GEN/IMG  │  │ GEN/IMG  │  │ GEN/IMG  │  ← Sources       │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘                  │
│       │              │              │                         │
│  ┌────▼─────┐  ┌────▼─────┐  ┌────▼─────┐                  │
│  │ CHANNEL 1│  │ CHANNEL 2│  │ CHANNEL 3│  ← Processing    │
│  │ Variant  │  │ Variant  │  │ Variant  │                   │
│  │ CSS FX   │  │ CSS FX   │  │ CSS FX   │                   │
│  │ Canvas FX│  │ Canvas FX│  │ Canvas FX│                   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘                  │
│       │              │              │                         │
│       ├──────────────┼──────────────┤                        │
│       │     ROUTING MATRIX (NxN)    │  ← Patching           │
│       │   ┌──┬──┬──┐               │                        │
│       │   │--│50│ 0│ Ch1 sends     │                        │
│       │   │ 0│--│80│ Ch2 sends     │                        │
│       │   │30│ 0│--│ Ch3 sends     │                        │
│       │   └──┴──┴──┘               │                        │
│       │         │                   │                        │
│       │    ┌────▼────┐              │                        │
│       │    │ FEEDBACK │ ◄───────────┤  ← 1-frame delay      │
│       │    │ (decay)  │             │                        │
│       │    └────┬────┘              │                        │
│       │         │                   │                        │
│  ┌────▼─────────▼───────────▼──┐                            │
│  │        MASTER MODULE         │  ← Final processing       │
│  │  Knobs: HUE SAT BRT CTR BLR │                           │
│  │  Faders: MST  BUS-A  BUS-B  │                           │
│  │  Master FX chain             │                           │
│  └──────────────┬───────────────┘                           │
│                 │                                            │
│           ┌─────▼─────┐                                     │
│           │   OUTPUT   │  → Viewport / Recording            │
│           └───────────┘                                     │
└─────────────────────────────────────────────────────────────┘
```

---

## Expression Engine Integration

Every parameter in the system is expression-driven. The expression engine (`useExpressionValue`) provides:

**Waves**: `wave(t)` `saw(t)` `tri(t)` `pulse(t, width)` `rand()`
**Curves**: `ease(t, curve)` `bell(t)` `exp(t)` `log(t)` `step(t, n)`
**Math**: `sin` `cos` `abs` `floor` `ceil` `round` `sqrt` `pow` `PI` `PHI`
**Variables**: `t` (seconds) `f` (frame count) `min` `max`

Any knob value can be replaced with an expression. The oscilloscope in the Expressions tab previews waveforms.

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
- Canvas FX use Web Workers if available (pixel manipulation off main thread)

### Backward Compatibility
- New fields default to null/0/{} — existing saved states work unchanged
- Routing disabled by default (routeFrom: null)
- No performance impact when routing unused
