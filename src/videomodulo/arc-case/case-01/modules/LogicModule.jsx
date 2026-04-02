import { useEffect, useRef, useCallback } from 'react'
import ExpressionInput from './ExpressionInput'
import ModuleIO from './ModuleIO'

const GATE_TYPES = ['AND', 'OR', 'XOR', 'NOT', 'NAND']
const ON = '#e74c3c'
const OFF = 'rgba(255,255,255,0.10)'

export default function LogicModule({ id, label, config, onChange, busRef }) {
  const { type = 'AND', inputAExpr = '', inputBExpr = '', enabled = false } = config
  const rafRef = useRef(null)
  const dotRef = useRef(null)

  const barARef = useRef(null)
  const barBRef = useRef(null)
  const barOutRef = useRef(null)
  const valRef = useRef(null)
  const aValRef = useRef(0)
  const bValRef = useRef(0)

  // Compile and evaluate inputs via rAF
  useEffect(() => {
    const setBar = (ref, on) => { if (ref.current) ref.current.style.backgroundColor = on ? ON : OFF }
    if (!enabled) {
      if (busRef?.current) busRef.current[id] = 0
      setBar(barARef, false); setBar(barBRef, false); setBar(barOutRef, false)
      if (valRef.current) valRef.current.textContent = '\u2014'
      return
    }

    if (busRef?.current && !(id in busRef.current)) busRef.current[id] = 0

    const tick = () => {
      const a = aValRef.current > 50
      const b = bValRef.current > 50
      let out = false
      if (type === 'AND') out = a && b
      else if (type === 'OR') out = a || b
      else if (type === 'XOR') out = a !== b
      else if (type === 'NOT') out = !a
      else if (type === 'NAND') out = !(a && b)

      if (busRef?.current) busRef.current[id] = out ? 100 : 0
      setBar(barARef, a)
      setBar(barBRef, type !== 'NOT' ? b : false)
      setBar(barOutRef, out)
      if (valRef.current) valRef.current.textContent = out ? '100' : '0'

      // Pulse the red dot with output signal
      if (dotRef.current) {
        dotRef.current.style.opacity = out ? 1 : (enabled ? 0.6 : 0.15)
      }

      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [enabled, type, id, busRef])

  const update = useCallback((key, val) => onChange({ ...config, [key]: val }), [config, onChange])

  const typeIdx = GATE_TYPES.indexOf(type)
  const prevType = () => update('type', GATE_TYPES[(typeIdx - 1 + GATE_TYPES.length) % GATE_TYPES.length])
  const nextType = () => update('type', GATE_TYPES[(typeIdx + 1) % GATE_TYPES.length])

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
        {/* Logic type selector */}
        <div className="flex items-center gap-0.5 w-full justify-center" style={{ fontSize: '8px', fontFamily: 'var(--kol-font-mono)' }}>
          <span className="cursor-pointer text-fg-32 hover:text-fg-64 select-none" onClick={prevType}>{'\u2039'}</span>
          <span className="text-fg-96" style={{ width: '32px', textAlign: 'center' }}>{type}</span>
          <span className="cursor-pointer text-fg-32 hover:text-fg-64 select-none" onClick={nextType}>{'\u203a'}</span>
        </div>

        {/* Expression inputs */}
        <ExpressionInput
          label="A"
          expr={inputAExpr}
          onExprChange={(v) => update('inputAExpr', v)}
          busRef={busRef}
          onValue={(v) => { aValRef.current = v }}
        />
        {type !== 'NOT' && (
          <ExpressionInput
            label="B"
            expr={inputBExpr}
            onExprChange={(v) => update('inputBExpr', v)}
            busRef={busRef}
            onValue={(v) => { bValRef.current = v }}
          />
        )}

        {/* A / B / OUT indicator bars */}
        <div className="flex items-center gap-1 w-full px-1" style={{ fontSize: '7px', fontFamily: 'var(--kol-font-mono)' }}>
          <div className="flex flex-col items-center gap-0.5" style={{ flex: 1 }}>
            <div ref={barARef} className="w-full rounded-sm" style={{ height: '3px', backgroundColor: OFF, transition: 'background-color 0.05s' }} />
            <span className="text-fg-32">A</span>
          </div>
          {type !== 'NOT' && (
            <div className="flex flex-col items-center gap-0.5" style={{ flex: 1 }}>
              <div ref={barBRef} className="w-full rounded-sm" style={{ height: '3px', backgroundColor: OFF, transition: 'background-color 0.05s' }} />
              <span className="text-fg-32">B</span>
            </div>
          )}
          <div className="flex flex-col items-center gap-0.5" style={{ flex: 1 }}>
            <div ref={barOutRef} className="w-full rounded-sm" style={{ height: '3px', backgroundColor: OFF, transition: 'background-color 0.05s' }} />
            <span className="text-fg-32">OUT</span>
          </div>
        </div>
      </div>

      {/* I/O at bottom */}
      <ModuleIO
        moduleId={id}
        onEnable={() => update('enabled', true)}
        busRef={busRef}
        outputs={[id]}
        inputs={[
          { label: 'A', active: !!inputAExpr, configKey: 'inputAExpr', onExprChange: (v) => update('inputAExpr', v) },
          { label: 'B', active: !!inputBExpr && type !== 'NOT', configKey: 'inputBExpr', onExprChange: (v) => update('inputBExpr', v) },
        ]}
      />
    </div>
  )
}
