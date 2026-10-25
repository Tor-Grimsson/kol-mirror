# SettingsRailDocsTab → kol-ds-ui

**Filed:** 2026-10-24 · 🟢 `closed` 2026-10-24 · 📌 remainder here · ticket `~/dev/projects/kol-ds-ui/lobby/inbox/SettingsRailDocsTab.md`

A Docs tab on the Settings rail (Repo folds into About). Mirror's Settings is already controls only; the notes wait in `docs/documentation/00-mirrors/render-settings.md`. Plan 10 § 5.2.

**Remainder here:** on the release — bump kol-shell, pass `app.docs` with the three notes from `render-settings.md` verbatim, check the rail's tab row is one line.

## ✅ RETURNED — 2026-10-24

🟢 `closed` in **kol-ds-ui** — **kol-shell 0.80.0** (registry live). `app.docs: [{ label, paragraphs }]` draws a Docs tab on the settings rail, each entry a section in About's voice (no JSX — strings or arrays of paragraphs); `app.links` draw under About, so the row is Settings · Shortcuts · About · Docs, four words on one line on every hub. No `app.docs` = no Docs tab; Repo folds into About everywhere, one shape. The page tier (`HubSettings`) keeps its ABOUT and REPO.

**Remainder here:** 📌 bump kol-shell to 0.80.0; pass `app.docs` with the three notes from `render-settings.md` verbatim (`[{ label, paragraphs: [...] }]`); check the rail's tab row is one line.

**Remainder done 2026-10-24:** kol-shell 0.80.0; `app.docs` = `DOCS` in `src/pages/SettingsPage.jsx`, the three notes verbatim; the rail row is Settings · Shortcuts · About · Docs on one line, Docs shows the notes.
