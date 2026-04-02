# Video Modulo — Complete Module Reference

36 modules documented. For each module: what it is in real video synthesis, how we implemented it, what works, what's broken, and how to fix it.

## Table of Contents

### Timing
1. [CLK — Master Clock](#1-clk--master-clock)
2. [GATE — Trigger-to-Gate Converter](#2-gate--trigger-to-gate-converter)
3. [CDIV — Clock Divider](#3-cdiv--clock-divider)
4. [SEQ — Step Sequencer](#4-seq--step-sequencer)

### Control
5. [LFO — Low Frequency Oscillator (×2)](#5-6-lfo--low-frequency-oscillator-2)
7. [ENV — ADSR Envelope](#7-env--adsr-envelope)
8. [S&H — Sample & Hold](#8-sh--sample--hold)
9. [MATHS — Dual Function Generator](#9-maths--dual-function-generator)

### Sources
10. [NOISE — Noise Source](#10-noise--noise-source)
11. [RAMP — Ramp Generator](#11-ramp--ramp-generator)
12. [GEN — Unified Pattern Generator (×2)](#12-13-gen--unified-pattern-generator-2)
14. [DITHER — Dither/Halftone Engine](#14-dither--ditherhalftone-engine)
15. [GEO — Three.js 3D Geometry](#15-geo--threejs-3d-geometry)

### Display
16. [MON — Monitor / Oscilloscope (×2)](#16-17-mon--monitor--oscilloscope-2)

### Logic / Utility
18. [LOGIC — Boolean Logic Gate](#18-logic--boolean-logic-gate)
19. [MULT — Signal Multiplier/Splitter](#19-mult--signal-multipliersplitter)
20. [MIX — Signal Mixer](#20-mix--signal-mixer)
21. [PM — Passive Dual Mult](#21-pm--passive-dual-mult)

### Video Processing
22. [RGB — RGB Channel Splitter](#22-rgb--rgb-channel-splitter)
23. [RGBMIX — RGB Channel Mixer](#23-rgbmix--rgb-channel-mixer)
24. [VCA — Voltage Controlled Amplifier](#24-vca--voltage-controlled-amplifier)
25. [KEY — Threshold Key Generator](#25-key--threshold-key-generator)
27. [FADE — Video Crossfader](#27-fade--video-crossfader)
28. [LUMA — Luminance Extractor](#28-luma--luminance-extractor)
29. [WSHP — Waveshaper](#29-wshp--waveshaper)
30. [SLEW — Slew Limiter](#30-slew--slew-limiter)
31. [INV — Inverter / Offset](#31-inv--inverter--offset)
32. [QUANT — Quantizer](#32-quant--quantizer)
33. [CMP — Comparator](#33-cmp--comparator)
34. [DLY — Signal Delay](#34-dly--signal-delay)
35. [SMP — Sample (on trigger)](#35-smp--sample-on-trigger)
36. [S/O — Scale & Offset](#36-so--scale--offset)
37. [RECT — Rectifier](#37-rect--rectifier)
38. [SW — Signal Switch](#38-sw--signal-switch)
39. [CONSOLE — Video Mix Console](#39-console--video-mix-console)

---

## TIMING MODULES

### 1. CLK — Master Clock
**File:** `ClockModule.jsx` | **Size:** 8HP 3U | **Bus keys:** clk1, clk1_phase, clk1_div2, clk1_div4, clk1_div8

**Theory:** The master clock is the heartbeat of a modular system. It generates periodic pulses at a set BPM. Every time-based module (sequencer, envelope, gate) derives its timing from the clock. In LZX video synthesis, clock modules like Tempi from Make Noise or Pamela's Pro Workout from ALM Busy Circuits provide multiple clock outputs at different divisions of the master tempo. Clock dividers (/2, /4, /8, /16) create slower rhythms from the same source — essential for polyrhythmic visual patterns.

**Implementation:** 
- rAF loop computes beat position from elapsed time and BPM
- Phase output = sawtooth ramp 0-100 per beat (continuous)
- Pulse output = 100 when phase < pulse width, else 0 (binary)
- Division outputs computed from beat position / N
- Swing shifts even beats by a percentage of beat duration

**Controls:** BPM (20-300) big knob, Swing (0-100), Pulse Width (1-50%)
**Jacks:** EXT input (external clock — not yet functional), 5 output jacks (×1, ÷2, ÷4, ÷8, PHS)

**What works:** BPM drives pulse timing correctly. Division outputs publish. Red dot pulses on beat.
**What's broken:** External clock input registered as jack but no code processes it. BPM/swing/PW in effect dependency array — knob changes restart the rAF loop, causing timing glitches.
**Fix:** Use refs for BPM/swing/PW (same pattern as EnvelopeModule). Implement external clock input with rising edge detection — when EXT is connected, lock to external pulse instead of internal BPM.

---

### 2. GATE — Trigger-to-Gate Converter
**File:** `GateModule.jsx` | **Size:** 8HP 1U | **Bus keys:** gate1

**Theory:** In modular synthesis, a TRIGGER is a short pulse (usually <10ms). A GATE is a signal that stays high for a duration. A gate module converts triggers to gates with controllable timing — you define how long the gate stays open after the trigger fires, whether it repeats, and whether there's a delay before opening. Think of it as a timed switch: trigger comes in, wait (delay), open for (length), repeat (N times).

**Implementation:**
- State machine: idle → delaying → active → idle
- Trigger input via ExpressionInput with rising edge detection
- Delay/length/repeat control the gate timing
- Output: 100 while gate is open, 0 while closed

**Controls:** Delay (0-2s), Length (0.01-5s), Repeat (1-16) — all expression-capable
**Jacks:** Trigger input, gate output

**What works:** Trigger fires gate correctly. Delay postpones gate opening. Repeat creates burst of gates.
**What's broken:** No visual timeline showing trigger vs gate timing. The repeat logic checks `Math.floor(elapsed / length)` against repeat count but doesn't account for inter-pulse gaps.
**Fix:** Add a small horizontal bar showing gate open/closed state (like the old timeline canvas but as a 3px indicator). Consider adding a gap parameter between repeats.

---

### 3. CDIV — Clock Divider
**File:** `ClockDivModule.jsx` | **Size:** 6HP 1U | **Bus keys:** cdiv1_out

**Theory:** A clock divider counts incoming clock pulses and outputs a pulse every N inputs. ÷2 means output one pulse for every two inputs — halving the tempo. Clock dividers are fundamental for creating rhythmic relationships: a ÷3 against ÷4 creates a polyrhythm. In video, this means different visual elements pulsing at different rates from the same master clock.

**Implementation:**
- Counts rising edges on clock input (threshold > 50)
- Division selector: ÷2, ÷3, ÷4, ÷5, ÷6, ÷7, ÷8, ÷16
- Outputs 6-frame pulse every N edges

**Controls:** Division `‹` `›` selector
**Jacks:** Clock input, divided output

**What works:** Built by agent, compiles clean.
**What's broken:** Untested. The 6-frame pulse width is hardcoded — should derive from input pulse width or be configurable.
**Fix:** Test with clock module. Make pulse width proportional to division (or configurable).

---

### 4. SEQ — Step Sequencer  
**File:** `SequencerModule.jsx` | **Size:** 16HP 3U | **Bus keys:** seq1, seq1_gate, seq1_step

**Theory:** A step sequencer stores a series of voltage values and steps through them one at a time on each clock pulse. In video synthesis, a sequencer can drive any parameter rhythmically — cycling through brightness levels, positions, filter cutoffs, or color values. The step values are set manually (drag the bars) and the clock input determines the speed. Direction modes (forward, reverse, ping-pong, random) change the playback pattern.

**Implementation:**
- Step values stored as array (8-64 values, 0-100 each)
- Clock input via ExpressionInput — advances step on rising edge
- Reset input via ExpressionInput — returns to step 0 on rising edge
- Direction modes: forward, reverse, pingpong, random
- Paginated UI (16 steps per page) when step count > 16

**Controls:** Step bars (draggable 0-100), Direction `‹` `›`, Step count selector, Clock/Reset expression inputs
**Jacks:** Clock in, Reset in (ExpressionInput), Value out, Gate out, Step out (JackSockets)

**What works:** Clock expression triggers step advance. Step bars respond to drag. Direction modes work. Paginated display.
**What's broken:** Step advance callback may have stale closure over the steps array when steps change mid-playback. The gate output (`seq1_gate`) goes high for one frame then immediately low via `requestAnimationFrame(() => bus.seq1_gate = 0)` — this is too short, should match the clock's pulse width.
**Fix:** Use ref for steps array. Gate duration should be configurable or derived from clock pulse width (half the clock period).

---

## GENERATOR MODULES

### 5-6. LFO — Low Frequency Oscillator (×2)
**File:** `LFOModule.jsx` | **Size:** 12HP 3U | **Bus keys:** lfo1, lfo2

**Theory:** An LFO generates a continuous waveform at sub-audio frequencies (typically 0.01-20 Hz). In video synthesis, LFOs create smooth, cycling modulation — things that breathe, pulse, sweep, and undulate. Different waveforms create different motion characters: sine = smooth breathing, saw = ramp then reset, triangle = linear up and down, pulse = snapping between two values, random = jittery.

In real video synths like the Scrolls module, LFOs sync to video timing and can produce waveforms at video rates (MHz) for creating visible patterns. Our LFOs operate at animation rate (0-20Hz), suitable for motion control but not for generating visible patterns directly.

**Implementation:**
- Builds an expression string from waveform/rate/depth/offset: e.g., `wave(t*2)*0.8+10`
- Compiles via `compile()` from useExpressionValue
- Evaluates per frame in rAF loop
- Publishes result to busRef.current[id]
- Small oscilloscope canvas shows live waveform

**Controls:** Waveform `‹` `›` (sine/saw/tri/pulse/rand/bell/exp/step), Rate knob, Depth knob, Offset knob
**Jacks:** Output (JackSocket)

**What works:** Expression compilation. All 8 waveforms. Scope visualization. Bus publishing. busRef on all knobs.
**What's broken:** 
1. Still single oscillator — the plan called for dual (Osc A + Osc B with cross-modulation and sync input). Never rewritten.
2. Rate knob linear scaling (0-20Hz mapped linearly to 0-100%) — low rates hard to set precisely. Should be exponential.
3. No sync input — can't hard-sync to clock or another LFO.
4. The rAF loop is in a useEffect with `[enabled, rate, id, busRef]` dependencies — changing rate restarts the loop, causing a phase discontinuity.

**Fix:** 
1. Dual oscillator rewrite with cross-mod knob and sync input jack
2. Exponential rate scaling: `rate = 0.01 * Math.exp(knobValue / 100 * Math.log(2000))`
3. Add sync input ExpressionInput — reset phase on rising edge
4. Move rate to ref, remove from useEffect deps

---

### 7. ENV — ADSR Envelope
**File:** `EnvelopeModule.jsx` | **Size:** 12HP 3U | **Bus keys:** env1, env1_eoc

**Theory:** An envelope generator produces a shaped voltage contour in response to a trigger. The classic ADSR (Attack-Decay-Sustain-Release) defines:
- **Attack**: time to rise from 0 to full (0→100)
- **Decay**: time to fall from full to sustain level (100→sustain)
- **Sustain**: level to hold while gate is high (0-100%)
- **Release**: time to fall from sustain to 0 when gate drops

In video synthesis, envelopes control how visual events evolve — a flash that fades, a shape that grows and shrinks, a color that sweeps through a transition. The trigger determines WHEN it happens, the ADSR parameters determine HOW it happens.

**Implementation:**
- State machine: IDLE → ATTACK → DECAY → SUSTAIN → RELEASE → IDLE
- Trigger input via ExpressionInput — rising edge starts ATTACK
- Gate input via ExpressionInput — dropping below 50 starts RELEASE
- ADSR values stored in ref (adsrRef) to avoid rAF restart on knob change
- Retrigger toggle: if on, new trigger during ADSR restarts from ATTACK
- EOC (end of cycle) output: pulses 100 for one frame when envelope completes full cycle

**Controls:** ATK, DEC, SUS, REL knobs (all expression-capable), Trigger/Gate expression inputs, Retrigger toggle
**Jacks:** Trigger in, Gate in (ExpressionInput), ENV out, EOC out (JackSocket)

**What works:** State machine transitions correctly. Trigger fires attack. Gate holds sustain. ADSR knobs via refs don't restart loop. EOC publishes. Scope canvas shows envelope shape.
**What's broken:** When no gate expression is set, envelope goes IDLE→ATK→DEC→SUS (forever) — sustain holds indefinitely. Should auto-release after sustain. The scope shows scrolling history of output value, not the ADSR shape preview.
**Fix:** Auto-release after 0.5s if no gate expression connected. Scope should draw the theoretical ADSR curve as a reference line (static) with the live output overlaid.

---

### 8. S&H — Sample & Hold
**File:** `RandomSHModule.jsx` | **Size:** 6HP 1U | **Bus keys:** sh1

**Theory:** A sample & hold captures the voltage at its input at the moment it receives a trigger, then holds that voltage constant until the next trigger. In video, this creates stepped/quantized motion — things that snap between values rather than gliding. Classic use: sample a noise source on each clock tick → random staircase pattern.

The crucial distinction: a REAL S&H has TWO inputs — a SIGNAL to sample and a TRIGGER that determines when to sample. Our current module only generates random values on an internal clock — it's a random generator, not a true sample & hold.

**Implementation:**
- Internal rate-based clock (NOT external trigger)
- Generates random value between min and max on each step
- Smooth parameter interpolates between steps
- No signal input — always samples random

**Controls:** Rate, Min, Max, Smooth knobs
**Jacks:** Output only

**What works:** Random value generation. Smooth interpolation. Bus publishing.
**What's broken:** Not a real S&H — has no signal input or trigger input. It's a random voltage source with internal clock.
**Fix:** Add signal input jack (what to sample). Add trigger input jack (when to sample). When no signal input is connected, fall back to random (current behavior). When no trigger input connected, use internal rate clock (current behavior). Both inputs make it a proper S&H.

---

### 9. MATHS — Dual Function Generator
**File:** `MathsModule.jsx` | **Size:** 16HP 3U | **Bus keys:** math1_ch1, math1_ch2, math1_sum, math1_inv, math1_eor, math1_eoc

**Theory:** Inspired by Make Noise Maths (itself inspired by the Buchla 281/257). MATHS is the Swiss Army knife of modular — depending on how you patch it, it becomes:
- **Envelope generator** (trigger only, no signal): rise from 0→100, fall from 100→0
- **Slew limiter** (signal only, no trigger): output follows input but rate-limited by rise/fall
- **LFO** (nothing connected): free-running cycle (rise then fall, repeat)
- **Voltage processor** (both signal and trigger): triggered slew to target value

Two independent channels with Sum, Inverted Sum, End of Rise, and End of Cycle outputs. The EOR and EOC outputs are triggers — they fire once when the rise or full cycle completes, enabling complex chaining.

**Implementation:**
- Two channels, each with rise/fall knobs + signal/trigger expression inputs
- Mode auto-detected based on what's connected:
  - No inputs → free-running LFO
  - Trigger only → triggered envelope
  - Signal only → slew limiter
  - Both → triggered slew to signal value
- Sum = (ch1 + ch2) / 2, Inv = 100 - sum
- EOR/EOC pulse for one frame at transition points

**Controls:** Rise/Fall knobs per channel (×2), Signal/Trigger expression inputs per channel (×4)
**Jacks:** 4 expression inputs (ch1 sig, ch1 trig, ch2 sig, ch2 trig), 6 outputs (ch1, ch2, sum, inv, eor, eoc)

**What works:** All four modes. Dual trace scope. Bus publishing. Mode auto-detection.
**What's broken:** Rise/fall scaling (0-5 seconds linear) is too coarse for fast envelopes and too fine for very slow ones. The free-running LFO mode doesn't show in the scope clearly — the trace just looks like a saw wave with no indication of which mode is active.
**Fix:** Logarithmic rise/fall scaling. Add small mode indicator text per channel showing current auto-detected mode.

---

### 10. NOISE — Noise Source
**File:** `NoiseSourceModule.jsx` | **Size:** 6HP 1U | **Bus keys:** nz1_out

**Theory:** A noise generator produces random voltage. Three colors of noise:
- **White**: completely random each sample — equal energy at all frequencies. Sharp, hissy.
- **Pink**: filtered to -3dB/octave — more energy at low frequencies. Natural, warm.
- **Brown**: random walk — each sample is previous + small random step. Smooth, drifting.

In video synthesis, noise is fundamental: as a video source (static/snow), as modulation (jitter, randomness), as a texture (dithering, grain). Feed noise through a comparator to get random binary flicker. Feed it through a slew limiter for smooth random drift.

**Implementation:**
- White: `Math.random() * level`
- Pink: Voss-McCartney algorithm (filtered random)  
- Brown: random walk with boundaries
- Level knob scales output amplitude

**Controls:** Color `‹` `›` (white/pink/brown), Level knob
**Jacks:** Output

**What works:** Built by agent, compiles clean.
**What's broken:** Untested. Pink noise algorithm quality unknown. No seed control for repeatable noise.
**Fix:** Test all three colors. Verify pink noise sounds/looks correct. Consider adding seed input for deterministic noise (useful for reproducible patches).

---

### 11. RAMP — Ramp Generator
**File:** `RampGenModule.jsx` | **Size:** 8HP 3U | **Bus keys:** ramp1_out

**Theory:** The ramp generator is THE foundational module of video synthesis. It produces a linear voltage sweep synchronized to screen coordinates:
- **Horizontal ramp**: 0 at left edge, 1 at right edge (one value per pixel column)
- **Vertical ramp**: 0 at top, 1 at bottom (one value per pixel row)
- **Diagonal**: combination of both

Real ramp generators like LZX Rampes also produce mirrored versions (V-shapes centered on screen) and derived 2D shapes (diamond, rectangle, cross, star, ellipse).

The ramp IS the coordinate system. Without it, you can't place anything on screen. Feed a ramp through a comparator → you get an edge at a position. Feed it through an oscillator → repeating pattern. Feed it through a waveshaper → complex geometry.

**Implementation (current):**
- Outputs a SCALAR value: a sawtooth that ramps 0→100 over time at a set frequency
- Direction selector: H/V/DIAG
- This is WRONG — it's a time-varying scalar, not a spatially-varying field

**Controls:** Frequency knob, Direction `‹` `›` (H/V/DIAG)
**Jacks:** Output

**What works:** Scalar output ramps correctly over time. Useful as an animation modulator.
**What's broken:** Fundamentally wrong architecture. A ramp generator should output a canvas where each pixel's brightness equals its position. Currently outputs one number per frame, not one number per pixel.
**Fix:** Render to canvas. For horizontal: `pixel[x] = x/width * 255`. For vertical: `pixel[y] = y/height * 255`. For diagonal: `pixel[x,y] = (x/w + y/h) / 2 * 255`. Publish canvas to video bus. The scalar output can remain as a secondary output (average value for modulation).

---

### 12-13. GEN — Unified Pattern Generator (×2)
**File:** `GeneratorModule.jsx` | **Size:** 12HP 3U | **Bus keys:** gen1_luma, gen1_density (gen2_luma, gen2_density)

**Theory:** Pattern generators create visual textures from mathematical functions — the equivalent of video-rate oscillators in LZX systems. Our GEN module unified 4 separate generators (Noise, Gradient, Pattern, Color Field) into one module with algorithm selection.

The five algorithms:
1. **Noise**: Fractional Brownian Motion (fbm) using hash-based value noise. Parameters: scale (zoom), speed (drift), octaves (detail). Creates organic, cloud-like textures.
2. **Gradient**: Canvas API gradient fills (linear, radial, conic). Parameters: angle, speed. Creates smooth color sweeps.
3. **Pattern**: Geometric repeats (stripes, dots, checker). Parameters: spacing, angle, duty cycle. Creates regular grids and bars.
4. **Wave**: NEW — waveform math rendered as pixel bands. Sine/saw/pulse/square/random. Parameters: frequency, speed, angle, PWM. Creates video-rate oscillator patterns.
5. **Color**: HSL color field. Parameters: H (0-360), S (0-100), L (0-100). Static — animation comes from expression-driven knobs.

**Implementation:**
- Renders per-pixel to a hidden canvas (`display: none`)
- Samples 64 points for average luma → publishes as scalar
- Algorithm and sub-type selection via `‹` `›`
- Knobs change meaning per algorithm (p1/p2/p3/p4 mapped contextually)

**Controls:** Algorithm `‹` `›`, Sub-type `‹` `›`, 3-4 contextual knobs
**Jacks:** Luma out, Density out (JackSocket)

**What works:** All 5 algorithms render correctly to hidden canvas. Luma sampling. Bus publishing. Algorithm switching.
**What's broken:** 
1. Canvas is hidden — nobody can see the output
2. Only publishes luma/density (scalars), not the canvas frame
3. No video bus integration — can't pipe the canvas to a monitor or processor
4. Color algorithm works but the HSL knobs don't clearly show what they control (labels show as p1/p2/p3)

**Fix:** 
1. Publish canvas to video bus: `videoBusRef.current[id] = canvasRef.current`
2. Video monitor reads canvas and displays it
3. Better knob labels per algorithm (already partially done but generic p1/p2/p3 labels persist in some cases)

---

### 14. DITHER — Dither/Halftone Engine
**File:** `DitherModule.jsx` | **Size:** 16HP 3U | **Bus keys:** dither1_out

**Theory:** Dithering is the technique of reducing visual information (like color depth or resolution) while preserving the appearance of continuous tone through patterns of discrete dots or shapes. Halftone printing (newspapers, comics) is the classic example — varying the SIZE of regularly-spaced dots to simulate shades of gray.

Our dither engine (ported from kol-radar) offers 23 modes and 21 shapes:
- **Modes**: halftone, inverse halftone, flat, rotation, stretch H/V, crosshatch, glitch, opacity, threshold, random size/rotation, checker, posterize, melt, flow field, edge detect, jitter, interference, CRT scan, bio-organic, eraser
- **Shapes**: circle, square, triangle, octagon, star, cross, rectangles, hexagon, diagonals, chevron, trapezoid, semi-circles, hollow, spiral, concentric, gear, flower, ghost

Each mode determines HOW the shape parameters respond to the input image's luminance. Each shape determines WHAT is drawn at each grid cell.

**Implementation:**
- `renderDither(canvas, sourceImage, params)` from ditherEngine.js
- Reads source image pixels, computes luma per cell
- Mode switch determines scale/rotation/offset/alpha per cell based on luma
- Draws shapes at grid positions with computed transforms
- Currently processes a static test pattern (gradient + circles)

**Controls:** Mode group `‹` `›`, Mode `‹` `›`, Shape `‹` `›`, Cell size, Scale, Gap, Contrast, Intensity knobs, Color toggle (SOURCE/MONO)
**Jacks:** Input (signal — not yet functional as video input), Output (JackSocket)

**What works:** Engine renders correctly with test pattern. All 23 modes produce distinct visual results. Shape selection works. Knobs control parameters.
**What's broken:**
1. Canvas hidden — no visible output
2. Processes a STATIC test pattern, not a live video input
3. No video bus — can't receive canvas from GEN or send to MON
4. The `renderDither` function requires an `HTMLImageElement` as source — can't accept a canvas directly (needs adaptation)

**Fix:**
1. Adapt `renderDither` to accept canvas as source (create Image from canvas.toDataURL() or use drawImage to temp canvas then getImageData)
2. Video bus input: read source canvas from video bus, process with dither, publish output canvas
3. This module should be the first video PROCESSOR tested — chain GEN → DITHER → MON

---

### 15. GEO — Three.js 3D Geometry
**File:** `Geometry3DModule.jsx` | **Size:** 16HP 3U | **Bus keys:** geo1, geo1_phase

**Theory:** 3D geometry in video synthesis draws from the legacy of early computer graphics and analog video effects. Kraftwerk pioneered the aesthetic of rotating wireframe heads and geometric solids in live performance (1970s-80s). Modern video synth modules like Sleepy Circuits Mezzz generate 3D visuals in eurorack format.

Our GEO module renders basic 3D primitives using Three.js (WebGL), which offloads computation to the GPU — making it lighter on CPU than our pixel-iterating generators.

**Implementation:**
- Three.js scene with PerspectiveCamera and WebGLRenderer
- 6 geometry types: Icosahedron, Box, Torus, Octahedron, Sphere, Cylinder
- 3 render modes: Wireframe, Solid (MeshBasicMaterial), Points (PointsMaterial)
- Rotation driven by rotateX/Y/Z speed values accumulated per frame
- Detail knob controls subdivision (geometry segments/detail level)
- Phase output: Y rotation normalized to 0-100 (repeating sawtooth)

**Controls:** Geometry `‹` `›`, Render mode `‹` `›`, Detail, Scale, RotX, RotY, RotZ knobs
**Jacks:** Output (geo1), Phase output (geo1_phase)

**What works:** Three.js initializes and renders. Geometry types switch correctly. Wireframe/solid/point modes. Rotation animation. Phase output.
**What's broken:**
1. Canvas was hidden at 1px height, then made visible — may still be clipped by HP overflow
2. No video bus output — the Three.js canvas exists but isn't shared
3. Geometry recreation on parameter change causes visual flash (old geometry disposed, new created)
4. Color knob exists in config but no UI control for it
5. Background color from config but using setClearColor which may not match module panel color

**Fix:**
1. Publish Three.js canvas to video bus
2. Add color knob to UI
3. Consider lerping between geometry states instead of hard swap
4. The Three.js canvas could potentially be read back to 2D canvas via `readPixels` or `renderer.domElement.toDataURL()` for downstream processing — but this is expensive

---

### 16-17. MON — Monitor / Oscilloscope (×2)
**File:** `MonitorModule.jsx` | **Size:** 16HP 3U | **Bus keys:** none (display only)

**Theory:** In real video synthesis, the monitor is simply a display — it shows whatever video signal is connected to its input. No processing, no interpretation. What goes in is what you see.

Our monitor is currently an OSCILLOSCOPE — it plots scalar signal values over time, showing waveform traces. This is useful for debugging signals but is NOT a video monitor.

A proper video monitor should:
- Accept a video bus key as input
- Read the canvas from the video bus
- Display it (drawImage)
- Add optional CRT effects (scanlines, phosphor glow, curvature)

**Implementation (current):**
- Expression input field for direct function evaluation (e.g., `wave(t*2)`)
- Two signal input jacks (A and B) via ExpressionInput
- A trace = green, B trace = cyan
- Zoom +/- and reset controls
- Grab-to-pan on the canvas
- CRT scanline effect overlay
- SCO/VID mode toggle (VID mode not yet functional)

**Controls:** Expression input, A/B jacks, Zoom +/-, Reset
**Jacks:** Input A, Input B (ExpressionInput + JackSocket)

**What works:** Expression input evaluates and plots. Signal traces from bus values. Zoom/pan. CRT effect.
**What's broken:**
1. It's a SCOPE, not a video MONITOR — shows scalar traces, not images
2. VID mode toggle exists but has no implementation
3. Can't display canvas frames from generators
4. The expression input at top is confusingly similar to the A/B signal inputs below

**Fix:**
1. Rename to SCOPE for signal debugging
2. Build a separate VideoMonitorModule that reads from video bus and displays canvas frames
3. In VID mode: accept video bus key, drawImage to display canvas, add CRT effects
4. In SCO mode: current oscilloscope behavior

---

## PROCESSING MODULES

### 18. LOGIC — Boolean Logic Gate
**File:** `LogicModule.jsx` | **Size:** 8HP 1U | **Bus keys:** logic1

**Theory:** Logic gates perform boolean operations on signals. In video synthesis, they're used to combine shapes: AND of two shapes = only where both shapes exist. OR = where either exists. XOR = where exactly one exists. These create complex composite shapes from simple inputs.

A comparator (threshold) creates a binary signal from a continuous one. Logic combines binary signals. Together, they're the shape-building toolkit.

**Implementation:**
- Type selector: AND, OR, XOR, NOT, NAND
- Two expression inputs (A, B) — B hidden for NOT
- Reads input values via ref (aValRef, bValRef)
- Threshold at 50: input > 50 = true, ≤ 50 = false
- Output: 100 (true) or 0 (false)
- A/B/OUT indicator bars show state visually

**Controls:** Type `‹` `›`, Expression inputs A and B
**Jacks:** Output (ModuleIO)

**What works:** All 5 logic types. Expression inputs evaluate. Visual indicators.
**What's broken:** Has BOTH JackSocket AND ModuleIO jacks for same I/O (duplicate jacks). The threshold of 50 is hardcoded — should be adjustable for different signal ranges.
**Fix:** Remove duplicate jacks. Consider adding threshold knob or making threshold the expression itself (user types `lfo1 > 30` instead of `lfo1` with implicit > 50).

---

### 19. MULT — Signal Multiplier/Splitter
**File:** `MultiplesModule.jsx` | **Size:** 6HP 1U | **Bus keys:** mult1_a, mult1_b, mult1_c

**Theory:** A multiple (mult) splits one signal into several copies. In analog, passive mults just connect wires — the signal goes to all outputs identically. Active mults buffer the signal to prevent voltage droop. Our mult adds scale per output, making it more of a utility processor.

**Implementation:**
- Input source selected via `‹` `›` from hardcoded SIGNAL_SOURCES list
- 3 outputs (A, B, C) each with scale knob (-2x to +2x)
- Reads input value from bus, applies scale per output, publishes

**Controls:** Source `‹` `›`, 3 scale knobs (one per output)
**Jacks:** Outputs via ModuleIO

**What works:** Signal splitting with scale.
**What's broken:**
1. Input is a hardcoded dropdown of 6 signal sources — should be an expression input or jack
2. No offset per output (the original config had it but UI was removed in 1U rewrite)
3. Scale knobs at 28px in 6HP may overflow

**Fix:** Replace source selector with ExpressionInput. Add offset knob per output (or share one offset).

---

### 20. MIX — Signal Mixer
**File:** `MixerModule.jsx` | **Size:** 16HP 1U | **Bus keys:** mix1

**Theory:** A mixer combines multiple signals into one. In video: layer patterns, combine modulation sources, sum RGB channels. The mix mode determines how signals combine: ADD (brighten), AVG (balanced), MAX (highest wins), MIN (darkest wins).

**Implementation:**
- 4 expression inputs (in1-in4) with level knobs
- Mix mode: ADD, AVG, MAX, MIN
- Master output knob
- Publishes combined result

**Controls:** 4 expression inputs, Mode `‹` `›`, Master knob
**Jacks:** Output (ModuleIO), 4 inputs (ModuleIO)

**What works:** Expression inputs evaluate. Mode switching. Master scaling.
**What's broken:** At 1U height, 4 expression inputs + mode + master is too much content — overflows. Level knobs were removed in 1U rewrite.
**Fix:** Either make 3U (more room) or reduce to 2 inputs for 1U. Restore level knobs.

---

### 21. PM — Passive Dual Mult
**File:** `Mult2HPModule.jsx` | **Size:** 2HP any | **Bus keys:** pm1_a1-a4, pm1_b1-b4

**Theory:** A passive mult just splits a signal. No controls, no processing. 1 in → 4 out. Two independent sections per module. In real eurorack, these are 2HP slim modules you scatter between larger modules for signal distribution.

**Implementation:**
- Two sections (A, B), each with 1 input + 4 output JackSockets
- Vertical column of jacks with a divider between sections

**Controls:** None
**Jacks:** 2 inputs, 8 outputs

**What works:** Jack layout renders.
**What's broken:** NO ACTUAL SIGNAL PROCESSING. The jacks register for position and patching, but there's no rAF loop copying input values to outputs. The mult is purely visual — signals don't pass through.
**Fix:** Add rAF loop: read input bus key → copy value to all output bus keys. For each section independently.

---

## VIDEO PROCESSING MODULES (Case 2)

### 22. RGB — RGB Channel Splitter
**File:** `RGBSplitModule.jsx` | **Size:** 8HP 3U | **Bus keys:** rgb1_r, rgb1_g, rgb1_b

**Theory:** An RGB splitter takes a composite signal and separates it into three color channels. In analog video, this is done with bandpass filters tuned to the R, G, B frequency bands. In our system, it should take a video signal (canvas) and output the R, G, B channels as separate grayscale canvases.

**Current implementation:** Operates on a scalar bus value. Splits one number into three with gain knobs. This is wrong — should process canvas frames per-pixel.

**Fix:** Video bus input. Read canvas. For each pixel, extract R/G/B components. Output three separate canvases (one per channel, each showing that color component as grayscale brightness).

---

### 23. RGBMIX — RGB Channel Mixer
**File:** `RGBMixModule.jsx` | **Size:** 10HP 3U | **Bus keys:** rgbm1_out

**Theory:** The inverse of RGB split — takes three signals and combines them into one color image. Each input controls one color channel. This is the software equivalent of the LZX SMX3 matrix mixer (simplified to 3×1 instead of 3×3).

**Current implementation:** Mixes three scalar values with gain. Wrong — should combine three canvases into one RGB canvas.

**Fix:** Video bus. Read three input canvases. For each pixel: R from canvas A, G from canvas B, B from canvas C. Scale by gain per channel. Output combined RGB canvas.

---

### 24. VCA — Voltage Controlled Amplifier
**File:** `VideoVCAModule.jsx` | **Size:** 6HP 3U | **Bus keys:** vca1_out

**Theory:** A VCA multiplies a signal by a control voltage. In audio: volume control. In video: brightness control. Signal × CV = output. When CV = 0, output = 0 (black). When CV = 1, output = signal (full brightness). When CV varies, the signal amplitude follows the CV.

In video synthesis, VCAs are used for:
- Keying (CV = key signal → signal only visible where key is bright)
- Amplitude modulation (CV = LFO → pulsing brightness)
- Mixing (CV = crossfade position)

**Current implementation:** Multiplies two scalar values × level knob. Correct for control signals, wrong for video.

**Fix for video mode:** Signal input = canvas. CV input = canvas or scalar. Per-pixel: output[pixel] = signal[pixel] × cv[pixel] × level. If CV is scalar, apply uniformly to all pixels.

---

### 25. KEY — Threshold Key Generator
**File:** `VideoKeyModule.jsx` | **Size:** 6HP 3U | **Bus keys:** key1_out

**Theory:** A key generator is a comparator applied to video. It creates a binary mask: pixels above the threshold become white (key signal = 1), pixels below become black (key signal = 0). In hard key mode, the edge is sharp. In soft key mode, there's a gradual transition around the threshold.

Key generators are used for:
- Creating shapes from ramps (ramp + key = rectangle)
- Compositing (use one signal as a mask for another via VCA)
- Creating graphic elements (text, shapes) from noisy or gradient sources

**Current implementation:** Thresholds a scalar value. Wrong for video.

**Fix:** Video bus input. Per-pixel: hard key: `pixel > threshold * 255 ? 255 : 0`. Soft key: `clamp((pixel - threshold * 255) / softness, 0, 255)`.

---

### 26. RAMP (Video) — Same as module 11 above (listed once)

---

### 27. FADE — Video Crossfader
**File:** `VideoFaderModule.jsx` | **Size:** 6HP 3U | **Bus keys:** fade1_out

**Theory:** A crossfader blends between two sources. At position 0: only source A. At position 1: only source B. At 0.5: equal mix. This is the fundamental transition tool — dissolves between scenes, textures, or effects.

**Current implementation:** Crossfades two scalar values. Correct for scalars, wrong for video.

**Fix:** Video bus. Two input canvases. Per-pixel: `output[pixel] = A[pixel] × (1-fade) + B[pixel] × fade`.

---

### 28. LUMA — Luminance Extractor
**File:** `LumaKeyModule.jsx` | **Size:** 6HP 3U | **Bus keys:** luma1_out

**Theory:** Extracts brightness from a signal. In real video, luma = 0.299R + 0.587G + 0.114B (ITU-R BT.709). The output is a grayscale representation of the input's brightness. Contrast and brightness controls adjust the extracted luma before output.

Luma extraction bridges video and control domains: a complex color video signal goes in, a simple brightness signal comes out, usable as a modulation source.

**Current implementation:** Applies contrast/brightness to a scalar. Partially correct for scalars but should process video.

**Fix:** Video bus input. Per-pixel: compute luma from RGB, apply contrast curve, apply brightness offset. Output grayscale canvas AND scalar (average luma as control signal).

---

### 29. WSHP — Waveshaper
**File:** `WaveShapeModule.jsx` | **Size:** 8HP 3U | **Bus keys:** wshp1_out

**Theory:** A waveshaper applies a non-linear transfer function to a signal. Four modes:
- **Clip**: hard limit at boundaries (distortion)
- **Fold**: when signal exceeds boundary, it folds back (wavefold synthesis)
- **Wrap**: when signal exceeds boundary, it wraps around (modulo)
- **Sine**: maps input through a sine function (soft, harmonic)

In video: a ramp through a wavefolder creates multiple copies of the ramp (stripe multiplication). Through a sine shaper creates smooth undulating patterns. Through clip creates high-contrast posterization.

**Current implementation:** Operates on scalar. Normalizes to -1..1, applies transform, maps back to 0-100. Correct for both scalar and per-pixel use.

**Fix:** For video mode: apply the same math per-pixel on input canvas. The scalar version is already correct for control signal processing.

---

### 30. SLEW — Slew Limiter
**File:** `SlewModule.jsx` | **Size:** 6HP 1U | **Bus keys:** slew1_out

**Theory:** A slew limiter smooths sharp transitions. Rise rate controls how fast the output can increase. Fall rate controls how fast it can decrease. Fast rise + slow fall = sharp attack, gradual release (like audio compression). Slow rise + fast fall = gradual fade-in, sharp cut.

In video: slew on a clock signal turns square pulses into trapezoidal shapes. Slew on a sequencer output creates portamento-like glides between step values.

**Current implementation:** Tracks input value with rate-limited rise and fall. Correct for scalars.

**What works:** Built by agent. Rise/fall rate limiting.
**What's broken:** Untested. Rate scaling (0-100 knob → 0-5 seconds for full sweep) may need adjustment.

---

### 31. INV — Inverter / Offset
**File:** `InvertModule.jsx` | **Size:** 4HP 1U | **Bus keys:** inv1_out

**Theory:** Inversion flips a signal: 100 becomes 0, 0 becomes 100. With offset: the inversion point shifts. This is fundamental video math — inverting a ramp creates a reversed ramp. Inverting a key creates the negative (what was visible becomes invisible).

**Current implementation:** `output = invert ? (100 - input + offset) : (input + offset)`. Correct.

**What works:** Built by agent.
**What's broken:** Untested. Toggle between INV/NRM should be clear.

---

### 32. QUANT — Quantizer
**File:** `QuantizerModule.jsx` | **Size:** 6HP 1U | **Bus keys:** quant1_out

**Theory:** A quantizer snaps continuous values to the nearest step. With 4 steps: input can only be 0, 33, 67, or 100. Creates staircase patterns from smooth signals. In video: quantizing a gradient creates posterization (banding). In control: quantizing an LFO creates stepped modulation.

**Current implementation:** `Math.round(input / stepSize) * stepSize`. Correct.

**What works:** Built by agent.
**What's broken:** Untested.

---

### 33. CMP — Comparator
**File:** `ComparatorModule.jsx` | **Size:** 6HP 1U | **Bus keys:** cmp1_out

**Theory:** Compares two signals. GT: output high when A > B. LT: when A < B. EQ: when A ≈ B (within tolerance). NEQ: when A ≠ B. In video synthesis, comparators are used to create edges and masks from ramps — THE fundamental shape-making operation.

**Current implementation:** Reads two input values, applies comparison, outputs 100 or 0. Correct for scalars.

**What works:** Built by agent.
**What's broken:** Untested. EQ tolerance (±5) is hardcoded — should be adjustable.

---

### 34. DLY — Signal Delay
**File:** `DelayModule.jsx` | **Size:** 8HP 3U | **Bus keys:** dly1_out

**Theory:** Delays a signal by a set number of frames. With feedback, the delayed signal feeds back into the input, creating echo/decay effects. In video: delay + feedback = motion trails. In control: delay + feedback = rhythmic patterns.

**Current implementation:** Circular buffer of scalar values. Time = 1-60 frames. Feedback = 0-100%.

**What works:** Built by agent.
**What's broken:** Untested. For video, this should delay canvas frames, not scalar values.

---

### 35. SMP — Sample (on trigger)
**File:** `SampleModule.jsx` | **Size:** 4HP 1U | **Bus keys:** smp1_out

**Theory:** Captures a signal value when triggered and holds it until the next trigger. Unlike S&H (which uses internal random), this samples WHATEVER is connected to the signal input. Useful for capturing a specific moment from a changing signal and holding it.

**Current implementation:** Signal input + trigger input. Captures on rising edge, holds.

**What works:** Built by agent.
**What's broken:** Untested.

---

### 36. S/O — Scale & Offset
**File:** `ScaleOffsetModule.jsx` | **Size:** 4HP 1U | **Bus keys:** so1_out

**Theory:** The simplest utility: multiply and add. Scale = gain (-2x to +2x). Offset = DC shift (-100 to +100). Essential for mapping one signal range to another. LFO output 0-100 but you need 30-70? Scale to 0.4, offset +30.

**Current implementation:** `clamp(input × scale + offset, 0, 100)`. Correct.

**What works:** Built by agent.
**What's broken:** Untested.

---

### 37. RECT — Rectifier
**File:** `RectifierModule.jsx` | **Size:** 4HP 1U | **Bus keys:** rect1_out

**Theory:** Rectification folds negative-going signals to positive. Full wave: absolute value around midpoint. Half+: pass only above midpoint. Half-: pass only below, inverted. In video: rectifying a sine creates doubled frequency. Rectifying centered shapes creates mirror effects.

**Current implementation:** Three modes operating on scalar. Correct.

**What works:** Built by agent.
**What's broken:** Untested.

---

### 38. SW — Signal Switch
**File:** `SwitchModule.jsx` | **Size:** 6HP 1U | **Bus keys:** sw1_out

**Theory:** Routes one of two inputs to the output based on a CV or manual toggle. When CV > 50: route A. When CV ≤ 50: route B. Useful for alternating between two video sources, switching effects chains, or creating rhythmic source changes (clock to CV → alternating every beat).

**Current implementation:** Two inputs (A, B), CV input, manual override toggle.

**What works:** Built by agent.
**What's broken:** Untested.

---

### 39. CONSOLE — Video Mix Console
**File:** `VideoMixConsoleModule.jsx` | **Size:** 32HP 3U | **Bus keys:** vmx1_out, vmx1_aux1, vmx1_aux2

**Theory:** The central mixing station. 4 channels, each with level, aux 1 send, aux 2 send. Two aux return inputs. Master output. This is where all video signals come together before the final output.

In a real video synth: channels bring in different visual sources (generators, processed signals, external video). The mixer composites them. Aux sends route copies to effect processors. Aux returns bring processed signals back into the mix.

**Current implementation:** 4 input expression inputs with level knobs. 2 aux send knobs per channel. 2 aux return input jacks. Master output knob. Operates on scalars.

**What works:** Built by agent. Should have the most comprehensive control layout.
**What's broken:** Untested. Should be a VIDEO mixer (compositing canvases with blend modes), not a scalar mixer. The 32HP width gives room for proper channel strips.
**Fix:** Video bus integration. Each channel reads a canvas from video bus. Composites with opacity (level). Aux sends copy channel canvas at send level. Returns composite aux canvases. Master applies final opacity. Output canvas to video bus.

---

## Summary Statistics

| Category | Count | Scalar-correct | Video-ready | Tested |
|----------|-------|---------------|-------------|--------|
| Timing | 4 | 4 | n/a | 2 |
| Generators | 7 | 7 | 0 | 4 |
| Signal processors | 12 | 12 | 0 | 2 |
| Video processors | 8 | 8 | 0 | 0 |
| Display | 2 | 2 | 0 | 1 |
| Utility | 3 | 1 | n/a | 0 |
| **Total** | **36** | **34** | **0** | **9** |

The core issue: **0 modules are video-ready.** Everything operates on scalars. The video bus is the single most important architectural addition needed.
