# Phase 1: Foundation ✓

Set up the core engine that all modules plug into.

**Status:** Complete (2026-04-02)

## File Tree

```
src/videomodulo/
  hooks/
    signals.js                 — signal type definitions and helpers
    useRenderLoop.js           — rAF loop, topological sort, module evaluation
    useModuleRegistry.js       — module registration/unregistration
    usePatchRouting.js         — patch cable connection state
  modules/
    utility/
      JackSocket.jsx           — 3.5mm jack socket, drag-to-connect
      PatchCableOverlay.jsx    — SVG catenary patch cables
      Case.jsx                 — existing
      Module.jsx               — existing
      BlankPanel.jsx           — existing
      eurorack.js              — existing
    control/
      ConstantModule.jsx       — test source, one knob, scalar output
    display/
      MonitorModule.jsx        — test sink, Canvas2D, multi-type display
  VideoModulo.jsx              — existing, updated to wire up render loop
```

## Deliverables

### 1. Signal Format (`hooks/signals.js`)

Define the data types that travel through patch cables:

- **Scalar**: JS number (0-100 range) — control signals (L1/L2)
- **Vector**: structured object — generator output (L3)
  - Color tuple: `{ type: 'color', r, g, b }` or array of color values
  - Point array: `{ type: 'points', data: [{x, y}, ...] }`
  - Path: `{ type: 'path', commands: [{op, ...args}, ...] }`

Simple JS objects, no classes. Type field for runtime discrimination.

### 2. Module Registration Pattern

Each module exports a descriptor:

- `id` — unique string
- `inputs` — array of named input jacks (with expected signal type)
- `outputs` — array of named output jacks (with signal type)
- `process(inputs, state, dt)` — called each frame, returns output values
- `ui` — React component for the front panel

Modules register with the render loop on mount, unregister on unmount.

### 3. Render Loop (`hooks/useRenderLoop.js`)

Owns the `requestAnimationFrame` loop. Each frame:

1. Read current patch connections (from patch routing context)
2. Topological sort modules by dependency (upstream before downstream)
3. Call `process()` on each module in order, passing connected input values
4. Modules write outputs to a frame-local value map
5. Display modules read from the map and draw

Handles circular dependencies with 1-frame delay (use previous frame's output).

### 4. Patch Infrastructure (own copies)

Video Modulo's own jack socket and patch cable components in `modules/utility/`:

- Jack socket with drag-to-connect
- Patch cable overlay (SVG catenary curves)
- Connection state management

### 5. Test Modules

Minimal source + sink to verify the loop:

- **Constant source** (`control/`): outputs a fixed scalar value, one knob to set it
- **Monitor** (`generators/` or `utility/`): receives any signal, draws it to a small Canvas2D — scalar as a bar, color as a swatch, points as dots

## Success Criteria

- rAF loop runs, modules evaluate in correct order
- Patching a constant source to a monitor shows the value updating
- Disconnecting a cable stops the signal
- Two modules in a chain (source → processor → monitor) evaluates correctly
