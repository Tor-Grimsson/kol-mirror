// WaveSelect — 2x2 icon button grid for wave shape selection

import Icon from '../../icons/Icon.jsx'

const WAVES = ['sin', 'saw', 'tri', 'sqr']

export default function WaveSelect({ value, onChange }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 6,
    }}>
      {WAVES.map(w => (
        <button
          key={w}
          onClick={() => onChange(w)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 3,
            borderRadius: 3,
            border: '1px solid',
            borderColor: value === w ? '#e74c3c' : 'rgba(255,255,255,0.08)',
            backgroundColor: value === w ? 'rgba(231,76,60,0.15)' : 'transparent',
            cursor: 'pointer',
            color: value === w ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)',
          }}
        >
          <Icon name={`wave-${w}`} size={10} />
        </button>
      ))}
    </div>
  )
}
