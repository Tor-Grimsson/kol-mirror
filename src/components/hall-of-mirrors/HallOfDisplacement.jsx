import MirrorVariant from './MirrorVariant'
import DistortionControlsPanel from './DistortionControlsPanel'
import { useVariantToggle } from './useVariantToggle'

const SVG_KEYS = [
  'subtle-ripple', 'medium-wave', 'heavy-distortion', 'fine-grain',
  'liquid-surface', 'animated-turbulence', 'extreme-warp', 'glass-refraction'
]

const HallOfDisplacement = ({ onBack }) => {
  const defaultImageSrc = '/images/stack-hero-800.jpg'
  const {
    variantImages, animationsEnabled, setAnimationsEnabled,
    scale, setScale, baseFrequency, setBaseFrequency,
    numOctaves, setNumOctaves, variantEnabled, selectedVariant,
    handleToggleEnabled, handleToggleSelect, handleImageUpload
  } = useVariantToggle(SVG_KEYS, 'liquid-surface')

  return (
    <div className="min-h-screen w-full bg-surface-primary p-12">
      <div className="mx-auto max-w-7xl space-y-12">
        <div>
          <div className="kol-helper-xs cursor-pointer text-fg-64 hover:text-fg-96 mb-6" onClick={onBack}>
            [BACK]
          </div>
          <h1 className="kol-heading-sm text-fg-96">Hall of Displacement</h1>
          <p className="kol-helper-s text-fg-64 mt-2">SVG displacement effects using GSAP AttrPlugin to animate turbulence and displacement parameters. Each variant demonstrates different combinations of baseFrequency, numOctaves, and scale values creating organic, wavy distortions.</p>
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
          <MirrorVariant
            title="Subtle Ripple"
            baseFrequency={selectedVariant === 'subtle-ripple' ? baseFrequency : 0.005}
            numOctaves={selectedVariant === 'subtle-ripple' ? numOctaves : 1}
            scale={selectedVariant === 'subtle-ripple' ? scale : 10}
            seed={1}
            animate={selectedVariant === 'subtle-ripple' && animationsEnabled}
            isEnabled={variantEnabled['subtle-ripple']}
            isSelected={selectedVariant === 'subtle-ripple'}
            onToggleEnabled={() => handleToggleEnabled('subtle-ripple')}
            onToggleSelect={() => handleToggleSelect('subtle-ripple')}
            onImageUpload={handleImageUpload('subtle-ripple')}
          >
            <img src={variantImages['subtle-ripple'] || defaultImageSrc} alt="Subtle ripple effect" className="h-full w-full object-cover pointer-events-none" />
          </MirrorVariant>

          <MirrorVariant
            title="Medium Wave"
            baseFrequency={selectedVariant === 'medium-wave' ? baseFrequency : 0.01}
            numOctaves={selectedVariant === 'medium-wave' ? numOctaves : 2}
            scale={selectedVariant === 'medium-wave' ? scale : 20}
            seed={2}
            animate={selectedVariant === 'medium-wave' && animationsEnabled}
            isEnabled={variantEnabled['medium-wave']}
            isSelected={selectedVariant === 'medium-wave'}
            onToggleEnabled={() => handleToggleEnabled('medium-wave')}
            onToggleSelect={() => handleToggleSelect('medium-wave')}
            onImageUpload={handleImageUpload('medium-wave')}
          >
            <img src={variantImages['medium-wave'] || defaultImageSrc} alt="Medium wave effect" className="h-full w-full object-cover pointer-events-none" />
          </MirrorVariant>

          <MirrorVariant
            title="Heavy Distortion"
            baseFrequency={selectedVariant === 'heavy-distortion' ? baseFrequency : 0.02}
            numOctaves={selectedVariant === 'heavy-distortion' ? numOctaves : 3}
            scale={selectedVariant === 'heavy-distortion' ? scale : 40}
            seed={3}
            animate={selectedVariant === 'heavy-distortion' && animationsEnabled}
            isEnabled={variantEnabled['heavy-distortion']}
            isSelected={selectedVariant === 'heavy-distortion'}
            onToggleEnabled={() => handleToggleEnabled('heavy-distortion')}
            onToggleSelect={() => handleToggleSelect('heavy-distortion')}
            onImageUpload={handleImageUpload('heavy-distortion')}
          >
            <img src={variantImages['heavy-distortion'] || defaultImageSrc} alt="Heavy distortion effect" className="h-full w-full object-cover pointer-events-none" />
          </MirrorVariant>

          <MirrorVariant
            title="Fine Grain"
            baseFrequency={selectedVariant === 'fine-grain' ? baseFrequency : 0.05}
            numOctaves={selectedVariant === 'fine-grain' ? numOctaves : 4}
            scale={selectedVariant === 'fine-grain' ? scale : 15}
            seed={4}
            animate={selectedVariant === 'fine-grain' && animationsEnabled}
            isEnabled={variantEnabled['fine-grain']}
            isSelected={selectedVariant === 'fine-grain'}
            onToggleEnabled={() => handleToggleEnabled('fine-grain')}
            onToggleSelect={() => handleToggleSelect('fine-grain')}
            onImageUpload={handleImageUpload('fine-grain')}
          >
            <img src={variantImages['fine-grain'] || defaultImageSrc} alt="Fine grain effect" className="h-full w-full object-cover pointer-events-none" />
          </MirrorVariant>

          <MirrorVariant
            title="Liquid Surface"
            baseFrequency={selectedVariant === 'liquid-surface' ? baseFrequency : 0.008}
            numOctaves={selectedVariant === 'liquid-surface' ? numOctaves : 2}
            scale={selectedVariant === 'liquid-surface' ? scale : 30}
            seed={5}
            animate={selectedVariant === 'liquid-surface' && animationsEnabled}
            isEnabled={variantEnabled['liquid-surface']}
            isSelected={selectedVariant === 'liquid-surface'}
            onToggleEnabled={() => handleToggleEnabled('liquid-surface')}
            onToggleSelect={() => handleToggleSelect('liquid-surface')}
            onImageUpload={handleImageUpload('liquid-surface')}
          >
            <img src={variantImages['liquid-surface'] || defaultImageSrc} alt="Liquid surface effect" className="h-full w-full object-cover pointer-events-none" />
          </MirrorVariant>

          <MirrorVariant
            title="Animated Turbulence"
            baseFrequency={selectedVariant === 'animated-turbulence' ? baseFrequency : 0.01}
            numOctaves={selectedVariant === 'animated-turbulence' ? numOctaves : 2}
            scale={selectedVariant === 'animated-turbulence' ? scale : 25}
            seed={6}
            animate={selectedVariant === 'animated-turbulence' && animationsEnabled}
            isEnabled={variantEnabled['animated-turbulence']}
            isSelected={selectedVariant === 'animated-turbulence'}
            onToggleEnabled={() => handleToggleEnabled('animated-turbulence')}
            onToggleSelect={() => handleToggleSelect('animated-turbulence')}
            onImageUpload={handleImageUpload('animated-turbulence')}
          >
            <img src={variantImages['animated-turbulence'] || defaultImageSrc} alt="Animated turbulence effect" className="h-full w-full object-cover pointer-events-none" />
          </MirrorVariant>

          <MirrorVariant
            title="Extreme Warp"
            baseFrequency={selectedVariant === 'extreme-warp' ? baseFrequency : 0.03}
            numOctaves={selectedVariant === 'extreme-warp' ? numOctaves : 4}
            scale={selectedVariant === 'extreme-warp' ? scale : 60}
            seed={7}
            animate={selectedVariant === 'extreme-warp' && animationsEnabled}
            isEnabled={variantEnabled['extreme-warp']}
            isSelected={selectedVariant === 'extreme-warp'}
            onToggleEnabled={() => handleToggleEnabled('extreme-warp')}
            onToggleSelect={() => handleToggleSelect('extreme-warp')}
            onImageUpload={handleImageUpload('extreme-warp')}
          >
            <img src={variantImages['extreme-warp'] || defaultImageSrc} alt="Extreme warp effect" className="h-full w-full object-cover pointer-events-none" />
          </MirrorVariant>

          <MirrorVariant
            title="Glass Refraction"
            baseFrequency={selectedVariant === 'glass-refraction' ? baseFrequency : 0.015}
            numOctaves={selectedVariant === 'glass-refraction' ? numOctaves : 3}
            scale={selectedVariant === 'glass-refraction' ? scale : 35}
            seed={8}
            animate={selectedVariant === 'glass-refraction' && animationsEnabled}
            isEnabled={variantEnabled['glass-refraction']}
            isSelected={selectedVariant === 'glass-refraction'}
            onToggleEnabled={() => handleToggleEnabled('glass-refraction')}
            onToggleSelect={() => handleToggleSelect('glass-refraction')}
            onImageUpload={handleImageUpload('glass-refraction')}
          >
            <img src={variantImages['glass-refraction'] || defaultImageSrc} alt="Glass refraction effect" className="h-full w-full object-cover pointer-events-none" />
          </MirrorVariant>

          <div className="flex flex-col gap-4 opacity-40">
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
        </div>

        <div className="rounded border border-fg-08 bg-surface-secondary p-6 space-y-4">
          <h2 className="kol-heading-sm">Implementation Notes</h2>
          <ul className="kol-helper-s text-fg-64 space-y-2 list-disc pl-6">
            <li><strong>SVG Displacement:</strong> Uses feTurbulence and feDisplacementMap for organic distortion effects. CPU-based rendering with predictable performance.</li>
            <li><strong>baseFrequency:</strong> Controls the size/frequency of distortion (0.001-0.1). Lower = larger waves, higher = finer grain.</li>
            <li><strong>numOctaves:</strong> Complexity/detail level (1-4). Higher = more intricate patterns with layered noise.</li>
            <li><strong>scale:</strong> Intensity of displacement (1-100+). Higher = more extreme distortion and warping.</li>
            <li><strong>seed:</strong> Random seed for turbulence pattern. Different values create unique distortion patterns.</li>
            <li><strong>Animation:</strong> GSAP AttrPlugin animates SVG filter attributes in real-time for smooth transitions.</li>
            <li><strong>Per-Variant Upload:</strong> Test effects with your own images. Each variant stores its uploaded image independently.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default HallOfDisplacement
