import { useRef, useEffect, useState } from 'react'
import { DISPLACEMENT_VARIANTS, COPIES_VARIANTS, MOVEMENT_VARIANTS, findVariant } from '../../data/mirrorVariants'
import VariantControls from './VariantControls'
import Dropdown from '../molecules/Dropdown'
import Button from '../atoms/Button'
import Slider from '../atoms/Slider'
import QuantityInput from '../atoms/QuantityInput'
import ColorPicker from '../atoms/ColorPicker'
import Divider from '../atoms/Divider'
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

export default function MirrorSidebar({ state, onClose }) {
  const fileInputRef = useRef(null)
  const [savedSlot, setSavedSlot] = useState('_none')
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
        img.onload = () => {
          const canvas = document.createElement('canvas')
          canvas.width = img.naturalWidth || 1024
          canvas.height = img.naturalHeight || 1024
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
      {/* Hall picker */}
      <div className="p-4 border-b border-fg-08">
        <div className="kol-helper-xs text-fg-48 mb-3 uppercase">Mixer</div>
        <div className="flex flex-col gap-1">
          {MIXER.map(item => (
            <button
              key={item.id}
              className={`text-left px-3 rounded kol-helper-xs transition-colors flex items-center h-6 ${
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

        <div className="kol-helper-xs text-fg-48 mb-2 mt-4 uppercase">Halls</div>
        <div className="flex flex-col gap-1">
          {HALLS.map(hall => (
            <button
              key={hall.id}
              className={`text-left px-3 rounded kol-helper-xs transition-colors flex items-center h-6 ${
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

        <div className="kol-helper-xs text-fg-48 mb-2 mt-4 uppercase">Library</div>
        <div className="flex flex-col gap-1">
          {LIBRARY.map(item => (
            <div key={item.id} className="flex items-center justify-between">
              <button
                className={`text-left px-3 rounded kol-helper-xs transition-colors flex items-center h-6 flex-1 ${
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
                  className="kol-helper-xs text-fg-32 hover:text-fg-96 cursor-pointer select-none px-2"
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
                  [{state.devPresetsLoaded ? 'reload' : 'load'}]
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Variant list — only for halls with variants */}
      {variants.length > 0 && (
        <div className="flex-1 overflow-y-auto p-4 border-b border-fg-08">
          <div className="kol-helper-xs text-fg-48 mb-3 uppercase">Variants</div>
          <div className="flex flex-col gap-1">
            {variants.map(variant => (
              <button
                key={variant.id}
                className={`text-left px-3 rounded kol-helper-xs transition-colors flex items-center h-6 ${
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
          <div className="kol-helper-xs text-fg-48 mb-3 uppercase">About</div>
          <div className="kol-helper-xs text-fg-64 space-y-2 px-3" style={{ lineHeight: '140%' }}>
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
            <span className="kol-helper-xs text-fg-96 shrink-0">Save to Slot</span>
            <div className="flex items-center gap-2">
              {state.editingSlot !== null && params && (() => {
                const saved = state.archiveSlots[state.editingSlot]
                const hasChanges = saved && JSON.stringify(saved.params) !== JSON.stringify(params)
                return hasChanges ? (
                  <span
                    className="kol-helper-xs accentYellow cursor-pointer select-none"
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
            <span className="kol-helper-xs text-fg-96 shrink-0">Canvas</span>
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
              onChange={(v) => state.setHallCanvasRatio(v)}
              variant="minimal"
              size="md"
            />
          </div>
          {state.hallCanvasRatio === 'custom' && (
            <div className="flex items-center justify-between" style={{ height: '24px', gap: '8px' }}>
              <span className="kol-helper-xs text-fg-96 shrink-0">Resolution</span>
              <div className="flex items-center gap-2">
                <QuantityInput value={state.hallCustomWidth} onChange={state.setHallCustomWidth} min={100} max={4096} />
                <span className="kol-helper-xs text-fg-48">x</span>
                <QuantityInput value={state.hallCustomHeight} onChange={state.setHallCustomHeight} min={100} max={4096} />
              </div>
            </div>
          )}

          {/* Image fit */}
          <div className="flex items-center justify-between" style={{ height: '24px', gap: '12px' }}>
            <span className="kol-helper-xs text-fg-96 shrink-0">Image Fit</span>
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

      {/* Spacer when no variant list is shown */}
      {state.activeHall === 'symphony' && <div className="flex-1" />}

      {/* Symphony controls — same position as VariantControls */}
      {state.activeHall === 'symphony' && (
        <div className="p-4 overflow-visible border-t border-fg-08">
          <div className="flex flex-col" style={{ gap: '4px' }}>
            <div className="flex items-center justify-between kol-helper-xs" style={{ height: '24px' }}>
              <span
                className="text-fg-32 hover:text-fg-96 cursor-pointer select-none"
                onClick={() => {
                  const empty = { variantId: null, params: {}, slotIndex: null, enabled: false, intensity: 100, boosted: false, speed: 100, opacity: 100, name: null }
                  state.setSymphonyChannels([{ ...empty, enabled: true }, { ...empty }, { ...empty }])
                }}
              >[RESET]</span>
              <div className="flex items-center gap-2">
                {state.symphonyChannels.map((ch, i) => (
                  <span
                    key={i}
                    className={`cursor-pointer select-none ${ch.variantId ? 'text-fg-96' : 'text-fg-32'} hover:text-fg-96`}
                    onClick={() => {
                      const empty = { variantId: null, params: {}, slotIndex: null, enabled: i === 0, intensity: 100, boosted: false, speed: 100, opacity: 100, name: null }
                      state.setSymphonyChannels(prev => {
                        const next = [...prev]
                        next[i] = empty
                        return next
                      })
                    }}
                  >[{i + 1}]</span>
                ))}
              </div>
            </div>
            <div
              className="flex items-center justify-between kol-helper-xs text-fg-96 cursor-pointer select-none"
              style={{ height: '24px' }}
              onClick={() => state.setSymphonyAnimating(!state.symphonyAnimating)}
            >
              <span>Animate</span>
              <span>[{state.symphonyAnimating ? 'ON' : 'OFF'}]</span>
            </div>
            <div className="flex items-center justify-between" style={{ height: '24px', gap: '12px' }}>
              <span className="kol-helper-xs text-fg-96 shrink-0">Load Mode</span>
              <Dropdown
                options={[
                  { value: 'effect', label: 'Effect Only' },
                  { value: 'source', label: 'Effect + Source' },
                ]}
                value={state.symphonyLoadMode}
                onChange={(v) => {
                  state.setSymphonyLoadMode(v)
                  state.setSymphonyChannels([
                    { ...state.symphonyChannels[0], variantId: null, params: {}, name: null },
                    { ...state.symphonyChannels[1], variantId: null, params: {}, name: null },
                    { ...state.symphonyChannels[2], variantId: null, params: {}, name: null },
                  ])
                }}
                variant="minimal"
                size="md"
              />
            </div>
            <Divider className="my-2" />
            <div className="flex items-center justify-between" style={{ height: '24px', gap: '12px' }}>
              <span className="kol-helper-xs text-fg-96 shrink-0">Canvas Ratio</span>
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
                onChange={(v) => state.setSymphonyRatio(v)}
                variant="minimal"
                size="md"
              />
            </div>
            {state.symphonyRatio === 'custom' && (
              <div className="flex items-center justify-between" style={{ height: '24px', gap: '8px' }}>
                <span className="kol-helper-xs text-fg-96 shrink-0">Resolution</span>
                <div className="flex items-center gap-2">
                  <QuantityInput value={state.symphonyCustomWidth} onChange={state.setSymphonyCustomWidth} min={100} max={4096} />
                  <span className="kol-helper-xs text-fg-48">x</span>
                  <QuantityInput value={state.symphonyCustomHeight} onChange={state.setSymphonyCustomHeight} min={100} max={4096} />
                </div>
              </div>
            )}

            {/* Image fit */}
            <div className="flex items-center justify-between" style={{ height: '24px', gap: '12px' }}>
              <span className="kol-helper-xs text-fg-96 shrink-0">Image Fit</span>
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

            {/* Vector + background color */}
            <Divider className="my-2" />
            <div className="flex items-center justify-between" style={{ height: '24px', gap: '12px' }}>
              <span className="kol-helper-xs text-fg-96 shrink-0">Vector Color</span>
              <ColorPicker
                color={state.canvasVectorColor}
                onChange={(c) => state.setCanvasVectorColor(c)}
              />
            </div>
            <div className="flex items-center justify-between" style={{ height: '24px', gap: '12px' }}>
              <span className="kol-helper-xs text-fg-96 shrink-0">Background</span>
              <ColorPicker
                color={state.canvasBackgroundColor}
                onChange={(c) => state.setCanvasBackgroundColor(c)}
              />
            </div>

            <Divider className="my-2" />
            <div
              className="flex items-center justify-between kol-helper-xs text-fg-96 cursor-pointer select-none"
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
