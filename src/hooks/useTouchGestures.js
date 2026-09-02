// useTouchGestures — touch pan + pinch-zoom for a viewport, no mode toggle.
//
// PORTED VERBATIM from kol-monitor `src/hooks/useTouchGestures.js` (2026-09-02,
// user: mirror takes the same mobile settings monitor landed). Not adapted —
// the two bugs its comments name were measured over there and would have been
// re-discovered here: a pinch fires one pointermove PER FINGER, so a zoom ref
// written on render restarts from stale zoom and the pan correction stacks
// (537px of drift); and a centre-anchored zoom slides a large fit-pan off
// screen, which is why `onZoom` carries the midpoint.
//
// Two fingers: pan by the midpoint, zoom by the distance. One finger: the
// control under it if there is one (knob, jack, slider, key — it keeps the
// pointer); otherwise it pans (2026-09-02 — the user on Create at 390: "can't
// move around, isn't this infinite canvas?"; empty case under a thumb has to
// move). A control is anything interactive by role or by its declared cursor.
//
// Touch pointers only — the mouse and keyboard paths of the caller are untouched.
// Pointer events, not the touch* API, so it is the same event stream the
// controls already listen on.
//
// `onPan(dx, dy)` — screen-px delta of the two-finger midpoint since the last move.
// `onZoom(factor, mid)` — ratio of the current finger distance to the last one,
// and the midpoint in client px: the caller anchors the zoom on it, so the
// content under the fingers stays under the fingers (the stage's fit-pan is
// ~1700px; a centre-anchored pinch slid the whole board off screen).

import { useEffect } from 'react'

const CONTROL = '[data-jack-id], button, input, select, textarea, a, [role="button"], [role="slider"]'
const isControl = (t) => {
  if (!t || t === document) return false
  if (t.closest(CONTROL)) return true
  const c = getComputedStyle(t).cursor
  return c !== 'auto' && c !== 'default' && c !== 'grab' && c !== 'grabbing'
}

export function useTouchGestures(ref, { onPan, onZoom, ignore }) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const pts = new Map()
    let last = null
    let solo = null // one finger on empty surface: { id, x, y }
    const geom = () => {
      const [a, b] = [...pts.values()]
      return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, d: Math.hypot(b.x - a.x, b.y - a.y) }
    }
    const down = (e) => {
      if (e.pointerType !== 'touch' || (ignore && e.target.closest(ignore))) return
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY })
      last = pts.size === 2 ? geom() : null
      // a lone finger on empty surface pans; a second finger ends that and pinches
      solo = pts.size === 1 && !isControl(e.target) ? { id: e.pointerId, x: e.clientX, y: e.clientY } : null
    }
    const move = (e) => {
      if (!pts.has(e.pointerId)) return
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY })
      if (pts.size === 1 && solo && solo.id === e.pointerId) {
        onPan(e.clientX - solo.x, e.clientY - solo.y)
        solo.x = e.clientX; solo.y = e.clientY
        return
      }
      if (pts.size !== 2 || !last) return
      const g = geom()
      onPan(g.x - last.x, g.y - last.y)
      if (last.d > 0) onZoom(g.d / last.d, { x: g.x, y: g.y })
      last = g
    }
    const up = (e) => {
      pts.delete(e.pointerId)
      last = pts.size === 2 ? geom() : null
      solo = null
    }
    el.addEventListener('pointerdown', down)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
    return () => {
      el.removeEventListener('pointerdown', down)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
    }
  }, [ref, onPan, onZoom, ignore])
}
