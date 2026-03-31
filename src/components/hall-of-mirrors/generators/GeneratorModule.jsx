import { useEffect, useRef, useCallback } from 'react'
import RotaryDial from '../RotaryDial'
import Divider from '../../atoms/Divider'
import ModuleIO from './ModuleIO'

const ALGORITHMS = ['noise', 'grad', 'ptrn', 'wave', 'clr']
const ALG_LABELS = { noise: 'NOISE', grad: 'GRAD', ptrn: 'PTRN', wave: 'WAVE', clr: 'CLR' }

const SUB_TYPES = {
  grad: [{ v: 'linear', l: 'LIN' }, { v: 'radial', l: 'RAD' }, { v: 'conic', l: 'CON' }],
  ptrn: [{ v: 'stripes', l: 'STR' }, { v: 'dots', l: 'DOT' }, { v: 'checker', l: 'CHK' }],
  wave: [{ v: 'sin', l: 'SIN' }, { v: 'saw', l: 'SAW' }, { v: 'pls', l: 'PLS' }, { v: 'sqr', l: 'SQR' }, { v: 'rnd', l: 'RND' }],
}

const PARAM_LABELS = {
  noise: ['Scale', 'Speed', 'Oct'],
  grad: ['Angle', 'Speed', ''],
  ptrn: ['Space', 'Angle', 'Duty'],
  wave: ['Freq', 'Speed', 'Angle', 'PWM'],
  clr: ['H', 'S', 'L'],
}

const W = 252, H = 200

// --- Noise math ---
function hash(x, y) {
  let h = (x * 374761393 + y * 668265263 + 1274126177) | 0
  h = Math.imul(h ^ (h >>> 13), 1103515245)
  return (h ^ (h >>> 16) & 0x7fffffff) / 0x7fffffff
}
function valueNoise(x, y) {
  const ix = Math.floor(x), iy = Math.floor(y)
  const fx = x - ix, fy = y - iy
  const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy)
  return (hash(ix, iy) * (1 - sx) + hash(ix + 1, iy) * sx) * (1 - sy) +
         (hash(ix, iy + 1) * (1 - sx) + hash(ix + 1, iy + 1) * sx) * sy
}
function fbm(x, y, octaves) {
  let v = 0, a = 1, f = 1, m = 0
  for (let i = 0; i < octaves; i++) { v += valueNoise(x * f, y * f) * a; m += a; a *= 0.5; f *= 2 }
  return v / m
}

// --- Render functions ---
function renderNoise(ctx, w, h, p1, p2, p3, t) {
  const scale = Math.max(4, p1), speed = p2, octaves = Math.max(1, Math.min(6, Math.round(p3)))
  const imgData = ctx.createImageData(w, h)
  const d = imgData.data
  const inv = 1 / scale
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const v = fbm(x * inv + t * speed, y * inv + t * speed, octaves)
      const c = (v * 255) | 0
      const i = (y * w + x) * 4
      d[i] = c; d[i + 1] = c; d[i + 2] = c; d[i + 3] = 255
    }
  }
  ctx.putImageData(imgData, 0, 0)
}

function renderGradient(ctx, w, h, p1, p2, subType, t) {
  const angle = p1, speed = p2
  const offset = t * speed * 0.02
  let gradient
  if (subType === 'radial') {
    gradient = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.7)
  } else if (subType === 'conic' && typeof ctx.createConicGradient === 'function') {
    gradient = ctx.createConicGradient(((angle + offset * 360) % 360) * Math.PI / 180, w / 2, h / 2)
  } else {
    const rad = ((angle + offset * 360) % 360) * Math.PI / 180
    const len = Math.max(w, h)
    gradient = ctx.createLinearGradient(w / 2 - Math.cos(rad) * len, h / 2 - Math.sin(rad) * len, w / 2 + Math.cos(rad) * len, h / 2 + Math.sin(rad) * len)
  }
  gradient.addColorStop((0 + offset) % 1, '#000')
  gradient.addColorStop((0.5 + offset) % 1, '#fff')
  gradient.addColorStop((1 + offset) % 1, '#000')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, w, h)
}

function renderPattern(ctx, w, h, p1, p2, p3, subType, t) {
  const spacing = Math.max(4, p1), angle = p2, duty = Math.max(0.05, Math.min(0.95, p3))
  const offset = t * 30
  ctx.clearRect(0, 0, w, h)
  const rad = angle * Math.PI / 180
  ctx.save()
  ctx.translate(w / 2, h / 2); ctx.rotate(rad); ctx.translate(-w / 2, -h / 2)
  const diag = Math.sqrt(w * w + h * h)
  const ox = (diag - w) / 2, oy = (diag - h) / 2
  ctx.fillStyle = '#fff'
  if (subType === 'stripes') {
    const sw = spacing * duty, start = -ox + (offset % spacing)
    for (let x = start; x < w + ox; x += spacing) ctx.fillRect(x, -oy, sw, h + oy * 2)
  } else if (subType === 'dots') {
    const r = (spacing * duty) / 2, start = -ox + (offset % spacing)
    for (let x = start; x < w + ox; x += spacing)
      for (let y = -oy + (offset % spacing); y < h + oy; y += spacing)
        { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill() }
  } else {
    const start = -ox + (offset % (spacing * 2))
    for (let x = start; x < w + ox; x += spacing)
      for (let y = -oy + (offset % (spacing * 2)); y < h + oy; y += spacing) {
        const col = Math.floor((x - start) / spacing), row = Math.floor((y - start) / spacing)
        if ((col + row) % 2 === 0) ctx.fillRect(x, y, spacing * duty, spacing * duty)
      }
  }
  ctx.restore()
}

function renderWave(ctx, w, h, p1, p2, p3, p4, subType, t) {
  const freq = Math.max(1, p1), speed = p2, angle = p3, pwm = Math.max(0.05, Math.min(0.95, p4))
  const imgData = ctx.createImageData(w, h)
  const d = imgData.data
  const rad = angle * Math.PI / 180
  const cosA = Math.cos(rad), sinA = Math.sin(rad)
  const phase = t * speed

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const u = (x * cosA + y * sinA) / w * freq + phase
      let v
      const p = ((u % 1) + 1) % 1
      if (subType === 'sin') v = Math.sin(u * Math.PI * 2) * 0.5 + 0.5
      else if (subType === 'saw') v = p
      else if (subType === 'pls') v = p < pwm ? 1 : 0
      else if (subType === 'sqr') v = p < 0.5 ? 1 : 0
      else v = Math.random()

      const c = (v * 255) | 0
      const i = (y * w + x) * 4
      d[i] = c; d[i + 1] = c; d[i + 2] = c; d[i + 3] = 255
    }
  }
  ctx.putImageData(imgData, 0, 0)
}

function renderColor(ctx, w, h, p1, p2, p3) {
  ctx.fillStyle = `hsl(${p1}, ${p2}%, ${p3}%)`
  ctx.fillRect(0, 0, w, h)
}

function sampleLuma(ctx, w, h) {
  const imgData = ctx.getImageData(0, 0, w, h)
  const d = imgData.data
  let sum = 0
  const step = Math.max(1, Math.floor(d.length / 4 / 64))
  let count = 0
  for (let i = 0; i < d.length; i += step * 4) {
    sum += (d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114) / 255
    count++
  }
  return count > 0 ? (sum / count) * 100 : 0
}

export default function GeneratorModule({ id = 'gen1', label = 'GEN', config, onChange, busRef }) {
  const {
    algorithm = 'noise', subType = 'linear',
    p1 = 20, p2 = 1, p3 = 3, p4 = 0.5,
    h = 0, s = 100, l = 50,
    enabled = false, preview = true,
  } = config || {}

  const canvasRef = useRef(null)
  const rafRef = useRef(null)
  const valRef = useRef(null)
  const tRef = useRef(0)

  useEffect(() => {
    if (!enabled) {
      if (busRef?.current) { busRef.current[`${id}_luma`] = 0; busRef.current[`${id}_density`] = 0 }
      if (valRef.current) valRef.current.textContent = '—'
      const canvas = canvasRef.current
      if (canvas) {
        const ctx = canvas.getContext('2d')
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.fillStyle = 'rgba(255,255,255,0.03)'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }
      return
    }

    if (busRef?.current) {
      if (!(`${id}_luma` in busRef.current)) busRef.current[`${id}_luma`] = 0
      if (!(`${id}_density` in busRef.current)) busRef.current[`${id}_density`] = 0
    }

    const tick = () => {
      const canvas = canvasRef.current
      if (!canvas) { rafRef.current = requestAnimationFrame(tick); return }
      const ctx = canvas.getContext('2d')
      tRef.current += 0.016

      if (algorithm === 'noise') renderNoise(ctx, W, H, p1, p2, p3, tRef.current)
      else if (algorithm === 'grad') renderGradient(ctx, W, H, p1, p2, subType, tRef.current)
      else if (algorithm === 'ptrn') renderPattern(ctx, W, H, p1, p2, p3, subType, tRef.current)
      else if (algorithm === 'wave') renderWave(ctx, W, H, p1, p2, p3, p4, subType, tRef.current)
      else if (algorithm === 'clr') renderColor(ctx, W, H, h, s, l)

      // Signal outputs
      const luma = sampleLuma(ctx, W, H)
      let density = 50
      if (algorithm === 'noise') density = Math.min(100, p3 * (100 / p1))
      else if (algorithm === 'ptrn') density = Math.min(100, 100 / Math.max(4, p1) * 20)
      else if (algorithm === 'wave') density = Math.min(100, p1 * 2)
      else if (algorithm === 'clr') density = l

      if (busRef?.current) {
        busRef.current[`${id}_luma`] = Math.round(luma)
        busRef.current[`${id}_density`] = Math.round(density)
      }

      if (valRef.current) valRef.current.textContent = Math.round(luma)

      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [enabled, algorithm, subType, p1, p2, p3, p4, h, s, l, id, busRef])

  const update = useCallback((key, val) => onChange?.({ ...config, [key]: val }), [config, onChange])

  const paramLabels = PARAM_LABELS[algorithm] || []
  const subTypes = SUB_TYPES[algorithm]

  return (
    <div className="flex flex-col shrink-0 bg-surface-secondary border border-fg-08" style={{ width: '280px', borderRadius: '4px' }}>
      {/* Header */}
      <div className="flex items-center justify-between kol-helper-xs px-3 border-b border-fg-08" style={{ height: '29px' }}>
        <span className="flex items-center gap-3">
          <span className="cursor-pointer select-none" onClick={() => update('enabled', !enabled)}>
            <div className={`w-2 h-2 rounded-full ${enabled ? 'bg-[#e74c3c]' : 'bg-fg-24'}`} />
          </span>
          <span className={enabled ? 'text-fg-96' : 'text-fg-32'}>{label}</span>
        </span>
        <span className="flex items-center gap-2">
          <span
            className={`cursor-pointer select-none kol-helper-xxs ${preview ? 'text-fg-32' : 'text-fg-16'}`}
            onClick={() => update('preview', !preview)}
          >
            {preview ? '◉' : '◎'}
          </span>
          <span className="text-fg-32 kol-helper-xxs">{id}</span>
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-2 p-3">
        {/* Preview — hidden when preview off, canvas still renders for signal output */}
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          style={{ width: '100%', height: preview ? `${H}px` : '6px', borderRadius: '3px', backgroundColor: 'var(--kol-surface-tertiary)', display: 'block', overflow: 'hidden', transition: 'height 0.15s' }}
        />

        {/* Algorithm buttons */}
        <div className="flex items-center gap-1">
          {ALGORITHMS.map(a => (
            <button
              key={a}
              className={`flex-1 kol-helper-xxs py-0.5 rounded-sm cursor-pointer border ${
                algorithm === a
                  ? 'bg-fg-96 text-surface-primary border-fg-96'
                  : 'bg-transparent text-fg-32 border-fg-08 hover:text-fg-64'
              }`}
              style={{ fontSize: '8px' }}
              onClick={() => update('algorithm', a)}
            >
              {ALG_LABELS[a]}
            </button>
          ))}
        </div>

        {/* Sub-type buttons */}
        {subTypes && (
          <div className="flex items-center gap-1">
            {subTypes.map(st => (
              <button
                key={st.v}
                className={`flex-1 kol-helper-xxs py-0.5 rounded-sm cursor-pointer border ${
                  subType === st.v
                    ? 'bg-[#e74c3c] text-fg-96 border-[#e74c3c]'
                    : 'bg-transparent text-fg-24 border-fg-08 hover:text-fg-64'
                }`}
                style={{ fontSize: '8px' }}
                onClick={() => update('subType', st.v)}
              >
                {st.l}
              </button>
            ))}
          </div>
        )}

        <Divider />

        {/* Knobs — algorithm-specific */}
        {algorithm === 'clr' ? (
          <div className="flex items-center justify-around">
            <RotaryDial label="H" value={Math.round(h / 360 * 100)} onChange={(v) => update('h', Math.round(v / 100 * 360))} size={36} defaultValue={0} busRef={busRef} />
            <RotaryDial label="S" value={s} onChange={(v) => update('s', v)} size={36} defaultValue={100} busRef={busRef} />
            <RotaryDial label="L" value={l} onChange={(v) => update('l', v)} size={36} defaultValue={50} busRef={busRef} />
          </div>
        ) : (
          <div className="flex items-center justify-around">
            {paramLabels[0] && (
              <RotaryDial
                label={paramLabels[0]}
                value={algorithm === 'noise' ? Math.round(p1 / 100 * 100) : algorithm === 'wave' ? Math.round(p1 / 50 * 100) : algorithm === 'ptrn' ? Math.round(p1 / 100 * 100) : Math.round(p1 / 360 * 100)}
                onChange={(v) => update('p1', algorithm === 'noise' ? Math.round(v / 100 * 100) : algorithm === 'wave' ? Math.round(v / 100 * 50) : algorithm === 'ptrn' ? Math.max(4, Math.round(v / 100 * 100)) : Math.round(v / 100 * 360))}
                size={36} defaultValue={20} busRef={busRef}
              />
            )}
            {paramLabels[1] && (
              <RotaryDial
                label={paramLabels[1]}
                value={algorithm === 'ptrn' ? Math.round(p2 / 360 * 100) : Math.round(p2 / 10 * 100)}
                onChange={(v) => update('p2', algorithm === 'ptrn' ? Math.round(v / 100 * 360) : Math.round(v / 100 * 10 * 10) / 10)}
                size={36} defaultValue={10} busRef={busRef}
              />
            )}
            {paramLabels[2] && (
              <RotaryDial
                label={paramLabels[2]}
                value={algorithm === 'noise' ? Math.round((p3 - 1) / 5 * 100) : algorithm === 'wave' ? Math.round(p3 / 360 * 100) : Math.round(p3 * 100)}
                onChange={(v) => update('p3', algorithm === 'noise' ? Math.round(v / 100 * 5) + 1 : algorithm === 'wave' ? Math.round(v / 100 * 360) : Math.round(v) / 100)}
                size={36} defaultValue={33} busRef={busRef}
              />
            )}
            {paramLabels[3] && (
              <RotaryDial
                label={paramLabels[3]}
                value={Math.round(p4 * 100)}
                onChange={(v) => update('p4', Math.round(v) / 100)}
                size={36} defaultValue={50} busRef={busRef}
              />
            )}
          </div>
        )}

        <Divider />

        {/* Output */}
        <div className="flex items-center justify-between kol-helper-xs">
          <span className="text-fg-32">Luma</span>
          <span ref={valRef} className="text-fg-64" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {enabled ? '0' : '—'}
          </span>
        </div>
      </div>

      <ModuleIO
        moduleId={id}
        onEnable={() => update('enabled', true)}
        busRef={busRef}
        outputs={[`${id}_luma`, `${id}_density`]}
        inputs={[]}
      />
    </div>
  )
}
