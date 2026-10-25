import { useRef } from 'react'
import { DeskModule, ModuleFooter, ModuleAction } from './ModuleFrame'

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

export default function MonitorModule({ docked = false, onDock, hidden = false, onHidden, width = 360, onWidth, ratio = 9 / 16, slotRef, flipped = false, onFlip, back = null, strip = null }) {
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
  /* THE STANDARD (plan 12): the body is the picture's slot with DOCK · OVERLAY · HIDE as its text-button row; the
     footer carries the width; the jack row the IN; the back the Screen 2 IN. The plate is the slot plus its padding,
     and the width grip is its corner. */
  return (
    <DeskModule
      width={width + 32}
      power={{ on: !hidden, onToggle: () => onHidden?.(!hidden), title: hidden ? 'Show the frame (V)' : 'Hide the frame (V)' }}
      head={<span className="text-fg-96">Monitor</span>}
      headRight={<span className="kol-helper-10 text-fg-32">{hidden ? 'Hidden' : docked ? 'Docked' : 'Overlay'}</span>}
      flipped={flipped}
      onFlip={onFlip}
      back={back}
      actions={(
        <>
          <ModuleAction tone={docked ? 'var(--kol-accent-primary)' : undefined} onClick={() => { onDock?.(true); onHidden?.(false) }} title="Put the frame in this module">DOCK</ModuleAction>
          <ModuleAction tone={!docked ? 'var(--kol-accent-primary)' : undefined} onClick={() => { onDock?.(false); onHidden?.(false) }} title="Float the frame over the desk">OVERLAY</ModuleAction>
          <ModuleAction tone={hidden ? 'var(--kol-accent-primary)' : undefined} onClick={() => onHidden?.(!hidden)} title={hidden ? 'Show the frame (V)' : 'Hide the frame (V)'}>{hidden ? 'SHOW' : 'HIDE'}</ModuleAction>
        </>
      )}
      footer={(
        <ModuleFooter width={width + 32} square={!!strip}>
          <div className="flex items-center justify-between" style={{ height: 24, fontVariantNumeric: 'tabular-nums' }}>
            <span className="text-fg-96">Width</span>
            <span className="text-fg-64">{width}px</span>
          </div>
        </ModuleFooter>
      )}
      jacks={strip}
    >
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
      {/* width grip — the plate's bottom-right corner */}
      <span
        ref={grip}
        onPointerDown={onGrip}
        title="Drag to resize the monitor"
        className="absolute"
        style={{ right: 2, bottom: 2, width: 14, height: 14, cursor: 'ew-resize', borderRight: '2px solid var(--kol-fg-24)', borderBottom: '2px solid var(--kol-fg-24)' }}
      />
    </DeskModule>
  )
}
