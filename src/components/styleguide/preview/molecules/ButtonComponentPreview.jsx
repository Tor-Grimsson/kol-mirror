import Button from '../../atoms/Button'
import DesSection from './DesSection'
import DesCard from './DesCard'
import SurfacePreviewGrid from './SurfacePreviewGrid'

const iconVariations = [
  { id: 'icon-left', label: 'Icon Left', props: { iconLeft: 'arrow-up' } },
  { id: 'icon-right', label: 'Icon Right', props: { iconRight: 'arrow-downright' } },
  {
    id: 'icon-right-hover',
    label: 'Icon Right (hover animate)',
    props: { iconRight: 'arrow-downright', iconRightHover: 'arrow-downright', animateIcon: true }
  },
  {
    id: 'icon-both',
    label: 'Icon Left + Right',
    props: { iconLeft: 'arrow-up', iconRight: 'arrow-downright' }
  },
  {
    id: 'icon-only',
    label: 'Icon Only',
    props: { iconOnly: 'arrow-up', iconOnlyHover: 'arrow-up' }
  }
]

const breakpoints = [
  { id: 'mobile', label: 'Mobile', fontSize: '14px', iconSize: 14, padding: '8px 20px', iconOnlyPadding: '8px' },
  { id: 'tablet', label: 'Tablet', fontSize: '16px', iconSize: 16, padding: '12px 28px', iconOnlyPadding: '12px' },
  { id: 'desktop', label: 'Desktop', fontSize: '18px', iconSize: 18, padding: '14px 32px', iconOnlyPadding: '14px' }
]

const renderVariationGrid = (tone = 'default') => (
  <div className="space-y-6">
    {iconVariations.map((variation) => (
      <div key={`${tone}-${variation.id}`} className="space-y-3">
        <div className="kol-mono-xs uppercase">{variation.label}</div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {breakpoints.map((bp) => (
            <div key={`${tone}-${variation.id}-${bp.id}`} className="space-y-2">
              <div className="kol-mono-xs opacity-60">{bp.label}</div>
              <Button
                variant="primary"
                iconSize={bp.iconSize}
                style={{
                  fontSize: bp.fontSize,
                  padding: variation.props.iconOnly ? bp.iconOnlyPadding : bp.padding
                }}
                aria-label={variation.props.iconOnly ? 'Icon button' : undefined}
                {...variation.props}
              >
                {variation.props.iconOnly ? null : 'Button'}
              </Button>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
)

export default function ButtonComponentPreview({ nativeOnly = false }) {
  return (
    <div className="space-y-8">
      <DesCard
        name="Icon Variations"
        description="Demonstrates icon placements and hover animations across breakpoints."
        details="Padding scales from 8×20 to 14×32 · Icon-only buttons use square padding."
      />

      <SurfacePreviewGrid nativeOnly={nativeOnly}>
        <SurfacePreviewGrid.Surface label="Default surface">
          {renderVariationGrid('default')}
        </SurfacePreviewGrid.Surface>
        <SurfacePreviewGrid.Surface label="Inverse surface" inverse>
          {renderVariationGrid('inverse')}
        </SurfacePreviewGrid.Surface>
      </SurfacePreviewGrid>
    </div>
  )
}
