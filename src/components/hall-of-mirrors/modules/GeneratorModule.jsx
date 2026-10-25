import { useEffect, useRef, useState } from 'react'
import { exprBusRef } from '../../../hooks/exprBus'
import { GEN_KEY, genSlotKey, GEN_MIX_KEY } from './genKeys'
import RotaryDial from '../RotaryDial'
import Dropdown from '../../molecules/Dropdown'
import { GENERATOR_COMPONENTS } from '../generators'
import { GENERATOR_FAMILIES, familyOf, getDefaultParams, findVariant } from '../../../data/mirrorVariants'
import { useTransportPlaying } from '../../../hooks/transport'
import { DeskModule, ModuleFooter, ModuleBack, ModuleAction } from './ModuleFrame'
import { StripPort } from './JackStrip'
import { Jack } from '../ChannelPatchPanel'

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

/* THE OUT JACK (plan 11 § 3.3) replaces the header's [Load]: the source is cabled into a channel's IN like any
   other, and the cable keeps it live — `onSource` reports every change and the mixer passes it on to each channel
   this generator feeds. `out`: `{ connected, pendingOut, setPendingOut }`. */
const SLOTS = 4
const GEN_W = 488
const freshSlot = (id) => ({ genId: id, params: getDefaultParams((findVariant(id) || findVariant('gen-noise')).controls), on: true })
const dialsOf = (genId) => (findVariant(genId)?.controls || []).filter((c) => c.type === 'slider' && c.key !== 'speed').slice(0, 3)
const selectsOf = (genId) => (findVariant(genId)?.controls || []).filter((c) => c.type === 'select' || c.type === 'binary').slice(0, 1)

/**
 * GeneratorModule — FOUR GENERATORS, LAYERED (plan 16 W8, user 2026-10-25: *"can generator not also have 4 slots?
 * and more outputs on the bottom, and why are there no inputs? what if you wanted to input some function or
 * envelope to affect generation?"*). The same shape as the FX module's four slots:
 *
 *   header   power · Generator
 *   body     the stack — every slot that is on, layered (screen) — over the open slot's three dials
 *   buttons  1 · 2 · 3 · 4 — each slot on / off
 *   footer   tabs 1–4 named for their engine; the tab's family, engine and its one select
 *   jacks    MOD 1 · MOD 2 in · O1–O4 (each slot alone) · OUT (the stack, a picture)
 *   back     quality and its cost; where each MOD in is pointed (slot · dial · depth)
 *
 * O1–O4 load their slot's engine into the channel they're cabled to and keep it live (plan 11 § 3.3's cable);
 * OUT is the stack itself, registered as a frame source (`gen:mix`) a channel IN reads like a return.
 * MOD 1 / 2 take an Expression OUT (A–D, dragged in): the expression drives the chosen dial around its value.
 * No engine takes a picture in, so there is no FRAME IN — a jack is only drawn when something is wired to it.
 */
export default function GeneratorModule({ onSource, out, onSourceCanvas, initialId = 'gen-noise' }) {
  const [flipped, setFlipped] = useState(false)
  const [slots, setSlots] = useState(() => [freshSlot(initialId), null, null, null])
  const [tab, setTab] = useState(0)
  const [quality, setQuality] = useState(40)
  const [enabled, setEnabled] = useState(true)
  const [mods, setMods] = useState([{ src: null, slot: 0, key: null, depth: 50 }, { src: null, slot: 0, key: null, depth: 50 }])
  const [modOver, setModOver] = useState({})
  const playing = useTransportPlaying()
  const edge = edgeFor(quality)
  const lit = 'var(--kol-accent-primary)'

  const setSlot = (i, patch) => setSlots((s) => s.map((x, n) => (n === i ? (patch === null ? null : { ...x, ...patch }) : x)))
  const pickGenerator = (i, id) => setSlots((s) => s.map((x, n) => (n === i ? { ...freshSlot(id), on: x?.on ?? true } : x)))
  const modding = mods.some((m) => m.src && m.key)
  const paramsOf = (i) => (slots[i] ? { ...slots[i].params, ...(modding ? modOver[i] || {} : {}) } : null)

  /* each slot's cable is live: its engine and (modulated) params reach every channel its O jack feeds */
  const sourceSig = JSON.stringify(slots.map((s, i) => s && [s.genId, paramsOf(i)]))
  useEffect(() => {
    slots.forEach((s, i) => { if (s) onSource?.(genSlotKey(i), s.genId, { ...paramsOf(i), animate: true }) })
  }, [sourceSig]) // eslint-disable-line react-hooks/exhaustive-deps

  /* MOD: read the expression bus, move the target dial around its set value by ±depth of its range */
  useEffect(() => {
    if (!mods.some((m) => m.src && m.key)) return undefined
    let raf, n = 0
    const tick = () => {
      raf = requestAnimationFrame(tick)
      if (n++ % 3) return
      const next = {}
      for (const m of mods) {
        const s = slots[m.slot]
        const c = s && dialsOf(s.genId).find((d) => d.key === m.key)
        if (!m.src || !c) continue
        const lo = c.min ?? 0, hi = c.max ?? 100
        const v = (exprBusRef.current[m.src] ?? 50) / 100
        const base = s.params[m.key] ?? c.default
        const val = Math.max(lo, Math.min(hi, base + (v - 0.5) * (m.depth / 100) * (hi - lo)))
        next[m.slot] = { ...(next[m.slot] || {}), [m.key]: c.step && c.step >= 1 ? Math.round(val) : val }
      }
      setModOver(next)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [mods, slots])

  /* OUT, the stack as a picture: every frame the on slots' canvases are drawn into one, screen-blended */
  const slotCanvas = useRef([])
  const mixRef = useRef(null)
  useEffect(() => {
    const mix = mixRef.current
    if (!mix) return undefined
    onSourceCanvas?.(GEN_MIX_KEY, mix)
    let raf
    const tick = () => {
      raf = requestAnimationFrame(tick)
      const ctx = mix.getContext('2d')
      ctx.globalCompositeOperation = 'source-over'
      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, mix.width, mix.height)
      if (!enabled) return
      slots.forEach((s, i) => {
        const c = slotCanvas.current[i]
        if (!s?.on || !c || !c.width) return
        ctx.globalCompositeOperation = i === 0 ? 'source-over' : 'screen'
        try { ctx.drawImage(c, 0, 0, mix.width, mix.height) } catch { /* not ready */ }
      })
    }
    raf = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(raf); onSourceCanvas?.(GEN_MIX_KEY, null) }
  }, [slots, enabled, onSourceCanvas])

  const s = slots[tab]
  const family = s ? familyOf(s.genId) : null
  const modJack = (n) => {
    const m = mods[n]
    const set = (patch) => setMods((ms) => ms.map((x, k) => (k === n ? { ...x, ...patch } : x)))
    return (
      <StripPort key={`mod-${n}`} label={`M${n + 1}`}>
        <Jack
          jackId={`gen-mod-${n + 1}`}
          connected={!!m.src}
          onClick={() => m.src && set({ src: null })}
          onDrop={(src) => { if (src?.type === 'expr') set({ src: src.key, key: m.key ?? dialsOf(slots[m.slot]?.genId ?? 'gen-noise')[0]?.key ?? null }) }}
          title={m.src ? `MOD ${n + 1} ← ${m.src} — click to unpatch; its target is on the back` : `MOD ${n + 1} — drag an Expression OUT (A–D) here`}
        />
      </StripPort>
    )
  }
  return (
    /* 488 wide: seven ports on the jack row (MOD 1–2 · O1–O4 · OUT) — a module is as wide as its panel needs, as
       Master and Routing are */
    <DeskModule
      width={GEN_W}
      power={{ on: enabled, onToggle: () => setEnabled((v) => !v), title: enabled ? 'Bypass' : 'Enable' }}
      head={<span className="text-fg-96">Generator</span>}
      flipped={flipped}
      onFlip={() => setFlipped((v) => !v)}
      back={(
        <ModuleBack>
          <div className="flex items-center justify-between shrink-0">
            <RotaryDial label="QLTY" value={quality} onChange={setQuality} defaultValue={40} size={30} variant="dense" panel />
            <span className="text-fg-32" style={{ fontVariantNumeric: 'tabular-nums' }}>Buffer {edge}px</span>
          </div>
          {mods.map((m, n) => {
            const set = (patch) => setMods((ms) => ms.map((x, k) => (k === n ? { ...x, ...patch } : x)))
            const target = slots[m.slot]
            return (
              <div key={n} className="flex items-center justify-between gap-2">
                <span className="text-fg-64 shrink-0">M{n + 1} {m.src ? `← ${m.src}` : '—'}</span>
                <Dropdown options={slots.map((x, i) => ({ value: String(i), label: `${i + 1}` })).filter((o) => slots[+o.value])} value={String(m.slot)} onChange={(v) => set({ slot: +v, key: dialsOf(slots[+v]?.genId)[0]?.key ?? null })} variant="minimal" size="sm" />
                <Dropdown options={dialsOf(target?.genId ?? '').map((c) => ({ value: c.key, label: c.label }))} value={m.key ?? ''} onChange={(v) => set({ key: v })} variant="minimal" size="sm" />
                <RotaryDial label="DPTH" value={m.depth} onChange={(v) => set({ depth: v })} defaultValue={50} size={24} variant="dense" compact />
              </div>
            )
          })}
        </ModuleBack>
      )}
      actions={Array.from({ length: SLOTS }, (_, i) => (
        <ModuleAction key={i} tone={slots[i]?.on ? lit : undefined} dim={!slots[i]?.on} onClick={() => slots[i] && setSlot(i, { on: !slots[i].on })} title={slots[i] ? `${findVariant(slots[i].genId)?.title} — ${slots[i].on ? 'off' : 'on'}` : 'Empty slot — pick an engine on its tab'}>{i + 1}</ModuleAction>
      ))}
      footer={(
        <ModuleFooter
          width={GEN_W}
          tabs={slots.map((x, i) => ({ value: i, label: x ? `${i + 1} ${familyOf(x.genId).label}` : `${i + 1}`, dim: !x }))}
          value={tab}
          onChange={setTab}
        >
          <div className="flex items-center justify-between gap-2" style={{ height: 24 }}>
            <Dropdown
              options={[{ value: '', label: 'Empty' }, ...GENERATOR_FAMILIES.map((f) => ({ value: f.id, label: f.label }))]}
              value={family?.id ?? ''}
              onChange={(v) => { if (!v) { setSlot(tab, null); return } const f = GENERATOR_FAMILIES.find((x) => x.id === v); if (f && f.id !== family?.id) pickGenerator(tab, f.engines[0]) }}
              variant="minimal"
              size="sm"
            />
            {s && family.engines.length > 1 && (
              <Dropdown options={family.engines.map((id) => ({ value: id, label: findVariant(id)?.title || id }))} value={s.genId} onChange={(id) => pickGenerator(tab, id)} variant="minimal" size="sm" />
            )}
          </div>
          {s && selectsOf(s.genId).map((c) => (
            <Dropdown key={c.key} options={c.options} value={s.params[c.key] ?? c.default} onChange={(v) => setSlot(tab, { params: { ...s.params, [c.key]: v } })} variant="minimal" size="sm" rowHeight={24} />
          ))}
        </ModuleFooter>
      )}
      jacks={(
        <>
          {[0, 1].map(modJack)}
          {Array.from({ length: SLOTS }, (_, i) => {
            const key = genSlotKey(i)
            const slot = slots[i]
            const src = slot && { type: 'gen', key, load: () => ({ variantId: slot.genId, params: { ...paramsOf(i), animate: true } }) }
            return (
              <StripPort key={key} label={`${i + 1}`}>
                <Jack
                  jackId={`gen-${key.slice(4)}-out`}
                  connected={!!out?.connectedKey?.(key)}
                  pending={out?.pendingOut?.key === key}
                  source={src || undefined}
                  onClick={() => src && out?.setPendingOut((prev) => (prev?.key === key ? null : src))}
                  title={slot ? `Slot ${i + 1} alone — drag to a channel IN` : `Slot ${i + 1} is empty`}
                />
              </StripPort>
            )
          })}
          <StripPort label="OUT" end>
            <Jack
              jackId="gen-mix-out"
              connected={!!out?.connectedKey?.(GEN_MIX_KEY)}
              pending={out?.pendingOut?.key === GEN_MIX_KEY}
              source={{ type: 'bus', key: GEN_MIX_KEY }}
              onClick={() => out?.setPendingOut((prev) => (prev?.key === GEN_MIX_KEY ? null : { type: 'bus', key: GEN_MIX_KEY }))}
              title="OUT — the stack, drag to a channel IN"
            />
          </StripPort>
        </>
      )}
    >
      {/* the stack, live — slot 1 at the bottom, every other on slot screened over it */}
      <div className="relative shrink-0" style={{ width: '100%', height: PREVIEW_H, borderRadius: 3, overflow: 'hidden', background: '#000', opacity: enabled ? 1 : 0.4 }}>
        {slots.map((x, i) => {
          const Gen = x && GENERATOR_COMPONENTS[x.genId.replace('gen-', '')]
          if (!x || !Gen || !enabled) return null
          return (
            <div key={`${i}-${x.genId}`} className="absolute inset-0" style={{ mixBlendMode: i === 0 ? 'normal' : 'screen', display: x.on ? 'block' : 'none' }}>
              <Gen width={edge} height={Math.round(edge * (PREVIEW_H / 252))} {...paramsOf(i)} animate={(x.params.animate ?? true) && playing} onCanvasReady={(c) => { slotCanvas.current[i] = c }} />
            </div>
          )
        })}
        <canvas ref={mixRef} width={edge} height={Math.round(edge * (PREVIEW_H / 252))} style={{ display: 'none' }} />
      </div>
      {/* the open slot's dials */}
      {s && (
        <div className="flex items-center justify-around shrink-0">
          {dialsOf(s.genId).map((c) => (
            <RotaryDial key={c.key} label={c.label} value={paramsOf(tab)[c.key] ?? c.default} onChange={(v) => setSlot(tab, { params: { ...s.params, [c.key]: v } })} min={c.min} max={c.max} defaultValue={c.default} size={40} variant="dense" panel />
          ))}
        </div>
      )}
    </DeskModule>
  )
}
