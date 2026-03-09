# 2-labels

Small informational elements for status, categorization, or labeling.

## Components

### Pill

Rounded badge for labels, categories, or status indicators.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | ReactNode | — | Text content |
| `variant` | `'outline'` \| `'subtle'` \| `'inverse'` | `'outline'` | Visual style |
| `size` | `'sm'` \| `'md'` \| `'lg'` | `'md'` | Size variant |
| `className` | string | `''` | Additional classes |

**CSS classes:** `pill-outline`, `pill-subtle`, `pill-inverse`, `pill-sm`, `pill-md`, `pill-lg`

### Tag

Clickable categorization label with hover inversion.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `text` | string | — | Tag text (alternative to children) |
| `children` | ReactNode | — | Tag content |
| `variant` | `'default'` \| `'inverse'` | `'default'` | Visual style |
| `className` | string | `''` | Additional classes |
| `onClick` | function | — | Click handler |

**CSS classes:** `tag-control`, `control-unified-inverse`

### Badge

Status/count indicator with semantic color variants.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | ReactNode | — | Badge text/content |
| `variant` | `'default'` \| `'secondary'` \| `'destructive'` \| `'outline'` \| `'success'` \| `'warning'` \| `'critical'` \| `'info'` | `'default'` | Color variant |
| `size` | `'sm'` \| `'md'` \| `'lg'` | `'md'` | Size variant |
| `className` | string | `''` | Additional classes |

**CSS classes:** `badge`, `badge-default`, `badge-secondary`, `badge-destructive`, `badge-outline`, `badge-success`, `badge-warning`, `badge-critical`, `badge-info`, `badge-sm`, `badge-md`, `badge-lg`

### SectionLabel

Section heading with animated arrow icon.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `text` | string | — | Label text |
| `size` | `'sm'` \| `'md'` \| `'lg'` | `'md'` | Size variant |
| `className` | string | `''` | Additional classes |

**CSS classes:** `section-label-wrapper`, `kol-label-compact-md`, `kol-label-compact-lg`, `kol-heading-md`

## Dependencies

- `components/components.css` — Pill, tag, badge, label, and icon animation styles
- `typography/full/kol-typography-full.css` — `kol-heading-md` class
- `7-icons/Icon` — Used by SectionLabel for the arrow icon
- **Tailwind** — Tag uses `cursor-pointer`, `whitespace-nowrap`; SectionLabel uses `flex`, `flex-row`, `items-center`, `gap-1`, `overflow-visible`, `h-4`/`h-5`/`h-8`, `text-auto`
