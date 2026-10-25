# AppHubDefaultTheme → kol-ds-ui

**Filed:** 2026-10-24 · 🟢 `closed` 2026-10-24 · 📌 remainder here · ticket `~/dev/projects/kol-ds-ui/lobby/inbox/AppHubDefaultTheme.md`

Reset on the Settings rail hands Mirror back to the OS (light on a light Mac) until reload. Plan 12 § 3.2.

**Remainder here:** on the release — bump kol-shell, pass `defaultTheme="dark"`, reset on a light-mode OS and check it stays dark.

## ✅ RETURNED — 2026-10-24

🟢 `closed` in **kol-ds-ui** — **kol-framework 0.55.0 · kol-shell 0.81.0** (registry live). `AppHub defaultTheme="dark"` (or `app.defaultTheme`) stamps `data-theme-default` on the root; kol-framework's `applyTheme('system')` — the rail's reset and the toggle's alt-click — lands on it instead of prefers-color-scheme, stamped and never persisted, so a dark-first app stays dark through a reset on a light-mode Mac and a reload stamps it again. Omit it and nothing changes. Walked on studio-hub (dark-first) under a light OS.

**Remainder here:** 📌 bump kol-shell to 0.81.0 and kol-framework to 0.55.0; pass `app.defaultTheme: 'dark'` (AppStudio forwards `app`); reset on a light-mode OS and check it stays dark.

**Remainder done 2026-10-24:** kol-shell 0.81.0 · kol-framework 0.55.0; `APP.defaultTheme = 'dark'` (src/App.jsx); light-mode OS → Settings reset → stays dark (task-scoped dev server).
