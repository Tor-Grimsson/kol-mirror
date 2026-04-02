import { useEffect, useRef, useCallback } from 'react'
import RotaryDial from './RotaryDial'
import ModuleIO from './ModuleIO'

export default function RandomSHModule({ id, label, config, onChange, busRef }) {
  const { rate = 2, min = 0, max = 100, smooth = 0, enabled = false } = config
  const rafRef = useRef(null)
  const startRef = useRef(performance.now() / 1000)
  const dotRef = useRef(null)
  const valRef = useRef(null)
  const historyRef = useRef([])
  const lastStepRef = useRef(-1)
  const currentValRef = useRef(0)
  const prevValRef = useRef(0)

  useEffect(() => {
    if (!enabled) {
      if (busRef) busRef.current[id] = 0
      if (valRef.current) valRef.current.textContent = '\u2014'
      historyRef.current = []
      lastStepRef.current = -1
      return
    }
    const start = startRef.current
    const tick = () => {
      const t = performance.now() / 1000 - start
      const stepIndex = Math.floor(t * rate)

      if (stepIndex !== lastStepRef.current) {
        lastStepRef.current = stepIndex
        prevValRef.current = currentValRef.current
        const newVal = min + Math.random() * (max - min)
        currentValRef.current = newVal
        historyRef.current.push({ t, v: newVal })
        // Keep history bounded
        if (historyRef.current.length > 64) {
          historyRef.current = historyRef.current.slice(-48)
        }
      }

      // Interpolate if smooth > 0
      const smoothFactor = smooth / 100
      let output
      if (smoothFactor > 0) {
        const stepProgress = (t * rate) % 1
        const blend = Math.min(1, stepProgress / Math.max(0.01, smoothFactor))
        output = prevValRef.current + (currentValRef.current - prevValRef.current) * blend
      } else {
        output = currentValRef.current
      }

      const val = Math.max(0, Math.min(100, Math.round(output)))
      if (busRef) busRef.current[id] = val
      if (valRef.current) valRef.current.textContent = val

      // Pulse dot with output signal
      if (dotRef.current) {
        dotRef.current.style.opacity = val > 5 ? 1 : 0.6
      }

      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [enabled, rate, min, max, smooth, id, busRef])

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

      {/* Controls - flex-1, vertical stack of 4 knobs */}
      <div className="flex flex-col items-center gap-1 flex-1 py-1 px-1" style={{ overflow: 'hidden' }}>
        <RotaryDial
          label="Rate"
          value={Math.round((rate - 0.1) / 19.9 * 100)}
          onChange={(v) => update('rate', Math.round((v / 100 * 19.9 + 0.1) * 10) / 10)}
          size={28}
          defaultValue={10}
          busRef={busRef}
          variant="dense"
        />
        <RotaryDial
          label="Min"
          value={min}
          onChange={(v) => update('min', v)}
          size={28}
          defaultValue={0}
          busRef={busRef}
          variant="dense"
        />
        <RotaryDial
          label="Max"
          value={max}
          onChange={(v) => update('max', v)}
          size={28}
          defaultValue={100}
          busRef={busRef}
          variant="dense"
        />
        <RotaryDial
          label="Smth"
          value={smooth}
          onChange={(v) => update('smooth', v)}
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
        inputs={[]}
      />
    </div>
  )
}
