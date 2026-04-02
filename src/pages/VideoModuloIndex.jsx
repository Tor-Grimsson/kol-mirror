import { Link } from 'react-router-dom'

const cases = [
  { to: '/index/case-01', label: 'Case 01 — Signal Modules', desc: 'Timing, generators, logic, processing (scalar bus)', tag: 'reference' },
  { to: '/index/case-02', label: 'Case 02 — Signal Modules (archived)', desc: 'Commit e758004 — earlier module versions preserved', tag: 'archive' },
  { to: '/index/case-03', label: 'Case 03 — Video Processing', desc: 'RGB, VCA, key, ramp, fader, mix console (scalar)', tag: 'reference' },
  { to: '/videomodulo', label: 'Video Modulo — Active', desc: 'Pure math signal path, vector rendering, no shaders', tag: 'active' },
]

export default function VideoModuloIndex() {
  return (
    <div style={{ background: '#0a0a0a', color: '#e5e5e5', fontFamily: "'SF Mono', 'Fira Code', monospace", minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 24px' }}>
      <h1 style={{ fontSize: 14, fontWeight: 400, letterSpacing: 4, textTransform: 'uppercase', color: '#737373', marginBottom: 48 }}>Video Modulo</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%', maxWidth: 480 }}>
        {cases.map(c => (
          <Link key={c.to} to={c.to} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: '#141414', border: '1px solid #262626', borderRadius: 4, color: '#e5e5e5', textDecoration: 'none', fontSize: 13 }}>
            <div>
              <div style={{ fontWeight: 500 }}>{c.label}</div>
              <div style={{ color: '#737373', fontSize: 11 }}>{c.desc}</div>
            </div>
            <span style={{ fontSize: 10, color: '#525252', letterSpacing: 1, textTransform: 'uppercase' }}>{c.tag}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
