import { useEffect, useRef, useCallback } from 'react'
import RotaryDial from '../RotaryDial'
import JackSocket from './JackSocket'
import ModuleIO from './ModuleIO'

export default function RGBMixModule({ id = 'rgbm1', label = 'RGBMIX', config, onChange, busRef }) {
  const { inRExpr = '', inGExpr = '', inBExpr = '', mixR = 100, mixG = 100, mixB = 100, master = 100, enabled = false } = config || {}
  const rafRef = useRef(null)
  const dotRef = useRef(null)
  const rVal = useRef(0)
  const gVal = useRef(0)
  const bVal = useRef(0)

  useEffect(() => {
    if (!enabled) {
      if (busRef?.current) busRef.current[`${id}_out`] = 0
      return
    }

    if (busRef?.current && !(`${id}_out` in busRef.current)) busRef.current[`${id}_out`] = 0

    const tick = () => {
      const r = rVal.current * (mixR / 100)
      const g = gVal.current * (mixG / 100)
      const b = bVal.current * (mixB / 100)
      const combined = Math.max(0, Math.min(100, ((r + g + b) / 3) * (master / 100)))

      if (busRef?.current) busRef.current[`${id}_out`] = Math.round(combined)

      if (dotRef.current) {
        dotRef.current.style.opacity = combined > 5 ? 1 : (enabled ? 0.4 : 0.15)
      }

      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [enabled, mixR, mixG, mixB, master, id, busRef])

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
        <JackSocket type="in" moduleId={id} configKey="inRExpr" onExprChange={(v) => update('inRExpr', v)} active={!!inRExpr} busRef={busRef} label="R" size="md" />
        <JackSocket type="in" moduleId={id} configKey="inGExpr" onExprChange={(v) => update('inGExpr', v)} active={!!inGExpr} busRef={busRef} label="G" size="md" />
        <JackSocket type="in" moduleId={id} configKey="inBExpr" onExprChange={(v) => update('inBExpr', v)} active={!!inBExpr} busRef={busRef} label="B" size="md" />
      </div>
      {/* Controls */}
      <div className="flex flex-col items-center gap-1 flex-1 py-1 px-1" style={{ overflow: 'hidden' }}>
        <RotaryDial label="R" value={mixR} onChange={(v) => update('mixR', v)} size={32} defaultValue={100} busRef={busRef} />
        <RotaryDial label="G" value={mixG} onChange={(v) => update('mixG', v)} size={32} defaultValue={100} busRef={busRef} />
        <RotaryDial label="B" value={mixB} onChange={(v) => update('mixB', v)} size={32} defaultValue={100} busRef={busRef} />
        <RotaryDial label="Mst" value={master} onChange={(v) => update('master', v)} size={32} defaultValue={100} busRef={busRef} />
      </div>
      {/* Output jacks */}
      <div className="flex items-center justify-center gap-2 py-2">
        <JackSocket type="out" busKey={`${id}_out`} moduleId={id} onEnable={() => update('enabled', true)} busRef={busRef} label="OUT" size="md" />
      </div>
      <ModuleIO moduleId={id} onEnable={() => update('enabled', true)} busRef={busRef}
        outputs={[`${id}_out`]}
        inputs={[
          { label: 'R', active: !!inRExpr, configKey: 'inRExpr', onExprChange: (v) => update('inRExpr', v) },
          { label: 'G', active: !!inGExpr, configKey: 'inGExpr', onExprChange: (v) => update('inGExpr', v) },
          { label: 'B', active: !!inBExpr, configKey: 'inBExpr', onExprChange: (v) => update('inBExpr', v) },
        ]} />
    </div>
  )
}
