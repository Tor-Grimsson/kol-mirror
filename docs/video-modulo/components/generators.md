# Generator Modules (L3)

Signal layer 3 — convert scalar control signals into vector data. Color, waveforms, geometry, sweeps, color mixing.

6 modules.

---

### RGBOscillatorModule
`RGBOscillatorModule.jsx` · 6HP

> Three independent sine oscillators producing per-channel scalar outputs and a combined color vector.

**Inputs:** `r`, `g`, `b` (scalar) — override respective oscillator with external CV (0-100 mapped to 0.0-1.0)
**Outputs:** `r`, `g`, `b` (scalar), `out` (color)
**Controls:** R / G / B rate knobs (0-100, maps to 0.1-10 Hz)
**Notes:** When an input is patched, the corresponding oscillator is bypassed and the CV value is used directly. Unpatched channels free-run as sine LFOs.

---

### WaveformModule
`WaveformModule.jsx` · 6HP

> Math function generator outputting a 64-point polyline. Four waveshapes, CV-modulatable frequency/amplitude/speed.

**Inputs:** `freq` (scalar), `amp` (scalar), `spd` (scalar), `clk` (scalar)
**Outputs:** `out` (points)
**Controls:** WaveSelect (sin/saw/tri/sqr), frq knob, amp knob, spd knob
**Shapes:** sin, saw, tri, sqr
**Resolution:** 64 points fixed
**Notes:**
- `clk` resets phase on rising edge (threshold > 50).
- CV inputs replace knob value entirely (not additive).
- freq maps 0-100 to 0.5-10 Hz. speed maps 0-100 to 0-2x rate.

---

### WireframeModule
`WireframeModule.jsx` · 8HP

> Parametric 3D geometry projected to 2D points with edge connectivity. Four built-in shapes, CV rotation and perspective.

**Inputs:** `rx`, `ry`, `rz` (scalar) — rotation axes, `scale` (scalar), `fov` (scalar), `clk` (scalar)
**Outputs:** `out` (points with edges)
**Controls:** shape selector (cube/tetra/octa/sphere), spd knob, scl knob, res knob, fov knob
**Shapes:**
- cube: 8 vertices, 12 edges
- tetra: 4 vertices, 6 edges
- octa: 6 vertices, 12 edges
- sphere: fibonacci-distributed points (8-64 based on res knob), sequential edges
**Notes:**
- `clk` resets rotation to origin on rising edge.
- Unpatched rx/ry/rz free-run at speed knob rate (y=1x, x=0.7x, z=0.3x).
- Patched CV maps 0-100 to 0-2pi.
- fov maps 0-100 to 1-6 (perspective depth).
- Output includes `edges` array for wireframe rendering in drawSignal.

---

### NoiseModule
`NoiseModule.jsx` · 4HP

> Random scalar generator with three noise types.

**Inputs:** none
**Outputs:** `out` (scalar, 0-100)
**Controls:** type selector (wht/pnk/s&h)
**Types:**
- `wht` — white noise, new random value every frame
- `pnk` — pink noise, low-pass filtered (0.9 * prev + 0.1 * random)
- `s&h` — sample & hold, new random value every 0.1s, held between samples

---

### RampModule
`RampModule.jsx` · 6HP

> Ramp/triangle LFO with sync input. Outputs scalar 0-100.

**Inputs:** `sync` (scalar) — resets phase on rising edge (threshold > 50)
**Outputs:** `out` (scalar, 0-100)
**Controls:** shape selector (up/down/tri), rate knob
**Shapes:**
- `up` — linear ramp 0-100
- `down` — inverted ramp 100-0
- `tri` — triangle 0-100-0
**Notes:** rate knob maps 0-100 to 0.1-10 Hz.

---

### SMX3Module
`SMX3Module.jsx` · 12HP

> 3x3 bipolar signal matrix mixer. Three scalar inputs mixed through 9 gain knobs to produce RGB scalar outputs and a combined color vector.

**Inputs:** `a`, `b`, `c` (scalar)
**Outputs:** `r`, `g`, `b` (scalar), `out` (color)
**Controls:** 9 knobs in 3x3 grid — rows are output channels (R/G/B), columns are input channels (a/b/c)
**Knob mapping:** bipolar — 0 = -1, 50 = 0 (center/off), 100 = +1
**Formula:** `R = clamp(a*Ra + b*Rb + c*Rc)`, same for G and B
**Notes:** Output clamped to 0-100. Color output divides by 100 to get 0.0-1.0 RGB.
