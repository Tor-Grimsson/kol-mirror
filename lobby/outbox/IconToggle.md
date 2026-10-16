# IconToggle → kol-ds-ui

**Filed:** 2026-10-15 → **kol-ds-ui**
**Entry:** `~/dev/projects/kol-ds-ui/lobby/inbox/IconToggle.md`
**Ledger:** `~/dev/projects/kol-ds-ui/lobby/INDEX.md` — **the truth about this ticket**
**Last known:** 🔵 `filed` · synced 2026-10-15

## Why it went there

The studio's Frame · Grid · Lock went icon-only (user 2026-10-15, plan 08 W5). No KOL atom is an icon-only toggle — `IconFrame` has no states, `ToggleBracket` is text.

## What stays here

Three plain `<button>`s in `src/components/hall-of-mirrors/SymphonyMixer.jsx` (search `aria-label="Frame"`).

**Remainder here:** on the release — bump kol-component and swap the three buttons for `IconToggle`.

## ✅ RETURNED — 2026-10-15 · kol-component@0.261.0

IconToggle ships (with kol-theme@0.174.0 .kol-icon-toggle): pressed/onChange, icon + iconOn, label (required, aria-label), title (DS Tooltip, default label), tone default|danger, size xs|sm|md. Ink on the oq ladder — off 32, off-hover 64, on 96, disabled 12; danger-on is --ui-error, not the raw red. Squares on the size ladder 22/26/32 — the spec's 24 is not a rung, so sm is 26. Verified: aria-pressed flips, danger-on renders the error red, focus ring is the KOL ring.

**Remainder here:** bump kol-component@0.261.0 + kol-theme@0.174.0; swap the three studio buttons (Frame · Grid · Lock)

**Done here 2026-10-15:** bumped; the three studio buttons are `IconToggle`. Remainder: none.
