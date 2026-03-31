import { useState } from 'react'
import { Icon } from '../icons'
import Slider from '../atoms/Slider'
import Divider from '../atoms/Divider'
import Dropdown from '../molecules/Dropdown'
import ColorPicker from '../atoms/ColorPicker'
import RotaryDial from './RotaryDial'
import ChannelMaster from '../mixer/ChannelMaster'
import { CHANNEL_FX_DEFS, MAX_CHANNEL_FX, getDefaultFxParams } from '../../data/mirrorVariants'

const CSS_BLEND_MODES = ['normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 'color-dodge', 'color-burn', 'hard-light', 'soft-light', 'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity']

const BLEND_OPTIONS = CSS_BLEND_MODES.map(m => ({ value: m, label: m.charAt(0).toUpperCase() + m.slice(1).replace(/-./g, s => ' ' + s[1].toUpperCase()) }))

// Read an FX param value from an FX array
function readFx(fxArr, fxId, paramKey) {
  const item = (fxArr || []).find(f => f.type === fxId)
  if (!item) {
    const def = CHANNEL_FX_DEFS.find(d => d.id === fxId)
    return def?.params[paramKey]?.default ?? 0
  }
  return item.params[paramKey] ?? 0
}

// Build updated FX array with a changed param
function writeFx(fxArr, fxId, paramKey, val) {
  const arr = fxArr || []
  const idx = arr.findIndex(f => f.type === fxId)
  if (idx >= 0) {
    const next = [...arr]
    next[idx] = { ...next[idx], params: { ...next[idx].params, [paramKey]: val } }
    return next
  }
  const defaults = getDefaultFxParams(fxId)
  return [...arr, { type: fxId, enabled: true, params: { ...defaults, [paramKey]: val } }]
}

// Build A/B knob banks for a channel strip (INT + 5 FX knobs)
// Build 6 knobs for a channel strip: INT, HUE, SAT, BRT, CTR, BLR
function buildChannelKnobs(ch, chIndex, onChannelUpdate) {
  const fxArr = ch?.fx || []
  const updateFx = (newFx) => onChannelUpdate(chIndex, { fx: newFx })
  return [
    { label: 'INT', value: ch?.intensity ?? 30, onChange: (v) => onChannelUpdate(chIndex, { intensity: v }) },
    { label: 'HUE', value: Math.round(readFx(fxArr, 'hue-rotate', 'angle') / 360 * 100), onChange: (v) => updateFx(writeFx(fxArr, 'hue-rotate', 'angle', Math.round(v / 100 * 360))) },
    { label: 'SAT', value: Math.round(readFx(fxArr, 'saturate', 'amount') / 3 * 100), onChange: (v) => updateFx(writeFx(fxArr, 'saturate', 'amount', Math.round(v / 100 * 3 * 100) / 100)) },
    { label: 'BRT', value: Math.round(readFx(fxArr, 'brightness', 'amount') / 3 * 100), onChange: (v) => updateFx(writeFx(fxArr, 'brightness', 'amount', Math.round(v / 100 * 3 * 100) / 100)) },
    { label: 'CTR', value: Math.round(readFx(fxArr, 'contrast', 'amount') / 3 * 100), onChange: (v) => updateFx(writeFx(fxArr, 'contrast', 'amount', Math.round(v / 100 * 3 * 100) / 100)) },
    { label: 'BLR', value: Math.round(readFx(fxArr, 'blur', 'amount') / 20 * 100), onChange: (v) => updateFx(writeFx(fxArr, 'blur', 'amount', Math.round(v / 100 * 20 * 10) / 10)) },
  ]
}

// Build 6 knobs for a bus or master strip (FX-only, no INT)
function buildFxKnobs(fxArr, updateFx) {
  return [
    { label: 'HUE', value: Math.round(readFx(fxArr, 'hue-rotate', 'angle') / 360 * 100), onChange: (v) => updateFx(writeFx(fxArr, 'hue-rotate', 'angle', Math.round(v / 100 * 360))) },
    { label: 'SAT', value: Math.round(readFx(fxArr, 'saturate', 'amount') / 3 * 100), onChange: (v) => updateFx(writeFx(fxArr, 'saturate', 'amount', Math.round(v / 100 * 3 * 100) / 100)) },
    { label: 'BRT', value: Math.round(readFx(fxArr, 'brightness', 'amount') / 3 * 100), onChange: (v) => updateFx(writeFx(fxArr, 'brightness', 'amount', Math.round(v / 100 * 3 * 100) / 100)) },
    { label: 'CTR', value: Math.round(readFx(fxArr, 'contrast', 'amount') / 3 * 100), onChange: (v) => updateFx(writeFx(fxArr, 'contrast', 'amount', Math.round(v / 100 * 3 * 100) / 100)) },
    { label: 'BLR', value: Math.round(readFx(fxArr, 'blur', 'amount') / 20 * 100), onChange: (v) => updateFx(writeFx(fxArr, 'blur', 'amount', Math.round(v / 100 * 20 * 10) / 10)) },
    { label: 'INV', value: Math.round(readFx(fxArr, 'invert', 'amount') * 100), onChange: (v) => updateFx(writeFx(fxArr, 'invert', 'amount', Math.round(v) / 100)) },
  ]
}


function Indicated({ active, children }) {
  return (
    <span style={{ position: 'relative', display: 'inline-flex' }}>
      <span className={`absolute w-2 h-2 rounded-full ${active ? 'bg-[#e74c3c]' : 'bg-fg-24'}`} style={{ top: '-20px', left: '6px' }} />
      {children}
    </span>
  )
}

function FxList({ fx, onFxChange }) {
  return (
    <div className="flex flex-col gap-1">
      {fx.map((fxItem, fi) => {
        const def = CHANNEL_FX_DEFS.find(d => d.id === fxItem.type)
        const paramKeys = def ? Object.keys(def.params) : []
        const primaryKey = paramKeys[0]
        const primarySpec = def?.params[primaryKey]
        return (
          <div key={fi} className="flex items-center gap-2" style={{ height: '24px' }}>
            <div
              className={`w-2 h-2 rounded-full cursor-pointer shrink-0 ${fxItem.enabled ? 'bg-[#e74c3c]' : 'bg-fg-24'}`}
              onClick={() => {
                const next = [...fx]
                next[fi] = { ...next[fi], enabled: !next[fi].enabled }
                onFxChange(next)
              }}
            />
            <span className="text-fg-64 shrink-0" style={{ width: '48px' }}>{def?.label || fxItem.type}</span>
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
    </div>
  )
}


const SEND_KEYS = ['aux1', 'aux2', 'rtn1', 'rtn2', 'fx1', 'fx2']
const SEND_LABELS = { aux1: 'AUX 1', aux2: 'AUX 2', rtn1: 'RTN 1', rtn2: 'RTN 2', fx1: 'FX 1', fx2: 'FX 2' }
const BUS_KEYS = ['aux1', 'aux2', 'fx1', 'fx2']

export default function MasterModule({ master, onMasterChange, channels = [], onChannelUpdate }) {
  const [shelfOpen, setShelfOpen] = useState(false)
  const [shelfTab, setShelfTab] = useState('files')
  const [bottomTab, setBottomTab] = useState('ch-0')

  const enabled = master.enabled ?? true
  const opacity = master.opacity ?? 100
  const masterFx = master.fx || []
  const rtn1 = master.rtn1 || { enabled: true, returnLevel: 0, fx: [], blendMode: 'normal', solo: false }
  const rtn2 = master.rtn2 || { enabled: true, returnLevel: 0, fx: [], blendMode: 'normal', solo: false }

  // --- SHELF CONTENT ---

  const renderShelf = () => {
    if (shelfTab === 'files') {
      return (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between" style={{ height: '24px' }}>
            <span className="text-fg-96">Loaded Sources</span>
          </div>
          {channels.map((ch, i) => (
            <div key={i} className="flex items-center justify-between" style={{ height: '24px' }}>
              <span className={ch.enabled ? 'text-fg-96' : 'text-fg-32'}>Ch {i + 1}</span>
              <span className="text-fg-64 truncate" style={{ maxWidth: '160px' }}>{ch.customImageName || '—'}</span>
            </div>
          ))}
          {channels.some(ch => ch.recSlots?.some(s => s)) && (
            <>
              <Divider className="my-1" />
              <div className="flex items-center justify-between" style={{ height: '24px' }}>
                <span className="text-fg-96">Recordings</span>
              </div>
              {channels.map((ch, i) => {
                const recs = (ch.recSlots || []).filter(s => s)
                if (!recs.length) return null
                return (
                  <div key={i} className="flex items-center justify-between" style={{ height: '24px' }}>
                    <span className="text-fg-32">Ch {i + 1}</span>
                    <span className="text-fg-64">{recs.length} clip{recs.length > 1 ? 's' : ''}</span>
                  </div>
                )
              })}
            </>
          )}
        </div>
      )
    }

    if (shelfTab === 'effects') {
      return (
        <div className="flex flex-col gap-3">
          {channels.map((ch, i) => (
            <div key={i} className="flex flex-col gap-1">
              <div className="flex items-center justify-between" style={{ height: '24px' }}>
                <span className={ch.enabled ? 'text-fg-96' : 'text-fg-32'}>Ch {i + 1}</span>
                <span className="text-fg-32">{(ch.fx || []).length || 'No'} FX</span>
              </div>
              <FxList fx={ch.fx || []} onFxChange={(newFx) => onChannelUpdate(i, { fx: newFx })} />
              {i < channels.length - 1 && <Divider className="mt-1" />}
            </div>
          ))}
          <Divider className="my-1" />
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between" style={{ height: '24px' }}>
              <span className="text-fg-96">Master FX</span>
            </div>
            <FxList fx={masterFx} onFxChange={(newFx) => onMasterChange({ fx: newFx })} />
          </div>
        </div>
      )
    }

    if (shelfTab === 'color') {
      return (
        <div className="flex flex-col gap-3">
          {channels.map((ch, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="flex items-center justify-between" style={{ height: '24px' }}>
                <span className={ch.enabled ? 'text-fg-96' : 'text-fg-32'}>Ch {i + 1}</span>
              </div>
              <div className="flex items-center justify-between" style={{ height: '24px' }}>
                <span className="text-fg-32">Vector</span>
                <ColorPicker color={ch.vectorColor === 'currentColor' ? '#ffffff' : ch.vectorColor} onChange={(c) => onChannelUpdate(i, { vectorColor: c })} />
              </div>
              <div className="flex items-center justify-between" style={{ height: '24px' }}>
                <span className="text-fg-32">Background</span>
                <ColorPicker color={ch.backgroundColor === 'transparent' ? '#000000' : ch.backgroundColor} onChange={(c) => onChannelUpdate(i, { backgroundColor: c })} />
              </div>
              <div className="flex items-center justify-between kol-helper-xs" style={{ height: '24px' }}>
                <span className="text-fg-32">Blend</span>
                <Dropdown
                  options={BLEND_OPTIONS}
                  value={ch.blendMode || 'normal'}
                  onChange={(v) => onChannelUpdate(i, { blendMode: v })}
                  variant="minimal"
                  size="md"
                />
              </div>
              {i < channels.length - 1 && <Divider className="mt-1" />}
            </div>
          ))}
        </div>
      )
    }

    if (shelfTab === 'master') {
      return (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between" style={{ height: '24px' }}>
            <span className="text-fg-96">Master Output</span>
          </div>
          <Slider
            label="Opacity"
            min={0} max={100} step={1}
            value={opacity}
            onChange={(v) => onMasterChange({ opacity: v })}
            formatValue={(v) => `${Math.round(v)}%`}
            variant="minimal"
          />
          <div className="flex items-center justify-between kol-helper-xs" style={{ height: '24px' }}>
            <span className="text-fg-32">Blend</span>
            <Dropdown
              options={BLEND_OPTIONS}
              value={master.blendMode || 'normal'}
              onChange={(v) => onMasterChange({ blendMode: v })}
              variant="minimal"
              size="md"
            />
          </div>
          <Divider className="my-1" />
          <div className="flex items-center justify-between" style={{ height: '24px' }}>
            <span className="text-fg-96">Master FX</span>
          </div>
          <FxList fx={masterFx} onFxChange={(newFx) => onMasterChange({ fx: newFx })} />
        </div>
      )
    }

    if (shelfTab === 'aux-fx') {
      return (
        <div className="flex flex-col gap-3">
          {[{ label: 'RTN 1', bus: rtn1, key: 'rtn1' }, { label: 'RTN 2', bus: rtn2, key: 'rtn2' }].map(({ label, bus, key }) => (
            <div key={key} className="flex flex-col gap-2">
              <div className="flex items-center justify-between" style={{ height: '24px' }}>
                <span className="text-fg-96">{label}</span>
                <span
                  className={`kol-helper-xs cursor-pointer select-none ${bus.enabled ? 'text-fg-96' : 'text-fg-32'}`}
                  onClick={() => onMasterChange({ [key]: { ...bus, enabled: !bus.enabled } })}
                >
                  {bus.enabled ? 'ON' : 'OFF'}
                </span>
              </div>
              <Slider
                label="Return"
                min={0} max={100} step={1}
                value={bus.returnLevel}
                onChange={(v) => onMasterChange({ [key]: { ...bus, returnLevel: v } })}
                formatValue={(v) => `${Math.round(v)}%`}
                variant="minimal"
              />
              <div className="flex items-center justify-between kol-helper-xs" style={{ height: '24px' }}>
                <span className="text-fg-32">Blend</span>
                <Dropdown
                  options={BLEND_OPTIONS}
                  value={bus.blendMode || 'normal'}
                  onChange={(v) => onMasterChange({ [key]: { ...bus, blendMode: v } })}
                  variant="minimal"
                  size="md"
                />
              </div>
              <div className="flex items-center justify-between" style={{ height: '24px' }}>
                <span className="text-fg-32">Solo</span>
                <span
                  className={`kol-helper-xs cursor-pointer select-none ${bus.solo ? 'text-fg-96' : 'text-fg-32'}`}
                  onClick={() => onMasterChange({ [key]: { ...bus, solo: !bus.solo } })}
                >
                  {bus.solo ? 'ON' : 'OFF'}
                </span>
              </div>
              <FxList fx={bus.fx || []} onFxChange={(newFx) => onMasterChange({ [key]: { ...bus, fx: newFx } })} />
              {key === 'rtn1' && <Divider className="my-1" />}
            </div>
          ))}
        </div>
      )
    }

    return null
  }

  // --- BOTTOM TAB CONTENT ---

  const renderBottomContent = () => {
    // All tabs show the same layout: 6 send knobs
    // Channel tabs use channel.sends, RTN/MST tabs use master bus sends (placeholder for now)
    const chMatch = bottomTab.match(/^ch-(\d+)$/)
    if (chMatch) {
      const ci = parseInt(chMatch[1])
      const ch = channels[ci]
      if (!ch) return null
      const sends = ch.sends || {}
      return (
        <div className="flex flex-row gap-4 flex-1 items-end" style={{ overflowX: 'auto', scrollbarWidth: 'none' }}>
          {SEND_KEYS.map(key => (
            <div key={key} className="flex items-center justify-center shrink-0" style={{ width: '64px' }}>
              <Indicated active={(sends[key] || 0) > 0}>
                <RotaryDial label={SEND_LABELS[key]} value={sends[key] || 0} onChange={(v) => onChannelUpdate(ci, { sends: { ...sends, [key]: v } })} size={22} compact variant="dense" />
              </Indicated>
            </div>
          ))}
        </div>
      )
    }

    // RTN and MST tabs: same 6-knob layout, reads/writes from master bus sends
    const busMap = { 'rtn-1': 'rtn1', 'rtn-2': 'rtn2', 'mst': null }
    const busKey = busMap[bottomTab]
    if (busKey !== undefined) {
      const bus = busKey ? (master[busKey] || {}) : master
      const sends = bus.sends || {}
      const updateSends = (newSends) => {
        if (busKey) onMasterChange({ [busKey]: { ...bus, sends: newSends } })
        else onMasterChange({ sends: newSends })
      }
      return (
        <div className="flex flex-row gap-4 flex-1 items-end" style={{ overflowX: 'auto', scrollbarWidth: 'none' }}>
          {SEND_KEYS.map(key => (
            <div key={key} className="flex items-center justify-center shrink-0" style={{ width: '64px' }}>
              <Indicated active={(sends[key] || 0) > 0}>
                <RotaryDial label={SEND_LABELS[key]} value={sends[key] || 0} onChange={(v) => updateSends({ ...sends, [key]: v })} size={22} compact variant="dense" />
              </Indicated>
            </div>
          ))}
        </div>
      )
    }

    return null
  }

  // --- KNOB CONFIGS ---

  const rtn1Knobs = buildFxKnobs(rtn1.fx, (newFx) => onMasterChange({ rtn1: { ...rtn1, fx: newFx } }))
  const rtn2Knobs = buildFxKnobs(rtn2.fx, (newFx) => onMasterChange({ rtn2: { ...rtn2, fx: newFx } }))
  const mstKnobs = buildFxKnobs(masterFx, (newFx) => onMasterChange({ fx: newFx }))

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
            rtn1: { ...rtn1, returnLevel: 0, fx: [], solo: false },
            rtn2: { ...rtn2, returnLevel: 0, fx: [], solo: false },
          })}>Reset</span>
        </div>

        {/* Card body */}
        <div
          className="flex flex-col items-center gap-4 p-4 bg-surface-secondary border border-fg-08 relative flex-1"
          style={{ borderRadius: '4px', overflow: 'visible', zIndex: 1, minHeight: 0 }}
        >
          <div className="w-full flex items-stretch gap-4 flex-1">
            <div className="flex flex-col flex-1 gap-2">
              <div className="flex flex-row gap-4 flex-1 w-full">
                {/* Ch 1-3: wired to actual channel state */}
                {channels.map((ch, i) => (
                    <ChannelMaster
                      key={`ch-${i}`}
                      label={`Ch ${i + 1}`}
                      knobs={buildChannelKnobs(ch, i, onChannelUpdate)}
                      faderValue={ch.opacity ?? 100}
                      onFaderChange={(v) => onChannelUpdate(i, { opacity: v })}
                      enabled={ch.enabled}
                      onEnabledChange={(v) => onChannelUpdate(i, { enabled: v })}
                      onReset={() => onChannelUpdate(i, { opacity: 100, intensity: 30, fx: [] })}
                    />
                ))}
                <Divider variant="vertical" />
                <ChannelMaster
                  label="RTN 1"
                  accent="#3b82f6"
                  knobs={rtn1Knobs}
                  faderValue={rtn1.returnLevel}
                  onFaderChange={(v) => onMasterChange({ rtn1: { ...rtn1, returnLevel: v } })}
                  enabled={rtn1.enabled}
                  onEnabledChange={(v) => onMasterChange({ rtn1: { ...rtn1, enabled: v } })}
                />
                <ChannelMaster
                  label="RTN 2"
                  accent="#3b82f6"
                  knobs={rtn2Knobs}
                  faderValue={rtn2.returnLevel}
                  onFaderChange={(v) => onMasterChange({ rtn2: { ...rtn2, returnLevel: v } })}
                  enabled={rtn2.enabled}
                  onEnabledChange={(v) => onMasterChange({ rtn2: { ...rtn2, enabled: v } })}
                />
                <Divider variant="vertical" />
                <ChannelMaster
                  label="MST"
                  accent="#2dd4bf"
                  knobs={mstKnobs}
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
                { key: 'files', icon: 'library', title: 'Files' },
                { key: 'effects', icon: 'frequency', title: 'Effects', iconSize: 18 },
                { key: 'color', icon: 'layers', title: 'Color & Blend' },
                { key: 'master', icon: 'circle', title: 'Master' },
                { key: 'aux-fx', icon: 'atomic-molecule', title: 'AUX / FX Returns' },
              ].map(btn => (
                <div
                  key={btn.key}
                  className={`cursor-pointer select-none flex items-center justify-center border transition-all ${shelfOpen && shelfTab === btn.key ? 'border-accent-primary accentYellow' : 'border-fg-16 text-fg-96 hover:border-accent-primary hover:accentYellow'}`}
                  style={{ borderRadius: '4px', width: '28px', height: '28px' }}
                  onClick={() => { if (shelfOpen && shelfTab === btn.key) { setShelfOpen(false) } else { setShelfTab(btn.key); setShelfOpen(true) } }}
                  title={btn.title}
                >
                  <Icon name={btn.icon} size={btn.iconSize || 16} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="flex flex-col mx-2 border border-fg-08 border-t-0 bg-surface-tertiary" style={{ borderRadius: '0 0 4px 4px', height: '124px', paddingTop: '4px' }}>
          <div className="flex items-center justify-between px-4 py-2 border-b border-fg-08 kol-helper-xs">
            <div className="flex items-center gap-3" style={{ overflowX: 'auto', scrollbarWidth: 'none' }}>
              {channels.map((ch, i) => (
                <span
                  key={`ch-${i}`}
                  className={`cursor-pointer select-none uppercase shrink-0 ${bottomTab === `ch-${i}` ? 'text-fg-96' : 'text-fg-32 hover:text-fg-64'}`}
                  onClick={() => setBottomTab(`ch-${i}`)}
                >
                  {`CH${i + 1}`}
                </span>
              ))}
              <span className={`cursor-pointer select-none uppercase shrink-0 ${bottomTab === 'rtn-1' ? 'text-fg-96' : 'text-fg-32 hover:text-fg-64'}`} onClick={() => setBottomTab('rtn-1')}>RTN1</span>
              <span className={`cursor-pointer select-none uppercase shrink-0 ${bottomTab === 'rtn-2' ? 'text-fg-96' : 'text-fg-32 hover:text-fg-64'}`} onClick={() => setBottomTab('rtn-2')}>RTN2</span>
              <span className={`cursor-pointer select-none uppercase shrink-0 ${bottomTab === 'mst' ? 'text-fg-96' : 'text-fg-32 hover:text-fg-64'}`} onClick={() => setBottomTab('mst')}>MST</span>
            </div>
          </div>
          <div className="flex items-stretch flex-1 gap-4 px-2 py-2">
            {renderBottomContent()}
          </div>
        </div>
      </div>

      {/* Shelf — expands to the right */}
      {shelfOpen && (
        <div
          className="flex flex-col px-4 pt-3 pb-4 border border-fg-08 kol-helper-xs relative self-stretch"
          style={{ borderRadius: '0 4px 4px 0', backgroundColor: 'var(--kol-surface-tertiary)', width: '280px', marginLeft: '-12px', paddingLeft: '28px' }}
        >
          <div className="flex items-center gap-3 pb-2 mb-2 -mx-4 px-4 border-b border-fg-08">
            {[
              { key: 'files', label: 'FILES' },
              { key: 'effects', label: 'FX' },
              { key: 'color', label: 'COLOR' },
              { key: 'master', label: 'MST' },
              { key: 'aux-fx', label: 'AUX/FX' },
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
          <div style={{ overflow: 'auto', flex: '1 1 0', minHeight: 0, scrollbarWidth: 'none' }}>
            {renderShelf()}
          </div>
        </div>
      )}
    </div>
  )
}
