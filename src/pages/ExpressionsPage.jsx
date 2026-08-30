import { useLocation } from 'react-router-dom'
import { PageHeader, PageShell } from '@kolkrabbi/kol-shell'
import ExpressionReference from '../components/hall-of-mirrors/ExpressionReference'

/**
 * ExpressionsPage — /expressions, a rail destination (user ruling 2026-08-27):
 * the oscilloscope + expression reference that also lives as the mixer's
 * Expressions tab, given its own page. `ExpressionReference` is self-contained
 * (own scope state, `compile` from useExpressionValue), so the page is chrome
 * only. See ARCHITECTURE §1 — this is a reference surface, not instrument
 * navigation.
 */
export default function ExpressionsPage() {
  // A Library card deep-links its expression here, consumed once on mount —
  // the same `location.state` route the studio's cards take (ARCHITECTURE §1).
  const initialExpr = useLocation().state?.expr
  return (
    /* `fixed`: the page is the viewport, so the body below the header has a
       real height for the reference's scroll columns. ExpressionReference's
       root is `position: absolute; inset: 0` (it fills the mixer's desk), so
       it needs a POSITIONED, bounded box here — without one it fills the
       window: under the rail, over the header, no gutter. */
    <PageShell mode="fixed">
      <PageHeader title="Expressions" subtitle="Oscilloscope and expression reference" size="sm" voice="mono" />
      <div style={{ position: 'relative', flex: 1, minHeight: 0 }}>
        <ExpressionReference scopeFill initialExpr={initialExpr} />
      </div>
    </PageShell>
  )
}
