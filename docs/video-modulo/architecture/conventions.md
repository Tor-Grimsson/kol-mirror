# Conventions

## Project Boundaries

Video Modulo is a self-contained project. It does not import from `src/components/hall-of-mirrors/`, `src/hooks/`, or any other part of the Hall of Mirrors codebase.

If a component or utility from Hall of Mirrors is useful, copy it into `src/videomodulo/` and adapt it. No cross-project imports.

## Asset Locations

Everything lives under `src/videomodulo/`:

```
src/videomodulo/
  VideoModulo.jsx              — page component (routed at /videomodulo)
  patches.js                   — named patch presets (connection arrays)
  styles.css                   — theme imports
  hooks/
    signals.js                 — signal types: scalar, color, points (with edges)
    useModuleRegistry.jsx      — module registration context, useModule hook
    usePatchRouting.jsx         — patch cable connections, initialConnections, loadPatch
    useRenderLoop.js           — rAF loop, topological sort, frame timing
  icons/
    Icon.jsx                   — SVG icon loader
    svg/                       — wave-sin, wave-saw, wave-tri, wave-sqr
  modules/
    utility/                   — Case, Module, BlankPanel, PatchModule, JackSocket, PatchCableOverlay, eurorack.js
    controls/                  — Knob, ModuleHeader, Selector, Toggle, WaveSelect, Dropdown
    control/                   — Clock, ClockDivider, LFO, Envelope, Sequencer, Constant, Logic, Comparator, SampleHold (L1)
    math/                      — Mult, Attenuator, VCA, Switch, Quantizer, ScaleOffset, RingMod, Waveshaper, Delay, Reverb, Mixer, Maths (L2)
    generators/                — RGBOscillator, Waveform, Wireframe, Noise, Ramp, SMX3 (L3)
    display/                   — Monitor, Output, drawSignal.js (L4)
    effects/                   — future shader modules (L5)
  arc-case/                    — archived cases (01-03), not imported
```

## Rules

- **New modules** go in their category folder under `modules/`
- **New hooks** go in `hooks/`
- **UI primitives** (jack sockets, patch cables, knobs) go in `modules/utility/` — they belong to this project
- **Archived cases** in `arc-case/` are reference only, never imported by active code
- **No shared dependencies** between Video Modulo and Hall of Mirrors beyond design tokens (`src/styles/`)

## Documentation

```
docs/video-modulo/
  concept/                     — original vision docs
  architecture/                — this folder, working plan and phase docs
  components/                  — component-level documentation
  video-synth-research/        — research notes and references
```
