import { useEffect, useRef, useCallback } from 'react'
import RotaryDial from './RotaryDial'
import ExpressionInput from './ExpressionInput'
import ModuleIO from './ModuleIO'

export default function ScaleOffsetModule({ id = 'so1', label = 'S/O', config, onChange, busRef }) {
  const { inputExpr = '', scale = 50, offset = 50, enabled = false } = config || {}
  const rafRef = useRef(null)
  const dotRef = useRef(null)
  const inputValRef = useRef(0)

  useEffect(() => {
    if (!enabled) {
      if (busRef?.current) busRef.current[`${id}_out`] = 0
      return
    }

    if (busRef?.current && !(`${id}_out` in busRef.current)) busRef.current[`${id}_out`] = 0

    const tick = () => {
      // Map scale knob (0-100) to -200% to +200% (-2.0 to +2.0)
      const scaleFactor = ((scale / 100) * 4) - 2
      // Map offset knob (0-100) to -100 to +100
      const offsetVal = ((offset / 100) * 200) - 100
      const input = inputValRef.current

      const result = input * scaleFactor + offsetVal
      const output = Math.max(0, Math.min(100, Math.round(result)))

      if (busRef?.current) busRef.current[`${id}_out`] = output

      if (dotRef.current) {
        dotRef.current.style.opacity = output > 5 ? 1 : (enabled ? 0.6 : 0.15)
      }

      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [enabled, scale, offset, id, busRef])

  const update = useCallback((key, val) => onChange?.({ ...config, [key]: val }), [config, onChange])

  return (
    <div className="flex flex-col h-full bg-surface-secondary border-r border-fg-08">
      {/* Header - 20px */}
      <div className="flex items-center justify-between px-2 border-b border-fg-08" style={{ height: '20px', minHeight: '20px' }}>
        <span className="flex items-center gap-1.5">
          <span ref={dotRef} className="cursor-pointer select-none"
            onClick={() => update('enabled', !enabled)}
            style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#e74c3c', outline: '6px solid transparent', outlineOffset: '0', opacity: 1, boxShadow: enabled ? '0 0 6px 2px #e74c3c' : 'none' }}
          />
          <span className="text-fg-96" style={{ fontSize: '9px', fontFamily: 'var(--kol-font-mono)' }}>{label}</span>
        </span>
      </div>

      {/* Controls - flex-1, vertical stack */}
      <div className="flex flex-col items-center gap-1 flex-1 py-1 px-1" style={{ overflow: 'hidden' }}>
        {/* Input expression */}
        <ExpressionInput
          label="In"
          expr={inputExpr}
          onExprChange={(v) => update('inputExpr', v)}
          busRef={busRef}
          onValue={(v) => { inputValRef.current = v }}
        />

        {/* Scale knob */}
        <RotaryDial
          label="Scale"
          value={scale}
          onChange={(v) => update('scale', v)}
          size={32}
          defaultValue={50}
          busRef={busRef}
          variant="dense"
        />

        {/* Offset knob */}
        <RotaryDial
          label="Offs"
          value={offset}
          onChange={(v) => update('offset', v)}
          size={32}
          defaultValue={50}
          busRef={busRef}
          variant="dense"
        />
      </div>

      {/* I/O at bottom */}
      <ModuleIO
        moduleId={id}
        onEnable={() => update('enabled', true)}
        busRef={busRef}
        outputs={[`${id}_out`]}
        inputs={[
          { label: 'in', active: !!inputExpr, configKey: 'inputExpr', onExprChange: (v) => update('inputExpr', v) },
        ]}
      />
    </div>
  )
}
