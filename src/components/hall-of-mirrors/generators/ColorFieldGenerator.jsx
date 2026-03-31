import { useEffect, useRef } from 'react'

function hexToHsl(hex) {
  let r = parseInt(hex.slice(1, 3), 16) / 255
  let g = parseInt(hex.slice(3, 5), 16) / 255
  let b = parseInt(hex.slice(5, 7), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0, s = 0, l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
    else if (max === g) h = ((b - r) / d + 2) / 6
    else h = ((r - g) / d + 4) / 6
  }
  return [h * 360, s * 100, l * 100]
}

export default function ColorFieldGenerator({
  width = 256,
  height = 256,
  color = '#ff0000',
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

    if (!animate) {
      ctx.fillStyle = color
      ctx.fillRect(0, 0, width, height)
      return
    }

    let [baseH, baseS, baseL] = [0, 100, 50]
    try {
      ;[baseH, baseS, baseL] = hexToHsl(color)
    } catch { /* use defaults */ }

    let t = 0
    const tick = () => {
      t += 0.016
      // Cycle hue and pulse lightness
      const h = (baseH + t * 30) % 360
      const l = baseL + Math.sin(t * 2) * 15
      ctx.fillStyle = `hsl(${h}, ${baseS}%, ${Math.max(0, Math.min(100, l))}%)`
      ctx.fillRect(0, 0, width, height)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [width, height, color, animate, onCanvasReady])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0"
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  )
}
