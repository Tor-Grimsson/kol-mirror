import { CollectionCard } from '@kol/ui'
import DesSection from './DesSection'
import DesCard from './DesCard'
import SurfacePreviewGrid from './SurfacePreviewGrid'

const sampleIllustration = {
  id: 1,
  name: 'Cyber Fox',
  description: 'Digital illustration exploring neon aesthetics',
  illustrationName: 'cyber-fox',
  type: 'Digital',
  year: '2024'
}

const sampleLogomark = {
  id: 2,
  name: 'Flík',
  description: 'Brand identity for Icelandic design studio',
  logoName: 'flik',
  type: 'Symbol',
  year: '2023'
}

const sampleVideo = {
  id: 3,
  title: 'Geometric Patterns',
  subtitle: 'Procedural animation study',
  description: 'Exploration of geometric patterns',
  type: 'Generative',
  year: '2024',
  touchDesigner: {
    patchName: 'geometric_patterns_v01.toe',
    version: '2023.11880'
  }
}

export default function CollectionCardPreview({ nativeOnly = false }) {
  return (
    <div className="space-y-8">
      <DesSection
        name="Collection Card"
        description="Card for displaying collection items."
        details="Supports illustrations, logomarks, and videos with hover interactions"
      />

      <DesCard
        name="Illustration"
        description="Square aspect ratio with centered illustration"
      />
      <SurfacePreviewGrid nativeOnly={nativeOnly}>
        <SurfacePreviewGrid.Surface label="Default surface">
          <div className="max-w-[280px]">
            <CollectionCard
              item={sampleIllustration}
              type="illustration"
            />
          </div>
        </SurfacePreviewGrid.Surface>
        <SurfacePreviewGrid.Surface label="Inverse surface" inverse>
          <div className="max-w-[280px]">
            <CollectionCard
              item={sampleIllustration}
              type="illustration"
            />
          </div>
        </SurfacePreviewGrid.Surface>
      </SurfacePreviewGrid>

      <DesCard
        name="Logomark"
        description="Square aspect ratio with centered logomark"
      />
      <SurfacePreviewGrid nativeOnly={nativeOnly}>
        <SurfacePreviewGrid.Surface label="Default surface">
          <div className="max-w-[280px]">
            <CollectionCard
              item={sampleLogomark}
              type="logomark"
            />
          </div>
        </SurfacePreviewGrid.Surface>
        <SurfacePreviewGrid.Surface label="Inverse surface" inverse>
          <div className="max-w-[280px]">
            <CollectionCard
              item={sampleLogomark}
              type="logomark"
            />
          </div>
        </SurfacePreviewGrid.Surface>
      </SurfacePreviewGrid>

      <DesCard
        name="Video"
        description="16:9 aspect ratio with play button and TD badge"
      />
      <SurfacePreviewGrid nativeOnly={nativeOnly}>
        <SurfacePreviewGrid.Surface label="Default surface">
          <div className="max-w-[360px]">
            <CollectionCard
              item={sampleVideo}
              type="video"
              backgroundColor="bg-surface-secondary"
            />
          </div>
        </SurfacePreviewGrid.Surface>
        <SurfacePreviewGrid.Surface label="Inverse surface" inverse>
          <div className="max-w-[360px]">
            <CollectionCard
              item={sampleVideo}
              type="video"
              backgroundColor="bg-surface-inverse"
            />
          </div>
        </SurfacePreviewGrid.Surface>
      </SurfacePreviewGrid>
    </div>
  )
}
