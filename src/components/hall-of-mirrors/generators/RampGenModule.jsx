import { useEffect, useRef, useCallback } from 'react'
import RotaryDial from '../RotaryDial'
import JackSocket from './JackSocket'
import ModuleIO from './ModuleIO'

const DIRECTIONS = ['H', 'V', 'DIAG']

export default function RampGenModule({ id = 'ramp1', label = 'RAMP', config, onChange, busRef }) {
  const { frequency = 50, direction = 'H', enabled = false } = config || {}
  const rafRef = useRef(null)
  const dotRef = useRef(null)
  const startRef = useRef(performance.now() / 1000)

  useEffect(() => {
    if (!enabled) {
      if (busRef?.current) busRef.current[`${id}_out`] = 0
      return
    }

    if (busRef?.current && !(`${id}_out` in busRef.current)) busRef.current[`${id}_out`] = 0
    const start = startRef.current
    // Map frequency knob (0-100) to Hz (0.05 - 10)
    const hz = 0.05 + (frequency / 100) * 9.95

    const tick = () => {
      const t = performance.now() / 1000 - start
      let output = 0

      if (direction === 'H') {
        // Horizontal sawtooth ramp
        output = ((t * hz) % 1) * 100
      } else if (direction === 'V') {
        // Vertical sawtooth ramp (phase offset)
        output = ((t * hz + 0.5) % 1) * 100
      } else {
        // Diagonal: average of H and V ramps at different rates
        const h = ((t * hz) % 1) * 100
        const v = ((t * hz * 0.707) % 1) * 100
        output = (h + v) / 2
      }

      output = Math.max(0, Math.min(100, output))

      if (busRef?.current) busRef.current[`${id}_out`] = Math.round(output)

      if (dotRef.current) {
        dotRef.current.style.opacity = output > 5 ? 1 : (enabled ? 0.4 : 0.15)
      }

      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [enabled, frequency, direction, id, busRef])

  const update = useCallback((key, val) => onChange?.({ ...config, [key]: val }), [config, onChange])

  const dirIdx = DIRECTIONS.indexOf(direction)
  const prevDir = () => update('direction', DIRECTIONS[(dirIdx - 1 + DIRECTIONS.length) % DIRECTIONS.length])
  const nextDir = () => update('direction', DIRECTIONS[(dirIdx + 1) % DIRECTIONS.length])

  return (
    <div className="flex flex-col h-full bg-surface-secondary border-r border-fg-08">
      {/* Header 20px */}
      <div className="flex items-center justify-between px-2 border-b border-fg-08" style={{ height: '20px', minHeight: '20px' }}>
        <span className="flex items-center gap-1.5">
          <span ref={dotRef} className="cursor-pointer select-none" onClick={() => update('enabled', !enabled)}
            style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#e74c3c', outline: '6px solid transparent', outlineOffset: '0', opacity: 1, boxShadow: enabled ? '0 0 6px 2px #e74c3c' : 'none' }} />
          <span className="text-fg-96" style={{ fontSize: '9px', fontFamily: 'var(--kol-font-mono)' }}>{label}</span>
        </span>
      </div>
      {/* No input jacks - this is a generator */}
      {/* Controls */}
      <div className="flex flex-col items-center gap-1 flex-1 py-1 px-1" style={{ overflow: 'hidden' }}>
        <RotaryDial label="Frq" value={frequency} onChange={(v) => update('frequency', v)} size={32} defaultValue={50} busRef={busRef} />
        {/* Direction selector */}
        <div className="flex items-center gap-0.5 w-full justify-center" style={{ fontSize: '8px', fontFamily: 'var(--kol-font-mono)' }}>
          <span className="cursor-pointer text-fg-32 hover:text-fg-64 select-none" onClick={prevDir}>{'\u2039'}</span>
          <span className="text-fg-96" style={{ width: '32px', textAlign: 'center' }}>{direction}</span>
          <span className="cursor-pointer text-fg-32 hover:text-fg-64 select-none" onClick={nextDir}>{'\u203a'}</span>
        </div>
      </div>
      {/* Output jacks */}
      <div className="flex items-center justify-center gap-2 py-2">
        <JackSocket type="out" busKey={`${id}_out`} moduleId={id} onEnable={() => update('enabled', true)} busRef={busRef} label="OUT" size="md" />
      </div>
      <ModuleIO moduleId={id} onEnable={() => update('enabled', true)} busRef={busRef}
        outputs={[`${id}_out`]}
        inputs={[]} />
    </div>
  )
}
