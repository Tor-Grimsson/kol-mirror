import { useRef, useState } from 'react'
import RotaryDial from '../hall-of-mirrors/RotaryDial'

const FADER_MARKS = [0, 20, 40, 60, 80, 90, 100]

function VerticalFader({ value, onChange }) {
  const trackRef = useRef(null)
  const dragging = useRef(false)

  const getValueFromY = (clientY) => {
    const rect = trackRef.current.getBoundingClientRect()
    const pct = 1 - (clientY - rect.top) / rect.height
    return Math.max(0, Math.min(100, Math.round(pct * 100)))
  }

  const onPointerDown = (e) => {
    e.preventDefault()
    dragging.current = true
    trackRef.current.setPointerCapture(e.pointerId)
    onChange(getValueFromY(e.clientY))
  }

  const onPointerMove = (e) => {
    if (!dragging.current) return
    onChange(getValueFromY(e.clientY))
  }

  const onPointerUp = () => {
    dragging.current = false
  }

  const thumbY = `${100 - value}%`

  return (
    <div
      ref={trackRef}
      className="relative flex-1 cursor-pointer"
      style={{ width: '64px', minHeight: '80px', touchAction: 'none' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      {/* Track line */}
      <div className="absolute bg-fg-08" style={{ left: '50%', top: 0, bottom: 0, width: '2px', transform: 'translateX(-50%)' }} />
      {/* Marks */}
      {FADER_MARKS.map((pct) => (
        <div key={pct} className="absolute" style={{ bottom: `${pct}%`, left: 0, right: 0 }}>
          <div className={`absolute ${pct === 80 ? 'border-fg-32' : 'border-fg-08'}`} style={{ left: '4px', width: '16px', borderTopWidth: '1px', borderTopStyle: 'solid' }} />
          <div className={`absolute ${pct === 80 ? 'border-fg-32' : 'border-fg-08'}`} style={{ right: '4px', width: '16px', borderTopWidth: '1px', borderTopStyle: 'solid' }} />
        </div>
      ))}
      {/* Thumb */}
      <div
        className="absolute"
        style={{ left: '8px', right: '8px', height: '6px', top: thumbY, transform: 'translateY(-50%)', borderRadius: '1px', backgroundColor: 'var(--kol-surface-on-primary)' }}
      />
    </div>
  )
}

export default function ChannelMaster({
  label = 'Ch 1',
  knobs = [],
  faderValue = 80,
  onFaderChange,
  enabled = true,
  onEnabledChange,
  onReset,
  accent = '#e74c3c',
}) {
  const [busA, setBusA] = useState(false)
  const [busB, setBusB] = useState(false)
  return (
    <div className="flex flex-col items-center gap-3 self-stretch" style={{ position: 'relative' }}>
      <div className={`absolute w-2 h-2 rounded-full ${enabled ? 'bg-[#e74c3c]' : 'bg-fg-24'}`} style={{ top: '-4px', left: '-4px' }} />
      {/* Knobs */}
      <div className="flex flex-col items-center">
        {knobs.map((knob, i) => (
          <RotaryDial
            key={i}
            label={knob.label}
            value={knob.value}
            onChange={knob.onChange}
            size={22}
            compact
            variant="dense"
          />
        ))}
      </div>
      {/* Channel button above fader */}
      <div
        className="kol-helper-xxs cursor-pointer select-none flex items-center justify-center uppercase"
        style={{ height: '20px', padding: '0 8px', borderRadius: '2px', border: `1px solid ${enabled ? accent : 'var(--kol-fg-16)'}`, color: enabled ? accent : 'var(--kol-fg-32)' }}
        onClick={() => onEnabledChange && onEnabledChange(!enabled)}
      >{label}</div>
      {/* Fader */}
      <VerticalFader value={faderValue} onChange={onFaderChange} />
      {/* A / B buttons */}
      <div className="flex items-center gap-3">
        <div
          className={`kol-helper-xxs cursor-pointer select-none flex items-center justify-center uppercase border ${busA ? 'border-accent-primary accentYellow' : 'border-fg-16 text-fg-96 hover:border-accent-primary hover:accentYellow'}`}
          style={{ height: '20px', width: '20px', borderRadius: '2px' }}
          onClick={() => setBusA(!busA)}
        >A</div>
        <div
          className={`kol-helper-xxs cursor-pointer select-none flex items-center justify-center uppercase border ${busB ? 'border-accent-primary accentYellow' : 'border-fg-16 text-fg-96 hover:border-accent-primary hover:accentYellow'}`}
          style={{ height: '20px', width: '20px', borderRadius: '2px' }}
          onClick={() => setBusB(!busB)}
        >B</div>
      </div>
    </div>
  )
}
