# Kolkrabbi Color System

## Overview

- **Total tokens**: 97
- **Architecture**: Material Design 3-inspired
- **Features**: Light/dark mode pairs, context-aware remapping, WCAG AA/AAA compliant
- **Version**: 3.5 (2025-12-03)

This document provides comprehensive documentation for the kolkrabbi color system, extracted from `packages/ui/theme.css`.

---

## Token Architecture

### Naming Convention

All tokens follow the pattern: `--kol-{category}-{semantic}-{variant}`

**Categories:**
- `color` - Primitive foundation colors (brand, neutral)
- `surface` - Page-level backgrounds
- `container` - Component-level backgrounds
- `accent` - Brand highlights and calls-to-action
- `status` - System states (danger)
- `border` - Semantic border colors
- `opacity-hex` - Pre-calculated opacity values

**Semantic names:**
- `primary`, `secondary`, `tertiary` - Hierarchy levels
- `inverse` - Inverted theme
- `elevated` - Raised z-index
- `danger` - Error/destructive states

**Variants:**
- `on-{semantic}` - Foreground pair (text/icons)
- `{semantic}-hover` - Hover state
- `{semantic}-active` - Active/pressed state
- `{semantic}-strong` - Emphasized variant
- `{semantic}-muted` - De-emphasized variant

---

## Token Categories

### 1. Primitive Colors (Level 1)

Brand colors and neutral grays that form the foundation.

#### Brand Colors

| Token | Value | Description |
|-------|-------|-------------|
| `--kol-color-brand-dark` | `#1e1e21` | Primary dark brand color |
| `--kol-color-brand-light` | `#fcfbf8` | Primary light brand color |
| `--kol-color-brand-yellow` | `#f5d245` | Primary accent yellow |
| `--kol-color-brand-yellow-deep` | `#f5bb1d` | Deeper yellow for hover |
| `--kol-color-brand-orange` | `#a83e01` | Brand orange |
| `--kol-color-brand-red` | `#bc583f` | Brand red |
| `--kol-color-absolute-black` | `#000000` | Pure black |
| `--kol-color-absolute-white` | `#ffffff` | Pure white |
| `--kol-color-median-dark` | `#0d0d0d` | Dark median |
| `--kol-color-median-light` | `#f8f8f8` | Light median |

#### Neutral Grays (50-900)

| Token | Light Mode | Dark Mode |
|-------|------------|-----------|
| `--kol-color-neutral-50` | `#fafafa` | (same) |
| `--kol-color-neutral-100` | `#f5f5f5` | (same) |
| `--kol-color-neutral-200` | `#eeeeee` | (same) |
| `--kol-color-neutral-300` | `#e0e0e0` | (same) |
| `--kol-color-neutral-400` | `#bfbfbf` | (same) |
| `--kol-color-neutral-500` | `#757575` | (same) |
| `--kol-color-neutral-600` | `#616161` | (same) |
| `--kol-color-neutral-700` | `#424242` | (same) |
| `--kol-color-neutral-800` | `#212121` | (same) |
| `--kol-color-neutral-900` | `#1e1e21` | (same) |

---

### 2. Surface Tokens (Page-level)

Semantic tokens for page backgrounds with automatic light/dark mode.

#### Surface Primary

| Token | Light Mode | Dark Mode | Description |
|-------|------------|-----------|-------------|
| `--kol-surface-primary` | `#fafafa` | `#121215` | Main page background |
| `--kol-surface-on-primary` | `#121215` | `#fafafa` | Text on primary surface |

#### Surface Secondary

| Token | Light Mode | Dark Mode | Description |
|-------|------------|-----------|-------------|
| `--kol-surface-secondary` | `#f2f2f2` | `#19191d` | Section backgrounds |
| `--kol-surface-on-secondary` | `#19191d` | `#f8f8f8` | Text on secondary surface |

#### Surface Tertiary

| Token | Light Mode | Dark Mode | Description |
|-------|------------|-----------|-------------|
| `--kol-surface-tertiary` | `#ffffff` | `#0e0e11` | Card backgrounds |
| `--kol-surface-on-tertiary` | `#0e0e11` | `#ffffff` | Text on tertiary surface |

#### Surface Inverse

| Token | Light Mode | Dark Mode | Description |
|-------|------------|-----------|-------------|
| `--kol-surface-inverse` | `#0e0e11` | `#fcfbf8` | Nav/footer backgrounds |
| `--kol-surface-on-inverse` | `#fcfbf8` | `#0e0e11` | Text on inverse surface |
| `--kol-surface-secondary-inverse` | `#212121` | `#e0e0e0` | Secondary in inverse context |
| `--kol-surface-tertiary-inverse` | `#424242` | `#d4d4d8` | Tertiary in inverse context |

#### Surface Support Split

| Token | Light Mode | Dark Mode | Description |
|-------|------------|-----------|-------------|
| `--kol-surface-support-split` | `#eeeeee` | `#202026` | Split-screen support side |
| `--kol-surface-support-split-inverse` | `#202026` | `#eeeeee` | Inverse of support split |
| `--kol-surface-absolute-split` | `#ffffff` | `#000000` | Split-screen absolute side |
| `--kol-surface-absolute-split-inverse` | `#000000` | `#ffffff` | Inverse of absolute split |

#### Surface Contrast

| Token | Light Mode | Dark Mode | Description |
|-------|------------|-----------|-------------|
| `--kol-surface-contrast` | `#F2F2F2` | `#0B0B0C` | Gradient transitions |

---

### 3. Container Tokens (Component-level)

Semantic tokens for component backgrounds.

#### Container Primary

| Token | Light Mode | Dark Mode | Description |
|-------|------------|-----------|-------------|
| `--kol-container-primary` | `#f5f5f5` | `#19191d` | Standard component bg |
| `--kol-container-on-primary` | `#19191d` | `#f5f5f5` | Text on container primary |
| `--kol-container-primary-inverse` | `#19191d` | `#f5f5f5` | Inverse variant |
| `--kol-container-on-primary-inverse` | `#f5f5f5` | `#19191d` | Text on inverse |

#### Container Secondary

| Token | Light Mode | Dark Mode | Description |
|-------|------------|-----------|-------------|
| `--kol-container-secondary` | `#eeeeee` | `#202026` | Nested components |
| `--kol-container-on-secondary` | `#202026` | `#eeeeee` | Text on container secondary |
| `--kol-container-secondary-inverse` | `#202026` | `#eeeeee` | Inverse variant |
| `--kol-container-on-secondary-inverse` | `#eeeeee` | `#202026` | Text on inverse |

#### Container Elevated

| Token | Light Mode | Dark Mode | Description |
|-------|------------|-----------|-------------|
| `--kol-container-elevated` | `#f5f5f5` | `#242427` | Floating components |
| `--kol-container-on-elevated` | `#242427` | `#f5f5f5` | Text on elevated |
| `--kol-container-elevated-inverse` | `#242427` | `#f5f5f5` | Inverse variant |
| `--kol-container-on-elevated-inverse` | `#f5f5f5` | `#242427` | Text on inverse |

---

### 4. Accent Tokens

| Token | Light Mode | Dark Mode | Description |
|-------|------------|-----------|-------------|
| `--kol-accent-primary` | `#f5d245` | `#f5d245` | Brand yellow (constant) |
| `--kol-accent-on-primary` | `#1e1e21` | `#1e1e21` | Text on accent |
| `--kol-accent-primary-strong` | `#f5bb1d` | `#f5bb1d` | Hover/emphasis |
| `--kol-accent-primary-muted` | `18% opacity` | `24% opacity` | Subtle accent |

---

### 5. Status Tokens

| Token | Light Mode | Dark Mode | Description |
|-------|------------|-----------|-------------|
| `--kol-status-danger` | `#9b3928` | `#bc583f` | Error/destructive |
| `--kol-status-on-danger` | `#ffffff` | `#ffffff` | Text on danger |
| `--kol-status-danger-strong` | `#bc583f` | `#9b3928` | Stronger danger |
| `--kol-status-danger-muted` | `18% opacity` | `24% opacity` | Subtle danger |

---

### 6. Border Tokens

| Token | Light Mode | Dark Mode | Description |
|-------|------------|-----------|-------------|
| `--kol-border-default` | `8% on-primary` | `8% on-primary` | Default border |
| `--kol-border-subtle` | `4% on-primary` | `4% on-primary` | Subtle border |
| `--kol-border-strong` | `16% on-primary` | `16% on-primary` | Strong border |
| `--kol-border-hover` | `16% on-primary` | `16% on-primary` | Hover state |
| `--kol-border-focus` | `--kol-accent-primary` | `--kol-accent-primary` | Focus state |
| `--kol-border-active` | `--kol-accent-primary-strong` | `--kol-accent-primary-strong` | Active state |
| `--kol-focus-ring` | `--kol-accent-primary` | `--kol-accent-primary` | Focus ring |

---

### 7. State Tokens

#### Hover States (5% mix)

| Token | Description |
|-------|-------------|
| `--kol-surface-primary-hover` | Primary surface hover |
| `--kol-surface-secondary-hover` | Secondary surface hover |
| `--kol-surface-tertiary-hover` | Tertiary surface hover |
| `--kol-container-primary-hover` | Primary container hover |
| `--kol-container-secondary-hover` | Secondary container hover |

#### Active States (10% mix)

| Token | Description |
|-------|-------------|
| `--kol-surface-primary-active` | Primary surface active |
| `--kol-surface-secondary-active` | Secondary surface active |
| `--kol-surface-tertiary-active` | Tertiary surface active |
| `--kol-container-primary-active` | Primary container active |
| `--kol-container-secondary-active` | Secondary container active |

---

### 8. Opacity Hex Tokens

Pre-calculated hex colors for performance (avoiding color-mix).

#### Standard (Light Mode)

| Token | Value | Description |
|-------|-------|-------------|
| `--kol-opacity-hex-01` | `#fcfbfb` | 1% overlay |
| `--kol-opacity-hex-02` | `#f4f4f5` | 2% overlay |
| `--kol-opacity-hex-04` | `#ebebeb` | 4% overlay |
| `--kol-opacity-hex-08` | `#dbdbdb` | 8% overlay |
| `--kol-opacity-hex-12` | `#a3a3a4` | 12% overlay |
| `--kol-opacity-hex-16` | `#5b5b5d` | 16% overlay |
| `--kol-opacity-hex-24` | `#363639` | 24% overlay |
| `--kol-opacity-hex-32` | `#2e2e30` | 32% overlay |
| `--kol-opacity-hex-64` | `#242427` | 64% overlay |
| `--kol-opacity-hex-80` | `#1b1b1e` | 80% overlay |
| `--kol-opacity-hex-88` | `#171719` | 88% overlay |
| `--kol-opacity-hex-96` | `#111112` | 96% overlay |

#### Inverse (Light Mode)

| Token | Value | Description |
|-------|-------|-------------|
| `--kol-opacity-hex-inverse-01` | `#111112` | 1% inverse |
| `--kol-opacity-hex-inverse-02` | `#171719` | 2% inverse |
| `--kol-opacity-hex-inverse-04` | `#1b1b1e` | 4% inverse |
| `--kol-opacity-hex-inverse-08` | `#242427` | 8% inverse |
| `--kol-opacity-hex-inverse-12` | `#2e2e30` | 12% inverse |
| `--kol-opacity-hex-inverse-16` | `#363639` | 16% inverse |
| `--kol-opacity-hex-inverse-24` | `#5b5b5d` | 24% inverse |
| `--kol-opacity-hex-inverse-32` | `#a3a3a4` | 32% inverse |
| `--kol-opacity-hex-inverse-64` | `#dbdbdb` | 64% inverse |
| `--kol-opacity-hex-inverse-80` | `#ebebeb` | 80% inverse |
| `--kol-opacity-hex-inverse-88` | `#f4f4f5` | 88% inverse |
| `--kol-opacity-hex-inverse-96` | `#fcfbfb` | 96% inverse |

#### Dark Mode Values

In dark mode, opacity-hex tokens flip automatically:
- Standard tokens become light overlays
- Inverse tokens become dark overlays

See `kol-color.css` for complete dark mode values.

---

## Light/Dark Mode Pairs

Complete matrix of all paired tokens:

| Token | Light Mode | Dark Mode | Foreground Token |
|-------|------------|-----------|------------------|
| `--kol-surface-primary` | `#fafafa` | `#121215` | `--kol-surface-on-primary` |
| `--kol-surface-secondary` | `#f2f2f2` | `#19191d` | `--kol-surface-on-secondary` |
| `--kol-surface-tertiary` | `#ffffff` | `#0e0e11` | `--kol-surface-on-tertiary` |
| `--kol-surface-inverse` | `#0e0e11` | `#fcfbf8` | `--kol-surface-on-inverse` |
| `--kol-surface-contrast` | `#F2F2F2` | `#0B0B0C` | `--kol-surface-on-primary` |
| `--kol-container-primary` | `#f5f5f5` | `#19191d` | `--kol-container-on-primary` |
| `--kol-container-secondary` | `#eeeeee` | `#202026` | `--kol-container-on-secondary` |
| `--kol-container-elevated` | `#f5f5f5` | `#242427` | `--kol-container-on-elevated` |
| `--kol-accent-primary` | `#f5d245` | `#f5d245` | `--kol-accent-on-primary` |
| `--kol-status-danger` | `#9b3928` | `#bc583f` | `--kol-status-on-danger` |

---

## Utility Classes

All color-related utility classes defined in `packages/ui/css/utilities.css`:

**Note:** The standalone `kol-color.css` now includes these utility classes for standalone usage.

### Basic Utilities
- `.text-auto` - Foreground color
- `.text-auto-inverse` - Inverse foreground
- `.text-inverse` - Inverse text
- `.text-light-fixed` - Fixed light text
- `.text-dark-fixed` - Fixed dark text
- `.bg-auto` - Background color
- `.bg-auto-inverse` - Inverse background
- `.bg-fg` - Solid foreground background
- `.border-auto` - Default border
- `.border-auto-inverse` - Inverse border
- `.divider-auto` - Horizontal divider
- `.divider-auto-inverse` - Inverse divider

### Surface Utilities (with auto foreground)
- `.bg-surface-primary` - Primary surface
- `.bg-surface-secondary` - Secondary surface
- `.bg-surface-tertiary` - Tertiary surface
- `.bg-surface-inverse` - Inverse surface
- `.bg-surface-contrast` - Contrast surface

### Container Utilities
- `.bg-container-primary` - Primary container
- `.bg-container-secondary` - Secondary container
- `.bg-container-elevated` - Elevated container
- `.bg-container-on-primary` - Inverted primary
- `.bg-container-on-secondary` - Inverted secondary
- `.bg-container-on-elevated` - Inverted elevated

### Support & Absolute
- `.bg-surface-support-split` - Support split bg
- `.bg-surface-support-split-inverse` - Inverse support split
- `.bg-surface-absolute-split` - Absolute split bg
- `.bg-surface-absolute-split-inverse` - Inverse absolute split

### Elevation
- `.elevation-base` - Level 0: Base
- `.elevation-raised` - Level 1: Raised
- `.elevation-elevated` - Level 2: Elevated

### Opacity Hex Backgrounds
- `.bg-opacity-hex-01` through `.bg-opacity-hex-96`
- `.bg-opacity-hex-inverse-01` through `.bg-opacity-hex-inverse-96`
- `.hover\:bg-opacity-hex-*` - Hover variants

### Opacity Hex Borders
- `.border-opacity-hex-01` through `.border-opacity-hex-96`
- `.border-opacity-hex-inverse-01` through `.border-opacity-hex-inverse-96`

### Foreground-based Opacity
- `.bg-fg-01` through `.bg-fg-96` - Background opacity
- `.bg-fg-inverse-01` through `.bg-fg-inverse-96` - Inverse bg opacity
- `.border-fg` through `.border-fg-96` - Border opacity
- `.border-fg-inverse-01` through `.border-fg-inverse-96` - Inverse border
- `.text-fg-01` through `.text-fg-96` - Text opacity

### State Utilities
- `.hover\:bg-surface-primary-hover` - Hover states
- `.active\:bg-surface-primary-active` - Active states
- `.hover\:border-hover` - Border hover
- `.focus\:border-focus` - Focus state
- `.focus-visible\:ring-focus` - Focus ring
- `.active\:border-active` - Active border

### Absolute Colors
- `.bgAbsoluteWhite` - Fixed white background
- `.bgAbsoluteBlack` - Fixed black background
- `.textAbsoluteWhite` - Fixed white text
- `.textAbsoluteBlack` - Fixed black text

---

## Context-Aware Remapping

Tokens that trigger scoped remapping when applied:

### `.bg-surface-inverse`

When applied, remaps all child surface tokens to inverse equivalents:

```css
.bg-surface-inverse {
  /* Remap surface tokens */
  --kol-surface-primary: var(--kol-surface-inverse);
  --kol-surface-on-primary: var(--kol-surface-on-inverse);

  --kol-surface-secondary: var(--kol-surface-secondary-inverse);
  --kol-surface-on-secondary: var(--kol-surface-on-inverse);

  --kol-surface-tertiary: var(--kol-surface-tertiary-inverse);
  --kol-surface-on-tertiary: var(--kol-surface-on-inverse);

  /* Remap container tokens */
  --kol-container-primary: var(--kol-container-primary-inverse);
  --kol-container-on-primary: var(--kol-container-on-primary-inverse);

  /* Remap border tokens */
  --kol-border-default: color-mix(in srgb, var(--kol-surface-on-inverse) 8%, transparent);
}
```

This enables components using surface tokens to automatically adapt when placed inside inverse sections (nav bars, footers, hero sections).

---

## Usage Guidelines

### Dos

- Always use semantic tokens (`--kol-surface-primary`, not `#fafafa`)
- Use paired "on-" tokens for foreground colors
- Leverage context-aware components for inverse sections
- Use geometric opacity scale (02, 04, 08, 16, 32, 64)
- Use utility classes for common patterns

### Don'ts

- Never hardcode hex colors in components
- Don't use deprecated tokens (e.g., `--surface-primary`)
- Avoid bypassing the semantic layer
- Don't mix surface and container tokens incorrectly

---

## Version History

- **v3.5** (2025-12-03): Added `--kol-surface-contrast` token, hover classes for opacity-hex
- **v3.4** (2025-11-02): Added opacity-hex-fixed utility classes
- **v3.3** (2025-10-27): Added opacity-hex utility classes
- **v3.2** (2025-10-27): Updated color values, added opacity-hex scale
- **v3.1** (2025-10-16): Context-aware color system
- **v3.0** (2025-10-16): Complete rewrite
- **v2.0** (2025-10-14): Context-aware system
- **v1.0** (2024-10-04): Initial system

---

## File Locations

**Source:**
- `/packages/ui/theme.css` - CSS custom property tokens (lines 22-504)
- `/packages/ui/css/utilities.css` - Utility classes
- `/apps/web/src/index.css` - App-specific custom styles using tokens directly

**Extracted:**
- `/design-system-extraction/colors/kol-color.md` (this file)
- `/design-system-extraction/colors/kol-color.css` (standalone CSS - tokens + utilities)
- `/design-system-extraction/colors/usage-audit.md` (usage analysis)

## What's Included in kol-color.css

The standalone `kol-color.css` now includes:

1. **CSS Custom Property Tokens** - All 97 color tokens (light/dark mode)
2. **Context-Aware Inverse Remapping** - The `.bg-surface-inverse` behavior
3. **All Color Utility Classes** - Surface, container, opacity, border, text utilities
4. **State Utilities** - Hover, active, focus states
5. **Opacity Hex Classes** - Hardcoded opacity backgrounds and borders

This makes it fully standalone - you can use it without Tailwind or any other dependency.
