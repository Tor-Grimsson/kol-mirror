import { useEffect, useMemo, useRef, useState } from 'react'
import { WIRE_COLORS } from './wireColors'
import { PatchJacksContext, usePatchJacks, patchDrag } from './patchJacksContext'

/**
 * PatchCableOverlay — drawn cables between jacks (flip-to-patch v2,
 * 2026-08-15). Pure projection of channel state: routes (OUT → IN),
 * sends (OUT → BUS IN), feedback (self-loop). No new state — the jacks
 * stay the interaction surface; this layer only renders what is patched.
 *
 * Jacks register their DOM nodes in PatchJacksContext by id
 * (`ch-<i>-in|out|fb`, `ch-<i>-src-<rtn>`, `mst-bus-<key>`, `mst-rtn-<key>`).
 * A cable draws full when BOTH endpoint cards are flipped to their patch
 * bays; with a card face-up it draws as a GHOST (user, 2026-08-27: "show the
 * jack connection faint even if not flipped") — the back faces are always in
 * the DOM, so the jack still has a rect; it is mirrored back onto the front
 * (the back is rotateY(180) inside an unrotated card). Never interactive.
 */

export function PatchJacksProvider({ children }) {
  /* `over` / `dragging` are state (jacks restyle on them); the drag itself is
     a ref the overlay reads every frame — no React work per pointer move. */
  const [over, setOverState] = useState(null)
  const [dragging, setDragging] = useState(null)
  const overRef = useRef(null)
  const store = useMemo(() => ({ map: new Map(), drops: new Map() }), [])
  const api = useMemo(() => ({
    map: store.map,
    drops: store.drops,
    register: (id, el, onDrop) => { store.map.set(id, el); if (onDrop) store.drops.set(id, onDrop); else store.drops.delete(id) },
    unregister: (id) => { store.map.delete(id); store.drops.delete(id) },
    setOver: (id) => { if (overRef.current !== id) { overRef.current = id; setOverState(id) } },
    setDragging,
    over,
    dragging,
  }), [store, over, dragging])
  return <PatchJacksContext.Provider value={api}>{children}</PatchJacksContext.Provider>
}

const sourceColor = (src) => src.type === 'ch' ? WIRE_COLORS[src.idx % WIRE_COLORS.length] : 'var(--kol-accent-primary)'

function sagPath(a, b) {
  const dx = b.x - a.x
  const dist = Math.hypot(dx, b.y - a.y)
  const sag = Math.min(60, 16 + dist * 0.12)
  return `M ${a.x} ${a.y} C ${a.x + dx * 0.25} ${a.y + sag}, ${a.x + dx * 0.75} ${b.y + sag}, ${b.x} ${b.y}`
}

function loopPath(p) {
  return `M ${p.x - 4} ${p.y + 4} C ${p.x - 18} ${p.y + 32}, ${p.x + 18} ${p.y + 32}, ${p.x + 4} ${p.y + 4}`
}

export default function PatchCableOverlay({ channels, flipped, inputs = [], screen2 = 'off', containerRef }) {
  const jacks = usePatchJacks()
  const stateRef = useRef({ channels, flipped, inputs, screen2 })
  useEffect(() => { stateRef.current = { channels, flipped, inputs, screen2 } })
  const [cables, setCables] = useState([])
  const sigRef = useRef('')

  // ponytail: rAF measure loop while patch mode is on — the embla loop
  // translates slides every frame during momentum, so event-driven
  // re-measurement would need embla scroll + resize + flip transitions.
  // ~20 rects/frame is noise next to the app's render loop.
  useEffect(() => {
    if (!jacks) return
    let raf
    const tick = () => {
      raf = requestAnimationFrame(tick)
      const container = containerRef.current
      if (!container) return
      const cRect = container.getBoundingClientRect()
      const { channels, flipped, inputs, screen2 } = stateRef.current

      const resolve = (id) => {
        const m = id.match(/^ch-(\d+)-/)
        const ghost = !(m ? flipped[+m[1]] : flipped.master)
        const el = jacks.map.get(id)
        if (!el) return null
        const r = el.getBoundingClientRect()
        if (r.width === 0) return null
        let x = r.left + r.width / 2
        if (ghost) {
          const s = el.closest('.mirror-flip-scene')?.getBoundingClientRect()
          if (s) x = s.left + s.right - x
        }
        return { x: x - cRect.left, y: r.top + r.height / 2 - cRect.top, ghost }
      }

      const next = []
      channels.forEach((ch, i) => {
        if (ch.routeFrom != null) {
          const to = resolve(`ch-${i}-in`)
          const isCh = typeof ch.routeFrom === 'number'
          const from = isCh
            ? resolve(`ch-${ch.routeFrom}-out`)
            : (resolve(`mst-rtn-${ch.routeFrom}`) || resolve(`ch-${i}-src-${ch.routeFrom}`))
          if (from && to) {
            next.push({
              key: `route-${i}`,
              d: sagPath(from, to),
              color: isCh ? WIRE_COLORS[ch.routeFrom % WIRE_COLORS.length] : 'var(--kol-accent-primary)',
              ends: [from, to],
            })
          }
        }
        Object.entries(ch.sends || {}).forEach(([bus, lvl]) => {
          if (!(lvl > 0)) return
          const from = resolve(`ch-${i}-out`)
          const to = resolve(`mst-bus-${bus}`)
          if (from && to) {
            next.push({ key: `send-${i}-${bus}`, d: sagPath(from, to), color: WIRE_COLORS[i % WIRE_COLORS.length], ends: [from, to] })
          }
        })
        if (ch.feedback?.enabled) {
          const at = resolve(`ch-${i}-fb`)
          if (at) next.push({ key: `fb-${i}`, d: loopPath(at), color: WIRE_COLORS[i % WIRE_COLORS.length], ends: [at] })
        }
      })

      // The master's input slots — CH src OUT → master IN n.
      inputs.forEach((src, n) => {
        if (src == null) return
        const from = resolve(`ch-${src}-out`)
        const to = resolve(`mst-in-${n}`)
        if (from && to) next.push({ key: `in-${n}`, d: sagPath(from, to), color: WIRE_COLORS[src % WIRE_COLORS.length], ends: [from, to] })
      })
      // Screen 2 fed from a channel — CH n OUT → the master's MON IN.
      if (/^\d+$/.test(screen2)) {
        const from = resolve(`ch-${screen2}-out`)
        const to = resolve('mst-mon')
        if (from && to) next.push({ key: 'mon', d: sagPath(from, to), color: WIRE_COLORS[+screen2 % WIRE_COLORS.length], ends: [from, to] })
      }
      // The cable in flight — source jack to the pointer.
      const d = patchDrag.current
      if (d?.moved) {
        const from = resolve(d.fromId)
        if (from) next.push({ key: 'drag', d: sagPath(from, { x: d.x - cRect.left, y: d.y - cRect.top }), color: sourceColor(d.source), ends: [from] })
      }

      const sig = next.map(c => c.key + c.d + (c.ends.some(p => p.ghost) ? 'g' : '')).join('|')
      if (sig !== sigRef.current) {
        sigRef.current = sig
        setCables(next)
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [jacks, containerRef])

  return (
    <svg className="absolute inset-0 z-20 pointer-events-none overflow-visible">
      {cables.map(c => {
        const ghost = c.ends.some(p => p.ghost)
        return (
          <g key={c.key} opacity={ghost ? 0.22 : 1}>
            <path d={c.d} fill="none" stroke={c.color} strokeWidth={ghost ? 3 : 2} strokeLinecap="round" opacity={0.85} strokeDasharray={ghost ? '3 4' : undefined} />
            {c.ends.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={ghost ? 2.5 : 3.5} fill={c.color} />)}
          </g>
        )
      })}
    </svg>
  )
}
