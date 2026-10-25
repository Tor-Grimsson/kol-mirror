import { useParams, useNavigate } from 'react-router-dom'
import { StudioDetail } from '@kolkrabbi/kol-shell'
import { PatchThumb, PatchOutput } from '../components/PatchThumb.jsx'
import { PRESETS } from '../hooks/useLibraryStore.js'
import { MODULE_REGISTRY } from '../data/moduleRegistry.js'
import { findVariant } from '../data/mirrorVariants.js'

/**
 * PatchDetailPage — `/library/patch/:id`, one patch's page on kol-shell's `StudioDetail` (plan
 * home-library-detail-one-card 3.2, 2026-10-24): a shipped preset (`preset:patch:<file>`) or one of the registry's
 * one-tap patches (`patch:<slug>` — Slit-Scan Camera and its kin). A patch card opens THIS page, never the studio
 * (user: *"it goes to the same PATCH detail slug, from where you can load if you want"*); Load is the first action.
 */
export default function PatchDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const preset = PRESETS.find((p) => p.id === id)
  const registry = !preset ? MODULE_REGISTRY.find((m) => m.id === id && m.kind === 'Patch' && !m.front) : null
  if (!preset && !registry) return <StudioDetail notFound={{ title: 'Patch not found', subtitle: id }} />
  const goBack = () => ((window.history.state?.idx ?? 0) > 0 ? navigate(-1) : navigate('/library'))

  if (preset) {
    const channels = (preset.data?.channels || []).filter((c) => c.variantId)
    return (
      <StudioDetail
        back={{ onClick: goBack }}
        title={preset.name}
        subtitle={`${channels.length} ${channels.length === 1 ? 'channel' : 'channels'}`}
        description={preset.description}
        sections={[
          { label: 'Channels', rows: channels.map((c, i) => ({ kind: `CH ${i + 1}`, label: findVariant(c.variantId)?.title ?? c.variantId, value: `${c.intensity ?? 0}% · ${c.blendMode ?? 'normal'}`, hint: c.routeFrom != null ? `from CH ${c.routeFrom + 1}` : undefined })) },
          ...(preset.tags?.length ? [{ label: 'Tags', text: preset.tags.join(', ') }] : []),
        ]}
        /* the patch's OUTPUT (1.6): the save's own frame, the build-time capture, the wiring last */
        preview={<div className="border border-fg-08 overflow-hidden" style={{ width: '100%', aspectRatio: '16 / 10', borderRadius: 4 }}><PatchThumb patch={preset} /></div>}
        actions={[
          { label: 'Load', onClick: () => navigate('/studio', { state: { patch: preset } }) },
        ]}
      />
    )
  }
  return (
    <StudioDetail
      back={{ onClick: goBack }}
      title={registry.name}
      subtitle={`${registry.kind} — ${registry.group}`}
      description={registry.detail}
      sections={registry.tags?.length ? [{ label: 'Tags', text: registry.tags.join(', ') }] : []}
      preview={<div className="border border-fg-08 overflow-hidden" style={{ width: '100%', aspectRatio: '16 / 10', borderRadius: 4 }}><PatchOutput entry={registry} /></div>}
      actions={[
        { label: 'Add to Create', onClick: () => navigate('/create', { state: { add: registry.id } }) },
      ]}
    />
  )
}
