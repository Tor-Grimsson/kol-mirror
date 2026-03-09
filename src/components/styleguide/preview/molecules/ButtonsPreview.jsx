import { ButtonGroup } from '@kol/ui'
import DesSection from './DesSection'
import DesCard from './DesCard'
import ButtonStatesPreview from './ButtonStatesPreview'
import ButtonComponentPreview from './ButtonComponentPreview'

const breakpoints = [
  { id: 'mobile', label: 'Mobile' },
  { id: 'tablet', label: 'Tablet' },
  { id: 'desktop', label: 'Desktop' }
]

const buttonBreakpointConfig = {
  mobile: { size: 'sm', padding: '6px 16px', fontSize: '14px' },
  tablet: { size: 'md', padding: '12px 28px', fontSize: '16px' },
  desktop: { size: 'lg', padding: '16px 40px', fontSize: '18px' }
}

export default function ButtonsPreview({ nativeOnly = false }) {
  const sampleButtons = [
    { label: 'Primary Action', variant: 'primary' },
    { label: 'Secondary Action', variant: 'secondary' }
  ]

  const sampleButtonsThree = [
    { label: 'View Project', variant: 'primary' },
    { label: 'Case Study', variant: 'outline' },
    { label: 'Live Site', variant: 'outline' }
  ]

  return (
    <div className="space-y-12">
      {/* Button States (class-based) */}
      <ButtonStatesPreview nativeOnly={nativeOnly} />

      {/* Button Component */}
      <ButtonComponentPreview nativeOnly={nativeOnly} />

      {/* ButtonGroup Molecule */}
      <div className="space-y-8">
        <DesSection
          name="Button Group"
          description="Molecule component for grouping multiple related buttons with consistent spacing and alignment."
          details="Uses gap-4 (16px) between buttons • Supports align prop (left, center, right) • Used in feature cards and CTAs"
          code={'<ButtonGroup buttons={[{ label: "Primary", variant: "primary" }, { label: "Secondary", variant: "outline" }]} align="center" />'}
        />

        <div className="space-y-4">
          <DesCard
            name="Alignment Options"
            description="ButtonGroup supports three alignment options via align prop"
            details="left (default), center, right • Responsive sizing: mobile (sm/14px), tablet (md/16px), desktop (lg/18px)"
          />

          <div className="space-y-10 py-8 p-4 rounded bg-surface-primary border border-auto">
            {['left', 'center', 'right'].map((alignment) => (
              <div key={alignment} className="space-y-4">
                <div className="kol-mono-xs uppercase">{alignment} {alignment === 'left' ? '(default)' : ''}</div>
                <div className="space-y-3">
                  {breakpoints.map((bp) => (
                    <div key={`${alignment}-${bp.id}`} className="space-y-2">
                      <div className="kol-mono-xs opacity-60">{bp.label}</div>
                      <ButtonGroup
                        buttons={sampleButtons.map(btn => ({
                          ...btn,
                          size: buttonBreakpointConfig[bp.id].size,
                          style: {
                            padding: buttonBreakpointConfig[bp.id].padding,
                            fontSize: buttonBreakpointConfig[bp.id].fontSize
                          }
                        }))}
                        align={alignment}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <DesCard
            name="Multiple Buttons"
            description="ButtonGroup can contain multiple buttons with mixed variants"
            details="Common pattern: 1 primary + multiple outline buttons"
          />

          <div className="space-y-6 py-8 p-4 rounded bg-surface-primary border border-auto">
            <div className="space-y-3">
              <div className="kol-mono-xs uppercase">Three Buttons (Center)</div>
              <div className="grid grid-cols-1 gap-4">
                {breakpoints.map((bp) => (
                  <div key={`three-${bp.id}`} className="space-y-2">
                    <div className="kol-mono-xs opacity-60">{bp.label}</div>
                    <ButtonGroup
                      buttons={sampleButtonsThree.map(btn => ({
                        ...btn,
                        size: buttonBreakpointConfig[bp.id].size,
                        style: {
                          padding: buttonBreakpointConfig[bp.id].padding,
                          fontSize: buttonBreakpointConfig[bp.id].fontSize
                        }
                      }))}
                      align="center"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
