import { useState } from 'react'
import { PageHeader, PageShell } from '@kolkrabbi/kol-shell'
import Icon from '../components/icons/Icon'

/**
 * IconsPage — /icons, every glyph in mirror's local registry, searchable
 * (user 2026-08-28: "set these icons up in a page where we can search for
 * it"). The same `import.meta.glob` the Icon component uses, so the page can
 * never drift from what actually renders — a name here is a name that works.
 *
 * Click a tile to copy its name.
 */
const svgModules = import.meta.glob('../components/icons/svg/**/*.svg', { eager: true, query: '?raw', import: 'default' })

const ICONS = Object.keys(svgModules)
  .map((path) => {
    const parts = path.split('/')
    return { name: (parts.pop() || '').replace('.svg', ''), group: parts.pop() || '' }
  })
  .sort((a, b) => a.group.localeCompare(b.group) || a.name.localeCompare(b.name))

const GROUPS = [...new Set(ICONS.map((i) => i.group))]

export default function IconsPage() {
  const [q, setQ] = useState('')
  const [group, setGroup] = useState(null)
  const [copied, setCopied] = useState(null)

  const shown = ICONS.filter((i) =>
    (!group || i.group === group) && (!q || i.name.toLowerCase().includes(q.toLowerCase()))
  )

  return (
    <PageShell>
      <PageHeader title="Icons" subtitle={`${ICONS.length} glyphs in the local registry`} size="sm" voice="mono" />

      <div className="flex items-center gap-3 flex-wrap" style={{ marginBottom: 20 }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search…"
          className="kol-mono-14 text-fg-96 bg-transparent outline-none"
          style={{ border: '1px solid var(--kol-fg-16)', borderRadius: 'var(--kol-radius-xs)', padding: '6px 12px', minWidth: 220 }}
        />
        <span className="kol-helper-12 text-fg-32">{shown.length} shown</span>
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
            title={`${i.group}/${i.name}.svg`}
          >
            <Icon name={i.name} size={24} className="text-fg-96" />
            <span className="kol-helper-10 text-fg-48 text-center" style={{ wordBreak: 'break-all' }}>
              {copied === i.name ? 'copied' : i.name}
            </span>
          </div>
        ))}
      </div>
    </PageShell>
  )
}
