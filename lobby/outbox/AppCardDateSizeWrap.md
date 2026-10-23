# AppCardDateSizeWrap → kol-ds-ui

**Filed:** 2026-10-23 → **kol-ds-ui**
**Entry:** `~/dev/projects/kol-ds-ui/lobby/inbox/AppCardDateSizeWrap.md`
**Ledger:** `~/dev/projects/kol-ds-ui/lobby/INDEX.md` — **the truth about this ticket**
**Last known:** 🟢 `closed` · synced 2026-10-22

## Why it went there

The `app` card's date and size break mid-value beside the trash at ~170px columns. fxr hits the same; the card is the DS's.

## What stays here

Nothing — `src/components/CatalogLibrary.jsx` passes date + size exactly as fxr does, no workaround.

**Remainder here:** on the release — bump kol-component and look at a saved patch card in `/library` at 1280.

## ✅ RETURNED — 2026-10-22 · kol-component@0.295.0

kol-component 0.295.0: on the `app` (and `file`) card and row, date and size never break inside a value; when they do not fit side by side, the size drops to the next line. Nothing to pass.

**Remainder here:** bump kol-component@0.295.0.

## ✅ RETURNED — 2026-10-23 · kol-component@0.295.0

`date` · `size` nowrap; the group wraps, so size drops below whole.

**Done here 2026-10-23:** bumped kol-component 0.295.0; seen on screen at `/library` (1280, grid) — `2026-10-23` and `1.8 KB` each whole, size on its own line. The AppCardDownloadClickBubbles fix (0.294.0) landed in the same bump: the download carries in `CatalogLibrary.jsx` and `HomePage.jsx` are removed, download no longer opens the studio. Remainder: none.
