import DesSection from './DesSection'
import DesCard from './DesCard'
import SurfacePreviewGrid from './SurfacePreviewGrid'
import { Table } from '@kol/ui'

const sampleColumns = [
  {
    header: 'Token',
    accessor: 'token',
    className: 'dt-cell-text',
    render: (row) => (
      <span className="dataTableToken bg-fg-08">{row.token}</span>
    )
  },
  {
    header: 'Light Mode',
    accessor: 'light',
    className: 'dt-cell-metaStrong',
    render: (row) => (
      <div className="flex items-center gap-3">
        <span
          className="w-6 h-6 rounded border border-auto"
          style={{ backgroundColor: row.light.hex }}
        />
        <span className="kol-mono-text text-xs">{row.light.label}</span>
      </div>
    )
  },
  {
    header: 'Dark Mode',
    accessor: 'dark',
    className: 'dt-cell-metaStrong',
    render: (row) => (
      <div className="flex items-center gap-3">
        <span
          className="w-6 h-6 rounded border border-auto"
          style={{ backgroundColor: row.dark.hex }}
        />
        <span className="kol-mono-text text-xs">{row.dark.label}</span>
      </div>
    )
  },
  {
    header: 'Usage',
    accessor: 'usage',
    className: 'dt-cell-meta',
    style: { maxWidth: '280px' }
  }
]

const sampleRows = [
  {
    id: 'surface-primary',
    token: '--kol-surface-primary',
    light: { label: '#fafafa', hex: '#fafafa' },
    dark: { label: '#121215', hex: '#121215' },
    usage: 'App background and hero sections'
  },
  {
    id: 'surface-secondary',
    token: '--kol-surface-secondary',
    light: { label: '#f8f8f8', hex: '#f8f8f8' },
    dark: { label: '#19191d', hex: '#19191d' },
    usage: 'Raised cards and drawer surfaces'
  },
  {
    id: 'surface-inverse',
    token: '--kol-surface-inverse',
    light: { label: '#0e0e11', hex: '#0e0e11' },
    dark: { label: '#fcfbf8', hex: '#fcfbf8' },
    usage: 'Navigation bars and inverted callouts'
  }
]

export default function TablePreview({ nativeOnly = false }) {
  return (
    <div className="space-y-8">
      <DesSection
        name="Table"
        description="Structured data table with column configuration."
        details="Custom renderers and theme-aware styling"
      />

      <DesCard
        name="Data Table"
        description="Table with custom cell renderers for swatches and labels"
      />
      <SurfacePreviewGrid nativeOnly={nativeOnly}>
        <SurfacePreviewGrid.Surface label="Default surface">
          <Table
            caption="Page surface tokens"
            columns={sampleColumns}
            rows={sampleRows}
          />
        </SurfacePreviewGrid.Surface>
        <SurfacePreviewGrid.Surface label="Inverse surface" inverse>
          <Table
            caption="Page surface tokens"
            columns={sampleColumns}
            rows={sampleRows}
          />
        </SurfacePreviewGrid.Surface>
      </SurfacePreviewGrid>
    </div>
  )
}
