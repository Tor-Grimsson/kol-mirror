# 3-selection

Components for selecting from options.

## Components

### Dropdown

Select dropdown with responsive sizing and open/close states.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `options` | Array | `[]` | Options array `[{value, label}, ...]` |
| `value` | string | — | Selected value |
| `onChange` | function | — | Change handler (receives value) |
| `size` | `'sm'` \| `'md'` \| `'lg'` | — | Fixed size (responsive by default) |
| `variant` | `'default'` \| `'minimal'` | `'default'` | Visual style |
| `className` | string | `''` | Additional classes |

**CSS classes:** `control-dropdown`, `dropdown-sm`, `dropdown-md`, `dropdown-lg`

### DropdownTagFilter

Multi-select dropdown where all items start selected by default.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `options` | Array | `[]` | Options array `[{value, label}, ...]` |
| `value` | Array | — | Selected values array |
| `onChange` | function | — | Change handler (receives array) |
| `size` | `'sm'` \| `'md'` \| `'lg'` | — | Fixed size |
| `className` | string | `''` | Additional classes |

**CSS classes:** Same as Dropdown

### UnitSelector

Two-button toggle for switching between px/rem units.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `activeUnit` | string | — | Current unit (`'px'` or `'rem'`) |
| `onUnitChange` | function | — | Callback when unit changes |

**CSS classes:** None (uses inline styles + Tailwind)

### ToggleBracket

Toggle button with bracket-style on/off labels.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | string | — | Main label text |
| `value` | boolean | `false` | Toggle state |
| `onToggle` | function | — | Toggle handler (receives boolean) |
| `onChange` | function | — | Change handler (receives boolean) |
| `offLabel` | string | `'OFF'` | Off state label |
| `onLabel` | string | `'ON'` | On state label |
| `variant` | `'default'` \| `'plain'` | `'default'` | Visual style |
| `className` | string | `''` | Additional classes |

**CSS classes:** `toggle-bracket`, `toggle-bracket-plain`, `is-active`

## Dependencies

- `components/components.css` — Dropdown, control-unified, toggle-bracket styles
- **Tailwind** — Dropdown uses `flex`, `items-center`, `gap-3`; UnitSelector uses `flex`, `gap-2`, `px-4`, `py-2`, `bg-fg-08`, `text-auto`
