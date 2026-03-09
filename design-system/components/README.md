# Design System Components

## Structure

```
1-actions/     - Buttons, toggles, switches, checkboxes
2-labels/      - Pills, tags, badges, section labels
3-selection/   - Dropdowns, unit selectors, toggle brackets
4-input/       - Text inputs, quantity inputs, sliders
5-navigation/  - Nav buttons, view toggles
6-overlays/    - (future: dialogs, popovers, tooltips)
7-icons/       - 221 SVG icons with Icon component
```

## Dependencies

- `colors/full/kol-color.css` — CSS custom properties (color tokens)
- `typography/full/kol-typography-full.css` — Font classes
- `components/components.css` — Component styles organized by category

## Component Status

| Category  | Components | Status                        |
|-----------|------------|-------------------------------|
| 1-actions | 4          | Extracted, CSS mismatch issues |
| 2-labels  | 4          | Extracted                     |
| 3-selection | 4        | Extracted                     |
| 4-input   | 4          | Extracted                     |
| 5-navigation | 2        | Extracted                     |
| 6-overlays | 0          | Future (no source components) |
| 7-icons   | 221 icons  | Complete                      |

## Usage

Link the CSS files in order:

```html
<link rel="stylesheet" href="colors/full/kol-color.css">
<link rel="stylesheet" href="typography/full/kol-typography-full.css">
<link rel="stylesheet" href="components/components.css">
```

Then import components:

```jsx
import Button from './1-actions/components/Button'
import Pill from './2-labels/components/Pill'
import Dropdown from './3-selection/components/Dropdown'
import Input from './4-input/components/Input'
import Icon from './7-icons/Icon'
```
