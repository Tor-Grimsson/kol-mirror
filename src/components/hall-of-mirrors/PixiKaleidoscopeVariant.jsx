import { useEffect, useRef, useState } from 'react'
import { Application, Assets, Container, Sprite, Graphics } from 'pixi.js'

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
  speed = 0.5
}) {
  const canvasRef = useRef(null)
  const appRef = useRef(null)
  const containerRef = useRef(null)
  const speedRef = useRef(speed)
  const animateRef = useRef(animate)
  const enabledRef = useRef(isEnabled)
  const rotationRef = useRef(0)
  const [showInfo, setShowInfo] = useState(false)

  // Keep refs updated
  useEffect(() => {
    speedRef.current = speed
  }, [speed])

  useEffect(() => {
    animateRef.current = animate
  }, [animate])

  useEffect(() => {
    enabledRef.current = isEnabled
  }, [isEnabled])

  useEffect(() => {
    if (!canvasRef.current || appRef.current) return

    const initPixi = async () => {
      try {
        const canvasWrapper = canvasRef.current?.parentElement
        const imageContainer = canvasWrapper?.parentElement

        if (!imageContainer) {
          console.error('PixiJS Kaleidoscope: No image container found')
          return
        }

        const width = imageContainer.clientWidth
        const height = imageContainer.clientHeight

        if (width === 0 || height === 0) {
          console.warn('PixiJS Kaleidoscope: Container has zero dimensions')
          return
        }

        // Create Pixi Application
        const app = new Application()
        appRef.current = app

        await app.init({
          canvas: canvasRef.current,
          width: width,
          height: height,
          backgroundColor: 0x1a1a1a,
          resolution: window.devicePixelRatio || 1,
          autoDensity: true
        })

        const texture = await Assets.load(imageSrc)

        // Create main container for all segments
        const mainContainer = new Container()
        mainContainer.x = width / 2
        mainContainer.y = height / 2
        app.stage.addChild(mainContainer)
        containerRef.current = mainContainer

        // Create kaleidoscope segments
        const segmentAngle = (Math.PI * 2) / segments
        const radius = Math.max(width, height) / 2

        for (let i = 0; i < segments; i++) {
          // Create container for this segment
          const segmentContainer = new Container()

          // Create sprite
          const sprite = new Sprite(texture)
          sprite.anchor.set(0.5)
          sprite.scale.set(zoom)

          // Create mask for wedge shape
          const mask = new Graphics()
          mask.moveTo(0, 0)
          mask.lineTo(radius, 0)
          mask.arc(0, 0, radius, 0, segmentAngle, false)
          mask.lineTo(0, 0)
          mask.fill({ color: 0xffffff })

          segmentContainer.addChild(sprite)
          segmentContainer.addChild(mask)
          segmentContainer.mask = mask

          // Position and rotate segment
          segmentContainer.rotation = i * segmentAngle

          // Mirror every other segment for kaleidoscope effect
          if (i % 2 === 1) {
            sprite.scale.x *= -1
          }

          mainContainer.addChild(segmentContainer)
        }

        // Animation loop
        app.ticker.add(() => {
          if (containerRef.current && animateRef.current && enabledRef.current) {
            rotationRef.current += speedRef.current * 0.01
            containerRef.current.rotation = rotationRef.current
          }
        })
      } catch (error) {
        console.error('PixiJS Kaleidoscope initialization error:', error)
      }
    }

    const timer = setTimeout(() => {
      initPixi()
    }, 100)

    return () => {
      clearTimeout(timer)
      if (appRef.current) {
        appRef.current.destroy(true, { children: true, texture: true, baseTexture: true })
        appRef.current = null
        containerRef.current = null
      }
    }
  }, [])

  // Reset rotation when disabled
  useEffect(() => {
    if (containerRef.current && !isEnabled) {
      rotationRef.current = 0
      containerRef.current.rotation = 0
    }
  }, [isEnabled, animate])

  // Update zoom when it changes
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.children.forEach(segmentContainer => {
        const sprite = segmentContainer.children[0]
        if (sprite) {
          const isFlipped = sprite.scale.x < 0
          sprite.scale.set(zoom * (isFlipped ? -1 : 1), zoom)
        }
      })
    }
  }, [zoom])

  // Rebuild segments when segment count changes
  useEffect(() => {
    if (!appRef.current || !containerRef.current || !imageSrc) return

    const rebuildSegments = async () => {
      try {
        const texture = await Assets.load(imageSrc)
        const mainContainer = containerRef.current
        const width = appRef.current.screen.width
        const height = appRef.current.screen.height

        // Clear existing segments
        mainContainer.removeChildren()

        // Recreate segments
        const segmentAngle = (Math.PI * 2) / segments
        const radius = Math.max(width, height) / 2

        for (let i = 0; i < segments; i++) {
          const segmentContainer = new Container()

          const sprite = new Sprite(texture)
          sprite.anchor.set(0.5)
          sprite.scale.set(zoom)

          const mask = new Graphics()
          mask.moveTo(0, 0)
          mask.lineTo(radius, 0)
          mask.arc(0, 0, radius, 0, segmentAngle, false)
          mask.lineTo(0, 0)
          mask.fill({ color: 0xffffff })

          segmentContainer.addChild(sprite)
          segmentContainer.addChild(mask)
          segmentContainer.mask = mask

          segmentContainer.rotation = i * segmentAngle

          if (i % 2 === 1) {
            sprite.scale.x *= -1
          }

          mainContainer.addChild(segmentContainer)
        }
      } catch (error) {
        console.error('Error rebuilding kaleidoscope segments:', error)
      }
    }

    rebuildSegments()
  }, [segments, imageSrc])

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
            <div><strong>Segments:</strong> {segments} - {segments <= 4 ? 'Simple pattern' : segments <= 8 ? 'Complex pattern' : 'Intricate pattern'}</div>
            <div><strong>Zoom:</strong> {zoom.toFixed(1)}x - {zoom < 1.5 ? 'Wide view' : zoom < 2.5 ? 'Medium zoom' : 'Close zoom'}</div>
            <div><strong>Speed:</strong> {speed.toFixed(1)} - {speed < 1 ? 'Slow rotation' : speed < 2 ? 'Medium rotation' : 'Fast rotation'}</div>
            <div><strong>Effect:</strong> PixiJS creates mirrored radial segments with rotation animation</div>
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
          segments: {segments} | zoom: {zoom.toFixed(1)} | speed: {speed.toFixed(1)}
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
