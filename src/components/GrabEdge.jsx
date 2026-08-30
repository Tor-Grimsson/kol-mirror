import { useCallback, useEffect, useRef } from 'react'
import gsap from 'gsap'

/**
 * GrabEdge — kol-r2b2's grab pill, on either axis (user 2026-08-28, asking for
 * the rail's grabber on the mixer's top edge too). One implementation, two
 * consumers: NavRail's right edge (`axis="x"`) and the mixer's top edge
 * (`axis="y"`). Geometry and the fade are `.grab-edge*` in components.css.
 *
 * PROXIMITY, NOT CONTACT — the pill wakes when the pointer comes within NEAR
 * of the line and sleeps only past 2×NEAR (hysteresis: sitting on the line
 * flapped the class every frame and restarted the fade). It TRAILS the pointer
 * along the line on a long gsap tween of the strip's own variable — never
 * pinned to the cursor, and never snapped to a grid: it lands where the pointer
 * is and DWELLS there until the pointer leaves a STICK radius, which is what
 * keeps it from jerking without throwing it somewhere arbitrary.
 *
 * THE DRAG is the consumer's: `onDrag(px)` gets the pointer's position along
 * the perpendicular axis, `onRelease(px, moved)` the end. A click (no travel)
 * arrives as `moved: false` so a consumer can toggle. `data-grab-dragging` on
 * the root kills any transition while the pointer holds it.
 *
 * @param {'x'|'y'} axis  'x' = a vertical line dragged horizontally (a rail's
 *                        side); 'y' = a horizontal line dragged vertically
 * @param {Function} onDoubleClick  the reset — a resizable thing needs a way
 *                        back to its natural size
 */
const NEAR = 20
/* THE DWELL, not marks (user 2026-08-28: "I don't like the snapping of the
   grabber, it's too far — let's make it come to the cursor but have some sticky
   time where it lands, so it's not constantly jerking"). The pill lands ON the
   pointer and then HOLDS there until the pointer has travelled STICK px away
   from where it landed; then it travels to wherever the pointer is now. Fixed
   marks were the jerk: four of them on a tall edge sit ~200px apart, so every
   re-target was a long throw to a place the pointer was not. */
const STICK = 90

export default function GrabEdge({ axis = 'x', onDrag, onRelease, onDoubleClick, className = '', style }) {
  const ref = useRef(null)
  const vertical = axis === 'x'

  /* the pill's travel along the line */
  useEffect(() => {
    let raf = 0
    const onMove = ({ clientX, clientY }) => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = 0
        const h = ref.current
        if (!h) return
        const r = h.getBoundingClientRect()
        const mid = vertical ? r.left + r.width / 2 : r.top + r.height / 2
        const dist = Math.abs((vertical ? clientX : clientY) - mid)
        const near = dist <= NEAR || (h.classList.contains('is-near') && dist <= NEAR * 2)
        h.classList.toggle('is-near', near)
        if (!near) return
        const span = vertical ? r.height : r.width
        const along = Math.min(Math.max(vertical ? clientY - r.top : clientX - r.left, 0), span)
        // it holds where it landed until the pointer leaves the dwell radius
        if (h.dataset.grabSeeded && Math.abs(along - Number(h.dataset.grabTarget)) < STICK) return
        h.dataset.grabTarget = String(along)
        const vars = { [vertical ? '--grab-y' : '--grab-x']: `${along}px` }
        // the CSS fallback is 50%, a percentage — nothing to tween from, so
        // the first sighting sets and every move after tweens
        // shorter than the old 2.8s: it is travelling a fraction of the
        // distance now, and a long tween over a short throw reads as lag
        if (h.dataset.grabSeeded) gsap.to(h, { ...vars, duration: 1.1, ease: 'power3.out', overwrite: 'auto' })
        else { gsap.set(h, vars); h.dataset.grabSeeded = '1' }
      })
    }
    window.addEventListener('pointermove', onMove)
    return () => { window.removeEventListener('pointermove', onMove); cancelAnimationFrame(raf) }
  }, [vertical])

  const drag = useRef(null)
  const onPointerDown = useCallback((e) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    document.documentElement.setAttribute('data-grab-dragging', '')
    e.currentTarget.classList.add('is-dragging')
    drag.current = { start: vertical ? e.clientX : e.clientY, moved: false }
  }, [vertical])

  const onPointerMove = useCallback((e) => {
    const d = drag.current
    if (!d) return
    const at = vertical ? e.clientX : e.clientY
    if (Math.abs(at - d.start) > 3) d.moved = true
    onDrag?.(at, d.moved)
  }, [vertical, onDrag])

  const onPointerUp = useCallback((e) => {
    const d = drag.current
    if (!d) return
    drag.current = null
    document.documentElement.removeAttribute('data-grab-dragging')
    e.currentTarget.classList.remove('is-dragging')
    onRelease?.(vertical ? e.clientX : e.clientY, d.moved)
  }, [vertical, onRelease])

  return (
    <div
      ref={ref}
      className={`grab-edge grab-edge-${axis} ${className}`.trim()}
      style={style}
      onDoubleClick={onDoubleClick}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    />
  )
}
