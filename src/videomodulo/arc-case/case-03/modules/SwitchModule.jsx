import { useEffect, useRef, useCallback } from 'react'
import ExpressionInput from './ExpressionInput'
import ModuleIO from './ModuleIO'

export default function SwitchModule({ id = 'sw1', label = 'SWITCH', config, onChange, busRef }) {
  const { inputAExpr = '', inputBExpr = '', cvExpr = '', manualToggle = false, enabled = false } = config || {}
  const rafRef = useRef(null)
  const dotRef = useRef(null)
  const aValRef = useRef(0)
  const bValRef = useRef(0)
  const cvValRef = useRef(0)

  useEffect(() => {
    if (!enabled) {
      if (busRef?.current) busRef.current[`${id}_out`] = 0
      return
    }

    if (busRef?.current && !(`${id}_out` in busRef.current)) busRef.current[`${id}_out`] = 0

    const tick = () => {
      // CV > 50 routes A, else routes B. Manual toggle overrides.
      let selectA
      if (cvExpr) {
        selectA = cvValRef.current > 50
      } else {
        selectA = manualToggle
      }

      const output = Math.max(0, Math.min(100, Math.round(selectA ? aValRef.current : bValRef.current)))
      if (busRef?.current) busRef.current[`${id}_out`] = output

      if (dotRef.current) {
        dotRef.current.style.opacity = output > 5 ? 1 : (enabled ? 0.6 : 0.15)
      }

      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [enabled, manualToggle, cvExpr, id, busRef])

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
        {/* Input A expression */}
        <ExpressionInput
          label="A"
          expr={inputAExpr}
          onExprChange={(v) => update('inputAExpr', v)}
          busRef={busRef}
          onValue={(v) => { aValRef.current = v }}
        />

        {/* Input B expression */}
        <ExpressionInput
          label="B"
          expr={inputBExpr}
          onExprChange={(v) => update('inputBExpr', v)}
          busRef={busRef}
          onValue={(v) => { bValRef.current = v }}
        />

        {/* CV expression */}
        <ExpressionInput
          label="CV"
          expr={cvExpr}
          onExprChange={(v) => update('cvExpr', v)}
          busRef={busRef}
          onValue={(v) => { cvValRef.current = v }}
        />

        {/* Manual toggle */}
        <div className="flex items-center gap-0.5 w-full justify-center" style={{ fontSize: '8px', fontFamily: 'var(--kol-font-mono)' }}>
          <span className="cursor-pointer text-fg-32 hover:text-fg-64 select-none" onClick={() => update('manualToggle', !manualToggle)}>{'\u2039'}</span>
          <span className="text-fg-96" style={{ width: '20px', textAlign: 'center' }}>{manualToggle ? 'A' : 'B'}</span>
          <span className="cursor-pointer text-fg-32 hover:text-fg-64 select-none" onClick={() => update('manualToggle', !manualToggle)}>{'\u203a'}</span>
        </div>
      </div>

      {/* I/O at bottom */}
      <ModuleIO
        moduleId={id}
        onEnable={() => update('enabled', true)}
        busRef={busRef}
        outputs={[`${id}_out`]}
        inputs={[
          { label: 'A', active: !!inputAExpr, configKey: 'inputAExpr', onExprChange: (v) => update('inputAExpr', v) },
          { label: 'B', active: !!inputBExpr, configKey: 'inputBExpr', onExprChange: (v) => update('inputBExpr', v) },
          { label: 'CV', active: !!cvExpr, configKey: 'cvExpr', onExprChange: (v) => update('cvExpr', v) },
        ]}
      />
    </div>
  )
}
