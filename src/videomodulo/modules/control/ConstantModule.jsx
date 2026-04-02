// ConstantModule — test source, outputs a fixed scalar value
// 4HP, one knob, one output jack

import { useState, useRef } from 'react'
import { useModule } from '../../hooks/useModuleRegistry.jsx'
import { scalar } from '../../hooks/signals'
import Module from '../utility/Module'
import JackSocket from '../utility/JackSocket'
import Knob from '../controls/Knob'
import ModuleHeader from '../controls/ModuleHeader'

export default function ConstantModule({ id = 'const1' }) {
  const [value, setValue] = useState(50)
  const [enabled, setEnabled] = useState(true)
  const valueRef = useRef(50)
  const enabledRef = useRef(true)
  const outputRef = useRef(null)
  valueRef.current = value
  enabledRef.current = enabled

  useModule({
    id,
    inputs: {},
    outputs: { value: { type: 'scalar' } },
    process: () => {
      if (!enabledRef.current) { outputRef.current = null; return { value: null } }
      const out = scalar(valueRef.current)
      outputRef.current = out
      return { value: out }
    },
  })

  return (
    <Module>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '100%',
        padding: '4px 0',
      }}>
        <ModuleHeader label="Const" enabled={enabled} onToggle={() => setEnabled(!enabled)} />

        {/* Knob */}
        <Knob value={value} onChange={setValue} />

        {/* Output jack */}
        <JackSocket
          type="out"
          port="value"
          moduleId={id}
          signalRef={outputRef}
          label="out"
        />
      </div>
    </Module>
  )
}
