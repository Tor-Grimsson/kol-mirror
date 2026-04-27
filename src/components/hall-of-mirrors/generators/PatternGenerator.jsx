import { useEffect, useRef } from 'react'

export default function PatternGenerator({
  width = 256,
  height = 256,
  pattern = 'stripes',
  spacing = 20,
  angle = 0,
  duty = 0.5,
  motion = true,
  scrollSpeed = 0,
  color = '#ffffff',
  bgColor = 'transparent',
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
    canvas.width = width
    canvas.height = height

    if (!readyFired.current && onCanvasReadyRef.current) {
      readyFired.current = true
      onCanvasReadyRef.current(canvas)
    }

    const ctx = canvas.getContext('2d')

    const render = (t) => {
      ctx.clearRect(0, 0, width, height)
      if (bgColor && bgColor !== 'transparent') {
        ctx.fillStyle = bgColor
        ctx.fillRect(0, 0, width, height)
      }

      const offset = t * scrollSpeed * 30
      const rad = angle * Math.PI / 180

      ctx.save()
      ctx.translate(width / 2, height / 2)
      ctx.rotate(rad)
      ctx.translate(-width / 2, -height / 2)

      const diag = Math.sqrt(width * width + height * height)
      const ox = (diag - width) / 2
      const oy = (diag - height) / 2

      ctx.fillStyle = color

      if (pattern === 'stripes') {
        const stripeWidth = spacing * duty
        const startX = -ox + ((offset % spacing) + spacing) % spacing
        for (let x = startX; x < width + ox; x += spacing) {
          ctx.fillRect(x, -oy, stripeWidth, height + oy * 2)
        }
      } else if (pattern === 'dots') {
        const radius = (spacing * duty) / 2
        const startX = -ox + ((offset % spacing) + spacing) % spacing
        const startY = -oy + ((offset % spacing) + spacing) % spacing
        for (let x = startX; x < width + ox; x += spacing) {
          for (let y = startY; y < height + oy; y += spacing) {
            ctx.beginPath()
            ctx.arc(x, y, radius, 0, Math.PI * 2)
            ctx.fill()
          }
        }
      } else if (pattern === 'checker') {
        const cell = spacing
        const startX = -ox + ((offset % (cell * 2)) + cell * 2) % (cell * 2)
        const startY = -oy + ((offset % (cell * 2)) + cell * 2) % (cell * 2)
        for (let x = startX; x < width + ox; x += cell) {
          for (let y = startY; y < height + oy; y += cell) {
            const col = Math.floor((x - startX) / cell)
            const row = Math.floor((y - startY) / cell)
            if ((col + row) % 2 === 0) {
              ctx.fillRect(x, y, cell * duty, cell * duty)
            }
          }
        }
      }

      ctx.restore()
    }

    if (!animate || !motion || scrollSpeed === 0) {
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
  }, [width, height, pattern, spacing, angle, duty, motion, scrollSpeed, color, bgColor, animate])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0"
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  )
}
