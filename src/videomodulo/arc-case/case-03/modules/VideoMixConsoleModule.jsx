import { useEffect, useRef, useCallback } from 'react'
import RotaryDial from './RotaryDial'
import ExpressionInput from './ExpressionInput'
import ModuleIO from './ModuleIO'

export default function VideoMixConsoleModule({ id = 'vmx1', label = 'CONSOLE', config, onChange, busRef }) {
  const {
    in1Expr = '', in2Expr = '', in3Expr = '', in4Expr = '',
    level1 = 100, level2 = 100, level3 = 100, level4 = 100,
    aux1Send1 = 0, aux1Send2 = 0, aux1Send3 = 0, aux1Send4 = 0,
    aux2Send1 = 0, aux2Send2 = 0, aux2Send3 = 0, aux2Send4 = 0,
    auxReturn1Expr = '', auxReturn2Expr = '',
    master = 100,
    enabled = false,
  } = config || {}

  const rafRef = useRef(null)
  const dotRef = useRef(null)
  const inputVals = useRef([0, 0, 0, 0])
  const auxReturn1ValRef = useRef(0)
  const auxReturn2ValRef = useRef(0)

  useEffect(() => {
    if (!enabled) {
      if (busRef?.current) {
        busRef.current[`${id}_out`] = 0
        busRef.current[`${id}_aux1`] = 0
        busRef.current[`${id}_aux2`] = 0
      }
      return
    }

    if (busRef?.current) {
      if (!(`${id}_out` in busRef.current)) busRef.current[`${id}_out`] = 0
      if (!(`${id}_aux1` in busRef.current)) busRef.current[`${id}_aux1`] = 0
      if (!(`${id}_aux2` in busRef.current)) busRef.current[`${id}_aux2`] = 0
    }

    const levels = [level1, level2, level3, level4]
    const aux1Sends = [aux1Send1, aux1Send2, aux1Send3, aux1Send4]
    const aux2Sends = [aux2Send1, aux2Send2, aux2Send3, aux2Send4]

    const tick = () => {
      const vals = inputVals.current

      // Master mix: sum of (input * level)
      let masterSum = 0
      for (let i = 0; i < 4; i++) {
        masterSum += vals[i] * (levels[i] / 100)
      }
      // Add aux returns to master
      masterSum += auxReturn1ValRef.current + auxReturn2ValRef.current
      const masterOut = Math.max(0, Math.min(100, Math.round(masterSum * (master / 100))))

      // Aux 1 bus: sum of (input * aux1Send)
      let aux1Sum = 0
      for (let i = 0; i < 4; i++) {
        aux1Sum += vals[i] * (aux1Sends[i] / 100)
      }
      const aux1Out = Math.max(0, Math.min(100, Math.round(aux1Sum)))

      // Aux 2 bus: sum of (input * aux2Send)
      let aux2Sum = 0
      for (let i = 0; i < 4; i++) {
        aux2Sum += vals[i] * (aux2Sends[i] / 100)
      }
      const aux2Out = Math.max(0, Math.min(100, Math.round(aux2Sum)))

      if (busRef?.current) {
        busRef.current[`${id}_out`] = masterOut
        busRef.current[`${id}_aux1`] = aux1Out
        busRef.current[`${id}_aux2`] = aux2Out
      }

      if (dotRef.current) {
        dotRef.current.style.opacity = masterOut > 5 ? 1 : (enabled ? 0.6 : 0.15)
      }

      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [enabled, level1, level2, level3, level4, aux1Send1, aux1Send2, aux1Send3, aux1Send4, aux2Send1, aux2Send2, aux2Send3, aux2Send4, auxReturn1Expr, auxReturn2Expr, master, id, busRef])

  const update = useCallback((key, val) => onChange?.({ ...config, [key]: val }), [config, onChange])

  const channels = [
    { expr: in1Expr, exprKey: 'in1Expr', level: level1, levelKey: 'level1', a1: aux1Send1, a1Key: 'aux1Send1', a2: aux2Send1, a2Key: 'aux2Send1', idx: 0 },
    { expr: in2Expr, exprKey: 'in2Expr', level: level2, levelKey: 'level2', a1: aux1Send2, a1Key: 'aux1Send2', a2: aux2Send2, a2Key: 'aux2Send2', idx: 1 },
    { expr: in3Expr, exprKey: 'in3Expr', level: level3, levelKey: 'level3', a1: aux1Send3, a1Key: 'aux1Send3', a2: aux2Send3, a2Key: 'aux2Send3', idx: 2 },
    { expr: in4Expr, exprKey: 'in4Expr', level: level4, levelKey: 'level4', a1: aux1Send4, a1Key: 'aux1Send4', a2: aux2Send4, a2Key: 'aux2Send4', idx: 3 },
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
        {/* 4 channel strips */}
        {channels.map((ch, i) => (
          <div key={i} className="flex items-center gap-0.5">
            <div className="flex-1" style={{ minWidth: 0 }}>
              <ExpressionInput
                label={`${i + 1}`}
                expr={ch.expr}
                onExprChange={(v) => update(ch.exprKey, v)}
                busRef={busRef}
                onValue={(v) => { inputVals.current[ch.idx] = v }}
              />
            </div>
            <RotaryDial
              label=""
              value={ch.level}
              onChange={(v) => update(ch.levelKey, v)}
              size={28}
              defaultValue={100}
              busRef={busRef}
              variant="dense"
            />
            <RotaryDial
              label=""
              value={ch.a1}
              onChange={(v) => update(ch.a1Key, v)}
              size={28}
              defaultValue={0}
              busRef={busRef}
              variant="dense"
            />
            <RotaryDial
              label=""
              value={ch.a2}
              onChange={(v) => update(ch.a2Key, v)}
              size={28}
              defaultValue={0}
              busRef={busRef}
              variant="dense"
            />
          </div>
        ))}

        {/* Column labels */}
        <div className="flex items-center gap-0.5 px-0.5" style={{ fontSize: '6px', fontFamily: 'var(--kol-font-mono)' }}>
          <span className="flex-1 text-fg-32" style={{ minWidth: 0 }}></span>
          <span className="text-fg-32" style={{ width: '28px', textAlign: 'center' }}>LVL</span>
          <span className="text-fg-32" style={{ width: '28px', textAlign: 'center' }}>AX1</span>
          <span className="text-fg-32" style={{ width: '28px', textAlign: 'center' }}>AX2</span>
        </div>

        {/* Aux returns */}
        <div className="flex items-center gap-1">
          <div className="flex-1" style={{ minWidth: 0 }}>
            <ExpressionInput
              label="R1"
              expr={auxReturn1Expr}
              onExprChange={(v) => update('auxReturn1Expr', v)}
              busRef={busRef}
              onValue={(v) => { auxReturn1ValRef.current = v }}
            />
          </div>
          <div className="flex-1" style={{ minWidth: 0 }}>
            <ExpressionInput
              label="R2"
              expr={auxReturn2Expr}
              onExprChange={(v) => update('auxReturn2Expr', v)}
              busRef={busRef}
              onValue={(v) => { auxReturn2ValRef.current = v }}
            />
          </div>
        </div>

        {/* Master knob */}
        <div className="flex items-center justify-center">
          <RotaryDial
            label="Mst"
            value={master}
            onChange={(v) => update('master', v)}
            size={32}
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
        outputs={[`${id}_out`, `${id}_aux1`, `${id}_aux2`]}
        inputs={[
          { label: '1', active: !!in1Expr, configKey: 'in1Expr', onExprChange: (v) => update('in1Expr', v) },
          { label: '2', active: !!in2Expr, configKey: 'in2Expr', onExprChange: (v) => update('in2Expr', v) },
          { label: '3', active: !!in3Expr, configKey: 'in3Expr', onExprChange: (v) => update('in3Expr', v) },
          { label: '4', active: !!in4Expr, configKey: 'in4Expr', onExprChange: (v) => update('in4Expr', v) },
          { label: 'R1', active: !!auxReturn1Expr, configKey: 'auxReturn1Expr', onExprChange: (v) => update('auxReturn1Expr', v) },
          { label: 'R2', active: !!auxReturn2Expr, configKey: 'auxReturn2Expr', onExprChange: (v) => update('auxReturn2Expr', v) },
        ]}
      />
    </div>
  )
}
