import { useState } from 'react'
import { PlayPauseButton } from '@kol/ui'
import DesSection from './DesSection'
import DesCard from './DesCard'
import SurfacePreviewGrid from './SurfacePreviewGrid'

const breakpoints = [
  { id: 'mobile', label: 'Mobile', size: 28 },
  { id: 'tablet', label: 'Tablet', size: 32 },
  { id: 'desktop', label: 'Desktop', size: 40 }
]

export default function PlayPausePreview({ nativeOnly = false }) {
  const [isPlaying1, setIsPlaying1] = useState(false)

  return (
    <div className="space-y-8">
      <DesSection
        name="Play/Pause Button"
        description="Toggle button for play/pause states. Shows pause icon when playing, play icon when paused."
        details="Uses CSS borders for icons • bg-current for color inheritance • Accessible with aria-label"
        code={'<PlayPauseButton isPlaying={isPlaying} onToggle={() => setIsPlaying(!isPlaying)} size={28} />'}
      />

      <div className="space-y-4">
        <DesCard
          name="Responsive Sizing"
          description="Button scales across breakpoints from mobile to desktop"
          details="Mobile: 28px • Tablet: 32px • Desktop: 40px"
        />

        <SurfacePreviewGrid nativeOnly={nativeOnly}>
          <SurfacePreviewGrid.Surface label="Default surface">
            <div className="space-y-6 py-8">
              <div className="flex gap-6 items-start">
                {breakpoints.map((bp) => (
                  <div key={bp.id} className="flex-1 space-y-2">
                    <div className="kol-mono-xs opacity-60">{bp.label}</div>
                    <PlayPauseButton
                      isPlaying={isPlaying1}
                      onToggle={() => setIsPlaying1(!isPlaying1)}
                      size={bp.size}
                      className="text-auto"
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-6 items-start">
                {breakpoints.map((bp) => (
                  <div key={`alt-${bp.id}`} className="flex-1 space-y-2">
                    <div className="kol-mono-xs opacity-60">{bp.label}</div>
                    <PlayPauseButton
                      isPlaying={isPlaying1}
                      onToggle={() => setIsPlaying1(!isPlaying1)}
                      size={bp.size}
                      className="text-auto bg-fg-01 border border-fg-08 rounded-full"
                    />
                  </div>
                ))}
              </div>
            </div>
          </SurfacePreviewGrid.Surface>
          <SurfacePreviewGrid.Surface label="Inverse surface" inverse>
            <div className="space-y-6 py-8">
              <div className="flex gap-6 items-start">
                {breakpoints.map((bp) => (
                  <div key={bp.id} className="flex-1 space-y-2">
                    <div className="kol-mono-xs opacity-60">{bp.label}</div>
                    <PlayPauseButton
                      isPlaying={isPlaying1}
                      onToggle={() => setIsPlaying1(!isPlaying1)}
                      size={bp.size}
                      className="text-auto"
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-6 items-start">
                {breakpoints.map((bp) => (
                  <div key={`alt-${bp.id}`} className="flex-1 space-y-2">
                    <div className="kol-mono-xs opacity-60">{bp.label}</div>
                    <PlayPauseButton
                      isPlaying={isPlaying1}
                      onToggle={() => setIsPlaying1(!isPlaying1)}
                      size={bp.size}
                      className="text-auto bg-fg-01 border border-fg-08 rounded-full"
                    />
                  </div>
                ))}
              </div>
            </div>
          </SurfacePreviewGrid.Surface>
        </SurfacePreviewGrid>
      </div>

    </div>
  )
}
