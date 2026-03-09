import { useState } from 'react'
import { ToggleBracket, ToggleCheckbox, ToggleSwitch, UnitSelector, CarouselNavigation, Checkbox, ViewToggle } from '@kol/ui'
import DesSection from '../molecules/DesSection'
import DesCard from '../molecules/DesCard'
import SurfacePreviewGrid from '../molecules/SurfacePreviewGrid'

const gridOptions = [
  { value: 'both', label: 'Column + Baseline', icon: 'grid-04' },
  { value: 'columns', label: 'Columns only', icon: 'grid-02' },
  { value: 'off', label: 'Hide grid', icon: 'grid-01' }
]

export default function TogglesPreview({ nativeOnly = false }) {
  const [bracketState, setBracketState] = useState(false)
  const [checkboxState, setCheckboxState] = useState(false)
  const [switchState, setSwitchState] = useState(false)
  const [activeUnit, setActiveUnit] = useState('px')
  const [activeUnitInverse, setActiveUnitInverse] = useState('px')
  const [viewMode, setViewMode] = useState('grid')
  const [viewModeInverse, setViewModeInverse] = useState('list')
  const [gridMode, setGridMode] = useState('both')
  const [gridModeInverse, setGridModeInverse] = useState('off')

  return (
    <div className="space-y-8">
      <DesSection
        name="Toggles"
        description="Interactive toggle components for binary state control."
        details="Bracket, Checkbox, Switch, Unit Selector, and Carousel Navigation"
      />

      {/* Toggle Bracket */}
      <DesCard
        name="Toggle Bracket"
        description="Bracket-style toggle with clear on/off states"
      />
      <SurfacePreviewGrid nativeOnly={nativeOnly}>
        <SurfacePreviewGrid.Surface label="Default surface">
          <ToggleBracket
            label="Feature"
            value={bracketState}
            onChange={setBracketState}
          />
        </SurfacePreviewGrid.Surface>
        <SurfacePreviewGrid.Surface label="Inverse surface" inverse>
          <ToggleBracket
            label="Feature"
            value={bracketState}
            onChange={setBracketState}
          />
        </SurfacePreviewGrid.Surface>
      </SurfacePreviewGrid>

      {/* Toggle Checkbox */}
      <DesCard
        name="Toggle Checkbox"
        description="Checkbox-style toggle for form inputs"
      />
      <SurfacePreviewGrid nativeOnly={nativeOnly}>
        <SurfacePreviewGrid.Surface label="Default surface">
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="kol-mono-xs text-fg-48">Toggle Checkbox</div>
              <ToggleCheckbox
                label="Enable"
                checked={checkboxState}
                onChange={setCheckboxState}
              />
            </div>
            <div className="space-y-2">
              <div className="kol-mono-xs text-fg-48">Checkbox</div>
              <Checkbox
                checked={checkboxState}
                onChange={setCheckboxState}
              />
            </div>
          </div>
        </SurfacePreviewGrid.Surface>
        <SurfacePreviewGrid.Surface label="Inverse surface" inverse>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="kol-mono-xs text-fg-48">Toggle Checkbox</div>
              <ToggleCheckbox
                label="Enable"
                checked={checkboxState}
                onChange={setCheckboxState}
              />
            </div>
            <div className="space-y-2">
              <div className="kol-mono-xs text-fg-48">Checkbox</div>
              <Checkbox
                checked={checkboxState}
                onChange={setCheckboxState}
              />
            </div>
          </div>
        </SurfacePreviewGrid.Surface>
      </SurfacePreviewGrid>

      {/* Toggle Switch */}
      <DesCard
        name="Toggle Switch"
        description="iOS-style toggle switch"
      />
      <SurfacePreviewGrid nativeOnly={nativeOnly}>
        <SurfacePreviewGrid.Surface label="Default surface">
          <ToggleSwitch
            label="Dark mode"
            checked={switchState}
            onChange={setSwitchState}
          />
        </SurfacePreviewGrid.Surface>
        <SurfacePreviewGrid.Surface label="Inverse surface" inverse>
          <ToggleSwitch
            label="Dark mode"
            checked={switchState}
            onChange={setSwitchState}
          />
        </SurfacePreviewGrid.Surface>
      </SurfacePreviewGrid>

      {/* Unit Selector */}
      <DesCard
        name="Unit Selector"
        description="Toggle between pixel and rem units"
      />
      <SurfacePreviewGrid nativeOnly={nativeOnly}>
        <SurfacePreviewGrid.Surface label="Default surface">
          <UnitSelector
            activeUnit={activeUnit}
            onUnitChange={setActiveUnit}
          />
        </SurfacePreviewGrid.Surface>
        <SurfacePreviewGrid.Surface label="Inverse surface" inverse>
          <UnitSelector
            activeUnit={activeUnitInverse}
            onUnitChange={setActiveUnitInverse}
          />
        </SurfacePreviewGrid.Surface>
      </SurfacePreviewGrid>

      {/* Carousel Navigation */}
      <DesCard
        name="Carousel Navigation"
        description="Previous/next navigation with chevron icons"
      />
      <SurfacePreviewGrid nativeOnly={nativeOnly}>
        <SurfacePreviewGrid.Surface label="Default surface">
          <CarouselNavigation
            onPrevious={() => {}}
            onNext={() => {}}
          />
        </SurfacePreviewGrid.Surface>
        <SurfacePreviewGrid.Surface label="Inverse surface" inverse>
          <CarouselNavigation
            onPrevious={() => {}}
            onNext={() => {}}
          />
        </SurfacePreviewGrid.Surface>
      </SurfacePreviewGrid>

      {/* View Toggle - Text */}
      <DesCard
        name="View Toggle (Text)"
        description="Toggle between grid and list view modes"
      />
      <SurfacePreviewGrid nativeOnly={nativeOnly}>
        <SurfacePreviewGrid.Surface label="Default surface">
          <ViewToggle viewMode={viewMode} onViewChange={setViewMode} />
        </SurfacePreviewGrid.Surface>
        <SurfacePreviewGrid.Surface label="Inverse surface" inverse>
          <ViewToggle viewMode={viewModeInverse} onViewChange={setViewModeInverse} />
        </SurfacePreviewGrid.Surface>
      </SurfacePreviewGrid>

      {/* View Toggle - Icon */}
      <DesCard
        name="View Toggle (Icon)"
        description="Icon variant for grid/list switching"
      />
      <SurfacePreviewGrid nativeOnly={nativeOnly}>
        <SurfacePreviewGrid.Surface label="Default surface">
          <ViewToggle variant="icon" viewMode={viewMode} onViewChange={setViewMode} className="w-fit" />
        </SurfacePreviewGrid.Surface>
        <SurfacePreviewGrid.Surface label="Inverse surface" inverse>
          <ViewToggle variant="icon" viewMode={viewModeInverse} onViewChange={setViewModeInverse} className="w-fit" />
        </SurfacePreviewGrid.Surface>
      </SurfacePreviewGrid>

      {/* Grid Toggle */}
      <DesCard
        name="Grid Toggle"
        description="Grid overlay mode selector (both/columns/off)"
      />
      <SurfacePreviewGrid nativeOnly={nativeOnly}>
        <SurfacePreviewGrid.Surface label="Default surface">
          <ViewToggle
            variant="icon"
            viewMode={gridMode}
            onViewChange={setGridMode}
            options={gridOptions}
            className="w-fit"
          />
        </SurfacePreviewGrid.Surface>
        <SurfacePreviewGrid.Surface label="Inverse surface" inverse>
          <ViewToggle
            variant="icon"
            viewMode={gridModeInverse}
            onViewChange={setGridModeInverse}
            options={gridOptions}
            className="w-fit"
          />
        </SurfacePreviewGrid.Surface>
      </SurfacePreviewGrid>
    </div>
  )
}
