import { useState, useCallback, useRef } from 'react'
import useSignalBus from './hooks/useSignalBus'
import { PatchRoutingProvider } from './hooks/usePatchRouting.jsx'
import PatchCableOverlay from './modules/PatchCableOverlay'
import RackRow from './RackRow'

import RGBSplitModule from './modules/RGBSplitModule'
import RGBMixModule from './modules/RGBMixModule'
import VideoVCAModule from './modules/VideoVCAModule'
import VideoKeyModule from './modules/VideoKeyModule'
import RampGenModule from './modules/RampGenModule'
import VideoFaderModule from './modules/VideoFaderModule'
import LumaKeyModule from './modules/LumaKeyModule'
import WaveShapeModule from './modules/WaveShapeModule'
import SlewModule from './modules/SlewModule'
import InvertModule from './modules/InvertModule'
import QuantizerModule from './modules/QuantizerModule'
import NoiseSourceModule from './modules/NoiseSourceModule'
import ClockDivModule from './modules/ClockDivModule'
import ComparatorModule from './modules/ComparatorModule'
import DelayModule from './modules/DelayModule'
import SampleModule from './modules/SampleModule'
import ScaleOffsetModule from './modules/ScaleOffsetModule'
import RectifierModule from './modules/RectifierModule'
import SwitchModule from './modules/SwitchModule'
import VideoMixConsoleModule from './modules/VideoMixConsoleModule'
import MonitorModule from './modules/MonitorModule'

const HP = (hp) => ({ width: `${(hp / 104) * 100}%`, flexShrink: 0, height: '100%', overflow: 'hidden', borderRight: '1px solid rgba(255,255,255,0.04)', padding: '8px 4px', boxSizing: 'border-box' })

const INITIAL = {
  // Patch: Noise → Waveshaper → VCA (CV from Ramp) → Monitor
  // Also: Ramp → Quantizer → Slew → Monitor B
  nz1: { color: 'white', level: 80, enabled: true },
  wshp1: { shape: 'fold', drive: 70, inputExpr: 'nz1_out', enabled: true },
  ramp1: { frequency: 3, direction: 'H', enabled: true },
  vca1: { level: 80, signalExpr: 'wshp1_out', cvExpr: 'ramp1_out', enabled: true },
  quant1: { steps: 8, inputExpr: 'ramp1_out', enabled: true },
  slew1: { rise: 30, fall: 60, inputExpr: 'quant1_out', enabled: true },
  dly1: { time: 15, feedback: 40, inputExpr: 'slew1_out', enabled: true },
  inv1: { invert: true, offset: 50, inputExpr: 'dly1_out', enabled: true },
  fade1: { crossfade: 50, inputAExpr: 'vca1_out', inputBExpr: 'inv1_out', enabled: true },
  rgb1: { gain_r: 100, gain_g: 100, gain_b: 100, enabled: false },
  rgbm1: { mix_r: 100, mix_g: 100, mix_b: 100, master: 100, enabled: false },
  key1: { threshold: 50, mode: 'hard', enabled: false },
  luma1: { contrast: 50, brightness: 50, enabled: false },
  cdiv1: { division: 2, enabled: false },
  cmp1: { mode: 'GT', enabled: false },
  smp1: { enabled: false },
  so1: { scale: 100, offset: 0, enabled: false },
  rect1: { mode: 'full', enabled: false },
  sw1: { manual: false, enabled: false },
  vmx1: { level1: 100, level2: 100, level3: 100, level4: 100, master: 100, enabled: false },
  mon2: { inputAExpr: 'fade1_out', inputBExpr: 'ramp1_out', scopeExpr: '', enabled: true },
}

export default function Case2Workspace() {
  const { busRef } = useSignalBus()
  const [gs, setGs] = useState(INITIAL)
  const rackRef = useRef(null)

  const upd = useCallback((key, val) => {
    setGs(prev => ({ ...prev, [key]: val }))
  }, [])

  const m = (key) => ({ config: gs[key], onChange: (v) => upd(key, v), busRef })

  return (
    <PatchRoutingProvider>
      <div className="min-h-screen bg-surface-primary text-fg-96 flex flex-col items-center justify-end" style={{ userSelect: 'none', WebkitUserSelect: 'none', paddingBottom: '48px' }}>

        <div className="relative flex" style={{ width: '100%', maxWidth: '1400px' }}>
          <div style={{ width: '6px', flexShrink: 0, backgroundColor: 'rgba(60,60,60,0.5)', borderRadius: '2px 0 0 2px' }} />
          <div ref={rackRef} className="relative flex-1" style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'rgba(20,20,20,0.95)' }}>
            <PatchCableOverlay containerRef={rackRef} />

            {/* 1U — small utilities */}
            <RackRow height="1u">
              <div style={HP(6)}><ClockDivModule id="cdiv1" label="CDIV" {...m('cdiv1')} /></div>
              <div style={HP(6)}><QuantizerModule id="quant1" label="QUANT" {...m('quant1')} /></div>
              <div style={HP(6)}><NoiseSourceModule id="nz1" label="NOISE" {...m('nz1')} /></div>
              <div style={HP(4)}><InvertModule id="inv1" label="INV" {...m('inv1')} /></div>
              <div style={HP(4)}><ScaleOffsetModule id="so1" label="S/O" {...m('so1')} /></div>
              <div style={HP(4)}><RectifierModule id="rect1" label="RECT" {...m('rect1')} /></div>
              <div style={HP(6)}><SlewModule id="slew1" label="SLEW" {...m('slew1')} /></div>
              <div style={HP(6)}><SampleModule id="smp1" label="SMPL" {...m('smp1')} /></div>
              <div style={HP(6)}><ComparatorModule id="cmp1" label="CMP" {...m('cmp1')} /></div>
              <div style={HP(6)}><SwitchModule id="sw1" label="SW" {...m('sw1')} /></div>
              <div style={HP(50)}>{/* empty */}</div>
            </RackRow>

            {/* 3U — video signal processing */}
            <RackRow height="3u">
              <div style={HP(8)}><RGBSplitModule id="rgb1" label="RGB" {...m('rgb1')} /></div>
              <div style={HP(10)}><RGBMixModule id="rgbm1" label="RGBMIX" {...m('rgbm1')} /></div>
              <div style={HP(6)}><VideoVCAModule id="vca1" label="VCA" {...m('vca1')} /></div>
              <div style={HP(6)}><VideoKeyModule id="key1" label="KEY" {...m('key1')} /></div>
              <div style={HP(8)}><RampGenModule id="ramp1" label="RAMP" {...m('ramp1')} /></div>
              <div style={HP(6)}><VideoFaderModule id="fade1" label="FADE" {...m('fade1')} /></div>
              <div style={HP(6)}><LumaKeyModule id="luma1" label="LUMA" {...m('luma1')} /></div>
              <div style={HP(8)}><WaveShapeModule id="wshp1" label="WSHP" {...m('wshp1')} /></div>
              <div style={HP(8)}><DelayModule id="dly1" label="DELAY" {...m('dly1')} /></div>
              <div style={HP(38)}>{/* empty */}</div>
            </RackRow>

            {/* 3U — console + monitor */}
            <RackRow height="3u">
              <div style={HP(32)}><VideoMixConsoleModule id="vmx1" label="CONSOLE" {...m('vmx1')} /></div>
              <div style={HP(16)}><MonitorModule id="mon2" label="MON" {...m('mon2')} /></div>
              <div style={HP(56)}>{/* empty */}</div>
            </RackRow>
          </div>
          <div style={{ width: '6px', flexShrink: 0, backgroundColor: 'rgba(60,60,60,0.5)', borderRadius: '0 2px 2px 0' }} />
        </div>

      </div>
    </PatchRoutingProvider>
  )
}
