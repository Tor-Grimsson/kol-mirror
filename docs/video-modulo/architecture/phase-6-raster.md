# Phase 6: Raster Bridge

The boundary where vector output becomes pixels. WebGL/shaders enter here.

## File Tree

```
src/videomodulo/
  hooks/
    useShaderPipeline.js       — new: WebGL context, render targets, texture management
  modules/
    effects/
      FeedbackModule.jsx       — new: first shader effect (video feedback loop)
    display/
      MonitorModule.jsx        — modified: accept raster/texture input for display
      OutputModule.jsx         — modified: accept raster/texture input layer
```

## The Bridge

Vector signals from L3/L4 get rasterized into a WebGL texture:
1. Canvas2D draws the vector output (already happening in L4)
2. Canvas element becomes a WebGL texture source
3. Shader pipeline processes the texture
4. Result renders to a render target or screen

## First Shader Effect

Pick one to establish the pattern:
- **Feedback**: read previous frame texture, blend with current, write back. Classic video feedback loop.
- **Blur**: Gaussian or directional blur as a post-process.

## Module Pattern

Raster effect modules:
- Input: texture (from upstream rasterization or another effect)
- Processing: WebGL shader
- Output: texture (render target for downstream)
- Knobs control shader uniforms

## Technical Decisions

- **Three.js vs raw WebGL**: Three.js for 3D geometry with lighting/textures. Thin wrapper or raw WebGL for 2D shader effects (less overhead).
- **Texture format**: RGBA8, matching Canvas2D output
- **Render target chain**: each effect writes to its own render target, next effect reads it

## Success Criteria

- Vector output from Phase 4 successfully enters a shader pipeline
- At least one shader effect processes the output in real-time
- The vector→raster boundary is clean (one well-defined conversion point)
- Effect modules follow the same registration/process pattern as L1-L4 modules
