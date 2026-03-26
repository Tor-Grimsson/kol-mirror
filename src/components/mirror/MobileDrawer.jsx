export default function MobileDrawer({ open, onClose, children }) {
  return (
    <div className="mirror-mobile-drawer">
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        style={{ zIndex: 'var(--kol-z-overlay)' }}
        onClick={onClose}
      />
      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 h-dvh w-72 bg-surface-primary border-r border-fg-08 transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ zIndex: 'var(--kol-z-nav)' }}
      >
        {children}
      </div>
    </div>
  )
}
