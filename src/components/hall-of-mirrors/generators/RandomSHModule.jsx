import { useEffect, useRef, useCallback } from 'react'
import RotaryDial from '../RotaryDial'
import Divider from '../../atoms/Divider'
import ModuleIO from './ModuleIO'

function drawOscilloscope(canvas, historyRef, currentIdx, smooth, t, rate) {
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const w = canvas.width
  const h = canvas.height
  ctx.clearRect(0, 0, w, h)

  // Grid lines
  ctx.strokeStyle = 'rgba(255,255,255,0.06)'
  ctx.lineWidth = 1
  for (let i = 1; i < 4; i++) {
    const y = Math.round(h * i / 4) + 0.5
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke()
  }

  // Playhead at 80%
  const playX = Math.round(w * 0.8) + 0.5
  ctx.strokeStyle = 'rgba(255,255,255,0.10)'
  ctx.beginPath(); ctx.moveTo(playX, 0); ctx.lineTo(playX, h); ctx.stroke()

  // Draw from history — show ~2.5 cycles worth
  const hist = historyRef.current
  if (!hist || hist.length < 2) return

  const stepDuration = 1 / Math.max(0.05, rate)
  const windowT = stepDuration * 8
  const startT = t - windowT * 0.8
  const smoothFactor = smooth / 100

  ctx.beginPath()
  ctx.strokeStyle = '#e74c3c'
  ctx.lineWidth = 1.5
  let started = false

  for (let x = 0; x < w; x++) {
    const sampleT = startT + (x / w) * windowT
    // Find which step this falls in
    let val = 0
    for (let i = hist.length - 1; i >= 0; i--) {
      if (sampleT >= hist[i].t) {
        if (smoothFactor > 0 && i < hist.length - 1) {
          const progress = (sampleT - hist[i].t) / stepDuration
          const blend = Math.min(1, progress / Math.max(0.01, smoothFactor))
          val = hist[i].v + (hist[Math.min(i + 1, hist.length - 1)].v - hist[i].v) * blend
        } else {
          val = hist[i].v
        }
        break
      }
    }

    const clamped = Math.max(0, Math.min(100, val))
    const y = (1 - clamped / 100) * (h - 2) + 1
    if (!started) { ctx.moveTo(x, y); started = true } else ctx.lineTo(x, y)
  }
  ctx.stroke()
}

export default function RandomSHModule({ id, label, config, onChange, busRef }) {
  const { rate = 2, min = 0, max = 100, smooth = 0, enabled = false } = config
  const rafRef = useRef(null)
  const startRef = useRef(performance.now() / 1000)
  const canvasRef = useRef(null)
  const valRef = useRef(null)
  const historyRef = useRef([])
  const lastStepRef = useRef(-1)
  const currentValRef = useRef(0)
  const prevValRef = useRef(0)

  useEffect(() => {
    if (!enabled) {
      if (busRef) busRef.current[id] = 0
      if (valRef.current) valRef.current.textContent = '—'
      historyRef.current = []
      lastStepRef.current = -1
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
    const tick = () => {
      const t = performance.now() / 1000 - start
      const stepIndex = Math.floor(t * rate)

      if (stepIndex !== lastStepRef.current) {
        lastStepRef.current = stepIndex
        prevValRef.current = currentValRef.current
        const newVal = min + Math.random() * (max - min)
        currentValRef.current = newVal
        historyRef.current.push({ t, v: newVal })
        // Keep history bounded
        if (historyRef.current.length > 64) {
          historyRef.current = historyRef.current.slice(-48)
        }
      }

      // Interpolate if smooth > 0
      const smoothFactor = smooth / 100
      let output
      if (smoothFactor > 0) {
        const stepProgress = (t * rate) % 1
        const blend = Math.min(1, stepProgress / Math.max(0.01, smoothFactor))
        output = prevValRef.current + (currentValRef.current - prevValRef.current) * blend
      } else {
        output = currentValRef.current
      }

      const val = Math.max(0, Math.min(100, Math.round(output)))
      if (busRef) busRef.current[id] = val
      if (valRef.current) valRef.current.textContent = val

      drawOscilloscope(canvasRef.current, historyRef, lastStepRef.current, smooth, t, rate)

      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [enabled, rate, min, max, smooth, id, busRef])

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
        {/* Knobs */}
        <div className="flex items-center justify-around">
          <RotaryDial label="Rate" value={Math.round((rate - 0.1) / 19.9 * 100)} onChange={(v) => update('rate', Math.round((v / 100 * 19.9 + 0.1) * 10) / 10)} size={36} defaultValue={10} busRef={busRef} />
          <RotaryDial label="Min" value={min} onChange={(v) => update('min', v)} size={36} defaultValue={0} busRef={busRef} />
          <RotaryDial label="Max" value={max} onChange={(v) => update('max', v)} size={36} defaultValue={100} busRef={busRef} />
          <RotaryDial label="Smooth" value={smooth} onChange={(v) => update('smooth', v)} size={36} defaultValue={0} busRef={busRef} />
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
        inputs={[]}
      />
    </div>
  )
}
