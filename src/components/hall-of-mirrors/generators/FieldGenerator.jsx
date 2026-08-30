import { useEffect, useRef } from 'react'
import { internalSize, SMOOTH_MAX } from './size'

/**
 * FieldGenerator — the generative-pattern module (user 2026-08-28: "stripes,
 * swirls, noise, voronoi, clouds, sea, generative patterns like that").
 *
 * Every mode is ONE scalar field `f(x, y, t) → 0..1` sampled per pixel into an
 * ImageData, then run through the two-stop ramp. That is the whole module: the
 * modes differ only in their sample function, so adding one is a case in
 * `field()`, not a new renderer. Monitor's GenLofi/GenHifi are the same idea
 * (`sample(mode, sub, x, y, …)`) — this is that shape with the organic modes
 * mirror wanted and no eurorack CV plumbing, which does not exist here.
 *
 * Per-pixel work caps at SMOOTH_MAX: these are smooth fields, so the upscale
 * on composite is invisible and the cost stays bounded on a large display.
 *
 * `t` advances only while `motion` — and it advances by DELTA, so pausing
 * holds the exact frame and a parameter change mid-play does not snap to zero
 * (the freeze rule every mirror generator follows).
 */

/* value noise — a hash lattice with a smoothstep, cheap and seedless */
const hash = (x, y) => {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453
  return s - Math.floor(s)
}
const smooth = (u) => u * u * (3 - 2 * u)
function valueNoise(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y)
  const xf = x - xi, yf = y - yi
  const u = smooth(xf), v = smooth(yf)
  const a = hash(xi, yi), b = hash(xi + 1, yi)
  const c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1)
  return a * (1 - u) * (1 - v) + b * u * (1 - v) + c * (1 - u) * v + d * u * v
}
function fbm(x, y, octaves) {
  let sum = 0, amp = 0.5, freq = 1, norm = 0
  for (let i = 0; i < octaves; i++) {
    sum += valueNoise(x * freq, y * freq) * amp
    norm += amp
    amp *= 0.5
    freq *= 2
  }
  return sum / (norm || 1)
}

/* Voronoi — the distance to the nearest of a jittered lattice's feature
   points, searched over the 3×3 neighbourhood. `F2 - F1` gives the cell walls,
   which is the look people mean by "voronoi"; F1 alone gives blobs. */
function voronoi(x, y, t) {
  const xi = Math.floor(x), yi = Math.floor(y)
  let f1 = 8, f2 = 8
  for (let oy = -1; oy <= 1; oy++) {
    for (let ox = -1; ox <= 1; ox++) {
      const cx = xi + ox, cy = yi + oy
      const jx = hash(cx, cy), jy = hash(cx + 41.3, cy - 17.9)
      const px = cx + 0.5 + Math.sin(t + jx * 6.283) * 0.5
      const py = cy + 0.5 + Math.cos(t + jy * 6.283) * 0.5
      const d = Math.hypot(px - x, py - y)
      if (d < f1) { f2 = f1; f1 = d } else if (d < f2) { f2 = d }
    }
  }
  return Math.min(1, f2 - f1)
}

const TAU = Math.PI * 2

function field(mode, x, y, t, scale, detail, warp) {
  const sx = x * scale, sy = y * scale
  switch (mode) {
    /* hard bands, but sampled as a field so they warp with everything else */
    case 'stripes': {
      const w = warp > 0 ? fbm(sx * 0.5, sy * 0.5, 2) * warp : 0
      return (Math.sin((sx + w * 4 + t) * TAU) + 1) / 2
    }
    /* polar rotation that increases toward the centre — the classic swirl */
    case 'swirl': {
      const dx = x - 0.5, dy = y - 0.5
      const r = Math.hypot(dx, dy)
      const a = Math.atan2(dy, dx) + (0.5 - r) * (2 + warp * 6) + t
      return (Math.sin(a * detail + r * scale * TAU) + 1) / 2
    }
    case 'noise':
      return fbm(sx + t, sy - t * 0.6, detail)
    case 'voronoi':
      return voronoi(sx, sy, t)
    /* domain-warped fbm — noise whose COORDINATES are noise. This is what
       makes clouds read as clouds instead of as grey static. */
    case 'clouds': {
      const qx = fbm(sx, sy, detail)
      const qy = fbm(sx + 5.2, sy + 1.3, detail)
      return fbm(sx + qx * (1 + warp * 3) + t * 0.2, sy + qy * (1 + warp * 3), detail)
    }
    /* stacked travelling swells, each a little off-axis — a horizon, not a
       sine grid. The fbm term is the chop on top of the swell. */
    case 'sea': {
      let v = 0
      for (let i = 1; i <= 3; i++) {
        v += Math.sin((sx * i * 0.6 + sy * 0.35 * i + t * (1 + i * 0.35)) * TAU) / i
      }
      return Math.min(1, Math.max(0, (v / 1.9 + 1) / 2 + fbm(sx * 2, sy * 2 + t, 2) * warp * 0.5))
    }
    default:
      return 0
  }
}

const hexToRgb = (h) => {
  const s = String(h).replace('#', '')
  const n = s.length === 3 ? s.split('').map((c) => c + c).join('') : s
  const v = parseInt(n, 16)
  return Number.isNaN(v) ? [255, 255, 255] : [(v >> 16) & 255, (v >> 8) & 255, v & 255]
}

export default function FieldGenerator({
  width = 256,
  height = 256,
  mode = 'clouds',
  scale = 4,
  detail = 4,
  warp = 0.4,
  speed = 1,
  contrast = 100,
  color = '#ffffff',
  bgColor = '#000000',
  motion = true,
  onCanvasReady,
}) {
  const canvasRef = useRef(null)
  const rafRef = useRef(null)
  const readyFired = useRef(false)
  const tRef = useRef(0)
  const lastRef = useRef(0)
  const onCanvasReadyRef = useRef(onCanvasReady)
  useEffect(() => { onCanvasReadyRef.current = onCanvasReady })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const [iw, ih] = internalSize(width, height, SMOOTH_MAX)
    canvas.width = iw
    canvas.height = ih

    if (!readyFired.current && onCanvasReadyRef.current) {
      readyFired.current = true
      onCanvasReadyRef.current(canvas)
    }

    const ctx = canvas.getContext('2d')
    const img = ctx.createImageData(iw, ih)
    const data = img.data
    const [fr, fg, fb] = hexToRgb(color)
    const [br, bg, bb] = hexToRgb(bgColor)
    const k = contrast / 100

    const render = (now) => {
      const dt = lastRef.current ? (now - lastRef.current) / 1000 : 0
      lastRef.current = now
      // delta, not absolute: pausing holds the frame, resuming continues
      if (motion) tRef.current += dt * speed
      const t = tRef.current

      let i = 0
      for (let y = 0; y < ih; y++) {
        const ny = y / ih
        for (let x = 0; x < iw; x++) {
          let v = field(mode, x / iw, ny, t, scale, Math.max(1, Math.round(detail)), warp)
          v = Math.min(1, Math.max(0, (v - 0.5) * k + 0.5))
          data[i++] = br + (fr - br) * v
          data[i++] = bg + (fg - bg) * v
          data[i++] = bb + (fb - bb) * v
          data[i++] = 255
        }
      }
      ctx.putImageData(img, 0, 0)
      rafRef.current = requestAnimationFrame(render)
    }
    rafRef.current = requestAnimationFrame(render)
    return () => { cancelAnimationFrame(rafRef.current); lastRef.current = 0 }
  }, [width, height, mode, scale, detail, warp, speed, contrast, color, bgColor, motion])

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
}
