import { useEffect, useRef, useCallback } from 'react'
import RotaryDial from './RotaryDial'
import Divider from './Divider'
import ModuleIO from './ModuleIO'

const DIVISIONS = [1, 2, 4, 8, 16]
const OUTPUT_KEYS = ['clk1', 'clk1_phase', 'clk1_div2', 'clk1_div4', 'clk1_div8']

function drawOscilloscope(canvas, phase, pulseWidth, beatCount, division) {
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const w = canvas.width
  const h = canvas.height
  ctx.clearRect(0, 0, w, h)

  // Grid
  ctx.strokeStyle = 'rgba(255,255,255,0.06)'
  ctx.lineWidth = 1
  for (let i = 1; i < 4; i++) {
    const y = Math.round(h * i / 4) + 0.5
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke()
  }

  // Draw 4 beats of main clock pulse
  const pw = pulseWidth / 100
  ctx.strokeStyle = '#e74c3c'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  const beats = 4
  for (let x = 0; x < w; x++) {
    const beatPhase = ((x / w * beats) + phase) % 1
    const high = beatPhase < pw
    const y = high ? 4 : h - 4
    if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
  }
  ctx.stroke()

  // Draw divided clock (dim)
  if (division > 1) {
    ctx.strokeStyle = 'rgba(255,255,255,0.2)'
    ctx.lineWidth = 1
    ctx.beginPath()
    for (let x = 0; x < w; x++) {
      const beatPhase = ((x / w * beats / division) + phase / division) % 1
      const high = beatPhase < pw
      const y = high ? h * 0.3 : h * 0.7
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
    }
    ctx.stroke()
  }

  // Playhead
  const playX = Math.round(w * (phase % 1)) + 0.5
  ctx.strokeStyle = 'rgba(255,255,255,0.15)'
  ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(playX, 0); ctx.lineTo(playX, h); ctx.stroke()
}

export default function ClockModule({ id = 'clk1', label = 'CLOCK', config, onChange, busRef }) {
  const { bpm = 120, swing = 0, pulseWidth = 10, division = 1, enabled = true } = config || {}
  const rafRef = useRef(null)
  const startRef = useRef(performance.now() / 1000)
  const canvasRef = useRef(null)
  const valRef = useRef(null)
  const beatCountRef = useRef(0)

  // Initialize bus keys
  useEffect(() => {
    if (!busRef?.current) return
    OUTPUT_KEYS.forEach(k => { if (!(k in busRef.current)) busRef.current[k] = 0 })
  }, [busRef])

  useEffect(() => {
    if (!enabled) {
      OUTPUT_KEYS.forEach(k => { if (busRef?.current) busRef.current[k] = 0 })
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
    const pw = pulseWidth / 100

    const tick = () => {
      const t = performance.now() / 1000 - start
      const beatDuration = 60 / bpm
      const beatPosition = t / beatDuration
      const phase = beatPosition % 1

      // Swing: shift even beats
      const beatIndex = Math.floor(beatPosition)
      const isEvenBeat = beatIndex % 2 === 1
      let adjustedPhase = phase
      if (isEvenBeat && swing > 0) {
        adjustedPhase = phase * (1 + swing / 200)
      }

      // Main clock pulse
      const clkHigh = (adjustedPhase % 1) < pw
      const clkValue = clkHigh ? 100 : 0

      // Phase ramp (0-100 sawtooth)
      const phaseValue = (adjustedPhase % 1) * 100

      // Divided clocks
      const div2Phase = (beatPosition / 2) % 1
      const div4Phase = (beatPosition / 4) % 1
      const div8Phase = (beatPosition / 8) % 1

      const bus = busRef?.current
      if (bus) {
        bus.clk1 = clkValue
        bus.clk1_phase = phaseValue
        bus.clk1_div2 = div2Phase < pw ? 100 : 0
        bus.clk1_div4 = div4Phase < pw ? 100 : 0
        bus.clk1_div8 = div8Phase < pw ? 100 : 0
      }

      beatCountRef.current = beatIndex

      if (valRef.current) valRef.current.textContent = clkHigh ? '||' : beatIndex

      drawOscilloscope(canvasRef.current, adjustedPhase, pulseWidth, beatIndex, division)

      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [enabled, bpm, swing, pulseWidth, division, busRef])

  const update = useCallback((key, val) => onChange?.({ ...config, [key]: val }), [config, onChange])

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
          <RotaryDial
            label="BPM"
            value={Math.round((bpm - 20) / 280 * 100)}
            onChange={(v) => update('bpm', Math.round(v / 100 * 280 + 20))}
            size={36}
            defaultValue={36}
            busRef={busRef}
          />
          <RotaryDial
            label="Swing"
            value={swing}
            onChange={(v) => update('swing', v)}
            size={36}
            defaultValue={0}
            busRef={busRef}
          />
          <RotaryDial
            label="PW"
            value={Math.round((pulseWidth - 1) / 49 * 100)}
            onChange={(v) => update('pulseWidth', Math.round(v / 100 * 49 + 1))}
            size={36}
            defaultValue={18}
            busRef={busRef}
          />
        </div>

        {/* Division buttons */}
        <div className="flex items-center gap-1">
          <span className="text-fg-32 kol-helper-xxs shrink-0">DIV</span>
          {DIVISIONS.map(d => (
            <button
              key={d}
              className={`flex-1 kol-helper-xxs py-0.5 rounded-sm cursor-pointer border ${
                division === d
                  ? 'bg-[#e74c3c] text-fg-96 border-[#e74c3c]'
                  : 'bg-transparent text-fg-32 border-fg-08 hover:text-fg-64'
              }`}
              onClick={() => update('division', d)}
            >
              /{d}
            </button>
          ))}
        </div>

        <Divider />

        {/* Oscilloscope */}
        <canvas
          ref={canvasRef}
          width={252}
          height={52}
          style={{ width: '100%', height: '52px', borderRadius: '3px', backgroundColor: 'var(--kol-surface-tertiary)', display: 'block' }}
        />

        {/* Output row */}
        <div className="flex items-center justify-between kol-helper-xs">
          <span className="text-fg-32">Beat</span>
          <span ref={valRef} className="text-fg-64" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {enabled ? '0' : '—'}
          </span>
        </div>
      </div>

      <ModuleIO
        moduleId={id}
        onEnable={() => update('enabled', true)}
        busRef={busRef}
        outputs={OUTPUT_KEYS}
        inputs={[
          { label: 'bpm', active: false },
          { label: 'swing', active: false },
          { label: 'pw', active: false },
        ]}
      />
    </div>
  )
}
