import { useEffect, useRef } from 'react'

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

function hexToRgb(hex) {
  const h = hex.startsWith('#') ? hex.slice(1) : hex
  const r = parseInt(h.substring(0, 2), 16) || 0
  const g = parseInt(h.substring(2, 4), 16) || 0
  const b = parseInt(h.substring(4, 6), 16) || 0
  return [r, g, b]
}

function panForDirection(direction, t) {
  const k = 3
  switch (direction) {
    case 'left':   return [-t * k, 0]
    case 'right':  return [t * k, 0]
    case 'up':     return [0, -t * k]
    case 'down':   return [0, t * k]
    case 'drift':  return [Math.cos(t * 1.5) * 4, Math.sin(t * 1.5) * 4]
    case 'evolve':
    default:       return [0, 0]
  }
}

export default function NoiseGenerator({
  width = 256,
  height = 256,
  noiseType = 'smooth',
  scale = 20,
  detail = 3,
  brightness = 0,
  contrast = 100,
  motion = true,
  speed = 1,
  direction = 'evolve',
  colorMode = 'mono',
  fgColor = '#ffffff',
  bgColor = '#000000',
  animate = true,
  onCanvasReady,
}) {
  const canvasRef = useRef(null)
  const rafRef = useRef(null)
  const readyFired = useRef(false)
  const tRef = useRef(0)
  const onCanvasReadyRef = useRef(onCanvasReady)
  useEffect(() => { onCanvasReadyRef.current = onCanvasReady })

  const INTERNAL_MAX = 384
  const ratio = Math.min(1, INTERNAL_MAX / Math.max(width, height, 1))
  const w = Math.max(64, Math.round(width * ratio))
  const h = Math.max(64, Math.round(height * ratio))

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = w
    canvas.height = h

    if (!readyFired.current && onCanvasReadyRef.current) {
      readyFired.current = true
      onCanvasReadyRef.current(canvas)
    }

    const ctx = canvas.getContext('2d')
    const imageData = ctx.createImageData(w, h)
    const data = imageData.data
    const [fgR, fgG, fgB] = hexToRgb(fgColor)
    const [bgR, bgG, bgB] = hexToRgb(bgColor)
    const contrastFactor = contrast / 100
    const brightnessOffset = brightness / 100

    const adjust = (v) => {
      v = (v - 0.5) * contrastFactor + 0.5 + brightnessOffset
      return Math.max(0, Math.min(1, v))
    }

    const render = (t) => {
      const tEff = t * speed
      const [dx, dy] = panForDirection(direction, tEff)
      const morphPhase = (Math.sin(tEff * 3) + 1) * 0.5

      if (noiseType === 'snow') {
        const frame = Math.floor(t * speed * 60)
        const chunk = Math.max(1, Math.round(scale / 10))
        const oxFrame = frame * 7919
        const oyFrame = frame * 6151
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const xi = Math.floor((x + dx) / chunk)
            const yi = Math.floor((y + dy) / chunk)
            const idx = (y * w + x) * 4
            if (colorMode === 'color') {
              const vR = adjust(hash(xi + oxFrame, yi + oyFrame))
              const vG = adjust(hash(xi + oxFrame + 5021, yi + oyFrame + 4093))
              const vB = adjust(hash(xi + oxFrame + 3019, yi + oyFrame + 2027))
              data[idx] = (vR * 255) | 0
              data[idx + 1] = (vG * 255) | 0
              data[idx + 2] = (vB * 255) | 0
            } else {
              const v = adjust(hash(xi + oxFrame, yi + oyFrame))
              data[idx] = (bgR + (fgR - bgR) * v) | 0
              data[idx + 1] = (bgG + (fgG - bgG) * v) | 0
              data[idx + 2] = (bgB + (fgB - bgB) * v) | 0
            }
            data[idx + 3] = 255
          }
        }
      } else {
        const invScale = 1 / Math.max(0.5, scale)
        const blend = (a, b) => a * (1 - morphPhase) + b * morphPhase
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const nx = x * invScale + dx
            const ny = y * invScale + dy
            const idx = (y * w + x) * 4
            if (colorMode === 'color') {
              const vR = adjust(blend(fbm(nx, ny, detail), fbm(nx + 100, ny + 100, detail)))
              const vG = adjust(blend(fbm(nx + 1000, ny + 1000, detail), fbm(nx + 1100, ny + 1100, detail)))
              const vB = adjust(blend(fbm(nx + 2000, ny + 2000, detail), fbm(nx + 2100, ny + 2100, detail)))
              data[idx] = (vR * 255) | 0
              data[idx + 1] = (vG * 255) | 0
              data[idx + 2] = (vB * 255) | 0
            } else {
              const v = adjust(blend(fbm(nx, ny, detail), fbm(nx + 100, ny + 100, detail)))
              data[idx] = (bgR + (fgR - bgR) * v) | 0
              data[idx + 1] = (bgG + (fgG - bgG) * v) | 0
              data[idx + 2] = (bgB + (fgB - bgB) * v) | 0
            }
            data[idx + 3] = 255
          }
        }
      }
      ctx.putImageData(imageData, 0, 0)
    }

    if (!animate || !motion || speed === 0) {
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
  }, [w, h, noiseType, scale, detail, brightness, contrast, motion, speed, direction, colorMode, fgColor, bgColor, animate])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0"
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  )
}
