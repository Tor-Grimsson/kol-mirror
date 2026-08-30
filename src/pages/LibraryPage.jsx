import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CatalogPage } from '@kolkrabbi/kol-shell'
import { ContentCard, ContentRow } from '@kolkrabbi/kol-component'
import { DISPLACEMENT_VARIANTS, MOVEMENT_VARIANTS, COPIES_VARIANTS, GENERATOR_VARIANTS, findVariant } from '../data/mirrorVariants'
import { CANVAS_FX_DEFS, getDefaultCanvasFxParams, MAX_CANVAS_FX } from '../hooks/useCanvasFx'
import { useLibrary, exportEntry, importEntry, removeFromLibrary } from '../hooks/useLibraryStore'
import { compile } from '../hooks/useExpressionValue'
import { WIRE_COLORS } from '../components/hall-of-mirrors/wireColors'
import Button from '../components/atoms/Button'
import Divider from '../components/atoms/Divider'
import { Icon } from '../components/icons'

/**
 * LibraryPage — /library, on kol-shell's `CatalogPage` (ShellHomeSystemAdoption,
 * 2026-08-27), in fxr's shape: ONE pooled list — the memory slots and the
 * variant catalogue — RECENT / SAVED in the header, and each kind a FILTER
 * GROUP with its own chips (Variants → the halls, Memory → the slots). What
 * an item is and what a click does stay here; the page chrome is the DS's.
 * Library entries (useLibraryStore — expressions today, effects + patches
 * next) pool in as well: tags are their filter group, Export / Remove ride the
 * card, Import is the page action.
 *
 * CREATE IS THE THIRD VIEW (2026-08-28, user ruling: "Create can merge with
 * library as a tab, like kol-monitor shows patches and modules same page").
 * `/create` was its own route until today; monitor puts MODULES and PATCHES on
 * one `CatalogPage` and switches items / filter groups / cards off the header
 * strip, and mirror's two catalogues overlap so heavily — Create's Sources ARE
 * the halls' variants — that a second page was showing the same list twice.
 * The strip carries the browse orderings AND the kind: Recent · Saved ·
 * Create. `key` remounts only across the kind boundary — the organism's active
 * filters are keyed by group, and a stale `Displacement` chip would filter
 * every module out, but Recent ↔ Saved share their groups and keep them.
 *
 * The channel builder rides the create view's `renderItem` as a sticky rail
 * beside the grid. `CatalogPage` has one content slot, so a side rail is the
 * renderer's or it is nothing — and forking the DS page to grow a second slot
 * for one consumer is the duplication kol-shell exists to end.
 */

const PREVIEW_SRC = '/images/stack-hero-400.jpg'

const allVariants = [
  ...DISPLACEMENT_VARIANTS.map(v => ({ ...v, hall: 'Displacement' })),
  ...MOVEMENT_VARIANTS.map(v => ({ ...v, hall: 'Movement' })),
  ...COPIES_VARIANTS.map(v => ({ ...v, hall: 'Copies' })),
].map(v => ({ name: v.id, title: v.title, hall: v.hall, tags: v.tags || [] }))

/* ── The create view's pool ────────────────────────────────────────────
   Mirror's parts are SOURCES (the halls' variants, the generators, live
   input) and FX UNITS, and the thing you build is a channel — a source plus
   an ordered effect chain. Same variants as `allVariants` above, carrying
   the create view's keys instead of the browse view's. */

const asSource = (v, category) => ({
  name: v.id,
  title: v.title,
  kind: 'Source',
  category,
  tags: v.tags || [],
})

const SOURCES = [
  ...DISPLACEMENT_VARIANTS.map((v) => asSource(v, 'Displacement')),
  ...MOVEMENT_VARIANTS.map((v) => asSource(v, 'Movement')),
  ...COPIES_VARIANTS.map((v) => asSource(v, 'Copies')),
  ...GENERATOR_VARIANTS.map((v) => asSource(v, 'Generator')),
]

const EFFECTS = CANVAS_FX_DEFS.map((d) => ({
  name: d.id,
  title: d.label,
  kind: 'Effect',
  category: 'Effect',
  tags: Object.keys(d.params),
}))

const MODULES = [...SOURCES, ...EFFECTS]

const MODULE_FILTER_GROUPS = [
  { label: 'Kind', key: 'kind', stack: true, values: ['Source', 'Effect'] },
  { label: 'Category', key: 'category', values: ['Displacement', 'Movement', 'Copies', 'Generator', 'Effect'] },
  { label: 'Tags', key: 'tags', values: [...new Set(MODULES.flatMap((m) => m.tags))].sort() },
]

const VIEWS = [
  { value: 'recent', label: 'Recent' },
  { value: 'saved', label: 'Saved' },
  { value: 'create', label: 'Create' },
]

/* A patch reads as its signal path: one bar per live channel, in wire colour,
   with the master strip at the end. Cheap, and it distinguishes patches at a
   glance without rendering the actual mixer. */
function PatchThumb({ patch }) {
  const chans = (patch.data?.channels || []).filter((c) => c.variantId)
  const inputs = patch.data?.master?.inputs || []
  return (
    <svg viewBox="0 0 100 40" preserveAspectRatio="none" style={{ width: '100%', height: '100%', display: 'block' }}>
      {chans.map((c, i) => {
        const y = 8 + i * 10
        const patched = inputs.includes(i)
        return (
          <g key={i} opacity={patched ? 1 : 0.3}>
            <line x1="6" y1={y} x2="70" y2={y} stroke={WIRE_COLORS[i % WIRE_COLORS.length]} strokeWidth="2" vectorEffect="non-scaling-stroke" />
            <circle cx="6" cy={y} r="2.5" fill={WIRE_COLORS[i % WIRE_COLORS.length]} />
            {patched && <line x1="70" y1={y} x2="86" y2="20" stroke={WIRE_COLORS[i % WIRE_COLORS.length]} strokeWidth="1" opacity="0.6" vectorEffect="non-scaling-stroke" />}
          </g>
        )
      })}
      <rect x="86" y="12" width="8" height="16" fill="none" stroke="currentColor" strokeWidth="1" className="text-fg-32" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

/* A static trace of the expression over 5 s — the card's media. */
function ExpressionThumb({ expr }) {
  const fn = compile(expr)
  const pts = []
  let lo = Infinity, hi = -Infinity
  for (let i = 0; i <= 100; i++) {
    let v
    try { v = fn ? fn((i / 100) * 5, i * 3, 0, 100) : 0 } catch { v = 0 }
    if (!isFinite(v)) v = 0
    pts.push(v)
    if (v < lo) lo = v
    if (v > hi) hi = v
  }
  const range = hi - lo || 1
  const points = pts.map((v, i) => `${i},${(1 - (v - lo) / range) * 36 + 2}`).join(' ')
  return (
    <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="text-fg-64" style={{ width: '100%', height: '100%', display: 'block' }}>
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

/* A module's own output, or an honest blank — never the stock photo.
 *
 * The card used to fall back to `PREVIEW_SRC`, so the six generators (whose
 * PNGs did not exist) advertised an unprocessed photograph as their output —
 * Live Input's card showed a still of two models. A blank says "no preview"; a
 * photo says "this is what it looks like", and one of those is a lie. Sources
 * read `/previews/variants/<id>.png`, FX units `/previews/fx/<id>.png`, and
 * anything missing degrades to the glyph. `pnpm generate-previews` fills both.
 */
function ModuleMedia({ src }) {
  const [failed, setFailed] = useState(false)
  if (failed || !src) {
    return <div className="flex items-center justify-center h-full text-fg-32"><Icon name="frequency" size={24} /></div>
  }
  return <img src={src} onError={() => setFailed(true)} alt="" />
}

/* THE CHANNEL — what you have built so far. Deliberately a list, not a live
   render: a preview here would mean a second instrument, and the instrument is
   the studio's. Sticky, so it stays put while the catalogue scrolls past it. */
function ChannelRail({ source, chain, onClearSource, onMoveUp, onRemoveFx, onSend }) {
  return (
    <div
      className="shrink-0 flex flex-col kol-helper-12"
      style={{ width: 300, borderLeft: '1px solid var(--kol-fg-08)', paddingLeft: 16, position: 'sticky', top: 0, alignSelf: 'flex-start' }}
    >
      <div className="kol-eyebrow text-fg-48" style={{ marginBottom: 8 }}>Channel</div>

      <div className="flex items-center justify-between" style={{ height: 24 }}>
        <span className="text-fg-96">{source ? source.title : 'No source'}</span>
        {source && (
          <span className="cursor-pointer text-fg-32 hover:text-fg-96 flex" onClick={onClearSource} title="Remove source">
            <Icon name="x" size={12} />
          </span>
        )}
      </div>
      <div className="text-fg-32">{source ? source.category : 'Pick one from the catalogue'}</div>

      <Divider className="my-2" />

      <div className="kol-eyebrow text-fg-48" style={{ marginBottom: 8 }}>Effects · {chain.length}/{MAX_CANVAS_FX}</div>
      {chain.length === 0 && <span className="text-fg-32">None — click an effect to stack it</span>}
      {chain.map((fx, i) => (
        <div key={i} className="flex items-center justify-between" style={{ height: 24 }}>
          <span className="text-fg-64">{i + 1}. {CANVAS_FX_DEFS.find((d) => d.id === fx.type)?.label || fx.type}</span>
          <span className="flex items-center gap-2 shrink-0">
            {i > 0 && (
              <span className="cursor-pointer text-fg-32 hover:text-fg-96" title="Move up" onClick={() => onMoveUp(i)}>↑</span>
            )}
            <span className="cursor-pointer text-fg-32 hover:text-fg-96 flex" title="Remove" onClick={() => onRemoveFx(i)}>
              <Icon name="x" size={12} />
            </span>
          </span>
        </div>
      ))}

      <Divider className="my-2" />

      <div className="kol-eyebrow text-fg-48" style={{ marginBottom: 8 }}>Send to</div>
      <div className="flex items-center gap-2">
        {[0, 1, 2].map((i) => (
          <Button key={i} variant="grey" size="sm" disabled={!source} onClick={() => onSend(i)}>Ch {i + 1}</Button>
        ))}
      </div>
      {!source && <div className="text-fg-32" style={{ marginTop: 8 }}>A channel needs a source before it can be sent.</div>}
    </div>
  )
}

export default function LibraryPage() {
  const navigate = useNavigate()
  const [view, setView] = useState('recent')
  const create = view === 'create'

  /* The channel under construction. Held here, not in the rail, because the
     catalogue's cards are what add to it. */
  const [source, setSource] = useState(null)     // { name, title }
  const [chain, setChain] = useState([])         // [{ type, enabled, params }]

  const add = (m) => {
    if (m.kind === 'Source') { setSource(m); return }
    if (chain.length >= MAX_CANVAS_FX) return
    setChain((c) => [...c, { type: m.name, enabled: true, params: getDefaultCanvasFxParams(m.name) }])
  }

  /* The slot as the studio will receive it — the same shape a channel holds, so
     the receiving side is a merge and not a translation. */
  const slot = useMemo(() => ({
    variantId: source?.name || null,
    enabled: !!source,
    canvasFx: chain,
    /* The strip's label is `ch.name`, in the `Category: Title` shape the mixer
       splits on — without it a sent channel arrives unlabelled. */
    name: source ? `${source.category}: ${source.title}` : null,
  }), [source, chain])

  /* Handed over through `location.state`, the seam patches and memory slots
     already use, rather than reaching into the mixer's state. The instrument's
     state lives inside `/studio` by design (ARCHITECTURE §1); a browse page
     cannot hold it, and shouldn't try. */
  const send = (channelIndex) => navigate('/studio', { state: { slot, channelIndex } })

  const expressions = useLibrary('expression').map((e) => ({
    name: e.id, title: e.name, detail: e.data.expr, tags: e.tags, entry: e, savedAt: e.savedAt ?? 0,
  }))
  const patches = useLibrary('patch').map((e) => ({
    name: e.id, title: e.name,
    detail: `${(e.data?.channels || []).filter((c) => c.variantId).length} ch · ${e.description || ''}`.trim(),
    tags: e.tags, entry: e, savedAt: e.savedAt ?? 0,
  }))
  const entries = [...expressions, ...patches]
  const userExpr = entries.filter((e) => !e.entry.preset)
  const presetExpr = entries.filter((e) => e.entry.preset)

  // Parsed once per mount (audit 2026-08-12: was re-parsing every render).
  const [memory] = useState(() => {
    try {
      const raw = localStorage.getItem('mirror-archive')
      if (raw) return (JSON.parse(raw) || []).map((s, i) => ({ slot: s, i })).filter(({ slot }) => slot)
    } catch { /* no memory */ }
    return []
  })

  const saved = memory.map(({ slot, i }) => ({
    name: `m${i + 1}`,
    title: `M${i + 1} — ${findVariant(slot.variantId)?.title || slot.variantId}`,
    detail: slot.variantId,
    src: slot.imageSrc || PREVIEW_SRC,
    slotIndex: i,
    savedAt: slot.savedAt ?? 0,
    memory: `M${i + 1}`,
  }))

  /* RECENT = newest slot first, then the catalogue; SAVED = store order
     (M1 → M9, then the catalogue). Slots saved before `savedAt` existed sort
     as 0 — after the dated ones, still ahead of the catalogue. */
  const items = create
    ? MODULES
    : view === 'recent'
    ? [...saved, ...userExpr].sort((a, b) => b.savedAt - a.savedAt).concat(allVariants, presetExpr)
    : [...saved, ...userExpr, ...allVariants, ...presetExpr]

  /* THE PRINTS SHAPE (fxr, 2026-08-27): the FIRST group hugs its chips, every
     group after it flows. A group with nothing behind its chips is not shown. */
  const filterGroups = create
    ? MODULE_FILTER_GROUPS
    : [
        { label: 'Variants', key: 'hall', stack: true, values: ['Displacement', 'Movement', 'Copies'] },
        { label: 'Memory', key: 'memory', values: saved.map((s) => s.memory) },
        /* One tag vocabulary across variants, patches and expressions — a tag says
           how a thing BEHAVES, which is the question you actually browse by; the
           hall it lives in is a different axis and has its own group above. */
        { label: 'Tags', key: 'tags', values: [...new Set([...allVariants, ...patches, ...expressions].flatMap((e) => e.tags || []))].sort() },
      ].filter((g) => g.values.length)

  const toModuleCard = (m) => ({
    key: m.name,
    title: m.title,
    detail: m.category,
    media: <ModuleMedia src={m.kind === 'Source' ? `/previews/variants/${m.name}.png` : `/previews/fx/${m.name}.png`} />,
    onClick: () => add(m),
  })

  const toCard = (item) => item.entry
    ? {
        key: item.name,
        title: item.title,
        detail: item.detail,
        media: item.entry.kind === 'patch'
          ? <PatchThumb patch={item.entry} />
          : <ExpressionThumb expr={item.entry.data.expr} />,
        actions: (
          <>
            <Button variant="grey" size="sm" onClick={(e) => { e.stopPropagation(); exportEntry(item.entry) }}>Export</Button>
            {!item.entry.preset && <Button variant="grey" size="sm" onClick={(e) => { e.stopPropagation(); removeFromLibrary(item.entry.id) }}>Remove</Button>}
          </>
        ),
        onClick: () => item.entry.kind === 'patch'
          ? navigate('/studio', { state: { patch: item.entry } })
          : navigate('/expressions', { state: { expr: item.entry.data.expr } }),
      }
    : item.slotIndex != null
    ? {
        key: item.name,
        title: item.title,
        detail: item.detail,
        media: <img src={item.src} alt="" />,
        onClick: () => navigate('/studio', { state: { slotIndex: item.slotIndex } }),
      }
    : {
        key: item.name,
        title: item.title,
        detail: item.hall,
        media: <img src={`/previews/variants/${item.name}.png`} onError={(e) => { e.currentTarget.src = PREVIEW_SRC }} alt="" />,
        onClick: () => navigate('/studio', { state: { variantId: item.name } }),
      }

  const grid = (rows, layout) => (
    <div style={{ display: 'grid', gridTemplateColumns: layout === 'list' ? '1fr' : 'repeat(6, 1fr)', gap: layout === 'list' ? 8 : 24 }}>
      {rows.map((item) => {
        const c = create ? toModuleCard(item) : toCard(item)
        return layout === 'list'
          ? <ContentRow key={c.key} variant="catalog" title={c.title} detail={c.detail} actions={c.actions} onClick={c.onClick} />
          : <ContentCard key={c.key} variant="catalog" fit="cover" title={c.title} detail={c.detail} media={c.media} actions={c.actions} onClick={c.onClick} />
      })}
    </div>
  )

  return (
    <CatalogPage
      /* Only across the kind boundary — Recent ↔ Saved share filter groups and
         keep their chips; Create's are different and a stale one filters
         everything out (monitor's `key={tab}`, narrowed). */
      key={create ? 'create' : 'library'}
      header={create
        ? { title: 'Library', subtitle: 'Build a channel from parts, then send it to a slot', size: 'sm', voice: 'mono' }
        : { title: 'Library', subtitle: 'Variants and memory', size: 'sm', voice: 'mono' }}
      items={items}
      filtersTitle={create ? 'All Modules' : 'All Variants'}
      filterGroups={filterGroups}
      /* the search field sits on the fg-02 wash, so it takes the sunken chip
         (ControlToneSunken — theme 0.85.0; `inverse` still aliases it).
         `renderItem` overrides CatalogPage's: its LIST is `ContentRow
         variant="catalog"` in a FOUR-column grid, which gives every row a
         quarter of the width — at the variant's fixed 36px the long expression
         and patch details collide with the Export button. Same variant, ONE
         column: the row keeps its mono line and its right-aligned detail and
         gets the whole width. (`default` was tried first and is wrong here —
         it takes the DS's sans title role and drops the detail.) GRID stays
         the DS's six-column catalog card. `computeHiddenSet` is not reproduced — it only hides an
         expanded card's neighbours, and nothing here sets `expanded`. */
      filtersProps={{
        tone: 'sunken',
        renderItem: (rows, viewMode, layout) => create
          ? (
            <div className="flex flex-row" style={{ gap: 24, alignItems: 'flex-start' }}>
              <div style={{ flex: 1, minWidth: 0 }}>{grid(rows, layout)}</div>
              <ChannelRail
                source={source}
                chain={chain}
                onClearSource={() => setSource(null)}
                onMoveUp={(i) => setChain((c) => { const n = [...c]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; return n })}
                onRemoveFx={(i) => setChain((c) => c.filter((_, j) => j !== i))}
                onSend={send}
              />
            </div>
          )
          : grid(rows, layout),
      }}
      views={VIEWS}
      view={view}
      onViewChange={setView}
      actions={create ? null : <Button variant="grey" size="md" onClick={() => importEntry()}>Import</Button>}
    />
  )
}
