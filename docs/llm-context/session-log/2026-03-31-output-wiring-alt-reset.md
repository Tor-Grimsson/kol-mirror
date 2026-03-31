# Session: Output Tab Wiring, Signal Path Fixes, Alt+Click Reset

**Date:** 2026-03-31
**Agent:** Claude Code (Opus 4.6)
**Summary:** Rewired Master Module to actual channel state with A/B knob banks, fixed signal path so SRC is sole image source, added universal alt+click reset to all controls, fixed animation resume position.

## Changes Made

### Files Modified
- `src/components/mixer/ChannelMaster.jsx` — Replaced `knobs` with `knobsA`/`knobsB` props. A/B bank toggles (neither=2, A=3, B=3, both=6 knobs).
- `src/components/hall-of-mirrors/MasterModule.jsx` — Full rewire: Ch 1-3 → channel state, RTN 1-2 → bus state, MST → master state. readFx/writeFx/buildChannelKnobs/buildFxKnobs helpers. FxList component. Bottom tabs wired (AUX/FX SND/RTN). All 5 shelf tabs wired (FILES/FX/COLOR/MST/AUX-FX). Removed local enable states.
- `src/components/mirror/SymphonyViewport.jsx` — handleLoaded loads random variant + vector SVG into Ch 1, resets vectorPadding. symphonyLoaded on state. Fixed rasterForChannel: channels with customImageSrc use own raster, never global fallback. Added symphonyRestartKey pass-through.
- `src/components/mirror/MirrorSidebar.jsx` — Added "Loaded [Random]" above "Reloaded [Random]". Alt+click Animate restarts all animations (bumps restartKey + turns on if off).
- `src/components/hall-of-mirrors/SymphonyMixer.jsx` — Loaded refresh in LOAD tab also loads vector SVG. LOAD tab category dropdowns show currently loaded variant as selected. Alt+click Background row toggles transparent/black (stopPropagation prevents picker). Loaded refresh uses onMediaChange for vector.
- `src/components/mirror/ChannelLayer.jsx` — vectorPadding transform merged into fxStyle (works on all variant paths: displacement/movement/pixi). restartKey prop forces variant remount on restart. padTransform concatenated with existing FX transforms.
- `src/components/hall-of-mirrors/MovementVariant.jsx` — Changed `play()` to `resume()` so animation continues from paused position instead of restarting.
- `src/hooks/useMirrorState.js` — Added symphonyRestartKey state + setter.
- `src/components/atoms/ColorPicker.jsx` — Added defaultValue prop. Alt+click resets to defaultValue. Alt+click skips opening picker.
- `src/components/atoms/Slider.jsx` — Added defaultValue prop. Alt+click resets to defaultValue (falls back to min).
- `src/components/hall-of-mirrors/RotaryDial.jsx` — Added defaultValue prop. Alt+click resets to defaultValue (falls back to min).
- `src/components/molecules/Dropdown.jsx` — Added defaultValue prop. Alt+click resets to defaultValue.
- `docs/video-synth-mixer-plan.md` — Unified plan: absorbed output-tab-workplan, updated roadmap (9 chunks), updated signal flow diagram, added Key Files table.
- `docs/documentation/mirrors/signal-path.md` — Added frame buffer, send/return buses, routing matrix, vector SVG sources.
- `docs/documentation/mirrors/symphony-mixer.md` — Rewrote for current architecture: 3-tab mixer, Output tab (MasterModule + RoutingMatrix), A/B knob banks, channel data model with all new fields.
- `docs/documentation/components/components-list.md` — Added ChannelMaster, MasterModule, RoutingMatrix, ExpressionReference, useFrameBuffer, useExpressionValue, useDomCaptureCanvas.
- `docs/llm-context/AGENT-CONTEXT.md` — Session 6 changes, updated Active Work.
- Deleted `docs/output-tab-workplan.md` (absorbed into video-synth-mixer-plan).

### Features Added
- **Master Module fully wired** — Ch 1-3 strips control actual channel state, RTN 1-2 control bus state, MST controls master. A/B knob banks on all strips.
- **Bottom tabs functional** — AUX SND (sendA), FX SND (sendB), AUX RTN (busA controls), FX RTN (busB controls).
- **Shelf tabs functional** — FILES, FX (interactive lists), COLOR (ColorPicker), MST, AUX/FX.
- **Sidebar Loaded** — loads random variant + vector SVG into Ch 1, resets padding.
- **SRC is sole image source** — channels with customImageSrc never fall back to global raster.
- **vectorPadding on all variants** — padding transform merged into fxStyle, works on displacement/movement/pixi paths.
- **LOAD tab dropdown selection** — category dropdowns show currently loaded variant.
- **Animation position preserved** — Movement variants resume from paused position (play→resume).
- **Alt+click restart** — sidebar Animate alt+click remounts all variants from beginning.
- **Universal alt+click reset** — RotaryDial, Slider, ColorPicker, Dropdown all support defaultValue prop + alt+click to reset.
- **Background alt+click toggle** — toggles transparent/black on entire row.

## Current State

### Working
- All 6 Master Module strips wired to real state with A/B knob banks
- All 4 bottom tabs functional
- All 5 shelf tabs functional with live data
- Sidebar Loaded/Reloaded with vector SVG loading
- SRC-first image pipeline (no global raster fallback when SRC has content)
- vectorPadding on all variant render paths
- Animation pause/resume preserves position
- Alt+click restart on Animate
- Alt+click reset on all controls (RotaryDial, Slider, ColorPicker, Dropdown)
- LOAD tab category dropdowns reflect loaded variant

### Known Issues
- Bus rendering pipeline not implemented (sends/returns UI wired, compositing not)
- sendA/sendB vs routeSendLevels['rtn-1'] not unified
- RTN→Ch and RTN→RTN knobs in routing matrix not wired

## Next Steps
1. Bus rendering pipeline (composite sends into bus canvases)
2. Unify send state (sendA/sendB → routeSendLevels)
3. Wire RTN→Ch and RTN→RTN in routing matrix
