# Component Inventory

## Atoms (`src/components/atoms/`)

| Component | Description |
|-----------|-------------|
| `Button.jsx` | Primary, secondary, accent, outline, control variants. 3 sizes. |
| `Checkbox.jsx` | Theme-aware checkbox with custom indicator |
| `ColorPicker.jsx` | Color input with hex display |
| `Divider.jsx` | Horizontal/vertical separator. `variant="vertical"` |
| `Input.jsx` | Text input with label support |
| `QuantityInput.jsx` | Numeric input with increment/decrement |
| `QuantityStepper.jsx` | Stepper control with min/max/step |
| `Slider.jsx` | Range slider. Variants: default, `minimal`, `dual` (two handles). `formatValue`, `playhead`, `playheadChange` |
| `ToggleCheckbox.jsx` | Checkbox-style toggle |
| `ToggleSwitch.jsx` | iOS-style toggle switch |

## Molecules (`src/components/molecules/`)

| Component | Description |
|-----------|-------------|
| `Badge.jsx` | Status badge |
| `ButtonNav.jsx` | Navigation-aligned button |
| `Dropdown.jsx` | Select dropdown, responsive |
| `DropdownTagFilter.jsx` | Multi-select with deselect all |
| `Pill.jsx` | Rounded taxonomy chip |
| `QuantityInput.jsx` | Molecule-level numeric input |
| `QuantityStepper.jsx` | Molecule-level stepper |
| `SectionLabel.jsx` | Section heading label |
| `Tag.jsx` | Metadata tag |
| `ThemeToggleButton.jsx` | Dark/light theme switcher |
| `ToggleBracket.jsx` | Bracket-style toggle with slotted labels |
| `UnitSelector.jsx` | px/rem unit toggle |
| `ViewToggle.jsx` | List/grid view switcher |

## Mirror Components (`src/components/mirror/`)

| Component | Description |
|-----------|-------------|
| `MirrorPlayground.jsx` | Root: sidebar + viewport + mobile, resizable sidebar |
| `MirrorSidebar.jsx` | Navigation, variant list, controls, symphony controls, footer |
| `MirrorViewport.jsx` | Routes `activeHall` → viewport (halls, symphony, archive) |
| `SymphonyViewport.jsx` | Symphony canvas, channel rendering, image pipeline, recording |
| `ArchiveViewport.jsx` | 9-slot memory grid with thumbnails |
| `PresetsViewport.jsx` | Placeholder |
| `ChannelLayer.jsx` | Routes channel to renderer (displacement/movement/pixi/frozen) |
| `VariantControls.jsx` | Renders controls from descriptors (toggle, slider, select, tabs, divider) |
| `MobileHeader.jsx` | Fixed mobile header with hamburger |
| `MobileDrawer.jsx` | Slide-in sidebar wrapper |

## Hall of Mirrors Components (`src/components/hall-of-mirrors/`)

| Component | Description |
|-----------|-------------|
| `SymphonyMixer.jsx` | Channel mixer UI: strips, shelves, A/B tabs, recording UI |
| `ChannelWireDiagram.jsx` | SVG signal-flow diagram (draggable MST/OUT nodes) |
| `RotaryDial.jsx` | Pointer-based drag dial for intensity |
| `VariantFrame.jsx` | Shared variant UI frame (title, toggles, canvas, info, upload) |
| `MirrorVariant.jsx` | SVG feTurbulence + feDisplacementMap renderer |
| `MovementVariant.jsx` | GSAP breathing transform renderer |
| `PixiSliceVariant.jsx` | WebGL slices |
| `PixiGlitchSliceVariant.jsx` | WebGL glitch |
| `PixiMorphVariant.jsx` | WebGL morph |
| `PixiRadialVariant.jsx` | WebGL radial |
| `PixiKaleidoscopeVariant.jsx` | WebGL kaleidoscope (Comp A/B) |

## Icons (`src/components/icons/`)

| Component | Description |
|-----------|-------------|
| `Icon.jsx` | SVG icon loader. `<Icon name="arrow-up" size={16} />` |
| `index.js` | Registry of 221 icons in 16 categories. See [icons.md](icons.md) |

## Hooks (`src/hooks/`)

| Hook | Description |
|------|-------------|
| `useMirrorState.js` | All app state: navigation, params, archive, channels, canvas, recording |
| `usePixiApp.js` | Pixi Application lifecycle (init, resize, texture, cleanup) |
| `useImageTiers.js` | Raster tier generation (mid 3×, high 6×) and caching |
| `useChannelRecorder.js` | Canvas → WebM recording (captureStream + MediaRecorder) |

## Data (`src/data/`)

| File | Description |
|------|-------------|
| `mirrorVariants.js` | Variant definitions, controls, intensityKeys, FX defs, tier logic, helpers |
