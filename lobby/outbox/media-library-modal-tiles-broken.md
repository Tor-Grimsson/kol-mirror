# media-library-modal-tiles-broken → kol-ds-ui

**Filed:** 2026-10-15 · 🔵 `filed` · ticket `~/dev/projects/kol-ds-ui/lobby/inbox/media-library-modal-tiles-broken.md`

`MediaLibrary variant="modal"` renders broken (heading-04 filenames, size over the copy icon, header ink). Mirror moved to `picker` the same turn. Remainder on close: none.

## ✅ RETURNED — 2026-10-15 · kol-component@0.261.0

Fixed, not retired: MediaLibrary keeps modal's own grid | list on purpose. Modal's grid now renders MediaTile (preview over name) — picker's tile — instead of ContentCard default: small filenames, no size/copy collision. Click opens the lightbox (Use · Copy URL), double-click/Enter uses the file; list view unchanged. The header title was already legible at current code. Verified in apps/media /picker/b, light and dark.

**Remainder here:** none
