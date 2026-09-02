# Receipt — ShellRailCollapsedWithTapOpen → kol-ds-ui

**Filed:** 2026-09-01 · from a kol-mirror session
**Entry:** `~/dev/projects/kol-ds-ui/lobby/inbox/ShellRailCollapsedWithTapOpen.md`
**Ledger:** `~/dev/projects/kol-ds-ui/lobby/INDEX.md` — **the truth about this ticket**
**Last known:** 🟢 `closed` 2026-09-01 — **kol-shell 0.38.0 + kol-theme 0.123.0**

## Why it went there

User ruling: *"the rail should load open on home, not everywhere"*, corrected to
*"i means collapsed variant not expanded"* — the 48px icon column visible on
arrival, on one route.

No `touch` mode gave it: `shell` is collapsed with a grab-DRAG as its only
opener, `drawer` is off-canvas with a tap trigger. Shipping `shell` on home left
the rail rendered and unopenable on a phone, which is exactly what the user hit.

## ✅ REMAINDER DONE — verified 2026-09-01

On **kol-shell 0.38.0 + kol-theme 0.123.0**. Under `(pointer: coarse)` the theme
draws `.kol-rail-grab-tap`, a 24px disc on the rail's edge, and widens the strip
to it — a real tap target beside the fine-pointer drag.

`src/App.jsx` now reads `touch={location.pathname === '/' ? 'shell' : 'drawer'}`.
Verified at 390: **home renders the collapsed 48px rail** with the disc in the
DOM, and every other route keeps the folded drawer and its trigger.

The disc measures 0×0 under Playwright because headless Chrome reports
`pointer: fine` — the gate working, not a defect. **The tap itself is confirmed
present, not confirmed felt**; that needs the user's handset.

**Remainder here: none.**
