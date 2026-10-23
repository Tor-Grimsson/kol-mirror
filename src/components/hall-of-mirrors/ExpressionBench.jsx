import { useLocation } from 'react-router-dom'
import { EnvelopeGenerator, EnvelopeModeToggle, useEnvelopeGenerator } from '@kolkrabbi/kol-hardware'
import { useLibrary, addToLibrary } from '../../hooks/useLibraryStore'
import { transport } from '../../hooks/transport'

/**
 * ExpressionBench — the studio's Expressions tab (2026-10-22; was the Dev tab, and before that the
 * local ExpressionReference). kol-hardware's EnvelopeGenerator, Equation and ADSR: the same math the
 * desk's knobs compile (`useExpressionValue` → kol-hardware `./signal`), one engine. A Library
 * card's expression arrives as router state; Save files an equation in mirror's library.
 * Off the rail by the user's ruling — the expression is a thing a knob takes and the Expression
 * MODULE on the desk, not a destination.
 */
export default function ExpressionBench() {
  const expr = useLocation().state?.expr
  const saved = useLibrary('expression')
  const g = useEnvelopeGenerator({
    defaultExpr: expr,
    saved: saved.map((e) => [e.data.expr, e.name]),
    /* the scope reads the desk's transport (Space plays, stop resets) — SignalScopePlayedTraceAndClock, kol-hardware 0.6.0 */
    now: transport.now,
    onSave: ({ mode, code }) => { if (mode === 'equation') addToLibrary({ kind: 'expression', name: code, data: { expr: code } }) },
  })
  return (
    <div className="absolute inset-0 flex flex-col gap-4 min-h-0">
      <div className="flex justify-end shrink-0"><EnvelopeModeToggle generator={g} /></div>
      <div className="min-h-0 flex-1"><EnvelopeGenerator generator={g} reference="panel" /></div>
    </div>
  )
}
