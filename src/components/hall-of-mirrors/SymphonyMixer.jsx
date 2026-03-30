import { useRef, useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import Slider from '../atoms/Slider'
import { Icon } from '../icons'
import Divider from '../atoms/Divider'
import VariantControls from '../mirror/VariantControls'
import { findVariant, filterControlsByTab, CHANNEL_FX_DEFS, MAX_CHANNEL_FX, getDefaultFxParams } from '../../data/mirrorVariants'
import RotaryDial from './RotaryDial'
import ColorPicker from '../atoms/ColorPicker'
import ChannelWireDiagram from './ChannelWireDiagram'
import Dropdown from '../molecules/Dropdown'
import processImageUpload from '../../utils/processImageUpload'
import defaultCanvasSvg from '../../assets/default-canvas.svg?raw'

const DEFAULT_SVG_SRC = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(defaultCanvasSvg)

const CSS_BLEND_MODES = ['normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 'color-dodge', 'color-burn', 'hard-light', 'soft-light', 'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity']

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
        className="cursor-pointer select-none flex items-center justify-center border border-fg-16 text-fg-96 hover:border-accent-primary hover:accentYellow transition-all"
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
                className={`kol-helper-xs px-2 py-1 transition-all ${
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

function Channel({
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

  const blendPreviewRef = useRef(null)
  const [showRemove, setShowRemove] = useState(false)
  const [shelfOpen, setShelfOpen] = useState(false)
  const [shelfPage, setShelfPage] = useState(0)
  const [shelfTab, setShelfTab] = useState('params') // 'params' | 'res' | 'rec' | 'src'
  const [recLoopLength, setRecLoopLength] = useState(10)
  const [recFps, setRecFps] = useState(60)
  const [recRealTime, setRecRealTime] = useState(true)
  const [recInfoOpen, setRecInfoOpen] = useState(new Set())
  const [fxOpen, setFxOpen] = useState(true)
  const [shelfWidth, setShelfWidth] = useState(280)
  const shelfDragging = useRef(false)
  const shelfStartX = useRef(0)
  const shelfStartW = useRef(0)
  const mediaFileRef = useRef(null)
  const mediaRecolorRef = useRef(null)

  useEffect(() => {
    if (fxOpenAllTick && fxOpenAllTick.tick > 0) setFxOpen(fxOpenAllTick.open)
  }, [fxOpenAllTick?.tick])
  const [fxTab, setFxTab] = useState('color') // 'color' | 'blend' | 'fx'

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
    <div className="flex flex-col shrink-0" style={{ overflow: 'visible' }}>
      <div className="flex items-center justify-between kol-helper-xs mx-2 px-4 py-2 border border-fg-08 border-b-0 shrink-0 bg-surface-tertiary" style={{ borderRadius: '4px 4px 0 0', width: `${320 - 16}px` }}>
        <span className={`${enabled ? 'text-fg-96' : 'text-fg-32'} truncate group`}>
          {loadedName ? (
            <>
              <span className="group-hover:hidden">{loadedName.split(':')[0] + ':'}</span>
              <span className="hidden group-hover:inline">{loadedName.split(':').slice(1).join(':').trim()}</span>
            </>
          ) : (defaultName || '\u00A0')}
          {activeRecSlot != null && <span className="text-fg-32 ml-1">[REC]</span>}
        </span>
        {onEdit && loadedName && (
          <span className="flex items-center gap-1 text-fg-96 cursor-pointer select-none shrink-0" onClick={onEdit}>Edit<Icon name="edit" size={12} /></span>
        )}
      </div>
      <div className="flex flex-row items-stretch" style={{ overflow: 'visible' }}>
      <div className="flex flex-col shrink-0">
      <div
        className="flex flex-col items-center gap-6 p-4 bg-surface-secondary border border-fg-08 relative"
        style={{
          borderRadius: '4px',
          overflow: 'visible',
          width: '320px',
          minHeight: '264px',
          zIndex: 1,
        }}
      >
      <div className="w-full flex items-start justify-between">
        <div className="flex flex-col items-center gap-4">
          <div
            className="cursor-pointer select-none flex items-center justify-center relative"
            onClick={() => { setShowRemove(false); onEnabledChange(!enabled) }}
            onContextMenu={(e) => { e.preventDefault(); setShowRemove(!showRemove) }}
            title={enabled ? 'ON' : 'OFF'}
          >
            {showRemove && onRemove && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowRemove(false)} />
                <div
                  className="absolute left-0 top-full mt-1 bg-surface-primary border border-fg-16 z-50 kol-helper-xs px-3 py-1.5 text-fg-64 hover:text-fg-96 hover:bg-surface-secondary cursor-pointer transition-all"
                  style={{ borderRadius: '4px', whiteSpace: 'nowrap' }}
                  onClick={(e) => { e.stopPropagation(); setShowRemove(false); onRemove() }}
                >
                  Remove Channel
                </div>
              </>
            )}
            <div
              className="w-6 h-6 rounded-full border-2 border-fg-48 flex items-center justify-center"
            >
              <div
                className={`w-3 h-3 rounded-full transition-all ${
                  enabled ? 'bg-[#e74c3c]' : 'bg-fg-24'
                }`}
              />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <LoadButton
            isOpen={isDropdownOpen}
            onToggle={onLoadFromNine}
            onClose={onCloseDropdown}
            items={items}
            onSelect={onSelectItem}
          />
          <div
            className={`cursor-pointer select-none flex items-center justify-center border transition-all ${shelfOpen ? 'border-accent-primary accentYellow' : 'border-fg-16 text-fg-96 hover:border-accent-primary hover:accentYellow'}`}
            style={{ borderRadius: '4px', width: '28px', height: '28px' }}
            onClick={() => setShelfOpen(!shelfOpen)}
            title="Parameters"
          >
            <Icon name="frequency" size={16} />
          </div>
          <div
            className="cursor-pointer select-none flex items-center justify-center border border-fg-16 text-fg-96 hover:border-accent-primary hover:accentYellow transition-all"
            style={{ borderRadius: '4px', width: '28px', height: '28px' }}
            onClick={(e) => {
              if (e.altKey && onFxToggleAll) {
                onFxToggleAll(!fxOpen)
              }
              setFxOpen(!fxOpen)
            }}
            title="Effects (Alt+click: toggle all)"
          >
            <Icon name="atomic-molecule" size={16} />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center" style={{ marginTop: '-32px' }}>
        <RotaryDial
          label=""
          value={value}
          onChange={onChange}
          size={120}
        />
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
        <div className="flex items-end justify-between kol-helper-xs" style={{ height: '24px' }}>
          <div className="cursor-pointer select-none text-fg-96" onClick={(e) => { onReset && onReset(e.altKey); e.currentTarget.animate([{ color: 'var(--kol-accent-primary)' }, { color: 'var(--kol-surface-on-primary)' }], { duration: 2000, easing: 'ease-out' }) }} title="Reset channel (Alt+click: reset all)">RESET</div>
          <div className="cursor-pointer select-none" style={{ color: shelfOpen && shelfTab === 'rec' ? '#e74c3c' : 'var(--kol-surface-on-primary)' }} onClick={() => { if (shelfOpen && shelfTab === 'rec') { setShelfOpen(false) } else { setShelfOpen(true); setShelfTab('rec') } }} title="Open REC panel">REC/LOOP</div>
          <div className="cursor-pointer select-none" style={{ color: boosted ? '#2dd4bf' : 'var(--kol-fg-32)' }} onClick={() => onBoostChange(!boosted)} title="Boost intensity">BOOST</div>
        </div>
      </div>
    </div>
    {/* FX rack below channel strip, inside column wrapper */}
    {fxOpen && (
      <div
        className="flex flex-col mx-2 border border-fg-08 border-t-0 kol-helper-xs"
        style={{ borderRadius: '0 0 4px 4px', backgroundColor: 'var(--kol-surface-tertiary)', height: '124px', overflow: 'hidden', width: `${320 - 16}px`, paddingTop: '4px' }}
      >
        <div className="flex items-center justify-between px-4 py-2 border-b border-fg-08 shrink-0" style={{ backgroundColor: 'var(--kol-surface-tertiary)' }}>
          <div className="flex items-center gap-3">
            {['color', 'blend', 'fx'].map(tab => (
              <span
                key={tab}
                className={`cursor-pointer select-none uppercase ${fxTab === tab ? 'text-fg-96' : 'text-fg-32 hover:text-fg-64'}`}
                onClick={() => setFxTab(tab)}
              >
                {tab}
              </span>
            ))}
          </div>
          {enabled && <span className="kol-helper-xs" style={{ color: renderCost > 80 ? '#e74c3c' : renderCost > 70 ? '#f39c12' : '#2ecc71', animation: renderCost >= 70 ? 'pulse 1s ease-in-out infinite' : 'none' }}>{renderCost}%</span>}
        </div>
        <div className="flex flex-col gap-2 px-4 py-3" style={{ overflow: 'auto', flex: '1 1 0', minHeight: 0 }}>
        {fxTab === 'fx' && (
          <>
            {fx.map((fxItem, fi) => {
              const def = CHANNEL_FX_DEFS.find(d => d.id === fxItem.type)
              const paramKeys = def ? Object.keys(def.params) : []
              const primaryKey = paramKeys[0]
              const primarySpec = def?.params[primaryKey]
              return (
                <div key={fi} className="flex items-center gap-2" style={{ height: '24px' }}>
                  <div
                    className={`w-3 h-3 rounded-full cursor-pointer shrink-0 ${fxItem.enabled ? 'bg-[#e74c3c]' : 'bg-fg-24'}`}
                    onClick={() => {
                      const next = [...fx]
                      next[fi] = { ...next[fi], enabled: !next[fi].enabled }
                      onFxChange(next)
                    }}
                  />
                  <select
                    className="bg-transparent text-fg-96 border-none outline-none kol-helper-xs cursor-pointer"
                    style={{ width: '64px', fontSize: '11px' }}
                    value={fxItem.type}
                    onChange={(e) => {
                      const next = [...fx]
                      next[fi] = { type: e.target.value, enabled: fxItem.enabled, params: getDefaultFxParams(e.target.value) }
                      onFxChange(next)
                    }}
                  >
                    {CHANNEL_FX_DEFS.map(d => (
                      <option key={d.id} value={d.id}>{d.label}</option>
                    ))}
                  </select>
                  {primarySpec && (
                    <Slider
                      label=""
                      min={primarySpec.min}
                      max={primarySpec.max}
                      step={primarySpec.step}
                      value={fxItem.params[primaryKey] ?? primarySpec.default}
                      onChange={(v) => {
                        const next = [...fx]
                        next[fi] = { ...next[fi], params: { ...next[fi].params, [primaryKey]: v } }
                        onFxChange(next)
                      }}
                      formatValue={(v) => primarySpec.unit ? `${Math.round(v * 100) / 100}${primarySpec.unit}` : `${Math.round(v * 100) / 100}`}
                      className="flex-1"
                      variant="minimal"
                    />
                  )}
                  {paramKeys.length > 1 && paramKeys.slice(1).map(pk => {
                    const spec = def.params[pk]
                    return (
                      <Slider
                        key={pk}
                        label=""
                        min={spec.min}
                        max={spec.max}
                        step={spec.step}
                        value={fxItem.params[pk] ?? spec.default}
                        onChange={(v) => {
                          const next = [...fx]
                          next[fi] = { ...next[fi], params: { ...next[fi].params, [pk]: v } }
                          onFxChange(next)
                        }}
                        formatValue={(v) => spec.unit ? `${Math.round(v * 100) / 100}${spec.unit}` : `${Math.round(v * 100) / 100}`}
                        className="flex-1"
                        variant="minimal"
                      />
                    )
                  })}
                  <span
                    className="text-fg-96 cursor-pointer select-none shrink-0 inline-flex"
                    onClick={() => {
                      const next = fx.filter((_, i) => i !== fi)
                      onFxChange(next)
                    }}
                  >
                    <Icon name="x" size={12} />
                  </span>
                </div>
              )
            })}
            {fx.length < MAX_CHANNEL_FX && (
              <div className="kol-helper-xs text-fg-96 cursor-pointer select-none" style={{ height: '24px', lineHeight: '24px' }} onClick={() => { onFxChange([...fx, { type: 'blur', enabled: true, params: getDefaultFxParams('blur') }]) }}>[+ Add FX]</div>
            )}
          </>
        )}
        {fxTab === 'blend' && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between" style={{ height: '24px' }}>
              <span className="text-fg-96">Mode</span>
              <Dropdown
                options={CSS_BLEND_MODES.map(m => ({ value: m, label: m.charAt(0).toUpperCase() + m.slice(1) }))}
                value={blendMode}
                onChange={(v) => { blendPreviewRef.current = null; onBlendModeChange(v) }}
                onOptionHover={(v) => {
                  if (v != null) {
                    if (!blendPreviewRef.current) blendPreviewRef.current = blendMode
                    onBlendModeChange(v)
                  } else if (blendPreviewRef.current) {
                    onBlendModeChange(blendPreviewRef.current)
                    blendPreviewRef.current = null
                  }
                }}
                variant="minimal"
                size="md"
              />
            </div>
          </div>
        )}
        {fxTab === 'color' && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4" style={{ height: '24px' }}>
              <div className="flex items-center justify-between flex-1">
                <span className="text-fg-96">Vector</span>
                <ColorPicker color={vectorColor} onChange={onVectorColorChange} />
              </div>
              <Divider variant="vertical" className="px-4" />
              <div className="flex items-center justify-between flex-1">
                <span className="text-fg-96">Background</span>
                <ColorPicker color={backgroundColor} onChange={onBackgroundColorChange} />
              </div>
            </div>
            <div className="flex items-center justify-between" style={{ height: '24px' }}>
              <span className="text-fg-96">Context Color</span>
              <Dropdown
                options={[
                  { value: 'dark', label: 'Dark' },
                  { value: 'light', label: 'Light' },
                ]}
                value={rasterTheme}
                onChange={onRasterThemeChange}
                variant="minimal"
                size="md"
              />
            </div>
          </div>
        )}
        </div>
      </div>
    )}
    </div>{/* close column wrapper */}
    {/* Shelf — expands to the right */}
    {shelfOpen && (
      <div
        className="flex flex-col px-4 pt-3 pb-4 mt-4 shrink-0 border border-fg-08 kol-helper-xs relative"
        style={{ borderRadius: '0 4px 4px 0', backgroundColor: 'var(--kol-surface-tertiary)', width: `${shelfWidth}px`, marginLeft: '-12px', paddingLeft: '28px' }}
      >
        {/* Shelf tab bar */}
        <div className="flex items-center gap-3 pb-2 mb-2 -mx-4 px-4 border-b border-fg-08">
          {[
            { key: 'params', label: 'PARAMS' },
            { key: 'res', label: 'RES' },
            { key: 'rec', label: 'REC' },
            { key: 'src', label: 'SRC' },
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

        {shelfTab === 'params' && controls && params && (() => {
          const ROWS_PER_COL = 7
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
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-4 kol-helper-xs" style={{ height: '24px' }}>
              <span className="text-fg-96">Recolor</span>
              <span className="text-fg-96 cursor-pointer select-none flex items-center gap-1" onClick={() => mediaRecolorRef.current?.click()}>Upload <Icon name="upload" size={16} /></span>
            </div>
            <div className="flex items-center justify-between gap-4 kol-helper-xs" style={{ height: '24px' }}>
              <span className="text-fg-96">Normal</span>
              <span className="text-fg-96 cursor-pointer select-none flex items-center gap-1" onClick={() => mediaFileRef.current?.click()}>Upload <Icon name="upload" size={16} /></span>
            </div>
            <div className="flex items-center justify-between gap-4 kol-helper-xs" style={{ height: '24px' }}>
              <span className="text-fg-96">Default</span>
              <span className="text-fg-96 cursor-pointer select-none flex items-center gap-1" onClick={() => onMediaChange({ customImageSrc: DEFAULT_SVG_SRC, customRasterSrc: null, customImageName: 'default-canvas.svg' })}>Load <Icon name="refresh" size={16} /></span>
            </div>
            <Divider className="pt-1 pb-2" />
            <div className="flex flex-col gap-2">
              <div className={`w-full border border-fg-08 bg-fg-04 flex items-center justify-center overflow-hidden relative${customImageSrc ? ' group cursor-pointer' : ''}`} style={{ aspectRatio: '5/3', borderRadius: '4px' }} onClick={customImageSrc ? () => onMediaChange({ customImageSrc: null, customRasterSrc: null, customImageName: null }) : undefined}>
                {customImageSrc && <img src={customImageSrc.startsWith('data:image/svg+xml') ? customImageSrc.replace(/currentColor/g, encodeURIComponent(vectorColor === 'currentColor' ? (document.documentElement.dataset.theme === 'light' ? '#000000' : '#ffffff') : vectorColor)) : customImageSrc} alt="Source" className="transition-opacity group-hover:opacity-30" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />}
                {customImageSrc && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-fg-96 kol-helper-xs">[Clear]</span>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-end kol-helper-xs-2" style={{ fontSize: '10px' }}>
                <span className="text-fg-48 truncate">{customImageName || ''}</span>
              </div>
            </div>
            <Divider className="pt-2 pb-1" />
            <Slider
              label="Padding"
              min={-100}
              max={100}
              step={1}
              value={vectorPadding}
              onChange={(v) => onMediaChange({ vectorPadding: v })}
              formatValue={(v) => `${v > 0 ? '+' : ''}${v}%`}
              variant="minimal"
            />
            <div className="flex items-center justify-between gap-4 kol-helper-xs" style={{ height: '24px' }}>
              <span className="text-fg-96">Source</span>
              <span className="text-fg-96">{customImageSrc ? 'Custom' : 'Global'}</span>
            </div>
            <div className="flex items-center justify-between gap-4 kol-helper-xs" style={{ height: '24px' }}>
              <span className="text-fg-96">Mode</span>
              <Dropdown
                options={[
                  { value: 'effect', label: 'Effect Only' },
                  { value: 'source', label: 'Effect + Source' },
                ]}
                value={loadMode}
                onChange={(v) => onMediaChange({ loadMode: v })}
                variant="minimal"
                size="md"
              />
            </div>
            <input ref={mediaFileRef} type="file" accept="image/*,.svg" className="hidden" onChange={async (e) => { const file = e.target.files?.[0]; if (!file) return; try { const r = await processImageUpload(file); onMediaChange({ customImageSrc: r.imageSrc, customRasterSrc: r.rasterSrc, customImageName: file.name }) } catch (_) {} e.target.value = '' }} />
            <input ref={mediaRecolorRef} type="file" accept="image/svg+xml,.svg" className="hidden" onChange={async (e) => { const file = e.target.files?.[0]; if (!file) return; try { const r = await processImageUpload(file, { recolor: true }); onMediaChange({ customImageSrc: r.imageSrc, customRasterSrc: r.rasterSrc, customImageName: file.name }) } catch (_) {} e.target.value = '' }} />
          </div>
        )}

        {shelfTab === 'res' && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-4 kol-helper-xs" style={{ height: '24px' }}>
              <span className="text-fg-96">Tier</span>
              <Dropdown
                options={[
                  { value: 'auto', label: 'Auto' },
                  { value: 'low', label: 'Low (1x)' },
                  { value: 'mid', label: 'Mid (6x)' },
                  { value: 'high', label: 'High (12x)' },
                ]}
                value={rasterTierOverride || 'auto'}
                onChange={(v) => onRasterTierOverrideChange(v === 'auto' ? null : v)}
                variant="minimal"
                size="md"
              />
            </div>
            <div className="flex items-center justify-between gap-4 kol-helper-xs" style={{ height: '24px' }}>
              <span className="text-fg-96">Raster Theme</span>
              <Dropdown
                options={[
                  { value: 'dark', label: 'Dark' },
                  { value: 'light', label: 'Light' },
                ]}
                value={rasterTheme}
                onChange={onRasterThemeChange}
                variant="minimal"
                size="md"
              />
            </div>
            <div className="flex items-center justify-between gap-4 kol-helper-xs" style={{ height: '24px' }}>
              <span className="text-fg-96">Recalculate</span>
              <span
                className="text-fg-96 cursor-pointer select-none"
                onClick={(e) => {
                  onRecalc && onRecalc()
                  e.currentTarget.animate([
                    { color: 'var(--kol-accent-primary)' },
                    { color: 'var(--kol-surface-on-primary)' }
                  ], { duration: 2000, easing: 'ease-out' })
                }}
              >[RECALC]</span>
            </div>
          </div>
        )}

        {shelfTab === 'rec' && (
          <div className="flex flex-col gap-2" style={{ flex: '1 1 0', minHeight: 0 }}>
            <div className="flex items-center justify-between gap-4 kol-helper-xs" style={{ height: '24px' }}>
              <span className="text-fg-96">Duration</span>
              <Dropdown
                options={[10, 20, 40, 80, 160].map(s => ({ value: s, label: `${s}s` }))}
                value={recLoopLength}
                onChange={setRecLoopLength}
                variant="minimal"
                size="md"
              />
            </div>
            <div className="flex items-center justify-between gap-4 kol-helper-xs" style={{ height: '24px' }}>
              <span className="text-fg-96">Framerate</span>
              <Dropdown
                options={[30, 60].map(f => ({ value: f, label: `${f}fps` }))}
                value={recFps}
                onChange={setRecFps}
                variant="minimal"
                size="md"
              />
            </div>
            <div className="flex items-center justify-between gap-4 kol-helper-xs" style={{ height: '24px' }}>
              <span className="text-fg-96">Real-time</span>
              <span className="cursor-pointer select-none text-fg-96" onClick={() => setRecRealTime(!recRealTime)}>[{recRealTime ? 'ON' : 'OFF'}]</span>
            </div>
            <div className="flex items-center justify-between gap-4 kol-helper-xs" style={{ height: '24px' }}>
              <span className="flex items-center gap-2 cursor-pointer select-none" onClick={() => { if (!recState || recState?.status === 'idle') onArmRecording?.(recLoopLength, recFps); else if (recState?.status === 'armed' || recState?.status === 'recording') onDisarmRecording?.() }}>
                <span className="text-fg-96">Record</span>
                <span className="block rounded-full transition-all" style={{ width: 8, height: 8, backgroundColor: (recState?.status === 'armed' || recState?.status === 'recording') ? '#e74c3c' : '#6b2828' }} />
              </span>
              <div className="flex items-center gap-2">
                {(!recState || recState?.status === 'idle') && (
                  <>
                    <span className="text-fg-16">[Start]</span>
                    <span className="text-fg-16">[Cancel]</span>
                  </>
                )}
                {recState?.status === 'armed' && (
                  <>
                    <span className="text-fg-96 cursor-pointer select-none" onClick={() => onStartRecording?.()}>[Start]</span>
                    <span className="text-fg-96 cursor-pointer select-none" onClick={() => onDisarmRecording?.()}>[Cancel]</span>
                  </>
                )}
                {recState?.status === 'recording' && (
                  <>
                    <span className="text-[#e74c3c] cursor-pointer select-none" onClick={() => onStopRecording?.()}>[Stop]</span>
                    <span className="text-fg-96 cursor-pointer select-none" onClick={() => onDisarmRecording?.()}>[Cancel]</span>
                  </>
                )}
              </div>
            </div>

            {recState?.status === 'armed' && (
              <div className="kol-helper-xs text-fg-32" style={{ height: '24px', lineHeight: '24px' }}>Standby — ready to record</div>
            )}

            {recState?.status === 'recording' && (
              <>
                <div className="w-full bg-fg-08 overflow-hidden" style={{ height: '2px', borderRadius: '1px' }}>
                  <div className="h-full bg-[#e74c3c]" style={{ width: `${(recState.elapsed / recLoopLength) * 100}%`, transition: 'width 100ms' }} />
                </div>
                <div className="flex items-center justify-between kol-helper-xs text-fg-32" style={{ height: '24px' }}>
                  <span className="text-[#e74c3c]">Frame {Math.floor(recState.elapsed * recFps)}</span>
                  <span>{recState.elapsed.toFixed(1)}s / {recLoopLength}s</span>
                </div>
              </>
            )}

            {recState?.status === 'done' && recState?.blobUrl && (
              <div className="flex items-center justify-between kol-helper-xs border border-fg-16 px-2" style={{ height: '24px', borderRadius: '3px' }}>
                <span className="text-fg-64">{recState.blobSize ? (recState.blobSize / (1024 * 1024)).toFixed(2) + ' MB' : ''} · {recLoopLength}s</span>
                <div className="flex items-center gap-2">
                  <span className="text-fg-48 hover:text-fg-96 cursor-pointer select-none" onClick={() => onSaveRecToSlot?.({ blobUrl: recState.blobUrl, blobSize: recState.blobSize, loopLength: recLoopLength, fps: recFps, frozenParams: recState.frozenParams })}>[Save]</span>
                  <span className="text-fg-32 hover:text-fg-64 cursor-pointer select-none" onClick={() => onClearRecorder?.()}>[Discard]</span>
                </div>
              </div>
            )}

            <Divider className="my-1" />

            <div className="flex flex-col gap-2" style={{ overflowY: 'auto', overflowX: 'hidden', flex: '1 1 0', minHeight: 0, scrollbarWidth: 'none' }}>
              {recSlots.map((slot, si) => {
                const isActive = activeRecSlot === si
                if (!slot) return (
                  <div key={si} className="flex items-center justify-between kol-helper-xs" style={{ height: '24px', opacity: 0.5 }}>
                    <span className="text-fg-32">{si + 1}. empty</span>
                    <div className="flex items-center gap-2">
                      <label className="text-fg-32 hover:text-fg-64 cursor-pointer select-none">
                        [Upload]<input type="file" accept="video/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onUploadRecSlot(si, f); e.target.value = '' }} />
                      </label>
                      <span className="text-fg-32 hover:text-fg-64 cursor-pointer select-none" onClick={() => onRemoveRecSlot(si)}><Icon name="x" size={12} /></span>
                    </div>
                  </div>
                )
                const slotDuration = slot.duration || recLoopLength
                const infoOpen = recInfoOpen.has(si)
                const toggleInfo = () => setRecInfoOpen(prev => { const next = new Set(prev); next.has(si) ? next.delete(si) : next.add(si); return next })
                return (
                  <div key={si} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-4 kol-helper-xs" style={{ height: '24px' }}>
                      <span className={isActive ? 'text-fg-96' : 'text-fg-64'}>
                        rec-{String(si + 1).padStart(2, '0')}{isActive && <span className="text-[#e74c3c] ml-2">ACTIVE</span>}
                      </span>
                      <span className="text-fg-32 hover:text-fg-64 cursor-pointer select-none" onClick={toggleInfo}>[Info]</span>
                    </div>
                    {infoOpen && (
                      <div className="kol-helper-xs text-fg-32" style={{ height: '24px', lineHeight: '24px' }}>
                        {(slot.size / (1024 * 1024)).toFixed(2)}MB · {slot.duration?.toFixed(1)}s · {slot.resolution} · {slot.fps}fps
                      </div>
                    )}
                    <Slider variant="dual" min={0} max={slotDuration} step={0.1} value={slot.mark1 ?? 0} value2={slot.mark2 ?? slotDuration} onChange={(v) => onUpdateRecSlotTrim(si, v, slot.mark2)} onChange2={(v) => onUpdateRecSlotTrim(si, slot.mark1, v)} playhead={isActive ? playhead : undefined} onPlayheadChange={isActive ? onSeek : undefined} />
                    <div className="flex items-center justify-between gap-4 kol-helper-xs" style={{ height: '24px' }}>
                      <div className="flex items-center" style={{ gap: '2px' }}>
                        {isActive ? (
                          <div className="flex items-center" style={{ gap: '2px' }}>
                            <span className="cursor-pointer select-none" style={{ color: '#2dd4bf' }} onClick={() => onRecPauseToggle && onRecPauseToggle()}>
                              <Icon name={recPaused ? 'control-play' : 'control-pause'} size={16} />
                            </span>
                            <span className="cursor-pointer select-none" style={{ color: '#2dd4bf' }} onClick={() => onClearActiveRecSlot()}>
                              <Icon name="control-stop" size={16} />
                            </span>
                          </div>
                        ) : (
                          <span className="cursor-pointer select-none" style={{ color: '#2dd4bf' }} onClick={() => onSetActiveRecSlot(si)}>
                            <Icon name="control-play" size={16} />
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-fg-32 hover:text-fg-64 cursor-pointer select-none" onClick={() => { const a = document.createElement('a'); a.href = slot.blobUrl; a.download = slot.fileName; a.click() }}>[Download]</span>
                        <span className="text-fg-32 hover:text-fg-64 cursor-pointer select-none" onClick={() => onRemoveRecSlot(si)}><Icon name="x" size={12} /></span>
                      </div>
                    </div>
                    <Divider />
                  </div>
                )
              })}
              {recSlots.length < 8 && (
                <div className="kol-helper-xs text-fg-32 hover:text-fg-64 cursor-pointer select-none" style={{ height: '24px', lineHeight: '24px' }} onClick={() => onAddRecSlot()}>[+ Add Slot]</div>
              )}
            </div>
          </div>
        )}
        {/* Drag handle */}
        <div
          className="absolute top-0 right-0 h-full cursor-col-resize"
          style={{ width: '5px' }}
          onPointerDown={onShelfDragStart}
          onDoubleClick={() => setShelfWidth(280)}
        />
      </div>
    )}
    </div>{/* close flex-row */}
    </div>
  )
}

export default function SymphonyMixer({
  channels = [],
  resolvedParams = [],
  onChannelUpdate,
  onChannelParamChange,
  onLoadPreset,
  layout = 'row',
  dropdownItems = [],
  openNineDropdown = null,
  onSelectVariant,
  onCloseDropdown,
  onEditChannel,
  onAddChannel,
  onRemoveChannel,
  onRecalc,
  onResetChannel,
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
}) {
  const [masterFxOpen, setMasterFxOpen] = useState(false)
  const [fxOpenAll, setFxOpenAll] = useState({ open: false, tick: 0 })
  const [masterFxTab, setMasterFxTab] = useState('fx')
  const [mixerTab, setMixerTab] = useState('channels')
  return (
    <div className="flex flex-col gap-6">
      <div style={{ height: '80px', overflow: 'hidden' }}>
        <ChannelWireDiagram channels={channels} master={master} />
      </div>
      <div className="flex items-center gap-3 pb-2 mb-1 border-b border-fg-08">
        {[
          { key: 'channels', label: 'Channels', icon: 'settings-01' },
          { key: 'output', label: 'Output', icon: 'circle' },
        ].map(tab => (
          <span
            key={tab.key}
            className={`cursor-pointer select-none kol-helper-s flex items-center gap-1 ${
              mixerTab === tab.key ? 'text-fg-96' : 'text-fg-32 hover:text-fg-64'
            }`}
            onClick={() => setMixerTab(tab.key)}
          >
            <Icon name={tab.icon} size={14} />
            {tab.label}
          </span>
        ))}
      </div>
      <div style={{ position: 'relative' }}>
      {/* A Channels — always rendered to hold height */}
      <div
        className={`flex ${layout === 'row' ? 'flex-row' : 'flex-col'} gap-4`}
        style={{ overflowX: layout === 'row' ? 'auto' : 'visible', scrollbarWidth: 'none', visibility: mixerTab === 'channels' ? 'visible' : 'hidden' }}
      >
        {channels.map((ch, i) => (
          <Channel
            key={i}
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
          />
        ))}

        {/* Add channel */}
        <div
          className="flex items-center justify-center shrink-0 cursor-pointer"
          style={{ width: '48px' }}
          onClick={() => onAddChannel && onAddChannel()}
        >
          <div className="w-8 h-8 rounded-full bg-fg-08 hover:bg-fg-16 flex items-center justify-center transition-colors">
            <Icon name="plus" size={14} className="text-fg-48" />
          </div>
        </div>

      </div>

      {/* B Output — overlays on top when active */}
      {mixerTab === 'output' && (
      <div className="grid grid-cols-3 gap-4 pr-8" style={{ position: 'absolute', top: 0, left: 0, right: 0, width: '100%' }}>
        {/* Master Output */}
        <div className="flex flex-col gap-2">
          <div className="kol-helper-xs text-fg-48 uppercase">Master Output</div>
          <div
            className="flex flex-col items-center gap-4 p-4 bg-surface-secondary border border-fg-16"
            style={{ borderRadius: '4px', minHeight: '140px' }}
          >
            <div className="w-full flex items-center justify-between">
              <span className="kol-helper-xs text-fg-64 uppercase">Output</span>
              <div
                className={`cursor-pointer select-none flex items-center justify-center p-1 border transition-all kol-helper-xs ${masterFxOpen ? 'border-accent-primary accentYellow' : 'border-fg-16 text-fg-96 hover:border-accent-primary hover:accentYellow'}`}
                style={{ borderRadius: '4px', minWidth: '28px' }}
                onClick={() => setMasterFxOpen(!masterFxOpen)}
                title="Master FX"
              >
                FX
              </div>
            </div>
            <Slider
              label="Opacity"
              min={0}
              max={100}
              step={1}
              value={master.opacity}
              onChange={(v) => onMasterChange && onMasterChange({ opacity: v })}
              formatValue={(v) => `${Math.round(v)}%`}
              className="w-full"
              variant="minimal"
            />
            <div className="w-full flex items-center justify-between kol-helper-xs">
              <span className="text-fg-64">Blend</span>
              <Dropdown
                options={CSS_BLEND_MODES.map(m => ({ value: m, label: m.charAt(0).toUpperCase() + m.slice(1) }))}
                value={master.blendMode}
                onChange={(v) => onMasterChange && onMasterChange({ blendMode: v })}
                variant="minimal"
                size="md"
              />
            </div>
          </div>
          {/* Master FX rack */}
          {masterFxOpen && (
            <div
              className="flex flex-col gap-1 px-3 py-3 border border-fg-08 kol-helper-xs"
              style={{ borderRadius: '4px', backgroundColor: 'var(--kol-surface-tertiary)' }}
            >
              {(master.fx || []).map((fxItem, fi) => {
                const def = CHANNEL_FX_DEFS.find(d => d.id === fxItem.type)
                const paramKeys = def ? Object.keys(def.params) : []
                const primaryKey = paramKeys[0]
                const primarySpec = def?.params[primaryKey]
                return (
                  <div key={fi} className="flex items-center gap-2" style={{ height: '24px' }}>
                    <div
                      className={`w-3 h-3 rounded-full cursor-pointer shrink-0 ${fxItem.enabled ? 'bg-[#e74c3c]' : 'bg-fg-24'}`}
                      onClick={() => {
                        const next = [...master.fx]
                        next[fi] = { ...next[fi], enabled: !next[fi].enabled }
                        onMasterChange({ fx: next })
                      }}
                    />
                    <select
                      className="bg-transparent text-fg-96 border-none outline-none kol-helper-xs cursor-pointer"
                      style={{ width: '64px', fontSize: '11px' }}
                      value={fxItem.type}
                      onChange={(e) => {
                        const next = [...master.fx]
                        next[fi] = { type: e.target.value, enabled: fxItem.enabled, params: getDefaultFxParams(e.target.value) }
                        onMasterChange({ fx: next })
                      }}
                    >
                      {CHANNEL_FX_DEFS.map(d => (
                        <option key={d.id} value={d.id}>{d.label}</option>
                      ))}
                    </select>
                    {primarySpec && (
                      <Slider
                        label=""
                        min={primarySpec.min}
                        max={primarySpec.max}
                        step={primarySpec.step}
                        value={fxItem.params[primaryKey] ?? primarySpec.default}
                        onChange={(v) => {
                          const next = [...master.fx]
                          next[fi] = { ...next[fi], params: { ...next[fi].params, [primaryKey]: v } }
                          onMasterChange({ fx: next })
                        }}
                        formatValue={(v) => primarySpec.unit ? `${Math.round(v * 100) / 100}${primarySpec.unit}` : `${Math.round(v * 100) / 100}`}
                        className="flex-1"
                        variant="minimal"
                      />
                    )}
                    <span
                      className="text-fg-96 cursor-pointer select-none shrink-0"
                      onClick={() => {
                        const next = master.fx.filter((_, i) => i !== fi)
                        onMasterChange({ fx: next })
                      }}
                    >
                      <Icon name="x" size={12} />
                    </span>
                  </div>
                )
              })}
              {(master.fx || []).length < MAX_CHANNEL_FX && (
                <div
                  className="flex items-center justify-center text-fg-32 hover:text-fg-64 cursor-pointer select-none py-1"
                  onClick={() => {
                    const newFx = { type: 'blur', enabled: true, params: getDefaultFxParams('blur') }
                    onMasterChange({ fx: [...(master.fx || []), newFx] })
                  }}
                >
                  [+ ADD FX]
                </div>
              )}
              {(master.fx || []).length === 0 && (
                <div className="text-fg-24 text-center py-1">No master FX</div>
              )}
            </div>
          )}
        </div>

        {/* Project Info */}
        <div className="flex flex-col gap-2">
          <div className="kol-helper-xs text-fg-48 uppercase">Project Info</div>
          <div
            className="flex flex-col gap-2 p-4 bg-surface-secondary border border-fg-08"
            style={{ borderRadius: '4px' }}
          >
            <div className="flex items-center justify-between kol-helper-xs">
              <span className="text-fg-64">Channels</span>
              <span className="text-fg-96">{channels.length}</span>
            </div>
            <div className="flex items-center justify-between kol-helper-xs">
              <span className="text-fg-64">Active</span>
              <span className="text-fg-96">{channels.filter(c => c.enabled).length}</span>
            </div>
            <div className="flex items-center justify-between kol-helper-xs">
              <span className="text-fg-64">Master FX</span>
              <span className="text-fg-96">{(master.fx || []).length}</span>
            </div>
          </div>
        </div>

        {/* Export */}
        <div className="flex flex-col gap-2">
          <div className="kol-helper-xs text-fg-48 uppercase">Export</div>
          <div
            className="flex flex-col gap-2 p-4 bg-surface-secondary border border-fg-08"
            style={{ borderRadius: '4px' }}
          >
            <div className="kol-helper-xs text-fg-32">Export settings will appear here.</div>
          </div>
        </div>
      </div>
      )}
      </div>{/* close relative wrapper */}

    </div>
  )
}
