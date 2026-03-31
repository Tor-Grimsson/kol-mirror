import { useEffect, useRef, useState, useCallback } from 'react'
import RotaryDial from '../RotaryDial'
import Dropdown from '../../molecules/Dropdown'
import Divider from '../../atoms/Divider'

const DIRECTIONS = [
  { value: 'forward', label: 'Forward' },
  { value: 'reverse', label: 'Reverse' },
  { value: 'pingpong', label: 'Ping-Pong' },
  { value: 'random', label: 'Random' },
]

const STEP_COUNTS = [
  { value: 4, label: '4 steps' },
  { value: 6, label: '6 steps' },
  { value: 8, label: '8 steps' },
  { value: 12, label: '12 steps' },
  { value: 16, label: '16 steps' },
]

function StepBar({ value, onChange, active }) {
  const trackRef = useRef(null)
  const dragging = useRef(false)

  const getVal = (clientY) => {
    const rect = trackRef.current.getBoundingClientRect()
    return Math.max(0, Math.min(100, Math.round((1 - (clientY - rect.top) / rect.height) * 100)))
  }

  return (
    <div className="flex flex-col items-center gap-1" style={{ flex: 1, minWidth: 0 }}>
      <div
        ref={trackRef}
        className="relative w-full cursor-pointer"
        style={{
          height: '68px',
          borderRadius: '2px',
          backgroundColor: 'rgba(255,255,255,0.06)',
          border: `1px solid ${active ? 'rgba(231,76,60,0.4)' : 'rgba(255,255,255,0.07)'}`,
          touchAction: 'none',
        }}
        onPointerDown={(e) => { e.preventDefault(); dragging.current = true; trackRef.current.setPointerCapture(e.pointerId); onChange(getVal(e.clientY)) }}
        onPointerMove={(e) => { if (dragging.current) onChange(getVal(e.clientY)) }}
        onPointerUp={() => { dragging.current = false }}
      >
        <div
          className="absolute bottom-0 left-0 right-0"
          style={{
            height: `${value}%`,
            borderRadius: '1px',
            backgroundColor: active ? '#e74c3c' : 'rgba(255,255,255,0.28)',
          }}
        />
      </div>
      <div style={{
        width: '4px', height: '4px', borderRadius: '50%',
        backgroundColor: active ? '#e74c3c' : 'rgba(255,255,255,0.15)',
      }} />
    </div>
  )
}

export default function SequencerModule({ id, label, config, onChange, busRef }) {
  const { steps = [100, 75, 50, 25, 0, 25, 50, 75], rate = 2, direction = 'forward', enabled = false } = config
  const [currentStep, setCurrentStep] = useState(0)
  const dirRef = useRef(1)
  const valRef = useRef(null)

  useEffect(() => {
    if (!enabled) {
      if (busRef) busRef.current[id] = 0
      setCurrentStep(0)
      if (valRef.current) valRef.current.textContent = '—'
      return
    }
    const intervalMs = Math.max(50, 1000 / rate)
    const iv = setInterval(() => {
      setCurrentStep(prev => {
        const len = steps.length
        let next
        if (direction === 'forward') next = (prev + 1) % len
        else if (direction === 'reverse') next = (prev - 1 + len) % len
        else if (direction === 'random') next = Math.floor(Math.random() * len)
        else {
          const n = prev + dirRef.current
          if (n >= len - 1) dirRef.current = -1
          if (n <= 0) dirRef.current = 1
          next = Math.max(0, Math.min(len - 1, n))
        }
        const val = steps[next] ?? 0
        if (busRef) busRef.current[id] = val
        if (valRef.current) valRef.current.textContent = val
        return next
      })
    }, intervalMs)
    return () => clearInterval(iv)
  }, [enabled, rate, direction, steps, id, busRef])

  const update = useCallback((key, val) => onChange({ ...config, [key]: val }), [config, onChange])

  const updateStep = useCallback((i, val) => {
    const next = [...steps]; next[i] = val; update('steps', next)
  }, [steps, update])

  const setStepCount = useCallback((count) => {
    const next = Array.from({ length: count }, (_, i) => steps[i] ?? Math.round(Math.random() * 100))
    update('steps', next)
  }, [steps, update])

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
        {/* Step bars */}
        <div className="flex gap-1">
          {steps.map((val, i) => (
            <StepBar key={i} value={val} onChange={(v) => updateStep(i, v)} active={enabled && i === currentStep} />
          ))}
        </div>

        <Divider />

        {/* Controls */}
        <div className="flex items-center gap-3">
          <RotaryDial
            label="Rate"
            value={Math.round(rate / 20 * 100)}
            onChange={(v) => update('rate', Math.round(v / 100 * 20 * 10) / 10)}
            size={36}
            defaultValue={10}
          />
          <div className="flex flex-col gap-1.5 flex-1">
            <Dropdown options={DIRECTIONS} value={direction} onChange={(v) => update('direction', v)} variant="minimal" size="md" />
            <Dropdown options={STEP_COUNTS} value={steps.length} onChange={(v) => setStepCount(Number(v))} variant="minimal" size="md" />
          </div>
        </div>

        {/* Output */}
        <div className="flex items-center justify-between kol-helper-xs">
          <span className="text-fg-32">Output</span>
          <span ref={valRef} className="text-fg-64" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {enabled ? '0' : '—'}
          </span>
        </div>
      </div>
    </div>
  )
}
