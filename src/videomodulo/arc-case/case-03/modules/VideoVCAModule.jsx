import { useEffect, useRef, useCallback } from 'react'
import RotaryDial from './RotaryDial'
import JackSocket from './JackSocket'
import ModuleIO from './ModuleIO'

export default function VideoVCAModule({ id = 'vca1', label = 'VCA', config, onChange, busRef }) {
  const { signalExpr = '', cvExpr = '', level = 100, enabled = false } = config || {}
  const rafRef = useRef(null)
  const dotRef = useRef(null)
  const signalVal = useRef(0)
  const cvVal = useRef(0)

  useEffect(() => {
    if (!enabled) {
      if (busRef?.current) busRef.current[`${id}_out`] = 0
      return
    }

    if (busRef?.current && !(`${id}_out` in busRef.current)) busRef.current[`${id}_out`] = 0

    const tick = () => {
      const sig = signalVal.current
      const cv = cvVal.current / 100
      const output = Math.max(0, Math.min(100, sig * cv * (level / 100)))

      if (busRef?.current) busRef.current[`${id}_out`] = Math.round(output)

      if (dotRef.current) {
        dotRef.current.style.opacity = output > 5 ? 1 : (enabled ? 0.4 : 0.15)
      }

      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [enabled, level, id, busRef])

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
        <JackSocket type="in" moduleId={id} configKey="signalExpr" onExprChange={(v) => update('signalExpr', v)} active={!!signalExpr} busRef={busRef} label="SIG" size="md" />
        <JackSocket type="in" moduleId={id} configKey="cvExpr" onExprChange={(v) => update('cvExpr', v)} active={!!cvExpr} busRef={busRef} label="CV" size="md" />
      </div>
      {/* Controls */}
      <div className="flex flex-col items-center gap-1 flex-1 py-1 px-1" style={{ overflow: 'hidden' }}>
        <RotaryDial label="Lvl" value={level} onChange={(v) => update('level', v)} size={32} defaultValue={100} busRef={busRef} />
      </div>
      {/* Output jacks */}
      <div className="flex items-center justify-center gap-2 py-2">
        <JackSocket type="out" busKey={`${id}_out`} moduleId={id} onEnable={() => update('enabled', true)} busRef={busRef} label="OUT" size="md" />
      </div>
      <ModuleIO moduleId={id} onEnable={() => update('enabled', true)} busRef={busRef}
        outputs={[`${id}_out`]}
        inputs={[
          { label: 'sig', active: !!signalExpr, configKey: 'signalExpr', onExprChange: (v) => update('signalExpr', v) },
          { label: 'cv', active: !!cvExpr, configKey: 'cvExpr', onExprChange: (v) => update('cvExpr', v) },
        ]} />
    </div>
  )
}
