import { useState } from 'react'
import { Button, Tag, Dropdown, Slider, SectionLabel, ThemeToggle, SectionToggle, FontPreviewItem } from '@kol/ui'
import Wordmark from '../../ui/Wordmark'
import DesCard from './DesCard'
import SurfacePreviewGrid from './SurfacePreviewGrid'

const ComponentPreview = ({ item, snippet, isFirst = false }) => {
  const { id, label, type, variant, props = {}, description } = item
  const [isExpanded, setIsExpanded] = useState(isFirst)
  const [dropdownValue, setDropdownValue] = useState(props.value ?? props.options?.[0]?.value)
  const [sliderValue, setSliderValue] = useState(props.value ?? props.min ?? 0)
  // Separate state for default and inverse surfaces
  const [showControlsDefault, setShowControlsDefault] = useState(false)
  const [showControlsInverse, setShowControlsInverse] = useState(false)
  const [intensityDefault, setIntensityDefault] = useState(200)
  const [frequencyDefault, setFrequencyDefault] = useState(100)
  const [breathTimeDefault, setBreathTimeDefault] = useState(3)
  const [breathAmpDefault, setBreathAmpDefault] = useState(10)
  const [separationDefault, setSeparationDefault] = useState(16)
  const [globalScaleDefault, setGlobalScaleDefault] = useState(50)
  const [globalTimeDefault, setGlobalTimeDefault] = useState(100)
  const [circlesDefault, setCirclesDefault] = useState(1)
  const [quantizeDefault, setQuantizeDefault] = useState(false)
  const [intensityInverse, setIntensityInverse] = useState(200)
  const [frequencyInverse, setFrequencyInverse] = useState(100)
  const [breathTimeInverse, setBreathTimeInverse] = useState(3)
  const [breathAmpInverse, setBreathAmpInverse] = useState(10)
  const [separationInverse, setSeparationInverse] = useState(16)
  const [globalScaleInverse, setGlobalScaleInverse] = useState(50)
  const [globalTimeInverse, setGlobalTimeInverse] = useState(100)
  const [circlesInverse, setCirclesInverse] = useState(1)
  const [quantizeInverse, setQuantizeInverse] = useState(false)
  const [sectionToggleOpen, setSectionToggleOpen] = useState(false)

  const renderComponent = (tone = 'default') => {
    switch (type) {
      case 'button':
        return (
          <Button variant={variant} {...props}>
            {props.children}
          </Button>
        )
      case 'tag':
        return <Tag {...props}>{props.children}</Tag>
      case 'dropdown':
        return (
          <Dropdown
            {...props}
            value={dropdownValue}
            onChange={setDropdownValue}
          />
        )
      case 'slider':
        return (
          <Slider
            {...props}
            value={sliderValue}
            onChange={setSliderValue}
          />
        )
      case 'pill':
        return <span className="pill-inverse">Pill Example</span>
      case 'card':
        return <div className="card w-52 text-sm">Card body leveraging surface tokens.</div>
      case 'foundry-card':
        return (
          <div className="flex w-full flex-col gap-4">
            {(item.variants ?? []).map((variant) => (
              <div key={variant.id} className="flex flex-col gap-2">
                <span className="text-control uppercase tracking-[0.2em] opacity-70">{variant.label}</span>
                <div
                  className={`${variant.className} min-h-[140px] w-full flex items-center justify-center text-control`}
                >
                  Foundry card surface
                </div>
              </div>
            ))}
          </div>
        )
      case 'foundry-preview': {
        const cardClass = tone === 'inverse'
          ? 'foundryCard foundryCardPadded foundryCardInverted'
          : 'foundryCard foundryCardPadded'

        const preview = (
          <FontPreviewItem
            cardClassName={cardClass}
            text="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor."
            initialSize={72}
            initialWeight="Black"
            bgOpacity={100}
          />
        )

        if (tone === 'inverse') {
          return (
            <div className="w-full min-h-[520px]" data-theme="dark">
              <div className="dark">{preview}</div>
            </div>
          )
        }

        return <div className="w-full min-h-[520px]">{preview}</div>
      }
      case 'toggle':
        if (item.variants && item.variants.length > 0) {
          return (
            <div className="flex flex-wrap items-center gap-6">
              {item.variants.map(({ id: variantId, label: variantLabel }) => (
                <div key={variantId} className="flex flex-col items-center gap-2">
                  <span className="text-control text-[10px] uppercase tracking-[0.2em] opacity-60">{variantLabel}</span>
                  <ThemeToggle variant={variantId} previewOnly />
                </div>
              ))}
            </div>
          )
        }
        return <ThemeToggle {...props} previewOnly />
      case 'section-label':
        return <SectionLabel {...props} />
            case 'section-toggle':
        return (
          <div className="space-y-3">
            <SectionToggle
              label={props.label ?? 'Section Title'}
              isExpanded={sectionToggleOpen}
              onToggle={() => setSectionToggleOpen((prev) => !prev)}
            />
            {sectionToggleOpen ? (
              <div className="rounded-lg border border-auto p-4 text-auto bg-auto">
                <p className="kol-mono-text text-xs opacity-70">Expanded content preview</p>
              </div>
            ) : null}
          </div>
        )
      case 'wordmark':
        return <Wordmark className="h-6" />
      case 'work-controls-v2': {
        const breakpoints = [
          { id: 'mobile', label: 'Mobile', fontSize: '11px', buttonFontSize: '14px', buttonPadding: '8px 16px' },
          { id: 'tablet', label: 'Tablet', fontSize: '12px', buttonFontSize: '16px', buttonPadding: '12px 24px' },
          { id: 'desktop', label: 'Desktop', fontSize: '14px', buttonFontSize: '18px', buttonPadding: '14px 28px' }
        ]

        const renderControlPanel = (bp) => (
          <div className="flex w-full max-w-[400px] flex-col gap-2" style={{ fontSize: bp.fontSize }}>
            <div className="control-slider-minimal w-full gap-3 shadow-none">
              <label className="kol-mono-xs w-fit shrink-0 cursor-pointer whitespace-nowrap" style={{ fontSize: bp.fontSize }}>
                Intensity [A]
              </label>
              <input
                type="range"
                min={0}
                max={400}
                defaultValue={200}
                className="slider-black w-full flex-1 cursor-pointer"
              />
              <span className="kol-mono-xs w-fit shrink-0 text-right" style={{ fontSize: bp.fontSize }}>
                200
              </span>
            </div>
            <div className="control-slider-minimal w-full gap-3 shadow-none">
              <label className="kol-mono-xs w-fit shrink-0 cursor-pointer whitespace-nowrap" style={{ fontSize: bp.fontSize }}>
                Frequency [A]
              </label>
              <input
                type="range"
                min={10}
                max={200}
                defaultValue={100}
                className="slider-black w-full flex-1 cursor-pointer"
              />
              <span className="kol-mono-xs w-fit shrink-0 text-right" style={{ fontSize: bp.fontSize }}>
                100
              </span>
            </div>
            <div className="control-slider-minimal w-full gap-3 shadow-none">
              <label className="kol-mono-xs w-fit shrink-0 cursor-pointer whitespace-nowrap" style={{ fontSize: bp.fontSize }}>
                Breath Time
              </label>
              <input
                type="range"
                min={1}
                max={10}
                defaultValue={3}
                className="slider-black w-full flex-1 cursor-pointer"
              />
              <span className="kol-mono-xs w-fit shrink-0 text-right" style={{ fontSize: bp.fontSize }}>
                3
              </span>
            </div>
            <div className="control-slider-minimal w-full gap-3 shadow-none">
              <label className="kol-mono-xs w-fit shrink-0 cursor-pointer whitespace-nowrap" style={{ fontSize: bp.fontSize }}>
                Breath Amp
              </label>
              <input
                type="range"
                min={0}
                max={40}
                defaultValue={10}
                className="slider-black w-full flex-1 cursor-pointer"
              />
              <span className="kol-mono-xs w-fit shrink-0 text-right" style={{ fontSize: bp.fontSize }}>
                10
              </span>
            </div>
            <div className="control-slider-minimal w-full gap-3 shadow-none">
              <label className="kol-mono-xs w-fit shrink-0 cursor-pointer whitespace-nowrap" style={{ fontSize: bp.fontSize }}>
                Separation
              </label>
              <input
                type="range"
                min={0}
                max={60}
                defaultValue={16}
                className="slider-black w-full flex-1 cursor-pointer"
              />
              <span className="kol-mono-xs w-fit shrink-0 text-right" style={{ fontSize: bp.fontSize }}>
                16
              </span>
            </div>
            <div className="control-slider-minimal w-full gap-3 shadow-none">
              <label className="kol-mono-xs w-fit shrink-0 cursor-pointer whitespace-nowrap" style={{ fontSize: bp.fontSize }}>
                Global Scale
              </label>
              <input
                type="range"
                min={0}
                max={100}
                defaultValue={50}
                className="slider-black w-full flex-1 cursor-pointer"
              />
              <span className="kol-mono-xs w-fit shrink-0 text-right" style={{ fontSize: bp.fontSize }}>
                50
              </span>
            </div>
            <div className="control-slider-minimal w-full gap-3 shadow-none">
              <label className="kol-mono-xs w-fit shrink-0 cursor-pointer whitespace-nowrap" style={{ fontSize: bp.fontSize }}>
                Global Time
              </label>
              <input
                type="range"
                min={0}
                max={100}
                defaultValue={100}
                className="slider-black w-full flex-1 cursor-pointer"
              />
              <span className="kol-mono-xs w-fit shrink-0 text-right" style={{ fontSize: bp.fontSize }}>
                100
              </span>
            </div>
            <div className="control-slider-minimal w-full gap-3 shadow-none">
              <label className="kol-mono-xs w-fit shrink-0 cursor-pointer whitespace-nowrap" style={{ fontSize: bp.fontSize }}>
                Circles
              </label>
              <input
                type="range"
                min={1}
                max={8}
                defaultValue={1}
                className="slider-black w-full flex-1 cursor-pointer"
              />
              <span className="kol-mono-xs w-fit shrink-0 text-right" style={{ fontSize: bp.fontSize }}>
                1
              </span>
            </div>
            <div className="flex flex-row justify-between gap-3">
              <div className="control-slider-minimal gap-3 text-control" style={{ fontSize: bp.fontSize }}>
                Quantize [OFF]
              </div>
              <div className="control-slider-minimal gap-3 text-control" style={{ fontSize: bp.fontSize }}>
                Snapshot
              </div>
            </div>
            <Button
              variant="control"
              style={{
                fontSize: bp.buttonFontSize,
                padding: bp.buttonPadding
              }}
            >
              Hide Controls
            </Button>
          </div>
        )

        return (
          <div className="space-y-8">
            {breakpoints.map((bp) => (
              <div key={bp.id} className="space-y-3">
                <div className="kol-mono-xs uppercase opacity-60">{bp.label}</div>
                <div className="flex items-end justify-end">
                  {renderControlPanel(bp)}
                </div>
              </div>
            ))}
          </div>
        )
      }
      case 'work-controls': {
        const isInverse = tone === 'inverse'
        const showControls = isInverse ? showControlsInverse : showControlsDefault
        const setShowControls = isInverse ? setShowControlsInverse : setShowControlsDefault
        const intensity = isInverse ? intensityInverse : intensityDefault
        const setIntensity = isInverse ? setIntensityInverse : setIntensityDefault
        const frequency = isInverse ? frequencyInverse : frequencyDefault
        const setFrequency = isInverse ? setFrequencyInverse : setFrequencyDefault
        const breathTime = isInverse ? breathTimeInverse : breathTimeDefault
        const setBreathTime = isInverse ? setBreathTimeInverse : setBreathTimeDefault
        const breathAmp = isInverse ? breathAmpInverse : breathAmpDefault
        const setBreathAmp = isInverse ? setBreathAmpInverse : setBreathAmpDefault
        const separation = isInverse ? separationInverse : separationDefault
        const setSeparation = isInverse ? setSeparationInverse : setSeparationDefault
        const globalScale = isInverse ? globalScaleInverse : globalScaleDefault
        const setGlobalScale = isInverse ? setGlobalScaleInverse : setGlobalScaleDefault
        const globalTime = isInverse ? globalTimeInverse : globalTimeDefault
        const setGlobalTime = isInverse ? setGlobalTimeInverse : setGlobalTimeDefault
        const circles = isInverse ? circlesInverse : circlesDefault
        const setCircles = isInverse ? setCirclesInverse : setCirclesDefault
        const quantize = isInverse ? quantizeInverse : quantizeDefault
        const setQuantize = isInverse ? setQuantizeInverse : setQuantizeDefault

        return (
          <div className="relative w-full min-h-[300px] flex items-end justify-end p-8">
            {showControls && (
              <div className="flex flex-col gap-0 w-full max-w-[400px]">
                <div className="control-unified gap-3 shadow-none !border-none">
                  <label className="kol-mono-xs whitespace-nowrap shrink-0 w-fit cursor-pointer">
                    Intensity [A]
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={400}
                    value={intensity}
                    onChange={(e) => setIntensity(Number(e.target.value))}
                    className="slider-black flex-1 w-full cursor-pointer"
                  />
                  <span className="kol-mono-xs text-right shrink-0 w-fit">
                    {Math.round(intensity)}
                  </span>
                </div>
                <div className="control-unified gap-3 shadow-none !border-none">
                  <label className="kol-mono-xs whitespace-nowrap shrink-0 w-fit cursor-pointer">
                    Frequency [A]
                  </label>
                  <input
                    type="range"
                    min={10}
                    max={200}
                    value={frequency}
                    onChange={(e) => setFrequency(Number(e.target.value))}
                    className="slider-black flex-1 w-full cursor-pointer"
                  />
                  <span className="kol-mono-xs text-right shrink-0 w-fit">
                    {Math.round(frequency)}
                  </span>
                </div>
                <Slider
                  label="Breath Time"
                  min={1}
                  max={10}
                  value={breathTime}
                  onChange={setBreathTime}
                  className="!border-none"
                />
                <Slider
                  label="Breath Amp"
                  min={0}
                  max={40}
                  value={breathAmp}
                  onChange={setBreathAmp}
                  className="!border-none"
                />
                <Slider
                  label="Separation"
                  min={0}
                  max={60}
                  value={separation}
                  onChange={setSeparation}
                  className="!border-none"
                />
                <Slider
                  label="Global Scale"
                  min={0}
                  max={100}
                  value={globalScale}
                  onChange={setGlobalScale}
                  className="!border-none"
                />
                <Slider
                  label="Global Time"
                  min={0}
                  max={100}
                  value={globalTime}
                  onChange={setGlobalTime}
                  className="!border-none"
                />
                <Slider
                  label="Circles"
                  min={1}
                  max={8}
                  value={circles}
                  onChange={setCircles}
                  className="!border-none"
                />
                <div className="flex flex-row justify-between gap-3">
                  <div
                    onClick={() => setQuantize(!quantize)}
                    className="kol-mono-xs control-unified gap-3 shadow-none cursor-pointer !border-none"
                  >
                    Quantize [{quantize ? 'ON' : 'OFF'}]
                  </div>
                  <div className="kol-mono-xs control-unified gap-3 shadow-none cursor-pointer !border-none">
                    Snap
                  </div>
                  <div
                    onClick={() => setShowControls(false)}
                    className="kol-mono-xs control-unified gap-3 shadow-none cursor-pointer !border-none"
                  >
                    Hide
                  </div>
                </div>
              </div>
            )}
            {!showControls && (
              <button
                onClick={() => setShowControls(true)}
                className="kol-mono-xs"
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'var(--kol-surface-inverse)',
                  color: 'var(--foreground-inverse)',
                  border: '1px solid var(--foreground)',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Show Controls
              </button>
            )}
          </div>
        )
      }
      default:
        return null
    }
  }

  return (
    <div className="space-y-4 rounded-2xl border border-auto bg-auto p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <DesCard
          name={label}
          description={description}
          code={snippet}
        />
        <button
          type="button"
          className="self-start rounded-full border border-auto bg-auto px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-auto"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? 'Hide preview' : 'Show preview'}
        </button>
      </div>

      {isExpanded && (
        <SurfacePreviewGrid>
          <SurfacePreviewGrid.Surface label="Default surface">
            <div className="flex flex-wrap items-start gap-4">
              {renderComponent('default')}
            </div>
          </SurfacePreviewGrid.Surface>
          <SurfacePreviewGrid.Surface label="Inverse surface" inverse>
            <div className="flex flex-wrap items-start gap-4">
              {renderComponent('inverse')}
            </div>
          </SurfacePreviewGrid.Surface>
        </SurfacePreviewGrid>
      )}
    </div>
  )
}

export default ComponentPreview
