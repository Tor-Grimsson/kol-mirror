# Kolkrabbi Typography - All Mono (JetBrains Mono)

## Overview

Complete typography system using **JetBrains Mono** for ALL styles.

All typography classes (display, heading, text, mono, labels, helpers) use JetBrains Mono instead of Right Grotesk.

**Font:** JetBrains Mono
**Source:** `/fonts/jetbrains-mono/`
**Base weight:** Medium (500)

---

## Classes

### Display
- `.kol-display-lg`
- `.kol-display-section`
- `.kol-display-section-sm`
- `.kol-display-subsection`

### Heading
- `.kol-heading-xl`, `.kol-heading-lg`, `.kol-heading-md`, `.kol-heading-sm`, `.kol-heading-xs`
- `.kol-heading-narrow-*` (all sizes)
- `.kol-heading-tight-*` (all sizes)

### Text
- `.kol-text-lg`, `.kol-text-md`, `.kol-text-sm`
- `.kol-text-compact-*`

### Mono
- `.kol-mono-*` (all variants)

### Labels
- `.kol-label-mono-*`, `.kol-label-compact-*`

### Helpers
- `.kol-helper-uc-*` (uppercase)
- `.kol-helper-*` (normal)
- `.kol-helper-fine-*` (light)

### Legacy
- `.kol-h1` through `.kol-h6`
- `.kol-body*`, `.kol-mono-body`

---

## Usage

```html
<link rel="stylesheet" href="kol-typography-mono-all.css">

<h1 class="kol-display-lg">All Mono</h1>
<h2 class="kol-heading-lg">Headings</h2>
<p class="kol-text-md">Body text</p>
<code class="kol-mono-text">Code</code>
```

---

## File

- `kol-typography-mono-all.css` - ~700 lines
- Requires fonts in: `/fonts/jetbrains-mono/`
