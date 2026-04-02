// Selector — eurorack < value > style selector

import { useCallback } from 'react'

export default function Selector({ value, options, onChange }) {
  const idx = options.indexOf(value)

  const prev = useCallback(() => {
    const next = idx <= 0 ? options.length - 1 : idx - 1
    onChange(options[next])
  }, [idx, options, onChange])

  const next = useCallback(() => {
    const n = idx >= options.length - 1 ? 0 : idx + 1
    onChange(options[n])
  }, [idx, options, onChange])

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
      userSelect: 'none',
    }}>
      <span
        onClick={prev}
        style={{
          cursor: 'pointer',
          fontSize: '8px',
          color: 'rgba(255,255,255,0.4)',
          padding: '0 2px',
        }}
      >
        ‹
      </span>
      <span style={{
        fontSize: '7px',
        fontFamily: 'var(--kol-font-mono)',
        color: 'rgba(255,255,255,0.6)',
        textTransform: 'uppercase',
        minWidth: 24,
        textAlign: 'center',
      }}>
        {value}
      </span>
      <span
        onClick={next}
        style={{
          cursor: 'pointer',
          fontSize: '8px',
          color: 'rgba(255,255,255,0.4)',
          padding: '0 2px',
        }}
      >
        ›
      </span>
    </div>
  )
}
