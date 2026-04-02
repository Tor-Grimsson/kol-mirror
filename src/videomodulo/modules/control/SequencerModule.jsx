// SequencerModule — 32-step sequencer with length, pagination, follow
// 12HP

import { useState, useRef, useCallback } from 'react'
import { useModule } from '../../hooks/useModuleRegistry.jsx'
import { scalar, readScalar } from '../../hooks/signals'
import Module from '../utility/Module'
import JackSocket from '../utility/JackSocket'
import { usePatchRouting } from '../../hooks/usePatchRouting.jsx'
import ModuleHeader from '../controls/ModuleHeader'
import Toggle from '../controls/Toggle'
import Knob from '../controls/Knob'

const STEPS_PER_PAGE = 8
const TOTAL_PAGES = 4
const TOTAL_STEPS = STEPS_PER_PAGE * TOTAL_PAGES
const GATE_DURATION = 0.03

function initSteps() {
  const s = new Array(TOTAL_STEPS)
  for (let i = 0; i < TOTAL_STEPS; i++) s[i] = Math.round(Math.random() * 100)
  return s
}

function StepGrid({ steps, page, currentStep, length, onChange }) {
  const offset = page * STEPS_PER_PAGE
  const pageSteps = steps.slice(offset, offset + STEPS_PER_PAGE)

  const handleDrag = useCallback((idx, e) => {
    e.preventDefault()
    const globalIdx = offset + idx
    const startY = e.clientY
    const startVal = steps[globalIdx]

    const handleMove = (e) => {
      const delta = (startY - e.clientY) * 0.8
      const next = Math.round(Math.max(0, Math.min(100, startVal + delta)))
      const newSteps = [...steps]
      newSteps[globalIdx] = next
      onChange(newSteps)
    }
    const handleUp = () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
    }
    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)
  }, [steps, offset, onChange])

  return (
    <div style={{ display: 'flex', gap: 1, alignItems: 'flex-end', flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 2, padding: 3, border: '1px solid rgba(255,255,255,0.04)' }}>
      {pageSteps.map((val, i) => {
        const globalIdx = offset + i
        const isActive = globalIdx === currentStep
        const outOfRange = globalIdx >= length
        return (
          <div
            key={i}
            onPointerDown={(e) => handleDrag(i, e)}
            style={{
              flex: 1,
              height: `${val}%`,
              minHeight: 2,
              backgroundColor: isActive ? '#e74c3c' : outOfRange ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.2)',
              borderRadius: 1,
              cursor: 'ns-resize',
              touchAction: 'none',
              transition: 'background-color 0.05s',
              opacity: outOfRange ? 0.4 : 1,
            }}
          />
        )
      })}
    </div>
  )
}

export default function SequencerModule({ id = 'seq1' }) {
  const [steps, setSteps] = useState(initSteps)
  const [currentStep, setCurrentStep] = useState(0)
  const [page, setPage] = useState(0)
  const [length, setLength] = useState(8)
  const [follow, setFollow] = useState(true)
  const [enabled, setEnabled] = useState(true)
  const routing = usePatchRouting()

  const enabledRef = useRef(true)
  const stepsRef = useRef(steps)
  const stepRef = useRef(0)
  const lengthRef = useRef(8)
  const prevClockRef = useRef(false)
  const prevResetRef = useRef(false)
  const gateTimerRef = useRef(0)
  const outRef = useRef(null)
  const gateOutRef = useRef(null)
  const clockInRef = useRef(null)
  const resetInRef = useRef(null)

  stepsRef.current = steps
  enabledRef.current = enabled
  lengthRef.current = length

  const conns = routing?.connections || []
  const clockConnected = conns.some(c => c.toModuleId === id && c.toPort === 'clock')
  const resetConnected = conns.some(c => c.toModuleId === id && c.toPort === 'reset')

  useModule({
    id,
    inputs: {
      clock: { type: 'scalar' },
      reset: { type: 'scalar' },
    },
    outputs: {
      out: { type: 'scalar' },
      gate: { type: 'scalar' },
    },
    process: (inputs, dt) => {
      if (!enabledRef.current) { outRef.current = null; gateOutRef.current = null; return { out: null, gate: null } }
      clockInRef.current = inputs.clock
      resetInRef.current = inputs.reset
      gateTimerRef.current = Math.max(0, gateTimerRef.current - dt)

      const len = lengthRef.current
      const clockHigh = readScalar(inputs.clock) > 50
      const resetHigh = readScalar(inputs.reset) > 50

      if (resetHigh && !prevResetRef.current) {
        stepRef.current = 0
        setCurrentStep(0)
      }
      if (clockHigh && !prevClockRef.current) {
        stepRef.current = (stepRef.current + 1) % len
        setCurrentStep(stepRef.current)
        gateTimerRef.current = GATE_DURATION
      }

      prevClockRef.current = clockHigh
      prevResetRef.current = resetHigh

      const out = scalar(stepsRef.current[stepRef.current])
      const gate = scalar(gateTimerRef.current > 0 ? 100 : 0)
      outRef.current = out
      gateOutRef.current = gate
      return { out, gate }
    },
  })

  // Follow playhead: auto-switch page to show active step
  if (follow) {
    const stepPage = Math.floor(currentStep / STEPS_PER_PAGE)
    if (stepPage !== page) setPage(stepPage)
  }

  const pageLabel = `${page + 1}/${TOTAL_PAGES}`

  return (
    <Module>
      <div style={{
        display: 'flex', flexDirection: 'column',
        height: '100%', padding: '4px 2px', gap: 4,
      }}>
        <ModuleHeader label="Seq" enabled={enabled} onToggle={() => setEnabled(!enabled)} />

        {/* Controls row: pagination + length + follow + randomize */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4, padding: '0 2px', userSelect: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <span
              onClick={() => setPage(p => p <= 0 ? TOTAL_PAGES - 1 : p - 1)}
              style={{ cursor: 'pointer', fontSize: '8px', color: 'rgba(255,255,255,0.4)', padding: '0 1px' }}
            >‹</span>
            <span style={{ fontSize: '7px', fontFamily: 'var(--kol-font-mono)', color: 'rgba(255,255,255,0.6)' }}>
              {pageLabel}
            </span>
            <span
              onClick={() => setPage(p => p >= TOTAL_PAGES - 1 ? 0 : p + 1)}
              style={{ cursor: 'pointer', fontSize: '8px', color: 'rgba(255,255,255,0.4)', padding: '0 1px' }}
            >›</span>
          </div>

          <Knob value={length} onChange={setLength} min={1} max={32} label="len" />
          <Toggle size="sm" value={follow} onChange={setFollow} label="fol" />
          <Toggle horizontal size="sm" value={false} onChange={() => {
            const newSteps = [...steps]
            const off = page * STEPS_PER_PAGE
            for (let i = 0; i < STEPS_PER_PAGE; i++) newSteps[off + i] = Math.round(Math.random() * 100)
            setSteps(newSteps)
          }} label="rnd" />
        </div>

        {/* Steps */}
        <StepGrid steps={steps} page={page} currentStep={currentStep} length={length} onChange={setSteps} />

        {/* Jacks: inputs left, outputs right, divider */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6 }}>
          <JackSocket type="in" port="clock" moduleId={id} active={clockConnected} signalRef={clockInRef} label="clk" />
          <JackSocket type="in" port="reset" moduleId={id} active={resetConnected} signalRef={resetInRef} label="rst" />
          <div style={{ width: 1, height: 16, backgroundColor: 'rgba(255,255,255,0.08)' }} />
          <JackSocket type="out" port="gate" moduleId={id} signalRef={gateOutRef} label="gate" />
          <JackSocket type="out" port="out" moduleId={id} signalRef={outRef} label="out" />
        </div>
      </div>
    </Module>
  )
}
