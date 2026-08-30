// --- Control descriptor helpers ---

const CHANNEL_OPTIONS = ['R', 'G', 'B', 'A'].map(c => ({ value: c, label: c }))

const WRAP_OPTIONS = [
  { value: 'clamp-to-edge', label: 'Clamp' },
  { value: 'repeat', label: 'Repeat' },
  { value: 'mirror-repeat', label: 'Mirror' },
]

const WRAP_CONTROL = { key: 'wrapMode', type: 'select', label: 'Edge', options: WRAP_OPTIONS, default: 'clamp-to-edge' }

function displacementControls({ baseFrequency, numOctaves, scale, seed }) {
  return [
    { key: 'animate', type: 'toggle', label: 'Animate', default: false },
    { key: 'speed', type: 'slider', label: 'Speed', min: 0.5, max: 5.0, step: 0.1, default: 3 },
    { key: 'baseFrequency', type: 'slider', label: 'Base Frequency', min: 0.001, max: 0.05, step: 0.001, default: baseFrequency },
    { key: 'numOctaves', type: 'slider', label: 'Octaves', min: 1, max: 4, step: 1, default: numOctaves },
    { key: 'scale', type: 'slider', label: 'Scale', min: 0, max: 100, step: 1, default: scale },
    { key: 'seed', type: 'slider', label: 'Seed', min: 0, max: 100, step: 1, default: seed },
    { key: 'turbulenceType', type: 'binary', label: 'Turbulence', options: [{ value: 'turbulence', label: 'Turbulence' }, { value: 'fractalNoise', label: 'Fractal Noise' }], default: 'turbulence' },
    { key: 'xChannelSelector', type: 'select', label: 'X Channel', options: CHANNEL_OPTIONS, default: 'R' },
    { key: 'yChannelSelector', type: 'select', label: 'Y Channel', options: CHANNEL_OPTIONS, default: 'G' },
  ]
}

const SLICE_CONTROLS = [
  { key: 'animate', type: 'toggle', label: 'Animate', default: false },
  { key: 'grab', type: 'toggle', label: 'Grab', default: false, visibilityKey: 'grabOutlineVisible' },
  { key: 'tileScaleX', type: 'slider', label: 'Tile Scale X', min: 0.1, max: 2.0, step: 0.1, default: 0.3 },
  { key: 'speed', type: 'slider', label: 'Speed', min: 0.1, max: 10, step: 0.1, default: 1 },
  { key: 'direction', type: 'select', label: 'Direction', options: [{ value: 'horizontal', label: 'Horizontal' }, { value: 'vertical', label: 'Vertical' }, { value: 'diagonal', label: 'Diagonal' }], default: 'horizontal' },
  WRAP_CONTROL,
]

const GLITCH_CONTROLS = [
  { key: 'animate', type: 'toggle', label: 'Animate', default: false },
  { key: 'grab', type: 'toggle', label: 'Grab', default: false, visibilityKey: 'grabOutlineVisible' },
  { key: 'sliceCount', type: 'slider', label: 'Slices', min: 5, max: 60, step: 1, default: 20 },
  { key: 'maxOffset', type: 'slider', label: 'Max Offset', min: 0, max: 200, step: 1, default: 50 },
  { key: 'speed', type: 'slider', label: 'Speed', min: 0.1, max: 5, step: 0.1, default: 1 },
  { key: 'smoothing', type: 'slider', label: 'Smoothing', min: 0, max: 1, step: 0.05, default: 0.1 },
  { key: 'direction', type: 'select', label: 'Direction', options: [{ value: 'horizontal', label: 'Horizontal' }, { value: 'vertical', label: 'Vertical' }], default: 'horizontal' },
  WRAP_CONTROL,
]

const MORPH_CONTROLS = [
  { key: 'animate', type: 'toggle', label: 'Animate', default: false },
  { key: 'grab', type: 'toggle', label: 'Grab', default: false, visibilityKey: 'grabOutlineVisible' },
  { key: 'scaleIntensity', type: 'slider', label: 'Intensity', min: 0.5, max: 5.0, step: 0.1, default: 1 },
  { key: 'speed', type: 'slider', label: 'Speed', min: 0.1, max: 5.0, step: 0.1, default: 1 },
  { key: 'waveform', type: 'select', label: 'Waveform', options: [{ value: 'sine', label: 'Sine' }, { value: 'triangle', label: 'Triangle' }, { value: 'square', label: 'Square' }, { value: 'sawtooth', label: 'Sawtooth' }], default: 'sine' },
  { key: 'shiftDirection', type: 'select', label: 'Shift', options: [{ value: 'none', label: 'None' }, { value: 'horizontal', label: 'Horizontal' }, { value: 'vertical', label: 'Vertical' }, { value: 'diagonal', label: 'Diagonal' }], default: 'diagonal' },
  WRAP_CONTROL,
]

const RADIAL_CONTROLS = [
  { key: 'animate', type: 'toggle', label: 'Animate', default: false },
  { key: 'grab', type: 'toggle', label: 'Grab', default: false, visibilityKey: 'grabOutlineVisible' },
  { key: 'radius', type: 'slider', label: 'Radius', min: 10, max: 300, step: 1, default: 50 },
  { key: 'tileScale', type: 'slider', label: 'Tile Scale', min: 0.1, max: 2.0, step: 0.05, default: 0.5 },
  { key: 'speed', type: 'slider', label: 'Speed', min: 0.1, max: 5.0, step: 0.1, default: 1 },
  { key: 'rotationDirection', type: 'binary', label: 'Rotation', options: [{ value: 'clockwise', label: 'CW' }, { value: 'counterclockwise', label: 'CCW' }], default: 'clockwise' },
  WRAP_CONTROL,
]

const KALEIDOSCOPE_CONTROLS = [
  { key: 'controlTab', type: 'tabs', options: [
    { value: 'main', label: 'Comp A', enableKey: 'mainEnabled', enableDefault: true, animateKey: 'animate' },
    { value: 'background', label: 'Comp B', enableKey: 'showBackground', enableDefault: false, animateKey: 'bgAnimate' },
  ], default: 'main' },
  { type: 'divider' },
  // Main controls
  { key: 'blendMode', type: 'select', label: 'Blend', options: [
    { value: 'normal', label: 'Normal' },
    { value: 'multiply', label: 'Multiply' },
    { value: 'screen', label: 'Screen' },
    { value: 'overlay', label: 'Overlay' },
    { value: 'add', label: 'Add' },
    { value: 'soft-light', label: 'Soft Light' },
    { value: 'difference', label: 'Difference' },
  ], default: 'normal', tab: 'main' },
  { key: 'grabSegment', type: 'toggle', label: 'Grab', default: true, tab: 'main', visibilityKey: 'grabOutlineVisible' },
  { key: 'segments', type: 'slider', label: 'Segments', min: 2, max: 24, step: 1, default: 6, tab: 'main' },
  { key: 'zoom', type: 'slider', label: 'Zoom', min: 0.5, max: 5.0, step: 0.1, default: 1.5, tab: 'main' },
  { key: 'sourceOffsetX', type: 'slider', label: 'Source X', min: -200, max: 200, step: 1, default: 0, tab: 'main' },
  { key: 'sourceOffsetY', type: 'slider', label: 'Source Y', min: -200, max: 200, step: 1, default: 0, tab: 'main' },
  { key: 'cutOffset', type: 'slider', label: 'Cut Offset', min: 0, max: 360, step: 1, default: 0, tab: 'main' },
  { key: 'segmentGap', type: 'slider', label: 'Segment Gap', min: -20, max: 20, step: 0.5, default: 0, tab: 'main' },
  { key: 'evenOffset', type: 'slider', label: 'Even Offset', min: -30, max: 30, step: 1, default: 0, tab: 'main' },
  { key: 'speed', type: 'slider', label: 'Speed', min: 0.1, max: 5.0, step: 0.1, default: 0.5, tab: 'main' },
  { type: 'divider', tab: 'main' },
  { key: 'mirrorMode', type: 'binary', label: 'Mirror', options: [{ value: 'alternating', label: 'Alternating' }, { value: 'all-same', label: 'All Same' }], default: 'alternating', tab: 'main' },
  { key: 'rotationDirection', type: 'binary', label: 'Rotation', options: [{ value: 'clockwise', label: 'CW' }, { value: 'counterclockwise', label: 'CCW' }], default: 'clockwise', tab: 'main' },
  { key: 'splitRotation', type: 'toggle', label: 'Split Rotation', default: false, tab: 'main' },
  { type: 'divider', tab: 'main' },
  { ...WRAP_CONTROL, tab: 'main', linkedDefaults: { edgeZoomScale: { 'clamp-to-edge': 1.0, '*': 0.15 } } },
  { key: 'edgeZoomScale', type: 'slider', label: 'Edge Zoom', min: 0.05, max: 1.0, step: 0.05, default: 1.0, tab: 'main' },
  { key: 'fillMode', type: 'select', label: 'Fill', options: [
    { value: 'none', label: 'None' },
    { value: 'repeat', label: 'Repeat' },
    { value: 'mirror-repeat', label: 'Mirror' },
    { value: 'clamp-to-edge', label: 'Clamp' },
  ], default: 'none', tab: 'main' },
  // Background controls (mirrors main)
  { key: 'bgBlendMode', type: 'select', label: 'Blend', options: [
    { value: 'normal', label: 'Normal' },
    { value: 'multiply', label: 'Multiply' },
    { value: 'screen', label: 'Screen' },
    { value: 'overlay', label: 'Overlay' },
    { value: 'add', label: 'Add' },
    { value: 'soft-light', label: 'Soft Light' },
    { value: 'difference', label: 'Difference' },
  ], default: 'normal', tab: 'background' },
  { key: 'bgGrabSegment', type: 'toggle', label: 'Grab', default: true, tab: 'background', visibilityKey: 'bgGrabOutlineVisible' },
  { key: 'bgSegments', type: 'slider', label: 'Segments', min: 2, max: 24, step: 1, default: 6, tab: 'background' },
  { key: 'bgZoom', type: 'slider', label: 'Zoom', min: 0.5, max: 5.0, step: 0.1, default: 1.5, tab: 'background' },
  { key: 'bgSourceOffsetX', type: 'slider', label: 'Source X', min: -200, max: 200, step: 1, default: 0, tab: 'background' },
  { key: 'bgSourceOffsetY', type: 'slider', label: 'Source Y', min: -200, max: 200, step: 1, default: 0, tab: 'background' },
  { key: 'bgCutOffset', type: 'slider', label: 'Cut Offset', min: 0, max: 360, step: 1, default: 0, tab: 'background' },
  { key: 'bgSegmentGap', type: 'slider', label: 'Segment Gap', min: -20, max: 20, step: 0.5, default: 0, tab: 'background' },
  { key: 'bgEvenOffset', type: 'slider', label: 'Even Offset', min: -30, max: 30, step: 1, default: 0, tab: 'background' },
  { key: 'bgSpeed', type: 'slider', label: 'Speed', min: 0.1, max: 5.0, step: 0.1, default: 0.5, tab: 'background' },
  { type: 'divider', tab: 'background' },
  { key: 'bgMirrorMode', type: 'binary', label: 'Mirror', options: [{ value: 'alternating', label: 'Alternating' }, { value: 'all-same', label: 'All Same' }], default: 'alternating', tab: 'background' },
  { key: 'bgRotationDirection', type: 'binary', label: 'Rotation', options: [{ value: 'clockwise', label: 'CW' }, { value: 'counterclockwise', label: 'CCW' }], default: 'clockwise', tab: 'background' },
  { key: 'bgSplitRotation', type: 'toggle', label: 'Split Rotation', default: false, tab: 'background' },
  { type: 'divider', tab: 'background' },
  { key: 'bgWrapMode', type: 'select', label: 'Edge', options: WRAP_OPTIONS, default: 'clamp-to-edge', tab: 'background', linkedDefaults: { bgEdgeZoomScale: { 'clamp-to-edge': 1.0, '*': 0.15 } } },
  { key: 'bgEdgeZoomScale', type: 'slider', label: 'Edge Zoom', min: 0.05, max: 1.0, step: 0.05, default: 1.0, tab: 'background' },
  { key: 'bgFillMode', type: 'select', label: 'Fill', options: [
    { value: 'none', label: 'None' },
    { value: 'repeat', label: 'Repeat' },
    { value: 'mirror-repeat', label: 'Mirror' },
    { value: 'clamp-to-edge', label: 'Clamp' },
  ], default: 'none', tab: 'background' },
]

function movementControls(type) {
  return [
    { key: 'animate', type: 'toggle', label: 'Animate', default: false },
    { key: 'speed', type: 'slider', label: 'Speed', min: 0.5, max: 5.0, step: 0.1, default: 2.5 },
    { key: 'amount', type: 'slider', label: 'Amount', min: 1.0, max: 2.0, step: 0.05, default: 1.3 },
    { key: 'easing', type: 'select', label: 'Easing', options: [
      { value: 'sine.inOut', label: 'Sine' },
      { value: 'power1.inOut', label: 'Quad' },
      { value: 'power2.inOut', label: 'Cubic' },
      { value: 'power3.inOut', label: 'Quart' },
      { value: 'expo.inOut', label: 'Expo' },
      { value: 'back.inOut', label: 'Back' },
      { value: 'elastic.inOut', label: 'Elastic' },
    ], default: 'sine.inOut' },
    { key: 'type', type: 'select', label: 'Type', options: [{ value: 'scale', label: 'Scale' }, { value: 'stretch', label: 'Stretch' }, { value: 'harmonica', label: 'Harmonica' }], default: type },
    { key: 'transformOrigin', type: 'select', label: 'Origin', options: [{ value: 'center center', label: 'Center' }, { value: 'top left', label: 'Top Left' }, { value: 'top right', label: 'Top Right' }, { value: 'bottom left', label: 'Bottom Left' }, { value: 'bottom right', label: 'Bottom Right' }], default: 'center center' },
  ]
}

// --- Variant definitions ---

export const DISPLACEMENT_VARIANTS = [
  { id: 'subtle-ripple', title: 'Subtle Ripple', tags: ['subtle', 'organic', 'slow'], intensityKeys: ['scale', 'baseFrequency'], controls: displacementControls({ baseFrequency: 0.005, numOctaves: 1, scale: 10, seed: 1 }) },
  { id: 'medium-wave', title: 'Medium Wave', tags: ['organic', 'wave', 'mid'], intensityKeys: ['scale', 'baseFrequency'], controls: displacementControls({ baseFrequency: 0.01, numOctaves: 2, scale: 20, seed: 2 }) },
  { id: 'heavy-distortion', title: 'Heavy Distortion', tags: ['heavy', 'harsh', 'distortion'], intensityKeys: ['scale', 'baseFrequency'], controls: displacementControls({ baseFrequency: 0.02, numOctaves: 3, scale: 40, seed: 3 }) },
  { id: 'fine-grain', title: 'Fine Grain', tags: ['subtle', 'texture', 'grain'], intensityKeys: ['scale', 'baseFrequency'], controls: displacementControls({ baseFrequency: 0.05, numOctaves: 4, scale: 15, seed: 4 }) },
  { id: 'liquid-surface', title: 'Liquid Surface', tags: ['organic', 'liquid', 'slow'], intensityKeys: ['scale', 'baseFrequency'], controls: displacementControls({ baseFrequency: 0.008, numOctaves: 2, scale: 30, seed: 5 }) },
  { id: 'animated-turbulence', title: 'Animated Turbulence', tags: ['organic', 'turbulence', 'motion'], intensityKeys: ['scale', 'baseFrequency'], controls: displacementControls({ baseFrequency: 0.01, numOctaves: 2, scale: 25, seed: 6 }) },
  { id: 'extreme-warp', title: 'Extreme Warp', tags: ['heavy', 'harsh', 'warp'], intensityKeys: ['scale', 'baseFrequency'], controls: displacementControls({ baseFrequency: 0.03, numOctaves: 4, scale: 60, seed: 7 }) },
  { id: 'glass-refraction', title: 'Glass Refraction', tags: ['optical', 'glass', 'refraction'], intensityKeys: ['scale', 'baseFrequency'], controls: displacementControls({ baseFrequency: 0.015, numOctaves: 3, scale: 35, seed: 8 }) },
]

export const COPIES_VARIANTS = [
  { id: 'pixi-slices', title: 'Slices', tags: ['geometric', 'slice', 'glitch'], intensityKeys: ['tileScaleX'], component: 'PixiSliceVariant', controls: SLICE_CONTROLS },
  { id: 'pixi-glitch', title: 'Glitch', tags: ['glitch', 'harsh', 'digital'], intensityKeys: ['maxOffset'], component: 'PixiGlitchSliceVariant', controls: GLITCH_CONTROLS },
  { id: 'pixi-morph', title: 'Morph', tags: ['organic', 'morph', 'motion'], intensityKeys: ['scaleIntensity'], component: 'PixiMorphVariant', controls: MORPH_CONTROLS },
  { id: 'pixi-radial', title: 'Radial', tags: ['geometric', 'radial', 'symmetry'], intensityKeys: ['radius'], component: 'PixiRadialVariant', controls: RADIAL_CONTROLS },
  { id: 'pixi-kaleidoscope', title: 'Kaleidoscope', tags: ['geometric', 'symmetry', 'kaleidoscope'], intensityKeys: ['zoom', 'segments'], component: 'PixiKaleidoscopeVariant', controls: KALEIDOSCOPE_CONTROLS },
]

export const MOVEMENT_VARIANTS = [
  { id: 'breathing-scale', title: 'Breathing Scale', tags: ['motion', 'breathing', 'slow'], intensityKeys: ['amount'], controls: movementControls('scale') },
  { id: 'breathing-stretch', title: 'Breathing Stretch', tags: ['motion', 'breathing', 'stretch'], intensityKeys: ['amount'], controls: movementControls('stretch') },
  { id: 'breathing-harmonica', title: 'Breathing Harmonica', tags: ['motion', 'breathing', 'rhythmic'], intensityKeys: ['amount'], controls: movementControls('harmonica') },
]

export const GENERATOR_VARIANTS = [
  /* Field — the generative-pattern module (user 2026-08-28). Six scalar
     fields sampled per pixel; `mode` picks which. Two-stop ramp between
     bgColor and color, so every mode is colourable without a palette system. */
  { id: 'gen-field', title: 'Field', tags: ['source', 'generator', 'pattern', 'organic', 'noise'], controls: [
    { key: 'mode', type: 'select', label: 'Mode', options: [
      { value: 'clouds', label: 'Clouds' },
      { value: 'sea', label: 'Sea' },
      { value: 'swirl', label: 'Swirl' },
      { value: 'voronoi', label: 'Voronoi' },
      { value: 'noise', label: 'Noise' },
      { value: 'stripes', label: 'Stripes' },
    ], default: 'clouds' },
    { type: 'divider' },
    { key: 'scale', type: 'slider', label: 'Scale', min: 1, max: 24, step: 0.5, default: 4 },
    { key: 'detail', type: 'slider', label: 'Detail', min: 1, max: 6, step: 1, default: 4 },
    { key: 'warp', type: 'slider', label: 'Warp', min: 0, max: 1, step: 0.05, default: 0.4 },
    { key: 'contrast', type: 'slider', label: 'Contrast', min: 20, max: 300, step: 5, default: 100 },
    { type: 'divider' },
    { key: 'motion', type: 'toggle', label: 'Motion', default: false },
    { key: 'speed', type: 'slider', label: 'Speed', min: 0, max: 3, step: 0.1, default: 1 },
    { type: 'divider' },
    { key: 'color', type: 'color', label: 'Color', default: '#ffffff' },
    { key: 'bgColor', type: 'color', label: 'Background', default: '#000000' },
  ] },
  /* Wave — the WAVE algorithm from the April videomodulo rack's GEN module, the
     one family that never crossed into mirror when the others did. A direction
     vector, a frequency along it, and a shaper. */
  { id: 'gen-wave', title: 'Wave', tags: ['source', 'generator', 'wave', 'pattern', 'geometric'], controls: [
    { key: 'shape', type: 'select', label: 'Shape', options: [
      { value: 'sin', label: 'Sine' },
      { value: 'saw', label: 'Saw' },
      { value: 'pls', label: 'Pulse' },
      { value: 'sqr', label: 'Square' },
      { value: 'rnd', label: 'Random' },
    ], default: 'sin' },
    { type: 'divider' },
    { key: 'freq', type: 'slider', label: 'Frequency', min: 1, max: 80, step: 1, default: 8 },
    { key: 'angle', type: 'slider', label: 'Angle', min: 0, max: 360, step: 1, default: 0 },
    { key: 'pwm', type: 'slider', label: 'PWM', min: 5, max: 95, step: 1, default: 50 },
    { key: 'contrast', type: 'slider', label: 'Contrast', min: 20, max: 300, step: 5, default: 100 },
    { type: 'divider' },
    { key: 'motion', type: 'toggle', label: 'Motion', default: false },
    { key: 'speed', type: 'slider', label: 'Speed', min: 0, max: 5, step: 0.1, default: 1 },
    { type: 'divider' },
    { key: 'fgColor', type: 'color', label: 'Foreground', default: '#ffffff' },
    { key: 'bgColor', type: 'color', label: 'Background', default: '#000000' },
  ] },
  /* Live input — camera or a video file. The raster source: frames arrive as
     pixels, so nothing is rasterised and there is no texture to re-bake. */
  { id: 'gen-live', title: 'Live Input', tags: ['source', 'live', 'camera', 'video'], controls: [
    { key: 'source', type: 'binary', label: 'Source', options: [
      { value: 'camera', label: 'Camera' },
      { value: 'file', label: 'Video File' },
    ], default: 'camera' },
    { key: 'deviceId', type: 'device', label: 'Device', default: '' },
    { type: 'divider' },
    { key: 'mirrored', type: 'slider', label: 'Mirror', min: 0, max: 1, step: 1, default: 1 },
    /* ON, unlike the procedural generators: their Motion knob picks between a
       still frame and an evolving one, but a camera with the draw loop off is
       not a still — it never draws at all, so the channel is just black. */
    { key: 'animate', type: 'toggle', label: 'Motion', default: true },
  ] },
  { id: 'gen-noise', title: 'Noise', tags: ['source', 'generator', 'noise', 'texture'], controls: [
    { key: 'noiseType', type: 'binary', label: 'Type', options: [
      { value: 'smooth', label: 'Clouds' },
      { value: 'snow', label: 'TV Snow' },
    ], default: 'smooth' },
    { key: 'colorMode', type: 'binary', label: 'Color', options: [
      { value: 'mono', label: 'Mono' },
      { value: 'color', label: 'Color' },
    ], default: 'mono' },
    { type: 'divider' },
    { key: 'scale', type: 'slider', label: 'Scale', min: 1, max: 100, step: 1, default: 20 },
    { key: 'detail', type: 'slider', label: 'Detail', min: 1, max: 6, step: 1, default: 3 },
    { key: 'brightness', type: 'slider', label: 'Brightness', min: -50, max: 50, step: 1, default: 0 },
    { key: 'contrast', type: 'slider', label: 'Contrast', min: 50, max: 300, step: 5, default: 100 },
    { type: 'divider' },
    { key: 'motion', type: 'toggle', label: 'Motion', default: false },
    { key: 'speed', type: 'slider', label: 'Speed', min: 0, max: 5, step: 0.1, default: 1 },
    { key: 'direction', type: 'select', label: 'Direction', options: [
      { value: 'evolve', label: 'Evolve' },
      { value: 'left', label: 'Left' },
      { value: 'right', label: 'Right' },
      { value: 'up', label: 'Up' },
      { value: 'down', label: 'Down' },
      { value: 'drift', label: 'Drift' },
    ], default: 'evolve' },
    { type: 'divider' },
    { key: 'fgColor', type: 'color', label: 'Foreground', default: '#ffffff' },
    { key: 'bgColor', type: 'color', label: 'Background', default: '#000000' },
  ] },
  { id: 'gen-gradient', title: 'Gradient', tags: ['source', 'generator', 'gradient', 'smooth'], controls: [
    { key: 'type', type: 'select', label: 'Type', options: [
      { value: 'linear', label: 'Linear' },
      { value: 'radial', label: 'Radial' },
      { value: 'conic', label: 'Conic' },
    ], default: 'linear' },
    { key: 'angle', type: 'slider', label: 'Angle', min: 0, max: 360, step: 1, default: 0 },
    { key: 'radialRadius', type: 'slider', label: 'Radius', min: 10, max: 200, step: 1, default: 70 },
    { type: 'divider' },
    { key: 'color1', type: 'color', label: 'Stop 1', default: '#000000' },
    { key: 'color2', type: 'color', label: 'Stop 2', default: '#ff00ff' },
    { key: 'color3', type: 'color', label: 'Stop 3', default: '#ffffff' },
    { type: 'divider' },
    { key: 'motion', type: 'toggle', label: 'Motion', default: false },
    { key: 'rotateSpeed', type: 'slider', label: 'Rotate Spd', min: -180, max: 180, step: 1, default: 0 },
    { key: 'cycleSpeed', type: 'slider', label: 'Cycle Spd', min: -2, max: 2, step: 0.05, default: 0 },
  ] },
  { id: 'gen-pattern', title: 'Pattern', tags: ['source', 'generator', 'pattern', 'geometric'], controls: [
    { key: 'pattern', type: 'select', label: 'Pattern', options: [
      { value: 'stripes', label: 'Stripes' },
      { value: 'dots', label: 'Dots' },
      { value: 'checker', label: 'Checker' },
    ], default: 'stripes' },
    { key: 'spacing', type: 'slider', label: 'Spacing', min: 4, max: 100, step: 1, default: 20 },
    { key: 'angle', type: 'slider', label: 'Angle', min: 0, max: 360, step: 1, default: 0 },
    { key: 'duty', type: 'slider', label: 'Thickness', min: 0.05, max: 1, step: 0.05, default: 0.5 },
    { type: 'divider' },
    { key: 'motion', type: 'toggle', label: 'Motion', default: false },
    { key: 'scrollSpeed', type: 'slider', label: 'Scroll Spd', min: -5, max: 5, step: 0.1, default: 0 },
    { type: 'divider' },
    { key: 'color', type: 'color', label: 'Color', default: '#ffffff' },
    { key: 'bgColor', type: 'color', label: 'Background', default: '#000000' },
  ] },
  { id: 'gen-color-field', title: 'Color Field', tags: ['source', 'generator', 'color', 'smooth'], controls: [
    { key: 'color', type: 'color', label: 'Color', default: '#ff0000' },
    { key: 'saturation', type: 'slider', label: 'Saturation', min: 0, max: 100, step: 1, default: 100 },
    { type: 'divider' },
    { key: 'motion', type: 'toggle', label: 'Motion', default: false },
    { key: 'hueSpeed', type: 'slider', label: 'Hue Speed', min: -180, max: 180, step: 1, default: 0 },
    { key: 'lightnessAmount', type: 'slider', label: 'Pulse Amt', min: 0, max: 50, step: 1, default: 0 },
    { key: 'lightnessSpeed', type: 'slider', label: 'Pulse Spd', min: 0.1, max: 5, step: 0.1, default: 1 },
  ] },
]

// --- Lookup helpers ---

const ALL_VARIANTS = [...DISPLACEMENT_VARIANTS, ...COPIES_VARIANTS, ...MOVEMENT_VARIANTS, ...GENERATOR_VARIANTS]

export function findVariant(variantId) {
  return ALL_VARIANTS.find(v => v.id === variantId) || null
}

export function isDisplacementVariant(variantId) {
  return DISPLACEMENT_VARIANTS.some(v => v.id === variantId)
}

export function isMovementVariant(variantId) {
  return MOVEMENT_VARIANTS.some(v => v.id === variantId)
}

export function isPixiVariant(variantId) {
  return variantId && variantId.startsWith('pixi-')
}

export function isGeneratorVariant(variantId) {
  return variantId && variantId.startsWith('gen-')
}

export function getDefaultParams(controls) {
  return Object.fromEntries(controls.filter(c => c.key).map(c => [c.key, c.default]))
}

export function getActiveTab(controls, params) {
  if (params.controlTab) return params.controlTab
  const tabCtrl = controls.find(c => c.type === 'tabs')
  return tabCtrl?.options?.[0]?.value ?? null
}

export function filterControlsByTab(controls, params) {
  const activeTab = getActiveTab(controls, params)
  const hasTabs = controls.some(c => c.type === 'tabs')
  let skippedFirstDivider = !hasTabs
  return controls.filter(c => {
    if (c.type === 'tabs') return false
    if (!skippedFirstDivider && c.type === 'divider') { skippedFirstDivider = true; return false }
    if (c.tab && activeTab && c.tab !== activeTab) return false
    return true
  })
}

// Raster tier selection — pick resolution based on visual density
// Only mid (3x) and high (6x) — never use 1x
export const RASTER_TIER_SCALES = { low: 1, mid: 6, high: 12 }

export function getRasterTier(variantId, params) {
  if (!variantId || !params) return 'mid'
  if (!isPixiVariant(variantId)) return 'mid'

  const wrapRepeat = params.wrapMode && params.wrapMode !== 'clamp-to-edge'
  const fitCenter = params.imageFitMode === 'center'

  // Center mode always needs high res (native size, no scaling)
  if (fitCenter) return 'high'

  if (variantId === 'pixi-kaleidoscope') {
    const segments = params.segments || 6
    const zoom = params.zoom || 1.5
    const edgeZoomScale = params.edgeZoomScale ?? 1.0
    const effectiveZoom = zoom * edgeZoomScale
    const copySize = effectiveZoom / segments
    const hasBg = params.showBackground
    if (copySize < 0.05 && hasBg) return 'mid'
    return 'high'
  }

  if (variantId === 'pixi-slices') {
    const tileScale = params.tileScaleX || 0.3
    if (tileScale < 0.2 && wrapRepeat) return 'mid'
    return 'high'
  }

  if (variantId === 'pixi-glitch') {
    const slices = params.sliceCount || 20
    if (slices > 40 && wrapRepeat) return 'mid'
    return 'high'
  }

  if (variantId === 'pixi-radial') {
    const tileScale = params.tileScale || 0.5
    if (tileScale < 0.3 && wrapRepeat) return 'mid'
    return 'high'
  }

  if (variantId === 'pixi-morph') return 'high'

  return 'mid'
}

// Map dial (0–100) to each intensity key's full min–max range
// boost doubles the max end
export function scaleParamsByIntensity(variantId, params, dialValue, boost = false) {
  const variant = findVariant(variantId)
  if (!variant || !variant.intensityKeys) return params
  const scaled = { ...params }
  for (const key of variant.intensityKeys) {
    const ctrl = variant.controls.find(c => c.key === key)
    if (!ctrl || !(key in scaled)) continue
    const min = ctrl.min
    const max = boost ? ctrl.max * 2 : ctrl.max
    scaled[key] = min + (dialValue / 100) * (max - min)
  }
  return scaled
}

// Calculate where a preset's default intensity values sit on the 0–100 dial
export function getIntensityDialValue(variantId) {
  const variant = findVariant(variantId)
  if (!variant || !variant.intensityKeys || variant.intensityKeys.length === 0) return 50
  let total = 0
  let count = 0
  for (const key of variant.intensityKeys) {
    const ctrl = variant.controls.find(c => c.key === key)
    if (!ctrl) continue
    const def = ctrl.default
    const range = ctrl.max - ctrl.min
    if (range === 0) continue
    total += ((def - ctrl.min) / range) * 100
    count++
  }
  return count > 0 ? Math.round(total / count) : 50
}

// --- Image helpers ---

export const IMAGE_SIZES = [400, 800, 1200, 1600, 2560]

export function getResponsiveImage() {
  const dpr = window.devicePixelRatio || 1
  const effectiveWidth = window.innerWidth * dpr
  const best = IMAGE_SIZES.find(w => w >= effectiveWidth) || IMAGE_SIZES[IMAGE_SIZES.length - 1]
  return `/images/stack-hero-${best}.jpg`
}

export const DEFAULT_IMAGE = '/images/stack-hero-800.jpg'

// --- Channel Post-Processing FX ---

export const CHANNEL_FX_DEFS = [
  { id: 'blur', label: 'Blur', params: { amount: { default: 0, min: 0, max: 20, step: 0.5, unit: 'px' } } },
  { id: 'brightness', label: 'Bright', params: { amount: { default: 1, min: 0, max: 3, step: 0.05 } } },
  { id: 'contrast', label: 'Contrast', params: { amount: { default: 1, min: 0, max: 3, step: 0.05 } } },
  { id: 'saturate', label: 'Saturate', params: { amount: { default: 1, min: 0, max: 3, step: 0.05 } } },
  { id: 'hue-rotate', label: 'Hue', params: { angle: { default: 0, min: 0, max: 360, step: 1, unit: '°' } } },
  { id: 'invert', label: 'Invert', params: { amount: { default: 0, min: 0, max: 1, step: 0.05 } } },
  { id: 'scale', label: 'Scale', params: { x: { default: 1, min: 0.1, max: 3, step: 0.05 }, y: { default: 1, min: 0.1, max: 3, step: 0.05 } } },
  { id: 'rotate', label: 'Rotate', params: { angle: { default: 0, min: 0, max: 360, step: 1, unit: '°' } } },
]

export const MAX_CHANNEL_FX = 8

export function getDefaultFxParams(fxId) {
  const def = CHANNEL_FX_DEFS.find(d => d.id === fxId)
  if (!def) return {}
  const params = {}
  for (const [key, spec] of Object.entries(def.params)) {
    params[key] = spec.default
  }
  return params
}

export function buildChannelFxStyle(fxArray) {
  if (!fxArray || fxArray.length === 0) return {}
  const filters = []
  const transforms = []
  for (const fx of fxArray) {
    if (!fx.enabled) continue
    const p = fx.params
    switch (fx.type) {
      case 'blur': filters.push(`blur(${p.amount}px)`); break
      case 'brightness': filters.push(`brightness(${p.amount})`); break
      case 'contrast': filters.push(`contrast(${p.amount})`); break
      case 'saturate': filters.push(`saturate(${p.amount})`); break
      case 'hue-rotate': filters.push(`hue-rotate(${p.angle}deg)`); break
      case 'invert': filters.push(`invert(${p.amount})`); break
      case 'scale': transforms.push(`scale(${p.x}, ${p.y})`); break
      case 'rotate': transforms.push(`rotate(${p.angle}deg)`); break
    }
  }
  const style = {}
  if (filters.length) style.filter = filters.join(' ')
  if (transforms.length) style.transform = transforms.join(' ')
  return style
}
