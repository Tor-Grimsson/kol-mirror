import { useEffect, useRef } from 'react'
import { TilingSprite } from 'pixi.js'
import usePixiApp, { applyImageFit } from '../../hooks/usePixiApp'
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
  tileScaleX = 0.3,
  speed = 1,
  direction = 'horizontal',
  wrapMode = 'clamp-to-edge',
  imageFitMode = 'contain'
}) {
  const canvasRef = useRef(null)
  const { appRef, textureRef, size } = usePixiApp(canvasRef, imageSrc)
  const tilingRef = useRef(null)
  const speedRef = useRef(speed)
  const animateRef = useRef(animate)
  const enabledRef = useRef(isEnabled)
  const directionRef = useRef(direction)

  useEffect(() => { speedRef.current = speed }, [speed])
  useEffect(() => { directionRef.current = direction }, [direction])
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

    // Clear previous content
    app.stage.removeChildren()

    texture.source.style.addressMode = wrapMode
    texture.source.style.update()

    const tilingSprite = new TilingSprite({ texture, width, height })
    applyImageFit(tilingSprite, texture, width, height, imageFitMode)
    tilingSprite.tileScale.x *= tileScaleX

    app.stage.addChild(tilingSprite)
    tilingRef.current = tilingSprite

    const tickerFn = () => {
      if (tilingRef.current && animateRef.current && enabledRef.current) {
        const s = speedRef.current
        const d = directionRef.current
        if (d === 'vertical') {
          tilingRef.current.tilePosition.y += s
        } else if (d === 'diagonal') {
          tilingRef.current.tilePosition.x += s
          tilingRef.current.tilePosition.y += s * 0.5
        } else {
          tilingRef.current.tilePosition.x += s
        }
      }
    }
    app.ticker.add(tickerFn)

    return () => {
      app.ticker?.remove(tickerFn)
    }
  }, [size.width, size.height, tileScaleX, wrapMode, imageFitMode])

  // Update tile scale live
  useEffect(() => {
    if (tilingRef.current) {
      tilingRef.current.tileScale.x = tileScaleX
    }
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
      info={
        <>
          <div><strong>Tile Scale X:</strong> {tileScaleX} - {tileScaleX < 0.4 ? 'Narrow slices' : tileScaleX < 0.7 ? 'Medium slices' : 'Wide slices'}</div>
          <div><strong>Speed:</strong> {speed} - {speed < 2 ? 'Slow shift' : speed < 4 ? 'Medium shift' : 'Fast shift'}</div>
          <div><strong>Effect:</strong> PixiJS TilingSprite creates repeating vertical slices that shift horizontally</div>
        </>
      }
      stats={`tileScale: ${tileScaleX} | speed: ${speed}`}
    >
      <canvas ref={canvasRef} className="w-full h-full" style={{ pointerEvents: 'none' }} />
    </VariantFrame>
  )
}
