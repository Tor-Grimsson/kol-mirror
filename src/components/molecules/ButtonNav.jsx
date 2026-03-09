import Icon from '../icons/Icon'

export default function ButtonNav({
  direction = 'next',
  onClick,
  children,
  className = ''
}) {
  const isBack = direction === 'back' || direction === 'left'
  const iconRotation = isBack ? '-rotate-90' : 'rotate-90'
  const iconName = isBack ? 'arrow-left' : 'arrow-up'
  const label = children || (isBack ? 'Back' : 'Next')

  return (
    <button
      onClick={onClick}
      className={`btn-nav inline-flex items-center justify-center gap-2 w-fit cursor-pointer ${className}`}
    >
      {isBack && (
        <span className="inline-flex items-center h-[12px]">
          <Icon name={iconName} size={12} className={isBack ? '' : iconRotation} />
        </span>
      )}
      <span className="kol-helper-s">{label}</span>
      {!isBack && (
        <span className="inline-flex items-center h-[12px]">
          <Icon name={iconName} size={12} className={iconRotation} />
        </span>
      )}
    </button>
  )
}
