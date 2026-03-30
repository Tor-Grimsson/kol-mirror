# Effects System

Three rendering engines: SVG displacement, GSAP movement, PixiJS WebGL. Each variant is defined in `src/data/mirrorVariants.js` with an ID, title, `intensityKeys`, and control descriptors.

---

## SVG Displacement (8 variants)

Renderer: `MirrorVariant.jsx` — applies `feTurbulence` → `feDisplacementMap` SVG filter.

| Variant | baseFrequency | numOctaves | scale | seed |
|---------|---------------|------------|-------|------|
| Subtle Ripple | 0.005 | 1 | 10 | 1 |
| Medium Wave | 0.01 | 2 | 20 | 2 |
| Heavy Distortion | 0.02 | 3 | 40 | 3 |
| Fine Grain | 0.05 | 4 | 15 | 4 |
| Liquid Surface | 0.008 | 2 | 30 | 5 |
| Animated Turbulence | 0.01 | 2 | 25 | 6 |
| Extreme Warp | 0.03 | 4 | 60 | 7 |
| Glass Refraction | 0.015 | 3 | 35 | 8 |

intensityKeys: `scale`, `baseFrequency`

Additional controls: `speed` (animation), `turbulenceType`, `xChannelSelector`, `yChannelSelector`

---

## GSAP Movement (3 variants)

Renderer: `MovementVariant.jsx` — GSAP timeline applies CSS transforms with continuous easing.

| Variant | Type | Axis | intensityKey |
|---------|------|------|-------------|
| Breathing Scale | `scale` | X+Y uniform | `amount` |
| Breathing Stretch | `stretch` | X+Y non-uniform | `amount` |
| Breathing Harmonica | `harmonica` | X only | `amount` |

Controls: `speed`, `amount`, `easing` (0.5–4.0 continuous), `transformOrigin`

---

## PixiJS Copies (5 variants)

All use `usePixiApp` hook for Pixi lifecycle and `VariantFrame` for shared UI frame. WebGL canvas with `TilingSprite`.

### Slices (`PixiSliceVariant.jsx`)
Vertical slice/repeat effect.
- intensityKey: `tileScaleX`
- Controls: `tileScaleX`, `speed`, `direction`, `grab`, `imageFitMode`

### Glitch (`PixiGlitchSliceVariant.jsx`)
Scan line corruption with horizontal/vertical direction.
- intensityKey: `maxOffset`
- Controls: `maxOffset`, `sliceCount`, `speed`, `direction` (H/V), `smoothing`, `grab`
- Seam-free centering algorithm

### Morph (`PixiMorphVariant.jsx`)
Sin/cos scale breathing with waveform selection.
- intensityKey: `scaleIntensity`
- Controls: `scaleIntensity`, `speed`, `waveform` (sine/triangle/square/sawtooth), `grab`

### Radial (`PixiRadialVariant.jsx`)
Circular orbital motion with orbit-tracking outline.
- intensityKey: `radius`
- Controls: `radius`, `speed`, `tileScale`, `grab`

### Kaleidoscope (`PixiKaleidoscopeVariant.jsx`)
Two-comp architecture: Comp A (main) + Comp B (background), independent params/animation.
- intensityKeys: `zoom`, `segments`
- Controls: Comp A/B tabs, `segments`, `zoom`, `speed`, `fill`, `edge`, `edgeZoomScale`, `bgBlendMode`, `bgGrabSegment`, `grab`

---

## Grab Interaction

All 5 Pixi variants support grab mode:
- Toggle `grab` → dashed rectangle outline appears
- Pointer drag updates `imageOffsetX/Y`
- Outline tracks animation drift (recalculated each frame)
- Kaleidoscope: wedge grab instead of rectangle

---

## Control Descriptor System

Each variant's `controls` array defines its UI. `VariantControls.jsx` renders them.

### Control types

| Type | Renders |
|------|---------|
| `toggle` | ON/OFF switch |
| `slider` | Range slider with min/max/step/default |
| `binary` | Two-option toggle |
| `select` | Dropdown with options array |
| `tabs` | Tab bar (filters visible controls by active tab) |
| `divider` | Visual separator |

### Descriptor fields
```
{ key, type, label, min, max, step, default, options, tab, visibilityKey, linkedDefaults }
```

- `tab`: which tab this control belongs to (for kaleidoscope Comp A/B)
- `visibilityKey`: only show when another param equals a value
- `linkedDefaults`: auto-reset dependent params when a dropdown changes

### Shelf pagination
Right shelf renders 7 rows per page. Tab controls are pinned above the page. Pages navigated with `1/N` indicators.

---

## Shared Infrastructure

### usePixiApp (`src/hooks/usePixiApp.js`)
Pixi Application lifecycle: init (100ms delay), ResizeObserver, texture loading, cleanup. `preserveDrawingBuffer` option for recording. `applyImageFit()` and `drawDashedRect()` utilities.

### VariantFrame (`src/components/hall-of-mirrors/VariantFrame.jsx`)
Shared UI wrapper: title bar, ON/OFF + SELECT toggles, canvas container, fallback image, info overlay, stats display, upload button. `interactive` prop enables grab.

### useImageTiers (`src/hooks/useImageTiers.js`)
Generates mid (3×) and high (6×) rasters from any source. SVG re-coloring. Caches by source + fill. 500ms re-evaluation during animation.

### Raster tier selection
`getRasterTier(variantId, params)` in `mirrorVariants.js` — see [signal-path.md](signal-path.md#tier-selection-getrastertier) for full logic.

---

## Key Files

| File | Role |
|------|------|
| `src/data/mirrorVariants.js` | Variant definitions, controls, FX defs, tier logic |
| `src/components/mirror/VariantControls.jsx` | Renders controls from descriptors |
| `src/components/mirror/ChannelLayer.jsx` | Routes channel → renderer |
| `src/components/hall-of-mirrors/MirrorVariant.jsx` | SVG displacement renderer |
| `src/components/hall-of-mirrors/MovementVariant.jsx` | GSAP movement renderer |
| `src/components/hall-of-mirrors/PixiSliceVariant.jsx` | Slices |
| `src/components/hall-of-mirrors/PixiGlitchSliceVariant.jsx` | Glitch |
| `src/components/hall-of-mirrors/PixiMorphVariant.jsx` | Morph |
| `src/components/hall-of-mirrors/PixiRadialVariant.jsx` | Radial |
| `src/components/hall-of-mirrors/PixiKaleidoscopeVariant.jsx` | Kaleidoscope |
| `src/components/hall-of-mirrors/VariantFrame.jsx` | Shared UI frame |
| `src/hooks/usePixiApp.js` | Pixi lifecycle |
| `src/hooks/useImageTiers.js` | Raster tier generation |

---

## Known Issues

- **Feather keying**: Gradient donut renders but can't convert to transparency (Pixi alpha mask / erase blend).
- **Blend modes**: Don't work on Pixi containers without render groups (`isRenderGroup` broke rendering).
- **bgGrabSegment**: Kaleidoscope Comp B grab not wired in renderer.
- **PixiImageFilterCanvas**: Not migrated to shared infrastructure (different layout).
