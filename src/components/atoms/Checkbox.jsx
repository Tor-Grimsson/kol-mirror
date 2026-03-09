import React from 'react'

const Checkbox = ({
  checked = false,
  onChange,
  className = '',
  ...props
}) => {
  const handleChange = (event) => {
    const next = event.target.checked
    if (onChange) onChange(next)
  }

  return (
    <label
      className={`checkbox ${checked ? 'is-active' : ''} ${className}`.trim()}
      {...props}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={handleChange}
        aria-checked={checked}
      />
      <span className="checkbox-indicator" aria-hidden="true">
        <svg viewBox="0 0 12 9" width="12" height="9">
          <polyline points="1 5 4 8 11 1" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </label>
  )
}

export default Checkbox
