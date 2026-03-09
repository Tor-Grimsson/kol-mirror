# Agent Context

## Current State

### Active Work
- Code cleanup complete: dead code removed, MirrorVariant and useVariantToggle extracted
- Filter audit complete in README.md — documents all 9 filter types with current props and missing/desirable controls
- PixiKaleidoscopeVariant copied to src, pending wiring into Hall of Copies (blocked on control panel redesign)
- LLM_RULES.md needs updating — still references old kol-system project structure

### Recent Changes (2026-03-09)
- Deleted `hall-of-mirrors/` directory (~3,666 lines of pre-adaptation originals)
- Deleted unused `PixiKaleidoscopeVariant.jsx` from src, then restored from `docs/_torg/`
- Deleted empty `src/App.css`
- Extracted shared `MirrorVariant.jsx` component (from ApparatusHallOfMirrors, better version with baseFrequency reset)
- Extracted `useVariantToggle.js` hook (shared state + handlers for variant toggle/select/upload)
- Updated ApparatusHallOfMirrors.jsx and HallOfDisplacement.jsx to use shared component + hook
- Fixed CSS classes: `kol-display-lg` → `kol-heading-sm`, `kol-heading-s` → `kol-heading-sm`
- Wrote full filter audit in README.md

## Project Overview

**Hall of Mirrors** — Interactive image distortion playground. Part of the Kolkrabbi Apparat (apparatus/experiment) suite.

### Architecture
- 6 halls accessible from splash screen (App.jsx)
- Each hall contains variant grid + floating control panel
- Filters split between SVG displacement (CPU) and PixiJS WebGL (GPU)

### Halls
1. **Apparatus Hall of Mirrors** — All 12 variants (8 SVG + 4 Pixi)
2. **Hall of Displacement** — 8 SVG displacement variants only
3. **Hall of Copies** — 4 Pixi tiling variants + 5 empty slots (kaleidoscope pending)
4. **Hall of Movement** — 3 GSAP transform variants + 6 empty slots
5. **Hall of Symphony** — Mixer combining displacement + movement + copies on SVG letters
6. **Hall of Archive** — Placeholder (no functionality yet)

### Key Files
- `src/App.jsx` — Splash screen + hall routing
- `src/components/hall-of-mirrors/MirrorVariant.jsx` — Shared SVG displacement component
- `src/components/hall-of-mirrors/useVariantToggle.js` — Shared state hook
- `src/components/hall-of-mirrors/DistortionControlsPanel.jsx` — 3-slider panel (Scale, Freq, Octaves)
- `src/components/hall-of-mirrors/MovementControlsPanel.jsx` — Movement-specific panel (Duration, Amount, Easing)
- `src/components/hall-of-mirrors/SymphonyMixer.jsx` — Multi-channel mixer UI
- `src/components/hall-of-mirrors/Pixi*.jsx` — 5 PixiJS variant components + 1 image filter canvas
- `design-system/` — Kolkrabbi design system (typography, color, components)

### Tech Stack
- React 19 + Vite 7
- Tailwind CSS 4
- PixiJS 8 (WebGL rendering)
- GSAP 3 (SVG attribute animation, drag inertia)
- Yarn (NOT npm)

### Font Files
Located in `/public/fonts/jetbrains-mono/` — JetBrains Mono woff2 (400, 500, 500i, 600)

## Conventions

### Typography Classes
- `.kol-display-*` — Hero/section headings, weight 600
- `.kol-heading-*` — Content headings, weight 500
- `.kol-text-*` — Body copy, weight 400
- `.kol-helper-*` — Labels/metadata, weight 500
- Size scale: xl, lg, md, sm, xs, xxs, xxxs

### Code Style
- Prefer editing existing files over creating new ones
- Remove unused code completely (no backwards-compat hacks)
- Use clamp() for responsive typography
- Follow existing component patterns (ON/OFF toggle, SELECT/UNSELECT, UPLOAD, info hover)

### Known Issues
- **3-slider problem**: DistortionControlsPanel forces SVG-centric sliders on all filter types. PixiJS variants use ad-hoc math to derive their params. See README.md audit for details.
- HallOfSymphony copies channel is unwired
- HallOfArchive is entirely placeholder
- PixiKaleidoscopeVariant in src but not yet integrated (needs proper per-filter controls first)
- MovementVariant has no image upload (hardcoded image)
- Animation behavior inconsistent between Displacement hall (selected only) and Apparatus hall (all variants)
