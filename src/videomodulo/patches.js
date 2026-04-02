// Named patch presets — each defines modules + connections
// Format: { rows: [{ height, modules: [{ type, id }] }], connections: [...] }

export const patches = {
  empty: { rows: [{ height: '1u', modules: [] }, { height: '3u', modules: [] }, { height: '3u', modules: [] }], connections: [] },

  init: {
    rows: [
      { height: '1u', modules: [
        { type: 'mult', id: 'mult1' },
        { type: 'noise', id: 'noise1' },
        { type: 'attenuator', id: 'atten1' },
        { type: 'vca', id: 'vca1' },
      ]},
      { height: '3u', modules: [
        { type: 'patch', id: 'patch1' },
        { type: 'clock', id: 'clk1' },
        { type: 'clockDiv', id: 'div1' },
        { type: 'lfo', id: 'lfo1' },
        { type: 'envelope', id: 'env1' },
        { type: 'sequencer', id: 'seq1' },
        { type: 'sampleHold', id: 'sh1' },
        { type: 'logic', id: 'logic1' },
        { type: 'comparator', id: 'comp1' },
        { type: 'constant', id: 'const1' },
        { type: 'pen', id: 'pen1' },
        { type: 'switch', id: 'sw1' },
        { type: 'quantizer', id: 'quant1' },
        { type: 'scaleOfs', id: 'scl1' },
        { type: 'maths', id: 'maths1' },
        { type: 'mixer', id: 'mix1' },
      ]},
      { height: '3u', modules: [
        { type: 'waveform', id: 'wave1' },
        { type: 'rgb', id: 'rgb1' },
        { type: 'wireframe', id: 'wire1' },
        { type: 'ramp', id: 'ramp1' },
        { type: 'lineGen', id: 'line1' },
        { type: 'smx3', id: 'smx1' },
        { type: 'ringMod', id: 'ring1' },
        { type: 'waveshaper', id: 'wshp1' },
        { type: 'delay', id: 'delay1' },
        { type: 'reverb', id: 'verb1' },
        { type: 'monitor', id: 'mon1' },
        { type: 'output', id: 'out1' },
      ]},
    ],
    connections: [],
  },

  // --- LINEGEN PATCHES ---

  // Concentric circles pulsing at different rates, driven by a slow clock
  // 3 LineGens: inner rings fast, outer rings slow, middle modulated by envelope
  // Pen controls thickness so rings breathe from thin to thick
  // Visual: nested pulsing circles like a radar or sonar ping
  'sonar': {
    rows: [
      { height: '3u', modules: [
        { type: 'clock', id: 'clk', state: { bpm: 40, division: 1 } },
        { type: 'envelope', id: 'env', state: { attack: 70, decay: 40, sustain: 20, release: 80 } },
        { type: 'lfo', id: 'lfo', state: { rate: 30, shape: 'sin', depth: 90, offset: 40 } },
        { type: 'lineGen', id: 'inner', state: { shape: 'circle', freq: 60, density: 30, speed: 70 } },
        { type: 'lineGen', id: 'mid', state: { shape: 'circle', freq: 25, density: 50, speed: 35 } },
        { type: 'lineGen', id: 'outer', state: { shape: 'circle', freq: 10, density: 80, speed: 15 } },
        { type: 'pen', id: 'pen', state: { thickness: 40, opacity: 70 } },
        { type: 'output', id: 'out' },
      ]},
    ],
    connections: [
      // Clock triggers envelope, envelope modulates mid ring density
      { fromModuleId: 'clk', fromPort: 'out', toModuleId: 'env', toPort: 'gate' },
      { fromModuleId: 'env', fromPort: 'out', toModuleId: 'mid', toPort: 'dens' },
      // LFO modulates inner ring speed — fast pulsing core
      { fromModuleId: 'lfo', fromPort: 'out', toModuleId: 'inner', toPort: 'spd' },
      // Envelope modulates pen thickness — rings swell on each ping
      { fromModuleId: 'env', fromPort: 'out', toModuleId: 'pen', toPort: 'tk' },
      // All three rings → output layered
      { fromModuleId: 'inner', fromPort: 'out', toModuleId: 'out', toPort: 'a' },
      { fromModuleId: 'mid', fromPort: 'out', toModuleId: 'out', toPort: 'b' },
      { fromModuleId: 'outer', fromPort: 'out', toModuleId: 'out', toPort: 'c' },
      { fromModuleId: 'pen', fromPort: 'out', toModuleId: 'out', toPort: 'pen' },
    ],
  },

  // Logic-driven morphing — XOR of clock+LFO creates complex switching pattern
  // Switch alternates between two LineGens based on logic output
  // Logic also drives freq/density so shapes react to the pattern
  // Maths slews the logic output so transitions are smooth, not hard cuts
  'morph': {
    rows: [
      { height: '3u', modules: [
        { type: 'clock', id: 'clk', state: { bpm: 90, division: 3 } },
        { type: 'lfo', id: 'lfo', state: { rate: 15, shape: 'sqr', depth: 100, offset: 50 } },
        { type: 'logic', id: 'xor' },
        { type: 'logic', id: 'and' },
        { type: 'maths', id: 'slew', state: { rise: 60, fall: 30 } },
        { type: 'scaleOfs', id: 'scl', state: { scale: 80, offset: 70 } },
      ]},
      { height: '3u', modules: [
        { type: 'lineGen', id: 'gen1', state: { shape: 'lissa', freq: 45, density: 60, speed: 30 } },
        { type: 'lineGen', id: 'gen2', state: { shape: 'spiral', freq: 20, density: 40, speed: 55 } },
        { type: 'switch', id: 'sw' },
        { type: 'pen', id: 'pen', state: { thickness: 35, dash: 10, gap: 8, opacity: 90 } },
        { type: 'monitor', id: 'mon' },
        { type: 'output', id: 'out' },
      ]},
    ],
    connections: [
      // Two rhythms into Logic: clock (steady) XOR LFO (varying) = complex pattern
      { fromModuleId: 'clk', fromPort: 'out', toModuleId: 'xor', toPort: 'a' },
      { fromModuleId: 'lfo', fromPort: 'out', toModuleId: 'xor', toPort: 'b' },
      // AND of same signals = different pattern — drives gen2 density
      { fromModuleId: 'clk', fromPort: 'out', toModuleId: 'and', toPort: 'a' },
      { fromModuleId: 'lfo', fromPort: 'out', toModuleId: 'and', toPort: 'b' },
      { fromModuleId: 'and', fromPort: 'out', toModuleId: 'gen2', toPort: 'dens' },
      // XOR → slew (smooth the 0/100 jumps into gradual transitions)
      { fromModuleId: 'xor', fromPort: 'out', toModuleId: 'slew', toPort: 'a' },
      // Slewed logic → scale/offset → gen1 freq (pattern drives shape complexity)
      { fromModuleId: 'slew', fromPort: 'out', toModuleId: 'scl', toPort: 'in' },
      { fromModuleId: 'scl', fromPort: 'out', toModuleId: 'gen1', toPort: 'freq' },
      // XOR gates the switch: alternates which generator is visible
      { fromModuleId: 'xor', fromPort: 'out', toModuleId: 'sw', toPort: 'cv' },
      { fromModuleId: 'gen1', fromPort: 'out', toModuleId: 'sw', toPort: 'a' },
      { fromModuleId: 'gen2', fromPort: 'out', toModuleId: 'sw', toPort: 'b' },
      // Slewed logic → pen thickness (lines thicken during transitions)
      { fromModuleId: 'slew', fromPort: 'out', toModuleId: 'pen', toPort: 'tk' },
      // Display
      { fromModuleId: 'sw', fromPort: 'out', toModuleId: 'mon', toPort: 'a' },
      { fromModuleId: 'sw', fromPort: 'out', toModuleId: 'out', toPort: 'a' },
      { fromModuleId: 'pen', fromPort: 'out', toModuleId: 'out', toPort: 'pen' },
      { fromModuleId: 'pen', fromPort: 'out', toModuleId: 'mon', toPort: 'pen' },
    ],
  },

  // LineGen → Delay (trailing echoes) → Transform (spinning + scaling)
  // Two LFOs at different rates: one drives transform rotation, other drives delay time
  // Envelope pulses the transform scale on each beat
  // Visual: 2D pattern leaves ghost trails that rotate and breathe
  'trail-spin': {
    rows: [
      { height: '3u', modules: [
        { type: 'clock', id: 'clk', state: { bpm: 72, division: 2 } },
        { type: 'lfo', id: 'lfo1', state: { rate: 5, shape: 'tri', depth: 80, offset: 30 } },
        { type: 'lfo', id: 'lfo2', state: { rate: 45, shape: 'saw', depth: 60, offset: 50 } },
        { type: 'envelope', id: 'env', state: { attack: 50, decay: 15, sustain: 30, release: 70 } },
        { type: 'lineGen', id: 'gen', state: { shape: 'spiral', freq: 35, density: 70, speed: 40 } },
        { type: 'delay', id: 'dly', state: { time: 25, mix: 80, copies: 50, fb: 0 } },
        { type: 'transform', id: 'xfm', state: { scale: 60, rotZ: 15 } },
        { type: 'pen', id: 'pen', state: { thickness: 55, dash: 0, opacity: 85 } },
        { type: 'output', id: 'out' },
      ]},
    ],
    connections: [
      // Clock triggers envelope
      { fromModuleId: 'clk', fromPort: 'out', toModuleId: 'env', toPort: 'gate' },
      // LFO1 (slow) → transform rZ rotation — whole thing spins
      { fromModuleId: 'lfo1', fromPort: 'out', toModuleId: 'xfm', toPort: 'rz' },
      // LFO2 (faster) → delay time CV — echo spacing shifts over time
      { fromModuleId: 'lfo2', fromPort: 'out', toModuleId: 'dly', toPort: 'tCV' },
      // LFO1 → transform rX — tilts in 3D
      { fromModuleId: 'lfo1', fromPort: 'out', toModuleId: 'xfm', toPort: 'rx' },
      // Envelope → transform scale — pulses bigger on each beat
      { fromModuleId: 'env', fromPort: 'out', toModuleId: 'xfm', toPort: 's' },
      // LFO2 → lineGen speed — pattern animation varies
      { fromModuleId: 'lfo2', fromPort: 'out', toModuleId: 'gen', toPort: 'spd' },
      // Signal chain: LineGen → Delay → Transform → Output
      { fromModuleId: 'gen', fromPort: 'out', toModuleId: 'dly', toPort: 'in' },
      { fromModuleId: 'dly', fromPort: 'out', toModuleId: 'xfm', toPort: 'in' },
      { fromModuleId: 'xfm', fromPort: 'out', toModuleId: 'out', toPort: 'a' },
      { fromModuleId: 'pen', fromPort: 'out', toModuleId: 'out', toPort: 'pen' },
    ],
  },

  // --- WAVEFORM PATCHES ---

  // Slow morphing sine wave — LFO modulates waveform frequency over time
  // Visual: a single waveform line that slowly stretches and compresses
  'morph-wave': {
    rows: [
      { height: '3u', modules: [
        { type: 'lfo', id: 'lfo' },
        { type: 'waveform', id: 'wave' },
        { type: 'monitor', id: 'mon' },
      ]},
    ],
    connections: [
      { fromModuleId: 'lfo', fromPort: 'out', toModuleId: 'wave', toPort: 'freq' },
      { fromModuleId: 'wave', fromPort: 'out', toModuleId: 'mon', toPort: 'a' },
    ],
  },

  // Sequenced melody — clock advances steps, each step sets a different waveform frequency
  // Visual: waveform jumps between frequencies in a pattern, like a visual melody
  'melody': {
    rows: [
      { height: '3u', modules: [
        { type: 'clock', id: 'clk' },
        { type: 'sequencer', id: 'seq' },
        { type: 'maths', id: 'slew' },
        { type: 'waveform', id: 'wave' },
        { type: 'monitor', id: 'mon' },
      ]},
    ],
    connections: [
      { fromModuleId: 'clk', fromPort: 'out', toModuleId: 'seq', toPort: 'clock' },
      { fromModuleId: 'seq', fromPort: 'out', toModuleId: 'slew', toPort: 'a' },
      { fromModuleId: 'slew', fromPort: 'out', toModuleId: 'wave', toPort: 'freq' },
      { fromModuleId: 'wave', fromPort: 'out', toModuleId: 'mon', toPort: 'a' },
      { fromModuleId: 'seq', fromPort: 'out', toModuleId: 'mon', toPort: 'b' },
    ],
  },

  // Rhythmic burst — envelope shapes waveform amplitude, clock triggers envelope
  // Visual: waveform appears in bursts, grows and decays with ADSR shape
  'burst': {
    rows: [
      { height: '3u', modules: [
        { type: 'clock', id: 'clk' },
        { type: 'envelope', id: 'env' },
        { type: 'waveform', id: 'wave' },
        { type: 'pen', id: 'pen' },
        { type: 'monitor', id: 'mon' },
      ]},
    ],
    connections: [
      { fromModuleId: 'clk', fromPort: 'out', toModuleId: 'env', toPort: 'gate' },
      { fromModuleId: 'env', fromPort: 'out', toModuleId: 'wave', toPort: 'amp' },
      { fromModuleId: 'pen', fromPort: 'out', toModuleId: 'mon', toPort: 'pen' },
      { fromModuleId: 'wave', fromPort: 'out', toModuleId: 'mon', toPort: 'a' },
      { fromModuleId: 'env', fromPort: 'out', toModuleId: 'mon', toPort: 'b' },
    ],
  },

  // --- WIREFRAME PATCHES ---

  // Breathing cube — slow LFO modulates scale, gentle rotation
  // Visual: wireframe cube slowly grows and shrinks, tumbling
  'breathing': {
    rows: [
      { height: '3u', modules: [
        { type: 'lfo', id: 'lfo' },
        { type: 'wireframe', id: 'wire' },
        { type: 'pen', id: 'pen' },
        { type: 'output', id: 'out' },
      ]},
    ],
    connections: [
      { fromModuleId: 'lfo', fromPort: 'out', toModuleId: 'wire', toPort: 'scale' },
      { fromModuleId: 'pen', fromPort: 'out', toModuleId: 'out', toPort: 'pen' },
      { fromModuleId: 'wire', fromPort: 'out', toModuleId: 'out', toPort: 'a' },
    ],
  },

  // Pendulum — triangle LFO drives single rotation axis, back and forth
  // Visual: wireframe swinging like a pendulum
  'pendulum': {
    rows: [
      { height: '3u', modules: [
        { type: 'lfo', id: 'lfo' },
        { type: 'wireframe', id: 'wire' },
        { type: 'output', id: 'out' },
      ]},
    ],
    connections: [
      { fromModuleId: 'lfo', fromPort: 'out', toModuleId: 'wire', toPort: 'rx' },
      { fromModuleId: 'wire', fromPort: 'out', toModuleId: 'out', toPort: 'a' },
    ],
  },

  // Kraftwerk — clocked envelope drives rotation speed, thick pen
  // Visual: mechanical rotating wireframe with weight and momentum
  'kraftwerk': {
    rows: [
      { height: '3u', modules: [
        { type: 'clock', id: 'clk' },
        { type: 'envelope', id: 'env' },
        { type: 'lfo', id: 'lfo' },
        { type: 'wireframe', id: 'wire' },
        { type: 'pen', id: 'pen' },
        { type: 'output', id: 'out' },
      ]},
    ],
    connections: [
      { fromModuleId: 'clk', fromPort: 'out', toModuleId: 'env', toPort: 'gate' },
      { fromModuleId: 'env', fromPort: 'out', toModuleId: 'wire', toPort: 'rx' },
      { fromModuleId: 'lfo', fromPort: 'out', toModuleId: 'wire', toPort: 'ry' },
      { fromModuleId: 'env', fromPort: 'out', toModuleId: 'wire', toPort: 'scale' },
      { fromModuleId: 'pen', fromPort: 'out', toModuleId: 'out', toPort: 'pen' },
      { fromModuleId: 'wire', fromPort: 'out', toModuleId: 'out', toPort: 'a' },
    ],
  },

  // Sequenced geometry — each step rotates wireframe to a different angle
  // Visual: wireframe snaps between quantized orientations on each beat
  'seq-geo': {
    rows: [
      { height: '3u', modules: [
        { type: 'clock', id: 'clk' },
        { type: 'sequencer', id: 'seq' },
        { type: 'quantizer', id: 'qt' },
        { type: 'wireframe', id: 'wire' },
        { type: 'monitor', id: 'mon' },
      ]},
    ],
    connections: [
      { fromModuleId: 'clk', fromPort: 'out', toModuleId: 'seq', toPort: 'clock' },
      { fromModuleId: 'seq', fromPort: 'out', toModuleId: 'qt', toPort: 'in' },
      { fromModuleId: 'qt', fromPort: 'out', toModuleId: 'wire', toPort: 'rx' },
      { fromModuleId: 'seq', fromPort: 'out', toModuleId: 'wire', toPort: 'ry' },
      { fromModuleId: 'wire', fromPort: 'out', toModuleId: 'mon', toPort: 'a' },
    ],
  },

  // --- COLOR PATCHES ---

  // Smooth color cycle — LFO through scale/offset creates phase-shifted RGB
  // Visual: smoothly cycling through the color spectrum
  'color-cycle': {
    rows: [
      { height: '3u', modules: [
        { type: 'lfo', id: 'lfo' },
        { type: 'mult', id: 'mult' },
        { type: 'scaleOfs', id: 'scl' },
        { type: 'attenuator', id: 'att' },
        { type: 'rgb', id: 'rgb' },
        { type: 'output', id: 'out' },
      ]},
    ],
    connections: [
      { fromModuleId: 'lfo', fromPort: 'out', toModuleId: 'mult', toPort: 'in' },
      { fromModuleId: 'mult', fromPort: 'a', toModuleId: 'rgb', toPort: 'r' },
      { fromModuleId: 'mult', fromPort: 'b', toModuleId: 'scl', toPort: 'in' },
      { fromModuleId: 'scl', fromPort: 'out', toModuleId: 'rgb', toPort: 'g' },
      { fromModuleId: 'mult', fromPort: 'c', toModuleId: 'att', toPort: 'in' },
      { fromModuleId: 'att', fromPort: 'out', toModuleId: 'rgb', toPort: 'b' },
      { fromModuleId: 'rgb', fromPort: 'out', toModuleId: 'out', toPort: 'a' },
    ],
  },

  // Stepped color — sequencer drives RGB through maths slew for smooth transitions
  // Visual: color changes in smooth steps, like a palette cycling slowly
  'color-steps': {
    rows: [
      { height: '3u', modules: [
        { type: 'clock', id: 'clk' },
        { type: 'sequencer', id: 'seq' },
        { type: 'maths', id: 'slew' },
        { type: 'mult', id: 'mult' },
        { type: 'scaleOfs', id: 'scl' },
        { type: 'rgb', id: 'rgb' },
        { type: 'output', id: 'out' },
      ]},
    ],
    connections: [
      { fromModuleId: 'clk', fromPort: 'out', toModuleId: 'seq', toPort: 'clock' },
      { fromModuleId: 'seq', fromPort: 'out', toModuleId: 'slew', toPort: 'a' },
      { fromModuleId: 'slew', fromPort: 'out', toModuleId: 'mult', toPort: 'in' },
      { fromModuleId: 'mult', fromPort: 'a', toModuleId: 'rgb', toPort: 'r' },
      { fromModuleId: 'mult', fromPort: 'b', toModuleId: 'scl', toPort: 'in' },
      { fromModuleId: 'scl', fromPort: 'out', toModuleId: 'rgb', toPort: 'g' },
      { fromModuleId: 'mult', fromPort: 'c', toModuleId: 'rgb', toPort: 'b' },
      { fromModuleId: 'rgb', fromPort: 'out', toModuleId: 'out', toPort: 'a' },
    ],
  },

  // S&H color — noise sampled on clock creates random held colors
  // Visual: color jumps to random value on each beat, holds until next
  'sh-color': {
    rows: [
      { height: '1u', modules: [
        { type: 'noise', id: 'n1' },
        { type: 'noise', id: 'n2' },
        { type: 'noise', id: 'n3' },
      ]},
      { height: '3u', modules: [
        { type: 'clock', id: 'clk' },
        { type: 'sampleHold', id: 'sh1' },
        { type: 'sampleHold', id: 'sh2' },
        { type: 'sampleHold', id: 'sh3' },
        { type: 'rgb', id: 'rgb' },
        { type: 'output', id: 'out' },
      ]},
    ],
    connections: [
      { fromModuleId: 'clk', fromPort: 'out', toModuleId: 'sh1', toPort: 'trig' },
      { fromModuleId: 'clk', fromPort: 'out', toModuleId: 'sh2', toPort: 'trig' },
      { fromModuleId: 'clk', fromPort: 'div', toModuleId: 'sh3', toPort: 'trig' },
      { fromModuleId: 'n1', fromPort: 'out', toModuleId: 'sh1', toPort: 'in' },
      { fromModuleId: 'n2', fromPort: 'out', toModuleId: 'sh2', toPort: 'in' },
      { fromModuleId: 'n3', fromPort: 'out', toModuleId: 'sh3', toPort: 'in' },
      { fromModuleId: 'sh1', fromPort: 'out', toModuleId: 'rgb', toPort: 'r' },
      { fromModuleId: 'sh2', fromPort: 'out', toModuleId: 'rgb', toPort: 'g' },
      { fromModuleId: 'sh3', fromPort: 'out', toModuleId: 'rgb', toPort: 'b' },
      { fromModuleId: 'rgb', fromPort: 'out', toModuleId: 'out', toPort: 'a' },
    ],
  },

  // Color matrix — three different sources routed through SMX3
  // Visual: complex color mixing from independent signal sources
  'matrix': {
    rows: [
      { height: '3u', modules: [
        { type: 'lfo', id: 'lfo' },
        { type: 'ramp', id: 'ramp' },
        { type: 'noise', id: 'noise' },
        { type: 'smx3', id: 'smx' },
        { type: 'output', id: 'out' },
      ]},
    ],
    connections: [
      { fromModuleId: 'lfo', fromPort: 'out', toModuleId: 'smx', toPort: 'a' },
      { fromModuleId: 'ramp', fromPort: 'out', toModuleId: 'smx', toPort: 'b' },
      { fromModuleId: 'noise', fromPort: 'out', toModuleId: 'smx', toPort: 'c' },
      { fromModuleId: 'smx', fromPort: 'out', toModuleId: 'out', toPort: 'a' },
    ],
  },

  // --- RHYTHM PATCHES ---

  // Gate pattern — clock divider + logic creates compound rhythms
  // Visual: envelope triggered by logic pattern, scope shows the rhythm
  'rhythm': {
    rows: [
      { height: '3u', modules: [
        { type: 'clock', id: 'clk' },
        { type: 'clockDiv', id: 'div' },
        { type: 'logic', id: 'log' },
        { type: 'envelope', id: 'env' },
        { type: 'monitor', id: 'mon' },
      ]},
    ],
    connections: [
      { fromModuleId: 'clk', fromPort: 'out', toModuleId: 'div', toPort: 'in' },
      { fromModuleId: 'clk', fromPort: 'out', toModuleId: 'log', toPort: 'a' },
      { fromModuleId: 'div', fromPort: 'out', toModuleId: 'log', toPort: 'b' },
      { fromModuleId: 'log', fromPort: 'out', toModuleId: 'env', toPort: 'gate' },
      { fromModuleId: 'env', fromPort: 'out', toModuleId: 'mon', toPort: 'a' },
      { fromModuleId: 'log', fromPort: 'out', toModuleId: 'mon', toPort: 'b' },
    ],
  },

  // VCA pulse — envelope controls LFO amplitude through VCA
  // Visual: scope trace that pulses in size with the rhythm
  'vca-pulse': {
    rows: [
      { height: '1u', modules: [
        { type: 'vca', id: 'vca' },
      ]},
      { height: '3u', modules: [
        { type: 'clock', id: 'clk' },
        { type: 'envelope', id: 'env' },
        { type: 'lfo', id: 'lfo' },
        { type: 'monitor', id: 'mon' },
      ]},
    ],
    connections: [
      { fromModuleId: 'clk', fromPort: 'out', toModuleId: 'env', toPort: 'gate' },
      { fromModuleId: 'lfo', fromPort: 'out', toModuleId: 'vca', toPort: 'in' },
      { fromModuleId: 'env', fromPort: 'out', toModuleId: 'vca', toPort: 'cv' },
      { fromModuleId: 'vca', fromPort: 'out', toModuleId: 'mon', toPort: 'a' },
      { fromModuleId: 'env', fromPort: 'out', toModuleId: 'mon', toPort: 'b' },
    ],
  },

  // --- TEXTURE PATCHES ---

  // Ring mod metallic — two signals multiplied create complex tones
  // Visual: scope shows interference pattern between two frequencies
  'metallic': {
    rows: [
      { height: '3u', modules: [
        { type: 'lfo', id: 'lfo1' },
        { type: 'lfo', id: 'lfo2' },
        { type: 'ringMod', id: 'ring' },
        { type: 'monitor', id: 'mon' },
      ]},
    ],
    connections: [
      { fromModuleId: 'lfo1', fromPort: 'out', toModuleId: 'ring', toPort: 'a' },
      { fromModuleId: 'lfo2', fromPort: 'out', toModuleId: 'ring', toPort: 'b' },
      { fromModuleId: 'ring', fromPort: 'out', toModuleId: 'mon', toPort: 'a' },
      { fromModuleId: 'lfo1', fromPort: 'out', toModuleId: 'mon', toPort: 'b' },
    ],
  },

  // Echo trail — LFO through delay with high feedback
  // Visual: scope trace with repeating echoes that decay over time
  'echo-trail': {
    rows: [
      { height: '3u', modules: [
        { type: 'lfo', id: 'lfo' },
        { type: 'delay', id: 'dly' },
        { type: 'monitor', id: 'mon' },
      ]},
    ],
    connections: [
      { fromModuleId: 'lfo', fromPort: 'out', toModuleId: 'dly', toPort: 'in' },
      { fromModuleId: 'dly', fromPort: 'out', toModuleId: 'mon', toPort: 'a' },
      { fromModuleId: 'lfo', fromPort: 'out', toModuleId: 'mon', toPort: 'b' },
    ],
  },

  // Wash — noise through reverb creates ambient drift
  // Visual: smooth drifting color from reverb-smeared noise
  'wash': {
    rows: [
      { height: '1u', modules: [
        { type: 'noise', id: 'noise' },
      ]},
      { height: '3u', modules: [
        { type: 'reverb', id: 'verb' },
        { type: 'rgb', id: 'rgb' },
        { type: 'output', id: 'out' },
      ]},
    ],
    connections: [
      { fromModuleId: 'noise', fromPort: 'out', toModuleId: 'verb', toPort: 'in' },
      { fromModuleId: 'verb', fromPort: 'out', toModuleId: 'rgb', toPort: 'r' },
      { fromModuleId: 'verb', fromPort: 'out', toModuleId: 'rgb', toPort: 'g' },
      { fromModuleId: 'verb', fromPort: 'out', toModuleId: 'rgb', toPort: 'b' },
      { fromModuleId: 'rgb', fromPort: 'out', toModuleId: 'out', toPort: 'a' },
    ],
  },

  // Solarize — waveshaper fold creates psychedelic gradient inversion
  // Visual: ramp folded into complex waveform, changing over time
  'solarize': {
    rows: [
      { height: '3u', modules: [
        { type: 'ramp', id: 'ramp' },
        { type: 'lfo', id: 'lfo' },
        { type: 'waveshaper', id: 'wshp' },
        { type: 'monitor', id: 'mon' },
      ]},
    ],
    connections: [
      { fromModuleId: 'ramp', fromPort: 'out', toModuleId: 'wshp', toPort: 'in' },
      { fromModuleId: 'lfo', fromPort: 'out', toModuleId: 'wshp', toPort: 'in' },
      { fromModuleId: 'wshp', fromPort: 'out', toModuleId: 'mon', toPort: 'a' },
      { fromModuleId: 'ramp', fromPort: 'out', toModuleId: 'mon', toPort: 'b' },
    ],
  },

  // Staircase — noise sampled into steps, quantized
  // Visual: scope shows a random staircase pattern that changes per beat
  'staircase': {
    rows: [
      { height: '1u', modules: [
        { type: 'noise', id: 'noise' },
      ]},
      { height: '3u', modules: [
        { type: 'clock', id: 'clk' },
        { type: 'sampleHold', id: 'sh' },
        { type: 'quantizer', id: 'qt' },
        { type: 'monitor', id: 'mon' },
      ]},
    ],
    connections: [
      { fromModuleId: 'clk', fromPort: 'out', toModuleId: 'sh', toPort: 'trig' },
      { fromModuleId: 'noise', fromPort: 'out', toModuleId: 'sh', toPort: 'in' },
      { fromModuleId: 'sh', fromPort: 'out', toModuleId: 'qt', toPort: 'in' },
      { fromModuleId: 'qt', fromPort: 'out', toModuleId: 'mon', toPort: 'a' },
      { fromModuleId: 'sh', fromPort: 'out', toModuleId: 'mon', toPort: 'b' },
    ],
  },

  // --- COMPOSITE PATCHES ---

  // Wire + color — wireframe shape on colored background
  // Visual: rotating wireframe overlaid on slowly changing color field
  'wire-color': {
    rows: [
      { height: '3u', modules: [
        { type: 'lfo', id: 'lfo' },
        { type: 'wireframe', id: 'wire' },
        { type: 'rgb', id: 'rgb' },
        { type: 'pen', id: 'pen' },
        { type: 'output', id: 'out' },
      ]},
    ],
    connections: [
      { fromModuleId: 'lfo', fromPort: 'out', toModuleId: 'wire', toPort: 'rx' },
      { fromModuleId: 'lfo', fromPort: 'out', toModuleId: 'rgb', toPort: 'r' },
      { fromModuleId: 'rgb', fromPort: 'out', toModuleId: 'out', toPort: 'a' },
      { fromModuleId: 'wire', fromPort: 'out', toModuleId: 'out', toPort: 'b' },
      { fromModuleId: 'pen', fromPort: 'out', toModuleId: 'out', toPort: 'pen' },
    ],
  },

  // Full system — every stage of the signal path used purposefully
  // Clock → rhythm → envelope → VCA → seq → slew → waveshaper → SMX3 → output
  // Visual: complex evolving color driven by shaped rhythmic sequence
  'system': {
    rows: [
      { height: '1u', modules: [
        { type: 'vca', id: 'vca' },
        { type: 'mult', id: 'mult' },
      ]},
      { height: '3u', modules: [
        { type: 'clock', id: 'clk' },
        { type: 'clockDiv', id: 'div' },
        { type: 'envelope', id: 'env' },
        { type: 'sequencer', id: 'seq' },
        { type: 'maths', id: 'slew' },
        { type: 'waveshaper', id: 'wshp' },
        { type: 'monitor', id: 'mon' },
      ]},
      { height: '3u', modules: [
        { type: 'lfo', id: 'lfo' },
        { type: 'smx3', id: 'smx' },
        { type: 'wireframe', id: 'wire' },
        { type: 'pen', id: 'pen' },
        { type: 'output', id: 'out' },
      ]},
    ],
    connections: [
      // Timing
      { fromModuleId: 'clk', fromPort: 'out', toModuleId: 'seq', toPort: 'clock' },
      { fromModuleId: 'clk', fromPort: 'out', toModuleId: 'div', toPort: 'in' },
      { fromModuleId: 'div', fromPort: 'out', toModuleId: 'env', toPort: 'gate' },
      // Seq → slew → waveshaper chain
      { fromModuleId: 'seq', fromPort: 'out', toModuleId: 'slew', toPort: 'a' },
      { fromModuleId: 'slew', fromPort: 'out', toModuleId: 'wshp', toPort: 'in' },
      // Split shaped signal
      { fromModuleId: 'wshp', fromPort: 'out', toModuleId: 'mult', toPort: 'in' },
      { fromModuleId: 'mult', fromPort: 'a', toModuleId: 'smx', toPort: 'a' },
      { fromModuleId: 'mult', fromPort: 'b', toModuleId: 'wire', toPort: 'rx' },
      // LFO as second color source
      { fromModuleId: 'lfo', fromPort: 'out', toModuleId: 'smx', toPort: 'b' },
      // Envelope → VCA → third color source
      { fromModuleId: 'env', fromPort: 'out', toModuleId: 'vca', toPort: 'cv' },
      { fromModuleId: 'lfo', fromPort: 'out', toModuleId: 'vca', toPort: 'in' },
      { fromModuleId: 'vca', fromPort: 'out', toModuleId: 'smx', toPort: 'c' },
      // Envelope → wireframe scale
      { fromModuleId: 'env', fromPort: 'out', toModuleId: 'wire', toPort: 'scale' },
      // Display
      { fromModuleId: 'smx', fromPort: 'out', toModuleId: 'out', toPort: 'a' },
      { fromModuleId: 'wire', fromPort: 'out', toModuleId: 'out', toPort: 'b' },
      { fromModuleId: 'pen', fromPort: 'out', toModuleId: 'out', toPort: 'pen' },
      { fromModuleId: 'wshp', fromPort: 'out', toModuleId: 'mon', toPort: 'a' },
      { fromModuleId: 'env', fromPort: 'out', toModuleId: 'mon', toPort: 'b' },
    ],
  },
}
