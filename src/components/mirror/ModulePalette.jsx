import { useEffect, useMemo, useRef, useState } from 'react'
import { searchModules, KINDS } from '../../data/moduleRegistry'

/**
 * ModulePalette — the SHELF: E opens the registry along the bottom (user
 * 2026-08-28, from kol-monitor).
 *
 * IT WAS TWO CHROMES — ⌘K a search, E this shelf. ⌘K is kol-component's
 * `ShellSearchOverlay` since 2026-10-03 (MirrorPlayground), so the search half
 * was no longer reached and is retired to `_tmp/2026-10-03-module-palette-search/`.
 *
 * `mode` is 'shelf' | null. The keys live in MirrorPlayground, so this
 * component owns no shortcut of its own — it is told what to show.
 *
 * An entry with no `add` is one-per-desk (Master, Routing, Playback): it is
 * listed, because "what does this instrument have" is half of what a palette is
 * for, and it says so rather than pretending to be addable.
 */
export default function ModulePalette({ mode, onClose, api }) {
  const [q, setQ] = useState('')
  const [sel, setSel] = useState(0)
  const [kind, setKind] = useState(null)
  const listRef = useRef(null)

  const items = useMemo(() => {
    const found = searchModules(q)
    return kind ? found.filter((m) => m.kind === kind) : found
  }, [q, kind])

  /* the cursor returns to the top when the list changes — adjusted DURING
     render (react.dev, "adjusting state when a prop changes"), not in an
     effect, which would cascade a second render every keystroke */
  const [seen, setSeen] = useState({ q, kind })
  if (seen.q !== q || seen.kind !== kind) { setSeen({ q, kind }); setSel(0) }

  /* arrows move, Enter adds, Escape closes — the palette's own keys, live only
     while it is open */
  useEffect(() => {
    if (!mode) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); return }
      if (e.key === 'ArrowDown' || (e.key === 'Tab' && !e.shiftKey)) { e.preventDefault(); setSel((i) => Math.min(i + 1, items.length - 1)) }
      else if (e.key === 'ArrowUp' || (e.key === 'Tab' && e.shiftKey)) { e.preventDefault(); setSel((i) => Math.max(i - 1, 0)) }
      else if (e.key === 'Enter') {
        e.preventDefault()
        const m = items[sel]
        if (m?.add) { m.add(api); onClose() }
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [mode, items, sel, onClose, api])

  /* keep the cursor in view without a scroll library */
  useEffect(() => {
    listRef.current?.querySelector('[data-sel="1"]')?.scrollIntoView({ block: 'nearest' })
  }, [sel])

  if (!mode) return null

  const row = (m, i) => (
    <div
      key={m.id}
      data-sel={i === sel ? '1' : undefined}
      onMouseEnter={() => setSel(i)}
      onClick={() => { if (m.add) { m.add(api); onClose() } }}
      className={`flex items-center gap-3 kol-mono-14 ${m.add ? 'cursor-pointer' : 'cursor-default'}`}
      style={{
        padding: '6px 12px',
        background: i === sel ? 'var(--kol-fg-08)' : 'transparent',
        color: m.add ? 'var(--kol-fg-96)' : 'var(--kol-fg-32)',
      }}
    >
      <span style={{ flex: 1, minWidth: 0 }} className="truncate">{m.name}</span>
      <span className="kol-helper-10 uppercase text-fg-32 shrink-0">{m.group}</span>
      <span className="kol-helper-10 uppercase text-fg-24 shrink-0" style={{ width: 92, textAlign: 'right' }}>{m.detail}</span>
    </div>
  )

  /* E — a shelf along the bottom, grouped, the whole registry at a glance */
  return (
    <div
      style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 'var(--kol-z-overlay, 50)', maxHeight: '46vh', display: 'flex', flexDirection: 'column', background: 'var(--kol-surface-primary)', borderTop: '1px solid var(--kol-fg-16)', boxShadow: '0 -20px 60px rgb(0 0 0 / 0.45)' }}
    >
      <div className="flex items-center gap-4" style={{ padding: '10px 16px', borderBottom: '1px solid var(--kol-fg-08)' }}>
        <span className="kol-helper-12 uppercase text-fg-96">Modules</span>
        <span
          className={`kol-helper-12 uppercase cursor-pointer ${kind === null ? 'text-fg-96' : 'text-fg-32 hover:text-fg-64'}`}
          onClick={() => setKind(null)}
        >All</span>
        {KINDS.map((k) => (
          <span
            key={k}
            className={`kol-helper-12 uppercase cursor-pointer ${kind === k ? 'text-fg-96' : 'text-fg-32 hover:text-fg-64'}`}
            onClick={() => setKind(kind === k ? null : k)}
          >{k}</span>
        ))}
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Filter…"
          className="kol-mono-14 text-fg-96 bg-transparent outline-none"
          style={{ marginLeft: 'auto', border: '1px solid var(--kol-fg-16)', borderRadius: 'var(--kol-radius-xs)', padding: '4px 10px', width: 200 }}
        />
        <span className="kol-helper-12 text-fg-32 cursor-pointer hover:text-fg-96" onClick={onClose}>Close</span>
      </div>
      <div ref={listRef} style={{ overflowY: 'auto', padding: '4px 0' }}>{items.map(row)}</div>
    </div>
  )
}
