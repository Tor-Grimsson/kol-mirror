/**
 * ModuleShelf — library of available modules.
 * Click a module to add it to the rack.
 * Organized by category.
 */

const MODULES = {
  'Timing': [
    { type: 'clock', label: 'CLK', hp: 8, desc: 'Master clock with divisions' },
    { type: 'gate', label: 'GATE', hp: 8, desc: 'Trigger to gate converter' },
    { type: 'clockdiv', label: 'CDIV', hp: 6, desc: 'Clock divider ÷2-÷16' },
  ],
  'Generators': [
    { type: 'lfo', label: 'LFO', hp: 12, desc: 'Low frequency oscillator' },
    { type: 'seq', label: 'SEQ', hp: 16, desc: '8-64 step sequencer' },
    { type: 'env', label: 'ENV', hp: 12, desc: 'ADSR envelope' },
    { type: 'sh', label: 'S&H', hp: 6, desc: 'Sample and hold' },
    { type: 'maths', label: 'MATHS', hp: 16, desc: 'Dual function generator' },
    { type: 'noise', label: 'NOISE', hp: 6, desc: 'White/pink/brown noise' },
    { type: 'ramp', label: 'RAMP', hp: 8, desc: 'H/V ramp generator' },
  ],
  'Video': [
    { type: 'gen', label: 'GEN', hp: 12, desc: 'Pattern generator' },
    { type: 'dither', label: 'DITHER', hp: 16, desc: '23 mode dither engine' },
    { type: 'geo', label: 'GEO', hp: 16, desc: 'Three.js 3D geometry' },
    { type: 'mon', label: 'MON', hp: 16, desc: 'Video monitor output' },
  ],
  'Signal': [
    { type: 'rgb', label: 'RGB', hp: 8, desc: 'RGB channel splitter' },
    { type: 'rgbmix', label: 'RGBMIX', hp: 10, desc: 'RGB channel mixer' },
    { type: 'vca', label: 'VCA', hp: 6, desc: 'Voltage controlled amp' },
    { type: 'fade', label: 'FADE', hp: 6, desc: 'A/B crossfader' },
    { type: 'luma', label: 'LUMA', hp: 6, desc: 'Luminance extractor' },
  ],
  'Processing': [
    { type: 'key', label: 'KEY', hp: 6, desc: 'Threshold keyer' },
    { type: 'wshp', label: 'WSHP', hp: 8, desc: 'Waveshaper' },
    { type: 'slew', label: 'SLEW', hp: 6, desc: 'Slew limiter' },
    { type: 'delay', label: 'DELAY', hp: 8, desc: 'Signal delay + feedback' },
    { type: 'quant', label: 'QUANT', hp: 6, desc: 'Step quantizer' },
    { type: 'rect', label: 'RECT', hp: 4, desc: 'Signal rectifier' },
    { type: 'so', label: 'S/O', hp: 4, desc: 'Scale and offset' },
  ],
  'Utility': [
    { type: 'logic', label: 'LOGIC', hp: 8, desc: 'Boolean logic gate' },
    { type: 'mult', label: 'MULT', hp: 6, desc: 'Signal multiplier' },
    { type: 'mix', label: 'MIX', hp: 16, desc: '4-input signal mixer' },
    { type: 'inv', label: 'INV', hp: 4, desc: 'Inverter + offset' },
    { type: 'cmp', label: 'CMP', hp: 6, desc: 'Signal comparator' },
    { type: 'sw', label: 'SWITCH', hp: 6, desc: 'A/B signal switch' },
    { type: 'smpl', label: 'SMPL', hp: 4, desc: 'Sample on trigger' },
    { type: 'mult2', label: '1:4', hp: 2, desc: 'Passive dual mult' },
  ],
  'Mixer': [
    { type: 'console', label: 'CONSOLE', hp: 32, desc: '4-ch video mix console' },
  ],
}

export default function ModuleShelf({ onAddModule, isOpen, onToggle }) {
  if (!isOpen) {
    return (
      <div
        className="fixed right-0 top-1/2 -translate-y-1/2 cursor-pointer select-none"
        style={{
          width: '24px',
          height: '80px',
          backgroundColor: 'rgba(30,30,30,0.9)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRight: 'none',
          borderRadius: '4px 0 0 4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          writingMode: 'vertical-rl',
          fontSize: '9px',
          fontFamily: 'var(--kol-font-mono)',
          color: 'rgba(255,255,255,0.4)',
          zIndex: 100,
        }}
        onClick={onToggle}
      >
        MODULES
      </div>
    )
  }

  return (
    <div
      className="fixed right-0 top-0 bottom-0 flex flex-col"
      style={{
        width: '220px',
        backgroundColor: 'rgba(20,20,20,0.95)',
        borderLeft: '1px solid rgba(255,255,255,0.06)',
        zIndex: 100,
        overflowY: 'auto',
        scrollbarWidth: 'none',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 border-b border-fg-08" style={{ height: '32px', minHeight: '32px' }}>
        <span style={{ fontSize: '10px', fontFamily: 'var(--kol-font-mono)', color: 'rgba(255,255,255,0.6)' }}>
          MODULES
        </span>
        <span
          className="cursor-pointer select-none text-fg-32 hover:text-fg-64"
          style={{ fontSize: '14px' }}
          onClick={onToggle}
        >
          ×
        </span>
      </div>

      {/* Categories */}
      <div className="flex flex-col py-2">
        {Object.entries(MODULES).map(([category, modules]) => (
          <div key={category} className="flex flex-col">
            {/* Category label */}
            <div className="px-3 py-1" style={{
              fontSize: '8px',
              fontFamily: 'var(--kol-font-mono)',
              color: 'rgba(255,255,255,0.25)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>
              {category}
            </div>

            {/* Module items */}
            {modules.map((mod) => (
              <div
                key={mod.type}
                className="flex items-center gap-2 px-3 py-1 cursor-pointer hover:bg-fg-08"
                onClick={() => onAddModule(mod)}
                style={{ minHeight: '24px' }}
              >
                {/* HP indicator */}
                <span style={{
                  fontSize: '7px',
                  fontFamily: 'var(--kol-font-mono)',
                  color: 'rgba(255,255,255,0.2)',
                  width: '16px',
                  textAlign: 'right',
                  flexShrink: 0,
                }}>
                  {mod.hp}hp
                </span>

                {/* Label */}
                <span style={{
                  fontSize: '9px',
                  fontFamily: 'var(--kol-font-mono)',
                  color: 'rgba(255,255,255,0.8)',
                  width: '48px',
                  flexShrink: 0,
                }}>
                  {mod.label}
                </span>

                {/* Description */}
                <span style={{
                  fontSize: '8px',
                  fontFamily: 'var(--kol-font-mono)',
                  color: 'rgba(255,255,255,0.25)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {mod.desc}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
