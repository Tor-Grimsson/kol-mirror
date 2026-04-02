# Phase 4: Display ✓

L4 modules that render vector signals to Canvas2D.

**Status:** Complete (2026-04-02). Monitor with scope trace, wireframe lines, waveform polyline, lo-fi toggle. OutputModule with 4-layer compositing. Shared drawSignal.js primitives.

## File Tree

```
src/videomodulo/
  hooks/
    signals.js                 — modified: add edges array to points signal type
  modules/
    generators/
      WireframeModule.jsx      — modified: emit edge connectivity with points
    display/
      MonitorModule.jsx        — modified: scope trace, wireframe lines, waveform polyline
      OutputModule.jsx         — new: final composited display, background control
```

## Modules

### Monitor
- Accepts any signal type (scalar, color, points, path)
- Display modes based on input type:
  - Scalar: oscilloscope trace (value over time)
  - Color: filled rectangle showing the color
  - Points: dot plot on 2D canvas
  - Path: stroke the path commands
- Canvas2D rendering, resolution-independent
- Resizable within module panel

### Output
- Final display destination
- Composites multiple inputs (layered drawing)
- Background color control
- Full-size canvas in the rack or breakout view

## Rendering Approach

Canvas2D only at this level:
- `moveTo`/`lineTo` for wireframes and waveforms
- `fillRect`/`arc` for color fields and points
- `stroke` for paths
- No WebGL, no Pixi, no Three.js

## Success Criteria

- Monitor displays all signal types correctly
- Waveform path renders as smooth lines
- 3D wireframe renders as connected line segments
- Color vector fills the monitor area
- Scalar shows a live-updating scope trace
