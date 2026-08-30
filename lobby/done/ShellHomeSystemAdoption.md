# ShellHomeSystemAdoption — the shared app tier shipped; adopt it like kol-fxr did

**Staged:** 2026-08-27 → from **kol-fxr** (the reference adoption, same day)
**Source:** kol-fxr `src/pages/HomePage.jsx` · `LibraryPage.jsx` · `SettingsPage.jsx` · `src/AppLayout.jsx` · `vite.config.js` · `index.html`
**DS:** kol-ds-ui `lobby/done/ShellHomeSystem.md` · `PageHeaderMonoTitle.md` · `ContentFiltersFirstGroupHugs.md`

## What happened

Home · Library · Settings under the `AppShell` rail was one system written by
hand in fxr, mirror and monitor. On 2026-08-27 kol-fxr was rebuilt to match
monitor page by page, then everything generic was filed to the DS and shipped
the same day: **kol-shell 0.8.0 · kol-component 0.104.3 · kol-theme 0.71.0 ·
kol-framework 0.28.0 · kol-icons 0.20.0 · kol-brand 0.1.3**. fxr adopted all
of it; this repo carries the hand-rolled originals. Same round-trip here.

## Do

1. **Bump** to the versions above (`npm view <pkg> dist-tags`, not `pnpm outdated` — it lies).
2. **Home → `CatalogPage`** (kol-shell): `header={{ title, subtitle, size: 'sm', voice: 'mono' }}`,
   `items`, `filtersTitle`, `views` (RECENT/SAVED), `toCard(item, { view, layout })`,
   `walkthrough={{ open, steps }}`, `actions`. Stop importing `GridCard` / `TabStrip`
   (deprecated) — the DS retires them once no one imports them.
3. **Settings**: `<SettingsScaffold header={{ size: 'sm', voice: 'mono' }}>`;
   `SettingsShortcuts sections comboLabel` for the shortcut list; `SettingsLinks links`
   for the Repo tab; `SettingsColophon` for the foot line. Section `h2`s are the DS's now.
4. **AppLayout**: `<AppShell railToggleKey={'\\'} touch="overlay" appName="…">` — the key
   hides the rail (never while typing; back on every route change), `touch` owns the
   coarse-pointer policy (`'overlay'` mounts the promoted `TouchDeviceOverlay`;
   `'bare'` = no shell). Rail icons `nav-library · nav-rack · nav-create · nav-settings ·
   nav-home` are in kol-icons 0.20.0 — drop the local set and `iconComponent`.
   Logomark: `import logomarkUrl from '@kolkrabbi/kol-brand/svg/favicon-01.svg?url'`.
5. **Theme boot**: `THEME_BOOT_SCRIPT` from `@kolkrabbi/kol-framework/src/theme.js`,
   inlined by a `transformIndexHtml` plugin replacing an `<!-- kol-theme-boot -->`
   comment in `index.html`; delete the hand-written snippet.
6. **Laws re-affirmed today** (all in the DS now, none to fake locally): icons paint
   opaque `oq-*`, never alpha `fg-*` (strokes multiply); `ContentFilters` — the FIRST
   group hugs its chips, every group after it flows, category labels are `kol-eyebrow`;
   section/category labels everywhere are `kol-eyebrow`; catalog cards zoom + step
   their frame on hover and truncate `detail` by default.
7. `"dev": "vite --force"` — a DS bump served the old package from Vite's dep cache
   twice today; forcing re-optimisation on start ends that.

## Mirror-specific

Not read from here — verify each item against your `App.jsx` / `Shell()` /
pages. Mirror passes no `iconComponent` already (DS icons), so item 4 is the
`nav-*` names + `railToggleKey` + `touch` only.

## Reference

Read kol-fxr's four files above as the target render — they are ~80 lines each now.

---

## ✅ RESOLUTION — 2026-08-27

Adopted on fxr's four files (session 44) and bumped **past** the ticket's versions today: **kol-shell 0.10.0 · kol-component 0.108.0 · kol-theme 0.72.0 · kol-icons 0.22.0 · kol-framework 0.28.0 · kol-brand 0.1.3** — `pnpm outdated` empty.

| Do | Where |
|---|---|
| 1 Bump | `package.json`; every version in `minimumReleaseAgeExclude` (`pnpm-workspace.yaml`) |
| 2 Home → `CatalogPage` | `src/pages/HomePage.jsx` (Recent / Saved, walkthrough, actions) + `src/pages/LibraryPage.jsx` in fxr's pooled shape (Variants + Memory filter groups). No `GridCard` / `TabStrip` import left — grep clean |
| 3 Settings | `src/pages/SettingsPage.jsx` — `SettingsScaffold header={{ size:'sm', voice:'mono' }}`, `SettingsShortcuts`, `SettingsLinks` (Repo tab), `SettingsColophon` |
| 4 AppShell | `src/App.jsx` — `railToggleKey={'\\'}`, `nav-library / nav-rack / nav-settings`, logomark from `@kolkrabbi/kol-brand` (local `/svg/favicon-01.svg` → `_tmp/2026-08-27-shell-home-adoption/`). **`touch` stays default on purpose** — this app owns its coarse-pointer layout (ARCHITECTURE §2) |
| 5 Theme boot | `vite.config.js` `themeBoot` plugin ← `THEME_BOOT_SCRIPT`; `index.html` carries the `<!-- kol-theme-boot -->` comment; the hand boot is gone from `src/main.jsx` |
| 6 Laws | nothing faked locally |
| 7 `vite --force` | `package.json` `dev` |

Also: kol-shell 0.9.0 (`ShellHomeSystemMonitorGaps`) made the overlay read `combo`, so the local `SHORTCUT_SHEET` map is deleted from `src/data/shortcuts.js` — `MirrorPlayground.jsx` hands `KEYBOARD_SHORTCUTS` to both consumers. The `SettingsShortcuts` combo wrap seen in session 44 is fixed upstream in 0.10.0 (`whitespace-nowrap`) — no DS ticket.

**Evidence:** rendered on the user's server 2026-08-27, session 44 (shell 0.8.0): Home, Library grid + list, Settings ×3 tabs, Studio — 0 console errors. Today's bump to 0.10.0 / 0.108.0 / 0.72.0 / 0.22.0: build green, lint 120/41 unchanged — **build-verified only**, no server run (the user's rule).
