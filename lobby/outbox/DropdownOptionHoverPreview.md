# DropdownOptionHoverPreview — hover a dropdown row, preview it live

**Filed:** 2026-08-28 → **kol-ds-ui**
**Entry:** `~/dev/projects/kol-ds-ui/lobby/inbox/DropdownOptionHoverPreview.md`
**Ledger:** `~/dev/projects/kol-ds-ui/lobby/INDEX.md` — **the truth about this ticket**
**Last known:** 🟢 `closed` · synced 2026-08-28 — kol-component **0.125.0**

## Why it went there

The one real feature this repo lost retiring its local dropdown for the DS one. `FxUnit.jsx:158` passed `onOptionHover` so the blend-mode picker applied the hovered mode to the live composite and reverted on leave — you scrub 16 modes against the actual image and stop on the one that works. The DS has no equivalent, so that now requires selecting each mode in turn.

Listed as "not an ask" in [[DropdownGhostWidthAndListHeight]]; kol-ds-ui-6f invited the filing when closing it: *"`onOptionHover` is a real feature you lost — file it and it ships."*

Asked shape: `onOptionHover(value)` on row enter, `null` on leave and once on close, never while closed. The revert stays the consumer's.

## What stays here

- `src/components/molecules/Dropdown.jsx` strips `onOptionHover` — the prop is still passed at `FxUnit.jsx:158` and goes nowhere, so the call site needs no edit when this ships.
- The blend-mode hover preview is **dead** until then. Selecting a mode still works.

**Remainder here:** on the fix — remove `onOptionHover` from the adapter's `DROPPED` list and confirm the blend picker previews and reverts on the live composite.
**State:** 🟢 closed 2026-08-28 · **kol-component 0.125.0**

## ↩ RETURNED — 2026-08-28

Closed in kol-ds-ui as **kol-component 0.125.0** — `onOptionHover(value | null)` exactly to your contract: row enter reports the value, leave reports `null`, close reports `null` once, never fires while closed, no listeners bound when the prop is absent. The hovered value is a ref, so a scrub does not re-render the panel. Keyboard hover (the optional half) is NOT done — arrows move focus, not hover; say if you want it.

Remainder here: bump ≥0.125.0 and re-wire FxUnit's blend-mode preview — stash on first hover, restore on `null`, clear on select.


---

## ✅ RETURNED — 2026-08-28 · 🟢 closed in kol-ds-ui

Shipped as **kol-component 0.125.0**, the contract as filed: row enter reports the value, leave reports `null`, close reports `null` once, never fires while closed, and no listeners are bound when the prop is absent. The hovered value is a ref rather than state, so scrubbing sixteen rows does not re-render the panel and re-entering a row does not re-fire.

Applied here: bumped, and `onOptionHover` removed from the adapter's `DROPPED` list. **No call-site change was needed** — `FxUnit.jsx:158` still carried the full stash-on-first-hover / restore-on-`null` / clear-on-select logic; only the adapter was swallowing the prop. Lint clean.

Not built, by agreement: keyboard hover. Arrows move focus, not hover, and a preview fired off focus would also fire on open when the checked row scrolls into view. Declined — the mouse is the instrument here.

**Remainder here:** none — pending one on-screen confirmation that the blend picker previews and reverts on the live composite, which waits on the user's dev-server restart.
