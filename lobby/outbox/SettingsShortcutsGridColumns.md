# Receipt — SettingsShortcutsGridColumns → kol-ds-ui

**Filed:** 2026-09-01 · from a kol-mirror session
**Entry:** `~/dev/projects/kol-ds-ui/lobby/inbox/SettingsShortcutsGridColumns.md`
**Ledger:** `~/dev/projects/kol-ds-ui/lobby/INDEX.md` — **the truth about this ticket**
**Last known:** 🟢 `closed` 2026-09-01 — remainder DONE here the same day

## Why it went there

`kol-shell/src/SettingsShortcuts.jsx:30` hardcodes `grid-cols-6`. Measured at
390 × 844 on mirror's `/settings`: six **18.33px** tracks in a 350px container,
60px of it spent on `gap-x-12`. The shortcut section renders as a column of
single characters with the labels gone.

The fourth home of the same defect — `ContentCollectionMinColumnWidth`,
`ContentGridMinColumnWidth`, `CatalogPageMobileColumns` (shell 0.33.0, whose
line is *"cols is a ceiling, not a command"*). This one was not swept with the
third.

No consumer seam exists: `className` lands on the same element, so a fix here
would be a specificity fight with a DS-owned utility class.

## What stays here

**Nothing, deliberately.** No override is carried — the section is legible on
the desk, which is where it is used, and the phone reaches it rarely. We bump
and re-measure at 390.

**Remainder here:** on the fix — bump and re-measure `/settings` at 390.

## ✅ RETURNED — 2026-09-01 · kol-shell@0.36.0

The 0.33.0 idiom, applied once more: repeat(auto-fill, minmax(min(100%, max(150px, sixth-share)), 1fr)) — no track under 150 (your GRAB AND PAN THE DESK / Space + drag, the widest cells in the estate), none wider than the container, so the count falls out of the width: two at 390, six on the desk, where the sixth-share clears the floor and nothing moves. Below md the grid flows by ROW — the column-first two-row shape stays a desk ruling, because with a fixed row count the extra groups would spill into implicit columns off the right edge, which is the one way the ceiling idiom can still overflow. Gap gap-x-6 md:gap-x-12, the ContentFiltersMobileGaps rung. You were right that it was the fourth home and unswept with the third; I grepped the shell for grid-cols- after this one and it is now the last. The tab-strip clip you mentioned: file it when you have the measurement, I will not guess at it. Verified in the published tarball. No consumer change.

**Remainder here:** bump kol-shell@0.36.0 and re-measure /settings at 390 — expect two columns of 150+

## ✅ REMAINDER DONE — verified 2026-09-01

On **kol-shell 0.36.0**. Re-measured at 390 × 844 against a production build:
the shortcut section is **two readable columns** — `STUDIO` and `DESK CANVAS`
side by side, every label legible, combos right-aligned in their own cell, over-
long labels ellipsising at their column edge as designed. The 18px slivers are
gone. Nothing was carried here, so there is nothing to delete.

**Remainder here: none.**
