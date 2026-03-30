import { useRef, useCallback } from 'react'

export default function RotaryDial({ label, value = 0, onChange, size = 80, min = 0, max = 100 }) {
  const dragRef = useRef(null)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  const range = max - min
  const angle = -135 + ((value - min) / range) * 270

  const handlePointerDown = useCallback((e) => {
    e.preventDefault()
    const startY = e.clientY
    const startValue = value

    const handleMove = (me) => {
      const deltaY = startY - me.clientY
      const newValue = Math.max(min, Math.min(max, startValue + (deltaY / size) * range))
      onChangeRef.current(Math.round(newValue))
    }

    const handleUp = () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
    }

    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)
  }, [value, size, min, max, range])

  const outerRadius = size / 2
  const innerRadius = (size * 0.7) / 2
  const strokeWidth = 2

  const arcRadius = outerRadius - strokeWidth
  // 270° sweep from 7 o'clock (135°) to 5 o'clock (45°), going clockwise through top
  const sweepStart = 135 // degrees from 3 o'clock, clockwise
  const sweepEnd = 45
  const sweepTotal = 270

  const arcStartX = outerRadius + arcRadius * Math.cos((sweepStart * Math.PI) / 180)
  const arcStartY = outerRadius + arcRadius * Math.sin((sweepStart * Math.PI) / 180)
  const arcEndX = outerRadius + arcRadius * Math.cos((sweepEnd * Math.PI) / 180)
  const arcEndY = outerRadius + arcRadius * Math.sin((sweepEnd * Math.PI) / 180)

  // Tick marks: 11 major (0,10,...100), 4 minor between each = 51 total
  const ticks = []
  const tickInnerR = innerRadius + 12
  for (let i = 0; i <= 50; i++) {
    const frac = i / 50
    const deg = sweepStart + frac * sweepTotal
    const rad = (deg * Math.PI) / 180
    const isMajor = i % 5 === 0
    const outerR = tickInnerR + (isMajor ? 8 : 4)
    ticks.push({
      x1: outerRadius + tickInnerR * Math.cos(rad),
      y1: outerRadius + tickInnerR * Math.sin(rad),
      x2: outerRadius + outerR * Math.cos(rad),
      y2: outerRadius + outerR * Math.sin(rad),
      major: isMajor,
    })
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="relative cursor-pointer select-none"
        style={{
          width: size,
          height: size,
          touchAction: 'none',
        }}
        onPointerDown={handlePointerDown}
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ overflow: 'visible' }}
        >
          {/* Tick marks */}
          {ticks.map((t, i) => (
            <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
              stroke="currentColor" strokeWidth={t.major ? 1.5 : 0.75}
              className="text-fg-32"
            />
          ))}
          {/* Rotating knob + indicator */}
          <g style={{ transformOrigin: `${outerRadius}px ${outerRadius}px`, transform: `rotate(${angle}deg)` }}>
            <circle
              cx={outerRadius}
              cy={outerRadius}
              r={innerRadius}
              fill="currentColor"
              className="text-fg-96"
            />
            <line
              x1={outerRadius}
              y1={outerRadius}
              x2={outerRadius}
              y2={outerRadius - innerRadius + 4}
              stroke="var(--kol-surface-primary)"
              strokeWidth={2}
              strokeLinecap="round"
            />
          </g>
        </svg>
      </div>
      {label && <div className="kol-helper-xs text-fg-64 uppercase">{label}</div>}
      {label && <div className="kol-helper-xs text-fg-96">{Math.round(value)}%</div>}
    </div>
  )
}
