import React, { useMemo, useRef, useCallback } from 'react'

/**
 * Slider Component
 *
 * Reusable range slider with label and value display
 *
 * @param {Object} props
 * @param {string} props.label - Slider label text
 * @param {number} props.min - Minimum value
 * @param {number} props.max - Maximum value
 * @param {number} props.value - Current value
 * @param {Function} props.onChange - Change handler
 * @param {string} props.variant - Variant style: 'default' | 'minimal'
 * @param {string} props.className - Additional wrapper classes
 * @param {number} props.displayWidth - Width for value display (in characters)
 * @param {string} props.fontSize - Font size for label and value (e.g., '11px', '12px', '14px')
 * @param {number} props.step - Slider step increment (default: 1)
 * @param {Function} props.formatValue - Optional formatter for displayed value
 */
const Slider = ({
  label,
  min = 0,
  max = 100,
  value = 0,
  value2,
  label1,
  label2,
  onChange,
  onChange2,
  variant = 'default',
  className = '',
  displayWidth = 10,
  fontSize,
  step = 1,
  playhead,
  onPlayheadChange,
  formatValue
}) => {
  const handleChange = (e) => {
    if (onChange) {
      onChange(Number(e.target.value))
    }
  }

  const isDual = variant === 'dual'
  const variantClass = (variant === 'minimal' || isDual) ? 'control-slider-minimal' : 'control-slider'
  const decimals = useMemo(() => {
    if (formatValue) return null
    if (!Number.isFinite(step)) return 0
    if (step >= 1) return 0
    const decimalPart = step.toString().split('.')[1]
    return decimalPart ? decimalPart.length : 2
  }, [formatValue, step])

  const fmt = (v) => {
    if (formatValue) return formatValue(v)
    if (decimals && decimals > 0) return Number(v).toFixed(decimals)
    return Math.round(v)
  }

  const trackRef = useRef(null)
  const handlePlayheadDrag = useCallback((e) => {
    if (!onPlayheadChange || !trackRef.current) return
    e.preventDefault()
    const track = trackRef.current
    const seek = (clientX) => {
      const rect = track.getBoundingClientRect()
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
      onPlayheadChange(min + ratio * (max - min))
    }
    seek(e.clientX)
    const onMove = (me) => seek(me.clientX)
    const onUp = () => { window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp) }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }, [min, max, onPlayheadChange])

  if (isDual) {
    const v1 = value ?? min
    const v2 = value2 ?? max
    const showLabels = label1 || label2
    return (
      <div className={`${variantClass} gap-3 shadow-none ${className}`}>
        {label && (
          <label className="kol-helper-xs whitespace-nowrap shrink-0 w-fit" style={fontSize ? { fontSize } : undefined}>
            {label}
          </label>
        )}
        <div className="flex-1">
          {showLabels && (
            <div className="flex items-center justify-between kol-helper-xs text-fg-32" style={{ marginBottom: '-2px' }}>
              <span>{label1 || fmt(v1)}</span>
              <span>{label2 || fmt(v2)}</span>
            </div>
          )}
          <div className="relative w-full" ref={trackRef} style={{ height: '20px', cursor: onPlayheadChange ? 'pointer' : undefined }} onClick={(e) => {
            if (!onPlayheadChange || !trackRef.current) return
            const rect = trackRef.current.getBoundingClientRect()
            const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
            onPlayheadChange(min + ratio * (max - min))
          }}>
            <div className="absolute left-0 right-0" style={{ top: '9px', height: '2px', backgroundColor: 'var(--kol-surface-on-primary)' }} />
            {playhead != null && max > min && (
              <div
                className="absolute"
                style={{ left: `calc(6px + (100% - 12px) * ${(playhead - min) / (max - min)})`, top: '0px', width: '3px', height: '20px', marginLeft: '-1.5px', backgroundColor: '#2dd4bf', zIndex: 4, cursor: 'grab', borderRadius: '1px' }}
                onPointerDown={handlePlayheadDrag}
              />
            )}
            <input
              type="range" min={min} max={max} step={step} value={v1}
              onChange={(e) => { const n = Number(e.target.value); onChange && onChange(Math.min(n, v2)) }}
              className="dual-range-in"
              style={{ position: 'absolute', inset: 0, width: '100%', pointerEvents: 'none', appearance: 'none', background: 'transparent', zIndex: 1 }}
            />
            <input
              type="range" min={min} max={max} step={step} value={v2}
              onChange={(e) => { const n = Number(e.target.value); onChange2 && onChange2(Math.max(n, v1)) }}
              className="dual-range-out"
              style={{ position: 'absolute', inset: 0, width: '100%', pointerEvents: 'none', appearance: 'none', background: 'transparent', zIndex: 2 }}
            />
          </div>
        </div>
      </div>
    )
  }

  const displayValue = useMemo(() => fmt(value), [decimals, formatValue, value])

  return (
    <div className={`${variantClass} gap-3 shadow-none ${className}`}>
      {label && (
        <label className="kol-helper-xs whitespace-nowrap shrink-0 w-fit" style={fontSize ? { fontSize } : undefined}>
          {label}
        </label>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        className="slider-black flex-1 w-full cursor-pointer"
      />
      {displayValue != null && <span className="kol-helper-xs text-right shrink-0 w-fit" style={fontSize ? { fontSize } : undefined}>
        {displayValue}
      </span>}
    </div>
  )
}

export default Slider
