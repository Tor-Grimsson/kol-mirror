import Slider from '../atoms/Slider'
import Dropdown from '../molecules/Dropdown'
import Divider from '../atoms/Divider'

export default function VariantControls({ controls, params, onParamChange }) {
  if (!controls || !params) return null

  return (
    <div className="flex flex-col" style={{ gap: '4px' }}>
      {controls.map((ctrl, idx) => {
        if (ctrl.type === 'divider') {
          return <Divider key={`divider-${idx}`} className="my-2" />
        }

        if (ctrl.type === 'toggle') {
          const isOn = params[ctrl.key] ?? ctrl.default
          return (
            <div
              key={ctrl.key}
              className="flex items-center justify-between kol-helper-xs text-fg-96 cursor-pointer select-none"
              style={{ height: '24px' }}
              onClick={() => onParamChange(ctrl.key, !isOn)}
            >
              <span>{ctrl.label}</span>
              <span>[{isOn ? 'ON' : 'OFF'}]</span>
            </div>
          )
        }

        if (ctrl.type === 'slider') {
          return (
            <Slider
              key={ctrl.key}
              label={ctrl.label}
              min={ctrl.min}
              max={ctrl.max}
              step={ctrl.step}
              value={params[ctrl.key] ?? ctrl.default}
              onChange={v => onParamChange(ctrl.key, v)}
              variant="minimal"
              className="w-full"
            />
          )
        }

        if (ctrl.type === 'binary') {
          const current = params[ctrl.key] ?? ctrl.default
          const other = ctrl.options.find(o => o.value !== current) || ctrl.options[0]
          const currentLabel = ctrl.options.find(o => o.value === current)?.label || current
          return (
            <div
              key={ctrl.key}
              className="flex items-center justify-between kol-helper-xs text-fg-96 cursor-pointer select-none"
              style={{ height: '24px' }}
              onClick={() => onParamChange(ctrl.key, other.value)}
            >
              <span>{ctrl.label}</span>
              <span>[{currentLabel}]</span>
            </div>
          )
        }

        if (ctrl.type === 'select') {
          return (
            <div key={ctrl.key} className="flex items-center justify-between" style={{ height: '24px', gap: '12px' }}>
              <span className="kol-helper-xs text-fg-96 shrink-0">{ctrl.label}</span>
              <Dropdown
                options={ctrl.options}
                value={params[ctrl.key] ?? ctrl.default}
                onChange={v => onParamChange(ctrl.key, v)}
                variant="minimal"
                size="md"
              />
            </div>
          )
        }

        return null
      })}
    </div>
  )
}
