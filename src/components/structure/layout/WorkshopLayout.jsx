import { useState, useEffect, Suspense } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { StyleguideExpansionProvider } from '../WorkshopExpansionContext'
import WorkshopSidebar from './WorkshopSidebar'
// Helper to check if current path is a main page (not a sub-page)
const isMainPage = (path) => {
  const mainPaths = [
    '/workshop',
    '/workshop/foundations',
    '/workshop/components',
    '/workshop/apparat',
    '/workshop/chess',
    '/workshop/docs',
    '/workshop/design-system/documentation'
  ]
  return mainPaths.includes(path)
}

const WorkshopLayout = ({ variant = 'default' }) => {
  const location = useLocation()
  const normalizedPath = location.pathname.replace(/\/$/, '')

  const [expandedItems, setExpandedItems] = useState({})
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isSidebarLocked, setIsSidebarLocked] = useState(false)
  const [viewportWidth, setViewportWidth] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1440
  )

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    const handleResize = () => setViewportWidth(window.innerWidth)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const collapsedWidth = viewportWidth <= 490 ? 72 : 96
  const forceCollapsed = viewportWidth < 700
  // On mobile (forceCollapsed), sidebar is fixed, so main content needs margin instead of grid column
  const layoutColumns = forceCollapsed
    ? 'minmax(0,1fr)'
    : `${isCollapsed ? collapsedWidth : 304}px minmax(0,1fr)`

  const isApparatView =
    normalizedPath.startsWith('/workshop/apparat/') || normalizedPath === '/workshop/apparat'
  const isCompactLayout = variant === 'compact' || isApparatView

  const contentClass = isCompactLayout
    ? 'flex flex-col pb-10 pt-6'
    : 'flex flex-col px-4 pb-16 pt-10 sm:px-8 lg:px-12'

  return (
    <div className="min-h-screen w-full bg-surface-primary text-auto">
      <div
        className="mx-auto grid w-full"
        style={{ gridTemplateColumns: layoutColumns, minHeight: '100dvh' }}
      >
        <WorkshopSidebar
          isCollapsed={forceCollapsed ? true : isCollapsed}
          setIsCollapsed={forceCollapsed ? () => {} : setIsCollapsed}
          expandedItems={expandedItems}
          setExpandedItems={setExpandedItems}
          isSidebarLocked={isSidebarLocked}
          setIsSidebarLocked={setIsSidebarLocked}
          forceCollapsed={forceCollapsed}
          collapsedWidth={collapsedWidth}
          enableShelf={forceCollapsed || isCollapsed}
          normalizedPath={normalizedPath}
        />

        <main
          className={isCompactLayout ? 'flex-1' : 'flex-1 space-y-10'}
          style={forceCollapsed ? { marginLeft: `${collapsedWidth}px` } : undefined}
        >
          <div className="flex w-full flex-col overflow-x-hidden">
            <StyleguideExpansionProvider>
              <div className={contentClass}>
                <Suspense fallback={<div className="flex items-center justify-center p-12 text-fg-48">Loading...</div>}>
                  <Outlet />
                </Suspense>
              </div>
            </StyleguideExpansionProvider>
          </div>
        </main>
      </div>
    </div>
  )
}

export default WorkshopLayout
