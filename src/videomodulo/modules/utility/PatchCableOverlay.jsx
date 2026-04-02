// PatchCableOverlay — SVG catenary patch cables between jacks

import { useEffect, useRef, useState } from 'react'
import { usePatchRouting } from '../../hooks/usePatchRouting.jsx'

const WIRE_COLOR = '#f59e0b'

function getJackCenter(element, container) {
  if (!element || !container) return null
  const er = element.getBoundingClientRect()
  const cr = container.getBoundingClientRect()
  return {
    x: er.left + er.width / 2 - cr.left + container.scrollLeft,
    y: er.top + er.height / 2 - cr.top,
  }
}

function catenaryPath(x1, y1, x2, y2) {
  const dx = x2 - x1
  const dy = y2 - y1
  const dist = Math.sqrt(dx * dx + dy * dy)
  const sag = 30 + dist * 0.12
  const cp1x = x1 + dx * 0.3
  const cp1y = Math.max(y1, y2) + sag
  const cp2x = x2 - dx * 0.3
  const cp2y = Math.max(y1, y2) + sag
  return `M${x1},${y1} C${cp1x},${cp1y} ${cp2x},${cp2y} ${x2},${y2}`
}

export default function PatchCableOverlay({ containerRef }) {
  const routing = usePatchRouting()
  const svgRef = useRef(null)
  const [mousePos, setMousePos] = useState(null)
  const [, forceUpdate] = useState(0)

  // Re-render after connections change (delayed so jacks register first)
  const conns = routing?.connections
  useEffect(() => {
    const id = requestAnimationFrame(() => forceUpdate(n => n + 1))
    return () => cancelAnimationFrame(id)
  }, [conns])

  // Re-render on scroll
  useEffect(() => {
    const container = containerRef?.current
    if (!container) return
    const handleScroll = () => forceUpdate(n => n + 1)
    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [containerRef])

  // Track mouse for pending cable
  useEffect(() => {
    if (!routing?.pendingOutput) { setMousePos(null); return }
    const handleMove = (e) => {
      const container = containerRef?.current
      if (!container) return
      const cr = container.getBoundingClientRect()
      setMousePos({
        x: e.clientX - cr.left + container.scrollLeft,
        y: e.clientY - cr.top,
      })
    }
    window.addEventListener('pointermove', handleMove)
    return () => window.removeEventListener('pointermove', handleMove)
  }, [routing?.pendingOutput, containerRef])

  if (!routing) return null

  const { connections, pendingOutput, jackRefs } = routing
  const container = containerRef?.current

  const cables = connections.map((conn, i) => {
    const fromEl = jackRefs.current[`${conn.fromModuleId}:out:${conn.fromPort}`]
    const toEl = jackRefs.current[`${conn.toModuleId}:in:${conn.toPort}`]
    const from = getJackCenter(fromEl, container)
    const to = getJackCenter(toEl, container)
    if (!from || !to) return null
    return { path: catenaryPath(from.x, from.y, to.x, to.y), color: WIRE_COLOR }
  }).filter(Boolean)

  let pendingCable = null
  if (pendingOutput && mousePos) {
    const fromEl = jackRefs.current[`${pendingOutput.moduleId}:out:${pendingOutput.port}`]
    const from = getJackCenter(fromEl, container)
    if (from) {
      pendingCable = catenaryPath(from.x, from.y, mousePos.x, mousePos.y)
    }
  }

  const svgWidth = container ? container.scrollWidth : '100%'
  const svgHeight = container ? container.clientHeight : '100%'

  return (
    <svg
      ref={svgRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: svgWidth,
        height: svgHeight,
        pointerEvents: 'none',
        overflow: 'visible',
        zIndex: 10,
      }}
    >
      <defs>
        <filter id="vm-cable-shadow">
          <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="rgba(0,0,0,0.4)" />
        </filter>
      </defs>

      {cables.map((cable, i) => (
        <g key={i}>
          <path d={cable.path} fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="4" strokeLinecap="round" />
          <path d={cable.path} fill="none" stroke={cable.color} strokeWidth="2.5" strokeLinecap="round" filter="url(#vm-cable-shadow)" />
        </g>
      ))}

      {pendingCable && (
        <path d={pendingCable} fill="none" stroke="rgba(231,76,60,0.4)" strokeWidth="2" strokeLinecap="round" strokeDasharray="6,4" />
      )}
    </svg>
  )
}
