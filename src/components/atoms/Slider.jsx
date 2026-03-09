import React, { useMemo } from 'react'

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
  onChange,
  variant = 'default',
  className = '',
  displayWidth = 10,
  fontSize,
  step = 1,
  formatValue
}) => {
  const handleChange = (e) => {
    if (onChange) {
      onChange(Number(e.target.value))
    }
  }

  const variantClass = variant === 'minimal' ? 'control-slider-minimal' : 'control-slider'
  const decimals = useMemo(() => {
    if (formatValue) return null
    if (!Number.isFinite(step)) return 0
    if (step >= 1) return 0
    const decimalPart = step.toString().split('.')[1]
    return decimalPart ? decimalPart.length : 2
  }, [formatValue, step])

  const displayValue = useMemo(() => {
    if (formatValue) return formatValue(value)
    if (decimals && decimals > 0) {
      return Number(value).toFixed(decimals)
    }
    return Math.round(value)
  }, [decimals, formatValue, value])

  return (
    <div className={`${variantClass} gap-3 shadow-none ${className}`}>
      {label && (
        <label className="kol-mono-xs whitespace-nowrap shrink-0 w-fit" style={fontSize ? { fontSize } : undefined}>
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
      <span className="kol-mono-xs text-right shrink-0 w-fit" style={fontSize ? { fontSize } : undefined}>
        {displayValue}
      </span>
    </div>
  )
}

export default Slider
