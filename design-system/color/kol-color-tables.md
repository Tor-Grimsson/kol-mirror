# Color Tables - Full Set

## Primitive Colors

### Brand Colors
| Token | Light Mode | Dark Mode |
|-------|------------|-----------|
| `--kol-color-brand-dark` | #1e1e21 | - |
| `--kol-color-brand-light` | #fcfbf8 | - |
| `--kol-color-brand-yellow` | #f5d245 | - |
| `--kol-color-brand-yellow-deep` | #f5bb1d | - |
| `--kol-color-brand-orange` | #a83e01 | - |
| `--kol-color-brand-red` | #bc583f | - |

### Absolute Colors
| Token | Value |
|-------|-------|
| `--kol-color-absolute-black` | #000000 |
| `--kol-color-absolute-white` | #ffffff |

### Median Colors
| Token | Light Mode | Dark Mode |
|-------|------------|-----------|
| `--kol-color-median-dark` | #0d0d0d | - |
| `--kol-color-median-light` | #f8f8f8 | - |

### Neutral Scale
| Token | Value |
|-------|-------|
| `--kol-color-neutral-50` | #fafafa |
| `--kol-color-neutral-100` | #f5f5f5 |
| `--kol-color-neutral-200` | #eeeeee |
| `--kol-color-neutral-300` | #e0e0e0 |
| `--kol-color-neutral-400` | #bfbfbf |
| `--kol-color-neutral-500` | #757575 |
| `--kol-color-neutral-600` | #616161 |
| `--kol-color-neutral-700` | #424242 |
| `--kol-color-neutral-800` | #212121 |
| `--kol-color-neutral-900` | #1e1e21 |

---

## Surface Tokens (Semantic)

### Primary Surfaces
| Token | Light Mode | Dark Mode |
|-------|------------|-----------|
| `--kol-surface-primary` | #fafafa | #121215 |
| `--kol-surface-on-primary` | #121215 | #fafafa |
| `--kol-surface-secondary` | #f2f2f2 | #19191d |
| `--kol-surface-on-secondary` | #19191d | #f8f8f8 |
| `--kol-surface-tertiary` | #ffffff | #0e0e11 |
| `--kol-surface-on-tertiary` | #0e0e11 | #ffffff |
| `--kol-surface-inverse` | #0e0e11 | #fcfbf8 |
| `--kol-surface-on-inverse` | #fcfbf8 | #0e0e11 |

### Secondary Inverse
| Token | Light Mode | Dark Mode |
|-------|------------|-----------|
| `--kol-surface-secondary-inverse` | #212121 | #e0e0e0 |
| `--kol-surface-tertiary-inverse` | #424242 | #d4d4d8 |

### Split Surfaces
| Token | Light Mode | Dark Mode |
|-------|------------|-----------|
| `--kol-surface-support-split` | #eeeeee | #202026 |
| `--kol-surface-support-split-inverse` | #202026 | #eeeeee |
| `--kol-surface-absolute-split` | #ffffff | #000000 |
| `--kol-surface-absolute-split-inverse` | #000000 | #ffffff |
| `--kol-surface-contrast` | #F2F2F2 | #0B0B0C |

---

## Container Tokens

### Primary Container
| Token | Light Mode | Dark Mode |
|-------|------------|-----------|
| `--kol-container-primary` | #f5f5f5 | #19191d |
| `--kol-container-on-primary` | #19191d | #f5f5f5 |
| `--kol-container-primary-inverse` | #19191d | #f5f5f5 |
| `--kol-container-on-primary-inverse` | #f5f5f5 | #19191d |

### Secondary Container
| Token | Light Mode | Dark Mode |
|-------|------------|-----------|
| `--kol-container-secondary` | #eeeeee | #202026 |
| `--kol-container-on-secondary` | #202026 | #eeeeee |
| `--kol-container-secondary-inverse` | #202026 | #eeeeee |
| `--kol-container-on-secondary-inverse` | #eeeeee | #202026 |

### Elevated Container
| Token | Light Mode | Dark Mode |
|-------|------------|-----------|
| `--kol-container-elevated` | #f5f5f5 | #242427 |
| `--kol-container-on-elevated` | #242427 | #f5f5f5 |
| `--kol-container-elevated-inverse` | #242427 | #f5f5f5 |
| `--kol-container-on-elevated-inverse` | #f5f5f5 | #242427 |

---

## Accent Tokens

| Token | Light Mode | Dark Mode |
|-------|------------|-----------|
| `--kol-accent-primary` | #f5d245 | #f5d245 |
| `--kol-accent-on-primary` | #1e1e21 | #1e1e21 |
| `--kol-accent-primary-strong` | #f5bb1d | #f5bb1d |
| `--kol-accent-primary-muted` | color-mix(18%) | color-mix(24%) |

---

## Status Tokens

| Token | Light Mode | Dark Mode |
|-------|------------|-----------|
| `--kol-status-danger` | #9b3928 | #bc583f |
| `--kol-status-on-danger` | #ffffff | #ffffff |
| `--kol-status-danger-strong` | #bc583f | #9b3928 |
| `--kol-status-danger-muted` | color-mix(18%) | color-mix(24%) |

---

## Border Tokens

| Token | Light Mode | Dark Mode |
|-------|------------|-----------|
| `--kol-border-default` | 8% opacity | 8% opacity |
| `--kol-border-subtle` | 4% opacity | 4% opacity |
| `--kol-border-strong` | 16% opacity | 16% opacity |
| `--kol-border-hover` | 16% opacity | 16% opacity |
| `--kol-border-focus` | var(--kol-accent-primary) | var(--kol-accent-primary) |
| `--kol-border-active` | var(--kol-accent-primary-strong) | var(--kol-accent-primary-strong) |
| `--kol-focus-ring` | var(--kol-accent-primary) | var(--kol-accent-primary) |

---

## State Tokens (Hover - 5% mix)

| Token | Light Mode | Dark Mode |
|-------|------------|-----------|
| `--kol-surface-primary-hover` | 95% primary + 5% on-primary | Same formula |
| `--kol-surface-secondary-hover` | 95% secondary + 5% on-secondary | Same formula |
| `--kol-surface-tertiary-hover` | 95% tertiary + 5% on-tertiary | Same formula |
| `--kol-container-primary-hover` | 95% container + 5% on | Same formula |
| `--kol-container-secondary-hover` | 95% container + 5% on | Same formula |

---

## State Tokens (Active - 10% mix)

| Token | Light Mode | Dark Mode |
|-------|------------|-----------|
| `--kol-surface-primary-active` | 90% primary + 10% on-primary | Same formula |
| `--kol-surface-secondary-active` | 90% secondary + 10% on-secondary | Same formula |
| `--kol-surface-tertiary-active` | 90% tertiary + 10% on-tertiary | Same formula |
| `--kol-container-primary-active` | 90% container + 10% on | Same formula |
| `--kol-container-secondary-active` | 90% container + 10% on | Same formula |

---

## Opacity Hex Tokens

| Token | Light Mode | Dark Mode |
|-------|------------|-----------|
| `--kol-opacity-hex-01` | #fcfbfb | #111112 |
| `--kol-opacity-hex-02` | #f4f4f5 | #171719 |
| `--kol-opacity-hex-04` | #ebebeb | #1b1b1e |
| `--kol-opacity-hex-08` | #dbdbdb | #242427 |
| `--kol-opacity-hex-12` | #a3a3a4 | #2e2e30 |
| `--kol-opacity-hex-16` | #5b5b5d | #363639 |
| `--kol-opacity-hex-24` | #363639 | #5b5b5d |
| `--kol-opacity-hex-32` | #2e2e30 | #a3a3a4 |
| `--kol-opacity-hex-64` | #242427 | #dbdbdb |
| `--kol-opacity-hex-80` | #1b1b1e | #ebebeb |
| `--kol-opacity-hex-88` | #171719 | #f4f4f5 |
| `--kol-opacity-hex-96` | #111112 | #fcfbfb |

---

## Summary

| Category | Token Count |
|----------|-------------|
| Primitive (Brand, Absolute, Median, Neutral) | ~20 |
| Surface | ~20 |
| Container | ~12 |
| Accent | 4 |
| Status | 4 |
| Border | 7 |
| State (Hover/Active) | 10 |
| Opacity | 24 |
| **Total** | **~97** |
