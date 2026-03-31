# Signal Path

Complete source-to-output flow for the Symphony Mixer.

---

## Signal Diagram

```
SOURCE
  │
  ├─ User upload (symphonyCanvasImage)
  ├─ Default SVG (default-canvas.svg, color-corrected by vectorColor + rasterTheme)
  ├─ Vector SVG (kol-vector/ shapes/forms/logos, recolored with currentColor)
  │
  ▼
IMAGE PIPELINE
  │
  useImageTiers(source, { svgFillColor, recalcKey })
  ├─ mid tier (3× native)
  └─ high tier (6× native)
  │
  ▼
PER-CHANNEL SOURCE SELECTION
  │
  For each channel:
  ├─ Custom media? → use channel.customRasterSrc
  ├─ Routed input? → use frame buffer from routeFrom channel (1-frame delay)
  ├─ Source fallback? → use /images/stack-hero-800.jpg (when loadMode='source')
  └─ Otherwise → rasterTiers[tier] (tier = auto or override)
  │
  ▼
EFFECT ROUTING (ChannelLayer)
  │
  ├─→ FROZEN VIDEO (activeRecSlot set)
  │   └─ <video> loops blobUrl between mark1/mark2
  │
  ├─→ DRY SIGNAL (no variantId)
  │   └─ <img> with imageFitMode scaling
  │
  └─→ EFFECT (variantId set)
      │
      ├─ Intensity scaling:
      │   multiplier = (intensity / baseIntensity) × (boosted ? 2 : 1)
      │   Applied to variant.intensityKeys only
      │
      ├─ Speed scaling:
      │   timeScale = speed / 100
      │   Pixi: effectiveSpeed = (params.speed || 1) × timeScale
      │
      ├─→ DISPLACEMENT (SVG feTurbulence + feDisplacementMap)
      ├─→ MOVEMENT (GSAP CSS transforms)
      └─→ PIXI (WebGL TilingSprite canvas)
          ├─ Slices
          ├─ Glitch
          ├─ Morph
          ├─ Radial
          └─ Kaleidoscope
  │
  ▼
PER-CHANNEL POST-FX
  │
  CSS filter chain (up to 8):
  ├─ blur(px), brightness, contrast, saturate, hue-rotate(deg), invert
  └─ CSS transform: scale(x,y), rotate(deg)
  │
  + opacity (0–100%)
  + mix-blend-mode (16 CSS modes)
  │
  ▼
FRAME BUFFER CAPTURE
  │
  useFrameBuffer.captureAll()
  OffscreenCanvas per channel, captured each frame
  Used for: cross-channel routing, bus compositing, feedback
  │
  ▼
CHANNEL STACK
  │
  Channels render as absolute-positioned divs in array order (0 = bottom)
  Each: { opacity, mixBlendMode, filter, transform, pointerEvents: none }
  │
  ├──→ SEND BUSES (per-channel sendA / sendB levels)
  │    │
  │    ├─ AUX BUS: composite channel frames at sendA levels + bus FX chain → RTN 1
  │    └─ FX BUS:  composite channel frames at sendB levels + bus FX chain → RTN 2
  │    │
  │    └─ Returns feed back into:
  │       ├─ Master mix (via returnLevel fader)
  │       └─ Channel inputs (via routing matrix RTN→Ch, 1-frame delay)
  │
  │    NOTE: Bus rendering pipeline not yet implemented.
  │    UI controls for sends/returns are wired, compositing is not.
  │
  ▼
ROUTING MATRIX
  │
  Cross-channel patching:
  ├─ Ch→Ch: routeFrom (use another channel's output as input)
  ├─ Ch→RTN: sendA/sendB (send to AUX/FX buses)
  ├─ RTN→Ch: return routing (bus output → channel input, 1-frame delay)
  ├─ FB: self-feedback via diagonal (routeSendLevels[self] > 0)
  │
  resolveRenderOrder() — topological sort, circular deps use previous frame
  │
  ▼
MASTER BUS
  │
  Wraps all channels + returns in a single div:
  ├─ Master FX chain (same 8 types as channels)
  ├─ Master opacity (0–100%, MST fader)
  └─ Master blend mode
  │
  ▼
CANVAS CONTAINER
  │
  Ratio-constrained frame (ResizeObserver)
  Background: custom color or theme split color
  Border: 1px fg-08, radius 4px
  │
  ▼
OUTPUT
```

---

## Image Pipeline

### Upload
`handleSymphonyUpload()` in sidebar footer:
1. File input accepts `image/*` and `.svg`
2. Detects SVG by file type or extension
3. SVG: reads as text → `data:image/svg+xml` URL, rasterizes at 4× scale (520×384 from 130×96)
4. Raster: reads as `dataURL`
5. Sets `symphonyCanvasImage`, `symphonyCanvasRaster`, `symphonyCanvasIsSvg`

### Per-channel upload
`processImageUpload` in SRC shelf tab:
- Normal: loads as-is
- Recolor: replaces all SVG fills with `currentColor` (vector color applies)

### Rasterization (useImageTiers)
`src/hooks/useImageTiers.js`

Takes any source (static path, raster dataURL, SVG dataURL) and generates:
- **mid** — 3× native resolution
- **high** — 6× native resolution

SVG sources are re-colored with `svgFillColor` before rasterization. Results are cached by source + fill color. Cache invalidated by `recalcKey` (bumped by `[RECALC]` button).

### Tier Selection (getRasterTier)
`src/data/mirrorVariants.js`

Per-variant logic decides `mid` or `high` based on current params:

| Variant | Rule | Default |
|---------|------|---------|
| Kaleidoscope | `(zoom × edgeZoomScale) / segments < 0.05` AND has bg → mid | high |
| Slices | `tileScale < 0.2` AND wrapRepeat → mid | high |
| Glitch | `sliceCount > 40` AND wrapRepeat → mid | high |
| Radial | `tileScale < 0.3` AND wrapRepeat → mid | high |
| Morph | always high | high |
| Displacement | always mid | mid |
| Movement | always mid | mid |

Re-evaluated every 500ms during animation via `tierTick` interval.

---

## Frame Buffer

`src/hooks/useFrameBuffer.js`

OffscreenCanvas per channel, captures rendered output each frame for cross-channel routing and feedback.

| Method | Description |
|--------|-------------|
| `registerCanvas(index, canvasEl)` | Register a channel's canvas element |
| `unregisterCanvas(index)` | Remove registration |
| `getChannelFrame(index)` | Get buffered frame for routing |
| `captureAll()` | Copy all registered canvases to buffers |
| `resolveRenderOrder(channels)` | Topological sort based on routing deps |

Circular dependencies (feedback loops) use the previous frame's buffer.

---

## Intensity Scaling

The rotary dial doesn't set absolute values — it's a multiplier relative to the variant's default intensity.

```
base = channel.baseIntensity (set when loading preset/slot)
multiplier = (intensity / base) × (boosted ? 2 : 1)
```

Applied only to `variant.intensityKeys`:

| Variant | intensityKeys |
|---------|--------------|
| All displacement | `scale`, `baseFrequency` |
| Slices | `tileScaleX` |
| Glitch | `maxOffset` |
| Morph | `scaleIntensity` |
| Radial | `radius` |
| Kaleidoscope | `zoom`, `segments` |
| All movement | `amount` |

Non-intensity params are passed through unchanged.

---

## Post-FX Chain

Up to 8 FX per channel (and separately on master bus and return buses). `buildChannelFxStyle()` converts to inline CSS:

| FX Type | CSS Property | Params |
|---------|-------------|--------|
| blur | `filter: blur(Npx)` | amount: 0–20px |
| brightness | `filter: brightness(N)` | amount: 0–3 |
| contrast | `filter: contrast(N)` | amount: 0–3 |
| saturate | `filter: saturate(N)` | amount: 0–3 |
| hue-rotate | `filter: hue-rotate(Ndeg)` | angle: 0–360° |
| invert | `filter: invert(N)` | amount: 0–1 |
| scale | `transform: scale(x, y)` | x: 0.1–3, y: 0.1–3 |
| rotate | `transform: rotate(Ndeg)` | angle: 0–360° |

Filters and transforms are concatenated into single `filter` and `transform` strings. Disabled FX are skipped.

---

## Blend Modes

16 CSS `mix-blend-mode` values available per channel, per bus, and on master:

`normal`, `multiply`, `screen`, `overlay`, `darken`, `lighten`, `color-dodge`, `color-burn`, `hard-light`, `soft-light`, `difference`, `exclusion`, `hue`, `saturation`, `color`, `luminosity`

---

## Master Bus

The master wraps all channel layers in a single `<div>` with its own FX chain, opacity, and blend mode. Applied to the *combined* output of all channels, not individually.

---

## Send / Return Buses

Two parallel buses for shared processing:

| Bus | Send field | Return state | Purpose |
|-----|-----------|-------------|---------|
| AUX (RTN 1) | `channel.sendA` | `master.busA` | Auxiliary bus |
| FX (RTN 2) | `channel.sendB` | `master.busB` | Effects bus |

Each bus has: `enabled`, `returnLevel`, `fx[]`, `blendMode`, `solo`.

**Flow:** channels send at send levels → bus composites frames → applies bus FX → return enters master mix at returnLevel (or routes back to a channel via routing matrix).

**Status:** UI controls fully wired. Bus compositing (actual video rendering) not yet implemented.

---

## Wire Diagram

`ChannelWireDiagram` renders an SVG visualization of the signal flow:

```
[CH 0] ─── [FX] [FX] ──┐
[CH 1] ─── [FX] ────────┤── [MST] ─── [FX] [FX] ─── [OUT]
[CH 2] ──────────────────┘
```

- Colored wire per channel (8-color rotation)
- FX nodes as small rectangles (filled = enabled, outline = disabled)
- MST and OUT boxes are draggable
- Dashed line from MST to OUT
- Scales to active channel count
