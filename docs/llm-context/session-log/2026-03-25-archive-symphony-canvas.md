# Session: Archive Slots, Symphony Mixer Rework, Canvas Controls

**Date:** 2026-03-25
**Agent:** Claude Code (Opus 4.6)
**Summary:** Added 9-slot archive system for saving variant snapshots, reworked Symphony mixer to load from archive slots + hall presets, added canvas aspect ratio and image fit controls to both halls and symphony.

## Changes Made

### Archive System
- `useMirrorState.js` — Added 9-slot archive state (`archiveSlots`), `saveToArchiveSlot`, `clearArchiveSlot`
- `MirrorSidebar.jsx` — Save-to-slot dropdown in hall controls (shows `—` by default, switches to slot number after save)
- `ArchiveViewport.jsx` — Renders filled slots with image preview + variant name, empty slots as placeholders, LOAD/CLEAR actions
- Renamed Archive to "Memory" in sidebar, moved to new "Library" group

### Symphony Mixer Rework
- Load icon dropdown now shows archive slots + hall presets (grouped by hall: Displacement, Movement, Copies)
- Empty slots dimmed, separator between slots and presets
- Click-outside closes dropdown (fixed backdrop overlay)
- Dropdown positioned below load icon (was overlaying entire channel card)
- Removed hardcoded preset data — loads from archive slots or variant defaults
- `textAbsoluteWhite` replaced with `text-fg-96` for theme support

### Symphony Sidebar Controls
- Animate toggle (moved from viewport ON/OFF to sidebar control panel)
- Load Mode dropdown: Effect Only / Effect + Source (controls whether loading a slot also loads its image)
- Canvas Ratio dropdown: 16:9, 5:3, 4:3, 1:1, 3:4, 3:5, 9:16, Custom
- Custom ratio shows Resolution row with two QuantityInput components (chevron up/down)
- Image Fit dropdown: Contain, Fit Width, Fit Height, Manual (with scale slider)
- Vector Color + Background color pickers (react-colorful with rgba + opacity)
- Mixer Layout toggle: ROW/COL
- Controls positioned at bottom of sidebar (same as VariantControls in halls)

### Hall Canvas Controls
- Canvas ratio dropdown added to hall control panel (same options + "Full Bleed" for no frame)
- Custom ratio with QuantityInput width/height
- Image Fit dropdown (Contain, Fit Width, Fit Height, Manual)
- CanvasFrame component: uses ResizeObserver to calculate fitted dimensions preserving locked aspect ratio
- Canvas header shows "Displacement Canvas [16:9]" etc. when framed

### Canvas Scaling
- Both hall and symphony canvases scale down to fit viewport while locking aspect ratio
- Uses ResizeObserver + JS calculation (not CSS aspect-ratio alone) to handle both wide and tall ratios
- Content aligned top-left

### New Components
- `src/components/atoms/ColorPicker.jsx` — react-colorful wrapper with swatch, click-outside close, direction-aware popover, hex input, rgba with opacity slider
- `src/components/atoms/QuantityInput.jsx` — Compact 24px input with chevron up/down, click-to-edit keyboard input
- `src/components/atoms/QuantityStepper.jsx` — Copied from design system (unused, QuantityInput preferred)

### SVG Upload Support
- File input accepts `image/*,.svg`
- SVGs rasterized to PNG via canvas for Pixi compatibility
- Symphony canvas upload handler for loading images directly to canvas

### Sidebar Reorganization
- Groups reordered: Mixer (Symphony) → Halls (Displacement, Movement, Copies) → Library (Memory)
- Symphony is default view on load
- Upload Image/SVG button shows for both halls and symphony

### Theme Fixes
- `kol-btn-control` hover: removed `border-color: transparent`, uses `bg-fg-08` background
- Symphony mixer: `textAbsoluteWhite` → `text-fg-96`
- Color picker swatch shows red diagonal line for transparent/none state

## Current State

### Working
- 9-slot archive: save from halls, load in symphony or view in Memory
- Symphony load icon: dropdown with archive slots + hall presets
- Canvas aspect ratio control in both halls and symphony
- Image fit modes (contain, fit-width, fit-height, manual scale)
- Vector color + background color pickers in symphony
- SVG + image upload in both halls and symphony
- Theme toggle hover fixed
- Symphony as default home view

### Known Issues
- Displacement animation loop: hardcoded 3s duration + sine.inOut ease
- Pixi continuous animations are linear — no easing options
- Image fit mode only affects displacement hall and symphony canvas (Pixi variants handle own images internally)
- Old hall page components still exist (dead code)
- Color picker hex input updates only on valid 6/8-digit hex

## Next Steps
1. Wire image fit mode to Pixi variant image rendering
2. Add easing/duration controls to Displacement SVG animation loop
3. Clean up dead code (old hall pages)
4. Implement archive slot persistence (localStorage)
5. Wire Symphony copies channel
