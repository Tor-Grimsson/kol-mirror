# Agent Context

## Current State

### Active Work
- Symphony mixer: live slot routing, dial as multiplier with overdrive, channel settings shelf with paginated controls and pinned Comp A/B tabs
- Kaleidoscope: Comp A/B tab system, grab-to-move wedge, fill/edge controls, background comp
- Archive/Memory: 9 slots, save/load/edit workflow, thumbnails, [EDIT] from symphony to hall
- Canvas controls: aspect ratio, image fit, vector/background color pickers

### Known Issues
- **Feather keying**: Gradient donut renders but can't convert to transparency. Pixi alpha mask failed (r*a shader). Erase blend needs render groups.
- **Blend modes**: Don't work on Pixi containers without render groups (isRenderGroup broke rendering).
- Old hall page components still exist (dead code)

### Recent Changes (2026-03-26)
- **Channel settings shelf**: 280px wide, #0e0e11 bg, tucks under card with negative margin-left, items-stretch + my-4, frequency icon toggle
- **Shelf typography**: `kol-helper-xs-2` class (11px font), 20px row height via `rowHeight` prop on VariantControls/Dropdown, CSS overrides for slider/helper classes in shelf scope
- **Shelf pagination**: 7 items per page, right-aligned indicators, active page fg-96, pinned Comp A/B tabs + divider on all pages, leading dividers stripped per page
- **[EDIT] label**: Constrained to 320px card width, doesn't expand with shelf
- **Comp A/B tabs**: `controlTab` with `tabs` type in VariantControls, enable circles + animate squiggles, full independent controls per comp
- **Grab segment**: Pointer drag on canvas, dashed red outline, hit test on wedge, `wedgeOffsetX/Y` updated via `onParamChange` threaded through all viewports
- **Live slot routing**: Channels store `slotIndex`, resolve params from `archiveSlots` + `variantParams` live
- **Dial as multiplier**: `baseIntensity` stored at load, dial scales relative to it (25-35% = 1x, 100% = overdrive)
- **Speed/animate global**: Both comp A and B controlled by symphony's global toggles
- **Rotation preservation**: `rotationRef.current` re-applied after rebuilds (boost toggle no longer resets position)
- **Channel controls**: [RESET] all, [1][2][3] individual, [EDIT] navigates to hall
- **Load mode change**: Clears all channels

## Project Overview

**Hall of Mirrors** — Interactive image distortion playground. Part of the Kolkrabbi Apparat suite.

### Architecture
- Single-page app with sidebar + viewport (no router, state-driven)
- Sidebar: Mixer (Symphony) → Halls (Displacement, Movement, Copies) → Library (Memory, Presets)
- Controls render from descriptors with tab/divider support
- Symphony: dynamic channels via ChannelLayer, slot channels reference live data, settings shelf with pagination + pinned tabs
- Kaleidoscope: two-comp architecture (Comp A main + Comp B background), independent params/animation

### Key Files
- `src/data/mirrorVariants.js` — Variant definitions, intensityKeys, controls with tabs/dividers
- `src/hooks/useMirrorState.js` — All state (navigation, params, archive, symphony channels, canvas)
- `src/components/mirror/ChannelLayer.jsx` — Routes channel to renderer, multiplier-based intensity
- `src/components/mirror/VariantControls.jsx` — Control renderer (toggle, slider, binary, select, tabs, divider), rowHeight prop
- `src/components/mirror/MirrorSidebar.jsx` — Navigation + controls + symphony controls + reset
- `src/components/mirror/SymphonyViewport.jsx` — Symphony canvas + mixer, live slot resolution
- `src/components/mirror/ArchiveViewport.jsx` — Memory grid with thumbnails
- `src/components/hall-of-mirrors/SymphonyMixer.jsx` — Dynamic channel mixer UI with [EDIT], settings shelf with pagination + pinned tabs
- `src/components/hall-of-mirrors/PixiKaleidoscopeVariant.jsx` — Kaleidoscope with Comp A/B, fill, edge, grab
- `src/components/hall-of-mirrors/RotaryDial.jsx` — Pointer-based drag dial
