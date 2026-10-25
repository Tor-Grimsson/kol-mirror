import { useState } from 'react'
import { ActionButton, Button, Divider, Dropdown, Rail, RailActions, RailHeader, RailHint, RailRow, RailSection, SettingsFooter, Table } from '@kolkrabbi/kol-component'
import { BUS_KEYS } from '../../data/mixerModules'
import { listCables, setCable, setSend, removeCable, accepts, fxKey } from '../../hooks/patchGraph'
import { cableLabels, chLabel, BUS_LABEL } from '../../data/cableLabels'

/**
 * PatchTableOverlay — the desk's patch as a table: one row per cable, an add
 * row of dropdowns. Ported from kol-monitor's `src/overlays/PatchTableOverlay.jsx`
 * (user, 2026-09-01: *"check monitor they just made a patch overlay, a mobile
 * and structure friendly patch bay … follow suit for our mixer patching"*).
 *
 * EVERY CABLE (plan 10 § 4.2, user 2026-10-24: *"everything should be cable connected. but it can also be
 * through dropdown like monitor does with P patch siderail"*). It read two kinds — master inputs and sends —
 * and missed channel INs, cross-sends, Screen 2, feedback and the FX modules. Now it reads and writes
 * `patchGraph`'s one cable list, the same list the routing bay and the drawn cables read. The two-kind
 * version is in `_tmp/2026-10-24-one-cable-list/`.
 *
 * THE PATCH ROLE (plan 17 W1, kol-component 0.302.0): `Rail role="patch"` — side, width, scrim and the P key are the
 * role's — drawn as `apps/rails`' Patch table: the standard header, PATCH MATRIX as the KOL `Table`, a divider, ADD A
 * CABLE as two rows and a button, a foot whose reset pulls every cable. The previous hand-laid rail is in
 * `_tmp/2026-10-25-plan-17/before/PatchTableOverlay.jsx`.
 *
 * @param {boolean}  open
 * @param {Function} onClose
 * @param {Object}   patch    `{ channels, master, screen2, fxModules }` — what the cables are read from
 * @param {Function} onApply  (next) => void — the same four, after a cable is made or broken
 */

export default function PatchTableOverlay({ open, onClose, patch, onApply }) {
  const { channels = [], master, fxModules = [] } = patch
  const inputs = master?.inputs || [null, null, null]
  const { fromLabel, toLabel } = cableLabels(patch)

  const cables = listCables(patch)

  const [pick, setPick] = useState({ from: '', to: '' })
  /* sources: every channel OUT, every bus return, every FX module OUT */
  const sources = [
    ...channels.map((c, i) => ({ value: `n:${i}`, src: i, label: chLabel(c, i) })),
    ...BUS_KEYS.map((b) => ({ value: `s:${b}`, src: b, label: BUS_LABEL[b] })),
    ...fxModules.map((m) => ({ value: `s:${fxKey(m.id)}`, src: fxKey(m.id), label: fromLabel(fxKey(m.id)) })),
  ]
  const from = sources.find((s) => s.value === pick.from)?.src
  /* destinations: every IN on the desk; `accepts` greys what this source can't feed */
  const dests = [
    ...inputs.map((v, n) => ({ to: `mst-in:${n}`, taken: v != null })),
    { to: 'mon', taken: patch.screen2 !== 'off' && patch.screen2 != null },
    ...channels.map((c, i) => ({ to: `ch-in:${i}`, taken: c.routeFrom != null })),
    ...BUS_KEYS.map((b) => ({ to: `bus:${b}` })),
    ...channels.map((_, j) => ({ to: `ch-x:${j}` })),
    ...(typeof from === 'number' ? [{ to: `fb:${from}` }] : []),
    ...fxModules.map((m) => ({ to: `fxm-in:${m.id}`, taken: m.input != null })),
  ].filter((d) => from == null || (accepts(d.to, from) && !(d.to === `ch-x:${from}`)))
  const fromOptions = [{ value: '', label: 'From' }, ...sources.map(({ value, label }) => ({ value, label }))]
  const toOptions = [{ value: '', label: 'To' }, ...dests.map((d) => ({ value: d.to, label: `${toLabel(d.to)}${d.taken ? ' · taken' : ''}` }))]
  const canAdd = from != null && pick.to !== ''

  const add = () => {
    const kind = pick.to.split(':')[0]
    let next
    if (kind === 'bus' || kind === 'ch-x') {
      /* a fresh send lands at 50, the desk's own default level for a new patch */
      next = setSend(patch, pick.to, from, 50)
    } else if (kind === 'mst-in') {
      /* one channel per input, one input per channel — the panel's rule */
      const cleared = { ...patch, master: { ...master, inputs: inputs.map((v) => (v === from ? null : v)) } }
      next = setCable(cleared, pick.to, from)
    } else next = setCable(patch, pick.to, from)
    onApply(next)
    setPick({ from: '', to: '' })
  }

  const columns = [
    { accessor: 'from', header: 'From' },
    { accessor: 'to', header: 'To' },
    { accessor: 'level', header: 'Level' },
    { accessor: 'remove', header: '', className: 'w-8' },
  ]
  const rows = cables.map((c) => ({
    id: c.key,
    from: fromLabel(c.from),
    to: toLabel(c.to),
    level: c.level != null ? `${c.level}%` : '—',
    remove: <ActionButton chrome="inline" size="sm" icon="x" confirmIcon="x" label={`Remove ${fromLabel(c.from)} to ${toLabel(c.to)}`} onAction={() => onApply(removeCable(patch, c))} />,
  }))
  /* the foot's reset: every cable out, one at a time through the same remover */
  const clearAll = () => onApply(cables.reduce((p, c) => removeCable(p, c), patch))

  return (
    <Rail role="patch" open={open} onClose={onClose} header={<RailHeader title="Patch table" />} footer={<SettingsFooter onReset={clearAll} />}>
      <div className="flex flex-col gap-6">
        <RailSection label="Patch matrix">
          {cables.length === 0 ? <RailHint>No cables</RailHint> : <Table variant="simple" compact width="column" columns={columns} rows={rows} className="w-full" />}
        </RailSection>
        <Divider />
        <RailSection label="Add a cable">
          <RailRow label="From" align="fill" labelWidth="auto">
            <div className="flex w-full gap-2"><Dropdown size="sm" className="flex-1 min-w-0" options={fromOptions} value={pick.from} onChange={(v) => setPick({ from: v, to: '' })} ariaLabel="From" /></div>
          </RailRow>
          <RailRow label="To" align="fill" labelWidth="auto">
            <div className="flex w-full gap-2"><Dropdown size="sm" className="flex-1 min-w-0" options={toOptions} value={pick.to} onChange={(to) => setPick((p) => ({ ...p, to }))} ariaLabel="To" /></div>
          </RailRow>
          <RailActions className="mt-2">
            <Button size="sm" disabled={!canAdd} onClick={add}>Add cable</Button>
          </RailActions>
        </RailSection>
      </div>
    </Rail>
  )
}
