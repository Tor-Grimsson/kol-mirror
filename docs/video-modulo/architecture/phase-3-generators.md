# Phase 3: Generators ✓

L3 modules that convert scalar control signals into vector data.

**Status:** Complete (2026-04-02). Extended with Noise, Ramp, SMX3 color matrix.

## File Tree

```
src/videomodulo/
  modules/
    generators/
      RGBOscillatorModule.jsx  — 3-channel color vector output
      WaveformModule.jsx       — math function → path data
      WireframeModule.jsx      — parametric 3D geometry → projected points
```

## Modules

### RGB Oscillator
- 3 scalar inputs (R, G, B) or internal LFOs per channel
- Rate/phase/offset per color channel
- Output: color vector `{ type: 'color', r, g, b }`
- Produces a color value per frame driven by input signals

### Waveform Generator
- Function input (scalar drives waveform shape)
- Amplitude, frequency, phase knobs
- Output: path data `{ type: 'path', commands: [...] }` or point array
- Generates drawable waveform from math

### 3D Wireframe
- Parametric geometry (sphere, torus, cube, custom)
- Rotation inputs (X, Y, Z) from scalar signals
- Projection: perspective divide, no GPU
- Output: point array `{ type: 'points', data: [...] }` with line connectivity
- Resolution knob (vertex count)

## Signal Flow

```
L1/L2 scalars → Generator inputs → Vector output → L4 display
```

Generators don't render anything. They produce data structures that display modules draw.

## Success Criteria

- RGB oscillator driven by LFO produces smoothly changing color vectors
- Waveform generator outputs drawable path data
- 3D wireframe rotates via patched scalar inputs
- All outputs are plain JS objects, no canvas/GPU involvement
