/** Run: node src/hooks/adaptiveQuality.test.mjs */
import assert from 'node:assert/strict'
import { decideScale, SCALE_LADDER } from './adaptiveScale.js'

const run = (windows, start = { target: 55, ceiling: 1, current: 1, bad: 0, good: 0 }) => {
  let ctl = start
  for (const w of windows) {
    const out = decideScale(w, ctl)
    ctl = { ...ctl, current: out.scale, bad: out.bad, good: out.good }
  }
  return ctl.current
}
const slow = { fps: 30, jank: 4 }
const fast = { fps: 60, jank: 0 }
const okish = { fps: 52, jank: 1 }   // below target but not struggling

// Drop needs TWO bad windows — one hitch must not change quality.
assert.equal(run([slow]), 1, 'a single bad window does not drop')
assert.equal(run([slow, slow]), 0.75, 'two bad windows drop one rung')
assert.equal(run([slow, slow, slow, slow]), 0.5, 'it keeps stepping down while struggling')
assert.equal(run(Array(20).fill(slow)), 0.25, 'it stops at the bottom of the ladder, does not run off')

// Recovery is slower than the drop, or it oscillates.
assert.equal(run([fast, fast, fast, fast, fast]), 1, 'already at ceiling, nothing to raise')
{
  const low = { target: 55, ceiling: 1, current: 0.5, bad: 0, good: 0 }
  assert.equal(run(Array(5).fill(fast), low), 0.5, 'five good windows is not yet enough to raise')
  assert.equal(run(Array(6).fill(fast), low), 0.75, 'six good windows raises exactly one rung')
}

// The user's setting is a ceiling the loop may never exceed.
{
  const capped = { target: 55, ceiling: 0.5, current: 0.5, bad: 0, good: 0 }
  assert.equal(run(Array(30).fill(fast), capped), 0.5, 'never climbs past the user ceiling')
}

// A good window must cancel accrued badness, and vice versa — no drift.
assert.equal(run([slow, fast, slow]), 1, 'a good window resets the bad counter')
{
  const low = { target: 55, ceiling: 1, current: 0.5, bad: 0, good: 0 }
  assert.equal(run([fast, fast, fast, slow, fast, fast, fast], low), 0.5, 'a bad window resets the good counter')
}

// Middling frames hold steady — neither struggling nor comfortable.
assert.equal(run(Array(20).fill(okish)), 1, 'in-between frames never move the scale')

// Jank alone is enough to act on, even at a healthy average.
assert.equal(run([{ fps: 58, jank: 5 }, { fps: 58, jank: 5 }]), 0.75, 'stalls count even when the average looks fine')

// No measurement yet = no action.
assert.equal(run([{ fps: 0, jank: 0 }, { fps: 0, jank: 0 }]), 1, 'no data, no change')

assert.deepEqual(SCALE_LADDER, [1, 0.75, 0.5, 0.25])
console.log('adaptiveScale: all checks passed')
