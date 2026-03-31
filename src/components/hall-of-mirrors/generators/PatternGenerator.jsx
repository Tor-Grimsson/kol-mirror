import { useEffect, useRef } from 'react'

export default function PatternGenerator({
  width = 256,
  height = 256,
  pattern = 'stripes',
  spacing = 20,
  angle = 0,
  duty = 0.5,
  speed = 1,
  color = '#ffffff',
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

    const render = () => {
      ctx.clearRect(0, 0, width, height)
      const offset = t * speed * 30
      const rad = angle * Math.PI / 180

      ctx.save()
      ctx.translate(width / 2, height / 2)
      ctx.rotate(rad)
      ctx.translate(-width / 2, -height / 2)

      // Expand draw area to cover rotated canvas
      const diag = Math.sqrt(width * width + height * height)
      const ox = (diag - width) / 2
      const oy = (diag - height) / 2

      ctx.fillStyle = color

      if (pattern === 'stripes') {
        const stripeWidth = spacing * duty
        const startX = -ox + (offset % spacing)
        for (let x = startX; x < width + ox; x += spacing) {
          ctx.fillRect(x, -oy, stripeWidth, height + oy * 2)
        }
      } else if (pattern === 'dots') {
        const radius = (spacing * duty) / 2
        const startX = -ox + (offset % spacing)
        const startY = -oy + (offset % spacing)
        for (let x = startX; x < width + ox; x += spacing) {
          for (let y = startY; y < height + oy; y += spacing) {
            ctx.beginPath()
            ctx.arc(x, y, radius, 0, Math.PI * 2)
            ctx.fill()
          }
        }
      } else if (pattern === 'checker') {
        const cellW = spacing
        const cellH = spacing
        const startX = -ox + (offset % (cellW * 2))
        const startY = -oy + (offset % (cellH * 2))
        for (let x = startX; x < width + ox; x += cellW) {
          for (let y = startY; y < height + oy; y += cellH) {
            const col = Math.floor((x - startX) / cellW)
            const row = Math.floor((y - startY) / cellH)
            if ((col + row) % 2 === 0) {
              ctx.fillRect(x, y, cellW * duty, cellH * duty)
            }
          }
        }
      }

      ctx.restore()
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
  }, [width, height, pattern, spacing, angle, duty, speed, color, animate, onCanvasReady])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0"
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  )
}
