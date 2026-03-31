# Component Inventory

## Atoms (`src/components/atoms/`)

| Component | Description |
|-----------|-------------|
| `Button.jsx` | Primary, secondary, accent, outline, control variants. 3 sizes. |
| `Checkbox.jsx` | Theme-aware checkbox with custom indicator |
| `ColorPicker.jsx` | RGBA color picker with hex display, portal rendering |
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
| `Dropdown.jsx` | Select dropdown. `keepOpen`, `renderOption`, `onOptionHover`, `placeholder` props. Minimal/md variants, 96px min width |
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
| `MirrorSidebar.jsx` | Navigation, variant list, controls, symphony controls (Loaded/Reloaded), footer |
| `MirrorViewport.jsx` | Routes `activeHall` → viewport (halls, symphony, archive) |
| `SymphonyViewport.jsx` | Symphony canvas, channel rendering, image pipeline, recording, handleLoaded/handleReloaded |
| `ArchiveViewport.jsx` | 9-slot memory grid with thumbnails |
| `PresetsViewport.jsx` | Placeholder |
| `ChannelLayer.jsx` | Routes channel to renderer (displacement/movement/pixi/frozen), per-channel animate |
| `VariantControls.jsx` | Renders controls from descriptors (toggle, slider, select, tabs, divider) |
| `MobileHeader.jsx` | Fixed mobile header with hamburger |
| `MobileDrawer.jsx` | Slide-in sidebar wrapper |

## Mixer Components (`src/components/mixer/`)

| Component | Description |
|-----------|-------------|
| `ChannelMaster.jsx` | Channel strip for Output tab. VerticalFader, `knobsA`/`knobsB` props (A/B bank toggles), enable button, accent color |

## Hall of Mirrors Components (`src/components/hall-of-mirrors/`)

| Component | Description |
|-----------|-------------|
| `SymphonyMixer.jsx` | Channel mixer UI: strips, shelves (SRC/RES/LOAD/PARAMS/REC + COLOR/BLEND/FX), tab bar |
| `MasterModule.jsx` | Output tab: 6 strips (Ch 1-3, RTN 1-2, MST), A/B knob banks, bottom tabs (AUX/FX SND/RTN), right shelf (FILES/FX/COLOR/MST/AUX-FX). readFx/writeFx/buildChannelKnobs/buildFxKnobs helpers |
| `RoutingMatrix.jsx` | Output tab: 5x5 NxN matrix (Ch 1-3 + RTN 1-2), MatrixColumn/ChannelButton components, source cycling, FB toggles, channel output section, right shelf |
| `ChannelWireDiagram.jsx` | SVG signal-flow diagram (draggable MST/OUT nodes) |
| `RotaryDial.jsx` | Pointer-based drag dial. Dense variant (knobRatio 0.95). Expression support via useExpressionValue. Click-to-edit, alt+click cancel |
| `ExpressionReference.jsx` | 5-column wave/math reference with cmd+click append to oscilloscope |
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
| `useMirrorState.js` | All app state: navigation, params, archive, channels, master, canvas, recording, undo/redo |
| `usePixiApp.js` | Pixi Application lifecycle (init, resize, texture, cleanup, renderCost, textureVersion) |
| `useImageTiers.js` | Raster tier generation (mid 3×, high 6×) and caching |
| `useChannelRecorder.js` | Canvas → WebM recording (captureStream + MediaRecorder), 4-state machine |
| `useDomCaptureCanvas.js` | DOM capture canvas for Displacement/Movement recording |
| `useFrameBuffer.js` | OffscreenCanvas per channel, captureAll, getChannelFrame, resolveRenderOrder |
| `useExpressionValue.js` | rAF expression evaluator. Compiles expressions via `new Function`. Wave/math helpers |

## Data (`src/data/`)

| File | Description |
|------|-------------|
| `mirrorVariants.js` | Variant definitions, controls, intensityKeys, FX defs (CHANNEL_FX_DEFS), tier logic, helpers (getRasterTier, getDefaultFxParams, buildChannelFxStyle) |

## Utils (`src/utils/`)

| File | Description |
|------|-------------|
| `processImageUpload.js` | SVG/raster upload processing, recolor option (replace fills with currentColor) |
