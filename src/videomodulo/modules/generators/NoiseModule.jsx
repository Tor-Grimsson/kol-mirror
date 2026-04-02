// NoiseModule — random signal generator (white, pink, sample & hold)
// 4HP 1U

import { useState, useRef } from 'react'
import { useModule } from '../../hooks/useModuleRegistry.jsx'
import { scalar } from '../../hooks/signals'
import Module from '../utility/Module'
import JackSocket from '../utility/JackSocket'
import Selector from '../controls/Selector'
import ModuleHeader from '../controls/ModuleHeader'

const TYPES = ['wht', 'pnk', 's&h']

export default function NoiseModule({ id = 'noise1' }) {
  const [type, setType] = useState('wht')
  const [enabled, setEnabled] = useState(true)

  const typeRef = useRef('wht')
  const enabledRef = useRef(true)
  const outRef = useRef(null)

  // Pink noise state
  const pinkRef = useRef(50)
  // S&H state
  const shHeldRef = useRef(Math.random() * 100)
  const shTimerRef = useRef(0)

  typeRef.current = type
  enabledRef.current = enabled

  useModule({
    id,
    inputs: {},
    outputs: { out: { type: 'scalar' } },
    process: (inputs, dt) => {
      if (!enabledRef.current) { outRef.current = null; return { out: null } }

      let val
      const mode = typeRef.current

      if (mode === 'wht') {
        val = Math.random() * 100
      } else if (mode === 'pnk') {
        pinkRef.current = pinkRef.current * 0.9 + (Math.random() * 100) * 0.1
        val = pinkRef.current
      } else {
        // s&h — hold value, generate new one every 0.1s
        shTimerRef.current += dt
        if (shTimerRef.current >= 0.1) {
          shTimerRef.current -= 0.1
          shHeldRef.current = Math.random() * 100
        }
        val = shHeldRef.current
      }

      const out = scalar(val)
      outRef.current = out
      return { out }
    },
  })

  return (
    <Module>
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'space-between', height: '100%', padding: '4px 0',
      }}>
        <ModuleHeader label="Noise" enabled={enabled} onToggle={() => setEnabled(!enabled)} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Selector value={type} options={TYPES} onChange={setType} />
          <JackSocket type="out" port="out" moduleId={id} signalRef={outRef} label="out" />
        </div>
      </div>
    </Module>
  )
}
