import { useRef } from 'react'
import Divider from '../atoms/Divider'
import Slider from '../atoms/Slider'
import Dropdown from '../molecules/Dropdown'
import { Icon } from '../icons'
import MediaBrowser from './MediaBrowser'
import processImageUpload from '../../utils/processImageUpload'

/**
 * SourceUnit — what a channel HOLDS, and at what resolution.
 *
 * Extracted from the channel card (2026-08-27), which had grown to ~1030 lines
 * by being four devices at once. This is the first of them: uploads, the CDN
 * browser, the source preview, and the raster settings that decide how that
 * source is sampled. Nothing here processes or mixes anything.
 *
 * The LOAD tab is deliberately NOT here yet: it is being replaced wholesale
 * (one pooled picker instead of five dropdowns, one Roll instead of five
 * randomisers), so lifting it first would be work thrown away.
 *
 * The file inputs are owned here because nothing outside this unit opens them.
 */
export function SourceTab({
  customImageSrc,
  customImageName,
  vectorColor,
  vectorPadding,
  loadMode,
  onMediaChange,
  DEFAULT_SVG_SRC,
}) {
  const mediaRecolorRef = useRef(null)
  const mediaFileRef = useRef(null)
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-4 kol-helper-12" style={{ height: '24px' }}>
        <span className="text-fg-96">Recolor</span>
        <span className="text-fg-96 cursor-pointer select-none flex items-center gap-1" onClick={() => mediaRecolorRef.current?.click()}>Upload <Icon name="upload" size={16} /></span>
      </div>
      <div className="flex items-center justify-between gap-4 kol-helper-12" style={{ height: '24px' }}>
        <span className="text-fg-96">Normal</span>
        <span className="text-fg-96 cursor-pointer select-none flex items-center gap-1" onClick={() => mediaFileRef.current?.click()}>Upload <Icon name="upload" size={16} /></span>
      </div>
      <div className="flex items-center justify-between gap-4 kol-helper-12" style={{ height: '24px' }}>
        <span className="text-fg-96">Default</span>
        <span className="text-fg-96 cursor-pointer select-none flex items-center gap-1" onClick={() => onMediaChange({ customImageSrc: DEFAULT_SVG_SRC, customRasterSrc: null, customImageName: 'default-canvas.svg' })}>Load <Icon name="refresh" size={16} /></span>
      </div>
      <Divider className="pt-1 pb-2" />
      {/* The CDN as a source. An image loads as the channel's media; a
          video switches the channel to the live-input source pointed at
          that file, because a video is a frame stream, not a still. */}
      <MediaBrowser onPick={(sel) => {
        if (sel.kind === 'video') {
          onMediaChange({
            variantId: 'gen-live',
            params: { source: 'file', fileUrl: sel.src, mirrored: 0, animate: true },
            customImageName: sel.key.split('/').pop(),
          })
        } else {
          onMediaChange({ customImageSrc: sel.src, customRasterSrc: sel.src, customImageName: sel.key.split('/').pop() })
        }
      }} />
      <Divider className="pt-1 pb-2" />
      <div className="flex flex-col gap-2">
        <div className={`w-full border border-fg-08 bg-fg-04 flex items-center justify-center overflow-hidden relative${customImageSrc ? ' group cursor-pointer' : ''}`} style={{ aspectRatio: '5/3', borderRadius: '4px' }} onClick={customImageSrc ? () => onMediaChange({ customImageSrc: null, customRasterSrc: null, customImageName: null }) : undefined}>
          {customImageSrc && <img src={customImageSrc.startsWith('data:image/svg+xml') ? customImageSrc.replace(/currentColor/g, encodeURIComponent(vectorColor === 'currentColor' ? (document.documentElement.dataset.theme === 'light' ? '#000000' : '#ffffff') : vectorColor)) : customImageSrc} alt="Source" className="transition-opacity group-hover:opacity-30" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />}
          {customImageSrc && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-fg-96 kol-helper-12">[Clear]</span>
            </div>
          )}
        </div>
        <div className="flex items-center justify-end kol-helper-xs-2" style={{ fontSize: '10px' }}>
          <span className="text-fg-48 truncate">{customImageName || ''}</span>
        </div>
      </div>
      <Divider className="pt-2 pb-1" />
      <Slider
        label="Padding"
        min={-100}
        max={100}
        step={1}
        value={vectorPadding}
        onChange={(v) => onMediaChange({ vectorPadding: v })}
        formatValue={(v) => `${v > 0 ? '+' : ''}${v}%`}
        variant="minimal"
      />
      <div className="flex items-center justify-between gap-4 kol-helper-12" style={{ height: '24px' }}>
        <span className="text-fg-96">Source</span>
        <span className="text-fg-96">{customImageSrc ? 'Custom' : 'Global'}</span>
      </div>
      <div className="flex items-center justify-between gap-4 kol-helper-12" style={{ height: '24px' }}>
        <span className="text-fg-96">Mode</span>
        <Dropdown
          options={[
            { value: 'effect', label: 'Effect Only' },
            { value: 'source', label: 'Effect + Source' },
          ]}
          value={loadMode}
          onChange={(v) => onMediaChange({ loadMode: v })}
          variant="minimal"
          size="md"
        />
      </div>
      <input ref={mediaFileRef} type="file" accept="image/*,.svg" className="hidden" onChange={async (e) => { const file = e.target.files?.[0]; if (!file) return; try { const r = await processImageUpload(file); onMediaChange({ customImageSrc: r.imageSrc, customRasterSrc: r.rasterSrc, customImageName: file.name }) } catch (_) {} e.target.value = '' }} />
      <input ref={mediaRecolorRef} type="file" accept="image/svg+xml,.svg" className="hidden" onChange={async (e) => { const file = e.target.files?.[0]; if (!file) return; try { const r = await processImageUpload(file, { recolor: true }); onMediaChange({ customImageSrc: r.imageSrc, customRasterSrc: r.rasterSrc, customImageName: file.name }) } catch (_) {} e.target.value = '' }} />
    </div>
  )
}

/**
 * ResolutionUnit — how the source is rasterised and sampled for this channel:
 * quality tier, context colour, vector padding.
 */
export function ResolutionTab({
  rasterTierOverride,
  onRasterTierOverrideChange,
  rasterTheme,
  onRasterThemeChange,
  onMediaChange,
  onRecalc,
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-4 kol-helper-12" style={{ height: '24px' }}>
        <span className="text-fg-96">Tier</span>
        <Dropdown
          options={[
            { value: 'auto', label: 'Auto' },
            { value: 'low', label: 'Low (1x)' },
            { value: 'mid', label: 'Mid (6x)' },
            { value: 'high', label: 'High (12x)' },
          ]}
          value={rasterTierOverride || 'auto'}
          onChange={(v) => onRasterTierOverrideChange(v === 'auto' ? null : v)}
          variant="minimal"
          size="md"
        />
      </div>
      <div className="flex items-center justify-between gap-4 kol-helper-12" style={{ height: '24px' }}>
        <span className="text-fg-96">Raster Theme</span>
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
      <div className="flex items-center justify-between gap-4 kol-helper-12" style={{ height: '24px' }}>
        <span className="text-fg-96">Recalculate</span>
        <span
          className="text-fg-96 cursor-pointer select-none"
          onClick={(e) => {
            onRecalc && onRecalc()
            e.currentTarget.animate([
              { color: 'var(--kol-accent-primary)' },
              { color: 'var(--kol-surface-on-primary)' }
            ], { duration: 2000, easing: 'ease-out' })
          }}
        >[RECALC]</span>
      </div>
    </div>
  )
}
