# RailFlatGrabOpen — the flat rail with the r2b2 grab, into kol-shell

**Filed:** 2026-08-28 → **kol-ds-ui**
**Entry:** `~/dev/projects/kol-ds-ui/lobby/inbox/RailFlatGrabOpen.md`
**Ledger:** `~/dev/projects/kol-ds-ui/lobby/INDEX.md` — **the truth about this ticket**
**Last known:** 🟢 `closed` · synced 2026-08-28 — kol-shell **0.16.0** + kol-theme **0.88.0**, adopted here

## Why it went there

The app rail was rebuilt here on the user's ruling (2026-08-28) as the flat 48px column — one fixed div, every child a direct child — reversing kol-shell 0.13's SideNav-backed rail (`RailSideNavPixelParity`). The r2b2 grab pill drags it 48→264 on `--kol-shell-rail-width`, the content margin reads the same variable, so the page is pushed; icons never move, labels clip in, chevron only on items with `sub`; no theme toggle in the rail; the Settings rung toggles its route.

It goes to the DS rather than being copied into monitor and fxr because three local rails drift — the exact thing kol-shell was made to stop — and both hooks it uses (`--kol-shell-rail-width`, `NavHiddenContext`) are already the package's own seams. User: *"obviously go through the DS."*

## What stays here

- `src/components/NavRail.jsx` — the rail, the grab (`useGrabEdge`), the drag (`useRailDrag`). Local until the release.
- `src/styles/components.css#L198-L233` — `.rail-grab`, the pill.
- `src/App.jsx` — `Shell` renders `NavRail` inside `NavHiddenContext.Provider` itself, with `marginLeft: var(--kol-shell-rail-width)` on the content, the `\` / ⌥1–9 keys, the route-change reset and the Settings toggle. `AppShell` is not mounted.
- `src/index.css` still imports `kol-framework.css` for the shell's `.kol-brand-layout` grid, which nothing here uses now.

**Remainder here:** on the release — bump kol-shell; retire `NavRail.jsx` + the `.rail-grab` block to `_tmp/<date>-rail-upstream/`; put `AppShell` back in `App.jsx` carrying the same wiring (`items`, `bottomItems`, `logomark` = `Mirror`, `railToggleKey`, `navKeys`, `pageWash`, the Settings toggle); drop the `kol-framework.css` import if the shell no longer needs it; verify closed and open on screen, not by assertion.
**State:** 🟢 closed 2026-08-28 · **kol-shell 0.16.0** + **kol-theme 0.88.0**

## ↩ RETURNED — 2026-08-28

Closed in kol-ds-ui. Your `NavRail.jsx` is the DS's now, app-specific bits dropped as your entry asked: `zIndex: 70` → `.kol-shell-rail`'s `--kol-z-sticky`; `OPEN` reads `--kol-sidenav-w` at drag time (so it lands on the 264/320 ladder); `--rail-grab-y` → `--kol-rail-grab-y`. The pill is `.kol-rail-grab` in kol-theme's new `kol-animation.css`, its pointer numbers `GRAB` in kol-component's `utilities/motion` — nothing hand-typed. `--kol-shell-rail-width` is back to `48px` and the rail's own; `AppShell` offsets the content by it. `kol-framework` is no longer a shell peer; `gsap` is. `settings`/`themeToggle` are gone.

**Verified in source + showcase build only — no browser.** Remainder here: bump both, delete `src/components/NavRail.jsx` and the `.rail-grab` block in `src/styles/components.css`, mount the DS rail, and re-verify the drag on screen — you are the one with the working reference.


## ✅ ADOPTED HERE — 2026-08-28

Bumped **kol-shell 0.16.0** + **kol-theme 0.88.0** and mounted the DS rail:

- `App.jsx` renders `AppShell` again — `items` · `bottomItems` · `logomark` (title `Mirror`) · `currentPath` · `onNavigate` · `railToggleKey` `\` · `pageWash`. The hand-rolled `NavHiddenContext.Provider`, the local `navHidden` state and the `\` handler are gone; AppShell owns them.
- **`navKeys` is deliberately NOT passed.** AppShell maps ⌥n to `items[n-1]`, and mirror's ⌥1 is HOME — the logomark's row, which is not a rail item. The local ⌥-digit handler stays for that one offset.
- `src/components/NavRail.jsx` → `_tmp/2026-08-28-rail-upstream/NavRail-local.jsx`; the `.rail-grab` block and the rail's open/close transitions → `_tmp/2026-08-28-rail-upstream/rail-css.css`. Nothing deleted.
- **`kol-framework.css` import dropped from `src/index.css`** — it was there for `.kol-brand-layout`, which only the SideNav-backed rail (0.13–0.15) needed. kol-framework is no longer a shell peer and no `.kol-brand-*` / `.kol-sidenav-*` class renders here.

Verified on screen, not by assertion: rail 48px with all seven rows (Mirror · Library · Studio · Create · Expression · Mixer · Settings), `.kol-rail-grab` present with its 72px pill, and a pointer drag opens it to **264** with the labels revealed and the content column offset to the same 264.

**Remainder here: none.**


## ✅ REMAINDER DONE — 2026-08-28

Verified in the tree, not by assertion: `src/components/NavRail.jsx` no longer
exists, the `.rail-grab` block is out of `src/styles/components.css` (only the
comment naming its upstream replacement `.kol-rail-grab` remains), and `App.jsx`
mounts the DS `AppShell` with `items` / `bottomItems` / `logomark` /
`railToggleKey` / `pageWash` and the Settings toggle.

**Remainder here: none.**
