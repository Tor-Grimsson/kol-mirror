# Hall of Mirrors — Overview

Interactive image distortion playground. Single-page React 19 app with PixiJS 8, GSAP 3, Tailwind CSS 4, Vite 7.

---

## App Structure

```
MirrorPlayground (root, h-dvh flex)
├── MobileHeader        ← fixed, shows <768px, hamburger → drawer
├── MobileDrawer        ← slide-in sidebar wrapper, overlay backdrop
├── Desktop Sidebar     ← aside, resizable (288–960px), drag handle bottom-right 50%
│   └── MirrorSidebar   ← navigation + controls + footer
└── Main Viewport       ← flex-1
    └── MirrorViewport  ← routes to the active view
```

Entry: `main.jsx` → `App.jsx` → `MirrorPlayground`

State lives in a single hook: `useMirrorState()` — passed as `state` prop to sidebar and viewport.

### Desktop sidebar
- Default: 288px (<1024px) / 320px (≥1024px)
- Drag right edge to resize (max 3x default), double-click to reset
- `border-r border-fg-08`

### Mobile (<768px)
- Fixed header with hamburger → opens `MobileDrawer` (288px, slides from left)
- Backdrop: black/50%, z-index `--kol-z-overlay`
- Auto-closes on navigation

---

## Navigation

Default view: **Symphony**. State-driven via `activeHall`:

| activeHall | Viewport | Sidebar shows |
|------------|----------|---------------|
| `'symphony'` | SymphonyViewport | Animate toggle, canvas ratio, image fit, mixer layout |
| `'displacement'` | MirrorViewport (CanvasFrame + MirrorVariant) | Variant list + controls |
| `'movement'` | MirrorViewport (CanvasFrame + MovementVariant) | Variant list + controls |
| `'copies'` | MirrorViewport (CanvasFrame + Pixi variant) | Variant list + controls |
| `'archive'` | ArchiveViewport | Memory slots, [LOAD] dev presets |
| `'presets'` | PresetsViewport | (placeholder) |

### Sidebar sections

1. **Mixer** — Symphony button
2. **Halls** — Displacement, Movement, Copies
3. **Library** — Memory (archive), Presets
4. **Variant list** — shows when inside a hall (click to toggle selection)
5. **Variant controls** — shows when variant selected (sliders, dropdowns from control descriptors)
6. **Symphony controls** — shows when `activeHall === 'symphony'` (animate, ratio, fit, layout)
7. **Footer** — theme toggle + upload button

---

## Canvas Settings

### Aspect Ratio
Presets: `16:9`, `5:3`, `4:3`, `1:1`, `3:4`, `3:5`, `9:16`, `custom` (W×H inputs, 100–4096px)
Halls also support `none` (full bleed, no frame).

Sizing algorithm: fit ratio within container preserving aspect, `ResizeObserver` updates on resize.

### Image Fit
| Mode | Behavior |
|------|----------|
| `contain` | maxWidth/maxHeight 100%, centered (SVG: 60% height) |
| `fit-width` | width 100%, height auto |
| `fit-height` | height 100%, width auto |
| `manual` | custom scale (10–300%) |

### Canvas Appearance
- **Background color**: transparent (shows theme split color) or custom hex
- **Vector color**: SVG stroke/fill override (`currentColor` default)
- **Raster theme**: dark/light — controls SVG fill color for rasterization

---

## Archive System (Memory)

9 slots, each `null` or `{ variantId, params, imageSrc }`.

### Save
In a hall with variant selected → "Save to Slot" dropdown → pick slot → captures current variant ID, all params, custom image.

### Load
Archive view → `[LOAD]` on a slot → `loadSlotToHall(index)`:
1. Determines hall from `variantId`
2. Sets `activeHall`, `activeVariant`, `editingSlot`
3. Overwrites `variantParams[variantId]` with saved params
4. User is now in the hall editor with loaded state

### Symphony loading
Mixer channel dropdown lists archive slots + hall presets. Loading a slot into a channel sets `channel.slotIndex` — params resolve live from `variantParams` (edits in the hall editor propagate to all channels referencing that slot).

### Dev presets
`[LOAD]` button in archive sidebar populates all 9 slots with hardcoded variant IDs. `[RELOAD]` randomizes param values (±50% jitter).

### Thumbnails
Archive grid renders each slot as a `ChannelLayer` with `rawParams`, no animation, using `/thumbnails/stripe-base.png` as source.

---

## State Overview

`useMirrorState()` groups:

| Group | Fields |
|-------|--------|
| Navigation | `activeHall`, `activeVariant`, `selectHall()`, `selectVariant()` |
| Images | `customImages`, `defaultImage`, `getImageSrc()`, `handleImageUpload()` |
| Params | `variantParams`, `getVariantParams()`, `setVariantParam()`, `setAllVariantParams()`, `initVariantParams()` |
| Archive | `archiveSlots`, `editingSlot`, `saveToArchiveSlot()`, `clearArchiveSlot()`, `loadSlotToHall()` |
| Hall canvas | `hallCanvasRatio`, `hallCustomWidth/Height`, `imageFitMode`, `imageScale`, `canvasVectorColor`, `canvasBackgroundColor` |
| Symphony canvas | `symphonyRatio`, `symphonyCustomWidth/Height`, `symphonyCanvasImage/Raster/IsSvg`, `symphonyLoadMode`, `symphonyRasterTheme` |
| Symphony mixer | `symphonyChannels`, `symphonyMaster`, `symphonyAnimating`, `symphonyLayout`, `symphonyEditChannel` |
| Raster | `rasterRecalcCounter`, `setRasterRecalcCounter()` |
| Dev | `devPresetsLoaded`, `loadDevPresets()` |

---

## Key Files

| File | Role |
|------|------|
| `src/components/mirror/MirrorPlayground.jsx` | Root layout (sidebar + viewport + mobile) |
| `src/components/mirror/MirrorSidebar.jsx` | Navigation, controls, symphony controls, footer |
| `src/components/mirror/MirrorViewport.jsx` | Routes `activeHall` to viewport component |
| `src/components/mirror/SymphonyViewport.jsx` | Symphony canvas + mixer orchestration |
| `src/components/mirror/ArchiveViewport.jsx` | 9-slot memory grid |
| `src/hooks/useMirrorState.js` | All application state |
| `src/data/mirrorVariants.js` | Variant definitions, controls, FX, helpers |
