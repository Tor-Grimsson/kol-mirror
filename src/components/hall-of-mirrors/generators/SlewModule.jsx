import { useEffect, useRef, useCallback } from 'react'
import RotaryDial from '../RotaryDial'
import JackSocket from './JackSocket'
import ModuleIO from './ModuleIO'

export default function SlewModule({ id = 'slew1', label = 'SLEW', config, onChange, busRef }) {
  const { inExpr = '', rise = 50, fall = 50, enabled = false } = config || {}
  const rafRef = useRef(null)
  const dotRef = useRef(null)
  const inputVal = useRef(0)
  const currentVal = useRef(0)
  const lastTimeRef = useRef(performance.now() / 1000)

  useEffect(() => {
    if (!enabled) {
      if (busRef?.current) busRef.current[`${id}_out`] = 0
      currentVal.current = 0
      return
    }

    if (busRef?.current && !(`${id}_out` in busRef.current)) busRef.current[`${id}_out`] = 0
    lastTimeRef.current = performance.now() / 1000

    const tick = () => {
      const now = performance.now() / 1000
      const dt = now - lastTimeRef.current
      lastTimeRef.current = now

      const target = inputVal.current
      let val = currentVal.current

      // Rise/fall rates: knob 0 = instant, 100 = very slow (5 seconds)
      if (target > val) {
        const riseRate = rise > 0 ? 100 / (rise / 100 * 5) : Infinity
        val += riseRate * dt
        if (val > target) val = target
      } else if (target < val) {
        const fallRate = fall > 0 ? 100 / (fall / 100 * 5) : Infinity
        val -= fallRate * dt
        if (val < target) val = target
      }

      val = Math.max(0, Math.min(100, val))
      currentVal.current = val

      if (busRef?.current) busRef.current[`${id}_out`] = Math.round(val)

      if (dotRef.current) {
        dotRef.current.style.opacity = val > 5 ? 1 : (enabled ? 0.4 : 0.15)
      }

      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [enabled, rise, fall, id, busRef])

  const update = useCallback((key, val) => onChange?.({ ...config, [key]: val }), [config, onChange])

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
      {/* Input jacks */}
      <div className="flex items-center justify-center gap-2 py-2">
        <JackSocket type="in" moduleId={id} configKey="inExpr" onExprChange={(v) => update('inExpr', v)} active={!!inExpr} busRef={busRef} label="IN" size="md" />
      </div>
      {/* Controls */}
      <div className="flex flex-col items-center gap-1 flex-1 py-1 px-1" style={{ overflow: 'hidden' }}>
        <RotaryDial label="Rise" value={rise} onChange={(v) => update('rise', v)} size={32} defaultValue={50} busRef={busRef} />
        <RotaryDial label="Fall" value={fall} onChange={(v) => update('fall', v)} size={32} defaultValue={50} busRef={busRef} />
      </div>
      {/* Output jacks */}
      <div className="flex items-center justify-center gap-2 py-2">
        <JackSocket type="out" busKey={`${id}_out`} moduleId={id} onEnable={() => update('enabled', true)} busRef={busRef} label="OUT" size="md" />
      </div>
      <ModuleIO moduleId={id} onEnable={() => update('enabled', true)} busRef={busRef}
        outputs={[`${id}_out`]}
        inputs={[
          { label: 'in', active: !!inExpr, configKey: 'inExpr', onExprChange: (v) => update('inExpr', v) },
        ]} />
    </div>
  )
}
