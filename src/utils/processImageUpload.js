/* The extension is explicit ONLY here, where the repo is otherwise
   extensionless: it lets `scripts/check-raster-cap.mjs` import this module in
   bare Node, which resolves ESM specifiers literally where Vite guesses. A
   check that cannot run is not a check. */
import { getQuality } from '../hooks/renderQuality.js'

/* The raster scale is a SETTING, not a constant (2026-08-27). At the old flat
   4×, a 1024px SVG became a 4096² texture — ~67 MB of GPU memory per channel,
   uploaded and sampled every frame, for detail no display can show. It is also
   capped by area here, so a large source can't blow past the pixel budget. */
export const rasterDims = (w, h) => {
  const q = getQuality()
  const scale = q.svgRasterScale ?? 2
  let tw = Math.max(1, Math.round(w * scale))
  let th = Math.max(1, Math.round(h * scale))
  const cap = q.maxChannelPixels ?? 2073600
  const px = tw * th
  if (cap > 0 && px > cap) {
    /* FLOOR, not round: rounding both sides independently can land the product
       just OVER the budget the line exists to enforce (4032×3024 → 1663×1247 =
       2,073,761 against a 2,073,600 cap). A cap that is exceeded by rounding is
       not a cap. */
    const k = Math.sqrt(cap / px)
    tw = Math.max(1, Math.floor(tw * k))
    th = Math.max(1, Math.floor(th * k))
  }
  return [tw, th]
}

/**
 * capRaster — bring an uploaded PHOTO under the channel pixel budget.
 *
 * The SVG path has been rasterised against the budget since 2026-08-27; the
 * raster path never was. A file straight off a phone's camera roll is 12 MP
 * (4032 × 3024) and went to the GPU at full size, per channel, on the weakest
 * device the app runs on — while `MobileStudio`'s own comment claimed the
 * opposite ("a 12MP phone photo does not become a 12MP texture"). It did.
 * Found 2026-09-01 measuring the mobile render budget, which turned out to be
 * fine everywhere else: the phone's canvas is 329k pixels against the desk's
 * 1.25M, so `scale` needed nothing — the SOURCE was the whole cost.
 *
 * `maxChannelPixels` only, NOT `svgRasterScale`: 2× is right for a vector,
 * which has no native resolution, and wrong for a photo, which does — you do
 * not upscale a JPEG to make it crisper. Under the cap the original passes
 * through untouched, so a small upload is byte-identical to before.
 *
 * The encoder follows the source: PNG stays PNG so alpha survives, everything
 * else re-encodes as JPEG because a 2 MP PNG of a photograph is ~8 MB of
 * base64 held in React state for no benefit.
 */
export const capRaster = (dataUrl) => new Promise((resolve) => {
  const cap = getQuality().maxChannelPixels ?? 2073600
  if (!(cap > 0)) return resolve(dataUrl)
  const img = new Image()
  img.onload = () => {
    const w = img.naturalWidth, h = img.naturalHeight
    if (w * h <= cap) return resolve(dataUrl)
    const k = Math.sqrt(cap / (w * h))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.floor(w * k))
    canvas.height = Math.max(1, Math.floor(h * k))
    canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
    const png = dataUrl.startsWith('data:image/png')
    resolve(canvas.toDataURL(png ? 'image/png' : 'image/jpeg', 0.92))
  }
  /* A source the browser cannot decode is not worth failing an upload over —
     the render path will reject it just as clearly as this would. */
  img.onerror = () => resolve(dataUrl)
  img.src = dataUrl
})

/**
 * Process an uploaded image file and return imageSrc + rasterSrc.
 * Works for both SVG and raster images.
 * @param {File} file
 * @returns {Promise<{ imageSrc: string, rasterSrc: string, isSvg: boolean }>}
 */
export default function processImageUpload(file, { recolor = false } = {}) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('Not an image file'))
      return
    }

    const isSvg = file.type === 'image/svg+xml'

    if (isSvg) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const rawText = event.target.result
        const svgText = recolor
          ? rawText.replace(/fill="(?!none)[^"]*"/gi, 'fill="currentColor"')
          : rawText
        const blob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' })
        const svgUrl = URL.createObjectURL(blob)

        // Read as data URL for storage
        const imageSrc = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgText)

        // Rasterize
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const [rw, rh] = rasterDims(img.naturalWidth || 1024, img.naturalHeight || 1024)
          canvas.width = rw
          canvas.height = rh
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
          URL.revokeObjectURL(svgUrl)
          resolve({ imageSrc, rasterSrc: canvas.toDataURL('image/png'), isSvg: true })
        }
        img.onerror = () => {
          URL.revokeObjectURL(svgUrl)
          reject(new Error('Failed to load SVG'))
        }
        img.src = svgUrl
      }
      reader.readAsText(file)
    } else {
      const reader = new FileReader()
      reader.onload = (event) => {
        capRaster(event.target.result).then((dataUrl) =>
          resolve({ imageSrc: dataUrl, rasterSrc: dataUrl, isSvg: false }))
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsDataURL(file)
    }
  })
}
