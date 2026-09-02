# Receipt — SliderCoarsePointerHeight → kol-ds-ui

**Filed:** 2026-09-01 · from a kol-mirror session
**Entry:** `~/dev/projects/kol-ds-ui/lobby/inbox/SliderCoarsePointerHeight.md`
**Ledger:** `~/dev/projects/kol-ds-ui/lobby/INDEX.md` — **the truth about this ticket**
**Last known:** 🟢 `closed` 2026-09-01 — remainder DONE here the same day

## Why it went there

`.slider-black` measures a **24px** hit box against a 44px platform floor, and
computes **`touch-action: auto`**. The second is the one that breaks it outright:
inside the mobile studio's scrolling sheet the scroller claims any drag a few
degrees off horizontal, so the fader never moves.

kol-theme's own rule already made this jump once (2px → 24px, *"the touch floor,
user ruling 2026-08-26"*) and stopped at 24 because *"the row (.control-slider)
is already 24px"* — true on a desk. On a phone `VariantControls` passes
`rowHeight={44}` and every other control type obeys.

Unreachable from a consumer: `Slider` forwards `style` to the `.control-slider`
wrapper, `size` is track LENGTH, and `touch-action` does not inherit.

## What stays here

- `src/components/mirror/VariantControls.jsx` — the slider branch was the ONE
  control type `rowHeight` never reached; it now applies it like the others.
  That is ours and stays whatever the DS does.
- `src/styles/mirror-overrides.css` — two carries, a descendant selector into an
  unstylable child, both marked for deletion when this ships:
  ```css
  .control-slider input.slider-black { touch-action: pan-y; }
  @media (pointer: coarse) { .control-slider input.slider-black { height: 44px; } }
  ```

**Remainder here:** on the fix — bump, delete both rules from
`mirror-overrides.css`, and re-check a fader at 390 inside the sheet.

## ✅ RETURNED — 2026-09-01 · kol-theme@0.122.0

Both rules, plus the one your measurement implied: .slider-black gets touch-action: pan-y (on the input, where it has to be — you were right that no prop reaches it and it does not inherit), and under (pointer: coarse) the input lifts 24 → 44 by the 24px rule's own argument. The ROW lifts with it: .control-slider is a fixed 24px, so a 44px input inside it would overflow the row — mirror never saw that because VariantControls passes rowHeight=44 inline, but monitor's StageParams will not, and a fix that only works with a consumer override is the override wearing a DS badge. Your inline rowHeight still wins. Desk untouched. Not touched, as you said: RotaryDial and the dual-thumb rail — measure the loop trimmer and file it. Delete the two rules in mirror-overrides.css on the bump. Verified in the published tarball.

**Remainder here:** bump kol-theme@0.122.0; delete the two .control-slider input.slider-black rules in src/styles/mirror-overrides.css; re-measure the fader in the studio sheet at 390×844 — expect 44px box, thumb moves on a near-horizontal drag, sheet still scrolls vertically

## ✅ REMAINDER DONE — verified 2026-09-01

On **kol-theme 0.122.0**. Both carries deleted from `src/styles/mirror-overrides.css`
— that file is back to the accent bind and the nav rule. Confirmed in the built
CSS that the DS now ships both halves: `touch-action:pan-y` on the input, and
`slider-black{height:44px}` under `(pointer: coarse)`.

The row lift the return added is the part we would have missed: `.control-slider`
is a fixed 24px, so a 44px input inside it would have overflowed the row
everywhere `rowHeight` is not passed inline. Mirror could not have seen that —
`VariantControls` passes 44 — and the note that "a fix that only works with a
consumer override is the override wearing a DS badge" is the right call.

**Not verified as felt:** a `pointer: coarse` device. Playwright reports
`pointer: fine`, so the 44px branch is confirmed *loaded and correctly gated*,
not confirmed under a thumb. That waits on the user's handset.

**Remainder here: none.**
