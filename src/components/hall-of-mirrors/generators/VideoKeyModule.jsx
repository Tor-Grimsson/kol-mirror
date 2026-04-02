import { useEffect, useRef, useCallback } from 'react'
import RotaryDial from '../RotaryDial'
import JackSocket from './JackSocket'
import ModuleIO from './ModuleIO'

const KEY_MODES = ['HARD', 'SOFT']

export default function VideoKeyModule({ id = 'key1', label = 'KEY', config, onChange, busRef }) {
  const { inExpr = '', threshold = 50, mode = 'HARD', enabled = false } = config || {}
  const rafRef = useRef(null)
  const dotRef = useRef(null)
  const inputVal = useRef(0)

  useEffect(() => {
    if (!enabled) {
      if (busRef?.current) busRef.current[`${id}_out`] = 0
      return
    }

    if (busRef?.current && !(`${id}_out` in busRef.current)) busRef.current[`${id}_out`] = 0

    const tick = () => {
      const signal = inputVal.current
      let output = 0

      if (mode === 'HARD') {
        output = signal >= threshold ? 100 : 0
      } else {
        // Soft key: gradient around threshold with 20-unit transition zone
        const dist = signal - threshold
        const zone = 20
        output = Math.max(0, Math.min(100, (dist / zone) * 50 + 50))
      }

      if (busRef?.current) busRef.current[`${id}_out`] = Math.round(output)

      if (dotRef.current) {
        dotRef.current.style.opacity = output > 5 ? 1 : (enabled ? 0.4 : 0.15)
      }

      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [enabled, threshold, mode, id, busRef])

  const update = useCallback((key, val) => onChange?.({ ...config, [key]: val }), [config, onChange])

  const modeIdx = KEY_MODES.indexOf(mode)
  const prevMode = () => update('mode', KEY_MODES[(modeIdx - 1 + KEY_MODES.length) % KEY_MODES.length])
  const nextMode = () => update('mode', KEY_MODES[(modeIdx + 1) % KEY_MODES.length])

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
        <RotaryDial label="Thr" value={threshold} onChange={(v) => update('threshold', v)} size={32} defaultValue={50} busRef={busRef} />
        {/* Mode selector */}
        <div className="flex items-center gap-0.5 w-full justify-center" style={{ fontSize: '8px', fontFamily: 'var(--kol-font-mono)' }}>
          <span className="cursor-pointer text-fg-32 hover:text-fg-64 select-none" onClick={prevMode}>{'\u2039'}</span>
          <span className="text-fg-96" style={{ width: '32px', textAlign: 'center' }}>{mode}</span>
          <span className="cursor-pointer text-fg-32 hover:text-fg-64 select-none" onClick={nextMode}>{'\u203a'}</span>
        </div>
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
