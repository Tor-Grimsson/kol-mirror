import { useEffect, useRef, useCallback } from 'react'
import RotaryDial from '../RotaryDial'
import ModuleIO from './ModuleIO'

const SIGNAL_SOURCES = [
  { value: 'lfo1', label: 'LFO 1' },
  { value: 'lfo2', label: 'LFO 2' },
  { value: 'seq1', label: 'SEQ 1' },
  { value: 'gate1', label: 'GATE 1' },
  { value: 'env1', label: 'ENV 1' },
  { value: 'sh1', label: 'S&H 1' },
]

const OUTPUT_KEYS = ['mult1_a', 'mult1_b', 'mult1_c']
const OUTPUT_LABELS = ['A', 'B', 'C']
const OUTPUT_COLORS = ['#e74c3c', '#3498db', '#2ecc71']

export default function MultiplesModule({ id, label, config, onChange, busRef }) {
  const { input = 'lfo1', outputs = [{ scale: 1, offset: 0 }, { scale: 0.5, offset: 50 }, { scale: -1, offset: 100 }], enabled = false } = config
  const rafRef = useRef(null)
  const dotRef = useRef(null)
  const valRefs = [useRef(null), useRef(null), useRef(null)]

  useEffect(() => {
    if (!enabled) {
      OUTPUT_KEYS.forEach(key => { if (busRef) busRef.current[key] = 0 })
      valRefs.forEach(ref => { if (ref.current) ref.current.textContent = '\u2014' })
      return
    }
    const tick = () => {
      const bus = busRef?.current
      if (bus) {
        const inputVal = bus[input] || 0
        outputs.forEach((out, i) => {
          const val = Math.max(0, Math.min(100, Math.round(inputVal * out.scale + out.offset)))
          bus[OUTPUT_KEYS[i]] = val
          if (valRefs[i].current) valRefs[i].current.textContent = val
        })

        // Pulse dot with input signal
        if (dotRef.current) {
          dotRef.current.style.opacity = inputVal > 5 ? 1 : 0.6
        }
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [enabled, input, outputs, busRef])

  const update = useCallback((key, val) => onChange({ ...config, [key]: val }), [config, onChange])

  const updateOutput = useCallback((idx, key, val) => {
    const next = outputs.map((o, i) => i === idx ? { ...o, [key]: val } : o)
    onChange({ ...config, outputs: next })
  }, [config, outputs, onChange])

  const srcIdx = SIGNAL_SOURCES.findIndex(s => s.value === input)
  const prevSrc = () => update('input', SIGNAL_SOURCES[(srcIdx - 1 + SIGNAL_SOURCES.length) % SIGNAL_SOURCES.length].value)
  const nextSrc = () => update('input', SIGNAL_SOURCES[(srcIdx + 1) % SIGNAL_SOURCES.length].value)
  const srcLabel = SIGNAL_SOURCES.find(s => s.value === input)?.label || input

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
        {/* Input source selector */}
        <div className="flex items-center gap-0.5 w-full justify-center" style={{ fontSize: '8px', fontFamily: 'var(--kol-font-mono)' }}>
          <span className="cursor-pointer text-fg-32 hover:text-fg-64 select-none" onClick={prevSrc}>{'\u2039'}</span>
          <span className="text-fg-96" style={{ width: '36px', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden' }}>{srcLabel}</span>
          <span className="cursor-pointer text-fg-32 hover:text-fg-64 select-none" onClick={nextSrc}>{'\u203a'}</span>
        </div>

        {/* 3 outputs: colored dot + scale knob */}
        {outputs.map((out, i) => (
          <div key={i} className="flex items-center gap-1 w-full">
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: OUTPUT_COLORS[i], flexShrink: 0 }} />
            <RotaryDial
              label={OUTPUT_LABELS[i]}
              value={Math.round((out.scale + 2) / 4 * 100)}
              onChange={(v) => updateOutput(i, 'scale', Math.round((v / 100 * 4 - 2) * 100) / 100)}
              size={28}
              defaultValue={75}
              busRef={busRef}
              variant="dense"
            />
          </div>
        ))}
      </div>

      {/* I/O at bottom */}
      <ModuleIO
        moduleId={id}
        onEnable={() => update('enabled', true)}
        busRef={busRef}
        outputs={OUTPUT_KEYS}
        inputs={[]}
      />
    </div>
  )
}
