import React, { useEffect, useLayoutEffect, useRef, useState, useCallback, useMemo } from 'react'
import { findVariant, getDefaultParams, getIntensityDialValue, getRasterTier, DISPLACEMENT_VARIANTS, MOVEMENT_VARIANTS, COPIES_VARIANTS, GENERATOR_VARIANTS, buildChannelFxStyle, CHANNEL_FX_DEFS, getDefaultFxParams } from '../../data/mirrorVariants'
import { CSS_BLEND_MODES, ALL_VECTORS, loadVectorSvg } from '../hall-of-mirrors/SymphonyMixer'
import { begin, end, endFrame, tickIdle } from '../../hooks/renderStats'
import { qualityRef } from '../../hooks/renderQuality'
import { rasterDims } from '../../utils/processImageUpload'
import { consumedChannels, removeChannelAt, fxModuleChannels, shiftFxModules, removeFxModule, isFxKey, clearAllPatches } from '../../hooks/patchGraph'
import useImageTiers from '../../hooks/useImageTiers'
import useChannelRecorder from '../../hooks/useChannelRecorder'
import { EMPTY_CHANNEL } from '../../hooks/useMirrorState'
import useFrameBuffer, { resolveRenderOrder } from '../../hooks/useFrameBuffer'
import SymphonyMixer from '../hall-of-mirrors/SymphonyMixer'
import TapeDelay from './TapeDelay'
import InfiniteCanvas from './InfiniteCanvas'
import FloatingFrame from './FloatingFrame'
import MonitorModule from '../hall-of-mirrors/modules/MonitorModule'
import { useFloating } from '../../hooks/useFloating'
import { useNarrow } from '../../hooks/useNarrow'
import ChannelLayer from './ChannelLayer'
import RotaryDial from '../hall-of-mirrors/RotaryDial'
import { Oscilloscope } from '../hall-of-mirrors/ExpressionReference'
import defaultCanvasSvg from '../../assets/default-canvas.svg?raw'

const DEFAULT_SVG_DATA_URL = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(defaultCanvasSvg)

const BUS_RENDER_KEYS = ['aux1', 'aux2', 'rtn1', 'rtn2', 'fx1', 'fx2']

const SCREEN2_OPTIONS = [
  { key: 'off', label: 'Off' },
  { key: '0', label: 'Ch 1' },
  { key: '1', label: 'Ch 2' },
  { key: '2', label: 'Ch 3' },
  { key: 'expr', label: 'Expr' },
]

/* Screen 2 — paints a channel's frame buffer each rAF. World-2 consumer:
 * the capture pipeline must be running (hasScreen2 gates it on). */
function Screen2Canvas({ channelIndex, getChannelFrame }) {
  const canvasRef = useRef(null)
  useEffect(() => {
    let raf
    const paint = () => {
      const canvas = canvasRef.current
      if (canvas) {
        const frame = getChannelFrame(channelIndex)
        if (frame) {
          if (canvas.width !== frame.width || canvas.height !== frame.height) {
            canvas.width = frame.width
            canvas.height = frame.height
          }
          const ctx = canvas.getContext('2d')
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          ctx.drawImage(frame, 0, 0)
        }
      }
      raf = requestAnimationFrame(paint)
    }
    raf = requestAnimationFrame(paint)
    return () => cancelAnimationFrame(raf)
  }, [channelIndex, getChannelFrame])
  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
}

/* FX layer — a channel's canvasFx output lands in the frame BUFFER, and until
 * now only Screen 2 and the buses ever read that. On Screen 1 the channel kept
 * showing its RAW source, so adding an effect looked like it did nothing: the
 * chain was running every frame and nobody was looking at the result. Paints
 * the processed buffer over the source, which the stack hides while this is up.
 */
function FxLayer({ channelIndex, getChannelFrame, opacity = 100, blendMode }) {
  return (
    <div
      className="absolute inset-0"
      style={{
        opacity: opacity / 100,
        pointerEvents: 'none',
        ...(blendMode && blendMode !== 'normal' ? { mixBlendMode: blendMode } : {}),
      }}
    >
      <Screen2Canvas channelIndex={channelIndex} getChannelFrame={getChannelFrame} />
    </div>
  )
}

function FeedbackLayer({ channelIndex, feedback, getFeedbackFrame }) {
  const canvasRef = useRef(null)
  const rafRef = useRef(null)

  useEffect(() => {
    if (!feedback?.enabled) return
    const paint = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      const frame = getFeedbackFrame(channelIndex)
      if (frame) {
        if (canvas.width !== frame.width || canvas.height !== frame.height) {
          canvas.width = frame.width
          canvas.height = frame.height
        }
        const ctx = canvas.getContext('2d')
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(frame, 0, 0)
      }
      rafRef.current = requestAnimationFrame(paint)
    }
    rafRef.current = requestAnimationFrame(paint)
    return () => cancelAnimationFrame(rafRef.current)
  }, [feedback?.enabled, channelIndex, getFeedbackFrame])

  if (!feedback?.enabled) return null

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0"
      style={{
        width: '100%',
        height: '100%',
        opacity: (feedback.mix ?? 50) / 100,
        pointerEvents: 'none',
      }}
    />
  )
}

function BusLayer({ busKey, bus, onRegister }) {
  const refCallback = useCallback((el) => {
    onRegister(busKey, el)
  }, [busKey, onRegister])

  if (!bus?.enabled || (bus.returnLevel ?? 0) <= 0) return null

  const fxStyle = buildChannelFxStyle(bus.fx || [])

  return (
    <canvas
      ref={refCallback}
      className="absolute inset-0"
      style={{
        width: '100%',
        height: '100%',
        opacity: (bus.returnLevel ?? 0) / 100,
        ...fxStyle,
        ...(bus.blendMode && bus.blendMode !== 'normal' ? { mixBlendMode: bus.blendMode } : {}),
        pointerEvents: 'none',
      }}
    />
  )
}


function rasterizeSvgDataUrl(svgDataUrl) {
  return new Promise((resolve, reject) => {
    const raw = decodeURIComponent(svgDataUrl.replace('data:image/svg+xml;charset=utf-8,', ''))
    const blob = new Blob([raw], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const img = new Image()
        img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const [rw, rh] = rasterDims(img.naturalWidth || 1024, img.naturalHeight || 1024)
      canvas.width = rw
      canvas.height = rh
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Failed to rasterize SVG')) }
    img.src = url
  })
}

/* THE MONITOR — a 1960s/70s broadcast CRT, not a flat bezel (user 2026-08-28:
   "I said 60 70s"). Built off the references in
   `_tmp/2026-08-28-panel-references/`: the control-room racks (08) and the
   dark-metal receiver panel (09).
   What makes it read as that era, in order of how much work each does:
   1. A ROUNDED SCREEN. A CRT has no sharp corners — this is the single
      biggest cue and the flat build had a 2px radius.
   2. CAST METAL, not black. Warm dark grey with a fine vertical grain and a
      lighter lip along the top edge where light catches the moulding.
   3. SLOTTED SCREWS at 7px with a real slot, each rotated differently —
      not 3px dots.
   4. SCANLINES + a phosphor cast on the glass, both very faint.
   5. BRIGHT silkscreen. On the references the legends are white paint on
      dark metal; 32% grey reads as a modern UI label.
   Depth is carried by COLOUR, not shadow (user: "no shadows or at least VERY
   faint") — the grain, the lip and the mask band do the work a drop shadow
   would normally do. */

/* The panel's own palette. A physical prop carries its own colours rather than
   theme tokens — ARCHITECTURE §5 governs UI chrome, and this is a stage set.
   Sampled off references 08 and 09. */
const PANEL = {
  metal: '#191919',
  metalLo: '#0f0f0f',
  lip: '#2a2a2a',
  mask: '#0d0d0f',
  legend: 'rgb(236 232 222 / 0.78)',
  legendDim: 'rgb(236 232 222 / 0.42)',
  screw: '#333333',
  slot: '#141414',
  tally: '#d0201a',
}

const BEZEL_T = 24
const BEZEL_S = 20
const BEZEL_B = 92
const BEZEL_X = BEZEL_S * 2
const BEZEL_Y = BEZEL_T + BEZEL_B
const DECK_GAP = 24 // the air kept between the monitor and the tape deck — the deck's own inset from the stage edge
const FLOAT_W = 560 // the float arrangement's picture width at scale 1 (the grip runs 0.35–2.5)
const FX_SLOT = { enabled: true, returnLevel: 100, blendMode: 'normal' } // how an FX module's OUT draws in a master slot

/* Each screw sits at a different angle, the way driven screws actually do. */
const SCREWS = [
  { top: 9, left: 9, rot: 24 },
  { top: 9, right: 9, rot: -58 },
  { bottom: 13, left: 9, rot: 71 },
  { bottom: 13, right: 9, rot: -12 },
]

function Screw({ top, right, bottom, left, rot }) {
  return (
    <span
      aria-hidden
      className="absolute rounded-full pointer-events-none"
      style={{
        top, right, bottom, left,
        width: 7, height: 7,
        background: `linear-gradient(145deg, ${PANEL.screw}, ${PANEL.slot})`,
        transform: `rotate(${rot}deg)`,
      }}
    >
      <span className="absolute" style={{ left: 1, right: 1, top: 3, height: 1, background: PANEL.slot }} />
    </span>
  )
}

/* A LOZENGE KEY — the cream buttons on the reference strip. NO LEGEND (user
   2026-08-28: "there is NO text just buttons on the bottom") — at this size the
   silkscreen is illegible mush and reads as dirt, so the keys carry themselves.
   Always cream; `on` brightens and sits the cap down. No shadow. */
function PanelKey({ on, onClick, title, w = 26 }) {
  return (
    <span
      onClick={onClick}
      title={title}
      className={onClick ? 'cursor-pointer select-none' : 'select-none'}
      style={{ width: w, height: 10, borderRadius: 1, background: on ? '#f2eee0' : '#cdc9bc', transform: on ? 'translateY(1px)' : 'none' }}
    />
  )
}

/* The dark speaker grilles flanking the strip on the reference. */
function Grille() {
  return (
    <span
      aria-hidden
      className="shrink-0"
      style={{
        width: 60, borderRadius: 2, background: '#0f0f11',
        backgroundImage: 'radial-gradient(rgb(255 255 255 / 0.05) 0.5px, transparent 0.5px)',
        backgroundSize: '3px 3px',
      }}
    />
  )
}

const ASPECTS = ['16:9', '5:3', '4:3', '1:1', '3:4', '3:5', '9:16']

/* The picture knobs, in the reference's order. The first four WRITE the master
   FX chain — the same chain the composited output already renders through — so
   they do here what they do on the real unit. VOLUME is furniture: this
   instrument has no audio path, and the reference has the knob. */
const STRIP_KNOBS = [
  ['blur', 'amount', 0, 20, 0],
  ['brightness', 'amount', 0, 300, 100],
  ['saturate', 'amount', 0, 300, 100],
  ['contrast', 'amount', 0, 300, 100],
]

/* THE CONTROL STRIP (user 2026-08-28: "put a panel on the bottom with inputs
   and buttons"). A raised module inset from the bezel with a grille either
   side, in the reference's two tiers: the knobs rise out of the TOP row, and
   the BOTTOM row is one continuous run of keys spanning the whole strip.
   MARKER, BLUE ONLY and MONO are DISPLAY-only by design: on a broadcast
   monitor those change the tube, never the signal, so the recorder, the buses
   and Screen 2 never see them. */
function ControlStrip({ master, onMasterChange, onAspect, marker, setMarker, blue, setBlue, mono, setMono, tally }) {
  const read = (type, key, scale, fallback) => {
    const fx = master?.fx?.find(f => f.type === type)
    return fx ? Math.round(fx.params[key] * scale) : fallback
  }
  const write = (type, key, scale) => (v) => {
    const next = [...(master?.fx ?? [])]
    const i = next.findIndex(f => f.type === type)
    const params = { ...(i >= 0 ? next[i].params : getDefaultFxParams(type)), [key]: v / scale }
    if (i >= 0) next[i] = { ...next[i], params, enabled: true }
    else next.push({ type, enabled: true, params })
    onMasterChange?.({ fx: next })
  }
  /* the lower run — live keys first, then the reference's furniture */
  const LOWER = [
    { onClick: onAspect, title: 'Cycle the canvas ratio' },
    { on: marker, onClick: () => setMarker(v => !v), title: 'Safe-area guides' },
    { on: blue, onClick: () => setBlue(v => !v), title: 'Blue channel only' },
    { on: mono, onClick: () => setMono(v => !v), title: 'Monochrome' },
    {}, {}, {}, {}, {}, {}, {},
  ]
  return (
    /* The assembly SPANS the chin between its two grilles, capped at 780 so it
       stays a unit rather than a full-width band (reference 07). The keys inside
       stay centre-packed with fixed gaps — `justify-between` across the whole
       width was what flung them out to the corners. */
    <div className="absolute flex items-stretch justify-center" style={{ left: BEZEL_S, right: BEZEL_S, bottom: 12, gap: 10 }}>
      <Grille />
      <div
        className="flex items-center shrink"
        style={{
          flex: '1 1 auto', maxWidth: 780, minWidth: 0,
          gap: 12, padding: '8px 14px', borderRadius: 3,
          background: '#0c0c0c',
          border: '1px solid #2b2b2b',
        }}
      >
        <div className="flex flex-col flex-1 min-w-0" style={{ gap: 6 }}>
          {/* TOP — two source keys, the knobs rising out of the row, two nav keys */}
          <div className="flex items-center justify-center" style={{ gap: 8 }}>
            <PanelKey />
            <PanelKey />
            {STRIP_KNOBS.map(([type, key, min, max, def]) => {
              const scale = max > 20 ? 100 : 1
              return (
                <RotaryDial
                  key={type}
                  /* dense: the default variant pins its tick ring at 64px no
                     matter what `size` says, which is what overflowed the chin */
                  variant="dense"
                  panel
                  size={26}
                  compact
                  min={min}
                  max={max}
                  defaultValue={def}
                  value={read(type, key, scale, def)}
                  onChange={write(type, key, scale)}
                />
              )
            })}
            <PanelKey w={22} />
            <PanelKey w={22} />
          </div>
          {/* BOTTOM — one continuous run of bare keys */}
          <div className="flex items-center justify-center" style={{ gap: 6 }}>
            {LOWER.map((k, i) => <PanelKey key={i} {...k} w={24} />)}
          </div>
        </div>
        {/* power — the tall cream cap with its lamp above */}
        <div className="flex flex-col items-center justify-center shrink-0" style={{ gap: 4 }}>
          <span aria-hidden className="rounded-full" style={{ width: 5, height: 5, background: tally ? '#7ec81e' : '#2b3a1a', boxShadow: tally ? '0 0 5px #7ec81e' : 'none' }} />
          <span style={{ width: 24, height: 26, borderRadius: 2, background: '#e8e4d6' }} />
        </div>
      </div>
      <Grille />
    </div>
  )
}

function Bezel({ style, tally, screenStyle, strip, children }) {
  /* MARKER / BLUE / MONO live here, not in app state: they change the TUBE,
     not the signal, so nothing downstream — the recorder, the buses, Screen 2 —
     should ever see them. */
  const [marker, setMarker] = useState(false)
  const [blue, setBlue] = useState(false)
  const [mono, setMono] = useState(false)
  return (
    <div
      className="relative shrink-0"
      style={{
        ...style,
        borderRadius: 8,
        padding: `${BEZEL_T}px ${BEZEL_S}px ${BEZEL_B}px`,
        /* cast metal: a fine vertical grain over a body that lightens at the
           top lip and falls off into the chin */
        background: `repeating-linear-gradient(90deg, rgb(255 255 255 / 0.015) 0 1px, transparent 1px 3px), linear-gradient(180deg, ${PANEL.lip} 0, ${PANEL.metal} 5%, ${PANEL.metal} 90%, ${PANEL.metalLo} 100%)`,
      }}
    >
      {/* NO LEGENDS (user 2026-08-28: "who asked to label the monitors") — the
          MULTI FORMAT badge, the model plate and the wordmark were all invented
          here and none of them were asked for. Screws and metal only. */}
      {SCREWS.map((sc, i) => <Screw key={i} {...sc} />)}
      {/* the mask band — the black surround between the moulding and the glass */}
      <div className="w-full h-full" style={{ background: PANEL.mask, borderRadius: 6, padding: 3 }}>
        {/* The opening is near-square — reference 07 is an LCD field monitor,
            not a CRT, and the 17px curve I had read as neither. */}
        <div className="relative w-full h-full overflow-hidden" style={{ borderRadius: 4, ...screenStyle }}>
          <div className="absolute inset-0" style={mono ? { filter: 'grayscale(1)' } : blue ? { filter: 'grayscale(1) sepia(1) hue-rotate(180deg) saturate(6)' } : undefined}>
            {children}
          </div>
          {/* safe-area guides — 90% action, 80% title, the broadcast pair */}
          {marker && (
            <div aria-hidden className="absolute inset-0 pointer-events-none">
              <div className="absolute" style={{ inset: '5%', border: '1px solid rgb(255 255 255 / 0.35)' }} />
              <div className="absolute" style={{ inset: '10%', border: '1px dashed rgb(255 255 255 / 0.22)' }} />
            </div>
          )}
        </div>
      </div>
      {strip && (
        <ControlStrip
          {...strip}
          tally={tally}
          marker={marker} setMarker={setMarker}
          blue={blue} setBlue={setBlue}
          mono={mono} setMono={setMono}
        />
      )}
    </div>
  )
}

/* THE BARE FRAME (user 2026-10-14: "just show a fucking frame nothing else"): the float
   arrangement's monitor is the picture in a box — no bezel, no knobs, no key strip. Drag it by the
   body, scale it from the corner (`FloatingFrame`), V hides it. `Bezel` stays for the stage
   arrangement and Screen 2. */
function Frame({ style, screenStyle, children }) {
  return (
    <div className="relative shrink-0 overflow-hidden border border-fg-08" style={{ ...style, borderRadius: 4, ...screenStyle }}>
      {children}
    </div>
  )
}

export default function SymphonyViewport({ state, arrangement = 'float' }) {
  const canvasContainerRef = useRef(null)
  const deckRef = useRef(null)
  const narrow = useNarrow()
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0, shift: 0 })
  /* THE FLOAT ARRANGEMENT (2026-10-03, the user's idea, built beside the stage to compare):
     the desk takes the whole view, the monitor is a window over it — dragged, scaled from its
     corner, hidden on V — and the tape deck is a module on the desk. `arrangement="stage"` (the
     default) is the studio exactly as it was; nothing below changes for it. Above the fold only —
     a phone has `MobileStudio`. */
  const floating = arrangement === 'float' && !narrow
  const rootRef = useRef(null)
  const frame = useFloating({ x: 24, y: 24, scale: 0.8 })
  const [frameHidden, setFrameHidden] = useState(false)
  /* THE MONITOR MODULE (2026-10-15). DOCKED, the frame sits in the module's screen
     slot and follows it through the desk's pan and zoom; OVERLAY, it floats as
     before. The frame never re-mounts — only its box moves. */
  const [frameDocked, setFrameDocked] = useState(true)
  const [monitorWidth, setMonitorWidth] = useState(360)
  const [monitorFlipped, setMonitorFlipped] = useState(false)
  /* the slot element itself: DOCKED, FloatingFrame moves the picture's DOM node into it (plan 10 § 3.1) */
  const [slotEl, setSlotEl] = useState(null)
  const slotRef = useCallback((el) => setSlotEl(el), [])
  useEffect(() => {
    if (!floating) return undefined
    const onKey = (e) => {
      const t = e.target
      if (t.tagName === 'INPUT' || t.tagName === 'SELECT' || t.tagName === 'TEXTAREA' || t.isContentEditable) return
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key.toLowerCase() === 'v') setFrameHidden((v) => !v)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [floating])
  const [openNineDropdown, setOpenNineDropdown] = useState(null)

  // Channels persisted in global state
  const rawChannels = state.symphonyChannels
  /* In the mix = patched into one of the master's input slots AND on. The
     mixer UI reads the raw list (its ON dot is the channel's own switch); the
     render path reads this one, so an unpatched channel paints nothing. */
  const masterInputs = state.symphonyMaster.inputs
  /* FX MODULES (2026-10-03). A channel cabled into a module's IN has to RENDER for the module to
     have a frame — but it is not in the mix unless it is also in a master slot, so it draws
     hidden (`feedsFxOnly`, below). */
  const fxModules = state.symphonyFxModules
  const fxChannels = useMemo(() => fxModuleChannels(fxModules), [fxModules])
  const channels = useMemo(() => rawChannels.map((ch, i) => (ch.enabled && !((masterInputs || []).includes(i) || fxChannels.has(i))) ? { ...ch, enabled: false } : ch), [rawChannels, masterInputs, fxChannels])
  const setChannels = state.setSymphonyChannels

  // Screen 2 — second canvas source ('off' | channel index string | 'expr')
  const screen2 = state.symphonyScreen2
  const setScreen2 = state.setSymphonyScreen2
  const screen2Active = screen2 !== 'off'
  const [screen2Expr, setScreen2Expr] = useState('wave(t)')
  const [screen2ExprExpanded, setScreen2ExprExpanded] = useState(false)

  // Screen split (2026-08-12, "release the sides") — a draggable divider
  // redistributes width between the two screens. No aspect lock, no
  // shrinking: the panes fill the row, the divider moves the boundary.
  const [split, setSplit] = useState(0.5)
  const splitDragRef = useRef(false)
  const onSplitDown = useCallback((e) => {
    e.preventDefault()
    splitDragRef.current = true
    document.body.style.cursor = 'ew-resize'
    document.body.style.userSelect = 'none'
  }, [])
  useEffect(() => {
    const onMove = (e) => {
      if (!splitDragRef.current) return
      const rect = canvasContainerRef.current?.getBoundingClientRect()
      if (!rect || rect.width <= 0) return
      setSplit(Math.min(0.8, Math.max(0.2, (e.clientX - rect.left) / rect.width)))
    }
    const onUp = () => {
      if (!splitDragRef.current) return
      splitDragRef.current = false
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [])

  const isAnimating = state.symphonyAnimating
  const setIsAnimating = state.setSymphonyAnimating
  const mixerVisible = state.symphonyMixerVisible
  const setMixerVisible = state.setSymphonyMixerVisible
  const prevAnimatingRef = useRef(isAnimating)
  useEffect(() => {
    if (prevAnimatingRef.current !== isAnimating) {
      prevAnimatingRef.current = isAnimating
      setChannels(prev => prev.map(ch => ch.enabled ? { ...ch, params: { ...ch.params, animate: isAnimating } } : ch))
    }
  }, [isAnimating])
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

  // Frame buffer for cross-channel routing
  // qualityRef is read per frame inside the buffer — the render-scale knob.
  const frameBuffer = useFrameBuffer(channels.length, qualityRef)
  /* THE PATCH'S THUMBNAIL (user 2026-10-15) — the output as it stands, drawn the
     way the frame stacks it: each master input in order, at its opacity, through
     its blend mode (2D canvas speaks the same blend names as CSS).
     A DOM-rendered channel only fills its capture canvas while something consumes
     it, so a save first FORCES capture on the master inputs (`thumbChannels`),
     waits ~30 frames for the buffers to fill (6 was too few — the DOM
     channels had not drawn yet), composes, then lets go. Nothing
     here runs per frame outside a save. Empty desk → no thumb. */
  const [thumbChannels, setThumbChannels] = useState(() => new Set())
  const captureThumb = async () => {
    const inputs = (masterRef.current?.inputs || []).filter((i) => typeof i === 'number')
    if (!inputs.length) return undefined
    setThumbChannels(new Set(inputs))
    for (let n = 0; n < 30; n++) await new Promise((r) => requestAnimationFrame(r))
    frameBuffer.captureAll(new Set(inputs))
    setThumbChannels(new Set())
    const W = 320
    const H = 180
    const out = document.createElement('canvas')
    out.width = W
    out.height = H
    const ctx = out.getContext('2d')
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, W, H)
    let drew = false
    for (const i of inputs) {
      const frame = frameBuffer.getChannelFrame(i)
      if (!frame) continue
      const ch = channelsRef.current[i]
      ctx.globalAlpha = (ch?.opacity ?? 100) / 100
      ctx.globalCompositeOperation = ch?.blendMode && ch.blendMode !== 'normal' ? ch.blendMode : 'source-over'
      const k = Math.max(W / frame.width, H / frame.height)
      ctx.drawImage(frame, (W - frame.width * k) / 2, (H - frame.height * k) / 2, frame.width * k, frame.height * k)
      drew = true
    }
    if (!drew) return undefined
    try { return out.toDataURL('image/jpeg', 0.7) } catch { return undefined /* tainted source */ }
  }
  const renderOrder = resolveRenderOrder(channels)

  // Refs for stable access in rAF loop (avoids stale closures)
  const channelsRef = useRef(channels)
  channelsRef.current = channels
  const masterRef = useRef(state.symphonyMaster)
  masterRef.current = state.symphonyMaster
  const fxModulesRef = useRef(fxModules)
  fxModulesRef.current = fxModules

  // Bus canvas registration for zero-delay rendering
  const busCanvasMapRef = useRef(new Map())
  const registerBusCanvas = useCallback((busKey, canvasEl) => {
    if (canvasEl) busCanvasMapRef.current.set(busKey, canvasEl)
    else busCanvasMapRef.current.delete(busKey)
  }, [])

  const handleCanvasReady = useCallback((channelIndex, canvasEl) => {
    canvasRegistryRef.current.set(channelIndex, canvasEl)
    frameBuffer.registerCanvas(channelIndex, canvasEl)
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

  // Canvas sizing — the bezel's chrome is reserved BEFORE the aspect fit, so
  // the picture keeps its exact ratio and the frame fits the container.
  const [rw, rh] = state.symphonyRatio === 'custom'
    ? [state.symphonyCustomWidth, state.symphonyCustomHeight]
    : (state.symphonyRatio || '16:9').split(':').map(Number)

  useEffect(() => {
    const el = canvasContainerRef.current
    if (!el) return
    const update = () => {
      /* The CONTENT box, not the border box. `.symphony-canvas-container` carries
         a 120px padding-top (the monitor sits low on the page) and
         getBoundingClientRect includes it — measuring that made the bezel 120px
         taller than the space it had, so it overflowed equally top and bottom
         and the control strip got clipped off. */
      const cs = getComputedStyle(el)
      const cw = el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)
      const ch = el.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom)
      const ar = rw / rh
      const availW = Math.max(1, cw - BEZEL_X)
      const availH = Math.max(1, ch - BEZEL_Y)
      let w = availW
      let h = availW / ar
      if (h > availH) {
        h = availH
        w = availH * ar
      }
      const nw = Math.floor(w)
      const nh = Math.floor(h)
      /* CLEAR OF THE DECK (2026-10-03). The deck is out of flow at the stage's
         right edge and the monitor is centred, so below about 1900 wide a
         monitor of any real size sits under the deck's corner. The monitor
         slides left by exactly the overlap, and no further than the stage's
         left edge — where there is room it is dead centre, as it was. Its size
         is never touched. Not below the fold, and not with Screen 2, whose
         bezels fill the row. */
      let shift = 0
      const deck = deckRef.current
      if (deck && !narrow && !screen2Active) {
        const frameW = nw + BEZEL_X
        const frameTop = parseFloat(cs.paddingTop) + (ch - nh - BEZEL_Y) / 2
        const deckBottom = deck.offsetTop - el.offsetTop + deck.offsetHeight
        const room = deck.offsetLeft - el.offsetLeft - parseFloat(cs.paddingLeft) - DECK_GAP
        if (frameTop < deckBottom + DECK_GAP) {
          shift = Math.round(Math.max(0, Math.min((cw + frameW) / 2 - room, (cw - frameW) / 2)))
        }
      }
      setCanvasSize(prev => (prev.width === nw && prev.height === nh && prev.shift === shift) ? prev : { width: nw, height: nh, shift })
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [rw, rh, screen2Active, narrow])

  /* The float arrangement sizes the monitor from its own window, not from a stage: the picture is
     FLOAT_W wide at scale 1 and the grip moves the scale. It opens in the bottom-right corner of
     the view, over the empty desk under the modules. */
  const inSlot = floating && frameDocked && !!slotEl
  /* in the slot the picture is the slot's width; the desk's zoom scales both */
  const floatW = inSlot ? monitorWidth : Math.round(FLOAT_W * frame.box.scale)
  const size = floating ? { width: floatW, height: Math.round(floatW * rh / rw), shift: 0 } : canvasSize
  /* the bare frame has no bezel to add to the picture */
  const bx = floating ? 0 : BEZEL_X
  const by = floating ? 0 : BEZEL_Y
  /* ponytail: Screen 2 is not drawn in the float arrangement — one window. A second window when it is asked for. */
  const twoScreens = screen2Active && !floating
  useLayoutEffect(() => {
    const r = rootRef.current
    if (!floating || !r) return
    frame.setBox((b) => ({
      ...b,
      x: Math.max(24, r.clientWidth - FLOAT_W * b.scale - 24),
      y: Math.max(24, r.clientHeight - FLOAT_W * b.scale * rh / rw - 24),
    }))
    // placed once, on entering the arrangement — after that the window is where he left it
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [floating])
  /* DOCKED, the picture is IN the slot — FloatingFrame moves its DOM node there, so it rides pan, zoom, row
     drags and case resizes with the module itself. The per-frame rect chase it replaces is in
     `_tmp/2026-10-24-monitor-slot-chase/`. */

  // Periodic tier re-evaluation during animation (every 500ms)
  const [tierTick, setTierTick] = useState(0)
  useEffect(() => {
    if (!isAnimating) return
    const interval = setInterval(() => setTierTick(t => t + 1), 500)
    return () => clearInterval(interval)
  }, [isAnimating])

  // Frame buffer capture loop for cross-channel routing + bus compositing + feedback
  const frameRafRef = useRef(null)
  const hasRouting = channels.some(ch => ch.routeFrom != null || (ch.routeSendLevels && Object.values(ch.routeSendLevels).some(v => v > 0)))
  const hasCanvasFx = channels.some(ch => ch.enabled && ch.canvasFx && ch.canvasFx.length > 0)
  const hasSends = channels.some(ch => ch.enabled && ch.sends && Object.values(ch.sends).some(v => v > 0))
  const hasFeedback = channels.some(ch => ch.enabled && ch.feedback?.enabled)
  const hasScreen2 = screen2Active && screen2 !== 'expr'
  /* a module with a cable in its IN needs the loop; one with none holds nothing */
  const hasFxModules = fxModules.some((m) => m.input != null)
  useEffect(() => {
    if (!hasRouting && !hasSends && !hasFeedback && !hasCanvasFx && !hasScreen2 && !hasFxModules) return
    let frameNo = 0
    const tick = () => {
      /* Re-arm BEFORE the work (imweb): a throw mid-frame must not kill the
         loop and leave a frozen instrument with no error path back. */
      frameRafRef.current = requestAnimationFrame(tick)
      /* Frame divisor — run the whole pipeline every Nth frame at FULL
         resolution. For a feedback mixer this degrades better than dropping
         quality: trails stay coherent, the image just updates slower. */
      const div = qualityRef.current.frameDivisor || 1
      if (div > 1 && frameNo++ % div !== 0) { tickIdle(); return }
      /* WHAT IS ACTUALLY CONSUMED THIS FRAME. Capturing every registered canvas
         cost a full-canvas drawImage per channel per frame whether or not
         anything read the result — with one channel wired, two thirds of the
         capture stage was thrown away. Rules live in patchGraph (tested). */
      const needed = consumedChannels(channelsRef.current, screen2)
      for (const i of fxModuleChannels(fxModulesRef.current)) needed.add(i)
      frameBuffer.captureAll(needed)
      // Apply canvas FX to channel buffers after capture
      const chs = channelsRef.current
      for (let i = 0; i < chs.length; i++) {
        const ch = chs[i]
        if (ch?.enabled && ch.canvasFx && ch.canvasFx.length > 0) {
          frameBuffer.processChannelFx(i, ch.canvasFx)
        }
      }
      // Apply feedback for channels that have it enabled
      for (let i = 0; i < chs.length; i++) {
        const ch = chs[i]
        if (ch?.enabled && ch.feedback?.enabled) {
          frameBuffer.applyFeedback(i, ch.feedback)
        }
      }
      /* the Routing Matrix's power (plan 16 W5): off bypasses every send — the buses get nothing, each channel goes
         straight to the master */
      frameBuffer.compositeBuses(masterRef.current?.routingEnabled === false ? channelsRef.current.map((c) => ({ ...c, sends: {} })) : channelsRef.current, masterRef.current)
      // FX modules run after the channels and the buses they may read
      frameBuffer.processFxModules(fxModulesRef.current)
      // Copy bus frames to visible canvases
      const tPaint = begin()
      busCanvasMapRef.current.forEach((canvas, key) => {
        const frame = frameBuffer.getBusFrame(key)
        if (frame) {
          if (canvas.width !== frame.width || canvas.height !== frame.height) {
            canvas.width = frame.width
            canvas.height = frame.height
          }
          const ctx = canvas.getContext('2d')
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          ctx.drawImage(frame, 0, 0)
        }
      })
      end('paint', tPaint)
      const size = frameBuffer.sizeRef.current
      endFrame({ pixels: size.width * size.height, channels: needed.size })
    }
    frameRafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameRafRef.current)
  }, [hasRouting, hasSends, hasFeedback, hasCanvasFx, hasScreen2, hasFxModules, screen2, frameBuffer])

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
    { id: 'sep-gen', name: '—', empty: true, type: 'separator' },
    ...GENERATOR_VARIANTS.map(g => ({
      id: `gen:${g.id.replace('gen-', '')}`,
      name: `Generator: ${g.title}`,
      empty: false,
      type: 'generator',
      variantId: g.id,
    })),
  ]

  const nineVariants = {
    displacement: dropdownItems,
    movement: dropdownItems,
    copies: dropdownItems,
  }

  const updateChannel = (idx, updates) => {
    /* NOTHING AUTO-PATCHES (user ruling 2026-08-28: "if I turn on channel 1
       then it auto links to mixer, that is not good, that is some auto shit").
       Switching a channel on used to claim a free master input so it would be
       visible immediately; under the modular law a cable is the user's to make,
       and a switch that silently patches is the desk deciding for him. An
       enabled-but-unpatched channel renders nothing, and that is correct — the
       master says "No input — patch a channel into IN 1". */
    setChannels(prev => {
      const next = [...prev]
      if (next[idx]) next[idx] = { ...next[idx], ...updates }
      return next
    })
  }

  // Rasterize channel SVGs only when vector color differs from global
  const rasterCacheRef = useRef({})
  const [channelRasters, setChannelRasters] = useState({})
  useEffect(() => {
    const newRasters = {}
    channels.forEach((ch, i) => {
      if (!ch.customImageSrc?.startsWith('data:image/svg+xml')) return
      const chColor = ch.vectorColor && ch.vectorColor !== 'currentColor' ? ch.vectorColor : vectorColor
      if (chColor === vectorColor) return // tier pipeline handles this
      const coloredSvg = ch.customImageSrc.replace(/currentColor/g, encodeURIComponent(chColor))
      const key = `${i}:${coloredSvg}`
      if (rasterCacheRef.current[key]) { newRasters[i] = channelRasters[i]; return }
      rasterCacheRef.current[key] = true
      rasterizeSvgDataUrl(coloredSvg).then(raster => {
        setChannelRasters(prev => ({ ...prev, [i]: raster }))
      }).catch(() => {})
    })
    setChannelRasters(prev => {
      const cleaned = {}
      for (const k of Object.keys(prev)) {
        if (newRasters[k] !== undefined) cleaned[k] = prev[k]
      }
      return Object.keys(cleaned).length === Object.keys(prev).length ? prev : cleaned
    })
  }, [channels.map(ch => `${ch.customImageSrc}|${ch.vectorColor}`).join(','), vectorColor])

  const handleReloaded = useCallback((targetCh) => {
    const all = dropdownItems.filter(d => !d.empty && d.type !== 'separator')
    const pick = () => all.length ? all[Math.floor(Math.random() * all.length)] : null
    const r = () => Math.floor(Math.random() * 256)
    const targets = targetCh != null ? [targetCh] : channels.map((_, ci) => ci).filter(ci => ci < 3)
    // Sync updates first
    targets.forEach(idx => {
      const item = pick()
      if (item) handleSelectVariant(idx, item.id)
      updateChannel(idx, {
        enabled: true,
        vectorColor: `rgba(${r()},${r()},${r()},1)`,
        backgroundColor: `rgba(${r()},${r()},${r()},1)`,
        blendMode: CSS_BLEND_MODES[Math.floor(Math.random() * CSS_BLEND_MODES.length)],
        fx: [{ type: 'blur', enabled: true, params: { amount: +(Math.random() * 5).toFixed(1) } }, { type: 'brightness', enabled: true, params: { amount: +(0.5 + Math.random() * 2).toFixed(2) } }],
      })
    })
    // Async vector loads after
    targets.forEach(idx => {
      const v = ALL_VECTORS[Math.floor(Math.random() * ALL_VECTORS.length)]
      loadVectorSvg(v.value, (updates) => updateChannel(idx, updates))
    })
  }, [dropdownItems, channels])
  state.symphonyReloaded = handleReloaded

  const handleLoaded = useCallback((targetCh) => {
    const all = dropdownItems.filter(d => !d.empty && d.type !== 'separator')
    const idx = targetCh ?? 0
    const item = all.length ? all[Math.floor(Math.random() * all.length)] : null
    if (item) handleSelectVariant(idx, item.id)
    updateChannel(idx, { enabled: true, vectorPadding: 0 })
    const v = ALL_VECTORS[Math.floor(Math.random() * ALL_VECTORS.length)]
    loadVectorSvg(v.value, (updates) => updateChannel(idx, updates))
  }, [dropdownItems])
  state.symphonyLoaded = handleLoaded

  const handleLoadPreset = ({ channel, source }) => {
    if (source === 'nine') setOpenNineDropdown(channel)
  }

  const handleSelectVariant = (channel, itemId) => {
    const item = dropdownItems.find(d => d.id === itemId)
    if (!item || item.empty || item.type === 'separator') {
      setOpenNineDropdown(null)
      return
    }

    if (item.type === 'generator') {
      const genDef = findVariant(item.variantId)
      const defaults = genDef?.controls ? getDefaultParams(genDef.controls) : {}
      updateChannel(channel, {
        variantId: item.variantId,
        slotIndex: null,
        params: { ...defaults, animate: true },
        enabled: true,
        intensity: 100,
        baseIntensity: 100,
        name: item.name,
      })
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

    setOpenNineDropdown(null)
  }


  /* the float arrangement swaps the stage for a window; the monitor inside is the same tree */
  const Stage = floating ? FloatingFrame : InfiniteCanvas
  const stageProps = floating ? { frame, hidden: frameHidden, slot: inSlot ? slotEl : null, onClose: () => setFrameHidden(true) } : { style: { flex: 1, minHeight: 0 } }
  /* and the monitor inside it: a bare frame in the window, the bezel on the stage */
  const Screen = floating ? Frame : Bezel

  return (
    <div ref={rootRef} className={`absolute inset-0 symphony-viewport-root ${floating ? 'is-fill' : ''}`}>
      {/* Mixer toggle — mobile only */}
      <div className="symphony-mobile-toggle">
        <span className="kol-helper-12 text-fg-64 cursor-pointer select-none" onClick={() => setMixerVisible(v => !v)}>[{mixerVisible ? 'Hide' : 'Show'}]</span>
      </div>
      {/* The canvas header row is GONE (user 2026-08-28: "this top text, we
          should put it elsewhere … just remove it from the top"). Its three
          jobs moved: the title and the ratio readout were restating what the
          canvas and the sidebar's Canvas Ratio dropdown already say, and
          Screen 2 is now a dropdown beside that one. */}
      {/* THE STAGE (user 2026-08-28: "make studio infinite canvas") — the
          monitor and the deck ride a pannable, zoomable layer; the mixer below
          is chrome and stays put. Drag the background, space-drag or middle-
          drag to pan; ⌘/ctrl-wheel zooms about the pointer. */}
      <Stage {...stageProps}>
      <div ref={floating ? undefined : canvasContainerRef} className={floating ? undefined : 'symphony-canvas-container'} style={floating ? undefined : { height: '100%' }}>
        {size.width > 0 && size.height > 0 && (
          <Screen
            style={twoScreens
              ? { width: `calc(${(split * 100).toFixed(2)}% - 8px)`, height: '100%' }
              : { width: `${size.width + bx}px`, height: `${size.height + by}px`, marginRight: size.shift * 2 }}
            tally={isAnimating}
            strip={{
              master: state.symphonyMaster,
              onMasterChange: (updates) => state.setSymphonyMaster(prev => ({ ...prev, ...updates })),
              onAspect: () => {
                const i = ASPECTS.indexOf(state.symphonyRatio)
                state.setSymphonyRatio(ASPECTS[(i + 1) % ASPECTS.length])
              },
            }}
            screenStyle={{ backgroundColor: state.canvasBackgroundColor === 'transparent' ? 'var(--kol-surface-absolute-split)' : state.canvasBackgroundColor }}
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
                const hasMedia = !!(ch.customImageSrc || ch.customRasterSrc)
                const tier = ch.rasterTierOverride || getRasterTier(resolvedChannel.variantId, resolvedChannel.params)
                const chVectorColor = ch.vectorColor && ch.vectorColor !== 'currentColor'
                  ? ch.vectorColor
                  : vectorColor
                const hasCustomColor = chVectorColor !== vectorColor
                const customSvgColored = hasMedia && ch.customImageSrc?.startsWith('data:image/svg+xml')
                  ? ch.customImageSrc.replace(/currentColor/g, encodeURIComponent(chVectorColor))
                  : ch.customImageSrc
                const channelImageSrc = hasMedia ? (customSvgColored || ch.customRasterSrc) : null
                const rasterForChannel = hasMedia
                  ? (ch.customRasterSrc || channelRasters[i] || null)
                  : hasCustomColor
                    ? (ch.customRasterSrc || channelRasters[i] || null)
                    : (sourceFallback || (rastersReady ? rasterTiers[tier] || rasterTiers.mid : null))
                const channelDefaultSrc = hasMedia ? customSvgColored : null
                /* Source hidden, processed frame shown — the source canvas keeps
                   drawing (opacity does not stop a rAF, and capture reads the
                   backing store), it is just no longer the thing on screen. */
                const fxLive = ch.enabled && ch.canvasFx?.some((f) => f.enabled)
                /* on only because an FX module reads it: it renders for the capture and is not
                   shown — it is in the mix when it is in a master slot, not before */
                const feedsFxOnly = fxChannels.has(i) && !(masterInputs || []).includes(i)
                return (
                <React.Fragment key={i}>
                <FeedbackLayer
                  channelIndex={i}
                  feedback={ch.feedback}
                  getFeedbackFrame={frameBuffer.getFeedbackFrame}
                />
                <div className="absolute inset-0" style={fxLive || feedsFxOnly ? { opacity: 0 } : undefined}>
                <ChannelLayer
                  channel={resolvedChannel}
                  channelIndex={i}
                  forceCapture={(hasScreen2 && screen2 === String(i)) || fxChannels.has(i) || thumbChannels.has(i)}
                  imageSrc={channelImageSrc}
                  rasterSrc={rasterForChannel}
                  defaultSvgSrc={channelDefaultSrc}
                  getChannelFrame={frameBuffer.getChannelFrame}
                  isAnimating={isAnimating}
                  restartKey={state.symphonyRestartKey}
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
                </div>
                {fxLive && !feedsFxOnly && (
                  <FxLayer
                    channelIndex={i}
                    getChannelFrame={frameBuffer.getChannelFrame}
                    opacity={ch.opacity}
                    blendMode={ch.blendMode}
                  />
                )}
                </React.Fragment>
                )
              })}
              {/* An FX module's OUT cabled into a master slot — its frame, drawn like a bus return.
                  ponytail: full level; the slot's strip has no fader for it yet. */}
              {(masterInputs || []).filter(isFxKey).map((key) => (
                <BusLayer key={key} busKey={key} bus={FX_SLOT} onRegister={registerBusCanvas} />
              ))}
              {/* Bus return layers — composited channel sends rendered at returnLevel */}
              {BUS_RENDER_KEYS.map(busKey => (
                <BusLayer
                  key={busKey}
                  busKey={busKey}
                  bus={state.symphonyMaster[busKey]}
                  onRegister={registerBusCanvas}
                />
              ))}
            </div>
          </Screen>
        )}

        {/* Divider — drag to redistribute width between the screens.
            Pill indicator on hover (kol-website sidenav-grab idiom). */}
        {twoScreens && (
          <div
            className="group flex items-center justify-center self-stretch shrink-0"
            style={{ width: 16, cursor: 'ew-resize' }}
            onPointerDown={onSplitDown}
            title="Drag to resize screens"
          >
            <span
              className="rounded-full bg-fg-24 group-hover:bg-fg-64 transition-colors"
              style={{ width: 4, height: 48 }}
            />
          </div>
        )}

        {/* Screen 2 — second canvas beside the main one */}
        {twoScreens && (
          <Bezel
            style={{ flex: '1 1 0', minWidth: 0, height: '100%' }}
            tally={isAnimating}
            screenStyle={{ backgroundColor: 'var(--kol-surface-absolute-split)' }}
          >
            {screen2 === 'expr' ? (
              <div className="absolute inset-0" style={{ padding: 8, overflow: 'hidden' }}>
                <Oscilloscope expr={screen2Expr} setExpr={setScreen2Expr} expanded={screen2ExprExpanded} setExpanded={setScreen2ExprExpanded} />
              </div>
            ) : (
              <Screen2Canvas channelIndex={parseInt(screen2)} getChannelFrame={frameBuffer.getChannelFrame} />
            )}
          </Bezel>
        )}
      </div>
      {/* THE DECK IS OUT OF FLOW (user 2026-08-28: "don't touch my monitor").
          Absolutely positioned against the viewport's right edge, so the canvas
          row is exactly what it was before this existed — the monitor's box,
          its centring and its size are untouched. */}
      {/* right: 24 and the deck's own width — it was hanging past the viewport */}
      {!floating && <div ref={deckRef} style={{ position: 'absolute', right: 24, top: 16, zIndex: 5 }}><TapeDelay /></div>}
      </Stage>
      <div className="symphony-mixer-container" style={mixerVisible ? undefined : { display: 'none' }}>
        <SymphonyMixer
          /* the float arrangement: the desk fills the view, the deck is one of its modules, and
             the tab row carries the monitor's show / hide */
          fxModules={fxModules}
          onFxModuleUpdate={(id, patch) => state.setSymphonyFxModules((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)))}
          onFxModuleRemove={(id) => {
            /* computed OUTSIDE the updaters, like a channel's removal: the module goes with every
               cable into or out of it */
            const out = removeFxModule(fxModules, rawChannels, state.symphonyMaster, id)
            state.setSymphonyFxModules(out.modules)
            setChannels(out.channels)
            state.setSymphonyMaster((m) => ({ ...m, inputs: out.master.inputs }))
          }}
          fill={floating}
          consoleState={state.symphonyConsole}
          onConsole={state.setSymphonyConsole}
          deskEdit={state.deskEdit}
          onBusCanvas={registerBusCanvas}
          onSourceCanvas={frameBuffer.registerSource}
          /* a render function: the mixer hands back the Monitor's jacks — IN on the strip, Screen 2 IN on the back */
          monitor={floating ? ({ strip, back }) => (
            <MonitorModule
              strip={strip}
              back={back}
              flipped={monitorFlipped}
              onFlip={() => setMonitorFlipped((v) => !v)}
              docked={frameDocked}
              onDock={setFrameDocked}
              hidden={frameHidden}
              onHidden={setFrameHidden}
              width={monitorWidth}
              onWidth={setMonitorWidth}
              ratio={rh / rw}
              slotRef={slotRef}
            />
          ) : null}
          /* The patch module's three verbs. Bundled as one prop rather than
             three: SymphonyMixer already threads 40, and these only ever move
             together. `clear` pulls EVERY cable and leaves the channels loaded —
             monitor's semantics (see PatchModule). It pulled the master inputs only,
             so sends, routes, feedback, FX inputs and Screen 2 stayed (plan 10 audit). */
          patchApi={{
            save: async (name) => state.savePatch({ name, thumb: await captureThumb() }),
            load: (entry) => state.loadPatch(entry),
            clear: () => {
              const next = clearAllPatches(state.symphonyChannels, state.symphonyMaster)
              state.setSymphonyChannels(next.channels)
              state.setSymphonyMaster(next.master)
              state.setSymphonyScreen2('off')
              state.setSymphonyFxModules((ms) => ms.map((m) => ({ ...m, input: null })))
            },
          }}
          screen2={state.symphonyScreen2}
          setScreen2={state.setSymphonyScreen2}
          channels={rawChannels}
          isVisible={mixerVisible}
          onChannelUpdate={updateChannel}
          onLoadPreset={handleLoadPreset}
          layout={mixerLayout}
          deskMode={state.symphonyDeskMode}
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
            /* Removing a channel must remap every index that referenced it —
               master inputs, numeric routeFrom, cross-send keys, Screen 2 —
               or the cables above it silently re-attach one channel too high
               (patchGraph.test.mjs covers the cases). Computed OUTSIDE the
               updater: a setState inside one runs twice under StrictMode. */
            const out = removeChannelAt(channels, state.symphonyMaster, screen2, idx)
            state.setSymphonyFxModules(shiftFxModules(fxModules, idx))
            setChannels(out.channels)
            state.setSymphonyMaster(m => ({ ...m, inputs: out.master.inputs }))
            if (out.screen2 !== screen2) state.setSymphonyScreen2(out.screen2)
          }}
          master={state.symphonyMaster}
          onMasterChange={(updates) => state.setSymphonyMaster(prev => ({ ...prev, ...updates }))}
          onRecalc={() => state.setRasterRecalcCounter(c => c + 1)}
          onReloaded={handleReloaded}
          onResetChannel={(idx, all) => {
            if (all) {
              /* Reset all = an empty desk, nothing patched. `enabled: i === 0`
                 forced channel 1 on and left master.inputs pointing at it —
                 the pre-connected state the modular law rejects. */
              setChannels(prev => prev.map(() => ({ ...EMPTY_CHANNEL })))
              state.setSymphonyMaster(m => ({ ...m, inputs: (m.inputs || [null, null, null]).map(() => null) }))
              state.setSymphonyScreen2('off')
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
