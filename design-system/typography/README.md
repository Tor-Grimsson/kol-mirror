# Typography Extraction

## Structure

```
typography/
├── full/           # Complete typography system
│   ├── kol-typography.css
│   ├── kol-typography.md
│   └── test-typography.html
├── lean/           # Lean version (most used classes)
│   ├── kol-typography-lean.css
│   └── kol-typography-lean.md
├── mono/           # Mono classes only (JetBrains Mono)
│   ├── kol-typography-mono.css
│   ├── kol-typography-mono.md
│   └── test-typography-mono.html
├── mono-all/       # All styles using JetBrains Mono
│   ├── kol-typography-mono-all.css
│   ├── kol-typography-mono-all.md
│   └── test-typography-mono-all.html
├── usage-audit.md  # Usage analysis
└── README.md
```

## Versions

| Folder | Description | Font |
|--------|-------------|------|
| `full` | All 80+ typography classes | Right Grotesk + Inter Tight |
| `lean` | ~20 most-used classes | Right Grotesk + Inter Tight |
| `mono` | Only mono classes | JetBrains Mono |
| `mono-all` | All styles | JetBrains Mono |

## Source

- `/packages/ui/theme.css` - Font tokens
- `/packages/ui/css/components.css` - Typography classes
