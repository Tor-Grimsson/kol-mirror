import Slider from '../../../design-system/components/4-input/components/Slider'

export default function MovementControlsPanel({
  enabled = false,
  onEnabledChange,
  speed = 2.5,
  onSpeedChange,
  amount = 1.3,
  onAmountChange,
  easingStrength = 2,
  onEasingStrengthChange
}) {
  return (
    <div className="control-panel w-full bgAbsoluteBlack p-3" style={{ borderRadius: '4px' }}>
      <div className="flex flex-col gap-4">
        <div
          className="kol-helper-xs cursor-pointer select-none textAbsoluteWhite"
          onClick={() => onEnabledChange(!enabled)}
        >
          Animation [{enabled ? 'ON' : 'OFF'}]
        </div>

        <Slider
          label="Duration"
          min={0.5}
          max={5}
          step={0.1}
          value={speed}
          onChange={onSpeedChange}
          className="w-full"
          variant="minimal"
        />

        <Slider
          label="Amount"
          min={1.0}
          max={2.0}
          step={0.05}
          value={amount}
          onChange={onAmountChange}
          className="w-full"
          variant="minimal"
        />

        <Slider
          label="Cycle Strength"
          min={0.5}
          max={4}
          step={0.1}
          value={easingStrength}
          onChange={onEasingStrengthChange}
          className="w-full"
          variant="minimal"
        />
      </div>

      <div className="flex justify-between kol-helper-xs pt-4 text-fg-48">
        <span>{speed.toFixed(1)}s</span>
        <span>{amount.toFixed(2)}x</span>
        <span>{easingStrength.toFixed(1)}</span>
      </div>
    </div>
  )
}
