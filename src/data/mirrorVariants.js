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
  { key: 'tileScaleX', type: 'slider', label: 'Tile Scale X', min: 0.1, max: 2.0, step: 0.1, default: 0.3 },
  { key: 'speed', type: 'slider', label: 'Speed', min: 0.1, max: 10, step: 0.1, default: 1 },
  { key: 'direction', type: 'select', label: 'Direction', options: [{ value: 'horizontal', label: 'Horizontal' }, { value: 'vertical', label: 'Vertical' }, { value: 'diagonal', label: 'Diagonal' }], default: 'horizontal' },
  WRAP_CONTROL,
]

const GLITCH_CONTROLS = [
  { key: 'animate', type: 'toggle', label: 'Animate', default: false },
  { key: 'sliceCount', type: 'slider', label: 'Slices', min: 5, max: 60, step: 1, default: 20 },
  { key: 'maxOffset', type: 'slider', label: 'Max Offset', min: 0, max: 200, step: 1, default: 50 },
  { key: 'speed', type: 'slider', label: 'Speed', min: 0.1, max: 5, step: 0.1, default: 1 },
  { key: 'smoothing', type: 'slider', label: 'Smoothing', min: 0, max: 1, step: 0.05, default: 0.1 },
  { key: 'direction', type: 'select', label: 'Direction', options: [{ value: 'horizontal', label: 'Horizontal' }, { value: 'vertical', label: 'Vertical' }], default: 'horizontal' },
  WRAP_CONTROL,
]

const MORPH_CONTROLS = [
  { key: 'animate', type: 'toggle', label: 'Animate', default: false },
  { key: 'scaleIntensity', type: 'slider', label: 'Intensity', min: 0.5, max: 5.0, step: 0.1, default: 1 },
  { key: 'speed', type: 'slider', label: 'Speed', min: 0.1, max: 5.0, step: 0.1, default: 1 },
  { key: 'waveform', type: 'select', label: 'Waveform', options: [{ value: 'sine', label: 'Sine' }, { value: 'triangle', label: 'Triangle' }, { value: 'square', label: 'Square' }, { value: 'sawtooth', label: 'Sawtooth' }], default: 'sine' },
  { key: 'shiftDirection', type: 'select', label: 'Shift', options: [{ value: 'none', label: 'None' }, { value: 'horizontal', label: 'Horizontal' }, { value: 'vertical', label: 'Vertical' }, { value: 'diagonal', label: 'Diagonal' }], default: 'diagonal' },
  WRAP_CONTROL,
]

const RADIAL_CONTROLS = [
  { key: 'animate', type: 'toggle', label: 'Animate', default: false },
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
  { id: 'subtle-ripple', title: 'Subtle Ripple', intensityKeys: ['scale', 'baseFrequency'], controls: displacementControls({ baseFrequency: 0.005, numOctaves: 1, scale: 10, seed: 1 }) },
  { id: 'medium-wave', title: 'Medium Wave', intensityKeys: ['scale', 'baseFrequency'], controls: displacementControls({ baseFrequency: 0.01, numOctaves: 2, scale: 20, seed: 2 }) },
  { id: 'heavy-distortion', title: 'Heavy Distortion', intensityKeys: ['scale', 'baseFrequency'], controls: displacementControls({ baseFrequency: 0.02, numOctaves: 3, scale: 40, seed: 3 }) },
  { id: 'fine-grain', title: 'Fine Grain', intensityKeys: ['scale', 'baseFrequency'], controls: displacementControls({ baseFrequency: 0.05, numOctaves: 4, scale: 15, seed: 4 }) },
  { id: 'liquid-surface', title: 'Liquid Surface', intensityKeys: ['scale', 'baseFrequency'], controls: displacementControls({ baseFrequency: 0.008, numOctaves: 2, scale: 30, seed: 5 }) },
  { id: 'animated-turbulence', title: 'Animated Turbulence', intensityKeys: ['scale', 'baseFrequency'], controls: displacementControls({ baseFrequency: 0.01, numOctaves: 2, scale: 25, seed: 6 }) },
  { id: 'extreme-warp', title: 'Extreme Warp', intensityKeys: ['scale', 'baseFrequency'], controls: displacementControls({ baseFrequency: 0.03, numOctaves: 4, scale: 60, seed: 7 }) },
  { id: 'glass-refraction', title: 'Glass Refraction', intensityKeys: ['scale', 'baseFrequency'], controls: displacementControls({ baseFrequency: 0.015, numOctaves: 3, scale: 35, seed: 8 }) },
]

export const COPIES_VARIANTS = [
  { id: 'pixi-slices', title: 'Slices', intensityKeys: ['tileScaleX'], component: 'PixiSliceVariant', controls: SLICE_CONTROLS },
  { id: 'pixi-glitch', title: 'Glitch', intensityKeys: ['maxOffset'], component: 'PixiGlitchSliceVariant', controls: GLITCH_CONTROLS },
  { id: 'pixi-morph', title: 'Morph', intensityKeys: ['scaleIntensity'], component: 'PixiMorphVariant', controls: MORPH_CONTROLS },
  { id: 'pixi-radial', title: 'Radial', intensityKeys: ['radius'], component: 'PixiRadialVariant', controls: RADIAL_CONTROLS },
  { id: 'pixi-kaleidoscope', title: 'Kaleidoscope', intensityKeys: ['zoom', 'segments'], component: 'PixiKaleidoscopeVariant', controls: KALEIDOSCOPE_CONTROLS },
]

export const MOVEMENT_VARIANTS = [
  { id: 'breathing-scale', title: 'Breathing Scale', intensityKeys: ['amount'], controls: movementControls('scale') },
  { id: 'breathing-stretch', title: 'Breathing Stretch', intensityKeys: ['amount'], controls: movementControls('stretch') },
  { id: 'breathing-harmonica', title: 'Breathing Harmonica', intensityKeys: ['amount'], controls: movementControls('harmonica') },
]

// --- Lookup helpers ---

const ALL_VARIANTS = [...DISPLACEMENT_VARIANTS, ...COPIES_VARIANTS, ...MOVEMENT_VARIANTS]

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
export const RASTER_TIER_SCALES = { low: 1, mid: 3, high: 6 }

export function getRasterTier(variantId, params) {
  if (!variantId || !params) return 'mid'
  if (!isPixiVariant(variantId)) return 'mid'

  if (variantId === 'pixi-kaleidoscope') {
    const segments = params.segments || 6
    const zoom = params.zoom || 1.5
    const edgeZoomScale = params.edgeZoomScale ?? 1.0
    const effectiveZoom = zoom * edgeZoomScale
    const copySize = effectiveZoom / segments
    if (copySize > 0.1) return 'high'
    if (copySize > 0.03) return 'mid'
    return 'low'
  }

  if (variantId === 'pixi-slices') {
    const tileScale = params.tileScaleX || 0.3
    if (tileScale < 0.2) return 'low'
    if (tileScale < 0.5) return 'mid'
    return 'high'
  }

  if (variantId === 'pixi-glitch') {
    const slices = params.sliceCount || 20
    if (slices > 40) return 'low'
    if (slices > 15) return 'mid'
    return 'high'
  }

  if (variantId === 'pixi-radial') {
    const tileScale = params.tileScale || 0.5
    if (tileScale < 0.3) return 'low'
    if (tileScale < 0.7) return 'mid'
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
