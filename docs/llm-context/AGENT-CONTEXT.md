# Agent Context

## Current State

### Active Work
- Archive system: 9 slots for saving variant snapshots (variant + params + image)
- Symphony mixer loads from archive slots or hall presets via load icon dropdown
- Canvas aspect ratio control in both halls and symphony (16:9 through 9:16 + custom + full-bleed)
- Image fit modes: Contain, Fit Width, Fit Height, Manual (with scale slider)
- Vector color + background color pickers in symphony (react-colorful, rgba with opacity)
- SVG + image upload supported in both halls and symphony
- Symphony is default home view

### Recent Changes (2026-03-25)
- **Archive system**: 9-slot save/load, sidebar save dropdown, Memory view with previews
- **Symphony rework**: load icon shows archive slots + hall presets, load mode (effect only / effect + source), animate toggle in sidebar
- **Canvas controls**: aspect ratio dropdown, custom resolution via QuantityInput, image fit mode, vector/background color pickers
- **Canvas scaling**: ResizeObserver-based contain-fit preserving locked aspect ratio for both halls and symphony
- **SVG upload**: rasterized to PNG for Pixi compat, direct load to symphony canvas
- **Sidebar reorg**: Mixer → Halls → Library groups, Symphony as home
- **New atoms**: ColorPicker (react-colorful wrapper), QuantityInput (chevron up/down with keyboard edit)
- **Theme fixes**: btn-control hover uses bg-fg-08, mixer elements use text-fg-96

## Project Overview

**Hall of Mirrors** — Interactive image distortion playground. Part of the Kolkrabbi Apparat suite.

### Architecture
- Single-page app with sidebar + viewport layout (no router, state-driven)
- Sidebar groups: Mixer (Symphony) → Halls (Displacement, Movement, Copies) → Library (Memory)
- Per-variant controls render dynamically from descriptors
- Symphony has its own control panel: animate, load mode, canvas ratio, image fit, colors, mixer layout
- `useMirrorState` holds all shared state: navigation, params, archive, symphony settings, canvas controls

### Key Files
- `src/data/mirrorVariants.js` — Variant definitions with control descriptors
- `src/hooks/useMirrorState.js` — All shared state (navigation, params, archive, symphony, canvas)
- `src/components/mirror/VariantControls.jsx` — Data-driven control renderer
- `src/components/mirror/MirrorSidebar.jsx` — Navigation + controls + theme toggle + symphony controls
- `src/components/mirror/MirrorViewport.jsx` — Renders active variant with CanvasFrame for aspect ratio
- `src/components/mirror/SymphonyViewport.jsx` — Symphony canvas + mixer with ResizeObserver scaling
- `src/components/mirror/ArchiveViewport.jsx` — 9-slot memory grid with load/clear
- `src/components/hall-of-mirrors/SymphonyMixer.jsx` — 3-channel mixer with load icon + dropdown
- `src/components/atoms/ColorPicker.jsx` — react-colorful wrapper (rgba, direction-aware popover)
- `src/components/atoms/QuantityInput.jsx` — Compact numeric input with chevron up/down

### Known Issues
- Displacement animation loop: hardcoded 3s duration + sine.inOut ease (not yet controllable)
- Pixi continuous animations (Slice, Radial, Kaleidoscope) are linear — no easing options yet
- Image fit mode only affects displacement hall + symphony (Pixi variants handle own images internally)
- Old hall page components still exist (dead code)
- Symphony copies channel unwired
