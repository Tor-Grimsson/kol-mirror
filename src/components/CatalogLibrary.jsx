import { useNavigate } from 'react-router-dom'
import { CatalogPage } from '@kolkrabbi/kol-shell'
import { ContentCard, ContentRow } from '@kolkrabbi/kol-component'
import usePersistedState from '../hooks/usePersistedState'
import ModuleMedia from './ModuleMedia'
import Button from './atoms/Button'
import { slugFor } from '../data/moduleRegistry'
import { exportEntry, importEntry, removeFromLibrary } from '../hooks/useLibraryStore'

/**
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
 */
export default function CatalogLibrary({ storageKey, views, viewsConfig, media }) {
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
        onClick: () => navigate(`/mixer/${slugFor(item.module)}`),
      }
    : item.entry
    ? {
        key: item.name,
        title: item.title,
        detail: item.detail,
        media: media?.(item),
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
        media: <ModuleMedia src={`/previews/variants/${item.name}.png`} />,
        onClick: () => navigate('/studio', { state: { variantId: item.name } }),
      }

  /* SIX IS A CEILING, NOT A COMMAND. `repeat(6, 1fr)` computed six 38px
     slivers at 390 and every card title truncated to three characters —
     measured in the browser 2026-09-01, and the same defect kol-monitor filed
     against the DS as `CatalogPageMobileColumns` (fixed there in kol-shell
     0.33.0). This grid is ours, drawn inline, so the DS fix could never reach
     it. Same idiom as the DS's: a track is never under the 160px floor and
     never narrower than a sixth of the row, so the column count falls out of
     the width — 6 on the desk, 2 at 390 — and desktop does not move (at 1400 a
     sixth is 213px, well over the floor). */
  const grid = (rows, layout) => (
    <div style={{ display: 'grid', gridTemplateColumns: layout === 'list' ? '1fr' : 'repeat(auto-fill, minmax(max(160px, calc((100% - 120px) / 6)), 1fr))', gap: layout === 'list' ? 8 : 24 }}>
      {rows.map((item) => {
        const c = toCard(item)
        if (layout === 'list') {
          return <ContentRow key={c.key} variant="catalog" title={c.title} detail={c.detail} actions={c.actions} onClick={c.onClick} />
        }
        /* ACTIONS IN THEIR OWN STRIP UNDER THE CARD, never inside the text
           plate. Passed as `actions` the Export / Remove buttons sat on top of
           the title and the expression — "Golden dri[Export]" at 390, the
           user's screenshot 2026-09-02. Same strip `/create` uses for INSERT,
           and the same ruling monitor took twice. */
        return (
          <div key={c.key}>
            <ContentCard variant="catalog" fit={c.fit || 'cover'} title={c.title} detail={c.detail} media={c.media} onClick={c.onClick} />
            {c.actions && (
              <div className="bg-surface-primary flex items-center justify-end gap-2" style={{ padding: '8px var(--kol-pad-card-md)', marginTop: 1 }}>
                {c.actions}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )

  return (
    <CatalogPage
      /* `key={tab}` — monitor's: a chip from one kind must not survive into
         another and filter everything out */
      key={tab}
      header={{ title: 'Library', subtitle: 'Every set the instrument has', size: 'sm', voice: 'mono' }}
      items={view.items}
      filtersTitle={view.title}
      filterGroups={view.filterGroups.filter((g) => g.values.length)}
      searchKeys={['title', 'name', 'kind', 'group', 'detail']}
      /* the search field sits on the fg-02 wash, so it takes the sunken chip
         (ControlToneSunken — theme 0.85.0; `inverse` still aliases it).
         `renderItem` overrides CatalogPage's: its LIST is `ContentRow
         variant="catalog"` in a FOUR-column grid, which gives every row a
         quarter of the width — at the variant's fixed 36px the long expression
         and patch details collide with the Export button. Same variant, ONE
         column: the row keeps its mono line and its right-aligned detail and
         gets the whole width. */
      filtersProps={{ tone: 'sunken', renderItem: (rows, viewMode, layout) => grid(rows, layout) }}
      views={views}
      view={tab}
      onViewChange={setTab}
      actions={<Button variant="grey" size="md" onClick={() => importEntry()}>Import</Button>}
    />
  )
}
