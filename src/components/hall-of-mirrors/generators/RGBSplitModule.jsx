import { useEffect, useRef, useCallback } from 'react'
import RotaryDial from '../RotaryDial'
import JackSocket from './JackSocket'
import ModuleIO from './ModuleIO'

export default function RGBSplitModule({ id = 'rgb1', label = 'RGB', config, onChange, busRef }) {
  const { inExpr = '', gainR = 100, gainG = 100, gainB = 100, enabled = false } = config || {}
  const rafRef = useRef(null)
  const dotRef = useRef(null)
  const inputVal = useRef(0)

  useEffect(() => {
    if (!enabled) {
      if (busRef?.current) {
        busRef.current[`${id}_r`] = 0
        busRef.current[`${id}_g`] = 0
        busRef.current[`${id}_b`] = 0
      }
      return
    }

    if (busRef?.current) {
      if (!(`${id}_r` in busRef.current)) busRef.current[`${id}_r`] = 0
      if (!(`${id}_g` in busRef.current)) busRef.current[`${id}_g`] = 0
      if (!(`${id}_b` in busRef.current)) busRef.current[`${id}_b`] = 0
    }

    const tick = () => {
      const signal = inputVal.current
      const r = Math.max(0, Math.min(100, signal * (gainR / 100)))
      const g = Math.max(0, Math.min(100, signal * (gainG / 100)))
      const b = Math.max(0, Math.min(100, signal * (gainB / 100)))

      if (busRef?.current) {
        busRef.current[`${id}_r`] = Math.round(r)
        busRef.current[`${id}_g`] = Math.round(g)
        busRef.current[`${id}_b`] = Math.round(b)
      }

      if (dotRef.current) {
        const peak = Math.max(r, g, b)
        dotRef.current.style.opacity = peak > 5 ? 1 : (enabled ? 0.4 : 0.15)
      }

      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [enabled, gainR, gainG, gainB, id, busRef])

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
        <RotaryDial label="R" value={gainR} onChange={(v) => update('gainR', v)} size={32} defaultValue={100} busRef={busRef} />
        <RotaryDial label="G" value={gainG} onChange={(v) => update('gainG', v)} size={32} defaultValue={100} busRef={busRef} />
        <RotaryDial label="B" value={gainB} onChange={(v) => update('gainB', v)} size={32} defaultValue={100} busRef={busRef} />
      </div>
      {/* Output jacks */}
      <div className="flex items-center justify-center gap-2 py-2">
        <JackSocket type="out" busKey={`${id}_r`} moduleId={id} onEnable={() => update('enabled', true)} busRef={busRef} label="R" size="md" />
        <JackSocket type="out" busKey={`${id}_g`} moduleId={id} onEnable={() => update('enabled', true)} busRef={busRef} label="G" size="md" />
        <JackSocket type="out" busKey={`${id}_b`} moduleId={id} onEnable={() => update('enabled', true)} busRef={busRef} label="B" size="md" />
      </div>
      <ModuleIO moduleId={id} onEnable={() => update('enabled', true)} busRef={busRef}
        outputs={[`${id}_r`, `${id}_g`, `${id}_b`]}
        inputs={[
          { label: 'in', active: !!inExpr, configKey: 'inExpr', onExprChange: (v) => update('inExpr', v) },
        ]} />
    </div>
  )
}
