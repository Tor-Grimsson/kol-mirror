# CSS Architecture

Single Vite app using Tailwind CSS v4 with `--kol-*` token architecture.

---

## File Structure

```
src/styles/
  theme.css                 # @theme tokens, base resets, font-face, spacing/radius/shadow/z-index
  kol-color-simple.css      # Color utilities (surfaces, fg opacity, borders, states, elevation)
  kol-typography-mono.css   # Typography classes (display, heading, text, mono, label, helper)
  components.css            # Component recipes (buttons, sliders, toggles, dropdowns)
```

## Import Order

`src/index.css` imports in this order:

1. `tailwindcss` — base + utilities
2. `theme.css` — tokens and resets
3. `kol-color-simple.css` — color system
4. `kol-typography-mono.css` — type scale
5. `components.css` — component styles

## Layer Model

- **Tokens + resets** → `theme.css`. No component selectors here.
- **Color utilities** → `kol-color-simple.css`. Surfaces, fg scales, borders, states.
- **Type classes** → `kol-typography-mono.css`. All `kol-*` typography.
- **Component recipes** → `components.css`. Button shells, slider tracks, toggle styles, dropdown menus.
- **Tailwind utilities** — used inline in JSX for layout, spacing, flex, grid.

## Theming

Dark mode is default. Light mode via `[data-theme="light"]` on `:root`.

Theme toggle uses `data-theme` attribute. All `--kol-*` tokens have light/dark values defined in `theme.css`.

`.bg-surface-inverse` remaps scoped tokens so child components adapt automatically.

## Key Tokens

| Category | Prefix | Source |
|----------|--------|--------|
| Surfaces | `--kol-surface-*` | `theme.css` + `kol-color-simple.css` |
| Containers | `--kol-container-*` | `theme.css` + `kol-color-simple.css` |
| Accent | `--kol-accent-*` | `theme.css` |
| Typography | `--kol-font-family-*` | `theme.css` |
| Spacing | `--kol-spacing-*` | `theme.css` |
| Radius | `--kol-radius-*` | `theme.css` |
| Z-index | `--kol-z-*` | `theme.css` |
| Transitions | `--kol-transition-*` | `theme.css` |
