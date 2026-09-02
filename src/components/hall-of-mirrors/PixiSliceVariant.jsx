import { useEffect, useRef } from 'react'
import { TilingSprite, Graphics } from 'pixi.js'
import usePixiApp, { applyImageFit, drawDashedRect } from '../../hooks/usePixiApp'
import VariantFrame from './VariantFrame'

export default function PixiSliceVariant({
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
  tileScaleX = 0.3,
  speed = 1,
  direction = 'horizontal',
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
  const directionRef = useRef(direction)

  useEffect(() => { speedRef.current = speed }, [speed])
  useEffect(() => { directionRef.current = direction }, [direction])
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
    tilingSprite.tileScale.x *= tileScaleX
    tilingSprite.tilePosition.x += imageOffsetX
    tilingSprite.tilePosition.y += imageOffsetY

    const tw = texture.width * tilingSprite.tileScale.x
    const th = texture.height * tilingSprite.tileScale.y
    const outlineCx = (width - tw) / 2 + imageOffsetX
    const outlineCy = (height - th) / 2 + imageOffsetY
    let animDriftX = 0
    let animDriftY = 0

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
      if (tilingRef.current && animateRef.current && enabledRef.current) {
        const s = speedRef.current
        const d = directionRef.current
        if (d === 'vertical') {
          tilingRef.current.tilePosition.y += s
          animDriftY += s
        } else if (d === 'diagonal') {
          tilingRef.current.tilePosition.x += s
          tilingRef.current.tilePosition.y += s * 0.5
          animDriftX += s
          animDriftY += s * 0.5
        } else {
          tilingRef.current.tilePosition.x += s
          animDriftX += s
        }
      }
      if (outline && outline.visible) {
        outline.clear()
        drawDashedRect(outline, outlineCx + animDriftX, outlineCy + animDriftY, tw, th)
      }
    }
    app.ticker.add(tickerFn)

    return () => { app.ticker?.remove(tickerFn) }
  }, [size.width, size.height, tileScaleX, wrapMode, imageFitMode, grab, imageOffsetX, imageOffsetY, textureVersion])

  useEffect(() => {
    if (tilingRef.current) tilingRef.current.tileScale.x = tileScaleX
  }, [tileScaleX])

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
          <div><strong>Tile Scale X:</strong> {tileScaleX} - {tileScaleX < 0.4 ? 'Narrow slices' : tileScaleX < 0.7 ? 'Medium slices' : 'Wide slices'}</div>
          <div><strong>Speed:</strong> {speed} - {speed < 2 ? 'Slow shift' : speed < 4 ? 'Medium shift' : 'Fast shift'}</div>
          <div><strong>Effect:</strong> PixiJS TilingSprite creates repeating vertical slices that shift horizontally</div>
        </>
      }
      stats={`tileScale: ${tileScaleX} | speed: ${speed}`}
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
