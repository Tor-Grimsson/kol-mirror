# DropdownGhostWidthAndListHeight — Dropdown in a narrow chrome

**Filed:** 2026-08-28 → **kol-ds-ui**
**Entry:** `~/dev/projects/kol-ds-ui/lobby/inbox/DropdownGhostWidthAndListHeight.md`
**Ledger:** `~/dev/projects/kol-ds-ui/lobby/INDEX.md` — **the truth about this ticket**
**Last known:** 🟢 `closed` · synced 2026-08-28 — kol-component **0.124.0** · kol-theme **0.87.1** (hover half in 0.123.0)

## Why it went there

This repo retired its 324-line hand-built dropdown for `@kolkrabbi/kol-component`'s at 29 call sites (user: "it's stupid, just replace it with DS"). The studio's LOAD-tab **Source** picker — ~30 options labelled `Displacement: Animated Turbulence`, in a 24px row inside a ~300px shelf — broke on four counts:

1. `.kol-dd-ghost` sizes the trigger to the widest option (~640px), so it overflows the shelf and is clipped, while the exact-width panel renders at the full width and reads as detached.
2. No rows-visible ceiling — only the viewport clamp, and its `maxHeight` is written inline by the size middleware, which a consumer stylesheet cannot override.
3. No `rowHeight` seam — rows are a fixed `h-8` in a 24px row.
4. `hover:text-emphasis` on the panel row is the last live hover on a dropdown.

**1 and 2 cannot be fixed from here at all** — one is the trigger's own width algorithm, the other is an inline style.

## What stays here

- `src/components/molecules/Dropdown.jsx` — the adapter: pins `variant="primary"` + `size="sm"` (user rulings: "always start primary", "always sm"; "I hate outline"), and strips the props the DS has no seam for. Original at `_tmp/2026-08-28-dropdown-ds/Dropdown-local.jsx`.
- `src/styles/components.css` — two carries: `.kol-dd-panel button { height: 1.5rem }` (defect 3) and `.kol-dd-panel button:hover { color: var(--kol-fg-body) }` (defect 4).
- **FxUnit's blend-mode hover preview is gone** — `onOptionHover` had no DS equivalent (`FxUnit.jsx:158`). Hovering a blend mode no longer previews it; you have to select.

**Remainder here:** on the fix — delete both carries from `components.css`, re-check the Source picker's trigger width and list height on screen, and restore the blend-mode hover preview if the DS ships a seam for it.

## ↩ RETURNED — 2026-08-28

Closed in kol-ds-ui. **component 0.124.0** — `.kol-dd-root` + trigger cap at their container and the label ellipsises (the ghost reservation yields; the panel still matches the trigger, now the real width); `maxRows` (default 10); `rowHeight` → `MenuDropdownItem height`. **theme 0.87.0** — the caps, the ellipsis, `.kol-dd-list max-height: calc(var(--kol-dd-max-rows,10) * var(--kol-dd-row-h,2rem) + …)`. Defect 4 (the row hover) shipped as **component 0.123.0**.

Not built, per the entry's own "not asks": `onOptionHover` · `placeholder` · `defaultValue` · `renderOption` · `keepOpen`. `onOptionHover` is a real feature you lost — file it and it ships.

Remainder here: bump both; pass `maxRows`/`rowHeight` at the studio call sites; delete `.kol-dd-panel button { height: 1.5rem }` and `.kol-dd-panel button:hover { color: … }`.


---

## ✅ RETURNED — 2026-08-28 · 🟢 closed in kol-ds-ui

Shipped as **kol-component 0.124.0** + **kol-theme 0.87.0** (the hover half landed earlier in 0.123.0, on a ruling the user gave the DS directly):

1. **The reservation yields** — a new `.kol-dd-root` wrapper and `.kol-dd-trigger` cap at `max-width: 100%` and the label ellipsises. The ghost stack still reserves the widest option, it just can't grow the trigger past its box, so `rects.reference.width` is the real width and the one-piece fusion is untouched. This is the missing-chevron fix: the caret rides the trigger's right edge, which is now inside its container.
2. **`maxRows`** (default 10) → `--kol-dd-max-rows`; `.kol-dd-list` gets `max-height: calc(rows × row-h + padding)` and scrolls. The viewport clamp is unchanged.
3. **`rowHeight`** (number = px, or any CSS length) → `--kol-dd-row-h` plus an inline height per row — inline because `h-8` is a utility no components-layer rule can out-rank.
4. **No hover anywhere** — `MenuDropdownItem hover={false}`; the trigger was already pinned in all three variants.

**0.87.0 was a half-fix, corrected in 0.87.1 the same day.** `max-width: 100%` alone resolves against a flex item whose default `min-width: auto` floors it at its content — which the ghost stack had already made wide. 0.87.1 adds `min-width: 0` beside the cap on `.kol-dd-root` and `.kol-dd-trigger`: the floor lets it shrink, the cap stops it growing. Mirror's Source picker is a flex child in a `justify-between` row, so it needed both halves.

Applied here: bumped both, `rowHeight` un-stripped from the adapter and defaulted to the studio's 24 (`maxRows` left at the DS's 10), and **both CSS carries deleted** from `src/styles/components.css`. Lint clean.

**Remainder here:** the blend-mode hover preview is still gone — `onOptionHover` was listed as "not an ask" in the filing and the DS says it ships if filed. File it, or accept that hovering a blend mode no longer previews it (`FxUnit.jsx:158`).


## ✅ REMAINDER DONE — 2026-08-28

The blend-mode hover preview is back. `onOptionHover` is NOT in the adapter's
`DROPPED` list (`src/components/molecules/Dropdown.jsx:32`) and is forwarded
untouched; `FxUnit.jsx:158` stashes the current mode on first hover, restores it
on `null`, and clears the stash on select.

**Remainder here: none.**
