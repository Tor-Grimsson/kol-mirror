# TransportAndTimeline → kol-ds-ui

**Filed:** 2026-10-28 · 🟢 `closed` 2026-10-28 · 📌 remainder here · ticket `~/dev/projects/kol-ds-ui/lobby/inbox/TransportAndTimeline.md`

One KOL transport + timeline (scrub, playhead, loop window), upstreaming fxr's pair; Mirror drops its own.

**Remainder here:** on the release, `hooks/transport.js` and `TimeStrip.jsx` give way to the KOL transport + timeline; check Space, the `B` strip and the Transport scrubber.


## ✅ CLOSED in kol-ds-ui — 2026-10-28

Shipped kol-hardware 0.8.0. `createTransport()` in `@kolkrabbi/kol-hardware/signal` — your clock, verbatim, as a factory, with fxr's `phase()` · `epoch` · `setLoopSeconds` and `seekToSeconds` for a scrubber (checked in `signal.test.mjs`); `TimeStrip` and `Scrubber` (your strip, taking the `transport`; `children` under the bar for fxr's lanes) and `useTransport` · `useTransportPlaying` · `useTransportNow`. Walked in the showcase: play moves the head, a scrub moves it and leaves the clock paused. Resolution: `kol-ds-ui/lobby/done/TransportAndTimeline.md`.

**Remainder here:** 📌 bump; `src/hooks/transport.js` becomes `export const transport = createTransport()` (keep `useTransport` as a one-line wrapper over the DS hook or import the DS's with `transport`); `TimeStrip.jsx` → the DS's `TimeStrip` / `Scrubber` with `transport={transport}`, the local file to `_tmp/`.

## ✅ RETURNED — 2026-10-28

🟢 `closed` in **kol-ds-ui** — **kol-hardware 0.8.0**. Resolution: `~/dev/projects/kol-ds-ui/lobby/done/TransportAndTimeline.md`.

**Remainder done 2026-10-28:** kol-hardware 0.8.0 bumped; `hooks/transport.js` is one `createTransport()` instance with the KOL hooks bound to it (20 importers unchanged); the `B` strip and the Transport scrubber are kol-hardware `TimeStrip` / `Scrubber`. Local clock + `TimeStrip.jsx` in `_tmp/2026-10-28-plan19/`. Checked: Space plays, the strip shows the loop window and IN, a scrub moves the head and leaves the clock paused. **Remainder here: none.**
