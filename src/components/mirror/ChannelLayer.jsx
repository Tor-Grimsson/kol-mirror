import { useEffect, useRef, useState } from 'react'
import useDomCaptureCanvas from '../../hooks/useDomCaptureCanvas'
import MirrorVariant from '../hall-of-mirrors/MirrorVariant'
import MovementVariant from '../hall-of-mirrors/MovementVariant'
import PixiSliceVariant from '../hall-of-mirrors/PixiSliceVariant'
import PixiGlitchSliceVariant from '../hall-of-mirrors/PixiGlitchSliceVariant'
import PixiMorphVariant from '../hall-of-mirrors/PixiMorphVariant'
import PixiRadialVariant from '../hall-of-mirrors/PixiRadialVariant'
import PixiKaleidoscopeVariant from '../hall-of-mirrors/PixiKaleidoscopeVariant'
import { isDisplacementVariant, isMovementVariant, isPixiVariant, scaleParamsByIntensity, findVariant, buildChannelFxStyle } from '../../data/mirrorVariants'

function ChannelVideo({ blobUrl, mark1, mark2, isPlaying = true, onTimeUpdate: onTimeUpdateCb, seekTo }) {
  const videoRef = useRef(null)
  const cbRef = useRef(onTimeUpdateCb)
  cbRef.current = onTimeUpdateCb

  useEffect(() => {
    if (seekTo == null || !videoRef.current) return
    videoRef.current.currentTime = seekTo
  }, [seekTo])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const inPoint = mark1 ?? 0
    const outPoint = mark2 ?? Infinity

    video.currentTime = inPoint

    const onTimeUpdate = () => {
      if (video.currentTime >= outPoint) video.currentTime = inPoint
      if (cbRef.current) cbRef.current(video.currentTime)
    }
    video.addEventListener('timeupdate', onTimeUpdate)
    return () => video.removeEventListener('timeupdate', onTimeUpdate)
  }, [blobUrl, mark1, mark2])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (isPlaying) video.play().catch(() => {})
    else video.pause()
  }, [isPlaying])

  return (
    <video
      ref={videoRef}
      src={blobUrl}
      autoPlay
      muted
      loop={mark1 == null && mark2 == null}
      className="w-full h-full object-cover"
      style={{ pointerEvents: 'none' }}
    />
  )
}

const PIXI_COMPONENTS = {
  'pixi-slices': PixiSliceVariant,
  'pixi-glitch': PixiGlitchSliceVariant,
  'pixi-morph': PixiMorphVariant,
  'pixi-radial': PixiRadialVariant,
  'pixi-kaleidoscope': PixiKaleidoscopeVariant,
}

export default function ChannelLayer({ channel, channelIndex, imageSrc, rasterSrc, defaultSvgSrc, isAnimating, restartKey = 0, imageFitMode, imageScale, rawParams = false, onParamChange, onCanvasReady, onPlayheadUpdate, seekTo, onRenderCost, getChannelFrame }) {
  const pollTimerRef = useRef(null)
  const movementImgRef = useRef(null)
  const captureReadyFired = useRef(false)
  const wrapperRef = useRef(null)
  const [wrapperSize, setWrapperSize] = useState({ width: 0, height: 0 })

  const isNonPixi = isDisplacementVariant(channel.variantId) || isMovementVariant(channel.variantId)

  // Cross-channel routing: if routeFrom is set, get the routed channel's frame buffer as a data URL
  const [routedSrc, setRoutedSrc] = useState(null)
  const routeFrom = channel.routeFrom
  useEffect(() => {
    if (routeFrom == null || !getChannelFrame) { setRoutedSrc(null); return }
    let active = true
    const tick = () => {
      if (!active) return
      const buf = getChannelFrame(routeFrom)
      if (buf) {
        try {
          const url = buf.convertToBlob ? null : null // OffscreenCanvas — use createImageBitmap path
          // For simplicity, convert to data URL (TODO: optimize with createImageBitmap)
          const tmpCanvas = document.createElement('canvas')
          tmpCanvas.width = buf.width
          tmpCanvas.height = buf.height
          const ctx = tmpCanvas.getContext('2d')
          ctx.drawImage(buf, 0, 0)
          setRoutedSrc(tmpCanvas.toDataURL())
        } catch { /* buffer not ready */ }
      }
      requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
    return () => { active = false }
  }, [routeFrom, getChannelFrame])

  const resolvedImageSrc = routeFrom != null && routedSrc ? routedSrc : imageSrc
  const effectSrc = isNonPixi ? (resolvedImageSrc || rasterSrc) : (rasterSrc || resolvedImageSrc)
  const captureActive = !!channel.isArmedForRec && isNonPixi && channel.enabled

  // Determine filter ID for displacement capture
  const displacementFilterId = isDisplacementVariant(channel.variantId)
    ? `distortion-${channel.variantId}-ch-${channelIndex}`
    : null

  // Measure wrapper size for capture canvas resolution
  useEffect(() => {
    if (captureActive && wrapperRef.current) {
      const { width, height } = wrapperRef.current.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      setWrapperSize({ width: Math.round(width * dpr), height: Math.round(height * dpr) })
    }
  }, [captureActive])

  // DOM capture canvas for non-Pixi variants
  const { canvasRef: captureCanvasRef } = useDomCaptureCanvas({
    active: captureActive && wrapperSize.width > 0,
    sourceImage: effectSrc,
    width: wrapperSize.width,
    height: wrapperSize.height,
    variantType: isDisplacementVariant(channel.variantId) ? 'displacement' : 'movement',
    filterId: displacementFilterId,
    imgElementRef: movementImgRef,
  })

  // When capture canvas is active, notify parent
  useEffect(() => {
    if (captureActive && captureCanvasRef.current && onCanvasReady && !captureReadyFired.current) {
      captureReadyFired.current = true
      // Small delay to let the canvas initialize and source image load
      const timer = setTimeout(() => {
        if (captureCanvasRef.current) onCanvasReady(channelIndex, captureCanvasRef.current)
      }, 200)
      return () => clearTimeout(timer)
    }
    if (!captureActive) captureReadyFired.current = false
  }, [captureActive, channelIndex, onCanvasReady])

  // Cancel stale polling on unmount / re-render
  useEffect(() => {
    return () => { if (pollTimerRef.current) clearTimeout(pollTimerRef.current) }
  }, [channel.isArmedForRec])

  if (!channel.enabled) return null
  const hasCustomImage = imageSrc && !imageSrc.startsWith('data:image/svg+xml')
  const fxStyle = buildChannelFxStyle(channel.fx)
  const blendStyle = channel.blendMode && channel.blendMode !== 'normal' ? { mixBlendMode: channel.blendMode } : {}
  const hasBg = channel.backgroundColor && channel.backgroundColor !== 'transparent'
  const padTransform = channel.vectorPadding ? `scale(${1 / (1 + channel.vectorPadding / 100)})` : ''
  if (padTransform && fxStyle.transform) {
    fxStyle.transform = `${fxStyle.transform} ${padTransform}`
  } else if (padTransform) {
    fxStyle.transform = padTransform
    fxStyle.transformOrigin = 'center'
  }

  // Frozen recording — render video loop instead of live effect
  const activeSlot = channel.activeRecSlot != null ? channel.recSlots?.[channel.activeRecSlot] : null
  if (activeSlot?.blobUrl) {
    return (
      <div className="absolute inset-0" style={{ opacity: channel.opacity / 100, pointerEvents: 'none', ...fxStyle, ...blendStyle }}>
        <ChannelVideo blobUrl={activeSlot.blobUrl} mark1={activeSlot.mark1} mark2={activeSlot.mark2} isPlaying={isAnimating && !channel.recPaused} onTimeUpdate={onPlayheadUpdate} seekTo={seekTo} />
      </div>
    )
  }

  // Enabled but no effect — show the source as it was (SVG or uploaded image)
  if (!channel.variantId) {
    const src = hasCustomImage ? imageSrc : defaultSvgSrc
    if (!src && !hasBg) return null
    return (
      <div className="absolute inset-0 flex items-center justify-center" style={{ opacity: channel.opacity / 100, pointerEvents: 'none', ...fxStyle, ...blendStyle, backgroundColor: hasBg ? channel.backgroundColor : undefined }}>
        {src && <img
          src={src}
          alt="Channel source"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: `translate(-50%, -50%)${imageFitMode === 'manual' ? ` scale(${imageScale / 100})` : ''} scale(${1 / (1 + (channel.vectorPadding || 0) / 100)})`,
            ...(imageFitMode === 'contain' ? (hasCustomImage ? { maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto' } : { height: '60%', width: 'auto', maxWidth: '100%' }) : {}),
            ...(imageFitMode === 'fit-width' ? { width: '100%', height: 'auto' } : {}),
            ...(imageFitMode === 'fit-height' ? { height: '100%', width: 'auto' } : {}),
            ...(imageFitMode === 'manual' ? { width: 'auto', height: 'auto' } : {}),
          }}
        />}
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
  const channelAnimate = scaledParams.animate ?? isAnimating

  // No image source — just render background if set
  if (!effectSrc) {
    if (!hasBg) return null
    return (
      <div className="absolute inset-0" style={{ opacity: channel.opacity / 100, pointerEvents: 'none', backgroundColor: channel.backgroundColor, ...fxStyle, ...blendStyle }} />
    )
  }

  // Displacement — renders MirrorVariant with its own SVG filter
  if (isDisplacementVariant(channel.variantId)) {
    return (
      <div ref={wrapperRef} className="absolute inset-0" style={{ opacity: channel.opacity / 100, pointerEvents: 'none', ...fxStyle, ...blendStyle, ...(hasBg ? { backgroundColor: channel.backgroundColor } : {}) }}>
        <MirrorVariant
          key={`${channel.variantId}-ch-${channelIndex}-r${restartKey}`}
          title={`${channel.variantId}-ch-${channelIndex}`}
          baseFrequency={scaledParams.baseFrequency}
          numOctaves={scaledParams.numOctaves}
          scale={scaledParams.scale}
          seed={scaledParams.seed}
          turbulenceType={scaledParams.turbulenceType}
          xChannelSelector={scaledParams.xChannelSelector}
          yChannelSelector={scaledParams.yChannelSelector}
          animate={channelAnimate}
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
      <div ref={wrapperRef} className="absolute inset-0" style={{ opacity: channel.opacity / 100, pointerEvents: 'none', ...fxStyle, ...blendStyle, ...(hasBg ? { backgroundColor: channel.backgroundColor } : {}) }}>
        <MovementVariant
          key={`${channel.variantId}-ch-${channelIndex}-r${restartKey}`}
          title={`${channel.variantId}-ch-${channelIndex}`}
          imageSrc={effectSrc}
          isEnabled={channelAnimate}
          speed={scaledParams.speed}
          amount={scaledParams.amount}
          easing={scaledParams.easing}
          type={scaledParams.type}
          transformOrigin={scaledParams.transformOrigin}
          timeScale={timeScale}
          externalImgRef={movementImgRef}
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

    const pixiWrapperRef = (el) => {
      if (el && onCanvasReady) {
        // usePixiApp has a 100ms init delay — poll until canvas appears
        const check = () => {
          const canvas = el.querySelector('canvas')
          if (canvas) { pollTimerRef.current = null; onCanvasReady(channelIndex, canvas) }
          else pollTimerRef.current = setTimeout(check, 50)
        }
        pollTimerRef.current = setTimeout(check, 120)
      }
    }

    return (
      <div ref={pixiWrapperRef} className="absolute inset-0 pixi-fullbleed" style={{ opacity: channel.opacity / 100, pointerEvents: 'none', ...fxStyle, ...blendStyle }}>
        {hasBg && <div className="absolute inset-0" style={{ backgroundColor: channel.backgroundColor }} />}
        <Component
          key={`${channel.variantId}-ch-${channelIndex}-${channel.isArmedForRec ? 'rec' : 'live'}-r${restartKey}`}
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
          animate={channelAnimate}
          bgAnimate={channelAnimate}
          preserveDrawingBuffer={!!channel.isArmedForRec}
          onRenderCost={onRenderCost}
        />
      </div>
    )
  }

  return null
}
