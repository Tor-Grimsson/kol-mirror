import { useCallback, useRef } from 'react'
import RotaryDial from './RotaryDial'
import { Icon } from '../icons'
import { usePatchJacks, patchDrag } from './patchJacksContext'
import Divider from '../atoms/Divider'
import { WIRE_COLORS } from './wireColors'

/**
 * ChannelPatchPanel — the BACK of a flipped channel card (2026-08-12,
 * "flip the modules to make connections, like a real mixer").
 *
 * Jack idiom: IN (routeFrom source), OUT (this channel as a source), six
 * send jacks with level dials, feedback jack with decay/mix dials.
 * Drag-to-patch (2026-08-27, monitor's grammar): press an OUT jack, drag the
 * cable, drop it on an IN. Click still works — OUT arms, IN accepts — and a
 * click on a connected IN unpatches. Bus returns (RTN 1/2) are valid sources —
 * string routeFrom keys, one-frame-delay loops included.
 */

const BUS_SENDS = ['aux1', 'aux2', 'rtn1', 'rtn2', 'fx1', 'fx2']
/* Every bus can be a SOURCE, not just the two returns. `getChannelFrame` takes
   any bus key, and the routing matrix already cycled all six — the bay showed
   two, so the same patch was reachable in one UI and not the other. */
const BUS_SOURCES = BUS_SENDS
const SEND_LABEL = { aux1: 'AUX 1', aux2: 'AUX 2', rtn1: 'RTN 1', rtn2: 'RTN 2', fx1: 'FX 1', fx2: 'FX 2' }

/* The flip control, in the header of every face — a real slot, not an overlay
   (it sat over the master's Reset). `onFlip` absent = the decorative mark. */
export function FlipIcon({ onFlip, title = 'Flip', size = 12 }) {
  if (!onFlip) return <Icon name="flip-y" size={size} className="text-fg-32" />
  return (
    <span className="cursor-pointer select-none text-fg-32 hover:text-fg-96 flex" onClick={onFlip} title={title}>
      <Icon name="flip-y" size={size} />
    </span>
  )
}

const wireOf = (i) => WIRE_COLORS[i % WIRE_COLORS.length]

const hitJack = (e) => document.elementFromPoint(e.clientX, e.clientY)?.closest('[data-jack]')?.dataset.jack ?? null

/**
 * @param {Object}   source  what a drag FROM this jack carries — `{ type: 'ch', idx }` / `{ type: 'bus', key }`
 * @param {Function} onDrop  (source) => void — this jack accepts a dropped cable
 * @param {string}   color   the LED — the cable's wire colour when connected (default: accent)
 */
export function Jack({ connected, pending, onClick, title, jackId, source, onDrop, color }) {
  const led = color || 'var(--kol-accent-primary)'
  // Register the jack's DOM node (+ drop handler) so PatchCableOverlay can
  // anchor cables and a drag can land here.
  const jacks = usePatchJacks()
  const jackRef = useCallback((el) => {
    if (!jackId || !jacks) return
    if (el) jacks.register(jackId, el, onDrop)
    else jacks.unregister(jackId)
  }, [jackId, jacks, onDrop])
  const movedRef = useRef(false)
  const onPointerDown = (e) => {
    if (!source || !jacks || e.button !== 0) return
    movedRef.current = false
    e.currentTarget.setPointerCapture(e.pointerId)
    patchDrag.current = { source, fromId: jackId, x: e.clientX, y: e.clientY, x0: e.clientX, y0: e.clientY, moved: false }
  }
  const onPointerMove = (e) => {
    const d = patchDrag.current
    if (!d || d.fromId !== jackId) return
    d.x = e.clientX
    d.y = e.clientY
    if (!d.moved && Math.hypot(e.clientX - d.x0, e.clientY - d.y0) > 4) { d.moved = true; movedRef.current = true; jacks.setDragging(jackId) }
    if (d.moved) jacks.setOver(hitJack(e))
  }
  const onPointerUp = (e) => {
    const d = patchDrag.current
    if (!d || d.fromId !== jackId) return
    patchDrag.current = null
    if (!d.moved) return
    const id = hitJack(e)
    if (id && id !== jackId) jacks.drops.get(id)?.(d.source)
    jacks.setDragging(null)
    jacks.setOver(null)
  }
  // A press that dragged is not a click.
  const handleClick = (e) => { if (movedRef.current) { movedRef.current = false; return } onClick?.(e) }
  const isOver = !!onDrop && jacks?.over === jackId
  const live = pending || jacks?.dragging === jackId || (!!onDrop && !!jacks?.dragging)
  return (
    <span
      ref={jackRef}
      data-jack={jackId}
      onClick={handleClick}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      title={title}
      className="cursor-pointer select-none inline-flex items-center justify-center"
      style={{ width: 30, height: 30, touchAction: 'none' }}
    >
      {/* THE HEX NUT — a real 1/4" jack, not a radio button (user 2026-08-28,
          with an AI Synthesis VC Matrix Mixer as the reference: "in this repo
          the jacks are 1/4 inch BIG jacks not small"). Six-sided nickel collar
          with the flats catching light top-left, the dark bore sunk inside it,
          and the LED as the ring of contact showing through the bore — which
          is what a lit jack actually looks like on a panel. */}
      <span
        className="transition-all"
        style={{
          width: 28, height: 28,
          clipPath: 'polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)',
          background: 'linear-gradient(150deg, var(--kol-fg-48), var(--kol-fg-16) 45%, var(--kol-fg-32))',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          filter: isOver
            ? 'drop-shadow(0 0 4px var(--kol-accent-primary))'
            : connected ? `drop-shadow(0 0 5px ${led})`
            : live ? 'drop-shadow(0 0 3px var(--kol-fg-32))' : undefined,
        }}
      >
        {/* the bore — sunk, with the shaft's shadow across its top */}
        <span
          className="rounded-full"
          style={{
            width: 17, height: 17,
            background: 'radial-gradient(circle at 50% 32%, #050506, #0b0b0d 62%, #17171a)',
            boxShadow: 'inset 0 2px 3px rgb(0 0 0 / 0.9), inset 0 -1px 1px var(--kol-fg-16)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <span
            className="rounded-full transition-all"
            style={{
              width: 7, height: 7,
              backgroundColor: connected ? led : 'var(--kol-fg-16)',
              boxShadow: connected ? `0 0 6px ${led}, 0 0 2px ${led}` : undefined,
            }}
          />
        </span>
      </span>
    </span>
  )
}

/**
 * MasterPatchPanel — the back of the Master Out module: MON IN (a channel OUT
 * dropped here feeds Screen 2 — "take the output of channel one and put it in
 * the input of the mixer so I can view it"), the six bus IN jacks (a channel
 * OUT patches its send here; click a lit jack to clear every send into that
 * bus) + RTN OUT jacks as loop sources.
 */
export function MasterPatchPanel({ channels, onChannelUpdate, master, onMasterChange, pendingOut, setPendingOut, screen2 = 'off', setScreen2, onFlip }) {
  /* IN 1-3 — the master's input slots (user, 2026-08-27: "the point of
     modularity is NOT to set anything, USER sets"). Any channel OUT into any
     IN; the slot is `master.inputs[n]`, and patching turns the channel on. */
  const inputs = master?.inputs || [null, null, null]
  const setInput = (n, src) => onMasterChange?.({ inputs: inputs.map((v, i) => (i === n ? src : v)) })
  const patchInput = (n, src) => { if (src.type !== 'ch') return; setInput(n, src.idx); if (!channels[src.idx]?.enabled) onChannelUpdate(src.idx, { enabled: true }) }
  const onInput = (n) => {
    if (pendingOut?.type === 'ch') { patchInput(n, pendingOut); setPendingOut(null); return }
    if (inputs[n] != null) setInput(n, null)
  }
  const busConnected = (key) => channels.some(ch => (ch.sends?.[key] || 0) > 0)
  // A click toggles the send; a dropped cable always connects (level 100).
  const patchSend = (idx, key, level) => {
    const sends = channels[idx]?.sends || {}
    onChannelUpdate(idx, { sends: { ...sends, [key]: level ?? (sends[key] > 0 ? 0 : 100) } })
  }
  const onBusIn = (key) => {
    if (pendingOut?.type === 'ch') {
      patchSend(pendingOut.idx, key)
      setPendingOut(null)
      return
    }
    if (busConnected(key)) {
      channels.forEach((ch, i) => {
        if ((ch.sends?.[key] || 0) > 0) onChannelUpdate(i, { sends: { ...ch.sends, [key]: 0 } })
      })
    }
  }
  const monFrom = /^\d+$/.test(screen2) ? +screen2 : null
  const onMonIn = () => {
    if (pendingOut?.type === 'ch') { setScreen2?.(String(pendingOut.idx)); setPendingOut(null); return }
    if (monFrom != null) setScreen2?.('off')
  }

  return (
    <div className="flex flex-col h-full bg-surface-secondary border border-fg-08 kol-helper-12" style={{ borderRadius: 4, padding: 12, gap: 8, overflowY: 'auto' }}>
      <div className="flex items-center justify-between" style={{ height: 20 }}>
        <span className="text-fg-96">Master · Patch</span>
        <FlipIcon onFlip={onFlip} />
      </div>

      <div>
        <div className="text-fg-32" style={{ marginBottom: 6 }}>IN</div>
        <div className="flex items-center" style={{ gap: 10 }}>
          {inputs.map((src, n) => (
            <span key={n} className="flex items-center" style={{ gap: 4 }}>
              <Jack
                jackId={`mst-in-${n}`}
                connected={src != null}
                color={src != null ? wireOf(src) : undefined}
                pending={pendingOut?.type === 'ch' && src == null}
                onClick={() => onInput(n)}
                onDrop={(s) => patchInput(n, s)}
                title={src != null ? `Ch ${src + 1} → IN ${n + 1} — click to unpatch` : `IN ${n + 1} — drop a channel OUT here`}
              />
              <span className="text-fg-64">IN {n + 1}</span>
              <span className="text-fg-32">{src != null ? `CH ${src + 1}` : '—'}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center" style={{ gap: 6 }}>
        <Jack
          jackId="mst-mon"
          connected={monFrom != null}
          color={monFrom != null ? wireOf(monFrom) : undefined}
          pending={pendingOut?.type === 'ch' && monFrom == null}
          onClick={onMonIn}
          onDrop={(src) => { if (src.type === 'ch') setScreen2?.(String(src.idx)) }}
          title={monFrom != null ? `Monitoring Ch ${monFrom + 1} on Screen 2 — click to unpatch` : 'MON IN — drop a channel OUT here to view it on Screen 2'}
        />
        <span className="text-fg-64">MON IN</span>
        <span className="text-fg-32">{monFrom != null ? `CH ${monFrom + 1}` : '—'}</span>
      </div>

      <div>
        <div className="text-fg-32" style={{ marginBottom: 6 }}>BUS IN</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
          {BUS_SENDS.map(key => (
            <span key={key} className="flex items-center" style={{ gap: 6 }}>
              <Jack
                jackId={`mst-bus-${key}`}
                connected={busConnected(key)}
                color={(() => { const senders = channels.map((ch, i) => ((ch.sends?.[key] || 0) > 0 ? i : null)).filter((i) => i != null); return senders.length === 1 ? wireOf(senders[0]) : undefined })()}
                pending={pendingOut?.type === 'ch'}
                onClick={() => onBusIn(key)}
                onDrop={(src) => { if (src.type === 'ch') patchSend(src.idx, key, 100) }}
                title={pendingOut?.type === 'ch' ? `Patch Ch ${pendingOut.idx + 1} send → ${SEND_LABEL[key]}` : busConnected(key) ? `Clear all sends into ${SEND_LABEL[key]}` : `${SEND_LABEL[key]} in — drop a channel OUT here`}
              />
              <span className="text-fg-64">{SEND_LABEL[key]}</span>
            </span>
          ))}
        </div>
      </div>

      <div>
        <div className="text-fg-32" style={{ marginBottom: 6 }}>RTN OUT</div>
        {/* Three columns: six jacks with labels overflow a single row and get
            clipped mid-word (seen on screen, 2026-08-27). */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
          {BUS_SOURCES.map(key => (
            <span key={key} className="flex items-center" style={{ gap: 4 }}>
              <Jack
                jackId={`mst-rtn-${key}`}
                connected={channels.some(ch => ch.routeFrom === key)}
                pending={pendingOut?.type === 'bus' && pendingOut.key === key}
                source={{ type: 'bus', key }}
                onClick={() => setPendingOut(prev => (prev?.type === 'bus' && prev.key === key) ? null : { type: 'bus', key })}
                title={`${SEND_LABEL[key]} return as a source — drag to a channel IN`}
              />
              <span className="text-fg-64">{SEND_LABEL[key]}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * RoutingPatchPanel — the back of the Routing Matrix: the live cable list.
 * Every active connection (route, send, feedback loop) as a row; click its
 * jack to disconnect.
 */
/**
 * The matrix's own JACK BAY — every OUT and every IN in the instrument, in one
 * place, so the whole graph is patchable from a single module rather than only
 * from whichever channel card happens to be flipped.
 *
 * Built after a connection audit (2026-08-27) found five gaps and a
 * contradiction between the two surfaces:
 *   - master input slots, MON and feedback were patchable ONLY in a channel bay
 *   - the bay offered rtn1/rtn2 as sources while the matrix offered all six
 *   - the matrix filtered a channel out of its own source list while the bay
 *     allowed the self-patch — two UIs disagreeing about one state
 * Everything reachable in the model is reachable here.
 */
function MatrixBay({ channels, onChannelUpdate, master, onMasterChange, screen2, setScreen2, pendingOut, setPendingOut }) {
  const inputs = master?.inputs || [null, null, null]
  const setInput = (n, src) => onMasterChange?.({ inputs: inputs.map((v, i) => (i === n ? src : v)) })

  const patchChannelIn = (i, src) => onChannelUpdate(i, { routeFrom: src.type === 'ch' ? src.idx : src.key })
  const patchMasterIn = (n, src) => {
    if (src.type !== 'ch') return
    setInput(n, src.idx)
    if (!channels[src.idx]?.enabled) onChannelUpdate(src.idx, { enabled: true })
  }

  return (
    <div className="flex flex-col" style={{ gap: 10 }}>
      <div>
        <div className="text-fg-32" style={{ marginBottom: 6 }}>CHANNEL OUT</div>
        <div className="flex items-center" style={{ gap: 10 }}>
          {channels.map((ch, i) => (
            <span key={i} className="flex items-center" style={{ gap: 4 }}>
              <Jack
                jackId={`mx-ch-${i}-out`}
                connected={!!ch.enabled}
                color={wireOf(i)}
                pending={pendingOut?.type === 'ch' && pendingOut.idx === i}
                source={{ type: 'ch', idx: i }}
                onClick={() => setPendingOut((p) => (p?.type === 'ch' && p.idx === i ? null : { type: 'ch', idx: i }))}
                title={`Ch ${i + 1} out — drag to any IN`}
              />
              <span className="text-fg-64">CH {i + 1}</span>
            </span>
          ))}
        </div>
      </div>

      <div>
        <div className="text-fg-32" style={{ marginBottom: 6 }}>BUS OUT</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
          {BUS_SOURCES.map((key) => (
            <span key={key} className="flex items-center" style={{ gap: 4 }}>
              <Jack
                jackId={`mx-bus-${key}-out`}
                connected={channels.some((c) => c.routeFrom === key)}
                pending={pendingOut?.type === 'bus' && pendingOut.key === key}
                source={{ type: 'bus', key }}
                onClick={() => setPendingOut((p) => (p?.type === 'bus' && p.key === key ? null : { type: 'bus', key }))}
                title={`${SEND_LABEL[key]} out — drag to a channel IN`}
              />
              <span className="text-fg-64">{SEND_LABEL[key]}</span>
            </span>
          ))}
        </div>
      </div>

      <Divider className="my-1" />

      <div>
        <div className="text-fg-32" style={{ marginBottom: 6 }}>CHANNEL IN</div>
        <div className="flex items-center" style={{ gap: 10 }}>
          {channels.map((ch, i) => (
            <span key={i} className="flex items-center" style={{ gap: 4 }}>
              <Jack
                jackId={`mx-ch-${i}-in`}
                connected={ch.routeFrom != null}
                color={typeof ch.routeFrom === 'number' ? wireOf(ch.routeFrom) : undefined}
                pending={!!pendingOut && ch.routeFrom == null}
                onClick={() => { if (ch.routeFrom != null) onChannelUpdate(i, { routeFrom: null }); else if (pendingOut) { patchChannelIn(i, pendingOut); setPendingOut(null) } }}
                onDrop={(src) => patchChannelIn(i, src)}
                title={ch.routeFrom != null ? `Ch ${i + 1} in — click to unpatch` : `Ch ${i + 1} in`}
              />
              <span className="text-fg-64">CH {i + 1}</span>
            </span>
          ))}
        </div>
      </div>

      <div>
        <div className="text-fg-32" style={{ marginBottom: 6 }}>MASTER IN</div>
        <div className="flex items-center" style={{ gap: 10 }}>
          {inputs.map((src, n) => (
            <span key={n} className="flex items-center" style={{ gap: 4 }}>
              <Jack
                jackId={`mx-mst-in-${n}`}
                connected={src != null}
                color={src != null ? wireOf(src) : undefined}
                pending={pendingOut?.type === 'ch' && src == null}
                onClick={() => { if (src != null) setInput(n, null); else if (pendingOut) { patchMasterIn(n, pendingOut); setPendingOut(null) } }}
                onDrop={(s) => patchMasterIn(n, s)}
                title={src != null ? `IN ${n + 1} <- Ch ${src + 1}` : `Master in ${n + 1}`}
              />
              <span className="text-fg-64">IN {n + 1}</span>
            </span>
          ))}
          <span className="flex items-center" style={{ gap: 4 }}>
            <Jack
              jackId="mx-mon"
              connected={/^\d+$/.test(String(screen2))}
              color={/^\d+$/.test(String(screen2)) ? wireOf(parseInt(String(screen2))) : undefined}
              pending={pendingOut?.type === 'ch'}
              onClick={() => { if (/^\d+$/.test(String(screen2))) setScreen2?.('off'); else if (pendingOut?.type === 'ch') { setScreen2?.(String(pendingOut.idx)); setPendingOut(null) } }}
              onDrop={(s) => { if (s.type === 'ch') setScreen2?.(String(s.idx)) }}
              title="MON — Screen 2"
            />
            <span className="text-fg-64">MON</span>
          </span>
        </div>
      </div>

      <div>
        <div className="text-fg-32" style={{ marginBottom: 6 }}>FEEDBACK</div>
        <div className="flex items-center" style={{ gap: 10 }}>
          {channels.map((ch, i) => {
            const fb = ch.feedback || { enabled: false }
            return (
              <span key={i} className="flex items-center" style={{ gap: 4 }}>
                <Jack
                  jackId={`mx-fb-${i}`}
                  connected={!!fb.enabled}
                  color={wireOf(i)}
                  onClick={() => onChannelUpdate(i, { feedback: { ...fb, enabled: !fb.enabled } })}
                  title={`Ch ${i + 1} feedback loop`}
                />
                <span className="text-fg-64">CH {i + 1}</span>
              </span>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export function RoutingPatchPanel({ channels, onChannelUpdate, master, onMasterChange, screen2 = 'off', setScreen2, onFlip, pendingOut, setPendingOut }) {
  const rows = []
  const inputs = master?.inputs || []
  inputs.forEach((src, n) => {
    if (src != null) rows.push({ key: `in-${n}`, label: `CH ${src + 1} → MASTER IN ${n + 1}`, color: wireOf(src), off: () => onMasterChange?.({ inputs: inputs.map((v, i) => (i === n ? null : v)) }) })
  })
  if (/^\d+$/.test(screen2)) rows.push({ key: 'mon', label: `CH ${+screen2 + 1} → MON IN · Screen 2`, color: wireOf(+screen2), off: () => setScreen2?.('off') })
  channels.forEach((ch, i) => {
    if (ch.routeFrom != null) {
      const from = typeof ch.routeFrom === 'string' ? ch.routeFrom.toUpperCase() : `CH ${ch.routeFrom + 1}`
      rows.push({ key: `route-${i}`, label: `${from} → CH ${i + 1} IN`, color: typeof ch.routeFrom === 'number' ? wireOf(ch.routeFrom) : undefined, off: () => onChannelUpdate(i, { routeFrom: null }) })
    }
    Object.entries(ch.sends || {}).forEach(([bus, lvl]) => {
      if (lvl > 0) rows.push({ key: `send-${i}-${bus}`, label: `CH ${i + 1} → ${SEND_LABEL[bus]} · ${lvl}%`, color: wireOf(i), off: () => onChannelUpdate(i, { sends: { ...ch.sends, [bus]: 0 } }) })
    })
    /* Cross-sends were missing from this list entirely, so a patch made in the
       matrix's NxN grid (or now in the bay) left no trace here. */
    Object.entries(ch.routeSendLevels || {}).forEach(([to, lvl]) => {
      const j = parseInt(to)
      if (!isNaN(j) && lvl > 0) {
        rows.push({
          key: `xsend-${i}-${j}`,
          label: `CH ${i + 1} → CH ${j + 1} · ${lvl}%`,
          color: wireOf(i),
          off: () => onChannelUpdate(i, { routeSendLevels: { ...ch.routeSendLevels, [j]: 0 } }),
        })
      }
    })
    if (ch.feedback?.enabled) {
      rows.push({ key: `fb-${i}`, label: `CH ${i + 1} ⟲ feedback`, color: wireOf(i), off: () => onChannelUpdate(i, { feedback: { ...ch.feedback, enabled: false } }) })
    }
  })

  return (
    <div className="flex flex-col h-full bg-surface-secondary border border-fg-08 kol-helper-12" style={{ borderRadius: 4, padding: 12, gap: 10, overflowY: 'auto' }}>
      <div className="flex items-center justify-between" style={{ height: 20 }}>
        <span className="text-fg-96">Connections</span>
        <FlipIcon onFlip={onFlip} />
      </div>
      <MatrixBay
        channels={channels}
        onChannelUpdate={onChannelUpdate}
        master={master}
        onMasterChange={onMasterChange}
        screen2={screen2}
        setScreen2={setScreen2}
        pendingOut={pendingOut}
        setPendingOut={setPendingOut}
      />
      <Divider className="my-1" />
      <div className="text-fg-32">CONNECTIONS</div>
      {rows.length === 0 && <span className="text-fg-32">Nothing patched yet — drag an OUT onto an IN above.</span>}
      {rows.map(r => (
        <span key={r.key} className="flex items-center" style={{ gap: 8 }}>
          <Jack connected pending={false} color={r.color} onClick={r.off} title="Disconnect" />
          <span className="text-fg-64">{r.label}</span>
        </span>
      ))}
    </div>
  )
}

export default function ChannelPatchPanel({ channelIndex, channel, channels = [], master, screen2 = 'off', onChannelUpdate, pendingOut, setPendingOut, onFlip }) {
  const routeFrom = channel.routeFrom
  const feedback = channel.feedback || { enabled: false, decay: 80, mix: 50, freeze: false }
  const sends = channel.sends || {}
  const wire = wireOf(channelIndex)
  // OUT is live when this channel feeds anything — a master input, another
  // channel's IN, a bus send, or Screen 2 — and glows in its wire colour.
  const isSource = (master?.inputs || []).includes(channelIndex)
    || channels.some((c) => c.routeFrom === channelIndex)
    || Object.values(sends).some((v) => v > 0)
    || screen2 === String(channelIndex)

  const routeLabel = routeFrom == null
    ? '—'
    : typeof routeFrom === 'string' ? routeFrom.toUpperCase() : `CH ${routeFrom + 1}`

  // Any source, including this channel's own OUT — a mixer doesn't argue; a
  // self-patch is a one-frame feedback route like any other cycle.
  const patchIn = (src) => onChannelUpdate(channelIndex, { routeFrom: src.type === 'ch' ? src.idx : src.key })
  const onInClick = () => {
    if (routeFrom != null) { onChannelUpdate(channelIndex, { routeFrom: null }); return }
    if (!pendingOut) return
    patchIn(pendingOut)
    setPendingOut(null)
  }

  const onOutClick = () => {
    setPendingOut(prev => (prev?.type === 'ch' && prev.idx === channelIndex) ? null : { type: 'ch', idx: channelIndex })
  }

  const isPendingSelf = pendingOut?.type === 'ch' && pendingOut.idx === channelIndex

  return (
    <div className="flex flex-col h-full bg-surface-secondary border border-fg-08 kol-helper-12" style={{ borderRadius: 4, padding: 12, gap: 8, overflowY: 'auto' }}>

      {/* IN / OUT row */}
      <div className="flex items-center justify-between">
        <span className="flex items-center" style={{ gap: 6 }}>
          <Jack
            jackId={`ch-${channelIndex}-in`}
            connected={routeFrom != null}
            color={typeof routeFrom === 'number' ? wireOf(routeFrom) : undefined}
            pending={!!pendingOut && routeFrom == null}
            onClick={onInClick}
            onDrop={patchIn}
            title={routeFrom != null ? `Patched from ${routeLabel} — click to unpatch` : pendingOut ? 'Click to patch pending source here' : 'IN — drop an OUT jack here'}
          />
          <span className="text-fg-64">IN</span>
          <span className="text-fg-32">{routeLabel}</span>
        </span>
        <span className="flex items-center" style={{ gap: 6 }}>
          <span className="text-fg-64">OUT</span>
          <Jack
            jackId={`ch-${channelIndex}-out`}
            connected={isSource}
            color={wire}
            pending={isPendingSelf}
            source={{ type: 'ch', idx: channelIndex }}
            onClick={onOutClick}
            title={isPendingSelf ? 'Pending — click an IN jack to connect, or click again to cancel' : 'OUT — drag to an IN jack'}
          />
        </span>
      </div>

      {/* Bus sources — any of the six can feed this channel's IN. Grid, not a
          row: six labelled jacks do not fit the card's width. */}
      <div>
        <div className="text-fg-32" style={{ marginBottom: 6 }}>SRC</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
        {BUS_SOURCES.map(key => (
          <span key={key} className="flex items-center" style={{ gap: 4 }}>
            <Jack
              jackId={`ch-${channelIndex}-src-${key}`}
              connected={routeFrom === key}
              pending={pendingOut?.type === 'bus' && pendingOut.key === key}
              source={{ type: 'bus', key }}
              onClick={() => setPendingOut(prev => (prev?.type === 'bus' && prev.key === key) ? null : { type: 'bus', key })}
              title={`${SEND_LABEL[key]} return as a source — drag to a target IN`}
            />
            <span className="text-fg-64">{SEND_LABEL[key]}</span>
          </span>
        ))}
        </div>
      </div>

      {/* Cross-sends — this channel INTO another channel, with a level. The last
          gap the connection audit found: the routing matrix had these as an NxN
          knob grid and the bay had nothing, so the same patch was reachable in
          one surface and invisible in the other. */}
      {channels.length > 1 && (
        <div>
          <div className="text-fg-32" style={{ marginBottom: 6 }}>CROSS-SEND</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
            {channels.map((_, j) => j === channelIndex ? null : (
              <span key={j} className="flex items-center" style={{ gap: 4 }}>
                <Jack
                  jackId={`ch-${channelIndex}-xsend-${j}`}
                  connected={(channel.routeSendLevels?.[j] || 0) > 0}
                  color={wireOf(channelIndex)}
                  onClick={() => onChannelUpdate(channelIndex, {
                    routeSendLevels: { ...(channel.routeSendLevels || {}), [j]: (channel.routeSendLevels?.[j] || 0) > 0 ? 0 : 50 },
                  })}
                  title={`Send Ch ${channelIndex + 1} into Ch ${j + 1}`}
                />
                <span className="text-fg-64">CH {j + 1}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Sends */}
      <div>
        <div className="text-fg-32" style={{ marginBottom: 6 }}>SENDS</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {BUS_SENDS.map(key => (
            <span key={key} className="flex flex-col items-center" style={{ gap: 2 }}>
              <RotaryDial
                label={SEND_LABEL[key]}
                value={sends[key] || 0}
                onChange={(v) => onChannelUpdate(channelIndex, { sends: { ...sends, [key]: v } })}
                size={30}
                compact
                variant="dense"
              />
            </span>
          ))}
        </div>
      </div>

      {/* Feedback */}
      <div>
        <div className="flex items-center" style={{ gap: 6, marginBottom: 6 }}>
          <Jack
            jackId={`ch-${channelIndex}-fb`}
            connected={feedback.enabled}
            color={wire}
            pending={false}
            onClick={() => onChannelUpdate(channelIndex, { feedback: { ...feedback, enabled: !feedback.enabled } })}
            title={feedback.enabled ? 'Feedback loop live — click to break' : 'Patch the feedback loop'}
          />
          <span className="text-fg-64">FEEDBACK</span>
          <span className="text-fg-32">{feedback.enabled ? 'looped' : '—'}</span>
        </div>
        {feedback.enabled && (
          <div className="flex" style={{ gap: 8 }}>
            <RotaryDial label="DECAY" value={feedback.decay} onChange={(v) => onChannelUpdate(channelIndex, { feedback: { ...feedback, decay: v } })} size={36} compact />
            <RotaryDial label="MIX" value={feedback.mix} onChange={(v) => onChannelUpdate(channelIndex, { feedback: { ...feedback, mix: v } })} size={36} compact />
          </div>
        )}
      </div>
    </div>
  )
}
