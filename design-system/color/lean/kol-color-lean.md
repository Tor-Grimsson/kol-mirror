# Kolkrabbi Color System - Lean / Usage-Optimized

## Overview

This is a minimal version of the color system containing only tokens and utilities that are **actively used** in the codebase.

**Stats:**
- Tokens: ~50 (vs 97 in full version)
- Utility classes: ~40 (vs 100+ in full version)
- Based on: 966 total references across codebase

---

## What's Removed (vs Full Version)

### Tokens Removed
- Neutral grays (50-900) - never directly referenced
- Brand colors (dark, light, orange, red, median) - rarely used
- Opacity-hex tokens - developers prefer color-mix utilities

### Utility Classes Removed
- Inverse variants (`*-inverse-*`) - **0 references**
- Rare opacity levels (01, 12, 32, 48, 80, 96) - <5 references
- Hover opacity utilities
- All hardcoded opacity-hex utilities

---

## Tokens Included

### Surface Tokens

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--kol-surface-primary` | #fafafa | #121215 | 15+ refs |
| `--kol-surface-on-primary` | #121215 | #fafafa | 10+ refs |
| `--kol-surface-secondary` | #f2f2f2 | #19191d | 20+ refs |
| `--kol-surface-on-secondary` | #19191d | #f8f8f8 | - |
| `--kol-surface-tertiary` | #ffffff | #0e0e11 | 5+ refs |
| `--kol-surface-on-tertiary` | #0e0e11 | #ffffff | - |
| `--kol-surface-inverse` | #0e0e11 | #fcfbf8 | 5+ refs |
| `--kol-surface-on-inverse` | #fcfbf8 | #0e0e11 | - |
| `--kol-surface-contrast` | #F2F2F2 | #0B0B0C | 1 ref |

### Container Tokens

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--kol-container-primary` | #f5f5f5 | #19191d | 25+ refs |
| `--kol-container-secondary` | #eeeeee | #202026 | 8+ refs |
| `--kol-container-elevated` | #f5f5f5 | #242427 | 3+ refs |

### Accent Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--kol-accent-primary` | #f5d245 | 20+ refs |
| `--kol-accent-primary-strong` | #f5bb1d | 5+ refs |

### Status Tokens

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--kol-status-danger` | #9b3928 | #bc583f | 10+ refs |
| `--kol-status-on-danger` | #ffffff | #ffffff | - |

---

## Utility Classes Included

### Surface & Container (with auto foreground)

```css
.bg-surface-primary      /* 30+ refs */
.bg-surface-secondary    /* 15+ refs */
.bg-surface-tertiary     /* 5+ refs */
.bg-surface-inverse      /* 8+ refs */
.bg-surface-contrast    /* 1 ref */

.bg-container-primary    /* 25+ refs */
.bg-container-secondary  /* 8+ refs */
.bg-container-elevated   /* 3+ refs */
```

### Elevation

```css
.elevation-base          /* page bg */
.elevation-raised        /* cards */
.elevation-elevated      /* modals */
```

### Foreground Opacity (Used Levels)

**Most Popular - Background:**
```css
.bg-fg-08   /* Default subtle border - MOST USED */
.bg-fg-16    /* Visible overlay */
.bg-fg-24    /* Medium emphasis */
.bg-fg-64    /* Strong fill */
.bg-fg-02    /* Subtle tint */
```

**Most Popular - Border:**
```css
.border-fg          /* Solid */
.border-fg-08       /* 8% - DEFAULT */
.border-fg-16       /* 16% */
.border-fg-24       /* 24% */
.border-fg-32       /* 32% */
.border-fg-64       /* 64% */
```

**Most Popular - Text:**
```css
.text-fg-64   /* 64% - MOST USED (594 refs total!) */
.text-fg-88   /* 88% */
.text-fg-24   /* 24% */
.text-fg-08   /* 8% */
.text-fg-16   /* 16% */
.text-fg-32   /* 32% */
.text-fg-48   /* 48% */
.text-fg-80   /* 80% */
```

### Basic Utilities

```css
.text-auto           /* foreground color */
.text-inverse        /* inverse text */
.bg-auto             /* primary bg */
.bg-fg              /* solid fg bg */
.border-auto         /* 8% border */
.divider-auto        /* 1px divider */
```

### Surface Borders

```css
.border-surface      /* solid surface */
.border-surface-08   /* 8% */
.border-surface-16   /* 16% */
```

### States

```css
.hover\:bg-surface-primary-hover
.hover\:bg-surface-secondary-hover
.hover\:bg-container-primary-hover

.active\:bg-surface-primary-active
.active\:bg-surface-secondary-active
.active\:bg-container-primary-active

.hover\:border-hover
.hover\:border-fg-08
.hover\:border-fg-16

.focus\:border-focus
.focus-visible\:border-focus
.focus-visible\:ring-focus
```

---

## Usage Reference

### Top 10 Most Used

| Rank | Class | References |
|------|-------|------------|
| 1 | `.text-fg-*` | 594 |
| 2 | `.border-fg-*` | 188 |
| 3 | `.bg-fg-*` | 184 |
| 4 | `.bg-surface-primary` | 30+ |
| 5 | `.bg-container-primary` | 25+ |
| 6 | `.bg-surface-secondary` | 15+ |
| 7 | `.bg-container-secondary` | 8+ |
| 8 | `.bg-surface-inverse` | 8+ |
| 9 | `.bg-surface-tertiary` | 5+ |
| 10 | `.bg-container-elevated` | 3+ |

---

## What's NOT Included

### Unused (0 references)
- All `*-inverse-*` utility variants
- `.border-fg-inverse-*`
- `.bg-fg-inverse-*`
- `.text-fg-inverse-*`

### Rarely Used (<5 references)
- Opacity levels: 01, 12, 32, 48, 80, 96
- Hardcoded opacity-hex utilities
- Neutral gray tokens

---

## Dark Mode

Works automatically with:
- `[data-theme="dark"]` attribute on `<html>`
- `.dark` class on `<html>`
- `@media (prefers-color-scheme: dark)` system preference

```html
<!-- Toggle dark mode -->
<button onclick="document.documentElement.setAttribute('data-theme', 'dark')">Dark</button>
<button onclick="document.documentElement.setAttribute('data-theme', 'light')">Light</button>
```

---

## File

- `kol-color-usage.css` - Lean standalone CSS (~400 lines vs 800+ full)
- Works without Tailwind or any dependencies
