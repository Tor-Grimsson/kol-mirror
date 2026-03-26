import { useState } from 'react'
import { useMirrorState } from '../../hooks/useMirrorState'
import MobileHeader from './MobileHeader'
import MobileDrawer from './MobileDrawer'
import MirrorSidebar from './MirrorSidebar'
import MirrorViewport from './MirrorViewport'

export default function MirrorPlayground() {
  const state = useMirrorState()
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="flex h-dvh w-full bg-surface-primary overflow-hidden">
      {/* Mobile header */}
      <MobileHeader onMenuToggle={() => setDrawerOpen(true)} />

      {/* Mobile drawer */}
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <MirrorSidebar state={state} onClose={() => setDrawerOpen(false)} />
      </MobileDrawer>

      {/* Desktop sidebar — visible on non-touch screens ≥768px */}
      <aside className="mirror-sidebar-desktop w-72 lg:w-80 flex-shrink-0 border-r border-fg-08">
        <MirrorSidebar state={state} />
      </aside>

      {/* Main viewport */}
      <main className="mirror-viewport flex-1 relative">
        <MirrorViewport state={state} />
      </main>
    </div>
  )
}
