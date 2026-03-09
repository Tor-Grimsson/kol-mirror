import DesSection from '../molecules/DesSection'
import DesCard from '../molecules/DesCard'
import SurfacePreviewGrid from '../molecules/SurfacePreviewGrid'

const tokenChip = (label) => (
  <span className="pill-inverse">
    {label}
  </span>
)

const renderLayeredCollage = () => (
  <div aria-hidden="true" className="relative h-96">
    <div className="absolute inset-0 bg-auto" />
    <div className="absolute inset-0 border border-fg pointer-events-none z-10" />
    <div className="absolute left-20 top-16 h-[9.5rem] w-[18rem] border border-fg bg-fg z-20" />
    <div className="absolute left-[22rem] top-12 h-[8.5rem] w-[14rem] border border-fg bg-auto z-30" />
    <div className="absolute left-[10.5rem] top-[10.5rem] h-[7.5rem] w-[16rem] border-2 border-surface-32 bg-fg z-40" />
    <div className="absolute left-[18rem] top-[13.5rem] h-[4.5rem] w-[9.5rem] border border-fg bg-auto z-50" />
    <div className="absolute left-[6rem] top-[8.5rem] h-[5.5rem] w-[8.5rem] border border-fg bg-auto z-30" />
    <div className="absolute left-[24rem] top-[5.5rem] h-10 w-10 rounded-full bg-fg z-60" />
    <div className="absolute left-[7.5rem] top-[10rem] h-9 w-9 rounded-full bg-auto border border-fg z-60" />
    <div className="absolute left-[22rem] top-[9rem] h-9 w-9 rounded-full border-2 border-surface-32 bg-fg z-60" />
  </div>
)

const recipes = [
  {
    title: 'Layered surface collage',
    description: 'Overlapping frames illustrate how `.surface-inverse`, `.bg-auto`, and foreground overlays interact without additional styling.',
    defaultContent: renderLayeredCollage(),
    inverseContent: renderLayeredCollage()
  },
  {
    title: '.bg-auto · border-auto · divider-auto',
    description: 'Default card stack: wrap the frame in `.text-auto`, then compose cards, dividers, and overlays inside.',
    defaultContent: (
      <div className="space-y-4">
        {tokenChip('Frame wrapper')}
        <p className="kol-mono-text text-xs opacity-70">
          `.text-auto` on the wrapper sets the foreground for every element inside.
        </p>
        <div className="divider-auto w-full"></div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2 rounded-lg border border-auto bg-auto p-3">
            {tokenChip('Primary card')}
            <p className="kol-mono-text text-xs opacity-80">
              Use `.bg-auto` + `border-auto` for neutral blocks.
            </p>
            <span className="kol-mono-text text-[10px] opacity-60">
              Utilities: text-auto · bg-auto · border-auto
            </span>
          </div>
          <div className="space-y-2 rounded-lg border border-dashed border-auto bg-fg-08 p-3">
            {tokenChip('Foreground overlay (8%)')}
            <p className="kol-mono-text text-xs opacity-80">
              Pair `.bg-fg-08` or `.bg-fg-16` with the same wrapper for subtle emphasis.
            </p>
            <span className="kol-mono-text text-[10px] opacity-60">
              Utilities: bg-fg-08 · border-auto
            </span>
          </div>
        </div>
      </div>
    ),
    inverseContent: (
      <div className="space-y-4">
        {tokenChip('Frame wrapper')}
        <p className="kol-mono-text text-xs opacity-70">
          Inverse context flips `.text-auto` to light copy while keeping the same markup.
        </p>
        <div className="divider-auto w-full"></div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2 rounded-lg border border-auto bg-auto p-3">
            {tokenChip('Primary card')}
            <p className="kol-mono-text text-xs opacity-80">
              `.bg-auto` resolves to light, `.border-auto` adjusts to the lighter outline.
            </p>
            <span className="kol-mono-text text-[10px] opacity-60">
              Utilities: text-auto · bg-auto · border-auto
            </span>
          </div>
          <div className="space-y-2 rounded-lg border border-dashed border-auto bg-fg-08 p-3">
            {tokenChip('Foreground overlay (8%)')}
            <p className="kol-mono-text text-xs opacity-80">
              Foreground overlays lighten automatically for light-on-dark pockets.
            </p>
            <span className="kol-mono-text text-[10px] opacity-60">
              Utilities: bg-fg-08 · border-auto
            </span>
          </div>
        </div>
      </div>
    )
  },
  {
    title: 'Layer overlays (.bg-fg-*)',
    description: 'Overlapping shapes inherit the active foreground. Layer utilities keep the stack readable without guessing opacity.',
    defaultContent: (
      <div className="space-y-3 text-auto">
        <div className="relative h-64 overflow-hidden rounded-xl border border-auto bg-auto p-4">
          {tokenChip('Base: bg-auto')}
          <div className="absolute left-6 top-10 w-32 rounded-lg border border-auto bg-auto p-3">
            {tokenChip('Card')}
            <p className="kol-mono-text text-[10px] opacity-70">`.border-auto` outlines adapt automatically.</p>
          </div>
          <div className="absolute right-8 top-6 h-24 w-24 rounded-full bg-fg-16"></div>
          <div className="absolute bottom-4 right-4 rounded-lg border border-auto bg-fg-08 px-3 py-2">
            <span className="kol-mono-text text-[10px] opacity-80">`.bg-fg-08` overlay</span>
          </div>
          <div className="absolute bottom-6 left-8 rounded-lg bg-surface-inverse border border-auto px-3 py-2 text-auto">
            <span className="kol-mono-text text-[10px] opacity-80">Inverse pocket (`.surface-inverse`)</span>
          </div>
        </div>
        <p className="kol-mono-text text-xs opacity-70">
          Mix `.bg-fg-*` overlays with inverse pockets to simulate depth. Nothing hardcodes colors—the wrapper drives everything.
        </p>
      </div>
    ),
    inverseContent: (
      <div className="space-y-3 text-auto">
        <div className="relative h-64 overflow-hidden rounded-xl border border-auto bg-auto p-4">
          {tokenChip('Base: bg-auto')}
          <div className="absolute left-6 top-10 w-32 rounded-lg border border-auto bg-auto p-3">
            {tokenChip('Card')}
            <p className="kol-mono-text text-[10px] opacity-70">Same markup; foreground/borders flip for light theme.</p>
          </div>
          <div className="absolute right-8 top-6 h-24 w-24 rounded-full bg-fg-16"></div>
          <div className="absolute bottom-4 right-4 rounded-lg border border-auto bg-fg-08 px-3 py-2">
            <span className="kol-mono-text text-[10px] opacity-80">`.bg-fg-08` overlay</span>
          </div>
          <div className="absolute bottom-6 left-8 rounded-lg surface-default border border-auto px-3 py-2 text-auto">
            <span className="kol-mono-text text-[10px] opacity-80">Default pocket (`.surface-default`)</span>
          </div>
        </div>
        <p className="kol-mono-text text-xs opacity-70">
          Foreground-driven overlays lighten; verify with the sidebar theme toggle to ensure contrasts pass.
        </p>
      </div>
    )
  },
  {
    title: 'Accent ribbon (.bg-fg · accent tokens)',
    description: 'Accent surfaces call attention to outliers without breaking the semantic stack.',
    defaultContent: (
      <div className="space-y-4">
        {tokenChip('Frame')}
        <div className="rounded-lg border border-auto bg-fg-04 p-3">
          <p className="kol-mono-text text-xs opacity-80">
            Light scrim from `.bg-fg-04` keeps supporting copy aligned with the frame.
          </p>
        </div>
        <div
          className="rounded-lg px-4 py-3"
          style={{ backgroundColor: 'var(--accent-primary)', color: 'var(--accent-primary-foreground)' }}
        >
          <span className="kol-mono-text">Call to action</span>
          <p className="kol-mono-text text-xs opacity-80 mt-2">
            Accent foreground stays legible in both themes—toggle the sidebar switch to confirm.
          </p>
        </div>
        <div className="rounded-lg border border-auto bg-fg-16 p-3">
          {tokenChip('Outlier')}
          <p className="kol-mono-text text-xs opacity-80">
            Pair `.bg-fg-16` with accent ribbons to soften the transition between neutral and highlight zones.
          </p>
        </div>
      </div>
    ),
    inverseContent: (
      <div className="space-y-4">
        {tokenChip('Frame')}
        <div className="rounded-lg border border-auto bg-fg-04 p-3">
          <p className="kol-mono-text text-xs opacity-80">
            Scrim lightens automatically for inverse contexts.
          </p>
        </div>
        <div
          className="rounded-lg px-4 py-3"
          style={{ backgroundColor: 'var(--accent-primary)', color: 'var(--accent-primary-foreground)' }}
        >
          <div style={{ color: 'inherit' }}>
            <span className="kol-mono-text">Call to action</span>
            <p className="kol-mono-text text-xs opacity-80 mt-2">
              Accent tokens stay constant—foreground ensures readability on both themes.
            </p>
          </div>
        </div>
        <div className="rounded-lg border border-auto bg-fg-16 p-3">
          {tokenChip('Outlier')}
          <p className="kol-mono-text text-xs opacity-80">
            Outlier zones inherit the lighter foreground tone while keeping the same markup.
          </p>
        </div>
      </div>
    )
  }
]

const VisualCombinationGuide = () => (
  <div className="space-y-10">
    <DesSection
      name="Practical Layer Recipes"
      description="Examples showing how frames, overlays, and accent callouts compose together. Toggle the theme to confirm everything stays legible."
    />

    {recipes.map(({ title, description, defaultContent, inverseContent }) => (
      <div key={title} className="space-y-4">
        <DesCard name={title} description={description} />
        <SurfacePreviewGrid>
          <SurfacePreviewGrid.Surface label="Default surface">
            {defaultContent}
          </SurfacePreviewGrid.Surface>
          <SurfacePreviewGrid.Surface label="Inverse surface" inverse>
            {inverseContent}
          </SurfacePreviewGrid.Surface>
        </SurfacePreviewGrid>
      </div>
    ))}

    <DesCard
      name="Utility Checklist"
      description="Quick reminders when composing surfaces and overlays."
    />
    <ul className="space-y-2 kol-mono-text text-sm opacity-80">
      <li className="flex gap-3">
        <span>+</span>
        <span><strong>Start with `.text-auto` on the frame</strong> so every child inherits the correct foreground color.</span>
      </li>
      <li className="flex gap-3">
        <span>+</span>
        <span><strong>Use `.bg-auto` + `border-auto`</strong> for primary cards; add `.divider-auto` between stacked blocks.</span>
      </li>
      <li className="flex gap-3">
        <span>+</span>
        <span><strong>Layer `.bg-fg-*` utilities</strong> for translucent overlays and hover states—no manual opacity math.</span>
      </li>
      <li className="flex gap-3">
        <span>+</span>
        <span><strong>Flip context with `.surface-inverse`</strong> whenever you need a light-on-dark pocket inside a dark frame.</span>
      </li>
      <li className="flex gap-3">
        <span>+</span>
        <span><strong>Reserve accent fills for highlights</strong>; keep supporting surfaces neutral so the ribbon reads as intentional.</span>
      </li>
    </ul>
  </div>
)

export default VisualCombinationGuide
