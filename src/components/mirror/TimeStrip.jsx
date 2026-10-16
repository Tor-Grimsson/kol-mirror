import { useEffect, useRef, useState } from 'react'
import { transport, useTransport } from '../../hooks/transport'

/**
 * TimeStrip — the one clock drawn as a line you can grab (user 2026-10-15:
 * *"loop section? or timeline preview with scrubber? like |-->----------|"* and
 * *"a timeline section like fxr labs has, it could be hidden by default but
 * shown on shortcut"*).
 *
 * Two faces over ONE scrubber: `Scrubber` sits on the Transport panel; the
 * default export is the studio's bottom strip, fxr labs' shape (`docs/
 * documentation/05-blueprint/_assets/ref-fxr-timeline.png`) — a readout column,
 * a ruler with the head, and the loop row with its start marked "1" in the
 * accent (*"a thin yellow or accent color vertical divider with a label showing
 * where it starts"*).
 *
 * Grabbing never starts or stops the clock; it moves the head (`transport.seek`).
 */

/* The visible span: the loop window's far edge, at least four seconds, and on a
   free-running clock it grows in four-second steps to keep the head on screen. */
function spanOf(t, now) {
  const far = Math.max(t.loopIn, t.loopOut, 4)
  const free = t.mode === 'forward' && !t.looping
  return free && now > far ? Math.ceil(now / 4) * 4 : far
}

/* Timeline seconds → the raw position that `shape()` turns back into them.
   ponytail: a ping-pong seek lands on the OUT leg; the return leg is the same
   picture mirrored, so a scrub cannot tell them apart. */
function seekTo(t, sec) {
  const a = Math.min(t.loopIn, t.loopOut)
  const L = Math.max(0.1, Math.abs(t.loopOut - t.loopIn))
  if (t.mode === 'forward' && !t.looping) return transport.seek(sec)
  const u = Math.max(0, Math.min(L - 0.001, sec - a))
  if (t.mode === 'reverse') return transport.seek(L - u)
  return transport.seek(u)
}

function useNow() {
  const [now, setNow] = useState(() => transport.now())
  useEffect(() => {
    let raf
    let last = 0
    const tick = (ts) => {
      if (ts - last > 33) { last = ts; setNow(transport.now()) }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])
  return now
}

/* The bar itself — the loop window shaded, IN marked in the accent, the head. */
function Bar({ t, now, span, height = 14, marker = false }) {
  const ref = useRef(null)
  const drag = useRef(false)
  const at = (e) => {
    const box = ref.current.getBoundingClientRect()
    seekTo(t, Math.max(0, Math.min(1, (e.clientX - box.left) / box.width)) * span)
  }
  const a = Math.min(t.loopIn, t.loopOut)
  const b = Math.max(t.loopIn, t.loopOut)
  const pct = (x) => `${Math.max(0, Math.min(100, (x / span) * 100))}%`
  return (
    <div
      ref={ref}
      className="relative w-full cursor-ew-resize select-none"
      style={{ height, background: 'var(--kol-fg-08)', borderRadius: 2, touchAction: 'none' }}
      onPointerDown={(e) => { drag.current = true; e.currentTarget.setPointerCapture(e.pointerId); at(e) }}
      onPointerMove={(e) => { if (drag.current) at(e) }}
      onPointerUp={() => { drag.current = false }}
      title="Drag to move the head (↑ start · ↓ end)"
    >
      {/* the loop window — lit when the clock wraps inside it */}
      <div
        className="absolute top-0 bottom-0"
        style={{ left: pct(a), width: pct(b - a), background: t.looping || t.mode !== 'forward' ? 'var(--kol-fg-24)' : 'var(--kol-fg-12)' }}
      />
      {marker && (
        <div className="absolute top-0 bottom-0" style={{ left: pct(a), width: 1, background: 'var(--kol-accent-primary)' }}>
          <span className="absolute kol-helper-10" style={{ left: 3, top: 0, lineHeight: `${height}px`, color: 'var(--kol-accent-primary)' }}>1</span>
        </div>
      )}
      <div className="absolute top-0 bottom-0" style={{ left: pct(b), width: 1, background: 'var(--kol-fg-24)' }} />
      {/* the head */}
      <div className="absolute" style={{ left: pct(now), top: -2, bottom: -2, width: 2, marginLeft: -1, background: 'var(--kol-fg-96)' }} />
    </div>
  )
}

/** The Transport panel's strip: `|-->----------|`, IN to OUT, grab to move. */
export function Scrubber({ width = 232 }) {
  const t = useTransport()
  const now = useNow()
  return (
    <div style={{ width }}>
      <Bar t={t} now={now} span={spanOf(t, now)} height={10} />
    </div>
  )
}

/** The studio's bottom strip — hidden by default, `B` shows it. */
export default function TimelineStrip({ onClose }) {
  const t = useTransport()
  const now = useNow()
  const span = spanOf(t, now)
  const ticks = Array.from({ length: Math.floor(span) + 1 }, (_, i) => i)
  return (
    <div
      className="absolute left-0 right-0 bottom-0 flex items-stretch gap-4 px-4 py-3 border-t border-fg-08 kol-helper-10 group"
      style={{ background: 'var(--kol-surface-primary)', zIndex: 'var(--kol-z-overlay)' }}
    >
      <div className="flex flex-col justify-between shrink-0 text-fg-64" style={{ width: 112, fontVariantNumeric: 'tabular-nums' }}>
        <span>{now.toFixed(2)} / {span.toFixed(2)} s</span>
        <span className="text-fg-96">Loop {t.looping || t.mode !== 'forward' ? 'on' : 'off'}</span>
      </div>
      <div className="flex flex-col flex-1 gap-2" style={{ minWidth: 0 }}>
        {/* the ruler — a tick a second, a number every second until it crowds */}
        <div className="relative w-full" style={{ height: 12 }}>
          {ticks.map((s) => (
            <span key={s} className="absolute text-fg-32" style={{ left: `${(s / span) * 100}%`, transform: s ? 'translateX(-50%)' : undefined }}>
              {span <= 16 || s % 4 === 0 ? s : ''}
            </span>
          ))}
          <div className="absolute" style={{ left: `${Math.min(100, (now / span) * 100)}%`, top: 0, bottom: -4, width: 1, background: 'var(--kol-fg-96)' }} />
        </div>
        <Bar t={t} now={now} span={span} height={16} marker />
      </div>
      <button
        type="button"
        onClick={onClose}
        className="self-start text-fg-32 hover:text-fg-96 opacity-0 group-hover:opacity-100 cursor-pointer"
        aria-label="Hide timeline"
        title="Hide timeline (B)"
      >
        ×
      </button>
    </div>
  )
}
