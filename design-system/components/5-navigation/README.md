# 5-navigation

Components for navigating content.

## Components

### ButtonNav

Navigation button with directional arrow icon (next/back).

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `direction` | `'next'` \| `'back'` \| `'left'` | `'next'` | Navigation direction |
| `onClick` | function | — | Click handler |
| `children` | ReactNode | — | Button label (default: "Back"/"Next") |
| `className` | string | `''` | Additional classes |

**CSS classes:** `btn-nav`, `kol-helper-s`

### ViewToggle

Toggle button group for switching between view modes (grid/list).

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `viewMode` | string | — | Current active view mode |
| `onViewChange` | function | — | Callback when view changes |
| `variant` | `'text'` \| `'icon'` | `'text'` | Display variant |
| `options` | Array | `[...]` | View options array |
| `className` | string | `''` | Additional classes |

**Default options:** `[{value: 'grid', label: 'Grid view', icon: 'view-grid'}, {value: 'list', label: 'List view', icon: 'view-list'}]`

**CSS classes:** Uses Tailwind (`flex`, `items-center`, `gap-0`/`gap-2`, `rounded-full`, `p-1`, `border`, etc.)

## Dependencies

- `components/components.css` — btn-nav styles
- `typography/full/kol-typography-full.css` — `kol-helper-s`
- `7-icons/Icon` — Used by both ButtonNav and ViewToggle
- **Tailwind** — ButtonNav uses `inline-flex`, `items-center`, `justify-center`, `gap-2`, `w-fit`, `cursor-pointer`; ViewToggle uses extensive Tailwind utilities
