import { useEffect, useRef, useState } from 'react'
import { Application, Assets } from 'pixi.js'

/**
 * Shared Pixi Application lifecycle hook.
 * Handles init, resize, texture loading, and cleanup.
 *
 * @param {RefObject} canvasRef - ref to the <canvas> element
 * @param {string} imageSrc - image URL to load as texture
 * @param {object} [options]
 * @param {number} [options.backgroundColor=0x1a1a1a]
 * @returns {{ appRef, containerRef, textureRef, size: { width, height } }}
 */
export default function usePixiApp(canvasRef, imageSrc, { backgroundColor = 0x000000, backgroundAlpha = 0, preserveDrawingBuffer = false } = {}) {
  const appRef = useRef(null)
  const containerRef = useRef(null)
  const textureRef = useRef(null)
  const [size, setSize] = useState({ width: 0, height: 0 })
  const [textureVersion, setTextureVersion] = useState(0)
  const [renderCost, setRenderCost] = useState(0) // percentage of 16.6ms frame budget
  const frameTimesRef = useRef([])
  const costTickerRef = useRef(null)

  // Init Pixi app + ResizeObserver
  useEffect(() => {
    if (!canvasRef.current) return

    let destroyed = false
    let observer = null
    let costInterval = null

    const init = async () => {
      try {
        const canvasWrapper = canvasRef.current?.parentElement
        const imageContainer = canvasWrapper?.parentElement
        if (!imageContainer) return

        const width = imageContainer.clientWidth
        const height = imageContainer.clientHeight
        if (width === 0 || height === 0) return

        const app = new Application()
        if (destroyed) return
        appRef.current = app

        await app.init({
          canvas: canvasRef.current,
          width,
          height,
          backgroundColor,
          backgroundAlpha,
          resolution: window.devicePixelRatio || 1,
          autoDensity: true,
          ...(preserveDrawingBuffer && { webgl: { preserveDrawingBuffer: true } }),
        })

        if (destroyed) { app.destroy(true); return }

        containerRef.current = app.stage

        // Load initial texture before signaling ready via setSize
        if (imageSrc) {
          const texture = await Assets.load(imageSrc)
          if (!destroyed) textureRef.current = texture
        }

        if (!destroyed) setSize({ width, height })

        // Measure render cost per frame
        const measureFn = () => {
          const t0 = performance.now()
          app.renderer.render(app.stage)
          const dt = performance.now() - t0
          const times = frameTimesRef.current
          times.push(dt)
          if (times.length > 30) times.shift()
        }
        measureFn._priority = -1000 // run after all other ticker callbacks
        app.ticker.add(measureFn)
        costTickerRef.current = measureFn

        // Update cost display every 500ms
        costInterval = setInterval(() => {
          const times = frameTimesRef.current
          if (times.length === 0) return
          const avg = times.reduce((a, b) => a + b, 0) / times.length
          const pct = Math.round((avg / 16.67) * 100)
          setRenderCost(prev => prev === pct ? prev : pct)
        }, 500)

        // Observe parent for resize
        observer = new ResizeObserver(() => {
          if (!appRef.current || destroyed) return
          const w = imageContainer.clientWidth
          const h = imageContainer.clientHeight
          if (w === 0 || h === 0) return
          if (w === appRef.current.screen.width && h === appRef.current.screen.height) return
          appRef.current.renderer.resize(w, h)
          setSize({ width: w, height: h })
        })
        observer.observe(imageContainer)
      } catch (error) {
        console.error('usePixiApp init error:', error)
      }
    }

    const timer = setTimeout(init, 100)

    return () => {
      destroyed = true
      clearTimeout(timer)
      if (costInterval) clearInterval(costInterval)
      if (observer) observer.disconnect()
      if (appRef.current) {
        if (costTickerRef.current) appRef.current.ticker.remove(costTickerRef.current)
        appRef.current.destroy(true, { children: true, texture: true, baseTexture: true })
        appRef.current = null
        containerRef.current = null
        textureRef.current = null
      }
      frameTimesRef.current = []
    }
  }, [])

  // Reload texture when imageSrc changes
  useEffect(() => {
    if (!appRef.current || !imageSrc) return
    let cancelled = false
    ;(async () => {
      try {
        const texture = await Assets.load(imageSrc)
        if (!cancelled) { textureRef.current = texture; setTextureVersion(v => v + 1) }
      } catch (error) {
        console.error('usePixiApp texture reload error:', error)
      }
    })()
    return () => { cancelled = true }
  }, [imageSrc])

  return { appRef, containerRef, textureRef, size, textureVersion, renderCost }
}

/**
 * Apply image fit mode to a TilingSprite.
 * - contain: fill frame, crop overflow (object-cover)
 * - center: native size, centered
 * - fit-width: fill width, center vertically, maintain aspect
 * - fit-height: fill height, center horizontally, maintain aspect
 */
export function applyImageFit(sprite, texture, canvasW, canvasH, mode = 'contain') {
  const tw = texture.width
  const th = texture.height

  if (mode === 'center') {
    sprite.width = canvasW
    sprite.height = canvasH
    sprite.tileScale.set(1)
    sprite.tilePosition.x = (canvasW - tw) / 2
    sprite.tilePosition.y = (canvasH - th) / 2
  } else if (mode === 'fit-width') {
    const scale = canvasW / tw
    sprite.width = canvasW
    sprite.height = canvasH
    sprite.tileScale.set(scale)
    sprite.tilePosition.x = 0
    sprite.tilePosition.y = (canvasH - th * scale) / 2
  } else if (mode === 'fit-height') {
    const scale = canvasH / th
    sprite.width = canvasW
    sprite.height = canvasH
    sprite.tileScale.set(scale)
    sprite.tilePosition.x = (canvasW - tw * scale) / 2
    sprite.tilePosition.y = 0
  } else {
    // contain — fill frame (object-cover)
    const scale = Math.max(canvasW / tw, canvasH / th)
    sprite.width = canvasW
    sprite.height = canvasH
    sprite.tileScale.set(scale)
    sprite.tilePosition.x = (canvasW - tw * scale) / 2
    sprite.tilePosition.y = (canvasH - th * scale) / 2
  }
}

/**
 * Draw a dashed rectangle outline using Pixi Graphics.
 * Matches kaleidoscope's wedge outline style.
 */
export function drawDashedRect(graphics, x, y, w, h, { color = 0xff0000, lineWidth = 2, alpha = 0.8, dash = 8, gap = 5 } = {}) {
  const total = dash + gap
  const drawDashedLine = (x0, y0, x1, y1) => {
    const dx = x1 - x0, dy = y1 - y0
    const len = Math.sqrt(dx * dx + dy * dy)
    const ux = dx / len, uy = dy / len
    for (let d = 0; d < len; d += total) {
      const end = Math.min(d + dash, len)
      graphics.moveTo(x0 + ux * d, y0 + uy * d)
      graphics.lineTo(x0 + ux * end, y0 + uy * end)
    }
  }
  drawDashedLine(x, y, x + w, y)
  drawDashedLine(x + w, y, x + w, y + h)
  drawDashedLine(x + w, y + h, x, y + h)
  drawDashedLine(x, y + h, x, y)
  graphics.stroke({ color, width: lineWidth, alpha })
}
