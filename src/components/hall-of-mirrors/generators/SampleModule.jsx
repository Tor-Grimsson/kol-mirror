import { useEffect, useRef, useCallback } from 'react'
import ExpressionInput from './ExpressionInput'
import ModuleIO from './ModuleIO'

export default function SampleModule({ id = 'smp1', label = 'SMPL', config, onChange, busRef }) {
  const { signalExpr = '', triggerExpr = '', enabled = false } = config || {}
  const rafRef = useRef(null)
  const dotRef = useRef(null)
  const signalValRef = useRef(0)
  const triggerValRef = useRef(0)
  const prevTrigHighRef = useRef(false)
  const heldValueRef = useRef(0)

  useEffect(() => {
    if (!enabled) {
      if (busRef?.current) busRef.current[`${id}_out`] = 0
      heldValueRef.current = 0
      prevTrigHighRef.current = false
      return
    }

    if (busRef?.current && !(`${id}_out` in busRef.current)) busRef.current[`${id}_out`] = 0

    const tick = () => {
      const trigHigh = triggerValRef.current > 50
      const wasTrigHigh = prevTrigHighRef.current
      prevTrigHighRef.current = trigHigh

      // Capture on rising edge
      if (trigHigh && !wasTrigHigh) {
        heldValueRef.current = signalValRef.current
      }

      const output = Math.max(0, Math.min(100, Math.round(heldValueRef.current)))
      if (busRef?.current) busRef.current[`${id}_out`] = output

      if (dotRef.current) {
        dotRef.current.style.opacity = output > 5 ? 1 : (enabled ? 0.6 : 0.15)
      }

      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [enabled, id, busRef])

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
        {/* Signal input expression */}
        <ExpressionInput
          label="Sig"
          expr={signalExpr}
          onExprChange={(v) => update('signalExpr', v)}
          busRef={busRef}
          onValue={(v) => { signalValRef.current = v }}
        />

        {/* Trigger input expression */}
        <ExpressionInput
          label="Trig"
          expr={triggerExpr}
          onExprChange={(v) => update('triggerExpr', v)}
          busRef={busRef}
          onValue={(v) => { triggerValRef.current = v }}
        />
      </div>

      {/* I/O at bottom */}
      <ModuleIO
        moduleId={id}
        onEnable={() => update('enabled', true)}
        busRef={busRef}
        outputs={[`${id}_out`]}
        inputs={[
          { label: 'sig', active: !!signalExpr, configKey: 'signalExpr', onExprChange: (v) => update('signalExpr', v) },
          { label: 'trig', active: !!triggerExpr, configKey: 'triggerExpr', onExprChange: (v) => update('triggerExpr', v) },
        ]}
      />
    </div>
  )
}
