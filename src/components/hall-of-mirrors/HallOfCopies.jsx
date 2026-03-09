import { useState } from 'react'
import DistortionControlsPanel from './DistortionControlsPanel'
import PixiSliceVariant from './PixiSliceVariant'
import PixiGlitchSliceVariant from './PixiGlitchSliceVariant'
import PixiMorphVariant from './PixiMorphVariant'
import PixiRadialVariant from './PixiRadialVariant'
import PixiKaleidoscopeVariant from './PixiKaleidoscopeVariant'

const HallOfCopies = ({ onBack }) => {
  const defaultImageSrc = '/images/stack-hero-800.jpg'
  const [variantImages, setVariantImages] = useState({})
  const [animationsEnabled, setAnimationsEnabled] = useState(false)
  const [scale, setScale] = useState(25)
  const [baseFrequency, setBaseFrequency] = useState(0.01)
  const [numOctaves, setNumOctaves] = useState(2)

  const [variantEnabled, setVariantEnabled] = useState({
    'pixi-slices': false,
    'pixi-glitch': false,
    'pixi-morph': false,
    'pixi-radial': false,
    'pixi-kaleidoscope': false
  })

  const [selectedVariant, setSelectedVariant] = useState('pixi-glitch')

  const handleToggleEnabled = (variantId) => {
    setVariantEnabled(prev => ({
      ...prev,
      [variantId]: !prev[variantId]
    }))
  }

  const handleToggleSelect = (variantId) => {
    if (selectedVariant === variantId) {
      setSelectedVariant(null)
    } else {
      setSelectedVariant(variantId)
    }
  }

  const handleImageUpload = (variantId) => (e) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setVariantImages(prev => ({
          ...prev,
          [variantId]: event.target.result
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="min-h-screen w-full bg-surface-primary p-12">
      <div className="mx-auto max-w-7xl space-y-12">
        <div>
          <div className="kol-helper-xs cursor-pointer text-fg-64 hover:text-fg-96 mb-6" onClick={onBack}>
            [BACK]
          </div>
          <h1 className="kol-heading-sm text-fg-96">Hall of Copies</h1>
          <p className="kol-helper-s text-fg-64 mt-2">PixiJS TilingSprite effects for repeating patterns, glitch aesthetics, and morphing tiles. WebGL-accelerated with precise control over delays, repetition, and transformation.</p>
        </div>

        <div className="fixed right-8 bottom-8 z-50 w-80">
          <DistortionControlsPanel
            enabled={animationsEnabled}
            onEnabledChange={setAnimationsEnabled}
            scale={scale}
            onScaleChange={setScale}
            baseFrequency={baseFrequency}
            onBaseFrequencyChange={setBaseFrequency}
            numOctaves={numOctaves}
            onNumOctavesChange={setNumOctaves}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <PixiSliceVariant
            title="PixiJS Slices"
            imageSrc={variantImages['pixi-slices'] || defaultImageSrc}
            isEnabled={variantEnabled['pixi-slices']}
            isSelected={selectedVariant === 'pixi-slices'}
            onToggleEnabled={() => handleToggleEnabled('pixi-slices')}
            onToggleSelect={() => handleToggleSelect('pixi-slices')}
            onImageUpload={handleImageUpload('pixi-slices')}
            animate={selectedVariant === 'pixi-slices' && animationsEnabled}
            tileScaleX={selectedVariant === 'pixi-slices' ? scale / 100 : 0.3}
            speed={selectedVariant === 'pixi-slices' ? baseFrequency * 100 : 1}
          />

          <PixiGlitchSliceVariant
            title="PixiJS Glitch"
            imageSrc={variantImages['pixi-glitch'] || defaultImageSrc}
            isEnabled={variantEnabled['pixi-glitch']}
            isSelected={selectedVariant === 'pixi-glitch'}
            onToggleEnabled={() => handleToggleEnabled('pixi-glitch')}
            onToggleSelect={() => handleToggleSelect('pixi-glitch')}
            onImageUpload={handleImageUpload('pixi-glitch')}
            animate={selectedVariant === 'pixi-glitch' && animationsEnabled}
            sliceCount={selectedVariant === 'pixi-glitch' ? Math.max(10, Math.round(numOctaves * 5)) : 20}
            maxOffset={selectedVariant === 'pixi-glitch' ? scale : 50}
            speed={selectedVariant === 'pixi-glitch' ? baseFrequency * 100 : 1}
          />

          <PixiMorphVariant
            title="PixiJS Morph"
            imageSrc={variantImages['pixi-morph'] || defaultImageSrc}
            isEnabled={variantEnabled['pixi-morph']}
            isSelected={selectedVariant === 'pixi-morph'}
            onToggleEnabled={() => handleToggleEnabled('pixi-morph')}
            onToggleSelect={() => handleToggleSelect('pixi-morph')}
            onImageUpload={handleImageUpload('pixi-morph')}
            animate={selectedVariant === 'pixi-morph' && animationsEnabled}
            scaleIntensity={selectedVariant === 'pixi-morph' ? 1 + (scale / 50) : 2}
            speed={selectedVariant === 'pixi-morph' ? baseFrequency * 100 : 1}
          />

          <PixiRadialVariant
            title="PixiJS Radial"
            imageSrc={variantImages['pixi-radial'] || defaultImageSrc}
            isEnabled={variantEnabled['pixi-radial']}
            isSelected={selectedVariant === 'pixi-radial'}
            onToggleEnabled={() => handleToggleEnabled('pixi-radial')}
            onToggleSelect={() => handleToggleSelect('pixi-radial')}
            onImageUpload={handleImageUpload('pixi-radial')}
            animate={selectedVariant === 'pixi-radial' && animationsEnabled}
            radius={selectedVariant === 'pixi-radial' ? scale : 50}
            tileScale={selectedVariant === 'pixi-radial' ? numOctaves / 8 : 0.5}
            speed={selectedVariant === 'pixi-radial' ? baseFrequency * 100 : 1}
          />

          <PixiKaleidoscopeVariant
            title="PixiJS Kaleidoscope"
            imageSrc={variantImages['pixi-kaleidoscope'] || defaultImageSrc}
            isEnabled={variantEnabled['pixi-kaleidoscope']}
            isSelected={selectedVariant === 'pixi-kaleidoscope'}
            onToggleEnabled={() => handleToggleEnabled('pixi-kaleidoscope')}
            onToggleSelect={() => handleToggleSelect('pixi-kaleidoscope')}
            onImageUpload={handleImageUpload('pixi-kaleidoscope')}
            animate={selectedVariant === 'pixi-kaleidoscope' && animationsEnabled}
            segments={selectedVariant === 'pixi-kaleidoscope' ? Math.max(3, Math.round(numOctaves * 3)) : 6}
            zoom={selectedVariant === 'pixi-kaleidoscope' ? scale / 20 : 1.5}
            speed={selectedVariant === 'pixi-kaleidoscope' ? baseFrequency * 100 : 0.5}
          />

          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex flex-col gap-4 opacity-40">
              <div className="flex items-center justify-between">
                <div className="kol-helper-s text-fg-32">—</div>
                <div className="flex gap-2">
                  <div className="kol-helper-xs text-fg-32">[OFF]</div>
                </div>
              </div>
              <div className="relative aspect-[4/3] overflow-hidden border border-fg-08 bg-surface-secondary" style={{ borderRadius: '4px' }}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="kol-helper-s text-fg-32">Available slot</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="kol-helper-xs text-fg-32 font-mono">—</div>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded border border-fg-08 bg-surface-secondary p-6 space-y-4">
          <h2 className="kol-heading-sm">Implementation Notes</h2>
          <ul className="kol-helper-s text-fg-64 space-y-2 list-disc pl-6">
            <li><strong>PixiJS TilingSprite:</strong> WebGL-accelerated repeating texture effects. GPU-based rendering for smooth performance.</li>
            <li><strong>Scale Slider:</strong> Maps to different parameters per variant - Slices: tile width, Glitch: max offset, Morph: intensity, Radial: orbit radius.</li>
            <li><strong>Base Frequency Slider:</strong> Controls animation speed multiplier (0.001-0.05). All PixiJS variants use this for speed.</li>
            <li><strong>Octaves Slider:</strong> Glitch: slice count (octaves × 5). Radial: tile scale (octaves / 8). Slices/Morph: not used.</li>
            <li><strong>Animation Toggle:</strong> Enable/disable real-time WebGL animations via PixiJS ticker.</li>
            <li><strong>Per-Variant Upload:</strong> Test effects with your own images. Each variant stores its uploaded image independently.</li>
            <li><strong>Vite Compatibility:</strong> All variants use IIFE pattern to avoid top-level await conflicts with Vite build.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default HallOfCopies
