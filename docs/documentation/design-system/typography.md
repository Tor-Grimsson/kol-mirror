# Typography System

CSS: `src/styles/kol-typography-mono.css`, `src/styles/components.css`, `src/styles/theme.css`

6 groups, fluid `clamp()` scaling (mobile → desktop). All classes set `color: var(--kol-surface-on-primary)` and adapt in inverse contexts.

---

## Display

| Class | Font | Weight | Mobile → Desktop | LH | Transform |
|-------|------|--------|------------------|----|-----------|
| `.kol-display-lg` | RG Tight | 500 | 48 → 96 | 100% | uppercase |
| `.kol-display-section` | RG Tight | 500 | 40 → 64 | 100% | uppercase |
| `.kol-display-section-sm` | RG Tight | 500 | 32 → 48 | 100% | uppercase |
| `.kol-display-subsection` | RG Narrow | 500 | 32 → 48 | 100% | uppercase |

## Heading

| Class | Font | Weight | Mobile → Desktop | LH | Transform |
|-------|------|--------|------------------|----|-----------|
| `.kol-heading-xl` | RG Narrow | 470 | 40 → 64 | 110% | — |
| `.kol-heading-lg` | RG Narrow | 470 | 32 → 48 | 110% | — |
| `.kol-heading-md` | RG Narrow | 470 | 28 → 40 | 120% | — |
| `.kol-heading-sm` | RG Tight | 470 | 20 → 32 | 100% | uppercase |
| `.kol-heading-xs` | RG Narrow | 470 | 18 → 28 | 125% | — |

### Heading Narrow (explicit condensed, no uppercase)

Same sizes as Heading. Classes: `.kol-heading-narrow-{xl|lg|md|sm|xs}`

### Heading Tight (explicit extra-condensed, uppercase)

Same sizes as Heading. Classes: `.kol-heading-tight-{xl|lg|md|sm|xs}`. All LH 100%.

## Text

| Class | Font | Weight | Mobile → Desktop | LH |
|-------|------|--------|------------------|----|
| `.kol-text-lg` | Inter Tight | 400 | 18 → 20 | 160% |
| `.kol-text-md` | Inter Tight | 400 | 14 → 18 | 160% |
| `.kol-text-md-rg` | RG Narrow | 500 | 14 → 18 | 160% |
| `.kol-text-sm` | Inter Tight | 400 | 12 → 16 | 150% |

### Text Compact (RG Compact, weight 470)

| Class | Mobile → Desktop | LH |
|-------|------------------|----|
| `.kol-text-compact-xl` | 22 → 28 | 140% |
| `.kol-text-compact-lg` | 18 → 24 | 140% |
| `.kol-text-compact-md` | 16 → 20 | 145% |
| `.kol-text-compact-sm` | 14 → 18 | 145% |

## Mono (RG Mono)

| Class | Weight | Mobile → Desktop | LH |
|-------|--------|------------------|----|
| `.kol-mono-text-lg` | 470 | 16 → 20 | 125% |
| `.kol-mono-text` | 470 | 14 → 18 | 125% |
| `.kol-mono-text-fine` | 300 | 14 → 18 | 125% |
| `.kol-mono-sm` | 470 | 12 → 16 | 125% |
| `.kol-mono-sm-fine` | 300 | 12 → 16 | 125% |
| `.kol-mono-xs` | 470 | 10 → 14 | 120% |
| `.kol-mono-xxs` | 470 | 8 → 12 | 120% |

## Label (uppercase, letter-spacing)

### Mono Labels (RG Mono 470, spacing 0.05em)

| Class | Mobile → Desktop | LH |
|-------|------------------|----|
| `.kol-label-mono-sm` | 14 → 24 | 100% |
| `.kol-label-mono-md` | 12 → 16 | 125% |
| `.kol-label-mono-xs` | 10 → 14 | 100% |

### Compact Labels (RG Narrow 500, spacing 0.03em)

| Class | Mobile → Desktop | LH |
|-------|------------------|----|
| `.kol-label-compact-lg` | 24 → 28 | 100% |
| `.kol-label-compact-md` | 12 → 16 | 100% |

## Helpers (fixed sizes, RG Mono)

Three variants at each size: **uc** (uppercase 470), **normal** (470), **fine** (100).

Sizes: `xl` 20px, `lg` 18px, `md` 16px, `s` 14px, `xs` 12px, `xxs` 10px, `xxxs` 8px

| Pattern | Example | Transform | LH |
|---------|---------|-----------|-----|
| `.kol-helper-uc-{size}` | `.kol-helper-uc-s` | uppercase | 100% (xxxs: 125%) |
| `.kol-helper-{size}` | `.kol-helper-xs` | none | 100% (xxs: 120%, xxxs: 125%) |
| `.kol-helper-fine-{size}` | `.kol-helper-fine-md` | none | 100% (xxs: 120%, xxxs: 125%) |

Letter spacing: 0.05em (xs: 0.1em).

---

## Font Families

| Token | Family | Stretch | Weights |
|-------|--------|---------|---------|
| `--kol-font-family-rgrot-tight` | Right Grotesk Tight | extra-condensed | 500 |
| `--kol-font-family-rgrot-narrow` | Right Grotesk Narrow | condensed | 500 |
| `--kol-font-family-rgrot-compact` | Right Grotesk Compact | normal | 470 |
| `--kol-font-family-body` | Inter Tight | normal | 400, 700 |
| `--kol-font-family-mono` | Right Grotesk Mono | normal | 100 (fine), 470 (medium) |

---

## Container Background Utilities

| Class | Background | Text |
|-------|------------|------|
| `.bg-container-primary` | `--kol-container-primary` | `--kol-container-on-primary` |
| `.bg-container-secondary` | `--kol-container-secondary` | `--kol-container-on-secondary` |
| `.bg-container-elevated` | `--kol-container-elevated` | `--kol-container-on-elevated` |
| `.bg-container-on-primary` | inverted | inverted |
| `.bg-container-on-secondary` | inverted | inverted |
| `.bg-container-on-elevated` | inverted | inverted |

---

## Legacy Aliases

| Old | New |
|-----|-----|
| `.kol-heading-display` | `.kol-display-lg` |
| `.kol-heading-section` | `.kol-display-section` |
| `.kol-heading-section-small` | `.kol-display-section-sm` |
| `.kol-heading-subsection` | `.kol-display-subsection` |
| `.kol-text` / `.kol-body` | `.kol-text-md` |
| `.kol-body-lg` | `.kol-text-lg` |
| `.kol-body-sm` | `.kol-text-sm` |
| `.kol-mono-body` | `.kol-mono-text` |
| `.kol-mono` | `.kol-mono-xs` |
| `.kol-mono-text-label` | `.kol-label-mono-md` |
| `.kol-label` | `.kol-label-mono-sm` |
| `.kol-label-compact` | `.kol-label-compact-md` |
| `.kol-h1`–`.kol-h4` | `.kol-heading-xl`–`.kol-heading-sm` |
