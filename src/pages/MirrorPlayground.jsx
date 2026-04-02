import { useState, useRef, useCallback, useEffect } from 'react'
import { useMirrorState } from '../hooks/useMirrorState'
import MobileHeader from '../components/mirror/MobileHeader'
import MobileDrawer from '../components/mirror/MobileDrawer'
import MirrorSidebar from '../components/mirror/MirrorSidebar'
import MirrorViewport from '../components/mirror/MirrorViewport'

export default function MirrorPlayground() {
  const state = useMirrorState()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(null)
  const dragging = useRef(false)
  const startX = useRef(0)
  const startW = useRef(0)
  const asideRef = useRef(null)

  const getDefaultWidth = useCallback(() => {
    return window.innerWidth >= 1024 ? 320 : 288
  }, [])

  const onPointerDown = useCallback((e) => {
    e.preventDefault()
    dragging.current = true
    startX.current = e.clientX
    startW.current = sidebarWidth ?? getDefaultWidth()
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }, [sidebarWidth, getDefaultWidth])

  useEffect(() => {
    const onPointerMove = (e) => {
      if (!dragging.current) return
      const defaultW = getDefaultWidth()
      const delta = e.clientX - startX.current
      const next = Math.max(defaultW, Math.min(defaultW * 3, startW.current + delta))
      setSidebarWidth(next)
    }
    const onPointerUp = () => {
      if (!dragging.current) return
      dragging.current = false
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
    }
  }, [getDefaultWidth])

  return (
    <div className="flex h-dvh w-full bg-surface-primary overflow-hidden">
      {/* Mobile header */}
      <MobileHeader onMenuToggle={() => setDrawerOpen(true)} />

      {/* Mobile drawer */}
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <MirrorSidebar state={state} onClose={() => setDrawerOpen(false)} />
      </MobileDrawer>

      {/* Desktop sidebar — visible on non-touch screens ≥768px */}
      <aside
        ref={asideRef}
        className="mirror-sidebar-desktop flex-shrink-0 border-r border-fg-08 relative"
        style={sidebarWidth ? { width: `${sidebarWidth}px` } : undefined}
      >
        {!sidebarWidth && <style>{`.mirror-sidebar-desktop { width: 18rem; } @media (min-width: 1024px) { .mirror-sidebar-desktop { width: 20rem; } }`}</style>}
        <MirrorSidebar state={state} />
        {/* Drag handle — below channel area */}
        <div
          className="absolute bottom-0 right-0 cursor-col-resize"
          style={{ width: '5px', height: '50%' }}
          onPointerDown={onPointerDown}
          onDoubleClick={() => setSidebarWidth(null)}
        />
      </aside>

      {/* Main viewport */}
      <main className="mirror-viewport flex-1 relative">
        <MirrorViewport state={state} />
      </main>
    </div>
  )
}
