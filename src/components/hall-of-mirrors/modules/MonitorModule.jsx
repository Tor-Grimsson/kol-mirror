import { useRef } from 'react'
import { ModuleTab } from './ModuleFrame'

/**
 * MonitorModule — the output frame's module (user 2026-10-15: *"we are missing a
 * monitor module. we need to be able to resize this frame and it needs a way to
 * show hide on shortcut, but also close with X on hover, and maybe in the
 * monitor module there would be also overlay frame toggle to show it?"*).
 *
 * THE FRAME IS NOT MOVED IN HERE. Its tree holds the channel canvases the frame
 * buffer captures (`FloatingFrame`: hidden is not unmounted), so re-parenting it
 * would re-create every channel. Instead the panel carries a SCREEN SLOT and,
 * DOCKED, the frame tracks that slot through pan and zoom (`SymphonyViewport`).
 * OVERLAY floats it free over the desk, as it was. The width grip on the panel's
 * corner sizes the slot, and so the docked picture.
 *
 * @param {boolean}  docked     the frame sits in the slot (true) or floats (false)
 * @param {Function} onDock     (bool) => void
 * @param {boolean}  hidden     V's state
 * @param {Function} onHidden   (bool) => void
 * @param {number}   width      the slot's width in px
 * @param {Function} onWidth    (px) => void
 * @param {number}   ratio      height / width of the picture
 * @param {Function} slotRef    callback ref for the slot the frame tracks
 */
export const MONITOR_MIN_W = 240
export const MONITOR_MAX_W = 720

export default function MonitorModule({ docked = false, onDock, hidden = false, onHidden, width = 360, onWidth, ratio = 9 / 16, slotRef }) {
  const grip = useRef(null)
  const onGrip = (e) => {
    if (e.button !== 0 || !onWidth) return
    e.preventDefault()
    e.stopPropagation()
    const x0 = e.clientX
    const w0 = width
    const move = (ev) => onWidth(Math.round(Math.max(MONITOR_MIN_W, Math.min(MONITOR_MAX_W, w0 + ev.clientX - x0))))
    const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up) }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }
  const key = (on, label, onClick, title) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`flex-1 kol-helper-10 cursor-pointer select-none ${on ? 'text-accent-primary' : 'text-fg-64 hover:text-fg-96'}`}
      style={{ height: 24, background: on ? 'var(--kol-oq-12)' : 'var(--kol-surface-tertiary)', boxShadow: on ? 'inset 0 1px 2px rgb(0 0 0 / 0.45)' : undefined }}
    >
      {label}
    </button>
  )

  return (
    <div className="flex flex-col shrink-0" style={{ height: '100%', maxHeight: '100%', width: width + 24 }}>
      <ModuleTab>
        <span className="text-fg-96">Monitor</span>
        <span className="kol-helper-10 text-fg-32">{hidden ? 'Hidden' : docked ? 'Docked' : 'Overlay'}</span>
      </ModuleTab>
      <div className="relative flex flex-col flex-1 gap-3 p-3 bg-surface-secondary border border-fg-08" style={{ borderRadius: '4px', minHeight: 0 }}>
        {/* THE SLOT — where the docked frame lands. Empty-looking on purpose when
            the frame floats: a monitor with its picture elsewhere. */}
        <div
          ref={slotRef}
          data-monitor-slot=""
          className="relative shrink-0 border border-fg-08 flex items-center justify-center kol-helper-10 text-fg-24"
          style={{ width, height: Math.round(width * ratio), borderRadius: 4, background: 'var(--kol-surface-absolute-split, #000)' }}
        >
          {(!docked || hidden) && <span>{hidden ? 'Hidden — V' : 'On the overlay'}</span>}
        </div>
        <div className="flex shrink-0" style={{ gap: 1, borderRadius: 3, overflow: 'hidden', border: '1px solid var(--kol-fg-08)' }}>
          {key(docked, 'DOCK', () => { onDock?.(true); onHidden?.(false) }, 'Put the frame in this module')}
          {key(!docked, 'OVERLAY', () => { onDock?.(false); onHidden?.(false) }, 'Float the frame over the desk')}
          {key(hidden, hidden ? 'SHOW' : 'HIDE', () => onHidden?.(!hidden), hidden ? 'Show the frame (V)' : 'Hide the frame (V)')}
        </div>
        <div className="flex items-center justify-between kol-helper-10 text-fg-32 shrink-0" style={{ fontVariantNumeric: 'tabular-nums' }}>
          <span>Width</span>
          <span className="text-fg-64">{width}px</span>
        </div>
        {/* width grip — the panel's bottom-right corner */}
        <span
          ref={grip}
          onPointerDown={onGrip}
          title="Drag to resize the monitor"
          className="absolute"
          style={{ right: 2, bottom: 2, width: 14, height: 14, cursor: 'ew-resize', borderRight: '2px solid var(--kol-fg-24)', borderBottom: '2px solid var(--kol-fg-24)' }}
        />
      </div>
    </div>
  )
}
