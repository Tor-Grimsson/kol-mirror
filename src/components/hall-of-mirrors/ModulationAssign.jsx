import { useEffect, useRef } from 'react'

const MOD_SOURCES = [
  { id: 'none', label: 'None' },
  { id: 'lfo1', label: 'LFO 1' },
  { id: 'lfo2', label: 'LFO 2' },
  { id: 'seq1', label: 'SEQ 1' },
  { id: 'gate1', label: 'GATE 1' },
  { id: 'env1', label: 'ENV 1' },
  { id: 'sh1', label: 'S&H 1' },
  { id: 'mult1_a', label: 'MULT A' },
  { id: 'mult1_b', label: 'MULT B' },
  { id: 'mult1_c', label: 'MULT C' },
]

export default function ModulationAssign({ x, y, currentSource, onSelect, onClose }) {
  const ref = useRef(null)

  useEffect(() => {
    const handle = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose()
    }
    document.addEventListener('pointerdown', handle)
    return () => document.removeEventListener('pointerdown', handle)
  }, [onClose])

  return (
    <div
      ref={ref}
      className="flex flex-col bg-surface-secondary border border-fg-16 shadow-lg"
      style={{
        position: 'fixed',
        left: x,
        top: y,
        zIndex: 9999,
        borderRadius: '4px',
        minWidth: '100px',
        padding: '2px 0',
      }}
    >
      <div className="kol-helper-xxs text-fg-32 px-2 py-1" style={{ borderBottom: '1px solid var(--kol-fg-08)' }}>
        Modulation
      </div>
      {MOD_SOURCES.map((src) => (
        <div
          key={src.id}
          className={`kol-helper-xs px-2 py-1 cursor-pointer hover:bg-fg-08 ${currentSource === src.id ? 'text-accent-primary' : 'text-fg-96'}`}
          onClick={() => {
            onSelect(src.id === 'none' ? null : src.id)
            onClose()
          }}
        >
          {src.label}
        </div>
      ))}
    </div>
  )
}
