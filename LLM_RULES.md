# LLM Rules for Hall of Mirrors

---

## ⚠️ CRITICAL STARTUP PROTOCOL - READ THIS FIRST ⚠️

**WHEN THE USER SAYS "read `LLM_RULES.md`" YOU MUST:**

1. **READ** `/docs/llm-context/AGENT-CONTEXT.md`
2. **READ** the latest session log from `/docs/llm-context/session-log/` (sort by date, most recent first)
3. **STOP** and say "Context loaded. What would you like me to work on?"
4. **WAIT** for the user to specify their task

**DO NOT:**
- Skip reading the context files
- Start working before the user specifies a task

**IF THE USER ASKS "Do you understand?" or "Outline the task?":**
Respond with a clear plan of what you'll do BEFORE taking any action.

---

# LLM Agent Onboarding

Welcome to **Hall of Mirrors** — an interactive image distortion playground. Part of the Kolkrabbi design system.

## Quick Start

1. **Read this file** to understand the project structure
2. **Read** `/docs/llm-context/AGENT-CONTEXT.md` for current project state
3. **Check** `/docs/llm-context/session-log/` for the most recent session log
4. **Follow** the conventions and guidelines below

## Project Overview

**Hall of Mirrors** is a single-page React app for experimenting with image distortion effects using SVG filters, PixiJS WebGL, and GSAP animations. No router — navigation is state-driven.

### Tech Stack
- React 19 + Vite 7
- Tailwind CSS 4
- PixiJS 8 (WebGL rendering)
- GSAP 3 (SVG attribute animation, transforms)
- **Yarn** (package manager - NOT npm)

### Package Manager

**⚠️ IMPORTANT: This project uses Yarn, NOT npm**

- **Run dev server:** `yarn dev`
- **Install dependencies:** `yarn install` or `yarn`
- **Build:** `yarn build`
- **Lint:** `yarn lint`

**DO NOT use npm commands** — the project has `yarn.lock`, not `package-lock.json`

## Architecture

### Layout
- `MirrorPlayground` — Root layout: sidebar + viewport
- Desktop (non-touch ≥768px): persistent left sidebar
- Mobile / touch devices: hamburger menu → left drawer
- Detection via CSS `pointer: fine` media query, not just breakpoints

### Sidebar (`MirrorSidebar`)
Two groups:
- **Halls** — Displacement, Movement, Copies (each has variant list + controls)
- **Mixer** — Symphony, Archive (standalone views, no variant picker)

### Viewport (`MirrorViewport`)
- No hall selected → responsive sample photo (srcset: 400–2560px)
- Hall + variant selected → single variant rendered full-bleed
- Symphony/Archive → their own scrollable content

### State (`useMirrorState` hook)
Single hook manages: active hall, active variant, image uploads, animation controls for all hall types.

### Variant Data (`src/data/mirrorVariants.js`)
Preset values for all variants extracted into a single data file.

## Directory Structure

```
kol-mirrors/
├── src/
│   ├── App.jsx                          # Renders MirrorPlayground
│   ├── index.css                        # Tailwind + theme + component CSS imports
│   ├── styles/                          # Design tokens & component CSS
│   │   ├── theme.css                    # Imports color + typography + defines tokens
│   │   ├── kol-color-simple.css         # Color tokens
│   │   ├── kol-typography-mono.css      # Typography classes
│   │   └── components.css               # Button, slider, toggle, dropdown styles
│   ├── data/
│   │   └── mirrorVariants.js            # Variant presets + responsive image helper
│   ├── hooks/
│   │   └── useMirrorState.js            # Unified state for all halls
│   └── components/
│       ├── mirror/                      # Unified view components
│       │   ├── MirrorPlayground.jsx     # Root layout (sidebar + viewport)
│       │   ├── MirrorSidebar.jsx        # Navigation, variants, controls
│       │   ├── MirrorViewport.jsx       # Renders active variant full-bleed
│       │   ├── SymphonyViewport.jsx     # Symphony canvas + mixer
│       │   ├── ArchiveViewport.jsx      # Archive grid
│       │   ├── MobileHeader.jsx         # Hamburger bar (touch/mobile)
│       │   └── MobileDrawer.jsx         # Left drawer (touch/mobile)
│       ├── hall-of-mirrors/             # Filter variant components
│       │   ├── MirrorVariant.jsx        # SVG displacement (supports fullBleed prop)
│       │   ├── MovementVariant.jsx      # GSAP transforms (extracted)
│       │   ├── Pixi*.jsx               # PixiJS WebGL variants (5 types)
│       │   ├── PixiImageFilterCanvas.jsx # Image grading (ColorMatrix + Noise)
│       │   ├── DistortionControlsPanel.jsx
│       │   ├── MovementControlsPanel.jsx
│       │   ├── SymphonyMixer.jsx
│       │   └── RotaryDial.jsx
│       ├── atoms/                       # Primitives (Slider, Checkbox, etc.)
│       ├── molecules/                   # Composed components (Dropdown, ThemeToggleButton, etc.)
│       └── icons/                       # Icon component + 226 SVGs
├── public/images/                       # stack-hero-{400,800,1200,1600,2560}.jpg
├── docs/
│   ├── llm-context/                     # AI agent context
│   │   ├── AGENT-CONTEXT.md
│   │   ├── CLAUDE.md
│   │   └── session-log/
│   └── documentation/                   # Design system docs
└── LLM_RULES.md                         # This file
```

## LLM Context Protocol

This project uses **session logs** to maintain context across agents and sessions.

### Reading Context

**Always read the latest session log** in `/docs/llm-context/session-log/` before starting work. Session logs are named:
- `YYYY-MM-DD-session-description.md`

Sort by date to find the most recent.

### Writing Context

When you complete significant work:
1. Create a new session log in `/docs/llm-context/session-log/`
2. Use the format: `YYYY-MM-DD-brief-description.md`
3. Include: session metadata, changes made, current state, next steps
4. Update `AGENT-CONTEXT.md` if needed

## Working Conventions

### Code Style

- **No over-engineering** — Make only requested changes
- **Remove unused code** — Delete completely, no backwards-compat hacks
- **Edit over create** — Prefer modifying existing files
- **Use existing patterns** — Follow established naming and structure
- **Apply exact values** — When user specifies a concrete number, use it

### Typography System

**Weight Hierarchy:**
- 600 (SemiBold) - Display styles
- 500 (Medium) - Headings & helpers
- 400 (Regular) - Body text

**Class Naming:**
- `.kol-display-*` - Hero/section headings
- `.kol-heading-*` - Content headings
- `.kol-text-*` - Body copy
- `.kol-helper-*` - Labels/metadata

**Size Scale:** xl, lg, md, sm, xs, xxs, xxxs

### CSS

- Design tokens in `src/styles/theme.css`
- Component CSS in `src/styles/components.css`
- Color tokens: `text-fg-{96,64,32,08}`, `bg-surface-{primary,secondary}`, `accent-primary`
- Z-index via CSS variables: `--kol-z-nav`, `--kol-z-overlay`, etc.
- Mobile detection: `@media (min-width: 768px) and (pointer: fine)` for desktop

### Git Workflow

- Only commit when explicitly asked
- Write clear, concise commit messages
- Never force push or use destructive commands without permission
