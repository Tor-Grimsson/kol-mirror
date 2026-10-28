import { useState } from 'react'
import Slider from '@kolkrabbi/kol-component/molecules/Slider'
import Dropdown from '@kolkrabbi/kol-component/molecules/Dropdown'
import { Icon } from '../../icons/index.js'
import { CANVAS_FX_DEFS } from '../../../hooks/useCanvasFx.js'
import { FX_SLOT_COUNT, slotsOf } from '../../../hooks/fxSlots'
import { Jack } from '../ChannelPatchPanel'
import { DeskModule, ModuleFooter, ModuleAction, ModuleBack } from './ModuleFrame'
import { StripPort } from './JackStrip'

const defOf = (type) => CANVAS_FX_DEFS.find((d) => d.id === type)
/* every unit a slot can hold — the Tape is its own module (W4), not a slot */
const PICKS = CANVAS_FX_DEFS.filter((d) => d.id !== 'tape').map((d) => ({ value: d.id, label: d.label }))

/* one slot's params — the def's own min / max / step, a binary as a state row (as `FxModule` drew them) */
function SlotParams({ slot, onParam }) {
  const def = defOf(slot.type)
  return Object.entries(def?.params || {}).map(([key, spec]) => {
    const value = slot.params?.[key] ?? spec.default
    if (spec.min === 0 && spec.max === 1 && spec.step === 1) {
      return (
        <div key={key} className="flex items-center justify-between" style={{ height: 24 }}>
          <span className="text-fg-64">{key}</span>
          <span className="cursor-pointer select-none accentYellow" onClick={() => onParam(key, value ? 0 : 1)}>[{value ? 'ON' : 'OFF'}]</span>
        </div>
      )
    }
    return (
      <div key={key} className="flex items-center" style={{ height: 24 }}>
        <Slider label={key} min={spec.min} max={spec.max} step={spec.step} value={value} onChange={(v) => onParam(key, v)} variant="minimal" className="w-full" />
      </div>
    )
  })
}

/**
 * FxRackModule — an FX module that holds FOUR effects (plan 16 W3, user 2026-10-25: *"why dont we allow more then
 * one fx per fx module? … fx module colud have 4 slots? … we are not using the ui very well"*). IN → 1 → 2 → 3 → 4
 * → OUT, every section of the standard filled:
 *
 *   header   power (bypasses the whole chain) · the effects it holds · remove
 *   body     what comes out — a live picture of OUT (registered with the viewport's frame copy)
 *   buttons  1 · 2 · 3 · 4 — each slot on / off, lit when on (an empty slot is dim)
 *   footer   tabs 1–4 named for their effect; the tab's effect picker, then its params
 *   jacks    IN · OUT
 *   back     the chain in order, slot by slot
 *
 * @param {Object}   module          `{ id, slots, enabled, input }` (a pre-W3 `{ type, params }` reads as slot 1)
 * @param {Function} onSlot          (i, patch | null) => void
 * @param {Function} onToggle        the module's power
 * @param {Function} onRemove
 * @param {Function} onPreviewCanvas (key, canvas | null) => void — the viewport copies `fxm:<id>` into it each frame
 * @param {Object}   jacks           as `FxModule`'s
 */
export default function FxRackModule({ module: m, onSlot, onToggle, onRemove, onPreviewCanvas, jacks }) {
  const slots = slotsOf(m)
  const [tab, setTab] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const lit = 'var(--kol-accent-primary)'
  const names = slots.filter(Boolean).map((s) => defOf(s.type)?.label ?? s.type)
  const slot = slots[tab]
  return (
    <DeskModule
      width={320}
      power={{ on: !!m.enabled, onToggle, title: m.enabled ? 'Bypass the chain' : 'Run the chain' }}
      head={<span className="text-fg-96 truncate" style={{ maxWidth: 200 }}>{names.length ? names.join(' · ') : 'FX'}</span>}
      headRight={onRemove && (
        <span className="cursor-pointer text-oq-32 hover:text-oq-96 flex" onClick={onRemove} title="Remove">
          <Icon name="x" size={12} />
        </span>
      )}
      flipped={flipped}
      onFlip={() => setFlipped((v) => !v)}
      back={(
        <ModuleBack>
          <span className="text-fg-32">CHAIN</span>
          {slots.map((s, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="text-fg-64">{i + 1}</span>
              <span className={s?.enabled ? 'text-fg-96' : 'text-fg-32'}>{s ? `${defOf(s.type)?.label ?? s.type}${s.enabled ? '' : ' (off)'}` : '—'}</span>
            </div>
          ))}
        </ModuleBack>
      )}
      actions={Array.from({ length: FX_SLOT_COUNT }, (_, i) => {
        const s = slots[i]
        return (
          <ModuleAction key={i} tone={s?.enabled ? lit : undefined} dim={!s?.enabled} onClick={() => s && onSlot?.(i, { enabled: !s.enabled })} title={s ? `${defOf(s.type)?.label} — ${s.enabled ? 'bypass' : 'run'}` : 'Empty slot — pick an effect on its tab'}>{i + 1}</ModuleAction>
        )
      })}
      footer={(
        <ModuleFooter
          width={320}
          tabs={slots.map((s, i) => ({ value: i, label: s ? `${i + 1} ${defOf(s.type)?.label ?? ''}` : `${i + 1}`, dim: !s }))}
          value={tab}
          onChange={setTab}
        >
          <div className="flex items-center justify-between gap-2" style={{ height: 24 }}>
            <Dropdown
              options={[{ value: '', label: 'Empty' }, ...PICKS]}
              value={slot?.type ?? ''}
              onChange={(v) => onSlot?.(tab, v ? { type: v } : null)}
            />
          </div>
          {slot && <SlotParams slot={slot} onParam={(k, v) => onSlot?.(tab, { params: { [k]: v } })} />}
        </ModuleFooter>
      )}
      jacks={jacks && (
        <>
          <StripPort label="IN">
            <Jack
              jackId={`fxm-${jacks.id}-in`}
              connected={jacks.input != null}
              color={jacks.inputColor}
              pending={!!jacks.pendingOut && jacks.input == null}
              onClick={() => {
                if (jacks.input != null) { jacks.onInput(null); return }
                if (!jacks.pendingOut) return
                jacks.onInput(jacks.pendingOut)
                jacks.setPendingOut(null)
              }}
              onDrop={jacks.onInput}
              title={jacks.input != null ? `Patched from ${jacks.inputLabel} — click to unpatch` : jacks.pendingOut ? 'Click to patch pending source here' : 'IN — drop an OUT jack here'}
            />
          </StripPort>
          <span className="text-fg-32">{jacks.input != null ? jacks.inputLabel : '—'}</span>
          <StripPort label="OUT" end>
            <Jack
              jackId={`fxm-${jacks.id}-out`}
              connected={jacks.isSource}
              pending={jacks.pendingOut?.type === 'fxm' && jacks.pendingOut.id === jacks.id}
              source={{ type: 'fxm', id: jacks.id, key: `fxm:${jacks.id}` }}
              onClick={() => jacks.setPendingOut((prev) => (prev?.type === 'fxm' && prev.id === jacks.id) ? null : { type: 'fxm', id: jacks.id, key: `fxm:${jacks.id}` })}
              title="OUT — drag to an IN jack"
            />
          </StripPort>
        </>
      )}
    >
      {/* OUT, live — black until a cable feeds IN */}
      <div className="relative w-full flex-1 border border-fg-08 flex items-center justify-center kol-helper-10 text-fg-24" style={{ minHeight: 0, borderRadius: 3, background: 'var(--kol-surface-absolute-split, #000)', opacity: m.enabled ? 1 : 0.4 }}>
        {m.input == null && <span>Patch a source into IN</span>}
        <canvas ref={(el) => onPreviewCanvas?.(`fxm:${m.id}`, el)} className="absolute inset-0 w-full h-full" style={{ objectFit: 'contain', display: m.input == null ? 'none' : 'block' }} />
      </div>
    </DeskModule>
  )
}
