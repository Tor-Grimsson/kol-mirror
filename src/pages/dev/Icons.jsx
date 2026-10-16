import { useState } from 'react'
import Icon from '../../components/icons/Icon'

/**
 * IconsPage — /icons, every glyph in mirror's local registry, searchable
 * (user 2026-08-28: "set these icons up in a page where we can search for
 * it"). The same `import.meta.glob` the Icon component uses, so the page can
 * never drift from what actually renders — a name here is a name that works.
 *
 * Click a tile to copy its name.
 */
const svgModules = import.meta.glob('../../components/icons/svg/**/*.svg', { eager: true, query: '?raw', import: 'default' })

/* AGAINST THE DS (user 2026-10-15: *"can we diff/filter against ds icons signal
   to see what is unique?"*). kol-icons' two sets, read the same way, and each
   local glyph classed by its DRAWING (path data + primitives, whitespace-folded)
   so a renamed copy still counts as the DS's:
     in-ds   the same drawing exists in kol-icons (signal or interface)
     clash   a DS icon has this NAME but draws something else
     unique  neither — mirror's own */
const dsModules = import.meta.glob('/node_modules/@kolkrabbi/kol-icons/src/kol-icon-set-*/**/*.svg', { eager: true, query: '?raw', import: 'default' })
const drawing = (svg) => [...svg.matchAll(/\sd="([^"]+)"/g)].map((m) => m[1]).concat(svg.match(/<(?:rect|circle|ellipse|line|polyline|polygon)[^>]*>/g) || []).join(' ').replace(/\s+/g, ' ').trim()
const DS_DRAW = new Map()
const DS_NAME = new Set()
for (const [path, svg] of Object.entries(dsModules)) {
  const set = path.match(/kol-icon-set-([a-z]+)/)?.[1] || ''
  const d = drawing(svg)
  if (d && !DS_DRAW.has(d)) DS_DRAW.set(d, `${set}/${path.split('/').pop().replace('.svg', '')}`)
  DS_NAME.add(path.split('/').pop().replace('.svg', ''))
}

const ICONS = Object.keys(svgModules)
  .map((path) => {
    const parts = path.split('/')
    const name = (parts.pop() || '').replace('.svg', '')
    const d = drawing(svgModules[path])
    const twin = d ? DS_DRAW.get(d) : null
    return { name, group: parts.pop() || '', ds: twin ? 'in-ds' : DS_NAME.has(name) ? 'clash' : 'unique', twin }
  })
  .sort((a, b) => a.group.localeCompare(b.group) || a.name.localeCompare(b.name))

const GROUPS = [...new Set(ICONS.map((i) => i.group))]
const DS_FILTERS = [['unique', 'Unique'], ['clash', 'Name clash'], ['in-ds', 'In DS']]

export default function Icons() {
  const [q, setQ] = useState('')
  const [group, setGroup] = useState(null)
  const [ds, setDs] = useState(null)
  const [copied, setCopied] = useState(null)

  const shown = ICONS.filter((i) =>
    (!group || i.group === group) && (!ds || i.ds === ds) && (!q || i.name.toLowerCase().includes(q.toLowerCase()))
  )

  return (
    <div>

      <div className="flex items-center gap-3 flex-wrap" style={{ marginBottom: 20 }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search…"
          className="kol-mono-14 text-fg-96 bg-transparent outline-none"
          style={{ border: '1px solid var(--kol-fg-16)', borderRadius: 'var(--kol-radius-xs)', padding: '6px 12px', minWidth: 220 }}
        />
        <span className="kol-helper-12 text-fg-32">{shown.length} shown</span>
        <span className="flex-1" />
        {DS_FILTERS.map(([v, label]) => (
          <span
            key={v}
            className={`kol-helper-12 uppercase cursor-pointer select-none ${ds === v ? 'text-fg-96' : 'text-fg-32 hover:text-fg-64'}`}
            onClick={() => setDs(ds === v ? null : v)}
            title={v === 'in-ds' ? 'The same drawing is in kol-icons' : v === 'clash' ? 'kol-icons has this name, drawn differently' : 'Not in kol-icons by name or drawing'}
          >{label} {ICONS.filter((i) => i.ds === v).length}</span>
        ))}
      </div>

      <div className="flex items-center gap-3 flex-wrap" style={{ marginBottom: 24 }}>
        <span
          className={`kol-helper-12 uppercase cursor-pointer select-none ${group === null ? 'text-fg-96' : 'text-fg-32 hover:text-fg-64'}`}
          onClick={() => setGroup(null)}
        >All</span>
        {GROUPS.map((g) => (
          <span
            key={g}
            className={`kol-helper-12 uppercase cursor-pointer select-none ${group === g ? 'text-fg-96' : 'text-fg-32 hover:text-fg-64'}`}
            onClick={() => setGroup(group === g ? null : g)}
          >{g.replace(/^\d+-/, '')}</span>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 8 }}>
        {shown.map((i) => (
          <div
            key={`${i.group}/${i.name}`}
            onClick={() => { navigator.clipboard?.writeText(i.name); setCopied(i.name) }}
            className="flex flex-col items-center justify-center gap-2 cursor-pointer"
            style={{ border: '1px solid var(--kol-fg-08)', borderRadius: 'var(--kol-radius-xs)', padding: '16px 8px', minHeight: 92 }}
            title={`${i.group}/${i.name}.svg${i.twin ? ` — same as kol-icons ${i.twin}` : i.ds === 'clash' ? ' — kol-icons has this name, drawn differently' : ''}`}
          >
            <Icon name={i.name} size={24} className="text-fg-96" />
            <span className="kol-helper-10 text-fg-48 text-center" style={{ wordBreak: 'break-all' }}>
              {copied === i.name ? 'copied' : i.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
