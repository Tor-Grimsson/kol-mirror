import { useEffect, useRef } from 'react'
import { Container, TilingSprite, Graphics } from 'pixi.js'
import usePixiApp, { drawDashedRect } from '../../hooks/usePixiApp'
import VariantFrame from './VariantFrame'

export default function PixiGlitchSliceVariant({
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
  sliceCount = 20,
  maxOffset = 50,
  speed = 1,
  smoothing = 0.1,
  direction = 'horizontal',
  wrapMode = 'clamp-to-edge',
  imageFitMode = 'contain',
  onParamChange,
  preserveDrawingBuffer = false,
}) {
  const canvasRef = useRef(null)
  const { appRef, textureRef, size } = usePixiApp(canvasRef, imageSrc, { preserveDrawingBuffer })
  const slicesRef = useRef([])
  const outlineRef = useRef(null)
  const grabDragRef = useRef(null)
  const speedRef = useRef(speed)
  const animateRef = useRef(animate)
  const enabledRef = useRef(isEnabled)
  const smoothingRef = useRef(smoothing)
  const maxOffsetRef = useRef(maxOffset)

  useEffect(() => { speedRef.current = speed }, [speed])
  useEffect(() => { maxOffsetRef.current = maxOffset }, [maxOffset])
  useEffect(() => { smoothingRef.current = smoothing }, [smoothing])
  useEffect(() => { animateRef.current = animate }, [animate])
  useEffect(() => { enabledRef.current = isEnabled }, [isEnabled])
  useEffect(() => {
    if (outlineRef.current) outlineRef.current.visible = grabOutlineVisible !== false
  }, [grabOutlineVisible])

  useEffect(() => {
    if (slicesRef.current?.[0]?.sprite?.texture?.source?.style) {
      slicesRef.current[0].sprite.texture.source.style.addressMode = wrapMode
      slicesRef.current[0].sprite.texture.source.style.update()
    }
  }, [wrapMode])

  // Build slices + ticker
  useEffect(() => {
    if (!appRef.current || !textureRef.current) return
    const app = appRef.current
    const texture = textureRef.current
    const { width, height } = size

    if (width === 0 || height === 0) return

    app.stage.removeChildren()

    texture.source.style.addressMode = wrapMode
    texture.source.style.update()

    const mainContainer = new Container()
    app.stage.addChild(mainContainer)

    const isVertical = direction === 'vertical'
    const effectiveCount = isVertical ? Math.round(sliceCount * (width / height)) : sliceCount
    const sliceSize = (isVertical ? width : height) / effectiveCount
    const slices = []

    for (let i = 0; i < effectiveCount; i++) {
      let scale
      if (imageFitMode === 'center') {
        scale = 1
      } else if (imageFitMode === 'fit-width') {
        scale = width / texture.width
      } else if (imageFitMode === 'fit-height') {
        scale = height / texture.height
      } else {
        scale = Math.max(width / texture.width, height / texture.height)
      }
      const sprite = new TilingSprite({
        texture,
        width: width + maxOffset * 2,
        height: height + maxOffset * 2,
      })
      sprite.tileScale.set(scale)
      sprite.x = -maxOffset
      sprite.y = -maxOffset
      const tw = texture.width * scale
      const th = texture.height * scale
      sprite.tilePosition.x = (width - tw) / 2 + maxOffset + imageOffsetX
      sprite.tilePosition.y = (height - th) / 2 + maxOffset + imageOffsetY

      const mask = new Graphics()
      if (isVertical) {
        mask.rect(i * sliceSize, 0, sliceSize, height)
      } else {
        mask.rect(0, i * sliceSize, width, sliceSize)
      }
      mask.fill({ color: 0xffffff })
      sprite.mask = mask

      mainContainer.addChild(sprite)
      mainContainer.addChild(mask)

      const offset = (Math.random() - 0.5) * maxOffset * 2
      const baseX = -maxOffset
      const baseY = -maxOffset
      slices.push({ sprite, mask, baseX, baseY, targetOffset: offset, currentOffset: offset })
      if (isVertical) sprite.y = baseY + offset
      else sprite.x = baseX + offset
    }

    slicesRef.current = slices

    // Grab outline
    if (grab && slices.length > 0) {
      const s = slices[0]
      const tw = texture.width * s.sprite.tileScale.x
      const th = texture.height * s.sprite.tileScale.y
      const outline = new Graphics()
      drawDashedRect(outline, s.sprite.tilePosition.x - maxOffset, s.sprite.tilePosition.y - maxOffset, tw, th)
      outline.visible = grabOutlineVisible !== false
      outlineRef.current = outline
      app.stage.addChild(outline)
    }

    let frameCount = 0
    const tickerFn = () => {
      if (!slicesRef.current.length) return

      if (animateRef.current && enabledRef.current) {
        frameCount++
        const updateInterval = Math.max(1, Math.floor(60 / speedRef.current))

        if (frameCount % updateInterval === 0) {
          slicesRef.current.forEach(slice => {
            slice.targetOffset = (Math.random() - 0.5) * maxOffsetRef.current * 2
          })
        }

        slicesRef.current.forEach(slice => {
          slice.currentOffset += (slice.targetOffset - slice.currentOffset) * smoothingRef.current
          if (isVertical) {
            slice.sprite.y = slice.baseY + slice.currentOffset
          } else {
            slice.sprite.x = slice.baseX + slice.currentOffset
          }
        })
      }
    }
    app.ticker.add(tickerFn)

    return () => { app.ticker?.remove(tickerFn) }
  }, [size.width, size.height, sliceCount, maxOffset, direction, wrapMode, imageFitMode, grab, imageOffsetX, imageOffsetY])

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
          <div><strong>Slices:</strong> {sliceCount} - {sliceCount < 15 ? 'Chunky bands' : sliceCount < 30 ? 'Medium slices' : 'Fine slices'}</div>
          <div><strong>Max Offset:</strong> {maxOffset}px - {maxOffset < 30 ? 'Subtle shift' : maxOffset < 60 ? 'Medium glitch' : 'Heavy glitch'}</div>
          <div><strong>Speed:</strong> {speed.toFixed(1)} - {speed < 1.5 ? 'Slow glitch' : speed < 3 ? 'Medium glitch' : 'Fast glitch'}</div>
          <div><strong>Effect:</strong> PixiJS creates horizontal slices with random offsets for a glitch aesthetic</div>
        </>
      }
      stats={`slices: ${sliceCount} | offset: ${maxOffset}px | speed: ${speed.toFixed(1)}`}
    >
      <div
        className="absolute inset-0"
        style={{ pointerEvents: grab ? 'auto' : 'none', cursor: grab ? 'grab' : 'default' }}
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
