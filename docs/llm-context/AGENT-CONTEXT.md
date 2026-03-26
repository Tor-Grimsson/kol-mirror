# Agent Context

## Current State

### Active Work
- Symphony mixer: live slot routing, dial as multiplier with overdrive, channel settings shelf with paginated controls and pinned Comp A/B tabs
- Kaleidoscope: Comp A/B tab system, grab-to-move wedge, fill/edge controls, background comp, edgeZoomScale slider
- Archive/Memory: 9 slots, save/load/edit workflow, thumbnails, [EDIT] from symphony to hall
- Canvas controls: aspect ratio, image fit, vector/background color pickers, raster theme toggle + [RECALC]
- Shared Pixi infrastructure: usePixiApp hook, VariantFrame component, useImageTiers hook
- Grab interaction: all 5 Pixi variants (kaleidoscope wedge, 4 TilingSprite variants with dashed rect outline)
- Unified raster quality: useImageTiers generates mid/high tiers for any image source, getRasterTier selects per variant/params, periodic re-evaluation during animation

### Known Issues
- **Feather keying**: Gradient donut renders but can't convert to transparency. Pixi alpha mask failed (r*a shader). Erase blend needs render groups.
- **Blend modes**: Don't work on Pixi containers without render groups (isRenderGroup broke rendering).
- **bgGrabSegment**: Control exists for kaleidoscope Comp B but grab interaction not wired in renderer yet.
- **PixiImageFilterCanvas**: Not migrated to shared infrastructure (different layout).
- Old hall page components still exist (dead code)

### Recent Changes (2026-03-26)
- **usePixiApp hook**: Shared Pixi lifecycle — init, ResizeObserver resize, texture loading, cleanup. Used by all 5 Pixi variants.
- **VariantFrame component**: Shared UI frame — title, toggles, canvas container, fallback image, info overlay, stats, upload. `interactive` prop for grab.
- **useImageTiers hook**: Generates tiered images (mid 3x, high 6x) from any source (static path, raster, SVG). Caches results. Used by both MirrorViewport and SymphonyViewport.
- **Params robustness**: `setVariantParam` starts from defaults (never sparse). `getVariantParams` merges stored over defaults. `getActiveTab` + `filterControlsByTab` shared helpers. `linkedDefaults` on control descriptors.
- **Raster tier system unified**: Both halls and symphony use `getRasterTier` + `useImageTiers`. No more `low` tier (minimum is `mid` 3x). 500ms interval re-evaluation during animation. [RECALC] button.
- **Grab interaction**: All 4 TilingSprite variants have `grab` toggle, `grabOutlineVisible`, `imageOffsetX/Y`, dashed rect outline, pointer drag. Outlines track animation drift.
- **Kaleidoscope controls**: Comp A/B now match (bgBlendMode added, bgExplode removed, bgGrabSegment added). `edgeZoomScale` slider replaces hardcoded 0.15 multiplier. `linkedDefaults` auto-resets on Edge dropdown change.
- **Glitch direction**: Changed from binary to select dropdown. Vertical mode creates vertical slices with aspect-ratio-scaled count.
- **Raster theme**: `symphonyRasterTheme` state detected on mount, overridable via sidebar toggle [LIGHT/DARK].
- **Slot params loading**: `setAllVariantParams` bulk-loads slot params into variantParams on channel load (fixes Effect Only mode).
- **SVG raster 4x**: All SVG rasterization spots use RASTER_SCALE = 4 (520x384 from 130x96 native).
- **Canvas custom prefill**: Switching to Custom ratio prefills with current ratio's pixel dimensions.
- **Favicon**: Updated to `/svg/favicon.svg`
- **Rabbit icon**: Animate toggle uses rabbit.svg (12px) instead of sine wave SVG

## Project Overview

**Hall of Mirrors** — Interactive image distortion playground. Part of the Kolkrabbi Apparat suite.

### Architecture
- Single-page app with sidebar + viewport (no router, state-driven)
- Sidebar: Mixer (Symphony) → Halls (Displacement, Movement, Copies) → Library (Memory, Presets)
- Controls render from descriptors with tab/divider support, `linkedDefaults` for auto-reset
- Symphony: dynamic channels via ChannelLayer, slot channels reference live data, settings shelf with pagination + pinned tabs
- Kaleidoscope: two-comp architecture (Comp A main + Comp B background), independent params/animation
- Shared Pixi infrastructure: `usePixiApp` hook (init/resize/cleanup), `VariantFrame` (UI wrapper), `useImageTiers` (quality tiers)
- Unified image pipeline: `getRasterTier` selects quality, `useImageTiers` generates mid/high versions, same logic in halls and symphony

### Key Files
- `src/data/mirrorVariants.js` — Variant definitions, intensityKeys, controls with tabs/dividers/linkedDefaults, `getRasterTier`, `getActiveTab`, `filterControlsByTab`
- `src/hooks/useMirrorState.js` — All state (navigation, params, archive, symphony channels, canvas, raster theme, recalc counter)
- `src/hooks/usePixiApp.js` — Shared Pixi Application lifecycle hook, `applyImageFit`, `drawDashedRect`
- `src/hooks/useImageTiers.js` — Tiered image generation and caching for any source type
- `src/components/hall-of-mirrors/VariantFrame.jsx` — Shared variant UI frame with `interactive` prop
- `src/components/mirror/ChannelLayer.jsx` — Routes channel to renderer, multiplier-based intensity, passes imageFitMode
- `src/components/mirror/VariantControls.jsx` — Control renderer (toggle, slider, binary, select, tabs, divider), rowHeight prop, linkedDefaults support
- `src/components/mirror/MirrorSidebar.jsx` — Navigation + controls + symphony controls + reset + raster toggle + [RECALC]
- `src/components/mirror/SymphonyViewport.jsx` — Symphony canvas + mixer, live slot resolution, tiered rasters, interval re-evaluation
- `src/components/mirror/MirrorViewport.jsx` — Hall viewports with tiered image quality for Copies
- `src/components/mirror/ArchiveViewport.jsx` — Memory grid with thumbnails
- `src/components/hall-of-mirrors/SymphonyMixer.jsx` — Dynamic channel mixer UI with [EDIT], settings shelf with pagination + pinned tabs
- `src/components/hall-of-mirrors/PixiKaleidoscopeVariant.jsx` — Kaleidoscope with Comp A/B, fill, edge, grab, edgeZoomScale
- `src/components/hall-of-mirrors/PixiSliceVariant.jsx` — Slices with grab, direction, imageFitMode
- `src/components/hall-of-mirrors/PixiGlitchSliceVariant.jsx` — Glitch with grab, direction (H/V), seam-free centering
- `src/components/hall-of-mirrors/PixiMorphVariant.jsx` — Morph with grab, waveform animation
- `src/components/hall-of-mirrors/PixiRadialVariant.jsx` — Radial with grab, orbit-tracking outline
- `src/components/hall-of-mirrors/RotaryDial.jsx` — Pointer-based drag dial
