import { LabeledControlSection, SettingsRow } from '@kolkrabbi/kol-component'
import { useRenderQuality, setQuality, resetQuality, SCALE_OPTIONS, PIXEL_CAP_OPTIONS, PIXEL_RATIO_OPTIONS, FRAME_DIVISOR_OPTIONS } from '../hooks/renderQuality'
import Dropdown from '../components/molecules/Dropdown'
import ToggleSwitch from '@kolkrabbi/kol-component/atoms/ToggleSwitch'

/**
 * SettingsPage — `/settings`, as the PIECES the Hub's `HubSettings` renders
 * (kol-shell `AppHub`, 2026-10-13). The scaffold, SETTINGS · ABOUT · REPO, the
 * masthead cluster with the theme toggle, the colophon, the links and the
 * shortcuts list are the Hub's — monitor, fxr and mirror each had them on
 * `SettingsScaffold` by hand. What is mirror's stays, as components: the Memory
 * section (`SettingsContent`), the PERFORMANCE tab (`PerformanceContent`) and
 * the About prose (`AboutContent`). `App.jsx` hands them to `AppHub settings=`
 * and `app.about`; the route itself renders nothing because the Hub owns
 * `/settings`. Components only — react-refresh's rule — so the repo links and
 * the tab's title live beside the `APP` in `App.jsx`.
 *
 * The Hub stacks the keyboard shortcuts as rows under the settings column
 * (`KEYBOARD_SHORTCUTS` goes in through `AppHub shortcuts=`), so the local
 * `SettingsShortcuts` block and the search plumbing are gone with the page.
 */

const MEMORY_ROWS = [
  ['Save', 'Save to Slot in the studio sidebar, per variant'],
  ['Load', 'Home → Saved, Library → Memory, or the studio Memory list'],
]

export function SettingsContent() {
  return (
    <LabeledControlSection label="Memory">
      <div className="text-fg-48 kol-mono-14" style={{ maxWidth: 640, marginBottom: 8 }}>The mirror has no database or user accounts. The 9 memory slots persist in this browser's localStorage and survive refresh. Custom-uploaded images are not persisted with a slot — reloading one falls back to the default source image.</div>
      {MEMORY_ROWS.map(([label, desc]) => (
        <SettingsRow key={label} label={label} align="fill"><span className="text-fg-32 kol-helper-12">{desc}</span></SettingsRow>
      ))}
    </LabeledControlSection>
  )
}

/**
 * PerformanceContent — the render budget. The mixer is fill-rate bound: every
 * stage costs in proportion to pixels, so Render scale is worth more than any
 * other control here. Press F anywhere to see what a change actually did.
 */
export function PerformanceContent() {
  const q = useRenderQuality()
  const svgOptions = [
    { value: 1, label: '1x — cheapest' },
    { value: 2, label: '2x — default' },
    { value: 3, label: '3x' },
    { value: 4, label: '4x — legacy' },
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <LabeledControlSection label="Render Budget">
        <div className="text-fg-48 kol-mono-14" style={{ maxWidth: 640, marginBottom: 8 }}>The Symphony mixer composites every channel, bus and feedback buffer once per frame, so its cost scales with pixels rather than with how many effects are stacked. Render scale is the lever: at Half, every stage does a quarter of the work. Press F anywhere to see the per-stage breakdown live — fps, p95 and a jank count, because an average hides the stalls you actually feel. Device pixel ratio is the other big one: at 2x every WebGL channel draws four times the fragments for detail no display resolves on moving video. Changing it takes effect on the next channel reload.</div>
        <SettingsRow label="Render scale">
          <Dropdown
            options={SCALE_OPTIONS.map(o => ({ value: o.value, label: `${o.label} — ${o.detail}` }))}
            value={q.scale}
            onChange={(v) => setQuality({ scale: v })}
            variant="minimal"
            size="md"
          />
        </SettingsRow>
        <SettingsRow label="Output pixel cap">
          <Dropdown
            options={PIXEL_CAP_OPTIONS.map(o => ({ value: o.value, label: `${o.label} — ${o.detail}` }))}
            value={q.maxPixels}
            onChange={(v) => setQuality({ maxPixels: v })}
            variant="minimal"
            size="md"
          />
        </SettingsRow>
        <SettingsRow label="Device pixel ratio">
          <Dropdown
            options={PIXEL_RATIO_OPTIONS.map(o => ({ value: o.value, label: `${o.label} — ${o.detail}` }))}
            value={q.pixelRatio}
            onChange={(v) => setQuality({ pixelRatio: v })}
            variant="minimal"
            size="md"
          />
        </SettingsRow>
        <SettingsRow label="Render every">
          <Dropdown
            options={FRAME_DIVISOR_OPTIONS.map(o => ({ value: o.value, label: `${o.label} — ${o.detail}` }))}
            value={q.frameDivisor}
            onChange={(v) => setQuality({ frameDivisor: v })}
            variant="minimal"
            size="md"
          />
        </SettingsRow>
      </LabeledControlSection>

      <LabeledControlSection label="Adaptive">
        <div className="text-fg-48 kol-mono-14" style={{ maxWidth: 640, marginBottom: 8 }}>Let the measured frame rate pick the render scale. Your Render scale above becomes a ceiling — adaptive only ever goes below it, drops after two bad windows, and takes six good ones to climb back, because a loop that recovers as eagerly as it drops just oscillates. Stalls count as well as the average.</div>
        <SettingsRow label="Adaptive quality">
          <ToggleSwitch checked={!!q.adaptive} onChange={(v) => setQuality({ adaptive: v })} />
        </SettingsRow>
        <SettingsRow label="Target">
          <Dropdown
            options={[{ value: 30, label: '30 fps' }, { value: 45, label: '45 fps' }, { value: 55, label: '55 fps — default' }]}
            value={q.targetFps}
            onChange={(v) => setQuality({ targetFps: v })}
            variant="minimal"
            size="md"
          />
        </SettingsRow>
        {q.adaptive && (
          <SettingsRow label="Currently" align="fill">
            <span className="text-fg-32 kol-helper-12">{q.autoScale && q.autoScale < q.scale ? `Holding ${q.autoScale}x — below your ceiling` : 'At your ceiling'}</span>
          </SettingsRow>
        )}
      </LabeledControlSection>

      <LabeledControlSection label="Source Quality">
        <div className="text-fg-48 kol-mono-14" style={{ maxWidth: 640, marginBottom: 8 }}>Uploaded vectors are rasterised so the WebGL variants can sample them. The old fixed 4x turned a 1024px SVG into a 4096-square texture — around 67 MB in GPU memory per channel, for detail no display can resolve.</div>
        <SettingsRow label="Vector raster scale">
          <Dropdown
            options={svgOptions}
            value={q.svgRasterScale}
            onChange={(v) => setQuality({ svgRasterScale: v })}
            variant="minimal"
            size="md"
          />
        </SettingsRow>
        <SettingsRow label="Channel pixel cap">
          <Dropdown
            options={PIXEL_CAP_OPTIONS.map(o => ({ value: o.value, label: `${o.label} — ${o.detail}` }))}
            value={q.maxChannelPixels}
            onChange={(v) => setQuality({ maxChannelPixels: v })}
            variant="minimal"
            size="md"
          />
        </SettingsRow>
      </LabeledControlSection>

      <LabeledControlSection label="Reset">
        <SettingsRow label="Restore defaults">
          <span className="kol-helper-12 text-fg-64 hover:text-fg-96 cursor-pointer select-none" onClick={() => resetQuality()}>Reset</span>
        </SettingsRow>
      </LabeledControlSection>
    </div>
  )
}

/* `app.about` — the Hub renders it under the app's name, over the colophon.
   Both paragraphs of the old About tab, verbatim; the Hub has one section
   there, so the "Stack" label is the paragraph break. */
export function AboutContent() {
  return (
    <>
      <div>An interactive image distortion playground. Three halls of distortion variants — Displacement (SVG turbulence), Movement (GSAP transforms), Copies (WebGL slicing, glitch, kaleidoscope) — feeding a compositing Symphony mixer with send/return buses, cross-channel routing, per-channel feedback, procedural generators, an expression engine, and loop recording.</div>
      <div style={{ marginTop: 16 }}>React 19 · PixiJS 8 · GSAP 3 · Tailwind CSS 4 · the @kolkrabbi design system (kol-theme, kol-component, kol-framework).</div>
    </>
  )
}
