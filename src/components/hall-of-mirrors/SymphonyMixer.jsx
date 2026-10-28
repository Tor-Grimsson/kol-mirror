import { useRef, useState, useEffect, useCallback } from 'react'
import Slider from '@kolkrabbi/kol-component/molecules/Slider'
import { Icon } from '../icons'
import { CanvasStudio } from '@kolkrabbi/kol-component'
import Divider from '@kolkrabbi/kol-component/atoms/Divider'
import VariantControls from '../mirror/VariantControls'
import { findVariant, filterControlsByTab, CHANNEL_FX_DEFS, MAX_CHANNEL_FX, getDefaultFxParams } from '../../data/mirrorVariants'
import Modulatable from '@kolkrabbi/kol-hardware/value/Modulatable.jsx'
import Knob from '@kolkrabbi/kol-component/molecules/Knob'
import { exprBusRef } from '../../hooks/exprBus'
import ChannelPatchPanel, { MasterPatchPanel, RoutingPatchPanel, FlipIcon, ChannelIOJacks, MasterInJacks, MonitorJacks, RoutingJacks } from './ChannelPatchPanel'
import PlaybackModule from './PlaybackModule'
import PatchCableOverlay, { PatchJacksProvider } from './PatchCableOverlay'
import ChannelWireDiagram from './ChannelWireDiagram'
import MasterModule from './MasterModule'
import RoutingMatrix from './RoutingMatrix'
import GeneratorModule from './modules/GeneratorModule'
import ExpressionModule from './modules/ExpressionModule'
import PatchModule from './modules/PatchModule'
import FxRackModule from './modules/FxRackModule'
import TapeModule from './modules/TapeModule'
import { withSlot } from '../../hooks/fxSlots'
import { fxKey, isFxKey } from '../../hooks/patchGraph'
import { CANVAS_FX_DEFS } from '../../hooks/useCanvasFx'
import { WIRE_COLORS } from './wireColors'
import Dropdown from '@kolkrabbi/kol-component/molecules/Dropdown'
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
import ModuleFrame, { ModuleTab, DeskModule, ModuleTool } from './modules/ModuleFrame'
import { DESK_U } from './modules/bands'
import { JackStrip } from './modules/JackStrip'
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


/* exported for /mixer, which shows the real strip as its card front rather
   than a drawing of one (user 2026-08-28: "this is the front, not what you put
   in") */
export function Channel({
  onShelfChange,
  onFlip,
  flipped = false,
  patchPanel,
  /* the front strip's jacks (plan 11 § 3.1) — IN · OUT, under the FX rack */
  strip,
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
      /* [ / ] mark in / out (plan 13 § 1.3) — `I / O` until O became monitor's cable visibility */
      if (e.key === '[') onUpdateRecSlotTrim(activeRecSlot, t, slot.mark2)
      if (e.key === ']') onUpdateRecSlotTrim(activeRecSlot, slot.mark1, t)
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
      className="flex flex-row items-stretch shrink-0 relative h-full"
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
      {/* THE STANDARD (plan 12): header · body · footer · back, drawn by DeskModule. ONLY THE BODY FLIPS (user,
          2026-08-27) — the header and the FX rack belong to the channel in both states. The strip sits a rung below
          the desk (user 2026-08-28: "make channel strip a little darker"): the plate's --kol-oq-04. */}
      <DeskModule
        width={320}
        /* the strip's ON lamp is the header's power switch (plan 16 W5); right-click it for Remove Channel */
        power={{
          on: !!enabled,
          onToggle: () => { setShowRemove(false); onEnabledChange(!enabled) },
          onContextMenu: (e) => { e.preventDefault(); setShowRemove(!showRemove) },
          title: enabled ? 'ON' : 'OFF',
          children: showRemove && onRemove && (
            <>
              <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setShowRemove(false) }} />
              <div
                className="absolute left-0 top-full mt-1 bg-surface-primary border border-fg-16 z-50 kol-helper-12 px-3 py-1.5 text-fg-64 hover:text-fg-96 hover:bg-surface-secondary cursor-pointer transition-all"
                style={{ borderRadius: '4px', whiteSpace: 'nowrap' }}
                onClick={(e) => { e.stopPropagation(); setShowRemove(false); onRemove() }}
              >
                Remove Channel
              </div>
            </>
          ),
        }}
        head={(
        <span className={`${enabled ? 'text-fg-96' : 'text-fg-32'} truncate group`}>
          {loadedName ? (
            <>
              <span className="group-hover:hidden">{loadedName.split(':')[0] + ':'}</span>
              <span className="hidden group-hover:inline">{loadedName.split(':').slice(1).join(':').trim()}</span>
            </>
          ) : (defaultName || '\u00A0')}
          {activeRecSlot != null && <span className="text-fg-32 ml-1">[REC]</span>}
        </span>
        )}
        headRight={(
          <>
          {onEdit && loadedName && (
            <span className="flex items-center gap-1 text-fg-96 cursor-pointer select-none" onClick={onEdit}>Edit<Icon name="edit" size={12} /></span>
          )}
          </>
        )}
        flipped={flipped}
        onFlip={onFlip}
        back={patchPanel}
        tools={(
          <>
            {[
              { key: 'src', icon: 'library', title: 'Source' },
              { key: 'res', icon: 'foundation', title: 'Resolution' },
              { key: 'load', icon: 'save', title: 'Load' },
              { key: 'params', icon: 'frequency', title: 'Parameters', iconSize: 18 },
              { key: 'rec', icon: 'video', title: 'Record' },
            ].map(btn => (
              <ModuleTool
                key={btn.key}
                icon={btn.icon}
                iconSize={btn.iconSize || 16}
                title={btn.title}
                active={shelfOpen && shelfTab === btn.key}
                onClick={() => { if (shelfOpen && shelfTab === btn.key) { setShelfOpen(false) } else { setShelfTab(btn.key); setShelfOpen(true) } }}
              />
            ))}
          </>
        )}
        rows={(
          <>
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
          </>
        )}
        actions={(
          <>
            <div className="cursor-pointer select-none text-fg-96" onClick={(e) => { onReset && onReset(e.altKey); e.currentTarget.animate([{ color: 'var(--kol-accent-primary)' }, { color: 'var(--kol-surface-on-primary)' }], { duration: 2000, easing: 'ease-out' }) }} title="Reset channel (Alt+click: reset all)">RESET</div>
            <div className="cursor-pointer select-none" style={{ color: shelfOpen && shelfTab === 'rec' ? 'var(--kol-ctl-led-red)' : 'var(--kol-surface-on-primary)' }} onClick={() => { if (shelfOpen && shelfTab === 'rec') { setShelfOpen(false) } else { setShelfOpen(true); setShelfTab('rec') } }} title="Open REC panel">REC/LOOP</div>
            <div className="cursor-pointer select-none" style={{ color: boosted ? '#2dd4bf' : 'var(--kol-fg-32)' }} onClick={() => onBoostChange(!boosted)} title="Boost intensity">BOOST</div>
          </>
        )}
        footer={(
          <>
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
        feedback={feedback}
        onFeedbackChange={onFeedbackChange}
        square={!!strip}
      />
    )}
          </>
        )}
        jacks={strip}
      >
            <div className="grid grid-cols-3 gap-x-2 gap-y-1 flex-1 w-full">
              <Modulatable label="INT" value={value} onChange={onChange} bus={exprBusRef} clock={transport}>
                <Knob variant="panel" size="lg" defaultValue={0} />
              </Modulatable>
              <Modulatable label="HUE" value={Math.round(getFxValue('hue-rotate', 'angle') / 360 * 100)} onChange={(v) => setFxValue('hue-rotate', 'angle', Math.round(v / 100 * 360))} bus={exprBusRef} clock={transport}>
                <Knob variant="panel" size="lg" defaultValue={0} />
              </Modulatable>
              <Modulatable label="SAT" value={Math.round(getFxValue('saturate', 'amount') / 3 * 100)} onChange={(v) => setFxValue('saturate', 'amount', Math.round(v / 100 * 3 * 100) / 100)} bus={exprBusRef} clock={transport}>
                <Knob variant="panel" size="lg" defaultValue={0} />
              </Modulatable>
              <Modulatable label="BRT" value={Math.round(getFxValue('brightness', 'amount') / 3 * 100)} onChange={(v) => setFxValue('brightness', 'amount', Math.round(v / 100 * 3 * 100) / 100)} bus={exprBusRef} clock={transport}>
                <Knob variant="panel" size="lg" defaultValue={0} />
              </Modulatable>
              <Modulatable label="CTR" value={Math.round(getFxValue('contrast', 'amount') / 3 * 100)} onChange={(v) => setFxValue('contrast', 'amount', Math.round(v / 100 * 3 * 100) / 100)} bus={exprBusRef} clock={transport}>
                <Knob variant="panel" size="lg" defaultValue={0} />
              </Modulatable>
              <Modulatable label="BLR" value={Math.round(getFxValue('blur', 'amount') / 20 * 100)} onChange={(v) => setFxValue('blur', 'amount', Math.round(v / 100 * 20 * 10) / 10)} bus={exprBusRef} clock={transport}>
                <Knob variant="panel" size="lg" defaultValue={0} />
              </Modulatable>
            </div>
      </DeskModule>
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
function DeskTrack({ row, consoleState, onConsole, rowHeight, editMode, children }) {
  if (!row) return <div className="flex flex-col" style={{ width: 'fit-content', marginInline: 'auto' }}>{children}</div>
  return (
    <div className="console-skin">
    <Console
      rows={consoleState?.rows || []}
      width={consoleState?.width || 0}
      onRows={(rows) => onConsole?.((c) => ({ ...c, rows }))}
      rowHeight={rowHeight}
      editMode={editMode}
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
     desk the whole view and `deck` is the tape deck as one more module on it. Both absent is the
     desk as it was. (`frameToggle`, the monitor window's show / hide in the tab row, left with plan
     13 § 2.4 — V still does it.) */
  fill = false,
  deck = null,
  /* the Monitor module (2026-10-15) — built by the viewport, which owns the frame */
  monitor = null,
  /* the console's rows and width (`useMirrorState.symphonyConsole`) */
  consoleState = null,
  onConsole,
  /* edit mode (E, plan 15) — the console shows monitor's move arrows on the hovered module */
  deskEdit = false,
  /* the viewport's frame copy — a module's live picture registers here by key (`fxm:<id>`) */
  onBusCanvas,
  /* the frame buffer's source registry — the Generator's stack registers there as `gen:mix` */
  onSourceCanvas,
  /* FX MODULES (2026-10-03) — effects standing on the desk as modules of their own, each with
     an IN and an OUT that start empty (`useMirrorState.symphonyFxModules`). */
  fxModules = [],
  onFxModuleUpdate,
  onFxModuleRemove,
}) {
  const [masterFxOpen, setMasterFxOpen] = useState(false)
  const [fxOpenAll, setFxOpenAll] = useState({ open: false, tick: 0 })
  const [masterFxTab, setMasterFxTab] = useState('fx')
  /* DESK VIEW — the KOL canvas's (plan 13 § 1.1). `CanvasStudio` below owns pan, zoom, the grid, the lock and
  their keys; this keeps only the controlled state, so the patch table and anything else can read it. */
  const [view, setView] = useState({ zoom: 1, x: 0, y: 0 })
  const [locked, setLocked] = useState(false)
  const [dots, setDots] = useState(true)

  /* the desk is the only face now (plan 15) — the Expressions tab moved into the E rail */
  const mixerTab = 'mixer'
  // Flip-to-patch (2026-08-12) — per-channel card flip + pending patch source
  const [flippedCards, setFlippedCards] = useState({})
  const [pendingOut, setPendingOut] = useState(null)
  /* the generator's live cable reads the channels at change time, not at render */
  const channelsRef = useRef(channels)
  useEffect(() => { channelsRef.current = channels }, [channels])
  /* DIGITS DON'T FLIP (plan 13 § 1.2, user: *"why does 1 flip 1? thats not right."*). Monitor's 1–9 snap the
     view; that is ticketed to the KOL canvas. Flipping is the Patch tab, P's patch table and each module's flip.
     O is monitor's cable visibility (`useKeybindings.js`) — the cables hide, the patching stays. */
  const [cablesShown, setCablesShown] = useState(true)
  useEffect(() => {
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const el = e.target
      if (el.tagName === 'INPUT' || el.tagName === 'SELECT' || el.tagName === 'TEXTAREA' || el.isContentEditable) return
      const k = e.key.toLowerCase()
      if (k === 'o' && !e.shiftKey) setCablesShown((v) => !v)
      /* ⇧P flips the whole desk to its patch bays and back (plan 15 — the Patch tab's job; P alone is the patch table) */
      if (k === 'p' && e.shiftKey) {
        const n = channelsRef.current.length
        setFlippedCards((prev) => {
          const all = n > 0 && Array.from({ length: n }).every((_, i) => prev[i]) && prev.master && prev.routing
          return all ? {} : { ...Object.fromEntries(Array.from({ length: n }, (_, i) => [i, true])), master: true, routing: true }
        })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  /* THE EMBLA LOOP IS RETIRED (2026-10-15) — the desk is a Console of rows
     (`components/mirror/Console.jsx`, user: *"rows, so you could add and remove
     rows (height) and width"*). The loop, its wheel plugin and the ring spacers
     are in `_tmp/2026-10-15-desk-track/embla-loop.jsx`. A plain wheel now pans
     the desk (`CanvasStudio`, plan 13 § 1.1). */
  /* Which slide has its shelf open. The shelf OVERLAYS now rather than taking
     track width, and an overlay only wins against later slides if the slide
     itself is lifted — a z-index inside the card cannot reach past its own. */
  const [shelfSlide, setShelfSlide] = useState(null)
  /* THE DESK'S HEIGHT is grabbable at its top edge (user 2026-08-28: "where
     is the grab to make channel strip taller"). null = content height, which
     is what it was before and what a double-click restores. It sizes the desk's
     box, never a module: every module is one U (`DESK_U`, plan 13 § 3.1) — the
     measured `masterH` it replaced followed Channel 1's content. */
  // (Two-finger touch-pan effect removed 2026-08-12 — the embla loop +
  // WheelGesturesPlugin own desk scrolling now.)
  const deskRef = useRef(null)
  const layerBoxRef = useRef(null)
  /* any card on its back — the wire diagram's cue */
  const patching = Object.values(flippedCards).some(Boolean)
  return (
    <div className={fill ? 'relative flex flex-col flex-1 min-h-0' : 'flex flex-col gap-6'}>
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
      {/* `fill` (plan 16 W10): no band at all — while patching the diagram floats over the canvas's top edge, so the
          desk starts at the top of the studio and never moves */}
      {(!fill || patching) && (
        <div style={{ height: '80px', overflow: 'hidden', ...(fill ? { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 4, pointerEvents: 'none' } : null) }}>
          {patching && (
            <ChannelWireDiagram channels={channels} master={master} />
          )}
        </div>
      )}
      {/* NO ROW ABOVE THE DESK (plan 15, user 2026-10-25: *"what is with this top? seriously? we can put expression in
          the bottom rail f.e. and patch can just be in shortcut"*). Mixer · Expressions · Patch and the height grab on
          its rule are gone: the desk is the studio, Expressions is a view of the E rail, flipping the whole desk to its
          patch bays is ⇧P. Before: `_tmp/2026-10-25-plan-15/before/SymphonyMixer.jsx`. */}
      <PatchJacksProvider>
      {/* THE CANVAS IS THE KOL'S (plan 13 § 1.1, user 2026-10-24: *"this whole canvas is custom, is this not consumed
          from DS?"*). kol-component's `CanvasStudio` draws the surface — the dot grid, Space+drag, middle- and ⌘-drag,
          scroll pans, ⌘ wheel / pinch / ⌘= ⌘− zoom, ⌘0 back to the fit, G, L and the F fps chip — the keys
          `CANVAS_KEYS` lists. `fit` opens it at the zoom that shows the desk's full height. Space is the transport's
          off the desk; over it the canvas takes it and a tap still plays (`onSpaceTap`). The cables are the
          canvas's `overlay` — screen space, so they land on the jacks without double-applying the zoom.
          The old hand-rolled surface: `_tmp/2026-10-25-plan-13/before/SymphonyMixer.jsx`. */}
      <CanvasStudio
        surfaceRef={deskRef}
        view={view}
        onViewChange={setView}
        grid={dots}
        onGridChange={setDots}
        locked={locked}
        onLockChange={setLocked}
        minZoom={0.25}
        maxZoom={3}
        fit
        touch="none"
        spaceWhenOver
        onSpaceTap={() => transport.toggle()}
        /* the desk's top air rides the layer (pt-7 on the box below), so the canvas's fit counts it */
        /* `fill`: the KOL default, the surface takes the studio (plan 16 W11); otherwise a block in the page */
        style={fill ? { touchAction: 'auto' } : { flex: 'none', minHeight: 'auto', touchAction: 'auto' }}
      >
      {/* the cables ride the pan-zoom layer with the modules (plan 16 W7) — measured against this box, in its space */}
      <div ref={layerBoxRef} className="relative">
      {isVisible && mixerTab === 'mixer' && cablesShown && (
        <PatchCableOverlay channels={channels} flipped={flippedCards} inputs={master.inputs} screen2={screen2} fxModules={fxModules} containerRef={layerBoxRef} />
      )}
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
        className={fill ? 'p-4' : `pt-7 ${layout === 'row' ? 'md:max-h-[max(240px,calc(50dvh-195px))]' : ''}`}
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
          ...(layout === 'row' && !fill ? { paddingInline: 16, marginInline: -16, paddingBottom: 16, marginBottom: -16 } : null),
          /* THE GRAB GIVES THE DESK ROOM, IT DOES NOT STRETCH THE MODULES
             (user 2026-08-28: "this should not grow, these modules are not
             supposed to be responsive like that — the reason I want to make the
             channel taller is just to move things around"). Height lands on the
             desk's BOX; the track is `items-start`, so every module keeps its
             intrinsic height and the extra is empty desk. That is also the
             shape an infinite canvas needs later — space to arrange in, not
             modules that resize to fill it. */
          /* `fill`: the canvas is the studio (plan 16 W11) — the box is its content, 16px of air around the case */
        }}
      >
      {/* THE CONSOLE (2026-10-15) — in the desk's row layout the modules sit in
          rows of one U (`Console`); the column layout keeps its plain stack. */}
      <DeskTrack row={layout === 'row'} consoleState={consoleState} onConsole={onConsole} rowHeight={DESK_U} editMode={deskEdit}>
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
            style={{ position: 'relative', zIndex: shelfSlide === i ? 30 : undefined, height: DESK_U }}
          >
          <Channel
            onShelfChange={(open) => setShelfSlide(open ? i : (prev) => (prev === i ? null : prev))}
            flipped={!!flippedCards[i]}
            patchPanel={
              <ChannelPatchPanel
                channelIndex={i}
                channel={ch}
                channels={channels}
                onChannelUpdate={onChannelUpdate}
                pendingOut={pendingOut}
                setPendingOut={setPendingOut}
              />
            }
            strip={
              <ChannelIOJacks
                channelIndex={i}
                channel={ch}
                channels={channels}
                master={master}
                screen2={screen2}
                onChannelUpdate={onChannelUpdate}
                pendingOut={pendingOut}
                setPendingOut={setPendingOut}
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
        <div data-console="master" className="shrink-0 pr-4" style={{ height: DESK_U }}>
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
              />
            )}
            strip={(
              <MasterInJacks
                channels={channels}
                onChannelUpdate={onChannelUpdate}
                master={master}
                onMasterChange={onMasterChange}
                pendingOut={pendingOut}
                setPendingOut={setPendingOut}
              />
            )}
            master={master}
            onMasterChange={(updates) => onMasterChange && onMasterChange(updates)}
            channels={channels}
            onChannelUpdate={onChannelUpdate}
          />
        </div>
        <div data-console="routing" className="shrink-0 pr-4" style={{ height: DESK_U }}>
          <RoutingMatrix
            jacks={<RoutingJacks channels={channels} pendingOut={pendingOut} setPendingOut={setPendingOut} />}
            onFlip={() => setFlippedCards(prev => ({ ...prev, routing: !prev.routing }))}
            flipped={!!flippedCards.routing}
            back={<RoutingPatchPanel channels={channels} onChannelUpdate={onChannelUpdate} master={master} onMasterChange={onMasterChange} screen2={screen2} setScreen2={setScreen2} fxModules={fxModules} onFxModuleUpdate={onFxModuleUpdate} pendingOut={pendingOut} setPendingOut={setPendingOut} onFlip={() => setFlippedCards(prev => ({ ...prev, routing: !prev.routing }))} />}
            channels={channels}
            onChannelUpdate={onChannelUpdate}
            master={master}
            onMasterChange={onMasterChange}
          />
        </div>
        <div data-console="transport" className="shrink-0 pr-4" style={{ height: DESK_U }}>
          <PlaybackModule />
        </div>
        {/* The generators, as a front panel. A bench, not a second home for
            channel state — [Load] hands the built source to the first free
            channel through `onChannelUpdate`, the same seam the palette uses. */}
        <div data-console="generator" className="shrink-0 pr-4" style={{ height: DESK_U }}>
          <GeneratorModule
            /* the cable is live: a change reaches every channel this OUT feeds (plan 11 § 3.3) */
            /* four slots, four live cables (plan 16 W8): slot k reaches every channel its O jack feeds */
            onSource={(key, variantId, params) => channelsRef.current.forEach((c, i) => {
              if (c.genFrom === key) onChannelUpdate(i, { variantId, params })
            })}
            out={{ connectedKey: (k) => channels.some((c) => c.genFrom === k || c.routeFrom === k), pendingOut, setPendingOut }}
            onSourceCanvas={onSourceCanvas}
          />
        </div>
        {/* THE EXPRESSION OUTPUT (2026-10-15) — four slots A–D any knob can take by
            right-click. The Expressions tab writes formulas; this sends them out. */}
        <div data-console="expression" className="shrink-0 pr-4" style={{ height: DESK_U }}>
          <ExpressionModule />
        </div>
        {/* The patch, as a front panel (user 2026-09-01, on monitor's
            `PatchModule`). Sits after the bench modules because it acts on the
            whole desk rather than on any one strip. */}
        <div data-console="patch" className="shrink-0 pr-4" style={{ height: DESK_U }}>
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
            <div key={`fxm-${m.id}`} data-console={`fxm-${m.id}`} className="shrink-0 pr-4" style={{ height: DESK_U }}>
              {m.type !== 'tape' || m.slots ? (
              <FxRackModule
                module={m}
                onSlot={(i, patch) => onFxModuleUpdate?.(m.id, withSlot(m, i, patch))}
                onToggle={() => onFxModuleUpdate?.(m.id, { enabled: !m.enabled })}
                onRemove={() => onFxModuleRemove?.(m.id)}
                onPreviewCanvas={onBusCanvas}
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
              ) : (
              /* Tape is Magneto (plan 16 W4) — its own front over the four-head engine */
              <TapeModule
                module={m}
                onParams={(patch) => onFxModuleUpdate?.(m.id, { params: { ...m.params, ...patch } })}
                onToggle={() => onFxModuleUpdate?.(m.id, { enabled: !m.enabled })}
                onRemove={() => onFxModuleRemove?.(m.id)}
                jacks={{
                  id: m.id,
                  input: src,
                  inputLabel,
                  inputColor: typeof src === 'number' ? WIRE_COLORS[src % WIRE_COLORS.length] : undefined,
                  isSource: channels.some((c) => c.routeFrom === key) || fxModules.some((o) => o.input === key) || (master.inputs || []).includes(key),
                  isHeadSource: (hk) => channels.some((c) => c.routeFrom === hk) || fxModules.some((o) => o.input === hk) || (master.inputs || []).includes(hk),
                  pendingOut,
                  setPendingOut,
                  onInput: (from) => onFxModuleUpdate?.(m.id, { input: from == null ? null : from.type === 'ch' ? from.idx : from.key }),
                }}
              />
              )}
            </div>
          )
        })}
        {/* THE TAPE DECK AS A MODULE (float arrangement, user 2026-10-03: "the tape machine could
            be folded into a module, its a bit awkward sitting there above the mixer strip") — the
            deck as it is drawn, in the desk modules' own frame (`PatchModule`'s). */}
        {monitor && <div data-console="monitor" className="shrink-0 pr-4" style={{ height: DESK_U }}>{typeof monitor === 'function' ? monitor(MonitorJacks({ screen2, setScreen2, pendingOut, setPendingOut })) : monitor}</div>}
        {deck && (
          <div data-console="tape" className="shrink-0 pr-4" style={{ height: DESK_U }}>
            {deck}
          </div>
        )}
      </DeskTrack>
      </div>
      </div>
      </CanvasStudio>
      </PatchJacksProvider>

    </div>
  )
}
