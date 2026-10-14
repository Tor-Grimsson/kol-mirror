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
 *   MODULES — every unit `/create` can place: the halls' variants, the generators, the canvas
 *             FX, the desk's own furniture. One set, grouped by where it comes from.
 *   PATCHES — the desks you saved (and the shipped presets), plus the registry's one-tap patches.
 *
 * Variants · Effects · Expressions as views are gone — a variant IS a module, an effect IS a
 * module, and an expression is something a knob takes, not something you browse. The memory
 * slots list on Home's SAVED. A card opens the unit's page at `/library/:id`, where monitor keeps
 * its module pages; the Mixer sheet that used to be a second library is retired
 * (`_tmp/2026-10-14-rail-cut/`).
 */

const asItem = (m) => ({ name: m.id, title: m.name, tags: m.tags || [], group: m.group, kind: m.kind, detail: m.detail, module: m })
const modules = MODULE_REGISTRY.filter((m) => m.kind !== 'Patch').map(asItem)
const registryPatches = MODULE_REGISTRY.filter((m) => m.kind === 'Patch' && !m.front).map(asItem)

const VIEW_MODE_OPTIONS = [
  { value: 'modules', label: 'Modules' },
  { value: 'patches', label: 'Patches' },
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

const recent = (a, b) => (b.savedAt ?? 0) - (a.savedAt ?? 0)
const tagsOf = (items) => [...new Set(items.flatMap((e) => e.tags || []))].sort()

function useLibraryCatalog() {
  const saved = useLibrary('patch').map((e) => ({
    name: e.id, title: e.name, detail: e.description || `${(e.data?.channels || []).filter((c) => c.variantId).length} channels`, tags: e.tags, entry: e, savedAt: e.savedAt ?? 0,
  }))
  /* newest save first, then the presets, then the registry's one-tap patches */
  const patches = [...saved.filter((p) => !p.entry.preset)].sort(recent).concat(saved.filter((p) => p.entry.preset), registryPatches)

  const VIEWS = {
    modules: {
      items: modules, title: 'All Modules',
      filterGroups: [{ label: 'Modules', key: 'group', stack: true, values: [...new Set(modules.map((m) => m.group))] }],
    },
    patches: {
      items: patches, title: 'All Patches',
      filterGroups: [{ label: 'Tags', key: 'tags', values: tagsOf(patches) }],
    },
  }
  return useCatalogLibrary({
    storageKey: 'library-tab',
    views: VIEW_MODE_OPTIONS,
    viewsConfig: VIEWS,
    subtitle: 'Modules and patches',
    media: (item) => <PatchThumb patch={item.entry} />,
  })
}

/* `key`: a chip from one view must not survive into the other and filter everything out */
export default function LibrarySheet() {
  const props = useLibraryCatalog()
  return <CatalogPage key={props.view} {...props} />
}
