import { useLocation } from 'react-router-dom'
import { EnvelopeGenerator, EnvelopeModeToggle, useEnvelopeGenerator } from '@kolkrabbi/kol-hardware'
import { useLibrary, addToLibrary } from '../../hooks/useLibraryStore'

/**
 * Expression — the Dev tab (2026-10-14). kol-hardware's EnvelopeGenerator: the same math the
 * desk's knobs compile (`useExpressionValue` → kol-hardware `./signal`), one engine. A Library
 * card's expression arrives as router state; Save files an equation in mirror's library.
 * Off the rail by the user's ruling — the expression is a thing a knob takes and the Expression
 * MODULE on the desk, not a destination.
 */
export default function Expression() {
  const expr = useLocation().state?.expr
  const saved = useLibrary('expression')
  const g = useEnvelopeGenerator({
    defaultExpr: expr,
    saved: saved.map((e) => [e.data.expr, e.name]),
    onSave: ({ mode, code }) => { if (mode === 'equation') addToLibrary({ kind: 'expression', name: code, data: { expr: code } }) },
  })
  return (
    <div className="flex flex-col gap-4 h-full min-h-0">
      <div className="flex justify-end shrink-0"><EnvelopeModeToggle generator={g} /></div>
      <div className="min-h-0 flex-1"><EnvelopeGenerator generator={g} reference="panel" /></div>
    </div>
  )
}
