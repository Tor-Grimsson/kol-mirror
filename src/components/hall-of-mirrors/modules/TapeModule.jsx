import { useState } from 'react'
import { Icon } from '../../icons/index.js'
import { CANVAS_FX_DEFS, TAPE_HEADS } from '../../../hooks/useCanvasFx.js'
import { transport, useTransportPlaying } from '../../../hooks/transport'
import TapeDelay from '../../mirror/TapeDelay'
import Modulatable from '@kolkrabbi/kol-hardware/value/Modulatable.jsx'
import Knob from '@kolkrabbi/kol-component/molecules/Knob'
import { exprBusRef } from '../../../hooks/exprBus'
import { Jack } from '../ChannelPatchPanel'
import { DeskModule, ModuleFooter, ModuleAction, ModuleBack } from './ModuleFrame'
import { StripPort } from './JackStrip'

const SPEC = CANVAS_FX_DEFS.find((d) => d.id === 'tape').params
/* 416 wide: six ports on the jack row (IN · H1–H4 · OUT) at the strip's own spacing */
const W = 416
const DECK_W = W - 32
const MODES = ['PLAY', 'INF', 'REV', 'SKIP', 'PAUSE']
const PALETTES = ['NONE', '70S', 'NEON', 'MONO']
/* at most four dials a tab — the footer's width, as Transport's IN · OUT · SWING · EASE */
const TABS = [{ value: 'delay', label: 'Delay' }, { value: 'mix', label: 'Mix' }, { value: 'heads', label: 'Heads' }, { value: 'wear', label: 'Wear' }, { value: 'wow', label: 'Wow' }]
const TAB_KEYS = { delay: ['time', 'speed', 'repeats'], mix: ['dry', 'wet', 'rec'], wear: ['age', 'crinkle', 'clr'], wow: ['wow', 'spring'] }

/**
 * TapeModule — Tape on kol-monitor's Magneto (plan 16 W4, user 2026-10-25: *"I told you to reference magneto … the
 * module would have MORE PARAMETRIC CONTROL"*). The engine is `fxTape` (four heads, wear); this is its front, on the
 * standard's bands:
 *
 *   header   power (bypass) · Tape · remove
 *   body     the reels, and under them Magneto's playback row — four heads, a level knob and an on key each
 *   buttons  REW · FF · PLAY · STOP · REC — PLAY / STOP are the transport's; REW · FF · REC dim, nothing wired
 *   footer   DELAY: time · speed · repeats   MIX: dry · wet · rec   HEADS: each head's mode, the palette
 *            WEAR: age · crinkle · clr   WOW: wow · spring — four dials a tab at most, Transport's width
 *   jacks    IN · H1–H4 (each head alone) · OUT
 *   back     what each control does, Magneto's names
 *
 * Every dial takes an expression (right-click → A–D) — mirror's stand-in for Magneto's CV ins.
 *
 * @param {Object}   module   `{ id, type: 'tape', params, enabled, input }`
 * @param {Function} onParams (patch) => void
 */
export default function TapeModule({ module: m, onParams, onToggle, onRemove, jacks }) {
  const [tab, setTab] = useState('delay')
  const [flipped, setFlipped] = useState(false)
  const playing = useTransportPlaying()
  const p = (k) => m.params?.[k] ?? SPEC[k].default
  const set = (k) => (v) => onParams?.({ [k]: v })
  const lit = 'var(--kol-accent-primary)'
  const dial = (k, label = k.toUpperCase()) => (
    <Modulatable key={k} label={label} value={p(k)} onChange={set(k)} min={SPEC[k].min} max={SPEC[k].max} bus={exprBusRef} clock={transport} density="dense">
      <Knob variant="panel" size="lg" defaultValue={SPEC[k].default} />
    </Modulatable>
  )
  const headOut = (k) => `fxm:${m.id}:h${k}`
  return (
    <DeskModule
      width={W}
      power={{ on: !!m.enabled, onToggle, title: m.enabled ? 'Bypass the tape' : 'Run the tape' }}
      head={<span className="text-fg-96">Tape</span>}
      headRight={onRemove && (
        <span className="cursor-pointer text-oq-32 hover:text-oq-96 flex" onClick={onRemove} title="Remove">
          <Icon name="x" size={12} />
        </span>
      )}
      flipped={flipped}
      onFlip={() => setFlipped((v) => !v)}
      back={(
        <ModuleBack>
          <span className="text-fg-32">MAGNETO'S CONTROLS, ON FRAMES</span>
          <span className="text-fg-64">Heads read the tape at ¼ · ½ · ¾ · all of TIME. INF holds a head's frame, REV runs it back, SKIP reads twice as far, PAUSE silences it.</span>
          <span className="text-fg-64">REC: input onto the tape. REPEATS: the heads back onto it. AGE greys the repeats, CRINKLE tears rows, WOW drifts the time, SPRING wobbles, CLR cuts the lows.</span>
          <span className="text-fg-32">Right-click any dial → A–D to drive it with an expression.</span>
        </ModuleBack>
      )}
      actions={(
        <>
          <ModuleAction dim>REW</ModuleAction>
          <ModuleAction dim>FF</ModuleAction>
          <ModuleAction tone={playing ? lit : undefined} onClick={() => transport.play()} title="Play (Space)">PLAY</ModuleAction>
          <ModuleAction onClick={() => transport.stop()} title="Stop — back to 0">STOP</ModuleAction>
          <ModuleAction dim>REC</ModuleAction>
        </>
      )}
      footer={(
        <ModuleFooter width={W} tabs={TABS} value={tab} onChange={setTab} readout={<span className="text-fg-32">{p('time')} fr</span>}>
          {tab === 'heads' ? (
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between" style={{ height: 24 }}>
                {Array.from({ length: TAPE_HEADS }, (_, i) => {
                  const k = `m${i + 1}`
                  const mode = p(k)
                  return (
                    <span key={k} className="flex items-center gap-1">
                      <span className="text-fg-32">H{i + 1}</span>
                      <ModuleAction tone={mode ? lit : undefined} onClick={() => onParams?.({ [k]: (mode + 1) % MODES.length })} title="Play · inf · rev · skip · pause">{MODES[mode]}</ModuleAction>
                    </span>
                  )
                })}
              </div>
              <div className="flex items-center justify-between" style={{ height: 24 }}>
                <span className="text-fg-32">PALETTE</span>
                {PALETTES.map((name, i) => (
                  <ModuleAction key={name} tone={p('palette') === i ? lit : undefined} dim={p('palette') !== i} onClick={() => onParams?.({ palette: i })}>{name}</ModuleAction>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-start justify-around">
              {TAB_KEYS[tab].map((k) => dial(k))}
            </div>
          )}
        </ModuleFooter>
      )}
      jacks={jacks && (
        <>
          <StripPort label="IN">
            <Jack
              jackId={`fxm-${jacks.id}-in`}
              connected={jacks.input != null}
              color={jacks.inputColor}
              pending={!!jacks.pendingOut && jacks.input == null}
              onClick={() => {
                if (jacks.input != null) { jacks.onInput(null); return }
                if (!jacks.pendingOut) return
                jacks.onInput(jacks.pendingOut)
                jacks.setPendingOut(null)
              }}
              onDrop={jacks.onInput}
              title={jacks.input != null ? `Patched from ${jacks.inputLabel} — click to unpatch` : 'IN — drop an OUT jack here'}
            />
          </StripPort>
          {Array.from({ length: TAPE_HEADS }, (_, i) => {
            const key = headOut(i + 1)
            const src = { type: 'fxm', id: `${jacks.id}:h${i + 1}`, key }
            return (
              <StripPort key={key} label={`${i + 1}`}>
                <Jack
                  jackId={`fxm-${jacks.id}:h${i + 1}-out`}
                  connected={jacks.isHeadSource?.(key)}
                  pending={jacks.pendingOut?.key === key}
                  source={src}
                  onClick={() => jacks.setPendingOut((prev) => (prev?.key === key ? null : src))}
                  title={`Head ${i + 1} alone — drag to an IN`}
                />
              </StripPort>
            )
          })}
          <StripPort label="OUT" end>
            <Jack
              jackId={`fxm-${jacks.id}-out`}
              connected={jacks.isSource}
              pending={jacks.pendingOut?.type === 'fxm' && jacks.pendingOut.id === jacks.id}
              source={{ type: 'fxm', id: jacks.id, key: `fxm:${jacks.id}` }}
              onClick={() => jacks.setPendingOut((prev) => (prev?.type === 'fxm' && prev.id === jacks.id) ? null : { type: 'fxm', id: jacks.id, key: `fxm:${jacks.id}` })}
              title="OUT — the mix, drag to an IN jack"
            />
          </StripPort>
        </>
      )}
    >
      <div className="flex flex-col gap-2 h-full" style={{ opacity: m.enabled ? 1 : 0.4, minHeight: 0 }}>
        {/* the 560 × 300 deck at the body's width; it turns with the transport */}
        <div style={{ height: 300 * (DECK_W / 560), width: DECK_W, overflow: 'hidden', flex: 'none' }}>
          <div style={{ width: 560, transform: `scale(${DECK_W / 560})`, transformOrigin: '0 0' }}>
            <TapeDelay lip={false} time={Math.round((p('speed') / 200) * 100)} onTime={() => {}} />
          </div>
        </div>
        {/* Magneto's playback row: four heads, a level and an on key each (on = PLAY, off = PAUSE) */}
        <div className="flex items-start justify-between">
          {Array.from({ length: TAPE_HEADS }, (_, i) => {
            const n = i + 1
            const on = p(`m${n}`) !== 4
            return (
              <div key={n} className="flex flex-col items-center gap-1">
                <Modulatable label={`H${n}`} value={p(`h${n}`)} onChange={set(`h${n}`)} min={0} max={100} bus={exprBusRef} clock={transport} density="dense">
                  <Knob variant="panel" size="lg" defaultValue={SPEC[`h${n}`].default} />
                </Modulatable>
                <ModuleAction tone={on ? lit : undefined} dim={!on} onClick={() => onParams?.({ [`m${n}`]: on ? 4 : 0 })} title={on ? `Silence head ${n}` : `Play head ${n}`}>{on ? 'ON' : 'OFF'}</ModuleAction>
              </div>
            )
          })}
        </div>
      </div>
    </DeskModule>
  )
}
