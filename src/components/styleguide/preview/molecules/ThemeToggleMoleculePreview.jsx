import { useState } from 'react'
import { ThemeToggleButton, Icon } from '@kol/ui'
import DesSection from './DesSection'
import DesCard from './DesCard'
import SurfacePreviewGrid from './SurfacePreviewGrid'

const breakpoints = [
  { id: 'mobile', label: 'Mobile', fontSize: '14px', padding: '8px 20px', iconOnlyPadding: '8px', iconSize: 14 },
  { id: 'tablet', label: 'Tablet', fontSize: '16px', padding: '12px 28px', iconOnlyPadding: '12px', iconSize: 16 },
  { id: 'desktop', label: 'Desktop', fontSize: '18px', padding: '14px 32px', iconOnlyPadding: '14px', iconSize: 18 }
]

const renderButtonRemake = ({ themeState, toggleTheme }) => (
  <div className="space-y-6">
    <div className="space-y-3">
      <div className="kol-mono-xs uppercase">With label</div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {breakpoints.map((bp) => (
          <div key={`text-${bp.id}`} className="space-y-2">
            <div className="kol-mono-xs opacity-60">{bp.label}</div>
            <button
              type="button"
              onClick={toggleTheme}
              className={`btn-outline theme-toggle-horizontal ${themeState === 'dark' ? 'toggled' : ''}`}
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
            >
              {themeState === 'dark' ? 'Dark Mode' : 'Light Mode'}
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
          </div>
        ))}
      </div>
    </div>

    <div className="space-y-3">
      <div className="kol-mono-xs uppercase">Icon only</div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {breakpoints.map((bp) => (
          <div key={`icon-${bp.id}`} className="space-y-2">
            <div className="kol-mono-xs opacity-60">{bp.label}</div>
            <button
              type="button"
              onClick={toggleTheme}
              className={`theme-toggle-horizontal ${themeState === 'dark' ? 'toggled' : ''}`}
              aria-label="Toggle theme"
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
          </div>
        ))}
      </div>
    </div>
  </div>
)

export default function ThemeToggleMoleculePreview() {
  const [defaultToggled, setDefaultToggled] = useState(false)
  const [compactToggled, setCompactToggled] = useState(false)
  const [remakeTheme, setRemakeTheme] = useState('light')

  const toggleRemake = () => {
    setRemakeTheme(prev => (prev === 'dark' ? 'light' : 'dark'))
  }

  return (
    <div className="space-y-8">
      <DesSection
        name="Theme Toggle"
        description="Official ThemeToggleButton component plus button-based remix for molecule layouts."
        details="Variants: default + compact • Animates icon swap • Syncs with useTheme hook"
      />

      <div className="space-y-8">
        <div className="space-y-4">
          <DesCard
            name="ThemeToggleButton Variants"
            description="Two button variants driven by @kol/ui with controlled toggled state."
            details="Pass isToggled + onClick to control state; default width matches icon size"
          />

          <SurfacePreviewGrid>
            <SurfacePreviewGrid.Surface label="Default surface">
              <div className="flex flex-wrap gap-6">
                <ThemeToggleButton
                  variant="default"
                  isToggled={defaultToggled}
                  onClick={() => setDefaultToggled(!defaultToggled)}
                />
                <ThemeToggleButton
                  variant="compact"
                  isToggled={compactToggled}
                  onClick={() => setCompactToggled(!compactToggled)}
                />
              </div>
            </SurfacePreviewGrid.Surface>
            <SurfacePreviewGrid.Surface label="Inverse surface" inverse>
              <div className="flex flex-wrap gap-6">
                <ThemeToggleButton
                  variant="default"
                  isToggled={!defaultToggled}
                  onClick={() => setDefaultToggled(!defaultToggled)}
                />
                <ThemeToggleButton
                  variant="compact"
                  isToggled={!compactToggled}
                  onClick={() => setCompactToggled(!compactToggled)}
                />
              </div>
            </SurfacePreviewGrid.Surface>
          </SurfacePreviewGrid>
        </div>

        <div className="space-y-4">
          <DesCard
            name="Button-based Remake"
            description="Outline buttons reusing shared icon animation tokens for custom layouts."
            details="Pairs with responsive padding tokens for text + icon-only variations."
          />

          <SurfacePreviewGrid>
            <SurfacePreviewGrid.Surface label="Default surface">
              {renderButtonRemake({ themeState: remakeTheme, toggleTheme: toggleRemake })}
            </SurfacePreviewGrid.Surface>
            <SurfacePreviewGrid.Surface label="Inverse surface" inverse>
              {renderButtonRemake({ themeState: remakeTheme, toggleTheme: toggleRemake })}
            </SurfacePreviewGrid.Surface>
          </SurfacePreviewGrid>
        </div>
      </div>
    </div>
  )
}
