import { useState } from 'react'
import Button from '../../atoms/Button'
import DesSection from './DesSection'
import DesCard from './DesCard'
import SurfacePreviewGrid from './SurfacePreviewGrid'

const breakpoints = [
  { id: 'mobile', label: 'Mobile', fontSize: '11px', buttonFontSize: '14px', buttonPadding: '8px 16px' },
  { id: 'tablet', label: 'Tablet', fontSize: '12px', buttonFontSize: '16px', buttonPadding: '12px 24px' },
  { id: 'desktop', label: 'Desktop', fontSize: '14px', buttonFontSize: '18px', buttonPadding: '14px 28px' }
]

const controlGroups = [
  { id: 'intensity', label: 'Intensity', min: 0, max: 400, defaultValue: 200 },
  { id: 'frequency', label: 'Frequency', min: 10, max: 200, defaultValue: 100 },
  { id: 'breathTime', label: 'Breath Time', min: 1, max: 10, defaultValue: 3 },
  { id: 'breathAmp', label: 'Breath Amp', min: 0, max: 40, defaultValue: 10 },
  { id: 'separation', label: 'Separation', min: 0, max: 60, defaultValue: 16 },
  { id: 'globalScale', label: 'Global Scale', min: 0, max: 100, defaultValue: 50 },
  { id: 'globalTime', label: 'Global Time', min: 0, max: 100, defaultValue: 100 },
  { id: 'circles', label: 'Circles', min: 1, max: 8, defaultValue: 1 }
]

export default function MoleculesPreview() {
  const [quantizeMode, setQuantizeMode] = useState('OFF')
  const [intensityMode, setIntensityMode] = useState('A')
  const [frequencyMode, setFrequencyMode] = useState('A')

  const renderControlPanel = (bp) => (
    <div className="space-y-3">
      <div className="kol-mono-xs opacity-60">{bp.label}</div>
      <div className="space-y-2">
        {controlGroups.map((group) => (
          <div key={`${bp.id}-${group.id}`} className="control-slider-minimal grid grid-cols-[auto_1fr_auto] items-center gap-3 shadow-none">
            <label className="kol-mono-xs whitespace-nowrap" style={{ fontSize: bp.fontSize }}>
              {group.label}
              {group.id === 'intensity' && (
                <button
                  type="button"
                  className="ml-2 kol-mono-xxs uppercase tracking-[0.2em]"
                  onClick={() => setIntensityMode(intensityMode === 'A' ? 'B' : 'A')}
                >
                  [{intensityMode}]
                </button>
              )}
              {group.id === 'frequency' && (
                <button
                  type="button"
                  className="ml-2 kol-mono-xxs uppercase tracking-[0.2em]"
                  onClick={() => setFrequencyMode(frequencyMode === 'A' ? 'B' : 'A')}
                >
                  [{frequencyMode}]
                </button>
              )}
            </label>
            <input
              type="range"
              min={group.min}
              max={group.max}
              defaultValue={group.defaultValue}
              className="slider-black w-full"
            />
            <span className="kol-mono-xs text-right" style={{ fontSize: bp.fontSize }}>
              {group.defaultValue}
            </span>
          </div>
        ))}
        <div className="flex items-center justify-between">
          <button
            type="button"
            className="kol-mono-xs uppercase tracking-[0.2em]"
            onClick={() => setQuantizeMode(quantizeMode === 'OFF' ? 'ON' : 'OFF')}
          >
            Quantize [{quantizeMode}]
          </button>
          <Button
            variant="control"
            style={{ fontSize: bp.buttonFontSize, padding: bp.buttonPadding }}
          >
            Hide Controls
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-8">
      <DesSection
        name="Control Panel Molecule"
        description="Interactive control layout combining sliders, toggles, and responsive buttons."
        details="Uses control-slider tokens with breakpoint-aware typography and spacing."
      />

      <DesCard
        name="Control Stack"
        description="Primary molecule used across foundry preview panels."
        code="<FontControlsPanel intensity={value} quantize={mode} />"
      />

      <SurfacePreviewGrid>
        <SurfacePreviewGrid.Surface label="Default surface">
          <div className="space-y-6">
            {breakpoints.map(renderControlPanel)}
          </div>
        </SurfacePreviewGrid.Surface>
        <SurfacePreviewGrid.Surface label="Inverse surface" inverse>
          <div className="space-y-6">
            {breakpoints.map(renderControlPanel)}
          </div>
        </SurfacePreviewGrid.Surface>
      </SurfacePreviewGrid>
    </div>
  )
}
