# AppIdentitySet → kol-ds-ui

**Filed:** 2026-10-28 · 🟢 `closed` 2026-10-28 · 📌 remainder here · ticket `~/dev/projects/kol-ds-ui/lobby/inbox/AppIdentitySet.md`

The KOL owns every app's tile, touch icons, favicon and OG card as one set: drawn and reviewed side by side in `apps/identity`, shipped in kol-icons. Mirror's `glitch-0-fill` (2026-10-26) still reads small next to FXR and MON. It stays live until the set ships.

**Remainder here:** on the release, bump kol-icons, point `scripts/generate-icons.mjs` (`pnpm icons`) at Mirror's set in the package instead of drawing it, retire the local tile sources to `_tmp/`, and re-add the web clip on the phone.


## ✅ CLOSED in kol-ds-ui — 2026-10-28

Shipped kol-icons 0.50.0 · kol-component 0.308.0 · kol-shell 0.84.0 · kol-framework 0.60.0 · kol-brand 0.2.0. Mirror's set is kol-icons `identity/mirror/` (icon, logomark, wordmark, favicon, app icon dark + light, the PNGs, `og.png` — every PNG pixel-identical to what `pnpm icons` renders here today). The family and Mirror's own page are on `apps/identity` (ui.kolkrabbi.io/apps/identity); the two rows `glitch-0-fill` and `mir-fxr-i0.35` are there for his pick, which lands in the package, not here. Resolution: `kol-ds-ui/lobby/done/AppIdentitySet.md`.

**Remainder here:** 📌 bump to kol-icons ≥0.50.0; replace `scripts/generate-icons.mjs` with the copy from the package (kol-ds-ui `docs/operations/07-apps-tier/10-save-to-home-screen.md` step 3, `ID = 'mirror'`, `og.png` → `public/og/mirror.png`); retire the generator, the local app-icon and wordmark sources and `sharp` to `_tmp/`; re-add the web clip on the phone.

**Remainder done 2026-10-28 (part):** kol-icons 0.51.0; `scripts/icons.mjs` (playbook § 3, `ID = 'mirror'`) replaces `generate-icons.mjs`; the generator, `apple-touch-icon-dark.svg`, `svg/wordmark.svg`, `og/mirror.svg` and the pre-copy PNGs are in `_tmp/2026-10-28-icons-from-package/`; `sharp` removed; the manifest's SVG icon entry dropped (the playbook's manifest has none). Copied PNGs look the same as before. **Still owed:** re-add the web clip on the phone after deploy, and the user's tile pick on `apps/identity`.
