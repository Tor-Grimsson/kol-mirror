import { useEffect, useRef, useCallback } from 'react'
import RotaryDial from '../RotaryDial'
import ExpressionInput from './ExpressionInput'
import ModuleIO from './ModuleIO'

export default function DelayModule({ id = 'dly1', label = 'DELAY', config, onChange, busRef }) {
  const { inputExpr = '', time = 25, feedback = 0, enabled = false } = config || {}
  const rafRef = useRef(null)
  const dotRef = useRef(null)
  const inputValRef = useRef(0)
  const bufferRef = useRef(new Float32Array(60).fill(0))
  const writeIdxRef = useRef(0)

  useEffect(() => {
    if (!enabled) {
      if (busRef?.current) busRef.current[`${id}_out`] = 0
      bufferRef.current.fill(0)
      writeIdxRef.current = 0
      return
    }

    if (busRef?.current && !(`${id}_out` in busRef.current)) busRef.current[`${id}_out`] = 0

    const tick = () => {
      // Map time knob (0-100) to 1-60 frames
      const delayFrames = Math.max(1, Math.round(1 + (time / 100) * 59))
      const buf = bufferRef.current
      const writeIdx = writeIdxRef.current
      const feedbackAmt = feedback / 100

      // Read from circular buffer
      const readIdx = (writeIdx - delayFrames + 60) % 60
      const delayed = buf[readIdx] || 0

      // Write input + feedback into buffer
      const input = inputValRef.current
      buf[writeIdx] = Math.max(0, Math.min(100, input + delayed * feedbackAmt))
      writeIdxRef.current = (writeIdx + 1) % 60

      const output = Math.max(0, Math.min(100, Math.round(delayed)))
      if (busRef?.current) busRef.current[`${id}_out`] = output

      if (dotRef.current) {
        dotRef.current.style.opacity = output > 5 ? 1 : (enabled ? 0.6 : 0.15)
      }

      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [enabled, time, feedback, id, busRef])

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
        {/* Input expression */}
        <ExpressionInput
          label="In"
          expr={inputExpr}
          onExprChange={(v) => update('inputExpr', v)}
          busRef={busRef}
          onValue={(v) => { inputValRef.current = v }}
        />

        {/* Time knob */}
        <RotaryDial
          label="Time"
          value={time}
          onChange={(v) => update('time', v)}
          size={32}
          defaultValue={25}
          busRef={busRef}
          variant="dense"
        />

        {/* Feedback knob */}
        <RotaryDial
          label="Fdbk"
          value={feedback}
          onChange={(v) => update('feedback', v)}
          size={32}
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
        outputs={[`${id}_out`]}
        inputs={[
          { label: 'in', active: !!inputExpr, configKey: 'inputExpr', onExprChange: (v) => update('inputExpr', v) },
        ]}
      />
    </div>
  )
}
