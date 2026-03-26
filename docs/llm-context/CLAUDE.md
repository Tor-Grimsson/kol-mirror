# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Hall of Mirrors** — an interactive image distortion playground built with React 19, PixiJS 8, GSAP 3, and Tailwind CSS 4. Part of the Kolkrabbi design system. Uses Vite 7 for build tooling.

## Commands

- **Dev server:** `yarn dev`
- **Build:** `yarn build`
- **Lint:** `yarn lint`
- **Preview prod build:** `yarn preview`

**Use Yarn, not npm.** The project has `yarn.lock`.

## Architecture

Single-page React app, no router. State-driven navigation via `useMirrorState` hook.

### Layout
- `MirrorPlayground` — Root: sidebar + full-bleed viewport
- Desktop (non-touch ≥768px): persistent left sidebar
- Mobile / touch devices: hamburger → left drawer
- Detection via CSS `@media (pointer: fine)`, not just viewport width

### Sidebar (`MirrorSidebar`)
Two navigation groups:
- **Halls** — Displacement, Movement, Copies (each has variant list + controls in sidebar)
- **Mixer** — Symphony, Archive (standalone views rendered in viewport)
- Theme toggle in footer

### Viewport (`MirrorViewport`)
- No selection → responsive sample photo (srcset 400–2560px)
- Hall + variant → single variant full-bleed
- Symphony/Archive → own scrollable content

### State (`src/hooks/useMirrorState.js`)
Single hook: active hall, active variant, image uploads, animation controls for all hall types.

### Variant Data (`src/data/mirrorVariants.js`)
Presets for all variants + responsive image helper.

### Styles (`src/styles/`)
- `theme.css` — imports color + typography, defines spacing/radius/shadow/z-index tokens
- `kol-color-simple.css` — color tokens
- `kol-typography-mono.css` — typography classes
- `components.css` — button, slider, toggle, dropdown component styles

### Filter Variants (`src/components/hall-of-mirrors/`)
Two rendering approaches:
1. **SVG filters** — `MirrorVariant.jsx` (feTurbulence → feDisplacementMap), supports `fullBleed` prop
2. **PixiJS** — `Pixi*Variant.jsx` (WebGL: TilingSprite, sprite masking, ColorMatrix)
3. **GSAP** — `MovementVariant.jsx` (scale/stretch/harmonica transforms)

### Controls
- `DistortionControlsPanel` — 3 sliders (Scale, Base Frequency, Octaves) for Displacement/Copies
- `MovementControlsPanel` — 3 sliders (Duration, Amount, Cycle Strength) for Movement
- Both render inline in sidebar when a variant is selected

### Design Tokens
- Typography: `.kol-display-*`, `.kol-heading-*`, `.kol-text-*`, `.kol-helper-*` (sizes: xl→xxxs)
- Colors: `text-fg-{96,64,32,08}`, `bg-surface-{primary,secondary}`, `accent-primary`
- Z-index: `--kol-z-nav: 1000`, `--kol-z-overlay: 50`, etc.
- Mobile layout classes: `.mirror-sidebar-desktop`, `.mirror-mobile-header`, `.mirror-viewport`

### Session Log Protocol

Read `docs/llm-context/AGENT-CONTEXT.md` and latest session log in `docs/llm-context/session-log/` before starting work. Write a session log after significant changes.

## ESLint

Flat config (`eslint.config.js`). `no-unused-vars` ignores variables matching `^[A-Z_]`.
