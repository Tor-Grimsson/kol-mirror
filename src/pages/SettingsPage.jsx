import { SettingsScaffold, SettingsShortcuts, SettingsLinks, SettingsColophon } from '@kolkrabbi/kol-shell'
/* kol-shell 0.21.0 retired its own `SettingsSection` + `LabelRow` — they were a
   second implementation of kol-component's `LabeledControlSection` +
   `SettingsRow` (DS ruling 2026-08-30: "dont ship duplicate components"), and
   the barrel drops them, so this is not optional. Two rendering changes come
   with the estate shape: the row label is UPPERCASED by the component, and a
   row's control right-aligns unless it asks for `align="fill"` — which the
   prose rows below do, because a sentence reading from the right is not a row. */
import { LabeledControlSection, SettingsRow } from '@kolkrabbi/kol-component'
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

/* The scaffold's header row IS ContentFilters (kol-shell 0.21.0): it searches
 * `items` on `searchKeys` and hands the survivors to `renderContent`. Without
 * `items` the search box renders and filters nothing, which is what it did here
 * until 2026-08-30. The shortcuts are the only searchable rows on this page —
 * flattened for the filter, regrouped for the component, which takes sections. */
const SHORTCUT_ITEMS = KEYBOARD_SHORTCUTS.flatMap(({ section, items }) =>
  items.map((k) => ({ ...k, section })))

/* Section order is KEYBOARD_SHORTCUTS', not the filtered list's — a search must
 * narrow the page, never reorder it. Empty sections drop out. */
const groupShortcuts = (rows) => KEYBOARD_SHORTCUTS
  .map(({ section }) => ({ section, items: rows.filter((r) => r.section === section) }))
  .filter((s) => s.items.length)

function SettingsContent({ shortcuts }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* The Display section is GONE, not duplicated (SettingsMastheadCluster,
          kol-shell 0.27.0). Its only row was the theme toggle, and the scaffold
          now owns that control's place — the masthead cluster below. Two
          toggles on one page is the drift the ticket exists to end; kol-fxr's
          approved page keeps a Display section only because it has other rows. */}
      <LabeledControlSection label="Memory">
        <div className="text-fg-48 kol-mono-14" style={{ maxWidth: 640, marginBottom: 8 }}>The mirror has no database or user accounts. The 9 memory slots persist in this browser's localStorage and survive refresh. Custom-uploaded images are not persisted with a slot — reloading one falls back to the default source image.</div>
        {MEMORY_ROWS.map(([label, desc]) => (
          <SettingsRow key={label} label={label} align="fill"><span className="text-fg-32 kol-helper-12">{desc}</span></SettingsRow>
        ))}
      </LabeledControlSection>

      {shortcuts.length > 0 && (
        <LabeledControlSection label="Keyboard Shortcuts">
          <SettingsShortcuts sections={shortcuts} />
        </LabeledControlSection>
      )}
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

function AboutContent() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <LabeledControlSection label="Hall of Mirrors">
        <div className="text-fg-48 kol-mono-14" style={{ maxWidth: 640 }}>An interactive image distortion playground. Three halls of distortion variants — Displacement (SVG turbulence), Movement (GSAP transforms), Copies (WebGL slicing, glitch, kaleidoscope) — feeding a compositing Symphony mixer with send/return buses, cross-channel routing, per-channel feedback, procedural generators, an expression engine, and loop recording.</div>
      </LabeledControlSection>

      <LabeledControlSection label="Stack">
        <div className="text-fg-48 kol-mono-14" style={{ maxWidth: 640 }}>React 19 · PixiJS 8 · GSAP 3 · Tailwind CSS 4 · the @kolkrabbi design system (kol-theme, kol-component, kol-framework).</div>
      </LabeledControlSection>

      <SettingsColophon />
    </div>
  )
}

function RepoContent() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <LabeledControlSection label="Links">
        <SettingsLinks links={[
          { label: 'GitHub', url: 'https://github.com/Tor-Grimsson/kol-mirror' },
          { label: 'Kolkrabbi', url: 'https://mirror.kolkrabbi.io' },
          { label: 'Vercel', url: 'https://vercel.com/tor-grimssons-projects/kol-mirror' },
        ]} />
      </LabeledControlSection>
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
      /* THE MASTHEAD CLUSTER (SettingsMastheadCluster, kol-shell 0.27.0). The
         scaffold owns order, gap and tone; the toggle is a NODE because it
         lives in kol-framework, which shell dropped as a peer in 0.16.0.
         `fill="none"` + `tone="sunken"` + `label={false}` is fxr's approved row.

         `picker` is omitted — this app has nothing to pick up here (fxr opens a
         chrome, r2b2 a bucket). `onOpenSettings` is omitted too: mirror has NO
         settings drawer, and the ticket's point 4 rules that the gear is where
         one goes when it is built, not a control wired to nothing. Mirror's
         render-quality settings are the Performance TAB two rows down, which a
         second opener would only duplicate. */
      themeToggle={<ThemeToggle fill="none" tone="sunken" label={false} size="sm" />}
      items={SHORTCUT_ITEMS}
      searchKeys={['label', 'combo']}
      renderContent={(tab, filtered) => (
        <>
          {tab === 'settings' && <SettingsContent shortcuts={groupShortcuts(filtered ?? SHORTCUT_ITEMS)} />}
          {tab === 'performance' && <PerformanceContent />}
          {tab === 'about' && <AboutContent />}
          {tab === 'repo' && <RepoContent />}
        </>
      )}
    />
  )
}
