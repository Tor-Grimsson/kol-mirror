# Session: Video Modulo — Architecture Rethink & Project Reorganization

**Date:** 2026-04-01
**Agent:** Claude Code (Opus 4.6)
**Summary:** Fundamental rethink of video synth signal architecture (math-first, no shaders at base), full project reorganization (self-contained cases, SPA routing, eurorack-spec case component).

## Changes Made

### Architecture Decision
- Identified core problem: session 11 modules used multiple rendering backends (Canvas2D, Three.js, Pixi.js) communicating via scalar bus — wrong abstraction for video synthesis
- New layered signal model:
  - L1: Signal generation (JS numbers) — clock, LFO, envelope, sequencer
  - L2: Connectivity (JS math) — VCA, mixer, mult, logic
  - L3: Generators (math → vector data) — RGB oscillator, waveform, 3D wireframe projection
  - L4: Display (Canvas2D vector drawing) — monitor
  - L5: Raster effects (future, shaders enter here) — dither, blur, key, feedback
- Key insight: signal path is pure math, pixels only matter at display stage. 3D wireframe is also just math + projection, no GPU needed at base level.
- Documented in `docs/video-modulo/base-architecture.md`

### Project Reorganization
- Moved `docs/video-synth-research/` and `docs/video-synth-mixer-plan.md` into `docs/video-modulo/`
- Archived session 11 cases into `src/videomodulo/arc-case/case-01/`, `case-02/`, `case-03/` (self-contained with own modules, hooks)
- Rewrote all internal imports in archived cases to be self-contained
- Removed Vite MPA setup (multiple HTML entry points) — single `index.html` at root
- Added `react-router-dom` for SPA routing
- Moved `MirrorPlayground.jsx` to `src/pages/`
- Moved `VideoModuloIndex.jsx` to `src/pages/`
- Created `src/videomodulo/VideoModulo.jsx` — page component for active work
- Cleaned up orphaned files from `src/videomodulo/` root

### URL Structure
- `/` — MirrorPlayground (main app)
- `/index` — Archive case list
- `/index/case-01` through `case-03` — archived cases
- `/videomodulo` — active work (VideoModulo.jsx)

### Active Module Structure
```
src/videomodulo/
  arc-case/           — archived cases 01-03
  hooks/              — empty, ready
  modules/
    utility/          — Case.jsx, Module.jsx, BlankPanel.jsx, eurorack.js
    control/          — empty, ready
    math/             — empty, ready
    generators/       — empty, ready
    effects/          — empty, ready
  styles.css          — imports theme
  VideoModulo.jsx     — page component
```

### Eurorack Case Component
- `Case.jsx` — rack enclosure with side panels, rows area
- `RackRow` — row with rails behind modules, aspect-ratio based (1U = 12:1, 3U = 4:1)
- `Rail` — 104 threaded holes, metallic strip, sits behind modules (z-index layering)
- `Module.jsx` — front panel wrapper with screw holes, safe content area (py-3 dead zone for rails)
- `BlankPanel.jsx` — empty module (wraps Module with no children)
- `eurorack.js` — shared constants (TOTAL_HP, MIN_HP, ASPECT ratios, RAIL_HEIGHT, MODULE_PADDING, hpToPercent)
- Dimensions from actual eurorack spec (midisoft.de reference)
- Side panels use `bg-opacity-hex-12`, panels use `bg-opacity-hex-64`
- 2px gap between rows, 2px padding from side panels

### Design System
- Added `--kol-opacity-hex-*` and `--kol-opacity-hex-inverse-*` variable scales to `kol-color-simple.css` (light, dark, prefers-color-scheme)
- Added `.bg-opacity-hex-*` and `.border-opacity-hex-*` utility classes (01 through 96)
- Copied from `a_torg/design-system/color/full/kol-color.css` source of truth

### Files Created
- `docs/video-modulo/base-architecture.md`
- `src/videomodulo/VideoModulo.jsx`
- `src/videomodulo/modules/utility/Case.jsx`
- `src/videomodulo/modules/utility/Module.jsx`
- `src/videomodulo/modules/utility/BlankPanel.jsx`
- `src/videomodulo/modules/utility/eurorack.js`
- `src/videomodulo/styles.css`
- `src/pages/VideoModuloIndex.jsx`

### Files Modified
- `src/App.jsx` — SPA routing with react-router-dom
- `src/pages/MirrorPlayground.jsx` — moved from components/mirror/, updated imports
- `src/styles/kol-color-simple.css` — added opacity-hex scales and utility classes
- `vite.config.js` — removed MPA config, simplified
- `package.json` — added react-router-dom

## Current State

### Working
- SPA routing: `/`, `/index`, `/index/case-01-03`, `/videomodulo`
- Eurorack case renders with correct 1U/3U aspect ratios
- Rails with 104 threaded holes, proper z-index layering (behind modules)
- Blank panels with screw holes sitting on top of rails
- Side panels with system color tokens
- Archived cases loadable at `/index/case-*`

### Known Issues
- Archived cases may have broken deep imports (hooks referencing external files like useMirrorState → mirrorVariants)
- `src/videomodulo/styles.css` not yet imported anywhere
- Drag-to-reposition modules not yet implemented (discussed, deferred)
- `SIDE_COLOR` and `FRAME_COLOR` gradient constants in Case.jsx are unused (rails use FRAME_COLOR, sides use className)

## Next Steps
1. Build first modules for case-04: clock, LFO, envelope (control path — pure JS math)
2. Build RGB generator (L3 — vector output)
3. Build monitor module (L4 — Canvas2D display)
4. Wire up a reference patch to verify zero-conversion signal flow
5. Implement drag-to-reposition in rack rows (HP grid snap, no overlap)
