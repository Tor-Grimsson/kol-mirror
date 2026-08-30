import { useEffect, useRef } from 'react'

export default function ModulationAssign({ x, y, currentSource, onSelect, onClose, busRef }) {
  const ref = useRef(null)

  // Build sources from registered bus keys
  const sources = [{ id: 'none', label: 'None' }]
  if (busRef?.current) {
    for (const key of Object.keys(busRef.current)) {
      sources.push({ id: key, label: key })
    }
  }

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
      <div className="kol-helper-10 text-fg-32 px-2 py-1" style={{ borderBottom: '1px solid var(--kol-fg-08)' }}>
        Modulation
      </div>
      {sources.map((src) => (
        <div
          key={src.id}
          className={`kol-helper-12 px-2 py-1 cursor-pointer hover:bg-fg-08 ${currentSource === src.id ? 'text-accent-primary' : 'text-fg-96'}`}
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
