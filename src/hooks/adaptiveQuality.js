import { useEffect } from 'react'
import { subscribeStats, getStats, setStatsConsumer } from './renderStats'
import { getQuality, setQuality } from './renderQuality'
import { decideScale } from './adaptiveScale'

/**
 * adaptiveQuality — the closed loop.
 *
 * imweb has three perf meters and a colour-coded VRAM budget, but nothing ever
 * feeds a measurement back into rendering: every quality tier there is chosen
 * by hand. This is the part worth doing better. When it is on, the measured
 * frame rate drives the render scale down a fixed ladder until frames are
 * being met, then walks it back up when there is headroom.
 *
 * The decision itself lives in `adaptiveScale.js` (pure, tested).
 *
 * Rules that keep it from being annoying:
 *  - The user's `scale` is a CEILING, never overwritten — auto only goes below.
 *  - Asymmetric hysteresis: drop fast (2 bad windows), recover slow (6 good
 *    ones). A loop that raises quality as eagerly as it lowers it oscillates,
 *    and oscillation reads worse than being one rung too low.
 *  - `jank` counts too. A 58fps average with stalls is a worse experience than
 *    a steady 52, and only the percentile catches that.
 */
let bad = 0
let good = 0

function step(stats) {
  const q = getQuality()
  if (!q.adaptive) { bad = 0; good = 0; return }
  const ceiling = q.scale ?? 1
  const current = q.autoScale ?? ceiling
  const out = decideScale(stats, { target: q.targetFps || 55, ceiling, current, bad, good })
  bad = out.bad
  good = out.good
  if (out.scale !== current) setQuality({ autoScale: out.scale })
}

/** Mount once, at the app root. Inert until `adaptive` is switched on. */
export function useAdaptiveQuality() {
  useEffect(() => {
    let attached = false
    const sync = () => {
      const want = !!getQuality().adaptive
      if (want === attached) return
      attached = want
      setStatsConsumer('adaptive', want)
      if (!want) { bad = 0; good = 0; setQuality({ autoScale: null }) }
    }
    sync()
    const offStats = subscribeStats(() => { sync(); step(getStats()) })
    return () => { offStats(); setStatsConsumer('adaptive', false) }
  }, [])
}
