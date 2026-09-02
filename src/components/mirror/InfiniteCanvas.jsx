import { useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { useTouchGestures } from '../../hooks/useTouchGestures'

/**
 * InfiniteCanvas — the studio's viewport becomes a workspace you can pan and
 * zoom (user 2026-08-28: "make studio infinite canvas").
 *
 * The transform lives on ONE layer and is written straight to the DOM: a pan is
 * a pointermove per frame, and putting that through React state would re-render
 * the monitor, the deck and every channel for a value only a transform reads.
 * React holds one thing — whether the canvas has been moved at all — so the
 * "reset" affordance can appear, and that changes once, not per frame.
 *
 * WHAT PANS IT MATTERS. A canvas that pans on any drag eats every knob and
 * fader on it, so the drag starts only on BACKGROUND — the stage itself, never
 * a child — or on space-drag, or on middle-button, which are the three gestures
 * every canvas app shares. The wheel zooms about the POINTER, not the centre,
 * which is the difference between a canvas and a zoom button.
 */
/* 0.1, monitor's floor, not 0.25 — at 0.25 a 1716px rack was still 429px, wider
   than a 390 phone at any zoom ("it's clipping"). Mirror's desk is the same
   order of width. */
const MIN = 0.1
const MAX = 3
const clamp = (v, a, b) => Math.min(Math.max(v, a), b)

/* `controls` — an object this fills with `{ zoomIn, zoomOut, setZoom, reset }`,
   and `onZoomChange(k)` for a readout. The view lives in a ref so the pan stays
   off React; a consumer that wants to SHOW the zoom needs telling, and one that
   wants a −/+ needs a way in. Monitor's bottom bar is the reason both exist. */
export default function InfiniteCanvas({ children, className = '', style, controls, onZoomChange, showReset = true }) {
  const stage = useRef(null)
  const layer = useRef(null)
  const view = useRef({ x: 0, y: 0, k: 1 })
  const [moved, setMoved] = useState(false)

  const paint = useCallback(() => {
    const { x, y, k } = view.current
    if (layer.current) layer.current.style.transform = `translate(${x}px, ${y}px) scale(${k})`
    onZoomChange?.(k)
  }, [onZoomChange])

  const reset = useCallback(() => {
    view.current = { x: 0, y: 0, k: 1 }
    paint()
    setMoved(false)
  }, [paint])

  useEffect(() => {
    const el = stage.current
    if (!el) return undefined
    /* TOUCH-ACTION ON BOTH BOXES, monitor's ruling: the OUTER as well as the
       transformed content. The margin around the canvas is most of a phone
       screen, and a touch starting there was the browser's — page scroll, our
       pointers cancelled. Without it the pointer stream never reaches
       `useTouchGestures` below. A scroller nested inside still gets native
       scroll: touch-action resolves only up to the nearest scroll container. */
    el.style.touchAction = 'none'
    if (layer.current) layer.current.style.touchAction = 'none'
    let drag = null
    let space = false

    const onKeyDown = (e) => { if (e.code === 'Space') space = true }
    const onKeyUp = (e) => { if (e.code === 'Space') space = false }

    const onDown = (e) => {
      /* MOUSE ONLY. Touch is `useTouchGestures` below — one finger on empty
         surface pans, two pinch — and letting both run on a phone gave two
         handlers one pointer stream. */
      if (e.pointerType === 'touch') return
      /* background, space-drag or middle button — never a control */
      const onBackground = e.target === el || e.target === layer.current
      if (!(onBackground || space || e.button === 1)) return
      if (e.button === 1) e.preventDefault()
      el.setPointerCapture?.(e.pointerId)
      drag = { x: e.clientX, y: e.clientY, vx: view.current.x, vy: view.current.y }
      el.style.cursor = 'grabbing'
    }
    const onMove = (e) => {
      if (!drag) return
      view.current.x = drag.vx + (e.clientX - drag.x)
      view.current.y = drag.vy + (e.clientY - drag.y)
      paint()
    }
    const onUp = () => {
      if (!drag) return
      drag = null
      el.style.cursor = ''
      setMoved(true)
    }
    /* zoom about the pointer: the point under the cursor stays under it */
    const onWheel = (e) => {
      if (!(e.ctrlKey || e.metaKey)) return
      e.preventDefault()
      const r = el.getBoundingClientRect()
      const px = e.clientX - r.left
      const py = e.clientY - r.top
      const v = view.current
      const k = clamp(v.k * Math.exp(-e.deltaY / 400), MIN, MAX)
      v.x = px - ((px - v.x) / v.k) * k
      v.y = py - ((py - v.y) / v.k) * k
      v.k = k
      paint()
      setMoved(true)
    }

    el.addEventListener('pointerdown', onDown)
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerup', onUp)
    el.addEventListener('pointercancel', onUp)
    el.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerup', onUp)
      el.removeEventListener('pointercancel', onUp)
      el.removeEventListener('wheel', onWheel)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [paint])

  /* TOUCH — monitor's `useTouchGestures`, its consumers' shape too.
     `onTouchPan` is screen px straight onto the translate, because this canvas
     transforms with `scale()` and not CSS `zoom` (monitor's rack divides by
     zoom for that reason; the stage, which uses a transform like this one,
     does not).
     `onTouchZoom` anchors on the MIDPOINT — the content under the fingers
     stays under the fingers — and writes `view.current.k` EAGERLY inside the
     gesture. That eagerness is the 537px bug monitor measured: a pinch fires
     one pointermove PER FINGER, so a value written on render is already stale
     by the second one and the pan correction stacks. `view` is a ref, so it is
     eager by construction here. */
  const onTouchPan = useCallback((dx, dy) => {
    view.current.x += dx
    view.current.y += dy
    paint()
    setMoved(true)
  }, [paint])

  const onTouchZoom = useCallback((factor, mid) => {
    const el = stage.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const px = mid.x - r.left
    const py = mid.y - r.top
    const v = view.current
    const k = clamp(v.k * factor, MIN, MAX)
    v.x = px - ((px - v.x) / v.k) * k
    v.y = py - ((py - v.y) / v.k) * k
    v.k = k
    paint()
    setMoved(true)
  }, [paint])

  useTouchGestures(stage, { onPan: onTouchPan, onZoom: onTouchZoom })

  /* zoom about the CENTRE for the bar's −/+, which have no pointer of their own */
  const zoomTo = useCallback((next) => {
    const el = stage.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const px = r.width / 2
    const py = r.height / 2
    const v = view.current
    const k = clamp(next, MIN, MAX)
    v.x = px - ((px - v.x) / v.k) * k
    v.y = py - ((py - v.y) / v.k) * k
    v.k = k
    paint()
    setMoved(true)
  }, [paint])

  /* `useImperativeHandle`, not an assignment during render — writing to a ref
     while rendering is exactly what React's rules forbid, and the lint caught
     it. `controls` is a ref the consumer owns. */
  useImperativeHandle(controls, () => ({
    zoomIn: () => zoomTo(view.current.k * 1.25),
    zoomOut: () => zoomTo(view.current.k / 1.25),
    setZoom: (k) => zoomTo(k),
    reset,
  }), [zoomTo, reset])

  return (
    <div ref={stage} className={className} style={{ position: 'relative', overflow: 'hidden', ...style }}>
      <div ref={layer} style={{ transformOrigin: '0 0', width: '100%', height: '100%' }}>
        {children}
      </div>
      {moved && showReset && (
        <span
          onClick={reset}
          className="kol-helper-12 cursor-pointer select-none text-fg-32 hover:text-fg-96"
          style={{ position: 'absolute', left: 12, bottom: 12, zIndex: 6 }}
          title="Back to 1:1"
        >Reset view</span>
        /* `showReset={false}` where the page has its own bar — on /create this
           label sat at `bottom: 12` under a bar at `bottom: 24` and the two
           overlapped the moment the canvas was panned. It only renders once
           `moved` is true, which is why an unpanned screenshot looked fine. */
      )}
    </div>
  )
}
