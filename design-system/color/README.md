# Color Extraction

## Structure

```
colors/
├── full/           # Complete color system
│   ├── kol-color.css
│   ├── kol-color.md
│   └── test-kol-color.html
├── lean/           # Lean version (most used colors)
│   ├── kol-color-lean.css
│   ├── kol-color-lean.md
│   └── test-kol-color-lean.html
├── usage-audit.md  # Usage analysis
├── _kol-color-tables.md
└── README.md
```

## Versions

| Folder | Description | Tokens |
|--------|-------------|--------|
| `full` | All 97 color tokens | 97 |
| `lean` | Most-used colors | ~30 |

## Features

- Light/dark mode support
- Context-aware surface remapping
- WCAG compliant color pairs
- Opacity scale (01-96)
- Border tokens with hover/focus states

## Token Categories

- **Primitive**: Brand, Absolute, Median, Neutral scale
- **Surface**: Primary, Secondary, Tertiary, Inverse
- **Container**: Primary, Secondary, Elevated
- **Accent**: Primary, Strong, Muted
- **Status**: Danger (error states)
- **Border**: Default, Subtle, Strong, Hover, Focus, Active
- **State**: Hover (5% mix), Active (10% mix)
- **Opacity**: Hex-based geometric scale

## Source

- `/packages/ui/theme.css` - Color tokens
- `/packages/ui/css/utilities.css` - Color utility classes
