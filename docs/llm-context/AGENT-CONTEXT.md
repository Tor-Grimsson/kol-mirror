# Agent Context

## Current State

### Active Work
- **Video Synth Plan COMPLETE**: All 9 chunks done. `docs/video-synth-mixer-plan.md`. Full docs at `docs/documentation/video-synth/README.md`.
- **Bus Rendering Pipeline**: useFrameBuffer: compositeBuses(), getBusFrame(), applyFeedback(), processChannelFx(). BusLayer + FeedbackLayer in SymphonyViewport. Single rAF: captureAll → canvasFx → feedback → compositeBuses → paint.
- **Routing Matrix**: NxN routing with source cycling (channels + buses), send matrix knobs, RTN→Ch and RTN→RTN cross-sends all wired. Bus keys routable as channel sources via routeFrom.
- **Feedback Loops**: Per-channel decay/mix/freeze. FeedbackLayer renders before each ChannelLayer. FB tab in FX rack.
- **Generators**: 4 visual (Noise, Gradient, Pattern, Color Field) loadable into channels. VisualGeneratorModule preview cards in Generators tab.
- **Canvas FX**: 6 pixel processors (RGB Split, Edge Detect, Posterize, Pixel Sort, Mirror, Threshold). CanvasFxList in MasterModule FX shelf.
- **Modulators**: 8 modules in Generators tab — LFO x2, Sequencer, Logic Gate, Envelope (ADSR), Sample & Hold, Multiples. All publish to signal bus.
- **Modulation Assign**: Right-click any RotaryDial to assign mod source. ModulationAssign popup. Indicator dot when modulated.
- **Master Module**: 6 strips (Ch 1-3, RTN 1-2, MST), A/B knob paging, 6-bus send tabs, 5-button right shelf.
- **Frame Buffer**: OffscreenCanvas per channel + per bus + per feedback. captureAll(), getChannelFrame() (handles int + string keys), resolveRenderOrder().
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

### Recent Changes (2026-04-01, session 12)
- **Architecture rethink**: Signal path is pure math, not pixels. Layered model: L1 (JS numbers) → L2 (math functions) → L3 (vector generators) → L4 (Canvas2D display) → L5 (shaders, future). 3D wireframe also math-only (projection, no GPU).
- **Project reorganized**: Sessions 10-11 modules archived into `src/videomodulo/arc-case/case-01/02/03/` (self-contained). Active work at `src/videomodulo/modules/` with category folders (utility, control, math, generators, effects).
- **SPA routing**: Removed Vite MPA (multiple HTML files). Single `index.html`, `react-router-dom`. Routes: `/` (main app), `/index` (archive list), `/index/case-*` (archived cases), `/videomodulo` (active work).
- **Eurorack case component**: `Case.jsx` with spec-accurate aspect ratios (1U=12:1, 3U=4:1). Rails with 104 threaded holes behind modules (z-index layering). Side panels. `Module.jsx` wrapper with screw holes and safe content zone (py-3 dead zone for rails). `eurorack.js` shared constants.
- **Design system**: Added `--kol-opacity-hex-*` scale (solid hex colors per theme) to `kol-color-simple.css` with `.bg-opacity-hex-*` and `.border-opacity-hex-*` utility classes.
- **Docs reorganized**: `docs/video-modulo/` now contains research, mixer plan, and `base-architecture.md`.
- **Pages pattern**: `MirrorPlayground.jsx` and `VideoModuloIndex.jsx` moved to `src/pages/`.

### Recent Changes (2026-04-01, session 11)
- **Video Modulo standalone page**: `/videomodulo/` and `/videomodulo/case-02/` as separate Vite MPA entry points
- **36 modules built**: Clock, Gate, Logic, Mult, S&H, Mixer, LFO×2, Sequencer, Envelope, Maths, Generator×2, Dither (23 modes from kol-radar), Geometry 3D (Three.js), Monitor×2, Mult2HP, + 20 video processing modules (RGB Split/Mix, VCA, Key, Ramp, Fader, Luma, Waveshaper, Slew, Inverter, Quantizer, Noise, Clock Div, Comparator, Delay, Sample, Scale/Offset, Rectifier, Switch, Video Mix Console)
- **Dynamic signal bus**: `useSignalBus.js` — no hardcoded keys, `register`/`unregister`/`getKeys`
- **Dynamic expression engine**: `compile(expr, busKeys)` generates variable bindings from actual bus state
- **Patch cable system**: `usePatchRouting.jsx` context, `PatchCableOverlay.jsx` SVG catenary curves, `JackSocket.jsx` draggable 3.5mm jack sockets with category color coding (amber=timing, red=signal, blue=video, purple=utility). Drag from output → release near input to connect. ESC cancels. Click connected input to disconnect.
- **Eurorack rack layout**: `RackRow.jsx` with 1U/3U heights, aluminum rails, HP-based widths. Case frame with side panels. Two cases.
- **Module shelf**: slide-out panel listing all available modules by category with HP sizes
- **JackSocket component**: eurorack-style jack sockets with signal-strength glow animation, category coloring, drag-to-connect
- **ModuleIO component**: compact jack socket footer for modules, outputs on left, inputs on right
- **ExpressionInput component**: text field for trigger/clock/sync signals with rising edge detection
- **Dither engine**: copied from kol-radar (ditherEngine.js), 23 modes, 21 shapes
- **Three.js dependency**: `three@0.183.2` added for Geometry3DModule
- **Research documentation**: `docs/video-synth-research/` — war-book.md, signal-flow.md, key-modules.md, modulation-operators.md, cookbook.md, architecture-plan.md, module-reference.md, module-audit.md

- **CRITICAL ISSUE**: No video bus — all modules pass scalar values (0-100), not canvas frames. Generators render to hidden canvases but output only luma/density scalars. Monitor shows oscilloscope traces, not video. The #1 priority is implementing `useVideoBus` so generators publish canvases and the monitor displays them.
- **Patching partially working**: drag-to-connect works but hit detection inconsistent at small jack sizes. Disconnect via click on connected input works after fix to removeConnection.

### Recent Changes (2026-03-31, session 10)
- **Chunks 3-9 complete**: Bus pipeline, return-to-channel, feedback, generators, canvas FX, modulators, modular extensions
- **Bus rendering**: compositeBuses() composites channels into 6 bus OffscreenCanvases. BusLayer renders at returnLevel opacity with CSS FX + blend.
- **Feedback loops**: Per-channel decay/mix/freeze. feedbackBuffersRef accumulates frames. FeedbackLayer renders behind live channel.
- **Return-to-channel**: routeFrom accepts string bus keys ('rtn1', 'aux1'). getChannelFrame delegates to getBusFrame for strings. Routing matrix cycles through bus sources.
- **4 visual generators**: NoiseGenerator (fbm), GradientGenerator (linear/radial/conic), PatternGenerator (stripes/dots/checker), ColorFieldGenerator. All render to canvas via rAF.
- **6 canvas FX**: useCanvasFx.js — chromatic (RGB split), edge-detect (Sobel), posterize, pixel-sort, mirror, threshold. Applied per-channel on frame buffers.
- **Envelope + S&H modules**: ADSR envelope generator, Sample & Hold with smooth interpolation. Both in Generators tab.
- **Multiples module**: 1-to-3 signal splitter with scale/offset per output. Publishes mult1_a/b/c.
- **Modulation assign**: Right-click RotaryDial opens ModulationAssign popup. Red indicator dot when modulated.
- **Legacy cleanup**: Removed busA/busB, sendA/sendB. RTN knobs in routing matrix fully wired.
- **onLoadGenerator**: SymphonyMixer wires GeneratorTab [Load] to channel variant loading.
- **Documentation**: docs/documentation/video-synth/README.md — combined user guide + developer reference.

### Recent Changes (2026-03-31, session 9)
- **Bus rendering pipeline (chunk 3)**: useFrameBuffer extended with `compositeBuses(channels, buses)` and `getBusFrame(key)`. Composites channel frames into per-bus OffscreenCanvases weighted by send levels (opacity = sendLevel/100). Lazy allocation: buffers only created when bus is enabled + has sends + returnLevel > 0.
- **BusLayer component**: Renders bus output as visible `<canvas>` in SymphonyViewport. CSS FX from bus FX chain, blend mode from bus config, opacity = returnLevel/100. All 6 buses (aux1/2, rtn1/2, fx1/2) rendered inside master output wrapper.
- **Zero-delay rAF loop**: Single animation frame: `captureAll` -> `compositeBuses` -> copy OffscreenCanvases to visible BusLayer canvases via `busCanvasMapRef`. Loop activates when `hasRouting` or `hasSends`.
- **DOM capture for sends**: ChannelLayer activates DOM capture when channel has non-zero bus sends (`hasBusSends`), not just when armed for recording.
- **Legacy cleanup**: Removed `busA`/`busB` from master state. Removed `sendA`/`sendB` from EMPTY_CHANNEL. Unified `sends` object is sole source of truth for bus sends.
- **Signal bus**: `useSignalBus` hook — shared mutable ref (`busRef`) for generator values. `publish(key, value)` and `reset()`. Initial keys: lfo1, lfo2, seq1, gate1.
- **Expression bus variables**: `useExpressionValue` extended — `compile()` passes `busRef.current` as 5th argument. Expressions can reference `lfo1`, `lfo2`, `seq1`, `gate1`.
- **Generator state**: `generatorState`/`setGeneratorState` in useMirrorState. LFO x2, sequencer, logic gate, oscillator x2 presets.
- **Generator UI scaffold**: GeneratorTab with LFOModule, SequencerModule, LogicGateModule components (UI only, not yet publishing to bus).

### Recent Changes (2026-03-31, session 8)
- **Per-channel bottom tabs**: CH1|CH2|CH3|RTN1|RTN2|MST — all show identical 6 send knobs (AUX1, AUX2, RTN1, RTN2, FX1, FX2). Channels write to channel.sends, RTN/MST write to bus.sends.
- **6-bus architecture**: Master state expanded with aux1, aux2, rtn1, rtn2, fx1, fx2 bus objects. EMPTY_SENDS = { aux1, aux2, rtn1, rtn2, fx1, fx2 }. RTN strips use master.rtn1/rtn2 (not busA/busB).
- **A/B knob paging**: ChannelMaster simplified to single `knobs` array. Default=knobs 1-2, A=knobs 3-4, B=knobs 5-6. Always 2 visible.
- **AUX/FX shelf button**: Moved from bottom section up with other 4 shelf buttons (5 buttons total).
- **Indicator dot alignment**: ChannelMaster and MasterModule Indicated both use left: -2px matching RoutingMatrix.

### Recent Changes (2026-03-31, session 7)
- **Signal path fix**: Channels with customImageSrc (SRC) never fall back to global raster. SRC is sole image source.
- **vectorPadding on all variants**: Padding transform merged into fxStyle, applied on displacement/movement/pixi wrapper divs. No more clipping.
- **Loaded loads vector SVG**: Sidebar Loaded and LOAD tab refresh both load random vector SVG + variant. Resets vectorPadding to 0.
- **LOAD tab dropdown selection**: Category dropdowns (Displacement/Movement/Copies/Memory) show currently loaded variant as selected.
- **Animation resume**: MovementVariant uses resume() instead of play() — preserves position on pause/unpause.
- **Alt+click restart**: Sidebar Animate alt+click bumps symphonyRestartKey, remounts all variants from beginning.
- **Universal alt+click reset**: RotaryDial, Slider, ColorPicker, Dropdown all accept defaultValue prop. Alt+click resets to defaultValue (knobs/sliders fall back to min).
- **Background alt+click**: Whole row intercepts alt+click to toggle transparent/black. ColorPicker skips opening on alt+click.

### Recent Changes (2026-03-31, session 6)
- **Master Module rewired**: Ch 1-3 strips now read/write actual `channels[i]` state (opacity, enabled, intensity, fx) instead of master-level FX. RTN 1-2 wired to busA/busB. MST wired to master state. All local enable states removed.
- **A/B knob banks**: ChannelMaster accepts `knobsA`/`knobsB` props. Bank A: INT, HUE, SAT. Bank B: BRT, CTR, BLR. Neither pressed = first 2 knobs. Both = all 6. Used on all strips (channels use buildChannelKnobs, buses/master use buildFxKnobs).
- **Bottom tabs wired**: AUX SND reads/writes `channels[i].sendA`. FX SND reads/writes `channels[i].sendB`. AUX RTN shows busA controls (level, blend, solo, ON/OFF). FX RTN shows busB controls.
- **Shelf tabs wired**: FILES shows customImageName + recSlots counts. FX shows interactive per-channel FX lists + master FX (add/remove/toggle). COLOR shows per-channel vectorColor, backgroundColor (ColorPicker), blendMode (Dropdown). MST shows master opacity, blend, FX. AUX/FX shows RTN 1-2 full controls.
- **FX helpers**: readFx/writeFx utility functions in MasterModule for reading/writing FX arrays. buildChannelKnobs/buildFxKnobs for constructing knob bank configs.
- **FxList component**: Inline FX list with enable dot, type label, primary param slider, remove button. Used in FX shelf and AUX/FX shelf.
- **Sidebar Loaded**: "Loaded [Random]" row above "Reloaded [Random]". Loads random variant into Ch 1 only. symphonyLoaded function on state (SymphonyViewport).
- **Background toggle**: Alt+click "Background" label in channel COLOR section toggles transparent/black. Label dims when transparent.

### Recent Changes (2026-03-31, session 5)
- **Master Module bottom tabs**: AUX SND | AUX RTN | FX SND | FX RTN with dense knobs in 64px containers aligned to channel strips.
- **Master Module right shelf**: 4 top buttons (FILES/library, FX/frequency, COLOR/layers, MST/circle) + 1 bottom button (AUX-FX/atomic-molecule). 280px shelf panel with 5 tab views (FILES, FX, COLOR, MST, AUX/FX). Placeholder content.
- **Routing Matrix rewrite**: CSS grid → flex columns via MatrixColumn component. 5×5 matrix (Ch 1-3 + RTN 1-2). Vertical Divider between ch/rtn column groups, horizontal divider between ch/rtn rows. ChannelButton helper for styled pill buttons.
- **Routing Matrix source cycling**: Row labels are click-to-cycle buttons (Own → Ch 1 → Ch 2 → ..., skipping self). Accent color when routed.
- **Routing Matrix bottom**: Channel Output section with dense knobs + Indicated wrappers for Ch 1-3 + RTN 1-2.
- **Routing Matrix shelf**: Right shelf with per-channel output controls (level, blend, ON/OFF).
- **RTN integration**: RTN 1-2 in matrix read from master.busA/busB. Blue accent (#3b82f6). master/onMasterChange props passed from SymphonyMixer.

### Recent Changes (2026-03-31, session 4)
- **Master Module**: 6-channel mixer strip (Ch 1-3 red, RTN 1-2 blue, MST teal) with vertical dividers. Custom VerticalFader (pointer drag, track marks, rectangular thumb). AUX SEND section with per-channel knobs + Indicated dots. Header with 16px enable indicator (1px border). ChannelMaster extracted to `src/components/mixer/ChannelMaster.jsx`.
- **Routing Matrix**: Standalone component with signal source dropdowns, NxN send matrix, per-channel output controls.
- **Frame Buffer**: useFrameBuffer hook, OffscreenCanvas per channel, resolveRenderOrder topological sort. Integrated in viewport/channel layer.
- **State**: symphonyMaster expanded (enabled, opacity 80 default, busA/busB with returnLevel/fx/blendMode/solo). EMPTY_CHANNEL: sendA, sendB, routeFrom, routeSendLevels.
- **RotaryDial**: DIAL_VARIANTS (default/dense). Dense: knobRatio 0.95, tickSize 40, smaller ticks, no top offset.
- **Video Synth Plan**: docs/video-synth-mixer-plan.md — routing, feedback, generators, FX, modulators.

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
- `src/hooks/useMirrorState.js` — All state, EMPTY_CHANNEL (sends, feedback, canvasFx), generatorState, undo/redo
- `src/hooks/useFrameBuffer.js` — Channel/bus/feedback OffscreenCanvases, captureAll, compositeBuses, applyFeedback, processChannelFx, getChannelFrame (int + string keys)
- `src/hooks/useCanvasFx.js` — CANVAS_FX_DEFS (6 pixel processors), applyCanvasFx()
- `src/hooks/useSignalBus.js` — Dynamic signal bus, register/unregister/getKeys, no hardcoded keys
- `src/hooks/useExpressionValue.js` — Expression compile(expr, busKeys), wave helpers, dynamic bus variable access
- `src/hooks/usePatchRouting.jsx` — Patch cable routing context: pendingOutput, connections, jack registration, drag-to-connect
- `src/videomodulo/SynthWorkspace.jsx` — Case 1 rack: timing + generators + video modules
- `src/videomodulo/Case2Workspace.jsx` — Case 2 rack: video processing + console + monitor
- `src/videomodulo/RackRow.jsx` — Eurorack row component with 1U/3U heights, aluminum rails
- `src/videomodulo/ModuleShelf.jsx` — Module library panel
- `src/components/hall-of-mirrors/generators/JackSocket.jsx` — 3.5mm jack socket with drag, glow, color coding
- `src/components/hall-of-mirrors/generators/ModuleIO.jsx` — Module I/O footer with jack sockets
- `src/components/hall-of-mirrors/generators/ExpressionInput.jsx` — Text input for trigger/clock/sync with rising edge
- `src/components/hall-of-mirrors/generators/PatchCableOverlay.jsx` — SVG catenary patch cables
- `src/components/hall-of-mirrors/generators/ditherEngine.js` — 23-mode dither engine from kol-radar
- `docs/video-synth-research/` — War book, signal flow, key modules, modulation operators, cookbook, architecture plan, module reference, module audit
- `src/hooks/usePixiApp.js` — Pixi lifecycle, renderCost, textureVersion
- `src/hooks/useChannelRecorder.js` — Recording state machine
- `src/hooks/useDomCaptureCanvas.js` — DOM capture for Displacement/Movement
- `src/data/mirrorVariants.js` — Variant defs, CHANNEL_FX_DEFS, buildChannelFxStyle
- `src/components/mirror/SymphonyViewport.jsx` — BusLayer, FeedbackLayer, rAF loop, generator dropdown, recording
- `src/components/mirror/ChannelLayer.jsx` — Render dispatcher, generator branch, DOM capture for sends
- `src/components/hall-of-mirrors/SymphonyMixer.jsx` — Channel mixer, FX rack (FB tab), shelves, onLoadGenerator
- `src/components/hall-of-mirrors/MasterModule.jsx` — 6 strips, sends, FxList, CanvasFxList
- `src/components/hall-of-mirrors/RoutingMatrix.jsx` — NxN matrix, bus source cycling, RTN send wiring
- `src/components/hall-of-mirrors/RotaryDial.jsx` — Knob with modulation assign (right-click)
- `src/components/hall-of-mirrors/ModulationAssign.jsx` — Mod source popup
- `src/components/hall-of-mirrors/generators/` — NoiseGenerator, GradientGenerator, PatternGenerator, ColorFieldGenerator, VisualGeneratorModule, LFOModule, SequencerModule, LogicGateModule, EnvelopeModule, RandomSHModule, MultiplesModule, GeneratorTab, index.js
- `src/components/mixer/ChannelMaster.jsx` — Strip: fader, knobs, A/B paging
- `docs/documentation/video-synth/README.md` — Full user guide + developer reference
