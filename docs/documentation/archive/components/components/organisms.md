# Components › Organisms

> **Location**: `packages/ui/src/organisms`  
> **Purpose**: High-level composites that assemble multiple molecules/atoms into full sections (carousels, grids, filter panels). Organisms are still presentation-only but typically span the full width of a page section.

## 1. Layout & Content Sections

| Component | Notes |
| --- | --- |
| `CollectionGrid.jsx` | Responsive grid for Collections detail pages. Handles card layout, responsive columns, and gutter rhythm. |
| `QuickLinksGrid.jsx` | Four-card quick-link band with header + CTA (used on Collections overview and detail pages). |
| `FeaturedItemsCarousel.jsx` | Two-column carousel organism (metadata + preview) with auto-rotation and navigation controls. Accepts `renderContent` prop for custom visuals. |

---

## 2. Filter Organisms (`organisms/filters`)

| Component | Notes |
| --- | --- |
| `CollectionFilters.jsx` | Multi-select filter panel for collections (illustrations, grids, etc.). Uses checkboxes/tag atoms. |
| `ContentFilters.jsx` | Filter set for article/content lists (Stack). Provides category toggles and sort options. |
| `SpecimenFilters.jsx` | Filter grouping for foundry/specimen pages (view mode toggles, taxonomy filters). |

---

## 3. Foundry Organisms (`organisms/foundry`)

| Component | Notes |
| --- | --- |
| `FontPreviewItem.jsx`, `FontPreviewItemAlt.jsx` | Font preview organisms showing sample text, metadata, and weight sliders. Used in Foundry pages and workshop demos. |

---

## Usage Notes

1. **Import from package index**: `import { CollectionGrid, QuickLinksGrid } from '@kol/ui'`.
2. **Composition only**: organisms should not fetch data or own routing logic. Pass in the data arrays / render callbacks they need.
3. **Documentation**: When adding new organisms, update this file and `packages/ui/src/organisms/index.js` so consumers can discover them.
