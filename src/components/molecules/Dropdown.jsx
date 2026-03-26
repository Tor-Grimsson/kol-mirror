import { useEffect, useRef, useState, useCallback } from 'react'

const SIZE_MAP = {
  sm: { fontSize: 11, paddingY: 12, paddingX: 24, radius: 20, icon: 10 },
  md: { fontSize: 12, paddingY: 14, paddingX: 24, radius: 22, icon: 12 },
  lg: { fontSize: 14, paddingY: 16, paddingX: 24, radius: 24, icon: 14 }
}

const Dropdown = ({
  options = [],
  value,
  onChange,
  size,
  variant = 'default',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)
  const buttonRef = useRef(null)
  const panelRef = useRef(null)
  const [resolvedSize, setResolvedSize] = useState('md')
  const [dropdownWidth, setDropdownWidth] = useState('100px')
  const [openDirection, setOpenDirection] = useState('down')
  const [panelPos, setPanelPos] = useState(null)

  useEffect(() => {
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

    return () => {
      window.removeEventListener('resize', determineSize)
    }
  }, [size])

  // Width management for variants
  useEffect(() => {
    const updateWidth = () => {
      if (typeof window === 'undefined') return

      if (variant === 'minimal') {
        setDropdownWidth(window.innerWidth >= 768 ? '140px' : '100px')
      } else if (variant === 'default') {
        if (window.innerWidth >= 1024) {
          setDropdownWidth('180px')
        } else if (window.innerWidth >= 768) {
          setDropdownWidth('140px')
        } else {
          setDropdownWidth('100px')
        }
      }
    }
    updateWidth()
    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  }, [variant])

  const metrics = SIZE_MAP[resolvedSize] || SIZE_MAP.md

  // Variant-specific styles
  const variantStyles = {
    default: {
      border: '1px solid var(--kol-border-default)',
      borderRadius: isOpen
        ? `${metrics.radius}px ${metrics.radius}px 0 0`
        : `${metrics.radius}px`,
      backgroundColor: 'var(--kol-surface-primary)',
      padding: `${metrics.paddingY}px ${metrics.paddingX}px`
    },
    minimal: {
      border: 'none',
      borderRadius: '0',
      backgroundColor: 'transparent',
      padding: '0',
      height: '24px',
      display: 'flex',
      alignItems: 'center'
    }
  }

  const styles = variantStyles[variant] || variantStyles.default

  // Calculate panel position when opening
  const updatePanelPosition = useCallback(() => {
    if (!buttonRef.current) return
    const rect = buttonRef.current.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom
    const estimatedPanelHeight = Math.min(options.length * 32 + 16, 300)
    const dir = spaceBelow < estimatedPanelHeight ? 'up' : 'down'

    setOpenDirection(dir)
    setPanelPos({
      left: rect.left,
      width: rect.width,
      top: dir === 'down' ? rect.bottom : undefined,
      bottom: dir === 'up' ? window.innerHeight - rect.top : undefined,
    })
  }, [options.length])

  const handleToggle = () => {
    if (!isOpen) {
      updatePanelPosition()
    }
    setIsOpen(!isOpen)
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          panelRef.current && !panelRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!isOpen) return
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const handleSelect = (option) => {
    onChange?.(option.value)
    setIsOpen(false)
  }

  const currentOption = options.find((opt) => opt.value === value) || options[0]

  const panelBorderRadius = variant === 'minimal'
    ? '4px'
    : openDirection === 'down'
      ? `0 0 ${metrics.radius}px ${metrics.radius}px`
      : `${metrics.radius}px ${metrics.radius}px 0 0`

  return (
    <div
      ref={dropdownRef}
      className={`relative block ${className}`}
      style={{
        ...((variant === 'minimal' || variant === 'default') && dropdownWidth && !className.includes('w-full') && {
          width: dropdownWidth,
          minWidth: dropdownWidth
        })
      }}
    >
      <div
        className="w-full"
          style={{
            border: styles.border,
            borderRadius: styles.borderRadius,
            backgroundColor: styles.backgroundColor,
            color: 'var(--kol-surface-on-primary)',
            transition: 'background-color 0.2s, color 0.2s',
            ...(variant === 'minimal' && {
              height: styles.height,
              display: styles.display,
              alignItems: styles.alignItems
            })
          }}
      >
        <button
          ref={buttonRef}
          type="button"
          onClick={handleToggle}
          className="w-full flex items-center justify-between transition-colors duration-200"
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            padding: styles.padding,
            fontSize: `${metrics.fontSize}px`,
            lineHeight: '120%',
            fontFamily: 'var(--kol-font-family-mono)'
          }}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          data-state={isOpen ? 'open' : 'closed'}
        >
          <span className="opacity-100">{currentOption?.label}</span>
          <svg
            className="ml-auto transition-transform duration-300"
            style={{
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              width: `${metrics.icon}px`,
              height: `${metrics.icon}px`
            }}
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="m3 5 3 3 3-3"
              stroke="currentColor"
              strokeWidth="1.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {isOpen && panelPos && (
        <div
          ref={panelRef}
          style={{
            position: 'fixed',
            left: panelPos.left,
            width: panelPos.width,
            top: panelPos.top,
            bottom: panelPos.bottom,
            backgroundColor: variant === 'minimal'
              ? 'var(--kol-surface-primary)'
              : styles.backgroundColor,
            color: 'var(--kol-surface-on-primary)',
            border: variant === 'minimal' ? '1px solid var(--kol-fg-08)' : styles.border,
            borderRadius: panelBorderRadius,
            zIndex: 'var(--kol-z-tooltip)',
          }}
          role="listbox"
        >
          {variant !== 'minimal' && (
            <div style={{ padding: `0 ${metrics.paddingX}px` }}>
              <div
                style={{
                  height: '1px',
                  backgroundColor: 'var(--kol-border-default)'
                }}
              />
            </div>
          )}

          <div className="flex max-h-[300px] flex-col items-start overflow-y-auto py-2">
            {options.map((option) => {
              const isActive = option.value === currentOption?.value
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option)}
                  className="w-full text-left transition-opacity duration-150 relative"
                  style={{
                    backgroundColor: 'transparent',
                    opacity: isActive ? 1 : 0.4,
                    padding: '8px 12px',
                    fontSize: `${metrics.fontSize}px`,
                    lineHeight: '120%',
                    fontFamily: 'var(--kol-font-family-mono)'
                  }}
                  role="option"
                  aria-selected={isActive}
                  onMouseEnter={(event) => {
                    event.currentTarget.style.opacity = '1'
                  }}
                  onMouseLeave={(event) => {
                    if (!isActive) {
                      event.currentTarget.style.opacity = '0.4'
                    }
                  }}
                >
                  {isActive && (
                    <span
                      style={{
                        position: 'absolute',
                        left: '4px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '4px',
                        height: '4px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--kol-surface-on-primary)'
                      }}
                    />
                  )}
                  <span>{option.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default Dropdown
