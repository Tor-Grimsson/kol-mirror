const paddingMap = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8'
}

const GuideCard = ({ padding = 'md', border = true, rounded = true, className = '', children }) => {
  const paddingClass = paddingMap[padding] ?? paddingMap.md
  const borderClass = border ? 'border' : ''
  const roundedClass = rounded ? 'rounded-3xl' : ''
  return (
    <div
      className={`surface-panel ${roundedClass} ${borderClass} ${paddingClass} ${className}`.trim()}
      style={border ? { borderColor: 'var(--surface-border)' } : {}}
    >
      {children}
    </div>
  )
}

export default GuideCard
