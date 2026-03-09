import { SectionLabel } from '@kol/ui'
import DesSection from './DesSection'
import DesCard from './DesCard'
import SurfacePreviewGrid from './SurfacePreviewGrid'

const sizeVariants = [
  { size: 'sm', label: 'Small (16px icon)', height: 'h-16' },
  { size: 'md', label: 'Medium (24px icon)', height: 'h-20' },
  { size: 'lg', label: 'Large (40px icon)', height: 'h-32' }
]

export default function SectionLabelPreview({ nativeOnly = false }) {
  return (
    <div className="space-y-8">
      <DesSection
        name="Section Label"
        description="Label component with animated arrow icon. Available in 3 size variants (sm, md, lg)."
        details="Icon swaps on hover • Uses label-compact (sm/md) and heading-md (lg) • Text always uses text-auto"
        code={'<SectionLabel text="Featured Work" size="md" />'}
      />

      <DesCard
        name="Size Variants"
        description="Three size options: sm (compact), md (default), lg (large headings)"
        details="sm: 16px icon • md: 24px icon • lg: 40px icon"
      />

      <SurfacePreviewGrid nativeOnly={nativeOnly}>
        <SurfacePreviewGrid.Surface label="Default surface">
          <div className="space-y-6 py-8">
            {sizeVariants.map(({ size, label, height }) => (
              <div key={size} className="space-y-2">
                <div className="kol-mono-xs text-fg-48">{label}</div>
                <div className={`flex ${height} items-center justify-start`}>
                  <SectionLabel text="Featured Work" size={size} />
                </div>
              </div>
            ))}
          </div>
        </SurfacePreviewGrid.Surface>
        <SurfacePreviewGrid.Surface label="Inverse surface" inverse>
          <div className="space-y-6 py-8">
            {sizeVariants.map(({ size, label, height }) => (
              <div key={size} className="space-y-2">
                <div className="kol-mono-xs text-fg-48">{label}</div>
                <div className={`flex ${height} items-center justify-start`}>
                  <SectionLabel text="Featured Work" size={size} />
                </div>
              </div>
            ))}
          </div>
        </SurfacePreviewGrid.Surface>
      </SurfacePreviewGrid>
    </div>
  )
}
