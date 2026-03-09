# Kolkrabbi Typography System

## Overview

- **Version:** 3.0
- **Date:** 2025-01-27 (updated 2025-11-03)
- **Architecture:** Figma-first with fluid responsive sizing

## Design Philosophy

- **Figma-First**: Typography styles directly map to Figma design tokens
- **Semantic Naming**: Class names reflect purpose and hierarchy
- **Fluid Responsive**: All styles use `clamp()` for smooth scaling
- **Harmonic Scale**: 15-step scale (8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 40, 48, 64, 80, 96px)

---

## Font Families

| Token | Font | Usage |
|-------|------|-------|
| `--kol-font-family-rgrot-narrow` | Right Grotesk Narrow | Headings |
| `--kol-font-family-rgrot-tight` | Right Grotesk Tight | Display, Hero |
| `--kol-font-family-rgrot-compact` | Right Grotesk Compact | Compact text |
| `--kol-font-family-body` | Inter Tight | Body copy |
| `--kol-font-family-mono` | Right Grotesk Mono | Code, data |

---

## Typography Classes

### Display (Largest Headings)

| Class | Font | Size (Mobile → Desktop) | Line Height |
|-------|------|------------------------|-------------|
| `.kol-display-lg` | Right Grotesk Tight | `48px → 96px` | 100% |
| `.kol-display-section` | Right Grotesk Tight | `40px → 64px` | 100% |
| `.kol-display-section-sm` | Right Grotesk Tight | `32px → 48px` | 100% |
| `.kol-display-subsection` | Right Grotesk Narrow | `32px → 48px` | 100% |

### Heading

| Class | Font | Size | Line Height |
|-------|------|------|-------------|
| `.kol-heading-xl` | Right Grotesk Narrow | `40px → 64px` | 110% |
| `.kol-heading-lg` | Right Grotesk Narrow | `32px → 48px` | 110% |
| `.kol-heading-md` | Right Grotesk Narrow | `28px → 40px` | 120% |
| `.kol-heading-sm` | Right Grotesk Tight | `20px → 32px` | 100% |
| `.kol-heading-xs` | Right Grotesk Narrow | `18px → 28px` | 125% |

### Text (Body Copy)

| Class | Font | Size | Line Height |
|-------|------|------|-------------|
| `.kol-text-lg` | Inter Tight | `18px → 20px` | 160% |
| `.kol-text-md` | Inter Tight | `14px → 18px` | 160% |
| `.kol-text-sm` | Inter Tight | `12px → 16px` | 150% |

### Mono

| Class | Font | Size | Line Height |
|-------|------|------|-------------|
| `.kol-mono-text` | Right Grotesk Mono | `14px → 18px` | 125% |
| `.kol-mono-sm` | Right Grotesk Mono | `12px → 16px` | 125% |
| `.kol-mono-xs` | Right Grotesk Mono | `10px → 14px` | 120% |
| `.kol-mono-xxs` | Right Grotesk Mono | `8px → 12px` | 120% |

### Labels

| Class | Font | Size | Line Height |
|-------|------|------|-------------|
| `.kol-label-mono-sm` | Right Grotesk Mono | `14px → 24px` | 100% |
| `.kol-label-mono-md` | Right Grotesk Mono | `12px → 16px` | 125% |
| `.kol-label-compact-lg` | Right Grotesk Narrow | `24px → 28px` | 100% |

### Helpers

| Class | Font | Size | Line Height |
|-------|------|------|-------------|
| `.kol-helper-uc-*` | Right Grotesk Mono | 8-20px | 100% |
| `.kol-helper-*` | Right Grotesk Mono | 8-20px | 100% |
| `.kol-helper-fine-*` | Right Grotesk Mono Fine | 8-20px | 100% |

---

## Source Files

- `/packages/ui/theme.css` - Font family tokens
- `/packages/ui/css/components.css` - Typography classes
- `/packages/ui/css/prose.css` - Prose system

---

## Usage Statistics

- **Total references:** 1230+
- **Files using:** 177
- **Most used:** `.kol-mono-*`, `.kol-heading-*`, `.kol-text-*`

---

## Version

Extracted: 2026-02-14
