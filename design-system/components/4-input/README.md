# 4-input

Components for entering data.

## Components

### Input

Single-line text input with responsive sizing and optional icon.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | string | `'text'` | Input type |
| `placeholder` | string | `''` | Placeholder text |
| `value` | string | — | Input value |
| `onChange` | function | — | Change handler |
| `size` | `'sm'` \| `'md'` \| `'lg'` | — | Fixed size (responsive by default) |
| `uppercase` | boolean | `false` | Transform text to uppercase |
| `iconLeft` | string | — | Icon name to display on left |
| `iconSize` | number | — | Custom icon size |
| `className` | string | `''` | Additional classes |
| `style` | object | `{}` | Inline styles |

**CSS classes:** `input-outline`, `input-sm`, `input-md`, `input-lg`, `kol-mono-text`

### QuantityInput

Numeric input with increment/decrement chevron buttons on the right.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | number | `1` | Current value |
| `onChange` | function | — | Change handler |
| `min` | number | `1` | Minimum value |
| `max` | number | `99` | Maximum value |
| `size` | `'sm'` \| `'md'` \| `'lg'` | — | Fixed size |
| `className` | string | `''` | Additional classes |

**CSS classes:** Uses inline styles (border, radius, background from theme)

### QuantityStepper

Numeric input with decrement/ increment buttons on left and right sides.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | number | `1` | Current value |
| `onChange` | function | — | Change handler |
| `min` | number | `1` | Minimum value |
| `max` | number | `10` | Maximum value |
| `size` | `'sm'` \| `'md'` \| `'lg'` | — | Fixed size |
| `className` | string | `''` | Additional classes |

**CSS classes:** Uses inline styles (border, radius, background from theme)

### Slider

Range slider with label and value display.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | string | — | Slider label |
| `min` | number | `0` | Minimum value |
| `max` | number | `100` | Maximum value |
| `value` | number | `0` | Current value |
| `onChange` | function | — | Change handler |
| `variant` | `'default'` \| `'minimal'` | `'default'` | Visual style |
| `className` | string | `''` | Additional classes |
| `displayWidth` | number | `10` | Width for value display (chars) |
| `fontSize` | string | — | Custom font size |
| `step` | number | `1` | Step increment |
| `formatValue` | function | — | Custom value formatter |

**CSS classes:** `control-slider`, `control-slider-minimal`, `slider-black`, `kol-mono-xs`

## Dependencies

- `components/components.css` — Input, slider, control-slider styles
- `typography/full/kol-typography-full.css` — `kol-mono-text`, `kol-mono-xs`
- `7-icons/Icon` — Used by Input for iconLeft
- **Tailwind** — Input uses `flex`, `items-center`; Slider uses `flex`, `gap-3`, `whitespace-nowrap`, `shrink-0`, `w-fit`
