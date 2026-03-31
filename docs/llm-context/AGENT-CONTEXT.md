# Agent Context

## Current State

### Active Work
- **Expression engine**: `useExpressionValue` hook (rAF loop, `new Function` compile). Helpers: wave/saw/tri/pulse(PWM)/rand/ease(curve)/bell/exp/log/step + sin/cos/abs/floor/ceil/round/sqrt/pow/PI/PHI. Variables: t (seconds), f (frame count), min, max. Click knob value to type expression, alt+click to cancel.
- **Oscilloscope**: Live canvas preview in Expressions tab. Zoom X/Y/Scale sliders, Min/Max/Sec/Ofs inputs, Fit/Expand/Reset. Grab-to-pan. Red dashed 0-100 reference. ResizeObserver for sharp rendering. 2-column default.
- **Expressions tab**: Third mixer tab (Channels | Output | Expressions). ExpressionReference component with 5 scrollable 320px columns. Cmd+click code spans to append to oscilloscope.
- **Channel strip knobs (done)**: Flat CSS grid (`grid-cols-3`), no more nested flex. Knobs wired to FX: INT/HUE/SAT/BRT/CTR/BLR. getFxValue/setFxValue helpers auto-create FX entries.
- **Loop recording (working)**: Universal recording for all 16 variants. 4-state flow (idle→armed→recording→done). Pixi via captureStream, Displacement/Movement via useDomCaptureCanvas. Framerate selector (30/60fps default 60). Dual-thumb trim slider with draggable playhead, click-to-seek. Keyboard shortcuts (i/o marks, arrows frame step, up/down jump to in/out). Per-channel render cost %. Media transport icons (play/pause/stop teal). Real-time toggle (placeholder for offline capture).
- **Symphony mixer UI unified**: All text fg-96, all rows 24px, all gaps gap-2. All native selects replaced with Dropdown component. Blend mode hover preview. Right shelf extends full height (FX rack inside flex-row column). Bottom FX tabs: COLOR | BLEND | FX. Right shelf tabs: SRC | RES | LOAD | PARAMS | REC.
- **LOAD tab**: Loaded/Reloaded rows with refresh icon + dropdown. Memory/Displacement/Movement/Copies variant dropdowns (abbreviated labels). Color/Blend/Blur/Brightness/Vector/Scale randomizers with RDM-XX feedback (random 01-99 on each roll, resets on clear). Shapes/Forms/Logos dropdowns (close on select, show selection). Logos category: L-01 (shape-00.svg).
- **Per-channel colors**: Vector color applied to SVG sources (default + custom uploads). Background color on all render paths (displacement/movement/pixi). SVG recolor upload (replaces fills with currentColor). Vector padding slider (-100% to +100%).
- **Per-channel animate**: Independent of global. `channelAnimate = scaledParams.animate ?? isAnimating`. Global is master toggle that syncs all channels. Displacement freezes at current frame on pause.
- **SRC panel**: [Clear] empties channel image/canvas. Default [Load] loads default-canvas.svg. Recolor/Normal upload. Frame shows vector-color-resolved SVG.
- **Channel strip**: 5 shelf tab icon buttons (library/foundation/save/frequency/video). 2x3 knob grid (INT/HUE/SAT/BRT/CTR/BLR) via CSS grid. RESET/REC-LOOP/BOOST row. Channel header always visible with "Channel N" default. Right shelf spans full channel height (header+body+FX).
- **Undo/redo**: 30-deep channel state history. symphonyUndo/symphonyRedo exposed on state. Icons in sidebar.
- **Reloaded**: Randomizes all 3 channels (variant, colors, blend, blur, brightness, vector). Available in sidebar and per-channel LOAD tab.
- Kaleidoscope: Comp A/B tab system, grab-to-move wedge, fill/edge controls, background comp, edgeZoomScale slider
- Archive/Memory: 9 slots, [M1] Hall: Variant [USR] labels, [LOAD]/[RELOAD]/[CLEAR] actions
- Shared Pixi infrastructure: usePixiApp hook (renderCost + textureVersion, transparent background), VariantFrame, useImageTiers (low/mid/high tiers, same output dimensions)
- Grab interaction: all 5 Pixi variants

### Known Issues
- **RotaryDial compact prop**: Declared but unused, no implementation
- **Tier recalc broken**: Switching raster tier + RECALC doesn't change resolution on Pixi variants
- **Vector overwrite**: Loading a variant may prevent vector SVG swap via LOAD tab
- **Displacement capture scale**: DOM capture canvas output cropped vs live — needs scale/transform fix
- **Real-time OFF**: UI toggle exists but frame-perfect offline capture not implemented
- **FX categories**: Need separation into transform/spatial vs color/tone groups
- **Feather keying**: Gradient donut can't convert to transparency. Pixi alpha mask failed.
- **Blend modes**: Don't work on Pixi containers without render groups.
- **bgGrabSegment**: Kaleidoscope Comp B grab not wired.
- **PixiImageFilterCanvas**: Not migrated to shared infrastructure.
- Old hall page components still exist (dead code)

### Recent Changes (2026-03-31, session 3)
- **Expression engine**: useExpressionValue hook with rAF loop, compile(). Wave helpers: wave/saw/tri/pulse(PWM)/rand/ease(curve)/bell/exp/log/step. Math: sin/cos/abs/floor/ceil/round/sqrt/pow/PI/PHI. Variables: t, f, min, max.
- **Oscilloscope**: Canvas with ResizeObserver, zoom X/Y/Scale, Min/Max/Sec/Ofs, Fit/Expand/Reset, grab-to-pan, red 0-100 reference lines.
- **ExpressionReference**: Extracted component, 5 scrollable 320px columns. Code spans with Cmd+click append. NumberInput component for zoom values.
- **Expressions tab**: Third mixer tab with wave icon, gap-6 between tabs, gap-2 icon-to-text.
- **RotaryDial**: Expression support via useExpressionValue. Click-to-edit value input, alt+click cancel. Accent color when animating. Mono font on labels.
- **Slider**: formatValue(() => null) hides value span.
- **Logos**: VECTOR_LOGOS category (L-01 = shape-00.svg), dropdown in LOAD tab.

### Recent Changes (2026-03-31, session 2)
- **Knob grid**: Flat CSS grid replaces nested flex. Knobs wired to FX (INT/HUE/SAT/BRT/CTR/BLR). getFxValue/setFxValue helpers.
- **LOAD tab RDM-XX**: All randomizer dropdowns show RDM-XX (01-99) on roll, generated on mount, reset on clear.
- **Shapes/Forms/Logos**: Dropdowns close on select, show selected value. Logos category added (L-01 = shape-00.svg).
- **Right shelf full height**: Spans header to FX. Header moved inside left column, root is flex-row.
- **Dropdown placeholder**: Component now supports placeholder prop when value is empty.
- **RotaryDial**: px-2 on label/value row.
- **Channel row scroll**: overflowX auto instead of hidden.

### Recent Changes (2026-03-31, session 1)
- **SRC panel**: [Clear] clears channel image/canvas, Default [Load] loads default-canvas.svg, frame shows color-resolved SVG
- **LOAD tab**: Added to right shelf with variant/memory dropdowns, Color/Blend/Blur/Brightness/Vector/Scale randomizers, Reloaded all-channel randomizer
- **Empty channels**: Channels start empty, no fallback to default SVG. SRC is entry point to canvas.
- **Per-channel animate**: Independent of global, global syncs all on toggle, displacement freezes on pause
- **Channel strip**: 5 icon buttons for shelf tabs, header always visible
- **Undo/redo**: 30-deep history for channel state
- **Pixi transparent**: backgroundAlpha=0, background color div behind canvas
- **Background color**: Applied on all variant render paths (displacement/movement/pixi/no-variant)
- **Tier rasters**: All tiers same pixel dimensions, low tier pixelated upscale
- **Mobile**: Two-finger horizontal scroll on channel row, mixer hide/show toggle
- **Dropdown**: keepOpen prop, renderOption prop
- **Vector SVGs**: /kol-vector/ shapes and forms loadable with currentColor recoloring
- **Global animate**: No longer auto-enabled on variant load

### Previous Changes (2026-03-30, session 2)
- **UI unification**: All text fg-96, rows 24px, gaps gap-2, native selects → Dropdown (minimal, md, 96px width), blend modes Sentence case
- **Right shelf full height**: FX rack moved inside flex-row column wrapper, shelf stretches via items-stretch
- **FX rack restructured**: Under channel strip with 4px border overlap, kol-helper-xs, channel strip always 4px radius
- **Tab reorder**: Bottom FX: COLOR | BLEND | FX. Right shelf: PARAMS | RES | REC | SRC
- **RES tab**: Moved from bottom shelf to right shelf (Tier dropdown, Raster Theme dropdown, [RECALC])
- **Channel strip icons**: frequency (Parameters), atomic-molecule (Effects), 28x28
- **Per-channel colors**: Vector color applied to custom SVG uploads via currentColor replacement. Background color on all render paths.
- **SVG recolor upload**: processImageUpload recolor option replaces all fills with currentColor
- **Vector padding**: Bipolar slider, CSS scale transform on SVG
- **Rotary dial**: Fixed outer arc with tick marks (11 major + 40 minor), 12px gap, 270° sweep
- **Texture version**: textureVersion state in usePixiApp, all variants rebuild on tier switch

## Project Overview

**Hall of Mirrors** — Interactive image distortion playground. Part of the Kolkrabbi Apparat suite.

### Architecture
- Single-page app with sidebar + viewport (no router, state-driven)
- Sidebar: Mixer (Symphony) → Halls (Displacement, Movement, Copies) → Library (Memory, Presets)
- Controls render from descriptors with tab/divider support, `linkedDefaults` for auto-reset
- Symphony: dynamic channels via ChannelLayer, slot channels reference live data, settings shelf with pagination + pinned tabs
- Kaleidoscope: two-comp architecture (Comp A main + Comp B background), independent params/animation
- Shared Pixi infrastructure: `usePixiApp` hook (init/resize/cleanup/renderCost/textureVersion/transparent bg), `VariantFrame` (UI wrapper), `useImageTiers` (quality tiers, same output dimensions)
- Unified image pipeline: `getRasterTier` selects quality, `useImageTiers` generates low/mid/high versions
- Recording: `useChannelRecorder` (Pixi captureStream), `useDomCaptureCanvas` (DOM variants → hidden canvas)
- Per-channel: vector color, background color, vector padding, custom image uploads with recolor option
- Channel image pipeline: customImageSrc on channel is source of truth. No fallback to default SVG. Empty channel = null images.
- Per-channel animate: `channelAnimate = scaledParams.animate ?? isAnimating`. Global syncs all channels on toggle.
- Undo/redo: 30-deep history stack for channel state in useMirrorState

### Key Files
- `src/data/mirrorVariants.js` — Variant definitions, controls, `getRasterTier`, `RASTER_TIER_SCALES`, `CHANNEL_FX_DEFS`, `getDefaultFxParams`
- `src/hooks/useMirrorState.js` — All state, EMPTY_CHANNEL (includes vectorPadding, customImageName), undo/redo (symphonyUndo/symphonyRedo)
- `src/hooks/usePixiApp.js` — Pixi lifecycle, renderCost, textureVersion, transparent background
- `src/hooks/useImageTiers.js` — Tiered image generation and caching, same output dimensions
- `src/hooks/useChannelRecorder.js` — Recording state machine (idle→armed→recording→done)
- `src/hooks/useDomCaptureCanvas.js` — DOM capture canvas for Displacement/Movement recording
- `src/components/mirror/ChannelLayer.jsx` — Render dispatcher, DOM capture, playhead/seek/renderCost, vectorPadding, backgroundColor on all paths, per-channel animate
- `src/components/mirror/VariantControls.jsx` — Control renderer, gap-2
- `src/components/mirror/SymphonyViewport.jsx` — Recording orchestration, per-channel colors, variant loading, channel rasterization, handleReloaded, global animate sync, mobile layout
- `src/components/mirror/ArchiveViewport.jsx` — Memory grid [M1] labels, [LOAD]/[RELOAD]
- `src/components/mirror/MirrorSidebar.jsx` — Navigation, Animate, Reloaded, History undo/redo, [LOAD]/[RELOAD]
- `src/components/hall-of-mirrors/SymphonyMixer.jsx` — Channel mixer, LOAD/REC/RES/SRC/PARAMS shelves, FX rack, rotary dials, media transport, CSS_BLEND_MODES, ALL_VECTORS, loadVectorSvg exports
- `src/components/hall-of-mirrors/RotaryDial.jsx` — Tick marks, fixed outer arc, 270° sweep, compact prop (WIP)
- `src/components/hall-of-mirrors/ChannelWireDiagram.jsx` — SVG signal-flow (80px fixed, MST x=300, OUT x=600)
- `src/components/atoms/Slider.jsx` — Dual variant, playhead, click-to-seek
- `src/components/atoms/ColorPicker.jsx` — RGBA picker, portal rendering
- `src/components/molecules/Dropdown.jsx` — Custom dropdown, onOptionHover, 96px minimal width, keepOpen, renderOption
- `src/utils/processImageUpload.js` — SVG/raster upload, recolor option
- `src/index.css` — Symphony viewport mobile/desktop CSS classes
- `public/kol-vector/` — Shape and form SVGs for vector loading
- All 5 Pixi variants — onRenderCost, textureVersion deps, transparent background
