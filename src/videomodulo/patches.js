// Named patch presets — connection arrays loaded by PatchModule

export const patches = {
  init: [],

  ref: [
    // Clock → LFO sync, Sequencer, Envelope
    { fromModuleId: 'clk1', fromPort: 'out', toModuleId: 'lfo1', toPort: 'sync' },
    { fromModuleId: 'clk1', fromPort: 'out', toModuleId: 'seq1', toPort: 'clock' },
    { fromModuleId: 'clk1', fromPort: 'div', toModuleId: 'env1', toPort: 'gate' },
    // LFO/Env/Seq → RGB channels
    { fromModuleId: 'lfo1', fromPort: 'out', toModuleId: 'rgb1', toPort: 'r' },
    { fromModuleId: 'env1', fromPort: 'out', toModuleId: 'rgb1', toPort: 'g' },
    { fromModuleId: 'seq1', fromPort: 'out', toModuleId: 'rgb1', toPort: 'b' },
    // Seq → waveform, LFO/Env → wireframe
    { fromModuleId: 'seq1', fromPort: 'out', toModuleId: 'wave1', toPort: 'freq' },
    { fromModuleId: 'lfo1', fromPort: 'out', toModuleId: 'wire1', toPort: 'rx' },
    { fromModuleId: 'env1', fromPort: 'out', toModuleId: 'wire1', toPort: 'scale' },
    // Display
    { fromModuleId: 'rgb1', fromPort: 'out', toModuleId: 'mon1', toPort: 'a' },
    { fromModuleId: 'wave1', fromPort: 'out', toModuleId: 'mon2', toPort: 'a' },
    { fromModuleId: 'wire1', fromPort: 'out', toModuleId: 'mon2', toPort: 'b' },
    // Output composite
    { fromModuleId: 'rgb1', fromPort: 'out', toModuleId: 'out1', toPort: 'a' },
    { fromModuleId: 'wave1', fromPort: 'out', toModuleId: 'out1', toPort: 'b' },
    { fromModuleId: 'wire1', fromPort: 'out', toModuleId: 'out1', toPort: 'c' },
  ],
}
