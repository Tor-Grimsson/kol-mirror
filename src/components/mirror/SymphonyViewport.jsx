import { useEffect, useRef, useState } from 'react'
import { findVariant, getDefaultParams, getIntensityDialValue, DISPLACEMENT_VARIANTS, MOVEMENT_VARIANTS, COPIES_VARIANTS } from '../../data/mirrorVariants'
import SymphonyMixer from '../hall-of-mirrors/SymphonyMixer'
import ChannelLayer from './ChannelLayer'
import defaultCanvasSvg from '../../assets/default-canvas.svg?raw'

const DEFAULT_SVG_DATA_URL = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(defaultCanvasSvg)
const CHANNEL_INDEX = { displacement: 0, movement: 1, copies: 2 }

export default function SymphonyViewport({ state }) {
  const canvasContainerRef = useRef(null)
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })
  const [openNineDropdown, setOpenNineDropdown] = useState(null)

  // Channels persisted in global state
  const channels = state.symphonyChannels
  const setChannels = state.setSymphonyChannels

  const isAnimating = state.symphonyAnimating
  const setIsAnimating = state.setSymphonyAnimating
  const mixerLayout = state.symphonyLayout

  // Canvas source images
  const canvasImage = state.symphonyCanvasImage
  const canvasRaster = state.symphonyCanvasRaster
  const hasCustomImage = !!state.symphonyCanvasImage
  const [defaultRasterWhite, setDefaultRasterWhite] = useState(null)
  const [defaultRasterBlack, setDefaultRasterBlack] = useState(null)

  // Rasterize default SVG in both themes on mount
  useEffect(() => {
    const rasterize = (fillColor, callback) => {
      const colored = defaultCanvasSvg.replace(/currentColor/g, fillColor)
      const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(colored)
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.naturalWidth || 1024
        canvas.height = img.naturalHeight || 1024
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        callback(canvas.toDataURL('image/png'))
      }
      img.src = url
    }
    rasterize('#ffffff', setDefaultRasterWhite)
    rasterize('#000000', setDefaultRasterBlack)
  }, [])

  const theme = document.documentElement.getAttribute('data-theme')
  // Dark mode = white content, light mode = black content
  const defaultRaster = theme === 'dark' ? defaultRasterWhite : defaultRasterBlack

  // Image sources for channels
  const svgImageSrc = canvasImage || DEFAULT_SVG_DATA_URL
  const rasterImageSrc = canvasRaster || defaultRaster

  // Color-correct default SVG for dry signal display
  const vectorColor = state.canvasVectorColor === 'currentColor'
    ? (theme === 'dark' ? '#ffffff' : '#000000')
    : state.canvasVectorColor
  const defaultSvgColored = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
    defaultCanvasSvg.replace(/currentColor/g, vectorColor)
  )

  // Canvas sizing
  const [rw, rh] = state.symphonyRatio === 'custom'
    ? [state.symphonyCustomWidth, state.symphonyCustomHeight]
    : (state.symphonyRatio || '16:9').split(':').map(Number)

  useEffect(() => {
    const el = canvasContainerRef.current
    if (!el) return
    const update = () => {
      const { width: cw, height: ch } = el.getBoundingClientRect()
      const ar = rw / rh
      let w = cw
      let h = cw / ar
      if (h > ch) {
        h = ch
        w = ch * ar
      }
      const nw = Math.floor(w)
      const nh = Math.floor(h)
      setCanvasSize(prev => (prev.width === nw && prev.height === nh) ? prev : { width: nw, height: nh })
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [rw, rh])

  // Build dropdown items
  const HALL_PRESETS = [
    { hall: 'Displacement', variants: DISPLACEMENT_VARIANTS },
    { hall: 'Movement', variants: MOVEMENT_VARIANTS },
    { hall: 'Copies', variants: COPIES_VARIANTS },
  ]

  const dropdownItems = [
    ...state.archiveSlots.map((slot, i) => ({
      id: `slot:${i}`,
      name: slot ? `Slot ${i + 1}` : `${i + 1} — empty`,
      empty: !slot,
      type: 'slot',
      slotIndex: i,
    })),
    { id: 'sep', name: '—', empty: true, type: 'separator' },
    ...HALL_PRESETS.flatMap(({ hall, variants }) =>
      variants.map(v => ({
        id: `preset:${v.id}`,
        name: `${hall}: ${v.title}`,
        empty: false,
        type: 'preset',
        variantId: v.id,
      }))
    ),
  ]

  const nineVariants = {
    displacement: dropdownItems,
    movement: dropdownItems,
    copies: dropdownItems,
  }

  const updateChannel = (channelName, updates) => {
    const idx = CHANNEL_INDEX[channelName]
    setChannels(prev => {
      const next = [...prev]
      next[idx] = { ...next[idx], ...updates }
      return next
    })
  }

  const handleLoadPreset = ({ channel, source }) => {
    if (source === 'nine') setOpenNineDropdown(channel)
  }

  const handleSelectVariant = (channel, itemId) => {
    const item = dropdownItems.find(d => d.id === itemId)
    if (!item || item.empty || item.type === 'separator') {
      setOpenNineDropdown(null)
      return
    }

    let variantId, params, imageSrc = null
    if (item.type === 'slot') {
      const slot = state.archiveSlots[item.slotIndex]
      if (!slot) return
      variantId = slot.variantId
      params = { ...slot.params }
      imageSrc = slot.imageSrc
    } else {
      variantId = item.variantId
      const variant = findVariant(variantId)
      if (!variant) return
      params = getDefaultParams(variant.controls)
    }

    updateChannel(channel, {
      variantId,
      params,
      enabled: true,
      intensity: getIntensityDialValue(variantId),
      speed: 100,
      name: item.name,
    })

    if (state.symphonyLoadMode === 'source' && imageSrc) {
      state.setSymphonyCanvasImage(imageSrc)
      state.setSymphonyCanvasRaster(imageSrc)
      state.setSymphonyCanvasIsSvg(false)
    }

    setIsAnimating(true)
    setOpenNineDropdown(null)
  }

  const ratioLabel = state.symphonyRatio === 'custom'
    ? `${state.symphonyCustomWidth}x${state.symphonyCustomHeight}`
    : state.symphonyRatio

  return (
    <div className="absolute inset-0 bg-surface-primary flex flex-col p-4">
      <div className="flex items-center justify-between shrink-0 mb-4">
        <div className="kol-helper-s text-fg-64">Symphony Canvas</div>
        <div className="kol-helper-xs text-fg-32">[{ratioLabel}]</div>
      </div>
      <div ref={canvasContainerRef} className="flex-1 flex items-start justify-start min-h-0">
        {canvasSize.width > 0 && canvasSize.height > 0 && (
          <div
            className="relative overflow-hidden border border-fg-08"
            style={{
              width: `${canvasSize.width}px`,
              height: `${canvasSize.height}px`,
              borderRadius: '4px',
              backgroundColor: state.canvasBackgroundColor === 'transparent' ? 'var(--kol-surface-absolute-split)' : state.canvasBackgroundColor,
            }}
          >
            {/* Channel layers — each fully independent, no base layer */}
            {channels.map((ch, i) => (
              <ChannelLayer
                key={i}
                channel={ch}
                channelIndex={i}
                imageSrc={svgImageSrc}
                rasterSrc={rasterImageSrc}
                defaultSvgSrc={hasCustomImage ? canvasImage : defaultSvgColored}
                isAnimating={isAnimating}
                imageFitMode={state.imageFitMode}
                imageScale={state.imageScale}
              />
            ))}
          </div>
        )}
      </div>
      <div className="shrink-0 mt-auto pt-6">
        <SymphonyMixer
          displacementValue={channels[0].intensity} onDisplacementChange={(v) => updateChannel('displacement', { intensity: v })}
          displacementEnabled={channels[0].enabled} onDisplacementEnabledChange={(v) => updateChannel('displacement', { enabled: v })}
          displacementBoosted={channels[0].boosted} onDisplacementBoostChange={(v) => updateChannel('displacement', { boosted: v })}
          displacementRandomness={channels[0].speed} onDisplacementRandomnessChange={(v) => updateChannel('displacement', { speed: v })}
          displacementLoaded={channels[0].name}
          displacementOpacity={channels[0].opacity} onDisplacementOpacityChange={(v) => updateChannel('displacement', { opacity: v })}
          movementValue={channels[1].intensity} onMovementChange={(v) => updateChannel('movement', { intensity: v })}
          movementEnabled={channels[1].enabled} onMovementEnabledChange={(v) => updateChannel('movement', { enabled: v })}
          movementBoosted={channels[1].boosted} onMovementBoostChange={(v) => updateChannel('movement', { boosted: v })}
          movementRandomness={channels[1].speed} onMovementRandomnessChange={(v) => updateChannel('movement', { speed: v })}
          movementLoaded={channels[1].name}
          movementOpacity={channels[1].opacity} onMovementOpacityChange={(v) => updateChannel('movement', { opacity: v })}
          copiesValue={channels[2].intensity} onCopiesChange={(v) => updateChannel('copies', { intensity: v })}
          copiesEnabled={channels[2].enabled} onCopiesEnabledChange={(v) => updateChannel('copies', { enabled: v })}
          copiesBoosted={channels[2].boosted} onCopiesBoostChange={(v) => updateChannel('copies', { boosted: v })}
          copiesRandomness={channels[2].speed} onCopiesRandomnessChange={(v) => updateChannel('copies', { speed: v })}
          copiesLoaded={channels[2].name}
          copiesOpacity={channels[2].opacity} onCopiesOpacityChange={(v) => updateChannel('copies', { opacity: v })}
          onLoadPreset={handleLoadPreset} layout={mixerLayout}
          nineVariants={nineVariants}
          openNineDropdown={openNineDropdown}
          onSelectVariant={handleSelectVariant} onCloseDropdown={() => setOpenNineDropdown(null)}
        />
      </div>
    </div>
  )
}
