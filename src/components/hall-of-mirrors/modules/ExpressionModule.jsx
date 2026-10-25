import { useMemo, useState } from 'react'
import { SignalScope } from '@kolkrabbi/kol-hardware'
import { Jack } from '../ChannelPatchPanel'
import { SLOT_KEYS, setSlot, slotValid, useSlots, useExprHeld, setExprHeld, useSlotOn, setSlotOn } from '../../../hooks/exprBus'
import { compile } from '../../../hooks/useExpressionValue'
import { transport, useTransportPlaying } from '../../../hooks/transport'
import { DeskModule, ModuleFooter, ModuleBack, ModuleAction } from './ModuleFrame'
import { StripPort } from './JackStrip'

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

/* one slot's formula — the footer's row for its tab */
function Formula({ i, expr }) {
  /* the draft resets when the slot's committed formula changes — by remount (the key carries it), not an effect */
  const [draft, setDraft] = useState(expr)
  const ok = slotValid(i)
  return (
    <div className="flex items-center gap-2" style={{ height: 24 }}>
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
  )
}

/* THE STANDARD (plan 12): the body is the four traces — what the slots are doing; the footer's A · B · C · D tabs
   pick the slot whose formula you write; the jack row carries the four OUTs; the back holds the note. */
/* ONE SLOT'S SCOPE — the KOL's `SignalScope`, the oscilloscope the bench and every expression tool draws (plan 16
   W9, user: *"our functions already have a look, why is it different here?"*). The local canvas `Trace` it replaces
   is in `_tmp/2026-10-25-plan-16/before/ExpressionModule.jsx`. */
function SlotScope({ k, expr }) {
  const fn = useMemo(() => (expr.trim() ? compile(expr, []) : null), [expr])
  const playing = useTransportPlaying()
  const sample = useMemo(() => (fn ? (t) => { try { return fn(t, 0, 0, 100, {}) } catch { return 0 } } : () => 0), [fn])
  return (
    <div className="flex items-stretch gap-2 flex-1" style={{ minHeight: 0 }}>
      <span className="kol-helper-12 text-fg-96 shrink-0 self-center" style={{ width: 12 }}>{k}</span>
      <div className="flex-1 min-w-0 relative" style={{ minHeight: 0 }}>
        <SignalScope sample={sample} height="fill" now={transport.now} playing={playing} />
      </div>
    </div>
  )
}

/* THE STANDARD (plan 12) and plan 16 W9: the plate is split VERTICALLY between the slots that are on (four on: four
   equal scopes; one on: it takes the whole plate); the button row is the four slots' A · B · C · D switches; the
   footer's tabs pick the slot whose formula you write; the jack row carries the four OUTs. The header's power holds
   every slot (W5). */
export default function ExpressionModule() {
  const slots = useSlots()
  const held = useExprHeld()
  const on = useSlotOn()
  const [tab, setTab] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const lit = 'var(--kol-accent-primary)'
  return (
    <DeskModule
      width={320}
      power={{ on: !held, onToggle: () => setExprHeld(!held), title: held ? 'Held — A–D frozen at their last values' : 'Hold A–D' }}
      head={<span className="text-fg-96">Expression</span>}
      headRight={<span className="kol-helper-10 text-fg-32">A · B · C · D</span>}
      flipped={flipped}
      onFlip={() => setFlipped((v) => !v)}
      back={(
        <ModuleBack>
          <span className="kol-mono-12 text-fg-64">Right-click a knob → A–D to patch. The Expressions tab has the reference.</span>
        </ModuleBack>
      )}
      actions={SLOT_KEYS.map((k, i) => (
        <ModuleAction key={k} tone={on[i] ? lit : undefined} dim={!on[i]} onClick={() => setSlotOn(i, !on[i])} title={on[i] ? `Turn ${k} off — it holds its value` : `Turn ${k} on`}>{k}</ModuleAction>
      ))}
      footer={(
        <ModuleFooter
          width={320}
          tabs={SLOT_KEYS.map((k, i) => ({ value: i, label: k }))}
          value={tab}
          onChange={setTab}
        >
          <Formula key={`${SLOT_KEYS[tab]}:${slots[tab]}`} i={tab} expr={slots[tab]} />
        </ModuleFooter>
      )}
      jacks={slots.map((expr, i) => {
        const k = SLOT_KEYS[i]
        return (
          <StripPort key={k} label={k}>
            <Jack jackId={`expr-out-${k}`} connected={!!expr.trim() && slotValid(i)} source={{ type: 'expr', key: k }} title={`Slot ${k} — drag to a MOD in, or right-click any knob → ${k}`} />
          </StripPort>
        )
      })}
    >
      <div className="flex flex-col gap-2 h-full" style={{ minHeight: 0 }}>
        {SLOT_KEYS.map((k, i) => on[i] && <SlotScope key={k} k={k} expr={slots[i]} />)}
      </div>
    </DeskModule>
  )
}
