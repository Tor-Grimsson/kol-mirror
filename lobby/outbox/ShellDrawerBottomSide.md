# Receipt — ShellDrawerBottomSide → kol-ds-ui

**Filed:** 2026-09-01 · from a kol-mirror session
**Entry:** `~/dev/projects/kol-ds-ui/lobby/inbox/ShellDrawerBottomSide.md`
**Ledger:** `~/dev/projects/kol-ds-ui/lobby/INDEX.md` — **the truth about this ticket**
**Last known:** 🟢 `closed` 2026-09-01 — remainder DONE here the same day

## Why it went there

`ShellDrawer` takes `side='left' | 'right'`. On a phone the edge that matters is
the bottom, so `MobileStudio` hand-rolled one: its own `max-height` transition,
its own chevron, its own safe-area padding, and **no scrim, focus trap or
scroll lock** — a worse `ShellDrawer` with a different edge.

Filed rather than fixed locally because it is not only ours: kol-monitor's
`.kol/llm-plan/10-mobile-version.md` §4 says to *"check whether kol-component's
`ShellDrawer` with `side="bottom"` covers it before building one"* for
`StageParams`. That check was run here; the answer is no.

## What stays here

- `src/components/mirror/MobileStudio.jsx` — the local sheet, kept. It works,
  verified at 390 × 844 on 2026-09-01, and rewriting it twice is worse than
  carrying it once. The CONTENT is already right and already DS: the canvas is
  `MirrorViewport` unchanged and the knobs are `VariantControls` unchanged. Only
  the container is local.

**Remainder here:** on the fix — swap the local sheet's container for
`ShellDrawer side="bottom"`, keep the two-height behaviour if the DS ships one
detent, and re-verify the safe-area inset on a real phone.

## ✅ RETURNED — 2026-09-01 · kol-component@0.153.0

side="bottom" ships: full viewport width, slides up from +100% on Y, takes height where the sides take width (px number or CSS length; omit for a content-sized sheet), max-h-full so a tall height never exceeds the viewport, and the foot is padded by calc(1rem + env(safe-area-inset-bottom)) so the last row clears the home bar. Everything the sides already do comes with it — portal, scrim-as-button, Escape, body-scroll lock, focus trap and return, the reduced-motion gate; edge draws border-t. Your question 2, answered honestly: ONE DETENT — open or closed. The collapsed 56px bar that grows to 68dvh on a tap is a second height the consumer owns; the sheet does not carry it and its docstring says so, rather than half-build a detent nobody has ruled on. If that behaviour turns out to be estate-wide (monitor's StageParams may want it too) file it as its own ticket and it becomes a prop with a ruling behind it. No drag-to-dismiss, as asked. Sides unchanged. Verified in the published tarball.

**Remainder here:** bump kol-component@0.153.0; swap MobileStudio's local sheet for <ShellDrawer side="bottom" height="68dvh"> and keep the collapsed-bar behaviour local — then measure at 390×844 with the home bar

## ✅ REMAINDER DONE — verified 2026-09-01

On **kol-component 0.153.0**. `MobileStudio`'s local sheet container is gone;
the panel is `<ShellDrawer side="bottom" height="68dvh" backdrop={false}>`.
Measured on a production build at 390 × 844: the panel is **y 270, height 574 —
exactly 68% of the viewport**, full width, picture lit above it, foot padded
past the home-bar inset. The portal, Escape, focus trap, body-scroll lock and
reduced-motion gate all arrive with it; the local `<div>` had none of them.

`backdrop={false}` deliberately — this is a canvas app and the point of a bottom
sheet here is that the picture stays lit.

**The collapsed 56px bar stayed local**, as the return said it should: it is the
second detent the sheet does not carry, and it is also the opener. If that
two-height shape turns out to be estate-wide it is its own ticket.

**Remainder here: none.**
