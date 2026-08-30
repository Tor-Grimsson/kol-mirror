import { useEffect, useRef, useState } from 'react'
import { transport, useTransportPlaying } from '../../hooks/transport'

/**
 * TapeDelay — a reel-to-reel deck (user 2026-08-28; references: Revox B77,
 * Tascam RE-1004, and two studio machines shot from above).
 *
 * IT IS A BOX, NOT A ROTATED RECTANGLE. The first cut was one flat plane with a
 * `rotateX` on it, which reads as a tilted playing card however steep the angle
 * — a plane has no thickness, so there is no edge for the eye to read depth
 * from. This is a `preserve-3d` scene: a TOP PLATE laid back, a FRONT LIP
 * standing up from its near edge, and a side wall, meeting at real edges. The
 * perspective then has something to work on.
 *
 * DRAWN AS ONE SVG per face, so everything shares a coordinate space and the
 * TAPE can be a real path computed against the reels' geometry — off each pack
 * on its tangent, down over the head block. As the pass runs the packs change
 * radius and the tangents move with them.
 *
 * The reels turn while the TRANSPORT runs — the clock the expressions, the
 * scope and the studio's animate all read, so the deck is a readout rather than
 * decoration. ω = v / r, so the emptying reel accelerates while the filling one
 * slows; that is the detail that separates a tape machine from two spinning
 * discs. The VU needle drifts on a slow noise instead of ticking.
 */
const W = 560
const H = 300
const LIP = 74                          // the front control lip's height
const RL = { cx: 158, cy: 132, R: 106 }   // supply
const RR = { cx: 402, cy: 132, R: 106 }   // take-up
const HEAD = { x: 280, y: 250 }
const HUB = 30
const packR = (fill) => HUB + fill * (RL.R - HUB - 14)

const tapePath = (fillL, fillR) => {
  const rl = packR(fillL)
  const rr = packR(fillR)
  return `M ${RL.cx - rl} ${RL.cy} A ${rl} ${rl} 0 0 0 ${RL.cx} ${RL.cy + rl}`
    + ` Q ${RL.cx + 26} ${HEAD.y - 4} ${HEAD.x - 48} ${HEAD.y - 4}`
    + ` L ${HEAD.x + 48} ${HEAD.y - 4}`
    + ` Q ${RR.cx - 26} ${HEAD.y - 4} ${RR.cx} ${RR.cy + rr}`
    + ` A ${rr} ${rr} 0 0 0 ${RR.cx + rr} ${RR.cy}`
}

function Reel({ cx, cy, R, fill, id, spinRef }) {
  const r = packR(fill)
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={`url(#pack-${id})`} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#000" strokeOpacity="0.55" />
      <g ref={spinRef}>
        <path
          fillRule="evenodd"
          fill={`url(#flange-${id})`}
          d={`M ${cx} ${cy - R} A ${R} ${R} 0 1 1 ${cx - 0.01} ${cy - R} Z
              M ${cx} ${cy - R + 17} l 23 11 l -12 47 l -22 0 l -12 -47 Z
              M ${cx + R - 24} ${cy + 43} l -7 22 l -43 -17 l 9 -21 l 41 16 Z
              M ${cx - R + 24} ${cy + 43} l 7 22 l 43 -17 l -9 -21 l -41 16 Z`}
        />
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="#82827f" />
        <circle cx={cx} cy={cy} r={HUB} fill="#141417" stroke="#000" strokeWidth="1.5" />
        {[0, 60, 120, 180, 240, 300].map((a) => (
          <rect key={a} x={cx - 2.5} y={cy - HUB + 3} width="5" height="13" rx="2.5" fill="#37373c" transform={`rotate(${a} ${cx} ${cy})`} />
        ))}
        <circle cx={cx} cy={cy} r="13" fill={`url(#nut-${id})`} />
        <circle cx={cx} cy={cy} r="4" fill="#0a0a0c" />
      </g>
    </g>
  )
}

export default function TapeDelay() {
  const playing = useTransportPlaying()
  const [time, setTime] = useState(38)
  const [wound, setWound] = useState(0.92)
  const spinL = useRef(null)
  const spinR = useRef(null)
  const tape = useRef(null)
  const counter = useRef(null)
  const needle = useRef(null)
  const st = useRef({ wound: 0.92, aL: 0, aR: 0, vu: 0 })

  useEffect(() => {
    let raf
    let last = 0
    const tick = (ts) => {
      const dt = last ? Math.min((ts - last) / 1000, 0.1) : 0
      last = ts
      const s = st.current
      if (playing) {
        s.wound = (s.wound - dt / 240 + 1) % 1
        const v = 60 + time * 1.6
        s.aL += (v / packR(s.wound)) * dt * 57.3
        s.aR += (v / packR(1 - s.wound)) * dt * 57.3
        const target = 0.3 + Math.abs(Math.sin(ts / 900) * 0.35 + Math.sin(ts / 330) * 0.2)
        s.vu += (target - s.vu) * Math.min(dt * 6, 1)
      } else {
        s.vu += (0 - s.vu) * Math.min(dt * 3, 1)
      }
      spinL.current?.setAttribute('transform', `rotate(${s.aL} ${RL.cx} ${RL.cy})`)
      spinR.current?.setAttribute('transform', `rotate(${s.aR} ${RR.cx} ${RR.cy})`)
      tape.current?.setAttribute('d', tapePath(s.wound, 1 - s.wound))
      if (counter.current) counter.current.textContent = String(Math.floor((1 - s.wound) * 9999)).padStart(4, '0')
      needle.current?.setAttribute('transform', `rotate(${-44 + s.vu * 88} 70 44)`)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [playing, time])

  /* flange rotation is per-frame and goes straight to the DOM; the pack RADIUS
     is React's, at 4Hz — it changes over minutes, not frames */
  useEffect(() => {
    const id = setInterval(() => setWound(st.current.wound), 250)
    return () => clearInterval(id)
  }, [])

  const defs = (
    <defs>
      {['a', 'b'].map((k) => (
        <linearGradient key={`f${k}`} id={`flange-${k}`} x1="0" y1="0" x2="0.85" y2="1">
          <stop offset="0%" stopColor="#f4f4f2" />
          <stop offset="38%" stopColor="#c6c6c2" />
          <stop offset="63%" stopColor="#eaeae7" />
          <stop offset="100%" stopColor="#a3a3a0" />
        </linearGradient>
      ))}
      {['a', 'b'].map((k) => (
        <radialGradient key={`p${k}`} id={`pack-${k}`}>
          <stop offset="0%" stopColor="#35322d" />
          <stop offset="100%" stopColor="#14130f" />
        </radialGradient>
      ))}
      {['a', 'b'].map((k) => (
        <linearGradient key={`n${k}`} id={`nut-${k}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e08c4a" />
          <stop offset="55%" stopColor="#b4652c" />
          <stop offset="100%" stopColor="#7c4217" />
        </linearGradient>
      ))}
      <linearGradient id="plate" x1="0" y1="0" x2="0.2" y2="1">
        <stop offset="0%" stopColor="#2e2e33" />
        <stop offset="100%" stopColor="#1a1a1d" />
      </linearGradient>
      <linearGradient id="lip" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#3d3d43" />
        <stop offset="100%" stopColor="#242428" />
      </linearGradient>
      <linearGradient id="vu" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#f6cf92" />
        <stop offset="100%" stopColor="#d8993f" />
      </linearGradient>
    </defs>
  )

  return (
    /* STRAIGHT ON (user 2026-08-28) — the Revox and the Tascam are both head-on
       product shots. The two-face 3D box read as a wedge; a tape machine is
       legible flat, and the drawing has to carry it. */
    <div style={{ filter: 'drop-shadow(0 24px 40px rgb(0 0 0 / 0.45))' }}>
      <div>
        {/* THE TOP PLATE — laid back; everything that lives on the deck is here */}
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
          {defs}
          <rect x="0" y="0" width={W} height={H} rx="5" fill="url(#plate)" stroke="#000" />
          <rect x="8" y="8" width={W - 16} height={H - 16} rx="3" fill="none" stroke="#ffffff10" />

          <Reel {...RL} fill={wound} id="a" spinRef={spinL} />
          <Reel {...RR} fill={1 - wound} id="b" spinRef={spinR} />

          {/* THE TAPE, drawn over the reels — under them it was invisible,
              which is the one line that makes the machine read as threaded */}
          <path ref={tape} d={tapePath(0.92, 0.08)} fill="none" stroke="#0d0c0a" strokeWidth="4" strokeLinecap="round" />

          {/* the head block, its heads, the capstan and the idler */}
          <rect x={HEAD.x - 56} y={HEAD.y - 28} width="112" height="36" rx="3" fill="#0e0e11" stroke="#000" />
          {[-38, -14, 10, 34].map((dx) => (
            <rect key={dx} x={HEAD.x + dx} y={HEAD.y - 22} width="14" height="20" rx="2" fill="#4c4c52" stroke="#232327" />
          ))}
          <circle cx={HEAD.x + 78} cy={HEAD.y - 8} r="12" fill="#c9c9c5" stroke="#7d7d7a" />
          <circle cx={HEAD.x + 78} cy={HEAD.y - 8} r="4" fill="#2a2a2e" />
          <circle cx={HEAD.x - 78} cy={HEAD.y - 8} r="8" fill="#2a2a2e" stroke="#000" />

          {/* counter and run lamp */}
          <rect x={W / 2 - 36} y="10" width="72" height="24" rx="3" fill="#07070a" stroke="#000" />
          <text ref={counter} x={W / 2} y="27" textAnchor="middle" fill="#7ee787" style={{ font: '600 15px ui-monospace, monospace', letterSpacing: '2px' }}>0000</text>
          <circle cx={W - 26} cy="22" r="6" fill={playing ? '#e2574c' : '#38222020'} stroke="#00000060" />
        </svg>

        {/* THE FRONT LIP — stands up from the plate's near edge. This is the
            face that gives the box its thickness, and it carries the controls,
            exactly as the references do. */}
        <div style={{ marginTop: -1 }}>
          <svg width={W} height={LIP} viewBox={`0 0 ${W} ${LIP}`} style={{ display: 'block' }}>
            <rect x="0" y="0" width={W} height={LIP} rx="4" fill="url(#lip)" stroke="#000" />

            {/* VU */}
            <g transform="translate(18 8)">
              <rect x="0" y="0" width="140" height="58" rx="3" fill="url(#vu)" stroke="#000" />
              <path d="M 12 40 Q 70 8 128 40" fill="none" stroke="#6b4a1c" />
              {[-40, -20, 0, 20, 40].map((a) => (
                <line key={a} x1="70" y1="12" x2="70" y2="19" stroke="#6b4a1c" transform={`rotate(${a} 70 44)`} />
              ))}
              <line ref={needle} x1="70" y1="44" x2="70" y2="12" stroke="#b8332a" strokeWidth="1.6" transform="rotate(-44 70 44)" />
              <circle cx="70" cy="44" r="3" fill="#3a2a12" />
              <text x="70" y="54" textAnchor="middle" fill="#6b4a1c" style={{ font: '600 8px ui-monospace, monospace', letterSpacing: '1px' }}>VU</text>
            </g>

            {/* transport keys */}
            <g transform="translate(178 22)">
              {['REW', 'FF', 'PLAY', 'STOP'].map((k, i) => (
                <g key={k} transform={`translate(${i * 54} 0)`} style={{ cursor: 'pointer' }} onClick={() => (k === 'PLAY' ? transport.play() : k === 'STOP' ? transport.stop() : null)}>
                  <rect x="0" y="0" width="48" height="28" rx="2" fill="#cfcfcb" stroke="#87878400" />
                  <rect x="0" y="0" width="48" height="14" rx="2" fill="#ffffff30" />
                  <text x="24" y="18" textAnchor="middle" fill="#1a1a1c" style={{ font: '600 8px ui-monospace, monospace' }}>{k}</text>
                </g>
              ))}
              <g transform="translate(216 0)">
                <rect x="0" y="0" width="48" height="28" rx="2" fill="#a52626" stroke="#000" />
                <text x="24" y="18" textAnchor="middle" fill="#fff" style={{ font: '600 8px ui-monospace, monospace' }}>REC</text>
              </g>
            </g>

            {/* the speed knob — the one live control on the lip */}
            <g transform="translate(492 12)" style={{ cursor: 'ns-resize' }} onWheel={(e) => setTime((t) => Math.max(1, Math.min(100, t - Math.sign(e.deltaY) * 4)))}>
              <circle cx="26" cy="26" r="24" fill="#c9c9c5" stroke="#7d7d7a" />
              <circle cx="26" cy="26" r="17" fill="#e8e8e5" />
              <line x1="26" y1="26" x2="26" y2="8" stroke="#1a1a1c" strokeWidth="2.5" transform={`rotate(${-135 + (time / 100) * 270} 26 26)`} />
              <text x="26" y="60" textAnchor="middle" fill="#9a9a97" style={{ font: '600 8px ui-monospace, monospace' }}>SPEED</text>
            </g>
          </svg>
        </div>
      </div>
    </div>
  )
}
