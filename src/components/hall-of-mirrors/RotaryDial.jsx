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

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="relative cursor-pointer select-none"
        style={{
          width: size,
          height: size,
          transform: `rotate(${angle}deg)`,
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
          <circle
            cx={outerRadius}
            cy={outerRadius}
            r={outerRadius - strokeWidth}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeDasharray="4 4"
            className="text-fg-24"
          />
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
        </svg>
      </div>
      {label && <div className="kol-helper-xs text-fg-64 uppercase">{label}</div>}
      {label && <div className="kol-helper-xs text-fg-96">{Math.round(value)}%</div>}
    </div>
  )
}
