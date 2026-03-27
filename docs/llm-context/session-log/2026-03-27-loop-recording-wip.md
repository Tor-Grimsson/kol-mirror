# Session: Loop Recording Feature (WIP)

**Date:** 2026-03-27
**Agent:** Claude Code (Opus 4.6)
**Summary:** Started per-channel loop recording feature for Symphony mixer — infrastructure done, save-to-slot flow broken.

## Changes Made

### Files Created
- `src/hooks/useChannelRecorder.js` — Recording hook using `captureStream(30)` + `MediaRecorder`. Produces WebM blob. Interface: arm/disarm/setMark1/setMark2/clear, exposes status/elapsed/blobUrl/blobSize/frozenParams.

### Files Modified
- `src/hooks/usePixiApp.js` — Added `preserveDrawingBuffer` option (third arg). Passes `webgl: { preserveDrawingBuffer }` to Pixi `app.init()`.
- `src/hooks/useMirrorState.js` — EMPTY_CHANNEL extended with `recSlots: [null, null, null, null]`, `activeRecSlot: null`, `isArmedForRec: false`.
- `src/components/hall-of-mirrors/PixiSliceVariant.jsx` — `preserveDrawingBuffer` prop passthrough to usePixiApp.
- `src/components/hall-of-mirrors/PixiGlitchSliceVariant.jsx` — Same.
- `src/components/hall-of-mirrors/PixiMorphVariant.jsx` — Same.
- `src/components/hall-of-mirrors/PixiRadialVariant.jsx` — Same.
- `src/components/hall-of-mirrors/PixiKaleidoscopeVariant.jsx` — Same.
- `src/components/mirror/ChannelLayer.jsx` — Added `ChannelVideo` component (loops `<video>` between mark1/mark2). Frozen video branch when `activeRecSlot` set. `onCanvasReady` callback via polling (120ms delay + 50ms retry for usePixiApp timing). Key-based Pixi remount on `isArmedForRec`.
- `src/components/mirror/VariantControls.jsx` — Added `disabledKeys` prop. Frozen controls render at `opacity: 0.3` with `pointerEvents: 'none'`.
- `src/components/mirror/SymphonyViewport.jsx` — Canvas registry (`canvasRegistryRef` Map), `useChannelRecorder` hook, recording orchestration handlers (arm/disarm/setMark/save/clear), slot management handlers (add/remove/upload/setActive/clearActive/updateTrim). Props wired to SymphonyMixer.
- `src/components/hall-of-mirrors/SymphonyMixer.jsx` — REC tab added to shelf (alongside PARAMS/SRC). Record controls: Duration dropdown + red dot toggle. Recording progress: progress bar, frame counter, In/Out mark buttons. Slot list: file info (name/size/codec/fps/resolution), trim sliders, [Download]/[Load]/[Remove]/[Upload] actions. "Recording complete" panel with [Save to Slot]/[Discard]. `[REC]` indicator on channel label. LoadButton dropdown uses `createPortal` to escape overflow clipping. A/B tab height: channels always rendered (visibility hidden) so B Output matches A height.

### Features Added
- **REC shelf tab**: Per-channel recording UI with duration selector, record toggle, progress, mark in/out
- **Recording slot system**: 4 empty slots per channel, expandable to 8, with upload/download/load/remove
- **Frozen video playback**: `<video>` element replaces live Pixi when a rec slot is active
- **Frozen params**: Controls greyed out when recording is loaded
- **B Output stable height**: Always rendered channels hold height, output overlays with absolute positioning

## Current State

### Working
- REC tab renders with Duration/Record controls
- Recording starts and runs (progress bar, frame counter, mark in/out buttons)
- Recording completes (MediaRecorder produces WebM blob)
- "Recording complete" panel shows with file size
- LoadButton dropdown no longer clipped by overflow (portal fix)
- B Output tab maintains A Channels height

### Known Issues
- **Save to Slot broken**: Clicking [Save to Slot] does not reliably persist the recording into the channel's `recSlots` state. Multiple attempts to fix closure/stale-ref issues in the save handler. Latest approach passes recData as argument instead of reading from recorder closure — needs verification.
- **Canvas detection timing**: `onCanvasReady` uses polling (120ms + 50ms retry) to work around usePixiApp's 100ms init delay. Fragile.
- **Existing channels**: Channels created before `recSlots` was added to EMPTY_CHANNEL have `recSlots: undefined`. The `|| []` fallback handles this but they won't show empty slot placeholders.
- **recState prop**: Still references `ch.recording` (removed field) in the mixer export Channel rendering — should reference `recSlots`/`activeRecSlot` instead.

## Next Steps
1. Fix Save to Slot — verify recData is passed correctly, add console.log debugging to trace the exact failure point
2. Fix recState prop in mixer export to not reference removed `ch.recording` field
3. Test full flow: record → save → slot appears with info → load → frozen → remove → live
4. Add frame-locked rendering mode (disconnect Pixi ticker from wall clock for perfect frame capture)
5. Clean up unused recorder state/effects
