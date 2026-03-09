import { useEffect, useRef, useState } from 'react'
import { Application, Assets, Container, Sprite, Graphics, Rectangle } from 'pixi.js'

export default function PixiGlitchSliceVariant({
  title,
  imageSrc,
  isEnabled = true,
  isSelected = false,
  onToggleEnabled,
  onToggleSelect,
  onImageUpload,
  animate = false,
  sliceCount = 20,
  maxOffset = 50,
  speed = 1
}) {
  const canvasRef = useRef(null)
  const appRef = useRef(null)
  const containerRef = useRef(null)
  const slicesRef = useRef([])
  const speedRef = useRef(speed)
  const animateRef = useRef(animate)
  const enabledRef = useRef(isEnabled)
  const frameCountRef = useRef(0)
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
          console.error('PixiJS Glitch: No image container found')
          return
        }

        const width = imageContainer.clientWidth
        const height = imageContainer.clientHeight

        if (width === 0 || height === 0) {
          console.warn('PixiJS Glitch: Container has zero dimensions')
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

        // Create main container for all slices
        const mainContainer = new Container()
        app.stage.addChild(mainContainer)
        containerRef.current = mainContainer

        // Create horizontal slices
        const sliceHeight = height / sliceCount
        const slices = []

        for (let i = 0; i < sliceCount; i++) {
          const sprite = new Sprite(texture)

          // Scale to fit container
          const scale = Math.max(width / texture.width, height / texture.height)
          sprite.scale.set(scale)

          // Center the image
          sprite.x = (width - texture.width * scale) / 2
          sprite.y = (height - texture.height * scale) / 2

          // Create mask for this horizontal slice
          const mask = new Graphics()
          mask.rect(0, i * sliceHeight, width, sliceHeight)
          mask.fill({ color: 0xffffff })

          sprite.mask = mask

          mainContainer.addChild(sprite)
          mainContainer.addChild(mask)

          slices.push({
            sprite,
            mask,
            baseX: sprite.x,
            targetOffset: 0,
            currentOffset: 0
          })
        }

        slicesRef.current = slices

        // Apply initial random offsets
        slices.forEach(slice => {
          const offset = (Math.random() - 0.5) * maxOffset * 2
          slice.targetOffset = offset
          slice.currentOffset = offset
          slice.sprite.x = slice.baseX + offset
        })

        // Animation loop
        let frameCount = 0
        app.ticker.add(() => {
          if (!slicesRef.current.length || !animateRef.current || !enabledRef.current) return

          frameCount++
          frameCountRef.current = frameCount

          // Update offsets every N frames based on speed
          const updateInterval = Math.max(1, Math.floor(60 / speedRef.current))

          if (frameCount % updateInterval === 0) {
            slicesRef.current.forEach(slice => {
              // Randomize target offset
              slice.targetOffset = (Math.random() - 0.5) * maxOffset * 2
            })
          }

          // Smoothly interpolate to target
          slicesRef.current.forEach(slice => {
            slice.currentOffset += (slice.targetOffset - slice.currentOffset) * 0.1
            slice.sprite.x = slice.baseX + slice.currentOffset
          })
        })
      } catch (error) {
        console.error('PixiJS Glitch initialization error:', error)
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
        slicesRef.current = []
      }
    }
  }, [])

  // Reset offsets when disabled
  useEffect(() => {
    if (slicesRef.current.length && !isEnabled) {
      slicesRef.current.forEach(slice => {
        slice.currentOffset = 0
        slice.targetOffset = 0
        slice.sprite.x = slice.baseX
      })
    }
  }, [isEnabled])

  // Rebuild slices when slice count or max offset changes
  useEffect(() => {
    if (!appRef.current || !containerRef.current || !imageSrc || slicesRef.current.length === 0) return

    const rebuildSlices = async () => {
      try {
        const texture = await Assets.load(imageSrc)
        const mainContainer = containerRef.current
        const width = appRef.current.screen.width
        const height = appRef.current.screen.height

        // Clear existing slices
        mainContainer.removeChildren()

        // Recreate slices
        const sliceHeight = height / sliceCount
        const slices = []

        for (let i = 0; i < sliceCount; i++) {
          const sprite = new Sprite(texture)

          const scale = Math.max(width / texture.width, height / texture.height)
          sprite.scale.set(scale)

          sprite.x = (width - texture.width * scale) / 2
          sprite.y = (height - texture.height * scale) / 2

          const mask = new Graphics()
          mask.rect(0, i * sliceHeight, width, sliceHeight)
          mask.fill({ color: 0xffffff })

          sprite.mask = mask

          mainContainer.addChild(sprite)
          mainContainer.addChild(mask)

          slices.push({
            sprite,
            mask,
            baseX: sprite.x,
            targetOffset: 0,
            currentOffset: 0
          })
        }

        slicesRef.current = slices

        // Apply initial random offsets
        slices.forEach(slice => {
          const offset = (Math.random() - 0.5) * maxOffset * 2
          slice.targetOffset = offset
          slice.currentOffset = offset
          slice.sprite.x = slice.baseX + offset
        })
      } catch (error) {
        console.error('Error rebuilding glitch slices:', error)
      }
    }

    rebuildSlices()
  }, [sliceCount, maxOffset, imageSrc])

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
            <div><strong>Slices:</strong> {sliceCount} - {sliceCount < 15 ? 'Chunky bands' : sliceCount < 30 ? 'Medium slices' : 'Fine slices'}</div>
            <div><strong>Max Offset:</strong> {maxOffset}px - {maxOffset < 30 ? 'Subtle shift' : maxOffset < 60 ? 'Medium glitch' : 'Heavy glitch'}</div>
            <div><strong>Speed:</strong> {speed.toFixed(1)} - {speed < 1.5 ? 'Slow glitch' : speed < 3 ? 'Medium glitch' : 'Fast glitch'}</div>
            <div><strong>Effect:</strong> PixiJS creates horizontal slices with random offsets for a glitch aesthetic</div>
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
          slices: {sliceCount} | offset: {maxOffset}px | speed: {speed.toFixed(1)}
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
