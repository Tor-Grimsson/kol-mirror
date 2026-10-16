import { Children, isValidElement, useRef, useState } from 'react'

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
 * Moving a module: drag its grip (the ⋮⋮ above its title, on hover) onto a row.
 * It lands before the module it is dropped on, or at the row's end.
 *
 * @param {string[][]} rows       keys per row, top to bottom
 * @param {Function}   onRows     (rows) => void
 * @param {number}     width      the case's minimum width in px (0 = fit the widest row)
 * @param {Function}   onWidth    (px) => void
 * @param {number}     rowHeight  the U, in px
 */
const keyOf = (el) => el.props?.['data-console']

export default function Console({ rows, onRows, width = 0, onWidth, rowHeight, children }) {
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

  const [dragKey, setDragKey] = useState(null)
  const [overRow, setOverRow] = useState(null)
  const caseRef = useRef(null)

  const move = (key, toRow, beforeKey) => {
    const next = placed.map((r) => r.filter((k) => k !== key))
    const row = next[toRow]
    const at = beforeKey ? row.indexOf(beforeKey) : -1
    if (at < 0) row.push(key)
    else row.splice(at, 0, key)
    onRows?.(next)
  }
  const addRow = () => onRows?.([...placed, []])
  /* a removed row's modules join the row above — the layout never drops a module */
  const removeRow = () => {
    if (placed.length < 2) return
    const next = placed.slice(0, -1)
    next[next.length - 1] = [...next[next.length - 1], ...placed[placed.length - 1]]
    onRows?.(next)
  }
  const onWidthGrip = (e) => {
    if (e.button !== 0 || !onWidth) return
    e.preventDefault()
    e.stopPropagation()
    const x0 = e.clientX
    const w0 = width || caseRef.current?.offsetWidth || 0
    const move2 = (ev) => onWidth(Math.max(480, Math.round(w0 + ev.clientX - x0)))
    const up = () => { window.removeEventListener('pointermove', move2); window.removeEventListener('pointerup', up) }
    window.addEventListener('pointermove', move2)
    window.addEventListener('pointerup', up)
  }

  return (
    <div ref={caseRef} className="relative mirror-console" style={{ minWidth: width || undefined, width: 'max-content' }}>
      {/* the case's own controls — monitor's `[Add row]` idiom */}
      <div className="flex items-center gap-4 kol-helper-12 text-fg-64 pb-3 select-none">
        <span className="cursor-pointer hover:text-fg-96" onClick={addRow} title="Add a row">[+ Row]</span>
        <span className={placed.length < 2 ? 'text-fg-24' : 'cursor-pointer hover:text-fg-96'} onClick={removeRow} title="Remove the last row — its modules join the row above">[− Row]</span>
        <span className="text-fg-32">{placed.length}U</span>
        {width > 0 && <span className="cursor-pointer text-fg-32 hover:text-fg-96" onClick={() => onWidth?.(0)} title="Fit the widest row">[Fit]</span>}
      </div>
      <div className="flex flex-col gap-4">
        {placed.map((row, ri) => (
          <div
            key={ri}
            className="relative flex flex-row items-start mirror-console-row"
            data-row={ri + 1}
            style={{ minHeight: rowHeight, outline: overRow === ri ? '1px dashed var(--kol-accent-primary)' : undefined, outlineOffset: 4 }}
            onDragOver={(e) => { if (dragKey) { e.preventDefault(); setOverRow(ri) } }}
            onDragLeave={() => setOverRow((r) => (r === ri ? null : r))}
            onDrop={(e) => {
              e.preventDefault()
              const target = e.target.closest?.('[data-console-slot]')?.getAttribute('data-console-slot')
              if (dragKey) move(dragKey, ri, target && target !== dragKey ? target : null)
              setDragKey(null)
              setOverRow(null)
            }}
          >
            {row.map((k) => (
              <div key={k} data-console-slot={k} className="relative group/slot" style={{ opacity: dragKey === k ? 0.4 : 1 }}>
                <span
                  draggable
                  onDragStart={(e) => { setDragKey(k); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', k) }}
                  onDragEnd={() => { setDragKey(null); setOverRow(null) }}
                  className="absolute left-1/2 -translate-x-1/2 kol-helper-10 text-fg-32 hover:text-fg-96 opacity-0 group-hover/slot:opacity-100 select-none"
                  style={{ top: -16, cursor: 'grab', letterSpacing: '0.1em', zIndex: 2 }}
                  title="Drag to another row"
                >
                  ⋮⋮
                </span>
                {byKey.get(k)}
              </div>
            ))}
            {!row.length && (
              <div className="flex items-center justify-center kol-helper-10 text-fg-24 border border-dashed border-fg-08" style={{ height: rowHeight || 120, width: 320, borderRadius: 4 }}>
                Empty row — drag a module here
              </div>
            )}
          </div>
        ))}
      </div>
      {/* the case's width grip — its right edge */}
      <span
        onPointerDown={onWidthGrip}
        title="Drag to widen the console"
        className="absolute top-0 bottom-0 opacity-0 hover:opacity-100"
        style={{ right: -12, width: 6, cursor: 'ew-resize', background: 'var(--kol-fg-12)', borderRadius: 3 }}
      />
    </div>
  )
}
