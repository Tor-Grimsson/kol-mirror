# Session: Code Cleanup & Filter Audit

**Date:** 2026-03-09
**Agent:** Claude Opus 4.6
**Summary:** Removed ~4,000 lines of dead/redundant code, extracted shared components, audited all filters for missing controls

## Changes Made

### Files Deleted
- `hall-of-mirrors/` — entire directory (18 files, pre-adaptation originals not imported by src)
- `src/components/hall-of-mirrors/PixiKaleidoscopeVariant.jsx` — then restored from `docs/_torg/` (distinct from PixiRadialVariant)
- `src/App.css` — empty, not imported

### Files Created
- `src/components/hall-of-mirrors/MirrorVariant.jsx` — extracted from ApparatusHallOfMirrors (better version: resets baseFrequency attr on animation stop, stores tween ref for clean disposal)
- `src/components/hall-of-mirrors/useVariantToggle.js` — extracted shared state (variantImages, animationsEnabled, scale, baseFrequency, numOctaves, variantEnabled, selectedVariant) and handlers (toggleEnabled, toggleSelect, imageUpload)

### Files Modified
- `src/components/hall-of-mirrors/ApparatusHallOfMirrors.jsx` — removed inline MirrorVariant (128 lines), removed state boilerplate (55 lines), imports shared component + hook, fixed `kol-display-lg` → `kol-heading-sm` and `kol-heading-s` → `kol-heading-sm`
- `src/components/hall-of-mirrors/HallOfDisplacement.jsx` — same extraction, gains baseFrequency reset on animation stop (was missing)
- `src/components/hall-of-mirrors/HallOfCopies.jsx` — added PixiKaleidoscopeVariant import and state key (integration incomplete, reverted pending control panel redesign)
- `README.md` — rewrote with full filter audit (9 filter types, current props, missing/desirable properties, cross-cutting issues)
- `docs/llm-context/AGENT-CONTEXT.md` — updated to reflect hall-of-mirrors project (was still describing kol-system styleguide)

## Current State

### Working
- `yarn build` passes clean
- All 6 halls accessible from splash screen
- MirrorVariant renders correctly in both Apparatus and Displacement halls
- ON/OFF, SELECT/UNSELECT toggles work
- Image upload works per-variant
- Animation toggle works with proper GSAP cleanup

### Known Issues
- PixiKaleidoscopeVariant in src but not wired into any hall (needs per-filter control panel)
- DistortionControlsPanel's 3 sliders don't map naturally to PixiJS filter params
- HallOfSymphony copies channel unwired
- HallOfArchive is placeholder only
- MovementVariant has no image upload

## Next Steps

1. Design per-filter control panel system (each filter declares its own param descriptors)
2. Wire PixiKaleidoscopeVariant into Hall of Copies with proper controls (segments, zoom, speed, offset, edgeRepeat)
3. Add missing filter properties identified in README.md audit (prioritize: turbulenceType toggle, channel selectors, glitch direction, kaleidoscope source offset)
4. Update LLM_RULES.md to reflect hall-of-mirrors project (currently describes kol-system)
