import { useEffect, useState } from 'react'
import Slider from '../atoms/Slider'
import Dropdown from '../molecules/Dropdown'
import Divider from '../atoms/Divider'
import Icon from '../icons/Icon'
import ColorPicker from '../atoms/ColorPicker'
import { getActiveTab } from '../../data/mirrorVariants'

/* DEVICE — the camera list, and the only control whose options are not written
 * down anywhere: they are the machine's. A phone on Continuity Camera comes and
 * goes with the phone, and labels stay blank until camera permission is granted
 * — hence `devicechange`, which fires on the grant as well as on a plug. Until
 * then "Default" is a real choice, so the picker is never empty.
 */
function DeviceControl({ ctrl, value, onChange, rowHeight, style }) {
  const [devices, setDevices] = useState([])
  useEffect(() => {
    const md = navigator.mediaDevices
    if (!md?.enumerateDevices) return undefined
    const read = () => md.enumerateDevices()
      .then((ds) => setDevices(ds
        .filter((d) => d.kind === 'videoinput')
        .map((d, i) => ({ value: d.deviceId, label: d.label || `Camera ${i + 1}` }))))
      .catch(() => {})
    read()
    md.addEventListener?.('devicechange', read)
    return () => md.removeEventListener?.('devicechange', read)
  }, [])
  return (
    <div className="flex items-center justify-between" style={{ height: `${rowHeight}px`, gap: '12px', ...style }}>
      <span className="kol-helper-12 text-fg-96 shrink-0">{ctrl.label}</span>
      <Dropdown
        options={[{ value: '', label: 'Default' }, ...devices]}
        value={value ?? ''}
        onChange={onChange}
        variant="minimal"
        size="md"
        rowHeight={rowHeight}
      />
    </div>
  )
}

export default function VariantControls({ controls, params, onParamChange, rowHeight = 24, disabledKeys = null }) {
  if (!controls || !params) return null

  const activeTab = getActiveTab(controls, params)

  return (
    <div className="flex flex-col gap-2">
      {controls.map((ctrl, idx) => {
        if (ctrl.tab && activeTab && ctrl.tab !== activeTab) return null
        const isFrozen = disabledKeys && ctrl.key && disabledKeys.includes(ctrl.key)

        if (ctrl.type === 'divider') {
          return <Divider key={`divider-${idx}`} className="my-2" />
        }

        if (ctrl.type === 'tabs') {
          const current = params[ctrl.key] ?? ctrl.default
          return (
            <div key={ctrl.key} className="flex items-center justify-between" style={{ height: `${rowHeight}px` }}>
              {ctrl.options.map(opt => {
                const isActive = current === opt.value
                const enableDefault = ctrl.options.find(o => o.value === opt.value)?.enableDefault
                const isEnabled = opt.enableKey ? (params[opt.enableKey] ?? enableDefault ?? false) : true
                return (
                  <div key={opt.value} className="flex items-center gap-2">
                    <span
                      className={`kol-helper-12 cursor-pointer select-none ${isActive ? 'text-fg-96' : 'text-fg-32 hover:text-fg-64'}`}
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
                        className={`cursor-pointer select-none ${(params[opt.animateKey] ?? false) ? 'text-fg-96' : 'text-fg-32'}`}
                        onClick={() => onParamChange(opt.animateKey, !(params[opt.animateKey] ?? false))}
                        title={(params[opt.animateKey] ?? false) ? 'Stop' : 'Animate'}
                      >
                        <Icon name="rabbit" size={12} />
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          )
        }

        const frozenStyle = isFrozen ? { opacity: 0.3, pointerEvents: 'none' } : undefined

        if (ctrl.type === 'toggle') {
          const isOn = params[ctrl.key] ?? ctrl.default
          const hasVisibility = !!ctrl.visibilityKey
          const isVisible = hasVisibility ? (params[ctrl.visibilityKey] ?? true) : null
          return (
            <div
              key={ctrl.key}
              className="flex items-center justify-between kol-helper-12 text-fg-96 select-none"
              style={{ height: `${rowHeight}px`, ...frozenStyle }}
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
            <div key={ctrl.key} style={frozenStyle}>
              <Slider
                label={ctrl.label}
                min={ctrl.min}
                max={ctrl.max}
                step={ctrl.step}
                value={params[ctrl.key] ?? ctrl.default}
                onChange={v => onParamChange(ctrl.key, v)}
                variant="minimal"
                className="w-full"
              />
            </div>
          )
        }

        if (ctrl.type === 'binary') {
          const current = params[ctrl.key] ?? ctrl.default
          const other = ctrl.options.find(o => o.value !== current) || ctrl.options[0]
          const currentLabel = ctrl.options.find(o => o.value === current)?.label || current
          return (
            <div
              key={ctrl.key}
              className="flex items-center justify-between kol-helper-12 text-fg-96 cursor-pointer select-none"
              style={{ height: `${rowHeight}px`, ...frozenStyle }}
              onClick={() => onParamChange(ctrl.key, other.value)}
            >
              <span>{ctrl.label}</span>
              <span>[{currentLabel}]</span>
            </div>
          )
        }

        if (ctrl.type === 'color') {
          return (
            <div key={ctrl.key} className="flex items-center justify-between" style={{ height: `${rowHeight}px`, gap: '12px', ...frozenStyle }}>
              <span className="kol-helper-12 text-fg-96 shrink-0">{ctrl.label}</span>
              <ColorPicker
                color={params[ctrl.key] ?? ctrl.default}
                onChange={(c) => onParamChange(ctrl.key, c)}
                defaultValue={ctrl.default}
              />
            </div>
          )
        }

        if (ctrl.type === 'device') {
          return (
            <DeviceControl
              key={ctrl.key}
              ctrl={ctrl}
              value={params[ctrl.key]}
              onChange={(v) => onParamChange(ctrl.key, v)}
              rowHeight={rowHeight}
              style={frozenStyle}
            />
          )
        }

        if (ctrl.type === 'select') {
          return (
            <div key={ctrl.key} className="flex items-center justify-between" style={{ height: `${rowHeight}px`, gap: '12px', ...frozenStyle }}>
              <span className="kol-helper-12 text-fg-96 shrink-0">{ctrl.label}</span>
              <Dropdown
                options={ctrl.options}
                value={params[ctrl.key] ?? ctrl.default}
                onChange={v => {
                  onParamChange(ctrl.key, v)
                  if (ctrl.linkedDefaults) {
                    for (const [key, map] of Object.entries(ctrl.linkedDefaults)) {
                      onParamChange(key, map[v] ?? map['*'])
                    }
                  }
                }}
                variant="minimal"
                size="md"
                rowHeight={rowHeight}
              />
            </div>
          )
        }

        return null
      })}
    </div>
  )
}
