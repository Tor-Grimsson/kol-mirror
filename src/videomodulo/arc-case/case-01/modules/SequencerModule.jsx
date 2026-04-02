import { useEffect, useRef, useState, useCallback } from 'react'
import ExpressionInput from './ExpressionInput'
import ModuleIO from './ModuleIO'
import JackSocket from './JackSocket'

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
    <div className="flex flex-col items-center gap-0.5" style={{ flex: 1, minWidth: 0 }}>
      <div
        ref={trackRef}
        className="relative w-full cursor-pointer"
        style={{
          height: '48px',
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
        width: '3px', height: '3px', borderRadius: '50%',
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

  // Clock trigger -- advance step
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

  // Direction selector
  const dirIdx = DIRECTIONS.findIndex(d => d.value === direction)
  const cycleDir = (delta) => {
    const next = (dirIdx + delta + DIRECTIONS.length) % DIRECTIONS.length
    update('direction', DIRECTIONS[next].value)
  }

  // Step count selector
  const scIdx = STEP_COUNTS.indexOf(steps.length)
  const cycleStepCount = (delta) => {
    const idx = scIdx < 0 ? 0 : (scIdx + delta + STEP_COUNTS.length) % STEP_COUNTS.length
    setStepCount(STEP_COUNTS[idx])
  }

  return (
    <div className="flex flex-col h-full border-r border-fg-08">
      {/* Header -- 20px */}
      <div className="flex items-center justify-between px-2 border-b border-fg-08 shrink-0" style={{ height: '20px', fontFamily: 'monospace', fontSize: '9px' }}>
        <span className="flex items-center gap-1.5">
          <span className="cursor-pointer select-none" onClick={() => update('enabled', !enabled)}>
            <div className={`rounded-full ${enabled ? 'bg-[#e74c3c]' : 'bg-fg-24'}`} style={{ width: '6px', height: '6px' }} />
          </span>
          <span className="text-fg-96">{label}</span>
        </span>
        <span className="flex items-center gap-2">
          <span className="text-fg-32" style={{ fontVariantNumeric: 'tabular-nums' }}>{currentStep + 1}/{steps.length}</span>
          <span ref={valRef} className="text-fg-64" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {enabled ? '0' : '—'}
          </span>
        </span>
      </div>

      {/* Controls -- flex-1 */}
      <div className="flex-1 flex flex-col p-2 gap-1.5 overflow-hidden">
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

        {/* Direction selector */}
        <div className="flex items-center justify-between" style={{ fontFamily: 'monospace', fontSize: '9px' }}>
          <span className="text-fg-32">DIR</span>
          <span className="flex items-center gap-1">
            <span className="cursor-pointer select-none text-fg-32 hover:text-fg-64" onClick={() => cycleDir(-1)}>{'\u2039'}</span>
            <span className="text-fg-96" style={{ minWidth: '24px', textAlign: 'center' }}>{DIRECTIONS[dirIdx]?.label || 'FWD'}</span>
            <span className="cursor-pointer select-none text-fg-32 hover:text-fg-64" onClick={() => cycleDir(1)}>{'\u203a'}</span>
          </span>
        </div>

        {/* Step count selector */}
        <div className="flex items-center justify-between" style={{ fontFamily: 'monospace', fontSize: '9px' }}>
          <span className="text-fg-32">STEPS</span>
          <span className="flex items-center gap-1">
            <span className="cursor-pointer select-none text-fg-32 hover:text-fg-64" onClick={() => cycleStepCount(-1)}>{'\u2039'}</span>
            <span className="text-fg-96" style={{ minWidth: '20px', textAlign: 'center' }}>{steps.length}</span>
            <span className="cursor-pointer select-none text-fg-32 hover:text-fg-64" onClick={() => cycleStepCount(1)}>{'\u203a'}</span>
          </span>
        </div>

        {/* Step bars -- compact 48px tall */}
        <div className="flex gap-0.5 flex-1" style={{ minHeight: '48px' }}>
          {pageSteps.map((val, i) => (
            <StepBar
              key={pageStart + i}
              value={val}
              onChange={(v) => updateStep(pageStart + i, v)}
              active={enabled && (pageStart + i) === currentStep}
            />
          ))}
        </div>

        {/* Page indicators */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-1" style={{ fontFamily: 'monospace', fontSize: '8px' }}>
            {Array.from({ length: totalPages }, (_, i) => (
              <span
                key={i}
                className={`cursor-pointer ${page === i ? 'text-fg-96' : 'text-fg-24'}`}
                onClick={() => setPage(i)}
              >
                {i + 1}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Inputs */}
      <div className="flex items-center justify-center gap-3 py-2">
        <JackSocket type="in" moduleId={id} configKey="clockExpr" onExprChange={(v) => update('clockExpr', v)} busRef={busRef} active={!!clockExpr} label="CLK" size="md" />
        <JackSocket type="in" moduleId={id} configKey="resetExpr" onExprChange={(v) => update('resetExpr', v)} busRef={busRef} active={!!resetExpr} label="RST" size="md" />
      </div>

      {/* Outputs */}
      <div className="flex items-center justify-center gap-3 py-2">
        <JackSocket type="out" busKey={id} moduleId={id} onEnable={() => update('enabled', true)} busRef={busRef} label="VAL" size="md" />
        <JackSocket type="out" busKey={`${id}_gate`} moduleId={id} onEnable={() => update('enabled', true)} busRef={busRef} label="GATE" size="md" />
        <JackSocket type="out" busKey={`${id}_step`} moduleId={id} onEnable={() => update('enabled', true)} busRef={busRef} label="STEP" size="md" />
      </div>

      <ModuleIO
        moduleId={id}
        onEnable={() => update('enabled', true)}
        busRef={busRef}
        outputs={[]}
        inputs={[]}
      />
    </div>
  )
}
