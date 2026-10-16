# media-picker-close-and-title → kol-ds-ui

**Filed:** 2026-10-15 → **kol-ds-ui**
**Entry:** `~/dev/projects/kol-ds-ui/lobby/inbox/media-picker-close-and-title.md`
**Ledger:** `~/dev/projects/kol-ds-ui/lobby/INDEX.md` — **the truth about this ticket**
**Last known:** 🔵 `filed` · synced 2026-10-15

## Why it went there

The picker's × placement and its title's (missing) ink are the organism's, not mirror's.

## What stays here

`index.html` `<body class="text-fg-96">` — mirror's half, right for every portal.

**Remainder here:** on the release — bump kol-component and look at the picker.

## ✅ RETURNED — 2026-10-15 · kol-component@0.261.0

The picker's × left the control cluster: MediaLibraryBrowse onHeaderClose puts it alone at the far end of the title's row, the Display Settings drawer's shape. The header title takes text-fg-96, so it no longer inherits from the body it portals into. Verified in apps/media /picker, light and dark: × on the title's centre line at the card's edge, outside the cluster, closes the picker; title ink 96 on both cards; 0 console errors.

**Remainder here:** bump kol-component@0.261.0; the body text-fg-96 workaround can stay or go

**Done here 2026-10-15:** bumped kol-component 0.261.0. Remainder: none.
