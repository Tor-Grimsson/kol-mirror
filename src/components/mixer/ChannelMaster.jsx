import { useLayoutEffect, useRef, useState } from 'react'
import Slider from '@kolkrabbi/kol-component/molecules/Slider'
import Modulatable from '@kolkrabbi/kol-hardware/value/Modulatable.jsx'
import Knob from '@kolkrabbi/kol-component/molecules/Knob'
import { exprBusRef } from '../../hooks/exprBus'
import { transport } from '../../hooks/transport'
import LED from '@kolkrabbi/kol-hardware/indicators/LED.jsx'
import Tag from '@kolkrabbi/kol-component/atoms/Tag'

/* The fader fills whatever height the strip leaves it (62–123px on the desk), so the KOL panel
   slider gets the measured height — it takes px, not flex. */
function Fader({ value, onChange }) {
  const box = useRef(null)
  const [h, setH] = useState(0)
  useLayoutEffect(() => {
    const ro = new ResizeObserver(([e]) => setH(Math.round(e.contentRect.height)))
    ro.observe(box.current)
    return () => ro.disconnect()
  }, [])
  return (
    <div ref={box} className="flex-1 flex justify-center" style={{ width: 64, minHeight: 60 }}>
      {h > 0 && <Slider variant="panel" direction="vertical" height={h} min={0} max={100} value={value} onChange={onChange} />}
    </div>
  )
}

export default function ChannelMaster({
  label = 'Ch 1',
  knobs = [],
  faderValue = 80,
  onFaderChange,
  enabled = true,
  onEnabledChange,
  onReset,
}) {
  const [bank, setBank] = useState(0)

  const visibleKnobs = knobs.slice(bank * 2, bank * 2 + 2)

  return (
    <div className="flex flex-col items-center gap-3 self-stretch" style={{ position: 'relative' }}>
      <span className="absolute inline-flex" style={{ top: '-4px', left: '-2px' }}><LED active={enabled} size="md" /></span>
      {/* Knobs */}
      <div className="flex flex-col items-center">
        {visibleKnobs.map((knob, i) => (
          <Modulatable key={knob.label || i} label={knob.label} value={knob.value} onChange={knob.onChange} bus={exprBusRef} clock={transport} density="dense">
            <Knob variant="panel" size="md" defaultValue={0} />
          </Modulatable>
        ))}
      </div>
      {/* Channel button above fader */}
      <Tag hash={false} size="xs" active={enabled} onClick={() => onEnabledChange && onEnabledChange(!enabled)}>{label}</Tag>
      {/* Fader */}
      <Fader value={faderValue} onChange={onFaderChange} />
      {/* A / B buttons */}
      <div className="flex items-center gap-3">
        <Tag hash={false} size="xs" active={bank === 1} onClick={() => setBank(bank === 1 ? 0 : 1)}>A</Tag>
        <Tag hash={false} size="xs" active={bank === 2} onClick={() => setBank(bank === 2 ? 0 : 2)}>B</Tag>
      </div>
    </div>
  )
}
