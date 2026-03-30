import { useState, useRef, useCallback } from 'react'

const WIRE_COLORS = ['#e74c3c', '#f39c12', '#2ecc71', '#3498db', '#9b59b6', '#1abc9c', '#e67e22', '#ecf0f1']
const NODE_W = 10
const NODE_H = 8
const ROW_H = 20
const MASTER_W = 40
const MASTER_H = 24
const OUT_W = 32

function DraggableNode({ x, y, onDrag, svgRef, children }) {
  const offsetRef = useRef({ x: 0, y: 0 })

  const handlePointerDown = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    const svg = svgRef.current
    if (!svg) return
    const pt = svg.createSVGPoint()
    pt.x = e.clientX
    pt.y = e.clientY
    const svgPt = pt.matrixTransform(svg.getScreenCTM().inverse())
    offsetRef.current = { x: svgPt.x - x, y: svgPt.y - y }

    const handleMove = (me) => {
      const mp = svg.createSVGPoint()
      mp.x = me.clientX
      mp.y = me.clientY
      const sp = mp.matrixTransform(svg.getScreenCTM().inverse())
      onDrag({ x: sp.x - offsetRef.current.x, y: sp.y - offsetRef.current.y })
    }

    const handleUp = () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
    }

    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)
  }, [x, y, onDrag, svgRef])

  return (
    <g
      style={{ cursor: 'grab', touchAction: 'none' }}
      onPointerDown={handlePointerDown}
    >
      {children}
    </g>
  )
}

export default function ChannelWireDiagram({ channels = [], master }) {
  const activeChannels = channels.filter(ch => ch.enabled)
  if (activeChannels.length === 0) return null

  const rows = activeChannels.length
  const h = Math.max(rows * ROW_H + 12, 44)
  const maxFx = Math.max(...activeChannels.map(ch => (ch.fx || []).length), 0)
  const masterFxItems = master?.fx || []
  const fxStartX = 24
  const defaultMstX = Math.max(fxStartX + (maxFx > 0 ? maxFx * (NODE_W + 6) : 0) + 54, 300)
  const defaultOutX = Math.max(defaultMstX + MASTER_W + (masterFxItems.length > 0 ? masterFxItems.length * (NODE_W + 6) + 20 : 16), 600)

  return (
    <DiagramCanvas
      channels={channels}
      activeChannels={activeChannels}
      masterFxItems={masterFxItems}
      rows={rows}
      h={h}
      fxStartX={fxStartX}
      defaultMstX={defaultMstX}
      defaultMstY={h / 2}
      defaultOutX={defaultOutX}
      defaultOutY={h / 2}
    />
  )
}

function DiagramCanvas({
  channels, activeChannels, masterFxItems,
  rows, h, fxStartX,
  defaultMstX, defaultMstY, defaultOutX, defaultOutY,
}) {
  const svgRef = useRef(null)
  const [mstPos, setMstPos] = useState({ x: defaultMstX, y: defaultMstY })
  const [outPos, setOutPos] = useState({ x: defaultOutX, y: defaultOutY })

  const totalW = Math.max(outPos.x + OUT_W + 16, mstPos.x + MASTER_W + 16, 200)
  const totalH = Math.max(h, mstPos.y + MASTER_H / 2 + 4, outPos.y + 14)

  const masterFxStartX = mstPos.x + MASTER_W + 8

  return (
    <svg
      ref={svgRef}
      width="100%"
      height={totalH}
      viewBox={`0 0 ${totalW} ${totalH}`}
      preserveAspectRatio="xMinYMid meet"
      className="text-fg-48"
      style={{ display: 'block', touchAction: 'none' }}
    >
      {activeChannels.map((ch, ri) => {
        const chIdx = channels.indexOf(ch)
        const color = WIRE_COLORS[chIdx % WIRE_COLORS.length]
        const y = 6 + ri * ROW_H + ROW_H / 2
        const fxItems = ch.fx || []

        return (
          <g key={chIdx}>
            <circle cx={8} cy={y} r={4} fill={color} opacity={0.8} />

            {fxItems.length > 0 ? (
              <>
                <line x1={12} y1={y} x2={fxStartX} y2={y} stroke={color} strokeWidth={1.5} opacity={0.5} />
                {fxItems.map((fxItem, fi) => {
                  const nx = fxStartX + fi * (NODE_W + 6)
                  return (
                    <g key={fi}>
                      <rect
                        x={nx} y={y - NODE_H / 2}
                        width={NODE_W} height={NODE_H} rx={2}
                        fill={fxItem.enabled ? color : 'none'}
                        stroke={color} strokeWidth={1}
                        opacity={fxItem.enabled ? 0.8 : 0.4}
                      />
                      {fi < fxItems.length - 1 && (
                        <line x1={nx + NODE_W} y1={y} x2={nx + NODE_W + 6} y2={y} stroke={color} strokeWidth={1} opacity={0.4} />
                      )}
                    </g>
                  )
                })}
                <line
                  x1={fxStartX + fxItems.length * (NODE_W + 6) - 6} y1={y}
                  x2={mstPos.x} y2={mstPos.y}
                  stroke={color} strokeWidth={1.5} opacity={0.4}
                />
              </>
            ) : (
              <line x1={12} y1={y} x2={mstPos.x} y2={mstPos.y} stroke={color} strokeWidth={1.5} opacity={0.4} />
            )}
          </g>
        )
      })}

      {/* Master — draggable */}
      <DraggableNode x={mstPos.x} y={mstPos.y} onDrag={setMstPos} svgRef={svgRef}>
        <rect
          x={mstPos.x} y={mstPos.y - MASTER_H / 2}
          width={MASTER_W} height={MASTER_H} rx={3}
          fill="var(--kol-fg-08, #222)" stroke="currentColor" strokeWidth={1.5}
        />
        <text
          x={mstPos.x + MASTER_W / 2} y={mstPos.y + 4}
          textAnchor="middle" fill="currentColor"
          fontSize={8} fontFamily="var(--kol-font-family-mono)"
          pointerEvents="none"
        >MST</text>
      </DraggableNode>

      {/* Master FX nodes */}
      {masterFxItems.length > 0 && (
        <g>
          <line
            x1={mstPos.x + MASTER_W} y1={mstPos.y}
            x2={masterFxStartX} y2={mstPos.y}
            stroke="currentColor" strokeWidth={1.5} opacity={0.5}
          />
          {masterFxItems.map((fxItem, fi) => {
            const nx = masterFxStartX + fi * (NODE_W + 6)
            return (
              <g key={fi}>
                <rect
                  x={nx} y={mstPos.y - NODE_H / 2}
                  width={NODE_W} height={NODE_H} rx={2}
                  fill={fxItem.enabled ? 'currentColor' : 'none'}
                  stroke="currentColor" strokeWidth={1}
                  opacity={fxItem.enabled ? 0.6 : 0.3}
                />
                {fi < masterFxItems.length - 1 && (
                  <line x1={nx + NODE_W} y1={mstPos.y} x2={nx + NODE_W + 6} y2={mstPos.y} stroke="currentColor" strokeWidth={1} opacity={0.3} />
                )}
              </g>
            )
          })}
        </g>
      )}

      {/* Wire MST → OUT */}
      <line
        x1={masterFxItems.length > 0 ? masterFxStartX + masterFxItems.length * (NODE_W + 6) - 6 : mstPos.x + MASTER_W}
        y1={mstPos.y}
        x2={outPos.x} y2={outPos.y}
        stroke="currentColor" strokeWidth={1.5} opacity={0.5}
        strokeDasharray="4 3"
      />

      {/* OUT — draggable */}
      <DraggableNode x={outPos.x} y={outPos.y} onDrag={setOutPos} svgRef={svgRef}>
        <rect
          x={outPos.x} y={outPos.y - 10}
          width={OUT_W} height={20} rx={3}
          fill="var(--kol-fg-08, #222)" stroke="currentColor" strokeWidth={1.5}
          strokeDasharray="3 2"
        />
        <text
          x={outPos.x + OUT_W / 2} y={outPos.y + 4}
          textAnchor="middle" fill="currentColor"
          fontSize={9} fontFamily="var(--kol-font-family-mono)"
          pointerEvents="none"
        >OUT</text>
      </DraggableNode>
    </svg>
  )
}
