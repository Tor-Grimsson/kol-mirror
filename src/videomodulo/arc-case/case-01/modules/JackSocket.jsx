import { useRef, useEffect, useCallback } from 'react'
import { usePatchRouting } from '../hooks/usePatchRouting.jsx'

/**
 * JackSocket — 3.5mm eurorack jack socket.
 * Drag from output to input to connect. One gesture.
 */
// Category colors for jack rings
const CAT_COLORS = {
  timing: '#f59e0b',   // amber
  signal: '#e74c3c',   // red
  video: '#3b82f6',    // blue
  utility: '#8b5cf6',  // purple
}

function getJackColor(moduleId) {
  if (!moduleId) return CAT_COLORS.signal
  const id = moduleId.replace(/\d+$/, '')
  if (['clk', 'gate', 'cdiv', 'seq'].includes(id)) return CAT_COLORS.timing
  if (['gen', 'dither', 'geo', 'mon', 'rgb', 'rgbm', 'vca', 'fade', 'luma'].includes(id)) return CAT_COLORS.video
  if (['lfo', 'env', 'sh', 'math', 'nz', 'ramp', 'wshp'].includes(id)) return CAT_COLORS.signal
  return CAT_COLORS.utility
}

export default function JackSocket({
  type = 'out',
  busKey,
  moduleId,
  configKey,
  onExprChange,
  onEnable,
  busRef,
  active = false,
  size = 'md',
  label,
}) {
  const routing = usePatchRouting()
  const ref = useRef(null)
  const ringRef = useRef(null)
  const jackId = type === 'out'
    ? `${moduleId}:out:${busKey}`
    : `${moduleId}:in:${configKey || label}`

  const isPending = type === 'out' && routing?.pendingOutput?.busKey === busKey && routing?.pendingOutput?.moduleId === moduleId
  const hasPending = !!routing?.pendingOutput
  const catColor = getJackColor(moduleId)

  // Register position + input callback for global hit testing
  useEffect(() => {
    routing?.registerJack(jackId, ref.current)
    let cleanup
    if (type === 'in' && configKey && onExprChange && routing?.registerInputCallback) {
      cleanup = routing.registerInputCallback(jackId, moduleId, configKey, onExprChange)
    }
    return () => {
      routing?.registerJack(jackId, null)
      cleanup?.()
    }
  }, [routing, jackId, type, moduleId, configKey, onExprChange])

  // Animate output ring with signal value
  useEffect(() => {
    if (type !== 'out' || !busRef?.current || !ringRef.current) return
    let raf
    const tick = () => {
      const val = busRef.current[busKey] || 0
      const norm = Math.min(1, val / 100)
      const ring = ringRef.current
      if (ring) {
        ring.style.borderColor = norm > 0.05 ? catColor : 'rgba(180,175,165,0.25)'
        ring.style.boxShadow = norm > 0.05
          ? `0 0 ${2 + norm * 4}px ${catColor}${Math.round(norm * 153).toString(16).padStart(2, '0')}`
          : 'inset 0 1px 2px rgba(0,0,0,0.5)'
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [type, busRef, busKey])

  // Drag start — outputs only
  const handlePointerDown = useCallback((e) => {
    if (type === 'out') {
      e.preventDefault()
      onEnable?.()
      routing?.selectOutput(busKey, moduleId)
    }
  }, [type, busKey, moduleId, onEnable, routing])

  // Drop target — inputs only. Fires on pointer up.
  const handlePointerUp = useCallback((e) => {
    if (type === 'in' && routing?.pendingOutput) {
      if (!configKey || !onExprChange) return
      routing.selectInput(moduleId, configKey, onExprChange)
    }
  }, [type, routing, moduleId, configKey, onExprChange])

  // Alt+click OR regular click on connected input to disconnect
  const handleClick = useCallback((e) => {
    if (type === 'in' && active) {
      if (!configKey || !onExprChange) return
      e.stopPropagation()
      routing?.removeConnection(null, moduleId, configKey, onExprChange)
    }
  }, [type, active, routing, moduleId, configKey, onExprChange])

  const s = size === 'sm' ? 12 : 16
  const hole = size === 'sm' ? 4 : 6

  return (
    <div
      ref={ref}
      className="inline-flex flex-col items-center gap-0.5 select-none"
      style={{ cursor: type === 'out' ? 'grab' : (hasPending ? 'pointer' : 'default'), touchAction: 'none' }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onClick={handleClick}
      title={type === 'out' ? busKey : (label || configKey)}
    >
      {/* Socket body */}
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
        {/* Inner hole */}
        <div style={{
          width: `${hole}px`,
          height: `${hole}px`,
          borderRadius: '50%',
          backgroundColor: active || isPending ? `${catColor}66` : 'rgba(0,0,0,0.6)',
          border: '0.5px solid rgba(0,0,0,0.3)',
        }} />
      </div>
      {/* Label */}
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
