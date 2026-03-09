# 1-actions

Clickable elements that trigger actions or toggle state.

## Components

### Button

Unified button/link component with optional icon animations.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | ReactNode | — | Button content |
| `variant` | `'primary'` \| `'secondary'` \| `'accent'` \| `'outline'` \| `'control'` | `'primary'` | Visual style |
| `size` | `'sm'` \| `'md'` \| `'lg'` | `'md'` | Button size |
| `uppercase` | boolean | `false` | Text transform uppercase |
| `iconLeft` | string | — | Icon name for left position |
| `iconRight` | string | — | Icon name for right position |
| `iconLeftHover` | string | — | Hover icon (left) |
| `iconRightHover` | string | — | Hover icon (right) |
| `iconOnly` | string | — | Icon-only button |
| `iconOnlyHover` | string | — | Hover icon for icon-only |
| `animateIcon` | boolean | `false` | Enable icon swap animation |
| `iconSize` | number | `16` | Icon size in px |
| `href` | string | — | Makes it an `<a>` tag |
| `onClick` | function | — | Makes it a `<button>` |
| `className` | string | `''` | Additional classes |
| `style` | object | `{}` | Inline styles |
| `type` | string | `'button'` | Button type attribute |
| `disabled` | boolean | `false` | Disabled state |

**CSS classes used in JSX:** `btn-primary`, `btn-secondary`, `btn-accent`, `btn-outline`, `btn-control`, `btn-sm`, `btn-md`, `btn-lg`, `normal-case`, `kol-mono-text`, `button-animate`, `icon-swap-container`, `icon-default`, `icon-hover`

**States:** default, hover, disabled (`opacity: 0.5, cursor: not-allowed`)

### Checkbox

Standalone checkbox with checkmark SVG.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `checked` | boolean | `false` | Checked state |
| `onChange` | function | — | Change handler (receives boolean) |
| `className` | string | `''` | Additional classes |

**CSS classes used in JSX:** `checkbox`, `is-active`, `checkbox-indicator`

**States:** default (unchecked), active (checked with accent background + checkmark)

### ToggleCheckbox

Checkbox with a label, for settings/preferences.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | string | — | Label text |
| `checked` | boolean | `false` | Checked state |
| `onChange` | function | — | Change handler (receives boolean) |
| `className` | string | `''` | Additional classes |
| `hint` | string | — | Secondary text after label |

**CSS classes used in JSX:** `toggle-checkbox`, `is-active`, `toggle-checkbox-indicator`, `toggle-checkbox-label`, `kol-mono-xs`

**States:** default (unchecked), active (checked with accent background + checkmark)

### ToggleSwitch

Switch-style toggle for on/off settings.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | string | — | Label text |
| `checked` | boolean | `false` | Toggle state |
| `onChange` | function | — | Change handler (receives boolean) |
| `onToggle` | function | — | Toggle handler (receives boolean) |
| `className` | string | `''` | Additional classes |
| `hint` | string | — | Secondary text after label |

**CSS classes used in JSX:** `toggle-switch`, `toggle-switch-label`, `toggle-switch-indicator`

**States:** default (off), active (on — indicator slides right). Uses `data-state="on"/"off"` attribute.

## Dependencies

- `components/components.css` — Button, toggle, checkbox, and icon animation styles
- `7-icons/Icon` — Used by Button for icon rendering
- **Tailwind** — Button uses `flex`, `items-center`, `gap-2`; ToggleSwitch/ToggleCheckbox use `ml-2`, `opacity-60`, `normal-case`, `tracking-normal`, `text-[10px]`

## Known Issues

### 1. Button CSS class prefix mismatch

JSX generates classes without `kol-` prefix, but `components.css` defines them with prefix:

| JSX class | CSS class |
|-----------|-----------|
| `btn-primary` | `kol-btn-primary` |
| `btn-secondary` | `kol-btn-secondary` |
| `btn-accent` | `kol-btn-accent` |
| `btn-outline` | `kol-btn-outline` |
| `btn-control` | `kol-btn-control` |
| `btn-sm` | `kol-btn-sm` |
| `btn-md` | `kol-btn-md` |
| `btn-lg` | `kol-btn-lg` |

**Fix:** Either rename CSS classes to drop `kol-` prefix, or update JSX to add it.

### 2. Checkbox/ToggleCheckbox use `is-active`, CSS expects `kol-active`

JSX: `checked ? 'is-active' : ''`
CSS: `.kol-checkbox.kol-active`, `.kol-toggle-checkbox.kol-active`

Also, JSX uses `checkbox` / `toggle-checkbox` classes, CSS defines `kol-checkbox` / `kol-toggle-checkbox`.

### 3. ToggleSwitch uses `data-state`, CSS expects `kol-active` class

JSX: `data-state={checked ? 'on' : 'off'}`
CSS: `.kol-toggle-switch.kol-active`

Also, JSX uses `toggle-switch` class, CSS defines `kol-toggle-switch`.

### 4. Button references undefined CSS classes

- `button-animate` — not defined in `components.css`
- `icon-swap-container` — not defined (only `icon-default`/`icon-hover` are)
- `normal-case` — Tailwind utility, not in `components.css`

### 5. `kol-mono-text` not in components.css

Button adds `kol-mono-text` to non-icon-only buttons. This class lives in the typography CSS, not `components.css`.

### 6. Icon import path is wrong

Button imports `Icon` from `'./icons/Icon'` — should be `'../../7-icons/Icon'` relative to `1-actions/components/`.

### 7. Tailwind dependency

Components use Tailwind utility classes that require Tailwind CSS to be loaded:
- Button: `flex`, `items-center`, `gap-2`
- ToggleSwitch: `ml-2`, `opacity-60`, `normal-case`, `tracking-normal`, `text-[10px]`
- ToggleCheckbox: `ml-2`, `opacity-60`, `normal-case`, `tracking-normal`, `text-[10px]`, `uppercase`, `tracking-[0.08em]`
