# Control Modules (L1)

Signal layer 1 -- pure JS math, scalar output. Timing, modulation, gating, sequencing, visual style.

10 modules.

---

### Clock
`ClockModule.jsx` · 4HP · L1

> Master tempo source. Emits 30ms gate pulses at BPM rate plus a clock-divided output.

**Inputs:** none
**Outputs:** out (scalar), div (scalar)
**Controls:** BPM (20-300), DIV (1-16), enable toggle
**Process:** Phase accumulates at `bpm/60` per second. On phase wrap: fire 30ms gate on `out`, increment divider counter; when counter reaches DIV, fire 30ms gate on `div`.

---

### ClockDivider
`ClockDividerModule.jsx` · 4HP · L1

> Divides an incoming clock signal by N.

**Inputs:** in (scalar)
**Outputs:** out (scalar)
**Controls:** division selector (2, 4, 8, 16), enable toggle
**Process:** Rising-edge detection (in > 50). Counts edges; every N-th edge fires a 30ms gate pulse on `out`.

---

### LFO
`LFOModule.jsx` · 6HP · L1

> Waveshape oscillator with sync reset.

**Inputs:** sync (scalar)
**Outputs:** out (scalar)
**Controls:** shape (sin, saw, tri, sqr), rate (0-100), depth (0-100), offset (0-100), enable toggle
**Process:** Rate knob maps 0-100 to 0.1-20 Hz. Rising edge on sync resets phase to 0. Output = `waveFn(phase, shape) * depth + (100 - depth) * (offset / 100)`. Waveshapes: sin = `(sin(2pi*p)+1)/2`, saw = `p`, tri = tent, sqr = `p < 0.5 ? 1 : 0`.

---

### Envelope
`EnvelopeModule.jsx` · 6HP · L1

> ADSR envelope generator with gate/clock trigger and cycle mode.

**Inputs:** gate (scalar), clk (scalar)
**Outputs:** out (scalar)
**Controls:** A (0-100), D (0-100), S (0-100), R (0-100), cycle toggle, enable toggle
**Process:** Knobs 0-100 map to 0.005-2s (A/D/R) or 0-100 level (S). Gate rising edge starts Attack; gate falling edge starts Release. Clock rising edge retriggers Attack. Stages: IDLE -> ATTACK -> DECAY -> SUSTAIN -> RELEASE -> IDLE (or ATTACK if cycle=on). Release uses exponential decay toward 0.

---

### Sequencer
`SequencerModule.jsx` · 12HP · L1

> 32-step CV sequencer with per-step values, pagination, and gate output.

**Inputs:** clock (scalar), reset (scalar)
**Outputs:** out (scalar), gate (scalar)
**Controls:** step grid (drag vertical, 8 steps visible per page), page nav (4 pages), length (1-32), follow toggle, randomize toggle, enable toggle
**Process:** Clock rising edge advances step `(step+1) % length` and fires 30ms gate. Reset rising edge jumps to step 0. `out` = current step value (0-100). Steps initialized random. Follow auto-switches page to show active step.

---

### Constant
`ConstantModule.jsx` · 4HP · L1

> Fixed scalar value source. Test/utility.

**Inputs:** none
**Outputs:** value (scalar)
**Controls:** knob (0-100), enable toggle
**Process:** Output = knob value. No computation.

---

### Logic
`LogicModule.jsx` · 4HP · L1

> Boolean logic gates for control signals.

**Inputs:** a (scalar), b (scalar)
**Outputs:** out (scalar)
**Controls:** mode selector (and, or, xor, not, nand, nor), enable toggle
**Process:** Inputs thresholded at 50 (high/low). Apply selected boolean op. Output = 100 (true) or 0 (false). `not` uses input a only.

---

### Comparator
`ComparatorModule.jsx` · 4HP · L1

> Threshold comparator. Converts continuous signal to gate.

**Inputs:** in (scalar)
**Outputs:** out (scalar)
**Controls:** threshold (0-100), enable toggle
**Process:** `out = in > threshold ? 100 : 0`

---

### SampleHold
`SampleHoldModule.jsx` · 6HP · L1

> Sample & hold with slew limiter.

**Inputs:** in (scalar), trig (scalar)
**Outputs:** out (scalar)
**Controls:** slew (0-100), enable toggle
**Process:** On trig rising edge (>50), latch current value of `in`. Slew=0: output snaps to held value. Slew>0: output glides toward held value at rate `dt * (10 - slew/10)`.

---

### Pen
`PenModule.jsx` · 6HP · L1

> Visual style descriptor for drawn signals. Outputs a pen signal, not scalar.

**Inputs:** tk (scalar), ds (scalar), gp (scalar), op (scalar)
**Outputs:** out (pen)
**Controls:** thickness (0-100), dash (0-100), gap (0-100), opacity (0-100), cap selector (round, square, butt), enable toggle
**Process:** Each knob overridden by its CV input if patched. Thickness maps 0-100 to 0.5-10px. Dash/gap map 0-100 to 0-20px. Opacity passes through 0-100. Packs all into a `pen()` signal object.
