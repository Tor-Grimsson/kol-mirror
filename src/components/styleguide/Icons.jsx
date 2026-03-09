import Icon from '../icons/Icon'

const svgModules = import.meta.glob('../icons/svg/**/*.svg', { eager: true, query: '?raw', import: 'default' })

// Build categories from folder structure
const categories = Object.entries(svgModules).reduce((acc, [path]) => {
  const parts = path.split('/')
  const folder = parts[parts.length - 2]
  const fileName = parts[parts.length - 1].replace('.svg', '')

  // Extract category label from folder name (e.g. "01-navigation" -> "Navigation")
  const label = folder.replace(/^\d+-/, '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

  if (!acc[folder]) {
    acc[folder] = { label, icons: [] }
  }
  acc[folder].icons.push(fileName)
  return acc
}, {})

// Sort categories by folder name
const sortedCategories = Object.entries(categories).sort(([a], [b]) => a.localeCompare(b))

export default function Icons() {
  return (
    <div className="p-6">
      <header className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Icon Library</h2>
        <p className="text-fg-64">{Object.values(categories).reduce((sum, c) => sum + c.icons.length, 0)} icons across {sortedCategories.length} categories</p>
      </header>

      {sortedCategories.map(([folder, { label, icons }]) => (
        <section key={folder} className="mb-10">
          <div className="mb-4 border-b border-fg-08 pb-3">
            <h3 className="text-lg font-semibold text-fg-80">{label}</h3>
            <p className="text-xs text-fg-48 mt-1">{icons.length} icons</p>
          </div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-3">
            {icons.sort().map((name) => (
              <div
                key={name}
                className="flex flex-col items-center gap-2 p-3 rounded-md border border-fg-04 hover:border-fg-16 hover:bg-fg-02 transition-colors"
              >
                <Icon name={name} size={24} />
                <span className="text-[10px] text-fg-48 text-center leading-tight break-all">{name}</span>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
