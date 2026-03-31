import { useEffect, useRef, useCallback } from 'react'
import RotaryDial from '../RotaryDial'
import Divider from '../../atoms/Divider'
import ExpressionInput from './ExpressionInput'
import ModuleIO from './ModuleIO'

function drawTimeline(canvas, historyRef) {
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const w = canvas.width
  const h = canvas.height
  const trig = historyRef.trigger
  const gate = historyRef.gate

  if (!trig || !gate) {
    historyRef.trigger = new Float32Array(w).fill(0)
    historyRef.gate = new Float32Array(w).fill(0)
    return
  }

  ctx.clearRect(0, 0, w, h)

  // Grid
  ctx.strokeStyle = 'rgba(255,255,255,0.06)'
  ctx.lineWidth = 1
  const midY = Math.round(h / 2) + 0.5
  ctx.beginPath(); ctx.moveTo(0, midY); ctx.lineTo(w, midY); ctx.stroke()

  // Trigger (top half, dim)
  ctx.strokeStyle = 'rgba(255,255,255,0.25)'
  ctx.lineWidth = 1
  ctx.beginPath()
  for (let x = 0; x < w; x++) {
    const y = trig[x] > 50 ? 3 : h / 2 - 3
    if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
  }
  ctx.stroke()

  // Gate output (bottom half, red)
  ctx.strokeStyle = '#e74c3c'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  for (let x = 0; x < w; x++) {
    const y = gate[x] > 50 ? h / 2 + 3 : h - 3
    if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
  }
  ctx.stroke()

  // Labels
  ctx.fillStyle = 'rgba(255,255,255,0.2)'
  ctx.font = '8px monospace'
  ctx.fillText('TRG', 2, 10)
  ctx.fillText('OUT', 2, h / 2 + 10)

  // Shift histories left
  trig.copyWithin(0, 1)
  gate.copyWithin(0, 1)
}

export default function GateModule({ id, label, config, onChange, busRef }) {
  const { triggerExpr = '', delay = 0, length = 0.2, repeat = 1, enabled = false } = config
  const rafRef = useRef(null)
  const canvasRef = useRef(null)
  const valRef = useRef(null)
  const historyRef = useRef({})

  // Gate state machine
  const gateStateRef = useRef({
    active: false,
    delaying: false,
    startTime: 0,
    repeatCount: 0,
    trigValue: 0,
  })

  useEffect(() => {
    if (!enabled) {
      if (busRef?.current) busRef.current[id] = 0
      if (valRef.current) valRef.current.textContent = '—'
      gateStateRef.current.active = false
      gateStateRef.current.delaying = false
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

    if (busRef?.current && !(id in busRef.current)) busRef.current[id] = 0

    const tick = () => {
      const now = performance.now() / 1000
      const gs = gateStateRef.current
      let output = 0

      if (gs.delaying) {
        if (now - gs.startTime >= delay) {
          gs.delaying = false
          gs.active = true
          gs.startTime = now
          gs.repeatCount = 0
        }
      }

      if (gs.active) {
        const elapsed = now - gs.startTime
        const cycleLen = length
        const currentCycle = Math.floor(elapsed / cycleLen)

        if (currentCycle >= repeat) {
          gs.active = false
          output = 0
        } else {
          output = 100
        }
      }

      if (busRef?.current) busRef.current[id] = output
      if (valRef.current) valRef.current.textContent = output > 0 ? '||' : '0'

      // Record history for timeline
      const hist = historyRef.current
      if (hist.trigger && hist.gate) {
        hist.trigger[hist.trigger.length - 1] = gs.trigValue
        hist.gate[hist.gate.length - 1] = output
      }

      drawTimeline(canvasRef.current, historyRef.current)

      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [enabled, delay, length, repeat, id, busRef])

  const handleTrigger = useCallback(() => {
    if (!enabled) return
    const gs = gateStateRef.current
    if (delay > 0) {
      gs.delaying = true
      gs.startTime = performance.now() / 1000
    } else {
      gs.active = true
      gs.startTime = performance.now() / 1000
      gs.repeatCount = 0
    }
  }, [enabled, delay])

  const handleTrigValue = useCallback((v) => {
    gateStateRef.current.trigValue = v
  }, [])

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
        {/* Trigger input */}
        <ExpressionInput
          label="Trigger"
          expr={triggerExpr}
          onExprChange={(v) => update('triggerExpr', v)}
          busRef={busRef}
          onTrigger={handleTrigger}
          onValue={handleTrigValue}
        />

        <Divider />

        {/* Knobs */}
        <div className="flex items-center justify-around">
          <RotaryDial
            label="Delay"
            value={Math.round(delay / 2 * 100)}
            onChange={(v) => update('delay', Math.round(v / 100 * 2 * 100) / 100)}
            size={36}
            defaultValue={0}
            busRef={busRef}
          />
          <RotaryDial
            label="Length"
            value={Math.round((length - 0.01) / 4.99 * 100)}
            onChange={(v) => update('length', Math.round((v / 100 * 4.99 + 0.01) * 100) / 100)}
            size={36}
            defaultValue={4}
            busRef={busRef}
          />
          <RotaryDial
            label="Repeat"
            value={Math.round((repeat - 1) / 15 * 100)}
            onChange={(v) => update('repeat', Math.round(v / 100 * 15) + 1)}
            size={36}
            defaultValue={0}
            busRef={busRef}
          />
        </div>

        <Divider />

        {/* Timeline */}
        <canvas
          ref={canvasRef}
          width={252}
          height={52}
          style={{ width: '100%', height: '52px', borderRadius: '3px', backgroundColor: 'var(--kol-surface-tertiary)', display: 'block' }}
        />

        {/* Output */}
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
        outputs={[id]}
        inputs={[
          { label: 'trigger', active: !!triggerExpr, configKey: 'triggerExpr', onExprChange: (v) => update('triggerExpr', v) },
        ]}
      />
    </div>
  )
}
