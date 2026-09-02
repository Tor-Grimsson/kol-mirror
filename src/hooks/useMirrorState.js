import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { getResponsiveImage, getDefaultParams, findVariant, DISPLACEMENT_VARIANTS, COPIES_VARIANTS, MOVEMENT_VARIANTS } from '../data/mirrorVariants'
import { rasterDims, capRaster } from '../utils/processImageUpload'
import { applyPatch, buildPatchEntry } from './patchFile'
import { addToLibrary } from './useLibraryStore'

const FIRST_VARIANT = {
  displacement: DISPLACEMENT_VARIANTS[0]?.id,
  movement: MOVEMENT_VARIANTS[0]?.id,
  copies: COPIES_VARIANTS[0]?.id,
}

const EMPTY_ARCHIVE = Array.from({ length: 9 }, () => null)

export const EMPTY_SENDS = { aux1: 0, aux2: 0, rtn1: 0, rtn2: 0, fx1: 0, fx2: 0 }

export const EMPTY_CHANNEL = { variantId: null, params: {}, slotIndex: null, enabled: false, intensity: 30, boosted: false, speed: 100, opacity: 100, name: null, fx: [], canvasFx: [], blendMode: 'normal', vectorColor: 'currentColor', backgroundColor: 'transparent', rasterTheme: 'dark', rasterTierOverride: null, customImageSrc: null, customRasterSrc: null, customImageName: null, loadMode: 'effect', vectorPadding: 0, recSlots: [null, null, null, null], activeRecSlot: null, isArmedForRec: false, sends: { ...EMPTY_SENDS }, routeFrom: null, routeSendLevels: {}, feedback: { enabled: false, decay: 80, mix: 50, freeze: false } }

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

  // Archive: 9 slots, each null or { variantId, params, imageSrc }.
  // Persisted to localStorage so the home page's memory row survives refresh.
  const [archiveSlots, setArchiveSlots] = useState(() => {
    try {
      const raw = localStorage.getItem('mirror-archive')
      if (raw) {
        const arr = JSON.parse(raw)
        if (Array.isArray(arr) && arr.length === 9) return arr
      }
    } catch { /* corrupt store — start fresh */ }
    return EMPTY_ARCHIVE
  })
  useEffect(() => {
    try {
      // Data-URL images (custom uploads) can blow the ~5MB quota — persist the
      // slot without them; loadSlotToHall falls back to the responsive default.
      const safe = archiveSlots.map(s => s ? { ...s, imageSrc: s.imageSrc?.startsWith('data:') ? null : s.imageSrc } : null)
      localStorage.setItem('mirror-archive', JSON.stringify(safe))
    } catch { /* quota exceeded — skip persistence, keep session state */ }
  }, [archiveSlots])

  const selectHall = useCallback((hall) => {
    setActiveHall(hall)
    setActiveVariant(FIRST_VARIANT[hall] || null)
    setEditingSlot(null)
  }, [])

  // Open a specific variant in its hall — deep-link entry for the home page
  // gallery (selectVariant's toggle semantics make it wrong for this).
  const openVariant = useCallback((variantId) => {
    const hallId = DISPLACEMENT_VARIANTS.some(v => v.id === variantId) ? 'displacement'
      : MOVEMENT_VARIANTS.some(v => v.id === variantId) ? 'movement'
      : COPIES_VARIANTS.some(v => v.id === variantId) ? 'copies'
      : null
    if (!hallId) return
    setActiveHall(hallId)
    setActiveVariant(variantId)
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
        img.crossOrigin = 'anonymous'
        img.onload = () => {
          const canvas = document.createElement('canvas')
          // Raster scale is the Settings knob, not a constant — see rasterDims.
          const [rw, rh] = rasterDims(img.naturalWidth || 1024, img.naturalHeight || 1024)
          canvas.width = rw
          canvas.height = rh
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
      /* `capRaster` — the raster branch went to the GPU at the file's own size
         while the SVG branch above has been budgeted since 2026-08-27. This is
         the mobile picker's path: `MobileStudio`'s camera-roll input is
         `accept="image/*"`, so it is the one entry point GUARANTEED to hand
         this a 12 MP photo, on the weakest device the app runs on. Under
         `maxChannelPixels` the data URL passes through untouched. */
      reader.onload = (event) => {
        capRaster(event.target.result).then((dataUrl) => {
          if (activeVariant) {
            setCustomImages(prev => ({ ...prev, [activeVariant]: dataUrl }))
          }
        })
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
      // savedAt orders the Library's RECENT view (newest slot first).
      next[slotIndex] = { variantId: activeVariant, params: { ...params }, imageSrc, savedAt: Date.now() }
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
        controlTab: 'main', mainEnabled: true, animate: false,
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
  // Mixer visibility — global so the M shortcut can reach it (was local to SymphonyViewport)
  const [symphonyMixerVisible, setSymphonyMixerVisible] = useState(true)
  // Screen 2 — second canvas source: 'off' | '0' | '1' | '2' (channel index) | 'expr'
  const [symphonyScreen2, setSymphonyScreen2] = useState('off')
  const [symphonyRestartKey, setSymphonyRestartKey] = useState(0)
  const [symphonyCanvasImage, setSymphonyCanvasImage] = useState(null)
  const [symphonyCanvasRaster, setSymphonyCanvasRaster] = useState(null)
  const [symphonyCanvasIsSvg, setSymphonyCanvasIsSvg] = useState(false)
  const [symphonyLoadMode, setSymphonyLoadMode] = useState('effect')
  const [symphonyRasterTheme, setSymphonyRasterTheme] = useState(() => {
    const t = document.documentElement.getAttribute('data-theme')
    return t === 'light' ? 'light' : 'dark'
  })
  const [symphonyLayout, setSymphonyLayout] = useState('row')
  /* How the channel's units are ARRANGED — 'card' stacks them in one box (the
     original), 'modular' puts each on the desk as its own module. Same units,
     same state, two layouts: forking the state would guarantee drift, forking
     the arrangement costs nothing. */
  const [symphonyDeskMode, setSymphonyDeskMode] = useState('card')
  const [symphonyRatio, setSymphonyRatio] = useState('16:9')
  const [symphonyCustomWidth, setSymphonyCustomWidth] = useState(1024)
  const [symphonyCustomHeight, setSymphonyCustomHeight] = useState(600)

  // Raster recalc trigger — bump to force re-evaluation
  const [rasterRecalcCounter, setRasterRecalcCounter] = useState(0)

  // Symphony channel state — persists across navigation
  // Nothing arrives on or patched (modular law, 2026-08-27) — patching a
  // channel into a master input turns it on.
  const [symphonyChannels, setSymphonyChannels] = useState([
    { ...EMPTY_CHANNEL },
    { ...EMPTY_CHANNEL },
    { ...EMPTY_CHANNEL },
  ])

  // Undo/redo history for channels
  const channelHistoryRef = useRef([])
  const channelFutureRef = useRef([])

  // Master output — global FX chain applied to combined output
  const EMPTY_BUS = { enabled: true, returnLevel: 0, fx: [], blendMode: 'normal', solo: false }
  const [symphonyMaster, setSymphonyMaster] = useState({
    enabled: true,
    // The three input slots — which channel feeds strip n. Nothing is patched
    // until the user patches it (modular law, 2026-08-27).
    inputs: [null, null, null],
    opacity: 80,
    blendMode: 'normal',
    fx: [],
    inserts: [],
    aux1: { ...EMPTY_BUS },
    aux2: { ...EMPTY_BUS },
    rtn1: { ...EMPTY_BUS },
    rtn2: { ...EMPTY_BUS },
    fx1: { ...EMPTY_BUS },
    fx2: { ...EMPTY_BUS },
  })

  /* UNDO/REDO — one step covers CHANNELS AND MASTER together (2026-08-27).
   * Patch state straddles both (`master.inputs` is half of every cable), so a
   * channels-only snapshot let undo restore the channels and leave the inputs
   * pointing at the old shape. Snapshots are also taken OUTSIDE the setState
   * updater: pushing history from inside one ran twice under StrictMode and
   * recorded duplicate steps, so the first undo appeared to do nothing.
   */
  const liveRef = useRef({ channels: symphonyChannels, master: symphonyMaster })
  useEffect(() => { liveRef.current = { channels: symphonyChannels, master: symphonyMaster } }, [symphonyChannels, symphonyMaster])

  const snap = () => JSON.parse(JSON.stringify(liveRef.current))
  /* One user ACTION is one undo step. "Reloaded" randomises three channels with
     three separate updates in the same tick; pushing each would make undo take
     three presses to reverse one button. Consecutive identical snapshots (the
     ref has not re-synced yet) collapse into one. */
  const pushHistory = () => {
    const s = JSON.stringify(liveRef.current)
    const stack = channelHistoryRef.current
    if (stack.length && JSON.stringify(stack[stack.length - 1]) === s) return
    channelHistoryRef.current = [...stack.slice(-30), JSON.parse(s)]
  }
  const restore = (state) => { setSymphonyChannels(state.channels); setSymphonyMaster(state.master) }

  const setSymphonyChannelsWithHistory = useCallback((updater) => {
    pushHistory()
    channelFutureRef.current = []
    setSymphonyChannels(prev => (typeof updater === 'function' ? updater(prev) : updater))
  }, [])

  const symphonyUndo = useCallback(() => {
    const prev = channelHistoryRef.current.pop()
    if (!prev) return
    channelFutureRef.current = [...channelFutureRef.current, snap()]
    restore(prev)
  }, [])

  const symphonyRedo = useCallback(() => {
    const next = channelFutureRef.current.pop()
    if (!next) return
    channelHistoryRef.current = [...channelHistoryRef.current, snap()]
    restore(next)
  }, [])

  // Currently selected channel tab in sidebar (null = none)
  const [symphonyEditChannel, setSymphonyEditChannel] = useState(null)

  /* PATCHES — the whole desk in and out. Channels and master move together
     because the patch straddles them (`master.inputs` is half of every cable),
     and the canvas settings come along because a patch that renders at a
     different aspect is not the same patch. */
  const loadPatch = useCallback((entry) => {
    const out = applyPatch(entry?.data, { emptyChannel: EMPTY_CHANNEL, master: symphonyMaster })
    if (out.channels.length) setSymphonyChannels(out.channels)
    setSymphonyMaster(out.master)
    const c = out.canvas || {}
    if (c.ratio) setSymphonyRatio(c.ratio)
    if (c.layout) setSymphonyLayout(c.layout)
    if (c.customWidth) setSymphonyCustomWidth(c.customWidth)
    if (c.customHeight) setSymphonyCustomHeight(c.customHeight)
    if (c.loadMode) setSymphonyLoadMode(c.loadMode)
    if (c.rasterTheme) setSymphonyRasterTheme(c.rasterTheme)
    setSymphonyScreen2(c.screen2 ?? 'off')
    setActiveHall('symphony')
    setSymphonyEditChannel(null)
  }, [symphonyMaster])

  const savePatch = useCallback((meta) => addToLibrary(buildPatchEntry({
    channels: symphonyChannels,
    master: symphonyMaster,
    canvas: {
      ratio: symphonyRatio, layout: symphonyLayout,
      customWidth: symphonyCustomWidth, customHeight: symphonyCustomHeight,
      loadMode: symphonyLoadMode, rasterTheme: symphonyRasterTheme, screen2: symphonyScreen2,
    },
  }, meta)), [symphonyChannels, symphonyMaster, symphonyRatio, symphonyLayout, symphonyCustomWidth, symphonyCustomHeight, symphonyLoadMode, symphonyRasterTheme, symphonyScreen2])


  return {
    activeHall,
    activeVariant,
    selectHall,
    selectVariant,
    openVariant,

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
    symphonyMixerVisible,
    setSymphonyMixerVisible,
    symphonyScreen2,
    setSymphonyScreen2,
    symphonyRestartKey,
    setSymphonyRestartKey,
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
    symphonyDeskMode,
    setSymphonyDeskMode,
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

    loadPatch,
    savePatch,

    symphonyEditChannel,
    setSymphonyEditChannel,

    rasterRecalcCounter,
    setRasterRecalcCounter,
  }
}
