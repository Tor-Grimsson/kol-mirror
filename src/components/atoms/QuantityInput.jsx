import { useState } from 'react'

const QuantityInput = ({
  value = 1,
  onChange,
  min = 1,
  max = 99,
  className = ''
}) => {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(String(value))

  const increment = () => {
    if (value < max) onChange?.(value + 1)
  }

  const decrement = () => {
    if (value > min) onChange?.(value - 1)
  }

  const startEditing = () => {
    setDraft(String(value))
    setEditing(true)
  }

  const commitEdit = () => {
    setEditing(false)
    const num = parseInt(draft, 10)
    if (!isNaN(num)) {
      onChange?.(Math.max(min, Math.min(max, num)))
    }
  }

  return (
    <div
      className={`relative flex items-center ${className}`}
      style={{
        height: '24px',
        border: '1px solid var(--kol-fg-16)',
        borderRadius: '4px',
        backgroundColor: 'transparent',
        color: 'var(--kol-surface-on-primary)',
        paddingLeft: '8px',
        paddingRight: '20px',
        fontSize: '12px',
        lineHeight: '120%',
        fontFamily: 'var(--kol-font-family-mono)',
        minWidth: '52px',
      }}
    >
      {editing ? (
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={(e) => { if (e.key === 'Enter') commitEdit() }}
          autoFocus
          style={{
            width: '100%',
            backgroundColor: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'inherit',
            fontSize: 'inherit',
            fontFamily: 'inherit',
            padding: 0,
          }}
        />
      ) : (
        <span
          onClick={startEditing}
          style={{ cursor: 'text' }}
        >
          {value}
        </span>
      )}

      <div
        style={{
          position: 'absolute',
          right: '4px',
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
        }}
      >
        <button
          type="button"
          onClick={increment}
          disabled={value >= max}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            padding: '0',
            cursor: value >= max ? 'not-allowed' : 'pointer',
            opacity: value >= max ? 0.3 : 1,
            lineHeight: 0,
            display: 'block',
            color: 'inherit',
          }}
          aria-label="Increase"
        >
          <svg width="8" height="5" viewBox="2 3.5 8 5" fill="none">
            <path
              d="m3 7 3-3 3 3"
              stroke="currentColor"
              strokeWidth="1.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <button
          type="button"
          onClick={decrement}
          disabled={value <= min}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            padding: '0',
            cursor: value <= min ? 'not-allowed' : 'pointer',
            opacity: value <= min ? 0.3 : 1,
            lineHeight: 0,
            display: 'block',
            color: 'inherit',
          }}
          aria-label="Decrease"
        >
          <svg width="8" height="5" viewBox="2 3.5 8 5" fill="none">
            <path
              d="m3 5 3 3 3-3"
              stroke="currentColor"
              strokeWidth="1.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default QuantityInput
