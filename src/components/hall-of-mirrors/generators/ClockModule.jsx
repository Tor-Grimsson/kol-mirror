import { useEffect, useRef, useCallback } from 'react'
import RotaryDial from '../RotaryDial'
import JackSocket from './JackSocket'
import ModuleIO from './ModuleIO'

const OUTPUTS = [
  { key: 'clk1', label: '×1' },
  { key: 'clk1_div2', label: '÷2' },
  { key: 'clk1_div4', label: '÷4' },
  { key: 'clk1_div8', label: '÷8' },
  { key: 'clk1_phase', label: 'PHS' },
]

export default function ClockModule({ id = 'clk1', label = 'CLK', config, onChange, busRef }) {
  const { bpm = 120, swing = 0, pulseWidth = 10, enabled = true } = config || {}
  const rafRef = useRef(null)
  const startRef = useRef(performance.now() / 1000)
  const dotRef = useRef(null)

  useEffect(() => {
    if (!busRef?.current) return
    OUTPUTS.forEach(o => { if (!(o.key in busRef.current)) busRef.current[o.key] = 0 })
  }, [busRef])

  useEffect(() => {
    if (!enabled) {
      OUTPUTS.forEach(o => { if (busRef?.current) busRef.current[o.key] = 0 })
      if (dotRef.current) dotRef.current.style.opacity = '0.15'
      return
    }

    const start = startRef.current
    const pw = pulseWidth / 100

    const tick = () => {
      const t = performance.now() / 1000 - start
      const beatDuration = 60 / bpm
      const beatPosition = t / beatDuration
      const phase = beatPosition % 1

      const beatIndex = Math.floor(beatPosition)
      const isEvenBeat = beatIndex % 2 === 1
      let adjustedPhase = phase
      if (isEvenBeat && swing > 0) adjustedPhase = phase * (1 + swing / 200)

      const clkHigh = (adjustedPhase % 1) < pw
      const phaseValue = (adjustedPhase % 1) * 100
      const div2Phase = (beatPosition / 2) % 1
      const div4Phase = (beatPosition / 4) % 1
      const div8Phase = (beatPosition / 8) % 1

      const bus = busRef?.current
      if (bus) {
        bus.clk1 = clkHigh ? 100 : 0
        bus.clk1_phase = phaseValue
        bus.clk1_div2 = div2Phase < pw ? 100 : 0
        bus.clk1_div4 = div4Phase < pw ? 100 : 0
        bus.clk1_div8 = div8Phase < pw ? 100 : 0
      }

      if (dotRef.current) dotRef.current.style.opacity = clkHigh ? '1' : '0.3'

      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [enabled, bpm, swing, pulseWidth, busRef])

  const update = useCallback((key, val) => onChange?.({ ...config, [key]: val }), [config, onChange])

  return (
    <div className="flex flex-col h-full bg-surface-secondary border-r border-fg-08">
      {/* Header */}
      <div className="flex items-center justify-between px-2 border-b border-fg-08" style={{ height: '20px', minHeight: '20px' }}>
        <span className="flex items-center gap-1.5">
          <span ref={dotRef} className="cursor-pointer select-none" onClick={() => update('enabled', !enabled)}
            style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#e74c3c', outline: '6px solid transparent', outlineOffset: '0', opacity: 1, boxShadow: enabled ? '0 0 6px 2px #e74c3c' : 'none', transition: 'opacity 0.05s' }} />
          <span className="text-fg-96" style={{ fontSize: '9px', fontFamily: 'var(--kol-font-mono)' }}>{label}</span>
        </span>
      </div>

      {/* External clock input */}
      <div className="flex items-center justify-center py-2">
        <JackSocket type="in" moduleId={id} configKey="extClock" busRef={busRef} label="EXT" size="md" />
      </div>

      {/* BPM — big knob */}
      <div className="flex items-center justify-center py-1">
        <RotaryDial
          label="BPM"
          value={Math.round((bpm - 20) / 280 * 100)}
          onChange={(v) => update('bpm', Math.round(v / 100 * 280 + 20))}
          size={48} defaultValue={36} busRef={busRef}
        />
      </div>

      {/* Swing + PW */}
      <div className="flex items-center justify-around px-2 py-1">
        <RotaryDial label="SW" value={swing} onChange={(v) => update('swing', v)} size={28} defaultValue={0} busRef={busRef} variant="dense" />
        <RotaryDial label="PW" value={Math.round((pulseWidth - 1) / 49 * 100)} onChange={(v) => update('pulseWidth', Math.round(v / 100 * 49 + 1))} size={28} defaultValue={18} busRef={busRef} variant="dense" />
      </div>

      {/* Output jacks grid */}
      <div className="flex-1" />
      <div className="flex flex-wrap items-center justify-center gap-3 px-2 pb-3">
        {OUTPUTS.map(o => (
          <JackSocket key={o.key} type="out" busKey={o.key} moduleId={id} onEnable={() => update('enabled', true)} busRef={busRef} size="md" label={o.label} />
        ))}
      </div>
    </div>
  )
}
