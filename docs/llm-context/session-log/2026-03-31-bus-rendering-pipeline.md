# Session: Bus Rendering Pipeline (Chunk 3)

**Date:** 2026-03-31
**Agent:** Claude Code (Opus 4.6)
**Summary:** Implemented the bus rendering pipeline — channels with non-zero sends now composite into bus OffscreenCanvases and render as visible canvas layers in the viewport. Also added signal bus for expression engine, generator state/UI scaffolding, and cleaned up legacy state (busA/busB, sendA/sendB removed).

## Changes Made

### Files Modified
- `src/hooks/useFrameBuffer.js` — Added `busBuffersRef` (Map of OffscreenCanvas per bus), `ensureBusBuffer()`, `compositeBuses(channels, buses)` (iterates 6 bus keys, composites channel frames at send level opacity), `getBusFrame(key)`. Cleanup in unmount effect.
- `src/components/mirror/SymphonyViewport.jsx` — Added `BusLayer` component (renders bus output as visible `<canvas>` with CSS FX, blend mode, returnLevel opacity). Added `busCanvasMapRef` + `registerBusCanvas` callback for zero-delay canvas copy. Extended rAF loop: `captureAll` -> `compositeBuses` -> copy to visible canvases. Added `hasSends` check to activate loop when any channel has bus sends. Renders `BusLayer` for all 6 bus keys inside master output wrapper. Added `signalBus` integration and `generatorState` prop passthrough.
- `src/components/mirror/ChannelLayer.jsx` — Added `hasBusSends` check: DOM capture activates when channel has non-zero sends (not just when armed for recording), ensuring frame buffer has source frames for bus compositing.
- `src/hooks/useMirrorState.js` — Removed `sendA`/`sendB` from EMPTY_CHANNEL (unified `sends` object only). Removed `busA`/`busB` from master state (6 named buses only: aux1, aux2, rtn1, rtn2, fx1, fx2). Added `generatorState`/`setGeneratorState` with LFO, sequencer, logic gate, oscillator presets.
- `src/hooks/useExpressionValue.js` — Extended expression HELPERS with `bus` object access: `lfo1`, `lfo2`, `seq1`, `gate1` available as expression variables. `compile()` and rAF loop now pass `busRef.current` as 5th argument. Hook accepts `busRef` option.
- `src/hooks/useSignalBus.js` — New hook. Shared mutable ref (`busRef`) for generator signal values. `publish(key, value)` and `reset()` methods. Initial keys: lfo1, lfo2, seq1, gate1.
- `src/components/hall-of-mirrors/SymphonyMixer.jsx` — Passes `busRef` and `generatorState`/`onGeneratorChange` to mixer. GeneratorTab imported.
- `src/components/hall-of-mirrors/RoutingMatrix.jsx` — Minor update for bus state key access.

### New Files
- `src/hooks/useSignalBus.js` — Signal bus hook for shared generator values
- `src/components/hall-of-mirrors/generators/GeneratorTab.jsx` — Generator tab UI scaffold
- `src/components/hall-of-mirrors/generators/LFOModule.jsx` — LFO module component
- `src/components/hall-of-mirrors/generators/SequencerModule.jsx` — Step sequencer module component
- `src/components/hall-of-mirrors/generators/LogicGateModule.jsx` — Logic gate module component

### Features Added
- **Bus compositing pipeline** — 6 buses (aux1/2, rtn1/2, fx1/2) composite channel frames weighted by send levels into OffscreenCanvases
- **BusLayer rendering** — Bus output rendered as visible canvas with CSS FX, blend mode, and returnLevel opacity
- **Zero-delay rAF loop** — Single animation frame: capture channels -> composite buses -> blit to visible canvases
- **DOM capture for sends** — Channels with non-zero bus sends activate DOM capture (not just recording-armed channels)
- **Lazy bus allocation** — Bus buffers only created when bus is enabled + has sends + returnLevel > 0
- **Signal bus** — Shared ref for LFO/sequencer/gate values, readable in expressions
- **Expression bus variables** — `lfo1`, `lfo2`, `seq1`, `gate1` available in expression strings
- **Generator state** — LFO x2, sequencer, logic gate, oscillator x2 presets in global state
- **Generator UI scaffold** — GeneratorTab with LFOModule, SequencerModule, LogicGateModule
- **Legacy cleanup** — Removed busA/busB from master, sendA/sendB from channels

## Current State

### Working
- Bus compositing renders channel frames into per-bus OffscreenCanvases at correct send levels
- BusLayer canvases appear in viewport with CSS FX, blend mode, returnLevel opacity
- Single rAF loop handles capture + compositing + visible canvas update
- DOM capture auto-activates for channels with bus sends
- Buses only allocate/render when needed (enabled + sends > 0 + returnLevel > 0)
- Expression engine can read signal bus values (lfo1, lfo2, seq1, gate1)
- Legacy busA/busB and sendA/sendB removed cleanly

### Known Issues
- Generator modules (LFO, sequencer, gate) are UI scaffolds — not yet publishing to signal bus
- Oscillator generators not yet implemented (state exists, no rendering)
- Bus FX chain applied via CSS filters on BusLayer (not canvas-level processing)
- RTN->Ch and RTN->RTN routing matrix knobs still not wired
- Cross-channel routing via routeSendLevels not yet unified with sends object

## Next Steps
1. Wire generator modules to actually publish values to signal bus via rAF
2. Chunk 4: Unify sends + routeSendLevels, wire RTN->Ch routing in matrix
3. Chunk 5: Feedback loops (decay/mix/freeze controls)
4. Generator rendering: oscillator patterns to canvas
