# Session: Recording System Overhaul + Universal Capture

**Date:** 2026-03-30
**Agent:** Claude Code (Opus 4.6)
**Summary:** Fixed save-to-slot bug, rebuilt recording UI with arm/start/stop flow, added framerate selector, universal recording for all variant types (Displacement, Movement, Pixi), per-channel render cost indicator, playhead timeline, keyboard shortcuts, and numerous UI refinements.

## Changes Made

### Files Created
- `src/hooks/useDomCaptureCanvas.js` — DOM-to-canvas capture hook for non-Pixi variants. Creates hidden canvas, mirrors variant output via rAF loop. Displacement: uses `ctx.filter = 'url(#filterId)'`. Movement: reads computed GSAP transform matrix.
- `src/components/icons/svg/07-media/control-stop.svg` — Stop icon (filled square) matching play/pause style

### Files Modified
- `src/hooks/useChannelRecorder.js` — Rebuilt with 4-state flow (idle→armed→recording→done). Split `arm` into arm (standby) + start (begin capture) + stop (finalize). Removed mark in/out during recording. Added fps state.
- `src/hooks/usePixiApp.js` — Added `renderCost` measurement (wraps renderer.render in performance.now, rolling 30-frame average, reports as % of 16.67ms budget). Added `textureVersion` state that increments on texture reload so variant effects re-run.
- `src/hooks/useImageTiers.js` — No changes, but added `low` (1x) tier to RASTER_TIER_SCALES in mirrorVariants.js
- `src/data/mirrorVariants.js` — Added `low: 1` to RASTER_TIER_SCALES
- `src/components/mirror/SymphonyViewport.jsx` — Rewired recording handlers for arm/start/stop flow. Added `armedChannelRef` + `recConfigRef` to fix stale closure bug. Added `playheads`, `seekTargets`, `renderCosts` state. Per-channel vector color SVG generation. Fixed `handleClearRecorder` to clear `isArmedForRec`.
- `src/components/mirror/ChannelLayer.jsx` — Integrated `useDomCaptureCanvas` for Displacement/Movement branches. Added `wrapperRef` for viewport size measurement. Added `movementImgRef` for GSAP transform reading. Added `onPlayheadUpdate`, `seekTo`, `onRenderCost` props. Fixed polling cleanup with `pollTimerRef`. Per-channel `backgroundColor` rendering on no-effect path.
- `src/components/hall-of-mirrors/SymphonyMixer.jsx` — Complete REC tab rewrite: 20px row height, gap-1 spacing, arm/start/stop/cancel flow, framerate selector (30/60fps default 60), Real-time toggle (placeholder for future offline capture), recording slot UI with dual-thumb Slider, [Info] toggle, media transport icons (play/pause/stop in teal), [Download] + Icon x close. Keyboard shortcuts: i/o for in/out marks, arrow keys for frame stepping (shift=10 frames), up/down for jump to in/out. Blend mode dropdowns replaced with custom Dropdown component with hover preview. [RST]/[REC] buttons on channel strip. Fixed height (80px) wire diagram container. Render cost % display per channel (green/yellow/red with pulse at 70%+). Right-side icon buttons standardized to 28x28.
- `src/components/hall-of-mirrors/PixiSliceVariant.jsx` — Added `onRenderCost` prop, `textureVersion` in build effect deps
- `src/components/hall-of-mirrors/PixiGlitchSliceVariant.jsx` — Same
- `src/components/hall-of-mirrors/PixiMorphVariant.jsx` — Same
- `src/components/hall-of-mirrors/PixiRadialVariant.jsx` — Same
- `src/components/hall-of-mirrors/PixiKaleidoscopeVariant.jsx` — Same
- `src/components/hall-of-mirrors/MirrorVariant.jsx` — Added `data-filter-id` attribute on wrapper for capture canvas filter resolution
- `src/components/hall-of-mirrors/MovementVariant.jsx` — Added `externalImgRef` prop for capture canvas transform reading
- `src/components/hall-of-mirrors/ChannelWireDiagram.jsx` — Default MST position at x=300, OUT at x=600
- `src/components/mirror/ArchiveViewport.jsx` — Slot labels show `[M1] Hall: Variant [USR]`. Actions changed to [LOAD]/[RELOAD]/[CLEAR]
- `src/components/mirror/MirrorSidebar.jsx` — Memory [load]/[reload] → [LOAD]/[RELOAD]
- `src/components/atoms/Slider.jsx` — Added `dual` variant with two-thumb range slider (`dual-range-in` + `dual-range-out` CSS), playhead indicator (teal line, draggable), track click-to-seek, `onPlayheadChange` prop
- `src/components/atoms/ColorPicker.jsx` — Popover uses `createPortal(document.body)` with fixed positioning to escape stacking context clipping
- `src/components/molecules/Dropdown.jsx` — Added `onOptionHover` prop for live preview on hover
- `src/components/icons/index.js` — Registered `control-stop` icon
- `src/styles/components.css` — Added `@keyframes pulse`, `dual-range-in` and `dual-range-out` CSS classes for dual-thumb slider

### Features Added
- **Universal recording**: All 16 variants recordable (8 Displacement + 5 Pixi + 3 Movement)
- **Arm/Start/Stop flow**: Red dot arms channel (standby), [Start] begins capture, [Stop] finalizes, [Save]/[Discard]
- **Framerate selector**: 30/60fps (default 60)
- **Save-to-slot fix**: Root cause was stale polling callbacks re-arming recorder after save, revoking the saved blob URL
- **Render cost indicator**: Per-channel % of frame budget, green/yellow/red with pulse animation at 70%+
- **Playhead timeline**: Teal draggable playhead on dual-thumb trim slider, click-to-seek
- **Keyboard shortcuts**: i/o (in/out marks), arrows (frame step), shift+arrows (10 frames), up/down (jump to in/out)
- **Blend mode preview**: Hover over blend mode dropdown options to preview live
- **Per-channel vector color**: SVG recolored per channel's vectorColor setting
- **Per-channel background color**: Activates by picking a color in the picker
- **Texture version tracking**: Pixi variants rebuild when texture changes (fixes tier switching)

## Current State

### Working
- Recording all 16 variants (Displacement via DOM capture canvas, Movement via GSAP transform mirroring, Pixi via captureStream)
- Arm → Start → Stop → Save/Discard flow
- Playback: Start/Pause/Stop with teal media transport icons
- Timeline: dual-thumb in/out trim, draggable playhead, click-to-seek, keyboard shortcuts
- Per-channel render cost display
- Blend mode Dropdown with hover preview
- Color picker renders above channel strip via portal
- Per-channel vector color and background color
- Raster tier switching (low 1x / mid 6x / high 12x) with textureVersion rebuild
- [RECALC] button with accent flash animation

### Known Issues
- **Displacement capture scale**: Captured output is cropped compared to live — needs configurable scale/transform (saved in memory)
- **Real-time OFF mode**: UI toggle exists but frame-perfect offline capture not implemented (saved in memory)
- **Right shelf height**: Doesn't extend to bottom shelf Y position — needs flex-row restructure (deferred)
- **Feather keying**: Still blocked (Pixi alpha mask / render groups issue)
- **bgGrabSegment**: Kaleidoscope Comp B grab not wired

## Next Steps
1. Fix displacement capture canvas scale/framing to match live output
2. Implement frame-perfect offline capture (Real-time OFF)
3. Extend right shelf to bottom shelf Y position (restructure flex layout)
4. Migrate Displacement/Movement to Pixi renderers (cleanest long-term recording architecture)
