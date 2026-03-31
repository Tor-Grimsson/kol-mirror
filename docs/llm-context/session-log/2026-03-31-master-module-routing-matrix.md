# Session: Master Module + Routing Matrix + Video Synth Architecture

**Date:** 2026-03-31
**Agent:** Claude Code (Opus 4.6)
**Summary:** Built Master Module with channel strips, vertical faders, routing matrix, frame buffer system for cross-channel routing, and video synth architecture plan.

## Changes Made

### Files Created
- `src/components/mixer/ChannelMaster.jsx` — Reusable channel strip: 2 knobs + custom vertical fader (pointer drag, no rotation) + channel button + A/B bus buttons + indicator dot. Props: label, knobs, faderValue, onFaderChange, enabled, onEnabledChange, onReset, accent color.
- `src/components/hall-of-mirrors/MasterModule.jsx` — Master output module: header with enable indicator, 6 channel strips (Ch 1-3, RTN 1-2, MST) with vertical dividers, AUX SEND section with per-channel send knobs + indicators, shelf buttons.
- `src/components/hall-of-mirrors/RoutingMatrix.jsx` — NxN routing matrix: signal source dropdowns, send matrix with RotaryDial knobs, per-channel output controls (level, blend, enable).
- `src/hooks/useFrameBuffer.js` — Frame buffer system: OffscreenCanvas per channel, captureAll() loop, getChannelFrame(), resolveRenderOrder() topological sort.
- `docs/video-synth-mixer-plan.md` — Full architecture plan: 5 chunks (routing, feedback, generators, FX modules, modulators), signal flow diagram.

### Files Modified
- `src/hooks/useMirrorState.js` — Expanded symphonyMaster state: enabled, opacity (default 80), blendMode, fx, busA/busB (enabled, returnLevel, fx, blendMode, solo). Added sendA, sendB, routeFrom, routeSendLevels to EMPTY_CHANNEL.
- `src/components/hall-of-mirrors/SymphonyMixer.jsx` — Output tab renders MasterModule + RoutingMatrix. Added imports.
- `src/components/mirror/SymphonyViewport.jsx` — Integrated useFrameBuffer, frame capture loop (runs when routing active), passes getChannelFrame to ChannelLayer.
- `src/components/mirror/ChannelLayer.jsx` — Added getChannelFrame prop, routed input resolution (routeFrom → frame buffer → data URL → resolved image source).
- `src/components/hall-of-mirrors/RotaryDial.jsx` — Added DIAL_VARIANTS with default/dense. Dense: knobRatio 0.85, tickSize 40, smaller tick gap/lengths, no top offset. Variant prop on component.
- `src/styles/components.css` — Added .slider-fader class (vertical fader thumb styling, unused now — replaced by custom div fader).

### Features Added
- **Master Module**: 6-channel mixer strip layout (3 channels + 2 returns + master) with vertical dividers
- **ChannelMaster component**: Reusable channel strip with knobs, custom vertical fader, channel button, A/B bus toggles, enable indicator
- **Custom vertical fader**: Pointer drag (no input range rotation), track marks (7 levels, 80% unity highlighted), rectangular thumb
- **Routing Matrix**: Per-channel source selection, NxN send matrix with knobs, output controls
- **Frame buffer system**: Cross-channel routing infrastructure (OffscreenCanvas capture, render order)
- **AUX SEND section**: Per-channel send knobs with indicators, tab banner
- **Indicated component**: Reusable indicator dot wrapper for knobs
- **RotaryDial dense variant**: Smaller knob for master module use

## Current State

### Working
- Master Module with 6 channel strips in Output tab
- Channel strips with knobs, faders, buttons, indicators
- Vertical fader with custom pointer drag
- Routing Matrix with source selection and send matrix
- AUX SEND section with per-channel knobs
- Independent enable states per channel
- Frame buffer infrastructure (capture loop, render order)

### Known Issues
- Cross-channel routing not yet rendering (frame buffer captures but ChannelLayer data URL approach needs optimization)
- RotaryDial dense variant tick marks can clip at edges
- Vertical fader thumb may not render (bg-surface-on-primary class vs inline style)
- Bus return rendering in SymphonyViewport not implemented yet

## Next Steps
1. Wire frame buffer routing to actually render cross-channel output
2. Implement bus return layers in SymphonyViewport
3. Build feedback loop controls (decay, mix, freeze)
4. Add generators (noise, gradient, pattern variants)
5. Extract Channel component from SymphonyMixer to its own file
