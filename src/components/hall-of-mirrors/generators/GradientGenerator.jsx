import { useEffect, useRef } from 'react'
import { internalSize, SMOOTH_MAX } from './size'

export default function GradientGenerator({
  width = 256,
  height = 256,
  type = 'linear',
  angle = 0,
  motion = true,
  rotateSpeed = 0,
  cycleSpeed = 0,
  color1 = '#000000',
  color2 = '#ff00ff',
  color3 = '#ffffff',
  radialRadius = 70,
  animate = true,
  onCanvasReady,
}) {
  const canvasRef = useRef(null)
  const rafRef = useRef(null)
  const readyFired = useRef(false)
  const tRef = useRef(0)
  const onCanvasReadyRef = useRef(onCanvasReady)
  useEffect(() => { onCanvasReadyRef.current = onCanvasReady })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    // Internal resolution, not canvas resolution — a gradient is smooth by definition.
    const [iw, ih] = internalSize(width, height, SMOOTH_MAX)
    canvas.width = iw
    canvas.height = ih

    if (!readyFired.current && onCanvasReadyRef.current) {
      readyFired.current = true
      onCanvasReadyRef.current(canvas)
    }

    const ctx = canvas.getContext('2d')
    /* Draw in LOGICAL (canvas) coordinates into the smaller internal buffer:
       one transform instead of rewriting every width/height in the draw code.
       Set after the size assignment, which resets context state. */
    ctx.setTransform(iw / Math.max(1, width), 0, 0, ih / Math.max(1, height), 0, 0)
    const stops = [color1, color2, color3]

    const render = (t) => {
      const rotateOffset = t * rotateSpeed
      const cycleOffset = t * cycleSpeed
      let gradient

      if (type === 'radial') {
        const cx = width / 2
        const cy = height / 2
        const r = Math.max(width, height) * (radialRadius / 100)
        gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
      } else if (type === 'conic' && typeof ctx.createConicGradient === 'function') {
        const rad = ((angle + rotateOffset) % 360) * Math.PI / 180
        gradient = ctx.createConicGradient(rad, width / 2, height / 2)
      } else {
        const rad = ((angle + rotateOffset) % 360) * Math.PI / 180
        const len = Math.max(width, height)
        const cx = width / 2
        const cy = height / 2
        const dx = Math.cos(rad) * len
        const dy = Math.sin(rad) * len
        gradient = ctx.createLinearGradient(cx - dx, cy - dy, cx + dx, cy + dy)
      }

      const N = stops.length
      for (let i = 0; i < N; i++) {
        const base = i / (N - 1)
        let pos = base + cycleOffset
        pos = ((pos % 1) + 1) % 1
        gradient.addColorStop(pos, stops[i])
      }

      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)
    }

    if (!animate || !motion || (rotateSpeed === 0 && cycleSpeed === 0)) {
      render(tRef.current)
      return
    }

    let t = tRef.current
    const tick = () => {
      t += 0.016
      tRef.current = t
      render(t)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [width, height, type, angle, motion, rotateSpeed, cycleSpeed, color1, color2, color3, radialRadius, animate])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0"
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  )
}
