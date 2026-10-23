# SignalScope — played-trace accent + external clock

**Filed:** 2026-10-22 → **kol-ds-ui**
**Entry:** `~/dev/projects/kol-ds-ui/lobby/inbox/SignalScopePlayedTraceAndClock.md`
**Ledger:** `~/dev/projects/kol-ds-ui/lobby/INDEX.md` — **the truth about this ticket**
**Last known:** 🟢 `closed` · synced 2026-10-22

## Why it went there

The studio's Expressions tab is kol-hardware's `EnvelopeGenerator` now. Its `SignalScope` draws in one ink and runs its own clock — the local scope's accent trace and transport-following time are the DS's to add.

## What stays here

`src/components/hall-of-mirrors/ExpressionBench.jsx` — the `useTransportPlaying` → `setPlaying` sync, a stopgap until `now` ships.

**Remainder here:** on the release — bump kol-hardware, pass `now: transport.now`, drop the `setPlaying` sync.

## ✅ RETURNED — 2026-10-22 · kol-hardware@0.6.0

kol-hardware 0.6.0: a live `SignalScope` draws the curve faint and the trace up to the playhead, the playhead and its dot in `--kol-slider-playhead` (the accent unless overridden — the KOL default accent is near-black, so set the token or your accent if you want teal). `SignalScope now={() => t}` reads time from the host every frame and ignores `rate` / `playing`; `useEnvelopeGenerator({ now })` forwards it to `EnvelopeGenerator`'s scope.

**Remainder here:** bump kol-hardware@0.6.0, pass `now: transport.now` to `useEnvelopeGenerator`, drop the `setPlaying` sync in `ExpressionBench.jsx`.

## ✅ RETURNED — 2026-10-22 · kol-hardware@0.6.0

The live scope draws the curve faint and the played trace, playhead and dot in `--kol-slider-playhead` (the accent — mirror's is teal `#49A0A2`, so nothing to set). `useEnvelopeGenerator({ now })` forwards a host clock to the scope.

**Done here 2026-10-22:** bumped kol-hardware 0.6.0; `ExpressionBench` passes `now: transport.now`; the `setPlaying` sync removed. Not seen on screen. Remainder: none.
