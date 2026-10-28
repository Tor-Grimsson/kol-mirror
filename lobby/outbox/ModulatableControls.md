# ModulatableControls → kol-ds-ui

**Filed:** 2026-10-28 · 🟢 `closed` 2026-10-28 · 📌 remainder here · ticket `~/dev/projects/kol-ds-ui/lobby/inbox/ModulatableControls.md`

Modulation as props on the KOL controls (expression readout + source assign), so Mirror drops `RotaryDial`.

**Remainder here:** on the release, every `RotaryDial` call site on the KOL control with Mirror's sources; `RotaryDial.jsx` and the local half of `useExpressionValue` to `_tmp/`; check `wave(t)` and right-click assign.


## ✅ CLOSED in kol-ds-ui — 2026-10-28

Shipped kol-hardware 0.8.0. `Modulatable` (kol-hardware, value) wraps a value control — kol-component's panel `Knob` or `Slider` — with your readout expression (runs on `clock`, ⌥-click clears, accent while it runs) and your right-click source menu (None · Expression A–D from `bus`, the LED dot); `useExpressionValue` under it. Props: `value` · `onChange` · `min` · `max` · `label` · `bus` (your bus ref) · `sources` · `clock` (the transport) · `source` / `onSourceChange` · `density`. A wrapper, not knob props: kol-component cannot import the compiler, and `Knob` / `Fader` in kol-hardware are ledger aliases. Walked in the showcase: `wave(t)` animates the knob, the menu lists the bus, picking A lights the dot. Resolution: `kol-ds-ui/lobby/done/ModulatableControls.md`.

**Remainder here:** 📌 bump; `RotaryDial.jsx` keeps its box sizes and becomes `<Modulatable label value onChange min max bus={exprBusRef} clock={transport}><Knob variant="panel" size={…} /></Modulatable>`; `useExpressionValue.js` and `ModulationAssign.jsx` to `_tmp/`.

## ✅ RETURNED — 2026-10-28

🟢 `closed` in **kol-ds-ui** — **kol-hardware 0.8.0**. Resolution: `~/dev/projects/kol-ds-ui/lobby/done/ModulatableControls.md`.

**Remainder done 2026-10-28:** kol-hardware 0.8.0 bumped; `Modulatable` + KOL `Knob variant="panel"` at all 35 call sites (bus = `exprBusRef`, clock = `transport`); `RotaryDial.jsx`, `ModulationAssign.jsx` and the local `useExpressionValue` hook in `_tmp/2026-10-28-plan19/` (`compile` stays for the bus). Checked: `wave(t)` in a channel knob animates it on a running clock; right-click lists Expression A–D, A lights the dot. **Remainder here: none.**
