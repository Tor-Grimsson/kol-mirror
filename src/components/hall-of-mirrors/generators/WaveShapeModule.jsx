import { useEffect, useRef, useCallback } from 'react'
import RotaryDial from '../RotaryDial'
import JackSocket from './JackSocket'
import ModuleIO from './ModuleIO'

const SHAPES = ['CLIP', 'FOLD', 'WRAP', 'SINE']

function applyShape(signal, shape, drive) {
  // Normalize to -1..1 range, apply shaping, return 0..100
  const norm = (signal / 50) - 1 // -1..1
  const driven = norm * (1 + drive * 4) // drive amplifies before shaping

  let shaped = 0
  if (shape === 'CLIP') {
    shaped = Math.max(-1, Math.min(1, driven))
  } else if (shape === 'FOLD') {
    // Triangle fold: wrap signal back when it exceeds bounds
    let v = driven
    while (v > 1 || v < -1) {
      if (v > 1) v = 2 - v
      if (v < -1) v = -2 - v
    }
    shaped = v
  } else if (shape === 'WRAP') {
    // Modulo wrap
    let v = ((driven % 2) + 2) % 2 // 0..2
    shaped = v - 1 // -1..1
  } else if (shape === 'SINE') {
    // Sine waveshaping
    shaped = Math.sin(driven * Math.PI * 0.5)
  }

  return Math.max(0, Math.min(100, (shaped + 1) * 50))
}

export default function WaveShapeModule({ id = 'wshp1', label = 'WSHP', config, onChange, busRef }) {
  const { inExpr = '', shape = 'CLIP', drive = 50, enabled = false } = config || {}
  const rafRef = useRef(null)
  const dotRef = useRef(null)
  const inputVal = useRef(0)

  useEffect(() => {
    if (!enabled) {
      if (busRef?.current) busRef.current[`${id}_out`] = 0
      return
    }

    if (busRef?.current && !(`${id}_out` in busRef.current)) busRef.current[`${id}_out`] = 0

    const tick = () => {
      const signal = inputVal.current
      const driveNorm = drive / 100
      const output = applyShape(signal, shape, driveNorm)

      if (busRef?.current) busRef.current[`${id}_out`] = Math.round(output)

      if (dotRef.current) {
        dotRef.current.style.opacity = output > 5 ? 1 : (enabled ? 0.4 : 0.15)
      }

      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [enabled, shape, drive, id, busRef])

  const update = useCallback((key, val) => onChange?.({ ...config, [key]: val }), [config, onChange])

  const shapeIdx = SHAPES.indexOf(shape)
  const prevShape = () => update('shape', SHAPES[(shapeIdx - 1 + SHAPES.length) % SHAPES.length])
  const nextShape = () => update('shape', SHAPES[(shapeIdx + 1) % SHAPES.length])

  return (
    <div className="flex flex-col h-full bg-surface-secondary border-r border-fg-08">
      {/* Header 20px */}
      <div className="flex items-center justify-between px-2 border-b border-fg-08" style={{ height: '20px', minHeight: '20px' }}>
        <span className="flex items-center gap-1.5">
          <span ref={dotRef} className="cursor-pointer select-none" onClick={() => update('enabled', !enabled)}
            style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#e74c3c', outline: '6px solid transparent', outlineOffset: '0', opacity: 1, boxShadow: enabled ? '0 0 6px 2px #e74c3c' : 'none' }} />
          <span className="text-fg-96" style={{ fontSize: '9px', fontFamily: 'var(--kol-font-mono)' }}>{label}</span>
        </span>
      </div>
      {/* Input jacks */}
      <div className="flex items-center justify-center gap-2 py-2">
        <JackSocket type="in" moduleId={id} configKey="inExpr" onExprChange={(v) => update('inExpr', v)} active={!!inExpr} busRef={busRef} label="IN" size="md" />
      </div>
      {/* Controls */}
      <div className="flex flex-col items-center gap-1 flex-1 py-1 px-1" style={{ overflow: 'hidden' }}>
        {/* Shape selector */}
        <div className="flex items-center gap-0.5 w-full justify-center" style={{ fontSize: '8px', fontFamily: 'var(--kol-font-mono)' }}>
          <span className="cursor-pointer text-fg-32 hover:text-fg-64 select-none" onClick={prevShape}>{'\u2039'}</span>
          <span className="text-fg-96" style={{ width: '32px', textAlign: 'center' }}>{shape}</span>
          <span className="cursor-pointer text-fg-32 hover:text-fg-64 select-none" onClick={nextShape}>{'\u203a'}</span>
        </div>
        <RotaryDial label="Drv" value={drive} onChange={(v) => update('drive', v)} size={32} defaultValue={50} busRef={busRef} />
      </div>
      {/* Output jacks */}
      <div className="flex items-center justify-center gap-2 py-2">
        <JackSocket type="out" busKey={`${id}_out`} moduleId={id} onEnable={() => update('enabled', true)} busRef={busRef} label="OUT" size="md" />
      </div>
      <ModuleIO moduleId={id} onEnable={() => update('enabled', true)} busRef={busRef}
        outputs={[`${id}_out`]}
        inputs={[
          { label: 'in', active: !!inExpr, configKey: 'inExpr', onExprChange: (v) => update('inExpr', v) },
        ]} />
    </div>
  )
}
