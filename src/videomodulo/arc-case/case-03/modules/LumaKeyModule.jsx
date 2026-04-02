import { useEffect, useRef, useCallback } from 'react'
import RotaryDial from './RotaryDial'
import JackSocket from './JackSocket'
import ModuleIO from './ModuleIO'

export default function LumaKeyModule({ id = 'luma1', label = 'LUMA', config, onChange, busRef }) {
  const { inExpr = '', contrast = 50, brightness = 50, enabled = false } = config || {}
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
      // Treat input as luminance (already 0-100)
      let luma = inputVal.current

      // Apply contrast: expand/compress around midpoint
      // contrast 0 = flat gray, 50 = neutral, 100 = max contrast
      const contrastFactor = (contrast / 50) // 0..2
      luma = (luma - 50) * contrastFactor + 50

      // Apply brightness offset: 0 = -50, 50 = neutral, 100 = +50
      const brightOffset = (brightness - 50)
      luma = luma + brightOffset

      const output = Math.max(0, Math.min(100, luma))

      if (busRef?.current) busRef.current[`${id}_out`] = Math.round(output)

      if (dotRef.current) {
        dotRef.current.style.opacity = output > 5 ? 1 : (enabled ? 0.4 : 0.15)
      }

      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [enabled, contrast, brightness, id, busRef])

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
        <RotaryDial label="Con" value={contrast} onChange={(v) => update('contrast', v)} size={32} defaultValue={50} busRef={busRef} />
        <RotaryDial label="Bri" value={brightness} onChange={(v) => update('brightness', v)} size={32} defaultValue={50} busRef={busRef} />
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
