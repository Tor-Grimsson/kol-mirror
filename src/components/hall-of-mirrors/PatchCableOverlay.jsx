import { useEffect, useMemo, useRef, useState } from 'react'
import { WIRE_COLORS } from './wireColors'
import { PatchJacksContext, usePatchJacks, patchDrag } from './patchJacksContext'
import { listCables, isFxKey } from '../../hooks/patchGraph'

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

export default function PatchCableOverlay({ channels, flipped, inputs = [], screen2 = 'off', fxModules = [], containerRef }) {
  const jacks = usePatchJacks()
  const stateRef = useRef({ channels, flipped, inputs, screen2, fxModules })
  useEffect(() => { stateRef.current = { channels, flipped, inputs, screen2, fxModules } })
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
      /* IN THE DESK'S SPACE (plan 16 W7, user: *"patch cables are glitchy when you move around"*): the overlay sits
         inside the canvas's pan-zoom layer, so a point is (screen − container) ÷ zoom. Panning and zooming leave these
         numbers unchanged — the signature below doesn't move, nothing re-renders, the layer's transform carries the
         cables with the jacks in the same frame. Measured in screen space they trailed a frame behind and jumped. */
      const k = container.offsetWidth ? cRect.width / container.offsetWidth : 1
      const { channels, inputs, screen2, fxModules } = stateRef.current

      /* WHERE A JACK IS (plan 11 § 3.2). A jack on a face turned away is a GHOST: it still has a rect, mirrored
         back onto the visible side. A jack on a front strip or a module face (FX, Generator, Expression …) is
         always seen, so its end is never a ghost — read from the DOM, not from which module it is. */
      const at = (id) => {
        const el = jacks.map.get(id)
        if (!el) return null
        const r = el.getBoundingClientRect()
        if (r.width === 0) return null
        const inner = el.closest('.mirror-flip-inner')
        const onBack = !!el.closest('.mirror-flip-back')
        const ghost = !!inner && (onBack !== inner.classList.contains('is-flipped'))
        let x = r.left + r.width / 2
        if (ghost && onBack) {
          const sc = el.closest('.mirror-flip-scene')?.getBoundingClientRect()
          if (sc) x = sc.left + sc.right - x
        }
        return { x: (x - cRect.left) / k, y: (r.top + r.height / 2 - cRect.top) / k, ghost }
      }
      /* the first seen jack among an end's candidates (a port can sit on its module AND on the routing bay) */
      const resolve = (...ids) => {
        const found = ids.map(at).filter(Boolean)
        return found.find((p) => !p.ghost) ?? found[0] ?? null
      }
      /* a cable's two ends, by the port names `listCables` speaks (plan 10 § 4.2) */
      const fromJack = (src, i) => (typeof src === 'number'
        ? resolve(`ch-${src}-out`, `mx-ch-${src}-out`)
        : isFxKey(src) ? resolve(`fxm-${src.slice(4)}-out`)
          : String(src).startsWith('gen:') ? resolve(`gen-${src.slice(4)}-out`)
            : resolve(`mst-rtn-${src}`, `mx-bus-${src}-out`, `rt-${src}-out`, ...(i != null ? [`ch-${i}-src-${src}`] : [])))
      const toJack = (to) => {
        const [kind, arg] = [to.slice(0, to.indexOf(':') < 0 ? to.length : to.indexOf(':')), to.slice(to.indexOf(':') + 1)]
        if (kind === 'mst-in') return resolve(`mst-in-${arg}`, `mx-mst-in-${arg}`)
        if (kind === 'mon') return resolve('mst-mon', 'mx-mon', 'mon-in-2')
        if (kind === 'ch-in') return resolve(`ch-${arg}-in`, `mx-ch-${arg}-in`)
        if (kind === 'bus') return resolve(`mst-bus-${arg}`)
        /* a cross-send is a level on the sender's own back (`ch-<i>-xsend-<j>`), not a cable between modules —
           and nothing mixes it yet (module audit) — so it lists in the patch table and draws nothing */
        if (kind === 'fxm-in') return resolve(`fxm-${arg}-in`)
        return null
      }
      const wire = (src) => (typeof src === 'number' ? WIRE_COLORS[src % WIRE_COLORS.length] : 'var(--kol-accent-primary)')

      const next = []
      for (const c of listCables({ channels, master: { inputs }, screen2, fxModules })) {
        if (c.to.startsWith('fb:')) {
          const p = resolve(`ch-${c.from}-fb`, `mx-fb-${c.from}`)
          if (p) next.push({ key: c.key, d: loopPath(p), color: wire(c.from), ends: [p] })
          continue
        }
        const toIdx = c.to.startsWith('ch-in:') ? +c.to.slice(6) : null
        const from = fromJack(c.from, toIdx)
        const to = toJack(c.to)
        if (from && to) next.push({ key: c.key, d: sagPath(from, to), color: wire(c.from), ends: [from, to] })
      }
      /* the one hardwired cable: the master's OUT into the Monitor's IN (plan 11 § 3.1) */
      const mOut = resolve('mst-out'), mIn = resolve('mon-in')
      if (mOut && mIn) next.push({ key: 'main', d: sagPath(mOut, mIn), color: 'var(--kol-accent-primary)', ends: [mOut, mIn] })
      // The cable in flight — source jack to the pointer.
      const d = patchDrag.current
      if (d?.moved) {
        const from = resolve(d.fromId)
        if (from) next.push({ key: 'drag', d: sagPath(from, { x: (d.x - cRect.left) / k, y: (d.y - cRect.top) / k }), color: sourceColor(d.source), ends: [from] })
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
