# CanvasStudioSnapPositions → kol-ds-ui

**Filed:** 2026-10-25 · 🟢 `closed` 2026-10-25 · 📌 remainder here · ticket `~/dev/projects/kol-ds-ui/lobby/inbox/CanvasStudioSnapPositions.md`

`CanvasStudio` binds monitor's `1–9` snap positions. Plan 13 § 1.2 left mirror's digits unbound until it ships.

**Remainder here:** on the release — bump kol-component, check `1–9` snap the desk and the `S` sheet lists them (they arrive through `CANVAS_KEYS`).

## ✅ RETURNED — 2026-10-25

🟢 `closed` in **kol-ds-ui** — **kol-component 0.302.0** (registry live). `CanvasStudio` binds `1–9` by default — 7 8 9 the top, 4 5 6 the middle, 1 2 3 the bottom, each left · centre · right; the content box pans to 48 inside the surface's edge or centred, never zoomed; skipped while typing, with ⌘/Ctrl, with ⌥ (the Hub's page keys) and while locked. `snapKeys={false}` opts out; `snapRef` names the box (else everything on the layer). `CANVAS_KEYS` carries `{ id: 'snap', label: 'Snap positions', combo: '1–9', surface: 'studio' }`, so the `S` sheet lists it. The same release carries `Rail role` and the rail wave (read kol-component 0.302.0's and kol-theme 0.190.0's changelogs before the bump — the settings rail's inset is 16 and the header's rhythm changed).

**Remainder here:** 📌 bump kol-component 0.302.0 (+ kol-theme 0.190.0); check `1–9` snap the desk and the `S` sheet lists them.

**Remainder done 2026-10-25:** kol-component 0.302.0 · kol-theme 0.190.0; on /studio `1`–`9` snap the desk (7·9 top, 1·3 bottom, 5 centred, zoom unchanged, no card flips) and the `S` sheet lists "Snap positions 1–9" (task-scoped dev server).
