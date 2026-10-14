import { useState } from 'react'
// Subpath import — the barrel export pulls every organism into the bundle (see atoms/Button.jsx)
import Stepper from '@kolkrabbi/kol-component/molecules/Stepper'

/**
 * QuantityInput — an adapter over the DS `Stepper` (@kolkrabbi/kol-component), 2026-10-03 (user
 * ruling). The hand-built field is retired to `_tmp/2026-10-03-mixer-own-controls/QuantityInput.jsx`;
 * the four call sites (the two Resolution rows) are unchanged.
 *
 * `Stepper`, NOT the DS `QuantityInput`: that one is a display-only quantity picker ("for an
 * editable number field with bump chevrons use `Stepper`"), and this is a typed pixel size.
 *
 * THE DRAFT IS THE REASON FOR THIS FILE. `Stepper` checks `min` / `max` on every keystroke, so a
 * field whose floor is 100 refuses the first digit of anything typed into it. The bounds are
 * held here instead: the text is a draft while it is typed and is clamped when it is committed
 * (blur or Enter) — what the local field did. A chevron reports a number and commits at once.
 */
const QuantityInput = ({ value = 1, onChange, min = 1, max = 99, className = '' }) => {
  const [draft, setDraft] = useState(null)
  const clamp = (n) => Math.max(min, Math.min(max, n))
  const commit = () => {
    if (draft == null) return
    const n = parseInt(draft, 10)
    if (!isNaN(n)) onChange?.(clamp(n))
    setDraft(null)
  }

  return (
    <Stepper
      size="sm"
      value={draft ?? value}
      onChange={(e) => {
        const next = e.target.value
        if (typeof next === 'number') { setDraft(null); onChange?.(clamp(next)) }
        else setDraft(next)
      }}
      onBlur={commit}
      onKeyDown={(e) => { if (e.key === 'Enter') commit() }}
      className={className}
      style={{ width: 72 }}
    />
  )
}

export default QuantityInput
