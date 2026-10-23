import { useNavigate } from 'react-router-dom'
import { MenuDropdownItem } from '@kolkrabbi/kol-component'
import usePersistedState from '../hooks/usePersistedState'
import ModuleMedia from './ModuleMedia'
import Button from '../components/atoms/Button.jsx'
import { slugFor } from '../data/moduleRegistry.js'
import { exportEntry, importEntry, removeFromLibrary, renameInLibrary, duplicateInLibrary, setThumb, fileToThumb } from '../hooks/useLibraryStore.js'

/* the card's Thumb menu row: pick an image, it becomes the patch's thumbnail */
function pickThumb(id) {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = async () => {
    const file = input.files?.[0]
    const thumb = file && await fileToThumb(file).catch(() => null)
    if (thumb) setThumb(id, thumb)
  }
  input.click()
}

/**
 * ON THE HUB (apps/mixer-hub, 2026-10-03): `useCatalogLibrary()` returns kol-shell `CatalogPage`'s
 * PROPS instead of rendering the page — `AppStudio`'s Library slot takes props, and the Mixer sheet
 * spreads the same ones. Mirror's hand-drawn grid (`filtersProps.renderItem`) is gone with it: the
 * cards and the rows are `CatalogPage`'s own, the list one row per line (`listLayout="stack"`).
 * `toCard` and everything it decides are mirror's, untouched.
 *
 * CatalogLibrary — the browse surface, once. `/library` and `/mixer` are the
 * same page showing different sets.
 *
 * User, 2026-09-02: *"dont make me diff the pages, they should be identical
 * when ur done just showing different sets"*. They were not: the split into two
 * libraries left two hand-written pages, and within an hour Library had the
 * card grid with the action strip while Mixer had `CatalogPage`'s own `toCard`
 * — two card treatments for one idea, which is exactly how they drift.
 *
 * VERBATIM THE SAME SITE (his correction, same day: *"you are already at a bad
 * start, im talking verbatim SAME SITE only difference is the sets it
 * displays"*). So the header, the card treatment, the action and the view strip
 * are ALL this file's — a page passes its sets and nothing else. `toCard` is
 * here too and branches on what an item IS, not on which page asked, because a
 * second `toCard` is a second card treatment waiting to diverge.
 *
 * @param {string}   storageKey   where the chosen view persists
 * @param {Array}    views        [{value, label}] — the view strip
 * @param {Object}   viewsConfig  {value: {items, title, filterGroups}}
 * @param {Function} media        (item) => the card's media, for kinds only the
 *                                page can draw (a patch's signal path, an
 *                                expression's waveform)
 * @param {string}   subtitle     the masthead's second line — which sets this page holds
 *                                (2026-10-03: the Mixer page said what the Library says)
 */
export default function useCatalogLibrary({ storageKey, views, viewsConfig, media, subtitle = 'Every set the instrument has' }) {
  const navigate = useNavigate()
  const [tab, setTab] = usePersistedState(storageKey, views[0].value)
  const view = viewsConfig[tab] ?? viewsConfig[views[0].value]

  /* ONE CARD TREATMENT, branching on the ITEM. A registry unit opens its own
     page; a saved entry carries Export / Remove and opens the studio or the
     expression bench; a memory slot opens its slot; a variant loads into the
     studio. Nothing here knows which route asked. */
  const toCard = (item) => item.module
    ? {
        key: item.name,
        title: item.title,
        detail: item.module.detail,
        media: <ModuleMedia src={item.module.preview} contain={item.module.front?.kind === 'desk'} />,
        onClick: () => navigate(`/library/${slugFor(item.module)}`),
      }
    : item.entry
    ? {
        key: item.name,
        title: item.title,
        detail: item.detail,
        media: media?.(item),
        date: item.entry.savedAt,
        size: new Blob([JSON.stringify(item.entry)]).size,
        /* the `app` card (MirrorLibraryOnAppPreset): Export is the cover's download; Rename prompts and
           Delete confirms through the DS; a shipped preset can only be duplicated; Thumb rides the cog */
        download: () => exportEntry(item.entry),
        verbs: item.entry.preset
          ? { duplicate: () => duplicateInLibrary(item.entry) }
          : {
              rename: (name) => renameInLibrary(item.entry.id, name),
              duplicate: () => duplicateInLibrary(item.entry),
              remove: () => removeFromLibrary(item.entry.id),
            },
        menuItems: !item.entry.preset && item.entry.kind === 'patch'
          ? <MenuDropdownItem onClick={() => pickThumb(item.entry.id)}>Thumb</MenuDropdownItem>
          : undefined,
        onClick: () => item.entry.kind === 'patch'
          ? navigate('/studio', { state: { patch: item.entry } })
          : navigate('/studio', { state: { expr: item.entry.data.expr } }),
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
        media: <ModuleMedia src={`/previews/variants/${item.name}.png`} />,
        onClick: () => navigate('/studio', { state: { variantId: item.name } }),
      }

  return {
    header: { title: 'Library', subtitle, size: 'sm' },
    items: view.items,
    filtersTitle: view.title,
    filterGroups: view.filterGroups.filter((g) => g.values.length),
    searchKeys: ['title', 'name', 'kind', 'group', 'detail'],
    toCard,
    preset: 'app',
    listLayout: 'stack',
    views,
    view: tab,
    onViewChange: setTab,
    actions: <Button tone="grey" size="md" onClick={() => importEntry()}>Import</Button>,
  }
}
