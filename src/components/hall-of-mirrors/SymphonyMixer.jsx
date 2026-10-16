import { useRef, useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import Slider from '../atoms/Slider'
import { Icon } from '../icons'
import { IconToggle } from '@kolkrabbi/kol-component'
import Divider from '../atoms/Divider'
import VariantControls from '../mirror/VariantControls'
import { findVariant, filterControlsByTab, CHANNEL_FX_DEFS, MAX_CHANNEL_FX, getDefaultFxParams } from '../../data/mirrorVariants'
import RotaryDial from './RotaryDial'
import ChannelPatchPanel, { MasterPatchPanel, RoutingPatchPanel, FlipIcon } from './ChannelPatchPanel'
import PlaybackModule from './PlaybackModule'
import PatchCableOverlay, { PatchJacksProvider } from './PatchCableOverlay'
import ColorPicker from '../atoms/ColorPicker'
import ChannelWireDiagram from './ChannelWireDiagram'
import MasterModule from './MasterModule'
import RoutingMatrix from './RoutingMatrix'
import GeneratorModule from './modules/GeneratorModule'
import ExpressionModule from './modules/ExpressionModule'
import PatchModule from './modules/PatchModule'
import FxModule from './modules/FxModule'
import { fxKey, isFxKey } from '../../hooks/patchGraph'
import { CANVAS_FX_DEFS } from '../../hooks/useCanvasFx'
import { WIRE_COLORS } from './wireColors'
import ExpressionReference from './ExpressionReference'
import Dropdown from '../molecules/Dropdown'
import GrabEdge from '../GrabEdge'
import MediaBrowser from './MediaBrowser'
import useFileDrop from '../../hooks/useFileDrop'
import LoadUnit from './LoadUnit'
import RecorderUnit from './RecorderUnit'
import { transport } from '../../hooks/transport'
import Console from '../mirror/Console'
import FxUnit from './FxUnit'
import { SourceTab, ResolutionTab } from './SourceUnit'
import ChannelModules from './ChannelModules'
import defaultCanvasSvg from '../../assets/default-canvas.svg?raw'

const DEFAULT_SVG_SRC = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(defaultCanvasSvg)

import { CSS_BLEND_MODES } from './blendOptions'
export { CSS_BLEND_MODES }

const VECTOR_SHAPES = [
  { value: 'shape-01', label: 'S-01' },
  { value: 'shape-01-1', label: 'S-01.1' },
  { value: 'shape-01-2', label: 'S-01.2' },
  { value: 'shape-01-3', label: 'S-01.3' },
  { value: 'shape-01-4', label: 'S-01.4' },
  { value: 'shape-01-5', label: 'S-01.5' },
]
const VECTOR_FORMS = [
  { value: 'form-01', label: 'F-01' },
  { value: 'form-02', label: 'F-02' },
  { value: 'form-03', label: 'F-03' },
  { value: 'form-04', label: 'F-04' },
  { value: 'form-05', label: 'F-05' },
  { value: 'form-06', label: 'F-06' },
  { value: 'form-07', label: 'F-07' },
  { value: 'form-08', label: 'F-08' },
  { value: 'form-09', label: 'F-09' },
  { value: 'form-10', label: 'F-10' },
  { value: 'form-11', label: 'F-11' },
  { value: 'form-12', label: 'F-12' },
  { value: 'form-13', label: 'F-13' },
]
const VECTOR_LOGOS = [
  { value: 'shape-00', label: 'L-01' },
]
export const ALL_VECTORS = [...VECTOR_SHAPES, ...VECTOR_FORMS, ...VECTOR_LOGOS]

export async function loadVectorSvg(name, onMediaChange) {
  const res = await fetch(`/kol-vector/${name}.svg`)
  const raw = await res.text()
  const recolored = raw.replace(/fill="(?!none)[^"]*"/gi, 'fill="currentColor"')
  const src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(recolored)
  onMediaChange({ customImageSrc: src, customRasterSrc: null, customImageName: `${name}.svg` })
}

function LoadButton({ isOpen, onToggle, onClose, items, onSelect }) {
  const btnRef = useRef(null)
  const [direction, setDirection] = useState('down')

  const [panelPos, setPanelPos] = useState(null)

  const handleClick = (e) => {
    e.stopPropagation()
    if (!isOpen && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      setDirection('up')
      setPanelPos({
        left: rect.left,
        bottom: window.innerHeight - rect.top + 4,
      })
    }
    onToggle()
  }

  return (
    <div className="relative">
      <div
        ref={btnRef}
        className="cursor-pointer select-none flex items-center justify-center border border-fg-16 text-oq-96 hover:border-accent-primary hover:accentYellow transition-all"
        style={{ borderRadius: '4px', width: '28px', height: '28px' }}
        onClick={handleClick}
        title="Load from Archive"
      >
        <Icon name="save" size={16} />
      </div>
      {isOpen && createPortal(
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={(e) => { e.stopPropagation(); onClose() }}
          />
          <div
            className="fixed bg-surface-primary border border-fg-16 z-50 max-h-[300px] overflow-y-auto flex flex-col gap-1 p-2"
            style={{ borderRadius: '4px', minWidth: '200px', ...panelPos }}
          >
            {items?.map((item, index) => (
              <div
                key={item.id}
                className={`kol-helper-12 px-2 py-1 transition-all ${
                  item.empty || item.type === 'separator'
                    ? 'text-fg-32 cursor-default'
                    : 'text-fg-64 hover:text-fg-96 hover:bg-surface-secondary cursor-pointer'
                }`}
                style={{ borderRadius: '2px' }}
                onClick={(e) => {
                  e.stopPropagation()
                  onSelect(item.id)
                }}
              >
                {item.name}
              </div>
            ))}
          </div>
        </>,
        document.body
      )}
    </div>
  )
}

/* exported for /mixer, which shows the real strip as its card front rather
   than a drawing of one (user 2026-08-28: "this is the front, not what you put
   in") */
export function Channel({
  onShelfChange,
  onFlip,
  flipped = false,
  patchPanel,
  value,
  onChange,
  enabled,
  onEnabledChange,
  boosted,
  onBoostChange,
  randomness,
  onRandomnessChange,
  onLoadFromNine,
  channelId,
  isDropdownOpen,
  items,
  onSelectItem,
  onCloseDropdown,
  loadedName = null,
  defaultName = null,
  opacity = 100,
  onOpacityChange,
  onEdit,
  onRemove,
  controls,
  params,
  onParamChange,
  fx = [],
  onFxChange,
  blendMode = 'normal',
  onBlendModeChange,
  vectorColor = 'currentColor',
  onVectorColorChange,
  backgroundColor = 'transparent',
  onBackgroundColorChange,
  rasterTheme = 'dark',
  onRasterThemeChange,
  rasterTierOverride = null,
  onRasterTierOverrideChange,
  onRecalc,
  onFxToggleAll,
  fxOpenAllTick,
  onReset,
  onReloaded,
  channelCount = 3,
  channelEnabled = [],
  onToggleChannel,
  customImageSrc = null,
  customRasterSrc = null,
  customImageName = null,
  loadMode = 'effect',
  vectorPadding = 0,
  onMediaChange,
  globalImageThumb = null,
  playhead,
  onSeek,
  renderCost = 0,
  recState = null,
  isRecording = false,
  onArmRecording,
  onStartRecording,
  onStopRecording,
  onDisarmRecording,
  onSaveRecToSlot,
  onClearRecorder,
  onSetActiveRecSlot,
  onClearActiveRecSlot,
  onRemoveRecSlot,
  onAddRecSlot,
  onUploadRecSlot,
  onUpdateRecSlotTrim,
  recSlots = [],
  activeRecSlot = null,
  recPaused = false,
  onRecPauseToggle,
  feedback = { enabled: false, decay: 80, mix: 50, freeze: false },
  onFeedbackChange,
}) {
  // i/o keys snap in/out handles to playhead
  const playheadRef = useRef(playhead)
  playheadRef.current = playhead
  useEffect(() => {
    if (activeRecSlot == null) return
    const slot = recSlots[activeRecSlot]
    if (!slot) return
    const onKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') return
      const t = playheadRef.current
      if (t == null) return
      if (e.key === 'i') onUpdateRecSlotTrim(activeRecSlot, t, slot.mark2)
      if (e.key === 'o') onUpdateRecSlotTrim(activeRecSlot, slot.mark1, t)
      const fps = slot.fps || 30
      const frameDur = 1 / fps
      if (e.key === 'ArrowLeft') { e.preventDefault(); onSeek(t - (e.shiftKey ? frameDur * 10 : frameDur)) }
      if (e.key === 'ArrowRight') { e.preventDefault(); onSeek(t + (e.shiftKey ? frameDur * 10 : frameDur)) }
      if (e.key === 'ArrowUp') { e.preventDefault(); onSeek(slot.mark1 ?? 0) }
      if (e.key === 'ArrowDown') { e.preventDefault(); onSeek(slot.mark2 ?? slot.duration ?? 0) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [activeRecSlot, recSlots, onUpdateRecSlotTrim])

  // Helper: read an FX param value from the fx array
  const getFxValue = (fxId, paramKey) => {
    const item = fx.find(f => f.type === fxId)
    if (!item) {
      const def = CHANNEL_FX_DEFS.find(d => d.id === fxId)
      return def?.params[paramKey]?.default ?? 0
    }
    return item.params[paramKey] ?? 0
  }
  // Helper: set an FX param, creating the FX entry if needed
  const setFxValue = (fxId, paramKey, val) => {
    const idx = fx.findIndex(f => f.type === fxId)
    if (idx >= 0) {
      const next = [...fx]
      next[idx] = { ...next[idx], params: { ...next[idx].params, [paramKey]: val } }
      onFxChange(next)
    } else {
      const defaults = getDefaultFxParams(fxId)
      onFxChange([...fx, { type: fxId, enabled: true, params: { ...defaults, [paramKey]: val } }])
    }
  }

  const [showRemove, setShowRemove] = useState(false)
  const [shelfOpen, setShelfOpenRaw] = useState(false)
  /* Reported up because the SLIDE is what has to lift, not this card: sibling
     slides paint in track order, so the shelf rendered behind channel 2 however
     high its own z-index went. The parent puts the z-index on the slide. */
  const setShelfOpen = (v) => { setShelfOpenRaw(v); onShelfChange?.(v) }
  const [shelfPage, setShelfPage] = useState(0)
  const [shelfTab, setShelfTab] = useState('params') // 'src' | 'res' | 'load' | 'params' | 'rec'
  const { dragging: dropActive, handlers: dropHandlers } = useFileDrop(onMediaChange)
  // Recorder transport settings moved with RecorderUnit — nothing else read them.
  const [fxOpen, setFxOpen] = useState(true)
  const [shelfWidth, setShelfWidth] = useState(280)
  const shelfDragging = useRef(false)
  const shelfStartX = useRef(0)
  const shelfStartW = useRef(0)

  useEffect(() => {
    if (fxOpenAllTick && fxOpenAllTick.tick > 0) setFxOpen(fxOpenAllTick.open)
  }, [fxOpenAllTick?.tick])

  const onShelfDragStart = useCallback((e) => {
    e.preventDefault()
    shelfDragging.current = true
    shelfStartX.current = e.clientX
    shelfStartW.current = shelfWidth
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }, [shelfWidth])

  useEffect(() => {
    const onMove = (e) => {
      if (!shelfDragging.current) return
      const delta = e.clientX - shelfStartX.current
      const next = Math.max(280, Math.min(280 * 3, shelfStartW.current + delta))
      setShelfWidth(next)
    }
    const onUp = () => {
      if (!shelfDragging.current) return
      shelfDragging.current = false
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

  return (
    /* Drop an image or a video anywhere on the card — the fastest path from a
       file to the mixer. Highlight on drag, so the target is obvious. */
    <div
      className="flex flex-row items-stretch shrink-0 relative"
      /* The card lifts while its shelf is open. The shelf's own z-index only
         orders it INSIDE this card; the next slide is a later sibling on the
         track and paints over it regardless, which put the shelf behind
         channel 2. Raising the card is what actually wins. */
      style={{ overflow: 'visible', zIndex: shelfOpen ? 30 : undefined }}
      {...dropHandlers}
    >
      {dropActive && (
        <div
          className="absolute inset-0 z-30 flex items-center justify-center kol-helper-12 border border-accent-primary accentYellow pointer-events-none"
          style={{ borderRadius: 4, backgroundColor: 'var(--kol-oq-04)' }}
        >
          Drop image or video
        </div>
      )}
      <div className="flex flex-col shrink-0">
      <div className="flex items-center justify-between kol-helper-12 mx-2 px-4 py-2 border border-fg-08 border-b-0 shrink-0 bg-surface-tertiary" style={{ borderRadius: '4px 4px 0 0', width: `${320 - 16}px` }}>
        <span className={`${enabled ? 'text-fg-96' : 'text-fg-32'} truncate group`}>
          {loadedName ? (
            <>
              <span className="group-hover:hidden">{loadedName.split(':')[0] + ':'}</span>
              <span className="hidden group-hover:inline">{loadedName.split(':').slice(1).join(':').trim()}</span>
            </>
          ) : (defaultName || '\u00A0')}
          {activeRecSlot != null && <span className="text-fg-32 ml-1">[REC]</span>}
        </span>
        <span className="flex items-center gap-3 shrink-0">
          {onEdit && loadedName && (
            <span className="flex items-center gap-1 text-fg-96 cursor-pointer select-none" onClick={onEdit}>Edit<Icon name="edit" size={12} /></span>
          )}
          <FlipIcon onFlip={onFlip} title="Flip to patch bay" />
        </span>
      </div>
      {/* ONLY THE MIDDLE FLIPS (user, 2026-08-27). The header and the FX
          rack belong to the channel in both states — flipping the whole card
          took them with it and made the back a different-shaped object. Now the
          grey body turns over in place and everything around it holds still. */}
      <div className="mirror-flip-scene" style={{ width: '320px' }}>
        <div className={`mirror-flip-inner ${flipped ? 'is-flipped' : ''}`}>
          <div className="mirror-flip-front">
        <div
          /* the strip sits a rung BELOW the desk (user 2026-08-28: "make
             channel strip a little darker"). `--kol-oq-04` is an opaque step
             down from surface-secondary rather than another translucent wash —
             the desk already carries the page wash, and stacking a second one
             lifts the plate instead of sinking it. */
          className="flex flex-col items-center gap-4 p-4 border border-fg-08 relative"
          style={{
            backgroundColor: 'var(--kol-oq-04)',
            borderRadius: '4px',
            overflow: 'visible',
            width: '320px',
            zIndex: 1,
          }}
        >
        <div className="w-full flex items-stretch gap-4">
          <div className="flex flex-col flex-1 gap-2">
            <div
              className="cursor-pointer select-none flex items-center justify-center relative self-start"
              onClick={() => { setShowRemove(false); onEnabledChange(!enabled) }}
              onContextMenu={(e) => { e.preventDefault(); setShowRemove(!showRemove) }}
              title={enabled ? 'ON' : 'OFF'}
            >
              {showRemove && onRemove && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowRemove(false)} />
                  <div
                    className="absolute left-0 top-full mt-1 bg-surface-primary border border-fg-16 z-50 kol-helper-12 px-3 py-1.5 text-fg-64 hover:text-fg-96 hover:bg-surface-secondary cursor-pointer transition-all"
                    style={{ borderRadius: '4px', whiteSpace: 'nowrap' }}
                    onClick={(e) => { e.stopPropagation(); setShowRemove(false); onRemove() }}
                  >
                    Remove Channel
                  </div>
                </>
              )}
              <div className="w-6 h-6 rounded-full border-2 border-fg-48 flex items-center justify-center">
                <div className={`w-3 h-3 rounded-full transition-all ${enabled ? 'bg-[#e74c3c]' : 'bg-fg-24'}`} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-x-2 gap-y-1 flex-1 w-full">
              <RotaryDial label="INT" value={value} onChange={onChange} size={36} compact />
              <RotaryDial label="HUE" value={Math.round(getFxValue('hue-rotate', 'angle') / 360 * 100)} onChange={(v) => setFxValue('hue-rotate', 'angle', Math.round(v / 100 * 360))} size={36} compact />
              <RotaryDial label="SAT" value={Math.round(getFxValue('saturate', 'amount') / 3 * 100)} onChange={(v) => setFxValue('saturate', 'amount', Math.round(v / 100 * 3 * 100) / 100)} size={36} compact />
              <RotaryDial label="BRT" value={Math.round(getFxValue('brightness', 'amount') / 3 * 100)} onChange={(v) => setFxValue('brightness', 'amount', Math.round(v / 100 * 3 * 100) / 100)} size={36} compact />
              <RotaryDial label="CTR" value={Math.round(getFxValue('contrast', 'amount') / 3 * 100)} onChange={(v) => setFxValue('contrast', 'amount', Math.round(v / 100 * 3 * 100) / 100)} size={36} compact />
              <RotaryDial label="BLR" value={Math.round(getFxValue('blur', 'amount') / 20 * 100)} onChange={(v) => setFxValue('blur', 'amount', Math.round(v / 100 * 20 * 10) / 10)} size={36} compact />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {[
              { key: 'src', icon: 'library', title: 'Source' },
              { key: 'res', icon: 'foundation', title: 'Resolution' },
              { key: 'load', icon: 'save', title: 'Load' },
              { key: 'params', icon: 'frequency', title: 'Parameters', iconSize: 18 },
              { key: 'rec', icon: 'video', title: 'Record' },
            ].map(btn => (
              <div
                key={btn.key}
                className={`cursor-pointer select-none flex items-center justify-center border transition-all ${shelfOpen && shelfTab === btn.key ? 'border-accent-primary accentYellow' : 'border-fg-16 text-oq-96 hover:border-accent-primary hover:accentYellow'}`}
                style={{ borderRadius: '4px', width: '28px', height: '28px' }}
                onClick={() => { if (shelfOpen && shelfTab === btn.key) { setShelfOpen(false) } else { setShelfTab(btn.key); setShelfOpen(true) } }}
                title={btn.title}
              >
                <Icon name={btn.icon} size={btn.iconSize || 16} />
              </div>
            ))}
          </div>
        </div>

        <div className="w-full flex flex-col" style={{ gap: '4px' }}>
          <Slider
            label="Speed"
            min={0}
            max={200}
            step={1}
            value={randomness}
            onChange={onRandomnessChange}
            formatValue={(v) => `${Math.round(v)}%`}
            className="w-full"
            variant="minimal"
          />
          <Slider
            label="Opacity"
            min={0}
            max={100}
            step={1}
            value={opacity}
            onChange={onOpacityChange}
            formatValue={(v) => `${Math.round(v)}%`}
            className="w-full"
            variant="minimal"
          />
          <Divider className="pt-2" />
          <div className="flex items-end justify-between kol-helper-12" style={{ height: '24px' }}>
            <div className="cursor-pointer select-none text-fg-96" onClick={(e) => { onReset && onReset(e.altKey); e.currentTarget.animate([{ color: 'var(--kol-accent-primary)' }, { color: 'var(--kol-surface-on-primary)' }], { duration: 2000, easing: 'ease-out' }) }} title="Reset channel (Alt+click: reset all)">RESET</div>
            <div className="cursor-pointer select-none" style={{ color: shelfOpen && shelfTab === 'rec' ? '#e74c3c' : 'var(--kol-surface-on-primary)' }} onClick={() => { if (shelfOpen && shelfTab === 'rec') { setShelfOpen(false) } else { setShelfOpen(true); setShelfTab('rec') } }} title="Open REC panel">REC/LOOP</div>
            <div className="cursor-pointer select-none" style={{ color: boosted ? '#2dd4bf' : 'var(--kol-fg-32)' }} onClick={() => onBoostChange(!boosted)} title="Boost intensity">BOOST</div>
          </div>
        </div>
      </div>
          </div>
          <div className="mirror-flip-back" style={{ overflowY: 'auto', scrollbarWidth: 'none' }}>
            {patchPanel}
          </div>
        </div>
      </div>
    {/* FX rack — COLOR · BLEND · FX · FB, extracted as a unit (2026-08-27) */}
    {fxOpen && (
      <FxUnit
        fx={fx}
        onFxChange={onFxChange}
        enabled={enabled}
        renderCost={renderCost}
        blendMode={blendMode}
        onBlendModeChange={onBlendModeChange}
        vectorColor={vectorColor}
        onVectorColorChange={onVectorColorChange}
        backgroundColor={backgroundColor}
        onBackgroundColorChange={onBackgroundColorChange}
        rasterTheme={rasterTheme}
        onRasterThemeChange={onRasterThemeChange}
        feedback={params?.feedback}
        onFeedbackChange={onFeedbackChange}
      />
    )}
    </div>{/* close column wrapper */}
    {/* Shelf — OVERLAYS to the right, it does not push (user 2026-08-28: "can we
        stop matrix from reacting to channel being open"). It used to be a flex
        sibling taking real width, so opening it grew the slide 336 → 604 and
        shoved everything downstream on the track the same 268px — Master and
        Routing included. Absolutely positioned against the card (already
        `relative`, already `overflow: visible`), so the desk behind it does not
        move; it covers the next strip while open, which is the trade. */}
    {shelfOpen && (
      <div
        className="flex flex-col px-4 pt-3 pb-4 border border-fg-08 kol-helper-12"
        style={{
          position: 'absolute', left: '100%', top: 0, bottom: 0, zIndex: 20,
          marginLeft: '-12px',
          borderRadius: '0 4px 4px 0',
          backgroundColor: 'var(--kol-surface-tertiary)',
          width: `${shelfWidth}px`,
          paddingLeft: '28px',
        }}
      >
        {/* Shelf tab bar */}
        <div className="flex items-center gap-3 pb-2 mb-2 -mx-4 px-4 border-b border-fg-08">
          {[
            { key: 'src', label: 'SRC' },
            { key: 'res', label: 'RES' },
            { key: 'load', label: 'LOAD' },
            { key: 'params', label: 'PARAMS' },
            { key: 'rec', label: 'REC' },
          ].map(tab => (
            <span
              key={tab.key}
              className={`cursor-pointer select-none uppercase ${
                shelfTab === tab.key ? 'text-fg-96' : 'text-fg-32 hover:text-fg-64'
              }`}
              onClick={() => setShelfTab(tab.key)}
            >
              {tab.label}
            </span>
          ))}
        </div>
        <div style={{ overflow: 'auto', flex: '1 1 0', minHeight: 0, scrollbarWidth: 'none' }}>

        {shelfTab === 'load' && (
          <LoadUnit
            items={items}
            loadedName={loadedName}
            onSelectItem={onSelectItem}
            onMediaChange={onMediaChange}
            onVectorColorChange={onVectorColorChange}
            onBackgroundColorChange={onBackgroundColorChange}
            onBlendModeChange={onBlendModeChange}
            fx={fx}
            onFxChange={onFxChange}
            vectors={ALL_VECTORS}
            loadVectorSvg={loadVectorSvg}
          />
        )}

        {shelfTab === 'params' && controls && params && (() => {
          const ROWS_PER_COL = 14
          const tabControls = controls.filter(c => c.type === 'tabs')
          const filtered = filterControlsByTab(controls, params)
          const pages = []
          for (let i = 0; i < filtered.length; i += ROWS_PER_COL) {
            let page = filtered.slice(i, i + ROWS_PER_COL)
            while (page.length && page[0].type === 'divider') page = page.slice(1)
            pages.push(page)
          }
          const safePage = Math.min(shelfPage, pages.length - 1)
          const currentPage = pages[safePage] || []
          return (
            <>
              {tabControls.length > 0 && (
                <>
                  <VariantControls
                    controls={tabControls}
                    params={params}
                    onParamChange={onParamChange}
                    rowHeight={24}
                  />
                  <Divider className="my-2" />
                </>
              )}
              <div style={{ flex: 1 }}>
                <VariantControls
                  controls={currentPage}
                  params={params}
                  onParamChange={onParamChange}
                  rowHeight={24}
                  disabledKeys={activeRecSlot != null && recSlots[activeRecSlot]?.frozenParams ? Object.keys(recSlots[activeRecSlot].frozenParams) : null}
                />
              </div>
              {pages.length > 1 && (
                <div className="flex items-center justify-end gap-2 pt-2">
                  {pages.map((_, pi) => (
                    <span
                      key={pi}
                      className={`cursor-pointer select-none ${pi === safePage ? 'text-fg-96' : 'text-fg-32 hover:text-fg-64'}`}
                      onClick={() => setShelfPage(pi)}
                    >
                      {pi + 1}/{pages.length}
                    </span>
                  ))}
                </div>
              )}
            </>
          )
        })()}

        {shelfTab === 'src' && (
          <SourceTab
            customImageSrc={customImageSrc}
            customImageName={customImageName}
            vectorColor={vectorColor}
            vectorPadding={vectorPadding}
            loadMode={loadMode}
            onMediaChange={onMediaChange}
            DEFAULT_SVG_SRC={DEFAULT_SVG_SRC}
          />
        )}

        {shelfTab === 'res' && (
          <ResolutionTab
            rasterTierOverride={rasterTierOverride}
            onRasterTierOverrideChange={onRasterTierOverrideChange}
            rasterTheme={rasterTheme}
            onRasterThemeChange={onRasterThemeChange}
            onMediaChange={onMediaChange}
            onRecalc={onRecalc}
          />
        )}

        {shelfTab === 'rec' && (
          <RecorderUnit
            recState={recState}
            recPaused={recPaused}
            recSlots={recSlots}
            activeRecSlot={activeRecSlot}
            playhead={playhead}
            onSeek={onSeek}
            onRecPauseToggle={onRecPauseToggle}
            onArmRecording={onArmRecording}
            onStartRecording={onStartRecording}
            onStopRecording={onStopRecording}
            onDisarmRecording={onDisarmRecording}
            onSaveRecToSlot={onSaveRecToSlot}
            onClearRecorder={onClearRecorder}
            onSetActiveRecSlot={onSetActiveRecSlot}
            onClearActiveRecSlot={onClearActiveRecSlot}
            onRemoveRecSlot={onRemoveRecSlot}
            onAddRecSlot={onAddRecSlot}
            onUploadRecSlot={onUploadRecSlot}
            onUpdateRecSlotTrim={onUpdateRecSlotTrim}
          />
        )}
        </div>{/* close scroll wrapper */}
        {/* Drag handle */}
        <div
          className="absolute top-0 right-0 h-full cursor-col-resize"
          style={{ width: '5px' }}
          onPointerDown={onShelfDragStart}
          onDoubleClick={() => setShelfWidth(280)}
        />
      </div>
    )}
    </div>
  )
}

/* The desk's track: the Console in the row layout, the old stack otherwise. Wearing the
   console skin (`.console-skin`, components.css) — approved off /dev › Console 2026-10-15. */
function DeskTrack({ row, consoleState, onConsole, rowHeight, children }) {
  if (!row) return <div className="flex flex-col" style={{ width: 'fit-content', marginInline: 'auto' }}>{children}</div>
  return (
    <div className="console-skin">
    <Console
      rows={consoleState?.rows || []}
      width={consoleState?.width || 0}
      onRows={(rows) => onConsole?.((c) => ({ ...c, rows }))}
      onWidth={(width) => onConsole?.((c) => ({ ...c, width }))}
      rowHeight={rowHeight}
    >
      {children}
    </Console>
    </div>
  )
}

export default function SymphonyMixer({
  channels = [],
  resolvedParams = [],
  isVisible = true,
  screen2 = 'off',
  setScreen2,
  onChannelUpdate,
  onChannelParamChange,
  onLoadPreset,
  layout = 'row',
  deskMode = 'card',
  dropdownItems = [],
  openNineDropdown = null,
  onSelectVariant,
  onCloseDropdown,
  onEditChannel,
  onRemoveChannel,
  onRecalc,
  onResetChannel,
  onReloaded: onReloadedProp,
  master = { fx: [], blendMode: 'normal', opacity: 100 },
  onMasterChange,
  globalImageThumb = null,
  recChannel = null,
  recState = null,
  playheads = {},
  renderCosts = {},
  onSeek,
  onArmRecording,
  onStartRecording,
  onStopRecording,
  onDisarmRecording,
  onSaveRecToSlot,
  onClearRecorder,
  onSetActiveRecSlot,
  onClearActiveRecSlot,
  onRemoveRecSlot,
  onAddRecSlot,
  onUploadRecSlot,
  onUpdateRecSlotTrim,
  patchApi,
  /* THE FLOAT ARRANGEMENT (2026-10-03, `SymphonyViewport arrangement="float"`): `fill` gives the
     desk the whole view, `deck` is the tape deck as one more module on it, and `frameToggle`
     `{ on, onToggle }` is the monitor window's show / hide in the tab row. All three absent is
     the desk as it was. */
  fill = false,
  deck = null,
  /* the Monitor module (2026-10-15) — built by the viewport, which owns the frame */
  monitor = null,
  /* the console's rows and width (`useMirrorState.symphonyConsole`) */
  consoleState = null,
  onConsole,
  frameToggle = null,
  /* FX MODULES (2026-10-03) — effects standing on the desk as modules of their own, each with
     an IN and an OUT that start empty (`useMirrorState.symphonyFxModules`). */
  fxModules = [],
  onFxModuleUpdate,
  onFxModuleRemove,
}) {
  const [masterFxOpen, setMasterFxOpen] = useState(false)
  const [fxOpenAll, setFxOpenAll] = useState({ open: false, tick: 0 })
  const [masterFxTab, setMasterFxTab] = useState('fx')
  /* DESK VIEW — pan and zoom over the desk (user 2026-08-28: "I want to move
     around either with space bar grab and move or some other key bind").
     A LAYER over embla, not a replacement: with no modifier held the loop and
     its wheel-scroll behave exactly as before.

       hold SPACE + drag   pan   (the canvas idiom — grab the surface and move)
       middle-drag         pan   (no keys, for a mouse)
       alt / ⌘ + drag      pan
       alt / ⌘ + wheel     zoom toward the cursor, 0.25× – 3×
       alt + 0             reset

     SPACE IS THE TRANSPORT'S (App.jsx — play/pause, every route). Over the desk
     this takes it in the CAPTURE phase so a grab cannot also start the clock —
     but a TAP still plays (user 2026-10-15: *"why doesnt it play on
     spacebar?"* — with the pointer over the desk, which is where it always is,
     Space only ever armed a pan). So: Space held + drag pans; Space pressed and
     released with no drag toggles the transport, on keyup.

     The transform wraps ONLY the embla viewport. PatchCableOverlay stays
     outside it on purpose — it measures jacks in screen pixels, so leaving it
     unscaled keeps cables landing on jacks instead of double-applying the zoom. */
  const [view, setView] = useState({ z: 1, x: 0, y: 0 })
  /* LOCK — kol-monitor's idiom exactly (RackViewport/useKeybindings): a state
     for the label and a REF the handlers read, because they are registered once
     and would otherwise close over a stale value. `L` toggles it; every pan and
     zoom handler early-returns on it. */
  const [locked, setLocked] = useState(false)
  const lockedRef = useRef(false)
  /* The dot grid, kol-monitor's exactly (hooks/useDotGrid.js): a radial-gradient
     cell whose SIZE scales with the zoom and whose POSITION carries the pan, so
     the surface visibly moves under the modules instead of the modules sliding
     over a static field. `g` toggles it, same key as over there. */
  const [dots, setDots] = useState(true)
  const [grab, setGrab] = useState(null) // null | 'ready' | 'panning'
  const panRef = useRef(null)
  const overRef = useRef(false)
  const spaceRef = useRef(false)
  const spacePannedRef = useRef(false)
  useEffect(() => {
    const el = deskRef.current
    if (!el) return
    const onEnter = () => { overRef.current = true }
    const onLeave = () => { overRef.current = false }
    const onWheel = (e) => {
      if (lockedRef.current) return
      /* a plain wheel / two-finger scroll PANS the console (it scrolled the embla
         loop until 2026-10-15); alt / ⌘ + wheel still zooms. A TRACKPAD PINCH
         arrives as a wheel with ctrlKey set (user 2026-10-16: it panned instead) —
         it zooms, at kol-monitor's pinch rate (RackViewport). */
      if (!(e.altKey || e.metaKey || e.ctrlKey)) {
        if (e.target.closest?.('input, textarea, select, [data-scroll-own]')) return
        e.preventDefault()
        setView(v => ({ ...v, x: v.x - (e.shiftKey ? e.deltaY : e.deltaX), y: v.y - (e.shiftKey ? 0 : e.deltaY) }))
        return
      }
      e.preventDefault()
      const box = el.getBoundingClientRect()
      const cx = e.clientX - box.left
      const cy = e.clientY - box.top
      setView(v => {
        const f = e.ctrlKey ? Math.exp(-e.deltaY * 0.01) : 1 - e.deltaY * 0.0015
        const z = Math.max(0.25, Math.min(3, v.z * f))
        const k = z / v.z
        // hold the point under the cursor still while the scale changes
        return { z, x: cx - (cx - v.x) * k, y: cy - (cy - v.y) * k }
      })
    }
    /* Safari sends a trackpad pinch as gesture events, not a ctrl-wheel — same
       zoom toward the cursor, driven by the gesture's running scale */
    let gScale = 1
    const onGestureStart = (e) => { e.preventDefault(); gScale = 1 }
    const onGestureChange = (e) => {
      e.preventDefault()
      if (lockedRef.current) return
      const f = e.scale / gScale
      gScale = e.scale
      const box = el.getBoundingClientRect()
      const cx = e.clientX - box.left
      const cy = e.clientY - box.top
      setView(v => {
        const z = Math.max(0.25, Math.min(3, v.z * f))
        const k = z / v.z
        return { z, x: cx - (cx - v.x) * k, y: cy - (cy - v.y) * k }
      })
    }
    const onDown = (e) => {
      if (lockedRef.current) return
      const wants = spaceRef.current || e.button === 1 || ((e.altKey || e.metaKey) && e.button === 0)
      if (!wants) return
      e.preventDefault()
      if (spaceRef.current) spacePannedRef.current = true
      panRef.current = { x: e.clientX, y: e.clientY }
      setGrab('panning')
    }
    const onMove = (e) => {
      const p = panRef.current
      if (!p) return
      const dx = e.clientX - p.x
      const dy = e.clientY - p.y
      panRef.current = { x: e.clientX, y: e.clientY }
      setView(v => ({ ...v, x: v.x + dx, y: v.y + dy }))
    }
    const onUp = () => {
      if (!panRef.current) return
      panRef.current = null
      setGrab(spaceRef.current ? 'ready' : null)
    }
    const noInput = (e) => !e.target.closest('input, textarea, [contenteditable]')
    const onKeyDown = (e) => {
      // g toggles the dot grid (kol-monitor binds the same key)
      if (e.code === 'KeyG' && !e.metaKey && !e.ctrlKey && !e.altKey && noInput(e)) {
        e.preventDefault()
        setDots(v => !v)
        return
      }
      // L locks the view (kol-monitor binds the same key)
      if (e.code === 'KeyL' && !e.metaKey && !e.ctrlKey && noInput(e)) {
        e.preventDefault()
        setLocked(v => { lockedRef.current = !v; return !v })
        return
      }
      if (e.code === 'Space' && !e.repeat && !lockedRef.current && overRef.current && noInput(e) && !spaceRef.current) {
        // take Space from the transport, but only over the desk
        e.preventDefault()
        e.stopImmediatePropagation()
        spaceRef.current = true
        spacePannedRef.current = false
        setGrab(g => g === 'panning' ? g : 'ready')
      }
      if (e.altKey && e.key === '0' && !lockedRef.current) setView({ z: 1, x: 0, y: 0 })
    }
    const onKeyUp = (e) => {
      if (e.code === 'Space') {
        if (spaceRef.current) {
          e.preventDefault()
          e.stopImmediatePropagation()
          if (!spacePannedRef.current) transport.toggle()
        }
        spaceRef.current = false
        if (!panRef.current) setGrab(null)
      }
    }
    el.addEventListener('pointerenter', onEnter)
    el.addEventListener('pointerleave', onLeave)
    el.addEventListener('wheel', onWheel, { passive: false })
    el.addEventListener('gesturestart', onGestureStart)
    el.addEventListener('gesturechange', onGestureChange)
    el.addEventListener('pointerdown', onDown)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('keydown', onKeyDown, true)
    window.addEventListener('keyup', onKeyUp, true)
    return () => {
      el.removeEventListener('pointerenter', onEnter)
      el.removeEventListener('pointerleave', onLeave)
      el.removeEventListener('wheel', onWheel)
      el.removeEventListener('gesturestart', onGestureStart)
      el.removeEventListener('gesturechange', onGestureChange)
      el.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('keydown', onKeyDown, true)
      window.removeEventListener('keyup', onKeyUp, true)
    }
  }, [])

  const [mixerTab, setMixerTab] = useState('mixer')
  // Flip-to-patch (2026-08-12) — per-channel card flip + pending patch source
  const [flippedCards, setFlippedCards] = useState({})
  const [pendingOut, setPendingOut] = useState(null)
  // Flip shortcuts — 1/2/3 flip that channel's card, P flips the whole desk.
  // Gated on the mixer actually being on screen (audit 2026-08-12: keys were
  // flipping cards invisibly while the mixer was hidden or on Expressions).
  const channelCount = channels.length
  const flipKeysActiveRef = useRef(true)
  useEffect(() => { flipKeysActiveRef.current = isVisible && mixerTab === 'mixer' })
  useEffect(() => {
    const onKey = (e) => {
      if (!flipKeysActiveRef.current) return
      const t = e.target
      if (t.tagName === 'INPUT' || t.tagName === 'SELECT' || t.tagName === 'TEXTAREA' || t.isContentEditable) return
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const k = e.key.toLowerCase()
      if (k === 'p') {
        setFlippedCards(prev => {
          const all = channelCount > 0 && Array.from({ length: channelCount }).every((_, i) => prev[i]) && prev.master && prev.routing
          return all ? {} : { ...Object.fromEntries(Array.from({ length: channelCount }, (_, i) => [i, true])), master: true, routing: true }
        })
        return
      }
      const n = parseInt(k)
      if (!isNaN(n) && n >= 1 && n <= channelCount) {
        setFlippedCards(prev => ({ ...prev, [n - 1]: !prev[n - 1] }))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [channelCount])

  /* THE EMBLA LOOP IS RETIRED (2026-10-15) — the desk is a Console of rows
     (`components/mirror/Console.jsx`, user: *"rows, so you could add and remove
     rows (height) and width"*). The loop, its wheel plugin and the ring spacers
     are in `_tmp/2026-10-15-desk-track/embla-loop.jsx`. A plain wheel now pans
     the desk (see the wheel handler above). */
  const [firstSlideEl, setFirstSlideEl] = useState(null)
  /* Which slide has its shelf open. The shelf OVERLAYS now rather than taking
     track width, and an overlay only wins against later slides if the slide
     itself is lifted — a z-index inside the card cannot reach past its own. */
  const [shelfSlide, setShelfSlide] = useState(null)
  /* THE DESK'S HEIGHT is grabbable at its top edge (user 2026-08-28: "where
     is the grab to make channel strip taller"). null = content height, which
     is what it was before and what a double-click restores. The drag writes
     px straight to state; `masterH` follows through the ResizeObserver below,
     so master and routing stay pinned to the channel. */
  const [deskH, setDeskH] = useState(null)
  const [masterH, setMasterH] = useState(null)
  useEffect(() => {
    if (!firstSlideEl) return
    const ro = new ResizeObserver(() => setMasterH(firstSlideEl.offsetHeight))
    ro.observe(firstSlideEl) // fires once on observe
    return () => ro.disconnect()
  }, [firstSlideEl])
  // (Two-finger touch-pan effect removed 2026-08-12 — the embla loop +
  // WheelGesturesPlugin own desk scrolling now.)
  const deskRef = useRef(null)
  /* the desk is in patch mode when every card is on its back — the Patch tab's
     active state and its label both read this */
  const allFlipped = channels.length > 0 && channels.every((_, i) => flippedCards[i]) && flippedCards.master && flippedCards.routing
  /* any card on its back — the wire diagram's cue */
  const patching = Object.values(flippedCards).some(Boolean)
  return (
    <div className="flex flex-col gap-6">
      {/* Wire diagram — patch-mode only (user ruling 2026-08-12): the signal
          map earns its 80px while you're actually patching, i.e. any card
          is flipped to its patch bay.
          THE 80px IS RESERVED EITHER WAY (bug, user 2026-08-28: "output
          monitor changes size when I flip to patch bay"). Mounting the block
          on flip grew the mixer by 80, and the mixer sits at the bottom of a
          flex column — so the viewport above it lost 80px and the output
          monitor rescaled mid-patch. The row now always occupies its height
          and only its CONTENTS come and go, so the desk's top edge never
          moves and the monitor holds its size.
          `fill` is the exception: the monitor is a window there and nothing sits
          above the desk to resize, so the row is back to patch-mode only — a
          reserved band was 104px of blank page over the tab row. */}
      {(!fill || patching) && (
        <div style={{ height: '80px', overflow: 'hidden' }}>
          {patching && (
            <ChannelWireDiagram channels={channels} master={master} />
          )}
        </div>
      )}
      {/* the desk is in patch mode when every card is on its back */}
      {/* the rule runs the FULL width (user 2026-08-28: "make the line go all
          the way across") — the row bleeds out past the studio's 16px viewport
          gutter and the container's own inset, then pads the tabs back to
          where they were. The grab edge rides the same box, so the pill can
          travel the whole line. */}
      <div
        /* WRAPS BELOW THE FOLD. The row is Mixer · Expressions · Patch with
              Lock + Grid pushed right by `margin-left: auto`; at 390 its total
              runs past the viewport and the right pair simply leaves the
              screen. `flex-wrap` + a tighter mobile gap lets it fall to a
              second line instead — measured 2026-09-01, and the desk is on a
              phone now that nothing is omitted from mobile. */
            className="flex items-center flex-wrap gap-x-4 gap-y-2 md:gap-x-6 pb-2 mb-1 border-b border-fg-08"
        style={{ position: 'relative', marginInline: -16, paddingInline: 16 }}
      >
        {/* The grab edge sits ON this row's bottom rule — the line between the
            viewport and the desk (user 2026-08-28: "it needs to be ON THE
            LINE"). Drag it down to make the strips taller; double-click
            restores content height. `bottom` rather than `top`: the strip
            straddles the border below it, not the box's own top edge. */}
        {/* not in `fill`: the desk already has the whole view, there is nothing to trade height with */}
        {layout === 'row' && mixerTab === 'mixer' && !fill && (
          <GrabEdge
            axis="y"
            style={{ top: 'auto', bottom: '-4.5px' }}
            onDoubleClick={() => setDeskH(null)}
            onDrag={(y) => {
              const b = deskRef.current?.getBoundingClientRect()
              if (b) setDeskH(Math.max(240, Math.min(1200, Math.round(b.bottom - y))))
            }}
          />
        )}
        {/* ONE COMPONENT FOR ALL THREE (user 2026-08-28: "this should be all
            the same component, not 2 and 1 … same size icon as well"). Patch
            was a one-off span beside the map with its own type rung, its own
            gap and its own active rule. Every tab is a row in one list now —
            what differs is only `active` and what the click does, which is
            data, not a second rendering path. */}
        {[
          { key: 'mixer', label: 'Mixer', icon: 'settings-01', active: mixerTab === 'mixer', onClick: () => setMixerTab('mixer') },
          { key: 'expressions', label: 'Expressions', icon: 'wave', active: mixerTab === 'expressions', onClick: () => setMixerTab('expressions') },
          ...(mixerTab === 'mixer' ? [{
            key: 'patch',
            label: allFlipped ? 'Controls' : 'Patch',
            icon: 'flip-y',
            active: allFlipped,
            title: allFlipped ? 'Flip all to controls (P)' : 'Flip all to patch bays (P)',
            onClick: () => setFlippedCards(allFlipped ? {} : { ...Object.fromEntries(channels.map((_, i) => [i, true])), master: true, routing: true }),
          }] : []),
        ].map(tab => (
          <span
            key={tab.key}
            title={tab.title}
            className={`cursor-pointer select-none kol-helper-14 flex items-center gap-2 ${
              tab.active ? 'text-fg-96' : 'text-fg-32 hover:text-fg-64'
            }`}
            onClick={tab.onClick}
          >
            <Icon name={tab.icon} size={14} />
            {tab.label}
          </span>
        ))}
        {/* LOCK + GRID — were kol-monitor's bracket idiom (VideoModulo.jsx:154),
            icon-only since 2026-10-15 (below). `L` and `g` bind the same keys it does. */}
        {/* On the desk this hugs the right. Below md the row wraps, and a
            group pushed right by `margin-left: auto` lands 8px under "Patch"
            reading as overlap (user, 2026-09-01: "do you think that's a good
            look?"). So under md it takes its OWN line — full width,
            left-aligned, a hairline above — and reads as a second row of chrome
            instead of a collision. Monitor keeps `[Lock]` out of its tab row
            entirely, as a fixed corner control; on a desk that scrolls inside a
            page, a second row is the equivalent that stays with the desk. */}
        {/* ICON-ONLY (user 2026-10-15: *"why is everything in brackets icon AND
            TEXT? all of this is also listed in shortcuts … we want to minimise
            noise"*). The state is the ink — lit when on, red when locked — and
            the name is the tooltip, with its key. 16px off the right edge: the
            group used to touch it. kol-component has no IconToggle yet (filed
            to kol-ds-ui 2026-10-15, shipped kol-component 0.261.0) — the DS atom, fed
            mirror's own Icon so the local glyph names resolve. */}
        <span className="flex items-center gap-3 w-full pt-2 mt-1 border-t border-fg-08 md:w-auto md:pt-0 md:mt-0 md:border-t-0 md:ml-auto md:pr-4">
          {frameToggle && (
            <IconToggle
              icon="monitor"
              label="Frame"
              title={frameToggle.on ? 'Hide frame (V)' : 'Show frame (V)'}
              pressed={frameToggle.on}
              onChange={() => frameToggle.onToggle()}
              iconComponent={Icon}
            />
          )}
          <IconToggle
            icon="grid-02"
            label="Dot grid"
            title={dots ? 'Hide dot grid (G)' : 'Show dot grid (G)'}
            pressed={dots}
            onChange={setDots}
            iconComponent={Icon}
          />
          <IconToggle
            icon="unlock"
            iconOn="lock"
            label="Lock the view"
            title={locked ? 'Unlock the view (L)' : 'Lock the view (L)'}
            pressed={locked}
            tone="danger"
            onChange={(v) => { lockedRef.current = v; setLocked(v) }}
            iconComponent={Icon}
          />
        </span>
      </div>
      <PatchJacksProvider>
      {/* ONE SURFACE, monitor's (user 2026-10-15: *"why is the background different???? look at
          monitor … no clipping or different bg"*). The desk box IS the stage: the dot grid is
          its own background (cell scales with the zoom, position carries the pan), there is no
          second wash, and it CLIPS — a pan can no longer drag modules over the tab row. The
          retired wash: `_tmp/2026-10-15-desk-wash/`. */}
      <div
        ref={deskRef}
        /* -mt-7 / pt-7: the 28px between the tab rule and the desk (the row's mb-1 + the
           column's gap-6) belongs to the desk — the clip sits ON the rule, not 28px under it
           (user 2026-10-15: "dont clip on padding") */
        className="-mt-7 pt-7"
        style={{
          position: 'relative',
          overflow: 'hidden',
          ...(dots ? {
            backgroundImage: 'radial-gradient(var(--kol-fg-12) 1px, transparent 1px)',
            backgroundSize: `${36 * view.z}px ${36 * view.z}px`,
            backgroundPosition: `${view.x}px ${view.y}px`,
          } : null),
        }}
      >
      {/* Patch cables (v2, 2026-08-15) — full between flipped bays, ghosted otherwise */}
      {isVisible && mixerTab === 'mixer' && (
        <PatchCableOverlay channels={channels} flipped={flippedCards} inputs={master.inputs} screen2={screen2} fxModules={fxModules} containerRef={deskRef} />
      )}
      {/* A Mixer — channels + master section as an EMBLA LOOP (user ruling
          2026-08-12): the desk is a circle, wheel scrolls it endlessly in
          either direction. watchDrag off so pointer drags stay with the
          knobs/sliders; WheelGesturesPlugin carries two-finger scroll.
          Centering released — the loop has no edges to center between. */}
      <div
        style={{
          transform: `translate(${view.x}px, ${view.y}px) scale(${view.z})`,
          transformOrigin: '0 0',
          cursor: grab === 'panning' ? 'grabbing' : grab === 'ready' ? 'grab' : undefined,
        }}
      >
      <div
        /* THE STAGE GETS AT LEAST HALF THE WINDOW (2026-10-03, the crushed
           viewframe). At content height the desk is 482px under 163px of its
           own chrome, in a studio padded 32 — a fixed 677px, so on a 1000px
           window the monitor was left a 63px picture and the tape deck was
           cut off. Until the rule is dragged the desk box is capped at half
           the window less that chrome (195), never under the grab's own 240
           floor; what is cut is reached by the rule, the pan or the zoom. A
           dragged height wins — the cap is the default only. Above the fold
           only: the phone desk scrolls in its sheet. */
        className={!deskH && !fill && layout === 'row' ? 'md:max-h-[max(240px,calc(50dvh-195px))]' : undefined}
        /* THE CLIP LINE SITS OUTSIDE THE PADDING (user 2026-08-28: "just
           don't clip where the padding is"). embla needs `overflow: hidden`,
           but with the box ending on the cards' own edge it cut their padding,
           borders and the flip scene's shadow. Equal padding + negative margin
           moves the clip out by 16px on each side: the viewport occupies the
           same space, the cards keep their gutter, and the loop is untouched. */
        style={{
          overflow: 'visible',
          overscrollBehaviorX: 'contain',
          visibility: mixerTab === 'mixer' ? 'visible' : 'hidden',
          ...(layout === 'row' ? { paddingInline: 16, marginInline: -16, paddingBottom: 16, marginBottom: -16 } : null),
          /* THE GRAB GIVES THE DESK ROOM, IT DOES NOT STRETCH THE MODULES
             (user 2026-08-28: "this should not grow, these modules are not
             supposed to be responsive like that — the reason I want to make the
             channel taller is just to move things around"). Height lands on the
             desk's BOX; the track is `items-start`, so every module keeps its
             intrinsic height and the extra is empty desk. That is also the
             shape an infinite canvas needs later — space to arrange in, not
             modules that resize to fill it. */
          /* `fill`: the whole view less the same chrome the cap above counts (195), or less 91 while
             the wire row is away (its 80 and one 24 gap) — the modules keep their height at the
             top and the rest is empty desk, where the monitor window sits */
          ...(deskH ? { height: deskH } : fill ? { height: `calc(100dvh - ${patching ? 195 : 91}px)` } : null),
        }}
      >
      {/* THE CONSOLE (2026-10-15) — in the desk's row layout the modules sit in
          rows of one U (`Console`); the column layout keeps its plain stack. */}
      <DeskTrack row={layout === 'row'} consoleState={consoleState} onConsole={onConsole} rowHeight={masterH}>
        {/* TWO ARRANGEMENTS, ONE MODEL (2026-08-27). 'card' stacks the units in
            one box behind a tab bar; 'modular' puts each on the desk as its own
            module. Both render the SAME unit components off the same channel
            state, so a change to a unit lands in both. */}
        {deskMode === 'modular' && channels.map((ch, i) => (
          <ChannelModules
            key={`mod-${i}`}
            data-console={`ch-${i}`}
            index={i}
            channel={ch}
            onChannelUpdate={onChannelUpdate}
            onMediaChange={(updates) => onChannelUpdate(i, updates)}
            onRecalc={onRecalc}
            DEFAULT_SVG_SRC={DEFAULT_SVG_SRC}
          />
        ))}
        {deskMode !== 'modular' && channels.map((ch, i) => (
          <div
            key={i}
            data-console={`ch-${i}`}
            className="shrink-0 pr-4"
            ref={i === 0 ? setFirstSlideEl : undefined}
            style={{ position: 'relative', zIndex: shelfSlide === i ? 30 : undefined }}
          >
          <Channel
            onShelfChange={(open) => setShelfSlide(open ? i : (prev) => (prev === i ? null : prev))}
            flipped={!!flippedCards[i]}
            patchPanel={
              <ChannelPatchPanel
                channelIndex={i}
                channel={ch}
                channels={channels}
                master={master}
                screen2={screen2}
                onChannelUpdate={onChannelUpdate}
                pendingOut={pendingOut}
                setPendingOut={setPendingOut}
                onFlip={() => setFlippedCards(prev => ({ ...prev, [i]: !prev[i] }))}
              />
            }
            onFlip={() => setFlippedCards(prev => ({ ...prev, [i]: !prev[i] }))}
            value={ch.intensity}
            onChange={(v) => onChannelUpdate(i, { intensity: v })}
            enabled={ch.enabled}
            onEnabledChange={(v) => onChannelUpdate(i, { enabled: v })}
            boosted={ch.boosted}
            onBoostChange={(v) => onChannelUpdate(i, { boosted: v })}
            randomness={ch.speed}
            onRandomnessChange={(v) => onChannelUpdate(i, { speed: v })}
            onLoadFromNine={() => onLoadPreset && onLoadPreset({ channel: i, source: 'nine' })}
            channelId={`ch-${i}`}
            isDropdownOpen={openNineDropdown === i}
            items={dropdownItems}
            onSelectItem={(id) => onSelectVariant(i, id)}
            onCloseDropdown={onCloseDropdown}
            loadedName={ch.name}
            defaultName={`Channel ${i + 1}`}
            onEdit={() => onEditChannel && onEditChannel(i)}
            onRemove={channels.length > 1 ? () => onRemoveChannel && onRemoveChannel(i) : null}
            opacity={ch.opacity}
            onOpacityChange={(v) => onChannelUpdate(i, { opacity: v })}
            controls={ch.variantId ? findVariant(ch.variantId)?.controls : null}
            params={resolvedParams[i] || ch.params}
            onParamChange={(key, value) => onChannelParamChange && onChannelParamChange(i, key, value)}
            fx={ch.fx || []}
            onFxChange={(fxArr) => onChannelUpdate(i, { fx: fxArr })}
            blendMode={ch.blendMode || 'normal'}
            onBlendModeChange={(mode) => onChannelUpdate(i, { blendMode: mode })}
            vectorColor={ch.vectorColor || 'currentColor'}
            onVectorColorChange={(c) => onChannelUpdate(i, { vectorColor: c })}
            backgroundColor={ch.backgroundColor || 'transparent'}
            onBackgroundColorChange={(c) => onChannelUpdate(i, { backgroundColor: c })}
            rasterTheme={ch.rasterTheme || 'dark'}
            onRasterThemeChange={(t) => onChannelUpdate(i, { rasterTheme: t })}
            rasterTierOverride={ch.rasterTierOverride || null}
            onRasterTierOverrideChange={(t) => onChannelUpdate(i, { rasterTierOverride: t })}
            onRecalc={() => onRecalc && onRecalc(i)}
            onFxToggleAll={(open) => setFxOpenAll(prev => ({ open, tick: prev.tick + 1 }))}
            fxOpenAllTick={fxOpenAll}
            onReset={(all) => onResetChannel && onResetChannel(i, all)}
            channelCount={channels.length}
            channelEnabled={channels.map(c => c.enabled)}
            onToggleChannel={(ci) => onChannelUpdate(ci, { enabled: !channels[ci]?.enabled })}
            onReloaded={onReloadedProp}
            customImageSrc={ch.customImageSrc || null}
            customRasterSrc={ch.customRasterSrc || null}
            customImageName={ch.customImageName || null}
            loadMode={ch.loadMode || 'effect'}
            vectorPadding={ch.vectorPadding || 0}
            onMediaChange={(updates) => onChannelUpdate(i, updates)}
            globalImageThumb={globalImageThumb}
            playhead={playheads[i]}
            onSeek={(time) => onSeek && onSeek(i, time)}
            renderCost={renderCosts[i] || 0}
            recPaused={!!ch.recPaused}
            onRecPauseToggle={() => onChannelUpdate(i, { recPaused: !ch.recPaused })}
            recState={recChannel === i ? recState : null}
            isRecording={recChannel === i && recState?.status === 'recording'}
            onArmRecording={(len, fps) => onArmRecording && onArmRecording(i, len, fps)}
            onStartRecording={() => onStartRecording && onStartRecording()}
            onStopRecording={() => onStopRecording && onStopRecording()}
            onDisarmRecording={() => onDisarmRecording && onDisarmRecording(i)}
            onSaveRecToSlot={(recData) => onSaveRecToSlot && onSaveRecToSlot(i, recData)}
            onClearRecorder={() => onClearRecorder && onClearRecorder(i)}
            onSetActiveRecSlot={(si) => onSetActiveRecSlot && onSetActiveRecSlot(i, si)}
            onClearActiveRecSlot={() => onClearActiveRecSlot && onClearActiveRecSlot(i)}
            onRemoveRecSlot={(si) => onRemoveRecSlot && onRemoveRecSlot(i, si)}
            onAddRecSlot={() => onAddRecSlot && onAddRecSlot(i)}
            onUploadRecSlot={(si, file) => onUploadRecSlot && onUploadRecSlot(i, si, file)}
            onUpdateRecSlotTrim={(si, m1, m2) => onUpdateRecSlotTrim && onUpdateRecSlotTrim(i, si, m1, m2)}
            recSlots={ch.recSlots || []}
            activeRecSlot={ch.activeRecSlot}
            feedback={ch.feedback || { enabled: false, decay: 80, mix: 50, freeze: false }}
            onFeedbackChange={(fb) => onChannelUpdate(i, { feedback: fb })}
          />
          </div>
        ))}

        {/* Master section — joined from the old Output tab (2026-08-12):
            channel strips left, master + routing right, one desk. Both pin
            to the channel height; overflow scrolls inside the module.
            Both FLIP like the channels (scope 2026-08-12): master back =
            bus IN + RTN OUT jacks, routing back = the live cable list. */}
        <div data-console="master" className="shrink-0 pr-4" style={masterH ? { height: masterH } : undefined}>
          {/* the module owns its flip now — only its panel turns */}
          <MasterModule
            onFlip={() => setFlippedCards(prev => ({ ...prev, master: !prev.master }))}
            flipped={!!flippedCards.master}
            back={(
              <MasterPatchPanel
                channels={channels}
                onChannelUpdate={onChannelUpdate}
                master={master}
                onMasterChange={onMasterChange}
                pendingOut={pendingOut}
                setPendingOut={setPendingOut}
                screen2={screen2}
                setScreen2={setScreen2}
                onFlip={() => setFlippedCards(prev => ({ ...prev, master: !prev.master }))}
              />
            )}
            master={master}
            onMasterChange={(updates) => onMasterChange && onMasterChange(updates)}
            channels={channels}
            onChannelUpdate={onChannelUpdate}
          />
        </div>
        <div data-console="routing" className="shrink-0 pr-4" style={masterH ? { height: masterH } : undefined}>
          <RoutingMatrix
            onFlip={() => setFlippedCards(prev => ({ ...prev, routing: !prev.routing }))}
            flipped={!!flippedCards.routing}
            back={<RoutingPatchPanel channels={channels} onChannelUpdate={onChannelUpdate} master={master} onMasterChange={onMasterChange} screen2={screen2} setScreen2={setScreen2} pendingOut={pendingOut} setPendingOut={setPendingOut} onFlip={() => setFlippedCards(prev => ({ ...prev, routing: !prev.routing }))} />}
            channels={channels}
            onChannelUpdate={onChannelUpdate}
            master={master}
            onMasterChange={onMasterChange}
          />
        </div>
        <div data-console="transport" className="shrink-0 pr-4" style={masterH ? { height: masterH } : undefined}>
          <PlaybackModule />
        </div>
        {/* The generators, as a front panel. A bench, not a second home for
            channel state — [Load] hands the built source to the first free
            channel through `onChannelUpdate`, the same seam the palette uses. */}
        <div data-console="generator" className="shrink-0 pr-4" style={masterH ? { height: masterH } : undefined}>
          <GeneratorModule
            onLoadToChannel={(variantId, params) => {
              const free = channels.findIndex((c) => !c.variantId)
              onChannelUpdate(free < 0 ? 0 : free, { variantId, params, enabled: true })
            }}
          />
        </div>
        {/* THE EXPRESSION OUTPUT (2026-10-15) — four slots A–D any knob can take by
            right-click. The Expressions tab writes formulas; this sends them out. */}
        <div data-console="expression" className="shrink-0 pr-4" style={masterH ? { height: masterH } : undefined}>
          <ExpressionModule />
        </div>
        {/* The patch, as a front panel (user 2026-09-01, on monitor's
            `PatchModule`). Sits after the bench modules because it acts on the
            whole desk rather than on any one strip. */}
        <div data-console="patch" className="shrink-0 pr-4" style={masterH ? { height: masterH } : undefined}>
          <PatchModule api={patchApi} master={master} channels={channels} />
        </div>
        {/* THE FX MODULES — one panel each, in the order they were loaded. A module arrives with
            both jacks empty and stays that way until he cables it (user 2026-10-03: "no
            preconfigured paths ever … think about a physical mixer, does it ever do anything
            on auto"). What the IN stores is what a channel's `routeFrom` stores. */}
        {fxModules.map((m) => {
          const key = fxKey(m.id)
          const src = m.input
          const inputLabel = typeof src === 'number'
            ? `CH ${src + 1}`
            : isFxKey(src)
              ? (CANVAS_FX_DEFS.find((d) => d.id === fxModules.find((o) => fxKey(o.id) === src)?.type)?.label || 'FX')
              : String(src ?? '').toUpperCase()
          return (
            <div key={`fxm-${m.id}`} data-console={`fxm-${m.id}`} className="shrink-0 pr-4" style={masterH ? { height: masterH } : undefined}>
              <FxModule
                defId={m.type}
                params={m.params}
                enabled={m.enabled}
                onParamChange={(k, v) => onFxModuleUpdate?.(m.id, { params: { ...m.params, [k]: v } })}
                onToggle={() => onFxModuleUpdate?.(m.id, { enabled: !m.enabled })}
                onRemove={() => onFxModuleRemove?.(m.id)}
                jacks={{
                  id: m.id,
                  input: src,
                  inputLabel,
                  inputColor: typeof src === 'number' ? WIRE_COLORS[src % WIRE_COLORS.length] : undefined,
                  isSource: channels.some((c) => c.routeFrom === key) || fxModules.some((o) => o.input === key) || (master.inputs || []).includes(key),
                  pendingOut,
                  setPendingOut,
                  onInput: (from) => onFxModuleUpdate?.(m.id, { input: from == null ? null : from.type === 'ch' ? from.idx : from.key }),
                }}
              />
            </div>
          )
        })}
        {/* THE TAPE DECK AS A MODULE (float arrangement, user 2026-10-03: "the tape machine could
            be folded into a module, its a bit awkward sitting there above the mixer strip") — the
            deck as it is drawn, in the desk modules' own frame (`PatchModule`'s). */}
        {monitor && <div data-console="monitor" className="shrink-0 pr-4" style={masterH ? { height: masterH } : undefined}>{monitor}</div>}
        {deck && (
          <div data-console="tape" className="shrink-0 pr-4" style={masterH ? { height: masterH } : undefined}>
            <div className="flex flex-col shrink-0 bg-surface-secondary border border-fg-08" style={{ borderRadius: '4px', height: '100%' }}>
              <div className="flex items-center kol-helper-12 px-3 border-b border-fg-08 shrink-0" style={{ height: '29px' }}>
                <span className="text-fg-96">Tape</span>
              </div>
              <div className="flex items-center justify-center p-3" style={{ flex: 1, minHeight: 0 }}>{deck}</div>
            </div>
          </div>
        )}
      </DeskTrack>
      </div>
      </div>{/* close the zoom/pan layer */}
      {mixerTab === 'expressions' && <ExpressionReference />}
      </div>{/* close relative wrapper */}
      </PatchJacksProvider>

    </div>
  )
}
