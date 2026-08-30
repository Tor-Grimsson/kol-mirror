# KolSourcesPnpmResolution — the @source manifest cannot resolve under pnpm

**Filed:** 2026-08-15 → **kol-ds-ui**
**Entry:** `~/dev/projects/kol-ds-ui/lobby/inbox/KolSourcesPnpmResolution.md`
**Ledger:** `~/dev/projects/kol-ds-ui/lobby/INDEX.md` — **the truth about this ticket**
**Last known:** 🟢 `closed` · synced 2026-08-15 — shipped in kol-theme **0.42.2**

## Why it went there

`kol-sources.css` is kol-theme's manifest telling Tailwind to scan raw-JSX KOL packages. All twelve of its `@source` paths are package-relative (`../kol-shell/src`), which assumes a flat `node_modules`. pnpm resolves kol-theme into `.pnpm/@kolkrabbi+kol-theme@<v>/node_modules/@kolkrabbi/`, where only kol-theme's own dependencies are siblings — and it depends on none of the packages it sources. Every path hits nothing, silently.

This repo is on pnpm (ARCHITECTURE §6). It surfaced during the kol-shell adoption: `contents` was never emitted, so `ShortcutsOverlay` glued every label to its key, and `GridCard`'s `border-t border-fg-04` vanished. Fixing the addressing scheme is kol-theme's to make — a consumer cannot correct how a package addresses its own siblings.

## What stays here

- `src/index.css` carries `@source "../node_modules/@kolkrabbi/kol-shell/src";` with the pnpm reason in a comment. It points at this app's own `node_modules`, a real path in either layout. **Not a temporary line** — load-bearing until the DS ships a scheme that works here.
- It covers **kol-shell only**. The other eleven paths are equally inert in this repo and nobody has audited what utilities that costs — worth a pass whichever way the DS fix lands.

**Remainder here:** on the fix's return, delete the local `@source` line from `src/index.css` and re-verify the shortcuts overlay renders as one flat two-column grid.

---

## ✅ RETURNED — 2026-08-15 · 🟢 closed in kol-ds-ui

Shipped in **`@kolkrabbi/kol-theme@0.42.2`**: every package gets twin `@source` lines — the flat `../kol-x/src` for npm/yarn, plus `../../../../../@kolkrabbi/kol-x/src`, a five-up walk out of the `.pnpm` store to this app's own `node_modules/@kolkrabbi/`. One of each pair is inert per layout. The docstring's flat-tree sibling claim is corrected and cites this ticket.

Applied and verified here: bumped 0.42.1 → 0.42.2, **deleted** the local `@source` line from `src/index.css`, shortcuts overlay renders its flat two-column grid, build green, lint unchanged (120/41). Built CSS **266.65 → 275.53 kB** — the +8.9 kB is the other eleven packages' utilities landing in this repo for the first time, which is the part the original filing flagged as unaudited.

**Remainder here: none.**
