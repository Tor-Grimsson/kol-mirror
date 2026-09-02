import { useEffect, useRef } from 'react'
import { TilingSprite, Graphics } from 'pixi.js'
import usePixiApp, { applyImageFit, drawDashedRect } from '../../hooks/usePixiApp'
import VariantFrame from './VariantFrame'

export default function PixiRadialVariant({
  title,
  imageSrc,
  isEnabled = true,
  isSelected = false,
  onToggleEnabled,
  onToggleSelect,
  onImageUpload,
  animate = false,
  grab = false,
  grabOutlineVisible = true,
  imageOffsetX = 0,
  imageOffsetY = 0,
  radius = 50,
  tileScale = 0.5,
  speed = 1,
  rotationDirection = 'clockwise',
  wrapMode = 'clamp-to-edge',
  imageFitMode = 'contain',
  onParamChange,
  preserveDrawingBuffer = false,
  onRenderCost,
}) {
  const canvasRef = useRef(null)
  const { appRef, textureRef, size, textureVersion, renderCost } = usePixiApp(canvasRef, imageSrc, { preserveDrawingBuffer })
  useEffect(() => { if (onRenderCost) onRenderCost(renderCost) }, [renderCost])
  const tilingRef = useRef(null)
  const outlineRef = useRef(null)
  const grabDragRef = useRef(null)
  const speedRef = useRef(speed)
  const animateRef = useRef(animate)
  const enabledRef = useRef(isEnabled)
  const angleRef = useRef(0)
  const rotDirRef = useRef(rotationDirection)
  const radiusRef = useRef(radius)

  useEffect(() => { speedRef.current = speed }, [speed])
  useEffect(() => { radiusRef.current = radius }, [radius])
  useEffect(() => { rotDirRef.current = rotationDirection }, [rotationDirection])
  useEffect(() => { animateRef.current = animate }, [animate])
  useEffect(() => { enabledRef.current = isEnabled }, [isEnabled])
  useEffect(() => {
    if (outlineRef.current) outlineRef.current.visible = grabOutlineVisible !== false
  }, [grabOutlineVisible])

  useEffect(() => {
    if (tilingRef.current?.texture?.source?.style) {
      tilingRef.current.texture.source.style.addressMode = wrapMode
      tilingRef.current.texture.source.style.update()
    }
  }, [wrapMode])

  // Build content + ticker
  useEffect(() => {
    if (!appRef.current || !textureRef.current) return
    const app = appRef.current
    const texture = textureRef.current
    const { width, height } = size

    if (width === 0 || height === 0) return

    app.stage.removeChildren()

    texture.source.style.addressMode = wrapMode
    texture.source.style.update()

    const tilingSprite = new TilingSprite({ texture, width, height })
    applyImageFit(tilingSprite, texture, width, height, imageFitMode)
    tilingSprite.tileScale.x *= tileScale
    tilingSprite.tileScale.y *= tileScale
    tilingSprite.tilePosition.x += imageOffsetX
    tilingSprite.tilePosition.y += imageOffsetY

    // Store base centering from applyImageFit
    const baseTpX = tilingSprite.tilePosition.x
    const baseTpY = tilingSprite.tilePosition.y
    const imgScale = tilingSprite.tileScale.y
    const tw = texture.width * imgScale
    const th = texture.height * imgScale

    app.stage.addChild(tilingSprite)
    tilingRef.current = tilingSprite

    let outline = null
    if (grab) {
      outline = new Graphics()
      outline.visible = grabOutlineVisible !== false
      outlineRef.current = outline
      app.stage.addChild(outline)
    }

    const tickerFn = () => {
      if (!tilingRef.current) return
      const r = radiusRef.current

      if (animateRef.current && enabledRef.current) {
        const dir = rotDirRef.current === 'counterclockwise' ? -1 : 1
        angleRef.current += 0.02 * speedRef.current * dir
      }

      const orbitX = Math.cos(angleRef.current) * r
      const orbitY = Math.sin(angleRef.current) * r
      tilingRef.current.tilePosition.x = baseTpX + orbitX + imageOffsetX
      tilingRef.current.tilePosition.y = baseTpY + orbitY + imageOffsetY

      if (outline && outline.visible) {
        outline.clear()
        const orbitX = Math.cos(angleRef.current) * radiusRef.current
        const orbitY = Math.sin(angleRef.current) * radiusRef.current
        drawDashedRect(outline, (width - tw) / 2 + orbitX + imageOffsetX, (height - th) / 2 + orbitY + imageOffsetY, tw, th)
      }
    }
    app.ticker.add(tickerFn)

    return () => { app.ticker?.remove(tickerFn) }
  }, [size.width, size.height, wrapMode, imageFitMode, grab, imageOffsetX, imageOffsetY, textureVersion])

  useEffect(() => {
    if (tilingRef.current) {
      tilingRef.current.tileScale.x = tileScale
      tilingRef.current.tileScale.y = tileScale
    }
  }, [tileScale])

  return (
    <VariantFrame
      title={title}
      isEnabled={isEnabled}
      isSelected={isSelected}
      onToggleEnabled={onToggleEnabled}
      onToggleSelect={onToggleSelect}
      onImageUpload={onImageUpload}
      imageSrc={imageSrc}
      interactive={grab}
      info={
        <>
          <div><strong>Radius:</strong> {radius}px - {radius < 30 ? 'Tight orbit' : radius < 60 ? 'Medium orbit' : 'Wide orbit'}</div>
          <div><strong>Tile Scale:</strong> {tileScale.toFixed(2)} - {tileScale < 0.4 ? 'Tiny tiles' : tileScale < 0.7 ? 'Small tiles' : 'Large tiles'}</div>
          <div><strong>Speed:</strong> {speed.toFixed(1)} - {speed < 1.5 ? 'Slow orbit' : speed < 3 ? 'Medium orbit' : 'Fast orbit'}</div>
          <div><strong>Effect:</strong> TilingSprite shifts in circular motion creating orbital kaleidoscope effect</div>
        </>
      }
      stats={`radius: ${radius}px | scale: ${tileScale.toFixed(2)} | speed: ${speed.toFixed(1)}`}
    >
      <div
        className="absolute inset-0"
        /* touch-action: none — without it a touch device claims the drag for scroll and
           fires pointercancel, so grab never starts on a phone. preventDefault on
           pointerdown does not substitute. */
        style={{ pointerEvents: grab ? 'auto' : 'none', cursor: grab ? 'grab' : 'default', touchAction: 'none' }}
        onPointerDown={grab ? (e) => {
          e.preventDefault()
          const startX = e.clientX
          const startY = e.clientY
          const startOffsetX = imageOffsetX
          const startOffsetY = imageOffsetY
          grabDragRef.current = true
          e.currentTarget.style.cursor = 'grabbing'

          const handleMove = (me) => {
            if (onParamChange) {
              onParamChange('imageOffsetX', startOffsetX + (me.clientX - startX))
              onParamChange('imageOffsetY', startOffsetY + (me.clientY - startY))
            }
          }
          const handleUp = () => {
            grabDragRef.current = false
            window.removeEventListener('pointermove', handleMove)
            window.removeEventListener('pointerup', handleUp)
          }
          window.addEventListener('pointermove', handleMove)
          window.addEventListener('pointerup', handleUp)
        } : undefined}
      >
        <canvas ref={canvasRef} className="w-full h-full" style={{ pointerEvents: 'none' }} />
      </div>
    </VariantFrame>
  )
}
