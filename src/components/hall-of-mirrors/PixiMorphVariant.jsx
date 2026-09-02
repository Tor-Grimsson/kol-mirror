import { useEffect, useRef } from 'react'
import { TilingSprite, Graphics } from 'pixi.js'
import usePixiApp, { applyImageFit, drawDashedRect } from '../../hooks/usePixiApp'
import VariantFrame from './VariantFrame'

export default function PixiMorphVariant({
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
  scaleIntensity = 2,
  speed = 1,
  waveform = 'sine',
  shiftDirection = 'diagonal',
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
  const countRef = useRef(0)
  const scaleIntensityRef = useRef(scaleIntensity)
  const waveformRef = useRef(waveform)
  const shiftDirectionRef = useRef(shiftDirection)

  useEffect(() => { speedRef.current = speed }, [speed])
  useEffect(() => { scaleIntensityRef.current = scaleIntensity }, [scaleIntensity])
  useEffect(() => { waveformRef.current = waveform }, [waveform])
  useEffect(() => { shiftDirectionRef.current = shiftDirection }, [shiftDirection])
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
    tilingSprite.tileScale.x *= scaleIntensity
    tilingSprite.tileScale.y *= scaleIntensity
    tilingSprite.tilePosition.x += imageOffsetX
    tilingSprite.tilePosition.y += imageOffsetY

    app.stage.addChild(tilingSprite)
    tilingRef.current = tilingSprite

    const baseTw = texture.width * tilingSprite.tileScale.x
    const baseTh = texture.height * tilingSprite.tileScale.y

    let outline = null
    if (grab) {
      outline = new Graphics()
      drawDashedRect(outline, (width - baseTw) / 2 + imageOffsetX, (height - baseTh) / 2 + imageOffsetY, baseTw, baseTh)
      outline.visible = grabOutlineVisible !== false
      outlineRef.current = outline
      app.stage.addChild(outline)
    }

    const wave = (t) => {
      const w = waveformRef.current
      if (w === 'triangle') return Math.asin(Math.sin(t)) * (2 / Math.PI)
      if (w === 'square') return Math.sign(Math.sin(t))
      if (w === 'sawtooth') return 2 * (t / (2 * Math.PI) - Math.floor(0.5 + t / (2 * Math.PI)))
      return Math.sin(t)
    }

    const tickerFn = () => {
      if (!tilingRef.current) return
      const si = scaleIntensityRef.current

      if (animateRef.current && enabledRef.current) {
        countRef.current += 0.005 * speedRef.current
        tilingRef.current.tileScale.x = si + wave(countRef.current)
        tilingRef.current.tileScale.y = si + wave(countRef.current + Math.PI / 2)

        const s = speedRef.current * 0.5
        const d = shiftDirectionRef.current
        if (d === 'horizontal') tilingRef.current.tilePosition.x += s
        else if (d === 'vertical') tilingRef.current.tilePosition.y += s
        else if (d === 'diagonal') { tilingRef.current.tilePosition.x += s; tilingRef.current.tilePosition.y += s }
      } else {
        tilingRef.current.tileScale.x = si
        tilingRef.current.tileScale.y = si
      }

      if (outline && outline.visible && tilingRef.current) {
        const tw = texture.width * tilingRef.current.tileScale.x
        const th = texture.height * tilingRef.current.tileScale.y
        outline.clear()
        drawDashedRect(outline, tilingRef.current.tilePosition.x, tilingRef.current.tilePosition.y, tw, th)
      }
    }
    app.ticker.add(tickerFn)

    return () => { app.ticker?.remove(tickerFn) }
  }, [size.width, size.height, wrapMode, imageFitMode, grab, imageOffsetX, imageOffsetY, textureVersion])

  useEffect(() => {
    if (tilingRef.current && !animateRef.current) {
      tilingRef.current.tileScale.x = scaleIntensity
      tilingRef.current.tileScale.y = scaleIntensity
    }
  }, [scaleIntensity])

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
          <div><strong>Scale Intensity:</strong> {scaleIntensity.toFixed(1)} - {scaleIntensity < 1.5 ? 'Subtle morph' : scaleIntensity < 2.5 ? 'Medium morph' : 'Intense morph'}</div>
          <div><strong>Speed:</strong> {speed.toFixed(1)} - {speed < 1.5 ? 'Slow pulse' : speed < 3 ? 'Medium pulse' : 'Fast pulse'}</div>
          <div><strong>Effect:</strong> TilingSprite with sin/cos scale animation and diagonal shift creates organic morphing pattern</div>
        </>
      }
      stats={`intensity: ${scaleIntensity.toFixed(1)} | speed: ${speed.toFixed(1)}`}
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
