import { useState } from 'react'
import { Oscilloscope } from '../ExpressionReference'

/**
 * ExpressionModule — the expression engine as a FRONT PANEL: one formula and
 * the oscilloscope that shows it.
 *
 * The scope is `ExpressionReference`'s own `Oscilloscope` (the Expressions tab
 * and Screen 2 already share it); `compile` in `useExpressionValue.js` is the
 * engine. Nothing new runs here — the panel is a face on what the desk has.
 *
 * A catalogue PART, not a registry module: expressions are a desk-wide surface
 * (user ruling 2026-09-02 — any knob can take one), so there is no unit to
 * place on `/create`. The front exists so `/mixer/:id` shows the engine working
 * instead of a dashed box.
 *
 * @param {string} initialExpr  the formula the panel opens on
 */
export default function ExpressionModule({ initialExpr = 'wave(t)' }) {
  const [expr, setExpr] = useState(initialExpr)
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      className="flex flex-col shrink-0 bg-surface-secondary border border-fg-08"
      style={{ width: '320px', borderRadius: '4px', height: '100%' }}
    >
      <div className="flex items-center justify-between kol-helper-12 px-3 border-b border-fg-08 shrink-0" style={{ height: '29px' }}>
        <span className="text-fg-96">Expression</span>
        <span className="kol-helper-10 text-fg-32">t · f · min · max</span>
      </div>

      {/* the scope flexes to the panel's fixed height — `Oscilloscope` gives its
          canvas `flex-1` and a 160px floor */}
      <div className="flex flex-col p-3 kol-helper-12" style={{ flex: 1, minHeight: 0 }}>
        <Oscilloscope expr={expr} setExpr={setExpr} expanded={expanded} setExpanded={setExpanded} />
      </div>

      <div className="flex flex-col gap-1 px-3 py-2 border-t border-fg-08 kol-helper-10 shrink-0">
        <div className="flex items-center justify-between">
          <span className="text-fg-32">IN</span>
          <span className="text-fg-64">t · f · min · max · the live buses</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-fg-32">OUT</span>
          <span className="text-fg-64">the knob’s value, per frame</span>
        </div>
      </div>
    </div>
  )
}
