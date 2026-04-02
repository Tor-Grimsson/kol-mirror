// Fader — vertical slider for channel strips

import { useRef, useCallback } from 'react'

export default function Fader({ value = 100, onChange, label, min = 0, max = 100, height = 60 }) {
  const trackRef = useRef(null)

  const handlePointerDown = useCallback((e) => {
    e.preventDefault()
    const track = trackRef.current
    if (!track) return

    const update = (e) => {
      const rect = track.getBoundingClientRect()
      const y = 1 - Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height))
      onChange(Math.round(min + y * (max - min)))
    }

    update(e)

    const handleMove = (e) => update(e)
    const handleUp = () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
    }
    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)
  }, [min, max, onChange])

  const norm = (value - min) / (max - min)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      {label && (
        <span style={{
          fontSize: '6px', fontFamily: 'var(--kol-font-mono)',
          color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', lineHeight: 1,
        }}>{label}</span>
      )}
      <div
        ref={trackRef}
        onPointerDown={handlePointerDown}
        style={{
          width: 8,
          height,
          backgroundColor: 'rgba(255,255,255,0.06)',
          borderRadius: 2,
          position: 'relative',
          cursor: 'ns-resize',
          touchAction: 'none',
        }}
      >
        {/* Fill */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: `${norm * 100}%`,
          backgroundColor: 'rgba(255,255,255,0.15)',
          borderRadius: 2,
        }} />
        {/* Thumb */}
        <div style={{
          position: 'absolute',
          bottom: `calc(${norm * 100}% - 3px)`,
          left: -1,
          width: 10,
          height: 6,
          backgroundColor: 'rgba(255,255,255,0.5)',
          borderRadius: 1,
        }} />
      </div>
      <span style={{
        fontSize: '7px', fontFamily: 'var(--kol-font-mono)',
        color: 'rgba(255,255,255,0.4)', lineHeight: 1,
      }}>{value}</span>
    </div>
  )
}
