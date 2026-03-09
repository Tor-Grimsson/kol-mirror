import { useState } from 'react'
import { Icon } from '@kol/ui'
import DesSection from './DesSection'
import DesCard from './DesCard'
import SurfacePreviewGrid from './SurfacePreviewGrid'

const breakpoints = [
  { id: 'mobile', label: 'Mobile', fontSize: '14px', iconSize: 14, padding: '8px 20px', iconOnlyPadding: '8px' },
  { id: 'tablet', label: 'Tablet', fontSize: '16px', iconSize: 16, padding: '12px 28px', iconOnlyPadding: '12px' },
  { id: 'desktop', label: 'Desktop', fontSize: '18px', iconSize: 18, padding: '14px 32px', iconOnlyPadding: '14px' }
]

export default function ThemeToggleRemakePreview() {
  const [remakeTheme, setRemakeTheme] = useState('light')

  const toggleRemake = () => {
    setRemakeTheme(prev => (prev === 'dark' ? 'light' : 'dark'))
  }

  const renderBreakpointButtons = (variant) => (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {breakpoints.map((bp) => (
        <div key={bp.id} className="space-y-2">
          <div className="kol-mono-xs opacity-60">{bp.label}</div>
          {variant === 'text' ? (
            <button
              type="button"
              onClick={toggleRemake}
              style={{
                fontSize: bp.fontSize,
                padding: bp.padding,
                textTransform: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                width: '100%'
              }}
              className={`btn-outline theme-toggle-horizontal ${remakeTheme === 'dark' ? 'toggled' : ''}`}
            >
              {remakeTheme === 'dark' ? 'Dark Mode' : 'Light Mode'}
              <span
                className="icon-swap-container"
                style={{
                  position: 'relative',
                  display: 'inline-flex',
                  width: `${bp.iconSize}px`,
                  height: `${bp.iconSize}px`,
                  overflow: 'hidden'
                }}
              >
                <Icon
                  name="theme-toggle"
                  size={bp.iconSize}
                  style={{ position: 'absolute', transition: 'transform 0.3s ease' }}
                />
                <Icon
                  name="theme-toggle"
                  size={bp.iconSize}
                  style={{ position: 'absolute', transition: 'transform 0.3s ease' }}
                />
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={toggleRemake}
              style={{
                padding: bp.iconOnlyPadding,
                border: 'none',
                background: 'none',
                color: 'var(--kol-surface-on-primary)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              className={`theme-toggle-horizontal ${remakeTheme === 'dark' ? 'toggled' : ''}`}
              aria-label="Toggle theme"
            >
              <span
                className="icon-swap-container"
                style={{
                  position: 'relative',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: `${bp.iconSize}px`,
                  height: `${bp.iconSize}px`,
                  overflow: 'hidden'
                }}
              >
                <Icon
                  name="theme-toggle"
                  size={bp.iconSize}
                  style={{ position: 'absolute', transition: 'transform 0.3s ease' }}
                />
                <Icon
                  name="theme-toggle"
                  size={bp.iconSize}
                  style={{ position: 'absolute', transition: 'transform 0.3s ease' }}
                />
              </span>
            </button>
          )}
        </div>
      ))}
    </div>
  )

  const renderCard = ({ name, description, details, variant }) => (
    <div className="space-y-4" key={variant}>
      <DesCard
        name={name}
        description={description}
        details={details}
      />

      <SurfacePreviewGrid>
        <SurfacePreviewGrid.Surface label="Default surface">
          {renderBreakpointButtons(variant)}
        </SurfacePreviewGrid.Surface>
        <SurfacePreviewGrid.Surface label="Inverse surface" inverse>
          {renderBreakpointButtons(variant)}
        </SurfacePreviewGrid.Surface>
      </SurfacePreviewGrid>
    </div>
  )

  const cards = [
    {
      variant: 'text',
      name: 'Theme Toggle (Text)',
      description: 'Button variant with label and animated icon for light/dark switching.',
      details: 'Responsive paddings: mobile 8×20px · tablet 12×28px · desktop 14×32px'
    },
    {
      variant: 'icon',
      name: 'Theme Toggle (Icon Only)',
      description: 'Compact icon-only treatment for toolbars and dense layouts.',
      details: 'Responsive paddings: mobile/tablet/desktop 8/12/14px square'
    }
  ]

  return (
    <div className="space-y-8">
      <DesSection
        name="Theme Toggle"
        description="Responsive button implementations that reuse shared Button variants with animated icons."
        details="Variant: outline • Icon: theme-toggle • Hover matches active surface"
      />

      {cards.map(renderCard)}
    </div>
  )
}
