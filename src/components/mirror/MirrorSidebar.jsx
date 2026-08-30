import { useRef, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Logomark } from '@kolkrabbi/kol-shell'
import logomarkUrl from '@kolkrabbi/kol-brand/svg/favicon-01.svg?url'
import { DISPLACEMENT_VARIANTS, COPIES_VARIANTS, MOVEMENT_VARIANTS, findVariant } from '../../data/mirrorVariants'
import VariantControls from './VariantControls'
import Dropdown from '../molecules/Dropdown'
import Button from '../atoms/Button'
import Slider from '../atoms/Slider'
import QuantityInput from '../atoms/QuantityInput'
import { rasterDims } from '../../utils/processImageUpload'
import { importEntry } from '../../hooks/useLibraryStore'
import ColorPicker from '../atoms/ColorPicker'
import Divider from '../atoms/Divider'
import { Icon } from '../icons'
import ThemeToggleButton from '../molecules/ThemeToggleButton'

const HALLS = [
  { id: 'displacement', label: 'Displacement' },
  { id: 'movement', label: 'Movement' },
  { id: 'copies', label: 'Copies' },
]

const MIXER = [
  { id: 'symphony', label: 'Symphony' },
]

const LIBRARY = [
  { id: 'archive', label: 'Memory' },
  { id: 'presets', label: 'Presets' },
]

const VARIANT_MAP = {
  displacement: DISPLACEMENT_VARIANTS,
  movement: MOVEMENT_VARIANTS,
  copies: COPIES_VARIANTS,
}

// Nav header row — logomark + nav icons, replacing the hidden global rail
// while the studio sidebar is open (monitor's rack header-row pattern).
function NavHeaderRow({ onHide }) {
  const navigate = useNavigate()
  return (
    <div className="flex items-center border-b border-fg-08" style={{ gap: 8, padding: '12px 16px' }}>
      <span onClick={() => navigate('/')} style={{ cursor: 'pointer', display: 'inline-flex' }} title="Home">
        <Logomark svgUrl={logomarkUrl} size={18} />
      </span>
      <Button iconOnly="nav-library" iconSize={18} variant="nav" size="sm" onClick={() => navigate('/library')} title="Library" />
      <Button iconOnly="nav-settings" iconSize={18} variant="nav" size="sm" onClick={() => navigate('/settings')} title="Settings" />
      {onHide && (
        <span style={{ marginLeft: 'auto' }}>
          <Button iconOnly="columns" iconSize={18} variant="nav" size="sm" onClick={onHide} title="Hide sidebar (H)" />
        </span>
      )}
    </div>
  )
}

export default function MirrorSidebar({ state, onClose, onHide }) {
  const fileInputRef = useRef(null)
  const [savedSlot, setSavedSlot] = useState('_none')
  const [patchName, setPatchName] = useState('')
  const navigate = useNavigate()
  const loadBtnRef = useRef(null)
  const variants = (state.activeHall && VARIANT_MAP[state.activeHall]) || []
  const activeVariantData = state.activeVariant ? findVariant(state.activeVariant) : null

  // Set slot indicator from editingSlot or reset when variant changes
  useEffect(() => {
    if (state.editingSlot !== null) {
      setSavedSlot(state.editingSlot)
    } else {
      setSavedSlot('_none')
    }
  }, [state.activeVariant, state.editingSlot])

  // Initialize params from control descriptors on first variant selection
  useEffect(() => {
    if (activeVariantData) {
      state.initVariantParams(state.activeVariant, activeVariantData.controls)
    }
  }, [state.activeVariant, activeVariantData, state.initVariantParams])

  const params = activeVariantData ? state.getVariantParams(state.activeVariant) : null

  const handleSymphonyUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    const isSvg = file.type === 'image/svg+xml'

    if (isSvg) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const svgText = event.target.result
        const blob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' })
        const svgUrl = URL.createObjectURL(blob)

        // Store original SVG
        const svgReader = new FileReader()
        svgReader.onload = (ev) => {
          state.setSymphonyCanvasImage(ev.target.result)
          state.setSymphonyCanvasIsSvg(true)
        }
        svgReader.readAsDataURL(file)

        // Rasterize for Pixi channels
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => {
          const canvas = document.createElement('canvas')
          // Raster scale is the Settings knob, not a constant — see rasterDims.
          const [rw, rh] = rasterDims(img.naturalWidth || 1024, img.naturalHeight || 1024)
          canvas.width = rw
          canvas.height = rh
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
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

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      {/* Nav header row — the global rail merges in here while the studio
          sidebar is open (monitor's rack pattern; rail is navHidden). */}
      <NavHeaderRow onHide={onHide} />

      {/* Hall picker */}
      <div className="p-4 border-b border-fg-08">
        <div className="kol-helper-12 text-fg-48 mb-3 uppercase">Mixer</div>
        <div className="flex flex-col gap-1">
          {MIXER.map(item => (
            <button
              key={item.id}
              className={`text-left px-3 rounded kol-helper-12 transition-colors flex items-center h-6 ${
                state.activeHall === item.id
                  ? 'accentYellow'
                  : 'text-fg-64 hover:text-fg-96 hover:bg-fg-04'
              }`}
              onClick={() => {
                state.selectHall(item.id)
                if (onClose) onClose()
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="kol-helper-12 text-fg-48 mb-2 mt-4 uppercase">Halls</div>
        <div className="flex flex-col gap-1">
          {HALLS.map(hall => (
            <button
              key={hall.id}
              className={`text-left px-3 rounded kol-helper-12 transition-colors flex items-center h-6 ${
                state.activeHall === hall.id
                  ? 'accentYellow'
                  : 'text-fg-64 hover:text-fg-96 hover:bg-fg-04'
              }`}
              onClick={() => {
                state.selectHall(hall.id)
                if (onClose) onClose()
              }}
            >
              {hall.label}
            </button>
          ))}
        </div>

        <div className="kol-helper-12 text-fg-48 mb-2 mt-4 uppercase">Library</div>
        <div className="flex flex-col gap-1">
          {LIBRARY.map(item => (
            <div key={item.id} className="flex items-center justify-between">
              <button
                className={`text-left px-3 rounded kol-helper-12 transition-colors flex items-center h-6 flex-1 ${
                  state.activeHall === item.id
                    ? 'accentYellow'
                    : 'text-fg-64 hover:text-fg-96 hover:bg-fg-04'
                }`}
                onClick={() => {
                  state.selectHall(item.id)
                  if (onClose) onClose()
                }}
              >
                {item.label}
              </button>
              {item.id === 'archive' && (
                <span
                  ref={loadBtnRef}
                  className="kol-helper-12 text-fg-32 hover:text-fg-96 cursor-pointer select-none px-2"
                  onClick={() => {
                    state.loadDevPresets()
                    const el = loadBtnRef.current
                    if (el) {
                      el.animate([
                        { color: 'var(--kol-accent-primary)' },
                        { color: 'color-mix(in srgb, var(--kol-surface-on-primary) 32%, transparent)' }
                      ], { duration: 2000, easing: 'ease-out' })
                    }
                  }}
                >
                  [{state.devPresetsLoaded ? 'RELOAD' : 'LOAD'}]
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Variant list — only for halls with variants */}
      {variants.length > 0 && (
        <div className="flex-1 overflow-y-auto p-4 border-b border-fg-08">
          <div className="kol-helper-12 text-fg-48 mb-3 uppercase">Variants</div>
          <div className="flex flex-col gap-1">
            {variants.map(variant => (
              <button
                key={variant.id}
                className={`text-left px-3 rounded kol-helper-12 transition-colors flex items-center h-6 ${
                  state.activeVariant === variant.id
                    ? 'accentYellow'
                    : 'text-fg-64 hover:text-fg-96 hover:bg-fg-04'
                }`}
                onClick={() => {
                  state.selectVariant(variant.id)
                  if (onClose) onClose()
                }}
              >
                {variant.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Archive info */}
      {state.activeHall === 'archive' && (
        <div className="flex-1 overflow-y-auto p-4 border-b border-fg-08">
          <div className="kol-helper-12 text-fg-48 mb-3 uppercase">About</div>
          <div className="kol-helper-12 text-fg-64 space-y-2 px-3" style={{ lineHeight: '140%' }}>
            <p>Saved experiments and compositions from the Symphony mixer.</p>
            <p>9 slots for storing your best effect combinations.</p>
          </div>
        </div>
      )}

      {/* Per-variant controls */}
      {activeVariantData && params && (
        <div className="p-4 overflow-visible">
          <VariantControls
            controls={activeVariantData.controls}
            params={params}
            onParamChange={(key, value) => state.setVariantParam(state.activeVariant, key, value)}
          />

          {/* Save to archive slot */}
          <Divider className="my-2" />
          <div className="flex items-center justify-between" style={{ height: '24px', gap: '12px' }}>
            <span className="kol-helper-12 text-fg-96 shrink-0">Save to Slot</span>
            <div className="flex items-center gap-2">
              {state.editingSlot !== null && params && (() => {
                const saved = state.archiveSlots[state.editingSlot]
                const hasChanges = saved && JSON.stringify(saved.params) !== JSON.stringify(params)
                return hasChanges ? (
                  <span
                    className="kol-helper-12 accentYellow cursor-pointer select-none"
                    onClick={() => {
                      state.saveToArchiveSlot(state.editingSlot)
                    }}
                    title="Save changes to slot"
                  >+</span>
                ) : null
              })()}
              <Dropdown
                options={[
                  { value: '_none', label: '\u2014' },
                  ...state.archiveSlots.map((slot, i) => ({
                    value: i,
                    label: `${i + 1}`,
                  })),
                ]}
                value={savedSlot}
                onChange={(v) => {
                  if (v === '_none') return
                  state.saveToArchiveSlot(v)
                  setSavedSlot(v)
                }}
                variant="minimal"
              size="md"
            />
          </div>
          </div>

          {/* Canvas ratio */}
          <div className="flex items-center justify-between" style={{ height: '24px', gap: '12px' }}>
            <span className="kol-helper-12 text-fg-96 shrink-0">Canvas</span>
            <Dropdown
              options={[
                { value: 'none', label: 'Full Bleed' },
                { value: '16:9', label: '16:9' },
                { value: '5:3', label: '5:3' },
                { value: '4:3', label: '4:3' },
                { value: '1:1', label: '1:1' },
                { value: '3:4', label: '3:4' },
                { value: '3:5', label: '3:5' },
                { value: '9:16', label: '9:16' },
                { value: 'custom', label: 'Custom' },
              ]}
              value={state.hallCanvasRatio}
              onChange={(v) => {
                if (v === 'custom' && state.hallCanvasRatio !== 'custom' && state.hallCanvasRatio !== 'none') {
                  const [rw, rh] = (state.hallCanvasRatio || '16:9').split(':').map(Number)
                  const base = Math.max(rw, rh) <= 16 ? Math.round(1024 / Math.max(rw, rh)) : 1
                  state.setHallCustomWidth(rw * base)
                  state.setHallCustomHeight(rh * base)
                }
                state.setHallCanvasRatio(v)
              }}
              variant="minimal"
              size="md"
            />
          </div>
          {state.hallCanvasRatio === 'custom' && (
            <div className="flex items-center justify-between" style={{ height: '24px', gap: '8px' }}>
              <span className="kol-helper-12 text-fg-96 shrink-0">Resolution</span>
              <div className="flex items-center gap-2">
                <QuantityInput value={state.hallCustomWidth} onChange={state.setHallCustomWidth} min={100} max={4096} />
                <span className="kol-helper-12 text-fg-48">x</span>
                <QuantityInput value={state.hallCustomHeight} onChange={state.setHallCustomHeight} min={100} max={4096} />
              </div>
            </div>
          )}

          {/* Image fit */}
          <div className="flex items-center justify-between" style={{ height: '24px', gap: '12px' }}>
            <span className="kol-helper-12 text-fg-96 shrink-0">Image Fit</span>
            <Dropdown
              options={[
                { value: 'contain', label: 'Contain' },
                { value: 'fit-width', label: 'Fit Width' },
                { value: 'fit-height', label: 'Fit Height' },
                { value: 'manual', label: 'Manual' },
              ]}
              value={state.imageFitMode}
              onChange={(v) => state.setImageFitMode(v)}
              variant="minimal"
              size="md"
            />
          </div>
          {state.imageFitMode === 'manual' && (
            <Slider
              label="Scale"
              min={10}
              max={300}
              step={1}
              value={state.imageScale}
              onChange={(v) => state.setImageScale(v)}
              variant="minimal"
              className="w-full"
            />
          )}
        </div>
      )}

      {/* Spacer to push symphony controls to bottom */}
      {state.activeHall === 'symphony' && <div className="flex-1" />}

      {/* Symphony global controls */}
      {state.activeHall === 'symphony' && (
        <div className="p-4 overflow-visible border-t border-fg-08">
          <div className="flex flex-col" style={{ gap: '4px' }}>
            {/* PATCH — the whole desk out and back. Save names it into the
                library (Library lists it, and it exports as JSON from there);
                Import reads a .json patch straight onto the desk. */}
            <div className="flex items-center gap-2" style={{ height: '24px' }}>
              <input
                value={patchName}
                onChange={(e) => setPatchName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && patchName.trim()) { state.savePatch({ name: patchName.trim() }); setPatchName('') } }}
                placeholder="Patch name"
                className="kol-helper-12 text-fg-96 bg-surface-tertiary px-2 flex-1 min-w-0"
                style={{ height: '20px', border: 'none', outline: 'none', borderRadius: '2px', fontFamily: 'var(--kol-font-family-mono)' }}
              />
              <span
                className={`kol-helper-12 select-none shrink-0 ${patchName.trim() ? 'text-fg-96 cursor-pointer hover:accentYellow' : 'text-fg-32'}`}
                onClick={() => { if (patchName.trim()) { state.savePatch({ name: patchName.trim() }); setPatchName('') } }}
              >[Save]</span>
            </div>
            <div className="flex items-center justify-between kol-helper-12" style={{ height: '24px' }}>
              <span className="text-fg-96">Patch</span>
              <span className="flex items-center gap-2">
                <span className="text-fg-64 hover:text-fg-96 cursor-pointer select-none" onClick={() => importEntry().then((e) => { if (e?.kind === 'patch') state.loadPatch(e) })}>[Import]</span>
                <span className="text-fg-64 hover:text-fg-96 cursor-pointer select-none" onClick={() => navigate('/library')}>[Library]</span>
              </span>
            </div>
            <Divider className="my-1" />
            <div
              className="flex items-center justify-between kol-helper-12 text-fg-96 cursor-pointer select-none"
              style={{ height: '24px' }}
              onClick={(e) => { if (e.altKey) { state.setSymphonyRestartKey(k => k + 1); if (!state.symphonyAnimating) state.setSymphonyAnimating(true) } else { state.setSymphonyAnimating(!state.symphonyAnimating) } }}
            >
              <span>Animate</span>
              <span>[{state.symphonyAnimating ? 'ON' : 'OFF'}]</span>
            </div>
            {/* Two arrangements of the same units — see ChannelModules. */}
            <div
              className="flex items-center justify-between kol-helper-12 text-fg-96 cursor-pointer select-none"
              style={{ height: '24px' }}
              onClick={() => state.setSymphonyDeskMode(state.symphonyDeskMode === 'modular' ? 'card' : 'modular')}
              title="Channel card, or each unit as its own desk module"
            >
              <span>Desk</span>
              <span>[{state.symphonyDeskMode === 'modular' ? 'MODULAR' : 'CARD'}]</span>
            </div>
            <div
              className="flex items-center justify-between kol-helper-12 text-fg-96 cursor-pointer select-none"
              style={{ height: '24px' }}
              onClick={() => state.symphonyLoaded && state.symphonyLoaded(null)}
            >
              <span>Loaded</span>
              <span>[Random]</span>
            </div>
            <div
              className="flex items-center justify-between kol-helper-12 text-fg-96 cursor-pointer select-none"
              style={{ height: '24px' }}
              onClick={() => state.symphonyReloaded && state.symphonyReloaded(null)}
            >
              <span>Reloaded</span>
              <span>[Random]</span>
            </div>
            <Divider className="my-2" />
            {/* Screen 2 — moved off the canvas header (user 2026-08-28). One
                dropdown does the toggle AND the channel: Off is the toggle. */}
            <div className="flex items-center justify-between" style={{ height: '24px', gap: '12px' }}>
              <span className="kol-helper-12 text-fg-96 shrink-0">Screen 2</span>
              <Dropdown
                options={[
                  { value: 'off', label: 'Off' },
                  { value: '0', label: 'Ch 1' },
                  { value: '1', label: 'Ch 2' },
                  { value: '2', label: 'Ch 3' },
                  { value: 'expr', label: 'Expr' },
                ]}
                value={state.symphonyScreen2}
                onChange={(v) => state.setSymphonyScreen2(v)}
                variant="minimal"
                size="md"
              />
            </div>
            <div className="flex items-center justify-between" style={{ height: '24px', gap: '12px' }}>
              <span className="kol-helper-12 text-fg-96 shrink-0">Canvas Ratio</span>
              <Dropdown
                options={[
                  { value: '16:9', label: '16:9' },
                  { value: '5:3', label: '5:3' },
                  { value: '4:3', label: '4:3' },
                  { value: '1:1', label: '1:1' },
                  { value: '3:4', label: '3:4' },
                  { value: '3:5', label: '3:5' },
                  { value: '9:16', label: '9:16' },
                  { value: 'custom', label: 'Custom' },
                ]}
                value={state.symphonyRatio}
                onChange={(v) => {
                  if (v === 'custom' && state.symphonyRatio !== 'custom') {
                    const [rw, rh] = (state.symphonyRatio || '16:9').split(':').map(Number)
                    const base = Math.max(rw, rh) <= 16 ? Math.round(1024 / Math.max(rw, rh)) : 1
                    state.setSymphonyCustomWidth(rw * base)
                    state.setSymphonyCustomHeight(rh * base)
                  }
                  state.setSymphonyRatio(v)
                }}
                variant="minimal"
                size="md"
              />
            </div>
            {state.symphonyRatio === 'custom' && (
              <div className="flex items-center justify-between" style={{ height: '24px', gap: '8px' }}>
                <span className="kol-helper-12 text-fg-96 shrink-0">Resolution</span>
                <div className="flex items-center gap-2">
                  <QuantityInput value={state.symphonyCustomWidth} onChange={state.setSymphonyCustomWidth} min={100} max={4096} />
                  <span className="kol-helper-12 text-fg-48">x</span>
                  <QuantityInput value={state.symphonyCustomHeight} onChange={state.setSymphonyCustomHeight} min={100} max={4096} />
                </div>
              </div>
            )}
            <div className="flex items-center justify-between" style={{ height: '24px', gap: '12px' }}>
              <span className="kol-helper-12 text-fg-96 shrink-0">Image Fit</span>
              <Dropdown
                options={[
                  { value: 'contain', label: 'Contain' },
                  { value: 'fit-width', label: 'Fit Width' },
                  { value: 'fit-height', label: 'Fit Height' },
                  { value: 'manual', label: 'Manual' },
                ]}
                value={state.imageFitMode}
                onChange={(v) => state.setImageFitMode(v)}
                variant="minimal"
                size="md"
              />
            </div>
            {state.imageFitMode === 'manual' && (
              <Slider
                label="Scale"
                min={10}
                max={300}
                step={1}
                value={state.imageScale}
                onChange={(v) => state.setImageScale(v)}
                variant="minimal"
                className="w-full"
              />
            )}
            <Divider className="my-2" />
            <div className="flex items-center justify-between kol-helper-12" style={{ height: '24px' }}>
              <span className="text-fg-96">History</span>
              <div className="flex items-center gap-2">
                <span className="text-fg-96 cursor-pointer select-none hover:text-accent-primary" onClick={() => state.symphonyUndo()}><Icon name="undo" size={14} /></span>
                <span className="text-fg-96 cursor-pointer select-none hover:text-accent-primary" onClick={() => state.symphonyRedo()}><Icon name="redo" size={14} /></span>
              </div>
            </div>
            <div
              className="flex items-center justify-between kol-helper-12 text-fg-96 cursor-pointer select-none"
              style={{ height: '24px' }}
              onClick={() => state.setSymphonyLayout(state.symphonyLayout === 'row' ? 'col' : 'row')}
            >
              <span>Mixer Layout</span>
              <span>[{state.symphonyLayout === 'row' ? 'ROW' : 'COL'}]</span>
            </div>
          </div>
        </div>
      )}


      {/* Footer — upload + theme toggle */}
      <div className="mt-auto p-4 border-t border-fg-08 flex items-center justify-between">
        <ThemeToggleButton />
        {(activeVariantData || state.activeHall === 'symphony') && (
          <>
            <Button
              variant="primary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              style={{ fontSize: '12px', height: '28px', padding: '0 16px' }}
            >
              Upload Image/SVG
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.svg"
              className="hidden"
              onChange={state.activeHall === 'symphony' ? handleSymphonyUpload : state.handleImageUpload}
            />
          </>
        )}
      </div>
    </div>
  )
}
