# Session: VariantFrame Refactor, Raster Tiers, Grab Interaction

**Date:** 2026-03-26
**Agent:** Claude Code (Opus 4.6)
**Summary:** Major refactor of Pixi variants to shared infrastructure, unified raster quality system, grab interaction for all Copies variants, params robustness fixes.

## Changes Made

### Files Created
- `src/hooks/usePixiApp.js` — Shared Pixi Application lifecycle hook (init, resize via ResizeObserver, texture loading, cleanup). Exports `applyImageFit` and `drawDashedRect` helpers.
- `src/hooks/useImageTiers.js` — Generates tiered image versions (mid 3x, high 6x) from any source (static path, raster data URL, SVG data URL). Caches results.
- `src/components/hall-of-mirrors/VariantFrame.jsx` — Shared UI frame for all variants (title, ON/OFF + SELECT toggles, canvas container with aspect ratio, fallback image, info overlay, stats, upload). `interactive` prop for grab-enabled variants.

### Files Modified
- `src/data/mirrorVariants.js` — Params robustness: `getDefaultParams` filters keyless controls, `getActiveTab` + `filterControlsByTab` helpers, `linkedDefaults` on Edge controls for Edge Zoom auto-reset. Raster tiers: removed `low` (1x), only `mid`/`high`. Smarter `getRasterTier` for all variants (factors in wrapMode, imageFitMode, variant-specific density). Added `grab` toggle + `grabOutlineVisible` to all 4 TilingSprite variant controls. Added `bgBlendMode`, `bgGrabSegment`, `edgeZoomScale`/`bgEdgeZoomScale` to Kaleidoscope controls. Removed `bgExplode`. Changed Glitch direction from binary to select.
- `src/hooks/useMirrorState.js` — `setVariantParam` always starts from defaults (never sparse). `getVariantParams` merges stored over defaults (forward-compatible). Added `setAllVariantParams` for bulk param loading. Added `symphonyRasterTheme` (detected on mount, overridable). Added `rasterRecalcCounter` for manual recalc trigger.
- `src/components/mirror/VariantControls.jsx` — Uses `getActiveTab` for robust tab filtering. `linkedDefaults` support on select controls. Rabbit icon for animate toggle.
- `src/components/hall-of-mirrors/SymphonyMixer.jsx` — Shelf pagination uses `filterControlsByTab` helper.
- `src/components/mirror/SymphonyViewport.jsx` — Uses `useImageTiers` for all image sources (replaces manual SVG rasterization). Per-channel tier selection via `getRasterTier`. 500ms interval re-evaluation during animation. Slot params loaded via `setAllVariantParams` on channel load. Raster theme from state (not DOM read).
- `src/components/mirror/MirrorViewport.jsx` — CopiesViewport uses `useImageTiers` + `getRasterTier` for tiered image quality (same logic as symphony).
- `src/components/mirror/ChannelLayer.jsx` — Passes `imageFitMode` to Pixi variants.
- `src/components/mirror/MirrorSidebar.jsx` — Raster theme toggle [LIGHT/DARK], [RECALC] button, canvas custom prefills current ratio dimensions.
- `src/components/hall-of-mirrors/PixiSliceVariant.jsx` — Migrated to usePixiApp + VariantFrame. Grab interaction with dashed rect outline, imageOffsetX/Y, animation drift tracking.
- `src/components/hall-of-mirrors/PixiGlitchSliceVariant.jsx` — Migrated to usePixiApp + VariantFrame. Direction wired (horizontal/vertical with aspect-ratio-scaled slice count). Grab interaction. Image centering with seam-free tiling.
- `src/components/hall-of-mirrors/PixiMorphVariant.jsx` — Migrated to usePixiApp + VariantFrame. Grab interaction with ticker-tracked outline.
- `src/components/hall-of-mirrors/PixiRadialVariant.jsx` — Migrated to usePixiApp + VariantFrame. Grab interaction with orbit-tracking outline.
- `src/components/hall-of-mirrors/PixiKaleidoscopeVariant.jsx` — Migrated to usePixiApp + VariantFrame. Removed bgExplode, added bgBlendMode, edgeZoomScale (replaces hardcoded 0.15).
- `index.html` — Favicon updated to `/svg/favicon.svg`
- `src/styles/kol-typography-mono.css` — (from earlier session, carried forward)
- `src/components/icons/svg/16-miscellaneous/rabbit.svg` — Rabbit icon (from a_torg) for animate toggle, fill set to currentColor.

### Features Added
- **Shared Pixi infrastructure**: `usePixiApp` hook handles init/resize/cleanup/texture for all 5 Pixi variants. `VariantFrame` provides consistent UI wrapper.
- **Resize support**: All Pixi variants respond to container size changes (e.g. symphony canvas ratio change) via ResizeObserver in usePixiApp.
- **Unified raster quality**: `useImageTiers` generates mid/high versions from any image source. Both hall and symphony views use `getRasterTier` to select appropriate resolution. Periodic re-evaluation during animation (500ms interval). Manual [RECALC] button.
- **Grab interaction**: All 5 Pixi variants have grab toggle with dashed rectangle outline showing image bounds. Pointer drag repositions image via `imageOffsetX/Y` (or `wedgeOffsetX/Y` for kaleidoscope). Outlines track animation drift.
- **Params robustness**: `setVariantParam` always starts from defaults. `getVariantParams` merges stored over defaults. `getActiveTab` + `filterControlsByTab` prevent tab filter failures.
- **Edge Zoom slider**: Replaces hardcoded 0.15 multiplier in kaleidoscope. `linkedDefaults` auto-resets on Edge dropdown change.
- **Raster theme control**: `symphonyRasterTheme` state detected on mount, overridable via sidebar toggle.
- **Comp A/B parity**: Both tabs have identical controls (bgBlendMode added, bgExplode removed, bgGrabSegment added). Pages match 1:1 in shelf pagination.

## Current State

### Working
- All 5 Pixi variants use shared usePixiApp + VariantFrame
- Raster tier system applies in both halls and symphony
- Grab interaction works across all Copies variants
- Shelf pagination correct for both Comp A and B
- Slot params carry through in Effect Only mode
- Raster theme toggle + [RECALC] button functional
- Edge Zoom slider with linkedDefaults auto-reset
- Glitch direction toggle (horizontal/vertical) with correct slice orientation

### Known Issues
- Feather keying still unresolved
- Blend modes still don't work (Pixi render groups)
- Old hall page components still exist (dead code)
- `bgGrabSegment` control exists but grab interaction for kaleidoscope Comp B not wired in renderer yet
- `PixiImageFilterCanvas` not migrated to shared infrastructure (different layout)

## Next Steps
1. Wire bgGrabSegment for kaleidoscope Comp B
2. Add image fit modes (center, stretch width, stretch height) for raster content in all variants
3. Test raster tier system end-to-end with uploaded photos in both views
4. Clean up dead hall page components
5. Investigate render groups for blend mode support
