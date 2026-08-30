/**
 * adaptiveScale — the closed-loop decision, pure and dependency-free.
 *
 * Split out from `adaptiveQuality` so it can be exercised by plain node
 * (`node src/hooks/adaptiveScale.test.mjs`). A controller that oscillates is
 * worse than one that never fires, and oscillation is invisible without a test.
 */
export const SCALE_LADDER = [1, 0.75, 0.5, 0.25]

const DROP_AFTER = 2
const RAISE_AFTER = 6

/**
 * The decision, as a pure function so the hysteresis can be exercised
 * (`node src/hooks/adaptiveQuality.test.mjs`) — a controller that oscillates
 * is worse than one that never fires, and that is invisible without a test.
 *
 * @param {{fps:number, jank:number}} stats
 * @param {{target:number, ceiling:number, current:number, bad:number, good:number}} ctl
 * @returns {{scale:number, bad:number, good:number}} next controller state
 */
export function decideScale(stats, ctl) {
  const { target, ceiling, current } = ctl
  let { bad, good } = ctl
  const idx = SCALE_LADDER.indexOf(current)
  const i = idx === -1 ? 0 : idx
  if (!stats.fps) return { scale: current, bad, good }

  const struggling = stats.fps < target - 5 || stats.jank > 2
  const comfortable = stats.fps >= target && stats.jank === 0

  if (struggling) {
    good = 0
    bad += 1
    if (bad >= DROP_AFTER && i < SCALE_LADDER.length - 1) {
      return { scale: SCALE_LADDER[i + 1], bad: 0, good: 0 }
    }
    return { scale: current, bad, good }
  }
  bad = 0
  if (comfortable) {
    good += 1
    const next = SCALE_LADDER[i - 1]
    if (good >= RAISE_AFTER && i > 0 && next <= ceiling) {
      return { scale: next, bad: 0, good: 0 }
    }
    return { scale: current, bad, good }
  }
  return { scale: current, bad, good: 0 }
}
