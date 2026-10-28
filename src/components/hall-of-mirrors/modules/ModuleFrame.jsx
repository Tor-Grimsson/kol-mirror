import Divider from '@kolkrabbi/kol-component/atoms/Divider'
import { Icon } from '../../icons'
import { FlipIcon } from '../ChannelPatchPanel'
import { JackStrip } from './JackStrip'
import { BAND } from './bands'
import LED from '@kolkrabbi/kol-hardware/indicators/LED.jsx'
import IconButton from '@kolkrabbi/kol-hardware/switches/IconButton.jsx'

/* THE DESK'S MODULE FRAME — one shape for every module on the desk (user
   2026-10-16: *"the fucking system doesnt work if modules dont adhere to the
   same system"*; 2026-10-15 on Input: *"we have established format"*). It was
   copied inline into each module and drifted — half the desk still carried the
   older flat header. Now there is one.

     ModuleTab    the 29px title tab — name left, state right
     ModuleFrame  the tab over the panel, at the desk's height

   A flipping module (Transport, Master, Routing, Generator, Channel) takes
   ModuleTab alone and puts its flip scene under it, so the tab never turns. */
export function ModuleTab({ children, style }) {
  return (
    <div
      className="flex items-center justify-between kol-helper-12 mx-2 px-3 border border-fg-08 border-b-0 shrink-0 bg-surface-tertiary"
      style={{ borderRadius: '4px 4px 0 0', height: 29, ...style }}
    >
      {children}
    </div>
  )
}

export default function ModuleFrame({ head, width, className = '', children }) {
  return (
    <div className="flex flex-col shrink-0" style={{ height: '100%', maxHeight: '100%', width }}>
      <ModuleTab>{head}</ModuleTab>
      <div className={`flex flex-col flex-1 bg-surface-secondary border border-fg-08 ${className}`} style={{ borderRadius: 4, minHeight: 0 }}>
        {children}
      </div>
    </div>
  )
}

/* ── THE MODULE STANDARD (plan 12, 2026-10-24) ─────────────────────────────────────────────────────
   The user: *"this format is THE STANDARD. as in it has 3 elements on the front: 1. header 2. Body
   3. footer … 4. every module also has a back side for things that doesnt fit there."* Read from the
   two modules he called correct, Channel and Master Out:

     header   ModuleTab — inset 8px, never turns
     body     the raised plate (--kol-oq-04, kol-hardware ChannelStrip's) — wider than the bands,
              the main controls left, the tools column right, the text-button row last. It flips.
     footer   ModuleFooter — inset 8px: a text-tab row (+ readout), that tab's rows, then the jacks
     back     the body's other face

   `DeskModule` draws all four, so no module draws its own again. */

/**
 * ModuleFooter — the footer band: the text-tab row and its rows. Lifted from the Channel's FX rack.
 * @param {Array}    tabs      `[{ value, label, dim?, title? }]` — `dim`: nothing behind it yet (Master's empty IN). Omit for no tabs
 * @param {string}   value · onChange
 * @param {ReactNode} readout  the tab row's right end (the Channel's render cost)
 * @param {number}   width     the plate's width — the band insets 8px each side
 * @param {boolean}  row       the rows sit side by side (Master's strips), not stacked
 */
export function ModuleFooter({ tabs, value, onChange, readout, width, row = false, children }) {
  /* THE SAME SECTIONS, ALWAYS (plan 14 § 2.1): the tab row is drawn at its height whether or not the module has
     tabs, and the band always sits on a jack row — square below, `square` is gone */
  return (
    <div
      className="flex flex-col mx-2 border border-fg-08 border-t-0 kol-helper-12 shrink-0"
      style={{ borderRadius: 0, backgroundColor: 'var(--kol-surface-tertiary)', height: BAND.footer, overflow: 'hidden', width: width ? width - 16 : undefined, paddingTop: '4px' }}
    >
      {(
        <div className="flex items-center justify-between px-4 border-b border-fg-08 shrink-0" style={{ backgroundColor: 'var(--kol-surface-tertiary)', height: BAND.tabs }}>
          <div className="flex items-center gap-3" style={{ overflowX: 'auto', scrollbarWidth: 'none' }}>
            {(tabs || []).map((t) => (
              <span
                key={t.value}
                className={`cursor-pointer select-none uppercase shrink-0 ${value === t.value ? 'text-fg-96' : t.dim ? 'text-fg-16 hover:text-fg-48' : 'text-fg-32 hover:text-fg-64'}`}
                onClick={() => onChange?.(t.value)}
                title={t.title}
              >
                {t.label}
              </span>
            ))}
          </div>
          {readout}
        </div>
      )}
      {row
        ? <div className="flex items-stretch flex-1 gap-4 px-2 py-2 kol-helper-12">{children}</div>
        : <div className="flex flex-col gap-2 px-4 py-3" style={{ overflow: 'auto', flex: '1 1 0', minHeight: 0 }}>{children}</div>}
    </div>
  )
}

/** One tool key for the body's right column — opens the module's shelf tab. kol-hardware's `IconButton` (plan 18 W4)
    with Mirror's icon registry through its `iconComponent` seam. */
export function ModuleTool({ icon, iconSize = 16, title, active = false, onClick }) {
  return <IconButton icon={icon} iconSize={iconSize} title={title} active={active} onClick={onClick} iconComponent={Icon} />
}

/** One verb in the body's text-button row (RESET · REC/LOOP · BOOST). `tone`: an ink for a lit state. */
export function ModuleAction({ children, onClick, title, dim = false, tone }) {
  return (
    <div
      className={`cursor-pointer select-none ${tone ? '' : dim ? 'text-fg-32' : 'text-fg-96'}`}
      style={tone ? { color: tone } : undefined}
      onClick={onClick}
      title={title}
    >
      {children}
    </div>
  )
}

/**
 * DeskModule — header · body · footer · back, the standard.
 * @param {number}    width      the plate's width (Channel 320); the header and footer inset 8px
 * @param {ReactNode} head       the header's left (lamp + name)
 * @param {ReactNode} headRight  the header's right (state, a verb) — the FlipIcon follows when there is a back
 * @param {ReactNode} children   the body's main controls (left column)
 * @param {ReactNode} tools      the body's right column (`ModuleTool`s)
 * @param {ReactNode} rows       full-width rows under the main controls (the Channel's sliders)
 * @param {ReactNode} actions    the text-button row that closes the body (`ModuleAction`s)
 * @param {ReactNode} footer     a `ModuleFooter`
 * @param {ReactNode} jacks      the jack row (`StripPort`s) at the foot
 * @param {ReactNode} back       the body's other face
 * @param {boolean}   flipped · onFlip
 * @param {boolean}   fill       the module fills the desk's height and the plate takes what the bands leave (Master)
 */

/* THE POWER SWITCH (plan 16 W5, user 2026-10-25: *"all modules header need on off button like master out"*) —
   kol-hardware's `LED` (plan 18 W4; the hand-drawn ring + lamp is in _tmp/2026-10-28-plan18/), red when on. `onToggle` absent → a read-only lamp (Patch).
   `children` ride the switch (Channel's right-click Remove menu). */
export function PowerSwitch({ on, onToggle, title, onContextMenu, children }) {
  return (
    <span
      className={`relative select-none flex items-center justify-center shrink-0 ${onToggle ? 'cursor-pointer' : ''}`}
      style={{ width: 16, height: 16 }}
      onClick={onToggle}
      onContextMenu={onContextMenu}
      title={title ?? (on ? 'On' : 'Off')}
      data-power={on ? 'on' : 'off'}
    >
      <LED active={on} size="md" />
      {children}
    </span>
  )
}

export function DeskModule({ width, head, headRight, power, children, tools, rows, actions, footer, jacks, back, flipped = false, onFlip, fill = true }) {
  const grow = fill ? { flex: 1, minHeight: 0 } : undefined
  const col = fill ? 'flex flex-col' : ''
  return (
    <div className="flex flex-col shrink-0" style={{ width, ...(fill ? { height: '100%', maxHeight: '100%' } : null) }}>
      <ModuleTab style={{ height: BAND.head }}>
        <span className="flex items-center gap-3 min-w-0">
          {power && <PowerSwitch {...power} />}
          <span className={`min-w-0 ${power && !power.on ? '[&_*]:!text-fg-32 text-fg-32' : ''}`}>{head}</span>
        </span>
        <span className="flex items-center gap-3 shrink-0">
          {headRight}
          {back && <FlipIcon onFlip={onFlip} title={flipped ? 'Flip to the front' : 'Flip to the back'} />}
        </span>
      </ModuleTab>
      <div className={`mirror-flip-scene ${col}`} style={{ width, ...grow }}>
        <div className={`mirror-flip-inner ${col} ${flipped ? 'is-flipped' : ''}`} style={grow}>
          <div className={`mirror-flip-front ${col}`} style={grow}>
            <div
              className={`flex flex-col items-center gap-4 p-4 pb-0 border border-fg-08 relative ${fill ? 'flex-1' : ''}`}
              style={{ backgroundColor: 'var(--kol-oq-04)', borderRadius: '4px', overflow: 'hidden', width, zIndex: 1, ...(fill ? { minHeight: 0 } : null) }}
            >
              <div className="w-full flex items-stretch gap-4 flex-1" style={{ minHeight: 0 }}>
                <div className="flex flex-col flex-1 gap-2 min-w-0">{children}</div>
                {tools && <div className="flex flex-col gap-2">{tools}</div>}
              </div>
              {rows && <div className="w-full flex flex-col shrink-0" style={{ gap: '4px' }}>{rows}</div>}
              {/* the plate's text-button row — drawn on every module, empty when it has no verbs */}
              <div className="w-full shrink-0" style={{ height: BAND.actions }}>
                <Divider />
                <div className="flex items-center justify-between kol-helper-12" style={{ height: BAND.actions - 1 }}>{actions}</div>
              </div>
            </div>
          </div>
          {back && (
            <div className="mirror-flip-back" style={{ overflowY: 'auto', scrollbarWidth: 'none' }}>
              {back}
            </div>
          )}
        </div>
      </div>
      {/* the footer band — the module's own, or an empty one at the same height */}
      {footer || <ModuleFooter width={width} />}
      {/* the jack row — always, empty when the module has no jacks on its front */}
      <JackStrip width={width} under>{jacks}</JackStrip>
    </div>
  )
}

/** ModuleBack — the back face's panel: the channel bay's ground and padding, so every back reads as one object. */
export function ModuleBack({ children }) {
  return (
    <div className="flex flex-col h-full bg-surface-secondary border border-fg-08 kol-helper-12" style={{ borderRadius: 4, padding: 12, gap: 8, overflowY: 'auto' }}>
      {children}
    </div>
  )
}
