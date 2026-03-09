import { Divider } from '@kol/ui'
import DesSection from './DesSection'
import DesCard from './DesCard'
import SurfacePreviewGrid from './SurfacePreviewGrid'

export default function DividerPreview({ nativeOnly = false }) {
  return (
    <div className="space-y-8">
      <DesSection
        name="Divider"
        description="Horizontal and vertical separator lines using 8% foreground opacity (bg-fg-08)."
        details="Horizontal: 1px height, full width • Vertical: 1px width, auto height with wrapper • Works in flex containers"
        code={'<Divider variant="horizontal" />'}
      />

      <div className="space-y-8">
        <div className="space-y-4">
          <DesCard
            name="Horizontal Divider"
            description="Full-width horizontal line for section separation"
            details="Uses bg-fg-08, h-px (1px), w-full"
          />

          <SurfacePreviewGrid nativeOnly={nativeOnly}>
            <SurfacePreviewGrid.Surface label="Default surface">
              <div className="flex flex-col gap-6 py-8">
                <div className="kol-mono-sm">Content above divider</div>
                <Divider variant="horizontal" />
                <div className="kol-mono-sm">Content below divider</div>
              </div>
            </SurfacePreviewGrid.Surface>
            <SurfacePreviewGrid.Surface label="Inverse surface" inverse>
              <div className="flex flex-col gap-6 py-8">
                <div className="kol-mono-sm">Content above divider</div>
                <Divider variant="horizontal" />
                <div className="kol-mono-sm">Content below divider</div>
              </div>
            </SurfacePreviewGrid.Surface>
          </SurfacePreviewGrid>
        </div>

        <div className="space-y-4">
          <DesCard
            name="Vertical Divider"
            description="Vertical line for inline content separation"
            details="Uses bg-fg-08, width: 1px, height: 100% • Includes wrapper with self-stretch for flex containers"
          />

          <SurfacePreviewGrid nativeOnly={nativeOnly}>
            <SurfacePreviewGrid.Surface label="Default surface">
              <div className="flex flex-row justify-between py-8 min-h-[120px]">
                <div className="kol-mono-sm">Left content</div>
                <Divider variant="vertical" />
                <div className="kol-mono-sm">Right content</div>
              </div>
            </SurfacePreviewGrid.Surface>
            <SurfacePreviewGrid.Surface label="Inverse surface" inverse>
              <div className="flex flex-row justify-between py-8 min-h-[120px]">
                <div className="kol-mono-sm">Left content</div>
                <Divider variant="vertical" />
                <div className="kol-mono-sm">Right content</div>
              </div>
            </SurfacePreviewGrid.Surface>
          </SurfacePreviewGrid>
        </div>
      </div>
    </div>
  )
}
