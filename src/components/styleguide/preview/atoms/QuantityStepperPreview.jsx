import { useState } from 'react'
import { QuantityStepper } from '@kol/ui'
import DesSection from '../molecules/DesSection'
import DesCard from '../molecules/DesCard'
import SurfacePreviewGrid from '../molecules/SurfacePreviewGrid'

const breakpoints = [
  { id: 'sm', label: 'Small' },
  { id: 'md', label: 'Medium' },
  { id: 'lg', label: 'Large' }
]

export default function QuantityStepperPreview({ nativeOnly = false }) {
  const [values, setValues] = useState({
    'sm-default': 1,
    'sm-inverse': 1,
    'md-default': 1,
    'md-inverse': 1,
    'lg-default': 1,
    'lg-inverse': 1
  })

  const handleChange = (key, value) => {
    setValues(prev => ({ ...prev, [key]: value }))
  }

  const renderStepperSet = (tone = 'default') => (
    <div className="space-y-6">
      {breakpoints.map((bp) => (
        <div key={`stepper-${tone}-${bp.id}`} className="space-y-2">
          <div className="kol-mono-xs text-fg-48">Size: {bp.label}</div>
          <QuantityStepper
            value={values[`${bp.id}-${tone}`]}
            onChange={(v) => handleChange(`${bp.id}-${tone}`, v)}
            min={1}
            max={10}
            size={bp.id}
          />
        </div>
      ))}
    </div>
  )

  return (
    <div className="space-y-8">
      <DesSection
        name="Quantity Stepper"
        description="Numeric input with increment/decrement buttons."
        details="+/− buttons • Min/max constraints • Responsive sizing"
      />

      <DesCard
        name="Quantity Stepper"
        description="Button-based quantity selector with +/− controls"
      />
      <SurfacePreviewGrid nativeOnly={nativeOnly}>
        <SurfacePreviewGrid.Surface label="Default surface">
          {renderStepperSet('default')}
        </SurfacePreviewGrid.Surface>
        <SurfacePreviewGrid.Surface label="Inverse surface" inverse>
          {renderStepperSet('inverse')}
        </SurfacePreviewGrid.Surface>
      </SurfacePreviewGrid>
    </div>
  )
}
