import MirrorVariant from '../hall-of-mirrors/MirrorVariant'
import MovementVariant from '../hall-of-mirrors/MovementVariant'
import PixiSliceVariant from '../hall-of-mirrors/PixiSliceVariant'
import PixiGlitchSliceVariant from '../hall-of-mirrors/PixiGlitchSliceVariant'
import PixiMorphVariant from '../hall-of-mirrors/PixiMorphVariant'
import PixiRadialVariant from '../hall-of-mirrors/PixiRadialVariant'
import PixiKaleidoscopeVariant from '../hall-of-mirrors/PixiKaleidoscopeVariant'
import { isDisplacementVariant, isMovementVariant, isPixiVariant, scaleParamsByIntensity, findVariant, buildChannelFxStyle } from '../../data/mirrorVariants'

const PIXI_COMPONENTS = {
  'pixi-slices': PixiSliceVariant,
  'pixi-glitch': PixiGlitchSliceVariant,
  'pixi-morph': PixiMorphVariant,
  'pixi-radial': PixiRadialVariant,
  'pixi-kaleidoscope': PixiKaleidoscopeVariant,
}

export default function ChannelLayer({ channel, channelIndex, imageSrc, rasterSrc, defaultSvgSrc, isAnimating, imageFitMode, imageScale, rawParams = false, onParamChange }) {
  if (!channel.enabled) return null

  const effectSrc = rasterSrc || imageSrc
  const hasCustomImage = imageSrc && !imageSrc.startsWith('data:image/svg+xml')
  const fxStyle = buildChannelFxStyle(channel.fx)
  const blendStyle = channel.blendMode && channel.blendMode !== 'normal' ? { mixBlendMode: channel.blendMode } : {}

  // Enabled but no effect — show the source as it was (SVG or uploaded image)
  if (!channel.variantId) {
    const src = hasCustomImage ? imageSrc : defaultSvgSrc
    if (!src) return null
    return (
      <div className="absolute inset-0 flex items-center justify-center" style={{ opacity: channel.opacity / 100, pointerEvents: 'none', ...fxStyle, ...blendStyle }}>
        <img
          src={src}
          alt="Channel source"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: `translate(-50%, -50%)${imageFitMode === 'manual' ? ` scale(${imageScale / 100})` : ''}`,
            ...(imageFitMode === 'contain' ? (hasCustomImage ? { maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto' } : { height: '60%', width: 'auto', maxWidth: '100%' }) : {}),
            ...(imageFitMode === 'fit-width' ? { width: '100%', height: 'auto' } : {}),
            ...(imageFitMode === 'fit-height' ? { height: '100%', width: 'auto' } : {}),
            ...(imageFitMode === 'manual' ? { width: 'auto', height: 'auto' } : {}),
          }}
        />
      </div>
    )
  }

  const variant = findVariant(channel.variantId)
  if (!variant) return null

  // Dial as multiplier relative to base position. At baseIntensity = 1x (exact slot params). Above = overdrive.
  const base = channel.baseIntensity || 100
  const multiplier = (base > 0 ? channel.intensity / base : 1) * (channel.boosted ? 2 : 1)
  let scaledParams
  if (rawParams || multiplier === 1) {
    scaledParams = channel.params
  } else {
    scaledParams = { ...channel.params }
    const ik = variant.intensityKeys || []
    for (const key of ik) {
      if (key in scaledParams && typeof scaledParams[key] === 'number') {
        scaledParams[key] = scaledParams[key] * multiplier
      }
    }
  }
  const timeScale = channel.speed / 100
  if (!effectSrc) return null

  // Displacement — renders MirrorVariant with its own SVG filter
  if (isDisplacementVariant(channel.variantId)) {
    return (
      <div className="absolute inset-0" style={{ opacity: channel.opacity / 100, pointerEvents: 'none', ...fxStyle, ...blendStyle }}>
        <MirrorVariant
          title={`${channel.variantId}-ch-${channelIndex}`}
          baseFrequency={scaledParams.baseFrequency}
          numOctaves={scaledParams.numOctaves}
          scale={scaledParams.scale}
          seed={scaledParams.seed}
          turbulenceType={scaledParams.turbulenceType}
          xChannelSelector={scaledParams.xChannelSelector}
          yChannelSelector={scaledParams.yChannelSelector}
          animate={isAnimating}
          speed={scaledParams.speed}
          timeScale={timeScale}
          isEnabled={true}
          isSelected={true}
          onToggleEnabled={() => {}}
          onToggleSelect={() => {}}
          onImageUpload={() => {}}
          fullBleed
        >
          <img
            src={effectSrc}
            alt={variant.title}
            className="h-full w-full object-cover pointer-events-none"
          />
        </MirrorVariant>
      </div>
    )
  }

  // Movement — renders MovementVariant with GSAP transforms
  if (isMovementVariant(channel.variantId)) {
    return (
      <div className="absolute inset-0" style={{ opacity: channel.opacity / 100, pointerEvents: 'none', ...fxStyle, ...blendStyle }}>
        <MovementVariant
          title={`${channel.variantId}-ch-${channelIndex}`}
          imageSrc={effectSrc}
          isEnabled={isAnimating}
          speed={scaledParams.speed}
          amount={scaledParams.amount}
          easing={scaledParams.easing}
          type={scaledParams.type}
          transformOrigin={scaledParams.transformOrigin}
          timeScale={timeScale}
        />
      </div>
    )
  }

  // Pixi — renders the appropriate WebGL component
  if (isPixiVariant(channel.variantId)) {
    const Component = PIXI_COMPONENTS[channel.variantId]
    if (!Component) return null

    const speedMultiplier = channel.speed / 100
    const effectiveSpeed = (scaledParams.speed || 1) * speedMultiplier
    const effectiveBgSpeed = (scaledParams.bgSpeed || 0.5) * speedMultiplier

    return (
      <div className="absolute inset-0 pixi-fullbleed" style={{ opacity: channel.opacity / 100, pointerEvents: 'none', ...fxStyle, ...blendStyle }}>
        <Component
          title={`${channel.variantId}-ch-${channelIndex}`}
          imageSrc={effectSrc}
          isEnabled={true}
          isSelected={true}
          onToggleEnabled={() => {}}
          onToggleSelect={() => {}}
          onImageUpload={() => {}}
          onParamChange={onParamChange}
          {...scaledParams}
          imageFitMode={imageFitMode}
          speed={effectiveSpeed}
          bgSpeed={effectiveBgSpeed}
          animate={isAnimating}
          bgAnimate={isAnimating}
        />
      </div>
    )
  }

  return null
}
