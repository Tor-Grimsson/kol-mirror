import { useState, useCallback, useMemo, useRef } from 'react'
import { getResponsiveImage, getDefaultParams, findVariant, DISPLACEMENT_VARIANTS, COPIES_VARIANTS, MOVEMENT_VARIANTS } from '../data/mirrorVariants'

const FIRST_VARIANT = {
  displacement: DISPLACEMENT_VARIANTS[0]?.id,
  movement: MOVEMENT_VARIANTS[0]?.id,
  copies: COPIES_VARIANTS[0]?.id,
}

const EMPTY_ARCHIVE = Array.from({ length: 9 }, () => null)

export const EMPTY_CHANNEL = { variantId: null, params: {}, slotIndex: null, enabled: false, intensity: 30, boosted: false, speed: 100, opacity: 100, name: null, fx: [], blendMode: 'normal', vectorColor: 'currentColor', backgroundColor: 'transparent', rasterTheme: 'dark', rasterTierOverride: null, customImageSrc: null, customRasterSrc: null, customImageName: null, loadMode: 'effect', vectorPadding: 0, recSlots: [null, null, null, null], activeRecSlot: null, isArmedForRec: false, sendA: 0, sendB: 0, routeFrom: null, routeSendLevels: {} }

const DEV_SLOT_IDS = [
  'subtle-ripple', 'breathing-scale', 'pixi-slices',
  'medium-wave', 'heavy-distortion', 'breathing-stretch',
  'breathing-harmonica', 'pixi-glitch', 'pixi-kaleidoscope',
]

export function useMirrorState() {
  // Navigation
  const [activeHall, setActiveHall] = useState('symphony')
  const [activeVariant, setActiveVariant] = useState(null)

  // Responsive default image
  const defaultImage = useMemo(() => getResponsiveImage(), [])

  // Images
  const [customImages, setCustomImages] = useState({})

  // Which archive slot is being edited (null = none)
  const [editingSlot, setEditingSlot] = useState(null)

  // Per-variant params: { [variantId]: { key: value } }
  const [variantParams, setVariantParams] = useState({})

  // Archive: 9 slots, each null or { variantId, params, imageSrc }
  const [archiveSlots, setArchiveSlots] = useState(EMPTY_ARCHIVE)

  const selectHall = useCallback((hall) => {
    setActiveHall(hall)
    setActiveVariant(FIRST_VARIANT[hall] || null)
    setEditingSlot(null)
  }, [])

  const selectVariant = useCallback((variantId) => {
    setActiveVariant(prev => prev === variantId ? null : variantId)
  }, [])

  // Load a saved slot back into its hall for editing
  const loadSlotToHall = useCallback((slotIndex) => {
    const slot = archiveSlots[slotIndex]
    if (!slot) return
    const variant = findVariant(slot.variantId)
    if (!variant) return

    // Determine hall
    const hallId = DISPLACEMENT_VARIANTS.some(v => v.id === slot.variantId) ? 'displacement'
      : MOVEMENT_VARIANTS.some(v => v.id === slot.variantId) ? 'movement'
      : COPIES_VARIANTS.some(v => v.id === slot.variantId) ? 'copies'
      : null
    if (!hallId) return

    setActiveHall(hallId)
    setActiveVariant(slot.variantId)
    setEditingSlot(slotIndex)

    // Force-set all params (overwrite any existing)
    setVariantParams(prev => ({
      ...prev,
      [slot.variantId]: { ...slot.params }
    }))
  }, [archiveSlots])

  // Initialize variant params from control descriptors (only on first selection)
  const initVariantParams = useCallback((variantId, controls) => {
    setVariantParams(prev => {
      if (prev[variantId]) return prev
      return { ...prev, [variantId]: getDefaultParams(controls) }
    })
  }, [])

  // Get params for a variant — always merges stored over defaults
  const getVariantParams = useCallback((variantId) => {
    const variant = findVariant(variantId)
    const defaults = variant ? getDefaultParams(variant.controls) : {}
    return variantParams[variantId] ? { ...defaults, ...variantParams[variantId] } : defaults
  }, [variantParams])

  // Bulk-set all params for a variant (overwrites existing)
  const setAllVariantParams = useCallback((variantId, params) => {
    setVariantParams(prev => ({
      ...prev,
      [variantId]: { ...params }
    }))
  }, [])

  // Set a single param for a variant — always starts from defaults if no prior params
  const setVariantParam = useCallback((variantId, key, value) => {
    setVariantParams(prev => {
      const base = prev[variantId] || (() => {
        const variant = findVariant(variantId)
        return variant ? getDefaultParams(variant.controls) : {}
      })()
      return { ...prev, [variantId]: { ...base, [key]: value } }
    })
  }, [])

  const handleImageUpload = useCallback((e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const isImage = file.type.startsWith('image/')
    const isSvg = file.type === 'image/svg+xml'
    if (!isImage) return

    if (isSvg) {
      // Rasterize SVG so it works in PixiJS WebGL variants too
      const reader = new FileReader()
      reader.onload = (event) => {
        const svgText = event.target.result
        const blob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const RASTER_SCALE = 4
          canvas.width = (img.naturalWidth || 1024) * RASTER_SCALE
          canvas.height = (img.naturalHeight || 1024) * RASTER_SCALE
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
          URL.revokeObjectURL(url)
          const dataUrl = canvas.toDataURL('image/png')
          if (activeVariant) {
            setCustomImages(prev => ({ ...prev, [activeVariant]: dataUrl }))
          }
        }
        img.onerror = () => URL.revokeObjectURL(url)
        img.src = url
      }
      reader.readAsText(file)
    } else {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (activeVariant) {
          setCustomImages(prev => ({ ...prev, [activeVariant]: event.target.result }))
        }
      }
      reader.readAsDataURL(file)
    }
  }, [activeVariant])

  const getImageSrc = useCallback((variantId) => {
    return customImages[variantId] || defaultImage
  }, [customImages, defaultImage])

  // Save current variant state to an archive slot (0-8)
  const saveToArchiveSlot = useCallback((slotIndex) => {
    if (!activeVariant) return
    const variant = findVariant(activeVariant)
    if (!variant) return
    const params = variantParams[activeVariant] || getDefaultParams(variant.controls)
    const imageSrc = customImages[activeVariant] || getResponsiveImage()
    setArchiveSlots(prev => {
      const next = [...prev]
      next[slotIndex] = { variantId: activeVariant, params: { ...params }, imageSrc }
      return next
    })
  }, [activeVariant, variantParams, customImages])

  const clearArchiveSlot = useCallback((slotIndex) => {
    setArchiveSlots(prev => {
      const next = [...prev]
      next[slotIndex] = null
      return next
    })
  }, [])

  const [devPresetsLoaded, setDevPresetsLoaded] = useState(false)

  const buildSlots = useCallback((randomize) => {
    const slots = DEV_SLOT_IDS.map(id => {
      const variant = findVariant(id)
      if (!variant) return null
      const params = getDefaultParams(variant.controls)
      if (randomize) {
        for (const ctrl of variant.controls) {
          if (ctrl.type === 'slider' && ctrl.key !== 'animate') {
            const range = ctrl.max - ctrl.min
            const jitter = (Math.random() - 0.5) * range * 0.5
            params[ctrl.key] = Math.max(ctrl.min, Math.min(ctrl.max, params[ctrl.key] + jitter))
          }
        }
      }
      params.animate = false
      return { variantId: id, params }
    })

    // Slot 9: specific kaleidoscope settings
    const slot9 = slots[8]
    if (slot9 && slot9.variantId === 'pixi-kaleidoscope') {
      Object.assign(slot9.params, {
        controlTab: 'main', mainEnabled: true, animate: true,
        blendMode: 'normal', segments: 14, zoom: 1.5, sourceOffsetX: -48, sourceOffsetY: 172,
        cutOffset: 224, segmentGap: 1.5, evenOffset: -1, speed: 0.3, mirrorMode: 'all-same',
        rotationDirection: 'clockwise', splitRotation: true, wedgeOffsetX: 0, wedgeOffsetY: 0, grabSegment: true, grabOutlineVisible: false,
        wrapMode: 'clamp-to-edge', fillMode: 'repeat',
        showBackground: true, bgAnimate: true, bgSegments: 6, bgZoom: 1.5, bgSourceOffsetX: 0, bgSourceOffsetY: 0,
        bgCutOffset: 0, bgSegmentGap: 0, bgEvenOffset: 0, bgSpeed: 0.5, bgMirrorMode: 'alternating',
        bgRotationDirection: 'clockwise', bgSplitRotation: false, bgBlendMode: 'normal',
        bgWrapMode: 'clamp-to-edge', bgFillMode: 'none',
      })
    }

    return slots
  }, [])

  const loadDevPresets = useCallback(() => {
    setArchiveSlots(buildSlots(devPresetsLoaded))
    setDevPresetsLoaded(true)
  }, [devPresetsLoaded, buildSlots])

  // Image fit mode + manual scale
  const [imageFitMode, setImageFitMode] = useState('contain')
  const [imageScale, setImageScale] = useState(100)

  // Canvas colors
  const [canvasVectorColor, setCanvasVectorColor] = useState('currentColor')
  const [canvasBackgroundColor, setCanvasBackgroundColor] = useState('transparent')

  // Canvas ratio for halls
  const [hallCanvasRatio, setHallCanvasRatio] = useState('none')
  const [hallCustomWidth, setHallCustomWidth] = useState(1024)
  const [hallCustomHeight, setHallCustomHeight] = useState(600)

  // Symphony animate + canvas image + load mode + layout + aspect ratio
  const [symphonyAnimating, setSymphonyAnimating] = useState(false)
  const [symphonyCanvasImage, setSymphonyCanvasImage] = useState(null)
  const [symphonyCanvasRaster, setSymphonyCanvasRaster] = useState(null)
  const [symphonyCanvasIsSvg, setSymphonyCanvasIsSvg] = useState(false)
  const [symphonyLoadMode, setSymphonyLoadMode] = useState('effect')
  const [symphonyRasterTheme, setSymphonyRasterTheme] = useState(() => {
    const t = document.documentElement.getAttribute('data-theme')
    return t === 'light' ? 'light' : 'dark'
  })
  const [symphonyLayout, setSymphonyLayout] = useState('row')
  const [symphonyRatio, setSymphonyRatio] = useState('16:9')
  const [symphonyCustomWidth, setSymphonyCustomWidth] = useState(1024)
  const [symphonyCustomHeight, setSymphonyCustomHeight] = useState(600)

  // Raster recalc trigger — bump to force re-evaluation
  const [rasterRecalcCounter, setRasterRecalcCounter] = useState(0)

  // Symphony channel state — persists across navigation
  const [symphonyChannels, setSymphonyChannels] = useState([
    { ...EMPTY_CHANNEL, enabled: true },
    { ...EMPTY_CHANNEL },
    { ...EMPTY_CHANNEL },
  ])

  // Undo/redo history for channels
  const channelHistoryRef = useRef([])
  const channelFutureRef = useRef([])
  const setSymphonyChannelsWithHistory = useCallback((updater) => {
    setSymphonyChannels(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      channelHistoryRef.current = [...channelHistoryRef.current.slice(-30), JSON.parse(JSON.stringify(prev))]
      channelFutureRef.current = []
      return next
    })
  }, [])
  const symphonyUndo = useCallback(() => {
    if (!channelHistoryRef.current.length) return
    setSymphonyChannels(prev => {
      channelFutureRef.current = [...channelFutureRef.current, JSON.parse(JSON.stringify(prev))]
      return channelHistoryRef.current.pop()
    })
  }, [])
  const symphonyRedo = useCallback(() => {
    if (!channelFutureRef.current.length) return
    setSymphonyChannels(prev => {
      channelHistoryRef.current = [...channelHistoryRef.current, JSON.parse(JSON.stringify(prev))]
      return channelFutureRef.current.pop()
    })
  }, [])

  // Master output — global FX chain applied to combined output
  const [symphonyMaster, setSymphonyMaster] = useState({
    enabled: true,
    opacity: 80,
    blendMode: 'normal',
    fx: [],
    busA: { enabled: true, returnLevel: 0, fx: [], blendMode: 'normal', solo: false },
    busB: { enabled: true, returnLevel: 0, fx: [], blendMode: 'normal', solo: false },
  })

  // Currently selected channel tab in sidebar (null = none)
  const [symphonyEditChannel, setSymphonyEditChannel] = useState(null)

  return {
    activeHall,
    activeVariant,
    selectHall,
    selectVariant,

    getImageSrc,
    handleImageUpload,

    variantParams,
    getVariantParams,
    setVariantParam,
    setAllVariantParams,
    initVariantParams,

    archiveSlots,
    saveToArchiveSlot,
    clearArchiveSlot,
    loadSlotToHall,
    editingSlot,
    setEditingSlot,
    loadDevPresets,
    devPresetsLoaded,

    imageFitMode,
    setImageFitMode,
    imageScale,
    setImageScale,
    canvasVectorColor,
    setCanvasVectorColor,
    canvasBackgroundColor,
    setCanvasBackgroundColor,

    hallCanvasRatio,
    setHallCanvasRatio,
    hallCustomWidth,
    setHallCustomWidth,
    hallCustomHeight,
    setHallCustomHeight,

    symphonyAnimating,
    setSymphonyAnimating,
    symphonyCanvasImage,
    setSymphonyCanvasImage,
    symphonyCanvasRaster,
    setSymphonyCanvasRaster,
    symphonyCanvasIsSvg,
    setSymphonyCanvasIsSvg,
    symphonyLoadMode,
    setSymphonyLoadMode,
    symphonyRasterTheme,
    setSymphonyRasterTheme,
    symphonyLayout,
    setSymphonyLayout,
    symphonyRatio,
    setSymphonyRatio,
    symphonyCustomWidth,
    setSymphonyCustomWidth,
    symphonyCustomHeight,
    setSymphonyCustomHeight,

    symphonyChannels,
    setSymphonyChannels: setSymphonyChannelsWithHistory,
    symphonyUndo,
    symphonyRedo,

    symphonyMaster,
    setSymphonyMaster,

    symphonyEditChannel,
    setSymphonyEditChannel,

    rasterRecalcCounter,
    setRasterRecalcCounter,
  }
}
