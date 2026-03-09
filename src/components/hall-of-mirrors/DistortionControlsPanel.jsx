import Slider from '../../../design-system/components/4-input/components/Slider'

export default function DistortionControlsPanel({
  enabled = false,
  onEnabledChange,
  scale = 25,
  onScaleChange,
  baseFrequency = 0.01,
  onBaseFrequencyChange,
  numOctaves = 2,
  onNumOctavesChange
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
          label="Scale"
          min={0}
          max={100}
          value={scale}
          onChange={onScaleChange}
          className="w-full"
          variant="minimal"
        />

        <Slider
          label="Base Frequency"
          min={0.001}
          max={0.05}
          step={0.001}
          value={baseFrequency}
          onChange={onBaseFrequencyChange}
          className="w-full"
          variant="minimal"
        />

        <Slider
          label="Octaves"
          min={1}
          max={4}
          step={1}
          value={numOctaves}
          onChange={onNumOctavesChange}
          className="w-full"
          variant="minimal"
        />
      </div>

      <div className="flex justify-between kol-helper-xs pt-4 text-fg-48">
        <span>Scale: {scale}</span>
        <span>Freq: {baseFrequency.toFixed(3)}</span>
        <span>Oct: {numOctaves}</span>
      </div>
    </div>
  )
}
