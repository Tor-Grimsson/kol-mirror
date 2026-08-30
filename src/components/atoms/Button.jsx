// Subpath import — the barrel export pulls every organism into the bundle
// (+5.5MB). Upstream ships deep exports since kol-component@0.35.0.
import DSButton from '@kolkrabbi/kol-component/atoms/Button'
import Icon from '../icons/Icon'

/**
 * Button — thin adapter over the DS Button (@kolkrabbi/kol-component).
 *
 * Phase 4 of the DS adoption (.kol/llm-plan/02-ds-adoption.md): chrome and
 * behavior come from the canon component; the mirror keeps its own icon
 * registry via the DS's iconComponent seam. Import sites are unchanged.
 * The old local implementation is archived at
 * _tmp/2026-08-12-ds-adoption/Button-local.jsx.
 */
const Button = (props) => <DSButton iconComponent={Icon} {...props} />

export default Button
