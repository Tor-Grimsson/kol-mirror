import DesSection from './DesSection'
import DesCard from './DesCard'
import SurfacePreviewGrid from './SurfacePreviewGrid'

const sizeVariants = [
  { id: 'sm', label: 'Small', fontSize: '10px', padding: '4px 16px' },
  { id: 'md', label: 'Medium', fontSize: '12px', padding: '4px 16px' },
  { id: 'lg', label: 'Large', fontSize: '14px', padding: '4px 16px' }
]

const interactiveVariants = [
  { id: 'tag-control', label: 'Tag Control', className: 'tag-control' },
  { id: 'tag-control-inverse', label: 'Tag Control Inverse', className: 'tag-control-inverse' }
]

const pillVariants = [
  { id: 'pill-inverse', label: 'Pill Inverse', className: 'pill-inverse' },
  { id: 'pill-outline', label: 'Pill Outline', className: 'pill-outline' },
  { id: 'pill-subtle', label: 'Pill Subtle', className: 'pill-subtle' }
]

const renderSizeStack = (variant) => (
  <div className="space-y-3" key={variant.id}>
    <div className="kol-mono-xs uppercase">{variant.label}</div>
    <div className="flex gap-6 items-start">
      {sizeVariants.map((size) => (
        <div key={`${variant.id}-${size.id}`} className="flex-1 space-y-2">
          <div className="kol-mono-xs opacity-60">{size.label}</div>
          <span
            className={variant.className}
            style={{
              fontSize: size.fontSize,
              padding: size.padding
            }}
          >
            Tag
          </span>
        </div>
      ))}
    </div>
  </div>
)

export default function TagStatesPreview({ nativeOnly = false }) {
  return (
    <div className="space-y-8">
      <DesSection
        name="Tags & Pills"
        description="Interactive tag controls and static pill styles with size variants."
        details="Typography: kol-mono • Fixed padding 4×16 • Three size variants: sm (10px), md (12px), lg (14px)"
      />

      <div className="space-y-8">
        <div className="space-y-4">
          <DesCard
            name="Interactive Tags"
            description="tag-control classes with hover states, tuned for control surfaces."
            details="Use tag-control on default surfaces, tag-control-inverse when nested inside inverse surfaces."
          />

          <SurfacePreviewGrid nativeOnly={nativeOnly}>
            <SurfacePreviewGrid.Surface label="Default surface">
              <div className="space-y-6">
                {interactiveVariants.map(renderSizeStack)}
              </div>
            </SurfacePreviewGrid.Surface>
            <SurfacePreviewGrid.Surface label="Inverse surface" inverse>
              <div className="space-y-6">
                {interactiveVariants.map(renderSizeStack)}
              </div>
            </SurfacePreviewGrid.Surface>
          </SurfacePreviewGrid>
        </div>

        <div className="space-y-4">
          <DesCard
            name="Static Pills"
            description="Non-interactive pill styles for metadata labels and badges."
            details="pill-subtle works on both default and inverse surfaces. pill-inverse for solid fills, pill-outline for bordered treatment. All pills use fixed 4×16 padding."
          />

          <SurfacePreviewGrid nativeOnly={nativeOnly}>
            <SurfacePreviewGrid.Surface label="Default surface">
              <div className="space-y-6">
                {pillVariants.map(renderSizeStack)}
              </div>
            </SurfacePreviewGrid.Surface>
            <SurfacePreviewGrid.Surface label="Inverse surface" inverse>
              <div className="space-y-6">
                {pillVariants.map(renderSizeStack)}
              </div>
            </SurfacePreviewGrid.Surface>
          </SurfacePreviewGrid>
        </div>
      </div>
    </div>
  )
}
