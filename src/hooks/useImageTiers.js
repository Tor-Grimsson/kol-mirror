import { useEffect, useRef, useState } from 'react'
import { RASTER_TIER_SCALES } from '../data/mirrorVariants'

const STATIC_IMAGE_SIZES = { mid: 800, high: 1600 }
const STATIC_PATH_RE = /^\/images\/stack-hero-\d+\.jpg$/

/**
 * Generates and caches tiered image versions for any source.
 * - Static file paths: swap to responsive size
 * - Raster data URLs: high = original, mid = downscaled 50%
 * - SVG data URLs: rasterize at tier scales
 *
 * @param {string} imageSrc - image URL or data URL
 * @param {object} [options]
 * @param {string} [options.svgFillColor] - fill color for SVG currentColor replacement
 * @returns {{ tiers: { mid: string, high: string }, ready: boolean }}
 */
export default function useImageTiers(imageSrc, { svgFillColor, recalcKey = 0 } = {}) {
  const [tiers, setTiers] = useState({ mid: null, high: null })
  const [ready, setReady] = useState(false)
  const cacheRef = useRef(new Map())

  useEffect(() => {
    if (!imageSrc) {
      setTiers({ mid: null, high: null })
      setReady(false)
      return
    }

    // Check cache (recalcKey busts it)
    const cacheKey = imageSrc + (svgFillColor || '') + ':' + recalcKey
    if (cacheRef.current.has(cacheKey)) {
      setTiers(cacheRef.current.get(cacheKey))
      setReady(true)
      return
    }

    let cancelled = false

    // Static file path — swap the size number
    if (STATIC_PATH_RE.test(imageSrc)) {
      const result = {
        mid: imageSrc.replace(/stack-hero-\d+/, `stack-hero-${STATIC_IMAGE_SIZES.mid}`),
        high: imageSrc.replace(/stack-hero-\d+/, `stack-hero-${STATIC_IMAGE_SIZES.high}`),
      }
      cacheRef.current.set(cacheKey, result)
      if (!cancelled) { setTiers(result); setReady(true) }
      return
    }

    const isSvg = imageSrc.startsWith('data:image/svg+xml')

    if (isSvg) {
      // SVG — rasterize at each tier scale
      let svgContent = decodeURIComponent(imageSrc.replace(/^data:image\/svg\+xml;charset=utf-8,/, ''))
      if (svgFillColor) svgContent = svgContent.replace(/currentColor/g, svgFillColor)
      const blobUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgContent)

      const img = new Image()
      img.onload = () => {
        if (cancelled) return
        const result = {}
        for (const [tier, scale] of Object.entries(RASTER_TIER_SCALES)) {
          const canvas = document.createElement('canvas')
          canvas.width = (img.naturalWidth || 1024) * scale
          canvas.height = (img.naturalHeight || 1024) * scale
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
          result[tier] = canvas.toDataURL('image/png')
        }
        cacheRef.current.set(cacheKey, result)
        if (!cancelled) { setTiers(result); setReady(true) }
      }
      img.src = blobUrl
    } else {
      // Raster data URL or external URL — high = original, mid = downscaled
      const img = new Image()
      img.onload = () => {
        if (cancelled) return
        const midCanvas = document.createElement('canvas')
        midCanvas.width = Math.round(img.naturalWidth * 0.5)
        midCanvas.height = Math.round(img.naturalHeight * 0.5)
        const ctx = midCanvas.getContext('2d')
        ctx.drawImage(img, 0, 0, midCanvas.width, midCanvas.height)

        const result = {
          mid: midCanvas.toDataURL('image/png'),
          high: imageSrc,
        }
        cacheRef.current.set(cacheKey, result)
        if (!cancelled) { setTiers(result); setReady(true) }
      }
      img.onerror = () => {
        // Fallback: use original for both tiers
        const result = { mid: imageSrc, high: imageSrc }
        cacheRef.current.set(cacheKey, result)
        if (!cancelled) { setTiers(result); setReady(true) }
      }
      img.src = imageSrc
    }

    return () => { cancelled = true }
  }, [imageSrc, svgFillColor, recalcKey])

  return { tiers, ready }
}
