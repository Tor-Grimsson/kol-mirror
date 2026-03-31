import Slider from '../atoms/Slider'
import Divider from '../atoms/Divider'
import Dropdown from '../molecules/Dropdown'
import RotaryDial from './RotaryDial'

export default function RoutingMatrix({ channels = [], onChannelUpdate }) {
  const count = channels.length

  return (
    <div className="flex flex-col shrink-0" style={{ width: '640px', maxHeight: '100%' }}>
      <div className="flex items-center justify-between kol-helper-xs mx-2 px-4 py-2 border border-fg-08 border-b-0 shrink-0 bg-surface-tertiary" style={{ borderRadius: '4px 4px 0 0', width: `${640 - 16}px` }}>
        <span className="text-fg-96">Routing Matrix</span>
        <span className="text-fg-96 cursor-pointer select-none" onClick={() => {
          for (let i = 0; i < count; i++) onChannelUpdate(i, { routeFrom: null, routeSendLevels: {} })
        }}>Reset</span>
      </div>

      <div
        className="flex flex-col gap-4 p-4 bg-surface-secondary border border-fg-08 flex-1"
        style={{ borderRadius: '4px', overflow: 'auto', scrollbarWidth: 'none', width: '640px', minHeight: 0 }}
      >
        {/* Signal Source */}
        <div className="kol-helper-xs text-fg-48 uppercase" style={{ height: '24px' }}>Signal Source</div>
        <div className="flex flex-row gap-4">
          {channels.map((ch, i) => (
            <div key={i} className="flex flex-col gap-2 items-center flex-1">
              <span className={`kol-helper-xs ${ch.enabled ? 'text-fg-96' : 'text-fg-32'}`} style={{ height: '24px' }}>Ch {i + 1}</span>
              <Dropdown
                options={[
                  { value: '', label: 'Own' },
                  ...channels.map((_, j) => j !== i ? { value: String(j), label: `Ch ${j + 1}` } : null).filter(Boolean),
                ]}
                value={ch.routeFrom != null ? String(ch.routeFrom) : ''}
                onChange={(v) => onChannelUpdate(i, { routeFrom: v === '' ? null : parseInt(v) })}
                variant="minimal"
                size="md"
              />
            </div>
          ))}
        </div>

        <Divider />

        {/* Send Matrix */}
        <div className="kol-helper-xs text-fg-48 uppercase" style={{ height: '24px' }}>Send Matrix</div>
        <div className="flex flex-col gap-0">
          <div className="flex items-center" style={{ height: '24px' }}>
            <div className="kol-helper-xxs text-fg-32" style={{ width: '60px' }}>From / To</div>
            {channels.map((_, j) => (
              <div key={j} className="kol-helper-xxs text-fg-48 text-center flex-1">Ch {j + 1}</div>
            ))}
          </div>
          {channels.map((ch, i) => (
            <div key={i} className="flex items-center" style={{ height: '80px' }}>
              <div className={`kol-helper-xxs ${ch.enabled ? 'text-fg-96' : 'text-fg-32'}`} style={{ width: '60px' }}>Ch {i + 1}</div>
              {channels.map((_, j) => (
                <div key={j} className="flex-1 flex flex-col items-center justify-center">
                  {i === j && <span className="kol-helper-xxs text-fg-32" style={{ height: '16px' }}>FDBK</span>}
                  <RotaryDial
                    label=""
                    value={ch.routeSendLevels?.[j] || 0}
                    onChange={(v) => onChannelUpdate(i, { routeSendLevels: { ...(ch.routeSendLevels || {}), [j]: v } })}
                    size={36}
                    compact
                  />
                </div>
              ))}
            </div>
          ))}
        </div>

        <Divider />

        {/* Channel Output */}
        <div className="kol-helper-xs text-fg-48 uppercase" style={{ height: '24px' }}>Channel Output</div>
        <div className="flex flex-row gap-4">
          {channels.map((ch, i) => (
            <div key={i} className="flex flex-col gap-2 flex-1">
              <span className={`kol-helper-xs text-center ${ch.enabled ? 'text-fg-96' : 'text-fg-32'}`} style={{ height: '24px' }}>Ch {i + 1}</span>
              <Slider
                label="Level"
                min={0}
                max={100}
                step={1}
                value={ch.opacity ?? 100}
                onChange={(v) => onChannelUpdate(i, { opacity: v })}
                formatValue={(v) => `${Math.round(v)}%`}
                variant="minimal"
              />
              <div className="flex items-center justify-between kol-helper-xxs" style={{ height: '24px' }}>
                <span className="text-fg-48">Blend</span>
                <Dropdown
                  options={[
                    { value: 'normal', label: 'Normal' },
                    { value: 'multiply', label: 'Multiply' },
                    { value: 'screen', label: 'Screen' },
                    { value: 'overlay', label: 'Overlay' },
                    { value: 'difference', label: 'Diff' },
                    { value: 'exclusion', label: 'Excl' },
                    { value: 'color-dodge', label: 'Dodge' },
                    { value: 'color-burn', label: 'Burn' },
                  ]}
                  value={ch.blendMode || 'normal'}
                  onChange={(v) => onChannelUpdate(i, { blendMode: v })}
                  variant="minimal"
                  size="md"
                />
              </div>
              <div className="flex items-center justify-between kol-helper-xxs" style={{ height: '24px' }}>
                <span className="text-fg-48">Enabled</span>
                <span
                  className={`cursor-pointer select-none ${ch.enabled ? 'text-fg-96' : 'text-fg-32'}`}
                  onClick={() => onChannelUpdate(i, { enabled: !ch.enabled })}
                >
                  {ch.enabled ? 'ON' : 'OFF'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
