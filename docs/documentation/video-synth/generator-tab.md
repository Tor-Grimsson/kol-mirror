# Generator Tab — Video Synth Modules

## Overview

The Generator tab adds modular video synthesizer modules to the Symphony mixer. Generators create signals — either visual patterns (video oscillators) or control values (LFOs, sequencers, logic gates) — that drive parameters across the entire system.

```
┌─────────────────────────────────────────────────────────┐
│  GENERATOR TAB (horizontal scroll)                       │
│                                                          │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐│
│  │LFO 1 │ │LFO 2 │ │SEQ 1 │ │GATE 1│ │OSC 1 │ │OSC 2 ││
│  │      │ │      │ │      │ │      │ │      │ │      ││
│  │wave  │ │wave  │ │8 bars│ │A∧B   │ │canvas│ │canvas││
│  │knobs │ │knobs │ │rate  │ │thresh│ │shader│ │shader││
│  └──┬───┘ └──┬───┘ └──┬───┘ └──┬───┘ └──┬───┘ └──┬───┘│
│     │        │        │        │        │        │     │
│     └────────┴────────┴────────┴────────┴────────┘     │
│                        │                                │
│                   SIGNAL BUS                            │
│              (shared mutable ref)                       │
│                        │                                │
│     Available as variables in ANY expression:           │
│     lfo1, lfo2, seq1, gate1                            │
│                                                          │
│     Video oscillators routable via frame buffer:        │
│     routeFrom: 'osc:0' / 'osc:1'                      │
└─────────────────────────────────────────────────────────┘
```

---

## Signal Bus

The signal bus is the connective tissue. Generator modules write scalar values (0-100) to it every frame. The expression engine reads them as variables.

**Implementation:** `useSignalBus` hook — a shared `useRef` object. No React state, no re-renders.

```js
busRef.current = { lfo1: 73, lfo2: 12, seq1: 80, gate1: 100 }
```

**Usage in expressions:** Any knob in the mixer accepts expressions. Type `lfo1` and the knob tracks LFO 1's output. Type `wave(t*lfo1/100)` for LFO-modulated sine. The expression engine's HELPERS string includes:
```js
var lfo1=bus.lfo1||0, lfo2=bus.lfo2||0, seq1=bus.seq1||0, gate1=bus.gate1||0;
```

---

## Modules

### LFO Modulator (2x)

Low-frequency oscillator. Outputs a continuously varying control signal.

| Control | Type | Range | Description |
|---------|------|-------|-------------|
| Waveform | Dropdown | sine/saw/tri/pulse/rand/bell/exp/step | Shape of oscillation |
| Rate | RotaryDial | 0.1-20 Hz | Speed |
| Depth | RotaryDial | 0-100 | Output range |
| Offset | RotaryDial | 0-100 | Center point |
| Enable | Dot toggle | on/off | Active state |

**Internal:** Builds an expression string from knob values (e.g. `wave(t*2)*0.8+10`), evaluates via `compile()` each frame, publishes to `busRef.current.lfo1`.

**Output:** `lfo1` / `lfo2` — scalar 0-100, updated every frame.

### 8-Step Sequencer

Steps through 8 user-set values at a clock rate.

| Control | Type | Range | Description |
|---------|------|-------|-------------|
| Steps (8x) | VerticalFader | 0-100 each | Value per step |
| Rate | RotaryDial | 0.1-20 Hz | Clock speed |
| Direction | Dropdown | fwd/rev/pingpong/random | Step order |
| Enable | Dot toggle | on/off | Active state |

**Internal:** `setInterval` at rate-derived interval. Advances step index, reads value from array, publishes to bus.

**Output:** `seq1` — scalar 0-100, changes discretely at clock rate.

### Logic Gate

Combines two control signals with boolean logic.

| Control | Type | Range | Description |
|---------|------|-------|-------------|
| Gate type | Dropdown | AND/OR/XOR/NOT | Boolean operation |
| Input A | Dropdown | lfo1/lfo2/seq1 | First signal source |
| Input B | Dropdown | lfo1/lfo2/seq1 | Second source (disabled for NOT) |
| Threshold A | RotaryDial | 0-100 | Comparator level |
| Threshold B | RotaryDial | 0-100 | Comparator level |
| Enable | Dot toggle | on/off | Active state |

**Internal:** RAF loop reads inputs from bus, applies threshold comparison, then gate logic. AND = both above threshold, OR = either, XOR = exactly one, NOT = invert A.

**Output:** `gate1` — 0 or 100 (binary).

### Video Oscillator (2x)

Generates visual patterns from GLSL shaders. Renders to a PixiJS canvas.

| Control | Type | Range | Description |
|---------|------|-------|-------------|
| Waveform | Dropdown | sine/stripes/circles/lissajous/noise | Pattern type |
| Frequency | RotaryDial | 1-200 | Spatial frequency |
| Speed | RotaryDial | 0-10 | Animation speed |
| Rotation | RotaryDial | 0-360 | Pattern angle |
| Color Mode | Dropdown | mono/rainbow/custom | Output coloring |
| Enable | Dot toggle | on/off | Active state |

**Internal:** Custom GLSL fragment shader applied as PixiJS `Filter` on a fullscreen sprite. Shader uniforms updated each frame via ticker.

**Output:** Canvas registered with frame buffer as `osc:0` / `osc:1`. Channels can route from oscillators via `routeFrom: 'osc:0'`.

### Mixer/Blend (future)

Crossfade between two video signals with blend modes. This is the bus compositing pipeline — implemented when bus rendering is built.

---

## State

Generator state in `useMirrorState`:

```js
generatorState: {
  lfo1: { waveform: 'sine', rate: 1, depth: 100, offset: 0, enabled: true },
  lfo2: { waveform: 'sine', rate: 0.5, depth: 100, offset: 0, enabled: false },
  seq1: { steps: [100,75,50,25,0,25,50,75], rate: 2, direction: 'forward', enabled: false },
  gate1: { type: 'AND', thresholdA: 50, thresholdB: 50, inputA: 'lfo1', inputB: 'lfo2', enabled: false },
  osc1: { waveform: 'sine', frequency: 4, speed: 1, rotation: 0, colorMode: 'mono', enabled: false },
  osc2: { waveform: 'stripes', frequency: 8, speed: 0.5, rotation: 45, colorMode: 'mono', enabled: false },
}
```

---

## Files

| File | Description |
|------|-------------|
| `src/hooks/useSignalBus.js` | Shared mutable ref for inter-module signals |
| `src/components/hall-of-mirrors/generators/GeneratorTab.jsx` | Tab container, horizontal scroll layout |
| `src/components/hall-of-mirrors/generators/LFOModule.jsx` | LFO UI + RAF evaluation loop |
| `src/components/hall-of-mirrors/generators/SequencerModule.jsx` | 8-step sequencer UI + clock |
| `src/components/hall-of-mirrors/generators/LogicGateModule.jsx` | Gate logic UI + RAF evaluation |
| `src/components/hall-of-mirrors/generators/OscillatorModule.jsx` | Video oscillator with Pixi + GLSL |
| `src/components/hall-of-mirrors/generators/oscillatorShader.js` | GLSL fragment shader source |

---

## Build Order

1. Signal bus (`useSignalBus`) + expression engine extension
2. Generator tab shell + LFO modules (immediately testable)
3. Step sequencer
4. Logic gate
5. Video oscillators (requires GLSL shader)
6. Mixer/blend (future, requires bus compositing)
