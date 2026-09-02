# Receipt — ContentCardExpandedSplitStacks → kol-ds-ui

**Filed:** 2026-09-01 · from a kol-mirror session
**Entry:** `~/dev/projects/kol-ds-ui/lobby/inbox/ContentCardExpandedSplitStacks.md`
**Ledger:** `~/dev/projects/kol-ds-ui/lobby/INDEX.md` — **the truth about this ticket**
**Last known:** 🟢 `closed` 2026-09-01 — **kol-component 0.156.0**

## Why it went there

`/mixer`'s cards became ordinary `ContentCard variant="catalog"` today (user
ruling: "scrap this skewing module card … just use normal cards like monitor").
Expanding one at 390 measured 350 × **1177**, because the expanded cell is a
50/50 flex split: 174px of media beside 174px of content, leaving **126px** of
prose column.

Not fixable here: `media: undefined` makes it WORSE — the card draws its
"MISSING" placeholder in the same 174px — and there is no `media={false}`, no
orientation prop and no `expandedLayout` seam.

## What stays here

- `src/pages/MixerPage.jsx` keeps passing `<ModuleMedia>` on every card,
  expanded or not. The glyph is quieter than the MISSING placeholder, and that
  is the whole of the local choice.

**Remainder here:** on the fix — bump and re-measure an expanded module card at
390; expect the halves stacked and the card height to fall well under 1177.

## ✅ RETURNED — 2026-09-01 · kol-component@0.156.0

The stack, as asked — the one that helps every consumer. Below md the expanded halves stack: media on top at its OWN ratio (the variant's — catalog's A4 — 3/2 if a variant has none), expandedContent full width under it; from md the row is exactly as before. The 50% basis was an inline style, and an inline flex-basis has no breakpoint, so it is a md:flex-[0_0_50%] class now. Verified in a real render: at 390 the root is flex-direction column, media 0 0 auto at 1/1.414 on top, content below at full width; at 1280 row-reverse, media on the right at 50%, aspect auto — unchanged. Not touched, as you said: the unexpanded card, the MISSING placeholder, AssetPlaceholder. No media={false} — with the stack your absent-image modules get the placeholder full-width at its ratio above the specs, which is what a catalog of things that should have images says; if that reads wrong on /mixer, file it as its own ticket and it becomes a decision about the placeholder, not the split.

**Remainder here:** bump kol-component@0.156.0 and re-measure the expanded module card on /mixer at 390 — expect media on top at its ratio, specs full width, card height a fraction of 1177

## ✅ REMAINDER DONE — verified 2026-09-01

On **kol-component 0.156.0**. Re-measured at 390 × 844: the expanded card is
`flex-direction: column` — media **348 × 492** on top, content **348** wide
below. The prose column went **126 → 348**, which was the defect.

Card height 1177 → 1125, and the rest is **ours, not theirs**: with no
`/previews/modules/*.png` the media block is 492px of glyph. The DS shipped
exactly what was asked; the height that remains is the missing preview set.
`ModuleFront` sits in `_tmp/2026-09-01-mixer-coverflow/` as the renderer that
would fill it, and `scripts/generate-previews.mjs` already walks variants and FX
through `/dev/capture`.

**Remainder here: none** — the DS half is done. The preview set is mirror's own
work, tracked in `.kol/llm-plan/05-mobile-touch.md`.
