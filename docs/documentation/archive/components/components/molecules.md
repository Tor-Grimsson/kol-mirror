# Components › Molecules

> **Location**: `packages/ui/src/molecules`  
> **Purpose**: Mid-level components that compose atoms into reusable blocks (CTA rows, content cards, inspector panels, etc.). Molecules stay presentation-focused and expose props so organisms/pages can orchestrate layout and data.

## 1. CTA & Navigation Molecules

| Component | Notes |
| --- | --- |
| `ButtonGroup.jsx` | Horizontal group of primary/secondary actions. Consumes atom-level buttons and manages spacing/alignment props. |
| `LinkCard.jsx` | Text-and-icon card with description + CTA link. Used in Studio/Stack sections. |
| `ViewToggle.jsx` | Two-state toggle (list vs. grid) with icons and labels. Wraps button atoms. |
| `CarouselNavigation.jsx` | Prev/next control pair for carousels (FeaturedCarousel, FeaturedItemsCarousel). Handles disabled states and keyboard focus. |

---

## 2. Panels, Cards & Content Blocks

| Component | Notes |
| --- | --- |
| `CollectionCard.jsx` | Grid card used on Collections detail pages. Displays preview asset, metadata, and CTA. |
| `ImageSection.jsx` | Shared hero section with image/video on one side and descriptive copy on the other. |
| `OverviewHero.jsx` | Large hero slab (badge, title, description, categories) used on Collections and Foundry overview pages. |
| `StickyNavCard.jsx` | Scroll-aware card for Table-of-Contents layouts (Stack, Docs). |
| `FoundryCTA.jsx` | Standard Kolkrabbi CTA block (heading + description + button) for page footers. |
| `SectionToggle.jsx` | Collapsible section header/body pair. Accepts `label`, `isExpanded`, and `onToggle` callbacks. |
| `SourcesSection.jsx` | Section wrapper that aggregates `SourcesItem` atoms into a branded list. |

---

## 3. Inspector & Control Interfaces

| Component | Notes |
| --- | --- |
| `ControlPanel.jsx` | Panel scaffold for grouped controls inside workshop demos. Provides consistent padding, headings, and divider rhythm. |
| `DraggableControlPanel.jsx` | Adds drag-and-drop behavior to `ControlPanel` (used in workshop apparatus). |

---

## 4. Data Display & Content Utilities

| Component | Notes |
| --- | --- |
| `Table.jsx` | Semantic table wrapper with scoped tokens for borders, zebra stripes, and typography. |
| `ProseStylesViewer.jsx` | Renders multiple prose patterns (headline, subhead, body) with toggleable themes. |
| `SourcesSection.jsx` | (See Panels section) Doubles as data display; listed here for quick reference. |

---

## 5. Foundry Molecules

Located in `packages/ui/src/molecules/foundry/` and exported via the folder index. These power specimen layouts and foundry-specific sections.

| Component | Notes |
| --- | --- |
| `SpecimenHero.jsx` | Hero block with typeface title, metadata, and CTA. |
| `DisplaySpecimen.jsx`, `VariableFontDisplay.jsx` | Render animated glyph sets / variable sliders for type specimens. |
| `FeatureGrid.jsx`, `StylesGrid.jsx` | Grid layouts describing typeface styles and features. |
| `GlyphGrid.jsx`, `GlyphCategory.jsx` | Preview letterforms grouped by category. |
| `PairingsList.jsx`, `FoundryCard.jsx` | Secondary cards for pairings and related projects. |
| `FontControlsPanel.jsx` | Control surface for variable font sliders (weight/width/italic). |

---

## Molecule Candidates Outside `@kol/ui`

- `apps/web/src/components/workshop/molecules/*` contains workshop-only previews (e.g., `DesPage`, `ComponentPreview`, `SectionTogglePreview`). These are scoped to workshop demos and are not exported through `@kol/ui`. If any of those components mature into shared UI, move them under `packages/ui/src/molecules` and document them here.

---

## Usage Guidelines

1. **Import from package index**: `import { SectionToggle, FoundryCTA } from '@kol/ui'` so consumers rely on the shared build.
2. **Keep molecules styling-only**: avoid app-specific data fetching or router hooks. Accept props for content/state.
3. **Document new molecules**: update this file plus `packages/ui/src/molecules/index.js` whenever new files are added or moved.
