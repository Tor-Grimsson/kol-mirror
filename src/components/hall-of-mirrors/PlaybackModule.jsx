import { useEffect, useState } from 'react'
import RotaryDial from './RotaryDial'
import { Jack, FlipIcon } from './ChannelPatchPanel'
import { Icon } from '../icons'
import { transport, useTransport } from '../../hooks/transport'

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

/* One key of the deck. The user's reference (2026-08-28, a cassette deck's
   transport): keys are GANGED into a strip with hairline seams rather than
   floating as separate buttons, silkscreen sits above the strip, and the cap
   carries a moulded lip that drops when the key goes down. `down` is the
   LATCH — PLAY/PAUSE and the three mode keys hold their key depressed the way
   a deck does; STOP is momentary. */
function Key({ down, onClick, title, height = 30, children }) {
  return (
    <div
      className={`flex flex-1 items-center justify-center cursor-pointer select-none ${down ? 'text-accent-primary' : 'text-fg-64 hover:text-fg-96'}`}
      style={{
        height,
        background: down ? 'var(--kol-oq-12)' : 'var(--kol-surface-tertiary)',
        boxShadow: down
          ? 'inset 0 1px 2px rgb(0 0 0 / 0.45)'
          : 'inset 0 1px 0 rgb(255 255 255 / 0.06), 0 1px 0 rgb(0 0 0 / 0.4)',
        transform: down ? 'translateY(1px)' : 'none',
      }}
      onClick={onClick}
      title={title}
    >{children}</div>
  )
}

/* The recess the keys sit in — the SAME well the Clock readout uses, so keys
   and LED read as one panel rather than two treatments stacked. The 1px gap is
   the hairline seam between ganged keys: the well's own colour showing
   through, which is what a seam physically is. */
function Gang({ width, children }) {
  return (
    <div
      className="flex"
      style={{
        width,
        gap: 1,
        padding: 1,
        background: 'var(--kol-oq-24)',
        borderRadius: 3,
        boxShadow: 'inset 0 1px 2px rgb(0 0 0 / 0.5)',
        overflow: 'hidden',
      }}
    >{children}</div>
  )
}

/* A two-position panel switch — the well language again, with a moulded lever
   that slides. Silkscreen above, matching the key deck. */
function Switch({ on, onClick, label, title }) {
  return (
    <div className="flex flex-col items-center" style={{ gap: 3 }}>
      <span className="kol-helper-10 text-fg-32">{label}</span>
      <div
        onClick={onClick}
        title={title}
        className="cursor-pointer select-none"
        style={{
          width: 36, height: 18, padding: 2, borderRadius: 3,
          background: 'var(--kol-oq-24)',
          boxShadow: 'inset 0 1px 2px rgb(0 0 0 / 0.5)',
        }}
      >
        <div
          style={{
            width: 16, height: 14, borderRadius: 2,
            background: on ? 'var(--kol-accent-primary)' : 'var(--kol-surface-tertiary)',
            boxShadow: 'inset 0 1px 0 rgb(255 255 255 / 0.10), 0 1px 0 rgb(0 0 0 / 0.4)',
            transform: on ? 'translateX(16px)' : 'none',
            transition: 'transform 120ms ease, background 120ms ease',
          }}
        />
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

  return (
    <div className="flex flex-col shrink-0" style={{ height: '100%', maxHeight: '100%' }}>
      <div className="flex items-center justify-between kol-helper-12 mx-2 px-3 border border-fg-08 border-b-0 shrink-0 bg-surface-tertiary" style={{ borderRadius: '4px 4px 0 0', height: '29px' }}>
        <span className="text-fg-96">Master Clock</span>
        <span className="flex items-center gap-3">
          <span className="text-fg-96 cursor-pointer select-none" onClick={() => transport.reset()}>Reset</span>
          <FlipIcon onFlip={() => setFlipped(f => !f)} title={flipped ? 'Flip to controls' : 'Flip to clock outputs'} />
        </span>
      </div>
      {/* The module flips like every other card on the desk — same scene, same
          450ms, same backface discipline (components.css). */}
      <div className="mirror-flip-scene flex-1" style={{ minHeight: 0 }}>
      <div className={`mirror-flip-inner h-full ${flipped ? 'is-flipped' : ''}`}>
      <div className="mirror-flip-back flex flex-col gap-3 p-4 bg-surface-secondary border border-fg-08" style={{ borderRadius: '4px', width: 300 }}>
        <span className="kol-helper-10 text-fg-32">CLOCK OUT</span>
        <ClockOutputs t={t} now={now} />
      </div>
      <div className="mirror-flip-front flex flex-col items-center gap-3 p-4 bg-surface-secondary border border-fg-08 h-full" style={{ borderRadius: '4px', minHeight: 0, width: 300 }}>
        {/* The big ON lamp, same mark the channel strips carry (SymphonyMixer:385)
            — it runs the clock, so it is lit exactly when the transport plays.
            Click it to start and stop, like the strips' own. */}
        <div
          className="w-6 h-6 rounded-full border-2 border-fg-48 flex items-center justify-center cursor-pointer select-none self-start"
          onClick={() => transport.toggle()}
          title={t.playing ? 'Stop the clock (Space)' : 'Run the clock (Space)'}
        >
          <div className={`w-3 h-3 rounded-full transition-all ${t.playing ? 'bg-[#e74c3c]' : 'bg-fg-24'}`} />
        </div>
        {/* Four knobs, dense variant — the DEFAULT variant pins its tick ring at
            a fixed 64px whatever `size` says (RotaryDial.jsx:7), so four of them
            overflowed the panel. Dense is 40px and fits with room between.
            IN and OUT are absolute seconds; either may pass the other and the
            window is read min-first, so dragging them through each other is a
            legal move rather than a broken loop. */}
        <div className="flex items-start" style={{ gap: 16 }}>
          <RotaryDial label="IN" value={t.loopIn} min={0} max={60} defaultValue={0} onChange={(v) => transport.set({ loopIn: v })} variant="dense" size={30} compact />
          <RotaryDial label="OUT" value={t.loopOut} min={0} max={60} defaultValue={8} onChange={(v) => transport.set({ loopOut: v })} variant="dense" size={30} compact />
          <RotaryDial label="SWING" value={t.swing} min={0} max={100} defaultValue={0} onChange={(v) => transport.set({ swing: v })} variant="dense" size={30} compact />
          <RotaryDial label="EASE" value={Math.round(t.ease * 100)} min={0} max={100} defaultValue={0} onChange={(v) => transport.set({ ease: v / 100 })} variant="dense" size={30} compact />
        </div>
        <Clock t={now} />
        {/* The key deck. Two gangs, both inside the module's 228px of usable
            width: the transport at 3 × 64 = 192, the direction keys at 3 × 52
            = 156 and narrower on purpose — a deck's shuttle row is the smaller
            one, and two equal-width strips would read as a grid, not a panel.
            PLAY and PAUSE are separate keys (the reference has both) but the
            semantic is unchanged: Space still toggles, and exactly one of the
            two is always down. */}
        <div className="flex flex-col items-center" style={{ gap: 3 }}>
          <div className="flex kol-helper-10 text-fg-32" style={{ width: 232 }}>
            {['Pause', 'Stop', 'Play'].map((l) => (
              <span key={l} className="flex-1 text-center">{l}</span>
            ))}
          </div>
          <Gang width={232}>
            <Key down={!t.playing} onClick={() => transport.pause()} title="Pause (Space)">
              <Icon name="control-pause" size={16} />
            </Key>
            <Key down={false} onClick={() => transport.stop()} title="Stop — back to 0">
              <Icon name="control-stop" size={16} />
            </Key>
            <Key down={t.playing} onClick={() => transport.play()} title="Play (Space)">
              <Icon name="control-play" size={16} />
            </Key>
          </Gang>
          {/* No silkscreen over this gang — the caps carry their own legend,
              the way a deck labels mode keys that have no standard glyph. */}
          <Gang width={190}>
            {MODES.map(([mode, label, title]) => (
              <Key key={mode} down={t.mode === mode} onClick={() => transport.set({ mode })} title={title} height={20}>
                <span className="kol-helper-10">{label}</span>
              </Key>
            ))}
          </Gang>
        </div>
        {/* Switches and jacks share ONE bottom strip — the VintageMaker box on
            the user's references does the same, and the module is pinned to the
            master module's height, so a second row is height this panel has not
            got.
            ponytail: the jacks are LAMPS ONLY — they register with the desk's
            jack registry so a cable can anchor to them, but carry no `source`,
            because nothing on the desk consumes a clock or a gate yet. Give
            them `source` + a drop handler the day a channel accepts one. */}
        <div className="flex items-start" style={{ gap: 16 }}>
          <Switch label="LOOP" on={t.looping} onClick={() => transport.set({ looping: !t.looping })} title="Wrap the clock inside IN…OUT — the folding modes always do" />
          <Switch label="HOLD" on={t.hold} onClick={() => transport.set({ hold: !t.hold })} title="Freeze the output while the clock keeps running underneath" />
          {[['clock-clk', 'CLK', clkHigh, 'Clock out — the first of the two ticks'], ['clock-run', 'RUN', t.playing, 'Run gate — high while the transport plays']].map(([id, label, lit, title]) => (
            <div key={id} className="flex flex-col items-center" style={{ gap: 3 }}>
              <span className="kol-helper-10 text-fg-32">{label}</span>
              <Jack jackId={id} connected={lit} title={title} color="#ff3b30" />
            </div>
          ))}
        </div>
        {/* ONE BIG TEMPO KNOB (user 2026-08-28), at the bottom of the panel.
            `master` variant: the default pins its ring at 64px, so a 72px knob
            clipped its own ticks into fragments. It also sits in a flex-1 box so
            it centres in whatever height the panel has left. */}
        <div className="flex flex-1 items-center" style={{ minHeight: 0 }}>
          <RotaryDial label="TEMPO" value={Math.round(t.rate * 100)} min={10} max={400} defaultValue={100} onChange={(v) => transport.set({ rate: v / 100 })} variant="master" size={92} />
        </div>
      </div>
      </div>
      </div>
    </div>
  )
}
