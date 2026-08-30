import { useState } from 'react'
import { CatalogPage } from '@kolkrabbi/kol-shell'
import ChannelPatchPanel from '../components/hall-of-mirrors/ChannelPatchPanel'
import { Icon } from '../components/icons'
import SpecList from '@kolkrabbi/kol-component/molecules/SpecList'
import Coverflow from '../components/Coverflow'
import { Channel } from '../components/hall-of-mirrors/SymphonyMixer'
import MasterModule from '../components/hall-of-mirrors/MasterModule'
import RoutingMatrix from '../components/hall-of-mirrors/RoutingMatrix'
import PlaybackModule from '../components/hall-of-mirrors/PlaybackModule'
import ChannelModules from '../components/hall-of-mirrors/ChannelModules'
import { EMPTY_CHANNEL } from '../hooks/useMirrorState'
import { MIXER_MODULES } from '../data/mixerModules'

/**
 * MixerPage — /mixer, the RACK (user ruling 2026-08-28: "don't list cards in a
 * grid: just show a mixer rail in the middle and a right side-rail with each
 * module — make it visual, not so boring as grid").
 *
 * On `CatalogPage`, the same layout Library and Home run (user 2026-08-28:
 * "set up the same layout as [Library]") — after a list, a full-width rack and
 * a centred one were all wrong in turn. The DS page is the answer that was
 * already in the repo: header, filter row, card grid, expand in place.
 *
 * A module's card MEDIA is its drawn front — jack strip, knob row, fader, keys,
 * chosen by KIND — so the grid reads as a rack rather than as text. Clicking a
 * card expands it to the specs. A REFERENCE surface, not a second instrument
 * (ARCHITECTURE §1, same standing as /expressions); the desk itself is still
 * state, and nothing here touches it.
 */

/* THE FRONT of each card — the real unit, read-only. Everything here is off an
   EMPTY_CHANNEL / empty master with no-op handlers, and the card's dead zone
   keeps the pointer out (ARCHITECTURE §1: nothing on this page touches the
   desk). A module with no standalone component renders its specs alone rather
   than a drawing of itself — a fake front is worse than none. */
const EMPTY_MASTER = { inputs: [null, null, null], fx: [], sends: {}, opacity: 100 }
const noop = () => {}

function ModuleFront({ id, flipped, onFlip }) {
  switch (id) {
    case 'channel':
      return (
        <Channel
          channelId={0}
          flipped={flipped}
          onFlip={onFlip}
          patchPanel={<ChannelPatchPanel channelIndex={0} channel={EMPTY_CHANNEL} channels={[EMPTY_CHANNEL]} master={EMPTY_MASTER} onChannelUpdate={noop} />}
          value={EMPTY_CHANNEL.intensity}
          opacity={EMPTY_CHANNEL.opacity}
          params={EMPTY_CHANNEL.params}
          controls={[]}
          enabled={false}
          boosted={false}
          items={[]}
          fx={[]}
          defaultName="Channel 1"
        />
      )
    case 'master':
      return <MasterModule master={EMPTY_MASTER} onMasterChange={noop} channels={[EMPTY_CHANNEL]} onChannelUpdate={noop} />
    case 'routing':
      return <RoutingMatrix channels={[EMPTY_CHANNEL]} onChannelUpdate={noop} master={EMPTY_MASTER} onMasterChange={noop} />
    case 'playback':
      return <PlaybackModule />
    case 'generators':
    case 'field':
      return <ChannelModules index={0} channel={EMPTY_CHANNEL} onChannelUpdate={noop} onMediaChange={noop} onRecalc={noop} />
    default:
      return null
  }
}

function Specs({ mod }) {
  return (
    <div>
      {/* the intro is SANS and darker than the table below it — it is prose,
          the table is data, and the hierarchy should say so */}
      <div className="kol-sans-body-02 text-fg-96" style={{ marginBottom: 20 }}>{mod.role}</div>
      <SpecList
        framed
        items={[
          { label: 'In', value: mod.io.in },
          { label: 'Out', value: mod.io.out },
          ...mod.controls.map(([label, detail]) => ({ label, value: detail })),
        ]}
      />
    </div>
  )
}

export default function MixerPage() {
  /* the ONLY interactive thing on the page — the strip's OWN flip control, in
     its header (user 2026-08-28: "the card has a patch button in its header").
     The separate Patch toggle above the card is gone. */
  const [flipped, setFlipped] = useState(false)

  const items = MIXER_MODULES.map((m) => ({ ...m, title: m.name }))

  return (
    <CatalogPage
      className="mixer-spec"
      header={{ title: 'Mixer', subtitle: 'Every module in the desk, and what it does', size: 'sm', voice: 'mono' }}
      items={items}
      filtersTitle="All Modules"
      filterGroups={[{ label: 'Kind', key: 'kind', stack: true, values: [...new Set(MIXER_MODULES.map((m) => m.kind))] }]}
      filtersProps={{
        tone: 'sunken',
        /* CatalogPage's own card is `variant="catalog"`, which has no eyebrow
           slot. `article` is the one whose order is media → eyebrow → title →
           body (ContentText's SLOTS), which is the layout asked for: the strip
           on top, the section eyebrow above the heading, the text below. */
        renderItem: (rows) => {
          /* one card per module (user 2026-08-28) */
          const cards = rows
          /* tighter step + shorter radius: the cards ride closer together and
             overlap at the shoulders (user 2026-08-28: "make the cards overlap
             maybe? so they feel a bit together") */
          return (
            <Coverflow count={cards.length} cardWidth={640} height={1160} step={17} radius={1050}>
              {(i) => {
                const m = cards[i]
                return (
                  /* locked: 640 wide, 3:5. A plain div, not ContentCard — the
                     DS card boxes its media to a ratio and clips it. Section,
                     header, module, text. */
                  <div
                    className="flex flex-col"
                    style={{ width: 640, aspectRatio: '3 / 5', background: 'var(--kol-oq-12)', border: '1px solid var(--kol-fg-08)', borderRadius: 'var(--kol-radius-xs)', padding: 16, gap: 12, overflow: 'hidden' }}
                  >
                    <div className="kol-helper-10 uppercase text-fg-32">{m.kind}</div>
                    <div className="kol-mono-16 text-fg-96">{m.name}</div>
                    <div className="flex justify-center">
                      <ModuleFront id={m.id} flipped={flipped} onFlip={() => setFlipped((f) => !f)} />
                    </div>
                    <Specs mod={m} />
                  </div>
                )
              }}
            </Coverflow>
          )
        },
      }}
    />
  )
}
