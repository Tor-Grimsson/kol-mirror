import { useState, useCallback } from 'react'
import { Icon } from '../icons'
import Slider from '../atoms/Slider'
import Divider from '../atoms/Divider'
import Dropdown from '../molecules/Dropdown'
import RotaryDial from './RotaryDial'
import ChannelMaster from '../mixer/ChannelMaster'
import { CHANNEL_FX_DEFS, MAX_CHANNEL_FX, getDefaultFxParams, buildChannelFxStyle } from '../../data/mirrorVariants'

const CSS_BLEND_MODES = ['normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 'color-dodge', 'color-burn', 'hard-light', 'soft-light', 'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity']


function FxRack({ fx, onFxChange, tabs, activeTab, onTabChange, renderCost }) {
  return (
    <div className="flex flex-col mx-2 border border-fg-08 border-t-0 kol-helper-xs" style={{ borderRadius: '0 0 4px 4px', backgroundColor: 'var(--kol-surface-tertiary)', overflow: 'hidden', paddingTop: '4px' }}>
      <div className="flex items-center justify-between px-4 py-2 border-b border-fg-08">
        <div className="flex items-center gap-3">
          {tabs.map(tab => (
            <span
              key={tab.key}
              className={`cursor-pointer select-none uppercase ${activeTab === tab.key ? 'text-fg-96' : 'text-fg-32 hover:text-fg-64'}`}
              onClick={() => onTabChange(tab.key)}
            >
              {tab.label}
            </span>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-2 px-4 py-3" style={{ overflow: 'auto', flex: '1 1 0', minHeight: 0, maxHeight: '200px' }}>
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
              <span
                className="text-fg-96 cursor-pointer select-none shrink-0 inline-flex"
                onClick={() => onFxChange(fx.filter((_, i) => i !== fi))}
              >
                <Icon name="x" size={12} />
              </span>
            </div>
          )
        })}
        {fx.length < MAX_CHANNEL_FX && (
          <div
            className="kol-helper-xs text-fg-96 cursor-pointer select-none"
            style={{ height: '24px', lineHeight: '24px' }}
            onClick={() => onFxChange([...fx, { type: 'blur', enabled: true, params: getDefaultFxParams('blur') }])}
          >
            [+ Add FX]
          </div>
        )}
        {fx.length === 0 && (
          <div className="text-fg-24 text-center py-1">No FX</div>
        )}
      </div>
    </div>
  )
}

function Indicated({ active, children }) {
  return (
    <span style={{ position: 'relative', display: 'inline-flex' }}>
      <span className={`absolute w-2 h-2 rounded-full ${active ? 'bg-[#e74c3c]' : 'bg-fg-24'}`} style={{ top: '-20px', left: '-4px' }} />
      {children}
    </span>
  )
}

export default function MasterModule({ master, onMasterChange, channels = [], onChannelUpdate }) {
  const [fxOpen, setFxOpen] = useState(true)
  const [fxTab, setFxTab] = useState('output')
  const [ch1Enabled, setCh1Enabled] = useState(true)
  const [ch2Enabled, setCh2Enabled] = useState(true)
  const [ch3Enabled, setCh3Enabled] = useState(true)
  const [ch4Enabled, setCh4Enabled] = useState(true)
  const [ch5Enabled, setCh5Enabled] = useState(true)
  const [auxEnabled, setAuxEnabled] = useState(true)
  const [shelfOpen, setShelfOpen] = useState(false)
  const [shelfTab, setShelfTab] = useState('output')

  const enabled = master.enabled ?? true
  const opacity = master.opacity ?? 100
  const fx = master.fx || []
  const busA = master.busA || { enabled: true, returnLevel: 0, fx: [], blendMode: 'normal', solo: false }
  const busB = master.busB || { enabled: true, returnLevel: 0, fx: [], blendMode: 'normal', solo: false }

  const getFxValue = (fxId, paramKey) => {
    const item = fx.find(f => f.type === fxId)
    if (!item) {
      const def = CHANNEL_FX_DEFS.find(d => d.id === fxId)
      return def?.params[paramKey]?.default ?? 0
    }
    return item.params[paramKey] ?? 0
  }

  const setFxValue = (fxId, paramKey, val) => {
    const idx = fx.findIndex(f => f.type === fxId)
    if (idx >= 0) {
      const next = [...fx]
      next[idx] = { ...next[idx], params: { ...next[idx].params, [paramKey]: val } }
      onMasterChange({ fx: next })
    } else {
      const defaults = getDefaultFxParams(fxId)
      onMasterChange({ fx: [...fx, { type: fxId, enabled: true, params: { ...defaults, [paramKey]: val } }] })
    }
  }

  const activeFx = fxTab === 'output' ? fx : fxTab === 'bus-a' ? busA.fx : busB.fx
  const onActiveFxChange = (newFx) => {
    if (fxTab === 'output') onMasterChange({ fx: newFx })
    else if (fxTab === 'bus-a') onMasterChange({ busA: { ...busA, fx: newFx } })
    else onMasterChange({ busB: { ...busB, fx: newFx } })
  }

  return (
    <div className="flex flex-row items-stretch shrink-0" style={{ overflow: 'visible', maxHeight: '100%' }}>
      <div className="flex flex-col shrink-0" style={{ maxHeight: '100%' }}>
        {/* Header */}
        <div className="flex items-center justify-between kol-helper-xs mx-2 px-3 border border-fg-08 border-b-0 shrink-0 bg-surface-tertiary" style={{ borderRadius: '4px 4px 0 0', height: '29px' }}>
          <span className="flex items-center gap-3">
            <span className="cursor-pointer select-none flex items-center justify-center" style={{ width: '16px', height: '16px' }} onClick={() => onMasterChange({ enabled: !enabled })}>
              <div className="w-4 h-4 rounded-full border border-fg-48 flex items-center justify-center">
                <div className={`w-2 h-2 rounded-full transition-all ${enabled ? 'bg-[#e74c3c]' : 'bg-fg-24'}`} />
              </div>
            </span>
            <span className={`${enabled ? 'text-fg-96' : 'text-fg-32'}`}>Master Out</span>
          </span>
          <span className="text-fg-96 cursor-pointer select-none" onClick={() => onMasterChange({
            opacity: 100, blendMode: 'normal', fx: [],
            busA: { ...busA, returnLevel: 0, fx: [], solo: false },
            busB: { ...busB, returnLevel: 0, fx: [], solo: false },
          })}>Reset</span>
        </div>

        {/* Card body */}
        <div
          className="flex flex-col items-center gap-4 p-4 bg-surface-secondary border border-fg-08 relative flex-1"
          style={{ borderRadius: '4px', overflow: 'visible', zIndex: 1, minHeight: 0 }}
        >
          {/* Top row: enable + knobs + shelf buttons */}
          <div className="w-full flex items-stretch gap-4 flex-1">
            <div className="flex flex-col flex-1 gap-2">
              {/* Knob grid + test strip */}
              <div className="flex flex-row gap-4 flex-1 w-full">
                <ChannelMaster
                  label="Ch 1"
                  knobs={[
                    { label: 'HUE', value: Math.round(getFxValue('hue-rotate', 'angle') / 360 * 100), onChange: (v) => setFxValue('hue-rotate', 'angle', Math.round(v / 100 * 360)) },
                    { label: 'CTR', value: Math.round(getFxValue('contrast', 'amount') / 3 * 100), onChange: (v) => setFxValue('contrast', 'amount', Math.round(v / 100 * 3 * 100) / 100) },
                  ]}
                  faderValue={opacity}
                  onFaderChange={(v) => onMasterChange({ opacity: v })}
                  enabled={ch1Enabled}
                  onEnabledChange={setCh1Enabled}
                  onReset={() => onMasterChange({ opacity: 80, blendMode: 'normal', fx: [] })}
                />
                <ChannelMaster
                  label="Ch 2"
                  knobs={[
                    { label: 'SAT', value: Math.round(getFxValue('saturate', 'amount') / 3 * 100), onChange: (v) => setFxValue('saturate', 'amount', Math.round(v / 100 * 3 * 100) / 100) },
                    { label: 'BRT', value: Math.round(getFxValue('brightness', 'amount') / 3 * 100), onChange: (v) => setFxValue('brightness', 'amount', Math.round(v / 100 * 3 * 100) / 100) },
                  ]}
                  faderValue={busA.returnLevel}
                  onFaderChange={(v) => onMasterChange({ busA: { ...busA, returnLevel: v } })}
                  enabled={ch2Enabled}
                  onEnabledChange={setCh2Enabled}
                />
                <ChannelMaster
                  label="Ch 3"
                  knobs={[
                    { label: 'BLR', value: Math.round(getFxValue('blur', 'amount') / 20 * 100), onChange: (v) => setFxValue('blur', 'amount', Math.round(v / 100 * 20 * 10) / 10) },
                    { label: 'INV', value: Math.round(getFxValue('invert', 'amount') * 100), onChange: (v) => setFxValue('invert', 'amount', Math.round(v) / 100) },
                  ]}
                  faderValue={busB.returnLevel}
                  onFaderChange={(v) => onMasterChange({ busB: { ...busB, returnLevel: v } })}
                  enabled={ch3Enabled}
                  onEnabledChange={setCh3Enabled}
                />
                <Divider variant="vertical" />
                <ChannelMaster
                  label="RTN 1"
                  accent="#3b82f6"
                  knobs={[
                    { label: 'HUE', value: 0, onChange: () => {} },
                    { label: 'CTR', value: 0, onChange: () => {} },
                  ]}
                  faderValue={80}
                  onFaderChange={() => {}}
                  enabled={ch4Enabled}
                  onEnabledChange={setCh4Enabled}
                />
                <ChannelMaster
                  label="RTN 2"
                  accent="#3b82f6"
                  knobs={[
                    { label: 'HUE', value: 0, onChange: () => {} },
                    { label: 'CTR', value: 0, onChange: () => {} },
                  ]}
                  faderValue={80}
                  onFaderChange={() => {}}
                  enabled={ch5Enabled}
                  onEnabledChange={setCh5Enabled}
                />
                <Divider variant="vertical" />
                <ChannelMaster
                  label="MST"
                  accent="#2dd4bf"
                  knobs={[
                    { label: 'HUE', value: 0, onChange: () => {} },
                    { label: 'CTR', value: 0, onChange: () => {} },
                  ]}
                  faderValue={opacity}
                  onFaderChange={(v) => onMasterChange({ opacity: v })}
                  enabled={enabled}
                  onEnabledChange={(v) => onMasterChange({ enabled: v })}
                />
                <Divider variant="vertical" />
              </div>
            </div>
            {/* Shelf tab buttons */}
            <div className="flex flex-col gap-2">
              {[
                { key: 'output', icon: 'circle', title: 'Output' },
                { key: 'buses', icon: 'git-branch', title: 'Buses' },
              ].map(btn => (
                <div
                  key={btn.key}
                  className={`cursor-pointer select-none flex items-center justify-center border transition-all ${shelfOpen && shelfTab === btn.key ? 'border-accent-primary accentYellow' : 'border-fg-16 text-fg-96 hover:border-accent-primary hover:accentYellow'}`}
                  style={{ borderRadius: '4px', width: '28px', height: '28px' }}
                  onClick={() => { if (shelfOpen && shelfTab === btn.key) { setShelfOpen(false) } else { setShelfTab(btn.key); setShelfOpen(true) } }}
                  title={btn.title}
                >
                  <Icon name={btn.icon} size={16} />
                </div>
              ))}
            </div>
          </div>


        </div>

        {/* Bottom knob */}
        <div className="flex flex-col mx-2 border border-fg-08 border-t-0 bg-surface-tertiary" style={{ borderRadius: '0 0 4px 4px', height: '124px', paddingTop: '4px' }}>
          <div className="flex items-center justify-between px-4 py-2 border-b border-fg-08 kol-helper-xs">
            <span className="text-fg-96 uppercase">Aux Send</span>
          </div>
          <div className="flex items-end justify-between px-4 py-2 flex-1 w-full" style={{ position: 'relative', paddingRight: '52px' }}>
            <Indicated active={ch1Enabled}><RotaryDial label="1" value={0} onChange={() => {}} size={22} compact variant="dense" /></Indicated>
            <Indicated active={ch2Enabled}><RotaryDial label="2" value={0} onChange={() => {}} size={22} compact variant="dense" /></Indicated>
            <Indicated active={ch3Enabled}><RotaryDial label="3" value={0} onChange={() => {}} size={22} compact variant="dense" /></Indicated>
            <Divider variant="vertical" />
            <Indicated active={ch4Enabled}><RotaryDial label="R1" value={0} onChange={() => {}} size={22} compact variant="dense" /></Indicated>
            <Indicated active={ch5Enabled}><RotaryDial label="R2" value={0} onChange={() => {}} size={22} compact variant="dense" /></Indicated>
            <Divider variant="vertical" />
            <Indicated active={enabled}><RotaryDial label="MST" value={0} onChange={() => {}} size={22} compact variant="dense" /></Indicated>
            <Divider variant="vertical" />
          </div>
        </div>
      </div>
    </div>
  )
}
