import { useState } from 'react'

/**
 * FrontsPage — 20 module-front IDEAS (user 2026-08-28: "go make your own page,
 * make 20 fronts for ideas"). A sketchbook, not the instrument: nothing here is
 * wired to mixer state and nothing here is imported by an existing module. Take
 * whatever earns its place and leave the rest.
 *
 * Vocabulary comes off the user's reference sheet in
 * `_tmp/2026-08-28-panel-references/` — VU meters, LED ladders, cream key
 * gangs, ridged knobs, toggle levers, rocker switches, engraved metal scales.
 */

/* One shared palette so twenty panels read as one family of gear. */
const C = {
  metal: '#1c1c1e',
  metalHi: '#2c2c30',
  light: '#c9c6bc',
  cream: '#e8e4d6',
  ink: '#0b0b0c',
  amber: '#e8901c',
  red: '#e0431f',
  green: '#7ec81e',
  blue: '#3f7fb5',
  legend: 'rgb(236 232 222 / 0.55)',
}
const mono = 'var(--kol-font-family-mono)'
const legend = { fontSize: 8, letterSpacing: '0.14em', color: C.legend, fontFamily: mono, whiteSpace: 'nowrap' }

/* ---------- shared primitives ---------- */

function Plate({ children, pad = 14, bg = C.metal }) {
  return (
    <div style={{ background: bg, borderRadius: 4, padding: pad, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      {children}
    </div>
  )
}

function Screw({ style }) {
  return (
    <span style={{ position: 'absolute', width: 6, height: 6, borderRadius: '50%', background: 'linear-gradient(145deg,#8b8a83,#2a2a2c)', ...style }}>
      <span style={{ position: 'absolute', left: 1, right: 1, top: 2.5, height: 1, background: '#111' }} />
    </span>
  )
}

/* ---------- 01 · VU meter ---------- */
function VuMeter({ value = 32 }) {
  const a = -52 + (value / 100) * 104
  return (
    <div style={{ background: '#efe9d8', borderRadius: 3, padding: '10px 12px 6px', position: 'relative', overflow: 'hidden' }}>
      <svg viewBox="0 0 200 96" style={{ width: '100%', display: 'block' }}>
        {Array.from({ length: 21 }, (_, i) => {
          const t = -52 + (i / 20) * 104
          const r = (t * Math.PI) / 180
          const hot = i > 14
          return (
            <line key={i}
              x1={100 + 74 * Math.sin(r)} y1={104 - 74 * Math.cos(r)}
              x2={100 + (i % 5 ? 68 : 63) * Math.sin(r)} y2={104 - (i % 5 ? 68 : 63) * Math.cos(r)}
              stroke={hot ? C.red : '#15150f'} strokeWidth={i % 5 ? 0.8 : 1.8} />
          )
        })}
        <path d="M 158 46 A 74 74 0 0 1 176 78" fill="none" stroke={C.red} strokeWidth="4" />
        <text x="100" y="86" textAnchor="middle" style={{ font: '700 20px serif', fill: '#15150f' }}>VU</text>
        <line x1="100" y1="104" x2={100 + 70 * Math.sin((a * Math.PI) / 180)} y2={104 - 70 * Math.cos((a * Math.PI) / 180)} stroke={C.red} strokeWidth="1.6" />
        <circle cx="100" cy="104" r="8" fill="#2a2a28" />
      </svg>
      <Screw style={{ left: 8, bottom: 8 }} />
      <Screw style={{ right: 8, bottom: 8 }} />
    </div>
  )
}

/* ---------- 02 · LED ladder bank ---------- */
function Ladders({ n = 6, seg = 16 }) {
  const vals = [72, 34, 88, 51, 12, 64]
  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
      {Array.from({ length: n }, (_, c) => (
        <div key={c} style={{ display: 'flex', flexDirection: 'column-reverse', gap: 2, background: C.ink, padding: 2, borderRadius: 1 }}>
          {Array.from({ length: seg }, (_, i) => {
            const on = i < Math.round((vals[c % 6] / 100) * seg)
            const hot = i >= seg - 3
            return <span key={i} style={{ width: 7, height: 4, borderRadius: 0.5, background: on ? (hot ? C.red : C.amber) : '#ffffff0d' }} />
          })}
        </div>
      ))}
    </div>
  )
}

/* ---------- 03 · cream key gang ---------- */
function KeyGang({ labels = ['SDI', 'HDMI', 'SCAN', 'ASPECT'] }) {
  const [on, setOn] = useState(1)
  return (
    <div style={{ display: 'flex', gap: 1, background: '#000', padding: 1, borderRadius: 2 }}>
      {labels.map((l, i) => (
        <div key={l} onClick={() => setOn(i)} style={{ flex: 1, cursor: 'pointer', userSelect: 'none', background: on === i ? C.cream : C.light, padding: '10px 0 6px', textAlign: 'center', transform: on === i ? 'translateY(1px)' : 'none' }}>
          <span style={{ fontSize: 8, letterSpacing: '0.1em', color: '#3a382f', fontFamily: mono }}>{l}</span>
        </div>
      ))}
    </div>
  )
}

/* ---------- 04 · ridged aluminium knob ---------- */
function RidgedKnob({ size = 74, dark = false }) {
  const [a, setA] = useState(-40)
  const ridges = Array.from({ length: 44 }, (_, i) => i * (360 / 44))
  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <div
        onPointerDown={(e) => {
          const y0 = e.clientY, a0 = a
          const mv = (m) => setA(Math.max(-140, Math.min(140, a0 + (y0 - m.clientY))))
          const up = () => { window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up) }
          window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up)
        }}
        style={{ width: size, height: size, borderRadius: '50%', position: 'relative', cursor: 'ns-resize',
          background: dark ? 'radial-gradient(circle at 38% 30%, #3b3b3b, #0d0d0d 72%)' : 'radial-gradient(circle at 38% 30%, #e6e6e6, #9d9d9d 72%)' }}
      >
        <svg viewBox="0 0 100 100" style={{ position: 'absolute', inset: 0, transform: `rotate(${a}deg)` }}>
          {ridges.map((r, i) => (
            <line key={i} x1="50" y1="2" x2="50" y2="9" stroke={dark ? '#000a' : '#0006'} strokeWidth="1.6" transform={`rotate(${r} 50 50)`} />
          ))}
          <circle cx="50" cy="50" r="33" fill={dark ? '#1a1a1a' : '#d7d7d7'} />
          <line x1="50" y1="20" x2="50" y2="34" stroke={dark ? '#ddd' : '#333'} strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  )
}

/* ---------- 05 · toggle levers ---------- */
function Levers({ n = 3 }) {
  const [on, setOn] = useState([true, false, true])
  return (
    <div style={{ display: 'flex', gap: 22, justifyContent: 'center', alignItems: 'flex-end' }}>
      {Array.from({ length: n }, (_, i) => (
        <div key={i} style={{ textAlign: 'center' }}>
          <div onClick={() => setOn(p => p.map((v, j) => j === i ? !v : v))}
            style={{ width: 16, height: 34, position: 'relative', cursor: 'pointer', margin: '0 auto 5px' }}>
            <span style={{ position: 'absolute', bottom: 0, left: 1, width: 14, height: 8, borderRadius: 2, background: '#111' }} />
            <span style={{ position: 'absolute', left: 5, width: 6, height: 24, borderRadius: 3, background: 'linear-gradient(180deg,#4a4a4a,#161616)', transformOrigin: 'bottom center', bottom: 6, transform: `rotate(${on[i] ? -16 : 16}deg)` }} />
          </div>
          <span style={legend}>{on[i] ? 'ON' : 'OFF'}</span>
        </div>
      ))}
    </div>
  )
}

/* ---------- 06 · rocker switches ---------- */
function Rockers({ n = 3 }) {
  const [on, setOn] = useState([true, false, true])
  return (
    <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
      {Array.from({ length: n }, (_, i) => (
        <div key={i} style={{ textAlign: 'center' }}>
          <span style={{ display: 'block', width: 6, height: 6, borderRadius: '50%', margin: '0 auto 5px', background: on[i] ? C.red : '#3a2020' }} />
          <div onClick={() => setOn(p => p.map((v, j) => j === i ? !v : v))}
            style={{ width: 34, height: 46, borderRadius: 3, cursor: 'pointer', padding: 2, background: '#0a0a0a' }}>
            <div style={{ height: '100%', borderRadius: 2, background: on[i] ? 'linear-gradient(180deg,#f08a2a,#c4400f)' : 'linear-gradient(180deg,#3a2416,#241109)' }} />
          </div>
        </div>
      ))}
    </div>
  )
}

/* ---------- 07 · arc slider ---------- */
function ArcSlider() {
  const [v, setV] = useState(0.55)
  const a = -60 + v * 120
  const r = (a * Math.PI) / 180
  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <svg viewBox="0 0 140 100" style={{ width: '100%', maxWidth: 180, cursor: 'ew-resize' }}
        onPointerDown={(e) => {
          const box = e.currentTarget.getBoundingClientRect()
          const mv = (m) => setV(Math.max(0, Math.min(1, (m.clientX - box.left) / box.width)))
          mv(e)
          const up = () => { window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up) }
          window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up)
        }}>
        {/* endpoints derived from the SAME centre/radius the handle uses
            (70,92 r70) — hand-picked ones had the arc bulging the wrong way
            with the cap floating off it */}
        <path d={`M ${70 + 70 * Math.sin(-Math.PI / 3)} ${92 - 70 * Math.cos(-Math.PI / 3)} A 70 70 0 0 1 ${70 + 70 * Math.sin(Math.PI / 3)} ${92 - 70 * Math.cos(Math.PI / 3)}`} fill="none" stroke="#0a0a0a" strokeWidth="9" strokeLinecap="round" />
        {[0, 0.5, 1].map((t, i) => {
          const tr = ((-60 + t * 120) * Math.PI) / 180
          return <text key={i} x={70 + 84 * Math.sin(tr)} y={96 - 84 * Math.cos(tr)} textAnchor="middle" style={{ ...legend, fontSize: 7 }} fill={C.legend}>{['10', '20', '30'][i]}</text>
        })}
        <rect x={70 + 70 * Math.sin(r) - 7} y={92 - 70 * Math.cos(r) - 5} width="14" height="10" rx="2" fill="#141414" transform={`rotate(${a} ${70 + 70 * Math.sin(r)} ${92 - 70 * Math.cos(r)})`} />
      </svg>
    </div>
  )
}

/* ---------- 08 · engraved metal fader ---------- */
function MetalFader() {
  const [v, setV] = useState(0.62)
  return (
    <div style={{ display: 'flex', gap: 14, justifyContent: 'center', alignItems: 'stretch', height: 150 }}>
      <div style={{ display: 'flex', flexDirection: 'column-reverse', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        {['0', '25', '50', '75', '100'].map(l => <span key={l} style={{ ...legend, color: '#8d8d8d' }}>{l}</span>)}
      </div>
      <div
        onPointerDown={(e) => {
          const box = e.currentTarget.getBoundingClientRect()
          const mv = (m) => setV(Math.max(0, Math.min(1, 1 - (m.clientY - box.top) / box.height)))
          mv(e)
          const up = () => { window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up) }
          window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up)
        }}
        style={{ width: 10, position: 'relative', cursor: 'ns-resize', background: '#0a0a0a', borderRadius: 5 }}>
        <span style={{ position: 'absolute', left: 3, right: 3, bottom: 0, height: `${v * 100}%`, background: C.amber, borderRadius: 3 }} />
        <span style={{ position: 'absolute', left: -9, width: 28, height: 15, borderRadius: 2, bottom: `calc(${v * 100}% - 7px)`, background: 'linear-gradient(180deg,#e2e2e2,#8e8e8e 45%,#cfcfcf 55%,#6f6f6f)' }} />
      </div>
    </div>
  )
}

/* ---------- 09 · EQ slot bank ---------- */
function EqBank() {
  const bands = ['32', '64', '125', '250', '500', '1k', '2k', '4k']
  const [v, setV] = useState([0.2, 0.35, 0.5, 0.65, 0.55, 0.7, 0.8, 0.6])
  return (
    <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
      {bands.map((b, i) => (
        <div key={b} style={{ textAlign: 'center' }}>
          <div
            onPointerDown={(e) => {
              const box = e.currentTarget.getBoundingClientRect()
              const mv = (m) => setV(p => p.map((x, j) => j === i ? Math.max(0, Math.min(1, 1 - (m.clientY - box.top) / box.height)) : x))
              mv(e)
              const up = () => { window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up) }
              window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up)
            }}
            style={{ width: 8, height: 108, background: C.ink, borderRadius: 4, position: 'relative', cursor: 'ns-resize', margin: '0 auto 6px' }}>
            <span style={{ position: 'absolute', left: -5, width: 18, height: 18, borderRadius: '50%', bottom: `calc(${v[i] * 100}% - 9px)`, background: 'radial-gradient(circle at 35% 30%, #fff, #b9b9b9)' }} />
          </div>
          <span style={{ ...legend, fontSize: 7 }}>{b}</span>
        </div>
      ))}
    </div>
  )
}

/* ---------- 10 · watch-dial tick ring ---------- */
function TickRing() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <svg viewBox="0 0 200 200" style={{ width: '100%', maxWidth: 170 }}>
        <circle cx="100" cy="100" r="98" fill="#0a0a0a" />
        {Array.from({ length: 120 }, (_, i) => {
          const r = (i * 3 * Math.PI) / 180
          const maj = i % 10 === 0
          return <line key={i} x1={100 + 92 * Math.sin(r)} y1={100 - 92 * Math.cos(r)} x2={100 + (maj ? 78 : 85) * Math.sin(r)} y2={100 - (maj ? 78 : 85) * Math.cos(r)} stroke="#fff" strokeWidth={maj ? 2.4 : 0.9} opacity={maj ? 0.9 : 0.45} />
        })}
        <circle cx="100" cy="100" r="62" fill="none" stroke="#fff" strokeWidth="1" opacity="0.5" />
        <circle cx="100" cy="100" r="57" fill="none" stroke="#fff" strokeWidth="1" opacity="0.5" />
        {[0, 15, 30, 45].map(n => {
          const r = ((n * 6) * Math.PI) / 180
          return <text key={n} x={100 + 46 * Math.sin(r)} y={104 - 46 * Math.cos(r)} textAnchor="middle" style={{ font: '600 15px serif', fill: '#fff' }}>{n === 0 ? '60' : String(n).padStart(2, '0')}</text>
        })}
        <circle cx="100" cy="100" r="7" fill="#fff" />
      </svg>
    </div>
  )
}

/* ---------- 11 · segment LCD ---------- */
function Lcd({ text = '128.40', tint = '#7ee0b8' }) {
  return (
    <div style={{ background: '#0d1a16', border: `1px solid ${tint}44`, borderRadius: 2, padding: '10px 14px', textAlign: 'center' }}>
      <div style={{ display: 'inline-grid' }}>
        <span style={{ gridArea: '1/1', fontFamily: mono, fontSize: 30, letterSpacing: '0.08em', color: tint, opacity: 0.12 }}>888.88</span>
        <span style={{ gridArea: '1/1', fontFamily: mono, fontSize: 30, letterSpacing: '0.08em', color: tint }}>{text}</span>
      </div>
    </div>
  )
}

/* ---------- 12 · screw plate ---------- */
function ScrewPlate() {
  return (
    <div style={{ position: 'relative', height: 92, borderRadius: 3, background: 'repeating-linear-gradient(90deg,#ffffff08 0 1px,transparent 1px 3px), linear-gradient(180deg,#343437,#1a1a1c)' }}>
      {[[8, 8, null, null], [null, 8, 8, null], [8, null, null, 8], [null, null, 8, 8]].map((pos, i) => (
        <Screw key={i} style={{ top: pos[0] ?? undefined, right: pos[1] ?? undefined, bottom: pos[2] ?? undefined, left: pos[3] ?? undefined }} />
      ))}
      <span style={{ position: 'absolute', inset: 6, border: '1px solid #ffffff14', borderRadius: 2 }} />
    </div>
  )
}

/* ---------- 13 · round lamp buttons ---------- */
function LampButtons() {
  const [on, setOn] = useState(0)
  const tints = ['#3f93d8', C.cream, C.cream, C.cream]
  return (
    <div style={{ display: 'flex', gap: 14, justifyContent: 'center' }}>
      {tints.map((t, i) => (
        <span key={i} onClick={() => setOn(i)}
          style={{ width: 42, height: 42, borderRadius: '50%', cursor: 'pointer',
            background: on === i ? `radial-gradient(circle at 36% 30%, #fff, ${t})` : 'radial-gradient(circle at 36% 30%, #d7d4c8, #a5a294)',
            border: '2px solid #ffffff10' }} />
      ))}
    </div>
  )
}

/* ---------- 14 · rotary selector ---------- */
function Selector({ options = ['UV', '0', 'IR'] }) {
  const [i, setI] = useState(1)
  const a = -50 + (i / (options.length - 1)) * 100
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', maxWidth: 130, margin: '0 auto 6px' }}>
        {options.map((o, j) => <span key={o} style={{ ...legend, color: i === j ? C.amber : C.legend }}>{o}</span>)}
      </div>
      <div onClick={() => setI(p => (p + 1) % options.length)}
        style={{ width: 62, height: 62, margin: '0 auto', borderRadius: '50%', cursor: 'pointer', background: 'radial-gradient(circle at 36% 28%, #efefef, #a2a2a2)' }}>
        <svg viewBox="0 0 100 100" style={{ transform: `rotate(${a}deg)` }}>
          <line x1="50" y1="10" x2="50" y2="44" stroke="#2a2a2a" strokeWidth="5" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  )
}

/* ---------- 15 · slide switch ---------- */
function SlideSwitch() {
  const [on, setOn] = useState(false)
  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <div onClick={() => setOn(v => !v)}
        style={{ width: 92, height: 38, borderRadius: 19, cursor: 'pointer', padding: 3, background: '#101012', display: 'flex', justifyContent: on ? 'flex-end' : 'flex-start' }}>
        <span style={{ width: 44, height: 32, borderRadius: 16, background: on ? C.cream : '#3a3a3c' }} />
      </div>
    </div>
  )
}

/* ---------- 16 · patch jacks ---------- */
function Jacks({ n = 4 }) {
  return (
    <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
      {Array.from({ length: n }, (_, i) => (
        <div key={i} style={{ textAlign: 'center' }}>
          <span style={{ width: 32, height: 32, margin: '0 auto 5px',
            clipPath: 'polygon(50% 0%,93% 25%,93% 75%,50% 100%,7% 75%,7% 25%)',
            background: 'linear-gradient(150deg,#6e6e6e,#2a2a2a 45%,#4a4a4a)', display: 'grid', placeItems: 'center' }}>
            <span style={{ width: 14, height: 14, borderRadius: '50%', background: '#08080a', display: 'grid', placeItems: 'center' }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: i === 1 ? C.amber : '#1c1c1e' }} />
            </span>
          </span>
          <span style={legend}>{['IN', 'OUT', 'CV', 'GT'][i % 4]}</span>
        </div>
      ))}
    </div>
  )
}

/* ---------- 17 · horizontal bargraph ---------- */
function Bargraph({ rows = ['L', 'R'] }) {
  const vals = [0.78, 0.46]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {rows.map((r, i) => (
        <div key={r} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ ...legend, width: 10 }}>{r}</span>
          <div style={{ flex: 1, display: 'flex', gap: 2, background: C.ink, padding: 2, borderRadius: 1 }}>
            {Array.from({ length: 28 }, (_, j) => {
              const on = j < Math.round(vals[i] * 28)
              return <span key={j} style={{ flex: 1, height: 9, background: on ? (j > 23 ? C.red : j > 19 ? C.amber : C.green) : '#ffffff0d' }} />
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

/* ---------- 18 · numeric readout ---------- */
function Readout({ value = '07' }) {
  return (
    <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
      {value.split('').map((d, i) => (
        <span key={i} style={{ background: '#160607', border: '1px solid #d0201a33', borderRadius: 2, padding: '10px 14px', fontFamily: mono, fontSize: 30, color: '#ff3b30', textShadow: '0 0 8px #ff3b3080' }}>{d}</span>
      ))}
    </div>
  )
}

/* ---------- 19 · grille ---------- */
function Grille() {
  return (
    <div style={{ height: 92, borderRadius: 3, background: '#0d0d0f', backgroundImage: 'radial-gradient(rgb(255 255 255 / 0.07) 1px, transparent 1px)', backgroundSize: '6px 6px' }} />
  )
}

/* ---------- 20 · stepped attenuator ---------- */
function Stepped() {
  const [i, setI] = useState(7)
  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <div onClick={() => setI(p => (p + 1) % 21)} style={{ position: 'relative', width: 96, height: 96, cursor: 'pointer' }}>
        <svg viewBox="0 0 100 100">
          {Array.from({ length: 21 }, (_, k) => {
            const r = ((-135 + (k / 20) * 270) * Math.PI) / 180
            return <line key={k} x1={50 + 46 * Math.sin(r)} y1={50 - 46 * Math.cos(r)} x2={50 + 40 * Math.sin(r)} y2={50 - 40 * Math.cos(r)} stroke={k <= i ? C.amber : '#ffffff2a'} strokeWidth="2" />
          })}
          <circle cx="50" cy="50" r="30" fill="radial-gradient(#222,#000)" style={{ fill: '#141416' }} />
          <g transform={`rotate(${-135 + (i / 20) * 270} 50 50)`}>
            <line x1="50" y1="24" x2="50" y2="40" stroke={C.cream} strokeWidth="3" strokeLinecap="round" />
          </g>
        </svg>
      </div>
    </div>
  )
}

const FRONTS = [
  ['VU meter', <VuMeter key="a" />],
  ['LED ladders', <Ladders key="b" />],
  ['Key gang', <KeyGang key="c" />],
  ['Ridged knob', <RidgedKnob key="d" />],
  ['Toggle levers', <Levers key="e" />],
  ['Rockers', <Rockers key="f" />],
  ['Arc slider', <ArcSlider key="g" />],
  ['Metal fader', <MetalFader key="h" />],
  ['EQ bank', <EqBank key="i" />],
  ['Tick ring', <TickRing key="j" />],
  ['LCD readout', <Lcd key="k" />],
  ['Screw plate', <ScrewPlate key="l" />],
  ['Lamp buttons', <LampButtons key="m" />],
  ['Selector', <Selector key="n" />],
  ['Slide switch', <SlideSwitch key="o" />],
  ['Patch jacks', <Jacks key="p" />],
  ['Bargraph', <Bargraph key="q" />],
  ['Numeric', <Readout key="r" />],
  ['Grille', <Grille key="s" />],
  ['Stepped', <Stepped key="t" />],
  ['Knob, dark', <RidgedKnob key="u" dark />],
]

export default function FrontsPage() {
  return (
    <div style={{ padding: 24, height: '100%', overflowY: 'auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
        {FRONTS.map(([name, node], i) => (
          <div key={name} style={{ background: 'var(--kol-surface-secondary)', border: '1px solid var(--kol-fg-08)', borderRadius: 5, overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 10px', borderBottom: '1px solid var(--kol-fg-08)' }}>
              <span className="kol-helper-10 text-fg-64">{String(i + 1).padStart(2, '0')}</span>
              <span className="kol-helper-10 text-fg-64">{name}</span>
            </div>
            <div style={{ padding: 14, minHeight: 172, display: 'flex', alignItems: 'center' }}>
              <div style={{ width: '100%' }}><Plate>{node}</Plate></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
