import { useSearchParams } from 'react-router-dom'
import { CatalogPage } from '@kolkrabbi/kol-shell'
import { useShipped, MODULE_GROUP_VALUES } from './shipped.jsx'

/**
 * LibraryPage — `/library`, WHAT THE APP SHIPS (kol-ds-ui plan home-library-detail-one-card, 2026-10-24).
 * Two views and nothing else:
 *
 *   PATCHES — the shipped presets and the registry's one-tap patches. Not the user's saves: those are Home's
 *             (user 2026-10-24: *"home now would only show USER saved patches, which are different from LIBRARY
 *             saves, which are more like system saves. what app ships with"*).
 *   MODULES — the units that stand on their own: the desk's furniture and the generators.
 *
 * The FX view is gone (user 2026-10-24: *"these are expressions, NOT FX and not something to store in library.
 * remove it"*) — expressions are the studio's Expressions tab. Every card is `shipped.jsx`'s one card, and a card
 * opens its page: `/library/patch/<id>` · `/library/module/<slug>`. The previous page (FX view, Home's files under
 * PATCHES) is in `_tmp/2026-10-24-library-shipped/`.
 */

/* `key`: a chip from one view must not survive into the other and filter everything out. The view is in the
   URL (`?view=modules`) so Back from a detail page lands on the view it left (plan 10 § 2.1); `replace`, so
   switching views adds no history step. */
export default function LibrarySheet() {
  const [params, setParams] = useSearchParams()
  const view = params.get('view') === 'modules' ? 'modules' : 'patches'
  const setView = (v) => setParams(v === 'patches' ? {} : { view: v }, { replace: true })
  const { patches, modules, card } = useShipped()
  const files = view === 'patches'
  return (
    <CatalogPage
      key={view}
      preset="app"
      header={{ title: 'Library', subtitle: 'Modules and patches' }}
      items={files ? patches : modules}
      views={[{ value: 'patches', label: 'PATCHES' }, { value: 'modules', label: 'MODULES' }]}
      view={view}
      onViewChange={setView}
      filtersTitle={files ? 'All Patches' : 'All Modules'}
      filterGroups={files ? undefined : [{ label: 'Modules', key: 'group', values: MODULE_GROUP_VALUES }]}
      searchKeys={['title', 'name', 'group']}
      toCard={card}
    />
  )
}
