# Video Synth Mixer

## Overview

The Video Synth Mixer turns a multi-channel compositing canvas into a modular visual synthesizer. Each channel is a processing node: load an image, a vector, or a procedural generator, then route its output through effects, into buses, across other channels, or back into itself as feedback. The result is a live, animatable signal flow where everything connects to everything.

The mixer borrows its vocabulary from audio synthesis. Channels have faders, sends, and returns. A routing matrix patches any output to any input. Modulators (LFOs, sequencers, envelopes) drive parameters through an expression engine. The goal is a tool for creating evolving visual textures in real time -- useful for live performance, generative art, and motion design.

Three channels feed into a master output. Six buses handle shared processing and cross-channel communication. A feedback system lets channels consume their own output with decay and freeze controls. Canvas-level and CSS-level effects stack independently. Every knob accepts mathematical expressions.

## Quick Start

1. Open the Symphony mixer. Channel 1 is enabled by default.
2. Click **Loaded [Random]** in the sidebar to load a random variant into Channel 1.
3. Switch to the **Output** tab. Raise the Ch 1 fader and the MST fader.
4. Press the **A** and **B** buttons on the Ch 1 strip to reveal all 6 knobs (INT, HUE, SAT, BRT, CTR, BLR). Turn them.
5. Click **Reloaded [Random]** to randomize all 3 channels with different variants, colors, and blend modes.
6. Open the **Routing Matrix** to patch channels into each other or enable feedback.

## Signal Flow

```
SOURCES (image / vector / generator)
  |
  v
CHANNELS 1-3 (variant effect + CSS FX + canvas FX)
  |         \
  |          +---> SEND BUSES (aux1, aux2, rtn1, rtn2, fx1, fx2)
  |                    |
  |                    v
  |               BUS COMPOSITE (weighted mix of channel frames)
  |                    |
  |                    v
  |               BUS FX + RETURN LEVEL
  |                    |
  +<--- feedback ------+--- return-to-channel (1-frame delay)
  |                    |
  v                    v
MASTER BUS (channels + returns, master FX chain)
  |
  v
OUTPUT (viewport / recording)
```

Each channel captures its rendered output into an OffscreenCanvas every frame. These frame buffers feed the bus compositor and the routing matrix. Circular dependencies (feedback loops) resolve by using the previous frame's buffer, introducing a single-frame delay.

## Channels

A channel is a processing slot. It takes a source, applies a variant effect, runs it through FX chains, and outputs to the master bus.

**Sources:** User-uploaded images, default SVGs, vector shapes (kol-vector library), or procedural generators. Set via the SRC shelf tab or by routing another channel's output.

**Variant effects:** Displacement (SVG filters), Movement (CSS transforms via GSAP), or Pixi (WebGL: Slices, Glitch, Morph, Radial, Kaleidoscope). Each variant has its own parameter set exposed in the PARAMS shelf.

**Per-channel controls:**

| Control | Range | Description |
|---------|-------|-------------|
| Intensity | 0-100 | Multiplier on variant-specific intensity keys |
| Opacity | 0-100% | Layer transparency |
| Speed | 0-200% | Animation time scale |
| Boost | on/off | 2x intensity multiplier |
| Blend Mode | 16 modes | CSS mix-blend-mode |
| FX chain | up to 8 | CSS filters (blur, brightness, contrast, saturate, hue-rotate, invert) |
| Canvas FX | up to 8 | Pixel-level processing (see Effects section) |
| Sends | 6 buses | Individual send levels to each bus |

## Generators

Procedural signal sources that replace image input. Load a generator as a channel source to create visuals from math.

| Generator | Output | Key Parameters |
|-----------|--------|----------------|
| **Noise** | Perlin/simplex noise field | scale, speed, octaves |
| **Gradient** | Linear, radial, or conic gradients | type, angle, speed |
| **Pattern** | Stripes, dots, checkerboard | pattern, spacing, angle, duty, speed |
| **Color Field** | Solid color fill | color (expression-driven) |

Generators render to canvas via requestAnimationFrame. They respond to the same channel controls as image sources (FX, blend, opacity). Noise fields make good displacement maps. Gradients driven by expressions create sweeping color washes. Patterns fed through feedback produce cellular automata-like textures.

## Modulators

Modulators generate time-varying signals that drive any knob through the expression engine. They live in the Generator tab and publish values to the signal bus.

| Module | Signal | Key Parameters |
|--------|--------|----------------|
| **LFO 1-2** | Continuous waveform | waveform (sine/saw/tri/pulse), rate, depth, offset |
| **Sequencer** | Stepped values | 8-step grid, rate, direction (forward/reverse/bounce) |
| **Logic Gate** | Binary on/off | type (AND/OR/XOR), thresholds, input sources |
| **Envelope** | ADSR curve | attack, decay, sustain, release |
| **Sample & Hold** | Random stepped | rate, min, max, smooth |
| **Multiples** | Split + transform | input source, 3 outputs with scale + offset |

**Connecting modulators to knobs:** Click a knob's value display to type an expression. Use signal names directly: `lfo1`, `lfo2`, `seq1`, `gate1`, `env1`, `sh1`, `mult1_a`, `mult1_b`, `mult1_c`. Example: `wave(t*2)*max` produces a sine wave that sweeps the knob's full range at 2 Hz.

**Expression helpers:** `wave(x)`, `saw(x)`, `tri(x)`, `pulse(x,w)`, `bell(x)`, `step(x,n)`, `ease(x,c)`, `exp(x)`, `log(x)`, `rand()`. Variables: `t` (seconds), `f` (frame count), `min`, `max`, `PI`, `PHI`.

## Routing Matrix

A 5x5 matrix (Ch 1-3 + RTN 1-2) for cross-channel patching.

**Source cycling:** Click a row label to cycle the channel's input source: Own image, Ch 1, Ch 2, Ch 3 (skipping self). When routed, the channel renders using another channel's frame buffer output instead of its own image.

**Send knobs:** Each cell controls how much of a source channel feeds into a destination. The diagonal represents self-feedback (FB column provides quick toggles that set the level to 50).

**Render order:** `resolveRenderOrder()` performs a topological sort on channel dependencies. Circular dependencies are allowed -- they use the previous frame's buffer, creating a one-frame delay that enables stable feedback loops.

## Buses & Returns

Six buses handle shared processing. Each bus composites contributing channel frames weighted by their send levels, applies its own FX chain, and returns to the master mix.

| Bus | Purpose | Typical Use |
|-----|---------|-------------|
| AUX 1-2 | Auxiliary sends | Shared reverb-like processing |
| RTN 1-2 | Return channels | Parallel FX chains |
| FX 1-2 | Effects sends | Dedicated effect processing |

Each bus has: `enabled`, `returnLevel` (0-100), `fx[]`, `blendMode`, `solo`.

Buses only allocate OffscreenCanvas buffers when enabled AND returnLevel > 0 AND at least one channel has a non-zero send. Empty buses consume no resources.

Returns feed into the master mix at their return level. They can also route back into channels via the routing matrix (RTN rows), creating insert-loop effects with a one-frame delay.

## Effects

### CSS FX

Applied as CSS filter strings. Fast, GPU-accelerated, limited to built-in filter functions.

| FX | Parameter | Range |
|----|-----------|-------|
| Blur | amount | 0-20 px |
| Brightness | amount | 0-3x |
| Contrast | amount | 0-3x |
| Saturate | amount | 0-3x |
| Hue Rotate | angle | 0-360 deg |
| Invert | amount | 0-1 |

Plus transform FX: Scale (x/y, 0.1-3x) and Rotate (0-360 deg). Up to 8 FX per chain on channels, buses, and master.

### Canvas FX

Pixel-level processing on OffscreenCanvas frame buffers. Run on CPU via ImageData manipulation.

| FX | What It Does | Key Parameters |
|----|-------------|----------------|
| RGB Split | Offsets R/G/B channels spatially | offsetX (0-50), offsetY (0-50) |
| Edge Detect | Sobel edge detection | threshold (0-100), invert (0/1) |
| Posterize | Reduces color levels | levels (2-32) |
| Pixel Sort | Sorts pixel rows/columns by brightness | threshold (0-100), direction (h/v) |
| Mirror | Reflects half the image | axis (horizontal/vertical) |
| Threshold | Binary black/white conversion | level (0-100) |

Canvas FX chain runs after frame capture, before bus compositing. Up to 8 per channel.

## Feedback

Each channel has a feedback system that accumulates its own output over time.

| Control | Range | Effect |
|---------|-------|--------|
| Decay | 0-100% | Previous frame persistence. 100% = infinite trails |
| Mix | 0-100% | Balance between fresh input and accumulated buffer |
| Freeze | on/off | Holds the buffer contents, stops updating |

**How it works:** Each frame, the feedback buffer draws the channel's current output at the decay alpha level, building up accumulated content. The mix control blends this buffer with the live signal.

**Tips:** Low decay (10-30%) with high mix creates motion trails. High decay (90%+) with RGB Split creates cascading color separation. Freeze the buffer, then change the source or FX for before/after layering. Feedback + routing from another channel creates cross-channel echo effects.

## Master Output

The master bus wraps all channel layers and bus returns into a single output.

- **Master fader** -- overall output opacity (default 80%)
- **Master FX chain** -- same CSS FX types as channels, applied to the combined output
- **Master blend mode** -- CSS mix-blend-mode on the combined output
- **Enable** -- master on/off

Channel strips in the Output tab control per-channel opacity and enable state from a mixing-console view. A/B knob banks provide quick access to 6 FX parameters per strip without opening the full FX editor.

## Keyboard & Mouse

| Action | Effect |
|--------|--------|
| Alt+click any knob | Reset to default value |
| Right-click a knob | Open modulation assignment |
| Click knob value display | Type a mathematical expression |
| Alt+click "Animate" | Restart all animations |
| Alt+click "Background" label | Toggle transparent/black background |

## Architecture

Key source files for developers:

| File | Purpose |
|------|---------|
| `src/hooks/useMirrorState.js` | All state: channels, master, buses, generators. EMPTY_CHANNEL defines channel defaults. |
| `src/hooks/useFrameBuffer.js` | OffscreenCanvas per channel. captureAll, compositeBuses, getBusFrame, applyFeedback, resolveRenderOrder. |
| `src/hooks/useCanvasFx.js` | Canvas FX definitions and pixel processors. CANVAS_FX_DEFS registry, applyCanvasFx pipeline. |
| `src/hooks/useSignalBus.js` | Shared ref for modulator values. Expressions read lfo1, seq1, gate1, etc. from busRef. |
| `src/hooks/useExpressionValue.js` | Compiles expression strings to functions. Runs per-frame via rAF. Exposes wave/saw/tri/step/bell helpers. |
| `src/components/hall-of-mirrors/generators/` | Visual generators (Noise, Gradient, Pattern, ColorField) and modulators (LFO, Sequencer, LogicGate, Envelope, RandomSH, Multiples). |
| `src/components/mirror/SymphonyViewport.jsx` | Main render loop. captureAll -> compositeBuses -> copy to BusLayer canvases. Single rAF, zero extra latency. |
| `src/components/mirror/ChannelLayer.jsx` | Per-channel rendering: variant selection, FX application, source resolution, frame buffer registration. |
| `src/components/hall-of-mirrors/SymphonyMixer.jsx` | Mixer UI: channel strips, shelf tabs (SRC/LOAD/REC/PARAMS), bottom tabs (COLOR/BLEND/FX). |
| `src/components/hall-of-mirrors/MasterModule.jsx` | Output tab: 6 fader strips, A/B knob banks, bottom send/return tabs, right shelf. readFx/writeFx/buildChannelKnobs helpers. |
| `src/components/hall-of-mirrors/RoutingMatrix.jsx` | 5x5 routing grid: source cycling, send knobs, FB toggles, channel output section. |

## Performance Notes

- **Frame buffers** are only allocated for channels with active routes or bus sends. Unused channels skip capture.
- **Bus compositing** skips empty buses (no sends or disabled). Buffers are deleted when a bus becomes inactive.
- **Render order** is computed once via topological sort when routing changes, then memoized.
- **Canvas FX** process ImageData on the main thread every frame. Keep chains short (1-3 FX) for smooth performance. Each FX iterates all pixels.
- **Generators** use rAF with direct pixel operations on OffscreenCanvas. They share the same capture pipeline as image-based channels.
- **Expressions** compile once to a Function object, then evaluate per-frame with minimal overhead. The signal bus is a plain object ref (no React re-renders).
