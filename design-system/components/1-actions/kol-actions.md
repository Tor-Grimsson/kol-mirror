# Actions Components

Clickable elements that trigger actions.

## Components

### Button

Primary action trigger with multiple variants.

```html
<button class="kol-btn kol-btn-primary kol-btn-md">Button</button>
```

**Variants:**
- `kol-btn-primary` - Solid background, primary color
- `kol-btn-secondary` - Secondary background
- `kol-btn-outline` - Transparent with border
- `kol-btn-accent` - Accent color background
- `kol-btn-control` - Control-style button
- `kol-btn-nav` - Navigation-style button

**Sizes:**
- `kol-btn-sm` - Small
- `kol-btn-md` - Medium (default)
- `kol-btn-lg` - Large

**States:**
- Default
- Hover
- Disabled (`[disabled]` attribute)

---

### Toggle Bracket

Toggle button with bracket-style visual.

```html
<button class="kol-toggle-bracket kol-active">
  <span>Label</span>
  <span>State</span>
</button>
```

**Variants:**
- `kol-toggle-bracket` - Standard bracket toggle
- `kol-toggle-bracket-plain` - Plain style (no border/background)

**States:**
- Default (off)
- `kol-active` (on)
- Hover

---

### Toggle Switch

Toggle switch with sliding indicator.

```html
<button class="kol-toggle-switch">
  <span class="kol-toggle-switch-label">Label</span>
  <span class="kol-toggle-switch-indicator"></span>
</button>
```

**States:**
- Default (off)
- `kol-active` (on)
- Hover

---

### Checkbox

Binary selection with optional label.

```html
<label class="kol-checkbox kol-active">
  <input type="checkbox" checked>
  <span class="kol-checkbox-indicator">
    <svg>...</svg>
  </span>
  <span>Label</span>
</label>
```

**Variants:**
- `kol-checkbox` - Standalone checkbox
- `kol-toggle-checkbox` - Checkbox with label

**States:**
- Unchecked
- `kol-active` (checked)
- Hover

---

## CSS Variables

Requires these variables from kol-color:
- `--kol-surface-primary`
- `--kol-surface-on-primary`
- `--kol-surface-secondary`
- `--kol-accent-primary`
- `--kol-accent-on-primary`
- `--kol-accent-primary-strong`
- `--kol-border-default`
- `--kol-opacity-hex-08`
- `--kol-focus-ring`
- `--kol-font-family-mono`
- `--kol-radius-full`

## Class Prefix

All classes use `kol-` prefix to avoid conflicts.
