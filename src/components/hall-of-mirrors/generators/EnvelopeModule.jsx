import { useEffect, useRef, useCallback } from 'react'
import RotaryDial from '../RotaryDial'
import Divider from '../../atoms/Divider'

function computeEnvelope(tInCycle, attack, decay, sustain, release) {
  const susLevel = sustain * 100
  if (tInCycle < attack) {
    // Attack: ramp 0 -> 100
    return (tInCycle / attack) * 100
  }
  const t2 = tInCycle - attack
  if (t2 < decay) {
    // Decay: drop 100 -> sustain
    return 100 - (100 - susLevel) * (t2 / decay)
  }
  const t3 = t2 - decay
  if (t3 < 1) {
    // Sustain: hold for 1 second
    return susLevel
  }
  const t4 = t3 - 1
  if (t4 < release) {
    // Release: drop sustain -> 0
    return susLevel * (1 - t4 / release)
  }
  return 0
}

function drawOscilloscope(canvas, attack, decay, sustain, release, t, cycleLen) {
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

  // Show ~1.5 cycles, current moment at 80%
  const windowT = cycleLen * 1.5
  const startT = t - windowT * 0.8

  // Waveform
  ctx.beginPath()
  ctx.strokeStyle = '#e74c3c'
  ctx.lineWidth = 1.5
  let started = false
  for (let x = 0; x < w; x++) {
    const sampleT = startT + (x / w) * windowT
    // Wrap into cycle
    const inCycle = ((sampleT % cycleLen) + cycleLen) % cycleLen
    const val = computeEnvelope(inCycle, attack, decay, sustain, release)
    const clamped = Math.max(0, Math.min(100, val))
    const y = (1 - clamped / 100) * (h - 2) + 1
    if (!started) { ctx.moveTo(x, y); started = true } else ctx.lineTo(x, y)
  }
  ctx.stroke()
}

export default function EnvelopeModule({ id, label, config, onChange, busRef }) {
  const { attack = 0.1, decay = 0.3, sustain = 0.7, release = 0.5, enabled = false } = config
  const rafRef = useRef(null)
  const startRef = useRef(performance.now() / 1000)
  const canvasRef = useRef(null)
  const valRef = useRef(null)

  const cycleLen = attack + decay + 1 + release

  useEffect(() => {
    if (!enabled) {
      if (busRef) busRef.current[id] = 0
      if (valRef.current) valRef.current.textContent = '—'
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
      const inCycle = ((t % cycleLen) + cycleLen) % cycleLen
      const raw = computeEnvelope(inCycle, attack, decay, sustain, release)
      const val = Math.max(0, Math.min(100, Math.round(raw)))
      if (busRef) busRef.current[id] = val
      if (valRef.current) valRef.current.textContent = val
      drawOscilloscope(canvasRef.current, attack, decay, sustain, release, t, cycleLen)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [enabled, attack, decay, sustain, release, cycleLen, id, busRef])

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
          <RotaryDial label="ATK" value={Math.round((attack - 0.01) / 1.99 * 100)} onChange={(v) => update('attack', Math.round((v / 100 * 1.99 + 0.01) * 100) / 100)} size={36} defaultValue={5} />
          <RotaryDial label="DEC" value={Math.round((decay - 0.01) / 1.99 * 100)} onChange={(v) => update('decay', Math.round((v / 100 * 1.99 + 0.01) * 100) / 100)} size={36} defaultValue={15} />
          <RotaryDial label="SUS" value={Math.round(sustain * 100)} onChange={(v) => update('sustain', v / 100)} size={36} defaultValue={70} />
          <RotaryDial label="REL" value={Math.round((release - 0.01) / 1.99 * 100)} onChange={(v) => update('release', Math.round((v / 100 * 1.99 + 0.01) * 100) / 100)} size={36} defaultValue={25} />
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
    </div>
  )
}
