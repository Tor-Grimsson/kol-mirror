import { SettingsScaffold, SettingsSection, LabelRow, SettingsShortcuts, SettingsLinks, SettingsColophon } from '@kolkrabbi/kol-shell'
import { ThemeToggle } from '@kolkrabbi/kol-framework'
import { KEYBOARD_SHORTCUTS } from '../data/shortcuts'
import { useRenderQuality, setQuality, resetQuality, SCALE_OPTIONS, PIXEL_CAP_OPTIONS, PIXEL_RATIO_OPTIONS, FRAME_DIVISOR_OPTIONS } from '../hooks/renderQuality'
import Dropdown from '../components/molecules/Dropdown'
import ToggleSwitch from '@kolkrabbi/kol-component/atoms/ToggleSwitch'

/**
 * SettingsPage — kol-shell's SettingsScaffold in fxr/monitor's shape
 * (ShellHomeSystemAdoption, 2026-08-27): Settings · About · Repo. Content is
 * mirror's: Memory replaces monitor's Patches, mirror's keymap, mirror About.
 * The shortcut list is `data/shortcuts.js`, which feeds the overlay too.
 */

const TABS = [
  { value: 'settings', label: 'Settings', title: 'Settings', subtitle: 'Configuration and preferences' },
  { value: 'performance', label: 'Performance', title: 'Performance', subtitle: 'Render budget and quality limits' },
  { value: 'about', label: 'About', title: 'About', subtitle: 'Hall of Mirrors by Kolkrabbi' },
  { value: 'repo', label: 'Repo', title: 'Repo', subtitle: 'Source and deployments' },
]

const MEMORY_ROWS = [
  ['Save', 'Save to Slot in the studio sidebar, per variant'],
  ['Load', 'Home → Saved, Library → Memory, or the studio Memory list'],
]

function SettingsContent() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <SettingsSection title="Display">
        {/* fill="subtle": on a page this toggle IS a button (the component's
            own spec); system lives behind alt-click, per the DS ruling. */}
        <LabelRow label="Theme" align="center">
          <ThemeToggle fill="subtle" size="sm" />
        </LabelRow>
      </SettingsSection>

      <SettingsSection title="Memory">
        <div className="text-fg-48 kol-mono-14" style={{ maxWidth: 640, marginBottom: 8 }}>The mirror has no database or user accounts. The 9 memory slots persist in this browser's localStorage and survive refresh. Custom-uploaded images are not persisted with a slot — reloading one falls back to the default source image.</div>
        {MEMORY_ROWS.map(([label, desc]) => (
          <LabelRow key={label} label={label}>{desc}</LabelRow>
        ))}
      </SettingsSection>

      <SettingsSection title="Keyboard Shortcuts">
        <SettingsShortcuts sections={KEYBOARD_SHORTCUTS} />
      </SettingsSection>
    </div>
  )
}

/**
 * PerformanceContent — the render budget. The mixer is fill-rate bound: every
 * stage costs in proportion to pixels, so Render scale is worth more than any
 * other control here. Press F anywhere to see what a change actually did.
 */
function PerformanceContent() {
  const q = useRenderQuality()
  const svgOptions = [
    { value: 1, label: '1x — cheapest' },
    { value: 2, label: '2x — default' },
    { value: 3, label: '3x' },
    { value: 4, label: '4x — legacy' },
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <SettingsSection title="Render Budget">
        <div className="text-fg-48 kol-mono-14" style={{ maxWidth: 640, marginBottom: 8 }}>The Symphony mixer composites every channel, bus and feedback buffer once per frame, so its cost scales with pixels rather than with how many effects are stacked. Render scale is the lever: at Half, every stage does a quarter of the work. Press F anywhere to see the per-stage breakdown live — fps, p95 and a jank count, because an average hides the stalls you actually feel. Device pixel ratio is the other big one: at 2x every WebGL channel draws four times the fragments for detail no display resolves on moving video. Changing it takes effect on the next channel reload.</div>
        <LabelRow label="Render scale" align="center">
          <Dropdown
            options={SCALE_OPTIONS.map(o => ({ value: o.value, label: `${o.label} — ${o.detail}` }))}
            value={q.scale}
            onChange={(v) => setQuality({ scale: v })}
            variant="minimal"
            size="md"
          />
        </LabelRow>
        <LabelRow label="Output pixel cap" align="center">
          <Dropdown
            options={PIXEL_CAP_OPTIONS.map(o => ({ value: o.value, label: `${o.label} — ${o.detail}` }))}
            value={q.maxPixels}
            onChange={(v) => setQuality({ maxPixels: v })}
            variant="minimal"
            size="md"
          />
        </LabelRow>
        <LabelRow label="Device pixel ratio" align="center">
          <Dropdown
            options={PIXEL_RATIO_OPTIONS.map(o => ({ value: o.value, label: `${o.label} — ${o.detail}` }))}
            value={q.pixelRatio}
            onChange={(v) => setQuality({ pixelRatio: v })}
            variant="minimal"
            size="md"
          />
        </LabelRow>
        <LabelRow label="Render every" align="center">
          <Dropdown
            options={FRAME_DIVISOR_OPTIONS.map(o => ({ value: o.value, label: `${o.label} — ${o.detail}` }))}
            value={q.frameDivisor}
            onChange={(v) => setQuality({ frameDivisor: v })}
            variant="minimal"
            size="md"
          />
        </LabelRow>
      </SettingsSection>

      <SettingsSection title="Adaptive">
        <div className="text-fg-48 kol-mono-14" style={{ maxWidth: 640, marginBottom: 8 }}>Let the measured frame rate pick the render scale. Your Render scale above becomes a ceiling — adaptive only ever goes below it, drops after two bad windows, and takes six good ones to climb back, because a loop that recovers as eagerly as it drops just oscillates. Stalls count as well as the average.</div>
        <LabelRow label="Adaptive quality" align="center">
          <ToggleSwitch checked={!!q.adaptive} onChange={(v) => setQuality({ adaptive: v })} />
        </LabelRow>
        <LabelRow label="Target" align="center">
          <Dropdown
            options={[{ value: 30, label: '30 fps' }, { value: 45, label: '45 fps' }, { value: 55, label: '55 fps — default' }]}
            value={q.targetFps}
            onChange={(v) => setQuality({ targetFps: v })}
            variant="minimal"
            size="md"
          />
        </LabelRow>
        {q.adaptive && (
          <LabelRow label="Currently">
            {q.autoScale && q.autoScale < q.scale ? `Holding ${q.autoScale}x — below your ceiling` : 'At your ceiling'}
          </LabelRow>
        )}
      </SettingsSection>

      <SettingsSection title="Source Quality">
        <div className="text-fg-48 kol-mono-14" style={{ maxWidth: 640, marginBottom: 8 }}>Uploaded vectors are rasterised so the WebGL variants can sample them. The old fixed 4x turned a 1024px SVG into a 4096-square texture — around 67 MB in GPU memory per channel, for detail no display can resolve.</div>
        <LabelRow label="Vector raster scale" align="center">
          <Dropdown
            options={svgOptions}
            value={q.svgRasterScale}
            onChange={(v) => setQuality({ svgRasterScale: v })}
            variant="minimal"
            size="md"
          />
        </LabelRow>
        <LabelRow label="Channel pixel cap" align="center">
          <Dropdown
            options={PIXEL_CAP_OPTIONS.map(o => ({ value: o.value, label: `${o.label} — ${o.detail}` }))}
            value={q.maxChannelPixels}
            onChange={(v) => setQuality({ maxChannelPixels: v })}
            variant="minimal"
            size="md"
          />
        </LabelRow>
      </SettingsSection>

      <SettingsSection title="Reset">
        <LabelRow label="Restore defaults">
          <span className="kol-helper-12 text-fg-64 hover:text-fg-96 cursor-pointer select-none" onClick={() => resetQuality()}>Reset</span>
        </LabelRow>
      </SettingsSection>
    </div>
  )
}

function AboutContent() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <SettingsSection title="Hall of Mirrors">
        <div className="text-fg-48 kol-mono-14" style={{ maxWidth: 640 }}>An interactive image distortion playground. Three halls of distortion variants — Displacement (SVG turbulence), Movement (GSAP transforms), Copies (WebGL slicing, glitch, kaleidoscope) — feeding a compositing Symphony mixer with send/return buses, cross-channel routing, per-channel feedback, procedural generators, an expression engine, and loop recording.</div>
      </SettingsSection>

      <SettingsSection title="Stack">
        <div className="text-fg-48 kol-mono-14" style={{ maxWidth: 640 }}>React 19 · PixiJS 8 · GSAP 3 · Tailwind CSS 4 · the @kolkrabbi design system (kol-theme, kol-component, kol-framework).</div>
      </SettingsSection>

      <SettingsColophon />
    </div>
  )
}

function RepoContent() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <SettingsSection title="Links">
        <SettingsLinks links={[
          { label: 'GitHub', url: 'https://github.com/Tor-Grimsson/kol-mirror' },
          { label: 'Kolkrabbi', url: 'https://mirror.kolkrabbi.io' },
          { label: 'Vercel', url: 'https://vercel.com/tor-grimssons-projects/kol-mirror' },
        ]} />
      </SettingsSection>
    </div>
  )
}

export default function SettingsPage() {
  return (
    /* `header` spreads onto the scaffold's PageHeader (kol-shell 0.7.1); the
       section h2 role is the DS's since 0.7.2. */
    <SettingsScaffold
      tabs={TABS}
      defaultTab="settings"
      header={{ size: 'sm', voice: 'mono' }}
      renderContent={(tab) => (
        <>
          {tab === 'settings' && <SettingsContent />}
          {tab === 'performance' && <PerformanceContent />}
          {tab === 'about' && <AboutContent />}
          {tab === 'repo' && <RepoContent />}
        </>
      )}
    />
  )
}
