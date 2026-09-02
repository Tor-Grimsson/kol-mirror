# SliderDualThumbAndPlayhead — mirror's slider, into kol-component

**Filed:** 2026-08-30 → **kol-ds-ui**
**Entry:** `~/dev/projects/kol-ds-ui/lobby/inbox/SliderDualThumbAndPlayhead.md`
**Ledger:** `~/dev/projects/kol-ds-ui/lobby/INDEX.md` — **the truth about this ticket**
**Last known:** 🟢 `closed` · synced 2026-08-30 — **kol-component 0.133.0 + kol-theme 0.97.0**

## Why it went there

Found checking whether this repo is a compliant KOL consumer after the
2026-08-30 bump. It is not, on sliders: `src/components/atoms/Slider.jsx` is a
local component sitting beside the DS's `molecules/Slider.jsx` at **10 import
sites**, and only **two files** — `SymphonyMixer.jsx` and `RecorderUnit.jsx` —
use anything the DS lacks.

The 2026-08-27 consumption pass did half of this job. It renamed the classes out
of the `kol-*` namespace, so nothing shadows the DS any more and a theme bump
does reach this repo — but it left the duplication, and the duplication is
verbatim:

| Here | kol-theme | Difference |
|---|---|---|
| `.mirror-slider-minimal` | `.control-slider` | none — the same eight declarations, 24px height included |
| `.mirror-slider-track` | `.slider-black` | track ink only (`surface-on-primary` vs `fg-64`) — and the DS exposes that as `--kol-slider-track` |
| `.mirror-slider` | — | the DS's `default` variant, **retired upstream 2026-07-08**, still alive here |

Three asks, so this can move: `variant="dual"` (two clamped thumbs + a draggable
playhead), a `readout` seam (the DS readout is always an editable filled
`<Input>`; ~23 sliders in a 24px mixer row need the plain span), and
`defaultValue` + alt-click reset on **both** Slider and RotaryDial — the DS's own
docstring calls them one shared value-control contract.

## What stays here

- `src/components/atoms/Slider.jsx` — the local component, all 10 call sites.
- `src/styles/components.css#L27-L181` — the range-input skin: `.mirror-slider`,
  `.mirror-slider-minimal`, `.mirror-slider-track`, `.mirror-range-in`,
  `.mirror-range-out`.
- `src/styles/kol-typography-mono.css:83` — `.kol-helper-xs-2 .mirror-slider-minimal`.
- **Two defects deliberately not fixed**, because their file is leaving:
  `.mirror-range-in`'s thumb reads `--kol-bg-surface-primary`, a token kol-theme
  has never defined, so it lives on its hardcoded `#0e0e11` fallback and stays
  black in light mode (`components.css:123,134`); and the playhead is a raw
  `#2dd4bf` in the JSX.

**Remainder here:** on the release — bump kol-component; retire
`atoms/Slider.jsx` and every `.mirror-slider*` / `.mirror-range-*` rule to
`_tmp/<date>-slider-upstream/`; move all 10 call sites to the DS component,
passing `--kol-slider-track: var(--kol-surface-on-primary)` where the darker
track matters and `readout="value"` in the mixer; verify the trim slider's two
marks, the playhead drag and click-to-seek **on screen**, not by assertion.

## ✅ RETURNED — 2026-08-30

Closed in **kol-ds-ui**. Shipped: **kol-component 0.133.0** + **kol-theme 0.97.0**.
All three seams, to the contract as written.

- `variant="dual"` — `value`/`value2`, `onChange`/`onChange2`, `label1`/`label2`.
  Clamping is in the component. Thumbs distinct: `--in` hollow, `--out` solid.
- `playhead` / `onPlayheadChange` — drag seeks to pointer-up, and the **whole
  rail** seeks on pointer-down, not just the marker.
- `readout` — `'input'` | `'value'` | `'none'`. `defaultValue` + alt-click reset
  on **Slider and RotaryDial** both.

**Two deliberate departures from the prior art**, both worth knowing before you swap:

1. **The playhead colour is `--kol-slider-playhead`, defaulting to
   `--kol-accent-primary` — not `#2dd4bf`.** Your teal will not come across on
   its own. If that exact hue is wanted, set the variable per instance:
   `style={{ '--kol-slider-playhead': '#2dd4bf' }}`. Worth deciding whether the
   accent is right for you rather than restoring the literal by reflex.
2. **`atoms/Slider.jsx` calls `useMemo` after its early `return` for the dual
   branch** — hook order changes with `variant`. It has survived because no call
   site switches variant at runtime. Not carried into the DS. Flagging it in case
   the same shape exists elsewhere in your tree.

## Remainder here — 📌 YES

On the bump to component 0.133.0 / theme 0.97.0:

1. Swap all **10 import sites** from `atoms/Slider.jsx` to the DS `Slider`. The
   8 that needed nothing move as-is; `SymphonyMixer.jsx` and `RecorderUnit.jsx`
   take `variant="dual"` / `playhead` / `readout="value"`.
2. Retire `src/components/atoms/Slider.jsx` and every `.mirror-slider*` /
   `.mirror-range-*` rule in `src/styles/components.css` (#L36-L181) **to
   `_tmp/`** — not deleted.
3. Your track colour: the DS default is `--kol-fg-64`. For
   `--kol-surface-on-primary`, set `--kol-slider-track` per instance — the
   variable already existed and is why no fork was needed for that part.
4. `.mirror-slider` (the bordered pill) has no DS equivalent — that variant was
   retired here 2026-07-08. If a call site still relies on it, that is its own
   ticket, not a blocker for the other nine.

The `--kol-bg-surface-primary` token your in-thumb falls back on does not exist
in kol-theme and never has; it dies with the file, as your ticket said.

## ✅ REMAINDER DONE — 2026-08-30

Adopted on **kol-component 0.133.0 + kol-theme 0.97.0**. Build green, lint down
117 → 115 errors with the retired file.

**All 18 call sites across the 10 files moved with no edit.** `atoms/Slider.jsx`
is now a thin adapter over `molecules/Slider` — the `molecules/Dropdown.jsx`
shape — carrying exactly one repo-wide pin, `readout="value"`. The DS default is
an editable filled `<Input>`; the mixer runs 17 faders in 24px rows inside a
~300px shelf, and `value` renders the exact span the local component had.

Retired to `_tmp/2026-08-30-slider-upstream/`: `Slider-local.jsx` (183 lines) and
`components-slider-block.css` (157 lines — every `.mirror-slider*` and
`.mirror-range-*` rule). `kol-typography-mono.css:83` re-pointed from
`.mirror-slider-minimal` to `.control-slider`.

**Point 4 of the return is moot** — `.mirror-slider`, the bordered pill, had
**zero** call sites. All 18 passed `variant="minimal"` or `"dual"`, so nothing
relied on the variant the DS retired 2026-07-08. It was dead code here too.

On the two departures you flagged:

1. **The playhead is `#2dd4bf` at the one dual call site**, not the accent, set
   as `className="[--kol-slider-playhead:#2dd4bf]"` — an ancestor can reach that
   variable because you wrote it as a fallback. Decided, not restored by reflex:
   the marker sits in `RecorderUnit` among pause / clear / slot controls that all
   wear that same teal, so it reads as one of the unit's transport controls. It
   is **not** mirror's accent, which is `#49A0A2` — this repo carries a second
   undocumented teal at nine sites, which is its own problem and not this
   ticket's.
2. **The `useMemo`-after-early-return hook order** — the local Slider's copy
   leaves with the file. Your "in case the same shape exists elsewhere" was
   worth saying: `eslint react-hooks/rules-of-hooks` reports **4 more, all in
   `src/components/mirror/MirrorViewport.jsx`** — `CanvasFrame` calls
   `useRef`/`useState`/`useEffect` after `if (ratio === 'none') return children`,
   and `CopiesViewport` calls `useImageTiers` after `if (!Component) return null`.
   Worse than the Slider's, because both conditions DO change at runtime (a
   ratio control, the active variant) where no call site ever switched
   `variant`. Pre-existing, inside this repo's standing lint baseline, and
   **not fixed here** — it is a live instrument file and its own job.

**One thing came back the other way:** the track colour has no working seam.
Filed as [[SliderTrackVariableNotForwarded]] — carried meanwhile as one cascade
rule in `mirror-overrides.css`.

**Remainder here: none.**
