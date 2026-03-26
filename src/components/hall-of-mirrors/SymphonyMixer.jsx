import { useRef, useState } from 'react'
import Slider from '../atoms/Slider'
import { Icon } from '../icons'
import Divider from '../atoms/Divider'
import VariantControls from '../mirror/VariantControls'
import { findVariant, filterControlsByTab } from '../../data/mirrorVariants'
import RotaryDial from './RotaryDial'

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
      {isOpen && (
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
        </>
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
}) {
  const [showRemove, setShowRemove] = useState(false)
  const [shelfOpen, setShelfOpen] = useState(false)
  const [shelfPage, setShelfPage] = useState(0)
  return (
    <div className="flex flex-col gap-2 shrink-0" style={{ overflow: 'visible' }}>
      <div className="flex items-center justify-between kol-helper-xs" style={{ minHeight: '16px', width: '320px' }}>
        <span className="text-fg-48 truncate">{loadedName || '\u00A0'}</span>
        {onEdit && loadedName && (
          <span className="text-fg-32 hover:text-fg-96 cursor-pointer select-none shrink-0" onClick={onEdit}>[EDIT]</span>
        )}
      </div>
      <div className="flex flex-row items-stretch" style={{ overflow: 'visible' }}>
      <div
        className="flex flex-col items-center gap-6 p-4 bg-surface-secondary border border-fg-08 relative shrink-0"
        style={{
          borderRadius: '4px',
          overflow: 'visible',
          width: '320px',
          minHeight: '264px',
        }}
      >
      <div className="w-full flex items-start justify-between">
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
        </div>
      </div>

      <div className="flex items-center justify-center">
        <RotaryDial
          label=""
          value={value}
          onChange={onChange}
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
    {shelfOpen && controls && params && (
      <div
        className="flex flex-col px-4 py-4 my-4 shrink-0 border border-fg-08 kol-helper-xs-2"
        style={{ borderRadius: '0 4px 4px 0', backgroundColor: '#0e0e11', width: '280px', marginLeft: '-8px', paddingLeft: '24px' }}
      >
        {(() => {
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
}) {
  return (
    <div className="flex flex-col gap-6">
      <div
        className={`flex ${layout === 'row' ? 'flex-row' : 'flex-col'} gap-4`}
        style={{ overflowX: layout === 'row' ? 'auto' : 'visible' }}
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

    </div>
  )
}
