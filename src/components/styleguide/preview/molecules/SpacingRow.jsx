import DesCard from './DesCard'
import SurfacePreviewGrid from './SurfacePreviewGrid'

const SpacingRow = ({ token, rem, label }) => {
  const sizeStyle = {
    width: `var(${token})`,
    height: '12px'
  }

  return (
    <div className="space-y-4">
      <DesCard
        name={label}
        description={`${rem} (${token})`}
      />

      <SurfacePreviewGrid>
        <SurfacePreviewGrid.Surface label="Default surface">
          <div className="flex items-center gap-6">
            <div className="h-3 rounded-full" style={{ ...sizeStyle, backgroundColor: 'var(--kol-surface-on-primary)' }} />
            <span className="kol-mono-xs opacity-70">{token}</span>
          </div>
        </SurfacePreviewGrid.Surface>
        <SurfacePreviewGrid.Surface label="Inverse surface" inverse>
          <div className="flex items-center gap-6">
            <div className="h-3 rounded-full" style={{ ...sizeStyle, backgroundColor: 'var(--kol-surface-on-primary)' }} />
            <span className="kol-mono-xs opacity-70">{token}</span>
          </div>
        </SurfacePreviewGrid.Surface>
      </SurfacePreviewGrid>
    </div>
  )
}

export default SpacingRow
