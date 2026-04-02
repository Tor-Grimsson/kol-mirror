# Math Modules (L2)

Signal layer 2 -- connectivity and signal processing. Routing, scaling, mixing, shaping, time effects.

12 modules.

---

### Mult
`MultModule.jsx` · 4HP · L2

> Passive 1:4 signal splitter. Copies input to four identical outputs.

**Inputs:** in (scalar)
**Outputs:** a (scalar), b (scalar), c (scalar), d (scalar)
**Controls:** none
**Process:** `a = b = c = d = in`

---

### Attenuator
`AttenuatorModule.jsx` · 4HP · L2

> Scale a signal by a fixed percentage.

**Inputs:** in (scalar)
**Outputs:** out (scalar)
**Controls:** lvl (0-100, default 100)
**Process:** `out = in * (lvl / 100)`

---

### VCA
`VCAModule.jsx` · 4HP · L2

> Voltage-controlled amplifier. CV input modulates signal level.

**Inputs:** in (scalar), cv (scalar)
**Outputs:** out (scalar)
**Controls:** none
**Process:** `out = in * (cv / 100)`

---

### Switch
`SwitchModule.jsx` · 4HP · L2

> CV-controlled A/B signal selector. Passes any signal type.

**Inputs:** a (any), b (any), cv (scalar)
**Outputs:** out (any)
**Controls:** none
**Process:** `out = cv > 50 ? b : a`

---

### Quantizer
`QuantizerModule.jsx` · 4HP · L2

> Snap continuous signal to discrete steps.

**Inputs:** in (scalar)
**Outputs:** out (scalar)
**Controls:** steps (2-16, default 8)
**Process:** `step = 100 / steps; out = round(in / step) * step`

---

### Scale+Offset
`ScaleOffsetModule.jsx` · 4HP · L2

> Multiply then offset a signal.

**Inputs:** in (scalar)
**Outputs:** out (scalar)
**Controls:** scl (0-200, default 100), ofs (0-100, default 50)
**Process:** `out = in * (scl / 100) + ofs - 50`

---

### Ring Mod
`RingModModule.jsx` · 6HP · L2

> Ring modulator. Multiplies two signals with dry/wet depth control.

**Inputs:** a (scalar), b (scalar)
**Outputs:** out (scalar)
**Controls:** depth (0-100, default 100)
**Process:** `wet = a * b / 100; out = a * (1 - d) + wet * d`

---

### Waveshaper
`WaveshaperModule.jsx` · 6HP · L2

> Nonlinear waveshaping with selectable transfer function.

**Inputs:** in (scalar)
**Outputs:** out (scalar)
**Controls:** mode (clip | fold | wrap | sine), drive (0-100, default 50)
**Process:** Normalize to -1..1, apply `drive * (1 + drive/10)`, shape per mode, map back to 0-100. Clip clamps, fold reflects at boundaries (4 iterations), wrap modulo-wraps, sine applies `sin(x * pi)`.

---

### Delay
`DelayModule.jsx` · 6HP · L2

> Frame-based delay line with feedback.

**Inputs:** in (scalar)
**Outputs:** out (scalar)
**Controls:** time (0-100, default 50), fb (0-100, default 30)
**Process:** 256-sample ring buffer. Time maps 0-100 to 1-256 frames. `buf[write] = in + delayed * fb; out = delayed`

---

### Reverb
`ReverbModule.jsx` · 6HP · L2

> Multi-tap delay reverb. Fixed 50/50 dry/wet mix.

**Inputs:** in (scalar)
**Outputs:** out (scalar)
**Controls:** size (0-100, default 50), decay (0-100, default 50)
**Process:** 256-sample buffer, 4 taps at prime intervals (23, 37, 53, 71) scaled by size. Each tap weighted by `decay^i`. `out = in * 0.5 + wet * 0.5`

---

### Mixer
`MixerModule.jsx` · 8HP · L2

> 4-channel signal mixer with per-channel level.

**Inputs:** a (scalar), b (scalar), c (scalar), d (scalar)
**Outputs:** out (scalar)
**Controls:** a (0-100, default 100), b (0-100, default 100), c (0-100, default 100), d (0-100, default 100)
**Process:** `out = a*la + b*lb + c*lc + d*ld` (each level / 100)

---

### Maths
`MathsModule.jsx` · 8HP · L2

> Dual-function math operator with slew limiter and end-of-cycle gate.

**Inputs:** a (scalar), b (scalar), trig (scalar)
**Outputs:** out (scalar), eoc (scalar)
**Controls:** mode (add | sub | min | max | avg), rise (0-100, default 50), fall (0-100, default 50)
**Process:** Target = `mode(a, b)`. Slew toward target at rise/fall rates (0.001-1.0 mapped from knob). Trig rising edge resets current to 0. EOC fires 100 for 30ms when target is reached. Add clamps at 100, sub clamps at 0.
