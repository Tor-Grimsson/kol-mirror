import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, SettingsFooter, SettingsPanel, SettingsSections, TabsRow } from '@kolkrabbi/kol-component'
import { DISPLACEMENT_VARIANTS, COPIES_VARIANTS, MOVEMENT_VARIANTS, findVariant } from '../../data/mirrorVariants'
import VariantControls from './VariantControls'
import Stepper from '@kolkrabbi/kol-component/molecules/Stepper'
import { rasterDims } from '../../utils/processImageUpload'
import { Icon } from '../icons'
import ThemeToggle from '@kolkrabbi/kol-framework/src/ThemeToggle.jsx'

/**
 * StudioRail — H, THE PAGE ROLE (plan 17 W2, kol-component 0.302.0): `SettingsPanel variant="rail" role="page"` — the
 * settings rail's shape without its scrim, the page's own settings as typed `SettingsSections` rows, the settings rail's
 * tab row when there is more than one set — `apps/rails`' PageRail. Every row is `MirrorSidebar`'s, label for label:
 *
 *   STUDIO   the desk's settings — Patch · Animate · Desk · Loaded · Reloaded · Screen 2 · Canvas Ratio · Image Fit ·
 *            History · Mixer Layout · Upload Image/SVG · the theme
 *   HALLS    the hall and its variant, the variant's controls, Save to Slot · Canvas · Image Fit
 *
 * The sidebar's nav header row (logomark · Library · Settings · hide) is gone: the shell's nav rail stays beside the
 * studio since plan 13, so it doubled it. `MirrorSidebar` is in `_tmp/2026-10-25-plan-17/before/MirrorSidebar.jsx`.
 */
const VARIANT_MAP = { displacement: DISPLACEMENT_VARIANTS, movement: MOVEMENT_VARIANTS, copies: COPIES_VARIANTS }
const HALL_OPTIONS = [
  { value: 'symphony', label: 'Symphony' },
  { value: 'displacement', label: 'Displacement' },
  { value: 'movement', label: 'Movement' },
  { value: 'copies', label: 'Copies' },
  { value: 'archive', label: 'Memory' },
  { value: 'presets', label: 'Presets' },
]
const RATIOS = ['16:9', '5:3', '4:3', '1:1', '3:4', '3:5', '9:16'].map((r) => ({ value: r, label: r }))
const FITS = [
  { value: 'contain', label: 'Contain' },
  { value: 'fit-width', label: 'Fit Width' },
  { value: 'fit-height', label: 'Fit Height' },
  { value: 'manual', label: 'Manual' },
]
/* a ratio → its custom resolution, when the ratio turns custom (MirrorSidebar's rule) */
const customFrom = (ratio) => {
  const [rw, rh] = (ratio || '16:9').split(':').map(Number)
  const base = Math.max(rw, rh) <= 16 ? Math.round(1024 / Math.max(rw, rh)) : 1
  return [rw * base, rh * base]
}
const bracket = (label, onClick, title) => <span className="kol-mono-12 text-fg-96 hover:text-accent-primary cursor-pointer select-none" onClick={onClick} title={title}>[{label}]</span>

export default function StudioRail({ state, open, onClose }) {
  const navigate = useNavigate()
  const [tab, setTab] = useState(state.activeHall === 'symphony' ? 'studio' : 'halls')
  const fileInputRef = useRef(null)
  const [savedSlot, setSavedSlot] = useState('_none')
  const variants = (state.activeHall && VARIANT_MAP[state.activeHall]) || []
  const activeVariantData = state.activeVariant ? findVariant(state.activeVariant) : null

  /* the slot indicator follows the slot being edited (MirrorSidebar's) */
  useEffect(() => { setSavedSlot(state.editingSlot !== null ? state.editingSlot : '_none') }, [state.activeVariant, state.editingSlot]) // eslint-disable-line react-hooks/set-state-in-effect
  useEffect(() => {
    if (activeVariantData) state.initVariantParams(state.activeVariant, activeVariantData.controls)
  }, [state.activeVariant, activeVariantData, state.initVariantParams]) // eslint-disable-line react-hooks/exhaustive-deps
  const params = activeVariantData ? state.getVariantParams(state.activeVariant) : null

  /* an uploaded image or SVG becomes the desk's picture — SVGs keep the original and a raster (MirrorSidebar's) */
  const handleSymphonyUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader()
      reader.onload = (event) => {
        const svgUrl = URL.createObjectURL(new Blob([event.target.result], { type: 'image/svg+xml;charset=utf-8' }))
        const svgReader = new FileReader()
        svgReader.onload = (ev) => { state.setSymphonyCanvasImage(ev.target.result); state.setSymphonyCanvasIsSvg(true) }
        svgReader.readAsDataURL(file)
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const [rw, rh] = rasterDims(img.naturalWidth || 1024, img.naturalHeight || 1024)
          canvas.width = rw
          canvas.height = rh
          canvas.getContext('2d').drawImage(img, 0, 0, rw, rh)
          URL.revokeObjectURL(svgUrl)
          state.setSymphonyCanvasRaster(canvas.toDataURL('image/png'))
        }
        img.onerror = () => URL.revokeObjectURL(svgUrl)
        img.src = svgUrl
      }
      reader.readAsText(file)
    } else {
      const reader = new FileReader()
      reader.onload = (event) => {
        state.setSymphonyCanvasImage(event.target.result)
        state.setSymphonyCanvasRaster(event.target.result)
        state.setSymphonyCanvasIsSvg(false)
      }
      reader.readAsDataURL(file)
    }
  }
  const upload = (
    <>
      <Button size="sm" onClick={() => fileInputRef.current?.click()}>Upload Image/SVG</Button>
      <input ref={fileInputRef} type="file" accept="image/*,.svg" className="hidden" onChange={state.activeHall === 'symphony' ? handleSymphonyUpload : state.handleImageUpload} />
    </>
  )
  const resolution = (w, h, setW, setH) => (
    <div className="flex items-center gap-2">
      <Stepper value={w} onChange={(e) => { const n = Number(e.target.value); if (e.target.value !== '' && !isNaN(n)) setW(n) }} min={100} max={4096} style={{ width: 72 }} />
      <span className="kol-mono-12 text-fg-48">x</span>
      <Stepper value={h} onChange={(e) => { const n = Number(e.target.value); if (e.target.value !== '' && !isNaN(n)) setH(n) }} min={100} max={4096} style={{ width: 72 }} />
    </div>
  )
  const fitRows = [
    { label: 'Image Fit', type: 'choice', options: FITS, value: state.imageFitMode, onChange: (v) => state.setImageFitMode(v) },
    ...(state.imageFitMode === 'manual' ? [{ label: 'Scale', type: 'slider', min: 10, max: 300, step: 1, value: state.imageScale, onChange: (v) => state.setImageScale(v) }] : []),
  ]

  const studio = [
    { label: 'Patch', rows: [{ label: 'Patch', render: () => bracket('Library', () => navigate('/library')) }] },
    { label: 'Desk', rows: [
      { label: 'Animate', type: 'switch', on: !!state.symphonyAnimating, onChange: (on) => state.setSymphonyAnimating(on) },
      { label: 'Desk', type: 'choice', options: [{ value: 'card', label: 'CARD' }, { value: 'modular', label: 'MODULAR' }], value: state.symphonyDeskMode, onChange: (v) => state.setSymphonyDeskMode(v) },
      { label: 'Loaded', render: () => bracket('Random', () => state.symphonyLoaded?.(null)) },
      { label: 'Reloaded', render: () => bracket('Random', () => state.symphonyReloaded?.(null)) },
      { label: 'History', render: () => (
        <span className="flex items-center gap-2">
          <span className="text-oq-96 cursor-pointer select-none hover:text-accent-primary" onClick={() => state.symphonyUndo()} title="Undo (⌘Z)"><Icon name="undo" size={14} /></span>
          <span className="text-oq-96 cursor-pointer select-none hover:text-accent-primary" onClick={() => state.symphonyRedo()} title="Redo (⌘⇧Z)"><Icon name="redo" size={14} /></span>
        </span>
      ) },
      { label: 'Mixer Layout', type: 'choice', options: [{ value: 'row', label: 'ROW' }, { value: 'col', label: 'COL' }], value: state.symphonyLayout, onChange: (v) => state.setSymphonyLayout(v) },
    ] },
    { label: 'Canvas', rows: [
      { label: 'Screen 2', type: 'choice', options: [{ value: 'off', label: 'Off' }, { value: '0', label: 'Ch 1' }, { value: '1', label: 'Ch 2' }, { value: '2', label: 'Ch 3' }, { value: 'expr', label: 'Expr' }], value: state.symphonyScreen2, onChange: (v) => state.setSymphonyScreen2(v) },
      { label: 'Canvas Ratio', type: 'choice', options: [...RATIOS, { value: 'custom', label: 'Custom' }], value: state.symphonyRatio, onChange: (v) => {
        if (v === 'custom' && state.symphonyRatio !== 'custom') { const [w, h] = customFrom(state.symphonyRatio); state.setSymphonyCustomWidth(w); state.setSymphonyCustomHeight(h) }
        state.setSymphonyRatio(v)
      } },
      ...(state.symphonyRatio === 'custom' ? [{ label: 'Resolution', render: () => resolution(state.symphonyCustomWidth, state.symphonyCustomHeight, state.setSymphonyCustomWidth, state.setSymphonyCustomHeight) }] : []),
      ...fitRows,
    ] },
    { label: 'Source', rows: [{ label: 'Image', render: () => upload }, { label: 'Theme', render: () => <ThemeToggle label={false} /> }] },
  ]

  const halls = [
    { label: 'Hall', rows: [
      { label: 'Hall', type: 'choice', options: HALL_OPTIONS, value: state.activeHall, onChange: (v) => state.selectHall(v) },
      ...(variants.length ? [{ label: 'Variants', type: 'choice', options: variants.map((v) => ({ value: v.id, label: v.title })), value: state.activeVariant ?? '', onChange: (v) => state.selectVariant(v) }] : []),
      ...(state.activeHall === 'archive' ? [{ label: 'Memory', render: () => bracket(state.devPresetsLoaded ? 'RELOAD' : 'LOAD', () => state.loadDevPresets()) }] : []),
    ] },
    ...(state.activeHall === 'archive' ? [{ label: 'About', note: ['Saved experiments and compositions from the Symphony mixer.', '9 slots for storing your best effect combinations.'], rows: [] }] : []),
    ...(activeVariantData && params ? [
      { label: activeVariantData.title, rows: [{ label: '', align: 'fill', labelWidth: 'auto', render: () => <div className="w-full"><VariantControls controls={activeVariantData.controls} params={params} onParamChange={(key, value) => state.setVariantParam(state.activeVariant, key, value)} /></div> }] },
      { label: 'Canvas', rows: [
        { label: 'Save to Slot', type: 'choice', options: [{ value: '_none', label: '—' }, ...state.archiveSlots.map((_, i) => ({ value: i, label: `${i + 1}` }))], value: savedSlot, onChange: (v) => { if (v === '_none') return; state.saveToArchiveSlot(v); setSavedSlot(v) } },
        { label: 'Canvas', type: 'choice', options: [{ value: 'none', label: 'Full Bleed' }, ...RATIOS, { value: 'custom', label: 'Custom' }], value: state.hallCanvasRatio, onChange: (v) => {
          if (v === 'custom' && state.hallCanvasRatio !== 'custom' && state.hallCanvasRatio !== 'none') { const [w, h] = customFrom(state.hallCanvasRatio); state.setHallCustomWidth(w); state.setHallCustomHeight(h) }
          state.setHallCanvasRatio(v)
        } },
        ...(state.hallCanvasRatio === 'custom' ? [{ label: 'Resolution', render: () => resolution(state.hallCustomWidth, state.hallCustomHeight, state.setHallCustomWidth, state.setHallCustomHeight) }] : []),
        ...fitRows,
        { label: 'Image', render: () => upload },
      ] },
    ] : []),
  ]

  /* the foot's reset: the desk's canvas settings back to their defaults (16:9, contain, Screen 2 off, card, row) */
  const reset = () => {
    state.setSymphonyRatio('16:9')
    state.setImageFitMode('contain')
    state.setSymphonyScreen2('off')
    state.setSymphonyDeskMode('card')
    state.setSymphonyLayout('row')
  }

  return (
    <SettingsPanel open={open} onClose={onClose} variant="rail" role="page" title="Studio" footer={<SettingsFooter onReset={reset} />}>
      {/* the settings rail's tab row, prop for prop (`apps/rails`' PageRail) */}
      <TabsRow look="text" size={12} tracked className="flex-wrap gap-x-6 gap-y-2" tabs={[{ value: 'studio', label: 'Studio' }, { value: 'halls', label: 'Halls' }]} value={tab} onChange={setTab} ariaLabel="Studio tabs" />
      <SettingsSections divided sections={tab === 'studio' ? studio : halls} />
    </SettingsPanel>
  )
}
