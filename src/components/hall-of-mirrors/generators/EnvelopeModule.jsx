import { useEffect, useRef, useCallback } from 'react'
import RotaryDial from '../RotaryDial'
import Divider from '../../atoms/Divider'
import ExpressionInput from './ExpressionInput'
import ModuleIO from './ModuleIO'

// States: 0=IDLE, 1=ATTACK, 2=DECAY, 3=SUSTAIN, 4=RELEASE
const IDLE = 0, ATTACK = 1, DECAY = 2, SUSTAIN = 3, RELEASE = 4

function drawOscilloscope(canvas, stateRef, valueRef) {
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const w = canvas.width
  const h = canvas.height
  const history = stateRef._history || (stateRef._history = new Float32Array(w).fill(0))

  // Shift left, add current value
  history.copyWithin(0, 1)
  history[w - 1] = valueRef.current

  ctx.clearRect(0, 0, w, h)

  // Grid
  ctx.strokeStyle = 'rgba(255,255,255,0.06)'
  ctx.lineWidth = 1
  for (let i = 1; i < 4; i++) {
    const y = Math.round(h * i / 4) + 0.5
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke()
  }

  // Waveform
  ctx.beginPath()
  ctx.strokeStyle = '#e74c3c'
  ctx.lineWidth = 1.5
  for (let x = 0; x < w; x++) {
    const y = (1 - history[x] / 100) * (h - 2) + 1
    if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
  }
  ctx.stroke()

  // State indicator
  const labels = ['IDLE', 'ATK', 'DEC', 'SUS', 'REL']
  const state = stateRef.current
  ctx.fillStyle = state === IDLE ? 'rgba(255,255,255,0.15)' : '#e74c3c'
  ctx.font = '9px monospace'
  ctx.fillText(labels[state] || '', 3, 10)
}

export default function EnvelopeModule({ id, label, config, onChange, busRef }) {
  const { attack = 0.1, decay = 0.3, sustain = 0.7, release = 0.5, triggerExpr = '', gateExpr = '', retrigger = false, enabled = false } = config
  const rafRef = useRef(null)
  const canvasRef = useRef(null)
  const valRef = useRef(null)
  const valueRef = useRef(0)
  const stateRef = useRef(IDLE)
  const stateTimeRef = useRef(0)
  const releaseFromRef = useRef(0)

  useEffect(() => {
    if (!enabled) {
      if (busRef?.current) { busRef.current[id] = 0; busRef.current[`${id}_eoc`] = 0 }
      valueRef.current = 0
      stateRef.current = IDLE
      if (valRef.current) valRef.current.textContent = '—'
      const canvas = canvasRef.current
      if (canvas) {
        const ctx = canvas.getContext('2d')
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.strokeStyle = 'rgba(255,255,255,0.08)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(0, canvas.height / 2)
        ctx.lineTo(canvas.width, canvas.height / 2)
        ctx.stroke()
      }
      return
    }

    // Initialize bus keys
    if (busRef?.current) {
      if (!(id in busRef.current)) busRef.current[id] = 0
      if (!(`${id}_eoc` in busRef.current)) busRef.current[`${id}_eoc`] = 0
    }

    let lastTime = performance.now() / 1000
    const susLevel = sustain * 100

    const tick = () => {
      const now = performance.now() / 1000
      const dt = now - lastTime
      lastTime = now

      stateTimeRef.current += dt
      const st = stateTimeRef.current
      let val = valueRef.current
      let eoc = 0

      const state = stateRef.current

      if (state === ATTACK) {
        val = attack > 0 ? Math.min(100, (st / attack) * 100) : 100
        if (st >= attack) {
          stateRef.current = DECAY
          stateTimeRef.current = 0
          val = 100
        }
      } else if (state === DECAY) {
        val = decay > 0 ? 100 - (100 - susLevel) * Math.min(1, st / decay) : susLevel
        if (st >= decay) {
          stateRef.current = SUSTAIN
          stateTimeRef.current = 0
          val = susLevel
        }
      } else if (state === SUSTAIN) {
        val = susLevel
        // Sustain holds until gate drops — handled by trigger/gate logic below
      } else if (state === RELEASE) {
        val = release > 0 ? releaseFromRef.current * Math.max(0, 1 - st / release) : 0
        if (st >= release) {
          stateRef.current = IDLE
          stateTimeRef.current = 0
          val = 0
          eoc = 100
        }
      }
      // IDLE: val stays at 0

      valueRef.current = val

      if (busRef?.current) {
        busRef.current[id] = Math.round(val)
        busRef.current[`${id}_eoc`] = eoc
      }
      if (valRef.current) valRef.current.textContent = Math.round(val)

      drawOscilloscope(canvasRef.current, stateRef, valueRef)

      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [enabled, attack, decay, sustain, release, id, busRef])

  // Trigger handler — called by ExpressionInput on rising edge
  const handleTrigger = useCallback(() => {
    if (!enabled) return
    const state = stateRef.current
    if (state === IDLE || retrigger) {
      stateRef.current = ATTACK
      stateTimeRef.current = 0
    }
  }, [enabled, retrigger])

  // Gate value handler — when gate drops below threshold, start release
  const handleGateValue = useCallback((val) => {
    if (!enabled) return
    if (stateRef.current === SUSTAIN && val <= 50) {
      releaseFromRef.current = valueRef.current
      stateRef.current = RELEASE
      stateTimeRef.current = 0
    }
  }, [enabled])

  const update = useCallback((key, val) => onChange({ ...config, [key]: val }), [config, onChange])

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
        {/* Trigger & Gate inputs */}
        <ExpressionInput
          label="Trigger"
          expr={triggerExpr}
          onExprChange={(v) => update('triggerExpr', v)}
          busRef={busRef}
          onTrigger={handleTrigger}
        />
        <ExpressionInput
          label="Gate"
          expr={gateExpr}
          onExprChange={(v) => update('gateExpr', v)}
          busRef={busRef}
          onValue={handleGateValue}
        />

        {/* Retrigger toggle */}
        <div className="flex items-center justify-between kol-helper-xs" style={{ height: '24px' }}>
          <span className="text-fg-64">Retrigger</span>
          <span
            className={`cursor-pointer select-none ${retrigger ? 'text-fg-96' : 'text-fg-32'}`}
            onClick={() => update('retrigger', !retrigger)}
          >
            {retrigger ? 'ON' : 'OFF'}
          </span>
        </div>

        <Divider />

        {/* ADSR Knobs */}
        <div className="flex items-center justify-around">
          <RotaryDial label="ATK" value={Math.round((attack - 0.01) / 1.99 * 100)} onChange={(v) => update('attack', Math.round((v / 100 * 1.99 + 0.01) * 100) / 100)} size={36} defaultValue={5} busRef={busRef} />
          <RotaryDial label="DEC" value={Math.round((decay - 0.01) / 1.99 * 100)} onChange={(v) => update('decay', Math.round((v / 100 * 1.99 + 0.01) * 100) / 100)} size={36} defaultValue={15} busRef={busRef} />
          <RotaryDial label="SUS" value={Math.round(sustain * 100)} onChange={(v) => update('sustain', v / 100)} size={36} defaultValue={70} busRef={busRef} />
          <RotaryDial label="REL" value={Math.round((release - 0.01) / 1.99 * 100)} onChange={(v) => update('release', Math.round((v / 100 * 1.99 + 0.01) * 100) / 100)} size={36} defaultValue={25} busRef={busRef} />
        </div>

        <Divider />

        {/* Oscilloscope */}
        <canvas
          ref={canvasRef}
          width={252}
          height={52}
          style={{ width: '100%', height: '52px', borderRadius: '3px', backgroundColor: 'var(--kol-surface-tertiary)', display: 'block' }}
        />

        {/* Output row */}
        <div className="flex items-center justify-between kol-helper-xs">
          <span className="text-fg-32">Output</span>
          <span ref={valRef} className="text-fg-64" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {enabled ? '0' : '—'}
          </span>
        </div>
      </div>

      <ModuleIO
        moduleId={id}
        onEnable={() => update('enabled', true)}
        busRef={busRef}
        outputs={[id, `${id}_eoc`]}
        inputs={[
          { label: 'trigger', active: !!triggerExpr, configKey: 'triggerExpr', onExprChange: (v) => update('triggerExpr', v) },
          { label: 'gate', active: !!gateExpr, configKey: 'gateExpr', onExprChange: (v) => update('gateExpr', v) },
        ]}
      />
    </div>
  )
}
