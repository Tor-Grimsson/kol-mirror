import { CollectionGrid } from '@kol/ui'
import DesSection from '../molecules/DesSection'
import DesCard from '../molecules/DesCard'
import SurfacePreviewGrid from '../molecules/SurfacePreviewGrid'

const sampleIllustrations = [
  { id: 1, name: 'Abstract Composition', description: 'Geometric forms', illustrationName: 'abstract-composition', type: 'Digital', year: '2024' },
  { id: 2, name: 'Urban Landscape', description: 'City architecture', illustrationName: 'urban-landscape', type: 'Vector', year: '2024' },
  { id: 3, name: 'Nature Series', description: 'Organic patterns', illustrationName: 'nature-series', type: 'Digital', year: '2023' },
  { id: 4, name: 'Portrait Study', description: 'Character design', illustrationName: 'portrait-study', type: 'Digital', year: '2024' },
  { id: 5, name: 'Tech Concept', description: 'Futuristic visualization', illustrationName: 'tech-concept', type: 'Vector', year: '2023' },
  { id: 6, name: 'Minimal Forms', description: 'Clean geometric design', illustrationName: 'minimal-forms', type: 'Vector', year: '2024' }
]

const sampleLogomarks = [
  { id: 1, name: 'Tech Startup', description: 'Modern technology logo', logoName: 'tech-startup', type: 'Symbol', year: '2024' },
  { id: 2, name: 'Coffee Shop', description: 'Friendly cafe branding', logoName: 'coffee-shop', type: 'Wordmark', year: '2023' },
  { id: 3, name: 'Fitness Brand', description: 'Active lifestyle logo', logoName: 'fitness-brand', type: 'Symbol', year: '2024' }
]

export default function CollectionGridPreview({ nativeOnly = false }) {
  return (
    <div className="space-y-8">
      <DesSection
        name="Collection Grid"
        description="Responsive grid for collection items."
        details="Built-in load more functionality"
      />

      <DesCard
        name="Illustrations Grid"
        description="Grid with illustration cards and load more"
      />
      <SurfacePreviewGrid nativeOnly={nativeOnly}>
        <SurfacePreviewGrid.Surface label="Default surface">
          <CollectionGrid illustrations={sampleIllustrations} initialLimit={3} />
        </SurfacePreviewGrid.Surface>
        <SurfacePreviewGrid.Surface label="Inverse surface" inverse>
          <CollectionGrid illustrations={sampleIllustrations} initialLimit={3} />
        </SurfacePreviewGrid.Surface>
      </SurfacePreviewGrid>

      <DesCard
        name="Logomarks Grid"
        description="Grid with logomark cards"
      />
      <SurfacePreviewGrid nativeOnly={nativeOnly}>
        <SurfacePreviewGrid.Surface label="Default surface">
          <CollectionGrid logomarks={sampleLogomarks} />
        </SurfacePreviewGrid.Surface>
        <SurfacePreviewGrid.Surface label="Inverse surface" inverse>
          <CollectionGrid logomarks={sampleLogomarks} />
        </SurfacePreviewGrid.Surface>
      </SurfacePreviewGrid>
    </div>
  )
}
