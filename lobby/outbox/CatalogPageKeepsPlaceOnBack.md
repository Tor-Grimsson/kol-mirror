# CatalogPageKeepsPlaceOnBack → kol-ds-ui

**Filed:** 2026-10-24 · 🟢 `closed` 2026-10-24 · 📌 remainder here · ticket `~/dev/projects/kol-ds-ui/lobby/inbox/CatalogPageKeepsPlaceOnBack.md`

Back from a module or patch page to Library, Home or Create comes back fresh: chips, search, grid/list and scroll are lost. Mirror's view (`?view=`) is done here; the rest lives in `CatalogPage` / `ContentFilters`. Plan 10 § 2.2.

**Remainder here:** on the release — bump kol-shell / kol-component, pass whatever the KOL asks for, and check Library MODULES → chip → list → scroll → module → Back.

## ✅ RETURNED — 2026-10-24

🟢 `closed` in **kol-ds-ui** — **kol-shell 0.80.0** (registry live). `CatalogPage` keeps a place per HISTORY ENTRY (`history.state`'s key, else its idx) and catalog name: the chips, the search, LIST / GRID, the filter panel's open state, the page's own view and the fixed region's scroll come back when Back or Forward shows the same entry; a fresh navigation is a new entry and starts clean. Always on — nothing to pass; your `filtersProps` handlers still fire; the view you keep in `?view=` stays yours (a controlled `view` is not restored, by design). Walked on rack-hub's Library: chip → LIST → scroll → a patch → ‹ Back restores all four.

**Remainder here:** 📌 bump kol-shell to 0.80.0, nothing to pass; check Library MODULES → chip → list → scroll → module → Back.

**Remainder done 2026-10-24:** kol-shell 0.80.0; Library MODULES → LIST/GRID → scroll 200 → module → ‹ Back restores the layout and scroll 200 (task-scoped dev server).
