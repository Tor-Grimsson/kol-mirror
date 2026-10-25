import { Button, Input, Rail, RailHeader, RailNav, RailSection, Table } from '@kolkrabbi/kol-component'
import ModulePalette from './ModulePalette'
import ExpressionBench from '../hall-of-mirrors/ExpressionBench'

/**
 * Workbench — E, THE BOTTOM ROLE (plan 17 W3, kol-component 0.302.0; plan 13 § 2.2 before it, monitor's Workbench).
 * `Rail role="bottom"`: over the nav rail, resizable on the DS grab, no scrim; its views are glyphs in `RailNav` (the
 * collapsed nav rail's 48 column) and the header is the standard one, titled with the view — `apps/rails`' BottomRail.
 *
 *   EDIT         the case — its controls (verbatim from the desk's old strip), the width, the rows as a KOL `Table`
 *   LIBRARY      the module shelf (`ModulePalette`, embedded)
 *   EXPRESSIONS  the expression bench — the studio's Expressions tab until plan 15 took the tab row away
 *
 * The hand-built push-rail nav it had is in `_tmp/2026-10-25-plan-17/before/Workbench.jsx`.
 *
 * @param {boolean}    open
 * @param {Function}   onClose
 * @param {{rows: string[][], width: number}} consoleState  `useMirrorState.symphonyConsole`
 * @param {Function}   onConsole   the console's setter (value or updater)
 * @param {Object}     api         the palette's add api (MirrorPlayground)
 * @param {string}     view        the open view, controlled (`useMirrorState.workbenchView`) — a deep link picks it
 * @param {Function}   onView
 */
const VIEWS = [
  { id: 'edit', label: 'Edit', icon: 'edit' },
  { id: 'library', label: 'Library', icon: 'nav-library' },
  { id: 'expressions', label: 'Expressions', icon: 'wave' },
]
const COLUMNS = [{ accessor: 'name', header: 'Row' }, { accessor: 'count', header: 'Modules' }]

export default function Workbench({ open, onClose, consoleState, onConsole, api, view = 'edit', onView }) {
  const rows = consoleState?.rows?.length ? consoleState.rows : [[]]
  const width = consoleState?.width || 0
  const setRows = (next) => onConsole?.((c) => ({ ...c, rows: next }))
  const addRow = () => setRows([...rows, []])
  /* a removed row's modules join the row above — the layout never drops a module */
  const removeRow = () => {
    if (rows.length < 2) return
    const next = rows.slice(0, -1)
    next[next.length - 1] = [...next[next.length - 1], ...rows[rows.length - 1]]
    setRows(next)
  }
  const current = VIEWS.find((v) => v.id === view) ?? VIEWS[0]

  return (
    <Rail role="bottom" open={open} onClose={onClose} nav={<RailNav items={VIEWS} value={current.id} onChange={(v) => onView?.(v)} />} header={<RailHeader title={current.label} />}>
      {current.id === 'edit' && (
        <RailSection label="Case">
          {/* the case's own controls — monitor's `[Add row]` idiom (were above the desk in `Console`), verbatim */}
          <div className="flex items-center gap-2">
            <Button size="sm" tone="grey" onClick={addRow} title="Add a row">[+ Row]</Button>
            <Button size="sm" tone="grey" disabled={rows.length < 2} onClick={removeRow} title="Remove the last row — its modules join the row above">[− Row]</Button>
            <span className="kol-mono-12 text-fg-32">{rows.length}U</span>
            {width > 0 && <Button size="sm" tone="grey" onClick={() => onConsole?.((c) => ({ ...c, width: 0 }))} title="Fit the widest row">[Fit]</Button>}
          </div>
          {/* the case width — monitor's Case field, the rail's input preset; 0 fits the widest row */}
          <div className="flex items-center gap-4">
            <span className="kol-helper-10 text-fg-48 uppercase w-12">Case</span>
            <Input size="sm" preset="rail" chars={4} suffix="px" inputMode="numeric" inputClassName="text-right" value={String(width)} onCommit={(v) => onConsole?.((c) => ({ ...c, width: Math.max(0, Math.round(Number(v)) || 0) }))} aria-label="Case width" />
          </div>
          <Table variant="simple" compact width="column" columns={COLUMNS} rows={rows.map((r, i) => ({ id: String(i), name: `Row ${i + 1}`, count: r.length }))} className="w-full" />
        </RailSection>
      )}
      {current.id === 'library' && <ModulePalette mode="embedded" onClose={onClose} api={api} />}
      {current.id === 'expressions' && <div className="relative min-h-0 min-w-0 h-full overflow-hidden" style={{ minHeight: 240 }}><ExpressionBench /></div>}
    </Rail>
  )
}
