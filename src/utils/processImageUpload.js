import { getQuality } from '../hooks/renderQuality'

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
    const k = Math.sqrt(cap / px)
    tw = Math.max(1, Math.round(tw * k))
    th = Math.max(1, Math.round(th * k))
  }
  return [tw, th]
}

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
        const dataUrl = event.target.result
        resolve({ imageSrc: dataUrl, rasterSrc: dataUrl, isSvg: false })
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsDataURL(file)
    }
  })
}
