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
        className="cursor-pointer select-none flex items-center justify-center p-1 border border-fg-16 text-fg-96 hover:border-accent-primary hover:accentYellow transition-all"
        style={{ borderRadius: '4px' }}
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
  loadMode = 'effect',
  onMediaChange,
  globalImageThumb = null,
  recState = null,
  isRecording = false,
  onArmRecording,
  onDisarmRecording,
  onSetMark,
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
}) {
  const [showRemove, setShowRemove] = useState(false)
  const [shelfOpen, setShelfOpen] = useState(false)
  const [shelfPage, setShelfPage] = useState(0)
  const [shelfTab, setShelfTab] = useState('params') // 'params' | 'src' | 'rec'
  const [recLoopLength, setRecLoopLength] = useState(20)
  const [fxOpen, setFxOpen] = useState(true)
  const [shelfWidth, setShelfWidth] = useState(280)
  const shelfDragging = useRef(false)
  const shelfStartX = useRef(0)
  const shelfStartW = useRef(0)
  const mediaFileRef = useRef(null)

  useEffect(() => {
    if (fxOpenAllTick && fxOpenAllTick.tick > 0) setFxOpen(fxOpenAllTick.open)
  }, [fxOpenAllTick?.tick])
  const [fxTab, setFxTab] = useState('fx') // 'fx' | 'blend' | 'color' | 'res'

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
      <div className="flex items-center justify-between kol-helper-xs mb-2" style={{ minHeight: '16px', width: '320px' }}>
        <span className="text-fg-48 truncate">
          {loadedName || '\u00A0'}
          {activeRecSlot != null && <span className="text-fg-32 ml-1">[REC]</span>}
        </span>
        {onEdit && loadedName && (
          <span className="text-fg-32 hover:text-fg-96 cursor-pointer select-none shrink-0" onClick={onEdit}>[EDIT]</span>
        )}
      </div>
      <div className="flex flex-row items-stretch" style={{ overflow: 'visible' }}>
      <div
        className="flex flex-col items-center gap-6 p-4 bg-surface-secondary border border-fg-08 relative shrink-0"
        style={{
          borderRadius: fxOpen ? '4px 4px 0 0' : '4px',
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
          {onReset && (
            <div
              className="cursor-pointer select-none text-fg-24 hover:text-fg-64 transition-colors"
              onClick={(e) => onReset(e.altKey)}
              title="Reset channel (Alt+click: reset all)"
            >
              <span className="block rounded-full" style={{ width: 8, height: 8, backgroundColor: '#DB8000' }} />
            </div>
          )}
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
            className={`cursor-pointer select-none flex items-center justify-center p-1 border transition-all ${shelfOpen ? 'border-accent-primary accentYellow' : 'border-fg-16 text-fg-96 hover:border-accent-primary hover:accentYellow'}`}
            style={{ borderRadius: '4px' }}
            onClick={() => setShelfOpen(!shelfOpen)}
            title="Effects"
          >
            <Icon name="frequency" size={16} />
          </div>
          <div
            className={`cursor-pointer select-none flex items-center justify-center p-1 border transition-all kol-helper-xs ${fxOpen ? 'border-accent-primary accentYellow' : 'border-fg-16 text-fg-96 hover:border-accent-primary hover:accentYellow'}`}
            style={{ borderRadius: '4px', minWidth: '28px' }}
            onClick={(e) => {
              if (e.altKey && onFxToggleAll) {
                onFxToggleAll(!fxOpen)
              }
              setFxOpen(!fxOpen)
            }}
            title="Post FX (Alt+click: toggle all)"
          >
            FX
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
        <div
          className="flex items-center justify-between kol-helper-xs text-fg-96 cursor-pointer select-none"
          style={{ height: '24px' }}
          onClick={() => onBoostChange(!boosted)}
        >
          <span>Boost</span>
          <span>[{boosted ? 'ON' : 'OFF'}]</span>
        </div>
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
      </div>
    </div>
    {/* Shelf — expands to the right */}
    {shelfOpen && (
      <div
        className="flex flex-col px-4 pt-3 pb-4 my-4 shrink-0 border border-fg-08 kol-helper-xs-2 relative"
        style={{ borderRadius: '0 4px 4px 0', backgroundColor: '#0e0e11', width: `${shelfWidth}px`, marginLeft: '-8px', paddingLeft: '24px' }}
      >
        {/* Shelf tab bar */}
        <div className="flex items-center gap-3 pb-2 mb-2 -mx-4 px-4 border-b border-fg-08">
          {[
            { key: 'params', label: 'PARAMS' },
            { key: 'src', label: 'SRC' },
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
                    rowHeight={20}
                  />
                  <Divider className="my-2" />
                </>
              )}
              <div style={{ flex: 1 }}>
                <VariantControls
                  controls={currentPage}
                  params={params}
                  onParamChange={onParamChange}
                  rowHeight={20}
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
          <div className="flex flex-col gap-3">
            <div className="w-full border border-fg-08 bg-fg-04 flex items-center justify-center overflow-hidden" style={{ height: '80px', borderRadius: '3px' }}>
              {(customImageSrc || globalImageThumb) ? (
                <img src={customImageSrc || globalImageThumb} alt="Source" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              ) : (
                <span className="text-fg-24">No image</span>
              )}
            </div>
            <div className="flex items-center justify-between kol-helper-xs" style={{ height: '20px' }}>
              <span className="text-fg-48">Source</span>
              <span className="text-fg-64">{customImageSrc ? 'Custom' : 'Global'}</span>
            </div>
            <div className="flex items-center justify-between kol-helper-xs" style={{ height: '24px' }}>
              <span className="text-fg-48">Mode</span>
              <select
                className="bg-transparent text-fg-96 border-none outline-none kol-helper-xs cursor-pointer"
                style={{ fontSize: '11px' }}
                value={loadMode}
                onChange={(e) => onMediaChange({ loadMode: e.target.value })}
              >
                <option value="effect">Effect Only</option>
                <option value="source">Effect + Source</option>
              </select>
            </div>
            <div className="text-fg-32 hover:text-fg-64 cursor-pointer select-none kol-helper-xs" onClick={() => mediaFileRef.current?.click()}>[+ Upload]</div>
            <input ref={mediaFileRef} type="file" accept="image/*,.svg" className="hidden" onChange={async (e) => { const file = e.target.files?.[0]; if (!file) return; try { const r = await processImageUpload(file); onMediaChange({ customImageSrc: r.imageSrc, customRasterSrc: r.rasterSrc }) } catch (_) {} e.target.value = '' }} />
            {customImageSrc && (
              <div className="text-fg-32 hover:text-fg-64 cursor-pointer select-none kol-helper-xs" onClick={() => onMediaChange({ customImageSrc: null, customRasterSrc: null })}>[Clear]</div>
            )}
          </div>
        )}

        {shelfTab === 'rec' && (
          <div className="flex flex-col gap-3">
            {/* Record controls */}
            <div className="flex items-center justify-between kol-helper-xs" style={{ height: '24px' }}>
              <span className="text-fg-48">Duration</span>
              <select
                className="bg-transparent text-fg-96 border-none outline-none kol-helper-xs cursor-pointer"
                style={{ fontSize: '11px' }}
                value={recLoopLength}
                onChange={(e) => setRecLoopLength(Number(e.target.value))}
                disabled={recState?.status === 'recording'}
              >
                {[10, 20, 40, 80, 160].map(s => (
                  <option key={s} value={s}>{s}s</option>
                ))}
              </select>
            </div>
            <div className="flex items-center justify-between kol-helper-xs" style={{ height: '24px' }}>
              <span className="text-fg-48">Record</span>
              <span
                className="cursor-pointer select-none"
                onClick={() => {
                  if (recState?.status === 'recording') onDisarmRecording && onDisarmRecording()
                  else onArmRecording && onArmRecording(recLoopLength)
                }}
              >
                <span className="block rounded-full transition-all" style={{ width: 8, height: 8, backgroundColor: recState?.status === 'recording' ? '#e74c3c' : '#6b2828' }} />
              </span>
            </div>

            {/* Recording progress */}
            {recState?.status === 'recording' && (
              <div className="flex flex-col gap-1">
                <div className="w-full h-1 bg-fg-08 overflow-hidden" style={{ borderRadius: '1px' }}>
                  <div className="h-full bg-[#e74c3c]" style={{ width: `${(recState.elapsed / recLoopLength) * 100}%`, transition: 'width 100ms' }} />
                </div>
                <div className="flex items-center justify-between kol-helper-xs text-fg-32">
                  <span className="text-[#e74c3c]">Frame {Math.floor(recState.elapsed * 30)}</span>
                  <span>{recState.elapsed.toFixed(1)}s / {recLoopLength}s</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div
                    className={`flex-1 text-center py-1 cursor-pointer select-none border kol-helper-xs ${recState.mark1 != null ? 'text-fg-96 border-accent-primary' : 'border-fg-16 text-fg-32 hover:text-fg-64'}`}
                    style={{ borderRadius: '3px' }}
                    onClick={() => onSetMark && onSetMark(1)}
                  >
                    In{recState.mark1 != null ? ` ${recState.mark1.toFixed(1)}s` : ''}
                  </div>
                  <div
                    className={`flex-1 text-center py-1 cursor-pointer select-none border kol-helper-xs ${recState.mark2 != null ? 'text-fg-96 border-accent-primary' : 'border-fg-16 text-fg-32 hover:text-fg-64'}`}
                    style={{ borderRadius: '3px' }}
                    onClick={() => onSetMark && onSetMark(2)}
                  >
                    Out{recState.mark2 != null ? ` ${recState.mark2.toFixed(1)}s` : ''}
                  </div>
                </div>
              </div>
            )}

            {/* Recording complete — save or discard */}
            {recState?.status === 'done' && recState?.blobUrl && (
              <div className="flex flex-col gap-1 py-1 border border-fg-16 px-2" style={{ borderRadius: '3px' }}>
                <div className="kol-helper-xs text-fg-64">
                  Recording complete · {recState.blobSize ? (recState.blobSize / (1024 * 1024)).toFixed(2) + ' MB' : ''} · {recLoopLength}s
                </div>
                <div className="flex items-center gap-3 kol-helper-xs">
                  <span className="text-fg-48 hover:text-fg-96 cursor-pointer select-none" onClick={() => onSaveRecToSlot && onSaveRecToSlot({
                    blobUrl: recState.blobUrl,
                    blobSize: recState.blobSize,
                    loopLength: recLoopLength,
                    mark1: recState.mark1,
                    mark2: recState.mark2,
                    frozenParams: recState.frozenParams,
                  })}>[Save to Slot]</span>
                  <span className="text-fg-32 hover:text-fg-64 cursor-pointer select-none" onClick={() => onClearRecorder && onClearRecorder()}>[Discard]</span>
                </div>
              </div>
            )}

            {/* Slots */}
            <Divider className="my-1" />
            <div className="flex flex-col gap-2" style={{ overflow: 'auto', flex: '1 1 0', minHeight: 0 }}>
              {recSlots.map((slot, si) => {
                const isActive = activeRecSlot === si
                if (!slot) {
                  return (
                    <div key={si} className="flex items-center justify-between kol-helper-xs py-1" style={{ opacity: 0.5 }}>
                      <span className="text-fg-32">{si + 1}. empty</span>
                      <div className="flex items-center gap-2">
                        <label className="text-fg-32 hover:text-fg-64 cursor-pointer select-none">
                          [Upload]
                          <input type="file" accept="video/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onUploadRecSlot(si, f); e.target.value = '' }} />
                        </label>
                        <span className="text-fg-24 hover:text-fg-64 cursor-pointer select-none" onClick={() => onRemoveRecSlot(si)}>×</span>
                      </div>
                    </div>
                  )
                }
                const sizeMB = slot.size ? (slot.size / (1024 * 1024)).toFixed(2) : '—'
                return (
                  <div key={si} className={`flex flex-col gap-1 py-1 ${isActive ? 'border-l-2 border-accent-primary pl-2' : ''}`}>
                    <div className="flex items-center justify-between kol-helper-xs">
                      <span className={isActive ? 'text-fg-96' : 'text-fg-64'}>{si + 1}. {slot.fileName}</span>
                      {isActive && <span className="text-[#e74c3c]">ACTIVE</span>}
                    </div>
                    <div className="kol-helper-xs text-fg-32">
                      {slot.codec} · {sizeMB}MB · {slot.duration?.toFixed(1)}s
                    </div>
                    <div className="kol-helper-xs text-fg-32">
                      {slot.resolution} · {slot.fps}fps
                    </div>
                    {/* Trim */}
                    <div className="flex items-center gap-2 kol-helper-xs text-fg-32">
                      <span>In {(slot.mark1 ?? 0).toFixed(1)}s</span>
                      <input
                        type="range" min={0} max={slot.duration || recLoopLength} step={0.1}
                        value={slot.mark1 ?? 0}
                        onChange={(e) => onUpdateRecSlotTrim(si, Number(e.target.value), slot.mark2)}
                        className="flex-1" style={{ height: '10px', accentColor: 'var(--kol-accent-primary)' }}
                      />
                    </div>
                    <div className="flex items-center gap-2 kol-helper-xs text-fg-32">
                      <span>Out {(slot.mark2 ?? slot.duration ?? recLoopLength).toFixed(1)}s</span>
                      <input
                        type="range" min={0} max={slot.duration || recLoopLength} step={0.1}
                        value={slot.mark2 ?? slot.duration ?? recLoopLength}
                        onChange={(e) => onUpdateRecSlotTrim(si, slot.mark1, Number(e.target.value))}
                        className="flex-1" style={{ height: '10px', accentColor: 'var(--kol-accent-primary)' }}
                      />
                    </div>
                    {/* Actions */}
                    <div className="flex items-center gap-2 kol-helper-xs">
                      <span className="text-fg-32 hover:text-fg-64 cursor-pointer select-none" onClick={() => {
                        const a = document.createElement('a'); a.href = slot.blobUrl; a.download = slot.fileName; a.click()
                      }}>[Download]</span>
                      {isActive ? (
                        <span className="text-fg-48 hover:text-fg-96 cursor-pointer select-none" onClick={() => onClearActiveRecSlot()}>[Remove]</span>
                      ) : (
                        <span className="text-fg-48 hover:text-fg-96 cursor-pointer select-none" onClick={() => onSetActiveRecSlot(si)}>[Load]</span>
                      )}
                      <span className="text-fg-24 hover:text-fg-64 cursor-pointer select-none" onClick={() => onRemoveRecSlot(si)}>×</span>
                    </div>
                  </div>
                )
              })}
              {recSlots.length < 8 && (
                <div className="kol-helper-xs text-fg-32 hover:text-fg-64 cursor-pointer select-none py-1" onClick={() => onAddRecSlot()}>
                  [+ Add Slot]
                </div>
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
    {/* Shelf-bottom — FX rack below the channel strip */}
    {fxOpen && (
      <div
        className="flex flex-col mx-2 border border-fg-08 border-t-0 kol-helper-xs-2"
        style={{ borderRadius: '0 0 4px 4px', backgroundColor: '#0e0e11', height: '124px', overflow: 'hidden', width: `${320 - 16}px`, paddingTop: '4px' }}
      >
        {/* Tab bar */}
        <div className="flex items-center gap-3 px-4 py-2 border-b border-fg-08 shrink-0" style={{ backgroundColor: '#0e0e11' }}>
          {['fx', 'blend', 'color', 'res'].map(tab => (
            <span
              key={tab}
              className={`cursor-pointer select-none uppercase ${fxTab === tab ? 'text-fg-96' : 'text-fg-32 hover:text-fg-64'}`}
              onClick={() => setFxTab(tab)}
            >
              {tab}
            </span>
          ))}
        </div>

        <div className="flex flex-col gap-1 px-4 py-3" style={{ overflow: 'auto', flex: '1 1 0', minHeight: 0 }}>
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
                    className="text-fg-32 hover:text-fg-96 cursor-pointer select-none shrink-0"
                    onClick={() => {
                      const next = fx.filter((_, i) => i !== fi)
                      onFxChange(next)
                    }}
                  >
                    ×
                  </span>
                </div>
              )
            })}
            {fx.length < MAX_CHANNEL_FX && (
              <div
                className="text-fg-32 hover:text-fg-64 cursor-pointer select-none py-1"
                onClick={() => {
                  const newFx = { type: 'blur', enabled: true, params: getDefaultFxParams('blur') }
                  onFxChange([...fx, newFx])
                }}
              >
                [+ ADD FX]
              </div>
            )}
            {fx.length === 0 && (
              <div className="text-fg-24 py-1">No post-FX</div>
            )}
          </>
        )}

        {fxTab === 'blend' && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between" style={{ height: '24px' }}>
              <span className="text-fg-64">Mode</span>
              <select
                className="bg-transparent text-fg-96 border-none outline-none kol-helper-xs cursor-pointer"
                style={{ fontSize: '11px' }}
                value={blendMode}
                onChange={(e) => onBlendModeChange(e.target.value)}
              >
                {CSS_BLEND_MODES.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {fxTab === 'color' && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4" style={{ height: '24px' }}>
              <div className="flex items-center justify-between flex-1">
                <span className="text-fg-64">Vector</span>
                <ColorPicker color={vectorColor} onChange={onVectorColorChange} />
              </div>
              <Divider variant="vertical" className="px-4" />
              <div className="flex items-center justify-between flex-1">
                <span className="text-fg-64">Background</span>
                <ColorPicker color={backgroundColor} onChange={onBackgroundColorChange} />
              </div>
            </div>
            <div className="flex items-center justify-between" style={{ height: '24px' }}>
              <span className="text-fg-64">Context Color</span>
              <select
                className="bg-transparent text-fg-96 border-none outline-none kol-helper-xs cursor-pointer"
                style={{ fontSize: '11px' }}
                value={rasterTheme}
                onChange={(e) => onRasterThemeChange(e.target.value)}
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
              </select>
            </div>
          </div>
        )}

        {fxTab === 'res' && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between" style={{ height: '24px' }}>
              <span className="text-fg-64">Tier</span>
              <select
                className="bg-transparent text-fg-96 border-none outline-none kol-helper-xs cursor-pointer"
                style={{ fontSize: '11px' }}
                value={rasterTierOverride || 'auto'}
                onChange={(e) => onRasterTierOverrideChange(e.target.value === 'auto' ? null : e.target.value)}
              >
                <option value="auto">Auto</option>
                <option value="mid">Mid (6x)</option>
                <option value="high">High (12x)</option>
              </select>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-fg-32">IMG/res logic</span>
              <span
                className="text-fg-32 hover:text-fg-64 cursor-pointer select-none"
                onClick={onRecalc}
              >[+ Recalculate]</span>
            </div>
          </div>
        )}
        </div>
      </div>
    )}
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
  onArmRecording,
  onDisarmRecording,
  onSetMark,
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
      <ChannelWireDiagram channels={channels} master={master} />
      <div className="flex items-center gap-3 pb-2 mb-1 border-b border-fg-08">
        {[
          { key: 'channels', label: 'A Channels' },
          { key: 'output', label: 'B Output' },
        ].map(tab => (
          <span
            key={tab.key}
            className={`cursor-pointer select-none uppercase kol-helper-xs ${
              mixerTab === tab.key ? 'text-fg-96' : 'text-fg-32 hover:text-fg-64'
            }`}
            onClick={() => setMixerTab(tab.key)}
          >
            [{tab.label}]
          </span>
        ))}
      </div>
      <div style={{ position: 'relative' }}>
      {/* A Channels — always rendered to hold height */}
      <div
        className={`flex ${layout === 'row' ? 'flex-row' : 'flex-col'} gap-4`}
        style={{ overflowX: layout === 'row' ? 'auto' : 'visible', visibility: mixerTab === 'channels' ? 'visible' : 'hidden' }}
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
            loadMode={ch.loadMode || 'effect'}
            onMediaChange={(updates) => onChannelUpdate(i, updates)}
            globalImageThumb={globalImageThumb}
            recState={recChannel === i ? recState : (ch.recording ? { status: 'done', ...ch.recording } : null)}
            isRecording={recChannel === i && recState?.status === 'recording'}
            onArmRecording={(len) => onArmRecording && onArmRecording(i, len)}
            onDisarmRecording={() => onDisarmRecording && onDisarmRecording(i)}
            onSetMark={(n, v) => onSetMark && onSetMark(i, n, v)}
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
              <select
                className="bg-transparent text-fg-96 border-none outline-none kol-helper-xs cursor-pointer"
                style={{ fontSize: '11px' }}
                value={master.blendMode}
                onChange={(e) => onMasterChange && onMasterChange({ blendMode: e.target.value })}
              >
                {CSS_BLEND_MODES.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>
          {/* Master FX rack */}
          {masterFxOpen && (
            <div
              className="flex flex-col gap-1 px-3 py-3 border border-fg-08 kol-helper-xs"
              style={{ borderRadius: '4px', backgroundColor: '#0e0e11' }}
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
                      className="text-fg-32 hover:text-fg-96 cursor-pointer select-none shrink-0"
                      onClick={() => {
                        const next = master.fx.filter((_, i) => i !== fi)
                        onMasterChange({ fx: next })
                      }}
                    >
                      ×
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
