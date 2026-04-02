import { useEffect, useRef, useCallback } from 'react'
import Divider from './Divider'
import ExpressionInput from './ExpressionInput'
import ModuleIO from './ModuleIO'
import { compile } from '../hooks/useExpressionValue'

const GATE_TYPES = ['AND', 'OR', 'XOR', 'NOT', 'NAND']
const ON = '#e74c3c'
const OFF = 'rgba(255,255,255,0.10)'

export default function LogicModule({ id, label, config, onChange, busRef }) {
  const { type = 'AND', inputAExpr = '', inputBExpr = '', enabled = false } = config
  const rafRef = useRef(null)

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
      if (valRef.current) valRef.current.textContent = '—'
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
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [enabled, type, id, busRef])

  const update = useCallback((key, val) => onChange({ ...config, [key]: val }), [config, onChange])

  return (
    <div className="flex flex-col shrink-0 bg-surface-secondary border border-fg-08" style={{ width: '280px', borderRadius: '4px' }}>
      {/* Header */}
      <div className="flex items-center justify-between kol-helper-xs px-3 border-b border-fg-08" style={{ height: '29px' }}>
        <span className="flex items-center gap-3">
          <span className="cursor-pointer select-none" onClick={() => update('enabled', !enabled)}>
            <div className={`w-2 h-2 rounded-full ${enabled ? 'bg-[#e74c3c]' : 'bg-fg-24'}`} />
          </span>
          <span className={enabled ? 'text-fg-96' : 'text-fg-32'}>{label}</span>
        </span>
        <span className="text-fg-32 kol-helper-xxs">{id}</span>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-3 p-3">
        {/* Type buttons */}
        <div className="flex items-center gap-1">
          {GATE_TYPES.map(g => (
            <button
              key={g}
              className={`flex-1 kol-helper-xxs py-0.5 rounded-sm cursor-pointer border ${
                type === g
                  ? 'bg-[#e74c3c] text-fg-96 border-[#e74c3c]'
                  : 'bg-transparent text-fg-32 border-fg-08 hover:text-fg-64'
              }`}
              onClick={() => update('type', g)}
            >
              {g}
            </button>
          ))}
        </div>

        {/* Expression inputs */}
        <ExpressionInput
          label="Input A"
          expr={inputAExpr}
          onExprChange={(v) => update('inputAExpr', v)}
          busRef={busRef}
          onValue={(v) => { aValRef.current = v }}
        />
        {type !== 'NOT' && (
          <ExpressionInput
            label="Input B"
            expr={inputBExpr}
            onExprChange={(v) => update('inputBExpr', v)}
            busRef={busRef}
            onValue={(v) => { bValRef.current = v }}
          />
        )}

        <Divider />

        {/* Live signal flow: A  B → OUT */}
        <div className="flex items-end gap-2">
          <div className="flex flex-col items-center gap-1" style={{ flex: 1 }}>
            <div ref={barARef} className="w-full rounded-sm" style={{ height: '3px', backgroundColor: OFF, transition: 'background-color 0.05s' }} />
            <span className="kol-helper-xxs text-fg-32">A</span>
          </div>
          {type !== 'NOT' && (
            <div className="flex flex-col items-center gap-1" style={{ flex: 1 }}>
              <div ref={barBRef} className="w-full rounded-sm" style={{ height: '3px', backgroundColor: OFF, transition: 'background-color 0.05s' }} />
              <span className="kol-helper-xxs text-fg-32">B</span>
            </div>
          )}
          <span className="kol-helper-xxs text-fg-24 mb-3">→</span>
          <div className="flex flex-col items-center gap-1" style={{ flex: 1 }}>
            <div ref={barOutRef} className="w-full rounded-sm" style={{ height: '3px', backgroundColor: OFF, transition: 'background-color 0.05s' }} />
            <span className="kol-helper-xxs text-fg-32">OUT</span>
          </div>
        </div>

        {/* Output value */}
        <div className="flex items-center justify-between kol-helper-xs">
          <span className="text-fg-32">Output</span>
          <span ref={valRef} className="text-fg-64" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {enabled ? '0' : '—'}
          </span>
        </div>
      </div>

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
