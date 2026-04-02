# Phase 5: Patch & Play ✓

Wire up a reference patch to verify the full signal chain works end-to-end.

**Status:** Complete (2026-04-02). PatchModule for save/load/clear. patches.js data file. initialConnections on PatchRoutingProvider. Frame timing in render loop. PatchCableOverlay draws initial connections on mount.

## File Tree

```
src/videomodulo/
  hooks/
    useRenderLoop.js           — modified: add frame timing measurement
  VideoModulo.jsx              — modified: default reference patch connections, layout
```

## Reference Patch

```
Clock → LFO (sync) → RGB Oscillator (R input) → Monitor (color mode)
                    → Waveform Generator (freq) → Monitor (scope mode)
```

## Verification

- **Zero-conversion flow**: scalars stay as numbers from clock through LFO. Vector data stays as JS objects from generator to monitor. No canvas-to-canvas, no texture uploads, no serialization.
- **Topological ordering**: clock evaluates first, LFO second (reads clock output), generators third, monitors last.
- **Circular dependency**: patch a monitor output back to a generator input. System uses 1-frame delay, no crash, no infinite loop.
- **Cable disconnect**: removing a cable mid-patch stops signal flow to downstream modules immediately.
- **Performance baseline**: measure frame time with 8+ modules patched. Target: under 2ms processing per frame (before display).

## Success Criteria

- A working patch produces animated color and waveform output
- Adding/removing cables dynamically updates the signal graph
- No rendering library involved in the signal path
- Frame budget leaves room for L5 raster effects later
