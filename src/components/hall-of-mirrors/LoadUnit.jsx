import { useState } from 'react'
import Divider from '../atoms/Divider'
import Dropdown from '../molecules/Dropdown'
import { Icon } from '../icons'
import { CSS_BLEND_MODES } from './blendOptions'

/**
 * LoadUnit — pick a source, or roll one.
 *
 * Replaces a LOAD tab that had grown into eleven near-identical rows doing two
 * unrelated jobs in the same clothes (user, 2026-08-27: "it's a lot of random
 * value buttons… I'm not fully sure what I was thinking"):
 *
 *   - FIVE dropdowns — Memory · Displacement · Movement · Copies · Generators —
 *     which are one list with categories, not five lists. The Library already
 *     pools exactly these; this tab predated that.
 *   - SIX randomiser rows styled as parameter rows, each with a chevron that
 *     promised you could choose and then showed `RDM-59`. A roll ID says
 *     something happened and nothing about what.
 *
 * So: ONE picker, and ONE roll with a scope. A dice is not a parameter row, and
 * the readout names the value it actually produced — the blend mode, the colour
 * — rather than a number identifying the throw.
 */

const SCOPES = [
  { value: 'all', label: 'Everything' },
  { value: 'look', label: 'Look only' },
  { value: 'source', label: 'Source only' },
]

const rgb = () => {
  const r = () => Math.floor(Math.random() * 256)
  return `rgba(${r()},${r()},${r()},1)`
}
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]

export default function LoadUnit({
  items = [],
  loadedName,
  onSelectItem,
  onMediaChange,
  onVectorColorChange,
  onBackgroundColorChange,
  onBlendModeChange,
  fx = [],
  onFxChange,
  vectors = [],
  loadVectorSvg,
}) {
  const [scope, setScope] = useState('all')
  const [rolled, setRolled] = useState(null)

  /* ONE list, categorised. `items` already carries the memory slots, every
     hall's variants and the generators — the five dropdowns were slicing this
     same array five ways. */
  /* `_none` is a REAL option, not a placeholder — which is why losing the DS
     dropdown's `placeholder` prop (2026-08-28) cost this picker nothing: the
     empty state is a row with a value, so the trigger has something to render
     and clearing is a selection like any other. */
  const options = [
    { value: '_none', label: '—' },
    ...items
      .filter((i) => !i.empty && i.type !== 'separator')
      .map((i) => ({ value: i.id, label: i.name })),
  ]
  const selected = loadedName ? items.find((i) => i.name === loadedName) : null

  const roll = () => {
    const said = []
    if (scope !== 'look') {
      const all = items.filter((i) => !i.empty && i.type !== 'separator')
      if (all.length) {
        const it = pick(all)
        onSelectItem(it.id)
        said.push(it.name.replace(/^\[.*?\]\s*/, ''))
      }
      if (vectors.length && loadVectorSvg) {
        const v = pick(vectors)
        loadVectorSvg(v.value, onMediaChange)
        said.push(v.label || v.value)
      }
    }
    if (scope !== 'source') {
      const blend = pick(CSS_BLEND_MODES)
      onBlendModeChange(blend)
      const vec = rgb()
      onVectorColorChange(vec)
      onBackgroundColorChange(rgb())
      const blur = +(Math.random() * 5).toFixed(1)
      const bright = +(0.5 + Math.random() * 2).toFixed(2)
      onFxChange([
        ...fx.filter((f) => f.type !== 'blur' && f.type !== 'brightness'),
        { type: 'blur', enabled: true, params: { amount: blur } },
        { type: 'brightness', enabled: true, params: { amount: bright } },
      ])
      said.push(blend, `blur ${blur}`, `bright ${bright}`)
      setRolled({ text: said.join(' · '), swatch: vec })
      return
    }
    setRolled({ text: said.join(' · '), swatch: null })
  }

  return (
    <div className="flex flex-col gap-2 kol-helper-12">
      <div className="flex items-center justify-between gap-4" style={{ height: '24px' }}>
        <span className="text-fg-96">Source</span>
        <Dropdown
          options={options}
          value={selected ? selected.id : '_none'}
          onChange={(v) => v === '_none'
            ? onMediaChange({ variantId: null, params: {}, slotIndex: null, name: null, customImageSrc: null, customRasterSrc: null, customImageName: null })
            : onSelectItem(v)}
          defaultValue="_none"
          variant="minimal"
          size="md"
          rowHeight={24}
          placeholder="—"
        />
      </div>

      <Divider className="my-1" />

      <div className="flex items-center justify-between gap-4" style={{ height: '24px' }}>
        <span
          className="text-fg-96 cursor-pointer select-none flex items-center gap-2 hover:accentYellow"
          onClick={roll}
          title="Randomise — a dice, not a setting"
        >
          <Icon name="refresh" size={14} /> Roll
        </span>
        <Dropdown options={SCOPES} value={scope} onChange={setScope} variant="minimal" size="md" rowHeight={24} />
      </div>

      {/* What the throw actually produced — not an ID for the throw itself. */}
      {rolled && (
        <div className="flex items-center gap-2 text-fg-48" style={{ minHeight: '20px' }}>
          {rolled.swatch && (
            <span className="shrink-0" style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: rolled.swatch }} />
          )}
          <span className="truncate">{rolled.text}</span>
        </div>
      )}
    </div>
  )
}
