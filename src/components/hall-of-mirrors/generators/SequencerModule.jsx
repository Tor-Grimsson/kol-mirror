import { useEffect, useRef, useState, useCallback } from 'react'
import Divider from '../../atoms/Divider'
import ExpressionInput from './ExpressionInput'
import ModuleIO from './ModuleIO'

const STEP_COUNTS = [8, 12, 16, 24, 32, 48, 64]
const PAGE_SIZE = 16

const DIRECTIONS = [
  { value: 'forward', label: 'FWD' },
  { value: 'reverse', label: 'REV' },
  { value: 'pingpong', label: 'P-P' },
  { value: 'random', label: 'RND' },
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
          height: '56px',
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
  const { steps = [100, 75, 50, 25, 0, 25, 50, 75], direction = 'forward', clockExpr = 'clk1', resetExpr = '', enabled = false } = config
  const [currentStep, setCurrentStep] = useState(0)
  const [page, setPage] = useState(0)
  const dirRef = useRef(1)
  const valRef = useRef(null)
  const stepRef = useRef(0)

  // Clock trigger — advance step
  const handleClockTrigger = useCallback(() => {
    if (!enabled) return
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
      stepRef.current = next
      if (busRef?.current) {
        busRef.current[id] = val
        busRef.current[`${id}_gate`] = 100
        busRef.current[`${id}_step`] = Math.round(next / Math.max(1, len - 1) * 100)
      }
      if (valRef.current) valRef.current.textContent = val
      return next
    })
    // Gate off after a short window (next frame)
    requestAnimationFrame(() => {
      if (busRef?.current) busRef.current[`${id}_gate`] = 0
    })
  }, [enabled, steps, direction, id, busRef])

  // Reset trigger
  const handleResetTrigger = useCallback(() => {
    if (!enabled) return
    setCurrentStep(0)
    stepRef.current = 0
    dirRef.current = 1
  }, [enabled])

  // Initialize bus keys and handle disable
  useEffect(() => {
    if (busRef?.current) {
      if (!(id in busRef.current)) busRef.current[id] = 0
      if (!(`${id}_gate` in busRef.current)) busRef.current[`${id}_gate`] = 0
      if (!(`${id}_step` in busRef.current)) busRef.current[`${id}_step`] = 0
    }
    if (!enabled) {
      if (busRef?.current) { busRef.current[id] = 0; busRef.current[`${id}_gate`] = 0; busRef.current[`${id}_step`] = 0 }
      setCurrentStep(0)
      if (valRef.current) valRef.current.textContent = '—'
    }
  }, [enabled, id, busRef])

  const update = useCallback((key, val) => onChange({ ...config, [key]: val }), [config, onChange])

  const updateStep = useCallback((i, val) => {
    const next = [...steps]; next[i] = val; update('steps', next)
  }, [steps, update])

  const setStepCount = useCallback((count) => {
    const next = Array.from({ length: count }, (_, i) => steps[i] ?? Math.round(Math.random() * 100))
    update('steps', next)
    if (page * PAGE_SIZE >= count) setPage(0)
  }, [steps, update, page])

  const totalPages = Math.ceil(steps.length / PAGE_SIZE)
  const pageStart = page * PAGE_SIZE
  const pageSteps = steps.slice(pageStart, pageStart + PAGE_SIZE)

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
        {/* Clock & Reset inputs */}
        <ExpressionInput
          label="Clock"
          expr={clockExpr}
          onExprChange={(v) => update('clockExpr', v)}
          busRef={busRef}
          onTrigger={handleClockTrigger}
        />
        <ExpressionInput
          label="Reset"
          expr={resetExpr}
          onExprChange={(v) => update('resetExpr', v)}
          busRef={busRef}
          onTrigger={handleResetTrigger}
        />

        <Divider />

        {/* Step bars */}
        <div className="flex gap-1">
          {pageSteps.map((val, i) => (
            <StepBar
              key={pageStart + i}
              value={val}
              onChange={(v) => updateStep(pageStart + i, v)}
              active={enabled && (pageStart + i) === currentStep}
            />
          ))}
        </div>

        {/* Page indicators + step count */}
        <div className="flex items-center justify-between kol-helper-xxs">
          <div className="flex items-center gap-1">
            {totalPages > 1 && Array.from({ length: totalPages }, (_, i) => (
              <span
                key={i}
                className={`cursor-pointer ${page === i ? 'text-fg-96' : 'text-fg-24'}`}
                onClick={() => setPage(i)}
              >
                {i * PAGE_SIZE + 1}-{Math.min((i + 1) * PAGE_SIZE, steps.length)}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-1">
            {STEP_COUNTS.map(c => (
              <span
                key={c}
                className={`cursor-pointer ${steps.length === c ? 'text-[#e74c3c]' : 'text-fg-24'}`}
                onClick={() => setStepCount(c)}
              >
                {c}
              </span>
            ))}
          </div>
        </div>

        {/* Direction buttons */}
        <div className="flex items-center gap-1">
          {DIRECTIONS.map(d => (
            <button
              key={d.value}
              className={`flex-1 kol-helper-xxs py-0.5 rounded-sm cursor-pointer border ${
                direction === d.value
                  ? 'bg-[#e74c3c] text-fg-96 border-[#e74c3c]'
                  : 'bg-transparent text-fg-32 border-fg-08 hover:text-fg-64'
              }`}
              onClick={() => update('direction', d.value)}
            >
              {d.label}
            </button>
          ))}
        </div>

        {/* Output */}
        <div className="flex items-center justify-between kol-helper-xs">
          <span className="text-fg-32">Step {currentStep + 1}/{steps.length}</span>
          <span ref={valRef} className="text-fg-64" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {enabled ? '0' : '—'}
          </span>
        </div>
      </div>

      <ModuleIO
        moduleId={id}
        onEnable={() => update('enabled', true)}
        busRef={busRef}
        outputs={[id, `${id}_gate`, `${id}_step`]}
        inputs={[
          { label: 'clock', active: !!clockExpr, configKey: 'clockExpr', onExprChange: (v) => update('clockExpr', v) },
          { label: 'reset', active: !!resetExpr, configKey: 'resetExpr', onExprChange: (v) => update('resetExpr', v) },
        ]}
      />
    </div>
  )
}
