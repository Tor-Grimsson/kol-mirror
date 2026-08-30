import { useState } from 'react'
import { FlipIcon } from './ChannelPatchPanel'
import { Icon } from '../icons'
import Slider from '../atoms/Slider'
import Divider from '../atoms/Divider'
import Dropdown from '../molecules/Dropdown'
import RotaryDial from './RotaryDial'

function Indicated({ active, children }) {
  return (
    <span style={{ position: 'relative', display: 'inline-flex' }}>
      <span className={`absolute w-2 h-2 rounded-full ${active ? 'bg-[#e74c3c]' : 'bg-fg-24'}`} style={{ top: '-20px', left: '-2px' }} />
      {children}
    </span>
  )
}

function MatrixColumn({ header, headerStyle, rows, dividerAfter = -1, width = 64 }) {
  return (
    <div className="flex flex-col items-center" style={{ width: `${width}px` }}>
      <div className="flex items-end justify-center pb-1" style={{ height: '28px' }}>{header}</div>
      {rows.map((row, i) => (
        <div key={i}>
          {i === dividerAfter && <Divider className="my-1" />}
          <div className="flex items-center justify-center" style={{ height: '56px' }}>{row}</div>
        </div>
      ))}
    </div>
  )
}

function ChannelButton({ label, enabled, accent = '#e74c3c', onClick }) {
  return (
    <div
      className={`kol-helper-10 select-none flex items-center justify-center uppercase ${onClick ? 'cursor-pointer' : ''}`}
      style={{ height: '20px', padding: '0 8px', borderRadius: '2px', border: `1px solid ${enabled ? accent : 'var(--kol-fg-16)'}`, color: enabled ? accent : 'var(--kol-fg-32)' }}
      onClick={onClick}
    >{label}</div>
  )
}

/* `flipped` + `back` — the flip is the module's and turns only its panel, not
   its Channel Output shelf (user 2026-08-28: "only flip the front panel"). */
export default function RoutingMatrix({ channels = [], onChannelUpdate, master, onMasterChange, onFlip, flipped = false, back = null }) {
  const [shelfOpen, setShelfOpen] = useState(false)
  const [shelfTab, setShelfTab] = useState('output')

  const rtn1 = master?.rtn1 || { enabled: false, returnLevel: 0 }
  const rtn2 = master?.rtn2 || { enabled: false, returnLevel: 0 }

  // All source rows: Ch 1-3 then RTN 1-2
  const chCount = channels.length
  const dividerAfterRow = chCount // divider between ch rows and rtn rows

  return (
    <div className="flex flex-row items-stretch shrink-0" style={{ overflow: 'visible', height: '100%', maxHeight: '100%' }}>
      <div className="flex flex-col shrink-0" style={{ height: '100%', maxHeight: '100%' }}>
        {/* only THIS — header + matrix — turns; Channel Output stays put */}
        <div className="mirror-flip-scene flex flex-col" style={{ flex: 1, minHeight: 0 }}>
        <div className={`mirror-flip-inner flex flex-col ${flipped ? 'is-flipped' : ''}`} style={{ flex: 1, minHeight: 0 }}>
        <div className="mirror-flip-front flex flex-col" style={{ flex: 1, minHeight: 0 }}>
        {/* Header */}
        <div className="flex items-center justify-between kol-helper-12 mx-2 px-3 border border-fg-08 border-b-0 shrink-0 bg-surface-tertiary" style={{ borderRadius: '4px 4px 0 0', height: '29px' }}>
          <span className="text-fg-96">Routing Matrix</span>
          <span className="flex items-center gap-3">
            <span className="text-fg-96 cursor-pointer select-none" onClick={() => {
              channels.forEach((_, i) => onChannelUpdate(i, { routeFrom: null, routeSendLevels: {} }))
            }}>Reset</span>
            <FlipIcon onFlip={onFlip} title="Flip to patch bay" />
          </span>
        </div>

        {/* Card body */}
        <div
          className="flex flex-col items-center gap-4 p-4 bg-surface-secondary border border-fg-08 relative flex-1"
          style={{ borderRadius: '4px', overflow: 'visible', zIndex: 1, minHeight: 0 }}
        >
          <div className="w-full flex items-stretch gap-4 flex-1">
            <div className="flex flex-row gap-4 flex-1">
              {/* Row label column */}
              <MatrixColumn
                width={52}
                header={<div />}
                dividerAfter={dividerAfterRow}
                rows={[
                  ...channels.map((ch, i) => {
                    const BUS_SOURCES = ['rtn1', 'rtn2', 'aux1', 'aux2', 'fx1', 'fx2']
                    const BUS_LABELS = { rtn1: 'RTN 1', rtn2: 'RTN 2', aux1: 'AUX 1', aux2: 'AUX 2', fx1: 'FX 1', fx2: 'FX 2' }
                    /* Self INCLUDED (2026-08-27): the patch bay allows Ch n -> Ch n and the
                       engine reads a cycle as last frame's buffer, so filtering it out here
                       made two UIs disagree about the same state. A mixer allows the
                       connection; it does not argue about it. */
                    const sources = [null, ...channels.map((_, j) => j), ...BUS_SOURCES]
                    const currentIdx = sources.indexOf(ch.routeFrom)
                    const rf = ch.routeFrom
                    const label = rf == null ? `Ch ${i + 1}` : (typeof rf === 'string' ? (BUS_LABELS[rf] || rf) : `Ch ${rf + 1}`)
                    const isRouted = rf != null
                    return (
                      <ChannelButton
                        label={label}
                        enabled={isRouted || ch.enabled}
                        accent={isRouted ? 'var(--kol-accent-primary)' : '#e74c3c'}
                        onClick={() => {
                          const nextIdx = (currentIdx + 1) % sources.length
                          onChannelUpdate(i, { routeFrom: sources[nextIdx] })
                        }}
                      />
                    )
                  }),
                  <ChannelButton label="RTN 1" enabled={rtn1.enabled} accent="#3b82f6" />,
                  <ChannelButton label="RTN 2" enabled={rtn2.enabled} accent="#3b82f6" />,
                ]}
              />
              {/* Ch destination columns */}
              {channels.map((destCh, j) => (
                <MatrixColumn
                  key={`col-${j}`}
                  header={<ChannelButton label={`Ch ${j + 1}`} enabled={destCh.enabled} />}
                  dividerAfter={dividerAfterRow}
                  rows={[
                    ...channels.map((srcCh, i) => (
                      <RotaryDial label="" value={srcCh.routeSendLevels?.[j] || 0} onChange={(v) => onChannelUpdate(i, { routeSendLevels: { ...(srcCh.routeSendLevels || {}), [j]: v } })} size={22} compact variant="dense" />
                    )),
                    <RotaryDial label="" value={rtn1.sends?.[`ch${j}`] || 0} onChange={(v) => onMasterChange?.({ rtn1: { ...rtn1, sends: { ...(rtn1.sends || {}), [`ch${j}`]: v } } })} size={22} compact variant="dense" />,
                    <RotaryDial label="" value={rtn2.sends?.[`ch${j}`] || 0} onChange={(v) => onMasterChange?.({ rtn2: { ...rtn2, sends: { ...(rtn2.sends || {}), [`ch${j}`]: v } } })} size={22} compact variant="dense" />,
                  ]}
                />
              ))}
              <Divider variant="vertical" />
              {/* RTN destination columns */}
              <MatrixColumn
                header={<ChannelButton label="RTN 1" enabled={rtn1.enabled} accent="#3b82f6" />}
                dividerAfter={dividerAfterRow}
                rows={[
                  ...channels.map((srcCh, i) => (
                    <RotaryDial label="" value={srcCh.sends?.rtn1 || 0} onChange={(v) => onChannelUpdate(i, { sends: { ...(srcCh.sends || {}), rtn1: v } })} size={22} compact variant="dense" />
                  )),
                  <RotaryDial label="" value={rtn1.sends?.rtn1 || 0} onChange={(v) => onMasterChange?.({ rtn1: { ...rtn1, sends: { ...(rtn1.sends || {}), rtn1: v } } })} size={22} compact variant="dense" />,
                  <RotaryDial label="" value={rtn2.sends?.rtn1 || 0} onChange={(v) => onMasterChange?.({ rtn2: { ...rtn2, sends: { ...(rtn2.sends || {}), rtn1: v } } })} size={22} compact variant="dense" />,
                ]}
              />
              <MatrixColumn
                header={<ChannelButton label="RTN 2" enabled={rtn2.enabled} accent="#3b82f6" />}
                dividerAfter={dividerAfterRow}
                rows={[
                  ...channels.map((srcCh, i) => (
                    <RotaryDial label="" value={srcCh.sends?.rtn2 || 0} onChange={(v) => onChannelUpdate(i, { sends: { ...(srcCh.sends || {}), rtn2: v } })} size={22} compact variant="dense" />
                  )),
                  <RotaryDial label="" value={rtn1.sends?.rtn2 || 0} onChange={(v) => onMasterChange?.({ rtn1: { ...rtn1, sends: { ...(rtn1.sends || {}), rtn2: v } } })} size={22} compact variant="dense" />,
                  <RotaryDial label="" value={rtn2.sends?.rtn2 || 0} onChange={(v) => onMasterChange?.({ rtn2: { ...rtn2, sends: { ...(rtn2.sends || {}), rtn2: v } } })} size={22} compact variant="dense" />,
                ]}
              />
              {/* FB column */}
              <MatrixColumn
                width={48}
                header={<div />}
                dividerAfter={dividerAfterRow}
                rows={[
                  ...channels.map((ch, i) => (
                    <div
                      className={`kol-helper-10 cursor-pointer select-none flex items-center justify-center uppercase border ${ch.routeSendLevels?.[i] > 0 ? 'border-accent-primary accentYellow' : 'border-fg-16 text-fg-96 hover:border-accent-primary hover:accentYellow'}`}
                      style={{ height: '20px', padding: '0 6px', borderRadius: '2px' }}
                      onClick={() => onChannelUpdate(i, { routeSendLevels: { ...(ch.routeSendLevels || {}), [i]: ch.routeSendLevels?.[i] > 0 ? 0 : 50 } })}
                    >FB</div>
                  )),
                  <div className="kol-helper-10 cursor-pointer select-none flex items-center justify-center uppercase border border-fg-16 text-fg-96 hover:border-accent-primary hover:accentYellow" style={{ height: '20px', padding: '0 6px', borderRadius: '2px' }}>FB</div>,
                  <div className="kol-helper-10 cursor-pointer select-none flex items-center justify-center uppercase border border-fg-16 text-fg-96 hover:border-accent-primary hover:accentYellow" style={{ height: '20px', padding: '0 6px', borderRadius: '2px' }}>FB</div>,
                ]}
              />
            </div>
            <Divider variant="vertical" />
            {/* Shelf tab button */}
            <div className="flex flex-col gap-2">
              <div
                className={`cursor-pointer select-none flex items-center justify-center border transition-all ${shelfOpen && shelfTab === 'output' ? 'border-accent-primary accentYellow' : 'border-fg-16 text-fg-96 hover:border-accent-primary hover:accentYellow'}`}
                style={{ borderRadius: '4px', width: '28px', height: '28px' }}
                onClick={() => { if (shelfOpen && shelfTab === 'output') { setShelfOpen(false) } else { setShelfTab('output'); setShelfOpen(true) } }}
                title="Channel Output"
              >
                <Icon name="settings-02" size={16} />
              </div>
            </div>
          </div>
        </div>

        </div>
        <div className="mirror-flip-back" style={{ overflow: 'auto' }}>{back}</div>
        </div>
        </div>

        {/* Bottom section — Channel Output */}
        <div className="flex flex-col mx-2 border border-fg-08 border-t-0 bg-surface-tertiary" style={{ borderRadius: '0 0 4px 4px', height: '124px', paddingTop: '4px' }}>
          <div className="flex items-center justify-between px-4 py-2 border-b border-fg-08 kol-helper-12">
            <span className="text-fg-96 uppercase">Channel Output</span>
          </div>
          <div className="flex items-stretch flex-1 gap-4 px-2 py-2">
            <div className="flex flex-row gap-4 flex-1 items-end">
              {channels.map((ch, i) => (
                <div key={i} className="flex items-center justify-center" style={{ width: '64px' }}>
                  <Indicated active={ch.enabled}><RotaryDial label={ch.enabled ? `${i + 1}` : `Ch ${i + 1}`} value={ch.opacity ?? 0} onChange={(v) => onChannelUpdate(i, { opacity: v })} size={22} compact variant="dense" /></Indicated>
                </div>
              ))}
              <Divider variant="vertical" />
              <div className="flex items-center justify-center" style={{ width: '64px' }}>
                <Indicated active={rtn1.enabled}><RotaryDial label={rtn1.enabled ? 'R1' : 'RTN 1'} value={rtn1.returnLevel ?? 0} onChange={(v) => onMasterChange?.({ rtn1: { ...rtn1, returnLevel: v } })} size={22} compact variant="dense" /></Indicated>
              </div>
              <div className="flex items-center justify-center" style={{ width: '64px' }}>
                <Indicated active={rtn2.enabled}><RotaryDial label={rtn2.enabled ? 'R2' : 'RTN 2'} value={rtn2.returnLevel ?? 0} onChange={(v) => onMasterChange?.({ rtn2: { ...rtn2, returnLevel: v } })} size={22} compact variant="dense" /></Indicated>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div
                className="border border-fg-16 text-fg-96 flex items-center justify-center"
                style={{ borderRadius: '4px', width: '28px', height: '28px', visibility: 'hidden' }}
              >
                <Icon name="circle" size={16} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Shelf — Channel Output detail */}
      {shelfOpen && (
        <div
          className="flex flex-col px-4 pt-3 pb-4 border border-fg-08 kol-helper-12 relative self-stretch"
          style={{ borderRadius: '0 4px 4px 0', backgroundColor: 'var(--kol-surface-tertiary)', width: '280px', marginLeft: '-12px', paddingLeft: '28px' }}
        >
          <div className="flex items-center gap-3 pb-2 mb-2 -mx-4 px-4 border-b border-fg-08">
            <span className={`cursor-pointer select-none uppercase ${shelfTab === 'output' ? 'text-fg-96' : 'text-fg-32 hover:text-fg-64'}`} onClick={() => setShelfTab('output')}>
              OUTPUT
            </span>
          </div>
          <div style={{ overflow: 'auto', flex: '1 1 0', minHeight: 0, scrollbarWidth: 'none' }}>
            <div className="flex flex-col gap-3">
              {channels.map((ch, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between" style={{ height: '24px' }}>
                    <span className={`kol-helper-12 ${ch.enabled ? 'text-fg-96' : 'text-fg-32'}`}>Ch {i + 1}</span>
                    <span
                      className={`kol-helper-12 cursor-pointer select-none ${ch.enabled ? 'text-fg-96' : 'text-fg-32'}`}
                      onClick={() => onChannelUpdate(i, { enabled: !ch.enabled })}
                    >
                      {ch.enabled ? 'ON' : 'OFF'}
                    </span>
                  </div>
                  <Slider
                    label="Level"
                    min={0}
                    max={100}
                    step={1}
                    value={ch.opacity ?? 100}
                    onChange={(v) => onChannelUpdate(i, { opacity: v })}
                    formatValue={(v) => `${Math.round(v)}%`}
                    variant="minimal"
                  />
                  <div className="flex items-center justify-between kol-helper-12" style={{ height: '24px' }}>
                    <span className="text-fg-96">Blend</span>
                    <Dropdown
                      options={[
                        { value: 'normal', label: 'Normal' },
                        { value: 'multiply', label: 'Multiply' },
                        { value: 'screen', label: 'Screen' },
                        { value: 'overlay', label: 'Overlay' },
                        { value: 'difference', label: 'Diff' },
                        { value: 'exclusion', label: 'Excl' },
                        { value: 'color-dodge', label: 'Dodge' },
                        { value: 'color-burn', label: 'Burn' },
                      ]}
                      value={ch.blendMode || 'normal'}
                      onChange={(v) => onChannelUpdate(i, { blendMode: v })}
                      variant="minimal"
                      size="md"
                    />
                  </div>
                  {i < channels.length - 1 && <Divider className="mt-1" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
