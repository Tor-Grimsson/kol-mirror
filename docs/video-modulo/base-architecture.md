# Video Modulo — Base Architecture

## Context

Sessions 10-11 built 36+ modules across two eurorack-style cases. The system hit a wall: modules used different rendering backends (Canvas2D, Three.js, Pixi.js) and communicated only via scalar values (0-100) through `useSignalBus`. Video synthesis requires pixel-level signal flow, and the multi-dependency approach created conversion overhead and instability at every module boundary.

## Key Insight

Analog video synths work because voltage IS the signal — every module speaks the same language. Conversion only happens at the display. The same principle applies here: the signal path should be pure math. Pixels and shaders are display-stage concerns, not signal-stage.

## Architecture — Layered Signal Model

### Level 1: Signal Generation (JS numbers)
Clock, LFO, envelope, sequencer, logic, gate — pure math producing scalar values per frame. This is the existing `useSignalBus` approach and it works.

### Level 2: Connectivity / Functions (JS math)
Modules that combine signals: VCA (multiply), mixer (add), logic (boolean), gate (threshold), attenuator (scale). Input A + Input B = Output C. Still pure numbers.

### Level 3: Generators (math → vector data)
Signals from L1/L2 drive generators that produce drawable output:
- **RGB oscillator**: 3 functions → color vectors
- **Waveform generator**: function → path data (points, lines)
- **3D geometry**: parametric functions → vertices → 2D projection (perspective divide). Wireframe/point-cloud is vector drawing, no GPU needed.

### Level 4: Display (vector rendering)
Canvas2D draws the output: `moveTo`/`lineTo` for waveforms and wireframes, fills for color fields, paths for curves. Resolution-independent, low CPU cost.

### Level 5: Raster Effects (future — shaders enter here)
When per-pixel processing is needed — dithering, keying, blur, feedback, texture mapping, mixing with images/video — the vector output gets rasterized into a GPU texture and enters a WebGL shader pipeline. This is the stage boundary where Three.js/raw WebGL becomes relevant.

## Dependencies by Level

| Level | Dependencies | Notes |
|-------|-------------|-------|
| L1-L2 | None (pure JS) | requestAnimationFrame loop, shared bus ref |
| L3 | None (pure JS) | Math functions, projection matrices |
| L4 | Canvas2D | Built into every browser, no library |
| L5 | WebGL / Three.js | Three.js for 3D geometry with lighting/textures. Raw WebGL or thin wrapper for 2D shader effects |

## Signal Format

- **Control signals**: JS numbers (0-100 range), published to `busRef.current[key]`
- **Video signals**: Vector data — arrays of points, color tuples, path descriptions
- **Raster signals (L5 only)**: WebGL textures / render targets

## Module Categories

### Utility (L1) — pure JS, scalar output
Clock, LFO, Envelope (ADSR), Sequencer, Gate, Logic (AND/OR/XOR), Sample & Hold

### Combinators (L2) — pure JS, scalar output
VCA (multiply), Mixer (add/avg/max/min), Multiples (split), Attenuator (scale/offset), Comparator, Switch

### Generators (L3) — JS math, vector output
RGB Oscillator, Waveform Generator, Ramp Generator, Noise (algorithmic), 3D Geometry (wireframe/points)

### Display (L4) — Canvas2D
Monitor (waveform scope + video display), Output

### Effects (L5 future) — WebGL shaders
Dither, Blur, Key, Feedback, Color matrix, Pixel sort

## What Exists vs What Changes

### Keep (works correctly)
- `useSignalBus.js` — scalar bus for L1/L2 signals
- `useExpressionValue.js` — expression engine with math helpers
- `usePatchRouting.jsx` — patch cable routing context
- `PatchCableOverlay.jsx` — SVG cable visualization
- `JackSocket.jsx` — jack UI with drag-to-connect
- Control module logic (clock, LFO, envelope, sequencer timing code)

### Rewrite for Case 03
- Modules rebuilt as math-only signal processors (no hidden canvases, no rendering backends)
- Monitor module rewritten as vector display (Canvas2D drawing evaluated signals)
- New RGB generator module outputting color vectors
- New 3D geometry module using projection math (no Three.js)
- Topological render order from patch connections

### Defer to L5
- All 20 video processing modules from Case 02 (need shader rewrite)
- Dither engine (per-pixel operation)
- Pixi.js integration
- Three.js lit/textured surfaces
- Image/video input and processing

## Case Organisation

| Case | Purpose | Status |
|------|---------|--------|
| Case 01 | Original scalar signal modules (reference) | Preserved |
| Case 02 | Video processing modules (reference) | Preserved |
| Case 03 | Pure math/vector base — proof of concept | New |

## Roadmap

### Phase 1: Foundation (Case 03)
- Set up case-03 entry point and page
- Build core render loop: topological sort → evaluate → draw
- Implement vector signal format (points, colors, paths)

### Phase 2: Control Modules
- Port clock, LFO, envelope, sequencer to case-03 (minimal UI, math-focused)
- Verify signal bus connectivity between modules

### Phase 3: Generators
- RGB oscillator: L1/L2 signals → color vector output
- Waveform generator: function → drawable path
- 3D wireframe: parametric geometry → projected points → lines

### Phase 4: Display
- Monitor module: Canvas2D rendering of vector signals
- Multiple display modes (scope, color field, wireframe view)

### Phase 5: Patch & Play
- Wire up a reference patch (clock → LFO → RGB → monitor)
- Verify zero-conversion signal flow
- Performance baseline

### Phase 6: Raster Bridge (L5)
- WebGL render target from vector output
- First shader effect (e.g. feedback or blur)
- Establish the vector→raster boundary protocol

### Phase 7: Integration
- Connect to existing channel/mixer system (master output, sends, returns)
- Three.js for lit 3D surfaces
- Image/video input modules
