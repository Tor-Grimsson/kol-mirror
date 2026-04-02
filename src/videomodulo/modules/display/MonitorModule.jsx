// MonitorModule — Canvas2D display for any signal type
// 12HP, two channels (A/B), pass-through outputs, pen input for style

import { useRef, useEffect, useState } from 'react'
import { useModule } from '../../hooks/useModuleRegistry.jsx'
import Module from '../utility/Module'
import JackSocket from '../utility/JackSocket'
import { usePatchRouting } from '../../hooks/usePatchRouting.jsx'
import ModuleHeader from '../controls/ModuleHeader'
import { drawSignal } from './drawSignal'

const BUF_LEN = 128

export default function MonitorModule({ id = 'mon1' }) {
  const canvasRef = useRef(null)
  const inputARef = useRef(null)
  const inputBRef = useRef(null)
  const penRef = useRef(null)
  const [enabled, setEnabled] = useState(true)
  const enabledRef = useRef(true)
  enabledRef.current = enabled
  const routing = usePatchRouting()

  const conns = routing?.connections || []
  const aConnected = conns.some(c => c.toModuleId === id && c.toPort === 'a')
  const bConnected = conns.some(c => c.toModuleId === id && c.toPort === 'b')
  const penConnected = conns.some(c => c.toModuleId === id && c.toPort === 'pen')

  const outARef = useRef(null)
  const outBRef = useRef(null)

  // Ring buffers for scalar scope traces
  const historyA = useRef(new Float32Array(BUF_LEN))
  const historyB = useRef(new Float32Array(BUF_LEN))
  const writeIdxRef = useRef(0)

  useModule({
    id,
    inputs: {
      a: { type: 'any' },
      b: { type: 'any' },
      pen: { type: 'pen' },
    },
    outputs: {
      a: { type: 'any' },
      b: { type: 'any' },
    },
    process: (inputs) => {
      if (!enabledRef.current) {
        inputARef.current = null; inputBRef.current = null
        outARef.current = null; outBRef.current = null; penRef.current = null
        return { a: null, b: null }
      }
      inputARef.current = inputs.a
      inputBRef.current = inputs.b
      penRef.current = inputs.pen
      outARef.current = inputs.a
      outBRef.current = inputs.b

      // Push scalar values into ring buffers
      const idx = writeIdxRef.current
      if (inputs.a && inputs.a.type === 'scalar') historyA.current[idx] = inputs.a.value
      else historyA.current[idx] = 0
      if (inputs.b && inputs.b.type === 'scalar') historyB.current[idx] = inputs.b.value
      else historyB.current[idx] = 0
      writeIdxRef.current = (idx + 1) % BUF_LEN

      return { a: inputs.a, b: inputs.b }
    },
  })

  // Resize canvas to match display size
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ro = new ResizeObserver(() => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = Math.round(rect.width)
      canvas.height = Math.round(rect.height)
    })
    ro.observe(canvas)
    return () => ro.disconnect()
  }, [])

  // Canvas drawing loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let raf

    const draw = () => {
      const w = canvas.width
      const h = canvas.height
      if (!w || !h) { raf = requestAnimationFrame(draw); return }

      ctx.fillStyle = 'rgba(8,8,8,0.95)'
      ctx.fillRect(0, 0, w, h)

      ctx.fillStyle = 'rgba(0,0,0,0.15)'
      for (let y = 0; y < h; y += 3) {
        ctx.fillRect(0, y, w, 1)
      }

      const hasB = inputBRef.current != null
      const wi = writeIdxRef.current
      const p = penRef.current

      const aw = hasB ? Math.floor(w / 2) : w
      drawSignal(ctx, inputARef.current, 0, 0, aw, h, historyA.current, wi, BUF_LEN, p)

      if (hasB) {
        ctx.fillStyle = 'rgba(40,40,40,0.5)'
        ctx.fillRect(Math.floor(w / 2), 0, 1, h)
        drawSignal(ctx, inputBRef.current, Math.floor(w / 2) + 1, 0, Math.ceil(w / 2) - 1, h, historyB.current, wi, BUF_LEN, p)
      }

      raf = requestAnimationFrame(draw)
    }

    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <Module>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        gap: 4,
        padding: '4px 0',
      }}>
        <ModuleHeader label="Mon" enabled={enabled} onToggle={() => setEnabled(!enabled)} />

        <canvas
          ref={canvasRef}
          width={160}
          height={100}
          style={{
            flex: 1,
            width: '100%',
            borderRadius: 2,
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        />

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6 }}>
          <JackSocket type="in" port="a" moduleId={id} active={aConnected} signalRef={inputARef} label="a" />
          <JackSocket type="in" port="b" moduleId={id} active={bConnected} signalRef={inputBRef} label="b" />
          <JackSocket type="in" port="pen" moduleId={id} active={penConnected} signalRef={penRef} label="pen" size="sm" />
          <div style={{ width: 1, height: 16, backgroundColor: 'rgba(255,255,255,0.08)' }} />
          <JackSocket type="out" port="a" moduleId={id} signalRef={outARef} label="a" />
          <JackSocket type="out" port="b" moduleId={id} signalRef={outBRef} label="b" />
        </div>
      </div>
    </Module>
  )
}
