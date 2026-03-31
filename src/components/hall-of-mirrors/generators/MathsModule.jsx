import { useEffect, useRef, useCallback } from 'react'
import RotaryDial from '../RotaryDial'
import Divider from '../../atoms/Divider'
import ExpressionInput from './ExpressionInput'
import ModuleIO from './ModuleIO'

const OUTPUT_KEYS = ['math1_ch1', 'math1_ch2', 'math1_sum', 'math1_inv', 'math1_eor', 'math1_eoc']

function drawOscilloscope(canvas, ch1Val, ch2Val) {
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const w = canvas.width
  const h = canvas.height
  const hist = canvas._hist || (canvas._hist = { ch1: new Float32Array(w), ch2: new Float32Array(w) })

  hist.ch1.copyWithin(0, 1)
  hist.ch1[w - 1] = ch1Val
  hist.ch2.copyWithin(0, 1)
  hist.ch2[w - 1] = ch2Val

  ctx.clearRect(0, 0, w, h)

  // Grid
  ctx.strokeStyle = 'rgba(255,255,255,0.06)'
  ctx.lineWidth = 1
  for (let i = 1; i < 4; i++) {
    const y = Math.round(h * i / 4) + 0.5
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke()
  }

  // Ch1 (red)
  ctx.strokeStyle = '#e74c3c'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  for (let x = 0; x < w; x++) {
    const y = (1 - hist.ch1[x] / 100) * (h - 2) + 1
    if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
  }
  ctx.stroke()

  // Ch2 (blue)
  ctx.strokeStyle = '#3498db'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  for (let x = 0; x < w; x++) {
    const y = (1 - hist.ch2[x] / 100) * (h - 2) + 1
    if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
  }
  ctx.stroke()
}

function processChannel(state, signalVal, triggerFired, rise, fall, dt) {
  // Determine mode based on what's connected
  const hasSignal = state.hasSignal
  const hasTrigger = state.hasTrigger

  let val = state.value
  let eor = 0
  let eoc = 0

  if (!hasTrigger && !hasSignal) {
    // Free-running LFO mode: rise then fall, repeat
    if (state.rising) {
      val += (100 / Math.max(0.01, rise)) * dt
      if (val >= 100) { val = 100; state.rising = false; eor = 100 }
    } else {
      val -= (100 / Math.max(0.01, fall)) * dt
      if (val <= 0) { val = 0; state.rising = true; eoc = 100 }
    }
  } else if (hasTrigger && !hasSignal) {
    // Triggered envelope mode
    if (triggerFired) { state.rising = true }
    if (state.rising) {
      val += (100 / Math.max(0.01, rise)) * dt
      if (val >= 100) { val = 100; state.rising = false; eor = 100 }
    } else if (val > 0) {
      val -= (100 / Math.max(0.01, fall)) * dt
      if (val <= 0) { val = 0; eoc = 100 }
    }
  } else if (hasSignal && !hasTrigger) {
    // Slew limiter mode
    const target = signalVal
    if (target > val) {
      val += (100 / Math.max(0.01, rise)) * dt
      if (val > target) val = target
    } else if (target < val) {
      val -= (100 / Math.max(0.01, fall)) * dt
      if (val < target) val = target
    }
  } else {
    // Both: triggered slew to signal value
    if (triggerFired) { state.rising = true; state.target = signalVal }
    if (state.rising) {
      const target = state.target ?? 100
      if (val < target) {
        val += (100 / Math.max(0.01, rise)) * dt
        if (val >= target) { val = target; state.rising = false; eor = 100 }
      } else {
        state.rising = false
        eor = 100
      }
    } else if (val > 0) {
      val -= (100 / Math.max(0.01, fall)) * dt
      if (val <= 0) { val = 0; eoc = 100 }
    }
  }

  state.value = Math.max(0, Math.min(100, val))
  return { val: state.value, eor, eoc }
}

export default function MathsModule({ id = 'math1', label = 'MATHS', config, onChange, busRef }) {
  const {
    ch1Rise = 0.5, ch1Fall = 0.5, ch1SignalExpr = '', ch1TriggerExpr = '',
    ch2Rise = 0.5, ch2Fall = 0.5, ch2SignalExpr = '', ch2TriggerExpr = '',
    enabled = false,
  } = config || {}

  const rafRef = useRef(null)
  const canvasRef = useRef(null)
  const valRef = useRef(null)
  const ch1State = useRef({ value: 0, rising: true, target: 100, hasSignal: false, hasTrigger: false })
  const ch2State = useRef({ value: 0, rising: true, target: 100, hasSignal: false, hasTrigger: false })
  const ch1SignalRef = useRef(0)
  const ch2SignalRef = useRef(0)
  const ch1TrigRef = useRef(false)
  const ch2TrigRef = useRef(false)

  // Track what's connected
  useEffect(() => {
    ch1State.current.hasSignal = !!ch1SignalExpr
    ch1State.current.hasTrigger = !!ch1TriggerExpr
    ch2State.current.hasSignal = !!ch2SignalExpr
    ch2State.current.hasTrigger = !!ch2TriggerExpr
  }, [ch1SignalExpr, ch1TriggerExpr, ch2SignalExpr, ch2TriggerExpr])

  useEffect(() => {
    if (!enabled) {
      OUTPUT_KEYS.forEach(k => { if (busRef?.current) busRef.current[k] = 0 })
      ch1State.current.value = 0
      ch2State.current.value = 0
      if (valRef.current) valRef.current.textContent = '—'
      return
    }

    // Init bus keys
    if (busRef?.current) {
      OUTPUT_KEYS.forEach(k => { if (!(k in busRef.current)) busRef.current[k] = 0 })
    }

    let lastTime = performance.now() / 1000

    const tick = () => {
      const now = performance.now() / 1000
      const dt = now - lastTime
      lastTime = now

      // Process channels
      const r1 = processChannel(ch1State.current, ch1SignalRef.current, ch1TrigRef.current, ch1Rise, ch1Fall, dt)
      ch1TrigRef.current = false
      const r2 = processChannel(ch2State.current, ch2SignalRef.current, ch2TrigRef.current, ch2Rise, ch2Fall, dt)
      ch2TrigRef.current = false

      const sum = Math.min(100, (r1.val + r2.val) / 2)
      const inv = 100 - sum

      const bus = busRef?.current
      if (bus) {
        bus.math1_ch1 = Math.round(r1.val)
        bus.math1_ch2 = Math.round(r2.val)
        bus.math1_sum = Math.round(sum)
        bus.math1_inv = Math.round(inv)
        bus.math1_eor = r1.eor || r2.eor ? 100 : 0
        bus.math1_eoc = r1.eoc || r2.eoc ? 100 : 0
      }

      if (valRef.current) valRef.current.textContent = `${Math.round(r1.val)}|${Math.round(r2.val)}`

      drawOscilloscope(canvasRef.current, r1.val, r2.val)

      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [enabled, ch1Rise, ch1Fall, ch2Rise, ch2Fall, busRef])

  const update = useCallback((key, val) => onChange?.({ ...config, [key]: val }), [config, onChange])

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
        {/* Ch1 */}
        <div className="kol-helper-xxs text-[#e74c3c]">CH 1</div>
        <ExpressionInput label="Signal" expr={ch1SignalExpr} onExprChange={(v) => update('ch1SignalExpr', v)} busRef={busRef} onValue={(v) => { ch1SignalRef.current = v }} />
        <ExpressionInput label="Trigger" expr={ch1TriggerExpr} onExprChange={(v) => update('ch1TriggerExpr', v)} busRef={busRef} onTrigger={() => { ch1TrigRef.current = true }} />
        <div className="flex items-center justify-around">
          <RotaryDial label="Rise" value={Math.round(ch1Rise / 5 * 100)} onChange={(v) => update('ch1Rise', Math.round(v / 100 * 5 * 100) / 100)} size={36} defaultValue={10} busRef={busRef} />
          <RotaryDial label="Fall" value={Math.round(ch1Fall / 5 * 100)} onChange={(v) => update('ch1Fall', Math.round(v / 100 * 5 * 100) / 100)} size={36} defaultValue={10} busRef={busRef} />
        </div>

        <Divider />

        {/* Ch2 */}
        <div className="kol-helper-xxs text-[#3498db]">CH 2</div>
        <ExpressionInput label="Signal" expr={ch2SignalExpr} onExprChange={(v) => update('ch2SignalExpr', v)} busRef={busRef} onValue={(v) => { ch2SignalRef.current = v }} />
        <ExpressionInput label="Trigger" expr={ch2TriggerExpr} onExprChange={(v) => update('ch2TriggerExpr', v)} busRef={busRef} onTrigger={() => { ch2TrigRef.current = true }} />
        <div className="flex items-center justify-around">
          <RotaryDial label="Rise" value={Math.round(ch2Rise / 5 * 100)} onChange={(v) => update('ch2Rise', Math.round(v / 100 * 5 * 100) / 100)} size={36} defaultValue={10} busRef={busRef} />
          <RotaryDial label="Fall" value={Math.round(ch2Fall / 5 * 100)} onChange={(v) => update('ch2Fall', Math.round(v / 100 * 5 * 100) / 100)} size={36} defaultValue={10} busRef={busRef} />
        </div>

        <Divider />

        {/* Oscilloscope */}
        <canvas
          ref={canvasRef}
          width={252}
          height={52}
          style={{ width: '100%', height: '52px', borderRadius: '3px', backgroundColor: 'var(--kol-surface-tertiary)', display: 'block' }}
        />

        {/* Output */}
        <div className="flex items-center justify-between kol-helper-xs">
          <span className="text-fg-32">Ch1|Ch2</span>
          <span ref={valRef} className="text-fg-64" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {enabled ? '0|0' : '—'}
          </span>
        </div>
      </div>

      <ModuleIO
        moduleId={id}
        onEnable={() => update('enabled', true)}
        busRef={busRef}
        outputs={OUTPUT_KEYS}
        inputs={[
          { label: 'ch1_sig', active: !!ch1SignalExpr, configKey: 'ch1SignalExpr', onExprChange: (v) => update('ch1SignalExpr', v) },
          { label: 'ch1_trg', active: !!ch1TriggerExpr, configKey: 'ch1TriggerExpr', onExprChange: (v) => update('ch1TriggerExpr', v) },
          { label: 'ch2_sig', active: !!ch2SignalExpr, configKey: 'ch2SignalExpr', onExprChange: (v) => update('ch2SignalExpr', v) },
          { label: 'ch2_trg', active: !!ch2TriggerExpr, configKey: 'ch2TriggerExpr', onExprChange: (v) => update('ch2TriggerExpr', v) },
        ]}
      />
    </div>
  )
}
