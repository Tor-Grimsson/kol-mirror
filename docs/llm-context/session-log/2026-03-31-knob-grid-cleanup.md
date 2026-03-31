# Session: Knob Grid, FX Knobs, LOAD Shelf, Logos

**Date:** 2026-03-31
**Agent:** Claude Code (Opus 4.6)
**Summary:** Simplified knob grid layout, wired knobs to FX params, added RDM-XX feedback to LOAD dropdowns, added Logos vector category, shelf full-height fix.

## Changes Made

### Files Modified

- `src/components/hall-of-mirrors/SymphonyMixer.jsx`
  - **Knob grid**: Replaced 2 nested flex rows + `-ml-1` hack with flat `grid grid-cols-3` (3 divs → 1 div)
  - **Card gap**: `gap-2` → `gap-4`
  - **Knob params**: Replaced duplicate SPD/OPC/BST/XXX/XXX with HUE/SAT/BRT/CTR/BLR — each reads/writes FX array via `getFxValue`/`setFxValue` helpers. Auto-creates FX entry on first knob turn.
  - **RDM-XX feedback**: Color, Blend, Blur, Brightness, Vector, Scale dropdowns show `RDM-XX` (random 01-99) instead of static "Random". Generated on mount, re-rolls on each randomize, resets to "Random" on clear.
  - **Shapes/Forms dropdowns**: Removed `keepOpen` so they close after selection. Now show selected item in dropdown value.
  - **Logos category**: New `VECTOR_LOGOS` array with `L-01` (shape-00.svg). Dropdown below Forms. Selecting any vector dropdown clears the other two.
  - **Divider**: Added above Shapes row
  - **Channel row scroll**: `overflowX: 'hidden'` → `'auto'` on row layout
  - **Right shelf full height**: Removed `mt-4`, added `self-stretch`. Moved header inside left column so flex-row root spans full height. Outer wrapper changed from `flex-col` to `flex-row items-stretch`.

- `src/components/hall-of-mirrors/RotaryDial.jsx`
  - Added `px-2` to label/value row for tighter text spacing
  - (compact mode was implemented then fully reverted — `compact` prop remains unused)

- `src/components/molecules/Dropdown.jsx`
  - Added `placeholder` prop to destructured params
  - When `value` is empty and `placeholder` is set, shows placeholder text instead of first option's label

- `public/kol-vector/shape-00.svg` — Copied from kol-vector/, logo SVG with white fills (recolored to currentColor by loadVectorSvg)

### Knob Grid Layout (2x3)

| INT | HUE | SAT |
|-----|-----|-----|
| BRT | CTR | BLR |

- INT: intensity (0-100)
- HUE: hue-rotate FX (0-360°, mapped to 0-100 knob)
- SAT: saturate FX (0-3x, mapped to 0-100 knob)
- BRT: brightness FX (0-3x, mapped to 0-100 knob)
- CTR: contrast FX (0-3x, mapped to 0-100 knob)
- BLR: blur FX (0-20px, mapped to 0-100 knob)

## Current State

### Working
- Flat CSS grid knob layout
- FX knobs create/update FX entries in channel fx array
- RDM-XX visual feedback on all LOAD shelf randomizers
- Shapes/Forms/Logos dropdowns show selection, close on pick
- Right shelf spans full channel height
- Channel row scrolls horizontally

### Known Issues (unchanged)
- RotaryDial `compact` prop still unused
- Tier recalc broken for Pixi variants
- Displacement capture scale still cropped
