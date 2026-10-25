import { useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

/**
 * FloatingFrame — the monitor as a window over the desk (the float arrangement, 2026-10-03).
 *
 * User: *"what about making the frame overlay the mixer? and just give the entire view the mixer
 * … the frame overlay can be draggable, that way its not taking space but can be small or large
 * or hidden based on what operation user is doing"*. It takes `InfiniteCanvas`'s place in
 * `SymphonyViewport`, so the monitor's own tree is the same in both arrangements.
 *
 * Drag it by its body, scale it from the corner grip — `useFloating`, kol-monitor's Stage hook.
 * HIDDEN IS NOT UNMOUNTED: the channel canvases inside are what the frame buffer captures, so the
 * window fades out and stops taking the pointer, the way monitor's dock does.
 *
 * THE PICTURE IS ONE DOM NODE THAT MOVES (plan 10 § 3.1). `children` render once, through a portal, into
 * `host`; DOCKED, `host` is appended into the Monitor module's `slot`, otherwise into this window. Moving a
 * node re-parents nothing in React, so no channel remounts and no canvas clears — and in the slot the picture
 * is part of the module, so it cannot lag or drift off it (user 2026-10-24: *"monitor screen glitches away
 * from its housing module"*). The move is synchronous, so a playing `<video>` inside never sees a pause.
 *
 * @param {Object}  frame   `useFloating()`'s return — `box { x, y }`, `onDrag`, `onResize`
 * @param {boolean} hidden
 * @param {Element} slot    the Monitor module's screen slot when docked, else null
 */
export default function FloatingFrame({ frame, hidden, slot = null, onClose, children }) {
  const [host] = useState(() => document.createElement('div'))
  const anchor = useRef(null)
  useLayoutEffect(() => {
    const parent = slot ?? anchor.current
    if (parent && host.parentNode !== parent) parent.appendChild(host)
  }, [slot, host])
  useLayoutEffect(() => () => host.remove(), [host])
  /* DOCKED (2026-10-15) the picture sits in the Monitor module's slot and lets the
     pointer through to the desk. OVERLAY it is the window it was, plus a visible
     corner grip and an × on hover (user: *"close with X on hover"*). */
  return (
    <div
      ref={anchor}
      onPointerDown={slot ? undefined : frame.onDrag}
      className={`absolute group ${slot ? 'pointer-events-none' : 'cursor-grab'} ${hidden ? 'pointer-events-none' : ''}`}
      style={{ left: frame.box.x, top: frame.box.y, zIndex: 20 }}
    >
      {createPortal(
        <div className={`transition-opacity duration-200 ${slot ? 'absolute inset-0 pointer-events-none' : ''} ${hidden ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>{children}</div>,
        host,
      )}
      {!slot && !hidden && (
        <>
          <button
            type="button"
            onClick={onClose}
            aria-label="Hide the frame"
            title="Hide the frame (V)"
            className="absolute flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            style={{ top: 6, right: 6, width: 22, height: 22, borderRadius: 3, background: 'rgb(0 0 0 / 0.55)', color: '#fff', fontSize: 14, lineHeight: 1 }}
          >
            ×
          </button>
          <span
            onPointerDown={frame.onResize}
            title="Drag to resize"
            className="absolute opacity-40 group-hover:opacity-100 transition-opacity"
            style={{ right: 2, bottom: 2, width: 14, height: 14, cursor: 'nwse-resize', borderRight: '2px solid #fff', borderBottom: '2px solid #fff' }}
          />
        </>
      )}
    </div>
  )
}
