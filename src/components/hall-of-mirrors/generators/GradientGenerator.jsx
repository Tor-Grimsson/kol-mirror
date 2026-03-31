import { useEffect, useRef } from 'react'

export default function GradientGenerator({
  width = 256,
  height = 256,
  type = 'linear',
  angle = 0,
  speed = 1,
  colors = ['#000000', '#ffffff'],
  animate = true,
  onCanvasReady,
}) {
  const canvasRef = useRef(null)
  const rafRef = useRef(null)
  const readyFired = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = width
    canvas.height = height

    if (!readyFired.current && onCanvasReady) {
      readyFired.current = true
      onCanvasReady(canvas)
    }

    const ctx = canvas.getContext('2d')
    let t = 0
    const safeColors = colors && colors.length >= 2 ? colors : ['#000000', '#ffffff']

    const render = () => {
      const offset = t * speed * 0.02
      let gradient

      if (type === 'radial') {
        const cx = width / 2
        const cy = height / 2
        const r = Math.max(width, height) * 0.7
        gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
      } else if (type === 'conic' && typeof ctx.createConicGradient === 'function') {
        const rad = ((angle + offset * 360) % 360) * Math.PI / 180
        gradient = ctx.createConicGradient(rad, width / 2, height / 2)
      } else {
        // linear
        const rad = ((angle + offset * 360) % 360) * Math.PI / 180
        const len = Math.max(width, height)
        const cx = width / 2
        const cy = height / 2
        const dx = Math.cos(rad) * len
        const dy = Math.sin(rad) * len
        gradient = ctx.createLinearGradient(cx - dx, cy - dy, cx + dx, cy + dy)
      }

      for (let i = 0; i < safeColors.length; i++) {
        const stop = i / (safeColors.length - 1)
        // Shift stops for animation
        const shifted = (stop + offset) % 1
        gradient.addColorStop(shifted, safeColors[i])
      }

      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)
    }

    if (!animate) {
      render()
      return
    }

    const tick = () => {
      t += 0.016
      render()
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [width, height, type, angle, speed, colors, animate, onCanvasReady])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0"
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  )
}
