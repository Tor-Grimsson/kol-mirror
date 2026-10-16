import { useEffect, useRef, useState } from 'react'
import { Jack } from '../ChannelPatchPanel'
import { SLOT_KEYS, exprBusRef, setSlot, slotValid, useSlots } from '../../../hooks/exprBus'

/**
 * ExpressionModule — the expression OUTPUT (user 2026-10-15: *"I was suggesting
 * a module in the mixer connected to it. you could even have a couple of slots
 * and output them through the expression module, which is directly connected to
 * the expression tab"*). kol-monitor's SCOPE+, four times over.
 *
 * Four slots, A–D. Each holds a formula, draws its trace and carries an OUT. A
 * knob takes a slot by right-click → A … D, which commits the expression `A` on
 * that knob; the value arrives through `exprBus` on the transport's clock. The
 * Expressions tab is still where formulas are written and read up; this is where
 * they leave for the desk. (Until 2026-10-15 this panel was one formula and a
 * scope — `_tmp/2026-10-15-expression-module-single/`.)
 */

const TRACE_W = 96
const TRACE_H = 24

/* The last ~1.5s of a slot's value, scrolled right to left. One canvas each, one
   rAF for the panel. */
function Trace({ k }) {
  const ref = useRef(null)
  const hist = useRef([])
  useEffect(() => {
    let raf
    const tick = () => {
      raf = requestAnimationFrame(tick)
      const c = ref.current
      if (!c) return
      const h = hist.current
      h.push(exprBusRef.current[k] ?? 0)
      if (h.length > TRACE_W) h.shift()
      const ctx = c.getContext('2d')
      ctx.clearRect(0, 0, TRACE_W, TRACE_H)
      ctx.strokeStyle = getComputedStyle(c).color
      ctx.lineWidth = 1
      ctx.beginPath()
      h.forEach((v, x) => {
        const y = TRACE_H - 1 - (v / 100) * (TRACE_H - 2)
        if (x) ctx.lineTo(x + TRACE_W - h.length, y)
        else ctx.moveTo(x + TRACE_W - h.length, y)
      })
      ctx.stroke()
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [k])
  return <canvas ref={ref} width={TRACE_W} height={TRACE_H} className="text-accent-primary shrink-0" style={{ width: TRACE_W, height: TRACE_H, background: 'var(--kol-oq-12)', borderRadius: 2 }} />
}

function Slot({ i, expr }) {
  const k = SLOT_KEYS[i]
  /* the draft resets when the slot's committed formula changes — by remount
     (the key carries it), not an effect */
  const [draft, setDraft] = useState(expr)
  const ok = slotValid(i)
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2" style={{ height: 24 }}>
        <span className="kol-helper-12 text-fg-96 shrink-0" style={{ width: 12 }}>{k}</span>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => setSlot(i, draft)}
          onKeyDown={(e) => { if (e.key === 'Enter') { setSlot(i, draft); e.currentTarget.blur() } }}
          placeholder="formula — e.g. wave(t)"
          spellCheck={false}
          className="flex-1 min-w-0 kol-helper-12 px-2 placeholder:text-fg-24"
          style={{ height: 24, background: 'var(--kol-oq-12)', border: `1px solid ${ok ? 'var(--kol-fg-08)' : 'rgba(231,76,60,0.8)'}`, borderRadius: 2, color: 'var(--kol-fg-96)' }}
          title={ok ? 'Enter to apply' : 'This formula does not compile'}
        />
      </div>
      <div className="flex items-center gap-2" style={{ paddingLeft: 20 }}>
        <Trace k={k} />
        <span className="flex-1" />
        <span className="kol-helper-10 text-fg-32">OUT</span>
        <Jack jackId={`expr-out-${k}`} connected={!!expr.trim() && ok} title={`Slot ${k} — right-click any knob → ${k} to patch it`} />
      </div>
    </div>
  )
}

export default function ExpressionModule() {
  const slots = useSlots()
  return (
    <div className="flex flex-col shrink-0" style={{ height: '100%', maxHeight: '100%', width: 300 }}>
      <div className="flex items-center justify-between kol-helper-12 mx-2 px-3 border border-fg-08 border-b-0 shrink-0 bg-surface-tertiary" style={{ borderRadius: '4px 4px 0 0', height: '29px' }}>
        <span className="text-fg-96">Expression</span>
        <span className="kol-helper-10 text-fg-32">A · B · C · D</span>
      </div>
      <div className="flex flex-col flex-1 gap-3 p-3 bg-surface-secondary border border-fg-08" style={{ borderRadius: '4px', minHeight: 0 }}>
        {slots.map((expr, i) => <Slot key={`${SLOT_KEYS[i]}:${expr}`} i={i} expr={expr} />)}
        <span className="kol-helper-10 text-fg-32" style={{ marginTop: 'auto' }}>
          Right-click a knob → A–D to patch. The Expressions tab has the reference.
        </span>
      </div>
    </div>
  )
}
