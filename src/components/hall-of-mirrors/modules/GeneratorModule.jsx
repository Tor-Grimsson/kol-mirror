import { useEffect, useRef, useState } from 'react'
import RotaryDial from '../RotaryDial'
import Divider from '../../atoms/Divider'
import Dropdown from '../../molecules/Dropdown'
import { GENERATOR_COMPONENTS } from '../generators'
import { GENERATOR_VARIANTS, getDefaultParams, findVariant } from '../../../data/mirrorVariants'
import { useTransportPlaying } from '../../../hooks/transport'

/**
 * GeneratorModule — the generators as a FRONT PANEL, not a row in a shelf.
 *
 * mirror had one of these until 2026-04-27, when `VisualGeneratorModule` and
 * `GeneratorTab` left with the video-modulo extraction; what replaced it was
 * generators-as-channel-sources, picked from a LOAD dropdown and controlled from
 * a PARAMS list. The user went looking for the module and did not find it
 * (2026-08-28: "I really thought we had made a new unique module with
 * generators? but you just put it into channel?").
 *
 * This is the panel back, on the user's own design from kol-monitor's
 * `GeneratorModule`: a live preview at the top, the source list as a row of flat
 * buttons rather than a dropdown, knobs at 40px in a `justify-around` row, and a
 * readout at the foot. Nothing here owns instrument state — [Load] hands the
 * built source to a channel through the same seam the palette uses, so the
 * module is a bench, not a second place for a channel to live.
 *
 * QUALITY IS THE POINT OF THE FOOT ROW (user 2026-08-28: "it needs to have
 * quality setting that direcetly relates to drop ib frames"). The knob drives
 * the generator's internal buffer edge, and the live fps sits next to it, so the
 * trade is visible while you make it rather than described in a settings page.
 */

/* The internal edge the QLTY knob sweeps. 128 is coarse-but-cheap, 1024 is what
   the hard-edged generators already use at full quality — see `size.js`, which
   caps per generator because it depends on the CONTENT, not the machine. */
const QUALITY_MIN = 128
const QUALITY_MAX = 1024
const edgeFor = (q) => Math.round(QUALITY_MIN + (QUALITY_MAX - QUALITY_MIN) * (q / 100))

const PREVIEW_H = 120

export default function GeneratorModule({ onLoadToChannel, flipped = false, back = null }) {
  const [genId, setGenId] = useState('gen-noise')
  const [params, setParams] = useState(() => getDefaultParams(findVariant('gen-noise').controls))
  const [quality, setQuality] = useState(40)
  const [enabled, setEnabled] = useState(true)
  const [preview, setPreview] = useState(true)

  const playing = useTransportPlaying()

  /* THE PANEL MEASURES ITSELF. `renderStats` was the obvious source and it is
     the wrong one: it only ticks while the frame pipeline runs, which needs a
     patched channel or a bus, so on an idle desk the number read "—" and a
     quality knob with no cost beside it is not a quality knob.
     Counting this panel's own rAF is both simpler and truer for THIS control —
     a heavier generator slows the main thread, so the rate here falls with it,
     and that is the exact trade the knob makes. 500ms windows; a ref for the
     counter so counting costs no renders and only the published number does. */
  const [fps, setFps] = useState(0)
  const frames = useRef(0)
  useEffect(() => {
    let raf, alive = true
    let since = performance.now()
    const tick = (now) => {
      if (!alive) return
      frames.current++
      if (now - since >= 500) {
        setFps((frames.current * 1000) / (now - since))
        frames.current = 0
        since = now
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => { alive = false; cancelAnimationFrame(raf) }
  }, [])

  const variant = findVariant(genId)
  const GenComponent = GENERATOR_COMPONENTS[genId.replace('gen-', '')]
  const edge = edgeFor(quality)

  /* Switching source takes that source's defaults — the old params belong to a
     different generator and would read as nonsense, the same rule the FX rack's
     type dropdown follows. */
  const pickGenerator = (id) => {
    setGenId(id)
    setParams(getDefaultParams(findVariant(id).controls))
  }
  const update = (key, val) => setParams((p) => ({ ...p, [key]: val }))

  /* The knobs the panel puts on its face. A generator declares far more than
     fits, so the front carries the SCALARS and the rest stays in the channel's
     PARAMS tab — a front panel is a selection, not an inventory. */
  const dials = (variant?.controls || [])
    .filter((c) => c.type === 'slider' && c.key !== 'speed')
    .slice(0, 3)

  const selects = (variant?.controls || []).filter((c) => c.type === 'select' || c.type === 'binary').slice(0, 1)

  return (
    <div
      className="flex flex-col shrink-0 bg-surface-secondary border border-fg-08 mirror-flip-scene"
      style={{ width: '280px', borderRadius: '4px', height: '100%' }}
    >
      <div className={`mirror-flip-inner flex flex-col ${flipped ? 'is-flipped' : ''}`} style={{ flex: 1, minHeight: 0 }}>
        <div className="mirror-flip-front flex flex-col" style={{ flex: 1, minHeight: 0 }}>
          {/* Header — the enable dot, the name, and the one action */}
          <div className="flex items-center justify-between kol-helper-12 px-3 border-b border-fg-08 shrink-0" style={{ height: '29px' }}>
            <span className="flex items-center gap-3">
              <span className="cursor-pointer select-none" onClick={() => setEnabled((v) => !v)} title={enabled ? 'Bypass' : 'Enable'}>
                <div className={`w-2 h-2 rounded-full ${enabled ? 'bg-[#e74c3c]' : 'bg-fg-24'}`} />
              </span>
              <span className={enabled ? 'text-fg-96' : 'text-fg-32'}>Generator</span>
            </span>
            <span
              className="text-fg-64 cursor-pointer select-none hover:text-accent-primary"
              onClick={() => onLoadToChannel?.(genId, { ...params, animate: true })}
              title="Load this source into a channel"
            >
              [Load]
            </span>
          </div>

          <div className="flex flex-col gap-3 p-3" style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
            {/* Preview — collapses to a sliver rather than unmounting, so the
                generator keeps its phase and does not restart on every toggle. */}
            <div
              className="relative shrink-0"
              style={{
                width: '100%',
                height: preview ? `${PREVIEW_H}px` : '6px',
                borderRadius: '3px',
                overflow: 'hidden',
                backgroundColor: 'var(--kol-surface-tertiary)',
                transition: 'height 0.15s',
                cursor: 'pointer',
              }}
              onClick={() => setPreview((v) => !v)}
              title={preview ? 'Hide preview' : 'Show preview'}
            >
              {enabled && GenComponent && (
                <GenComponent
                  width={edge}
                  height={Math.round(edge * (PREVIEW_H / 252))}
                  {...params}
                  animate={(params.animate ?? true) && playing}
                  onCanvasReady={() => {}}
                />
              )}
            </div>

            {/* Source row — flat buttons, not a dropdown: the whole point of a
                panel is that every choice is on the face. */}
            <div className="flex items-center gap-1 shrink-0">
              {GENERATOR_VARIANTS.map((g) => (
                <button
                  key={g.id}
                  className={`flex-1 py-0.5 rounded-sm cursor-pointer border ${
                    genId === g.id
                      ? 'bg-fg-96 text-surface-primary border-fg-96'
                      : 'bg-transparent text-fg-32 border-fg-08 hover:text-fg-64'
                  }`}
                  style={{ fontSize: '8px', letterSpacing: '0.04em' }}
                  onClick={() => pickGenerator(g.id)}
                  title={g.title}
                >
                  {g.title.slice(0, 4).toUpperCase()}
                </button>
              ))}
            </div>

            {selects.map((c) => (
              <Dropdown
                key={c.key}
                options={c.options}
                value={params[c.key] ?? c.default}
                onChange={(v) => update(c.key, v)}
                variant="minimal"
                size="md"
                rowHeight={24}
              />
            ))}

            <Divider />

            {/* Knobs */}
            <div className="flex items-center justify-around shrink-0">
              {dials.map((c) => (
                <RotaryDial
                  key={c.key}
                  label={c.label}
                  value={params[c.key] ?? c.default}
                  onChange={(v) => update(c.key, v)}
                  min={c.min}
                  max={c.max}
                  defaultValue={c.default}
                  size={40}
                  variant="dense"
                  panel
                />
              ))}
            </div>

            <Divider />

            {/* QUALITY — the knob and the cost it buys, side by side. */}
            <div className="flex items-center justify-around shrink-0">
              <RotaryDial
                label="QLTY"
                value={quality}
                onChange={setQuality}
                defaultValue={40}
                size={40}
                variant="dense"
                panel
              />
              <div className="flex flex-col gap-1 kol-helper-10" style={{ minWidth: 96 }}>
                <div className="flex items-center justify-between">
                  <span className="text-fg-32">Buffer</span>
                  <span className="text-fg-64" style={{ fontVariantNumeric: 'tabular-nums' }}>{edge}px</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-fg-32">Pixels</span>
                  <span className="text-fg-64" style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {((edge * Math.round(edge * (PREVIEW_H / 252))) / 1e6).toFixed(2)}M
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-fg-32">FPS</span>
                  {/* An em dash is the first window only — stats reset when a
                      consumer registers, so there is one 500ms window with no
                      average yet. It never means zero. */}
                  <span
                    className={fps ? (fps < 50 ? 'text-[#e74c3c]' : 'text-fg-96') : 'text-fg-32'}
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                    title="Live frame rate — measured while this panel is open"
                  >
                    {fps ? Math.round(fps) : '—'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        {back && <div className="mirror-flip-back flex flex-col" style={{ flex: 1, minHeight: 0 }}>{back}</div>}
      </div>
    </div>
  )
}
