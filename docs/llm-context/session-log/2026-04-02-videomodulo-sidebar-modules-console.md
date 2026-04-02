# Session: Video Modulo — Sidebar, Presets, New Modules, Console

**Date:** 2026-04-02
**Agent:** Claude Code (Opus 4.6)
**Summary:** Built module management sidebar with tabs, rack state system, drag-to-move, preset system with module+connection definitions, LineGen/Transform/Console modules, Pen color+lofi, Delay rewrite for all signal types, Fader control.

## Changes Made

### Sidebar + Rack Management
- `src/videomodulo/ModuloSidebar.jsx` — 3-tab sidebar (Presets, Case, Modules). Lock/unlock footer on all tabs. Module catalog with 1U/3U labels. Parked modules list. Case row management.
- `src/videomodulo/hooks/useRackState.js` — Rack state: rows with HP-offset modules, parked modules, edit mode. Operations: add/remove/move/park/unpark modules, add/remove rows, loadPreset. Modules distributed by U height into matching rows.
- `src/videomodulo/moduleRegistry.js` — All 34 modules registered (type → component, hp, u, category, label).
- `src/videomodulo/VideoModulo.jsx` — Dynamic rendering from rack state. Sidebar always open. Drag-to-move with 5px threshold. Parked modules render at drop coordinates. Modules use absolute positioning within flex rows. `init` prop passed to modules for preset state.

### New Modules
- `src/videomodulo/modules/generators/LineGenModule.jsx` — 8HP 3U. 2D pattern generator: line, grid, circle, spiral, lissajous. CV inputs for freq/density/speed.
- `src/videomodulo/modules/math/TransformModule.jsx` — 12HP 3U. 2D/3D transform on points: translate XY, scale, rotate XYZ with perspective projection. 2x3 knob layout. All 6 controls have CV inputs.
- `src/videomodulo/modules/display/ConsoleModule.jsx` — 48HP 3U. 4-channel mixing console. Per-channel: fader (level), send 1/2 knobs, mute toggle. 2 send/return pairs with return level. Master section: built-in canvas, bg knob+CV, pen input, master level, output jack.
- `src/videomodulo/modules/controls/Fader.jsx` — Vertical slider control for channel strips. Drag-to-set, fill bar, thumb, value readout.

### Preset System
- `src/videomodulo/patches.js` — New format: `{ rows: [{height, modules: [{type, id, state}]}], connections: [...] }`. Each preset defines its own modules with initial knob values. 22+ presets including sonar, morph, trail-spin, full-chain, etc.
- Presets load both module layout AND connections via sidebar.
- Module `init` prop support added to: Clock, LFO, Envelope, LineGen, Delay, Transform, Pen.

### Pen Module Upgrades
- `lofi` knob — above 50 switches to chunky rendering (bars for scalars, dots for points)
- `color` input jack — accepts color signal, overrides default green/blue draw colors
- `src/videomodulo/hooks/signals.js` — PEN_DEFAULTS updated with lofi and color fields
- `src/videomodulo/modules/display/drawSignal.js` — penColor() function, lofi draw paths, all stroke colors respect pen color

### Delay Rewrite
- `src/videomodulo/modules/math/DelayModule.jsx` — Buffers full signal objects (scalar, color, points), not just numbers. 4 knobs with CV inputs: time, mix, copies (1-6 taps), feedback. Points signals merge multiple past frames as trailing echoes.

### Output Module
- BG CV input added — patch LFO to animate background brightness

### Other Fixes
- `src/videomodulo/modules/utility/Module.jsx` — `userSelect: none` prevents text selection
- `src/videomodulo/modules/utility/PatchCableOverlay.jsx` — Re-renders on connections change (fixes cables disappearing on preset load)
- Module disable audit: Monitor + Output fully disable when off
- 3U modules maintain aspect ratio in 1U rows (`alignItems: flex-start` on row flex)
- 1U modules respect matching row heights when added from sidebar
- Edit mode: 5px drag threshold prevents accidental moves on click
- Empty preset added for clearing rack

## Current State

### Working
- 34 modules across 6 categories
- Sidebar with preset loading, module catalog, case management
- Drag-to-move modules within rack (edit mode)
- Parked modules at drop coordinates (partially working)
- Preset system with per-module initial state
- LineGen 2D patterns → Delay (echo trails) → Transform (3D rotation) → Output
- Console module with 4 channels, sends/returns, built-in canvas
- Pen controls draw style including color and lofi mode

### Known Issues
- Modules still disappear sometimes when parked (removeModule state timing)
- Absolute positioning within flex rows — no HP-snap gaps yet
- Console module layout needs visual polish
- Preset knob values not applied when switching between presets (useState only reads init on mount)
- Many presets untested / produce random-looking output
- No save-current-state-as-preset yet

## Next Steps
1. Visual polish on Console module
2. Fix preset state application (reset module state on preset change)
3. Save current rack + connections as new preset
4. HP-grid snap positioning with gaps
5. Phase 6: Raster Bridge (WebGL/shaders)
6. Session log + documentation update
