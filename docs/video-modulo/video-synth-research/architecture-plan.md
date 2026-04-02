# Video Modulo — Architecture Plan

## What We Learned

The fundamental problem with our current system: **modules pass scalar values (one number per frame) on a signal bus, but video is spatial — it needs a value at every pixel position.**

A real video synth ramp generator doesn't output "50" — it outputs a value that varies continuously across the screen: 0 at the left edge, 100 at the right edge, and every value in between at every pixel. The monitor doesn't plot this as an oscilloscope trace — it renders each pixel at the brightness determined by the signal at that position.

### Two Signal Domains

| Domain | What travels | Bus type | Example |
|--------|-------------|----------|---------|
| **Control** | Scalar 0-100 per frame | Signal bus (current) | LFO, clock, envelope, S&H |
| **Video** | Canvas frame (pixels) per frame | Video bus (new) | Generator, dither, 3D geo, ramp |

Control signals modulate parameters. Video signals ARE the image.

### What Needs to Change

1. **Video bus** — a shared ref where modules register canvas elements by key. Generators publish their canvas. Processors read input canvas, process, publish output canvas. Monitor reads a canvas and displays it.

2. **Per-pixel evaluation** — the ramp generator should render to a canvas where each pixel's brightness = its horizontal or vertical position. Not output a single scalar.

3. **Monitor** — should display a canvas, not an oscilloscope trace. It should have an input jack that accepts a video bus key, reads the canvas, and renders it.

4. **Processing modules** — VCA, Key, Fader, RGB Split/Mix should operate on canvas frames pixel by pixel. Input canvas → process each pixel → output canvas.

## The Plan

### Phase 1: Video Bus

Create `useVideoBus` hook:
```js
const videoBus = useRef({}) // key → canvas element
// Modules call: videoBus.current['gen1'] = canvasRef.current
// Monitor reads: const srcCanvas = videoBus.current[inputKey]
```

Pass `videoBusRef` to all modules alongside `busRef`.

### Phase 2: Generator Output

GEN module already renders to a hidden canvas. Instead of sampling luma and publishing a scalar, publish the canvas ref to the video bus:
```js
videoBusRef.current[id] = canvasRef.current
```

Same for GEO (Three.js canvas), Dither, Noise, Pattern, etc.

### Phase 3: Monitor Input

Monitor module reads a canvas from the video bus and draws it to its display canvas every frame:
```js
const srcCanvas = videoBusRef.current[inputKey]
if (srcCanvas) {
  monitorCtx.drawImage(srcCanvas, 0, 0, monitorW, monitorH)
}
```

The jack connection sets `inputKey` to the generator's video bus key.

### Phase 4: Video Processors

Modules like VCA, Key, Fader, RGB Split operate on canvas frames:
```js
// Read input canvas
const src = videoBusRef.current[inputKey]
// Process pixels
const srcData = srcCtx.getImageData(...)
// ... pixel processing ...
// Write to output canvas
outCtx.putImageData(outData, ...)
// Publish output canvas
videoBusRef.current[id] = outCanvas
```

### Phase 5: Ramp Generator (Proper)

Instead of outputting a scalar, render a gradient to a canvas:
```js
// Horizontal ramp: pixel brightness = x position
for (let x = 0; x < w; x++) {
  const brightness = (x / w) * 255
  // draw column at this brightness
}
videoBusRef.current['ramp1'] = rampCanvas
```

Feed this ramp canvas into a comparator module → output is a hard-edged shape canvas.

### Phase 6: Compositing

The video mix console reads multiple input canvases, composites them with blend modes and opacity, outputs a final canvas to the monitor.

## Module Categories (Revised)

### Control Signal Modules (scalar bus)
- Clock, Gate, LFO, Envelope, S&H, Maths, Sequencer
- Logic, Comparator, Quantizer, Slew, S/O, Rectifier, Switch
- Multiples, Mixer (signal), Delay, Sample

### Video Signal Modules (video bus)
- **Generators**: GEN (noise/gradient/pattern/wave/color), GEO 3D, Ramp, Noise Source
- **Processors**: Dither, RGB Split, RGB Mix, VCA, Key, Fader, Luma Key, Waveshaper
- **Output**: Monitor, Console (video mixer)

### Hybrid Modules
- Modules that bridge both: e.g., an envelope follower that reads a video signal's brightness and outputs a control signal. Or a control signal that modulates a video processor's parameters.

## Implementation Order

1. `useVideoBus` hook + pass to all modules
2. GEN publishes canvas to video bus
3. Monitor reads canvas from video bus and displays it
4. GEO publishes Three.js canvas to video bus
5. Verify: GEN → Monitor shows stripes/noise on screen
6. Dither reads input canvas, processes, publishes output canvas
7. Ramp generator renders proper gradient canvas
8. VCA, Key, Fader operate on canvas frames
9. RGB Split/Mix operate per-pixel on canvas frames
10. Console composites multiple video inputs

## Sources

- [LZX Industries — Getting Started](https://lzxindustries.net/getting-started)
- [LZX Community — Using Audio Modules](https://community.lzxindustries.net/t/using-audio-modules-in-a-video-synth-system/65)
- [LZX Videomancer Modulation Guide](https://docs.lzxindustries.net/docs/instruments/videomancer/modulation-operators)
- [Knobulism — It's All Just Voltage](https://www.knobulism.com/2024/07/02/modular-synth-signal-flow-its-all-just-voltage-people/)
- [Midwest Modular — Rampes](https://midwestmodular.com/rampes-ramp-generator/)
- [Schneidersladen — Video Synthesis](https://schneidersladen.de/en/eurorack-modular-3u/video-synthesis)
- [JonDent — Hard Key Generator](https://djjondent.blogspot.com/2018/10/lzx-cadet-viii-video-synth-hard-key.html)
- [Gleix Video Modular](https://gleix.net/modular)
- [Syntonie CBV001 Workflows](https://www.perfectcircuit.com/signal/syntonie-cbv001-workflows)
