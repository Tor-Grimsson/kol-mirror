export default function HallOfArchive({ onBack }) {
  return (
    <div className="min-h-screen w-full bg-surface-primary p-12">
      <div className="mx-auto max-w-7xl space-y-12">
        <div>
          <div className="kol-helper-xs cursor-pointer text-fg-64 hover:text-fg-96 mb-6" onClick={onBack}>
            [BACK]
          </div>
          <h1 className="kol-heading-sm text-fg-96">Hall of Archive</h1>
          <p className="kol-helper-s text-fg-64 mt-2">Stored experiments and compositions from the Symphony mixer. Save your work for later reference or comparison.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, index) => (
            <div key={index} className="flex flex-col gap-4 opacity-40">
              <div className="flex items-center justify-between">
                <div className="kol-helper-s text-fg-32">Empty slot {index + 1}</div>
                <div className="flex gap-2">
                  <div className="kol-helper-xs text-fg-32">[EMPTY]</div>
                </div>
              </div>
              <div className="relative aspect-[4/3] overflow-hidden border border-fg-08 bg-surface-secondary" style={{ borderRadius: '4px' }}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="kol-helper-s text-fg-32">No saved experiment</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="kol-helper-xs text-fg-32 font-mono">—</div>
                <div className="kol-helper-xs text-fg-32 font-mono">—</div>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded border border-fg-08 bg-surface-secondary p-6 space-y-4">
          <h2 className="kol-heading-sm">Archive Features</h2>
          <ul className="kol-helper-s text-fg-64 space-y-2 list-disc pl-6">
            <li><strong>Save from Symphony:</strong> Store effect combinations and compositions from the mixer</li>
            <li><strong>Metadata Tracking:</strong> Each saved experiment includes timestamp, effect layers, and performance metrics</li>
            <li><strong>Quick Preview:</strong> Hover to see composition details and performance stats</li>
            <li><strong>Load to Symphony:</strong> Click to load archived composition back into the mixer</li>
            <li><strong>Compare Mode:</strong> Select multiple experiments to compare performance side-by-side</li>
            <li><strong>Export/Import:</strong> Save experiments to JSON for sharing or backup</li>
            <li><strong>Performance Notes:</strong> Add annotations about what worked, what didn't, and optimization ideas</li>
            <li><strong>9 Slot Limit:</strong> Encourages curation - keep only the most valuable experiments</li>
          </ul>
          <div className="kol-helper-xs text-fg-48 font-mono pt-4">
            Note: Archive works with local storage - experiments persist across sessions
          </div>
        </div>
      </div>
    </div>
  )
}
