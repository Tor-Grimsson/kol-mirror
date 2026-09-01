# Receipt — MediaClientBucketTable → kol-ds-ui

**Filed:** 2026-08-28 · from a kol-mirror session
**State:** 🟢 closed 2026-08-28 · **kol-media-client 0.3.0**

## ↩ RETURNED — 2026-08-28

Closed as **kol-media-client 0.3.0** — `KOL_BUCKETS` exported with the CORS reasoning beside it; `buckets` takes `null` (single, unchanged) | `true` (the table) | an object **merged onto** it, so you override rather than restate and the canonical three passed verbatim merge to exactly themselves; `proxied()` now reads each bucket's `proxy` flag instead of rewriting every CDN host. `r2.proxy` stays `true` — the cache-trap paragraph is in the source above the table, not paraphrased. 8-check self-test: `node packages/media-client/src/index.js`.

Remainder here: bump to 0.3.0 and delete the local `BUCKETS` — pass nothing, `buckets: true`, or only your overrides.

## ✅ REMAINDER DONE — verified 2026-08-30

On **kol-media-client 0.3.2**. `src/hooks/useMediaLibrary.js:26` is
`createMediaClient({ buckets: true })` — the table comes from the package, and
`BUCKET_OPTIONS` is derived from `client.buckets()` rather than restated. No
local `BUCKETS` survives anywhere in `src/`; the only mention left is the
docstring pointing at `KOL_BUCKETS` as the source.

**Remainder here: none.**
