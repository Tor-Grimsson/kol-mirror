import Slider from '../atoms/Slider'
import Dropdown from '../molecules/Dropdown'
import Divider from '../atoms/Divider'
import Icon from '../icons/Icon'

export default function VariantControls({ controls, params, onParamChange }) {
  if (!controls || !params) return null

  return (
    <div className="flex flex-col" style={{ gap: '4px' }}>
      {controls.map((ctrl, idx) => {
        // Tab filtering — if control has a tab, only show when controlTab matches
        if (ctrl.tab && params.controlTab && ctrl.tab !== params.controlTab) return null

        if (ctrl.type === 'divider') {
          return <Divider key={`divider-${idx}`} className="my-2" />
        }

        if (ctrl.type === 'tabs') {
          const current = params[ctrl.key] ?? ctrl.default
          return (
            <div key={ctrl.key} className="flex items-center justify-between" style={{ height: '24px' }}>
              {ctrl.options.map(opt => {
                const isActive = current === opt.value
                const enableDefault = ctrl.options.find(o => o.value === opt.value)?.enableDefault
                const isEnabled = opt.enableKey ? (params[opt.enableKey] ?? enableDefault ?? false) : true
                return (
                  <div key={opt.value} className="flex items-center gap-2">
                    <span
                      className={`kol-helper-xs cursor-pointer select-none ${isActive ? 'text-fg-96' : 'text-fg-32 hover:text-fg-64'}`}
                      onClick={() => onParamChange(ctrl.key, opt.value)}
                    >
                      [{opt.label}]
                    </span>
                    {opt.enableKey && (
                      <span
                        className="cursor-pointer select-none"
                        onClick={() => onParamChange(opt.enableKey, !isEnabled)}
                        title={isEnabled ? 'Disable' : 'Enable'}
                      >
                        <svg width="10" height="10" viewBox="0 0 10 10">
                          <circle cx="5" cy="5" r="4" fill={isEnabled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1" className={isEnabled ? 'text-fg-96' : 'text-fg-32'} />
                        </svg>
                      </span>
                    )}
                    {opt.animateKey && (
                      <span
                        className="cursor-pointer select-none"
                        onClick={() => onParamChange(opt.animateKey, !(params[opt.animateKey] ?? false))}
                        title={(params[opt.animateKey] ?? false) ? 'Stop' : 'Animate'}
                      >
                        <svg width="10" height="10" viewBox="0 0 10 10" className={(params[opt.animateKey] ?? false) ? 'text-fg-96' : 'text-fg-32'}>
                          <path d="M1 5 Q3 0 5 5 Q7 10 9 5" fill={(params[opt.animateKey] ?? false) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1" />
                        </svg>
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          )
        }

        if (ctrl.type === 'toggle') {
          const isOn = params[ctrl.key] ?? ctrl.default
          const hasVisibility = !!ctrl.visibilityKey
          const isVisible = hasVisibility ? (params[ctrl.visibilityKey] ?? true) : null
          return (
            <div
              key={ctrl.key}
              className="flex items-center justify-between kol-helper-xs text-fg-96 select-none"
              style={{ height: '24px' }}
            >
              <div className="flex items-center gap-2">
                <span className="cursor-pointer" onClick={() => onParamChange(ctrl.key, !isOn)}>{ctrl.label}</span>
                {hasVisibility && (
                  <span
                    className={`cursor-pointer ${isVisible ? 'text-fg-96' : 'text-fg-32'}`}
                    onClick={() => onParamChange(ctrl.visibilityKey, !isVisible)}
                  >
                    <Icon name={isVisible ? 'eye-on' : 'eye-off'} size={12} />
                  </span>
                )}
              </div>
              <span className="cursor-pointer" onClick={() => onParamChange(ctrl.key, !isOn)}>[{isOn ? 'ON' : 'OFF'}]</span>
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
