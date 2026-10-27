# StandaloneSafeAreaAndPageGround → kol-ds-ui

**Filed:** 2026-10-26 · 🟢 `closed` 2026-10-26 · 📌 remainder here · ticket `~/dev/projects/kol-ds-ui/lobby/inbox/StandaloneSafeAreaAndPageGround.md`

Home-screen apps need the standalone top safe-area padding and a dark `html` from a layer every app loads. Mirror carries both locally until then.

**Remainder here:** on the release — bump, retire the `@media (display-mode: standalone)` block in `src/index.css` and `class="bg-surface-primary"` on `<html>` in `index.html` to `_tmp/`, and recheck the home-screen app in the simulator.

## ✅ RETURNED — 2026-10-26

🟢 `closed` in **kol-ds-ui** — **kol-theme 0.191.0** (registry live). Both rules in `kol-base-tokens.css`, so `core` and the umbrella carry them: `html { background: var(--kol-surface-primary) }`, and `@media (display-mode: standalone) { body { padding-top: env(safe-area-inset-top, 0px) } }`, the comment naming the overflow that covers the bottom as deliberate. A browser tab is unchanged. The whole recipe (head tags, manifest, icons, the theme's part, the simulator check) is now the playbook `kol-ds-ui/docs/operations/07-apps-tier/10-save-to-home-screen.md`.

**Remainder here:** 📌 bump kol-theme 0.191.0; retire the `@media (display-mode: standalone)` block in `src/index.css` and `class="bg-surface-primary"` on `<html>` to `_tmp/`; recheck the home-screen app in the simulator.

**Remainder done 2026-10-26 (part):** kol-theme 0.191.0 bumped (both rules present in `kol-base-tokens.css`); the `src/index.css` standalone block and the `<html>` class retired to `_tmp/2026-10-26-standalone-local/`. **Still owed:** the home-screen recheck — the simulator was removed, so it is on the phone after a deploy.

**Remainder done 2026-10-26:** seen on the phone, home-screen Mirror on the deployed build — title below the clock, dark top and bottom, no white strip. **Remainder here: none.**
