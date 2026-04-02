import { useEffect, useRef, useCallback } from 'react'
import ExpressionInput from './ExpressionInput'
import ModuleIO from './ModuleIO'

const DIVISIONS = [2, 3, 4, 5, 6, 7, 8, 16]

export default function ClockDivModule({ id = 'cdiv1', label = 'CDIV', config, onChange, busRef }) {
  const { clockExpr = '', division = 2, enabled = false } = config || {}
  const rafRef = useRef(null)
  const dotRef = useRef(null)
  const clockValRef = useRef(0)
  const prevClockHighRef = useRef(false)
  const edgeCountRef = useRef(0)
  const outputHighRef = useRef(false)
  const pulseFramesRef = useRef(0)

  useEffect(() => {
    if (!enabled) {
      if (busRef?.current) busRef.current[`${id}_out`] = 0
      edgeCountRef.current = 0
      outputHighRef.current = false
      prevClockHighRef.current = false
      pulseFramesRef.current = 0
      return
    }

    if (busRef?.current && !(`${id}_out` in busRef.current)) busRef.current[`${id}_out`] = 0

    const tick = () => {
      const clockHigh = clockValRef.current > 50
      const wasHigh = prevClockHighRef.current
      prevClockHighRef.current = clockHigh

      // Detect rising edge
      if (clockHigh && !wasHigh) {
        edgeCountRef.current++
        if (edgeCountRef.current >= division) {
          edgeCountRef.current = 0
          outputHighRef.current = true
          pulseFramesRef.current = 6 // ~100ms pulse at 60fps
        }
      }

      // Decay pulse
      if (outputHighRef.current) {
        pulseFramesRef.current--
        if (pulseFramesRef.current <= 0) {
          outputHighRef.current = false
        }
      }

      const output = outputHighRef.current ? 100 : 0
      if (busRef?.current) busRef.current[`${id}_out`] = output

      if (dotRef.current) {
        dotRef.current.style.opacity = output > 5 ? 1 : (enabled ? 0.6 : 0.15)
      }

      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [enabled, division, id, busRef])

  const update = useCallback((key, val) => onChange?.({ ...config, [key]: val }), [config, onChange])

  const divIdx = DIVISIONS.indexOf(division)
  const prevDiv = () => update('division', DIVISIONS[(divIdx - 1 + DIVISIONS.length) % DIVISIONS.length])
  const nextDiv = () => update('division', DIVISIONS[(divIdx + 1) % DIVISIONS.length])

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
        {/* Clock input expression */}
        <ExpressionInput
          label="Clk"
          expr={clockExpr}
          onExprChange={(v) => update('clockExpr', v)}
          busRef={busRef}
          onValue={(v) => { clockValRef.current = v }}
        />

        {/* Division selector */}
        <div className="flex items-center gap-0.5 w-full justify-center" style={{ fontSize: '8px', fontFamily: 'var(--kol-font-mono)' }}>
          <span className="cursor-pointer text-fg-32 hover:text-fg-64 select-none" onClick={prevDiv}>{'\u2039'}</span>
          <span className="text-fg-96" style={{ width: '28px', textAlign: 'center' }}>{`\u00f7${division}`}</span>
          <span className="cursor-pointer text-fg-32 hover:text-fg-64 select-none" onClick={nextDiv}>{'\u203a'}</span>
        </div>
      </div>

      {/* I/O at bottom */}
      <ModuleIO
        moduleId={id}
        onEnable={() => update('enabled', true)}
        busRef={busRef}
        outputs={[`${id}_out`]}
        inputs={[
          { label: 'clk', active: !!clockExpr, configKey: 'clockExpr', onExprChange: (v) => update('clockExpr', v) },
        ]}
      />
    </div>
  )
}
