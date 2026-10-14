import { PageHeader } from '@kolkrabbi/kol-component'
import { AppHub, CatalogPage, PageShell } from '@kolkrabbi/kol-shell'

/**
 * Studio — kol-shell's `AppStudio` (0.63.0), forked for ONE seam (2026-10-14, the dev-first rule:
 * fork locally, the DS gets the delta after): the Library slot may carry `children`, the way
 * `use` and `pages[]` do. The DS's slot renders `CatalogPage` from props and matches
 * `/library/*`, so a module's own page under `/library/:id` — monitor's shape, and where the
 * cards that list it live now the Mixer sheet is gone — had nowhere to render. With `children`
 * the app hands the slot a router and keeps the Studio's order, keys, masthead and bar.
 *
 * Everything else is `AppStudio` verbatim. Retire this file the day kol-shell ships the seam.
 *
 *   Home      /              `home`     — HubHome
 *   Library   /library       `library`  — `children`, else a CatalogPage of the props
 *   Create    /create        `create`   — `{ header, children }` in a PageShell
 *   Use       /use           `use`      — the tool, full-bleed
 *   …         pages[].path   `pages`    — opt-in pages, after Use
 *   Settings  /settings      `settings` — HubSettings, pinned at the rail's foot
 */
export default function Studio({
  app,
  currentPath,
  onNavigate,
  iconComponent,
  home,
  library,
  create,
  use,
  pages = [],
  settings,
  walkthrough,
  shortcuts,
  themeToggle,
  shortcutsKey,
  masthead = 'mono',
  shell,
}) {
  const slot = (cfg, path, label, icon) => cfg && { ...cfg, path: cfg.path ?? path, label: cfg.label ?? label, icon: cfg.icon ?? icon }
  const lib = slot(library, '/library', 'Library', 'nav-library')
  const make = slot(create, '/create', 'Create', 'nav-create')
  const tool = slot(use, '/use', 'Use', 'nav-rack')
  const rows = [lib, make, tool, ...pages].filter(Boolean)
  const at = (p) => currentPath === p || currentPath.startsWith(`${p}/`)

  let page
  if (lib && at(lib.path)) {
    const { path: _p, label: _l, icon: _i, children, ...props } = lib
    page = children ?? <CatalogPage {...props} />
  } else if (make && at(make.path)) {
    page = (
      <PageShell>
        {make.header && <PageHeader size="sm" {...make.header} />}
        {make.children}
      </PageShell>
    )
  } else if (tool && at(tool.path)) {
    page = tool.children
  } else {
    page = pages.find((p) => at(p.path))?.children ?? null
  }

  return (
    <AppHub
      app={app}
      items={rows.map(({ path, icon, label }) => ({ path, icon, label }))}
      currentPath={currentPath}
      onNavigate={onNavigate}
      iconComponent={iconComponent}
      home={home}
      walkthrough={walkthrough}
      settings={settings}
      shortcuts={shortcuts}
      themeToggle={themeToggle}
      shortcutsKey={shortcutsKey}
      masthead={masthead}
      /* the tool sits on bare surface-primary, full-bleed; every other page keeps the Hub's wash */
      shell={{ ...(tool && at(tool.path) ? { pageWash: null } : null), ...shell }}
    >
      {page}
    </AppHub>
  )
}
