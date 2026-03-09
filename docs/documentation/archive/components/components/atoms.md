# Components › Atoms

> **Location**: `packages/ui/src/atoms`  
> **Purpose**: Base-level UI building blocks used across Kolkrabbi products, documentation, and workshop routes. These components expose shared tokens, semantics, and behaviors that higher layers (molecules, organisms, pages) compose.

Atoms are grouped below by function so related primitives stay aligned. When adding new atoms, match the existing naming (PascalCase filename + default export) and place them inside the appropriate directory or sub-folder.

---

## 1. Buttons & Binary Controls

| Component | Notes |
| --- | --- |
| `Button.jsx`, `ButtonFixed.jsx`, `ButtonNav.jsx` | Primary, fixed-width, and nav-aligned CTAs. All inherit shared typography and focus tokens. |
| `ButtonBullshit.jsx` | Experimental playground for button behaviors. Only use inside workshop demos. |
| `ControlButton.jsx`, `PlayPauseButton.jsx` | Icon-forward circular controls for media or inspectors. |
| `Checkbox.jsx`, `ToggleCheckbox.jsx` | Checkbox primitives with theme-aware focus rings. |
| `ToggleSwitch.jsx`, `ToggleBracket.jsx` | Binary toggles (bracket variant shows slotted labels). |
| `ThemeToggle.jsx`, `ThemeToggleButton.jsx` | Theme switching controls (full-width pill vs. compact icon button). |

---

## 2. Inputs & Selection

| Component | Notes |
| --- | --- |
| `Input.jsx` | Base text input with label support and token-aligned states. |
| `Dropdown.jsx`, `DropdownFixed.jsx`, `DropdownTagFilter.jsx` | Select menus (responsive, fixed width, tag-filter). |
| `UnitSelector.jsx` | Small numeric/unit selector for inspector panels. |
| `Tag.jsx`, `Pill.jsx` | Status badges and taxonomy chips. |
| `LanguageToggle.jsx` | Two-state language selector displayed in nav and workshop shell. |

---

## 3. Layout, Surfaces & Typography

| Component | Notes |
| --- | --- |
| `Container.jsx` | Constrains width and applies global padding rhythm. |
| `BaselineGrid.jsx` | Debug overlay for checking vertical rhythm. |
| `Divider.jsx` | Horizontal divider with semantic token bindings. |
| `SectionHeader.jsx`, `SectionTitle.jsx`, `SectionLabel.jsx` | Heading stack atoms used across sections and docs. |
| `SidebarMenuItem.jsx` | Single item row for navigation menus (workshop, docs). |
| `SourcesItem.jsx` | Rich source row used in Stack/References lists. |

---

## 4. Links & Navigation

| Component | Notes |
| --- | --- |
| `LinkWithIcon.jsx` | Text link with trailing/leading icon, includes hover animation. |
| `ButtonNav.jsx`, `SidebarMenuItem.jsx` | See above for nav-specific variants. |

---

## 5. Visual & Media Atoms

Sub-folders provide reusable SVG-driven atoms:

| Directory | Contents |
| --- | --- |
| `icons/` | `<Icon />` atom plus SVG library (base + rotating variants in `IconRollBase.jsx` / `IconRollRotate.jsx`). |
| `logos/` | `<Logomark />` atom renders logomark SVGs by name. |
| `illustrations/` | `<Illustration />` atom for hero art and cards. |
| `grids/` | `<Grid />` atom for grid studies. |
| `foundry/` | Foundry-specific atoms (`TypefaceCard`, `FeatureCard`, `GlyphItem`, `StyleCard`, `PairingCard`, `ImageItem`, `specimenText.js`). |

Additional media atoms:

| Component | Notes |
| --- | --- |
| `NiftySwifty.jsx` | Motion-friendly SVG showcase used in workshop demos. |
| `IconRollBase.jsx`, `IconRollRotate.jsx` | Animated icon reels. |

---

## 6. Tokens & Utility Controls

| Component | Notes |
| --- | --- |
| `ThemeToggleButton.jsx`, `LanguageToggle.jsx` | Already covered above; listed here to signal their role in global utilities. |
| `ControlButton.jsx`, `PlayPauseButton.jsx` | Shared in inspector/tool overlays. |

---

## Usage Tips

1. **Import from the index**: `import { Button, Pill } from '@kol/ui'` ensures tree-shaking works with package exports (`packages/ui/src/atoms/index.js`).
2. **Keep atoms dumb**: no route logic, stateful data fetching, or app-specific typography classes. Atoms expose styling hooks; molecules/organisms handle composition.
3. **Document new atoms**: when adding files inside `packages/ui/src/atoms`, update this outline plus the package index to keep exports discoverable.
