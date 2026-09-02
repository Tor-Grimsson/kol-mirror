# SliderTrackVariableNotForwarded — the track colour has no working seam

**Filed:** 2026-08-30 → **kol-ds-ui**
**Entry:** `~/dev/projects/kol-ds-ui/lobby/inbox/SliderTrackVariableNotForwarded.md`
**Ledger:** `~/dev/projects/kol-ds-ui/lobby/INDEX.md` — **the truth about this ticket**
**Last known:** 🟢 `closed` · synced 2026-08-30 — **kol-theme 0.98.0 + kol-component 0.134.0**

## Why it went there

Found adopting [[SliderDualThumbAndPlayhead]] the same day. `molecules/Slider`'s
docstring says the track colour is overridable per instance via
`style={{ '--kol-slider-track': '...' }}`. It is not: the component destructures
21 named props with no rest spread, so a consumer's `style` never reaches the
element.

Setting it on an ancestor fails for a *second*, independent reason —
`.slider-black` declares `--kol-slider-track: var(--kol-fg-64)` on the element
itself, and an element's own declaration beats inheritance. Unreachable from the
props and unreachable from above.

The same release's dual rail gets it right and is the fix:
`.kol-slider-dual-playhead` reads `var(--kol-slider-playhead, var(--kol-accent-primary))`
— a **fallback**, so it inherits. That asymmetry is exactly why this repo can
colour the playhead from a `className` and cannot colour the track.

## What stays here

- `src/styles/mirror-overrides.css` — one cascade rule,
  `.control-slider .slider-black { --kol-slider-track: var(--kol-surface-on-primary); }`.
  Mirror's faders have always run full ink rather than the DS's dim `fg-64`.
  It is correct today and it is the **wrong mechanism**: a consumer stylesheet
  reaching into a DS class by specificity is the shape the 2026-08-27
  consumption pass spent a session removing from this repo.
- `src/components/atoms/Slider.jsx` says so in its docstring, so the next reader
  does not "tidy" the rule away without the seam existing.

**Remainder here:** on the fix — delete that rule from `mirror-overrides.css`,
pass the track colour the documented way, and drop the paragraph about it from
the adapter's docstring.

## ✅ RETURNED — 2026-08-30

Closed in **kol-ds-ui**. Shipped: **kol-theme 0.98.0** + **kol-component 0.134.0**.
Both halves — the diagnosis was exactly right that they were two independent
blocks, so fixing one would have left the other route dead.

- `.slider-black`'s track pseudo-elements now read
  `var(--kol-slider-track, var(--kol-fg-64))`. No self-declaration, so the
  variable **inherits**.
- `style` is forwarded to the wrapper on both branches.

## Remainder here — 📌 YES

On the bump, delete the cascade rule:

```css
/* remove */
.control-slider .slider-black { --kol-slider-track: var(--kol-surface-on-primary); }
```

Replace with either — both work now:

- `style={{ '--kol-slider-track': 'var(--kol-surface-on-primary)' }}` per instance, or
- the variable set once on the instrument's own wrapper, and every fader inside inherits it.

The second is probably what you want for "full-ink tracks at every fader" — one
declaration, no per-call-site prop.

Thanks for catching it. A docstring promising a seam that was never wired is
worse than no docstring, and it had been that way since the component shipped.

## ✅ REMAINDER DONE — 2026-08-30

On **kol-theme 0.98.0 + kol-component 0.134.0**. The cascade rule is deleted
from `mirror-overrides.css` — the file is back to the accent bind and the nav
rule, nothing reaching into a DS class.

Took the **per-instance `style`**, not the wrapper. The wrapper is one
declaration and it is the right shape when every fader shares an ancestor;
mirror's do not — they are spread across the mixer, the sidebar, VariantControls
and three pages, so the only common ancestor is `:root`, and a `:root`
declaration is the cascade rule again under a nicer name. The adapter already
exists and already pins `readout`, so the pin lives beside it:

```jsx
const Slider = ({ readout = 'value', style, ...rest }) => (
  <DSSlider {...rest} readout={readout}
            style={{ '--kol-slider-track': 'var(--kol-surface-on-primary)', ...style }} />
)
```

A call site's own `style` spreads after and wins, which the cascade rule could
not offer at all.

Verified in the built CSS: `.control-slider .slider-black` no longer appears.
Build green, lint unchanged at 115 errors.

**Remainder here: none.**
