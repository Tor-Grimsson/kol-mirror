import Button from '../../atoms/Button'
import DesSection from './DesSection'
import DesCard from './DesCard'
import SurfacePreviewGrid from './SurfacePreviewGrid'

const buttonVariants = [
  { id: 'primary', label: 'Button (primary)', variant: 'primary', text: 'Primary' },
  { id: 'secondary', label: 'Button (secondary)', variant: 'secondary', text: 'Secondary' },
  { id: 'outline', label: 'Button (outline)', variant: 'outline', text: 'Outline' },
  { id: 'accent', label: 'Button (accent)', variant: 'accent', text: 'Accent' }
]

const controlButtonVariant = {
  id: 'control',
  label: 'Button (control)',
  variant: 'control',
  text: 'Control'
}

const breakpoints = [
  { id: 'mobile', label: 'Mobile', fontSize: '14px', padding: '8px 20px', paddingControl: '8px 16px' },
  { id: 'tablet', label: 'Tablet', fontSize: '16px', padding: '12px 28px', paddingControl: '8px 16px' },
  { id: 'desktop', label: 'Desktop', fontSize: '18px', padding: '14px 32px', paddingControl: '8px 16px' }
]

const renderBreakpointGrid = (variant, isControl = false) => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
    {breakpoints.map((bp) => (
      <div key={`${variant.id}-${bp.id}`} className="space-y-2">
        <div className="kol-mono-xs opacity-60">{bp.label}</div>
        <Button
          variant={variant.variant}
          style={{
            fontSize: bp.fontSize,
            padding: isControl ? bp.paddingControl : bp.padding
          }}
        >
          {variant.text}
        </Button>
      </div>
    ))}
  </div>
)

export default function ButtonStatesPreview({ nativeOnly = false }) {
  return (
    <div className="space-y-8">
      <DesSection
        name="Button Variants"
        description="Primary action buttons and utility controls rendered across breakpoints."
        details="Variants reuse shared Button primitives and inherit responsive spacing tokens."
      />

      <div className="space-y-8">
        <div className="space-y-4">
          <DesCard
            name="Action Buttons"
            description="Primary, secondary, outline, and accent variants responsive from mobile to desktop."
            details="Padding: 8×20 / 12×28 / 14×32 • Typography: kol-mono-text"
          />

          <SurfacePreviewGrid nativeOnly={nativeOnly}>
            <SurfacePreviewGrid.Surface label="Default surface">
              <div className="space-y-6">
                {buttonVariants.map((variant) => (
                  <div key={variant.id} className="space-y-3">
                    <div className="kol-mono-xs uppercase">{variant.label}</div>
                    {renderBreakpointGrid(variant)}
                  </div>
                ))}
              </div>
            </SurfacePreviewGrid.Surface>
            <SurfacePreviewGrid.Surface label="Inverse surface" inverse>
              <div className="space-y-6">
                {buttonVariants.map((variant) => (
                  <div key={`inverse-${variant.id}`} className="space-y-3">
                    <div className="kol-mono-xs uppercase">{variant.label}</div>
                    {renderBreakpointGrid(variant)}
                  </div>
                ))}
              </div>
            </SurfacePreviewGrid.Surface>
          </SurfacePreviewGrid>
        </div>

        <div className="space-y-4">
          <DesCard
            name="Control Button"
            description="Utility button with fixed padding for toggles and contextual controls."
            details="Padding fixed at 8×16 across breakpoints • Variant: control"
          />

          <SurfacePreviewGrid nativeOnly={nativeOnly}>
            <SurfacePreviewGrid.Surface label="Default surface">
              <div className="space-y-3">
                <div className="kol-mono-xs uppercase">{controlButtonVariant.label}</div>
                {renderBreakpointGrid(controlButtonVariant, true)}
              </div>
            </SurfacePreviewGrid.Surface>
            <SurfacePreviewGrid.Surface label="Inverse surface" inverse>
              <div className="space-y-3">
                <div className="kol-mono-xs uppercase">{controlButtonVariant.label}</div>
                {renderBreakpointGrid(controlButtonVariant, true)}
              </div>
            </SurfacePreviewGrid.Surface>
          </SurfacePreviewGrid>
        </div>
      </div>
    </div>
  )
}
