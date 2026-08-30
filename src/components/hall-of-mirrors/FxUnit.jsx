import { useRef, useState } from 'react'
import Divider from '../atoms/Divider'
import Slider from '../atoms/Slider'
import ColorPicker from '../atoms/ColorPicker'
import Dropdown from '../molecules/Dropdown'
import { Icon } from '../icons'
import TrailUnit from './TrailUnit'
import { CHANNEL_FX_DEFS, MAX_CHANNEL_FX, getDefaultFxParams } from '../../data/mirrorVariants'
import { BLEND_OPTIONS, CSS_BLEND_MODES } from './blendOptions'

/**
 * FxUnit — the channel's processing rack: COLOR · BLEND · FX · FB.
 *
 * Extracted from the channel card (2026-08-27). Note what this groups: the
 * COLOUR and BLEND tabs are effects too — they are CSS filter/blend values
 * wearing a different name — so they belong with the FX chain rather than with
 * what the channel HOLDS. FB (feedback) is here for now because it shares the
 * rack's tab bar, but it is temporal and belongs with slitscan in a trail unit;
 * that is the next cut.
 *
 * Which tab is open is local: nothing outside the rack reads it.
 */
export default function FxUnit({
  fx,
  onFxChange,
  enabled,
  renderCost,
  blendMode,
  onBlendModeChange,
  vectorColor,
  onVectorColorChange,
  backgroundColor,
  onBackgroundColorChange,
  rasterTheme,
  onRasterThemeChange,
  feedback,
  onFeedbackChange,
}) {
  const [fxTab, setFxTab] = useState('color')
  /* Live preview of a blend mode while hovering its dropdown row: the ref holds
     the channel's committed mode so leaving the list restores it. */
  const blendPreviewRef = useRef(null)

  return (
      <div
        className="flex flex-col mx-2 border border-fg-08 border-t-0 kol-helper-12"
        style={{ borderRadius: '0 0 4px 4px', backgroundColor: 'var(--kol-surface-tertiary)', height: '124px', overflow: 'hidden', width: `${320 - 16}px`, paddingTop: '4px' }}
      >
        <div className="flex items-center justify-between px-4 py-2 border-b border-fg-08 shrink-0" style={{ backgroundColor: 'var(--kol-surface-tertiary)' }}>
          <div className="flex items-center gap-3">
            {['color', 'blend', 'fx', 'fb'].map(tab => (
              <span
                key={tab}
                className={`cursor-pointer select-none uppercase ${fxTab === tab ? 'text-fg-96' : 'text-fg-32 hover:text-fg-64'}`}
                onClick={() => setFxTab(tab)}
              >
                {tab}
              </span>
            ))}
          </div>
          {enabled && <span className="kol-helper-12" style={{ color: renderCost > 80 ? '#e74c3c' : renderCost > 70 ? '#f39c12' : '#2ecc71', animation: renderCost >= 70 ? 'kol-mirror-pulse 1s ease-in-out infinite' : 'none' }}>{renderCost}%</span>}
        </div>
        <div className="flex flex-col gap-2 px-4 py-3" style={{ overflow: 'auto', flex: '1 1 0', minHeight: 0 }}>
        {fxTab === 'fx' && (
          <>
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
                    className="bg-transparent text-fg-96 border-none outline-none kol-helper-12 cursor-pointer"
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
                  {paramKeys.length > 1 && paramKeys.slice(1).map(pk => {
                    const spec = def.params[pk]
                    return (
                      <Slider
                        key={pk}
                        label=""
                        min={spec.min}
                        max={spec.max}
                        step={spec.step}
                        value={fxItem.params[pk] ?? spec.default}
                        onChange={(v) => {
                          const next = [...fx]
                          next[fi] = { ...next[fi], params: { ...next[fi].params, [pk]: v } }
                          onFxChange(next)
                        }}
                        formatValue={(v) => spec.unit ? `${Math.round(v * 100) / 100}${spec.unit}` : `${Math.round(v * 100) / 100}`}
                        className="flex-1"
                        variant="minimal"
                      />
                    )
                  })}
                  <span
                    className="text-fg-96 cursor-pointer select-none shrink-0 inline-flex"
                    onClick={() => {
                      const next = fx.filter((_, i) => i !== fi)
                      onFxChange(next)
                    }}
                  >
                    <Icon name="x" size={12} />
                  </span>
                </div>
              )
            })}
            {fx.length < MAX_CHANNEL_FX && (
              <div className="kol-helper-12 text-fg-96 cursor-pointer select-none" style={{ height: '24px', lineHeight: '24px' }} onClick={() => { onFxChange([...fx, { type: 'blur', enabled: true, params: getDefaultFxParams('blur') }]) }}>[+ Add FX]</div>
            )}
          </>
        )}
        {fxTab === 'blend' && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between" style={{ height: '24px' }}>
              <span className="text-fg-96">Mode</span>
              <Dropdown
                options={CSS_BLEND_MODES.map(m => ({ value: m, label: m.charAt(0).toUpperCase() + m.slice(1) }))}
                value={blendMode}
                onChange={(v) => { blendPreviewRef.current = null; onBlendModeChange(v) }}
                onOptionHover={(v) => {
                  if (v != null) {
                    if (!blendPreviewRef.current) blendPreviewRef.current = blendMode
                    onBlendModeChange(v)
                  } else if (blendPreviewRef.current) {
                    onBlendModeChange(blendPreviewRef.current)
                    blendPreviewRef.current = null
                  }
                }}
                variant="minimal"
                size="md"
              />
            </div>
          </div>
        )}
        {fxTab === 'color' && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4" style={{ height: '24px' }}>
              <div className="flex items-center justify-between flex-1">
                <span className="text-fg-96">Vector</span>
                <ColorPicker color={vectorColor} onChange={onVectorColorChange} />
              </div>
              <Divider variant="vertical" className="px-4" />
              <div
                className="flex items-center justify-between flex-1"
                onClick={(e) => { if (e.altKey) { e.stopPropagation(); onBackgroundColorChange(backgroundColor === 'transparent' ? '#000000' : 'transparent') } }}
              >
                <span className={`${backgroundColor === 'transparent' ? 'text-fg-32' : 'text-fg-96'} select-none`}>Background</span>
                <ColorPicker color={backgroundColor} onChange={onBackgroundColorChange} />
              </div>
            </div>
            <div className="flex items-center justify-between" style={{ height: '24px' }}>
              <span className="text-fg-96">Context Color</span>
              <Dropdown
                options={[
                  { value: 'dark', label: 'Dark' },
                  { value: 'light', label: 'Light' },
                ]}
                value={rasterTheme}
                onChange={onRasterThemeChange}
                variant="minimal"
                size="md"
              />
            </div>
          </div>
        )}
        {fxTab === 'fb' && (
          <TrailUnit feedback={feedback} onFeedbackChange={onFeedbackChange} />
        )}
        </div>
      </div>
  )
}
