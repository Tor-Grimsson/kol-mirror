import MirrorVariant from './MirrorVariant'
import DistortionControlsPanel from './DistortionControlsPanel'
import PixiSliceVariant from './PixiSliceVariant'
import PixiGlitchSliceVariant from './PixiGlitchSliceVariant'
import PixiMorphVariant from './PixiMorphVariant'
import PixiRadialVariant from './PixiRadialVariant'
import { useVariantToggle } from './useVariantToggle'

const SVG_KEYS = [
  'subtle-ripple', 'medium-wave', 'heavy-distortion', 'fine-grain',
  'liquid-surface', 'animated-turbulence', 'extreme-warp', 'glass-refraction'
]
const PIXI_KEYS = ['pixi-slices', 'pixi-glitch', 'pixi-morph', 'pixi-radial']

const ApparatusHallOfMirrors = ({ onBack }) => {
  const defaultImageSrc = '/images/stack-hero-800.jpg'
  const {
    variantImages, animationsEnabled, setAnimationsEnabled,
    scale, setScale, baseFrequency, setBaseFrequency,
    numOctaves, setNumOctaves, variantEnabled, selectedVariant,
    handleToggleEnabled, handleToggleSelect, handleImageUpload
  } = useVariantToggle([...SVG_KEYS, ...PIXI_KEYS], 'liquid-surface')

  return (
    <div className="min-h-screen w-full bg-surface-primary p-12">
      <div className="mx-auto max-w-7xl space-y-12">
        <div>
          {onBack && (
            <div className="kol-helper-xs cursor-pointer text-fg-64 hover:text-fg-96 mb-6" onClick={onBack}>
              [BACK]
            </div>
          )}
          <h1 className="kol-heading-sm">Hall of Mirrors</h1>
          <p className="kol-helper-s text-fg-64 mt-2">SVG displacement effects using GSAP AttrPlugin to animate turbulence and displacement parameters. Each variant demonstrates different combinations of baseFrequency, numOctaves, and scale values.</p>
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

        <div className="grid grid-cols-2 gap-8">
          {/* Subtle Ripple */}
          <MirrorVariant
            title="Subtle Ripple"
            baseFrequency={selectedVariant === 'subtle-ripple' ? baseFrequency : 0.005}
            numOctaves={selectedVariant === 'subtle-ripple' ? numOctaves : 1}
            scale={selectedVariant === 'subtle-ripple' ? scale : 10}
            seed={1}
            animate={animationsEnabled}
            isEnabled={variantEnabled['subtle-ripple']}
            isSelected={selectedVariant === 'subtle-ripple'}
            onToggleEnabled={() => handleToggleEnabled('subtle-ripple')}
            onToggleSelect={() => handleToggleSelect('subtle-ripple')}
            onImageUpload={handleImageUpload('subtle-ripple')}
          >
            <img src={variantImages['subtle-ripple'] || defaultImageSrc} alt="Subtle ripple effect" className="h-full w-full object-cover pointer-events-none" />
          </MirrorVariant>

          {/* Medium Wave */}
          <MirrorVariant
            title="Medium Wave"
            baseFrequency={selectedVariant === 'medium-wave' ? baseFrequency : 0.01}
            numOctaves={selectedVariant === 'medium-wave' ? numOctaves : 2}
            scale={selectedVariant === 'medium-wave' ? scale : 20}
            seed={2}
            animate={animationsEnabled}
            isEnabled={variantEnabled['medium-wave']}
            isSelected={selectedVariant === 'medium-wave'}
            onToggleEnabled={() => handleToggleEnabled('medium-wave')}
            onToggleSelect={() => handleToggleSelect('medium-wave')}
            onImageUpload={handleImageUpload('medium-wave')}
          >
            <img src={variantImages['medium-wave'] || defaultImageSrc} alt="Medium wave effect" className="h-full w-full object-cover pointer-events-none" />
          </MirrorVariant>

          {/* Heavy Distortion */}
          <MirrorVariant
            title="Heavy Distortion"
            baseFrequency={selectedVariant === 'heavy-distortion' ? baseFrequency : 0.02}
            numOctaves={selectedVariant === 'heavy-distortion' ? numOctaves : 3}
            scale={selectedVariant === 'heavy-distortion' ? scale : 40}
            seed={3}
            animate={animationsEnabled}
            isEnabled={variantEnabled['heavy-distortion']}
            isSelected={selectedVariant === 'heavy-distortion'}
            onToggleEnabled={() => handleToggleEnabled('heavy-distortion')}
            onToggleSelect={() => handleToggleSelect('heavy-distortion')}
            onImageUpload={handleImageUpload('heavy-distortion')}
          >
            <img src={variantImages['heavy-distortion'] || defaultImageSrc} alt="Heavy distortion effect" className="h-full w-full object-cover pointer-events-none" />
          </MirrorVariant>

          {/* Fine Grain */}
          <MirrorVariant
            title="Fine Grain"
            baseFrequency={selectedVariant === 'fine-grain' ? baseFrequency : 0.05}
            numOctaves={selectedVariant === 'fine-grain' ? numOctaves : 4}
            scale={selectedVariant === 'fine-grain' ? scale : 15}
            seed={4}
            animate={animationsEnabled}
            isEnabled={variantEnabled['fine-grain']}
            isSelected={selectedVariant === 'fine-grain'}
            onToggleEnabled={() => handleToggleEnabled('fine-grain')}
            onToggleSelect={() => handleToggleSelect('fine-grain')}
            onImageUpload={handleImageUpload('fine-grain')}
          >
            <img src={variantImages['fine-grain'] || defaultImageSrc} alt="Fine grain effect" className="h-full w-full object-cover pointer-events-none" />
          </MirrorVariant>

          {/* Liquid Surface */}
          <MirrorVariant
            title="Liquid Surface"
            baseFrequency={selectedVariant === 'liquid-surface' ? baseFrequency : 0.008}
            numOctaves={selectedVariant === 'liquid-surface' ? numOctaves : 2}
            scale={selectedVariant === 'liquid-surface' ? scale : 30}
            seed={5}
            animate={animationsEnabled}
            isEnabled={variantEnabled['liquid-surface']}
            isSelected={selectedVariant === 'liquid-surface'}
            onToggleEnabled={() => handleToggleEnabled('liquid-surface')}
            onToggleSelect={() => handleToggleSelect('liquid-surface')}
            onImageUpload={handleImageUpload('liquid-surface')}
          >
            <img src={variantImages['liquid-surface'] || defaultImageSrc} alt="Liquid surface effect" className="h-full w-full object-cover pointer-events-none" />
          </MirrorVariant>

          {/* Animated Turbulence */}
          <MirrorVariant
            title="Animated Turbulence"
            baseFrequency={selectedVariant === 'animated-turbulence' ? baseFrequency : 0.01}
            numOctaves={selectedVariant === 'animated-turbulence' ? numOctaves : 2}
            scale={selectedVariant === 'animated-turbulence' ? scale : 25}
            seed={6}
            animate={animationsEnabled}
            isEnabled={variantEnabled['animated-turbulence']}
            isSelected={selectedVariant === 'animated-turbulence'}
            onToggleEnabled={() => handleToggleEnabled('animated-turbulence')}
            onToggleSelect={() => handleToggleSelect('animated-turbulence')}
            onImageUpload={handleImageUpload('animated-turbulence')}
          >
            <img src={variantImages['animated-turbulence'] || defaultImageSrc} alt="Animated turbulence effect" className="h-full w-full object-cover pointer-events-none" />
          </MirrorVariant>

          {/* Extreme Warp */}
          <MirrorVariant
            title="Extreme Warp"
            baseFrequency={selectedVariant === 'extreme-warp' ? baseFrequency : 0.03}
            numOctaves={selectedVariant === 'extreme-warp' ? numOctaves : 4}
            scale={selectedVariant === 'extreme-warp' ? scale : 60}
            seed={7}
            animate={animationsEnabled}
            isEnabled={variantEnabled['extreme-warp']}
            isSelected={selectedVariant === 'extreme-warp'}
            onToggleEnabled={() => handleToggleEnabled('extreme-warp')}
            onToggleSelect={() => handleToggleSelect('extreme-warp')}
            onImageUpload={handleImageUpload('extreme-warp')}
          >
            <img src={variantImages['extreme-warp'] || defaultImageSrc} alt="Extreme warp effect" className="h-full w-full object-cover pointer-events-none" />
          </MirrorVariant>

          {/* Glass Refraction */}
          <MirrorVariant
            title="Glass Refraction"
            baseFrequency={selectedVariant === 'glass-refraction' ? baseFrequency : 0.015}
            numOctaves={selectedVariant === 'glass-refraction' ? numOctaves : 3}
            scale={selectedVariant === 'glass-refraction' ? scale : 35}
            seed={8}
            animate={animationsEnabled}
            isEnabled={variantEnabled['glass-refraction']}
            isSelected={selectedVariant === 'glass-refraction'}
            onToggleEnabled={() => handleToggleEnabled('glass-refraction')}
            onToggleSelect={() => handleToggleSelect('glass-refraction')}
            onImageUpload={handleImageUpload('glass-refraction')}
          >
            <img src={variantImages['glass-refraction'] || defaultImageSrc} alt="Glass refraction effect" className="h-full w-full object-cover pointer-events-none" />
          </MirrorVariant>

          {/* PixiJS Slices */}
          <PixiSliceVariant
            title="PixiJS Slices"
            imageSrc={variantImages['pixi-slices'] || defaultImageSrc}
            isEnabled={variantEnabled['pixi-slices']}
            isSelected={selectedVariant === 'pixi-slices'}
            onToggleEnabled={() => handleToggleEnabled('pixi-slices')}
            onToggleSelect={() => handleToggleSelect('pixi-slices')}
            onImageUpload={handleImageUpload('pixi-slices')}
            animate={animationsEnabled}
            tileScaleX={selectedVariant === 'pixi-slices' ? scale / 100 : 0.3}
            speed={selectedVariant === 'pixi-slices' ? baseFrequency * 100 : 1}
          />

          {/* PixiJS Glitch */}
          <PixiGlitchSliceVariant
            title="PixiJS Glitch"
            imageSrc={variantImages['pixi-glitch'] || defaultImageSrc}
            isEnabled={variantEnabled['pixi-glitch']}
            isSelected={selectedVariant === 'pixi-glitch'}
            onToggleEnabled={() => handleToggleEnabled('pixi-glitch')}
            onToggleSelect={() => handleToggleSelect('pixi-glitch')}
            onImageUpload={handleImageUpload('pixi-glitch')}
            animate={animationsEnabled}
            sliceCount={selectedVariant === 'pixi-glitch' ? Math.max(10, Math.round(numOctaves * 5)) : 20}
            maxOffset={selectedVariant === 'pixi-glitch' ? scale : 50}
            speed={selectedVariant === 'pixi-glitch' ? baseFrequency * 100 : 1}
          />

          {/* PixiJS Morph */}
          <PixiMorphVariant
            title="PixiJS Morph"
            imageSrc={variantImages['pixi-morph'] || defaultImageSrc}
            isEnabled={variantEnabled['pixi-morph']}
            isSelected={selectedVariant === 'pixi-morph'}
            onToggleEnabled={() => handleToggleEnabled('pixi-morph')}
            onToggleSelect={() => handleToggleSelect('pixi-morph')}
            onImageUpload={handleImageUpload('pixi-morph')}
            animate={animationsEnabled}
            scaleIntensity={selectedVariant === 'pixi-morph' ? 1 + (scale / 50) : 2}
            speed={selectedVariant === 'pixi-morph' ? baseFrequency * 100 : 1}
          />

          {/* PixiJS Radial */}
          <PixiRadialVariant
            title="PixiJS Radial"
            imageSrc={variantImages['pixi-radial'] || defaultImageSrc}
            isEnabled={variantEnabled['pixi-radial']}
            isSelected={selectedVariant === 'pixi-radial'}
            onToggleEnabled={() => handleToggleEnabled('pixi-radial')}
            onToggleSelect={() => handleToggleSelect('pixi-radial')}
            onImageUpload={handleImageUpload('pixi-radial')}
            animate={animationsEnabled}
            radius={selectedVariant === 'pixi-radial' ? scale : 50}
            tileScale={selectedVariant === 'pixi-radial' ? numOctaves / 8 : 0.5}
            speed={selectedVariant === 'pixi-radial' ? baseFrequency * 100 : 1}
          />
        </div>

        <div className="rounded border border-fg-08 bg-surface-secondary p-6 space-y-4">
          <h2 className="kol-heading-sm">Implementation Notes</h2>
          <ul className="kol-helper-s text-fg-64 space-y-2 list-disc pl-6">
            <li><strong>SVG Displacement (Variants 1-8):</strong> Uses feTurbulence and feDisplacementMap for organic distortion effects.</li>
            <li><strong>baseFrequency:</strong> Controls the size/frequency of distortion (0.001-0.1). Lower = larger waves. For PixiJS variants: controls animation speed.</li>
            <li><strong>numOctaves:</strong> Complexity/detail level (1-4). Higher = more intricate patterns. For Glitch: controls slice count (numOctaves × 5). For Radial: controls tile scale.</li>
            <li><strong>scale:</strong> Intensity of displacement (1-100+). Higher = more extreme distortion. For Glitch: max offset. For Morph: scale intensity. For Radial: orbit radius.</li>
            <li><strong>seed:</strong> Random seed for turbulence pattern. Different values create unique patterns.</li>
            <li><strong>Animation:</strong> GSAP AttrPlugin animates SVG filter attributes in real-time.</li>
            <li><strong>PixiJS TilingSprite (Variant 9):</strong> WebGL-powered vertical slice effect. Controllable tile scale and horizontal shift speed.</li>
            <li><strong>PixiJS Glitch (Variant 10):</strong> WebGL-powered horizontal glitch effect. Random horizontal offsets for image slices (scan line corruption aesthetic).</li>
            <li><strong>PixiJS Morph (Variant 11):</strong> WebGL-powered breathing/pulsing effect. Sin/cos scale animation with diagonal shift creates organic morphing pattern.</li>
            <li><strong>PixiJS Radial (Variant 12):</strong> WebGL-powered circular orbit effect. Tiles shift in circular motion creating orbital kaleidoscope pattern.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default ApparatusHallOfMirrors
