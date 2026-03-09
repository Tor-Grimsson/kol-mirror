import { useEffect, useRef, useState } from 'react'
import Dropdown from '../../../design-system/components/3-selection/components/Dropdown'
import Slider from '../../../design-system/components/4-input/components/Slider'
import { Icon } from '../../../design-system/components/7-icons'

const DEFAULT_IMAGE = '/images/stack-hero-800.jpg'

const PRESETS = [
  {
    id: 'baseline',
    label: 'Baseline',
    config: { brightness: 1, contrast: 1, saturation: 1, warmth: 0, noise: 0 }
  },
  {
    id: 'noir',
    label: 'Noir Film',
    config: { brightness: 0.9, contrast: 1.4, saturation: 0, warmth: -0.2, noise: 0.12 }
  },
  {
    id: 'sunset',
    label: 'Sunset Glow',
    config: { brightness: 1.1, contrast: 1.05, saturation: 1.25, warmth: 0.3, noise: 0.02 }
  },
  {
    id: 'print',
    label: 'Print Texture',
    config: { brightness: 1, contrast: 0.95, saturation: 0.85, warmth: -0.1, noise: 0.18 }
  }
]

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

const SLIDER_ROWS = [
  { key: 'brightness', label: 'Brightness', min: 0, max: 2, step: 0.05 },
  { key: 'contrast', label: 'Contrast', min: 0, max: 2, step: 0.05 },
  { key: 'saturation', label: 'Saturation', min: 0, max: 2, step: 0.05 },
  { key: 'warmth', label: 'Warmth', min: -0.5, max: 0.5, step: 0.05 },
  { key: 'noise', label: 'Noise', min: 0, max: 0.4, step: 0.01, formatValue: (value) => value.toFixed(2) }
]

const PixiImageFilterCanvas = () => {
  const containerRef = useRef(null)
  const appRef = useRef(null)
  const spriteRef = useRef(null)
  const colorMatrixRef = useRef(null)
  const noiseFilterRef = useRef(null)
  const customImageRef = useRef(null)
  const pendingUploadRef = useRef(false)
  const pixiModuleRef = useRef(null)

  const [imageUrl, setImageUrl] = useState(DEFAULT_IMAGE)
  const [activePreset, setActivePreset] = useState('baseline')
  const [config, setConfig] = useState(PRESETS[0].config)
  const [isLoading, setIsLoading] = useState(true)
  const [uploadInfo, setUploadInfo] = useState({ name: 'Default texture', status: 'ready' })

  useEffect(() => {
    let destroyed = false
    const initPixi = async () => {
      const Pixi = pixiModuleRef.current ?? (pixiModuleRef.current = await import('pixi.js'))
      const { Application, Sprite, ColorMatrixFilter, NoiseFilter } = Pixi
      if (!containerRef.current || destroyed) return

      const app = new Application()
      await app.init({
        backgroundAlpha: 0,
        resizeTo: containerRef.current,
        antialias: true
      })

      if (destroyed) {
        app.destroy(true, { children: true })
        return
      }

      const container = containerRef.current
      container.innerHTML = ''
      container.appendChild(app.canvas)

      const sprite = new Sprite()
      sprite.anchor.set(0.5)
      sprite.position.set(app.renderer.width / 2, app.renderer.height / 2)
      app.stage.addChild(sprite)

      appRef.current = app
      spriteRef.current = sprite
      colorMatrixRef.current = new ColorMatrixFilter()
      noiseFilterRef.current = new NoiseFilter(config.noise)
      sprite.filters = [colorMatrixRef.current, noiseFilterRef.current]

      const resize = () => {
        if (!spriteRef.current || !appRef.current) return
        const { width, height } = container.getBoundingClientRect()
        appRef.current.renderer.resize(width, height)
        spriteRef.current.position.set(width / 2, height / 2)
        fitSpriteToStage()
      }

      resize()
      const observer = new ResizeObserver(resize)
      observer.observe(container)

      container.dataset.cleanup = () => {
        observer.disconnect()
        if (appRef.current) {
          appRef.current.destroy(true, { children: true })
          appRef.current = null
        }
      }
    }

    initPixi()

    return () => {
      destroyed = true
      const current = containerRef.current
      if (current?.dataset.cleanup) {
        current.dataset.cleanup()
        delete current.dataset.cleanup
      } else if (appRef.current) {
        appRef.current.destroy(true, { children: true })
        appRef.current = null
      }
      spriteRef.current = null
      colorMatrixRef.current = null
      noiseFilterRef.current = null
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    const loadTexture = async () => {
      if (!pixiModuleRef.current || !spriteRef.current) return
      const { Assets } = pixiModuleRef.current
      setIsLoading(true)
      try {
        const resource = imageUrl.startsWith('blob:') ? { src: imageUrl } : imageUrl
        const texture = await Assets.load(resource)
        if (cancelled || !spriteRef.current) return
        spriteRef.current.texture = texture
        fitSpriteToStage()
      } catch (error) {
        console.error('Failed to load texture', error)
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    loadTexture()
    return () => {
      cancelled = true
    }
  }, [imageUrl])

  const fitSpriteToStage = () => {
    if (!spriteRef.current || !appRef.current || !containerRef.current) return
    const sprite = spriteRef.current
    const app = appRef.current
    const { width, height } = containerRef.current.getBoundingClientRect()
    const textureWidth = sprite.texture.width || 1
    const textureHeight = sprite.texture.height || 1
    app.renderer.resize(width, height)
    sprite.position.set(width / 2, height / 2)
    const scale = Math.max(width / textureWidth, height / textureHeight)
    sprite.scale.set(scale)
  }

  // Update filter uniforms when settings change
  useEffect(() => {
    if (!colorMatrixRef.current || !noiseFilterRef.current) return

    const matrix = colorMatrixRef.current
    matrix.reset()
    matrix.brightness(clamp(config.brightness, 0, 2), false)
    matrix.contrast(clamp(config.contrast, 0, 2), false)
    matrix.saturate(clamp(config.saturation, 0, 2), false)
    if (config.warmth > 0) {
      matrix.tint(0xff9966, config.warmth)
    } else if (config.warmth < 0) {
      matrix.tint(0x88b4ff, Math.abs(config.warmth))
    }
    noiseFilterRef.current.noise = clamp(config.noise, 0, 0.4)
  }, [config])

  const handlePresetChange = (presetId) => {
    const next = PRESETS.find((preset) => preset.id === presetId)
    if (!next) return
    setActivePreset(next.id)
    setConfig(next.config)
  }

  const handleSliderChange = (key, value) => {
    setConfig((prev) => ({
      ...prev,
      [key]: value
    }))
    setActivePreset('custom')
  }

  const handleUpload = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (customImageRef.current) {
      URL.revokeObjectURL(customImageRef.current)
    }
    const url = URL.createObjectURL(file)
    customImageRef.current = url
    setImageUrl(url)
    setUploadInfo({ name: file.name, status: 'uploading' })
    pendingUploadRef.current = true
  }

  useEffect(() => {
    if (!isLoading && pendingUploadRef.current) {
      setUploadInfo((prev) => ({ ...prev, status: 'ready' }))
      pendingUploadRef.current = false
    }
  }, [isLoading])

  useEffect(() => {
    return () => {
      if (customImageRef.current) {
        URL.revokeObjectURL(customImageRef.current)
        customImageRef.current = null
      }
    }
  }, [])

  return (
  <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(360px,1fr)]">
    <div className="relative min-h-[420px] overflow-hidden rounded bg-surface-secondary">
      <div className="absolute left-4 top-4 z-10 rounded-full bg-surface-primary px-3 py-1 text-xs text-fg-64">
        {isLoading ? 'Loading texture…' : 'Live Pixi Canvas'}
      </div>
      <div ref={containerRef} className="h-full w-full" />
    </div>

    <aside className="flex flex-col gap-5 bg-fg-02 rounded p-6">
      <section className="flex flex-col gap-3">
        <div className="flex items-end justify-between">
          <div>
            <div className="kol-heading-xs text-fg">Filter Presets</div>
            <p className="kol-helper-xs text-fg-64 uppercase tracking-[0.2em]">Choose a baseline or start custom</p>
          </div>
          <div className="kol-helper-xs text-fg-64 uppercase tracking-[0.2em]">03:00</div>
        </div>
        <Dropdown
          options={[
            ...PRESETS.map((preset) => ({ label: preset.label, value: preset.id })),
            { label: 'Custom', value: 'custom' }
          ]}
          value={activePreset}
          onChange={handlePresetChange}
          className="w-48"
        />
      </section>

      <section className="flex flex-col gap-2">
        <span className="kol-helper-xs uppercase tracking-[0.2em] text-fg-64">Texture</span>
        <label className="control-panel w-full cursor-pointer bg-surface-primary/10 hover:bg-surface-primary/20">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {uploadInfo.status === 'uploading' ? (
                <span className="inline-flex h-10 w-10 items-center justify-center rounded bg-surface-on-primary text-surface-primary">
                  …
                </span>
              ) : (
                <div className="h-10 w-10 overflow-hidden rounded border border-auto">
                  <img src={imageUrl} alt="Uploaded texture preview" className="h-full w-full object-cover" />
                </div>
              )}
              <div className="flex flex-col gap-1">
                <span className="kol-heading-sm text-fg">Upload Image</span>
                <span className="kol-helper-xxs text-fg-64 uppercase tracking-[0.3em]">
                  {uploadInfo.status === 'uploading' ? 'Processing…' : `Loaded: ${uploadInfo.name}`}
                </span>
              </div>
            </div>
            <span className="inline-flex items-center justify-center rounded-full bg-surface-on-primary p-2 text-surface-primary">
              <Icon name="docs-upload" size={16} />
            </span>
          </div>
          <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
        </label>
      </section>

      <section className="flex flex-col gap-3">
        {SLIDER_ROWS.map((descriptor) => (
          <div key={descriptor.key}>
            <div className="kol-helper-xs flex items-center justify-between uppercase tracking-[0.2em] text-fg-64">
              <span>{descriptor.label}</span>
              <span>{descriptor.formatValue ? descriptor.formatValue(config[descriptor.key]) : config[descriptor.key].toFixed(2)}</span>
            </div>
            <Slider
              min={descriptor.min}
              max={descriptor.max}
              step={descriptor.step}
              value={config[descriptor.key]}
              onChange={(value) => handleSliderChange(descriptor.key, value)}
              variant="minimal"
              className="w-full"
            />
          </div>
        ))}
        <div className="flex justify-between pt-2 kol-helper-xs text-fg-64 uppercase tracking-[0.2em]">
          <span>Quantize [OFF]</span>
          <span>Snap</span>
          <span>Hide</span>
        </div>
      </section>
    </aside>
  </div>
  )
}
export default PixiImageFilterCanvas
