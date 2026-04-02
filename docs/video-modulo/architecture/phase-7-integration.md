# Phase 7: Integration

Connect Video Modulo to the broader system.

## File Tree

```
src/videomodulo/
  modules/
    generators/
      ImageInputModule.jsx     — new: static image as texture source
      VideoInputModule.jsx     — new: webcam/video file as live source
      ChannelCaptureModule.jsx — new: grab mixer channel output
      Geometry3DModule.jsx     — new: Three.js lit surfaces with texture mapping
    effects/
      DitherModule.jsx         — new: 23-mode dither engine (from kol-radar)
      KeyModule.jsx            — new: chroma/luma keying
      ColorMatrixModule.jsx    — new: color transforms
      PixelSortModule.jsx      — new: directional pixel sorting
      DatamoshModule.jsx       — new: frame blending/corruption
  hooks/
    useShaderPipeline.js       — from phase 6
  VideoModulo.jsx              — modified: layout for new modules
  patches.js                   — modified: patches using new modules
```

## Channel/Mixer Connection

- Video Modulo output becomes a routable source in the Symphony mixer
- Modules can feed into mixer channels (as image/canvas sources)
- Mixer sends can route back into Video Modulo as texture inputs

## Image/Video Input Modules

- **Image input**: load a static image as a texture, output as raster signal
- **Video input**: webcam or video file as a live texture source
- **Channel capture**: grab a mixer channel's rendered output as input

## Three.js 3D Surfaces

- Lit geometry (not just wireframe) using Three.js
- Texture mapping from other module outputs
- Camera control via scalar inputs

## Extended Effects (L5)

Port deferred effects from the concept doc:
- Dither (23 modes from kol-radar engine)
- Key (chroma/luma keying)
- Color matrix
- Pixel sort
- Datamosh

## Success Criteria

- Bidirectional signal flow between Video Modulo and Symphony mixer
- External media (images, video, webcam) usable as signal sources
- 3D rendered surfaces with dynamic textures
- Multiple chained L5 effects processing in real-time
