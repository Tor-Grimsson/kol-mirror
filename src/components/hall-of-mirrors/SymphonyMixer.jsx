import { useRef, useState } from 'react'
import Slider from '../atoms/Slider'
import { Icon } from '../icons'
import RotaryDial from './RotaryDial'

function LoadButton({ isOpen, onToggle, onClose, items, onSelect }) {
  const btnRef = useRef(null)
  const [direction, setDirection] = useState('down')

  const handleClick = (e) => {
    e.stopPropagation()
    if (!isOpen && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      setDirection(spaceBelow < 320 ? 'up' : 'down')
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
            className="absolute left-0 bottom-full mb-1 bg-surface-primary border border-fg-16 z-50 max-h-[300px] overflow-y-auto"
            style={{ borderRadius: '4px', minWidth: '200px' }}
          >
            {items?.map((item, index) => (
              <div
                key={item.id}
                className={`kol-helper-xs px-3 py-1.5 transition-all ${
                  item.empty || item.type === 'separator'
                    ? 'text-fg-32 cursor-default'
                    : 'text-fg-64 hover:text-fg-96 hover:bg-surface-secondary cursor-pointer'
                }`}
                style={{
                  borderBottom: index < items.length - 1 ? '1px solid var(--kol-fg-08)' : 'none'
                }}
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
}) {
  return (
    <div className="flex flex-col gap-2" style={{ overflow: 'visible' }}>
      <div className="flex items-center justify-between kol-helper-xs" style={{ minHeight: '16px' }}>
        <span className="text-fg-48 truncate">{loadedName || '\u00A0'}</span>
        {onEdit && loadedName && (
          <span className="text-fg-32 hover:text-fg-96 cursor-pointer select-none shrink-0" onClick={onEdit}>[EDIT]</span>
        )}
      </div>
      <div
        className="flex flex-col items-center gap-6 p-4 bg-surface-secondary border border-fg-08 relative"
        style={{
          borderRadius: '4px',
          overflow: 'visible'
        }}
      >
      <div className="w-full flex items-center justify-between">
        <LoadButton
          isOpen={isDropdownOpen}
          onToggle={onLoadFromNine}
          onClose={onCloseDropdown}
          items={items}
          onSelect={onSelectItem}
        />
        <div
          className="cursor-pointer select-none flex items-center justify-center"
          onClick={() => onEnabledChange(!enabled)}
          title={enabled ? 'ON' : 'OFF'}
        >
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
    </div>
  )
}

export default function SymphonyMixer({
  displacementValue = 0,
  onDisplacementChange,
  displacementEnabled = false,
  onDisplacementEnabledChange,
  displacementBoosted = false,
  onDisplacementBoostChange,
  displacementRandomness = 0,
  onDisplacementRandomnessChange,

  movementValue = 0,
  onMovementChange,
  movementEnabled = false,
  onMovementEnabledChange,
  movementBoosted = false,
  onMovementBoostChange,
  movementRandomness = 0,
  onMovementRandomnessChange,

  copiesValue = 0,
  onCopiesChange,
  copiesEnabled = false,
  onCopiesEnabledChange,
  copiesBoosted = false,
  onCopiesBoostChange,
  copiesRandomness = 0,
  onCopiesRandomnessChange,
  copiesLoaded = null,
  copiesOpacity = 100,
  onCopiesOpacityChange,

  displacementLoaded = null,
  displacementOpacity = 100,
  onDisplacementOpacityChange,
  movementLoaded = null,
  movementOpacity = 100,
  onMovementOpacityChange,

  onLoadPreset,

  layout = 'row',

  nineVariants = {},
  openNineDropdown = null,
  onSelectVariant,
  onCloseDropdown,
  onEditChannel,
}) {
  return (
    <div className="flex flex-col gap-6" style={{ overflow: 'visible' }}>
      <div
        className={`flex ${layout === 'row' ? 'flex-row' : 'flex-col'} gap-4`}
        style={{ overflow: 'visible' }}
      >
        <Channel
          value={displacementValue}
          onChange={onDisplacementChange}
          enabled={displacementEnabled}
          onEnabledChange={onDisplacementEnabledChange}
          boosted={displacementBoosted}
          onBoostChange={onDisplacementBoostChange}
          randomness={displacementRandomness}
          onRandomnessChange={onDisplacementRandomnessChange}
          onLoadFromNine={() => onLoadPreset && onLoadPreset({ channel: 'displacement', source: 'nine' })}
          channelId="displacement"
          isDropdownOpen={openNineDropdown === 'displacement'}
          items={nineVariants['displacement']}
          onSelectItem={(id) => onSelectVariant('displacement', id)}
          onCloseDropdown={onCloseDropdown}
          loadedName={displacementLoaded}
          onEdit={() => onEditChannel && onEditChannel(0)}
          opacity={displacementOpacity}
          onOpacityChange={onDisplacementOpacityChange}
        />

        <Channel
          value={movementValue}
          onChange={onMovementChange}
          enabled={movementEnabled}
          onEnabledChange={onMovementEnabledChange}
          boosted={movementBoosted}
          onBoostChange={onMovementBoostChange}
          randomness={movementRandomness}
          onRandomnessChange={onMovementRandomnessChange}
          onLoadFromNine={() => onLoadPreset && onLoadPreset({ channel: 'movement', source: 'nine' })}
          channelId="movement"
          isDropdownOpen={openNineDropdown === 'movement'}
          items={nineVariants['movement']}
          onSelectItem={(id) => onSelectVariant('movement', id)}
          onCloseDropdown={onCloseDropdown}
          loadedName={movementLoaded}
          onEdit={() => onEditChannel && onEditChannel(1)}
          opacity={movementOpacity}
          onOpacityChange={onMovementOpacityChange}
        />

        <Channel
          value={copiesValue}
          onChange={onCopiesChange}
          enabled={copiesEnabled}
          onEnabledChange={onCopiesEnabledChange}
          boosted={copiesBoosted}
          onBoostChange={onCopiesBoostChange}
          randomness={copiesRandomness}
          onRandomnessChange={onCopiesRandomnessChange}
          onLoadFromNine={() => onLoadPreset && onLoadPreset({ channel: 'copies', source: 'nine' })}
          channelId="copies"
          isDropdownOpen={openNineDropdown === 'copies'}
          items={nineVariants['copies']}
          onSelectItem={(id) => onSelectVariant('copies', id)}
          onCloseDropdown={onCloseDropdown}
          loadedName={copiesLoaded}
          onEdit={() => onEditChannel && onEditChannel(2)}
          opacity={copiesOpacity}
          onOpacityChange={onCopiesOpacityChange}
        />
      </div>

    </div>
  )
}
