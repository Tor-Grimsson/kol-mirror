import { Children, isValidElement, useEffect, useRef, useState } from 'react'
import Button from '@kolkrabbi/kol-component/atoms/Button'
import { Tooltip } from '@kolkrabbi/kol-component'

/**
 * Console — the desk's container: ROWS of one U (user 2026-10-15: *"analog
 * tabletop-ish mixer container … rows, so you could add and remove rows (height)
 * and width — because everything is zoomable/movable"*). Kol-monitor's rack is
 * the model (`useRackState`: rows packed left to right, a case width); mirror's
 * modules have natural widths, not HP, and every row is the one U.
 *
 * ONE SEAM. The desk's modules are rendered exactly as before; each top-level
 * child carries `data-console="<key>"` and this component only decides which
 * row it sits in. A module with no row yet (a channel just added, an FX module
 * just placed) lands at the end of the LAST row — nothing is ever hidden by the
 * layout.
 *
 * Moving a module: E (edit mode), hover it, click a chevron — monitor's RackView (plan 15).
 *
 * @param {string[][]} rows       keys per row, top to bottom
 * @param {Function}   onRows     (rows) => void
 * @param {number}     width      the case's minimum width in px (0 = fit the widest row)
 * @param {Function}   onWidth    (px) => void
 * @param {number}     rowHeight  the U, in px
 */
const keyOf = (el) => el.props?.['data-console']

/* the arrows stay on a module until another one is dwelt on this long (monitor's RackView) */
const SWITCH_DWELL_MS = 400

/* one chevron — a KOL icon button at the panel rung, its name a tooltip (monitor's `ChevronButton`) */
function Chevron({ icon, title, onClick }) {
  return (
    <Tooltip label={title} triggerClassName="inline-flex shrink-0">
      <Button tone="outline" size="xs" iconOnly={icon} iconSize={10} aria-label={title} onClick={onClick} />
    </Tooltip>
  )
}

/* monitor's ArrowOverlay: each chevron on the module's edge, a quarter of it outside */
function MoveArrows({ onLeft, onRight, onUp, onDown }) {
  const at = { position: 'absolute', zIndex: 3, pointerEvents: 'auto' }
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none' }}>
      {onLeft && <div style={{ ...at, left: 0, top: '50%', transform: 'translate(-25%, -50%)' }}><Chevron icon="chevron-left" title="Move left" onClick={onLeft} /></div>}
      {onRight && <div style={{ ...at, right: 16, top: '50%', transform: 'translate(25%, -50%)' }}><Chevron icon="chevron-right" title="Move right" onClick={onRight} /></div>}
      {onUp && <div style={{ ...at, top: 0, left: 'calc(50% - 8px)', transform: 'translate(-50%, -25%)' }}><Chevron icon="chevron-up" title="Move up" onClick={onUp} /></div>}
      {onDown && <div style={{ ...at, bottom: 0, left: 'calc(50% - 8px)', transform: 'translate(-50%, 25%)' }}><Chevron icon="chevron-down" title="Move down" onClick={onDown} /></div>}
    </div>
  )
}

export default function Console({ rows, onRows, width = 0, rowHeight, editMode = false, children }) {
  const items = Children.toArray(children).filter(isValidElement)
  const byKey = new Map(items.filter(keyOf).map((el) => [keyOf(el), el]))
  /* the layout, resolved: known keys in their rows, stale keys dropped. A NEW key
     lands right after the last placed key of its kind (`ch-3` after `ch-2`,
     `fxm-4` after `fxm-3`) — otherwise at the end of the last row. */
  const placed = rows.map((r) => r.filter((k) => byKey.has(k)))
  if (!placed.length) placed.push([])
  const seen = new Set(placed.flat())
  const kind = (k) => k.replace(/-[^-]*$/, '')
  for (const k of byKey.keys()) {
    if (seen.has(k)) continue
    let ri = -1
    let at = -1
    placed.forEach((r, i) => r.forEach((o, j) => { if (o !== k && kind(o) === kind(k) && o.includes('-')) { ri = i; at = j } }))
    if (ri < 0) placed[placed.length - 1].push(k)
    else placed[ri].splice(at + 1, 0, k)
    seen.add(k)
  }

  const caseRef = useRef(null)

  const move = (key, toRow, beforeKey) => {
    const next = placed.map((r) => r.filter((k) => k !== key))
    const row = next[toRow]
    const at = beforeKey ? row.indexOf(beforeKey) : -1
    if (at < 0) row.push(key)
    else row.splice(at, 0, key)
    onRows?.(next)
  }
  /* a neighbour swap inside a row — monitor's `onSwapInRow` */
  const swap = (ri, k, dir) => {
    const next = placed.map((r) => [...r])
    const i = next[ri].indexOf(k)
    const j = i + dir
    if (i < 0 || j < 0 || j >= next[ri].length) return
    ;[next[ri][i], next[ri][j]] = [next[ri][j], next[ri][i]]
    onRows?.(next)
  }

  /* MOVING IS EDIT MODE'S (plan 15, user 2026-10-25: *"the grab thingy on the rack is stupid, monitor already solved
     for this … E is for Edit"*). Monitor's RackView exactly: with E on, the hovered module shows four chevrons at
     its edges — left / right swap it with its neighbour, up / down move it to the end of the row above / below. One
     module at a time; the first hover shows at once, a jump to another module waits SWITCH_DWELL_MS so a glancing
     pass does not steal the arrows. The ⋮⋮ drag grip and the width grip are gone; the case width is the rail's. */
  const [active, setActive] = useState(null)
  const pending = useRef(null)
  useEffect(() => () => clearTimeout(pending.current), [])
  const hover = (k) => {
    if (!editMode) return
    clearTimeout(pending.current)
    if (active == null || active === k) { setActive(k); return }
    pending.current = setTimeout(() => setActive(k), SWITCH_DWELL_MS)
  }
  const leave = () => clearTimeout(pending.current)

  return (
    <div ref={caseRef} className="relative mirror-console py-4 bg-[var(--kol-surface-contrast)]" style={{ minWidth: width || undefined, width: 'max-content' }}>
      {/* the case's own controls ([+ Row] [− Row] nU [Fit]) live in the E Workbench rail since plan 13 § 2.2 —
          monitor's place for them. THE CASE IS ONE OBJECT (plan 14 W1, user: *"I fear yo dont understand the concept
          of A CONTAINER"*): wood · ground · wood, the ground on the case box itself so the cheeks sit flush on it, an
          equal edge above the first row and below the last, rows parted by the ground alone. */}
      <div className="flex flex-col gap-4">
        {placed.map((row, ri) => (
          <div
            key={ri}
            className="relative flex flex-row items-start mirror-console-row"
            data-row={ri + 1}
            style={{ height: rowHeight }}
          >
            {row.map((k, ci) => (
              <div key={k} data-console-slot={k} className="relative" onMouseEnter={() => hover(k)} onMouseLeave={leave}>
                {byKey.get(k)}
                {editMode && active === k && (
                  <MoveArrows
                    onLeft={ci > 0 ? () => swap(ri, k, -1) : null}
                    onRight={ci < row.length - 1 ? () => swap(ri, k, 1) : null}
                    onUp={ri > 0 ? () => move(k, ri - 1) : null}
                    onDown={ri < placed.length - 1 ? () => move(k, ri + 1) : null}
                  />
                )}
              </div>
            ))}
            {!row.length && (
              <div className="flex items-center justify-center kol-helper-10 text-fg-24 border border-dashed border-fg-08" style={{ height: rowHeight || 120, width: 320, borderRadius: 4 }}>
                Empty row — move a module here (E)
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
