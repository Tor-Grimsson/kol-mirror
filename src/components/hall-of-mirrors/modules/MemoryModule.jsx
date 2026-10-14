import { useState } from 'react'
import { findVariant, getHallForVariant } from '../../../data/mirrorVariants'

/**
 * MemoryModule — the nine memory slots as a FRONT PANEL.
 *
 * The same slots `ArchiveViewport` draws as a grid of previews and Home lists
 * under SAVED: `mirror-archive` in this browser's localStorage, nine of them,
 * `[M1] Hall: Variant [USR]`. Here they are a strip of nine rows, because a
 * module is 490 tall and a 4:3 preview per slot is a page, not a panel.
 *
 * A catalogue PART with a front, not a registry module: memory is a desk-wide
 * surface (user ruling 2026-09-02), so nothing is placed on `/create`. The
 * front is for `/mixer/:id`.
 *
 * READ-ONLY WITHOUT HANDLERS. A design surface must not touch the user's saved
 * work: with no `onLoad` / `onClear` the rows show what is there and the
 * actions are dim. The studio's `loadSlotToHall` / `clearArchiveSlot` are the
 * verbs when a host has them.
 *
 * @param {Array}    slots    the nine slots; omit and the panel reads localStorage once
 * @param {Function} onLoad   (index) => void
 * @param {Function} onClear  (index) => void
 */
const SLOT_COUNT = 9
const KEY = 'mirror-archive'

const readSlots = () => {
  let slots = []
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) slots = JSON.parse(raw) || []
  } catch { /* no memory */ }
  return Array.from({ length: SLOT_COUNT }, (_, i) => slots[i] ?? null)
}

const labelFor = (slot) => {
  const hall = getHallForVariant(slot.variantId)
  const v = findVariant(slot.variantId)
  return hall ? `${hall.charAt(0).toUpperCase() + hall.slice(1)}: ${v?.title || slot.variantId} [USR]` : (v?.title || slot.variantId)
}

export default function MemoryModule({ slots: given, onLoad, onClear }) {
  const [read] = useState(readSlots)
  const slots = given ?? read
  const used = slots.filter(Boolean).length
  const act = 'kol-helper-10 select-none'
  const live = (fn) => (fn ? `${act} text-fg-48 hover:text-fg-96 cursor-pointer` : `${act} text-fg-24`)

  return (
    <div
      className="flex flex-col shrink-0 bg-surface-secondary border border-fg-08"
      style={{ width: '320px', borderRadius: '4px', height: '100%' }}
    >
      <div className="flex items-center justify-between kol-helper-12 px-3 border-b border-fg-08 shrink-0" style={{ height: '29px' }}>
        <span className="text-fg-96">Memory</span>
        <span className="kol-helper-10 text-fg-32">{used}/{SLOT_COUNT} slots</span>
      </div>

      <div className="flex flex-col gap-1 p-3" style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        {slots.map((slot, i) => (
          <div key={i} className="flex items-center gap-2 kol-helper-10" style={{ height: 24 }}>
            <span className="text-fg-32 shrink-0">[M{i + 1}]</span>
            <span className={`flex-1 min-w-0 truncate ${slot ? 'text-fg-96' : 'text-fg-24'}`}>
              {slot ? labelFor(slot) : 'empty'}
            </span>
            {slot ? (
              <>
                <span className={live(onLoad)} onClick={() => onLoad?.(i)}>[LOAD]</span>
                <span className={live(onClear)} onClick={() => onClear?.(i)}>[CLEAR]</span>
              </>
            ) : (
              <span className={`${act} text-fg-24`}>—</span>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-1 px-3 py-2 border-t border-fg-08 kol-helper-10 shrink-0">
        <div className="flex items-center justify-between">
          <span className="text-fg-32">IN</span>
          <span className="text-fg-64">Save to Slot, from the studio sidebar</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-fg-32">OUT</span>
          <span className="text-fg-64">Home · Library · the studio’s Memory list</span>
        </div>
      </div>
    </div>
  )
}
