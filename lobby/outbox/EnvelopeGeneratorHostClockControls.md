# EnvelopeGenerator — hide the clock controls when the host owns the clock

**Filed:** 2026-10-22 → **kol-ds-ui**
**Entry:** `~/dev/projects/kol-ds-ui/lobby/inbox/EnvelopeGeneratorHostClockControls.md`
**Ledger:** `~/dev/projects/kol-ds-ui/lobby/INDEX.md` — **the truth about this ticket**
**Last known:** 🟢 `closed` · synced 2026-10-22

## Why it went there

The studio's Expressions tab passes `now: transport.now`; the scope follows the desk, but the DS still draws its own Play/Pause and BPM, which do nothing now. The row is the component's.

## What stays here

Nothing — `ExpressionBench.jsx` already passes `now`.

**Remainder here:** on the release — bump kol-hardware and look at the Expressions tab.

## ✅ RETURNED — 2026-10-22 · kol-hardware@0.6.1

kol-hardware 0.6.1: with `now`, EnvelopeGenerator’s transport row draws no Play/Pause, BPM or Trigger. Cycle stays — it still wraps or holds the host’s time over the pass.

**Remainder here:** bump kol-hardware@0.6.1.

## ✅ RETURNED — 2026-10-22 · kol-hardware@0.6.1

With `now` the row draws no Play/Pause, BPM or Trigger; cycle stays.

**Done here 2026-10-22:** bumped kol-hardware 0.6.1; seen on screen — Equation shows no Play/Pause or BPM, ADSR shows cycle and the pass length only, 0 console errors. Remainder: none.
