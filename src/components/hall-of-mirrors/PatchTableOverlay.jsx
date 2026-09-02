import { useState } from 'react'
import { ShellDrawer } from '@kolkrabbi/kol-component'
import Dropdown from '../molecules/Dropdown'
import Button from '../atoms/Button'
import { BUS_KEYS } from '../../data/mixerModules'

/**
 * PatchTableOverlay — the desk's patch as a table: one row per cable, an add
 * row of dropdowns. Ported from kol-monitor's `src/overlays/PatchTableOverlay.jsx`
 * (user, 2026-09-01: *"check monitor they just made a patch overlay, a mobile
 * and structure friendly patch bay … follow suit for our mixer patching"*).
 * Monitor's own reason: *"patching can be tricky on mobile if you need to zoom
 * or move … a table presentation overlay, useful for both desktop and mobile"*.
 *
 * Same shape: `ShellDrawer side="right"`, `min(440px, 100vw)`, `backdrop={false}`
 * so the desk stays live behind it, `p` toggles it. Reads the desk's own
 * routing — no second port model: a cable is either a channel into a master
 * input (`master.inputs[k] = channelIndex`) or a channel send onto a bus
 * (`channel.sends[bus] > 0`). The jacks in `ChannelPatchPanel` write the same
 * two fields, so a cable added here appears there and vice versa.
 *
 * @param {boolean}  open
 * @param {Function} onClose
 * @param {Object[]} channels
 * @param {Object}   master          `{ inputs: [idx|null ×3], … }`
 * @param {Function} onChannelUpdate (index, patch) => void
 * @param {Function} onMasterChange  (patch) => void
 */
const MASTER_INS = [0, 1, 2]
const chLabel = (c, i) => (c?.name ? c.name.split(':').slice(1).join(':').trim() || `Channel ${i + 1}` : `Channel ${i + 1}`)

export default function PatchTableOverlay({ open, onClose, channels = [], master, onChannelUpdate, onMasterChange }) {
  const inputs = master?.inputs || [null, null, null]

  /* the cables, read from the two fields that hold them */
  const cables = [
    ...MASTER_INS.flatMap((k) => (inputs[k] != null && channels[inputs[k]]
      ? [{ key: `in-${k}`, from: chLabel(channels[inputs[k]], inputs[k]), to: `Master IN ${k + 1}`, remove: () => {
          const next = [...inputs]; next[k] = null; onMasterChange({ inputs: next })
        } }]
      : [])),
    ...channels.flatMap((c, i) => BUS_KEYS.filter((b) => (c.sends?.[b] || 0) > 0).map((b) => ({
      key: `send-${i}-${b}`,
      from: chLabel(c, i),
      to: `${b.toUpperCase()} · ${c.sends[b]}%`,
      remove: () => onChannelUpdate(i, { sends: { ...c.sends, [b]: 0 } }),
    }))),
  ]

  const [pick, setPick] = useState({ from: '', to: '' })
  const fromOptions = [{ value: '', label: 'From channel' }, ...channels.map((c, i) => ({ value: String(i), label: chLabel(c, i) }))]
  const toOptions = [
    { value: '', label: 'To' },
    ...MASTER_INS.map((k) => ({ value: `in-${k}`, label: `Master IN ${k + 1}${inputs[k] != null ? ' · taken' : ''}` })),
    ...BUS_KEYS.map((b) => ({ value: `bus-${b}`, label: b.toUpperCase() })),
  ]
  const canAdd = pick.from !== '' && pick.to !== ''

  const add = () => {
    const i = Number(pick.from)
    if (pick.to.startsWith('in-')) {
      const k = Number(pick.to.slice(3))
      const next = [...inputs]
      /* one channel per input, one input per channel — the panel's rule */
      next.forEach((v, j) => { if (v === i) next[j] = null })
      next[k] = i
      onMasterChange({ inputs: next })
    } else {
      const b = pick.to.slice(4)
      const c = channels[i]
      /* a fresh send lands at 50, the desk's own default level for a new patch */
      onChannelUpdate(i, { sends: { ...(c.sends || {}), [b]: c.sends?.[b] || 50 } })
    }
    setPick({ from: '', to: '' })
  }

  return (
    <ShellDrawer open={open} onClose={onClose} side="right" width="min(440px, 100vw)" backdrop={false} header={<span className="kol-helper-12 text-fg-64">Patch table</span>}>
      <div className="flex flex-col gap-4 p-4 kol-helper-12">
        <div className="flex flex-col gap-1">
          {cables.length === 0 && <div className="text-fg-32">No cables</div>}
          {cables.map((c) => (
            <div key={c.key} className="flex items-center gap-2 h-8">
              <span className="text-fg-80 truncate">{c.from}</span>
              <span className="text-fg-32">→</span>
              <span className="text-fg-80 truncate flex-1">{c.to}</span>
              <Button variant="grey" size="sm" aria-label="Remove cable" onClick={c.remove}>×</Button>
            </div>
          ))}
        </div>

        <div className="border-t border-fg-08" />

        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Dropdown className="flex-1" options={fromOptions} value={pick.from} onChange={(from) => setPick((p) => ({ ...p, from }))} />
            <Dropdown className="flex-1" options={toOptions} value={pick.to} onChange={(to) => setPick((p) => ({ ...p, to }))} />
          </div>
          <Button variant="grey" size="md" disabled={!canAdd} onClick={add}>Add cable</Button>
        </div>
      </div>
    </ShellDrawer>
  )
}
