// node src/hooks/patchGraph.test.mjs — the FX module rules (index remapping is the kind of logic
// that looks right and is off by one).
import assert from 'node:assert/strict'
import { fxKey, isFxKey, fxModuleChannels, shiftFxModules, removeFxModule, removeChannelAt } from './patchGraph.js'

const mods = [
  { id: '1', input: 0 },            // fed by channel 1
  { id: '2', input: 2 },            // fed by channel 3
  { id: '3', input: 'rtn1' },       // fed by a bus
  { id: '4', input: fxKey('4') },   // fed by itself
  { id: '5', input: fxKey('1') },   // fed by module 1
  { id: '6', input: null },         // unpatched
]
assert.ok(isFxKey(fxKey('1')) && !isFxKey('rtn1') && !isFxKey(0))
assert.deepEqual([...fxModuleChannels(mods)].sort(), [0, 2])

// removing channel 2 (index 1): the module on channel 3 follows it down, channel 1's stays
const shifted = shiftFxModules(mods, 1)
assert.deepEqual(shifted.map((m) => m.input), [0, 1, 'rtn1', 'fxm:4', 'fxm:1', null])
// removing the channel a module reads: its IN is unpatched, not re-pointed
assert.equal(shiftFxModules(mods, 0)[0].input, null)
assert.equal(shiftFxModules(mods, 0)[1].input, 1)

// removing module 1 pulls its cables: module 5's IN, a channel's IN, a master slot — and nothing else
const out = removeFxModule(mods, [{ routeFrom: fxKey('1') }, { routeFrom: 'rtn1' }, { routeFrom: 0 }], { inputs: [fxKey('1'), 0, fxKey('4')] }, '1')
assert.deepEqual(out.modules.map((m) => m.id), ['2', '3', '4', '5', '6'])
assert.equal(out.modules.find((m) => m.id === '5').input, null)
assert.equal(out.modules.find((m) => m.id === '4').input, fxKey('4'))
assert.deepEqual(out.channels.map((c) => c.routeFrom), [null, 'rtn1', 0])
assert.deepEqual(out.master.inputs, [null, 0, fxKey('4')])

// a module key in a master slot survives a channel removal untouched; channel indices beside it still shift
const r = removeChannelAt([{}, {}, {}], { inputs: [fxKey('1'), 2, 0] }, 'off', 0)
assert.deepEqual(r.master.inputs, [fxKey('1'), 1, null])

console.log('patchGraph: fx module rules ok')
