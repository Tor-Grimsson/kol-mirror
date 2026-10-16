import { useState } from 'react'
import { CatalogPage } from '@kolkrabbi/kol-shell'
import useCatalogLibrary from '../components/CatalogLibrary'
import { MODULE_REGISTRY } from '../data/moduleRegistry'
import { useLibrary } from '../hooks/useLibraryStore'
import { WIRE_COLORS } from '../components/hall-of-mirrors/wireColors'

/**
 * LibraryPage — `/library`, MONITOR'S SHAPE (user 2026-10-14: *"it should just store modules
 * and mixer patches (like monitor) not expressions and whatever the fuck is going on there"*).
 * Two views and nothing else:
 *
 *   MODULES — the units that stand on their own: the desk's furniture and the generators.
 *   PATCHES — the desks you saved (and the shipped presets), plus the registry's one-tap patches.
 *
 *   FX      — what acts ON a module and does not stand on its own (user, later the same day, on
 *             seeing the halls' variants in MODULES: *"I said modules and patches, not effects …
 *             effects and expressions, since they both affect other things, they dont stand on
 *             their own"*): the halls' variants, the canvas FX, the expressions. A third view, not
 *             a page — the rail had just been cut; he allowed either.
 *
 * The memory slots list on Home's SAVED. A card opens the unit's page at `/library/:id`, where
 * monitor keeps its module pages; the Mixer sheet that used to be a second library is retired
 * (`_tmp/2026-10-14-rail-cut/`).
 */

const asItem = (m) => ({ name: m.id, title: m.name, tags: m.tags || [], group: m.group, kind: m.kind, detail: m.detail, module: m })
const FX_GROUPS = ['Displacement', 'Movement', 'Copies', 'Canvas FX']
const isFx = (m) => FX_GROUPS.includes(m.group)
const modules = MODULE_REGISTRY.filter((m) => m.kind !== 'Patch' && !isFx(m)).map(asItem)
const fxUnits = MODULE_REGISTRY.filter(isFx).map(asItem)
const registryPatches = MODULE_REGISTRY.filter((m) => m.kind === 'Patch' && !m.front).map(asItem)

const VIEW_MODE_OPTIONS = [
  { value: 'modules', label: 'Modules' },
  { value: 'patches', label: 'Patches' },
  { value: 'fx', label: 'FX' },
]

/* an expression reads as its formula */
function ExprThumb({ expr }) {
  return <pre className="m-0 p-3 text-[10px] leading-snug whitespace-pre-wrap break-all opacity-70">{expr}</pre>
}

/* A patch reads as its signal path: one bar per live channel, in wire colour,
   with the master strip at the end. Cheap, and it distinguishes patches at a
   glance without rendering the actual mixer. */
export function PatchThumb({ patch }) {
  /* A save since 2026-10-15 carries its own frame — that IS the patch. A shipped
     patch (or a starter copied from one) shows its output captured at build time,
     `pnpm generate-patch-thumbs` → /previews/patches/. The wiring drawing is the
     last resort, for an old save with neither. */
  const [missing, setMissing] = useState(false)
  if (patch.thumb) return <img src={patch.thumb} alt={patch.name || ''} className="size-full object-cover" />
  const shipped = (patch.seedOf || (patch.preset ? patch.id : '')).split(':').pop()
  if (shipped && !missing) return <img src={`/previews/patches/${shipped}.jpg`} alt={patch.name || ''} className="size-full object-cover" onError={() => setMissing(true)} />
  return <PatchWiring patch={patch} />
}

function PatchWiring({ patch }) {
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

const recent = (a, b) => (b.savedAt ?? 0) - (a.savedAt ?? 0)
const tagsOf = (items) => [...new Set(items.flatMap((e) => e.tags || []))].sort()

function useLibraryCatalog() {
  const saved = useLibrary('patch').map((e) => ({
    name: e.id, title: e.name, detail: e.description || `${(e.data?.channels || []).filter((c) => c.variantId).length} channels`, tags: e.tags, entry: e, savedAt: e.savedAt ?? 0,
  }))
  /* newest save first, then the presets (a seeded one listed once, as the user's file), then the registry's one-tap patches */
  const seeded = new Set(saved.map((p) => p.entry.seedOf).filter(Boolean))
  const patches = [...saved.filter((p) => !p.entry.preset)].sort(recent).concat(saved.filter((p) => p.entry.preset && !seeded.has(p.entry.id)), registryPatches)
  const expressions = useLibrary('expression').map((e) => ({ name: e.id, title: e.name, detail: e.description || '', tags: e.tags, group: 'Expressions', entry: e, savedAt: e.savedAt ?? 0 }))

  const VIEWS = {
    modules: {
      items: modules, title: 'All Modules',
      filterGroups: [{ label: 'Modules', key: 'group', stack: true, values: [...new Set(modules.map((m) => m.group))] }],
    },
    patches: {
      items: patches, title: 'All Patches',
      filterGroups: [{ label: 'Tags', key: 'tags', values: tagsOf(patches) }],
    },
    fx: {
      items: [...fxUnits, ...expressions], title: 'All FX',
      filterGroups: [{ label: 'FX', key: 'group', stack: true, values: [...FX_GROUPS, 'Expressions'] }],
    },
  }
  return useCatalogLibrary({
    storageKey: 'library-tab',
    views: VIEW_MODE_OPTIONS,
    viewsConfig: VIEWS,
    subtitle: 'Modules, patches and FX',
    media: (item) => (item.entry.kind === 'expression' ? <ExprThumb expr={item.entry.data.expr} /> : <PatchThumb patch={item.entry} />),
  })
}

/* `key`: a chip from one view must not survive into the other and filter everything out */
export default function LibrarySheet() {
  const props = useLibraryCatalog()
  return <CatalogPage key={props.view} {...props} />
}
