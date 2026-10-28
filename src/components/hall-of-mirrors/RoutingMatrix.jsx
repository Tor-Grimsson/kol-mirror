import { useState } from 'react'
import { FlipIcon } from './ChannelPatchPanel'
import { Icon } from '../icons'
import Slider from '@kolkrabbi/kol-component/molecules/Slider'
import Divider from '@kolkrabbi/kol-component/atoms/Divider'
import Dropdown from '@kolkrabbi/kol-component/molecules/Dropdown'
import Modulatable from '@kolkrabbi/kol-hardware/value/Modulatable.jsx'
import Knob from '@kolkrabbi/kol-component/molecules/Knob'
import { exprBusRef } from '../../hooks/exprBus'
import { transport } from '../../hooks/transport'
import { DeskModule, ModuleFooter, ModuleTool } from './modules/ModuleFrame'
import LED from '@kolkrabbi/kol-hardware/indicators/LED.jsx'
import Tag from '@kolkrabbi/kol-component/atoms/Tag'

function Indicated({ active, children }) {
  return (
    <span style={{ position: 'relative', display: 'inline-flex' }}>
      <span className="absolute inline-flex" style={{ top: '-20px', left: '-2px' }}><LED active={active} size="md" /></span>
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

/* the matrix's channel chip — the KOL's `Tag` (plan 18 W4); the hand-drawn outline chip is in _tmp/2026-10-28-plan18/ */
function ChannelButton({ label, enabled, onClick }) {
  return <Tag hash={false} size="xs" active={enabled} onClick={onClick}>{label}</Tag>
}

/* `flipped` + `back` — the flip is the module's and turns only its panel, not
   its Channel Output shelf (user 2026-08-28: "only flip the front panel"). */
export default function RoutingMatrix({ channels = [], onChannelUpdate, master, onMasterChange, onFlip, flipped = false, back = null, jacks = null }) {
  const [shelfOpen, setShelfOpen] = useState(false)
  const [shelfTab, setShelfTab] = useState('output')

  const rtn1 = master?.rtn1 || { enabled: false, returnLevel: 0 }
  const rtn2 = master?.rtn2 || { enabled: false, returnLevel: 0 }

  // All source rows: Ch 1-3 then RTN 1-2
  const chCount = channels.length
  const dividerAfterRow = chCount // divider between ch rows and rtn rows

  return (
    <div className="flex flex-row items-stretch shrink-0" style={{ overflow: 'visible', height: '100%', maxHeight: '100%' }}>
      {/* THE STANDARD (plan 12) — header · body (the matrix) · footer (Channel Output) · back (the bay) */}
      <DeskModule
        fill
        power={{ on: master?.routingEnabled !== false, onToggle: () => onMasterChange?.({ routingEnabled: master?.routingEnabled === false }), title: master?.routingEnabled === false ? 'Sends bypassed — every channel straight to master' : 'Bypass the sends' }}
        head={<span className="text-fg-96">Routing Matrix</span>}
        headRight={(
          <span className="text-fg-96 cursor-pointer select-none" onClick={() => {
            channels.forEach((_, i) => onChannelUpdate(i, { routeFrom: null, routeSendLevels: {} }))
          }}>Reset</span>
        )}
        flipped={flipped}
        onFlip={onFlip}
        back={back}
        jacks={jacks}
        tools={(
          <>
              <ModuleTool
                icon="settings-01"
                title="Channel Output"
                active={shelfOpen && shelfTab === 'output'}
                onClick={() => { if (shelfOpen && shelfTab === 'output') { setShelfOpen(false) } else { setShelfTab('output'); setShelfOpen(true) } }}
              />
          </>
        )}
        footer={(
          <ModuleFooter row tabs={[{ value: 'output', label: 'Channel Output' }]} value="output">
            <div className="flex flex-row gap-4 flex-1 items-end">
              {channels.map((ch, i) => (
                <div key={i} className="flex items-center justify-center" style={{ width: '64px' }}>
                  <Indicated active={ch.enabled}><Modulatable label={ch.enabled ? `${i + 1}` : `Ch ${i + 1}`} value={ch.opacity ?? 0} onChange={(v) => onChannelUpdate(i, { opacity: v })} bus={exprBusRef} clock={transport} density="dense">
                    <Knob variant="panel" size="md" defaultValue={0} />
                  </Modulatable></Indicated>
                </div>
              ))}
              <div className="self-stretch w-px bg-fg-08" />
              <div className="flex items-center justify-center" style={{ width: '64px' }}>
                <Indicated active={rtn1.enabled}><Modulatable label={rtn1.enabled ? 'R1' : 'RTN 1'} value={rtn1.returnLevel ?? 0} onChange={(v) => onMasterChange?.({ rtn1: { ...rtn1, returnLevel: v } })} bus={exprBusRef} clock={transport} density="dense">
                  <Knob variant="panel" size="md" defaultValue={0} />
                </Modulatable></Indicated>
              </div>
              <div className="flex items-center justify-center" style={{ width: '64px' }}>
                <Indicated active={rtn2.enabled}><Modulatable label={rtn2.enabled ? 'R2' : 'RTN 2'} value={rtn2.returnLevel ?? 0} onChange={(v) => onMasterChange?.({ rtn2: { ...rtn2, returnLevel: v } })} bus={exprBusRef} clock={transport} density="dense">
                  <Knob variant="panel" size="md" defaultValue={0} />
                </Modulatable></Indicated>
              </div>
            </div>
          </ModuleFooter>
        )}
      >
        <div className="flex flex-row gap-4 flex-1">
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
                        onClick={() => {
                          const nextIdx = (currentIdx + 1) % sources.length
                          onChannelUpdate(i, { routeFrom: sources[nextIdx] })
                        }}
                      />
                    )
                  }),
                  <ChannelButton label="RTN 1" enabled={rtn1.enabled} />,
                  <ChannelButton label="RTN 2" enabled={rtn2.enabled} />,
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
                      <Modulatable label="" value={srcCh.routeSendLevels?.[j] || 0} onChange={(v) => onChannelUpdate(i, { routeSendLevels: { ...(srcCh.routeSendLevels || {}), [j]: v } })} bus={exprBusRef} clock={transport} density="dense">
                        <Knob variant="panel" size="md" defaultValue={0} />
                      </Modulatable>
                    )),
                    <Modulatable label="" value={rtn1.sends?.[`ch${j}`] || 0} onChange={(v) => onMasterChange?.({ rtn1: { ...rtn1, sends: { ...(rtn1.sends || {}), [`ch${j}`]: v } } })} bus={exprBusRef} clock={transport} density="dense">
                      <Knob variant="panel" size="md" defaultValue={0} />
                    </Modulatable>,
                    <Modulatable label="" value={rtn2.sends?.[`ch${j}`] || 0} onChange={(v) => onMasterChange?.({ rtn2: { ...rtn2, sends: { ...(rtn2.sends || {}), [`ch${j}`]: v } } })} bus={exprBusRef} clock={transport} density="dense">
                      <Knob variant="panel" size="md" defaultValue={0} />
                    </Modulatable>,
                  ]}
                />
              ))}
              <div className="self-stretch w-px bg-fg-08" />
              {/* RTN destination columns */}
              <MatrixColumn
                header={<ChannelButton label="RTN 1" enabled={rtn1.enabled} />}
                dividerAfter={dividerAfterRow}
                rows={[
                  ...channels.map((srcCh, i) => (
                    <Modulatable label="" value={srcCh.sends?.rtn1 || 0} onChange={(v) => onChannelUpdate(i, { sends: { ...(srcCh.sends || {}), rtn1: v } })} bus={exprBusRef} clock={transport} density="dense">
                      <Knob variant="panel" size="md" defaultValue={0} />
                    </Modulatable>
                  )),
                  <Modulatable label="" value={rtn1.sends?.rtn1 || 0} onChange={(v) => onMasterChange?.({ rtn1: { ...rtn1, sends: { ...(rtn1.sends || {}), rtn1: v } } })} bus={exprBusRef} clock={transport} density="dense">
                    <Knob variant="panel" size="md" defaultValue={0} />
                  </Modulatable>,
                  <Modulatable label="" value={rtn2.sends?.rtn1 || 0} onChange={(v) => onMasterChange?.({ rtn2: { ...rtn2, sends: { ...(rtn2.sends || {}), rtn1: v } } })} bus={exprBusRef} clock={transport} density="dense">
                    <Knob variant="panel" size="md" defaultValue={0} />
                  </Modulatable>,
                ]}
              />
              <MatrixColumn
                header={<ChannelButton label="RTN 2" enabled={rtn2.enabled} />}
                dividerAfter={dividerAfterRow}
                rows={[
                  ...channels.map((srcCh, i) => (
                    <Modulatable label="" value={srcCh.sends?.rtn2 || 0} onChange={(v) => onChannelUpdate(i, { sends: { ...(srcCh.sends || {}), rtn2: v } })} bus={exprBusRef} clock={transport} density="dense">
                      <Knob variant="panel" size="md" defaultValue={0} />
                    </Modulatable>
                  )),
                  <Modulatable label="" value={rtn1.sends?.rtn2 || 0} onChange={(v) => onMasterChange?.({ rtn1: { ...rtn1, sends: { ...(rtn1.sends || {}), rtn2: v } } })} bus={exprBusRef} clock={transport} density="dense">
                    <Knob variant="panel" size="md" defaultValue={0} />
                  </Modulatable>,
                  <Modulatable label="" value={rtn2.sends?.rtn2 || 0} onChange={(v) => onMasterChange?.({ rtn2: { ...rtn2, sends: { ...(rtn2.sends || {}), rtn2: v } } })} bus={exprBusRef} clock={transport} density="dense">
                    <Knob variant="panel" size="md" defaultValue={0} />
                  </Modulatable>,
                ]}
              />
              {/* FB column */}
              <MatrixColumn
                width={48}
                header={<div />}
                dividerAfter={dividerAfterRow}
                rows={[
                  ...channels.map((ch, i) => (
                    <Tag
                      hash={false}
                      size="xs"
                      active={ch.routeSendLevels?.[i] > 0}
                      onClick={() => onChannelUpdate(i, { routeSendLevels: { ...(ch.routeSendLevels || {}), [i]: ch.routeSendLevels?.[i] > 0 ? 0 : 50 } })}
                    >FB</Tag>
                  )),
                  <Tag hash={false} size="xs">FB</Tag>,
                  <Tag hash={false} size="xs">FB</Tag>,
                ]}
              />
          </div>
          <div className="self-stretch w-px bg-fg-08" />
        </div>
      </DeskModule>

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
