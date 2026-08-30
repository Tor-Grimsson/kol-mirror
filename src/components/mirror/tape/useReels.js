import { useEffect, useRef, useState } from 'react'
import { useTransportPlaying } from '../../../hooks/transport'

/**
 * useReels — the physics every deck on /tape shares, and the only thing they
 * share. `wound` runs the pass down and wraps; each reel's angular speed is
 * ω = v / r, so the emptying reel accelerates as the filling one slows.
 *
 * Angles go straight to the DOM every frame; the pack radius is React's at 4Hz,
 * because it changes over minutes and re-rendering it at 60fps is waste.
 *
 * Its own file so `decks.jsx` exports components only (react-refresh).
 */
export function useReels({ speed = 1, hub = 0.28 } = {}) {
  const playing = useTransportPlaying()
  const a = useRef(null)
  const b = useRef(null)
  const st = useRef({ wound: 0.9, aL: 0, aR: 0 })
  const [wound, setWound] = useState(0.9)

  useEffect(() => {
    let raf
    let last = 0
    const tick = (ts) => {
      const dt = last ? Math.min((ts - last) / 1000, 0.1) : 0
      last = ts
      const s = st.current
      if (playing) {
        s.wound = (s.wound - dt / 240 + 1) % 1
        const r = (f) => hub + f * (1 - hub)
        s.aL += (speed * 90 / r(s.wound)) * dt
        s.aR += (speed * 90 / r(1 - s.wound)) * dt
      }
      a.current?.setAttribute('transform', `rotate(${s.aL} 50 50)`)
      b.current?.setAttribute('transform', `rotate(${s.aR} 50 50)`)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [playing, speed, hub])

  useEffect(() => {
    const id = setInterval(() => setWound(st.current.wound), 250)
    return () => clearInterval(id)
  }, [])

  return { playing, a, b, wound }
}
