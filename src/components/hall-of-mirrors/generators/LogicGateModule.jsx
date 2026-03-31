import { useEffect, useRef, useCallback } from 'react'
import RotaryDial from '../RotaryDial'
import Dropdown from '../../molecules/Dropdown'
import Divider from '../../atoms/Divider'

const GATE_TYPES = [
  { value: 'AND', label: 'AND' },
  { value: 'OR', label: 'OR' },
  { value: 'XOR', label: 'XOR' },
  { value: 'NOT', label: 'NOT' },
  { value: 'NAND', label: 'NAND' },
]

const SIGNAL_SOURCES = [
  { value: 'lfo1', label: 'LFO 1' },
  { value: 'lfo2', label: 'LFO 2' },
  { value: 'seq1', label: 'SEQ 1' },
]

const ON = '#e74c3c'
const OFF = 'rgba(255,255,255,0.10)'

export default function LogicGateModule({ id, label, config, onChange, busRef }) {
  const { type = 'AND', thresholdA = 50, thresholdB = 50, inputA = 'lfo1', inputB = 'lfo2', enabled = false } = config
  const rafRef = useRef(null)

  // Direct DOM refs — no React state in hot path
  const barARef = useRef(null)
  const barBRef = useRef(null)
  const barOutRef = useRef(null)
  const valRef = useRef(null)

  useEffect(() => {
    const setBar = (ref, on) => { if (ref.current) ref.current.style.backgroundColor = on ? ON : OFF }
    if (!enabled) {
      if (busRef) busRef.current[id] = 0
      setBar(barARef, false); setBar(barBRef, false); setBar(barOutRef, false)
      if (valRef.current) valRef.current.textContent = '—'
      return
    }
    const tick = () => {
      const bus = busRef?.current
      if (!bus) { rafRef.current = requestAnimationFrame(tick); return }
      const a = (bus[inputA] || 0) > thresholdA
      const b = (bus[inputB] || 0) > thresholdB
      let out = false
      if (type === 'AND') out = a && b
      else if (type === 'OR') out = a || b
      else if (type === 'XOR') out = a !== b
      else if (type === 'NOT') out = !a
      else if (type === 'NAND') out = !(a && b)
      bus[id] = out ? 100 : 0
      setBar(barARef, a)
      setBar(barBRef, type !== 'NOT' ? b : false)
      setBar(barOutRef, out)
      if (valRef.current) valRef.current.textContent = out ? '100' : '0'
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [enabled, type, thresholdA, thresholdB, inputA, inputB, id, busRef])

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
        {/* Gate type */}
        <div className="flex items-center justify-between kol-helper-xs" style={{ height: '24px' }}>
          <span className="text-fg-64">Gate</span>
          <Dropdown options={GATE_TYPES} value={type} onChange={(v) => update('type', v)} variant="minimal" size="md" />
        </div>

        {/* Inputs */}
        <div className="flex items-center justify-between kol-helper-xs" style={{ height: '24px' }}>
          <span className="text-fg-64">Input A</span>
          <Dropdown options={SIGNAL_SOURCES} value={inputA} onChange={(v) => update('inputA', v)} variant="minimal" size="md" />
        </div>
        {type !== 'NOT' && (
          <div className="flex items-center justify-between kol-helper-xs" style={{ height: '24px' }}>
            <span className="text-fg-64">Input B</span>
            <Dropdown options={SIGNAL_SOURCES} value={inputB} onChange={(v) => update('inputB', v)} variant="minimal" size="md" />
          </div>
        )}

        <Divider />

        {/* Threshold knobs */}
        <div className="flex items-center justify-around">
          <RotaryDial label="Thr A" value={thresholdA} onChange={(v) => update('thresholdA', v)} size={36} defaultValue={50} />
          {type !== 'NOT' && (
            <RotaryDial label="Thr B" value={thresholdB} onChange={(v) => update('thresholdB', v)} size={36} defaultValue={50} />
          )}
        </div>

        <Divider />

        {/* Live signal flow: A  B → OUT */}
        <div className="flex items-end gap-2">
          {/* A bar */}
          <div className="flex flex-col items-center gap-1" style={{ flex: 1 }}>
            <div ref={barARef} className="w-full rounded-sm" style={{ height: '3px', backgroundColor: OFF, transition: 'background-color 0.05s' }} />
            <span className="kol-helper-xxs text-fg-32">A</span>
          </div>
          {type !== 'NOT' && (
            <div className="flex flex-col items-center gap-1" style={{ flex: 1 }}>
              <div ref={barBRef} className="w-full rounded-sm" style={{ height: '3px', backgroundColor: OFF, transition: 'background-color 0.05s' }} />
              <span className="kol-helper-xxs text-fg-32">B</span>
            </div>
          )}
          <span className="kol-helper-xxs text-fg-24 mb-3">→</span>
          <div className="flex flex-col items-center gap-1" style={{ flex: 1 }}>
            <div ref={barOutRef} className="w-full rounded-sm" style={{ height: '3px', backgroundColor: OFF, transition: 'background-color 0.05s' }} />
            <span className="kol-helper-xxs text-fg-32">OUT</span>
          </div>
        </div>

        {/* Output value */}
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
