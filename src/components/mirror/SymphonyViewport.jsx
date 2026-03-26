import { useEffect, useRef, useState } from 'react'
import { findVariant, getDefaultParams, getIntensityDialValue, getRasterTier, DISPLACEMENT_VARIANTS, MOVEMENT_VARIANTS, COPIES_VARIANTS } from '../../data/mirrorVariants'
import useImageTiers from '../../hooks/useImageTiers'
import SymphonyMixer from '../hall-of-mirrors/SymphonyMixer'
import ChannelLayer from './ChannelLayer'
import defaultCanvasSvg from '../../assets/default-canvas.svg?raw'

const DEFAULT_SVG_DATA_URL = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(defaultCanvasSvg)

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

  // Tiered rasters — for default SVG (themed) or custom uploads
  const svgFillColor = state.symphonyRasterTheme === 'light' ? '#000000' : '#ffffff'
  const rasterSource = canvasRaster || DEFAULT_SVG_DATA_URL
  const { tiers: rasterTiers, ready: rastersReady } = useImageTiers(rasterSource, { svgFillColor })

  // Image sources for channels
  const svgImageSrc = canvasImage || DEFAULT_SVG_DATA_URL
  const sourceFallback = state.symphonyLoadMode === 'source' ? '/images/stack-hero-800.jpg' : null

  // Color-correct default SVG for dry signal display
  const vectorColor = state.canvasVectorColor === 'currentColor'
    ? (state.symphonyRasterTheme === 'light' ? '#000000' : '#ffffff')
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

  // Periodic tier re-evaluation during animation (every 500ms)
  const [tierTick, setTierTick] = useState(0)
  useEffect(() => {
    if (!isAnimating) return
    const interval = setInterval(() => setTierTick(t => t + 1), 500)
    return () => clearInterval(interval)
  }, [isAnimating])

  // Also re-evaluate when recalc is triggered
  const _recalc = state.rasterRecalcCounter + tierTick

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

  const updateChannel = (idx, updates) => {
    setChannels(prev => {
      const next = [...prev]
      if (next[idx]) next[idx] = { ...next[idx], ...updates }
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

    if (item.type === 'slot') {
      const slot = state.archiveSlots[item.slotIndex]
      if (!slot) return
      const baseIntensity = getIntensityDialValue(slot.variantId)
      // Load slot params into global variantParams so getVariantParams resolves them
      state.setAllVariantParams(slot.variantId, slot.params)
      updateChannel(channel, {
        variantId: slot.variantId,
        slotIndex: item.slotIndex,
        params: null,
        enabled: true,
        intensity: baseIntensity,
        baseIntensity,
        speed: 100,
        name: item.name,
      })
    } else {
      const variant = findVariant(item.variantId)
      if (!variant) return
      const presetBase = getIntensityDialValue(item.variantId)
      updateChannel(channel, {
        variantId: item.variantId,
        slotIndex: null,
        params: getDefaultParams(variant.controls),
        enabled: true,
        intensity: presetBase,
        baseIntensity: presetBase,
        speed: 100,
        name: item.name,
      })
    }

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
            {channels.map((ch, i) => {
              // Resolve slot params live — not a copy
              // Slot channels resolve params live — first from hall edits (variantParams), then from saved slot
              const resolvedChannel = ch.slotIndex != null && state.archiveSlots[ch.slotIndex]
                ? { ...ch, variantId: state.archiveSlots[ch.slotIndex].variantId, params: state.getVariantParams(state.archiveSlots[ch.slotIndex].variantId) }
                : ch
              const isSlotRef = ch.slotIndex != null
              const tier = getRasterTier(resolvedChannel.variantId, resolvedChannel.params)
              const rasterForChannel = sourceFallback || (rastersReady ? rasterTiers[tier] || rasterTiers.mid : null)
              return (
              <ChannelLayer
                key={i}
                channel={resolvedChannel}
                channelIndex={i}
                imageSrc={svgImageSrc}
                rasterSrc={rasterForChannel}
                defaultSvgSrc={hasCustomImage ? canvasImage : defaultSvgColored}
                isAnimating={isAnimating}
                imageFitMode={state.imageFitMode}
                imageScale={state.imageScale}
                onParamChange={(key, value) => {
                  if (isSlotRef && state.archiveSlots[ch.slotIndex]) {
                    state.setVariantParam(state.archiveSlots[ch.slotIndex].variantId, key, value)
                  } else {
                    updateChannel(i, { params: { ...ch.params, [key]: value } })
                  }
                }}
              />
              )
            })}
          </div>
        )}
      </div>
      <div className="shrink-0 mt-auto pt-6" style={{ marginRight: '-16px' }}>
        <SymphonyMixer
          channels={channels}
          onChannelUpdate={updateChannel}
          onLoadPreset={handleLoadPreset}
          layout={mixerLayout}
          resolvedParams={channels.map((ch, i) => {
            if (ch.slotIndex != null && state.archiveSlots[ch.slotIndex]) {
              return state.getVariantParams(state.archiveSlots[ch.slotIndex].variantId)
            }
            return ch.params
          })}
          onChannelParamChange={(idx, key, value) => {
            const ch = channels[idx]
            if (ch.slotIndex != null && state.archiveSlots[ch.slotIndex]) {
              state.setVariantParam(state.archiveSlots[ch.slotIndex].variantId, key, value)
            } else {
              updateChannel(idx, { params: { ...ch.params, [key]: value } })
            }
          }}
          dropdownItems={dropdownItems}
          openNineDropdown={openNineDropdown}
          onSelectVariant={handleSelectVariant}
          onCloseDropdown={() => setOpenNineDropdown(null)}
          onEditChannel={(idx) => {
            const ch = channels[idx]
            if (ch.slotIndex != null) {
              state.loadSlotToHall(ch.slotIndex)
            }
          }}
          onRemoveChannel={(idx) => {
            setChannels(prev => prev.filter((_, i) => i !== idx))
          }}
          onAddChannel={() => {
            setChannels(prev => [...prev, { variantId: null, params: {}, slotIndex: null, enabled: false, intensity: 100, boosted: false, speed: 100, opacity: 100, name: null, baseIntensity: 100 }])
          }}
        />
      </div>
    </div>
  )
}
