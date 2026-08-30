import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'

/**
 * Coverflow — cards on the inside of a cylinder, dragged like a jog wheel
 * (user 2026-08-28, from a shader-carousel and a filmstrip slider: "some
 * effect skewer scaling carousel").
 *
 * THE TOPOLOGY IS A RING, not a row of skewed divs. Each card sits at an angle
 * θ = (i − offset) · STEP on a circle of radius R, so its position and its turn
 * come from the SAME number: `rotateY(θ) translateZ(−R)` on a stage whose
 * origin is pushed back by R. That is what makes the far cards fall away
 * correctly instead of merely shrinking — the perspective does the work, and
 * the arc is real rather than faked with a scale ramp.
 *
 * `offset` is a FLOAT and lives in a ref, written straight to the DOM inside
 * one rAF. A drag is a pointermove per frame; putting that through React state
 * would re-render every card every frame for a value only the transform reads.
 * React state carries one thing — which index is settled at the front — and it
 * changes once per landing, not once per frame.
 *
 * The drag has weight: release throws the wheel with the velocity it had, the
 * throw decays, and the wheel lands on whole card and eases in. Depth cueing
 * (dim · blur · fade) is a pure function of |θ|, so a card at the back reads as
 * far away rather than just small, and only the card at the front answers the
 * pointer — everything else is inert so a drag can start anywhere.
 *
 * @param {number}   count     how many cards
 * @param {Function} children  (index, isFront) => ReactNode
 * @param {number}   step      degrees between neighbours
 * @param {number}   radius    the cylinder's radius in px
 * @param {number}   cardWidth used to convert drag px → cards
 */
const clamp = (v, a, b) => Math.min(Math.max(v, a), b)

export default function Coverflow({
  count,
  children,
  step = 26,
  radius = 1500,
  cardWidth = 640,
  height = 1160,
  className = '',
}) {
  const stageRef = useRef(null)
  const cardRefs = useRef([])
  const offset = useRef(0)          // in cards; fractional while dragging
  const velocity = useRef(0)        // cards per second, for the throw
  const [front, setFront] = useState(0)

  /* one writer: every card's transform and depth cue, from `offset` alone */
  const paint = useCallback(() => {
    const o = offset.current
    for (let i = 0; i < count; i++) {
      const el = cardRefs.current[i]
      if (!el) continue
      const d = i - o
      const a = Math.abs(d)
      const deg = d * step
      /* the card's own centre is the origin, and it is pushed OUT to the rim:
         `rotateY(θ) translateZ(R)` puts it on a circle of radius R facing the
         axis. The ring wrapper carries `translateZ(-R)`, which brings the card
         at θ=0 back to z=0 — flat on the perspective plane, full size. Doing
         both on the card (a custom transform-origin AND a negative Z) is what
         collapsed them all onto the axis. */
      el.style.transform = `translate(-50%, 0) rotateY(${deg}deg) translateZ(${radius}px)`
      /* the cues ride |d|, not |deg| — a card two along should read the same
         whatever the step is set to */
      el.style.opacity = String(clamp(1 - a * 0.28, 0, 1))
      el.style.filter = a < 0.02 ? 'none' : `brightness(${clamp(1 - a * 0.22, 0.3, 1)}) blur(${Math.min(a * 1.4, 5)}px)`
      el.style.zIndex = String(1000 - Math.round(a * 10))
      // only the card at the front takes the pointer; the rest let the drag through
      el.style.pointerEvents = a < 0.5 ? 'auto' : 'none'
    }
  }, [count, step, radius])

  useLayoutEffect(paint, [paint])

  /* land on a whole card, easing in, and report where we settled */
  const settle = useCallback((from) => {
    const target = clamp(Math.round(from), 0, count - 1)
    gsap.killTweensOf(offset)
    gsap.to(offset, {
      current: target,
      duration: 0.85,
      ease: 'power3.out',
      onUpdate: paint,
      onComplete: () => setFront(target),
    })
  }, [count, paint])

  /* THE THROW — release carries the wheel on at the velocity it had, decaying,
     and hands over to the settle once it is slow enough to name a card. */
  const throwWheel = useCallback(() => {
    let v = velocity.current
    if (Math.abs(v) < 0.15) { settle(offset.current); return }
    let last = performance.now()
    const tick = (now) => {
      const dt = (now - last) / 1000
      last = now
      offset.current = clamp(offset.current + v * dt, -0.5, count - 0.5)
      v *= Math.pow(0.06, dt) // decay to ~6% per second
      paint()
      if (Math.abs(v) > 0.6) requestAnimationFrame(tick)
      else settle(offset.current)
    }
    requestAnimationFrame(tick)
  }, [count, paint, settle])

  /* drag: px → cards, with the velocity sampled over the last move only */
  const drag = useRef(null)
  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return undefined
    const onDown = (e) => {
      gsap.killTweensOf(offset)
      stage.setPointerCapture?.(e.pointerId)
      drag.current = { x: e.clientX, o: offset.current, t: performance.now(), moved: false }
      velocity.current = 0
    }
    const onMove = (e) => {
      const d = drag.current
      if (!d) return
      const dx = e.clientX - d.x
      if (Math.abs(dx) > 3) d.moved = true
      const next = clamp(d.o - dx / cardWidth, -0.5, count - 0.5)
      const now = performance.now()
      const dt = (now - d.t) / 1000
      if (dt > 0) velocity.current = (next - offset.current) / dt
      d.t = now
      offset.current = next
      paint()
    }
    const onUp = () => {
      if (!drag.current) return
      const moved = drag.current.moved
      drag.current = null
      if (moved) throwWheel()
      else settle(offset.current)
    }
    /* the wheel spins it too — trackpads make this the natural gesture */
    let wheelIdle
    const onWheel = (e) => {
      if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) return
      e.preventDefault()
      gsap.killTweensOf(offset)
      offset.current = clamp(offset.current + e.deltaX / cardWidth, -0.5, count - 0.5)
      paint()
      clearTimeout(wheelIdle)
      wheelIdle = setTimeout(() => settle(offset.current), 120)
    }
    stage.addEventListener('pointerdown', onDown)
    stage.addEventListener('pointermove', onMove)
    stage.addEventListener('pointerup', onUp)
    stage.addEventListener('pointercancel', onUp)
    stage.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      stage.removeEventListener('pointerdown', onDown)
      stage.removeEventListener('pointermove', onMove)
      stage.removeEventListener('pointerup', onUp)
      stage.removeEventListener('pointercancel', onUp)
      stage.removeEventListener('wheel', onWheel)
      clearTimeout(wheelIdle)
    }
  }, [cardWidth, count, paint, settle, throwWheel])

  const go = useCallback((i) => {
    gsap.killTweensOf(offset)
    gsap.to(offset, { current: clamp(i, 0, count - 1), duration: 0.85, ease: 'power3.out', onUpdate: paint, onComplete: () => setFront(clamp(i, 0, count - 1)) })
  }, [count, paint])

  return (
    <div className={className} style={{ position: 'relative' }}>
      <div
        ref={stageRef}
        style={{
          /* the stage is pushed back by the radius, so the card at θ=0 lands
             exactly on the perspective plane and reads as flat and full size */
          perspective: `${radius + 900}px`,
          perspectiveOrigin: '50% 42%',
          height,
          position: 'relative',
          transformStyle: 'preserve-3d',
          touchAction: 'pan-y',
          cursor: 'grab',
          userSelect: 'none',
        }}
      >
        {/* the ring — one wrapper pushed back by the radius, so the front card
            lands on the perspective plane instead of R closer to the camera */}
        <div style={{ position: 'absolute', inset: 0, transformStyle: 'preserve-3d', transform: `translateZ(${-radius}px)` }}>
        {Array.from({ length: count }, (_, i) => (
          <div
            key={i}
            ref={(el) => { cardRefs.current[i] = el }}
            onClick={() => i !== front && go(i)}
            style={{
              position: 'absolute',
              left: '50%',
              top: 0,
              transformStyle: 'preserve-3d',
              backfaceVisibility: 'hidden',
              willChange: 'transform, opacity, filter',
            }}
          >
            {children(i, i === front)}
          </div>
        ))}
        </div>
      </div>

      {/* the dots are the only chrome — where you are, and a way to jump */}
      <div className="flex items-center justify-center gap-2" style={{ marginTop: 8 }}>
        {Array.from({ length: count }, (_, i) => (
          <span
            key={i}
            onClick={() => go(i)}
            className="cursor-pointer"
            style={{
              width: i === front ? 20 : 6,
              height: 6,
              borderRadius: 3,
              background: i === front ? 'var(--kol-fg-64)' : 'var(--kol-fg-16)',
              transition: 'width 400ms cubic-bezier(0.16, 1, 0.3, 1), background 400ms',
            }}
          />
        ))}
      </div>
    </div>
  )
}
