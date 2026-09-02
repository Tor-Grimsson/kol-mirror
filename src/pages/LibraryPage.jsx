import { useState } from 'react'
import CatalogLibrary from '../components/CatalogLibrary'
import { DISPLACEMENT_VARIANTS, MOVEMENT_VARIANTS, COPIES_VARIANTS, GENERATOR_VARIANTS, findVariant } from '../data/mirrorVariants'
import { CANVAS_FX_DEFS, MAX_CANVAS_FX } from '../hooks/useCanvasFx'
import { MODULE_REGISTRY } from '../data/moduleRegistry'
import ModuleMedia from '../components/ModuleMedia'
import { useLibrary } from '../hooks/useLibraryStore'
import { compile } from '../hooks/useExpressionValue'
import { WIRE_COLORS } from '../components/hall-of-mirrors/wireColors'
import Button from '../components/atoms/Button'
import Divider from '../components/atoms/Divider'
import { Icon } from '../components/icons'

/**
 * LibraryPage — /library, on kol-shell's `CatalogPage` (ShellHomeSystemAdoption,
 * 2026-08-27), in fxr's shape: ONE pooled list — the memory slots and the
 * variant catalogue — RECENT / SAVED in the header, and each kind a FILTER
 * GROUP with its own chips (Variants → the halls, Memory → the slots). What
 * an item is and what a click does stay here; the page chrome is the DS's.
 * Library entries (useLibraryStore — expressions today, effects + patches
 * next) pool in as well: tags are their filter group, Export / Remove ride the
 * card, Import is the page action.
 *
 * CREATE LEFT THIS PAGE 2026-09-01. It was merged in here as a third view on
 * 2026-08-28 ("Create can merge with library as a tab"); the user's later
 * ruling — monitor is the reference, and monitor keeps `/create` a route with
 * its own rail row — supersedes that. The builder, the module pool and the
 * channel rail all went with it to `src/pages/CreatePage.jsx`; the
 * sources+effects pool was the wrong list for a MIXER (its modules are the
 * desk's, `MIXER_MODULES`) and is retired to `_tmp/2026-09-01-create-route/`.
 * THE PAGE CHROME IS `CatalogLibrary`'s, not this file's (2026-09-02, user:
 * *"dont make me diff the pages, they should be identical when ur done just
 * showing different sets"*). `/library` and `/mixer` are the same component;
 * this file is only what this half IS — the material: variants, effects,
 * expressions. The desk is `/mixer`.
 */

const PREVIEW_SRC = '/images/stack-hero-400.jpg'

const allVariants = [
  ...DISPLACEMENT_VARIANTS.map(v => ({ ...v, hall: 'Displacement' })),
  ...MOVEMENT_VARIANTS.map(v => ({ ...v, hall: 'Movement' })),
  ...COPIES_VARIANTS.map(v => ({ ...v, hall: 'Copies' })),
  /* the seven generators are sources like the halls and load the same way —
     they were in no Library view at all until the views split (2026-09-02) */
  ...GENERATOR_VARIANTS.map(v => ({ ...v, hall: 'Generators' })),
].map(v => ({ name: v.id, title: v.title, hall: v.hall, tags: v.tags || [] }))

/* TWO LIBRARIES, AND THIS IS THE FIRST (user 2026-09-02: *"maybe we have 2
   library pages one for expression + effect and the other for patches/
   modules?"*, then — after I countered with one page and five views and he
   approved it — *"its too much to have 4 in the same"*). Five views overloaded
   the strip: it wrapped onto two rows at 390, which was the strip saying so.

   The split is his pairing. THE MATERIAL is here — the variants you load, the
   effects you put on them, the expressions that drive them. THE DESK is
   `/mixer` (Modules · Patches), which already was the module catalogue and
   already owned `/mixer/:id`, so no new route was needed for it.

   Chips: an FX unit's registry group is one value for all ten, and a group
   whose only chip repeats its own label is a toggle dressed as a filter — so
   theirs are the units themselves, which is what monitor's module group does
   with `u_label`. */
const effects = MODULE_REGISTRY
  .filter((m) => m.kind === 'FX')
  .map((m) => ({ name: m.id, title: m.name, tags: m.tags || [], module: m, effect: m.name }))

const VIEW_MODE_OPTIONS = [
  { value: 'variants', label: 'Variants' },
  { value: 'effects', label: 'Effects' },
  { value: 'expressions', label: 'Expressions' },
]

/* A patch reads as its signal path: one bar per live channel, in wire colour,
   with the master strip at the end. Cheap, and it distinguishes patches at a
   glance without rendering the actual mixer. */
function PatchThumb({ patch }) {
  const chans = (patch.data?.channels || []).filter((c) => c.variantId)
  const inputs = patch.data?.master?.inputs || []
  return (
    <svg viewBox="0 0 100 40" preserveAspectRatio="none" style={{ width: '100%', height: '100%', display: 'block' }}>
      {chans.map((c, i) => {
        const y = 8 + i * 10
        const patched = inputs.includes(i)
        return (
          <g key={i} opacity={patched ? 1 : 0.3}>
            <line x1="6" y1={y} x2="70" y2={y} stroke={WIRE_COLORS[i % WIRE_COLORS.length]} strokeWidth="2" vectorEffect="non-scaling-stroke" />
            <circle cx="6" cy={y} r="2.5" fill={WIRE_COLORS[i % WIRE_COLORS.length]} />
            {patched && <line x1="70" y1={y} x2="86" y2="20" stroke={WIRE_COLORS[i % WIRE_COLORS.length]} strokeWidth="1" opacity="0.6" vectorEffect="non-scaling-stroke" />}
          </g>
        )
      })}
      <rect x="86" y="12" width="8" height="16" fill="none" stroke="currentColor" strokeWidth="1" className="text-fg-32" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

/* A static trace of the expression over 5 s — the card's media. */
function ExpressionThumb({ expr }) {
  const fn = compile(expr)
  const pts = []
  let lo = Infinity, hi = -Infinity
  for (let i = 0; i <= 100; i++) {
    let v
    try { v = fn ? fn((i / 100) * 5, i * 3, 0, 100) : 0 } catch { v = 0 }
    if (!isFinite(v)) v = 0
    pts.push(v)
    if (v < lo) lo = v
    if (v > hi) hi = v
  }
  const range = hi - lo || 1
  const points = pts.map((v, i) => `${i},${(1 - (v - lo) / range) * 36 + 2}`).join(' ')
  return (
    <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="text-fg-64" style={{ width: '100%', height: '100%', display: 'block' }}>
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

export default function LibraryPage() {
  const expressions = useLibrary('expression').map((e) => ({
    name: e.id, title: e.name, detail: e.data.expr, tags: e.tags, entry: e, savedAt: e.savedAt ?? 0,
  }))
  // Parsed once per mount (audit 2026-08-12: was re-parsing every render).
  const [memory] = useState(() => {
    try {
      const raw = localStorage.getItem('mirror-archive')
      if (raw) return (JSON.parse(raw) || []).map((s, i) => ({ slot: s, i })).filter(({ slot }) => slot)
    } catch { /* no memory */ }
    return []
  })

  const saved = memory.map(({ slot, i }) => ({
    name: `m${i + 1}`,
    title: `M${i + 1} — ${findVariant(slot.variantId)?.title || slot.variantId}`,
    detail: slot.variantId,
    src: slot.imageSrc || PREVIEW_SRC,
    slotIndex: i,
    savedAt: slot.savedAt ?? 0,
    memory: `M${i + 1}`,
  }))

  /* newest saved thing first, then the catalogue — the RECENT order that used
     to be its own view, now the order inside every view that has saved items */
  const recent = (a, b) => b.savedAt - a.savedAt
  const tagsOf = (items) => [...new Set(items.flatMap((e) => e.tags || []))].sort()
  const tagGroup = (items) => ({ label: 'Tags', key: 'tags', values: tagsOf(items) })

  const variantItems = [...saved].sort(recent).concat(allVariants)
  const exprItems = [...expressions.filter((e) => !e.entry.preset)].sort(recent).concat(expressions.filter((e) => e.entry.preset))

  /* what each view feeds the one page — monitor's `VIEWS` */
  const VIEWS = {
    variants: {
      items: variantItems, title: 'All Variants',
      filterGroups: [
        { label: 'Variants', key: 'hall', stack: true, values: ['Displacement', 'Movement', 'Copies', 'Generators'] },
        { label: 'Memory', key: 'memory', values: saved.map((s) => s.memory) },
        tagGroup(allVariants),
      ],
    },
    effects: {
      items: effects, title: 'All Effects',
      filterGroups: [
        { label: 'Effects', key: 'effect', stack: true, values: effects.map((m) => m.effect).sort() },
        tagGroup(effects),
      ],
    },
    expressions: {
      items: exprItems, title: 'All Expressions',
      filterGroups: [tagGroup(exprItems)],
    },
  }
  return (
    <CatalogLibrary
      storageKey="library-tab"
      views={VIEW_MODE_OPTIONS}
      viewsConfig={VIEWS}
      /* the two medias only this half can draw */
      media={(item) => (item.entry.kind === 'patch'
        ? <PatchThumb patch={item.entry} />
        : <ExpressionThumb expr={item.entry.data.expr} />)}
    />
  )
}
