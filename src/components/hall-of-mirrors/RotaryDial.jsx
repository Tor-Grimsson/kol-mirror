import { useState, useRef, useEffect } from 'react'

export default function RotaryDial({ label, value = 0, onChange, size = 80 }) {
  const [isDragging, setIsDragging] = useState(false)
  const [localValue, setLocalValue] = useState(value)
  const dialRef = useRef(null)
  const dragDataRef = useRef({ startY: 0, startValue: 0 })
  const rafRef = useRef(null)

  useEffect(() => {
    if (!isDragging) {
      setLocalValue(value)
    }
  }, [value, isDragging])

  const valueToAngle = (val) => {
    return -135 + (val / 100) * 270
  }

  const angle = valueToAngle(localValue)

  const handleMouseDown = (e) => {
    if (!dialRef.current) return
    setIsDragging(true)
    dragDataRef.current = {
      startY: e.clientY,
      startValue: localValue
    }
  }

  const handleMouseMove = (e) => {
    if (!isDragging) return
    const totalDeltaY = dragDataRef.current.startY - e.clientY
    const valueDelta = totalDeltaY * 0.5
    let newValue = dragDataRef.current.startValue + valueDelta
    newValue = Math.max(0, Math.min(100, newValue))
    const roundedValue = Math.round(newValue)
    setLocalValue(roundedValue)
    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(() => {
        onChange(roundedValue)
        rafRef.current = null
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    onChange(Math.round(localValue))
  }

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging])

  const outerRadius = size / 2
  const innerRadius = (size * 0.7) / 2
  const strokeWidth = 2

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        ref={dialRef}
        className="relative cursor-pointer select-none"
        style={{
          width: size,
          height: size,
          transform: `rotate(${angle}deg)`,
          willChange: isDragging ? 'transform' : 'auto'
        }}
        onMouseDown={handleMouseDown}
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
      {label && <div className="kol-helper-xs text-fg-96">{value}%</div>}
    </div>
  )
}
