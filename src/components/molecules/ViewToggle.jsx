import Icon from '../icons/Icon'

/**
 * ViewToggle Component
 *
 * Toggle button group for switching between different view modes
 * Supports both text labels and icon variants
 *
 * @param {string} viewMode - Current active view mode
 * @param {function} onViewChange - Callback when view mode changes
 * @param {string} variant - Display variant: 'text' or 'icon' (default: 'text')
 * @param {Array} options - Array of view options [{value: 'card', label: 'Card view', icon: 'icon-name'}, ...]
 * @param {string} className - Additional classes (optional)
 */
const ViewToggle = ({
  viewMode,
  onViewChange,
  variant = 'text',
  options = [
    { value: 'grid', label: 'Grid view', icon: 'view-grid' },
    { value: 'list', label: 'List view', icon: 'view-list' }
  ],
  className = ''
}) => {
  const isIconVariant = variant === 'icon'

  const containerClasses = isIconVariant
    ? `flex items-center gap-0 bg-container-elevated rounded-full p-1 border border-fg-16 ${className}`
    : `flex gap-2 ${className}`

  const buttonClasses = (isActive) => {
    if (isIconVariant) {
      return `inline-flex items-center justify-center p-3 rounded-full transition-all duration-200 ${
        isActive
          ? 'bg-fg-08 text-auto'
          : 'text-auto hover:bg-fg-04'
      }`
    }
    return `px-4 py-2 kol-mono-xs rounded transition-colors ${
      isActive
        ? 'bg-surface-secondary text-auto'
        : 'text-fg-64 hover:text-auto'
    }`
  }

  return (
    <div className={containerClasses}>
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onViewChange(option.value)}
          className={buttonClasses(viewMode === option.value)}
          aria-label={option.label}
          aria-pressed={viewMode === option.value}
          title={option.label}
        >
          {isIconVariant && option.icon ? (
            <Icon name={option.icon} size={20} />
          ) : (
            option.label
          )}
        </button>
      ))}
    </div>
  )
}

export default ViewToggle
