import { useEffect, useState } from 'react'
import Modulatable from '@kolkrabbi/kol-hardware/value/Modulatable.jsx'
import Knob from '@kolkrabbi/kol-component/molecules/Knob'
import { exprBusRef } from '../../hooks/exprBus'
import { Jack } from './ChannelPatchPanel'
import { transport, useTransport } from '../../hooks/transport'
import { Scrubber } from '@kolkrabbi/kol-hardware/panel/TimeStrip.jsx'
import { DeskModule, ModuleFooter, ModuleBack, ModuleAction } from './modules/ModuleFrame'
import { StripPort } from './modules/JackStrip'

const MODES = [['reverse', 'REV', 'Reverse'], ['forward', 'FWD', 'Forward'], ['pingpong', 'P·P', 'Ping-pong']]
const wrap = (x, m) => ((x % m) + m) % m

/* The clock readout — the shaped timeline as a digital stopwatch, MM:SS.mmm
   (user 2026-08-28). A red LED panel on the user's reference (a Laurel 6-digit
   stopwatch): dark inset well, glowing figures, and a ghost `88:88.888` behind
   so the unlit segments hold their cells.
   The sampled time now arrives as a prop — the panel's CLK lamp needs the same
   value, and two rAF loops reading one clock is one loop too many. */
function Clock({ t }) {
  const abs = Math.max(0, t)
  const mm = String(Math.floor(abs / 60)).padStart(2, '0')
  const ss = String(Math.floor(abs % 60)).padStart(2, '0')
  const ms = String(Math.floor((abs % 1) * 1000)).padStart(3, '0')
  const digits = `${mm}:${ss}.${ms}`
  /* The OFF segments are the half that makes an LED panel read as one: a ghost
     `88:88.888` under the live figure at low alpha, so unlit digits still
     occupy their cells instead of the number floating in a void. Both layers
     are one grid cell, tabular, so nothing shifts as the digits roll. */
  const led = { gridArea: '1 / 1', fontVariantNumeric: 'tabular-nums', letterSpacing: '0.08em', fontSize: 22, lineHeight: 1 }
  return (
    <div
      className="flex items-center justify-center"
      style={{
        background: 'var(--kol-oq-12)',
        border: '1px solid var(--kol-fg-08)',
        borderRadius: 'var(--kol-radius-xs)',
        padding: '6px 10px',
        boxShadow: 'inset 0 1px 3px rgb(0 0 0 / 0.5)',
      }}
    >
      <div style={{ display: 'inline-grid' }}>
        <span style={{ ...led, color: '#ff3b30', opacity: 0.1 }} aria-hidden="true">88:88.888</span>
        <span style={{ ...led, color: '#ff3b30', textShadow: '0 0 6px rgb(255 59 48 / 0.5)' }}>{digits}</span>
      </div>
    </div>
  )
}




/* THE BACK — clock OUTPUTS at different tempos (user 2026-08-28: "make the
   clock flip, show clock outputs at different tempos"). A master clock's back
   is its division rack: one jack per ratio, each ticking at its own rate off
   the same transport, so ×4 fires four times in the window ÷4 fires once in.
   The rate readout is real seconds, recomputed from TEMPO and the loop window —
   turn TEMPO and every row's period changes with it. */
const DIVISIONS = [
  ['×8', 8], ['×4', 4], ['×2', 2], ['×1', 1],
  ['÷2', 0.5], ['÷4', 0.25], ['÷8', 0.125], ['÷16', 0.0625],
]

function ClockOutputs({ t, now }) {
  const L = Math.max(0.1, Math.abs(t.loopOut - t.loopIn))
  const base = Math.min(t.loopIn, t.loopOut)
  return (
    <div className="flex flex-col" style={{ gap: 6 }}>
      {DIVISIONS.map(([label, mult]) => {
        const period = L / mult
        // lit through the first half of each of this row's own cycles
        const lit = t.playing && wrap(now - base, period) / period < 0.5
        return (
          <div key={label} className="flex items-center" style={{ gap: 10 }}>
            <span className="kol-helper-12 text-fg-96" style={{ width: 34 }}>{label}</span>
            <span
              aria-hidden
              className="rounded-full shrink-0"
              style={{
                width: 7, height: 7,
                background: lit ? '#ff3b30' : '#3a2020',
                boxShadow: lit ? '0 0 5px rgb(255 59 48 / 0.8)' : 'none',
              }}
            />
            <span className="kol-helper-10 text-fg-32 flex-1" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {(period / t.rate).toFixed(2)}s
            </span>
            <Jack jackId={`clock-div-${label}`} connected={lit} title={`Clock out ${label}`} color="#ff3b30" />
          </div>
        )
      })}
    </div>
  )
}

/**
 * PlaybackModule — the desk's MASTER CLOCK (user 2026-08-28). It runs the
 * timeline (`transport`) that every expression, the scope and the studio's
 * animate read.
 *
 * TEMPO is the master knob. The loop is a WINDOW — IN and OUT in seconds, not
 * a length — and SWING puts two ticks on one clock by sliding the midpoint
 * between them. EASE is tied to the ping-pong turnarounds, which is the only
 * place a fold happens. Space = play / pause, everywhere.
 */
export default function PlaybackModule() {
  const t = useTransport()
  const [flipped, setFlipped] = useState(false)
  /* One sampler for the whole panel — the readout and the CLK lamp. 50ms
     rather than 10× a second: the milliseconds field is the point, and at
     100ms it steps in visible jumps. */
  const [now, setNow] = useState(0)
  useEffect(() => {
    let raf
    let last = 0
    const tick = (ts) => {
      if (ts - last > 50) { last = ts; setNow(transport.now()) }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  /* The CLK lamp is the FIRST of the two ticks in the cycle — it is what makes
     swing visible on the panel, because a swung clock lights it long and dark
     short instead of evenly. */
  const span = Math.max(0.1, Math.abs(t.loopOut - t.loopIn))
  const clkHigh = t.playing && wrap(now - Math.min(t.loopIn, t.loopOut), span) / span < 0.5

  /* THE STANDARD (plan 12): the body is the deck — the run lamp, the timecode, the loop section, TEMPO, and the
     verbs as the text-button row (PAUSE · STOP · PLAY · LOOP · HOLD); the footer's REV · FWD · P·P tabs are the
     direction, over the window's four knobs; the jack row is CLK · RUN; the back the clock divisions. */
  const lit = 'var(--kol-accent-primary)'
  return (
    <DeskModule
      width={320}
      power={{ on: t.playing, onToggle: () => transport.toggle(), title: t.playing ? 'Stop the clock (Space)' : 'Run the clock (Space)' }}
      head={<span className="text-fg-96">Transport</span>}
      headRight={<span className="text-fg-96 cursor-pointer select-none" onClick={() => transport.reset()}>Reset</span>}
      flipped={flipped}
      onFlip={() => setFlipped(f => !f)}
      back={(
        <ModuleBack>
          <span className="text-fg-32">CLOCK OUT</span>
          <ClockOutputs t={t} now={now} />
        </ModuleBack>
      )}
      rows={(
        <div className="flex items-center justify-center" style={{ minHeight: 0 }}>
          {/* ONE BIG TEMPO KNOB (user 2026-08-28). `master` variant: the default pins its ring at 64px, so a 72px
              knob clipped its own ticks into fragments. */}
          <Modulatable label="TEMPO" value={Math.round(t.rate * 100)} onChange={(v) => transport.set({ rate: v / 100 })} min={10} max={400} bus={exprBusRef} clock={transport}>
            <Knob variant="panel" size="xl" defaultValue={100} />
          </Modulatable>
        </div>
      )}
      actions={(
        <>
          <ModuleAction tone={!t.playing ? lit : undefined} onClick={() => transport.pause()} title="Pause (Space)">PAUSE</ModuleAction>
          <ModuleAction onClick={() => transport.stop()} title="Stop — back to 0">STOP</ModuleAction>
          <ModuleAction tone={t.playing ? lit : undefined} onClick={() => transport.play()} title="Play (Space)">PLAY</ModuleAction>
          <ModuleAction tone={t.looping ? lit : undefined} dim={!t.looping} onClick={() => transport.set({ looping: !t.looping })} title="Wrap the clock inside IN…OUT — the folding modes always do">LOOP</ModuleAction>
          <ModuleAction tone={t.hold ? lit : undefined} dim={!t.hold} onClick={() => transport.set({ hold: !t.hold })} title="Freeze the output while the clock keeps running underneath">HOLD</ModuleAction>
        </>
      )}
      footer={(
        <ModuleFooter
          width={320}
          square
          tabs={MODES.map(([mode, label, title]) => ({ value: mode, label, title }))}
          value={t.mode}
          onChange={(mode) => transport.set({ mode })}
        >
          {/* IN and OUT are absolute seconds; either may pass the other and the window is read min-first, so
              dragging them through each other is a legal move rather than a broken loop. */}
          <div className="flex items-start justify-between">
            <Modulatable label="IN" value={t.loopIn} onChange={(v) => transport.set({ loopIn: v })} min={0} max={60} bus={exprBusRef} clock={transport} density="dense">
              <Knob variant="panel" size="lg" defaultValue={0} />
            </Modulatable>
            <Modulatable label="OUT" value={t.loopOut} onChange={(v) => transport.set({ loopOut: v })} min={0} max={60} bus={exprBusRef} clock={transport} density="dense">
              <Knob variant="panel" size="lg" defaultValue={8} />
            </Modulatable>
            <Modulatable label="SWING" value={t.swing} onChange={(v) => transport.set({ swing: v })} min={0} max={100} bus={exprBusRef} clock={transport} density="dense">
              <Knob variant="panel" size="lg" defaultValue={0} />
            </Modulatable>
            <Modulatable label="EASE" value={Math.round(t.ease * 100)} onChange={(v) => transport.set({ ease: v / 100 })} min={0} max={100} bus={exprBusRef} clock={transport} density="dense">
              <Knob variant="panel" size="lg" defaultValue={0} />
            </Modulatable>
          </div>
        </ModuleFooter>
      )}
      jacks={[['clock-clk', 'CLK', clkHigh, 'Clock out — the first of the two ticks'], ['clock-run', 'RUN', t.playing, 'Run gate — high while the transport plays']].map(([id, label, on, title]) => (
        /* ponytail: LAMPS ONLY — registered so a cable can anchor, no `source`, because nothing on the desk consumes
           a clock or a gate yet. Give them `source` + a drop handler the day a channel accepts one. */
        <StripPort key={id} label={label}>
          <Jack jackId={id} connected={on} title={title} color="#ff3b30" />
        </StripPort>
      ))}
    >
      {/* the ON lamp moved to the header's power switch (plan 16 W5) — it runs the clock */}
      <div className="flex flex-col items-center gap-3">
        <Clock t={now} />
        {/* THE LOOP SECTION (user 2026-10-15: *"|-->----------|"*) — IN to OUT with the head; drag it to move the head. */}
        <Scrubber transport={transport} width={288} />
      </div>
    </DeskModule>
  )
}
