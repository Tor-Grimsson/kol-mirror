import { FeaturedItemsCarousel, Logomark, Illustration } from '@kol/ui'
import DesSection from '../molecules/DesSection'
import DesCard from '../molecules/DesCard'
import SurfacePreviewGrid from '../molecules/SurfacePreviewGrid'

const sampleItems = [
  {
    name: 'Kolkrabbi Logo',
    type: 'Logomark',
    subtitle: 'Brand Identity',
    description: 'Primary brand logomark featuring geometric shapes.',
    route: '/collections/logomarks',
    logoName: 'kolkrabbi-logo',
    badgeVariant: 'subtle',
    badgeSize: 'sm'
  },
  {
    name: 'Abstract Composition',
    type: 'Illustration',
    subtitle: 'Digital Art',
    description: 'Experimental illustration exploring color theory.',
    route: '/collections/illustrations',
    illustrationName: '01',
    badgeVariant: 'subtle',
    badgeSize: 'sm'
  },
  {
    name: 'Typography System',
    type: 'Design System',
    subtitle: 'Interface Design',
    description: 'Comprehensive typography system with fluid scaling.',
    route: '/styleguide/typography',
    badgeVariant: 'inverse',
    badgeSize: 'sm'
  }
]

const renderContent = (item) => {
  if (item.logoName) {
    return <Logomark name={item.logoName} size={item.subtitle === 'Wordmark' ? 200 : 160} />
  }
  if (item.illustrationName) {
    return <Illustration name={item.illustrationName} size={400} />
  }
  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="text-center space-y-4">
        <div className="kol-display-subsection text-auto opacity-20">{item.type}</div>
        <p className="kol-mono-sm text-fg-64">Preview content</p>
      </div>
    </div>
  )
}

export default function FeaturedItemsCarouselPreview() {
  return (
    <div className="space-y-8">
      <DesSection
        name="Featured Items Carousel"
        description="Auto-rotating carousel for featured items."
        details="Manual navigation and flexible content rendering"
      />

      <DesCard
        name="Featured Items Carousel"
        description="Carousel with manual navigation"
      />
      <SurfacePreviewGrid nativeOnly={true}>
        <SurfacePreviewGrid.Surface label="Default surface">
          <FeaturedItemsCarousel
            items={sampleItems}
            renderContent={renderContent}
            autoRotate={false}
          />
        </SurfacePreviewGrid.Surface>
      </SurfacePreviewGrid>
    </div>
  )
}
