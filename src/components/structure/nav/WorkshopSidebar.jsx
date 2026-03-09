import { useEffect, useMemo, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Icon, useTheme, Divider, ThemeToggleButton } from '@kol/ui'
import { WORKSHOP_ROUTES } from '../../../data/workshop/navigation'
import Wordmark from '../../ui/Wordmark'
import Logomark from '../../ui/Logomark'

const ICON_MAP = {
  'styleguide': 'styleguide',
  home: 'styleguide',
  'design-system': 'styleguide',
  foundations: 'foundation',
  components: 'component',
  apparat: 'interactive',
  chess: 'chess-pawn',
  analytics: 'stat-stat'
}

const resolveIconName = (route) => {
  if (route.icon) return route.icon
  return ICON_MAP[route.id] ?? 'arrow-downright'
}

const ensureStyleguidePath = (path = '') => {
  if (!path) return '/workshop'
  return path.startsWith('/workshop') ? path : `/workshop/${path}`
}

const computeDestination = (node) => {
  if (!node) return '/workshop'
  if (node.path !== undefined && node.path !== null) {
    return ensureStyleguidePath(node.path)
  }
  if (Array.isArray(node.children) && node.children.length > 0) {
    return computeDestination(node.children[0])
  }
  return '/workshop'
}

const isNodeActive = (node, normalizedPath) => {
  const destination = computeDestination(node)
  if (normalizedPath === destination) {
    return true
  }
  if (Array.isArray(node.children) && node.children.length > 0) {
    return node.children.some((child) => isNodeActive(child, normalizedPath))
  }
  if (!destination || destination === '/workshop') {
    return false
  }
  return normalizedPath.startsWith(`${destination}/`)
}

const WorkshopSidebar = ({
  isCollapsed,
  setIsCollapsed,
  expandedItems,
  setExpandedItems,
  isSidebarLocked,
  setIsSidebarLocked,
  collapsedWidth = 96,
  forceCollapsed = false,
  enableShelf = false
}) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const normalizedPath = location.pathname.replace(/\/$/, '')
  const [activeShelfId, setActiveShelfId] = useState(null)

  const findActiveGroup = () =>
    WORKSHOP_ROUTES.find((route) => isNodeActive(route, normalizedPath))

  const activeGroup = findActiveGroup()
  const activeGroupId = activeGroup?.id

  useEffect(() => {
    if (!activeGroup) return
    const destination = computeDestination(activeGroup)
    if (normalizedPath === destination) return
    setExpandedItems((prev) => {
      if (prev[activeGroupId]) return prev
      return { [activeGroupId]: true }
    })
  }, [activeGroup, activeGroupId, normalizedPath, setExpandedItems])

  const toggleGroup = (id) => {
    setExpandedItems((prev) => {
      const nextValue = !prev[id]
      if (nextValue) {
        return { [id]: true }
      }
      const updated = { ...prev }
      delete updated[id]
      return updated
    })
  }

  const toggleSidebar = () => {
    if (forceCollapsed) {
      setActiveShelfId(null)
      return
    }
    setActiveShelfId(null)
    setIsCollapsed((prev) => !prev)
  }

  const primaryIcons = useMemo(() => {
    return WORKSHOP_ROUTES.map((route) => {
      const destination = computeDestination(route)
      const isActive = isNodeActive(route, normalizedPath)
      return {
        id: route.id,
        label: route.label,
        icon: resolveIconName(route),
        to: destination,
        isActive,
        children: route.children ?? []
      }
    })
  }, [normalizedPath])

  useEffect(() => {
    if (!enableShelf) {
      setActiveShelfId(null)
    }
  }, [enableShelf])

  const handleCollapsedIcon = (route) => {
    if (enableShelf && route.children.length > 0) {
      setActiveShelfId((prev) => (prev === route.id ? null : route.id))
      return
    }
    navigate(route.to)
    setActiveShelfId(null)
  }

  const renderChildList = () => {
    if (!enableShelf || !activeShelfId) return null
    const activeRoute = primaryIcons.find((route) => route.id === activeShelfId)
    if (!activeRoute || activeRoute.children.length === 0) {
      return null
    }
    // On mobile (forceCollapsed), use fixed positioning to overlay content
    // Otherwise use absolute positioning relative to sidebar
    // Note: Using inline style for height because Tailwind JIT doesn't generate h-[100dvh] from dynamic strings
    const shelfPositionClass = forceCollapsed
      ? 'fixed top-0 w-[280px] z-[200]'
      : 'absolute left-full top-0 z-[200] h-full w-[280px]'
    const shelfStyle = forceCollapsed
      ? { left: `${collapsedWidth}px`, height: '100dvh' }
      : undefined

    return (
      <div className={shelfPositionClass} style={shelfStyle}>
        <div className="absolute inset-0 bg-fg-24 pointer-events-none" />
        <div className="relative flex h-full flex-col border-x border-fg-08 bg-surface-primary px-4 pt-24 pb-6 text-left">
          <div className="border-b border-fg-08 pb-8">
            <p className="kol-helper-uc-md text-auto">{activeRoute.label}</p>
          </div>
          <nav className="mt-6 flex flex-col gap-2 overflow-y-auto pr-1">
            {activeRoute.children.map((child) => {
              const childDestination = ensureStyleguidePath(child.path)
              const childActive =
                normalizedPath === childDestination || normalizedPath.startsWith(`${childDestination}/`)
              return (
                <button
                  key={child.id}
                  type="button"
                  className={`flex items-center gap-3 px-1 py-2 text-[16px] transition-colors ${
                    childActive ? 'text-auto' : 'text-fg-72 hover:text-fg-96'
                  }`}
                  onClick={() => {
                    navigate(childDestination)
                    setActiveShelfId(null)
                  }}
                >
                  <Icon name={resolveIconName(child)} size={14} className="text-current" />
                  <span className="kol-mono-text text-[16px]">{child.label}</span>
                </button>
              )
            })}
          </nav>
        </div>
      </div>
    )
  }

  const renderFlexNode = (node, depth = 0) => {
    const destination = computeDestination(node)
    const hasChildren = Array.isArray(node.children) && node.children.length > 0
    const isDirectMatch = normalizedPath === destination
    const indentStyle = depth ? { marginInlineStart: `${depth * 24}px` } : undefined
    const isExpanded = hasChildren ? Boolean(expandedItems[node.id]) : false

    if (hasChildren) {
      return (
        <div key={node.id} className="flex flex-col gap-1" style={indentStyle}>
          <button
            type="button"
            className={[
              'flex h-9 w-full items-center gap-4 rounded-full px-3 transition-colors duration-200 text-left',
              isDirectMatch ? 'bg-fg-02 text-auto' : 'text-auto hover:bg-fg-012'
            ].join(' ')}
            onClick={() => toggleGroup(node.id)}
          >
            <Icon name={resolveIconName(node)} size={16} className="text-current" />
            <span className="kol-mono-text text-[14px]">{node.label}</span>
            <span className="ml-auto flex h-7 w-7 items-center justify-center rounded-full text-current transition-colors duration-200 hover:bg-fg-012">
              <Icon name={isExpanded ? '12px-minus' : '12px-plus'} size={12} className="text-current" />
            </span>
          </button>
          {isExpanded && (
            <div className="flex flex-col">
              {node.children.map((child) => renderFlexNode(child, depth + 1))}
            </div>
          )}
        </div>
      )
    }

    return (
      <NavLink
        key={node.id}
        to={destination}
        end
        className={({ isActive: navActive }) => [
          'flex h-9 items-center gap-3 rounded-full px-3 transition-colors duration-200',
          navActive ? 'bg-fg-04 text-auto' : 'text-auto hover:bg-fg-012'
        ].join(' ')}
        style={indentStyle}
      >
        <Icon name={resolveIconName(node)} size={16} className="text-current" />
        <span className="kol-mono-text text-[14px]">{node.label}</span>
      </NavLink>
    )
  }

  const collapsedWidthStyle = { width: `${collapsedWidth}px`, minWidth: `${collapsedWidth}px` }
  const effectiveCollapsed = forceCollapsed || isCollapsed
  const collapsedPaddingClass = collapsedWidth <= 72 ? 'px-2' : 'px-3'
  // Note: Using inline style for height because Tailwind JIT doesn't generate h-[100dvh] from dynamic strings
  const stickyClass = forceCollapsed ? 'fixed top-0 left-0 z-[100]' : 'sticky top-0'

  return (
    <aside
      className={`flex flex-col border-r border-fg-08 bg-surface-primary ${stickyClass}`}
      style={{
        ...(effectiveCollapsed ? collapsedWidthStyle : { width: '304px', minWidth: '304px' }),
        height: '100dvh'
      }}
    >
      {effectiveCollapsed ? (
        <>
          <div className={`flex w-full flex-1 flex-col items-center ${collapsedPaddingClass} py-6 overflow-y-auto`}>
            <div className="flex flex-col items-center gap-6">
              <Link to="/" className="transition-opacity hover:opacity-80">
                <Logomark className="h-10 w-10" title="Kolkrabbi logomark" />
              </Link>
              <button
                type="button"
                aria-label={forceCollapsed ? (activeShelfId ? 'Close menu' : 'Open menu') : 'Expand sidebar'}
                onClick={() => {
                  if (forceCollapsed) {
                    // Toggle shelf: if open, close it; if closed, open first nav group with children
                    if (activeShelfId) {
                      setActiveShelfId(null)
                    } else {
                      const firstWithChildren = WORKSHOP_ROUTES.find(r => r.children?.length > 0)
                      if (firstWithChildren) setActiveShelfId(firstWithChildren.id)
                    }
                  } else {
                    toggleSidebar()
                  }
                }}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-fg-04"
              >
                <Icon name={forceCollapsed && activeShelfId ? 'chevron-left' : 'chevron-right'} size={18} />
              </button>
            </div>
            <Divider className="my-6 w-full" />
            <nav className="flex flex-1 flex-col items-center gap-3 overflow-y-auto">
              {primaryIcons.map((route) => {
                const iconHighlighted = enableShelf
                  ? activeShelfId
                    ? activeShelfId === route.id
                    : route.isActive
                  : route.isActive
                const baseClasses = `flex h-10 w-10 items-center justify-center rounded-full border border-transparent transition-colors ${
                  iconHighlighted ? 'bg-fg-04 text-fg-96' : 'text-fg-48 hover:bg-fg-04 hover:text-fg-96'
                }`
                return (
                  <div key={route.id} className="relative">
                    {enableShelf ? (
                      <button
                        type="button"
                        aria-label={route.label}
                        className={baseClasses}
                        onClick={() => handleCollapsedIcon(route)}
                      >
                        <Icon name={route.icon} size={18} />
                      </button>
                    ) : (
                      <Link
                        to={route.to}
                        aria-label={route.label}
                        title={route.label}
                        className={baseClasses}
                        onClick={(event) => {
                          if (route.children.length > 0) {
                            event.preventDefault()
                            handleCollapsedIcon(route)
                          }
                        }}
                      >
                        <Icon name={route.icon} size={18} />
                      </Link>
                    )}
                  </div>
                )
              })}
            </nav>
            <div className="mt-6 flex flex-col items-center gap-4">
              <button
                type="button"
                aria-label="Toggle theme"
                onClick={toggleTheme}
                className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-200 ${
                  theme === 'dark' ? 'bg-fg-0 text-fg-96' : 'text-fg-48 hover:bg-fg-04 hover:text-fg-96'
                }`}
              >
                <Icon name="theme-toggle" size={18} className="text-current" />
              </button>
              {!forceCollapsed && (
                <button
                  type="button"
                  className="toggle-switch border-0 bg-surface-primary"
                  data-state={isSidebarLocked ? 'on' : 'off'}
                  onClick={() => setIsSidebarLocked(!isSidebarLocked)}
                  aria-label="Lock sidebar"
                  aria-pressed={isSidebarLocked}
                >
                  <span className="toggle-switch-indicator" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>
          {renderChildList()}
        </>
      ) : (
        <div className="flex w-full flex-1 flex-col px-6 py-10 transition-all duration-200 overflow-y-auto">
          <div className="flex items-center justify-between">
            <Link to="/" className="inline-flex items-center transition-opacity hover:opacity-80">
              <Wordmark className="h-6 w-auto" />
            </Link>
            <button
              type="button"
              aria-label="Collapse sidebar"
              onClick={toggleSidebar}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-fg-04"
            >
              <Icon name="chevron-left" size={18} />
            </button>
          </div>

          <div className="space-y-3 mt-8">
            <Link
              to="/workshop"
              className="inline-flex text-[48px] kol-display-lg uppercase transition-opacity hover:opacity-80"
              style={{ fontFamily: 'var(--kol-font-family-rgrot-tight)' }}
            >
              Workshop
            </Link>
            <p className="kol-mono-text text-[14px] text-fg-48">
              Tokens, components, and live previews for light &amp; dark parity.
            </p>
          </div>

          <Divider className="w-full my-10" />

          <nav className="flex flex-1 flex-col gap-2 overflow-y-auto pr-1">
            {WORKSHOP_ROUTES.map((route) => renderFlexNode(route))}
          </nav>

          <div className="mt-6 flex items-center gap-4">
            <ThemeToggleButton
              variant="compact"
              isToggled={theme === 'dark'}
              onClick={toggleTheme}
            />
            <button
              type="button"
              className="toggle-switch border-0 bg-surface-primary"
              data-state={isSidebarLocked ? 'on' : 'off'}
              onClick={() => setIsSidebarLocked(!isSidebarLocked)}
              aria-label="Lock sidebar"
              aria-pressed={isSidebarLocked}
            >
              <span className="toggle-switch-indicator" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </aside>
  )
}

export default WorkshopSidebar
