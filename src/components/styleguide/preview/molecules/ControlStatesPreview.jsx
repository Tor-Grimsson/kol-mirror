import { useState, useRef, useEffect } from 'react'
import DesSection from './DesSection'
import DesCard from './DesCard'
import SurfacePreviewGrid from './SurfacePreviewGrid'

const breakpoints = [
  { id: 'mobile', label: 'Mobile', fontSize: '11px', padding: '12px 24px', borderRadius: '20px' },
  { id: 'tablet', label: 'Tablet', fontSize: '12px', padding: '14px 28px', borderRadius: '22px' },
  { id: 'desktop', label: 'Desktop', fontSize: '14px', padding: '16px 32px', borderRadius: '24px' }
]

const sliderBreakpoints = [
  { id: 'mobile', label: 'Mobile', padding: '8px 24px', fontSize: '11px' },
  { id: 'tablet', label: 'Tablet', padding: '8px 24px', fontSize: '12px' },
  { id: 'desktop', label: 'Desktop', padding: '8px 24px', fontSize: '14px' }
]

const dropdownOptions = [
  { label: 'Regular', value: 'regular' },
  { label: 'Medium', value: 'medium' },
  { label: 'Bold', value: 'bold' }
]

function InteractiveDropdown({ breakpoint, value, onChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
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

  const handleSelect = (option) => {
    onChange(option.value)
    setIsOpen(false)
  }

  const currentOption = dropdownOptions.find(opt => opt.value === value) || dropdownOptions[0]

  return (
    <div ref={dropdownRef} className="relative inline-block" style={{ zIndex: isOpen ? 100 : 50 }}>
      <div
        className="border min-w-[180px]"
        style={{
          borderColor: 'var(--kol-border-default)',
          borderRadius: isOpen
            ? `${breakpoint.borderRadius} ${breakpoint.borderRadius} 0 0`
            : breakpoint.borderRadius
        }}
      >
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-full items-center justify-between px-6 transition-colors duration-200"
          style={{
            paddingTop: breakpoint.padding.split(' ')[0],
            paddingBottom: breakpoint.padding.split(' ')[0],
            backgroundColor: 'transparent',
            border: 'none'
          }}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span className="kol-mono-xs" style={{ fontSize: breakpoint.fontSize }}>
            {currentOption?.label}
          </span>
          <svg
            className="ml-auto h-3 w-3 transition-transform duration-300"
            style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
            viewBox="0 0 12 12"
            fill="none"
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

      {isOpen && (
        <div
          className="absolute w-full border border-t-0"
          style={{
            backgroundColor: 'var(--kol-surface-primary)',
            color: 'var(--kol-surface-on-primary)',
            borderColor: 'var(--kol-border-default)',
            top: '100%',
            left: 0,
            marginTop: '-1px',
            borderRadius: `0 0 ${breakpoint.borderRadius} ${breakpoint.borderRadius}`
          }}
          role="listbox"
        >
          <div className="px-6">
            <div className="divider-auto" />
          </div>
          <div className="flex max-h-[300px] flex-col items-start overflow-y-auto py-2">
            {dropdownOptions.map((option) => {
              const isActive = option.value === currentOption?.value
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option)}
                  className="kol-mono-xs relative w-full px-6 py-2 text-left transition-opacity duration-150"
                  style={{
                    backgroundColor: 'transparent',
                    opacity: isActive ? 1 : 0.4
                  }}
                  role="option"
                  aria-selected={isActive}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '1'
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.opacity = '0.4'
                    }
                  }}
                >
                  {isActive && (
                    <span
                      style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '4px',
                        height: '4px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--kol-surface-on-primary)'
                      }}
                    />
                  )}
                  <span style={{ fontSize: breakpoint.fontSize }}>{option.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default function ControlStatesPreview({ nativeOnly = false }) {
  const [dropdownValues, setDropdownValues] = useState({
    'mobile-default': 'regular',
    'mobile-inverse': 'regular',
    'tablet-default': 'regular',
    'tablet-inverse': 'regular',
    'desktop-default': 'regular',
    'desktop-inverse': 'regular'
  })

  const [sliderValues, setSliderValues] = useState({
    'mobile-default': 50,
    'mobile-inverse': 50,
    'tablet-default': 50,
    'tablet-inverse': 50,
    'desktop-default': 50,
    'desktop-inverse': 50
  })

  const [minimalSliderValues, setMinimalSliderValues] = useState({
    'mobile-default': 50,
    'mobile-inverse': 50,
    'tablet-default': 50,
    'tablet-inverse': 50,
    'desktop-default': 50,
    'desktop-inverse': 50
  })

  const renderSliderSet = (tone = 'default') => (
    <div className="space-y-6">
      {sliderBreakpoints.map((bp) => (
        <div key={`${tone}-${bp.id}`} className="space-y-2">
          <div className="kol-mono-xs opacity-60">{bp.label}</div>
          <div className="control-slider gap-3 shadow-none">
            <label className="kol-mono-xs whitespace-nowrap" style={{ fontSize: bp.fontSize }}>
              Weight
            </label>
            <input
              type="range"
              min={0}
              max={100}
              value={sliderValues[`${bp.id}-${tone}`]}
              onChange={(e) => setSliderValues(prev => ({ ...prev, [`${bp.id}-${tone}`]: Number(e.target.value) }))}
              className="slider-black w-full flex-1 cursor-pointer"
            />
            <span className="kol-mono-xs text-right" style={{ fontSize: bp.fontSize }}>
              {Math.round(sliderValues[`${bp.id}-${tone}`])}
            </span>
          </div>
        </div>
      ))}
    </div>
  )

  const renderMinimalSliderSet = (tone = 'default') => (
    <div className="space-y-6">
      {sliderBreakpoints.map((bp) => (
        <div key={`minimal-${tone}-${bp.id}`} className="space-y-2">
          <div className="kol-mono-xs opacity-60">{bp.label}</div>
          <div className="control-slider-minimal gap-3 shadow-none">
            <label className="kol-mono-xs whitespace-nowrap" style={{ fontSize: bp.fontSize }}>
              Weight
            </label>
            <input
              type="range"
              min={0}
              max={100}
              value={minimalSliderValues[`${bp.id}-${tone}`]}
              onChange={(e) => setMinimalSliderValues(prev => ({ ...prev, [`${bp.id}-${tone}`]: Number(e.target.value) }))}
              className="slider-black w-full flex-1 cursor-pointer"
            />
            <span className="kol-mono-xs text-right" style={{ fontSize: bp.fontSize }}>
              {Math.round(minimalSliderValues[`${bp.id}-${tone}`])}
            </span>
          </div>
        </div>
      ))}
    </div>
  )

  const renderDropdownSet = (tone = 'default') => (
    <div className="space-y-6">
      {breakpoints.map((bp) => (
        <div key={`dropdown-${tone}-${bp.id}`} className="space-y-2">
          <div className="kol-mono-xs opacity-60">{bp.label}</div>
          <InteractiveDropdown
            breakpoint={bp}
            value={dropdownValues[`${bp.id}-${tone}`]}
            onChange={(value) => setDropdownValues(prev => ({ ...prev, [`${bp.id}-${tone}`]: value }))}
          />
        </div>
      ))}
    </div>
  )

  return (
    <div className="space-y-8">
      <DesSection
        name="Control States"
        description="Slider and dropdown controls scaled for mobile, tablet, and desktop breakpoints."
        details="All controls reuse shared control-slider tokens with automatic surface adaptation via component variables."
      />

      <div className="space-y-8">
        <div className="space-y-4">
          <DesCard
            name="Slider"
            description="Primary slider style with padded track and bordered container."
            details="Typography: kol-mono-xs · Padding fixed at 8×24 · Border uses --component-border"
          />

          <SurfacePreviewGrid nativeOnly={nativeOnly}>
            <SurfacePreviewGrid.Surface label="Default surface">
              {renderSliderSet('default')}
            </SurfacePreviewGrid.Surface>
            <SurfacePreviewGrid.Surface label="Inverse surface" inverse>
              {renderSliderSet('inverse')}
            </SurfacePreviewGrid.Surface>
          </SurfacePreviewGrid>
        </div>

        <div className="space-y-4">
          <DesCard
            name="Slider (Minimal)"
            description="Compact slider variant for dense molecule layouts."
            details="Removes padding/background; maintains typography scale across breakpoints."
          />

          <SurfacePreviewGrid nativeOnly={nativeOnly}>
            <SurfacePreviewGrid.Surface label="Default surface">
              {renderMinimalSliderSet('default')}
            </SurfacePreviewGrid.Surface>
            <SurfacePreviewGrid.Surface label="Inverse surface" inverse>
              {renderMinimalSliderSet('inverse')}
            </SurfacePreviewGrid.Surface>
          </SurfacePreviewGrid>
        </div>

        <div className="space-y-4">
          <DesCard
            name="Dropdown"
            description="Font weight selector with animated chevron and shared border tokens."
            details="Border radius scales 20px → 24px · Divider uses divider-auto · Options lighten on hover"
          />

          <SurfacePreviewGrid nativeOnly={nativeOnly}>
            <SurfacePreviewGrid.Surface label="Default surface">
              {renderDropdownSet('default')}
            </SurfacePreviewGrid.Surface>
            <SurfacePreviewGrid.Surface label="Inverse surface" inverse>
              {renderDropdownSet('inverse')}
            </SurfacePreviewGrid.Surface>
          </SurfacePreviewGrid>
        </div>
      </div>
    </div>
  )
}
