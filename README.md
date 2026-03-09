# Hall of Mirrors

Interactive image distortion playground built with React, PixiJS, and GSAP. Part of the Kolkrabbi design system.

## Getting Started

```sh
yarn install
yarn dev
```

## Scripts

| Command | Description |
|---|---|
| `yarn dev` | Start dev server |
| `yarn build` | Production build |
| `yarn preview` | Preview production build |
| `yarn lint` | Run ESLint |

## Tech Stack

- React 19 + Vite 7
- Tailwind CSS 4
- PixiJS 8 (WebGL rendering)
- GSAP 3 (SVG attribute animation, drag inertia)
- Kolkrabbi Design System (typography, color tokens, UI components)

---

# Filter & Effect Audit

## Shared Control Panel

**DistortionControlsPanel** provides 3 sliders + animation toggle. Used by Hall of Displacement, Hall of Copies, and Apparatus Hall of Mirrors. These 3 sliders are force-mapped to every filter's props, regardless of whether the mapping makes sense.

| Slider | Range | Intended for |
|--------|-------|--------------|
| Scale | 0–100 | SVG `feDisplacementMap.scale` |
| Base Frequency | 0.001–0.05 | SVG `feTurbulence.baseFrequency` |
| Octaves | 1–4 (int) | SVG `feTurbulence.numOctaves` |

**Problem**: Every PixiJS variant is forced to derive its own params from these 3 SVG-centric sliders via ad-hoc math (`scale / 100`, `baseFrequency * 100`, `numOctaves * 5`, etc.). The result is that most filters have controls that don't map naturally to what they actually do.

---

## Filter Inventory

### 1. MirrorVariant (SVG Displacement)

**File**: `src/components/hall-of-mirrors/MirrorVariant.jsx`
**Used in**: Hall of Displacement (×8), Apparatus Hall of Mirrors (×8)

| Prop | Current control | Type | Notes |
|------|----------------|------|-------|
| `baseFrequency` | Slider (0.001–0.05) | float | Turbulence grain size |
| `numOctaves` | Slider (1–4) | int | Turbulence complexity |
| `scale` | Slider (0–100) | int | Displacement intensity |
| `seed` | Hardcoded per variant | int | Turbulence randomization |
| `animate` | Global toggle | bool | GSAP yoyo on baseFrequency |

**Missing / Desirable**:
- `turbulenceType`: currently hardcoded `"turbulence"` — should offer `"fractalNoise"` toggle (very different visual)
- `xChannelSelector` / `yChannelSelector`: hardcoded R/G — exposing channel swap (R/G/B/A) creates dramatically different effects
- `stitchTiles`: `"stitch"` vs `"noStitch"` — controls seamless tiling at edges
- Animation target: currently only animates `baseFrequency` — could animate `scale` or `seed` independently
- Animation duration / ease: hardcoded 3s `sine.inOut` — should be controllable
- Per-variant `seed` control (currently frozen at init)

---

### 2. PixiSliceVariant (Pixi TilingSprite — Vertical Slices)

**File**: `src/components/hall-of-mirrors/PixiSliceVariant.jsx`
**Used in**: Hall of Copies, Apparatus Hall of Mirrors

| Prop | Current control | Mapped from | Notes |
|------|----------------|-------------|-------|
| `tileScaleX` | `scale / 100` | Scale slider | Tile width (0.01–1.0) |
| `speed` | `baseFrequency * 100` | Freq slider | Horizontal scroll px/frame |
| `tileScaleY` | Hardcoded `1` | — | Always full height |

**Missing / Desirable**:
- `tileScaleY`: expose for independent Y scaling (creates grid vs stripe)
- `direction`: only scrolls X — add Y scroll, diagonal, or bidirectional
- `tileOffset`: starting position offset for composition
- `wrapMode` / edge repeat: currently relies on Pixi default (repeat) — could offer mirror, clamp
- `blendMode`: Pixi supports blend modes on sprites — would allow overlay/multiply effects
- `scrollEasing`: linear only — add sine/bounce/elastic options
- `pauseOnFrame`: ability to freeze at a specific offset

---

### 3. PixiGlitchSliceVariant (Pixi Sprite Masking — Horizontal Glitch)

**File**: `src/components/hall-of-mirrors/PixiGlitchSliceVariant.jsx`
**Used in**: Hall of Copies, Apparatus Hall of Mirrors

| Prop | Current control | Mapped from | Notes |
|------|----------------|-------------|-------|
| `sliceCount` | `Math.max(10, numOctaves * 5)` | Octaves slider | Number of horizontal bands |
| `maxOffset` | `scale` | Scale slider | Max horizontal displacement px |
| `speed` | `baseFrequency * 100` | Freq slider | How often offsets randomize |

**Missing / Desirable**:
- `direction`: only horizontal offset — add vertical glitch, or both
- `interpolation`: smoothing factor is hardcoded `0.1` — expose as "smoothness" vs "snap"
- `holdFrames`: how long a glitch pattern holds before re-randomizing (currently coupled to speed)
- `verticalSlice`: option to slice vertically instead of horizontally
- `colorChannelSplit`: offset R/G/B channels independently (chromatic aberration)
- `sliceHeight` variation: currently uniform — could randomize slice heights
- `probability`: not every frame needs to glitch — a "glitch chance" per frame
- `maxSlices` affected per frame: only glitch N of the total slices, leave others stable

---

### 4. PixiMorphVariant (Pixi TilingSprite — Breathing/Morph)

**File**: `src/components/hall-of-mirrors/PixiMorphVariant.jsx`
**Used in**: Hall of Copies, Apparatus Hall of Mirrors

| Prop | Current control | Mapped from | Notes |
|------|----------------|-------------|-------|
| `scaleIntensity` | `1 + (scale / 50)` | Scale slider | Sin/cos amplitude on tile scale |
| `speed` | `baseFrequency * 100` | Freq slider | Counter increment rate |

**Missing / Desirable**:
- `phaseOffset`: offset between X and Y sin/cos (currently 0 — both use same counter)
- `shiftDirection`: diagonal shift is hardcoded (+0.5, +0.5) — expose angle or X/Y independently
- `shiftSpeed`: currently locked to animation speed — decouple pan from morph
- `waveform`: only sin/cos — offer triangle, sawtooth, square for different morph character
- `scaleRange`: currently morphs between `intensity +/- 1` — expose min/max independently
- `anchor` / `pivot`: morph from center vs corner vs custom point
- `blendMode`: same as Slices — overlay effects

---

### 5. PixiRadialVariant (Pixi TilingSprite — Circular Orbit)

**File**: `src/components/hall-of-mirrors/PixiRadialVariant.jsx`
**Used in**: Hall of Copies, Apparatus Hall of Mirrors

| Prop | Current control | Mapped from | Notes |
|------|----------------|-------------|-------|
| `radius` | `scale` | Scale slider | Orbit radius in px |
| `tileScale` | `numOctaves / 8` | Octaves slider | Uniform X/Y tile scale |
| `speed` | `baseFrequency * 100` | Freq slider | Angular velocity multiplier |

**Missing / Desirable**:
- `ellipse`: currently circular (same radius X/Y) — expose `radiusX` / `radiusY` for elliptical orbits
- `rotationDirection`: always counterclockwise — add CW/CCW toggle
- `spiralFactor`: gradually increase radius over time for spiral motion
- `tileRotation`: rotate the tile texture itself as it orbits
- `independentScale`: allow `tileScale.x` != `tileScale.y`
- `orbitEasing`: linear orbit — add variable speed (slow at extremes, fast in middle)
- `blendMode`: same as other Pixi variants

---

### 6. PixiKaleidoscopeVariant (Pixi Sprite + Graphics Masking — Wedge Segments)

**File**: `src/components/hall-of-mirrors/PixiKaleidoscopeVariant.jsx`
**Used in**: Not yet wired in (copied to src, pending integration into Hall of Copies)

| Prop | Current control | Mapped from | Notes |
|------|----------------|-------------|-------|
| `segments` | `Math.max(3, numOctaves * 3)` | Octaves slider | Number of wedge segments |
| `zoom` | `scale / 20` | Scale slider | Sprite scale within each wedge |
| `speed` | `baseFrequency * 100` | Freq slider | Rotation speed |

**Missing / Desirable**:
- `offset` / `sourcePosition`: sprite anchor within wedge is centered — expose X/Y offset to shift the source region (dramatically changes the pattern)
- `mirrorMode`: currently mirrors every other segment (`scale.x *= -1`) — options: all-same, alternate-mirror, alternate-rotate
- `innerRadius`: wedges start at center — add inner radius cutout for ring kaleidoscopes
- `edgeRepeat` / `wrapMode`: when zoomed in, edges of the source image show — need repeat/mirror/clamp options
- `rotationDirection`: CW/CCW toggle
- `segmentGap`: small angle gap between wedges (reveals background)
- `perSegmentAnimation`: each segment rotates/pulses independently (phase offset)
- `sourceAnimation`: animate the source sprite position within each wedge (panning kaleidoscope, not just rotating)
- `backgroundColor`: currently `0x1a1a1a` — expose or inherit

---

### 7. PixiImageFilterCanvas (Pixi ColorMatrix + Noise — Image Grading)

**File**: `src/components/hall-of-mirrors/PixiImageFilterCanvas.jsx`
**Used in**: Apparatus Hall of Mirrors (standalone, not in grid)

| Prop | Current control | Type | Notes |
|------|----------------|------|-------|
| `brightness` | Own slider (0–2) | float | ColorMatrixFilter |
| `contrast` | Own slider (0–2) | float | ColorMatrixFilter |
| `saturation` | Own slider (0–2) | float | ColorMatrixFilter |
| `warmth` | Own slider (-0.5–0.5) | float | Tint blue-to-orange |
| `noise` | Own slider (0–0.4) | float | NoiseFilter |

**Has its own control panel** (not using DistortionControlsPanel). Has presets (Baseline, Noir, Sunset, Print).

**Missing / Desirable**:
- `hue` rotation: ColorMatrixFilter supports it, not exposed
- `alpha` / opacity: overall transparency
- `vignette`: common filter effect, not available
- `grain` character: NoiseFilter is uniform — offer grain size/type
- `sepia` / `vintage`: dedicated preset values but no direct toggle
- `sharpen` / `blur`: common post-processing, not available
- `quantize` button visible in UI ("Quantize [OFF]") but not implemented

---

### 8. MovementVariant (GSAP Transform — Scale/Stretch/Harmonica)

**File**: `src/components/hall-of-mirrors/HallOfMovement.jsx` (inline component)
**Used in**: Hall of Movement (×3)

| Prop | Current control | Type | Notes |
|------|----------------|------|-------|
| `speed` | Slider (0.5–5s) | float | GSAP timeline duration |
| `amount` | Slider (1.0–2.0) | float | Scale target |
| `easingStrength` | Slider (0.5–4) | float | Maps to GSAP ease |
| `type` | Hardcoded per variant | enum | `scale` / `stretch` / `harmonica` |

**Has its own control panel** (MovementControlsPanel).

**Missing / Desirable**:
- `transformOrigin`: hardcoded `center center` — expose for off-center scaling
- `rotation`: no rotation animation
- `skew` / `shear`: not available
- `translate` / `drift`: positional movement
- `stagger`: when multiple elements, offset their animations
- `bounce` / `elastic` easing: easingStrength maps to power easing only — add spring physics
- `delay` / `phase`: offset animation start
- Per-variant image upload: currently uses hardcoded image, no upload unlike displacement/copies halls
- `oscillation` mode: currently yoyo only — could do one-shot, loop-forward, or ping-pong with asymmetric timing

---

### 9. HallOfSymphony (Mixer — Combines Displacement + Movement + Copies)

**File**: `src/components/hall-of-mirrors/HallOfSymphony.jsx`
**Used in**: Hall of Symphony (standalone)

Not a filter itself, but a composition layer. Uses inline SVG displacement filter + GSAP movement on two SVG letter paths.

**Missing / Desirable**:
- Copies channel: `copiesValue` state exists but is not wired to any visual effect
- Per-channel variant loading: dropdown exists but loaded presets are just hardcoded number tuples
- No actual PixiJS integration despite the copies channel implying it
- Performance monitoring: FPS counter shows "—", CPU/MEM shows "—" — not implemented
- Export/snapshot: no way to capture current state

---

## Cross-cutting Issues

### The 3-slider problem
Every hall forces all filters through `DistortionControlsPanel`'s 3 sliders (Scale, Base Frequency, Octaves). This means:
- PixiJS filters use meaningless ad-hoc conversions (`baseFrequency * 100` for speed, `numOctaves / 8` for tile scale)
- Filters that need different params (segments, radius, direction, easing) have no controls at all
- Selecting a variant to "control" it only remaps 3 numbers — the rest stays hardcoded

### Proposed solution
Each filter type should declare its own param descriptors (name, min, max, step, default). When a variant is selected, the control panel should render that filter's specific sliders instead of the global 3. This way:
- MirrorVariant gets: baseFrequency, numOctaves, scale, seed, turbulenceType, channelSelector
- PixiSliceVariant gets: tileScaleX, tileScaleY, speed, direction
- PixiKaleidoscopeVariant gets: segments, zoom, speed, offset, mirrorMode, edgeRepeat
- etc.

### No image upload on Movement variants
MovementVariant hardcodes `/images/stack-hero-800.jpg` — no `onImageUpload` prop unlike all other variants.

### Inconsistent animation control
- Displacement hall: animation only runs on selected variant (`selectedVariant === id && animationsEnabled`)
- Apparatus hall: animation runs on all variants when enabled (`animationsEnabled`)
- Both behaviors are valid but the inconsistency is confusing when switching between halls

### HallOfArchive
Entirely placeholder — 9 empty slots with no save/load logic. Listed here for completeness.
