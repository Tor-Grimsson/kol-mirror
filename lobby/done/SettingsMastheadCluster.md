# SettingsMastheadCluster — the settings masthead row is the scaffold's now

**Staged:** 2026-08-30 · from **kol-ds-ui**
**Nature:** new props on `SettingsScaffold`, shipped in **kol-shell 0.27.0**. Adopt to get the consistent row.

## Why

The user, on three settings pages side by side: *"Im trying to ship a
universally consistent settings page, visually and functionally, but I keep
hitting the same issues over and over again."*

The masthead's control row was a raw `header.actions` slot. kol-fxr and
kol-r2b2 each hand-built the same shape into it; **kol-mirror and kol-monitor
passed nothing at all** — the string `actions` does not appear in either
SettingsPage. So the three pages did not differ by drift or version skew. Two of
them were simply never handed the row.

## What shipped

`SettingsScaffold` owns the arrangement — order, gap and tone — and the gear:

```jsx
<SettingsScaffold
  picker={<Dropdown className="w-40" tone="sunken" options={…} />}   // yours, optional
  themeToggle={<ThemeToggle fill="none" tone="sunken" label={false} size="sm" />}
  onOpenSettings={() => setDrawerOpen(true)}                        // the gear; DS draws it
/>
```

Renders **picker · theme toggle · gear** on the subtitle's baseline, right
aligned, above the rule. `IconFrame settings-01`, `tone` inherited from the
scaffold, `size="sm"`.

- **`themeToggle` is a node**, not drawn by the scaffold — it lives in
  kol-framework and shell dropped that peer in 0.16.0.
- Pass none of the three and no cluster renders. Nothing moves until you opt in.
- An explicit `header.actions` still wins, so nothing existing breaks.

## Also in this wave — the `sunken` tone was raised

**kol-theme 0.106.0.** `tone="sunken"` had no token of its own and borrowed
`--kol-oq-inverse-96`, which lands at luminance 23.7 on an 18.2 dark page: every
control wearing it rendered as its own PALE box. Measured on fxr's /settings.

Now `--kol-surface-sunken` → `oq-ab-96`, and the `ab` ladders flip toward the
ground, so the well is below the page on both themes. The state ladder is three
rungs — rest / `+fg-04` hover / `+fg-08` selected, ~9.5 apart either theme.

**Bump theme to 0.106.0 or the row still looks wrong**, whatever you pass.

## Remainder here — 📌 YES

1. Bump kol-shell **0.27.0** and kol-theme **0.106.0**.
2. Pass `themeToggle` and `onOpenSettings` at minimum — that alone makes this
   page match the other two.
3. `picker` only if this app has something to pick (fxr opens a chrome, r2b2 a
   bucket). Omit it and the row is toggle + gear.
4. If you have a settings drawer, wire `onOpenSettings` to it. If not, the gear
   is the place it goes when you build one.

⚠️ **Nothing here is screen-verified** — no repo renders the cluster yet. The
first to adopt is the check.

---

## 🟠 ADDRESSED — 2026-09-01, kol-mirror

**Bumped past the ask, to the head of the tier:** kol-shell 0.26.0 → **0.31.0**,
kol-theme 0.100.0 → **0.116.0**, kol-component 0.136.0 → **0.149.0**. The ticket
asks for shell 0.27.0 + theme 0.106.0; both were four and ten releases back by
the time this was read, and taking the tier in one move is this repo's pattern.
Three versions appended to `minimumReleaseAgeExclude`. Every kol-shell import in
`src/` re-checked against the 0.31.0 barrel — `AppShell`, `ShortcutsOverlay`,
`Logomark`, `PageHeader`, `PageShell`, `SettingsScaffold`, `SettingsShortcuts`,
`SettingsLinks`, `SettingsColophon`, `useNavHidden`, `CatalogPage` all survive.

**What was passed** — `themeToggle` only, at `src/pages/SettingsPage.jsx`:

```jsx
themeToggle={<ThemeToggle fill="none" tone="sunken" label={false} size="sm" />}
```

**`picker` omitted** — this app has nothing to pick in a masthead. fxr opens a
chrome, r2b2 a bucket; mirror's Settings page selects nothing.

**`onOpenSettings` omitted, deliberately, on the ticket's own point 4.** There is
no settings drawer here. Mirror's display settings are the **Performance tab**,
which sits two rows below the gear in the same page — a gear opening it would be
a second control for a destination already visible, and a gear opening nothing is
worse. The place is reserved for when a drawer is built.

**The Display section is gone, not duplicated.** Its only row was the theme
toggle. Point 2's "that alone makes this page match the other two" is served by
moving the control, not by rendering it twice — fxr keeps a Display section only
because it has other rows in it.

**Verified:** `pnpm build` green; `pnpm lint` 115 errors / 42 warnings, the
repo's standing baseline, unmoved.

**NOT verified on screen.** No dev server ran — the user owns his. This repo is
the first adopter, so the ticket's own warning lands here: the cluster's render
is unchecked by anyone. 🔴 **Needs the user's screen before this goes 🟢.**

## 🟢 CLOSED — 2026-09-01, seen on screen

**The bar in this ledger is "verified by running it". It was run.** Playwright at
390 × 844 against the dev server the user sanctioned, and again at 20:14 on a
production build at the current tier (kol-shell 0.36.0 · kol-theme 0.122.0 ·
kol-component 0.153.0).

The masthead cluster **renders**: the `ThemeToggle` sits right-aligned on the
subtitle's baseline above the rule, `fill="none" tone="sunken" label={false}
size="sm"`, exactly fxr's approved row. `picker` and the gear are absent, which
is the omission this repo argued for and not a defect.

**kol-mirror was the first repo anywhere to adopt this, so the ticket's own
warning — *"Nothing here is screen-verified. The first to adopt is the check"* —
is now served.** That check has been run and it passes.

Shots: `_tmp/2026-09-01-mobile-qa/04-settings-390-shortcuts-18px-columns.png`
(the cluster is the icon at top right; the 18px shortcut columns in that same
frame were a separate defect, filed as `SettingsShortcutsGridColumns` and closed
in kol-shell 0.36.0 the same day).
