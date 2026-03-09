# Kolkrabbi Typography - Mono Only (JetBrains Mono)

## Overview

Standalone mono typography using JetBrains Mono (local font files).

**Font:** JetBrains Mono
**Source:** `/fonts/jetbrains-mono/`
**Weight hierarchy:**
- SemiBold (600) — display styles
- Medium (500) — headings & helpers
- Regular (400) — body text

---

## Font Files

| Weight | File |
|--------|------|
| 400 - Regular | JetBrainsMono-Regular.woff2 |
| 500 - Medium | JetBrainsMono-Medium.woff2 |
| 500 - Medium Italic | JetBrainsMono-MediumItalic.woff2 |
| 600 - SemiBold | JetBrainsMono-SemiBold.woff2 |

---

## Classes Included

### Display (Largest Headings)

| Class | Size | Weight | Line Height |
|-------|------|--------|-------------|
| `.kol-display-lg` | `48px → 96px` | 600 | 100% |
| `.kol-display-section` | `40px → 64px` | 600 | 100% |
| `.kol-display-subsection` | `32px → 48px` | 600 | 100% |

### Headings

| Class | Size | Weight | Line Height |
|-------|------|--------|-------------|
| `.kol-heading-xl` | `40px → 64px` | 500 | 110% |
| `.kol-heading-lg` | `32px → 48px` | 500 | 110% |
| `.kol-heading-md` | `28px → 40px` | 500 | 120% |
| `.kol-heading-sm` | `20px → 32px` | 500 | 100% |
| `.kol-heading-xs` | `18px → 28px` | 500 | 125% |

### Text (Body Copy)

| Class | Size | Weight | Line Height |
|-------|------|--------|-------------|
| `.kol-text-lg` | `18px → 20px` | 400 | 160% |
| `.kol-text-md` | `14px → 18px` | 400 | 160% |
| `.kol-text-sm` | `12px → 16px` | 400 | 150% |

### Helpers

| Class | Size | Weight | Line Height |
|-------|------|--------|-------------|
| `.kol-helper-xl` | 20px | 500 | 100% |
| `.kol-helper-lg` | 18px | 500 | 100% |
| `.kol-helper-md` | 16px | 500 | 100% |
| `.kol-helper-s` | 14px | 500 | 100% |
| `.kol-helper-xs` | 12px | 500 | 100% |
| `.kol-helper-xxs` | 10px | 500 | 100% |
| `.kol-helper-xxxs` | 8px | 500 | 125% |

---

## Usage

```html
<link rel="stylesheet" href="kol-typography-mono.css">

<h1 class="kol-display-lg">Hero Title</h1>
<h2 class="kol-heading-lg">Section Heading</h2>
<p class="kol-text-md">Body copy text</p>
<span class="kol-helper-s uppercase">LABEL</span>
```

**Composing variants:**
Use Tailwind utilities for variations (e.g., `uppercase`, `font-medium`, `font-normal`) instead of creating duplicate classes.

---

## File

- `kol-typography-mono.css` - Standalone mono CSS (~200 lines)
- Requires fonts in: `/fonts/jetbrains-mono/`
- Version: 1.1
