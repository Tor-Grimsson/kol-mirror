# Session: Output Tab Wiring + Sidebar Loaded

**Date:** 2026-03-31
**Agent:** Claude Code (Opus 4.6)
**Summary:** Rewired Master Module so all 6 channel strips connect to actual state. Added A/B knob banks, wired bottom tabs to send/return data, wired shelf tabs to channel/bus/master data. Added "Loaded" to sidebar. Alt+click background toggle.

## Changes Made

### Files Modified
- `src/components/mixer/ChannelMaster.jsx` — Replaced `knobs` prop with `knobsA`/`knobsB`. A/B buttons toggle knob bank visibility: neither = first 2 knobs, A = bank A (3), B = bank B (3), both = all 6. Renamed internal state to `bankA`/`bankB` to avoid confusion with bus A/B.
- `src/components/hall-of-mirrors/MasterModule.jsx` — Full rewire. Removed local enable states (ch1Enabled-ch5Enabled, auxEnabled). Added readFx/writeFx helpers, buildChannelKnobs (INT,HUE,SAT / BRT,CTR,BLR), buildFxKnobs (HUE,SAT,BRT / CTR,BLR,INV). Ch 1-3 read/write channels[i] state. RTN 1-2 read/write busA/busB. MST reads/writes master. Bottom tabs: AUX SND (sendA knobs), FX SND (sendB knobs), AUX RTN (busA level/blend/solo), FX RTN (busB level/blend/solo). Shelf tabs: FILES (customImageName + recSlots), FX (interactive FxList per channel + master), COLOR (ColorPicker + Dropdown per channel), MST (opacity/blend/FX), AUX/FX (full RTN 1-2 controls). Added FxList component, Indicated component, BLEND_OPTIONS constant.
- `src/components/mirror/SymphonyViewport.jsx` — Added handleLoaded function (loads random variant into Ch 1 only). Exposed on state.symphonyLoaded.
- `src/components/mirror/MirrorSidebar.jsx` — Added "Loaded [Random]" row above "Reloaded [Random]" in symphony controls section.
- `src/components/hall-of-mirrors/SymphonyMixer.jsx` — Alt+click "Background" label toggles transparent/black. Label dims when transparent.

### Architecture Decisions
- **A/B banks are local to ChannelMaster**: Each strip manages its own bank toggle state. MasterModule passes full knobsA/knobsB arrays, the strip decides what to show.
- **readFx/writeFx as pure functions**: Stateless helpers that read from and produce new FX arrays. Used by buildChannelKnobs and buildFxKnobs to construct knob configs on each render.
- **Channel knobs vs bus/master knobs**: Channels get INT as first knob (bank A). Buses and master get INV instead (bank B) since they don't have an "intensity" concept.
- **Loaded vs Reloaded**: Loaded = load random variant into Ch 1 only (lightweight). Reloaded = randomize everything across all 3 channels (variant + colors + blend + FX + vector).

### Documentation Updated
- `docs/output-tab-workplan.md` — Marked Phases 1-3 as done, updated current state, kept Phase 4-5 as remaining work.
- `docs/video-synth-mixer-plan.md` — Updated roadmap status, added Output Tab parallel track, updated signal flow diagram, added Key Files section, added Future: Modular Extensions section.
- `docs/llm-context/AGENT-CONTEXT.md` — Added session 6 changes, updated Active Work descriptions.

## Current State

### Working
- All 6 Master Module strips wired to real state
- A/B knob banks on all strips (6 knobs each)
- All 4 bottom tabs functional (AUX/FX send/return)
- All 5 shelf tabs functional (FILES, FX, COLOR, MST, AUX/FX)
- Sidebar Loaded/Reloaded
- Background alt+click toggle

### Not Yet Working
- Bus rendering pipeline (sends don't produce video yet)
- Send data not unified (sendA/sendB vs routeSendLevels)
- RTN→Ch and RTN→RTN knobs in routing matrix
