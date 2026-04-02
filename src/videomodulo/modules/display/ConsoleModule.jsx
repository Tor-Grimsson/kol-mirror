// ConsoleModule — 4-channel mixing console with 2 send/return + master output
// 48HP — endpoint for compositing, routing, and display

import { useRef, useEffect, useState } from 'react'
import { useModule } from '../../hooks/useModuleRegistry.jsx'
import { readScalar } from '../../hooks/signals'
import Module from '../utility/Module'
import JackSocket from '../utility/JackSocket'
import Knob from '../controls/Knob'
import Fader from '../controls/Fader'
import Toggle from '../controls/Toggle'
import ModuleHeader from '../controls/ModuleHeader'
import { usePatchRouting } from '../../hooks/usePatchRouting.jsx'
import { drawSignal } from './drawSignal'

const BUF_LEN = 128
const CHS = ['a', 'b', 'c', 'd']

export default function ConsoleModule({ id = 'console1', init }) {
  const canvasRef = useRef(null)

  // Channel levels
  const [lvlA, setLvlA] = useState(init?.lvlA ?? 100)
  const [lvlB, setLvlB] = useState(init?.lvlB ?? 100)
  const [lvlC, setLvlC] = useState(init?.lvlC ?? 100)
  const [lvlD, setLvlD] = useState(init?.lvlD ?? 100)

  // Send levels per channel (send 1 / send 2)
  const [s1A, setS1A] = useState(init?.s1A ?? 0)
  const [s1B, setS1B] = useState(init?.s1B ?? 0)
  const [s1C, setS1C] = useState(init?.s1C ?? 0)
  const [s1D, setS1D] = useState(init?.s1D ?? 0)
  const [s2A, setS2A] = useState(init?.s2A ?? 0)
  const [s2B, setS2B] = useState(init?.s2B ?? 0)
  const [s2C, setS2C] = useState(init?.s2C ?? 0)
  const [s2D, setS2D] = useState(init?.s2D ?? 0)

  // Return levels
  const [rtn1, setRtn1] = useState(init?.rtn1 ?? 80)
  const [rtn2, setRtn2] = useState(init?.rtn2 ?? 80)

  // Mutes
  const [muteA, setMuteA] = useState(false)
  const [muteB, setMuteB] = useState(false)
  const [muteC, setMuteC] = useState(false)
  const [muteD, setMuteD] = useState(false)

  // Master
  const [bg, setBg] = useState(init?.bg ?? 0)
  const [masterLvl, setMasterLvl] = useState(init?.masterLvl ?? 100)
  const [enabled, setEnabled] = useState(true)

  const routing = usePatchRouting()
  const enabledRef = useRef(true)
  enabledRef.current = enabled

  // Refs for all state
  const lvlRefs = useRef({ a: 100, b: 100, c: 100, d: 100 })
  const s1Refs = useRef({ a: 0, b: 0, c: 0, d: 0 })
  const s2Refs = useRef({ a: 0, b: 0, c: 0, d: 0 })
  const muteRefs = useRef({ a: false, b: false, c: false, d: false })
  const rtn1Ref = useRef(80)
  const rtn2Ref = useRef(80)
  const bgRef = useRef(0)
  const masterLvlRef = useRef(100)

  lvlRefs.current = { a: lvlA, b: lvlB, c: lvlC, d: lvlD }
  s1Refs.current = { a: s1A, b: s1B, c: s1C, d: s1D }
  s2Refs.current = { a: s2A, b: s2B, c: s2C, d: s2D }
  muteRefs.current = { a: muteA, b: muteB, c: muteC, d: muteD }
  rtn1Ref.current = rtn1
  rtn2Ref.current = rtn2
  bgRef.current = bg
  masterLvlRef.current = masterLvl

  // Signal refs
  const chRefs = useRef({ a: null, b: null, c: null, d: null })
  const rtn1InRef = useRef(null)
  const rtn2InRef = useRef(null)
  const penRef = useRef(null)
  const bgInRef = useRef(null)
  const send1Ref = useRef(null)
  const send2Ref = useRef(null)
  const masterOutRef = useRef(null)

  // History buffers for scope traces
  const historyRefs = useRef(Object.fromEntries([...CHS, 'r1', 'r2'].map(k => [k, new Float32Array(BUF_LEN)])))
  const writeIdxRef = useRef(0)

  const conns = routing?.connections || []
  const chConns = Object.fromEntries(CHS.map(ch => [ch, conns.some(c => c.toModuleId === id && c.toPort === ch)]))
  const rtn1Conn = conns.some(c => c.toModuleId === id && c.toPort === 'rtn1')
  const rtn2Conn = conns.some(c => c.toModuleId === id && c.toPort === 'rtn2')
  const penConn = conns.some(c => c.toModuleId === id && c.toPort === 'pen')
  const bgConn = conns.some(c => c.toModuleId === id && c.toPort === 'bgCV')

  useModule({
    id,
    inputs: {
      a: { type: 'any' }, b: { type: 'any' }, c: { type: 'any' }, d: { type: 'any' },
      rtn1: { type: 'any' }, rtn2: { type: 'any' },
      pen: { type: 'pen' }, bgCV: { type: 'scalar' },
    },
    outputs: {
      snd1: { type: 'any' }, snd2: { type: 'any' }, out: { type: 'any' },
    },
    process: (inputs) => {
      if (!enabledRef.current) {
        for (const ch of CHS) chRefs.current[ch] = null
        rtn1InRef.current = null; rtn2InRef.current = null
        penRef.current = null; bgInRef.current = null
        send1Ref.current = null; send2Ref.current = null; masterOutRef.current = null
        return { snd1: null, snd2: null, out: null }
      }

      for (const ch of CHS) chRefs.current[ch] = muteRefs.current[ch] ? null : inputs[ch]
      rtn1InRef.current = inputs.rtn1
      rtn2InRef.current = inputs.rtn2
      penRef.current = inputs.pen
      bgInRef.current = inputs.bgCV

      // Build send outputs — pick the first non-null channel with send level > 0
      // For points: pass through. For scalars: scale by send level.
      let snd1 = null, snd2 = null
      for (const ch of CHS) {
        const sig = chRefs.current[ch]
        if (!sig) continue
        if (s1Refs.current[ch] > 0 && !snd1) snd1 = sig
        if (s2Refs.current[ch] > 0 && !snd2) snd2 = sig
      }
      send1Ref.current = snd1
      send2Ref.current = snd2

      // History for scope
      const idx = writeIdxRef.current
      for (const ch of CHS) {
        const sig = chRefs.current[ch]
        historyRefs.current[ch][idx] = sig?.type === 'scalar' ? sig.value : 0
      }
      if (inputs.rtn1?.type === 'scalar') historyRefs.current.r1[idx] = inputs.rtn1.value
      if (inputs.rtn2?.type === 'scalar') historyRefs.current.r2[idx] = inputs.rtn2.value
      writeIdxRef.current = (idx + 1) % BUF_LEN

      // Master out — pass first non-null channel (for chaining)
      const firstActive = CHS.find(ch => chRefs.current[ch])
      masterOutRef.current = firstActive ? chRefs.current[firstActive] : null

      return { snd1, snd2, out: masterOutRef.current }
    },
  })

  // Canvas resize
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

  // Canvas draw loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let raf

    const draw = () => {
      const w = canvas.width
      const h = canvas.height
      if (!w || !h) { raf = requestAnimationFrame(draw); return }

      const bgVal = bgInRef.current?.type === 'scalar' ? bgInRef.current.value : bgRef.current
      const g = Math.round((bgVal / 100) * 255)
      ctx.fillStyle = `rgb(${g},${g},${g})`
      ctx.fillRect(0, 0, w, h)

      const wi = writeIdxRef.current
      const p = penRef.current

      // Draw channels at their levels
      for (const ch of CHS) {
        if (muteRefs.current[ch]) continue
        const sig = chRefs.current[ch]
        if (!sig) continue
        const lvl = lvlRefs.current[ch] / 100
        ctx.globalAlpha = lvl
        drawSignal(ctx, sig, 0, 0, w, h, historyRefs.current[ch], wi, BUF_LEN, p)
        ctx.globalAlpha = 1
      }

      // Draw returns
      if (rtn1InRef.current) {
        ctx.globalAlpha = rtn1Ref.current / 100
        drawSignal(ctx, rtn1InRef.current, 0, 0, w, h, historyRefs.current.r1, wi, BUF_LEN, p)
        ctx.globalAlpha = 1
      }
      if (rtn2InRef.current) {
        ctx.globalAlpha = rtn2Ref.current / 100
        drawSignal(ctx, rtn2InRef.current, 0, 0, w, h, historyRefs.current.r2, wi, BUF_LEN, p)
        ctx.globalAlpha = 1
      }

      raf = requestAnimationFrame(draw)
    }

    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [])

  const stripStyle = { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, flex: 'none' }
  const knobRow = { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }

  const lvls = [lvlA, lvlB, lvlC, lvlD]
  const setLvls = [setLvlA, setLvlB, setLvlC, setLvlD]
  const s1s = [s1A, s1B, s1C, s1D]
  const setS1s = [setS1A, setS1B, setS1C, setS1D]
  const s2s = [s2A, s2B, s2C, s2D]
  const setS2s = [setS2A, setS2B, setS2C, setS2D]
  const mutes = [muteA, muteB, muteC, muteD]
  const setMutes = [setMuteA, setMuteB, setMuteC, setMuteD]

  return (
    <Module>
      <div style={{ display: 'flex', height: '100%', gap: 2, padding: '4px 2px' }}>

        {/* 4 Channel strips */}
        {CHS.map((ch, i) => (
          <div key={ch} style={stripStyle}>
            <span style={{ fontSize: '7px', fontFamily: 'var(--kol-font-mono)', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>{ch}</span>
            <JackSocket type="in" port={ch} moduleId={id} active={chConns[ch]} signalRef={{ get current() { return chRefs.current[ch] } }} label="in" size="sm" />
            <Fader value={lvls[i]} onChange={setLvls[i]} label="lvl" />
            <Knob value={s1s[i]} onChange={setS1s[i]} label="s1" />
            <Knob value={s2s[i]} onChange={setS2s[i]} label="s2" />
            <Toggle size="sm" value={!mutes[i]} onChange={() => setMutes[i](!mutes[i])} label="on" />
          </div>
        ))}

        {/* Divider */}
        <div style={{ width: 1, alignSelf: 'stretch', backgroundColor: 'rgba(255,255,255,0.06)', margin: '0 2px' }} />

        {/* Send 1 */}
        <div style={stripStyle}>
          <span style={{ fontSize: '7px', fontFamily: 'var(--kol-font-mono)', color: 'rgba(255,255,255,0.5)' }}>S1</span>
          <JackSocket type="out" port="snd1" moduleId={id} signalRef={send1Ref} label="snd" size="sm" />
          <JackSocket type="in" port="rtn1" moduleId={id} active={rtn1Conn} signalRef={rtn1InRef} label="rtn" size="sm" />
          <Knob value={rtn1} onChange={setRtn1} label="rtn" />
        </div>

        {/* Send 2 */}
        <div style={stripStyle}>
          <span style={{ fontSize: '7px', fontFamily: 'var(--kol-font-mono)', color: 'rgba(255,255,255,0.5)' }}>S2</span>
          <JackSocket type="out" port="snd2" moduleId={id} signalRef={send2Ref} label="snd" size="sm" />
          <JackSocket type="in" port="rtn2" moduleId={id} active={rtn2Conn} signalRef={rtn2InRef} label="rtn" size="sm" />
          <Knob value={rtn2} onChange={setRtn2} label="rtn" />
        </div>

        {/* Divider */}
        <div style={{ width: 1, alignSelf: 'stretch', backgroundColor: 'rgba(255,255,255,0.06)', margin: '0 2px' }} />

        {/* Master */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, flex: 1, minHeight: 0 }}>
          <ModuleHeader label="Console" enabled={enabled} onToggle={() => setEnabled(!enabled)} />
          <canvas
            ref={canvasRef}
            width={200}
            height={120}
            style={{ flex: 1, minHeight: 0, width: '100%', borderRadius: 2, border: '1px solid rgba(255,255,255,0.06)' }}
          />
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <JackSocket type="out" port="out" moduleId={id} signalRef={masterOutRef} label="out" />
            <JackSocket type="in" port="bgCV" moduleId={id} active={bgConn} signalRef={bgInRef} label="bg" size="sm" />
            <Knob value={bg} onChange={setBg} label="bg" />
            <Knob value={masterLvl} onChange={setMasterLvl} label="mst" />
            <JackSocket type="in" port="pen" moduleId={id} active={penConn} signalRef={penRef} label="pen" size="sm" />
          </div>
        </div>
      </div>
    </Module>
  )
}
