
/**
 * Ten tape decks (user 2026-08-28: "make 10 versions of tape delay in a page").
 *
 * TEN DESIGNS, not one component with ten colour props — the point of a set is
 * that the ideas differ. They share exactly one thing: `useReels`, the physics.
 * Everything else — proportion, material, chrome, what the reels even ARE — is
 * per deck.
 *
 * THE PHYSICS, once: `wound` runs the pass down and wraps; each reel's angular
 * speed is ω = v / r, so the emptying reel accelerates as the filling one slows.
 * Angles go straight to the DOM every frame; the pack radius is React's at 4Hz,
 * because it changes over minutes and re-rendering it at 60fps is waste.
 */
/* every deck draws its reels in a 100x100 box, so the hook's rotate origin is
   the same everywhere and a design only chooses where to put the boxes */
const Box = ({ x, y, s, children }) => (
  <g transform={`translate(${x} ${y}) scale(${s / 100})`}>{children}</g>
)

/* 01 - Studio: aluminium flanges, three windows */
export function Studio({ wound, a, b, playing }) {
  const flange = (ref, fill) => (
    <>
      <circle cx="50" cy="50" r={28 + fill * 20} fill="#15140f" />
      <g ref={ref}>
        <path fillRule="evenodd" fill="#d9d9d5"
          d="M50 2 A48 48 0 1 1 49.99 2 Z M50 12 l11 5 l-6 23 l-10 0 l-6 -23 Z M88 62 l-3 11 l-21 -8 l4 -10 l20 7 Z M12 62 l3 11 l21 -8 l-4 -10 l-20 7 Z" />
        <circle cx="50" cy="50" r="13" fill="#17171a" />
        <circle cx="50" cy="50" r="5" fill="#c07333" />
      </g>
    </>
  )
  return (
    <svg viewBox="0 0 320 150" width="100%">
      <rect width="320" height="150" rx="4" fill="#232327" stroke="#000" />
      <Box x={22} y={16} s={110}>{flange(a, wound)}</Box>
      <Box x={188} y={16} s={110}>{flange(b, 1 - wound)}</Box>
      <rect x="140" y="112" width="40" height="14" rx="2" fill="#08080a" />
      <circle cx="296" cy="22" r="5" fill={playing ? '#e2574c' : '#3a2020'} />
    </svg>
  )
}

/* 02 - Blackface: matte body, dark reels, one red hub */
export function Blackface({ wound, a, b, playing }) {
  const reel = (ref, fill) => (
    <>
      <circle cx="50" cy="50" r={26 + fill * 22} fill="#0c0c0e" />
      <g ref={ref}>
        <circle cx="50" cy="50" r="48" fill="none" stroke="#3a3a40" strokeWidth="3" />
        {[0, 120, 240].map((d) => (
          <rect key={d} x="46" y="6" width="8" height="30" rx="4" fill="#2a2a2f" transform={`rotate(${d} 50 50)`} />
        ))}
        <circle cx="50" cy="50" r="11" fill="#1a1a1e" stroke="#000" />
        <circle cx="50" cy="50" r="4" fill="#c0392b" />
      </g>
    </>
  )
  return (
    <svg viewBox="0 0 320 150" width="100%">
      <rect width="320" height="150" rx="4" fill="#0f0f11" stroke="#000" />
      <Box x={26} y={18} s={104}>{reel(a, wound)}</Box>
      <Box x={190} y={18} s={104}>{reel(b, 1 - wound)}</Box>
      <rect x="20" y="128" width="280" height="1" fill="#26262b" />
      <circle cx="296" cy="20" r="4" fill={playing ? '#4ade80' : '#1d2b20'} />
    </svg>
  )
}

/* 03 - Portable: small reels, carry handle, field proportions */
export function Portable({ wound, a, b }) {
  const reel = (ref, fill) => (
    <>
      <circle cx="50" cy="50" r={24 + fill * 22} fill="#1a1712" />
      <g ref={ref}>
        <circle cx="50" cy="50" r="47" fill="#b9b6ae" />
        <circle cx="50" cy="50" r="47" fill="none" stroke="#8a877f" />
        {[0, 90, 180, 270].map((d) => (
          <circle key={d} cx="50" cy="22" r="7" fill="#1a1712" transform={`rotate(${d} 50 50)`} />
        ))}
        <circle cx="50" cy="50" r="10" fill="#2a2722" />
      </g>
    </>
  )
  return (
    <svg viewBox="0 0 320 150" width="100%">
      <rect x="0" y="16" width="320" height="134" rx="6" fill="#4a4640" stroke="#000" />
      <path d="M120 16 q40 -14 80 0" fill="none" stroke="#2a2722" strokeWidth="6" strokeLinecap="round" />
      <Box x={40} y={34} s={92}>{reel(a, wound)}</Box>
      <Box x={188} y={34} s={92}>{reel(b, 1 - wound)}</Box>
      <rect x="146" y="60" width="28" height="40" rx="2" fill="#1a1712" />
    </svg>
  )
}

/* 04 - Cassette: not reels, two hubs behind a window */
export function Cassette({ wound, a, b, playing }) {
  const hub = (ref, fill) => (
    <g ref={ref}>
      <circle cx="50" cy="50" r={20 + fill * 26} fill="#141210" />
      <circle cx="50" cy="50" r="16" fill="none" stroke="#5a564e" strokeWidth="3" />
      {[0, 60, 120, 180, 240, 300].map((d) => (
        <rect key={d} x="48" y="34" width="4" height="8" fill="#5a564e" transform={`rotate(${d} 50 50)`} />
      ))}
    </g>
  )
  return (
    <svg viewBox="0 0 320 150" width="100%">
      <rect width="320" height="150" rx="6" fill="#1c1c20" stroke="#000" />
      <rect x="24" y="20" width="272" height="90" rx="3" fill="#0b0b0d" stroke="#33333a" />
      <rect x="34" y="28" width="252" height="74" rx="2" fill="#15151a" />
      <Box x={54} y={34} s={62}>{hub(a, wound)}</Box>
      <Box x={204} y={34} s={62}>{hub(b, 1 - wound)}</Box>
      <rect x="24" y="120" width="272" height="16" rx="2" fill="#2a2a30" />
      <circle cx="290" cy="128" r="4" fill={playing ? '#e2574c' : '#302020'} />
    </svg>
  )
}

/* 05 - Skeleton: line art only */
export function Skeleton({ wound, a, b }) {
  const reel = (ref, fill) => (
    <g ref={ref} stroke="currentColor" fill="none" strokeWidth="1.5">
      <circle cx="50" cy="50" r="47" />
      <circle cx="50" cy="50" r={22 + fill * 22} strokeDasharray="2 3" />
      <circle cx="50" cy="50" r="10" />
      {[0, 120, 240].map((d) => <line key={d} x1="50" y1="40" x2="50" y2="8" transform={`rotate(${d} 50 50)`} />)}
    </g>
  )
  return (
    <svg viewBox="0 0 320 150" width="100%" className="text-fg-64">
      <rect x="0.5" y="0.5" width="319" height="149" rx="3" fill="none" stroke="currentColor" strokeOpacity="0.25" />
      <Box x={26} y={18} s={104}>{reel(a, wound)}</Box>
      <Box x={190} y={18} s={104}>{reel(b, 1 - wound)}</Box>
      <line x1="130" y1="120" x2="190" y2="120" stroke="currentColor" strokeOpacity="0.4" />
    </svg>
  )
}

/* 06 - Broadcast: a rack unit, reels at the ends */
export function Broadcast({ wound, a, b, playing }) {
  const reel = (ref, fill) => (
    <g ref={ref}>
      <circle cx="50" cy="50" r="46" fill="#8f8f8b" />
      <circle cx="50" cy="50" r={20 + fill * 24} fill="#111" />
      <circle cx="50" cy="50" r="9" fill="#d8d8d4" />
      {[0, 180].map((d) => <rect key={d} x="47" y="8" width="6" height="26" fill="#111" transform={`rotate(${d} 50 50)`} />)}
    </g>
  )
  return (
    <svg viewBox="0 0 320 150" width="100%">
      <rect width="320" height="150" rx="3" fill="#2b2b30" stroke="#000" />
      <rect x="0" y="0" width="320" height="10" fill="#38383f" />
      <rect x="0" y="140" width="320" height="10" fill="#1e1e22" />
      <Box x={14} y={34} s={82}>{reel(a, wound)}</Box>
      <Box x={224} y={34} s={82}>{reel(b, 1 - wound)}</Box>
      <rect x="112" y="44" width="96" height="62" rx="2" fill="#0d0d10" />
      {[0, 1, 2, 3].map((i) => <rect key={i} x={122 + i * 22} y="58" width="14" height="34" rx="2" fill={playing ? '#3a6b45' : '#2a2a30'} />)}
    </svg>
  )
}

/* 07 - Copper: dark plate, copper everything */
export function Copper({ wound, a, b }) {
  const reel = (ref, fill) => (
    <>
      <circle cx="50" cy="50" r={26 + fill * 21} fill="#241a12" />
      <g ref={ref}>
        <circle cx="50" cy="50" r="47" fill="none" stroke="#b4652c" strokeWidth="4" />
        {[0, 72, 144, 216, 288].map((d) => (
          <path key={d} d="M50 14 l7 8 l-7 22 l-7 -22 Z" fill="#8a4a1e" transform={`rotate(${d} 50 50)`} />
        ))}
        <circle cx="50" cy="50" r="12" fill="#e08c4a" />
        <circle cx="50" cy="50" r="4" fill="#1a1208" />
      </g>
    </>
  )
  return (
    <svg viewBox="0 0 320 150" width="100%">
      <rect width="320" height="150" rx="4" fill="#141110" stroke="#000" />
      <Box x={24} y={16} s={108}>{reel(a, wound)}</Box>
      <Box x={188} y={16} s={108}>{reel(b, 1 - wound)}</Box>
      <rect x="138" y="108" width="44" height="20" rx="10" fill="#241a12" stroke="#b4652c" />
    </svg>
  )
}

/* 08 - Loop: one reel, the tape a closed loop */
export function Loop({ a, playing }) {
  return (
    <svg viewBox="0 0 320 150" width="100%">
      <rect width="320" height="150" rx="4" fill="#1a1a1e" stroke="#000" />
      <ellipse cx="160" cy="75" rx="118" ry="46" fill="none" stroke="#0c0c0e" strokeWidth="7" />
      <Box x={112} y={27} s={96}>
        <g ref={a}>
          <circle cx="50" cy="50" r="46" fill="#c9c9c5" />
          {[0, 120, 240].map((d) => <path key={d} d="M50 10 l12 6 l-6 26 l-12 0 Z" fill="#1a1a1e" transform={`rotate(${d} 50 50)`} />)}
          <circle cx="50" cy="50" r="12" fill="#1a1a1e" />
        </g>
      </Box>
      <circle cx="42" cy="75" r="7" fill="#3a3a40" />
      <circle cx="278" cy="75" r="7" fill="#3a3a40" />
      <circle cx="160" cy="134" r="4" fill={playing ? '#e2574c' : '#302020'} />
    </svg>
  )
}

/* 09 - Meterbridge: reels small, the meters are the subject */
export function Meterbridge({ wound, a, b, playing }) {
  const reel = (ref, fill) => (
    <g ref={ref}>
      <circle cx="50" cy="50" r="46" fill="#b6b6b2" />
      <circle cx="50" cy="50" r={22 + fill * 22} fill="#141210" />
      <circle cx="50" cy="50" r="10" fill="#2a2a2e" />
    </g>
  )
  const meter = (x) => (
    /* keyed — two calls to the same factory in one expression are siblings, and
       React needs to tell them apart */
    <g key={x} transform={`translate(${x} 14)`}>
      <rect width="86" height="46" rx="2" fill="#e8bd7a" stroke="#000" />
      <path d="M8 34 Q43 8 78 34" fill="none" stroke="#7a5520" />
      <line x1="43" y1="36" x2="43" y2="12" stroke="#a8322a" strokeWidth="1.5" transform={`rotate(${playing ? 14 : -34} 43 36)`} />
    </g>
  )
  return (
    <svg viewBox="0 0 320 150" width="100%">
      <rect width="320" height="150" rx="4" fill="#26262a" stroke="#000" />
      {meter(24)}{meter(120)}
      <Box x={228} y={16} s={40}>{reel(a, wound)}</Box>
      <Box x={272} y={16} s={40}>{reel(b, 1 - wound)}</Box>
      <rect x="24" y="76" width="272" height="58" rx="2" fill="#1a1a1e" />
      {[0, 1, 2, 3, 4, 5].map((i) => <circle key={i} cx={44 + i * 44} cy="105" r="12" fill="#c9c9c5" />)}
    </svg>
  )
}

/* 10 - Ghost: the machine as a photocopy */
export function Ghost({ wound, a, b }) {
  const reel = (ref, fill) => (
    <g ref={ref}>
      <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="6" />
      <circle cx="50" cy="50" r={20 + fill * 22} fill="currentColor" fillOpacity="0.15" />
      {[0, 60, 120, 180, 240, 300].map((d) => (
        <rect key={d} x="48" y="4" width="4" height="18" fill="currentColor" transform={`rotate(${d} 50 50)`} />
      ))}
      <circle cx="50" cy="50" r="8" fill="currentColor" />
    </g>
  )
  return (
    <svg viewBox="0 0 320 150" width="100%" className="text-fg-96">
      <Box x={26} y={18} s={104}>{reel(a, wound)}</Box>
      <Box x={190} y={18} s={104}>{reel(b, 1 - wound)}</Box>
      <rect x="126" y="60" width="68" height="30" fill="currentColor" fillOpacity="0.1" />
    </svg>
  )
}
