import { useEffect, useRef, useCallback } from 'react'
import RotaryDial from './RotaryDial'
import Dropdown from './Dropdown'
import Divider from './Divider'
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

function drawOscilloscope(canvas, busRef, inputKey, outputs, enabled) {
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const w = canvas.width
  const h = canvas.height
  ctx.clearRect(0, 0, w, h)

  if (!enabled) {
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(0, h / 2)
    ctx.lineTo(w, h / 2)
    ctx.stroke()
    return
  }

  // Grid lines
  ctx.strokeStyle = 'rgba(255,255,255,0.06)'
  ctx.lineWidth = 1
  for (let i = 1; i < 4; i++) {
    const y = Math.round(h * i / 4) + 0.5
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke()
  }

  const bus = busRef?.current
  if (!bus) return

  const inputVal = bus[inputKey] || 0

  // Draw input level as a dim horizontal bar
  const inputY = (1 - inputVal / 100) * (h - 2) + 1
  ctx.strokeStyle = 'rgba(255,255,255,0.15)'
  ctx.lineWidth = 1
  ctx.setLineDash([2, 2])
  ctx.beginPath()
  ctx.moveTo(0, inputY)
  ctx.lineTo(w, inputY)
  ctx.stroke()
  ctx.setLineDash([])

  // Draw output levels as colored horizontal bars
  outputs.forEach((out, i) => {
    const val = bus[OUTPUT_KEYS[i]] || 0
    const y = (1 - val / 100) * (h - 2) + 1
    ctx.strokeStyle = OUTPUT_COLORS[i]
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(w, y)
    ctx.stroke()
  })
}

export default function MultiplesModule({ id, label, config, onChange, busRef }) {
  const { input = 'lfo1', outputs = [{ scale: 1, offset: 0 }, { scale: 0.5, offset: 50 }, { scale: -1, offset: 100 }], enabled = false } = config
  const rafRef = useRef(null)
  const canvasRef = useRef(null)
  const valRefs = [useRef(null), useRef(null), useRef(null)]

  useEffect(() => {
    if (!enabled) {
      OUTPUT_KEYS.forEach(key => { if (busRef) busRef.current[key] = 0 })
      valRefs.forEach(ref => { if (ref.current) ref.current.textContent = '\u2014' })
      drawOscilloscope(canvasRef.current, busRef, input, outputs, false)
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
        drawOscilloscope(canvasRef.current, busRef, input, outputs, true)
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
        {/* Input selector */}
        <div className="flex items-center justify-between kol-helper-xs" style={{ height: '24px' }}>
          <span className="text-fg-64">Input</span>
          <Dropdown options={SIGNAL_SOURCES} value={input} onChange={(v) => update('input', v)} variant="minimal" size="md" />
        </div>

        <Divider />

        {/* Output rows */}
        {outputs.map((out, i) => (
          <div key={i} className="flex flex-col gap-2">
            <div className="flex items-center gap-2 kol-helper-xxs">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: OUTPUT_COLORS[i] }} />
              <span className="text-fg-64">Out {OUTPUT_LABELS[i]}</span>
              <span className="text-fg-32 ml-auto kol-helper-xxs">{OUTPUT_KEYS[i]}</span>
            </div>
            <div className="flex items-center justify-around">
              <RotaryDial
                label="Scale"
                value={Math.round((out.scale + 2) / 4 * 100)}
                onChange={(v) => updateOutput(i, 'scale', Math.round((v / 100 * 4 - 2) * 100) / 100)}
                size={36}
                defaultValue={75}
                busRef={busRef}
              />
              <RotaryDial
                label="Offset"
                value={Math.round((out.offset + 100) / 200 * 100)}
                onChange={(v) => updateOutput(i, 'offset', Math.round(v / 100 * 200 - 100))}
                size={36}
                defaultValue={50}
                busRef={busRef}
              />
              <div className="flex flex-col items-center">
                <span ref={valRefs[i]} className="text-fg-64 kol-helper-xs" style={{ fontVariantNumeric: 'tabular-nums', width: '28px', textAlign: 'right' }}>
                  {enabled ? '0' : '\u2014'}
                </span>
              </div>
            </div>
          </div>
        ))}

        <Divider />

        {/* Oscilloscope canvas */}
        <canvas
          ref={canvasRef}
          width={252}
          height={52}
          style={{ width: '100%', height: '52px', borderRadius: '3px', backgroundColor: 'var(--kol-surface-tertiary)', display: 'block' }}
        />
      </div>

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
