import { useState } from 'react'
import DesSection from './DesSection'
import DesCard from './DesCard'
import SurfacePreviewGrid from './SurfacePreviewGrid'
import { SectionToggle } from '@kol/ui'

export default function SectionTogglePreview({ nativeOnly = false }) {
  const [expanded, setExpanded] = useState(true)
  const [expandedInverse, setExpandedInverse] = useState(true)

  return (
    <div className="space-y-8">
      <DesSection
        name="Section Toggle"
        description="Collapsible section header with expand/collapse."
        details="Plus/minus indicator with label"
      />

      <DesCard
        name="Expanded / Collapsed"
        description="Toggle between expanded and collapsed states"
      />
      <SurfacePreviewGrid nativeOnly={nativeOnly}>
        <SurfacePreviewGrid.Surface label="Default surface">
          <div className="space-y-4">
            <SectionToggle
              label="Type specimens"
              isExpanded={expanded}
              onToggle={() => setExpanded(!expanded)}
            />
            {expanded && (
              <div className="rounded border border-auto bg-auto p-4">
                <p className="kol-mono-xs opacity-70">Expanded content</p>
              </div>
            )}
          </div>
        </SurfacePreviewGrid.Surface>
        <SurfacePreviewGrid.Surface label="Inverse surface" inverse>
          <div className="space-y-4">
            <SectionToggle
              label="Type specimens"
              isExpanded={expandedInverse}
              onToggle={() => setExpandedInverse(!expandedInverse)}
            />
            {expandedInverse && (
              <div className="rounded border border-auto bg-auto p-4">
                <p className="kol-mono-xs opacity-70">Expanded content</p>
              </div>
            )}
          </div>
        </SurfacePreviewGrid.Surface>
      </SurfacePreviewGrid>
    </div>
  )
}
