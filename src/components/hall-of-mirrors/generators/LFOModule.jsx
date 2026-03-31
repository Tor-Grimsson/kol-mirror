import { useEffect, useRef, useCallback } from 'react'
import RotaryDial from '../RotaryDial'
import Dropdown from '../../molecules/Dropdown'
import Divider from '../../atoms/Divider'
import ModuleIO from './ModuleIO'
import { compile } from '../../../hooks/useExpressionValue'

const WAVEFORMS = [
  { value: 'sine', label: 'Sine' },
  { value: 'saw', label: 'Saw' },
  { value: 'tri', label: 'Triangle' },
  { value: 'pulse', label: 'Pulse' },
  { value: 'rand', label: 'Random' },
  { value: 'bell', label: 'Bell' },
  { value: 'exp', label: 'Exp' },
  { value: 'step', label: 'Step' },
]

const WAVE_FN = { sine: 'wave', saw: 'saw', tri: 'tri', pulse: 'pulse', rand: 'rand', bell: 'bell', exp: 'exp', step: 'step' }

function buildExpression(waveform, rate, depth, offset) {
  const fn = WAVE_FN[waveform] || 'wave'
  const depthNorm = depth / 100
  const offsetNorm = offset
  if (depthNorm >= 1 && offsetNorm === 0) return `${fn}(t*${rate})`
  if (offsetNorm === 0) return `${fn}(t*${rate})*${depthNorm}`
  return `${fn}(t*${rate})*${depthNorm}+${offsetNorm}`
}

function drawOscilloscope(canvas, fn, t, rate) {
  if (!canvas || !fn) return
  const ctx = canvas.getContext('2d')
  const w = canvas.width
  const h = canvas.height
  ctx.clearRect(0, 0, w, h)

  // Show 2 full cycles, current moment at 80% across
  const cycleT = 1 / Math.max(0.05, rate)
  const windowT = cycleT * 2.5
  const startT = t - windowT * 0.8

  // Grid lines
  ctx.strokeStyle = 'rgba(255,255,255,0.06)'
  ctx.lineWidth = 1
  for (let i = 1; i < 4; i++) {
    const y = Math.round(h * i / 4) + 0.5
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke()
  }

  // Playhead
  const playX = Math.round(w * 0.8) + 0.5
  ctx.strokeStyle = 'rgba(255,255,255,0.10)'
  ctx.beginPath(); ctx.moveTo(playX, 0); ctx.lineTo(playX, h); ctx.stroke()

  // Waveform
  ctx.beginPath()
  ctx.strokeStyle = '#e74c3c'
  ctx.lineWidth = 1.5
  let started = false
  for (let x = 0; x < w; x++) {
    const sampleT = startT + (x / w) * windowT
    try {
      const raw = fn(sampleT, 0, 0, 100)
      const clamped = Math.max(0, Math.min(100, raw))
      const y = (1 - clamped / 100) * (h - 2) + 1
      if (!started) { ctx.moveTo(x, y); started = true } else ctx.lineTo(x, y)
    } catch { /* skip */ }
  }
  ctx.stroke()
}

export default function LFOModule({ id, label, config, onChange, busRef }) {
  const { waveform = 'sine', rate = 1, depth = 100, offset = 0, enabled = false } = config
  const rafRef = useRef(null)
  const startRef = useRef(performance.now() / 1000)
  const canvasRef = useRef(null)
  const fnRef = useRef(null)
  const valRef = useRef(null)

  // Recompile when expression params change
  useEffect(() => {
    const expr = buildExpression(waveform, rate, depth, offset)
    fnRef.current = compile(expr)
  }, [waveform, rate, depth, offset])

  useEffect(() => {
    if (!enabled) {
      if (busRef) busRef.current[id] = 0
      if (valRef.current) valRef.current.textContent = '—'
      // Draw flat idle line
      const canvas = canvasRef.current
      if (canvas) {
        const ctx = canvas.getContext('2d')
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.strokeStyle = 'rgba(255,255,255,0.08)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(0, canvas.height / 2)
        ctx.lineTo(canvas.width, canvas.height / 2)
        ctx.stroke()
      }
      return
    }
    const start = startRef.current
    let frame = 0
    const tick = () => {
      const t = performance.now() / 1000 - start
      const fn = fnRef.current
      if (fn) {
        try {
          const raw = fn(t, frame++, 0, 100)
          const val = Math.max(0, Math.min(100, Math.round(raw)))
          if (busRef) busRef.current[id] = val
          if (valRef.current) valRef.current.textContent = val
        } catch { /* silent */ }
        drawOscilloscope(canvasRef.current, fn, t, rate)
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [enabled, rate, id, busRef])

  const update = useCallback((key, val) => onChange({ ...config, [key]: val }), [config, onChange])

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
        <span className="text-fg-32 kol-helper-xxs">{id}</span>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-3 p-3">
        {/* Waveform */}
        <div className="flex items-center justify-between kol-helper-xs" style={{ height: '24px' }}>
          <span className="text-fg-64">Waveform</span>
          <Dropdown options={WAVEFORMS} value={waveform} onChange={(v) => update('waveform', v)} variant="minimal" size="md" />
        </div>

        {/* Knobs — size 36 default variant matches channel knobs */}
        <div className="flex items-center justify-around">
          <RotaryDial label="Rate" value={Math.round(rate / 20 * 100)} onChange={(v) => update('rate', Math.round(v / 100 * 20 * 10) / 10)} size={36} defaultValue={5} busRef={busRef} />
          <RotaryDial label="Depth" value={depth} onChange={(v) => update('depth', v)} size={36} defaultValue={100} busRef={busRef} />
          <RotaryDial label="Offset" value={offset} onChange={(v) => update('offset', v)} size={36} defaultValue={0} busRef={busRef} />
        </div>

        <Divider />

        {/* Oscilloscope canvas */}
        <canvas
          ref={canvasRef}
          width={252}
          height={52}
          style={{ width: '100%', height: '52px', borderRadius: '3px', backgroundColor: 'var(--kol-surface-tertiary)', display: 'block' }}
        />

        {/* Output row */}
        <div className="flex items-center justify-between kol-helper-xs">
          <span className="text-fg-32">Output</span>
          <span ref={valRef} className="text-fg-64" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {enabled ? '0' : '—'}
          </span>
        </div>
      </div>

      <ModuleIO
        moduleId={id}
        onEnable={() => update('enabled', true)}
        busRef={busRef}
        outputs={[id]}
        inputs={[
          { label: 'rate', active: false },
          { label: 'depth', active: false },
          { label: 'offset', active: false },
        ]}
      />
    </div>
  )
}
