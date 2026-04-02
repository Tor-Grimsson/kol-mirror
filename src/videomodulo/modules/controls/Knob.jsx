// Knob — SVG rotary knob with drag-to-change

import { useRef, useCallback } from 'react'

export default function Knob({ value, onChange, min = 0, max = 100, label }) {
  const size = 24
  const angle = ((value - min) / (max - min)) * 270 - 135
  const r = size / 2
  const ir = r * 0.56

  const handlePointerDown = useCallback((e) => {
    e.preventDefault()
    const startY = e.clientY
    const startVal = value
    const range = max - min

    const handleMove = (e) => {
      const delta = (startY - e.clientY) * (range / 200)
      const next = Math.round(Math.max(min, Math.min(max, startVal + delta)))
      onChange(next)
    }
    const handleUp = () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
    }
    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)
  }, [value, min, max, onChange])

  return (
    <div
      onPointerDown={handlePointerDown}
      style={{ cursor: 'ns-resize', touchAction: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={r} cy={r} r={r * 0.75} fill="rgba(30,30,30,0.9)" stroke="rgba(180,175,165,0.3)" strokeWidth="1" />
        <line
          x1={r} y1={r}
          x2={r + ir * Math.cos((angle - 90) * Math.PI / 180)}
          y2={r + ir * Math.sin((angle - 90) * Math.PI / 180)}
          stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round"
        />
      </svg>
      {label && (
        <span style={{
          fontSize: '6px',
          fontFamily: 'var(--kol-font-mono)',
          color: 'rgba(255,255,255,0.35)',
          textTransform: 'uppercase',
          lineHeight: 1,
        }}>
          {label}
        </span>
      )}
      <span style={{
        fontSize: '7px',
        fontFamily: 'var(--kol-font-mono)',
        color: 'rgba(255,255,255,0.5)',
        lineHeight: 1,
      }}>
        {value}
      </span>
    </div>
  )
}
