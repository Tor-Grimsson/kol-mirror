# Session: Per-Filter Control System + Kaleidoscope Improvements

**Date:** 2026-03-25
**Agent:** Claude Code (Opus 4.6)
**Summary:** Replaced shared 3-slider control panel with per-variant data-driven controls. Added new kaleidoscope features, fixed animation pause/resume, improved dropdown UX.

## Changes Made

### Per-Filter Control System
- `src/data/mirrorVariants.js` — Each variant now declares its own `controls` array with typed descriptors (slider, toggle, binary, select)
- `src/hooks/useMirrorState.js` — Replaced 6 flat state values with generic `variantParams` map. Added `getVariantParams`, `setVariantParam`, `initVariantParams`. Auto-selects first variant when hall is clicked.
- `src/components/mirror/VariantControls.jsx` — **NEW** data-driven control renderer: slider, toggle, binary (two-option clickable), select (dropdown)
- `src/components/mirror/MirrorSidebar.jsx` — Swapped hardcoded DistortionControlsPanel/MovementControlsPanel for generic VariantControls
- `src/components/mirror/MirrorViewport.jsx` — Removed ad-hoc math translation, spreads params directly onto variant components
- Deleted `DistortionControlsPanel.jsx` and `MovementControlsPanel.jsx`

### New Props on Variant Components
- **MirrorVariant** — `turbulenceType`, `xChannelSelector`, `yChannelSelector` (was hardcoded)
- **PixiSliceVariant** — `direction` (horizontal/vertical/diagonal)
- **PixiGlitchSliceVariant** — `smoothing`, `direction`
- **PixiMorphVariant** — `waveform` (sine/triangle/square/sawtooth), `shiftDirection`
- **PixiRadialVariant** — `rotationDirection` (CW/CCW)
- **PixiKaleidoscopeVariant** — `mirrorMode`, `rotationDirection`, `sourceOffsetX/Y`, `cutOffset`, `segmentGap` (bipolar), `evenOffset`, `splitRotation`
- **MovementVariant** — `transformOrigin`, `easing` (replaced easingStrength slider with direct GSAP ease selection)

### Kaleidoscope Improvements
- Segments build on init (fixed blank render on first load)
- Source X/Y offsets control where in the image each segment samples
- Cut Offset rotates source image within wedges (not the whole wheel)
- Segment Gap is bipolar (-20° to +20°): negative = overlap, positive = separation
- Even Offset shifts even-numbered segments independently
- Split Rotation toggle: odds and evens rotate opposite directions
- Mirror mode and rotation direction now reactive (were captured at init only)
- Rebuild triggers on all param changes (was missing mirrorMode, gap, offset from deps)

### Animation Pause/Resume
- All Pixi variants: removed reset-to-zero on disable, animation freezes at current frame
- MovementVariant: timeline pauses/resumes at current position, seeks to midpoint when paused so sliders show visible effect
- Pixi variants now read slider values from refs in ticker, so changes apply in real-time during animation
- Fixed stale closure captures: morph scaleIntensity, radial radius, glitch maxOffset all use refs now

### UI Fixes
- Control panel: 12px gap, 24px row height, 12px font throughout
- Binary controls (2-option) render as clickable `Label [Value]` text instead of dropdown
- Toggle/binary/select all use same layout: justify-between, 24px height
- Dropdown options use `position: fixed` with auto-direction (opens up when near bottom)
- Dropdown has shadow + border for floating panel appearance
- Upload Image button uses Button component with primary variant, 12px font, 28px height
- Footer row: theme toggle left, upload button right (justify-between)
- Slider thumb: 10px transparent border for larger grab area (32px hit zone, 12px visible)

## Current State

### Working
- Per-variant controls render dynamically from descriptors
- All variant params preserved when switching between variants
- First variant auto-selected when clicking a hall
- Kaleidoscope has full control set (segments, zoom, source offset, cut offset, gap, even offset, mirror, rotation, split rotation)
- Movement easing is direct GSAP curve selection (Sine, Quad, Cubic, Quart, Expo, Back, Elastic)
- Animation pause/resume from current frame across all variants
- Dropdown opens up/down based on available space

### Known Issues
- Displacement animation loop has hardcoded 3s duration and sine.inOut ease (not yet controllable)
- Pixi continuous animations (Slice, Radial, Kaleidoscope) don't have easing — they're linear rotation/shift
- Old hall page components still exist in hall-of-mirrors/ (dead code, kept for reference)
- design-system/ folder still exists (fully decoupled, safe to delete)

## Next Steps
1. Add easing/duration controls to Displacement SVG animation loop
2. Consider waveform options for Pixi continuous animations (Morph already has this)
3. Clean up dead code (old hall pages, design-system/)
4. Implement Archive save/load
5. Wire Symphony copies channel
