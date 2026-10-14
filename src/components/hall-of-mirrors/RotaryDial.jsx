import { useCallback, useState } from 'react'
import { createPortal } from 'react-dom'
// Subpath import — the barrel export pulls every organism into the bundle (see atoms/Button.jsx)
import Knob from '@kolkrabbi/kol-component/molecules/Knob'
import useExpressionValue from '../../hooks/useExpressionValue'
import ModulationAssign from './ModulationAssign'

/**
 * RotaryDial — an adapter over the DS `Knob variant="panel"` (@kolkrabbi/kol-component), the same
 * shape `atoms/Button.jsx` and `atoms/Slider.jsx` use (2026-10-03, user ruling). The knob itself —
 * the cap, the pointer, the drag, alt-click reset — is the DS's now; the hand-drawn tick ring and
 * disc are retired to `_tmp/2026-10-03-mixer-own-controls/RotaryDial.jsx`. All 32 call sites are
 * unchanged.
 *
 * WHAT STAYS HERE IS WHAT THE DS KNOB DOES NOT HAVE, which is why this is an adapter and not a
 * direct import: the value box that takes an EXPRESSION (click it, type `wave(t)`, the dial
 * runs — `useExpressionValue`), and the right-click modulation menu with its red dot. Those are
 * the instrument's, not a knob's.
 *
 * THE BOX IS KEPT. Each variant held a fixed box when it drew its own ring (64 · 40 · 104); the DS
 * knob sits centred in the same box, so no module on the desk reflows. The knob's own size is the
 * DS rung that fits: `dense` 32 or 40, the default 40, `master` 64 — the DS has no larger.
 * `panel` and `compact` are accepted and do nothing now: every dial is the panel knob.
 */
const DIAL_VARIANTS = {
  default: { box: 64, knob: () => 'lg' },
  dense: { box: 40, knob: (size) => (size >= 30 ? 'lg' : 'md') },
  master: { box: 104, knob: () => 'xl' },
}

export default function RotaryDial({ label, value = 0, onChange, size = 80, min = 0, max = 100, variant = 'default', defaultValue, modulationSource, onModulationAssign, busRef }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const [modMenu, setModMenu] = useState(null)
  const { expr, commit: commitExpr, isAnimating } = useExpressionValue({ onChange, min, max, busRef })

  const handleContextMenu = useCallback((e) => {
    if (!onModulationAssign) return
    e.preventDefault()
    setModMenu({ x: e.clientX, y: e.clientY })
  }, [onModulationAssign])

  const handleModSelect = useCallback((sourceId) => {
    if (!onModulationAssign) return
    if (sourceId) {
      // Set expression to the bus variable name
      commitExpr(sourceId, onChange)
      onModulationAssign(sourceId)
    } else {
      // Clear modulation — clear expression
      commitExpr('', onChange)
      onModulationAssign(null)
    }
  }, [onModulationAssign, commitExpr, onChange])

  const { box, knob } = DIAL_VARIANTS[variant] || DIAL_VARIANTS.default

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative select-none flex items-center justify-center"
        style={{ width: box, height: box }}
        onContextMenu={handleContextMenu}
      >
        <Knob
          variant="panel"
          size={knob(size)}
          value={value}
          onChange={onChange}
          min={min}
          max={max}
          defaultValue={defaultValue ?? min}
        />
        {modulationSource && (
          <div
            style={{
              position: 'absolute',
              bottom: variant === 'dense' ? 2 : 8,
              right: 2,
              width: 5,
              height: 5,
              borderRadius: '50%',
              backgroundColor: '#e74c3c',
            }}
          />
        )}
      </div>
      {modMenu && createPortal(
        <ModulationAssign
          x={modMenu.x}
          y={modMenu.y}
          currentSource={modulationSource}
          onSelect={handleModSelect}
          onClose={() => setModMenu(null)}
          busRef={busRef}
        />,
        document.body
      )}
      {label && <div className={`flex items-center justify-center gap-1 w-full ${variant === 'dense' ? 'kol-helper-8' : ''}`} style={variant === 'dense' ? {} : { fontSize: '10px', fontFamily: 'var(--kol-font-family-mono)' }}>
        <span className="text-fg-64 uppercase">{label}</span>
        <span className="text-fg-96" style={{ width: '32px', textAlign: 'right', display: 'inline-block', overflow: 'hidden' }}>
          {editing ? (
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={() => { setEditing(false); commitExpr(draft, onChange) }}
              onKeyDown={(e) => { if (e.key === 'Enter') { setEditing(false); commitExpr(draft, onChange) } if (e.key === 'Escape') setEditing(false) }}
              autoFocus
              className="bg-surface-tertiary"
              style={{ width: '100%', height: '15px', border: 'none', outline: 'none', color: 'inherit', fontSize: 'inherit', fontFamily: 'inherit', padding: 0, textAlign: 'right', borderRadius: '2px', lineHeight: '15px' }}
            />
          ) : (
            <span className={`cursor-pointer ${isAnimating ? 'text-accent-primary' : ''}`} onClick={(e) => { if (e.altKey && isAnimating) { commitExpr('', onChange) } else { setDraft(expr || String(Math.round(value))); setEditing(true) } }}>{expr || `${Math.round(value)}%`}</span>
          )}
        </span>
      </div>}
    </div>
  )
}
