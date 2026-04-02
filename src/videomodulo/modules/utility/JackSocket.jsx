// JackSocket — 3.5mm eurorack jack socket
// Drag from output to input to connect

import { useRef, useEffect, useCallback } from 'react'
import { usePatchRouting } from '../../hooks/usePatchRouting.jsx'

const DEFAULT_COLOR = '#e74c3c'

export default function JackSocket({
  type = 'out',
  port,
  moduleId,
  signalRef,
  active = false,
  size = 'md',
  label,
  category = 'utility',
}) {
  const routing = usePatchRouting()
  const ref = useRef(null)
  const ringRef = useRef(null)
  const jackId = `${moduleId}:${type === 'out' ? 'out' : 'in'}:${port}`

  const isPending = type === 'out'
    && routing?.pendingOutput?.port === port
    && routing?.pendingOutput?.moduleId === moduleId
  const hasPending = !!routing?.pendingOutput
  const catColor = DEFAULT_COLOR

  // Register jack element for hit testing
  useEffect(() => {
    routing?.registerJack(jackId, ringRef.current)
    return () => routing?.registerJack(jackId, null)
  }, [routing, jackId])

  // Animate ring glow proportional to signal value
  useEffect(() => {
    if (!signalRef || !ringRef.current) return
    let raf
    const tick = () => {
      const signal = signalRef.current
      let val = 0
      if (!signal) val = 0
      else if (signal.type === 'scalar') val = signal.value
      else if (signal.type === 'color') { const c = signal.value; val = (c.r * 0.2126 + c.g * 0.7152 + c.b * 0.0722) * 100 }
      else if (signal.type === 'points') val = signal.value?.length > 0 ? 80 : 0
      const norm = Math.min(1, val / 100)
      const ring = ringRef.current
      if (ring) {
        const alpha = Math.round(norm * 255).toString(16).padStart(2, '0')
        ring.style.borderColor = norm > 0.01 ? `${catColor}${alpha}` : 'rgba(180,175,165,0.25)'
        ring.style.boxShadow = norm > 0.01
          ? `0 0 ${2 + norm * 6}px ${catColor}${alpha}`
          : 'inset 0 1px 2px rgba(0,0,0,0.5)'
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [signalRef, catColor])

  const handlePointerDown = useCallback((e) => {
    if (type === 'out') {
      e.preventDefault()
      routing?.selectOutput(moduleId, port)
    }
  }, [type, port, moduleId, routing])

  const handleClick = useCallback((e) => {
    // Don't disconnect if we just finished a drag (that creates a connection)
    if (routing?.pendingOutput) return
    if (type === 'in' && active) {
      e.stopPropagation()
      e.preventDefault()
      routing?.removeConnection(moduleId, port)
    }
  }, [type, active, routing, moduleId, port])

  const s = size === 'sm' ? 12 : 16
  const hole = size === 'sm' ? 4 : 6

  return (
    <div
      ref={ref}
      className="inline-flex flex-col items-center gap-0.5 select-none"
      style={{ cursor: type === 'out' ? 'grab' : (hasPending ? 'pointer' : 'default'), touchAction: 'none' }}
      onPointerDown={handlePointerDown}
      onClick={handleClick}
      title={label || port}
    >
      <div
        ref={ringRef}
        style={{
          width: `${s}px`,
          height: `${s}px`,
          borderRadius: '50%',
          backgroundColor: 'rgba(20,20,20,0.9)',
          border: `1.5px solid ${
            isPending ? catColor
            : active ? catColor
            : hasPending && type === 'in' ? `${catColor}66`
            : 'rgba(180,175,165,0.25)'
          }`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.5)',
          transition: 'border-color 0.1s',
        }}
      >
        <div style={{
          width: `${hole}px`,
          height: `${hole}px`,
          borderRadius: '50%',
          backgroundColor: active || isPending ? `${catColor}66` : 'rgba(0,0,0,0.6)',
          border: type === 'in' ? '1px solid rgba(255,255,255,0.15)' : '0.5px solid rgba(0,0,0,0.3)',
        }} />
      </div>
      {label && (
        <span style={{
          fontSize: size === 'sm' ? '6px' : '7px',
          fontFamily: 'var(--kol-font-mono)',
          color: 'rgba(255,255,255,0.35)',
          textTransform: 'uppercase',
          lineHeight: 1,
        }}>
          {label}
        </span>
      )}
    </div>
  )
}
