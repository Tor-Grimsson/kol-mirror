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

// THE CABLE LIST (plan 10 § 4.2): every field reads as one cable, and removing one clears exactly its field
import { listCables, setCable, setSend, removeCable, accepts } from './patchGraph.js'
const st = {
  channels: [
    { routeFrom: null, sends: { aux1: 40 }, routeSendLevels: { 2: 25 }, feedback: { enabled: true, decay: 80 } },
    { routeFrom: 0, sends: {}, routeSendLevels: {}, feedback: { enabled: false } },
    { routeFrom: 'fxm:1', sends: {}, routeSendLevels: {}, feedback: { enabled: false } },
  ],
  master: { inputs: [0, null, 'fxm:1'] },
  screen2: '1',
  fxModules: [{ id: '1', input: 2 }],
}
const keys = listCables(st).map((c) => c.key).sort()
assert.deepEqual(keys, ['bus:aux1:0', 'ch-in:1', 'ch-in:2', 'ch-x:2:0', 'fb:0', 'fxm-in:1', 'mon', 'mst-in:0', 'mst-in:2'].sort())
for (const c of listCables(st)) {
  const after = listCables(removeCable(st, c)).map((x) => x.key)
  assert.ok(!after.includes(c.key), `removing ${c.key} leaves it`)
  assert.equal(after.length, keys.length - 1, `removing ${c.key} touches only it`)
}
assert.equal(removeCable(st, listCables(st).find((c) => c.key === 'fb:0')).channels[0].feedback.decay, 80)
assert.equal(setCable(st, 'mst-in:1', 1).master.inputs[1], 1)
assert.equal(setCable(st, 'mon', 'rtn1').screen2, '1')              // Screen 2 takes a channel only
assert.ok(!accepts('bus:aux1', 'fxm:1') && accepts('ch-in:0', 'rtn1'))
assert.equal(setSend(st, 'bus:aux2', 1, 30).channels[1].sends.aux2, 30)
console.log('patchGraph cables ok')

// a generator's cable (plan 11 § 3.3): lists into the channel IN, and unpatching leaves the channel loaded
import { clearAllPatches } from './patchGraph.js'
const g = { channels: [{ variantId: 'gen-noise', genFrom: 'gen:desk', sends: {}, routeSendLevels: {} }], master: { inputs: [] } }
const gc = listCables(g)
assert.deepEqual(gc.map((c) => [c.key, c.from, c.to]), [['gen>ch-in:0', 'gen:desk', 'ch-in:0']])
const gr = removeCable(g, gc[0]).channels[0]
assert.equal(gr.genFrom, null); assert.equal(gr.variantId, 'gen-noise')
assert.equal(clearAllPatches(g.channels, g.master).channels[0].genFrom, null)
console.log('patchGraph generator ok')
