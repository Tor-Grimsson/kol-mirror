# Video Synthesis — Modulation Operators

Reference: LZX Videomancer's 39 modulation operator types, organized into 7 categories.

Source: [LZX Videomancer Modulation Guide](https://docs.lzxindustries.net/docs/instruments/videomancer/modulation-operators)

## Categories

### 1. Oscillators (5 types)
Generate periodic waveforms for rhythmic motion.

| Type | Description |
|------|-------------|
| Free LFO | Ramp, saw, tri, square, sine, log, exp, parabola. Controllable rate. |
| Sync LFO | Tempo-synced to musical divisions (32/1 through 1/16) |
| Motion LFO | Phase-locked to transport for exact sync |
| Pulse Width | Variable duty-cycle oscillator for rhythmic gating |
| Wavefolder | Harmonic-rich distorted sine, 0-8 fold count |

### 2. External Input (3 types)
Process analog signals as modulation sources.

| Type | Description |
|------|-------------|
| CV Input | Control voltage with optional smoothing |
| Audio Input | Raw audio without filtering, supports per-line rendering |
| Ring Mod | Multiplies two inputs (A × B) |

### 3. Envelopes & Followers (7 types)
Track and respond to signal dynamics.

| Type | Description |
|------|-------------|
| Envelope | Peak detector with attack/release |
| Sample & Hold | Captures input at clock intervals → staircase |
| Trigger Env | MIDI-triggered A/R with 3 curve shapes |
| FFT Band | Frequency analysis into 8 octave bands |
| Comparator | Binary threshold gating, per-line rendering |
| Slew Limiter | Rate-limited follower, asymmetric rise/fall |
| Peak Hold | Captures peaks with configurable decay |

### 4. Random & Chaos (5 types)
Non-repeating pattern generation.

| Type | Description |
|------|-------------|
| Random | Slewed jumps between random targets |
| Drift | Brownian random walk with centering |
| Perlin Noise | Smooth coherent noise, multi-octave |
| Turing Machine | 8-bit shift register with mutation |
| Logistic Map | Mathematical chaos, order-to-chaos spectrum |
| Cellular | Elementary automaton rules (30, 90, 110, 150) |

### 5. Sequencing & Rhythm (5 types)
Structured repeating patterns.

| Type | Description |
|------|-------------|
| Step Seq | 8-step with preset patterns |
| Euclidean Rhythm | N pulses distributed evenly across 16 steps |
| Clock Div | Integer division ÷1 to ÷16 with duty-cycle |
| Prob Gate | Probabilistic gating with density/length |

### 6. Spatial (2 types)
Per-line modulation varying across frame height.

| Type | Description |
|------|-------------|
| H Displace | Waveform across frame height with scrolling phase |
| V Gradient | Static spatial waveform pattern |

### 7. Physics (2 types)
Natural motion simulation.

| Type | Description |
|------|-------------|
| Bouncing Ball | Gravity with configurable elasticity |
| Pendulum | Damped harmonic oscillation |

## Linear vs Boolean Modes

- **Linear**: Continuous values across full range (knobs, faders)
- **Boolean**: Binary output where midpoint is threshold (switches, gates)

## Per-Line Rendering

8 operators support scanline-by-scanline variation. This maps modulation SPATIALLY across the image (top to bottom) rather than temporally (over time). This is unique to video synthesis — in audio, modulation only varies over time.
