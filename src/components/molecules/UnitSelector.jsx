/**
 * UnitSelector - Toggle between pixel and rem units
 *
 * @param {string} activeUnit - Current active unit ('px' or 'rem')
 * @param {Function} onUnitChange - Callback when unit changes
 */
export default function UnitSelector({ activeUnit, onUnitChange }) {
  const activeStyle = {
    backgroundColor: 'var(--kol-surface-on-primary)',
    color: 'var(--kol-surface-primary)'
  }

  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => onUnitChange('px')}
        className={`px-4 py-2 kol-helper-uc-xs transition-colors ${
          activeUnit === 'px' ? '' : 'bg-fg-08 text-auto'
        }`}
        style={activeUnit === 'px' ? activeStyle : undefined}
      >
        Pixels
      </button>
      <button
        type="button"
        onClick={() => onUnitChange('rem')}
        className={`px-4 py-2 kol-helper-uc-xs transition-colors ${
          activeUnit === 'rem' ? '' : 'bg-fg-08 text-auto'
        }`}
        style={activeUnit === 'rem' ? activeStyle : undefined}
      >
        Rem
      </button>
    </div>
  )
}
