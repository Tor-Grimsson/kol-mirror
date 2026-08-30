# lobby — kol-mirror

Intake queue for **kol-mirror**: the mirror surface — UI issues, app-shell and
routing behaviour, and this repo's consumption of the `@kolkrabbi/*` packages.
Not documentation — a work queue, deliberately outside `docs/`.

**This file is the ledger. The ledger is the truth, never a raw `ls`.**

| | |
|---|---|
| file one | `clip-drop.sh --kol-mirror NAME` |
| read it | `/lobby-list` · `bin/lobby` · `prefix Ctrl+K` |
| the spec | `~/.dotfiles/docs/operations/systems/lobby/` |

## States

| | state | means | lives in |
|---|---|---|---|
| 🔵 | `filed` | captured, unread | `inbox/` |
| 🟡 | `read` | understood — the row below restates it | `inbox/` |
| 🟠 | `addressed` | a change shipped that is *meant* to close it | `inbox/` |
| 🟢 | `closed` | met the bar; resolution appended | `done/` |
| ⚪ | `parked` | deliberately not-**now**, reason recorded — revisitable | `archive/` |
| ⚫ | `retired` | closed without a fix, not-**ever** — terminal, and never ages | `archive/` |
| 🔴 | `needs-ruling` | **flag, not a state** — blocked on the user's call | wherever it is |
| 📌 | `remainder` | **flag, not a state** — closed at its destination, still owed **here** | `outbox/` |

**`read` is never `closed`.** Understanding a ticket ships nothing.
**Bar for 🟢 closed in this repo — purpose served:** the change shipped and was
verified by running it, cited by file. **The agent closes on that evidence.**
Parking, declaring stale, reopening and any design decision stay the **user's call**.

## Queue — 0 entries

_(empty — live tasks only)_

## Closed

| | Entry | About | Staged | Closed | State |
|---|---|---|---|---|---|
| 🟢 | [ShellHomeSystemAdoption](done/ShellHomeSystemAdoption.md) | The shared app tier adopted on kol-fxr's wiring: Home + Library on `CatalogPage`, Settings on `SettingsShortcuts` / `SettingsLinks` / `SettingsColophon`, `AppShell railToggleKey` + `nav-*` + logomark from the DS, the theme boot script, `voice="mono"`, no `GridCard` / `TabStrip` left; `touch` stays default (ARCHITECTURE §2) | 2026-08-27 | 2026-08-27 | `closed` — kol-shell **0.10.0** · component **0.108.0** · theme **0.72.0** · icons **0.22.0**; seen rendering on the user's server (session 44, shell 0.8.0), today's bump build green, lint unchanged |

## Archived

_(none yet — ownership, deferral and context notes land in `archive/`)_

## Filed elsewhere

Tickets this ledger does **not** govern — each row names the destination ledger
that does. The **Remainder** is this repo's to do; the state is theirs to report.

| | Receipt | Destination | Last known | Remainder here |
|---|---|---|---|---|
| 🟢 | [DropdownOptionHoverPreview](outbox/DropdownOptionHoverPreview.md) | **kol-ds-ui** — `~/dev/projects/kol-ds-ui/lobby/INDEX.md` | 🟢 `closed` · synced 2026-08-28 — component **0.125.0**, the contract as filed; keyboard hover declined | **none** — adapter un-stripped, FxUnit needed no change; one on-screen confirmation outstanding |
| 🟢 | [DropdownGhostWidthAndListHeight](outbox/DropdownGhostWidthAndListHeight.md) | **kol-ds-ui** — `~/dev/projects/kol-ds-ui/lobby/INDEX.md` | 🟢 `closed` · synced 2026-08-28 — component **0.124.0** · theme **0.87.1**: `.kol-dd-root` caps at 100% **and** floors `min-width: 0` (the chevron fix; 0.87.0 alone was a half-fix on a flex child), `maxRows`, `rowHeight`, no hover | 📌 **`onOptionHover`** — FxUnit's blend-mode hover preview is still gone; the DS ships it if filed |
| 🟢 | [RailFlatGrabOpen](outbox/RailFlatGrabOpen.md) | **kol-ds-ui** — `~/dev/projects/kol-ds-ui/lobby/INDEX.md` | 🟢 `closed` · synced 2026-08-28 — kol-shell **0.16.0** · kol-theme **0.88.0**; the flat rail + r2b2 grab are the DS's | **none** — AppShell mounted, local rail + CSS retired to `_tmp/2026-08-28-rail-upstream/`, `kol-framework.css` import dropped, drag verified on screen at 264 |
| 🟢 | [KolSourcesPnpmResolution](outbox/KolSourcesPnpmResolution.md) | **kol-ds-ui** — `~/dev/projects/kol-ds-ui/lobby/INDEX.md` | 🟢 `closed` · synced 2026-08-15 — **theme 0.42.2**, twin `@source` lines per package | none — local override deleted from `src/index.css`, overlay re-verified; built CSS +8.9 kB as the other eleven packages' utilities finally emit here |

## History

| Date | Event |
|---|---|
| 2026-08-15 | **AppShellSet's remainder is served — both halves.** kol-shell 0.1.0 adopted (8 local shell files → `_tmp/2026-08-15-shell-upstream/`, plus PageShell + SettingsScaffold + TabStrip taken up), and the dead `Workshop*` shell swept — `WorkshopLayout.jsx` + `WorkshopSidebar.jsx`, zero references, retired to `_tmp/2026-08-15-shell-upstream/workshop-shell/`; lint fell 122→120 errors with them. The sweep was **missed on the first pass and caught by the user**: the adoption ran off a chat-level plan without this ledger being read, so only the half that had been discussed got done. `KolSourcesPnpmResolution` filed to kol-ds-ui the same day — receipt above |
| 2026-08-15 | lobby created and registered in `~/.dotfiles/files/folders.md` § `lobby`. Flag `--kol-mirror` falls out of the path; no `/lobby-<name>` skill until this repo starts receiving tickets from elsewhere often |
| 2026-08-15 | **Work owed here is recorded in another repo's outbox.** `kol-monitor/lobby/outbox/AppShellSet.md` — 🟢 closed in kol-ds-ui 2026-08-14 (kol-shell 0.1.0 + theme 0.41.0 + framework 0.20.0) — carries a 📌 remainder and names kol-mirror as sharing it: adopt the DS shell, retire the local copies to `_tmp/`, plus this repo's dead `Workshop*` shell sweep. **No receipt stub was written into this repo's `outbox/`** — that filing was kol-monitor's, and inventing a second stub would fabricate a filing this repo never made. Whether kol-mirror gets its own copy is the user's call |
| 2026-08-27 | **`ShellHomeSystemAdoption` filed** from kol-fxr — the shared Home · Library · Settings tier is in the DS; adopt it the way fxr did the same day. |
| 2026-08-27 | **`ShellHomeSystemAdoption` closed** → `done/`, receipt returned to kol-fxr's outbox. Adopted in session 44 on fxr's four files; closed after today's bump to kol-shell 0.10.0 · component 0.108.0 · theme 0.72.0 · icons 0.22.0 (`pnpm outdated` empty). The 0.9.0 `combo` fix retired the local `SHORTCUT_SHEET` map; the `SettingsShortcuts` combo wrap is fixed upstream in 0.10.0 — no DS ticket |
| 2026-08-28 | **`RailFlatGrabOpen` filed to kol-ds-ui** — the rail rebuilt here as the flat 48px column with the r2b2 grab (user ruling, session 46: "obviously go through the DS"). Local `NavRail.jsx` + `.rail-grab` carried until the release; receipt above carries the 📌 |
| 2026-08-28 | **`DropdownGhostWidthAndListHeight` filed to kol-ds-ui** — the local 324-line dropdown retired for the DS one at 29 call sites; four defects surfaced by the studio's Source picker, two of them unfixable from a consumer. Adapter + two CSS carries stay here; the blend-mode hover preview is lost until the DS ships a seam |
| 2026-08-28 | **`DropdownGhostWidthAndListHeight` closed same-day** → component 0.124.0 · theme 0.87.0. Both CSS carries deleted, `rowHeight` forwarded at 24. One remainder stands: `onOptionHover` was filed as "not an ask" and the blend-mode hover preview is still lost |
| 2026-08-28 | **`DropdownOptionHoverPreview` filed to kol-ds-ui** — the blend-mode hover preview, the one feature lost in the dropdown swap. Also took theme **0.87.1**: 0.87.0's `max-width: 100%` was a half-fix on a flex child, whose default `min-width: auto` floors it at content width; 0.87.1 adds `min-width: 0` |
| 2026-08-28 | **`RailFlatGrabOpen` adopted** — kol-shell 0.16.0 · kol-theme 0.88.0. `AppShell` is back in `App.jsx`; `navKeys` deliberately not passed because mirror's ⌥1 is HOME, not a rail item. Local `NavRail.jsx` + the rail CSS retired to `_tmp/2026-08-28-rail-upstream/`, and the `kol-framework.css` import dropped with them — the shell no longer needs `.kol-brand-layout` |
