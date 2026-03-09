import { useState } from 'react'
import { Input } from '@kol/ui'
import DesSection from './DesSection'
import DesCard from './DesCard'
import SurfacePreviewGrid from './SurfacePreviewGrid'

const breakpoints = [
  { id: 'mobile', label: 'Mobile' },
  { id: 'tablet', label: 'Tablet' },
  { id: 'desktop', label: 'Desktop' }
]

const inputBreakpointStyles = {
  sm: {
    mobile: { padding: '6px 16px', width: '280px', fontSize: '14px' },
    tablet: { padding: '8px 20px', width: '280px', fontSize: '16px' },
    desktop: { padding: '10px 24px', width: '280px', fontSize: '18px' }
  },
  md: {
    mobile: { padding: '8px 20px', width: '380px', fontSize: '14px' },
    tablet: { padding: '12px 28px', width: '380px', fontSize: '16px' },
    desktop: { padding: '14px 32px', width: '380px', fontSize: '18px' }
  },
  lg: {
    mobile: { padding: '10px 24px', width: '480px', fontSize: '14px' },
    tablet: { padding: '14px 36px', width: '480px', fontSize: '16px' },
    desktop: { padding: '16px 40px', width: '480px', fontSize: '18px' }
  }
}

export default function InputPreview({ nativeOnly = false }) {
  const [value1, setValue1] = useState('')
  const [value2, setValue2] = useState('')
  const [value3, setValue3] = useState('')

  return (
    <div className="space-y-8">
      <DesSection
        name="Input"
        description="Form input component with size variants matching Button styles. Supports icons and uppercase text transform."
        details="Uses kol-mono-text typography • Three sizes: sm, md, lg • Optional left icon"
        code={'<Input type="text" placeholder="Enter text..." size="md" />'}
      />

      <DesCard
        name="Input"
        description="Form input component matching Button styles"
      />

      <SurfacePreviewGrid nativeOnly={nativeOnly}>
        <SurfacePreviewGrid.Surface label="Default surface">
          <div className="space-y-6 py-8">
            {breakpoints.map((bp) => (
              <div key={bp.id} className="space-y-2">
                <div className="kol-mono-xs text-fg-48">{bp.label}</div>
                <Input
                  type="text"
                  placeholder="Enter text..."
                  size="md"
                  style={inputBreakpointStyles.md[bp.id]}
                />
              </div>
            ))}
          </div>
        </SurfacePreviewGrid.Surface>
        <SurfacePreviewGrid.Surface label="Inverse surface" inverse>
          <div className="space-y-6 py-8">
            {breakpoints.map((bp) => (
              <div key={bp.id} className="space-y-2">
                <div className="kol-mono-xs text-fg-48">{bp.label}</div>
                <Input
                  type="text"
                  placeholder="Enter text..."
                  size="md"
                  style={inputBreakpointStyles.md[bp.id]}
                />
              </div>
            ))}
          </div>
        </SurfacePreviewGrid.Surface>
      </SurfacePreviewGrid>
    </div>
  )
}
