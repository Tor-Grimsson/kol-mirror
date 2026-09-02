# Receipt — ContentFiltersViewStripOverflow → kol-ds-ui

**Filed:** 2026-09-02 · from a kol-mirror session
**Entry:** `~/dev/projects/kol-ds-ui/lobby/inbox/ContentFiltersViewStripOverflow.md`
**Ledger:** `~/dev/projects/kol-ds-ui/lobby/INDEX.md` — **the truth about this ticket**
**Last known:** 🟢 `closed` · synced 2026-09-02 — **kol-component 0.163.0**

## Why it went there

The Library split into five views (user 2026-09-02: modules in modules, patches
in patches, effects in effects — one page, kinds as views, monitor's shape). At
390 `ContentFilters`' view strip is 440px in a 390 page: PATCHES cut mid-word,
EFFECTS and EXPRESSIONS unreachable, the title wrapping beside it. The LIST /
GRID strip already drops to its own line below 768; the view strip has no such
rung. That is the DS's to give, not a consumer's to fake.

## What stays here

- `src/styles/mirror-overrides.css` — one scoped cascade rule under
  `.library-catalog` wrapping the header's right group at narrow so the strip
  takes the second line. It reaches into DS utility classes. **Wrong
  mechanism, recorded as such.**
- `src/pages/LibraryPage.jsx` passes `className="library-catalog"` for that
  rule's scope only.

**Remainder here:** on the fix — delete the rule and the class, take the bump.

## ✅ RETURNED — 2026-09-02 · kol-component@0.163.0

viewPlacement, in the idiom layoutPlacement already had: auto (default) rides the header row from md and takes its OWN line under the divider below it — full width and WRAPPING, because five views on their own line at 390 still measure past the page, so the line wraps rather than clips; header always the header; below always its own line. One node, two homes — hidden md:flex in the header, md:hidden on the line — so nothing is duplicated in behaviour, only placed. Two views at desktop render exactly as before. Verified in a real render on the app-shell set: at 390 the header strip is display none and the own-line strip sits under the title row (title stays one line), wraps, spans the content width, and SAVED still switches; at 1280 the strip is back on the title row and the own line is gone. Tarball checked. Retire the .library-catalog cascade rule on the bump.

**Remainder here:** bump kol-component@0.163.0; delete the .library-catalog rule in mirror-overrides.css; re-check Library at 390 — five views on their own line under the divider, wrapping, all reachable

## ✅ RETURNED — 2026-09-02

Closed in **kol-ds-ui** the same day. Shipped **kol-component 0.163.0**:
`viewPlacement`, in the idiom `layoutPlacement` already had — `auto` rides the
header row from md and takes its own line under the divider below it, full
width and wrapping. One node, two homes (`hidden md:flex` / `md:hidden`).

## ✅ REMAINDER DONE — 2026-09-02

On **kol-component 0.163.0**, `--force` restart. The `.library-catalog` rule is
deleted from `mirror-overrides.css` and the class from `LibraryPage` — the file
is back to the accent bind, the nav rule and the create-canvas lift.

Verified in WebKit: at 390 the five views sit on their own line under the title
row, **wrapping to two rows** (182 / 204), right edge 341 in a 390 page, title
one line, no horizontal overflow, every view reachable and switching; at 1280
the strip is back on the title row. Build green, lint at the 115/42 baseline.

**Remainder here: none.**
