import { useEffect, useRef, useCallback } from 'react'
import RotaryDial from './RotaryDial'
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
  const dotRef = useRef(null)
  const inputVals = useRef([0, 0, 0, 0])

  useEffect(() => {
    if (!enabled) {
      if (busRef?.current) busRef.current[id] = 0
      if (valRef.current) valRef.current.textContent = '\u2014'
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

      // Pulse dot with output signal
      if (dotRef.current) {
        dotRef.current.style.opacity = output > 5 ? 1 : (enabled ? 0.6 : 0.15)
      }

      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [enabled, in1Expr, in2Expr, in3Expr, in4Expr, level1, level2, level3, level4, master, mode, id, busRef])

  const update = useCallback((key, val) => onChange?.({ ...config, [key]: val }), [config, onChange])

  const modeIdx = MIX_MODES.indexOf(mode)
  const prevMode = () => update('mode', MIX_MODES[(modeIdx - 1 + MIX_MODES.length) % MIX_MODES.length])
  const nextMode = () => update('mode', MIX_MODES[(modeIdx + 1) % MIX_MODES.length])

  const inputs = [
    { expr: in1Expr, key: 'in1Expr', level: level1, levelKey: 'level1', idx: 0 },
    { expr: in2Expr, key: 'in2Expr', level: level2, levelKey: 'level2', idx: 1 },
    { expr: in3Expr, key: 'in3Expr', level: level3, levelKey: 'level3', idx: 2 },
    { expr: in4Expr, key: 'in4Expr', level: level4, levelKey: 'level4', idx: 3 },
  ]

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
      <div className="flex flex-col gap-0.5 flex-1 py-1 px-1" style={{ overflow: 'hidden' }}>
        {/* 4 input rows: expression + small level knob */}
        {inputs.map((inp, i) => (
          <div key={i} className="flex items-center gap-1">
            <div className="flex-1" style={{ minWidth: 0 }}>
              <ExpressionInput
                label={`${i + 1}`}
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

        {/* Mix mode selector */}
        <div className="flex items-center gap-0.5 w-full justify-center" style={{ fontSize: '8px', fontFamily: 'var(--kol-font-mono)' }}>
          <span className="cursor-pointer text-fg-32 hover:text-fg-64 select-none" onClick={prevMode}>{'\u2039'}</span>
          <span className="text-fg-96" style={{ width: '28px', textAlign: 'center' }}>{mode}</span>
          <span className="cursor-pointer text-fg-32 hover:text-fg-64 select-none" onClick={nextMode}>{'\u203a'}</span>
        </div>

        {/* Master knob */}
        <div className="flex items-center justify-center">
          <RotaryDial
            label="Mst"
            value={master}
            onChange={(v) => update('master', v)}
            size={28}
            defaultValue={100}
            busRef={busRef}
            variant="dense"
          />
        </div>
      </div>

      {/* I/O at bottom */}
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
