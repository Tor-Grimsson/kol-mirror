import { useEffect, useRef, useCallback } from 'react'
import ExpressionInput from './ExpressionInput'
import ModuleIO from './ModuleIO'

const MODES = ['FULL', 'HALF+', 'HALF-']

export default function RectifierModule({ id = 'rect1', label = 'RECT', config, onChange, busRef }) {
  const { inputExpr = '', mode = 'FULL', enabled = false } = config || {}
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
      const input = inputValRef.current
      let output = 0

      if (mode === 'FULL') {
        // Abs value mapped 0-100: treat 50 as zero crossing
        output = Math.abs(input - 50) * 2
      } else if (mode === 'HALF+') {
        // Pass only > 50, else 0
        output = input > 50 ? input : 0
      } else if (mode === 'HALF-') {
        // Pass only < 50, invert
        output = input < 50 ? (50 - input) * 2 : 0
      }

      output = Math.max(0, Math.min(100, Math.round(output)))
      if (busRef?.current) busRef.current[`${id}_out`] = output

      if (dotRef.current) {
        dotRef.current.style.opacity = output > 5 ? 1 : (enabled ? 0.6 : 0.15)
      }

      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [enabled, mode, id, busRef])

  const update = useCallback((key, val) => onChange?.({ ...config, [key]: val }), [config, onChange])

  const modeIdx = MODES.indexOf(mode)
  const prevMode = () => update('mode', MODES[(modeIdx - 1 + MODES.length) % MODES.length])
  const nextMode = () => update('mode', MODES[(modeIdx + 1) % MODES.length])

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

        {/* Mode selector */}
        <div className="flex items-center gap-0.5 w-full justify-center" style={{ fontSize: '8px', fontFamily: 'var(--kol-font-mono)' }}>
          <span className="cursor-pointer text-fg-32 hover:text-fg-64 select-none" onClick={prevMode}>{'\u2039'}</span>
          <span className="text-fg-96" style={{ width: '36px', textAlign: 'center' }}>{mode}</span>
          <span className="cursor-pointer text-fg-32 hover:text-fg-64 select-none" onClick={nextMode}>{'\u203a'}</span>
        </div>
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
