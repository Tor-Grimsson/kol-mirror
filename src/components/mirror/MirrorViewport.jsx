import MirrorVariant from '../hall-of-mirrors/MirrorVariant'
import MovementVariant from '../hall-of-mirrors/MovementVariant'
import PixiSliceVariant from '../hall-of-mirrors/PixiSliceVariant'
import PixiGlitchSliceVariant from '../hall-of-mirrors/PixiGlitchSliceVariant'
import PixiMorphVariant from '../hall-of-mirrors/PixiMorphVariant'
import PixiRadialVariant from '../hall-of-mirrors/PixiRadialVariant'
import PixiKaleidoscopeVariant from '../hall-of-mirrors/PixiKaleidoscopeVariant'
import useImageTiers from '../../hooks/useImageTiers'
import { getRasterTier } from '../../data/mirrorVariants'
import SymphonyViewport from './SymphonyViewport'
import ArchiveViewport from './ArchiveViewport'
import WideOnly from '../WideOnly'
import PresetsViewport from './PresetsViewport'
import { useRef, useState, useEffect } from 'react'
import { findVariant, IMAGE_SIZES } from '../../data/mirrorVariants'

const RATIO_MAP = {
  '16:9': '16 / 9',
  '5:3': '5 / 3',
  '4:3': '4 / 3',
  '1:1': '1 / 1',
  '3:4': '3 / 4',
  '3:5': '3 / 5',
  '9:16': '9 / 16',
}

function CanvasFrame({ ratio, customWidth, customHeight, hallLabel, children }) {
  /* HOOK ORDER. The `ratio === 'none'` early return used to sit ABOVE these
     three hooks — one of the four conditional-hook errors standing in this file
     since before 2026-08-30, and the only one this session had to touch: the
     mobile studio pins `ratio` to 'none' for a full-bleed canvas while the desk
     keeps '16:9', so dragging a window across the 768 fold changed the hook
     count between renders and React throws on the next one. Latent before, live
     the moment a phone layout exists.
     `CopiesViewport`'s is untouched — a live instrument path, and not mine. */
  const containerRef = useRef(null)
  const [frameSize, setFrameSize] = useState({ width: 0, height: 0 })

  const [rw, rh] = ratio === 'none'
    ? [1, 1]
    : ratio === 'custom'
      ? [customWidth, customHeight]
      : ratio.split(':').map(Number)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const update = () => {
      const { width: cw, height: ch } = el.getBoundingClientRect()
      const ar = rw / rh
      // Fit within container preserving aspect ratio
      let w = cw
      let h = cw / ar
      if (h > ch) {
        h = ch
        w = ch * ar
      }
      setFrameSize({ width: Math.floor(w), height: Math.floor(h) })
    }

    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [rw, rh])

  /* The early return, now BELOW every hook — same behaviour as before for the
     desk, no hook-count change across a resize. */
  if (ratio === 'none') return children

  const ratioLabel = ratio === 'custom' ? `${customWidth}x${customHeight}` : ratio

  return (
    <div className="absolute inset-0 flex flex-col p-4">
      <div className="flex items-center justify-between shrink-0 mb-4">
        <div className="kol-helper-14 text-fg-64">{hallLabel} Canvas</div>
        <div className="kol-helper-12 text-fg-32">[{ratioLabel}]</div>
      </div>
      <div ref={containerRef} className="flex-1 flex items-start justify-start min-h-0">
        {frameSize.width > 0 && frameSize.height > 0 && (
          <div
            className="relative overflow-hidden border border-fg-08"
            style={{
              width: `${frameSize.width}px`,
              height: `${frameSize.height}px`,
              borderRadius: '4px',
            }}
          >
            {children}
          </div>
        )}
      </div>
    </div>
  )
}

const PIXI_COMPONENTS = {
  'pixi-slices': PixiSliceVariant,
  'pixi-glitch': PixiGlitchSliceVariant,
  'pixi-morph': PixiMorphVariant,
  'pixi-radial': PixiRadialVariant,
  'pixi-kaleidoscope': PixiKaleidoscopeVariant,
}

function DisplacementViewport({ state }) {
  const variantData = findVariant(state.activeVariant)
  if (!variantData) return null
  const params = state.getVariantParams(state.activeVariant)
  const imageSrc = state.getImageSrc(state.activeVariant)

  return (
    <MirrorVariant
      title={variantData.title}
      baseFrequency={params.baseFrequency}
      numOctaves={params.numOctaves}
      scale={params.scale}
      seed={params.seed}
      turbulenceType={params.turbulenceType}
      xChannelSelector={params.xChannelSelector}
      yChannelSelector={params.yChannelSelector}
      animate={params.animate}
      speed={params.speed}
      isEnabled={true}
      isSelected={true}
      onToggleEnabled={() => {}}
      onToggleSelect={() => {}}
      onImageUpload={() => {}}
      fullBleed
    >
      <img
        src={imageSrc}
        alt={variantData.title}
        className="pointer-events-none"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: `translate(-50%, -50%)${state.imageFitMode === 'manual' ? ` scale(${state.imageScale / 100})` : ''}`,
          ...(state.imageFitMode === 'contain' ? { maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto' } : {}),
          ...(state.imageFitMode === 'fit-width' ? { width: '100%', height: 'auto' } : {}),
          ...(state.imageFitMode === 'fit-height' ? { height: '100%', width: 'auto' } : {}),
          ...(state.imageFitMode === 'manual' ? { width: 'auto', height: 'auto' } : {}),
        }}
      />
    </MirrorVariant>
  )
}

function CopiesViewport({ state }) {
  const Component = PIXI_COMPONENTS[state.activeVariant]
  if (!Component) return null
  const params = state.getVariantParams(state.activeVariant)
  const rawImageSrc = state.getImageSrc(state.activeVariant)
  const { tiers, ready } = useImageTiers(rawImageSrc)
  const tier = getRasterTier(state.activeVariant, params)
  const imageSrc = (ready && tiers[tier]) || rawImageSrc

  return (
    <div className="absolute inset-0 pixi-fullbleed">
      <Component
        title={state.activeVariant}
        imageSrc={imageSrc}
        isEnabled={true}
        isSelected={true}
        onToggleEnabled={() => {}}
        onToggleSelect={() => {}}
        onImageUpload={() => {}}
        onParamChange={(key, value) => state.setVariantParam(state.activeVariant, key, value)}
        {...params}
      />
    </div>
  )
}

function MovementViewport({ state }) {
  const params = state.getVariantParams(state.activeVariant)
  if (!params) return null
  const imageSrc = state.getImageSrc(state.activeVariant)

  return (
    <MovementVariant
      title={state.activeVariant}
      imageSrc={imageSrc}
      isEnabled={params.animate}
      speed={params.speed}
      amount={params.amount}
      easing={params.easing}
      type={params.type}
      transformOrigin={params.transformOrigin}
    />
  )
}

export default function MirrorViewport({ state }) {
  const isVariantHall = ['displacement', 'movement', 'copies'].includes(state.activeHall)
  const showDefault = !state.activeHall || (isVariantHall && !state.activeVariant)

  return (
    <div className="absolute inset-0 overflow-hidden">
      {showDefault && (
        <img
          src="/images/stack-hero-800.jpg"
          srcSet={IMAGE_SIZES.map(w => `/images/stack-hero-${w}.jpg ${w}w`).join(', ')}
          sizes="100vw"
          alt="Hall of Mirrors"
          className="w-full h-full object-cover"
        />
      )}

      {state.activeHall === 'displacement' && state.activeVariant && (
        <CanvasFrame ratio={state.hallCanvasRatio} customWidth={state.hallCustomWidth} customHeight={state.hallCustomHeight} hallLabel="Displacement">
          <DisplacementViewport state={state} />
        </CanvasFrame>
      )}

      {state.activeHall === 'copies' && state.activeVariant && (
        <CanvasFrame ratio={state.hallCanvasRatio} customWidth={state.hallCustomWidth} customHeight={state.hallCustomHeight} hallLabel="Copies">
          <CopiesViewport state={state} />
        </CanvasFrame>
      )}

      {state.activeHall === 'movement' && state.activeVariant && (
        <CanvasFrame ratio={state.hallCanvasRatio} customWidth={state.hallCustomWidth} customHeight={state.hallCustomHeight} hallLabel="Movement">
          <MovementViewport state={state} />
        </CanvasFrame>
      )}

      {/* The desk is gated HERE rather than in the mobile sheet's hall list,
          because the sheet is not the only way in: /library's CREATE view and
          the home cards deep-link straight to `symphony` through
          `location.state`, and a saved hall survives a reload. One gate at the
          render, not a guard at each entrance. */}
      {state.activeHall === 'symphony' && (
        <WideOnly what="The Symphony mixer"><SymphonyViewport state={state} /></WideOnly>
      )}

      {state.activeHall === 'archive' && <ArchiveViewport state={state} />}

      {state.activeHall === 'presets' && <PresetsViewport />}
    </div>
  )
}
