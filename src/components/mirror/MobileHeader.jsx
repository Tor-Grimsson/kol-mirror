import Icon from '../icons/Icon'

export default function MobileHeader({ onMenuToggle }) {
  return (
    <header
      className="mirror-mobile-header fixed top-0 left-0 right-0 h-12 bg-surface-primary border-b border-fg-08 items-center px-4"
      style={{ zIndex: 'var(--kol-z-nav)' }}
    >
      <button
        className="flex items-center justify-center w-8 h-8 text-fg-64 hover:text-fg-96"
        onClick={onMenuToggle}
      >
        <Icon name="menu" size={20} />
      </button>
      <span className="kol-helper-12 text-fg-64 ml-3">Hall of Mirrors</span>
    </header>
  )
}
