import React from 'react'
import Icon from '../icons/Icon'

const SIZE_MAP = {
  sm: { fontSize: 11, paddingY: 12, paddingX: 24, icon: 12 },
  md: { fontSize: 12, paddingY: 14, paddingX: 24, icon: 14 },
  lg: { fontSize: 14, paddingY: 16, paddingX: 24, icon: 16 }
}

const Input = ({
  type = 'text',
  placeholder = '',
  value,
  onChange,
  size,
  uppercase = false,
  iconLeft,
  iconSize = null,
  className = '',
  style = {},
  ...props
}) => {
  const [resolvedSize, setResolvedSize] = React.useState('md')

  React.useEffect(() => {
    const determineSize = () => {
      if (size) {
        setResolvedSize(size)
        return
      }

      if (typeof window === 'undefined') {
        setResolvedSize('md')
        return
      }

      if (window.innerWidth >= 1024) {
        setResolvedSize('lg')
      } else if (window.innerWidth >= 768) {
        setResolvedSize('md')
      } else {
        setResolvedSize('sm')
      }
    }

    determineSize()
    window.addEventListener('resize', determineSize)
    return () => window.removeEventListener('resize', determineSize)
  }, [size])

  const metrics = SIZE_MAP[resolvedSize] || SIZE_MAP.md
  const sizeClass =
    resolvedSize === 'sm'
      ? 'input-sm'
      : resolvedSize === 'lg'
      ? 'input-lg'
      : 'input-md'
  const caseClass = uppercase ? 'uppercase' : ''

  const combinedClass = `input-outline ${sizeClass} ${caseClass} kol-mono-text ${className}`.trim()

  const inlineStyle = {
    fontSize: `${metrics.fontSize}px`,
    lineHeight: '120%',
    padding: `${metrics.paddingY}px ${metrics.paddingX}px`,
    ...style
  }

  const resolvedIconSize = iconLeft ? (iconSize ?? metrics.icon) : null

  if (iconLeft && resolvedIconSize) {
    inlineStyle.paddingLeft = metrics.paddingX + resolvedIconSize + 12
  }

  return (
    <div className="relative inline-flex w-full items-center">
      {iconLeft && (
        <span
          className="absolute flex items-center text-auto opacity-50 pointer-events-none"
          style={{
            left: `${metrics.paddingX}px`,
            top: '50%',
            transform: 'translateY(-50%)'
          }}
        >
          <Icon name={iconLeft} size={resolvedIconSize ?? 12} />
        </span>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={combinedClass}
        style={inlineStyle}
        {...props}
      />
    </div>
  )
}

export default Input
