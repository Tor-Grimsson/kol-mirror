// Dropdown — overlay select control for modules

import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'

export default function Dropdown({ value, options, onChange, label }) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef(null)
  const [pos, setPos] = useState({ top: 0, left: 0 })

  const handleOpen = useCallback(() => {
    if (!triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    setPos({ top: rect.bottom + 2, left: rect.left })
    setOpen(true)
  }, [])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handleClick = () => setOpen(false)
    const handleKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('pointerdown', handleClick)
    window.addEventListener('keydown', handleKey)
    return () => {
      window.removeEventListener('pointerdown', handleClick)
      window.removeEventListener('keydown', handleKey)
    }
  }, [open])

  const triggerStyle = {
    fontSize: '7px',
    fontFamily: 'var(--kol-font-mono)',
    color: 'rgba(255,255,255,0.6)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 2,
    padding: '2px 6px',
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    textAlign: 'left',
    width: '100%',
    display: 'block',
  }

  return (
    <>
      {label && (
        <span style={{
          fontSize: '6px',
          fontFamily: 'var(--kol-font-mono)',
          color: 'rgba(255,255,255,0.35)',
          textTransform: 'uppercase',
          lineHeight: 1,
        }}>
          {label}
        </span>
      )}
      <button
        ref={triggerRef}
        style={triggerStyle}
        onPointerDown={(e) => { e.stopPropagation(); handleOpen() }}
      >
        {value || '—'}
      </button>
      {open && createPortal(
        <div
          style={{
            position: 'fixed',
            top: pos.top,
            left: pos.left,
            minWidth: 60,
            maxHeight: 160,
            overflowY: 'auto',
            backgroundColor: 'rgba(20,20,20,0.95)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 3,
            zIndex: 9999,
            padding: '2px 0',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          {options.map(opt => (
            <div
              key={opt}
              onClick={() => { onChange(opt); setOpen(false) }}
              style={{
                fontSize: '7px',
                fontFamily: 'var(--kol-font-mono)',
                color: opt === value ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.5)',
                backgroundColor: opt === value ? 'rgba(255,255,255,0.06)' : 'transparent',
                padding: '3px 8px',
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              {opt}
            </div>
          ))}
        </div>,
        document.body
      )}
    </>
  )
}
