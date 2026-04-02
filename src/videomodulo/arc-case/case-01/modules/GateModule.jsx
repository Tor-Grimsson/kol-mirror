import { useEffect, useRef, useCallback } from 'react'
import RotaryDial from './RotaryDial'
import ExpressionInput from './ExpressionInput'
import ModuleIO from './ModuleIO'

export default function GateModule({ id, label, config, onChange, busRef }) {
  const { triggerExpr = '', delay = 0, length = 0.2, repeat = 1, enabled = false } = config
  const rafRef = useRef(null)
  const valRef = useRef(null)
  const dotRef = useRef(null)

  // Gate state machine
  const gateStateRef = useRef({
    active: false,
    delaying: false,
    startTime: 0,
    repeatCount: 0,
    trigValue: 0,
  })

  useEffect(() => {
    if (!enabled) {
      if (busRef?.current) busRef.current[id] = 0
      if (valRef.current) valRef.current.textContent = '\u2014'
      gateStateRef.current.active = false
      gateStateRef.current.delaying = false
      return
    }

    if (busRef?.current && !(id in busRef.current)) busRef.current[id] = 0

    const tick = () => {
      const now = performance.now() / 1000
      const gs = gateStateRef.current
      let output = 0

      if (gs.delaying) {
        if (now - gs.startTime >= delay) {
          gs.delaying = false
          gs.active = true
          gs.startTime = now
          gs.repeatCount = 0
        }
      }

      if (gs.active) {
        const elapsed = now - gs.startTime
        const cycleLen = length
        const currentCycle = Math.floor(elapsed / cycleLen)

        if (currentCycle >= repeat) {
          gs.active = false
          output = 0
        } else {
          output = 100
        }
      }

      if (busRef?.current) busRef.current[id] = output
      if (valRef.current) valRef.current.textContent = output > 0 ? '||' : '0'

      // Pulse the red dot with output signal
      if (dotRef.current) {
        dotRef.current.style.opacity = output > 0 ? 1 : (enabled ? 0.6 : 0.15)
      }

      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [enabled, delay, length, repeat, id, busRef])

  const handleTrigger = useCallback(() => {
    if (!enabled) return
    const gs = gateStateRef.current
    if (delay > 0) {
      gs.delaying = true
      gs.startTime = performance.now() / 1000
    } else {
      gs.active = true
      gs.startTime = performance.now() / 1000
      gs.repeatCount = 0
    }
  }, [enabled, delay])

  const handleTrigValue = useCallback((v) => {
    gateStateRef.current.trigValue = v
  }, [])

  const update = useCallback((key, val) => onChange({ ...config, [key]: val }), [config, onChange])

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
        {/* Trigger expression */}
        <ExpressionInput
          label="Trig"
          expr={triggerExpr}
          onExprChange={(v) => update('triggerExpr', v)}
          busRef={busRef}
          onTrigger={handleTrigger}
          onValue={handleTrigValue}
        />

        {/* 3 knobs vertical */}
        <RotaryDial
          label="Dly"
          value={Math.round(delay / 2 * 100)}
          onChange={(v) => update('delay', Math.round(v / 100 * 2 * 100) / 100)}
          size={28}
          defaultValue={0}
          busRef={busRef}
          variant="dense"
        />
        <RotaryDial
          label="Len"
          value={Math.round((length - 0.01) / 4.99 * 100)}
          onChange={(v) => update('length', Math.round((v / 100 * 4.99 + 0.01) * 100) / 100)}
          size={28}
          defaultValue={4}
          busRef={busRef}
          variant="dense"
        />
        <RotaryDial
          label="Rpt"
          value={Math.round((repeat - 1) / 15 * 100)}
          onChange={(v) => update('repeat', Math.round(v / 100 * 15) + 1)}
          size={28}
          defaultValue={0}
          busRef={busRef}
          variant="dense"
        />
      </div>

      {/* I/O at bottom */}
      <ModuleIO
        moduleId={id}
        onEnable={() => update('enabled', true)}
        busRef={busRef}
        outputs={[id]}
        inputs={[
          { label: 'trigger', active: !!triggerExpr, configKey: 'triggerExpr', onExprChange: (v) => update('triggerExpr', v) },
        ]}
      />
    </div>
  )
}
