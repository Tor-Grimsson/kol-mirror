# UseFloatingHook → kol-ds-ui

**Filed:** 2026-10-28 · 🟢 `closed` 2026-10-28 · 📌 remainder here · ticket `~/dev/projects/kol-ds-ui/lobby/inbox/UseFloatingHook.md`

kol-monitor's `useFloating` lifted into kol-hardware; Mirror drops its copy.

**Remainder here:** on the release, `src/hooks/useFloating.js` to `_tmp/`, `SymphonyViewport` on the KOL hook; check drag and corner scale.


## ✅ CLOSED in kol-ds-ui — 2026-10-28

Shipped kol-hardware 0.8.0. `useFloating` in kol-hardware's frames, monitor's hook with mirror's one line (`nwse-resize` passes, for the corner grip), scale 0.35–2.5 (`FLOATING_MIN_SCALE` · `FLOATING_MAX_SCALE`). apps/rack-hub's stage runs on it: walked, a floating panel drags by its body. Resolution: `kol-ds-ui/lobby/done/UseFloatingHook.md`.

**Remainder here:** 📌 bump; `import { useFloating } from '@kolkrabbi/kol-hardware'`; `src/hooks/useFloating.js` to `_tmp/`; the corner grip declares `cursor: nwse-resize` and calls `onResize`.

## ✅ RETURNED — 2026-10-28

🟢 `closed` in **kol-ds-ui** — **kol-hardware 0.8.0**. Resolution: `~/dev/projects/kol-ds-ui/lobby/done/UseFloatingHook.md`.

**Remainder done 2026-10-28:** kol-hardware 0.8.0 bumped; `SymphonyViewport` imports `useFloating` from kol-hardware; the copy is in `_tmp/2026-10-28-plan19/hooks/`. Checked: the floating monitor drags by its body (300,200 → exactly) and the corner grip scales it (614 → 782px). **Remainder here: none.**
