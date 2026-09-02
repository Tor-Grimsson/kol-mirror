# Receipt — ShellDrawerOpenOnUnstableDep → kol-ds-ui

**Filed:** 2026-09-01 · from a kol-mirror session
**Entry:** `~/dev/projects/kol-ds-ui/lobby/inbox/ShellDrawerOpenOnUnstableDep.md`
**Ledger:** `~/dev/projects/kol-ds-ui/lobby/INDEX.md` — **the truth about this ticket**
**Last known:** 🟢 `closed` 2026-09-01 — **kol-shell 0.37.1**

## Why it went there

A REGRESSION this repo shipped into itself by bumping to 0.37.0.
`AppShell.jsx:208` put `drawerOpenOn` in the effect's dep array and defaulted it
to a fresh `[]` — a new identity every render — so the effect re-ran on every
render and `setDrawerOpen(false)` undid every tap. **The rail could not be
opened on any route**, for any consumer taking the default.

Found by the USER, on his phone, not by the bump that caused it.

## ✅ REMAINDER DONE — verified 2026-09-01

On **kol-shell 0.37.1** (arrived here inside 0.38.0). The local workaround —
`const DRAWER_OPEN_ON = Object.freeze([])` at module scope in `src/App.jsx` —
is **deleted**; nothing is carried.

Verified at 390 on `/library`: tap the trigger, `data-rail-drawer` goes `open`
and stays open across renders.

**Remainder here: none.**
