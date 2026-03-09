import { useState } from 'react'
import { CollectionFilters } from '@kol/ui'
import DesSection from '../molecules/DesSection'
import DesCard from '../molecules/DesCard'

const sampleItems = [
  { id: 1, title: 'Abstract Forms', category: 'Generative', type: 'Abstract', year: '2024' },
  { id: 2, title: 'Geometric Patterns', category: 'Generative', type: 'Pattern', year: '2023' },
  { id: 3, title: 'Fluid Dynamics', category: 'Simulation', type: 'Fluid', year: '2024' },
  { id: 4, title: 'Particle Systems', category: 'Simulation', type: 'Particle', year: '2024' },
  { id: 5, title: 'Data Visualization', category: 'Data', type: 'Visualization', year: '2023' },
  { id: 6, title: 'Kinetic Typography', category: 'Typography', type: 'Kinetic', year: '2024' }
]

export default function CollectionFiltersPreview() {
  const [filteredItems, setFilteredItems] = useState(sampleItems)
  const [filteredItemsInverse, setFilteredItemsInverse] = useState(sampleItems)

  const handleFilterChange = (filters) => {
    if (filters.size === 0) {
      setFilteredItems(sampleItems)
      return
    }
    const filtered = sampleItems.filter((item) => {
      return Array.from(filters).some((filterKey) => {
        const [filterType, filterValue] = filterKey.split(':')
        return item[filterType] === filterValue
      })
    })
    setFilteredItems(filtered)
  }

  const handleFilterChangeInverse = (filters) => {
    if (filters.size === 0) {
      setFilteredItemsInverse(sampleItems)
      return
    }
    const filtered = sampleItems.filter((item) => {
      return Array.from(filters).some((filterKey) => {
        const [filterType, filterValue] = filterKey.split(':')
        return item[filterType] === filterValue
      })
    })
    setFilteredItemsInverse(filtered)
  }

  return (
    <div className="space-y-8">
      <DesSection
        name="Collection Filters"
        description="Filter interface for collection items."
        details="Category, type, and year filtering"
      />

      <DesCard
        name="Collection Filters"
        description="Expandable filter panel with category, type, and year options"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 rounded-sm border border-fg-08">
          <div className="kol-mono-xs text-fg-48 mb-4">Default surface</div>
          <CollectionFilters
            logomarks={filteredItems}
            onFilterChange={handleFilterChange}
            collections={[]}
            totalCount={sampleItems.length}
            collectionTitle="Sample Collection"
            showCollectionCategories={false}
          />
        </div>
        <div className="bg-surface-inverse p-6 rounded-sm">
          <div className="kol-mono-xs text-fg-48 mb-4">Inverse surface</div>
          <CollectionFilters
            logomarks={filteredItemsInverse}
            onFilterChange={handleFilterChangeInverse}
            collections={[]}
            totalCount={sampleItems.length}
            collectionTitle="Sample Collection"
            showCollectionCategories={false}
          />
        </div>
      </div>
    </div>
  )
}
