# 5.0.0 Workshop Index

**Version:** 2.0.0
**Date:** 2025-12-02
**Status:** Active
**Content Type:** section-index

---

## Overview

Central index for everything under `/workshop/*`. The workshop is the sandbox for live prototypes—foundations, apparatus tools, visual effects, chess analytics, and data dashboards.

---

## Workshop Sections

| Doc | Route | Description |
|-----|-------|-------------|
| [5.1.0 Foundations](./5.1.0-foundations.md) | `/workshop/foundations` | Design foundations and core patterns |
| [5.2.0 Apparatus](./5.2.0-apparatus.md) | `/workshop/apparat` | Interactive tools and apparatus |
| [5.3.0 Mirrors](./5.3.0-mirrors.md) | `/workshop/mirrors` | Hall of Mirrors visual effects |
| [5.4.0 Components](./5.4.0-components.md) | `/workshop/components` | Component demonstrations |
| [5.5.0 Chess](./5.5.0-chess.md) | `/workshop/chess` | Chess analytics program |
| [5.6.0 Analytics](./5.6.0-analytics.md) | `/workshop/analytics` | Analytics dashboards |
| [5.7.0 Documentation](./5.7.0-documentation.md) | `/workshop/design-system/documentation` | Internal documentation viewer |

---

## Routing

All `/workshop/*` pages mount through `apps/web/src/App.jsx` beneath `<Route path="workshop" element={<Workshop />}>`.

```tsx
<Route path="workshop" element={<Workshop />}>
  <Route element={<WorkshopLayout />}>
    <Route path="foundations" element={<Foundations />} />
    <Route path="apparatus" element={<Apparatus />} />
    <Route path="mirrors" element={<HallOfMirrors />} />
    <Route path="components" element={<Components />} />
    <Route path="chess/*" element={<ChessRoutes />} />
    <Route path="analytics/*" element={<AnalyticsRoutes />} />
  </Route>
</Route>
```

---

## Shared Components

- `WorkshopLayout` - Two-column shell with sidebar
- `WorkshopSidebar` - Intra-section navigation
- `DesPage` - Header wrapper
- `DesSection` - Section container
- `DesCard` - Card component

---

## Changelog

### 2025-12-02 (v2.0.0)
- Restructured to match site routes
- Added foundations, apparatus, components sections
- Renamed effects → mirrors
- Updated numbering: chess (5.5.0), analytics (5.6.0)
