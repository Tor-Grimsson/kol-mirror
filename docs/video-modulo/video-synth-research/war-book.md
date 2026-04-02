# Video Synthesis — War Book

A comprehensive reference for building a software modular video synthesizer. Based on research into LZX Industries Gen3, Syntonie, Gleix, and the broader video synthesis community.

## Table of Contents

- [Part 1: The Foundation — It's All Just Voltage](#part-1-the-foundation--its-all-just-voltage)
  - [The One Rule](#the-one-rule)
  - [Voltage Standards (LZX Gen3)](#voltage-standards-lzx-gen3)
  - [Our Digital Equivalent](#our-digital-equivalent)
- [Part 2: The Three Frequency Domains](#part-2-the-three-frequency-domains)
- [Part 3: Signal Flow — Generation → Processing → Encoding → Display](#part-3-signal-flow--generation--processing--encoding--display)
  - [The Complete Path](#the-complete-path)
  - [What Each Stage Does](#what-each-stage-does)
- [Part 4: How Ramps Become Shapes](#part-4-how-ramps-become-shapes)
  - [Step 1: The Ramp](#step-1-the-ramp)
  - [Step 2: The Comparator](#step-2-the-comparator)
  - [Step 3: Two Comparators = Stripe](#step-3-two-comparators--stripe)
  - [Step 4: Mirrored Ramp = Centered Shape](#step-4-mirrored-ramp--centered-shape)
  - [Step 5: Oscillator = Repeating Pattern](#step-5-oscillator--repeating-pattern)
  - [Step 6: Color from Shapes](#step-6-color-from-shapes)
  - [In Our System](#in-our-system)
- [Part 5: The DSG3 — A Deep Dive into Shape Generation](#part-5-the-dsg3--a-deep-dive-into-shape-generation)
  - [What This Means for Our System](#what-this-means-for-our-system)
- [Part 6: The LZX Videomancer — 39 Modulation Operators](#part-6-the-lzx-videomancer--39-modulation-operators)
  - [Category 1: Oscillators (5 types)](#category-1-oscillators-5-types)
  - [Category 2: External Input (3 types)](#category-2-external-input-3-types)
  - [Category 3: Envelopes & Followers (7 types)](#category-3-envelopes--followers-7-types)
  - [Category 4: Random & Chaos (6 types)](#category-4-random--chaos-6-types)
  - [Category 5: Sequencing & Rhythm (4 types)](#category-5-sequencing--rhythm-4-types)
  - [Category 6: Spatial (2 types)](#category-6-spatial-2-types)
  - [Category 7: Physics (2 types)](#category-7-physics-2-types)
  - [Linear vs Boolean](#linear-vs-boolean)
  - [Per-Line Rendering](#per-line-rendering)
- [Part 7: The SMX3 Summing Matrix — How Color Works](#part-7-the-smx3-summing-matrix--how-color-works)
  - [Architecture](#architecture)
  - [How it creates color](#how-it-creates-color)
  - [Key specs](#key-specs)
  - [What this means for our system](#what-this-means-for-our-system-1)
- [Part 8: Power Architecture & System Design](#part-8-power-architecture--system-design)
  - [LZX Gen3 Power Standard](#lzx-gen3-power-standard)
  - [Sync Distribution](#sync-distribution)
- [Part 9: What Our System Gets Right](#part-9-what-our-system-gets-right)
- [Part 10: What Our System Gets Wrong](#part-10-what-our-system-gets-wrong)
  - [The Big Problem: Scalar vs Spatial](#the-big-problem-scalar-vs-spatial)
  - [The Fix](#the-fix)
  - [The Monitor Problem](#the-monitor-problem)
  - [The Color Problem](#the-color-problem)
  - [The Processing Chain Problem](#the-processing-chain-problem)
- [Part 11: The Architecture Plan](#part-11-the-architecture-plan)
  - [Phase 1: Video Bus](#phase-1-video-bus)
  - [Phase 2: Video Monitor](#phase-2-video-monitor)
  - [Phase 3: Per-Pixel Ramp](#phase-3-per-pixel-ramp)
  - [Phase 4: Video Processors](#phase-4-video-processors)
  - [Phase 5: Color Matrix](#phase-5-color-matrix)
  - [Phase 6: Feedback](#phase-6-feedback)
- [Part 12: Sources](#part-12-sources)
  - [Primary Sources](#primary-sources)
  - [Module References](#module-references)
  - [Community & DIY](#community--diy)
  - [Video Signal Standards](#video-signal-standards)

---

## Part 1: The Foundation — It's All Just Voltage

### The One Rule

In modular video synthesis, there is ONE type of signal: **voltage**. A voltage between 0V and 1V. Whether that voltage represents brightness, color intensity, position, timing, or shape — it's the same electrical signal on the same cable through the same jack.

This means:
- A ramp generator's output IS the video when you display it
- The SAME output IS a control voltage when you feed it to a filter's cutoff
- An LFO can be a video signal (slow-moving brightness)
- A video signal can be a modulation source (image brightness controlling a parameter)

In our digital system: **0 = black = minimum = off. 100 = white = maximum = on.** Every signal is this range.

Sources: [LZX Getting Started](https://lzxindustries.net/getting-started), [Knobulism — It's All Just Voltage](https://www.knobulism.com/2024/07/02/modular-synth-signal-flow-its-all-just-voltage-people/)

### Voltage Standards (LZX Gen3)

| Range | Name | Use |
|-------|------|-----|
| 0V to +1V | Unipolar | Video levels. 0V = black (0 IRE), 1V = white (100 IRE) |
| -1V to +1V | Bipolar | Modulation, offsets, AC-coupled signals |

Connector: 3.5mm mono jacks (same as audio eurorack).
Input impedance: 100K ohms (high impedance, many outputs can fan out to many inputs).
Minimum bandwidth: 5 MHz (much faster than audio's ~20kHz).

Source: [LZX Gen3 Primer](https://community.lzxindustries.net/t/lzx-gen3-primer-faq-the-future-with-chromagnon-lzx-modular/3688)

### Our Digital Equivalent

| Analog | Digital (our system) |
|--------|---------------------|
| 0V | 0 |
| 0.5V | 50 |
| 1V | 100 |
| 3.5mm jack | Bus key (string ID on shared ref) |
| Patch cable | Expression reference or JackSocket connection |
| Voltage on wire | Number in busRef.current[key] |

---

## Part 2: The Three Frequency Domains

Video synthesis operates across THREE speed domains. Audio only has two. This is the key difference.

| Domain | Frequency | What it creates | Audio equivalent |
|--------|-----------|----------------|-----------------|
| **Animation** | ~0-30 Hz | Motion, pulsing, fading | LFOs, envelopes |
| **Vertical** | ~30 Hz-15 kHz | Vertical stripes, bars | Audio oscillators |
| **Horizontal** | ~15 kHz-6 MHz | Horizontal stripes, bars | **NOTHING** — audio can't go this fast |

This means:
- Audio LFOs work for ANIMATION (motion)
- Audio oscillators work for VERTICAL patterns
- Only VIDEO-RATE oscillators create HORIZONTAL patterns

In our digital system, we don't have this limitation because we render per-pixel, not per-scanline. But the conceptual framework matters: some signals change once per frame (animation rate), some change per row (vertical rate), and some change per pixel (horizontal rate).

Source: [LZX Community — Using Audio Modules](https://community.lzxindustries.net/t/using-audio-modules-in-a-video-synth-system/65)

The community describes it as: **"Audio is 2D, video is 3D."** Audio has time × amplitude. Video has time × horizontal position × vertical position.

---

## Part 3: Signal Flow — Generation → Processing → Encoding → Display

### The Complete Path

```
SYNC GENERATOR (ESG3)
    │
    │ ── timing reference (RCA) ──→ all other modules
    │
RAMP/SHAPE GENERATORS (DSG3, DWO3, Scrolls, Rampes)
    │
    │ ── raw waveforms (3.5mm) ──→
    │
PROCESSORS (comparators, VCAs, waveshapers, mixers)
    │
    │ ── processed signals (3.5mm) ──→
    │
SUMMING MIXER (SMX3)
    │
    │ ── 3 signals: Red, Green, Blue ──→
    │
RGB ENCODER (ESG3)
    │
    │ ── composite/component video (RCA/BNC) ──→
    │
MONITOR / DISPLAY
```

### What Each Stage Does

**1. Sync Generator (ESG3)**
Produces the timing reference that all modules lock to. Without sync, nothing is stable — patterns drift and tear. The sync signal defines where the screen starts (top-left), how fast scan lines sweep, and when each frame begins.

In our digital system: `requestAnimationFrame` is our sync. All modules tick at the same rate.

**2. Ramp/Shape Generators**
Produce the raw building blocks:
- **Horizontal ramp**: voltage sweeps 0→1V left to right across each scan line
- **Vertical ramp**: voltage sweeps 0→1V top to bottom across each frame
- **Oscillators**: repeating patterns at set frequencies
- **Shape generators**: combine ramps with logic to create 2D shapes (rectangles, circles, diamonds)

In our system: generators should output per-pixel canvases where each pixel's brightness represents the voltage at that position.

**3. Processors**
Transform and combine signals:
- **Comparator**: input > threshold → white, else → black. Creates HARD EDGES.
- **VCA**: signal × control voltage. One signal controls another's amplitude.
- **Waveshaper**: non-linear transform (fold, clip, wrap). Turns simple ramps into complex patterns.
- **Inverter**: 1V - input. Flips brightness.
- **Mixer/Adder**: sum multiple signals. Brighten, combine patterns.

**4. Summing Matrix Mixer (SMX3)**
The SMX3 is critical — it's a 3×3 matrix where you route any signal to any RGB channel with gain control (-2x to +2x per crosspoint). This is where color happens. You don't pick a color from a palette — you PATCH different signals to R, G, B and the color emerges from the relationships.

Key specs from the SMX3:
- 9 inputs in a 3×3 grid (3 rows × 3 columns)
- 3 outputs (one per row = one per color channel)
- Each crosspoint has a polarizer knob: center=0, CW=+2x, CCW=-2x
- Internal normalling: row 1 cascades to row 2 cascades to row 3
- No voltage generation — pure mixing/routing

Source: [LZX SMX3 Technical Manual](https://docs.lzxindustries.net/docs/modules/smx3)

**5. RGB Encoder**
Takes 3 input voltages (R, G, B) and combines them into a video signal the monitor can display. Each input: 0V = no color, 1V = full color.

In our system: the monitor module should accept 3 inputs (or 1 for grayscale) and render them as pixel colors.

**6. Monitor**
Displays the result. In eurorack: small composite monitor or HDMI output. In our system: a canvas element displaying the composited video signal.

Sources: [LZX Getting Started](https://lzxindustries.net/getting-started), [LZX ESG3](https://lzxindustries.net/products/esg3)

---

## Part 4: How Ramps Become Shapes

This is the most important technique in video synthesis. Understanding this unlocks everything.

### Step 1: The Ramp

A horizontal ramp is a voltage that equals the horizontal position on screen:
```
pixel x=0     → voltage 0V   (black)
pixel x=W/2   → voltage 0.5V (gray)
pixel x=W     → voltage 1V   (white)
```
Displayed directly, it's a smooth gradient from black to white, left to right.

### Step 2: The Comparator

Feed the ramp into a comparator with threshold at 0.5V:
```
where ramp > 0.5 → output 1V (white)
where ramp < 0.5 → output 0V (black)
```
Result: the LEFT HALF of the screen is black, the RIGHT HALF is white. A hard vertical edge at the center.

Move the threshold → move the edge.

### Step 3: Two Comparators = Stripe

Feed the same ramp into TWO comparators:
- Comparator A: threshold 0.3
- Comparator B: threshold 0.7
- Output = A AND (NOT B)

Result: a vertical stripe between 30% and 70% of screen width.

### Step 4: Mirrored Ramp = Centered Shape

Mirror the horizontal ramp (fold at center):
```
pixel x=0     → voltage 1V
pixel x=W/2   → voltage 0V
pixel x=W     → voltage 1V
```
Now it's a V-shape. Through a comparator → a centered vertical bar.

Do the same vertically. Add both → distance from center. Through comparator → circle/diamond.

### Step 5: Oscillator = Repeating Pattern

Feed the ramp into a waveshaper that repeats:
```
ramp through sine function → repeating sine wave across screen
ramp through sawtooth → repeating sawtooth = stripes
```
Frequency controls how many repetitions fit on screen.

### Step 6: Color from Shapes

Patch DIFFERENT shapes to R, G, B:
- Horizontal stripes to R
- Vertical stripes to G  
- Diagonal stripes to B

Result: a plaid pattern where overlapping stripes create secondary colors.

### In Our System

Our GEN module renders pixel patterns (noise, stripes, gradients). These ARE the ramp/oscillator equivalent. But they output to a hidden canvas and publish only a scalar (average brightness). They need to publish the canvas itself — the per-pixel data IS the video signal.

---

## Part 5: The DSG3 — A Deep Dive into Shape Generation

The DSG3 (Dual Shape Generator) is LZX's core pattern module. Understanding it reveals the architecture we should emulate.

**Architecture**: Two identical shape generators, each with:
- H input (horizontal ramp)
- V input (vertical ramp)
- 4 outputs per generator (8 total)
- Controls for position, size, shape type
- The outputs of generator 1 can feed the inputs of generator 2 for cascading/recursive shapes

**How it creates shapes**: 
The DSG3 uses analog logic on the H and V ramps to create 2D patterns. By comparing, inverting, and combining the horizontal and vertical position signals, it generates rectangles, triangles, circles, and complex geometric patterns.

**Key insight**: The DSG3 doesn't "draw" shapes in the sense of computer graphics. It EVALUATES a mathematical relationship between the screen coordinates (H ramp, V ramp) and outputs the result. Every pixel's brightness is computed independently based on its position. This is fundamentally different from canvas 2D drawing (fillRect, arc, etc.) — it's more like a fragment shader.

Source: [LZX DSG3](https://lzxindustries.net/products/dsg3), [LZX Getting Started](https://lzxindustries.net/getting-started)

### What This Means for Our System

Our generators should work like fragment shaders:
```javascript
// For each pixel at position (x, y):
function pixelValue(x, y, t, params) {
  const h = x / width    // horizontal ramp (0-1)
  const v = y / height   // vertical ramp (0-1)
  
  // Shape: circle
  const dist = Math.sqrt((h - 0.5) ** 2 + (v - 0.5) ** 2)
  return dist < params.radius ? 1.0 : 0.0
  
  // Shape: horizontal stripes
  return Math.sin(v * params.frequency * Math.PI * 2) * 0.5 + 0.5
  
  // Shape: checkerboard
  return (Math.floor(h * params.cols) + Math.floor(v * params.rows)) % 2
}
```

This per-pixel evaluation approach is exactly what our existing generators do (NoiseGenerator iterates every pixel with fbm, PatternGenerator draws per-pixel). The architecture is correct — the missing piece is just outputting the canvas, not a scalar.

---

## Part 6: The LZX Videomancer — 39 Modulation Operators

The Videomancer is LZX's digital video synthesizer. Its modulation system has 39 operator types across 7 categories. This is the most comprehensive reference for what modulation types a video synth needs.

### Category 1: Oscillators (5 types)

| Operator | Waveforms | Key feature |
|----------|-----------|-------------|
| Free LFO | ramp, saw, tri, square, sine, log, exp, parabola | Controllable rate, free-running |
| Sync LFO | Same waveforms | Locked to tempo (32/1 through 1/16 notes) |
| Motion LFO | Same waveforms | Phase-locked to transport position |
| Pulse Width | Variable duty cycle | Rhythmic gating |
| Wavefolder | Sine with fold | 0-8 fold count, creates harmonics |

### Category 2: External Input (3 types)

| Operator | Function |
|----------|----------|
| CV Input | Read control voltage with smoothing |
| Audio Input | Raw audio, supports per-scanline rendering |
| Ring Mod | Multiply two inputs (A × B) — creates sum/difference frequencies |

### Category 3: Envelopes & Followers (7 types)

| Operator | Function |
|----------|----------|
| Envelope | Peak detector with attack/release |
| Sample & Hold | Capture at clock intervals → staircase |
| Trigger Envelope | MIDI-triggered A/R with 3 curve shapes |
| FFT Band | Frequency analysis into 8 octave bands |
| Comparator | Binary threshold with per-scanline support |
| Slew Limiter | Rate-limited follower, asymmetric rise/fall |
| Peak Hold | Capture peaks with decay |

### Category 4: Random & Chaos (6 types)

| Operator | Function |
|----------|----------|
| Random | Slewed random jumps |
| Drift | Brownian walk with centering |
| Perlin Noise | Smooth coherent noise, multi-octave |
| Turing Machine | 8-bit shift register with mutation probability |
| Logistic Map | Mathematical chaos (order → chaos spectrum) |
| Cellular Automaton | Elementary rules (30, 90, 110, 150) |

### Category 5: Sequencing & Rhythm (4 types)

| Operator | Function |
|----------|----------|
| Step Sequencer | 8 steps with preset patterns |
| Euclidean Rhythm | N pulses across 16 steps (Björklund algorithm) |
| Clock Divider | ÷1 to ÷16 with duty cycle |
| Probabilistic Gate | Random gating with density/length control |

### Category 6: Spatial (2 types)

| Operator | Function |
|----------|----------|
| H Displacement | Waveform varying across frame height, with phase drift |
| V Gradient | Static spatial pattern across frame |

**This is unique to video synthesis.** These operators don't vary over TIME — they vary across SPACE (screen position). A spatial modulator changes its value per scan line, creating vertical gradients or per-line displacement. This is how you get spatial effects that audio modulators can't produce.

### Category 7: Physics (2 types)

| Operator | Function |
|----------|----------|
| Bouncing Ball | Gravity simulation with elasticity |
| Pendulum | Damped harmonic oscillation |

### Linear vs Boolean

Every modulator operates in one of two modes:
- **Linear**: continuous 0-100 (for knobs, faders, continuous parameters)
- **Boolean**: binary 0 or 100, threshold at midpoint (for switches, gates)

### Per-Line Rendering

8 of the 39 operators support **per-scanline** variation. This means the modulation value changes for each horizontal line of the image, creating spatial effects. A per-line LFO creates vertical stripes. A per-line noise creates horizontal static.

In our system, this maps to per-pixel evaluation in the canvas render loop.

Source: [LZX Videomancer Modulation Guide](https://docs.lzxindustries.net/docs/instruments/videomancer/modulation-operators)

---

## Part 7: The SMX3 Summing Matrix — How Color Works

The SMX3 is the module that turned theoretical understanding into practical insight for our system. It's not just a mixer — it's the COLOR ENGINE.

### Architecture

```
        Column A    Column B    Column C
       ┌─────────┬─────────┬─────────┐
Row 1  │  P1 ●── │  P2 ●── │  P3 ●── │──→ Output 1 (Red)
       │ -2x..+2x│ -2x..+2x│ -2x..+2x│
       ├─────────┼─────────┼─────────┤
Row 2  │  P4 ●── │  P5 ●── │  P6 ●── │──→ Output 2 (Green)
       │ -2x..+2x│ -2x..+2x│ -2x..+2x│
       ├─────────┼─────────┼─────────┤
Row 3  │  P7 ●── │  P8 ●── │  P9 ●── │──→ Output 3 (Blue)
       │ -2x..+2x│ -2x..+2x│ -2x..+2x│
       └─────────┴─────────┴─────────┘
```

### How it creates color

1. Patch a CIRCLE shape to Column A (input A1)
2. Patch a HORIZONTAL STRIPE to Column B (input B1)
3. Patch a VERTICAL RAMP to Column C (input C1)

Internal normalling sends each column down all three rows. So:
- Row 1 (Red) gets: circle × P1 + stripes × P2 + ramp × P3
- Row 2 (Green) gets: circle × P4 + stripes × P5 + ramp × P6
- Row 3 (Blue) gets: circle × P7 + stripes × P8 + ramp × P9

Turn P1 (circle→red) to +1, P5 (stripes→green) to +1, P9 (ramp→blue) to +1:
- Red channel shows the circle
- Green channel shows the stripes
- Blue channel shows the ramp
- Where they overlap you get secondary colors

Turn P4 (circle→green) to -1: now the circle SUBTRACTS from green, creating a cyan hole where the circle is.

### Key specs

- Each knob: -2x to +2x (center = 0)
- Input impedance: 1M ohms
- Output impedance: 75 ohms  
- Output range: ±2.5V
- No internal voltage generation — pure math on inputs

### What this means for our system

We need a COLOR MATRIX module. Not a color picker. A 3×3 grid where you patch video signals to columns, adjust gain per crosspoint, and the three row outputs become R, G, B channels feeding the monitor.

This is the missing link between our generators (which output grayscale) and actual COLOR video.

Source: [LZX SMX3 Technical Manual](https://docs.lzxindustries.net/docs/modules/smx3)

---

## Part 8: Power Architecture & System Design

### LZX Gen3 Power Standard

- 12VDC @ 25mA per HP
- 3 Amps per 104HP (with 15% headroom)
- Every module has its own internal power conditioning
- Sub-1mV ripple noise floor
- All sync outputs buffered by video-grade opamps
- 6-layer PCBs with dedicated power/ground planes

In our digital system, "power" = CPU/GPU budget:
- Each rAF loop module uses CPU time
- Canvas pixel iteration is the heaviest operation (equivalent to high power draw)
- Three.js WebGL offloads to GPU (equivalent to dedicated power supply)
- Budget: keep total rAF callbacks under ~30 for smooth 60fps

### Sync Distribution

Every module in an LZX system locks to the same sync generator (ESG3). The sync signal defines:
- Frame rate (50 or 60 Hz)
- Scan line timing
- Blanking intervals

Without sync, patterns drift across modules. With sync, everything is locked to the pixel grid.

In our system: `requestAnimationFrame` provides universal sync. But we should consider a single rAF loop that ticks all modules in sequence (like the main app's SymphonyViewport rAF loop) rather than each module running its own independent rAF. This would ensure perfect temporal alignment.

Source: [LZX Gen3 Primer](https://community.lzxindustries.net/t/lzx-gen3-primer-faq-the-future-with-chromagnon-lzx-modular/3688)

---

## Part 9: What Our System Gets Right

1. **Universal signal range (0-100)** — maps directly to 0-1V unipolar
2. **Expression engine** — every parameter can be modulated by any signal, like CV on every knob
3. **Module independence** — each module is a self-contained unit
4. **Jack-based patching** — outputs connect to inputs via the routing system
5. **Generators** — noise, patterns, gradients, waveforms — same concepts as LZX DSG3/DWO3
6. **Processors** — comparator, VCA, waveshaper, mixer — same concepts as LZX FKG3/SMX3
7. **Clock/timing** — divisions, gates, triggers — animation-rate modulation
8. **Three.js** — 3D geometry that no hardware video synth can do

---

## Part 10: What Our System Gets Wrong

### The Big Problem: Scalar vs Spatial

Our modules output ONE number per frame. A real video signal is a value at EVERY pixel position. We treat signals as time-varying scalars. Real video synthesis treats signals as spatially-varying fields.

**Example:**
- Our ramp module outputs: `ramp1_out = 73` (one number)
- A real ramp generator outputs: pixel(0,y)=0, pixel(1,y)=0.38, pixel(2,y)=0.77, ... pixel(W,y)=100 (one number PER PIXEL)

The scalar is useful for MODULATION (controlling knob values over time). But it's useless for VIDEO (determining brightness at each screen position).

### The Fix

We already have the per-pixel rendering code. Our generators (NoiseGenerator, PatternGenerator, etc.) iterate every pixel. They render to canvases. The canvases just need to be routable between modules.

Two signal domains:
1. **Scalar bus** (existing): single numbers for modulation (LFO, envelope, clock, etc.)
2. **Video bus** (new): canvas elements for video (generators, processors, monitor)

A module can bridge both: an envelope follower reads a video signal's average brightness → outputs a scalar. A scalar controls a video processor's threshold → modifies video.

### The Monitor Problem

Our monitor is an oscilloscope — it plots scalar values over time. A video monitor should display canvas frames. These are fundamentally different things:

- **Oscilloscope**: X axis = time, Y axis = value. Shows signal waveform.
- **Video monitor**: X axis = screen position, Y axis = screen position, brightness = signal value at that position.

We need both. The current MonitorModule should be renamed ScopeModule. A new VideoMonitorModule should drawImage from a video bus canvas.

### The Color Problem

Our system has no color mixing infrastructure. Real video synthesis creates color by routing different signals to R, G, B channels through a matrix mixer (SMX3). We have no equivalent — no way to assign different signals to different color channels.

Fix: build a ColorMatrixModule (equivalent to SMX3) that takes 3 inputs, applies gain per crosspoint, outputs to an RGB encoder that the monitor displays.

### The Processing Chain Problem

Video processors (VCA, Key, Fader, RGB Split) operate on scalar bus values. They should operate on canvas frames, per-pixel. A video VCA should multiply every pixel of input A by the corresponding pixel of input B (or by a scalar CV).

---

## Part 11: The Architecture Plan

### Phase 1: Video Bus
```javascript
// useVideoBus.js
const videoBusRef = useRef({}) // key → canvas element

// Generators publish:
videoBusRef.current['gen1'] = canvasRef.current

// Monitor reads:
const src = videoBusRef.current[connectedKey]
monitorCtx.drawImage(src, 0, 0, w, h)
```

### Phase 2: Video Monitor
New module that reads a canvas from the video bus and displays it. Simple `drawImage` in rAF loop. CRT effects optional.

### Phase 3: Per-Pixel Ramp
Ramp generator renders to canvas:
```javascript
for (let x = 0; x < w; x++) {
  const brightness = (x / w) * 255
  // fill column at brightness
}
videoBusRef.current['ramp1'] = canvas
```

### Phase 4: Video Processors
Each processor: read input canvas → process per-pixel → write output canvas
```javascript
// Video VCA
const srcData = srcCtx.getImageData(...)
const cvData = cvCtx.getImageData(...)
for (let i = 0; i < srcData.data.length; i += 4) {
  const gain = cvData.data[i] / 255
  outData.data[i] = srcData.data[i] * gain     // R
  outData.data[i+1] = srcData.data[i+1] * gain // G
  outData.data[i+2] = srcData.data[i+2] * gain // B
  outData.data[i+3] = 255                       // A
}
outCtx.putImageData(outData, ...)
videoBusRef.current['vca1'] = outCanvas
```

### Phase 5: Color Matrix
3×3 matrix mixer. 3 input slots, each with gain per R/G/B channel:
```javascript
// For each pixel:
R = inputA[pixel] * gainA_R + inputB[pixel] * gainB_R + inputC[pixel] * gainC_R
G = inputA[pixel] * gainA_G + inputB[pixel] * gainB_G + inputC[pixel] * gainC_G
B = inputA[pixel] * gainA_B + inputB[pixel] * gainB_B + inputC[pixel] * gainC_B
```

### Phase 6: Feedback
Route monitor output back to a processor's input with decay. The classic video synthesis effect. Needs a 1-frame delay (read previous frame's canvas).

---

## Part 12: Sources

### Primary Sources
- [LZX Industries — Getting Started](https://lzxindustries.net/getting-started)
- [LZX Gen3 Primer & FAQ](https://community.lzxindustries.net/t/lzx-gen3-primer-faq-the-future-with-chromagnon-lzx-modular/3688)
- [LZX Community — Using Audio Modules in Video](https://community.lzxindustries.net/t/using-audio-modules-in-a-video-synth-system/65)
- [LZX SMX3 Technical Manual](https://docs.lzxindustries.net/docs/modules/smx3)
- [LZX Videomancer Modulation Guide](https://docs.lzxindustries.net/docs/instruments/videomancer/modulation-operators)

### Module References
- [LZX DSG3 Product Page](https://lzxindustries.net/products/dsg3)
- [LZX ESG3 Product Page](https://lzxindustries.net/products/esg3)
- [LZX Scrolls — Schneidersladen](https://schneidersladen.de/en/lzx-industries-scrolls)
- [LZX PGO — Schneidersladen](https://schneidersladen.de/en/lzx-industries-pgo)
- [LZX Stacker — Schneidersladen](https://schneidersladen.de/en/lzx-industries-stacker)
- [Schneidersladen Video Synthesis Category](https://schneidersladen.de/en/eurorack-modular-3u/video-synthesis)
- [Syntonie Rampes — Midwest Modular](https://midwestmodular.com/rampes-ramp-generator/)
- [LZX Cadet VIII Hard Key Generator](https://djjondent.blogspot.com/2018/10/lzx-cadet-viii-video-synth-hard-key.html)
- [Syntonie CBV001 Workflows — Perfect Circuit](https://www.perfectcircuit.com/signal/syntonie-cbv001-workflows)

### Community & DIY
- [Gleix Video Modular — DIY System](https://gleix.net/modular)
- [ModWiggler — Where to Start with Video Synthesis](https://modwiggler.com/forum/viewtopic.php?t=236457)
- [ModWiggler — Adapting Audio Modules for Video](https://www.modwiggler.com/forum/viewtopic.php?t=34122)
- [Knobulism — Modular Signal Flow](https://www.knobulism.com/2024/07/02/modular-synth-signal-flow-its-all-just-voltage-people/)

### Video Signal Standards
- [RetroRGB — Sync Signals](https://retrorgb.com/sync.html)
- [MIT 6.111 — Video Sync Signals Lecture](https://courses.csail.mit.edu/6.111/f2008/handouts/L12.pdf)
- [University of Toronto — RGB Video Out](https://www.eecg.utoronto.ca/~tm4/rgbout.html)
