# Session: Video Modulo — Phase 1, 2, 3 Implementation

**Date:** 2026-04-02
**Agent:** Claude Code (Opus 4.6)
**Summary:** Built the core engine (render loop, module registry, patch routing, signals), control modules (Clock, LFO, Envelope, Sequencer), and generator modules (RGB Oscillator, Waveform, Wireframe). Established shared UI controls, icon system, and documentation structure.

## Changes Made

### Documentation
- `docs/video-modulo/concept/` — moved `base-architecture.md` and `video-synth-mixer-plan.md` here
- `docs/video-modulo/architecture/` — created README, conventions, and phase-1 through phase-7 docs with file trees
- `docs/video-modulo/video-synth-research/module-reference.md` — added table of contents
- `docs/video-modulo/video-synth-research/war-book.md` — added table of contents

### Phase 1: Foundation
- `src/videomodulo/hooks/signals.js` — signal type definitions (scalar, color, points, readScalar)
- `src/videomodulo/hooks/useModuleRegistry.jsx` — module registration context, useModule convenience hook
- `src/videomodulo/hooks/usePatchRouting.jsx` — port-based patch cable connections, drag-to-connect
- `src/videomodulo/hooks/useRenderLoop.js` — centralized RAF, Kahn's topological sort, 1-frame delay for cycles
- `src/videomodulo/modules/utility/JackSocket.jsx` — jack socket with signal-proportional glow (scalar, color, points)
- `src/videomodulo/modules/utility/PatchCableOverlay.jsx` — SVG catenary cables (orange wires, red jacks)
- `src/videomodulo/modules/utility/Module.jsx` — screw holes removed, default bg changed to bg-surface-secondary
- `src/videomodulo/modules/utility/Case.jsx` — added 2px gap between modules in rack rows

### Phase 2: Control Modules
- `src/videomodulo/modules/control/ConstantModule.jsx` — 4HP, one knob, scalar output
- `src/videomodulo/modules/control/ClockModule.jsx` — 4HP, BPM + division knobs, out + div outputs
- `src/videomodulo/modules/control/LFOModule.jsx` — 6HP, WaveSelect (2x2 icon grid), rate/depth/offset, sync input
- `src/videomodulo/modules/control/EnvelopeModule.jsx` — 6HP, ADSR knobs, gate + clk inputs, cycle toggle
- `src/videomodulo/modules/control/SequencerModule.jsx` — 8HP, 32 steps (4 pages of 8), pagination, randomize, gate + out outputs

### Phase 3: Generators
- `src/videomodulo/modules/generators/RGBOscillatorModule.jsx` — 6HP, vertical in→knob→out rows per channel, R/G/B scalar + color outputs
- `src/videomodulo/modules/generators/WaveformModule.jsx` — 6HP, WaveSelect, CV inputs for freq/amp/spd, clk input
- `src/videomodulo/modules/generators/WireframeModule.jsx` — 8HP, geometry selector, spd/scl/res/fov knobs with inputs, rotation inputs

### Phase 4: Display (partial)
- `src/videomodulo/modules/display/MonitorModule.jsx` — 12HP, pass-through (in→out per channel), ResizeObserver canvas

### Shared Controls
- `src/videomodulo/modules/controls/Knob.jsx` — extracted from ConstantModule, fixed 24px size
- `src/videomodulo/modules/controls/Selector.jsx` — eurorack < value > style
- `src/videomodulo/modules/controls/WaveSelect.jsx` — 2x2 icon button grid for wave shapes
- `src/videomodulo/modules/controls/ModuleHeader.jsx` — red on/off dot + left-aligned module name
- `src/videomodulo/modules/controls/Toggle.jsx` — red circle toggle, sm (8px) / md (12px), horizontal variant

### Icon System
- `src/videomodulo/icons/Icon.jsx` — SVG loader (glob import from ./svg/)
- `src/videomodulo/icons/svg/wave-sin.svg`
- `src/videomodulo/icons/svg/wave-saw.svg`
- `src/videomodulo/icons/svg/wave-tri.svg`
- `src/videomodulo/icons/svg/wave-sqr.svg`

### Page
- `src/videomodulo/VideoModulo.jsx` — providers, 3 rack rows (1U blank, 3U control+constants+monitor, 3U generators+monitor)

## Current State

### Working
- Centralized render loop with topological sort evaluates all modules per frame
- Drag-to-connect patch cables between any output→input
- Click connected input to disconnect
- Jack glow proportional to signal value (scalar, color, points)
- Clock pulses rhythmically, drives LFO sync, sequencer advance, envelope trigger
- LFO outputs animated waveforms (4 shapes via icon buttons)
- Envelope ADSR with cycle mode and clock input
- Sequencer 32 steps with pagination and randomize
- RGB oscillator outputs per-channel scalars + combined color
- Waveform generator outputs animated point arrays
- Wireframe generator outputs 3D→2D projected points
- Monitor displays scalar (bar), color (fill), points (dots) with pass-through outputs
- All modules have enable/disable via ModuleHeader red dot

### Known Issues
- Envelope cycle button + clk input positioning pushes attack knob off center (attempted absolute positioning, still not ideal)
- Monitor drawSignal for points renders dots not connected lines (wireframe looks like scattered dots)
- CV inputs on modules replace knob value entirely instead of modulating it
- No edge connectivity data in points signal (wireframe has vertices but no edges)
- Patch cable overlay coordinates may drift on scroll

## Next Steps
1. Fix envelope layout (cyc + clk positioning)
2. Build Constant as quad attenuator (4 channels)
3. Phase 4: Upgrade monitor with scope trace, proper wireframe rendering (connected lines)
4. Phase 5: Wire up reference patch, verify zero-conversion flow, performance baseline
5. Add Style/Pen module for controlling draw parameters (thickness, color, dash)
6. Add edge connectivity to points signal for wireframe rendering
