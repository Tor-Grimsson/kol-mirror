import CatalogLibrary from '../components/CatalogLibrary'
import { MODULE_REGISTRY } from '../data/moduleRegistry'

/**
 * MixerPage — /mixer, the RACK (user ruling 2026-08-28: "don't list cards in a
 * grid: just show a mixer rail in the middle and a right side-rail with each
 * module — make it visual, not so boring as grid").
 *
 * On `CatalogPage`, the same layout Library and Home run (user 2026-08-28:
 * "set up the same layout as [Library]") — after a list, a full-width rack and
 * a centred one were all wrong in turn. The DS page is the answer that was
 * already in the repo: header, filter row, card grid, expand in place.
 *
 * ORDINARY CARDS, on `toCard` (user ruling 2026-09-01: "scrap this skewing
 * module card it was a bad idea, just use normal cards like monitor"). What was
 * here until then was a `Coverflow` — a 3-D skewed carousel of 640px cards, each
 * rendering a LIVE front panel. On a desk it read as a rack; at 390 the Channel
 * Strip's panel simply lay across the Master Module's card, because a drawn
 * front has a desk's width and a phone does not. Retired to
 * `_tmp/2026-09-01-mixer-coverflow/`.
 *
 * `toCard` is the whole contract, so `CatalogPage` draws the grid AND the list
 * itself — which is how this page inherits `CatalogPageMobileColumns` (kol-shell
 * 0.33.0: cols is a ceiling, not a command) for free instead of carrying its own
 * geometry. Same shape kol-monitor's CreatePage uses for its rack modules.
 *
 * Clicking a card still expands it to the specs — `expanded` / `expandedContent`
 * reach `ContentCard catalog`'s 2×2 cell, and the page hides the neighbours
 * itself. A REFERENCE surface, not a second instrument (ARCHITECTURE §1, same
 * standing as /expressions); the desk itself is still state, and nothing here
 * touches it.
 */

/* `module: m` is the whole contract with `CatalogLibrary`'s card: it branches
   on what an item IS, and a registry unit is the branch that opens its own
   page. Without it these fell through to the VARIANT branch and tried to load
   the Master into the studio. Same shape `/library`'s effects use. */
const asItem = (m) => ({ name: m.id, title: m.name, tags: m.tags || [], group: m.group, kind: m.kind, detail: m.detail, module: m })
const modules = MODULE_REGISTRY.filter((m) => m.front?.kind === 'desk').map(asItem)
const registryPatches = MODULE_REGISTRY.filter((m) => m.kind === 'Patch' && !m.front).map(asItem)

const VIEW_MODE_OPTIONS = [
  { value: 'modules', label: 'Modules' },
  { value: 'patches', label: 'Patches' },
]

/* what each view feeds the one page — monitor's `VIEWS` */
const VIEWS = {
  modules: {
    items: modules, title: 'All Modules',
    filterGroups: [{ label: 'Modules', key: 'group', stack: true, values: [...new Set(modules.map((m) => m.group))].sort() }],
  },
  patches: {
    items: registryPatches, title: 'All Patches',
    filterGroups: [{ label: 'Tags', key: 'tags', values: [...new Set(registryPatches.flatMap((m) => m.tags || []))].sort() }],
  },
}

export default function MixerPage() {
  return (
    <CatalogLibrary
      storageKey="mixer-tab"
      views={VIEW_MODE_OPTIONS}
      viewsConfig={VIEWS}
    />
  )
}
