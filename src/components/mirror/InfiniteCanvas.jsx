import { useCallback, useEffect, useRef, useState } from 'react'

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
const MIN = 0.25
const MAX = 3
const clamp = (v, a, b) => Math.min(Math.max(v, a), b)

export default function InfiniteCanvas({ children, className = '', style }) {
  const stage = useRef(null)
  const layer = useRef(null)
  const view = useRef({ x: 0, y: 0, k: 1 })
  const [moved, setMoved] = useState(false)

  const paint = useCallback(() => {
    const { x, y, k } = view.current
    if (layer.current) layer.current.style.transform = `translate(${x}px, ${y}px) scale(${k})`
  }, [])

  const reset = useCallback(() => {
    view.current = { x: 0, y: 0, k: 1 }
    paint()
    setMoved(false)
  }, [paint])

  useEffect(() => {
    const el = stage.current
    if (!el) return undefined
    let drag = null
    let space = false

    const onKeyDown = (e) => { if (e.code === 'Space') space = true }
    const onKeyUp = (e) => { if (e.code === 'Space') space = false }

    const onDown = (e) => {
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

  return (
    <div ref={stage} className={className} style={{ position: 'relative', overflow: 'hidden', ...style }}>
      <div ref={layer} style={{ transformOrigin: '0 0', width: '100%', height: '100%' }}>
        {children}
      </div>
      {moved && (
        <span
          onClick={reset}
          className="kol-helper-12 cursor-pointer select-none text-fg-32 hover:text-fg-96"
          style={{ position: 'absolute', left: 12, bottom: 12, zIndex: 6 }}
          title="Back to 1:1"
        >Reset view</span>
      )}
    </div>
  )
}
