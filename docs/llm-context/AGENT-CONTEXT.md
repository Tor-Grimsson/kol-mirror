# Agent Context

## Current State

### Active Work
- **Loop recording (working)**: Universal recording for all 16 variants. 4-state flow (idle→armed→recording→done). Pixi via captureStream, Displacement/Movement via useDomCaptureCanvas. Framerate selector (30/60fps default 60). Dual-thumb trim slider with draggable playhead, click-to-seek. Keyboard shortcuts (i/o marks, arrows frame step, up/down jump to in/out). Per-channel render cost %. Media transport icons (play/pause/stop teal). Real-time toggle (placeholder for offline capture).
- **Symphony mixer UI unified**: All text fg-96, all rows 24px, all gaps gap-2. All native selects replaced with Dropdown component. Blend mode hover preview. Right shelf extends full height (FX rack inside flex-row column). Bottom FX tabs: COLOR | BLEND | FX. Right shelf tabs: PARAMS | RES | REC | SRC.
- **Per-channel colors**: Vector color applied to SVG sources (default + custom uploads). Background color on all render paths. SVG recolor upload (replaces fills with currentColor). Vector padding slider (-100% to +100%).
- **Channel strip**: Rotary dial with tick grid (270° sweep, major/minor marks). RESET/REC-LOOP/BOOST row. Icons: frequency (Parameters), atomic-molecule (Effects), settings-01 (Channels), circle (Output). [EDIT] works for both M-slots and preset variants.
- Kaleidoscope: Comp A/B tab system, grab-to-move wedge, fill/edge controls, background comp, edgeZoomScale slider
- Archive/Memory: 9 slots, [M1] Hall: Variant [USR] labels, [LOAD]/[RELOAD]/[CLEAR] actions
- Shared Pixi infrastructure: usePixiApp hook (renderCost + textureVersion), VariantFrame, useImageTiers (low/mid/high tiers)
- Grab interaction: all 5 Pixi variants

### Known Issues
- **Displacement capture scale**: DOM capture canvas output cropped vs live — needs scale/transform fix
- **Real-time OFF**: UI toggle exists but frame-perfect offline capture not implemented
- **Variant default backgrounds**: Not defined per variant (in memory for future)
- **Feather keying**: Gradient donut can't convert to transparency. Pixi alpha mask failed.
- **Blend modes**: Don't work on Pixi containers without render groups.
- **bgGrabSegment**: Kaleidoscope Comp B grab not wired.
- **PixiImageFilterCanvas**: Not migrated to shared infrastructure.
- Native selects remain in FX item type dropdowns
- Old hall page components still exist (dead code)

### Recent Changes (2026-03-30, session 2)
- **UI unification**: All text fg-96, rows 24px, gaps gap-2, native selects → Dropdown (minimal, md, 96px width), blend modes Sentence case
- **Right shelf full height**: FX rack moved inside flex-row column wrapper, shelf stretches via items-stretch
- **FX rack restructured**: Under channel strip with 4px border overlap, kol-helper-xs, channel strip always 4px radius
- **Tab reorder**: Bottom FX: COLOR | BLEND | FX. Right shelf: PARAMS | RES | REC | SRC
- **RES tab**: Moved from bottom shelf to right shelf (Tier dropdown, Raster Theme dropdown, [RECALC])
- **Channel strip icons**: frequency (Parameters), atomic-molecule (Effects), 28x28. Channels/Output tabs with icons (settings-01/circle), sentence case, kol-helper-s
- **RESET/REC-LOOP/BOOST**: Below Opacity with divider, accent flash on RESET, REC/LOOP toggles shelf open/close
- **Record row**: Red dot right of Record (toggle arm/cancel), [Start]/[Cancel] ghosted fg-16 when idle, fg-96 when armed
- **Render cost**: Moved to FX tab bar right-aligned
- **SRC tab**: Recolor/Normal upload rows with icon, 5:3 image preview with hover [Clear], Padding slider, Source/Mode
- **Per-channel colors**: Vector color applied to custom SVG uploads via currentColor replacement. Background color on all render paths.
- **SVG recolor upload**: processImageUpload recolor option replaces all fills with currentColor
- **Vector padding**: Bipolar slider, CSS scale transform on SVG
- **[EDIT] for presets**: Navigates to hall+variant (not just M-slots)
- **Variant loading non-destructive**: Doesn't reset speed/opacity/fx/colors
- **Rotary dial**: Fixed outer arc with tick marks (11 major + 40 minor), 12px gap, 270° sweep
- **Texture version**: textureVersion state in usePixiApp, all variants rebuild on tier switch
- **ColorPicker**: Portal rendering, dark theme default fix (theme !== 'light')
- **Dropdown**: onOptionHover for blend mode preview, minimal width 96px
- **VariantControls**: gap-2 (was 4px)

### Previous Changes (2026-03-30, session 1)
- Universal recording for all 16 variants (useDomCaptureCanvas hook)
- Recording flow rebuilt (4-state machine), save-to-slot fix
- Slider dual variant, playhead, keyboard shortcuts
- Render cost indicator, control-stop icon

## Project Overview

**Hall of Mirrors** — Interactive image distortion playground. Part of the Kolkrabbi Apparat suite.

### Architecture
- Single-page app with sidebar + viewport (no router, state-driven)
- Sidebar: Mixer (Symphony) → Halls (Displacement, Movement, Copies) → Library (Memory, Presets)
- Controls render from descriptors with tab/divider support, `linkedDefaults` for auto-reset
- Symphony: dynamic channels via ChannelLayer, slot channels reference live data, settings shelf with pagination + pinned tabs
- Kaleidoscope: two-comp architecture (Comp A main + Comp B background), independent params/animation
- Shared Pixi infrastructure: `usePixiApp` hook (init/resize/cleanup/renderCost/textureVersion), `VariantFrame` (UI wrapper), `useImageTiers` (quality tiers)
- Unified image pipeline: `getRasterTier` selects quality, `useImageTiers` generates low/mid/high versions
- Recording: `useChannelRecorder` (Pixi captureStream), `useDomCaptureCanvas` (DOM variants → hidden canvas)
- Per-channel: vector color, background color, vector padding, custom image uploads with recolor option

### Key Files
- `src/data/mirrorVariants.js` — Variant definitions, controls, `getRasterTier`, `RASTER_TIER_SCALES` (low/mid/high)
- `src/hooks/useMirrorState.js` — All state, EMPTY_CHANNEL (includes vectorPadding)
- `src/hooks/usePixiApp.js` — Pixi lifecycle, renderCost, textureVersion
- `src/hooks/useImageTiers.js` — Tiered image generation and caching
- `src/hooks/useChannelRecorder.js` — Recording state machine (idle→armed→recording→done)
- `src/hooks/useDomCaptureCanvas.js` — DOM capture canvas for Displacement/Movement recording
- `src/components/mirror/ChannelLayer.jsx` — Render dispatcher, DOM capture, playhead/seek/renderCost, vectorPadding, backgroundColor
- `src/components/mirror/VariantControls.jsx` — Control renderer, gap-2
- `src/components/mirror/SymphonyViewport.jsx` — Recording orchestration, per-channel colors, variant loading
- `src/components/mirror/ArchiveViewport.jsx` — Memory grid [M1] labels, [LOAD]/[RELOAD]
- `src/components/mirror/MirrorSidebar.jsx` — Navigation, [LOAD]/[RELOAD]
- `src/components/hall-of-mirrors/SymphonyMixer.jsx` — Channel mixer, REC/RES/SRC/PARAMS shelves, FX rack, rotary dial, media transport
- `src/components/hall-of-mirrors/RotaryDial.jsx` — Tick marks, fixed outer arc, 270° sweep
- `src/components/hall-of-mirrors/ChannelWireDiagram.jsx` — SVG signal-flow (80px fixed, MST x=300, OUT x=600)
- `src/components/atoms/Slider.jsx` — Dual variant, playhead, click-to-seek
- `src/components/atoms/ColorPicker.jsx` — RGBA picker, portal rendering
- `src/components/molecules/Dropdown.jsx` — Custom dropdown, onOptionHover, 96px minimal width
- `src/utils/processImageUpload.js` — SVG/raster upload, recolor option
- All 5 Pixi variants — onRenderCost, textureVersion deps
