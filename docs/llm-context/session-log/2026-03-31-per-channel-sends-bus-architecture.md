# Session: Per-Channel Sends, Bus Architecture, Alt+Click Reset

**Date:** 2026-03-31
**Agent:** Claude Code (Opus 4.6)
**Summary:** Rewired bottom tabs to per-channel send view (CH1-3, RTN1-2, MST), expanded to 6 buses (AUX 1-2, RTN 1-2, FX 1-2), added universal alt+click reset to all controls, fixed signal path and animation issues.

## Changes Made

### Files Modified
- `src/hooks/useMirrorState.js` — Added EMPTY_SENDS { aux1, aux2, rtn1, rtn2, fx1, fx2 }. EMPTY_CHANNEL now has `sends` object. Master state expanded: rtn1, rtn2, aux1, aux2, fx1, fx2 bus objects + inserts array. Added symphonyRestartKey state.
- `src/components/hall-of-mirrors/MasterModule.jsx` — Bottom tabs rewritten: CH1|CH2|CH3|RTN1|RTN2|MST. All tabs show same 6 send knobs layout (AUX1, AUX2, RTN1, RTN2, FX1, FX2). Channel tabs write to channel.sends, RTN/MST tabs write to bus.sends. AUX/FX shelf button moved up with other shelf buttons. RTN strips now use master.rtn1/rtn2 instead of busA/busB. Knob banks simplified: single `knobs` array (6 items), A/B pages through pairs. Indicated dot fixed to left: -2px.
- `src/components/mixer/ChannelMaster.jsx` — Simplified from knobsA/knobsB to single `knobs` array. Bank state: 0=default (knobs 1-2), 1=A (knobs 3-4), 2=B (knobs 5-6). Always 2 knobs visible. Enable dot left: -2px.
- `src/components/hall-of-mirrors/RoutingMatrix.jsx` — RTN reads from master.rtn1/rtn2 instead of busA/busB.
- `src/components/mirror/SymphonyViewport.jsx` — handleLoaded resets vectorPadding to 0. Fixed rasterForChannel: channels with customImageSrc use own raster, not global fallback. Pass restartKey to ChannelLayer.
- `src/components/mirror/MirrorSidebar.jsx` — Alt+click Animate bumps restartKey (restarts all animations).
- `src/components/mirror/ChannelLayer.jsx` — vectorPadding merged into fxStyle transform (works on all variant paths). restartKey in component keys forces remount on restart.
- `src/components/hall-of-mirrors/MovementVariant.jsx` — play() → resume() for position-preserving pause/unpause.
- `src/components/hall-of-mirrors/SymphonyMixer.jsx` — Loaded refresh loads vector SVG. LOAD tab dropdowns show selected variant. Background alt+click toggle on whole row.
- `src/components/hall-of-mirrors/RotaryDial.jsx` — Alt+click resets to defaultValue (falls back to min).
- `src/components/atoms/Slider.jsx` — Alt+click resets to defaultValue (falls back to min).
- `src/components/atoms/ColorPicker.jsx` — Alt+click resets to defaultValue. Skips opening picker on alt+click.
- `src/components/molecules/Dropdown.jsx` — Alt+click resets to defaultValue.
- `docs/video-synth-mixer-plan.md` — Unified plan absorbing output-tab-workplan.
- `docs/documentation/mirrors/signal-path.md` — Updated with frame buffer, buses, routing.
- `docs/documentation/mirrors/symphony-mixer.md` — Full rewrite for current architecture.
- `docs/documentation/components/components-list.md` — Added new components and hooks.

### Features Added
- **Per-channel bottom tabs** — CH1|CH2|CH3|RTN1|RTN2|MST, each showing 6 send knobs
- **6-bus architecture** — AUX 1-2 (general), RTN 1-2 (return to channels), FX 1-2 (effects)
- **A/B knob page switching** — Default=knobs 1-2, A=knobs 3-4, B=knobs 5-6
- **Universal alt+click reset** — RotaryDial, Slider, ColorPicker, Dropdown
- **Alt+click animation restart** — Remounts all variants from beginning
- **Animation position preserved** — Movement resume() instead of play()
- **SRC-first image pipeline** — No global raster fallback when channel has customImageSrc
- **vectorPadding on all variants** — Merged into fxStyle transform
- **LOAD tab variant selection** — Dropdowns reflect currently loaded variant
- **Loaded loads vector SVG** — Both sidebar and LOAD tab refresh

## Current State

### Working
- Per-channel send view in bottom tabs (6 knobs: AUX1, AUX2, RTN1, RTN2, FX1, FX2)
- All tabs (CH, RTN, MST) show identical 6-knob send layout
- 6 bus objects in master state (aux1, aux2, rtn1, rtn2, fx1, fx2)
- RTN strips use rtn1/rtn2 state (not busA/busB)
- A/B knob paging on all master strips
- Alt+click reset on all controls
- Animation pause/resume preserves position
- Alt+click Animate restarts from beginning

### Known Issues
- busA/busB still exist in master state (legacy, not removed yet)
- Bus rendering pipeline not implemented (sends wired, compositing not)
- sendA/sendB still on EMPTY_CHANNEL (legacy alongside new sends object)
- RTN→Ch and RTN→RTN knobs in routing matrix not wired

## Next Steps
1. Clean up legacy state (remove busA/busB, sendA/sendB)
2. Bus rendering pipeline (composite sends into bus canvases)
3. Wire routing matrix RTN knobs
4. Master inserts with wet/dry (moved to shelf, not bottom tab)
