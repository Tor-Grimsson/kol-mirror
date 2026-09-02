/**
 * check-raster-cap — the one runnable check behind `capRaster`.
 *
 * `capRaster` is the guard that stops a camera-roll photo becoming a
 * texture at its own size (12 MP off a phone, per channel). The branch that
 * matters is arithmetic — does the result actually land under
 * `maxChannelPixels`, and does an already-small image pass through
 * byte-identical — so it is checkable without a browser by stubbing the three
 * DOM things it touches.
 *
 * Run: `node scripts/check-raster-cap.mjs`
 */
const CAP = 2073600

/* ── stubs. Image reports whatever size the data URL names; canvas records the
      dimensions drawn and hands back a data URL naming them, so the assertions
      below read the real numbers capRaster computed. */
let lastEncode = null

globalThis.localStorage = {
  getItem: () => JSON.stringify({ maxChannelPixels: CAP }),
  setItem: () => {},
}

globalThis.Image = class {
  set src(v) {
    const m = /#(\d+)x(\d+)/.exec(v)
    this.naturalWidth = m ? +m[1] : 1
    this.naturalHeight = m ? +m[2] : 1
    queueMicrotask(() => this.onload?.())
  }
}

globalThis.document = {
  createElement: () => ({
    width: 0, height: 0,
    getContext: () => ({ drawImage: () => {} }),
    toDataURL(type) {
      lastEncode = type
      return `data:${type};base64,STUB#${this.width}x${this.height}`
    },
  }),
}

const { capRaster } = await import('../src/utils/processImageUpload.js')

const dims = (url) => { const m = /#(\d+)x(\d+)/.exec(url); return [+m[1], +m[2]] }

let pass = 0, fail = 0
const check = (name, cond) => {
  if (cond) { pass++; console.log(`  ok   ${name}`) }
  else { fail++; console.log(`  FAIL ${name}`) }
}

/* 1 — a 12 MP phone photo lands under the cap */
const phone = await capRaster('data:image/jpeg;base64,X#4032x3024')
const [pw, ph] = dims(phone)
check('12MP photo is capped', pw * ph <= CAP)

/* 2 — and stays close to it rather than over-shrinking (aspect preserved) */
check('capped near the budget', pw * ph > CAP * 0.98)
check('aspect ratio preserved', Math.abs((pw / ph) - (4032 / 3024)) < 0.01)

/* 3 — an image already under the cap is returned UNTOUCHED, not re-encoded */
const small = 'data:image/jpeg;base64,X#800x600'
check('small image passes through byte-identical', (await capRaster(small)) === small)

/* 4 — PNG keeps its encoder so alpha survives; anything else becomes JPEG */
lastEncode = null
await capRaster('data:image/png;base64,X#4032x3024')
check('PNG stays PNG', lastEncode === 'image/png')
lastEncode = null
await capRaster('data:image/jpeg;base64,X#4032x3024')
check('non-PNG re-encodes as JPEG', lastEncode === 'image/jpeg')

console.log(`\n${pass}/${pass + fail} checks passed`)
process.exit(fail ? 1 : 0)
