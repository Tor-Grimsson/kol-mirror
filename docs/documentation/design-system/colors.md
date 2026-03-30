# Color System

CSS: `src/styles/kol-color-simple.css`, `src/styles/theme.css`

---

## Opacity Scales

All follow the same level progression. Prefix with `text-`, `bg-`, or `border-` and append `-inverse` for inverse context.

| Scale | Levels | Properties | Theme-aware |
|-------|--------|------------|-------------|
| `fg-{n}` | 01 02 04 08 12 16 24 32 48 64 80 88 96 | text, bg, border | yes — `color-mix()` with `--kol-surface-on-primary` |
| `fg-inverse-{n}` | same | text, bg, border | yes — uses `--kol-surface-on-inverse` |
| `opacity-hex-{n}` | 01 02 04 08 12 16 24 32 64 80 88 96 | bg, border | yes — pre-calculated hex per theme |
| `opacity-hex-inverse-{n}` | same | bg, border | yes — inverse hex |
| `opacity-hex-fixed-{n}` | same | bg, border | no — always light-mode values |
| `opacity-hex-fixed-inverse-{n}` | same | bg, border | no — always dark-mode values |

### State variants (fg-based)

| Utility | Resolves to |
|---------|-------------|
| `hover:border-hover:hover` | `--kol-border-default` (fg 8%) |
| `hover:border-fg-08:hover` | fg 8% on hover |
| `hover:border-fg-16:hover` | fg 16% on hover |
| `focus:border-focus:focus` | `--kol-border-focus` (accent 70%) |
| `focus-visible:border-focus:focus-visible` | same |
| `focus-visible:ring-focus:focus-visible` | 2px accent outline |

### Surface borders (contrast on bg-fg fills)

| Utility | Value |
|---------|-------|
| `.border-surface` | 100% `--kol-surface-primary` |
| `.border-surface-08` | 8% surface |
| `.border-surface-16` | 16% surface |

---

## Surfaces & Containers

| Token | Dark | Light | Utility |
|-------|------|-------|---------|
| `--kol-surface-primary` | `#121215` | `#fafafa` | `.bg-surface-primary` |
| `--kol-surface-secondary` | `#19191d` | `#f8f8f8` | `.bg-surface-secondary` |
| `--kol-surface-tertiary` | `#0e0e11` | `#ffffff` | `.bg-surface-tertiary` |
| `--kol-surface-inverse` | `#fcfbf8` | `#0e0e11` | `.bg-surface-inverse` |
| `--kol-container-primary` | `#19191d` | `#f5f5f5` | `.bg-container-primary` |
| `--kol-container-secondary` | `#202026` | `#eeeeee` | `.bg-container-secondary` |
| `--kol-container-elevated` | `#242427` | `#f5f5f5` | `.bg-container-elevated` |

Each has an `on-{name}` foreground pair. The `.bg-*` utilities set both background AND text color automatically.

Inverted "on-" container utilities (`.bg-container-on-primary`, etc.) flip bg/text for inverted fills.

### Absolute / Split surfaces

| Token | Dark | Light |
|-------|------|-------|
| `--kol-surface-support-split` | `#202026` | `#eeeeee` |
| `--kol-surface-support-split-inverse` | `#eeeeee` | `#202026` |
| `--kol-surface-absolute-split` | `#000000` | `#ffffff` |
| `--kol-surface-absolute-split-inverse` | `#ffffff` | `#000000` |
| `--kol-surface-contrast` | `#0B0B0C` | `#F2F2F2` |

### Inverse context remapping

`.bg-surface-inverse` remaps `--kol-surface-primary/secondary/tertiary` and `--kol-border-default` within its scope so child components adapt automatically.

---

## Context Utilities

| Utility | Sets |
|---------|------|
| `.text-auto` / `.text-auto-inverse` | `color` to primary/inverse foreground |
| `.bg-auto` / `.bg-auto-inverse` | `background` to primary/inverse surface |
| `.border-auto` / `.border-auto-inverse` | `border-color` to 8% fg |
| `.divider-auto` / `.divider-auto-inverse` | `border: 1px` at 8% fg |

---

## Accents & Status

| Token | Value |
|-------|-------|
| `--kol-accent-primary` | `#f5d245` (brand yellow) |
| `--kol-accent-on-primary` | `#1e1e21` |
| `--kol-accent-primary-strong` | `#f5bb1d` (hover) |
| `--kol-accent-primary-muted` | `rgba(245,210,69, 0.18–0.24)` |
| `--kol-status-danger` | `#9b3928` / `#bc583f` |
| `--kol-status-on-danger` | `#ffffff` |
| `--kol-status-danger-strong` | `#bc583f` / `#9b3928` |
| `--kol-status-danger-muted` | `rgba(155,57,40, 0.18–0.24)` |

---

## Borders (Semantic)

| Token | Value |
|-------|-------|
| `--kol-border-default` | fg 8% |
| `--kol-border-subtle` | fg 4% |
| `--kol-border-strong` | fg 16% |
| `--kol-border-hover` | fg 16% |
| `--kol-border-focus` | accent 70% mix |
| `--kol-border-active` | accent strong |

---

## Elevation

| Utility | Level |
|---------|-------|
| `.elevation-base` | Page background |
| `.elevation-raised` | Cards, panels |
| `.elevation-elevated` | Modals, tooltips |

