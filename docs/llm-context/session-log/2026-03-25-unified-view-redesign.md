# Session: Unified View Redesign

**Date:** 2026-03-25
**Agent:** Claude Code (Opus 4.6)
**Summary:** Replaced 6-hall splash screen with unified sidebar + full-bleed viewport layout. Mobile-first with touch detection. Decoupled design-system/ folder.

## Changes Made

### New Files
- `src/components/mirror/MirrorPlayground.jsx` — Root layout (sidebar + viewport)
- `src/components/mirror/MirrorSidebar.jsx` — Hall/Mixer nav, variant list, controls, theme toggle
- `src/components/mirror/MirrorViewport.jsx` — Renders active variant full-bleed
- `src/components/mirror/SymphonyViewport.jsx` — Symphony canvas + mixer (responsive)
- `src/components/mirror/ArchiveViewport.jsx` — Archive 9-slot grid
- `src/components/mirror/MobileHeader.jsx` — Hamburger bar for touch/mobile
- `src/components/mirror/MobileDrawer.jsx` — Left drawer for touch/mobile
- `src/components/hall-of-mirrors/MovementVariant.jsx` — Extracted from HallOfMovement
- `src/data/mirrorVariants.js` — Variant presets + responsive image helper
- `src/hooks/useMirrorState.js` — Unified state hook
- `src/styles/` — theme.css, kol-color-simple.css, kol-typography-mono.css, components.css

### Modified Files
- `src/App.jsx` — Now renders `<MirrorPlayground />` only
- `src/components/hall-of-mirrors/MirrorVariant.jsx` — Added `fullBleed` prop
- `src/components/hall-of-mirrors/DistortionControlsPanel.jsx` — Import from src/atoms/Slider
- `src/components/hall-of-mirrors/MovementControlsPanel.jsx` — Import from src/atoms/Slider
- `src/components/hall-of-mirrors/PixiImageFilterCanvas.jsx` — Imports from src/ copies
- `src/components/hall-of-mirrors/SymphonyMixer.jsx` — Import from src/atoms/Slider
- `src/components/atoms/Slider.jsx` — Fixed `kol-mono-xs` → `kol-helper-xs`
- `src/components/molecules/ThemeToggleButton.jsx` — Icon 16px, button 32px
- `src/index.css` — Added mirror layout classes, pixi-fullbleed CSS, new style imports

### Features Added
- Unified sidebar + viewport layout (replaces splash screen + 6 separate pages)
- Mobile-first with CSS `pointer: coarse` touch detection
- Responsive images via srcset (400–2560px) with DPR-aware selection
- Theme toggle in sidebar footer
- Symphony and Archive accessible via Mixer group in sidebar

### Removed
- Splash screen (SplashScreen component in old App.jsx)
- Apparatus hall routing (redundant superset of Displacement + Copies)
- All imports from design-system/ folder (decoupled)

## Current State

### Working
- Sidebar navigation between 5 halls (3 variant-based + 2 standalone)
- Single variant full-bleed rendering for Displacement, Copies, Movement
- Symphony viewport with mixer controls
- Archive placeholder grid
- Theme toggle (light/dark)
- Mobile hamburger + drawer on touch devices
- Responsive default image

### Known Issues
- Old hall page components still exist in hall-of-mirrors/ (no longer routed, kept for reference)
- design-system/ folder still exists (fully decoupled, safe to delete)
- Pixi fullbleed uses CSS child selectors (`.pixi-fullbleed > div > div`) — fragile if component structure changes
- 3-slider problem persists (DistortionControlsPanel forces SVG params on PixiJS variants)

## Next Steps

1. Delete design-system/ folder (confirmed safe)
2. Clean up old hall page components that are no longer routed
3. Address 3-slider problem — per-filter control descriptors
4. Implement Archive save/load functionality
5. Wire Symphony copies channel
