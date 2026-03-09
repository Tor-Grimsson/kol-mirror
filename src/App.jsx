import { useState } from 'react'
import ApparatusHallOfMirrors from './components/hall-of-mirrors/ApparatusHallOfMirrors'
import HallOfDisplacement from './components/hall-of-mirrors/HallOfDisplacement'
import HallOfMovement from './components/hall-of-mirrors/HallOfMovement'
import HallOfCopies from './components/hall-of-mirrors/HallOfCopies'
import HallOfSymphony from './components/hall-of-mirrors/HallOfSymphony'
import HallOfArchive from './components/hall-of-mirrors/HallOfArchive'

const HALLS = [
  { id: 'apparatus', label: 'Apparatus', subtitle: 'The original 12-variant mirror explorer' },
  { id: 'displacement', label: 'Hall of Displacement', subtitle: 'SVG filters + turbulence waves' },
  { id: 'movement', label: 'Hall of Movement', subtitle: 'GSAP-driven bending + motion' },
  { id: 'copies', label: 'Hall of Copies', subtitle: 'PixiJS tiling + replication' },
  { id: 'symphony', label: 'Hall of Symphony', subtitle: 'Live mixer combining all halls' },
  { id: 'archive', label: 'Hall of Archive', subtitle: 'Saved experiments library' }
]

function SplashScreen({ onNavigate }) {
  return (
    <div className="min-h-screen w-full bg-surface-primary p-12">
      <div className="mx-auto max-w-7xl space-y-12">
        <div>
          <h1 className="kol-heading-sm text-fg-96">Hall of Mirrors</h1>
          <p className="kol-helper-s text-fg-64 mt-2">Research playground for displacement, movement, and replication experiments.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {HALLS.map((hall) => (
            <div
              key={hall.id}
              className="group flex h-60 flex-col gap-3 rounded border border-fg-08 bg-surface-secondary p-6 cursor-pointer hover:border-accent-primary transition-all"
              onClick={() => onNavigate(hall.id)}
            >
              <div>
                <h3 className="kol-helper-xs text-fg-96 uppercase">{hall.label}</h3>
                <p className="kol-helper-xs text-fg-64 mt-1">{hall.subtitle}</p>
              </div>
              <div className="flex flex-1 items-center justify-center overflow-hidden rounded border border-fg-08">
                <div className="kol-helper-s text-fg-32 transition-transform duration-300 group-hover:scale-105">
                  Enter
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function App() {
  const [currentHall, setCurrentHall] = useState(null)

  const handleBack = () => setCurrentHall(null)

  if (currentHall === 'apparatus') return <ApparatusHallOfMirrors onBack={handleBack} />
  if (currentHall === 'displacement') return <HallOfDisplacement onBack={handleBack} />
  if (currentHall === 'movement') return <HallOfMovement onBack={handleBack} />
  if (currentHall === 'copies') return <HallOfCopies onBack={handleBack} />
  if (currentHall === 'symphony') return <HallOfSymphony onBack={handleBack} />
  if (currentHall === 'archive') return <HallOfArchive onBack={handleBack} />

  return <SplashScreen onNavigate={setCurrentHall} />
}

export default App
