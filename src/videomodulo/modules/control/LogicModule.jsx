// LogicModule — boolean logic gates for control signals
// 4HP

import { useState, useRef } from 'react'
import { useModule } from '../../hooks/useModuleRegistry.jsx'
import { scalar, readScalar } from '../../hooks/signals'
import Module from '../utility/Module'
import JackSocket from '../utility/JackSocket'
import Selector from '../controls/Selector'
import ModuleHeader from '../controls/ModuleHeader'
import { usePatchRouting } from '../../hooks/usePatchRouting.jsx'

const MODES = ['and', 'or', 'xor', 'not', 'nand', 'nor']

function logic(mode, a, b) {
  switch (mode) {
    case 'and':  return a && b
    case 'or':   return a || b
    case 'xor':  return a !== b
    case 'not':  return !a
    case 'nand': return !(a && b)
    case 'nor':  return !(a || b)
    default:     return false
  }
}

export default function LogicModule({ id = 'logic1' }) {
  const [mode, setMode] = useState('and')
  const [enabled, setEnabled] = useState(true)
  const routing = usePatchRouting()

  const modeRef = useRef('and')
  const enabledRef = useRef(true)
  const outputRef = useRef(null)
  const aInRef = useRef(null)
  const bInRef = useRef(null)

  modeRef.current = mode
  enabledRef.current = enabled

  const conns = routing?.connections || []
  const aConnected = conns.some(c => c.toModuleId === id && c.toPort === 'a')
  const bConnected = conns.some(c => c.toModuleId === id && c.toPort === 'b')

  useModule({
    id,
    inputs: { a: { type: 'scalar' }, b: { type: 'scalar' } },
    outputs: { out: { type: 'scalar' } },
    process: (inputs) => {
      if (!enabledRef.current) { outputRef.current = null; return { out: null } }
      aInRef.current = inputs.a
      bInRef.current = inputs.b

      const aHigh = readScalar(inputs.a) > 50
      const bHigh = readScalar(inputs.b) > 50
      const result = logic(modeRef.current, aHigh, bHigh)
      const out = scalar(result ? 100 : 0)
      outputRef.current = out
      return { out }
    },
  })

  return (
    <Module>
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'space-between', height: '100%', padding: '4px 0',
      }}>
        <ModuleHeader label="Logic" enabled={enabled} onToggle={() => setEnabled(!enabled)} />

        <Selector value={mode} options={MODES} onChange={setMode} />

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
          <div style={{ display: 'flex', gap: 4 }}>
            <JackSocket type="in" port="a" moduleId={id} active={aConnected} signalRef={aInRef} label="a" />
            <JackSocket type="in" port="b" moduleId={id} active={bConnected} signalRef={bInRef} label="b" />
          </div>
          <div style={{ width: '80%', height: 1, backgroundColor: 'rgba(255,255,255,0.08)' }} />
          <div style={{ display: 'flex', gap: 4 }}>
            <JackSocket type="out" port="out" moduleId={id} signalRef={outputRef} label="out" />
          </div>
        </div>
      </div>
    </Module>
  )
}
