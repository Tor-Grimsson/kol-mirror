import { SourcesItem } from '@kol/ui'
import DesSection from '../molecules/DesSection'
import DesCard from '../molecules/DesCard'
import SurfacePreviewGrid from '../molecules/SurfacePreviewGrid'

export default function SourcesItemPreview({ nativeOnly = false }) {
  return (
    <div className="space-y-8">
      <DesSection
        name="Sources Item"
        description="Citation item for source references."
        details="Numbered source with title, link, and metadata"
      />

      <DesCard
        name="Sources Item"
        description="Single source citation with number, title, and meta info"
      />
      <SurfacePreviewGrid nativeOnly={nativeOnly}>
        <SurfacePreviewGrid.Surface label="Default surface">
          <ol className="sources-list">
            <SourcesItem
              number={1}
              title="Design Systems Handbook"
              href="https://example.com"
              meta="DesignBetter, 2023"
            />
            <SourcesItem
              number={2}
              title="Atomic Design Methodology"
              href="https://example.com"
              meta="Brad Frost, 2016"
            />
          </ol>
        </SurfacePreviewGrid.Surface>
        <SurfacePreviewGrid.Surface label="Inverse surface" inverse>
          <ol className="sources-list">
            <SourcesItem
              number={1}
              title="Design Systems Handbook"
              href="https://example.com"
              meta="DesignBetter, 2023"
            />
            <SourcesItem
              number={2}
              title="Atomic Design Methodology"
              href="https://example.com"
              meta="Brad Frost, 2016"
            />
          </ol>
        </SurfacePreviewGrid.Surface>
      </SurfacePreviewGrid>
    </div>
  )
}
