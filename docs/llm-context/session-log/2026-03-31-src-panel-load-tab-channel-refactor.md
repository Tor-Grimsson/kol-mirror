# Session: SRC Panel, LOAD Tab, Channel Strip Refactor

**Date:** 2026-03-31
**Agent:** Claude Code (Sonnet 4.6)
**Summary:** SRC panel [Clear] functionality, empty channel support, LOAD tab with randomization, channel strip 2x3 knob grid (WIP), per-channel animate, undo/redo, mobile two-finger scroll.

## Changes Made

### Files Modified
- `src/components/hall-of-mirrors/SymphonyMixer.jsx` — Major changes:
  - SRC panel: [Clear] hover clears customImageSrc/customRasterSrc/customImageName from channel
  - SRC panel: Default [Load] row with refresh icon loads default-canvas.svg into channel
  - SRC panel: Frame shows vector-color-resolved SVG, empty when cleared
  - SRC panel: Second divider pt-2
  - LOAD tab added to right shelf (order: SRC, RES, LOAD, PARAMS, REC)
  - LOAD tab: Loaded row (dropdown with Random/Clear), Reloaded row (dropdown with All/Ch1/Ch2/Ch3 + eye toggle)
  - LOAD tab: Memory/Displacement/Movement/Copies dropdowns with abbreviated labels ([M1] D:SR format, 3-letter variant names)
  - LOAD tab: Color/Blend/Blur/Brightness randomizers with refresh icon + dropdown (Random/Clear)
  - LOAD tab: Vector [Random] with [Shapes]/[Forms] sub-options, Scale [Random]
  - LOAD tab: Shapes/Forms dropdowns loading SVGs from /kol-vector/
  - All LOAD tab dropdowns keepOpen (click away to close)
  - Channel header always visible (not gated on enabled), text-fg-96 when enabled, text-fg-32 when not
  - Channel header shows "Channel N" as default name
  - 5 shelf tab icon buttons: library (SRC), foundation (RES), save (LOAD), frequency (PARAMS), video (REC)
  - Channel strip: 2x3 knob grid layout (INT, SPD, XXX / OPC, BST, XXX) — WIP, layout needs refactor
  - Exported CSS_BLEND_MODES, ALL_VECTORS, loadVectorSvg for reuse
  - Two-finger horizontal scroll on mobile channel row
  - LoadButton portal dropdown replaced with shelf LOAD tab
- `src/components/hall-of-mirrors/RotaryDial.jsx` — compact prop (WIP), label/value as flex-row at 10px, tickPadding based on fullSize=64, offset centering, SVG top:6px nudge
- `src/components/mirror/SymphonyViewport.jsx` — Major changes:
  - Channel image pipeline: hasMedia based on customImageSrc||customRasterSrc, null imageSrc/defaultSvgSrc for empty channels
  - Per-channel SVG rasterization when vector color differs from global
  - Tier pipeline fallback only when channel color matches global
  - handleReloaded function exposed on state.symphonyReloaded for sidebar access
  - Global animate no longer auto-enabled on variant load
  - Global animate toggle syncs per-channel animate params
  - mixerVisible state with [Hide]/[Show] toggle (mobile)
  - Symphony viewport CSS classes for mobile/desktop layout
- `src/components/mirror/ChannelLayer.jsx` — Per-channel animate (channelAnimate = scaledParams.animate ?? isAnimating), background color on all render paths (displacement/movement/pixi), hasBg moved up, no-image+bg renders background div, Pixi transparent canvas background
- `src/components/mirror/MirrorSidebar.jsx` — Reloaded [Random] row below Animate, History row with undo/redo icons, Icon import added
- `src/components/mirror/SymphonyViewport.jsx` — rasterizeSvgDataUrl helper for per-channel SVG rasterization
- `src/hooks/useMirrorState.js` — customImageName added to EMPTY_CHANNEL, undo/redo history (channelHistoryRef/channelFutureRef, symphonyUndo/symphonyRedo), setSymphonyChannelsWithHistory wrapper
- `src/hooks/usePixiApp.js` — Pixi canvas transparent by default (backgroundAlpha: 0)
- `src/hooks/useImageTiers.js` — All tiers output same pixel dimensions (fullW x fullH), low tier upscaled with imageSmoothingEnabled=false
- `src/components/hall-of-mirrors/MirrorVariant.jsx` — Animate pause/resume instead of kill+reset (freezes at current frame)
- `src/components/molecules/Dropdown.jsx` — keepOpen prop, renderOption prop for custom option rendering
- `src/index.css` — Symphony viewport CSS classes (desktop/mobile layout)
- `public/kol-vector/` — Copied SVG assets from kol-vector/ for runtime loading

### Features Added
- **SRC panel [Clear]**: Clears channel image, frame, filename, canvas
- **SRC panel Default [Load]**: Loads default-canvas.svg into channel on demand
- **LOAD tab**: Full randomization interface — variants, colors, blend, blur, brightness, vectors, scale
- **Reloaded**: Randomizes all channels at once (sidebar + per-channel)
- **Per-channel animate**: Independent of global, global is master kill switch
- **Freeze on stop**: Displacement pauses at current frame instead of resetting
- **Undo/redo**: Channel state history (30 deep) with undo/redo in sidebar
- **Channel strip icons**: 5 shelf tab buttons (SRC/RES/LOAD/PARAMS/REC)
- **2x3 knob grid**: INT/SPD/XXX/OPC/BST/XXX (layout WIP)
- **Mobile**: Two-finger horizontal scroll on channel row, mixer hide/show toggle
- **Pixi transparent canvas**: Background color div visible behind WebGL
- **Vector SVG loading**: Shapes and Forms from /kol-vector/ with currentColor recoloring

## Current State

### Working
- SRC panel clear/load cycle
- Empty channels (no image, no variant, background color works)
- LOAD tab with all randomization features
- Per-channel animate independent of global
- Displacement freeze on pause
- Undo/redo for channel state
- Pixi background color visible
- All shelf tabs accessible via icon buttons

### Known Issues
- **Channel strip knob layout**: 2x3 grid doesn't properly fill space, nested divs need refactor (plan exists at .claude/plans/frolicking-finding-sparrow.md)
- **Tier recalc broken**: Switching raster tier (Low/Mid/High) + RECALC doesn't change resolution on Pixi variants
- **Vector overwrite**: Loading a variant may prevent vector SVG from being swapped via LOAD tab
- **Displacement capture scale**: Still cropped vs live
- **Real-time OFF**: Placeholder only
- **FX categories**: Need separation into transform/spatial vs color/tone groups

## Next Steps
1. Execute channel strip knob layout refactor (plan ready)
2. Fix tier recalc pipeline for Pixi variants
3. Investigate vector/variant load priority issue
4. Separate FX into categories
