# Bump `kol-media-client` to 0.4.1 — the media API is on `media.kolkrabbi.io`

**Staged:** 2026-10-06 · from a kol-website session
**Change:** one dependency bump and a redeploy

---

## The problem, in one case

The media admin has **one hostname** since 2026-10-05 (user ruling): `media.kolkrabbi.io`. The
old `admin.kolkrabbi.io` only 301s there, and it is detached once nothing calls it.

This repo pins `@kolkrabbi/kol-media-client` at **0.3.2**, whose default `adminBase` is
`https://admin.kolkrabbi.io`; the live bundle at `mirror.kolkrabbi.io` calls it
(measured 2026-10-06). It works through the redirect today and stops working the day `admin.`
is detached. `kol-media-client` **0.4.1** defaults to `media.` (kol-ds-ui
`media-client-admin-base-is-media`, published 2026-10-06; `listMedia()` answers 433 items).

## The fix

Bump `@kolkrabbi/kol-media-client` to `0.4.1`, redeploy. If this repo passes `adminBase`
explicitly anywhere, make it `https://media.kolkrabbi.io` or drop it.

## Rejected alternative

Keeping `admin.` attached as a permanent redirect — a second hostname by another name.

## Definition of done

- [ ] `kol-media-client` 0.4.1 installed; no `admin.kolkrabbi.io` in the source or the built bundle
- [ ] deployed; the live bundle names `media.kolkrabbi.io`
- [ ] receipt returned to kol-website, which then detaches `admin.`

---

## Resolution — 2026-10-13 · 🟠 `addressed`

**Taken on the MBP, in the hub-adoption sitting** (`.kol/llm-plan/07-hub-adoption.md` §3).

- [x] `kol-media-client` **0.6.0** installed (0.4.1 and 0.5.0 were superseded on the registry by
  the time this repo bumped; 0.6.0's default `adminBase` is `https://media.kolkrabbi.io`,
  `node_modules/@kolkrabbi/kol-media-client/src/index.js:32`). `package.json` pins it exact.
- [x] No `admin.kolkrabbi.io` in the source or the built bundle — `grep -rn admin.kolkrabbi src
  dist/assets/*.js` is empty after `pnpm build` (2026-10-13 22:20 GMT). The one mention was a doc
  comment in `src/hooks/useMediaLibrary.js:7`; it names `media.` now, and the adoption note there
  records 0.6.0. Nothing passes `adminBase`, so the package default is the whole configuration.
- [ ] Deployed — the live bundle at `mirror.kolkrabbi.io` names `media.` once this tree is pushed.
  The push is the user's.
- [ ] Receipt to kol-website (`~/dev/projects/kol-website/lobby/outbox/media-client-0-4-1-api-on-media--kol-mirror.md`)
  — written at 🟢, same turn, with the remainder named: kol-website detaches `admin.` once
  kol-fxr's sibling returns too.

🟢 is the deploy. The build is green on the new tier (component 0.257.0 · shell 0.63.0 · theme
0.173.0 · framework 0.49.0 · icons 0.37.0).

## Resolution — 2026-10-15 · 🟢 `closed`

Closed on the user's ruling: irrelevant. The source side already shipped (kol-media-client 0.6.0, `media.` only, nothing passes `adminBase`); the deploy is the user's push.
