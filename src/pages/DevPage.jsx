import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { PageShell, TabStrip } from '@kolkrabbi/kol-shell'
import { PageHeader } from '@kolkrabbi/kol-component'
import usePersistedState from '../hooks/usePersistedState'
import WideOnly from '../components/WideOnly'
import Tape from './dev/Tape'
import Fronts from './dev/Fronts'
import Icons from './dev/Icons'
import Expression from './dev/Expression'

/**
 * DevPage — `/dev`, ONE rail row for everything that is not the app (user 2026-10-14: *"fold
 * them into development tab … put everything there that we are unsure about"*). kol-ds-ui had
 * already named these development storage (2026-10-03). Four tabs:
 *
 *   TAPE        ten deck designs on the studio transport
 *   FRONTS      the front-panel sketchbook
 *   ICONS       the glyph sheet
 *   EXPRESSION  kol-hardware's EnvelopeGenerator — the oscilloscope and the reference. The
 *               expression itself lives on every knob and in the Expression module; this is the
 *               bench, not a feature
 *
 * Each tab is the old page's body under this one masthead. Unsure about something? It goes here.
 */
const TABS = [
  { value: 'tape', label: 'Tape' },
  { value: 'fronts', label: 'Fronts' },
  { value: 'icons', label: 'Icons' },
  { value: 'expression', label: 'Expression' },
]

export default function DevPage() {
  const { state } = useLocation()
  const [stored, setStored] = usePersistedState('dev-tab', 'tape')
  /* a Library card's expression deep-links straight onto its tab, once; a tap moves on */
  const [override, setOverride] = useState(state?.expr ? 'expression' : null)
  const tab = override ?? stored
  const setTab = (v) => { setOverride(null); setStored(v) }

  return (
    <PageShell mode="fixed" className="gap-6">
      <PageHeader
        size="sm"
        voice="mono"
        title="Dev"
        subtitle="Experiments and reference — nothing here is the app"
        actions={<TabStrip options={TABS} value={tab} onChange={setTab} />}
      />
      <div className="min-h-0 flex-1 overflow-auto">
        {tab === 'tape' && <Tape />}
        {tab === 'fronts' && <WideOnly what="The front sketchbook"><Fronts /></WideOnly>}
        {tab === 'icons' && <WideOnly what="The icon sheet"><Icons /></WideOnly>}
        {tab === 'expression' && <Expression key={state?.expr ?? ''} />}
      </div>
    </PageShell>
  )
}
