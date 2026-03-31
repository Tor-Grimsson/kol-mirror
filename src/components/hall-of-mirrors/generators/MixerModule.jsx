import { useEffect, useRef, useCallback } from 'react'
import RotaryDial from '../RotaryDial'
import Divider from '../../atoms/Divider'
import ExpressionInput from './ExpressionInput'
import ModuleIO from './ModuleIO'

const MIX_MODES = ['ADD', 'AVG', 'MAX', 'MIN']

export default function MixerModule({ id = 'mix1', label = 'MIXER', config, onChange, busRef }) {
  const {
    in1Expr = '', in2Expr = '', in3Expr = '', in4Expr = '',
    level1 = 100, level2 = 100, level3 = 100, level4 = 100,
    master = 100, mode = 'ADD', enabled = false,
  } = config || {}

  const rafRef = useRef(null)
  const valRef = useRef(null)
  const inputVals = useRef([0, 0, 0, 0])

  useEffect(() => {
    if (!enabled) {
      if (busRef?.current) busRef.current[id] = 0
      if (valRef.current) valRef.current.textContent = '—'
      return
    }

    if (busRef?.current && !(id in busRef.current)) busRef.current[id] = 0

    const levels = [level1, level2, level3, level4]
    const exprs = [in1Expr, in2Expr, in3Expr, in4Expr]

    const tick = () => {
      const vals = inputVals.current
      const scaled = vals.map((v, i) => v * (levels[i] / 100))
      const active = exprs.map((e, i) => e && scaled[i] !== undefined).filter(Boolean).length

      let output = 0
      if (mode === 'ADD') output = scaled.reduce((a, b) => a + b, 0)
      else if (mode === 'AVG') output = active > 0 ? scaled.reduce((a, b) => a + b, 0) / active : 0
      else if (mode === 'MAX') output = Math.max(...scaled)
      else if (mode === 'MIN') output = active > 0 ? Math.min(...scaled.filter((_, i) => exprs[i])) : 0

      output = Math.max(0, Math.min(100, output * (master / 100)))

      if (busRef?.current) busRef.current[id] = Math.round(output)
      if (valRef.current) valRef.current.textContent = Math.round(output)

      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [enabled, in1Expr, in2Expr, in3Expr, in4Expr, level1, level2, level3, level4, master, mode, id, busRef])

  const update = useCallback((key, val) => onChange?.({ ...config, [key]: val }), [config, onChange])

  const inputs = [
    { expr: in1Expr, key: 'in1Expr', level: level1, levelKey: 'level1', idx: 0 },
    { expr: in2Expr, key: 'in2Expr', level: level2, levelKey: 'level2', idx: 1 },
    { expr: in3Expr, key: 'in3Expr', level: level3, levelKey: 'level3', idx: 2 },
    { expr: in4Expr, key: 'in4Expr', level: level4, levelKey: 'level4', idx: 3 },
  ]

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
      <div className="flex flex-col gap-2 p-3">
        {/* 4 input rows */}
        {inputs.map((inp, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="flex-1">
              <ExpressionInput
                label={`In ${i + 1}`}
                expr={inp.expr}
                onExprChange={(v) => update(inp.key, v)}
                busRef={busRef}
                onValue={(v) => { inputVals.current[inp.idx] = v }}
              />
            </div>
            <RotaryDial
              label=""
              value={inp.level}
              onChange={(v) => update(inp.levelKey, v)}
              size={28}
              defaultValue={100}
              busRef={busRef}
              variant="dense"
            />
          </div>
        ))}

        <Divider />

        {/* Mode buttons */}
        <div className="flex items-center gap-1">
          {MIX_MODES.map(m => (
            <button
              key={m}
              className={`flex-1 kol-helper-xxs py-0.5 rounded-sm cursor-pointer border ${
                mode === m
                  ? 'bg-[#e74c3c] text-fg-96 border-[#e74c3c]'
                  : 'bg-transparent text-fg-32 border-fg-08 hover:text-fg-64'
              }`}
              onClick={() => update('mode', m)}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Master */}
        <div className="flex items-center justify-between">
          <span className="text-fg-64 kol-helper-xs">Master</span>
          <RotaryDial
            label=""
            value={master}
            onChange={(v) => update('master', v)}
            size={36}
            defaultValue={100}
            busRef={busRef}
          />
        </div>

        <Divider />

        {/* Output */}
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
          { label: 'in1', active: !!in1Expr, configKey: 'in1Expr', onExprChange: (v) => update('in1Expr', v) },
          { label: 'in2', active: !!in2Expr, configKey: 'in2Expr', onExprChange: (v) => update('in2Expr', v) },
          { label: 'in3', active: !!in3Expr, configKey: 'in3Expr', onExprChange: (v) => update('in3Expr', v) },
          { label: 'in4', active: !!in4Expr, configKey: 'in4Expr', onExprChange: (v) => update('in4Expr', v) },
        ]}
      />
    </div>
  )
}
