import { useEffect, useRef, useState } from 'react'
import { Application, Assets, Container, Sprite, TilingSprite, Graphics, FillGradient, RenderTexture } from 'pixi.js'

// Build a tiled grid of sprites inside a container for edge repeat/mirror
function buildTiledContent(texture, zoom, sourceOffsetX, sourceOffsetY, cutOffsetRad, wrapMode, radius) {
  const content = new Container()
  const tw = texture.width * zoom
  const th = texture.height * zoom
  const area = radius * 4

  if (wrapMode === 'clamp-to-edge' || !wrapMode) {
    // Single sprite, scaled to fill the wedge area
    const minScale = Math.max(zoom, (radius * 2) / Math.min(texture.width, texture.height))
    const sprite = new Sprite(texture)
    sprite.anchor.set(0.5)
    sprite.scale.set(minScale)
    sprite.x = sourceOffsetX
    sprite.y = sourceOffsetY
    sprite.rotation = cutOffsetRad
    content.addChild(sprite)
  } else {
    // Tile sprites to cover the area
    const tilesX = Math.ceil(area / tw) + 2
    const tilesY = Math.ceil(area / th) + 2
    const isMirror = wrapMode === 'mirror-repeat'

    for (let ty = -Math.floor(tilesY / 2); ty <= Math.floor(tilesY / 2); ty++) {
      for (let tx = -Math.floor(tilesX / 2); tx <= Math.floor(tilesX / 2); tx++) {
        const sprite = new Sprite(texture)
        sprite.anchor.set(0.5)
        sprite.scale.set(zoom)
        sprite.x = tx * tw + sourceOffsetX
        sprite.y = ty * th + sourceOffsetY

        // Mirror: flip on alternating tiles
        if (isMirror) {
          if (Math.abs(tx) % 2 === 1) sprite.scale.x *= -1
          if (Math.abs(ty) % 2 === 1) sprite.scale.y *= -1
        }

        content.addChild(sprite)
      }
    }
    content.rotation = cutOffsetRad
  }

  return content
}

function buildSegments(container, texture, width, height, opts, app) {
  const { segments, zoom, sourceOffsetX, sourceOffsetY, cutOffset, segmentGap, evenOffset, mirrorMode, wrapMode, fillMode, maskShape, maskArea, maskMode, feather, blendMode } = opts

  const edgeActive = wrapMode && wrapMode !== 'clamp-to-edge'
  const effectiveZoom = edgeActive ? zoom * 0.15 : zoom
  const segmentAngle = (Math.PI * 2) / segments
  const gapRad = (segmentGap / 360) * Math.PI * 2
  const wedgeAngle = segmentAngle - gapRad
  const circleRadius = Math.max(width, height) / 2
  const fillRadius = Math.sqrt(width * width + height * height)
  const cutOffsetRad = (cutOffset / 360) * Math.PI * 2
  const evenOffsetRad = (evenOffset / 360) * Math.PI * 2
  const fillActive = fillMode && fillMode !== 'none'

  // Helper: draw wedge mask based on shape
  const drawMask = (mask, r, angle, shape) => {
    const endX = r * Math.cos(angle)
    const endY = r * Math.sin(angle)
    const midAngle = angle / 2
    const midX = r * Math.cos(midAngle)
    const midY = r * Math.sin(midAngle)

    if (shape === 'square') {
      mask.moveTo(0, 0)
      mask.lineTo(r, 0)
      mask.lineTo(r, r * Math.tan(angle))
      mask.lineTo(0, 0)
      mask.fill({ color: 0xffffff })
    } else if (shape === 'diamond') {
      mask.moveTo(0, 0)
      mask.lineTo(r, 0)
      mask.lineTo(midX, midY)
      mask.lineTo(endX, endY)
      mask.lineTo(0, 0)
      mask.fill({ color: 0xffffff })
    } else {
      // circle (default)
      mask.moveTo(0, 0)
      mask.lineTo(r, 0)
      mask.arc(0, 0, r, 0, Math.max(0.01, angle), false)
      mask.lineTo(0, 0)
      mask.fill({ color: 0xffffff })
    }
  }

  // Helper: build one ring of wedges, returns its container
  const buildRing = (ringRadius, sourceTransformFn) => {
    const ring = new Container()

    for (let i = 0; i < segments; i++) {
      const isEven = i % 2 === 0
      const segmentContainer = new Container()

      const content = buildTiledContent(texture, effectiveZoom, sourceOffsetX, sourceOffsetY, cutOffsetRad, wrapMode, ringRadius)

      if (sourceTransformFn) sourceTransformFn(content, i)

      if (maskShape !== 'none') {
        const mask = new Graphics()
        drawMask(mask, ringRadius, wedgeAngle, maskShape)
        segmentContainer.addChild(content)
        segmentContainer.addChild(mask)
        segmentContainer.mask = mask
      } else {
        segmentContainer.addChild(content)
      }

      const baseRotation = i * segmentAngle
      segmentContainer.rotation = baseRotation + (isEven ? evenOffsetRad : 0)

      if (mirrorMode === 'alternating' && i % 2 === 1) {
        content.scale.x *= -1
      }


      ring.addChild(segmentContainer)
    }

    container.addChild(ring)
    return ring
  }

  // 1. Fill layer (behind) — added first
  if (fillActive) {
    const fillTransform = {
      'repeat': null,
      'mirror-repeat': (content) => { content.scale.x *= -1 },
      'clamp-to-edge': (content) => { content.scale.y *= -1 },
    }[fillMode] || null

    buildRing(fillRadius, fillTransform)
  }

  // 2. Main kaleidoscope (on top) — added second
  const mainRing = buildRing(circleRadius, null)

  // Feather — gradient donut at the mask area boundary
  if (maskArea > 0 && feather > 0) {
    const innerR = Math.max(0, circleRadius - maskArea)
    const outerR = circleRadius + maskArea
    const normInner = innerR / (outerR * 2)
    const normOuter = 0.5
    const t = Math.min(1, feather / 50)

    const gradient = new FillGradient({
      type: 'radial',
      center: { x: 0.5, y: 0.5 },
      innerRadius: normInner,
      outerCenter: { x: 0.5, y: 0.5 },
      outerRadius: normOuter,
      textureSpace: 'local',
      colorStops: [
        { offset: 0, color: 'rgba(0,0,0,0)' },
        { offset: 0.5, color: `rgba(0,0,0,${t})` },
        { offset: 1, color: 'rgba(0,0,0,0)' },
      ],
    })

    const ring = new Graphics()
    ring.circle(0, 0, outerR)
    ring.fill(gradient)
    ring.circle(0, 0, innerR)
    ring.cut()
    if (maskMode === 'inside') {
      const clipMask = new Graphics()
      clipMask.circle(0, 0, circleRadius)
      clipMask.fill({ color: 0xffffff })
      ring.addChild(clipMask)
      ring.mask = clipMask
    }

    const ringContainer = new Container()
    ringContainer.addChild(ring)
    if (blendMode && blendMode !== 'normal') {
      ringContainer.blendMode = blendMode
    }

    container.addChild(ringContainer)
  }

  // Debug: visible ring outline, fades after 5 seconds
  if (maskArea > 0) {
    const innerR = maskMode === 'inside'
      ? Math.max(0, circleRadius - maskArea)
      : Math.max(0, circleRadius - maskArea)
    const outerR = maskMode === 'inside'
      ? circleRadius
      : circleRadius + maskArea
    const debug = new Graphics()
    debug.circle(0, 0, innerR)
    debug.stroke({ color: 0xff0000, width: 1, alpha: 0.8 })
    debug.circle(0, 0, outerR)
    debug.stroke({ color: 0xff0000, width: 1, alpha: 0.8 })
    debug.circle(0, 0, circleRadius)
    debug.stroke({ color: 0x00ff00, width: 1, alpha: 0.8 })
    container.addChild(debug)
    setTimeout(() => { debug.destroy() }, 5000)
  }
}


export default function PixiKaleidoscopeVariant({
  title,
  imageSrc,
  isEnabled = true,
  isSelected = false,
  onToggleEnabled,
  onToggleSelect,
  onImageUpload,
  animate = false,
  segments = 6,
  zoom = 1.5,
  speed = 0.5,
  mirrorMode = 'alternating',
  rotationDirection = 'clockwise',
  sourceOffsetX = 0,
  sourceOffsetY = 0,
  cutOffset = 0,
  segmentGap = 0,
  evenOffset = 0,
  splitRotation = false,
  maskShape = 'circle',
  maskArea = 0,
  maskMode = 'bipolar',
  feather = 0,
  blendMode = 'normal',
  wrapMode = 'clamp-to-edge',
  fillMode = 'none'
}) {
  const canvasRef = useRef(null)
  const appRef = useRef(null)
  const containerRef = useRef(null)
  const speedRef = useRef(speed)
  const animateRef = useRef(animate)
  const enabledRef = useRef(isEnabled)
  const rotDirRef = useRef(rotationDirection)
  const splitRotationRef = useRef(splitRotation)
  const rotationRef = useRef(0)
  const wrapModeRef = useRef(wrapMode)
  const [showInfo, setShowInfo] = useState(false)

  useEffect(() => { speedRef.current = speed }, [speed])
  useEffect(() => { animateRef.current = animate }, [animate])
  useEffect(() => { enabledRef.current = isEnabled }, [isEnabled])
  useEffect(() => { rotDirRef.current = rotationDirection }, [rotationDirection])
  useEffect(() => { splitRotationRef.current = splitRotation }, [splitRotation])

  useEffect(() => { wrapModeRef.current = wrapMode }, [wrapMode])

  // Init PixiJS
  useEffect(() => {
    if (!canvasRef.current || appRef.current) return

    const initPixi = async () => {
      try {
        const canvasWrapper = canvasRef.current?.parentElement
        const imageContainer = canvasWrapper?.parentElement
        if (!imageContainer) return

        const width = imageContainer.clientWidth
        const height = imageContainer.clientHeight
        if (width === 0 || height === 0) return

        const app = new Application()
        appRef.current = app

        await app.init({
          canvas: canvasRef.current,
          width, height,
          backgroundColor: 0x1a1a1a,
          resolution: window.devicePixelRatio || 1,
          autoDensity: true
        })

        const mainContainer = new Container()
        mainContainer.x = width / 2
        mainContainer.y = height / 2
        app.stage.addChild(mainContainer)
        containerRef.current = mainContainer

        // Build initial segments
        const texture = await Assets.load(imageSrc)
        buildSegments(mainContainer, texture, width, height,
          { segments, zoom, sourceOffsetX, sourceOffsetY, cutOffset, segmentGap, evenOffset, mirrorMode, wrapMode, fillMode, maskShape, maskArea, maskMode, feather, blendMode }, app)

        app.ticker.add(() => {
          if (!containerRef.current || !animateRef.current || !enabledRef.current) return
          const dir = rotDirRef.current === 'counterclockwise' ? -1 : 1
          const step = speedRef.current * 0.01
          const flip = splitRotationRef.current

          if (flip) {
            containerRef.current.children.forEach((seg, i) => {
              const segDir = i % 2 === 0 ? dir : -dir
              seg.rotation += step * segDir
            })
          } else {
            rotationRef.current += step * dir
            containerRef.current.rotation = rotationRef.current
          }
        })
      } catch (error) {
        console.error('PixiJS Kaleidoscope initialization error:', error)
      }
    }

    const timer = setTimeout(() => initPixi(), 100)
    return () => {
      clearTimeout(timer)
      if (appRef.current) {
        appRef.current.destroy(true, { children: true, texture: true, baseTexture: true })
        appRef.current = null
        containerRef.current = null
      }
    }
  }, [])

  // Pause/resume — keep current frame, don't reset
  // (ticker already checks enabledRef/animateRef, so pausing is automatic)

  // Rebuild segments when any kaleidoscope param changes
  useEffect(() => {
    if (!appRef.current || !containerRef.current || !imageSrc) return

    const rebuildSegments = async () => {
      try {
        const texture = await Assets.load(imageSrc)
        const mainContainer = containerRef.current
        const width = appRef.current.screen.width
        const height = appRef.current.screen.height

        mainContainer.removeChildren()
        buildSegments(mainContainer, texture, width, height,
          { segments, zoom, sourceOffsetX, sourceOffsetY, cutOffset, segmentGap, evenOffset, mirrorMode, wrapMode, fillMode, maskShape, maskArea, maskMode, feather, blendMode }, appRef.current)
      } catch (error) {
        console.error('Error rebuilding kaleidoscope segments:', error)
      }
    }

    rebuildSegments()
  }, [segments, zoom, mirrorMode, sourceOffsetX, sourceOffsetY, cutOffset, segmentGap, evenOffset, imageSrc, wrapMode, fillMode, maskShape, maskArea, maskMode, feather, blendMode])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div
          className="kol-helper-s text-fg-64 cursor-help"
          onMouseEnter={() => setShowInfo(true)}
          onMouseLeave={() => setShowInfo(false)}
        >
          {title}
        </div>
        <div className="flex gap-2">
          <div
            className={`kol-helper-xs cursor-pointer select-none ${isEnabled ? 'accentYellow' : 'text-fg-64'} hover:text-fg-96`}
            onClick={onToggleEnabled}
          >
            [{isEnabled ? 'ON' : 'OFF'}]
          </div>
          <div
            className={`kol-helper-xs cursor-pointer select-none ${isSelected ? 'accentYellowStrong' : 'text-fg-64'} hover:text-fg-96`}
            onClick={onToggleSelect}
          >
            [{isSelected ? 'SELECT' : 'UNSELECT'}]
          </div>
        </div>
      </div>

      <div
        className="relative aspect-[4/3] overflow-hidden border border-fg-08"
        style={{ borderRadius: '4px' }}
      >
        {showInfo && (
          <div className="absolute top-0 left-0 right-0 kol-helper-xs textAbsoluteWhite p-3 space-y-1 z-10" style={{ backgroundColor: 'color-mix(in srgb, var(--kol-surface-primary) 60%, transparent)' }}>
            <div><strong>Segments:</strong> {segments}</div>
            <div><strong>Zoom:</strong> {zoom.toFixed(1)}x</div>
            <div><strong>Source Offset:</strong> {sourceOffsetX}, {sourceOffsetY}</div>
            <div><strong>Cut Offset:</strong> {cutOffset}°</div>
          </div>
        )}
        <div className="absolute inset-0 pointer-events-none" style={{ display: isEnabled ? 'block' : 'none' }}>
          <canvas ref={canvasRef} className="w-full h-full" />
        </div>
        <div className="absolute inset-0 pointer-events-none" style={{ display: !isEnabled ? 'block' : 'none' }}>
          <img src={imageSrc} alt={title} className="w-full h-full object-cover" />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="kol-helper-xs text-fg-48 font-mono">
          segments: {segments} | zoom: {zoom.toFixed(1)}
        </div>
        <label className="kol-helper-s textAbsoluteWhite cursor-pointer hover:opacity-80">
          <input
            type="file"
            accept="image/*"
            onChange={onImageUpload}
            className="hidden"
          />
          [UPLOAD]
        </label>
      </div>
    </div>
  )
}
