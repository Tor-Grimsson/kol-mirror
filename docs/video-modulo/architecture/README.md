# Video Modulo — Architecture

Working plan for the modular video synthesizer. Each phase is a self-contained milestone.

## Conventions

- [conventions.md](conventions.md) — Asset locations, project boundaries, component ownership

## Phases

1. [Foundation](phase-1-foundation.md) — Render loop, signal format, module registration **✓ Complete**
2. [Control Modules](phase-2-control.md) — Clock, LFO, envelope, sequencer **✓ Complete**
3. [Generators](phase-3-generators.md) — RGB oscillator, waveform, 3D wireframe **✓ Complete**
4. [Display](phase-4-display.md) — Monitor upgrade, OutputModule, scope trace **✓ Complete**
5. [Patch & Play](phase-5-patch.md) — Reference patch, PatchModule, initial connections **✓ Complete**
6. [Raster Bridge](phase-6-raster.md) — WebGL render target, first shader effect
7. [Integration](phase-7-integration.md) — Channel/mixer system, image/video input

## Current Module Count: 30

### Control (9)
Clock, ClockDivider, LFO, Envelope, Sequencer, Constant, Logic, Comparator, SampleHold

### Math (12)
Mult, Attenuator, VCA, Switch, Quantizer, ScaleOffset, RingMod, Waveshaper, Delay, Reverb, Mixer, Maths

### Generators (5)
RGBOscillator, Waveform, Wireframe, Noise, Ramp, SMX3

### Display (2)
Monitor, Output

### Utility (1)
PatchModule

### Controls (6 shared UI components)
Knob, ModuleHeader, Selector, Toggle, WaveSelect, Dropdown

## Reference

- [Concept: Base Architecture](../concept/base-architecture.md) — Original vision, layered signal model
- [Concept: Mixer Plan](../concept/video-synth-mixer-plan.md) — Symphony mixer architecture (predecessor)
