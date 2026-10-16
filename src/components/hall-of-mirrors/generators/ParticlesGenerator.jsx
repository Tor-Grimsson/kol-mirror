import { useEffect, useRef } from 'react'
import { internalSize } from './size'
import { transport } from '../../../hooks/transport'

/**
 * ParticlesGenerator — the fourth generator type (user 2026-10-15: *"I also
 * think we need a particle generator, seperate from the pattern color
 * generator … 4 generators? band/pattern, color/gradient, noise/texture,
 * particles?"*).
 *
 * A field of points that drift, fall and wrap. Every other generator here is a
 * per-pixel function; this one is per-PARTICLE, so its cost scales with COUNT,
 * not with the buffer, and the trail is one translucent fill of the background
 * per frame rather than a pixel loop.
 *
 * Same housekeeping as its siblings: an internal buffer, `transport`-gated
 * motion, accumulated time so a parameter change mid-play never resets the
 * field, and paused still draws its current frame.
 */

/* Dots have hard edges, but they are drawn as vectors, so the buffer does not
   have to be the canvas — 768 keeps them crisp at a fraction of the fill cost. */
const PARTICLES_MAX = 768

/* Deterministic positions: the same COUNT gives the same field, so a saved
   patch reopens on the frame it was saved on rather than a fresh scatter. */
function seeded(i, k) {
  /* an integer hash, not the sin() one-liner — that one correlates neighbours,
     and the field came out in visible pairs */
  let h = Math.imul(i + 1, 0x9e3779b1) ^ Math.imul(k + 1, 0x85ebca77)
  h = Math.imul(h ^ (h >>> 16), 0x7feb352d)
  h = Math.imul(h ^ (h >>> 15), 0x846ca68b)
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296
}

function hexToRgb(hex) {
  const h = (hex || '#ffffff').replace('#', '')
  return [parseInt(h.substring(0, 2), 16) || 0, parseInt(h.substring(2, 4), 16) || 0, parseInt(h.substring(4, 6), 16) || 0]
}

export default function ParticlesGenerator({
  width,
  height,
  count = 400,
  size = 2,
  speed = 1,
  drift = 30,
  gravity = 0,
  trail = 40,
  color = '#ffffff',
  bgColor = '#000000',
  motion = false,
  animate = true,
  onCanvasReady,
}) {
  const canvasRef = useRef(null)
  const rafRef = useRef(null)
  const readyFired = useRef(false)
  const tRef = useRef(0)
  const lastRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const [iw, ih] = internalSize(width, height, PARTICLES_MAX)
    canvas.width = iw
    canvas.height = ih
    const ctx = canvas.getContext('2d')

    if (!readyFired.current && onCanvasReady) {
      readyFired.current = true
      onCanvasReady(canvas)
    }

    const n = Math.max(1, Math.min(4000, Math.round(count)))
    const [br, bg, bb] = hexToRgb(bgColor)
    const fade = Math.max(0.02, 1 - Math.min(0.98, trail / 100))
    const r = Math.max(0.5, size * (iw / 512))
    const swirl = drift / 100
    const fall = gravity / 100

    /* A particle is a seed: its position at time t is computed, not stepped, so
       it never accumulates error and a scrub of the clock lands exactly. */
    const at = (i, t) => {
      const sx = seeded(i, 1)
      const sy = seeded(i, 2)
      const vx = (seeded(i, 3) - 0.5) * 0.08
      const vy = (seeded(i, 4) - 0.5) * 0.08 + fall * 0.12
      const ph = seeded(i, 5) * Math.PI * 2
      const wob = Math.sin(t * 0.7 + ph) * swirl * 0.04
      const x = sx + vx * t + wob
      const y = sy + vy * t + Math.cos(t * 0.5 + ph) * swirl * 0.04
      return [((x % 1) + 1) % 1 * iw, ((y % 1) + 1) % 1 * ih]
    }

    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, iw, ih)

    const draw = (now) => {
      rafRef.current = requestAnimationFrame(draw)
      const dt = lastRef.current ? Math.min(0.1, (now - lastRef.current) / 1000) : 0
      lastRef.current = now
      const running = animate && motion && transport.playing
      if (running) tRef.current += dt * speed
      const t = tRef.current

      /* the trail: the background laid over the last frame at `fade` — at rest
         it is a full clear, so a paused field is a clean still */
      ctx.fillStyle = `rgba(${br},${bg},${bb},${running ? fade : 1})`
      ctx.fillRect(0, 0, iw, ih)
      ctx.fillStyle = color
      ctx.beginPath()
      for (let i = 0; i < n; i++) {
        const [x, y] = at(i, t)
        ctx.moveTo(x + r, y)
        ctx.arc(x, y, r, 0, Math.PI * 2)
      }
      ctx.fill()
    }

    rafRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafRef.current)
  }, [width, height, count, size, speed, drift, gravity, trail, color, bgColor, motion, animate, onCanvasReady])

  return (
    <div className="absolute inset-0">
      <canvas ref={canvasRef} className="w-full h-full" style={{ objectFit: 'cover', display: 'block' }} />
    </div>
  )
}
