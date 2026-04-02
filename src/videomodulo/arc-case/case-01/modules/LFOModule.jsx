import { useEffect, useRef, useCallback } from 'react'
import RotaryDial from './RotaryDial'
import ModuleIO from './ModuleIO'
import JackSocket from './JackSocket'
import { compile } from '../hooks/useExpressionValue'

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

  const wfIdx = WAVEFORMS.findIndex(w => w.value === waveform)
  const cycleWaveform = (dir) => {
    const next = (wfIdx + dir + WAVEFORMS.length) % WAVEFORMS.length
    update('waveform', WAVEFORMS[next].value)
  }

  return (
    <div className="flex flex-col h-full border-r border-fg-08">
      {/* Header — 20px */}
      <div className="flex items-center justify-between px-2 border-b border-fg-08 shrink-0" style={{ height: '20px', fontFamily: 'monospace', fontSize: '9px' }}>
        <span className="flex items-center gap-1.5">
          <span className="cursor-pointer select-none" onClick={() => update('enabled', !enabled)}>
            <div className={`rounded-full ${enabled ? 'bg-[#e74c3c]' : 'bg-fg-24'}`} style={{ width: '6px', height: '6px' }} />
          </span>
          <span className="text-fg-96">{label}</span>
        </span>
        <span ref={valRef} className="text-fg-32" style={{ fontVariantNumeric: 'tabular-nums' }}>
          {enabled ? '0' : '—'}
        </span>
      </div>

      {/* Controls — flex-1 */}
      <div className="flex-1 flex flex-col p-2 gap-2 overflow-hidden">
        {/* Waveform selector */}
        <div className="flex items-center justify-between" style={{ fontFamily: 'monospace', fontSize: '9px' }}>
          <span className="text-fg-32">WF</span>
          <span className="flex items-center gap-1">
            <span className="cursor-pointer select-none text-fg-32 hover:text-fg-64" onClick={() => cycleWaveform(-1)}>{'\u2039'}</span>
            <span className="text-fg-96" style={{ minWidth: '36px', textAlign: 'center' }}>{WAVEFORMS[wfIdx]?.label || waveform}</span>
            <span className="cursor-pointer select-none text-fg-32 hover:text-fg-64" onClick={() => cycleWaveform(1)}>{'\u203a'}</span>
          </span>
        </div>

        {/* Knobs — vertical stack */}
        <div className="flex flex-col items-center gap-2 flex-1 justify-center">
          <RotaryDial label="Rate" value={Math.round(rate / 20 * 100)} onChange={(v) => update('rate', Math.round(v / 100 * 20 * 10) / 10)} size={32} defaultValue={5} busRef={busRef} />
          <RotaryDial label="Depth" value={depth} onChange={(v) => update('depth', v)} size={32} defaultValue={100} busRef={busRef} />
          <RotaryDial label="Offset" value={offset} onChange={(v) => update('offset', v)} size={32} defaultValue={0} busRef={busRef} />
        </div>

        {/* Scope canvas — full width x 40px */}
        <canvas
          ref={canvasRef}
          width={200}
          height={40}
          style={{ width: '100%', height: '40px', borderRadius: '2px', backgroundColor: 'var(--kol-surface-tertiary)', display: 'block', flexShrink: 0 }}
        />
      </div>

      {/* Outputs */}
      <div className="flex items-center justify-center gap-3 py-2">
        <JackSocket type="out" busKey={id} moduleId={id} onEnable={() => update('enabled', true)} busRef={busRef} label="OUT" size="md" />
      </div>

      <ModuleIO
        moduleId={id}
        onEnable={() => update('enabled', true)}
        busRef={busRef}
        outputs={[]}
        inputs={[
          { label: 'rate', active: false },
          { label: 'depth', active: false },
          { label: 'offset', active: false },
        ]}
      />
    </div>
  )
}
