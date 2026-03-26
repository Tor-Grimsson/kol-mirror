import { useEffect, useRef } from 'react'
import { TilingSprite } from 'pixi.js'
import usePixiApp, { applyImageFit } from '../../hooks/usePixiApp'
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
  radius = 50,
  tileScale = 0.5,
  speed = 1,
  rotationDirection = 'clockwise',
  wrapMode = 'clamp-to-edge',
  imageFitMode = 'contain'
}) {
  const canvasRef = useRef(null)
  const { appRef, textureRef, size } = usePixiApp(canvasRef, imageSrc)
  const tilingRef = useRef(null)
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

    app.stage.addChild(tilingSprite)
    tilingRef.current = tilingSprite

    const tickerFn = () => {
      if (!tilingRef.current) return
      const r = radiusRef.current

      if (animateRef.current && enabledRef.current) {
        const dir = rotDirRef.current === 'counterclockwise' ? -1 : 1
        angleRef.current += 0.02 * speedRef.current * dir
      }

      tilingRef.current.tilePosition.x = Math.cos(angleRef.current) * r
      tilingRef.current.tilePosition.y = Math.sin(angleRef.current) * r
    }
    app.ticker.add(tickerFn)

    return () => { app.ticker?.remove(tickerFn) }
  }, [size.width, size.height, wrapMode, imageFitMode])

  // Update tile scale live
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
      <canvas ref={canvasRef} className="w-full h-full" style={{ pointerEvents: 'none' }} />
    </VariantFrame>
  )
}
