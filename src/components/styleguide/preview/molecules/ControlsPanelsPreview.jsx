import { useState } from 'react'
import DesSection from './DesSection'
import DesCard from './DesCard'
import SurfacePreviewGrid from './SurfacePreviewGrid'
import { Slider, PlayPauseButton } from '@kol/ui'
import WorkControlsPanel from './WorkControlsPanel'

const breakpoints = [
  { id: 'mobile', label: 'Mobile', padding: '8px 24px', gap: '12px', playPauseSize: 28, sliderValue: 340, fontSize: '11px' },
  { id: 'tablet', label: 'Tablet', padding: '8px 24px', gap: '16px', playPauseSize: 32, sliderValue: 470, fontSize: '12px' },
  { id: 'desktop', label: 'Desktop', padding: '8px 24px', gap: '20px', playPauseSize: 40, sliderValue: 620, fontSize: '14px' }
]

export default function ControlsPanelsPreview() {
  const [playStates, setPlayStates] = useState({
    mobile: false,
    tablet: false,
    desktop: false,
    'mobile-inverse': false,
    'tablet-inverse': false,
    'desktop-inverse': false
  })

  const [playPauseSliderValues, setPlayPauseSliderValues] = useState({
    'mobile-default': 340,
    'mobile-inverse': 340,
    'tablet-default': 470,
    'tablet-inverse': 470,
    'desktop-default': 620,
    'desktop-inverse': 620
  })

  const togglePlayPause = (breakpoint) => {
    setPlayStates(prev => ({
      ...prev,
      [breakpoint]: !prev[breakpoint]
    }))
  }

  return (
    <div className="space-y-8">
      <DesSection
        name="Controls Panels"
        description="Interactive control panel molecules."
        details="Responsive layouts with sliders and toggles"
      />

      <DesCard
        name="Play/Pause Slider Panel"
        description="Variable font animation control with play/pause toggle and weight slider"
      />
      <SurfacePreviewGrid>
        <SurfacePreviewGrid.Surface label="Default surface">
          <div className="flex flex-col gap-6">
            {breakpoints.map((bp) => (
              <div key={bp.id} className="space-y-2">
                <div className="kol-mono-xs opacity-60">{bp.label}</div>
                <div className="flex items-center gap-4">
                  <PlayPauseButton
                    isPlaying={playStates[bp.id]}
                    onToggle={() => togglePlayPause(bp.id)}
                    size={bp.playPauseSize}
                  />
                  <Slider
                    min={300}
                    max={900}
                    value={playPauseSliderValues[`${bp.id}-default`]}
                    onChange={(value) => setPlayPauseSliderValues(prev => ({ ...prev, [`${bp.id}-default`]: value }))}
                    className="w-full"
                    variant="minimal"
                    fontSize={bp.fontSize}
                  />
                </div>
              </div>
            ))}
          </div>
        </SurfacePreviewGrid.Surface>

        <SurfacePreviewGrid.Surface label="Inverse surface" inverse>
          <div className="flex flex-col gap-6">
            {breakpoints.map((bp) => (
              <div key={bp.id} className="space-y-2">
                <div className="kol-mono-xs opacity-60">{bp.label}</div>
                <div className="flex items-center gap-4">
                  <PlayPauseButton
                    isPlaying={playStates[`${bp.id}-inverse`]}
                    onToggle={() => togglePlayPause(`${bp.id}-inverse`)}
                    size={bp.playPauseSize}
                  />
                  <Slider
                    min={300}
                    max={900}
                    value={playPauseSliderValues[`${bp.id}-inverse`]}
                    onChange={(value) => setPlayPauseSliderValues(prev => ({ ...prev, [`${bp.id}-inverse`]: value }))}
                    className="w-full"
                    variant="minimal"
                    fontSize={bp.fontSize}
                  />
                </div>
              </div>
            ))}
          </div>
        </SurfacePreviewGrid.Surface>
      </SurfacePreviewGrid>

      <DesCard
        name="Work Controls Panel"
        description="Complex control panel with 8 sliders for animation controls"
      />
      <SurfacePreviewGrid>
        <SurfacePreviewGrid.Surface label="Default surface">
          <WorkControlsPanel />
        </SurfacePreviewGrid.Surface>

        <SurfacePreviewGrid.Surface label="Inverse surface" inverse>
          <WorkControlsPanel />
        </SurfacePreviewGrid.Surface>
      </SurfacePreviewGrid>
    </div>
  )
}
