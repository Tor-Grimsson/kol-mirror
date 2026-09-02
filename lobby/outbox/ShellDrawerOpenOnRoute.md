# Receipt — ShellDrawerOpenOnRoute → kol-ds-ui

**Filed:** 2026-09-01 · from a kol-mirror session
**Entry:** `~/dev/projects/kol-ds-ui/lobby/inbox/ShellDrawerOpenOnRoute.md`
**Ledger:** `~/dev/projects/kol-ds-ui/lobby/INDEX.md` — **the truth about this ticket**
**Last known:** 🟢 `closed` 2026-09-01 — **kol-shell 0.37.0**; the feature shipped but mirror does NOT use it (wrong reading of the ruling — see ShellRailCollapsedWithTapOpen)

## Why it went there

User ruling, 2026-09-01: *"the rail should load open on home, not everywhere"*.
`AppShell.jsx:128` holds `drawerOpen` as internal `useState(false)`, written only
by the package's own trigger and the route-change close at `:197`. No prop, no
context value, no handle — the policy is per-route and the shell cannot express
it. `useNavHidden` is the opposite operation (it zeroes the rail width).

## What stays here

**Nothing carried.** The drawer stays closed on every route until this ships;
building it locally means reaching into shell chrome from outside, which
`ShellRailNoDrawerOnMobile` (kol-chess) already established goes to the DS.

Separately open and NOT part of this: `.kol/llm-plan/04-open-items-2026-08-28.md`
§4.2 — whether mirror's studio sidebar and the DS rail coexist or merge. The
user's call, flagged by him as tracked elsewhere.

**Remainder here:** on the fix — bump, pass the seam for `/` only, and check on
a phone that home lands with the nav open while `/studio` still lands folded.

## ✅ RETURNED — 2026-09-01 · kol-shell@0.37.0

Your first shape, the list: <AppShell drawerOpenOn={['/']} />. Paths matched like the rail's active row — '/' exact, anything else by prefix — and the existing route-change effect now opens on ENTRY to a listed path instead of closing; every other path keeps close-on-navigate exactly as it was. It is one effect with drawer as a dep, so it fires on mount, on the fold and on navigation alike: a phone arriving on home gets the rail without a second hook. Above drawerBelow the list is inert. Default [] — nothing moves for a consumer that does not pass it. Took the list over the boolean because the policy is per-route and the shell already owns the route; the context route was the bigger surface you said it was. Verified in a real 390 render on the app-shell set (which now passes it): mount at / → open; row to /library → closed; row back to / → open; trigger still toggles either way. Not touched, as asked: remembering state across navigations, the desktop rail width.

**Remainder here:** bump kol-shell@0.37.0 and pass drawerOpenOn={['/']} on the AppShell — then check home at 390: arrive with the rail out, tap a destination and it folds

## ✅ REMAINDER DONE — verified 2026-09-01

On **kol-shell 0.37.0**. `drawerOpenOn={['/']}` passed on `AppShell`
(`src/App.jsx`). Verified at 390 × 844: **home lands with the rail out** —
labelled rows, Mirror · Library · Expression · Mixer · Tape · Studio · Fronts ·
Icons with Settings pinned at the foot — and `/studio` lands
`data-rail-drawer="closed"`, keeping its 48px back. Nothing was carried here, so
there is nothing to delete.

**Remainder here: none.**
