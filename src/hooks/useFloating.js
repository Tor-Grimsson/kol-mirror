// useFloating — a panel you can drag around the stage and scale from a corner.
//
// KOL-MONITOR'S HOOK, COPIED (apps/rack-hub/src/stage/useFloating.js, 2026-10-03) for the studio's
// float arrangement — its Stage page floats the CRT, the clock and the dock with this. One line
// differs: the cursor test also lets `nwse-resize` through, for a corner grip (monitor wires no
// grip — it scales the whole board instead).
// ponytail: a second copy of one hook. Lift it to a package (kol-hardware's frames) if the float
// arrangement is kept — two consumers is the trigger, and this is the second.
//
// Window listeners rather than pointer capture, the same shape RackViewport's
// pan uses, so a drag survives the pointer leaving the handle.

import { useCallback, useRef, useState } from 'react'

const MIN_SCALE = 0.35
const MAX_SCALE = 2.5

export function useFloating(initial) {
  const [box, setBox] = useState(initial)
  const boxRef = useRef(box)
  boxRef.current = box

  // Both gestures share one shape: capture the start, translate pointer delta,
  // release on pointerup.
  const gesture = useCallback((e, onDelta) => {
    if (e.button !== 0) return
    /* A press on a CONTROL belongs to that control; anything else drags. The
       test is the cursor, not a selector list: every control in this repo
       declares its own (`ns-resize` on knobs and sliders, `pointer` on keys and
       jacks, `text` on inputs), so one computed read covers them all and a new
       control needs no entry here. */
    const cursor = getComputedStyle(e.target).cursor
    if (cursor !== 'auto' && cursor !== 'default' && cursor !== 'grab' && cursor !== 'nwse-resize') return
    e.preventDefault()
    e.stopPropagation()
    const px = e.clientX
    const py = e.clientY
    const start = boxRef.current
    const move = (ev) => setBox(onDelta(start, ev.clientX - px, ev.clientY - py))
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }, [])

  const onDrag = useCallback((e) => {
    gesture(e, (start, dx, dy) => ({ ...start, x: start.x + dx, y: start.y + dy }))
  }, [gesture])

  // Corner handle: right/down grows. One axis drives it so a diagonal drag
  // doesn't fight itself — the larger movement wins.
  const onResize = useCallback((e) => {
    gesture(e, (start, dx, dy) => {
      const d = Math.abs(dx) > Math.abs(dy) ? dx : dy
      return { ...start, scale: Math.min(MAX_SCALE, Math.max(MIN_SCALE, start.scale + d / 400)) }
    })
  }, [gesture])

  return { box, onDrag, onResize, setBox }
}
