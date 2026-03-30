# Session: UI Polish, Universal Recording, Mixer Restructure

**Date:** 2026-03-30 (session 2)
**Agent:** Claude Code (Opus 4.6)
**Summary:** Major UI unification pass (text colors, row heights, gap consistency, Dropdown components), right shelf extends full height, FX rack restructured inside flex-row, rotary dial tick marks, channel strip reorganization, per-channel vector/background color wiring, SVG recolor upload, vector padding slider, [EDIT] for preset variants.

## Changes Made

### Files Modified
- `src/components/hall-of-mirrors/SymphonyMixer.jsx` — Massive UI overhaul:
  - All text labels unified to `text-fg-96`, all rows 24px height, all gaps `gap-2`
  - All native `<select>` replaced with `Dropdown` component (`variant="minimal"` `size="md"`)
  - Dropdown minimal width set to 96px
  - Blend mode options in Sentence case with hover preview
  - FX rack moved inside flex-row column wrapper so right shelf stretches full height via `items-stretch`
  - FX rack `kol-helper-xs` (was xs-2), 4px border overlap under channel strip
  - Channel strip always 4px border-radius
  - Bottom FX tabs reordered: COLOR | BLEND | FX (Color default)
  - Right shelf tabs: PARAMS | RES | REC | SRC
  - RES tab moved from bottom shelf to right shelf (Tier dropdown, Raster Theme dropdown, [RECALC])
  - Channel strip icons: frequency for Parameters, atomic-molecule for Effects, both 28x28
  - Channels/Output tabs: sentence case, icons (settings-01/circle at 14px), `kol-helper-s`
  - RESET/REC-LOOP/BOOST row below Opacity with divider, accent flash on RESET, REC/LOOP toggles shelf
  - Record row: red dot right of "Record" (toggle arm/cancel), [Start]/[Cancel] ghosted at `text-fg-16` when idle, `text-fg-96` when armed
  - Render cost % moved to FX tab bar (right-aligned)
  - Inline × replaced with `<Icon name="x" size={12}>` everywhere, FX close icons `text-fg-96`
  - [+ Add FX] convention matching [+ Add Slot]
  - SRC tab restructured: Recolor/Normal upload rows at top with upload icon (16px), divider, image thumbnail (5:3 aspect, shows default SVG, hover [Clear] overlay), divider, Padding slider, Source label, Mode dropdown
  - Rec slot scrollbar hidden (`scrollbarWidth: 'none'`), channel row scrollbar hidden
  - Variant loading non-destructive (doesn't reset speed/opacity/fx/colors)
- `src/components/hall-of-mirrors/RotaryDial.jsx` — Fixed outer arc (doesn't rotate with knob), 270° sweep from 7 to 5 o'clock, tick marks: 11 major + 40 minor, 12px gap from knob
- `src/components/hall-of-mirrors/ChannelWireDiagram.jsx` — Default MST x=300, OUT x=600
- `src/components/mirror/SymphonyViewport.jsx` — [EDIT] works for preset variants (navigates to hall+variant), per-channel vector color applied to custom SVG uploads, `globalImageThumb` falls back to `defaultSvgColored`
- `src/components/mirror/ChannelLayer.jsx` — Non-Pixi variants prefer SVG (`imageSrc`) over raster, per-channel `backgroundColor` on all render paths (no-effect, displacement, movement), `vectorPadding` scale transform on no-effect path, capture canvas uses viewport dimensions via `wrapperRef`
- `src/components/mirror/VariantControls.jsx` — Gap changed from 4px to `gap-2`
- `src/components/molecules/Dropdown.jsx` — Added `onOptionHover` prop for live preview, minimal width 96px
- `src/components/atoms/ColorPicker.jsx` — `currentColor` resolves via `theme !== 'light'` (dark default when no data-theme attribute), portal rendering via `createPortal`
- `src/components/atoms/Slider.jsx` — Dual variant playhead line at full 20px height, click-to-seek on track
- `src/hooks/usePixiApp.js` — `textureVersion` state increments on texture reload, exposed in return
- `src/hooks/useMirrorState.js` — Added `vectorPadding: 0` to EMPTY_CHANNEL
- `src/data/mirrorVariants.js` — Added `low: 1` to RASTER_TIER_SCALES
- `src/utils/processImageUpload.js` — `recolor` option replaces all fills with `currentColor`, `imageSrc` stored as modified SVG data URL
- All 5 Pixi variants — `textureVersion` in build effect deps (fixes tier switching)
- `src/components/icons/index.js` — Registered `control-stop`
- `src/styles/components.css` — `@keyframes pulse`, dual-range CSS classes

### Features Added
- **Right shelf full height**: FX rack inside flex-row column, shelf stretches via items-stretch
- **[EDIT] for presets**: Navigates to correct hall + variant from channel strip
- **Per-channel vector color on effects**: SVG source colored per channel, custom SVG uploads get color replacement
- **Per-channel background color**: Applied on all render paths
- **SVG recolor upload**: Replaces all fills with currentColor, inherits channel vector color
- **Vector padding slider**: Bipolar -100% to +100%, scales SVG relative to its size
- **Texture version tracking**: Pixi variants rebuild on tier switch (was broken)
- **Rotary dial tick marks**: Fixed outer grid, major/minor ticks, 270° sweep
- **Blend mode hover preview**: Live preview when hovering dropdown options

## Current State

### Working
- All 16 variants recordable
- Unified UI: consistent text colors (fg-96), row heights (24px), gaps (gap-2), Dropdown components
- Right shelf extends full height alongside channel strip + FX rack
- Per-channel colors (vector + background) carry through variant loading
- SVG uploads can be recolored to inherit channel color
- Raster tier switching works (texture rebuild)
- Rotary dial with proper tick grid

### Known Issues
- **Displacement capture scale**: Still cropped vs live
- **Real-time OFF**: Placeholder only
- **Variant default backgrounds**: Not defined per variant (in memory)
- Remaining native selects in FX item type dropdowns

## Next Steps
1. Fix displacement capture canvas framing
2. Define per-variant default backgrounds
3. Implement frame-perfect offline capture
