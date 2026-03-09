import { useState } from 'react'
import DesSection from '../molecules/DesSection'
import DesCard from '../molecules/DesCard'
import SurfacePreviewGrid from '../molecules/SurfacePreviewGrid'

const sliderBreakpoints = [
  { id: 'mobile', label: 'Mobile', padding: '8px 24px', fontSize: '11px' },
  { id: 'tablet', label: 'Tablet', padding: '8px 24px', fontSize: '12px' },
  { id: 'desktop', label: 'Desktop', padding: '8px 24px', fontSize: '14px' }
]

export default function SlidersPreview({ nativeOnly = false }) {
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

  return (
    <div className="space-y-8">
      <DesSection
        name="Sliders"
        description="Range input controls for value selection."
        details="Primary and minimal variants with responsive typography"
      />

      {/* Slider */}
      <DesCard
        name="Slider"
        description="Primary slider style with padded track and bordered container"
      />
      <SurfacePreviewGrid nativeOnly={nativeOnly}>
        <SurfacePreviewGrid.Surface label="Default surface">
          {renderSliderSet('default')}
        </SurfacePreviewGrid.Surface>
        <SurfacePreviewGrid.Surface label="Inverse surface" inverse>
          {renderSliderSet('inverse')}
        </SurfacePreviewGrid.Surface>
      </SurfacePreviewGrid>

      {/* Slider Minimal */}
      <DesCard
        name="Slider (Minimal)"
        description="Compact slider variant for dense layouts"
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
  )
}
