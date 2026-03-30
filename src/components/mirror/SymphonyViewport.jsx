import { useEffect, useRef, useState, useCallback } from 'react'
import { findVariant, getDefaultParams, getIntensityDialValue, getRasterTier, DISPLACEMENT_VARIANTS, MOVEMENT_VARIANTS, COPIES_VARIANTS, buildChannelFxStyle } from '../../data/mirrorVariants'
import useImageTiers from '../../hooks/useImageTiers'
import useChannelRecorder from '../../hooks/useChannelRecorder'
import { EMPTY_CHANNEL } from '../../hooks/useMirrorState'
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

  // Canvas registry for recording — tracks Pixi canvas elements per channel index
  const canvasRegistryRef = useRef(new Map())
  const [recChannel, setRecChannel] = useState(null) // which channel index is recording
  const recorder = useChannelRecorder()
  const recConfigRef = useRef({ loopLength: 20, fps: 30 }) // stable config for arm — survives re-renders
  const armedChannelRef = useRef(null) // which channel is armed — ref avoids stale closure in polling callbacks
  const [playheads, setPlayheads] = useState({}) // channelIndex → currentTime
  const [seekTargets, setSeekTargets] = useState({}) // channelIndex → target time
  const [renderCosts, setRenderCosts] = useState({}) // channelIndex → cost %

  const handleCanvasReady = useCallback((channelIndex, canvasEl) => {
    canvasRegistryRef.current.set(channelIndex, canvasEl)
    // If this channel is armed, set up the recorder in standby
    if (armedChannelRef.current === channelIndex && recorder.status === 'idle') {
      const ch = channels[channelIndex]
      const params = ch?.params ? { ...ch.params } : {}
      const { loopLength, fps } = recConfigRef.current
      recorder.arm(canvasEl, loopLength, params, fps)
      setRecChannel(channelIndex)
    }
  }, [channels, recorder])

  const handleArmRecording = useCallback((idx, loopLength, fps) => {
    recConfigRef.current = { loopLength, fps }
    armedChannelRef.current = idx
    setRecChannel(idx)
    updateChannel(idx, { isArmedForRec: true })
  }, [])

  const handleStartRecording = useCallback(() => {
    recorder.start()
  }, [recorder])

  const handleStopRecording = useCallback(() => {
    recorder.stop()
  }, [recorder])

  const handleDisarmRecording = useCallback((idx) => {
    armedChannelRef.current = null
    recorder.disarm()
    updateChannel(idx, { isArmedForRec: false })
    setRecChannel(null)
  }, [recorder])

  // Push recording data into first empty slot — data passed as arg, no closure dependency
  const handleSaveRecToSlot = useCallback((idx, recData) => {
    if (!recData?.blobUrl) return
    armedChannelRef.current = null // prevent stale polling from re-arming
    setChannels(prev => {
      const next = [...prev]
      const ch = next[idx]
      if (!ch) return prev
      const slots = [...(ch.recSlots || [])]
      const emptyIdx = slots.findIndex(s => !s)
      const slotNum = (emptyIdx >= 0 ? emptyIdx : slots.length) + 1
      const canvasEl = canvasRegistryRef.current.get(idx)
      const res = canvasEl ? `${canvasEl.width}x${canvasEl.height}` : '—'
      const newSlot = {
        blobUrl: recData.blobUrl,
        fileName: `rec-${String(slotNum).padStart(2, '0')}.webm`,
        size: recData.blobSize || 0,
        codec: 'webm',
        fps: recData.fps || 30,
        resolution: res,
        duration: recData.loopLength || 20,
        mark1: null,
        mark2: null,
        frozenParams: recData.frozenParams || null,
        source: 'recorded',
      }
      if (emptyIdx >= 0) slots[emptyIdx] = newSlot
      else slots.push(newSlot)
      next[idx] = { ...ch, recSlots: slots, isArmedForRec: false }
      return next
    })
    setRecChannel(null)
  }, [])

  // No auto-save — user explicitly saves via [Save to Slot] in the REC tab

  const handleSetActiveRecSlot = useCallback((chIdx, slotIdx) => {
    updateChannel(chIdx, { activeRecSlot: slotIdx })
  }, [])

  const handleClearActiveRecSlot = useCallback((chIdx) => {
    updateChannel(chIdx, { activeRecSlot: null })
  }, [])

  const handleRemoveRecSlot = useCallback((chIdx, slotIdx) => {
    const ch = channels[chIdx]
    const slots = [...(ch.recSlots || [])]
    if (slots[slotIdx]?.blobUrl) URL.revokeObjectURL(slots[slotIdx].blobUrl)
    slots.splice(slotIdx, 1)
    const active = ch.activeRecSlot
    const newActive = active === slotIdx ? null : (active != null && active > slotIdx ? active - 1 : active)
    updateChannel(chIdx, { recSlots: slots, activeRecSlot: newActive })
  }, [channels])

  const handleAddRecSlot = useCallback((chIdx) => {
    const ch = channels[chIdx]
    if ((ch.recSlots || []).length >= 8) return
    updateChannel(chIdx, { recSlots: [...(ch.recSlots || []), null] })
  }, [channels])

  const handleUploadRecSlot = useCallback((chIdx, slotIdx, file) => {
    const url = URL.createObjectURL(file)
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.onloadedmetadata = () => {
      const ch = channels[chIdx]
      const slots = [...(ch.recSlots || [])]
      slots[slotIdx] = {
        blobUrl: url,
        fileName: file.name,
        size: file.size,
        codec: file.type || 'video',
        fps: 30,
        resolution: `${video.videoWidth}x${video.videoHeight}`,
        duration: video.duration,
        mark1: null,
        mark2: null,
        frozenParams: null,
        source: 'uploaded',
      }
      updateChannel(chIdx, { recSlots: slots })
    }
    video.src = url
  }, [channels])

  const handleUpdateRecSlotTrim = useCallback((chIdx, slotIdx, mark1, mark2) => {
    const ch = channels[chIdx]
    const slots = [...(ch.recSlots || [])]
    if (!slots[slotIdx]) return
    slots[slotIdx] = { ...slots[slotIdx], mark1, mark2 }
    updateChannel(chIdx, { recSlots: slots })
  }, [channels])

  const handleClearRecorder = useCallback((idx) => {
    armedChannelRef.current = null
    recorder.clear()
    if (idx != null) updateChannel(idx, { isArmedForRec: false })
    setRecChannel(null)
  }, [recorder])

  // Canvas source images
  const canvasImage = state.symphonyCanvasImage
  const canvasRaster = state.symphonyCanvasRaster
  const hasCustomImage = !!state.symphonyCanvasImage

  // Tiered rasters — for default SVG (themed) or custom uploads
  const svgFillColor = state.symphonyRasterTheme === 'light' ? '#000000' : '#ffffff'
  const rasterSource = canvasRaster || DEFAULT_SVG_DATA_URL
  const { tiers: rasterTiers, ready: rastersReady } = useImageTiers(rasterSource, { svgFillColor, recalcKey: state.rasterRecalcCounter })

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
    ...state.archiveSlots.map((slot, i) => {
      let name = `${i + 1} — empty`
      if (slot) {
        const v = findVariant(slot.variantId)
        const hall = HALL_PRESETS.find(h => h.variants.some(hv => hv.id === slot.variantId))
        name = `[M${i + 1}] ${hall?.hall || '?'}: ${v?.title || slot.variantId} [USR]`
      }
      return { id: `slot:${i}`, name, empty: !slot, type: 'slot', slotIndex: i }
    }),
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
      state.setAllVariantParams(slot.variantId, slot.params)
      updateChannel(channel, {
        variantId: slot.variantId,
        slotIndex: item.slotIndex,
        params: null,
        enabled: true,
        intensity: baseIntensity,
        baseIntensity,
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
            {/* Master output wrapper — applies global FX to combined output */}
            <div
              className="absolute inset-0"
              style={{
                ...buildChannelFxStyle(state.symphonyMaster.fx),
                opacity: state.symphonyMaster.opacity / 100,
                ...(state.symphonyMaster.blendMode && state.symphonyMaster.blendMode !== 'normal' ? { mixBlendMode: state.symphonyMaster.blendMode } : {}),
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
                const hasCustomMedia = !!ch.customRasterSrc
                const tier = ch.rasterTierOverride || getRasterTier(resolvedChannel.variantId, resolvedChannel.params)
                const rasterForChannel = hasCustomMedia
                  ? ch.customRasterSrc
                  : (sourceFallback || (rastersReady ? rasterTiers[tier] || rasterTiers.mid : null))
                const chVectorColor = ch.vectorColor && ch.vectorColor !== 'currentColor'
                  ? ch.vectorColor
                  : vectorColor
                const chSvgColored = chVectorColor !== vectorColor
                  ? 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(defaultCanvasSvg.replace(/currentColor/g, chVectorColor))
                  : defaultSvgColored
                const customSvgColored = hasCustomMedia && ch.customImageSrc?.startsWith('data:image/svg+xml')
                  ? ch.customImageSrc.replace(/currentColor/g, encodeURIComponent(chVectorColor))
                  : ch.customImageSrc
                const channelImageSrc = hasCustomMedia ? (customSvgColored || ch.customRasterSrc) : (hasCustomImage ? canvasImage : chSvgColored)
                const channelDefaultSrc = hasCustomMedia ? customSvgColored : (hasCustomImage ? canvasImage : chSvgColored)
                return (
                <ChannelLayer
                  key={i}
                  channel={resolvedChannel}
                  channelIndex={i}
                  imageSrc={channelImageSrc}
                  rasterSrc={rasterForChannel}
                  defaultSvgSrc={channelDefaultSrc}
                  isAnimating={isAnimating}
                  imageFitMode={state.imageFitMode}
                  imageScale={state.imageScale}
                  onCanvasReady={handleCanvasReady}
                  onPlayheadUpdate={(t) => setPlayheads(prev => prev[i] === t ? prev : { ...prev, [i]: t })}
                  seekTo={seekTargets[i]}
                  onRenderCost={(cost) => setRenderCosts(prev => prev[i] === cost ? prev : { ...prev, [i]: cost })}
                  onParamChange={(key, value) => {
                    if (isSlotRef && state.archiveSlots[ch.slotIndex]) {
                      state.setVariantParam(state.archiveSlots[ch.slotIndex].variantId, key, value)
                    } else {
                      setChannels(prev => {
                        const next = [...prev]
                        if (next[i]) next[i] = { ...next[i], params: { ...next[i].params, [key]: value } }
                        return next
                      })
                    }
                  }}
                />
                )
              })}
            </div>
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
              setChannels(prev => {
                const next = [...prev]
                if (next[idx]) next[idx] = { ...next[idx], params: { ...next[idx].params, [key]: value } }
                return next
              })
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
            } else if (ch.variantId) {
              const hall = isDisplacementVariant(ch.variantId) ? 'displacement'
                : isMovementVariant(ch.variantId) ? 'movement'
                : isPixiVariant(ch.variantId) ? 'copies' : null
              if (hall) {
                state.selectHall(hall)
                state.selectVariant(ch.variantId)
              }
            }
          }}
          onRemoveChannel={(idx) => {
            setChannels(prev => prev.filter((_, i) => i !== idx))
          }}
          onAddChannel={() => {
            setChannels(prev => [...prev, { variantId: null, params: {}, slotIndex: null, enabled: false, intensity: 30, boosted: false, speed: 100, opacity: 100, name: null, baseIntensity: 100, fx: [], blendMode: 'normal' }])
          }}
          master={state.symphonyMaster}
          onMasterChange={(updates) => state.setSymphonyMaster(prev => ({ ...prev, ...updates }))}
          onRecalc={() => state.setRasterRecalcCounter(c => c + 1)}
          onResetChannel={(idx, all) => {
            if (all) {
              setChannels(prev => prev.map((ch, i) => ({ ...EMPTY_CHANNEL, enabled: i === 0 })))
              state.setSymphonyEditChannel(null)
            } else {
              setChannels(prev => {
                const next = [...prev]
                next[idx] = { ...EMPTY_CHANNEL, enabled: prev[idx]?.enabled ?? false }
                return next
              })
            }
          }}
          globalImageThumb={canvasImage || defaultSvgColored}
          recChannel={recChannel}
          playheads={playheads}
          onSeek={(idx, time) => setSeekTargets(prev => ({ ...prev, [idx]: time }))}
          renderCosts={renderCosts}
          recState={recorder}
          onArmRecording={handleArmRecording}
          onStartRecording={handleStartRecording}
          onStopRecording={handleStopRecording}
          onDisarmRecording={handleDisarmRecording}
          onSaveRecToSlot={(idx, recData) => handleSaveRecToSlot(idx, recData)}
          onClearRecorder={handleClearRecorder}
          onSetActiveRecSlot={handleSetActiveRecSlot}
          onClearActiveRecSlot={handleClearActiveRecSlot}
          onRemoveRecSlot={handleRemoveRecSlot}
          onAddRecSlot={handleAddRecSlot}
          onUploadRecSlot={handleUploadRecSlot}
          onUpdateRecSlotTrim={handleUpdateRecSlotTrim}
        />
      </div>
    </div>
  )
}
