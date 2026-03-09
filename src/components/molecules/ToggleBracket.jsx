import React from 'react'

const ToggleBracket = ({
  label,
  value = false,
  onToggle,
  onChange,
  offLabel = 'OFF',
  onLabel = 'ON',
  variant = 'default',
  className = '',
  ...props
}) => {
  const handleClick = () => {
    if (onToggle) onToggle(!value)
    if (onChange) onChange(!value)
  }

  const baseClass = variant === 'plain' ? 'toggle-bracket-plain' : 'toggle-bracket'

  return (
    <button
      type="button"
      className={`${baseClass} ${value ? 'is-active' : ''} ${className}`.trim()}
      onClick={handleClick}
      aria-pressed={value}
      {...props}
    >
      <span className="kol-mono-xs uppercase tracking-[0.06em]">{label}</span>
      <span className="kol-mono-xs uppercase tracking-[0.08em]">
        [{value ? onLabel : offLabel}]
      </span>
    </button>
  )
}

export default ToggleBracket
