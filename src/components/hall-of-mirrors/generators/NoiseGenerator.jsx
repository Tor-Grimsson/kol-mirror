import { useEffect, useRef } from 'react'

// Simple hash-based value noise — no external dependencies
function hash(x, y) {
  let h = (x * 374761393 + y * 668265263 + 1274126177) | 0
  h = Math.imul(h ^ (h >>> 13), 1103515245)
  h = h ^ (h >>> 16)
  return (h & 0x7fffffff) / 0x7fffffff
}

function smoothstep(t) {
  return t * t * (3 - 2 * t)
}

function valueNoise(x, y) {
  const ix = Math.floor(x)
  const iy = Math.floor(y)
  const fx = x - ix
  const fy = y - iy
  const sx = smoothstep(fx)
  const sy = smoothstep(fy)

  const n00 = hash(ix, iy)
  const n10 = hash(ix + 1, iy)
  const n01 = hash(ix, iy + 1)
  const n11 = hash(ix + 1, iy + 1)

  const nx0 = n00 + sx * (n10 - n00)
  const nx1 = n01 + sx * (n11 - n01)
  return nx0 + sy * (nx1 - nx0)
}

function fbm(x, y, octaves) {
  let value = 0
  let amplitude = 1
  let frequency = 1
  let maxValue = 0
  for (let i = 0; i < octaves; i++) {
    value += valueNoise(x * frequency, y * frequency) * amplitude
    maxValue += amplitude
    amplitude *= 0.5
    frequency *= 2
  }
  return value / maxValue
}

export default function NoiseGenerator({
  width = 256,
  height = 256,
  scale = 20,
  speed = 1,
  octaves = 3,
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
    const imageData = ctx.createImageData(width, height)
    const data = imageData.data
    let t = 0

    const render = () => {
      const invScale = 1 / scale
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const nx = x * invScale + t * speed
          const ny = y * invScale + t * speed
          const v = fbm(nx, ny, octaves)
          const c = (v * 255) | 0
          const idx = (y * width + x) * 4
          data[idx] = c
          data[idx + 1] = c
          data[idx + 2] = c
          data[idx + 3] = 255
        }
      }
      ctx.putImageData(imageData, 0, 0)
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
  }, [width, height, scale, speed, octaves, animate, onCanvasReady])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0"
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  )
}
