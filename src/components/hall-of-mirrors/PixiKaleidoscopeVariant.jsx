import { useEffect, useRef } from 'react'
import { Container, Sprite, TilingSprite, Graphics } from 'pixi.js'
import usePixiApp from '../../hooks/usePixiApp'
import VariantFrame from './VariantFrame'

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

function buildSegments(container, texture, width, height, opts, app, outlineRef) {
  const { segments, zoom, sourceOffsetX, sourceOffsetY, cutOffset, segmentGap, evenOffset, mirrorMode, wrapMode, fillMode, wedgeOffsetX, wedgeOffsetY, grabSegment, grabOutlineVisible, mainEnabled, blendMode,
    showBackground, bgAnimate, bgSegments, bgZoom, bgSourceOffsetX, bgSourceOffsetY, bgCutOffset, bgSegmentGap, bgEvenOffset, bgSpeed,
    bgMirrorMode, bgRotationDirection, bgSplitRotation, bgBlendMode, bgWrapMode, bgFillMode } = opts
  const effectiveZoom = zoom * (opts.edgeZoomScale ?? 1.0)
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
  const buildRing = (ringRadius, sourceTransformFn, isBg = false) => {
    const ring = new Container()

    for (let i = 0; i < segments; i++) {
      const isEven = i % 2 === 0
      const segmentContainer = new Container()

      const ringZoom = isBg ? zoom : effectiveZoom
      const ringWrap = isBg ? 'clamp-to-edge' : wrapMode
      const content = buildTiledContent(texture, ringZoom, sourceOffsetX, sourceOffsetY, cutOffsetRad, ringWrap, ringRadius)

      if (sourceTransformFn) sourceTransformFn(content, i)

      const useAngle = isBg ? segmentAngle : wedgeAngle
      const mask = new Graphics()
      drawMask(mask, ringRadius, useAngle, 'circle')
      segmentContainer.addChild(content)
      segmentContainer.addChild(mask)
      segmentContainer.mask = mask

      const baseRotation = i * segmentAngle
      segmentContainer.rotation = baseRotation + (isEven && !isBg ? evenOffsetRad : 0)

      // Wedge offset (from grab)
      if (!isBg && (wedgeOffsetX !== 0 || wedgeOffsetY !== 0)) {
        const rot = baseRotation
        segmentContainer.x = Math.cos(rot) * wedgeOffsetX - Math.sin(rot) * wedgeOffsetY
        segmentContainer.y = Math.sin(rot) * wedgeOffsetX + Math.cos(rot) * wedgeOffsetY
      }

      // Store master segment info for outline
      if (!isBg && i === 0 && grabSegment) {
        container.__masterRotation = segmentContainer.rotation
        container.__masterRadius = ringRadius
        container.__masterAngle = wedgeAngle
        container.__masterX = segmentContainer.x
        container.__masterY = segmentContainer.y
      }

      if (mirrorMode === 'alternating' && i % 2 === 1) {
        content.scale.x *= -1
      }

      ring.addChild(segmentContainer)
    }

    container.addChild(ring)
    return ring
  }

  // 1. Background — fully independent params
  if (showBackground) {
    const bgSegAngle = (Math.PI * 2) / bgSegments
    const bgGapRad = (bgSegmentGap / 360) * Math.PI * 2
    const bgWedgeAngle = bgSegAngle - bgGapRad
    const bgCutOffsetRad = (bgCutOffset / 360) * Math.PI * 2
    const bgEvenOffsetRad = (bgEvenOffset / 360) * Math.PI * 2
    const bgEffectiveZoom = bgZoom * (opts.bgEdgeZoomScale ?? 1.0)
    const bgRadius = fillRadius
    const bgFillActive = bgFillMode && bgFillMode !== 'none'
    const bgFillRadius = bgFillActive ? fillRadius : bgRadius

    // Background fill layer
    if (bgFillActive) {
      const bgFillTransform = {
        'repeat': null,
        'mirror-repeat': (content) => { content.scale.x *= -1 },
        'clamp-to-edge': (content) => { content.scale.y *= -1 },
      }[bgFillMode] || null

      const bgFillRing = new Container()
      for (let i = 0; i < bgSegments; i++) {
        const segContainer = new Container()
        const content = buildTiledContent(texture, bgEffectiveZoom, bgSourceOffsetX, bgSourceOffsetY, bgCutOffsetRad, bgWrapMode, bgFillRadius)
        if (bgFillTransform) bgFillTransform(content, i)
        const mask = new Graphics()
        drawMask(mask, bgFillRadius, bgWedgeAngle, 'circle')
        segContainer.addChild(content)
        segContainer.addChild(mask)
        segContainer.mask = mask
        segContainer.rotation = i * bgSegAngle + (i % 2 === 0 ? bgEvenOffsetRad : 0)
        if (bgMirrorMode === 'alternating' && i % 2 === 1) content.scale.x *= -1
        bgFillRing.addChild(segContainer)
      }
      bgFillRing._isBgRing = true
      if (bgBlendMode && bgBlendMode !== 'normal') bgFillRing.blendMode = bgBlendMode
      container.addChild(bgFillRing)
    }

    // Background main ring
    const bgRing = new Container()
    for (let i = 0; i < bgSegments; i++) {
      const segContainer = new Container()
      const content = buildTiledContent(texture, bgEffectiveZoom, bgSourceOffsetX, bgSourceOffsetY, bgCutOffsetRad, bgWrapMode, bgRadius)
      const mask = new Graphics()
      drawMask(mask, bgRadius, bgWedgeAngle, 'circle')
      segContainer.addChild(content)
      segContainer.addChild(mask)
      segContainer.mask = mask
      segContainer.rotation = i * bgSegAngle + (i % 2 === 0 ? bgEvenOffsetRad : 0)
      if (bgMirrorMode === 'alternating' && i % 2 === 1) content.scale.x *= -1
      bgRing.addChild(segContainer)
    }
    bgRing._isBgRing = true
    if (bgBlendMode && bgBlendMode !== 'normal') bgRing.blendMode = bgBlendMode
    container.addChild(bgRing)
  }

  // 2. Main kaleidoscope (only if enabled)
  if (!mainEnabled) return

  // Fill layer (behind main)
  if (fillActive) {
    const fillTransform = {
      'repeat': null,
      'mirror-repeat': (content) => { content.scale.x *= -1 },
      'clamp-to-edge': (content) => { content.scale.y *= -1 },
    }[fillMode] || null

    buildRing(fillRadius, fillTransform)
  }

  // 3. Main kaleidoscope (on top)
  const mainRing = buildRing(circleRadius, null)
  if (blendMode && blendMode !== 'normal') {
    mainRing.blendMode = blendMode
  }

  // 4. Grab outline — dashed, always on top of everything
  if (grabSegment && container.__masterRadius) {
    const r = container.__masterRadius
    const a = Math.max(0.01, container.__masterAngle)
    const outline = new Graphics()
    const dl = 8, gl = 5, total = dl + gl

    // Dashed line: center to edge
    for (let d = 0; d < r; d += total) {
      outline.moveTo(d, 0)
      outline.lineTo(Math.min(d + dl, r), 0)
    }

    // Dashed arc
    const arcLen = r * a
    for (let d = 0; d < arcLen; d += total) {
      const a0 = (d / arcLen) * a
      const a1 = (Math.min(d + dl, arcLen) / arcLen) * a
      outline.moveTo(Math.cos(a0) * r, Math.sin(a0) * r)
      outline.arc(0, 0, r, a0, a1, false)
    }

    // Dashed line: edge back to center
    const ex = Math.cos(a), ey = Math.sin(a)
    for (let d = 0; d < r; d += total) {
      const t0 = 1 - d / r, t1 = 1 - Math.min(d + dl, r) / r
      outline.moveTo(ex * r * t0, ey * r * t0)
      outline.lineTo(ex * r * t1, ey * r * t1)
    }

    outline.stroke({ color: 0xff0000, width: 2, alpha: 0.8 })

    outline.rotation = container.__masterRotation || 0
    outline.x = container.__masterX || 0
    outline.y = container.__masterY || 0
    outline.visible = grabOutlineVisible !== false
    outlineRef.current = outline
    container.addChild(outline)
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
  wedgeOffsetX = 0,
  wedgeOffsetY = 0,
  grabSegment = false,
  grabOutlineVisible = true,
  mainEnabled = true,
  blendMode = 'normal',
  showBackground = false,
  bgAnimate = false,
  bgSegments = 6,
  bgZoom = 1.5,
  bgSourceOffsetX = 0,
  bgSourceOffsetY = 0,
  bgCutOffset = 0,
  bgSegmentGap = 0,
  bgEvenOffset = 0,
  bgSpeed = 0.5,
  bgMirrorMode = 'alternating',
  bgRotationDirection = 'clockwise',
  bgSplitRotation = false,
  bgBlendMode = 'normal',
  bgEdgeZoomScale = 0.15,
  bgWrapMode = 'clamp-to-edge',
  bgFillMode = 'none',
  edgeZoomScale = 0.15,
  wrapMode = 'clamp-to-edge',
  fillMode = 'none',
  onParamChange,
}) {
  const canvasRef = useRef(null)
  const { appRef, textureRef, size } = usePixiApp(canvasRef, imageSrc)
  const containerRef = useRef(null)
  const outlineRef = useRef(null)
  const grabDragRef = useRef(null)
  const rotationRef = useRef(0)
  const speedRef = useRef(speed)
  const animateRef = useRef(animate)
  const enabledRef = useRef(isEnabled)
  const rotDirRef = useRef(rotationDirection)
  const splitRotationRef = useRef(splitRotation)
  const bgAnimateRef = useRef(bgAnimate)
  const bgSpeedRef = useRef(bgSpeed)
  const bgRotDirRef = useRef(bgRotationDirection)
  const bgSplitRotationRef = useRef(bgSplitRotation)

  useEffect(() => { speedRef.current = speed }, [speed])
  useEffect(() => { animateRef.current = animate }, [animate])
  useEffect(() => { enabledRef.current = isEnabled }, [isEnabled])
  useEffect(() => { rotDirRef.current = rotationDirection }, [rotationDirection])
  useEffect(() => { splitRotationRef.current = splitRotation }, [splitRotation])
  useEffect(() => {
    if (outlineRef.current) outlineRef.current.visible = grabOutlineVisible !== false
  }, [grabOutlineVisible])
  useEffect(() => { bgAnimateRef.current = bgAnimate }, [bgAnimate])
  useEffect(() => { bgSpeedRef.current = bgSpeed }, [bgSpeed])
  useEffect(() => { bgRotDirRef.current = bgRotationDirection }, [bgRotationDirection])
  useEffect(() => { bgSplitRotationRef.current = bgSplitRotation }, [bgSplitRotation])

  // Build segments + ticker
  useEffect(() => {
    if (!appRef.current || !textureRef.current) return
    const { width, height } = size
    if (width === 0 || height === 0) return

    const app = appRef.current
    app.stage.removeChildren()

    const mainContainer = new Container()
    mainContainer.x = width / 2
    mainContainer.y = height / 2
    app.stage.addChild(mainContainer)
    containerRef.current = mainContainer

    buildSegments(mainContainer, textureRef.current, width, height,
      { segments, zoom, sourceOffsetX, sourceOffsetY, cutOffset, segmentGap, evenOffset, mirrorMode, wrapMode, fillMode, wedgeOffsetX, wedgeOffsetY, grabSegment, grabOutlineVisible, mainEnabled, blendMode, showBackground, bgAnimate, bgSegments, bgZoom, bgSourceOffsetX, bgSourceOffsetY, bgCutOffset, bgSegmentGap, bgEvenOffset, bgSpeed, bgMirrorMode, bgRotationDirection, bgSplitRotation, bgBlendMode, bgWrapMode, bgFillMode, edgeZoomScale, bgEdgeZoomScale }, app, outlineRef)

    // Restore rotation state after rebuild
    mainContainer.children.forEach((ring) => {
      if (!ring._isBgRing && !splitRotation) {
        ring.rotation = rotationRef.current
      }
    })

    // Dual ticker: main + background animation
    const tickerFn = () => {
      if (!containerRef.current) return
      const rings = containerRef.current.children

      if (animateRef.current && enabledRef.current) {
        const dir = rotDirRef.current === 'counterclockwise' ? -1 : 1
        const step = speedRef.current * 0.01
        const flip = splitRotationRef.current

        if (flip) {
          rings.forEach((ring) => {
            if (ring._isBgRing) return
            ring.children.forEach((seg, i) => {
              const segDir = i % 2 === 0 ? dir : -dir
              seg.rotation += step * segDir
            })
          })
        } else {
          rings.forEach((ring) => {
            if (ring._isBgRing) return
            ring.rotation += step * dir
          })
        }
      }

      if (bgAnimateRef.current) {
        const bgDir = bgRotDirRef.current === 'counterclockwise' ? -1 : 1
        const bgStep = bgSpeedRef.current * 0.01
        const bgFlip = bgSplitRotationRef.current

        rings.forEach((ring) => {
          if (!ring._isBgRing) return
          if (bgFlip) {
            ring.children.forEach((seg, i) => {
              const segDir = i % 2 === 0 ? bgDir : -bgDir
              seg.rotation += bgStep * segDir
            })
          } else {
            ring.rotation += bgStep * bgDir
          }
        })
      }
    }
    app.ticker.add(tickerFn)

    return () => { app.ticker?.remove(tickerFn) }
  }, [size.width, size.height, segments, zoom, mirrorMode, sourceOffsetX, sourceOffsetY, cutOffset, segmentGap, evenOffset, edgeZoomScale, wrapMode, fillMode, wedgeOffsetX, wedgeOffsetY, grabSegment, mainEnabled, blendMode, showBackground, bgSegments, bgZoom, bgSourceOffsetX, bgSourceOffsetY, bgCutOffset, bgSegmentGap, bgEvenOffset, bgMirrorMode, bgBlendMode, bgEdgeZoomScale, bgWrapMode, bgFillMode])

  return (
    <VariantFrame
      title={title}
      isEnabled={isEnabled}
      isSelected={isSelected}
      onToggleEnabled={onToggleEnabled}
      onToggleSelect={onToggleSelect}
      onImageUpload={onImageUpload}
      imageSrc={imageSrc}
      interactive
      info={
        <>
          <div><strong>Segments:</strong> {segments}</div>
          <div><strong>Zoom:</strong> {zoom.toFixed(1)}x</div>
          <div><strong>Source Offset:</strong> {sourceOffsetX}, {sourceOffsetY}</div>
          <div><strong>Cut Offset:</strong> {cutOffset}°</div>
        </>
      }
      stats={`segments: ${segments} | zoom: ${zoom.toFixed(1)}`}
    >
      <div
        className="absolute inset-0"
        style={{ pointerEvents: grabSegment ? 'auto' : 'none' }}
        onPointerMove={grabSegment && !grabDragRef.current ? (e) => {
          const el = e.currentTarget
          const rect = el.getBoundingClientRect()
          const cx = rect.width / 2 + wedgeOffsetX
          const cy = rect.height / 2 + wedgeOffsetY
          const mx = e.clientX - rect.left - cx
          const my = e.clientY - rect.top - cy
          const dist = Math.sqrt(mx * mx + my * my)
          const angle = (Math.atan2(my, mx) + Math.PI * 2) % (Math.PI * 2)
          const segAngle = (Math.PI * 2) / segments
          const wedgeEnd = segAngle - ((segmentGap / 360) * Math.PI * 2)
          const r = Math.max(el.clientWidth, el.clientHeight) / 2
          const inWedge = dist < r && angle >= 0 && angle <= wedgeEnd
          el.style.cursor = inWedge ? 'grab' : 'default'
        } : undefined}
        onPointerDown={grabSegment ? (e) => {
          const el = e.currentTarget
          const rect = el.getBoundingClientRect()
          const cx = rect.width / 2 + wedgeOffsetX
          const cy = rect.height / 2 + wedgeOffsetY
          const mx = e.clientX - rect.left - cx
          const my = e.clientY - rect.top - cy
          const dist = Math.sqrt(mx * mx + my * my)
          const angle = (Math.atan2(my, mx) + Math.PI * 2) % (Math.PI * 2)
          const segAngle = (Math.PI * 2) / segments
          const wedgeEnd = segAngle - ((segmentGap / 360) * Math.PI * 2)
          const r = Math.max(el.clientWidth, el.clientHeight) / 2
          if (!(dist < r && angle >= 0 && angle <= wedgeEnd)) return

          e.preventDefault()
          const startX = e.clientX
          const startY = e.clientY
          const startOffsetX = wedgeOffsetX
          const startOffsetY = wedgeOffsetY
          grabDragRef.current = true
          el.style.cursor = 'grabbing'

          const handleMove = (me) => {
            const dx = me.clientX - startX
            const dy = me.clientY - startY
            if (onParamChange) {
              onParamChange('wedgeOffsetX', startOffsetX + dx)
              onParamChange('wedgeOffsetY', startOffsetY + dy)
            }
          }

          const handleUp = () => {
            grabDragRef.current = false
            el.style.cursor = 'default'
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
