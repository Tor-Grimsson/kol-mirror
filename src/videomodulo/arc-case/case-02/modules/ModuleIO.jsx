import { useCallback, useRef, useEffect } from 'react'
import { usePatchRouting } from '../hooks/usePatchRouting.jsx'

/**
 * Module I/O footer — clickable jacks for patch routing.
 *
 * Props:
 *   moduleId — unique module identifier (e.g. "lfo1", "math1")
 *   inputs   — array of { label, active, configKey?, onExprChange? }
 *   outputs  — array of bus key strings
 */

function OutputJack({ busKey, moduleId, onEnable, busRef }) {
  const routing = usePatchRouting()
  const ref = useRef(null)
  const dotRef = useRef(null)
  const jackId = `${moduleId}:out:${busKey}`
  const isPending = routing?.pendingOutput?.busKey === busKey && routing?.pendingOutput?.moduleId === moduleId

  useEffect(() => {
    routing?.registerJack(jackId, ref.current)
    return () => routing?.registerJack(jackId, null)
  }, [routing, jackId])

  // Animate dot brightness from bus value
  useEffect(() => {
    if (!busRef?.current || !dotRef.current) return
    let raf
    const tick = () => {
      const val = busRef.current[busKey] || 0
      const norm = Math.min(1, val / 100)
      const dot = dotRef.current
      if (dot) {
        const r = 231, g = Math.round(76 * (1 - norm * 0.5)), b = Math.round(60 * (1 - norm * 0.3))
        const alpha = 0.15 + norm * 0.85
        dot.style.backgroundColor = `rgba(${r},${g},${b},${alpha})`
        dot.style.boxShadow = norm > 0.1 ? `0 0 ${3 + norm * 4}px rgba(231,76,60,${norm * 0.7})` : 'none'
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [busRef, busKey])

  return (
    <span
      ref={ref}
      className={`inline-flex items-center gap-1 cursor-pointer select-none ${isPending ? 'text-[#e74c3c]' : 'text-fg-64'}`}
      style={{ fontFamily: 'var(--kol-font-mono)' }}
      onClick={() => { onEnable?.(); routing?.selectOutput(busKey, moduleId) }}
    >
      <span
        ref={dotRef}
        style={{
          width: '6px', height: '6px', borderRadius: '50%',
          border: '1px solid rgba(231,76,60,0.4)',
          backgroundColor: 'rgba(231,76,60,0.15)',
          display: 'inline-block',
        }}
      />
      {busKey}
    </span>
  )
}

function InputJack({ label, active, configKey, onExprChange, moduleId }) {
  const routing = usePatchRouting()
  const ref = useRef(null)
  const jackId = `${moduleId}:in:${configKey || label}`
  const hasPending = !!routing?.pendingOutput
  const isConnected = active

  useEffect(() => {
    routing?.registerJack(jackId, ref.current)
    return () => routing?.registerJack(jackId, null)
  }, [routing, jackId])

  const handleClick = useCallback(() => {
    if (!configKey || !onExprChange) return
    if (hasPending) {
      routing?.selectInput(moduleId, configKey, onExprChange)
    } else if (isConnected) {
      // Click connected input to disconnect
      routing?.removeConnection(null, moduleId, configKey, onExprChange)
    }
  }, [hasPending, isConnected, routing, moduleId, configKey, onExprChange])

  const clickable = !!configKey && !!onExprChange

  return (
    <span
      ref={ref}
      className={`inline-flex items-center gap-1 select-none ${clickable ? 'cursor-pointer' : ''} ${
        hasPending && clickable ? 'text-fg-64' : isConnected ? 'text-fg-64' : 'text-fg-16'
      }`}
      style={{ fontFamily: 'var(--kol-font-mono)' }}
      onClick={handleClick}
    >
      <span
        style={{
          width: '6px', height: '6px', borderRadius: '50%',
          border: '1px solid',
          borderColor: isConnected ? '#e74c3c' : hasPending && clickable ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.1)',
          backgroundColor: isConnected ? '#e74c3c' : 'transparent',
          display: 'inline-block',
          transition: 'all 0.1s',
          boxShadow: hasPending && clickable ? '0 0 3px rgba(231,76,60,0.3)' : 'none',
        }}
      />
      {label}
    </span>
  )
}

export default function ModuleIO({ moduleId, inputs = [], outputs = [], onEnable, busRef }) {
  if (!inputs.length && !outputs.length) return null

  return (
    <div className="flex flex-col gap-1 px-3 pb-2 kol-helper-xxs" style={{ borderTop: '1px solid var(--kol-fg-08)', paddingTop: '6px', marginTop: '2px' }}>
      {outputs.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-fg-24">OUT</span>
          {outputs.map(key => (
            <OutputJack key={key} busKey={key} moduleId={moduleId} onEnable={onEnable} busRef={busRef} />
          ))}
        </div>
      )}
      {inputs.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-fg-24">IN</span>
          {inputs.map(inp => (
            <InputJack
              key={inp.configKey || inp.label}
              label={inp.label}
              active={inp.active}
              configKey={inp.configKey}
              onExprChange={inp.onExprChange}
              moduleId={moduleId}
            />
          ))}
        </div>
      )}
    </div>
  )
}
