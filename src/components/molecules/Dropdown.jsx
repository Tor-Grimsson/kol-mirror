import DSDropdown from '@kolkrabbi/kol-component/molecules/Dropdown'

/**
 * Dropdown — thin adapter over the DS Dropdown (@kolkrabbi/kol-component),
 * the same shape `atoms/Button.jsx` uses.
 *
 * Replaces mirror's hand-built dropdown (user ruling 2026-08-28: "it's stupid,
 * just replace it with DS"). The local one drew its own trigger and portal
 * panel from an inline `SIZE_MAP` and emitted none of the `kol-dd-*` classes,
 * so no kol-theme rule could ever reach it — `tone="sunken"` (theme 0.85.0)
 * was the case that surfaced it. The original is at
 * `_tmp/2026-08-28-dropdown-ds/Dropdown-local.jsx` (324 lines).
 *
 * All 29 call sites pass `variant="minimal"` + `size="md"`; the DS aliases
 * `minimal → outline`, and its own size law resolves `sm` unless a size is
 * given, so the explicit `md` still carries.
 *
 * `rowHeight` is the DS's own prop since component 0.124.0
 * (DropdownGhostWidthAndListHeight, filed from here 2026-08-28 and closed the
 * same day) — forwarded, and defaulted to the studio's 24px pitch. `maxRows`
 * arrived with it; the DS's 10 is right, so it is not touched.
 *
 * `onOptionHover` is the DS's since component 0.125.0
 * (DropdownOptionHoverPreview, filed from here and closed the same day) —
 * forwarded untouched; FxUnit's blend-mode preview runs on it again.
 *
 * PROPS THE DS HAS NO SEAM FOR — dropped here rather than silently forwarded:
 *   `placeholder` · `defaultValue` · `keepOpen` · `renderOption` — unused or
 *                                     one-off; the DS renders the option whose
 *                                     `value` matches, and nothing else.
 */
const DROPPED = ['placeholder', 'defaultValue', 'keepOpen', 'renderOption', 'variant', 'size']

/* ALWAYS PRIMARY (user ruling 2026-08-28: "always start primary"; no outline —
   "I hate outline"). Not a default a call site can talk out of: every dropdown
   in mirror is the filled primary trigger whose open panel continues the same
   fill as one piece. The 29 sites' `variant="minimal"` — which the DS aliases
   to `outline` — is ignored rather than edited out of 29 identical places. */
/* ALWAYS SM (user ruling 2026-08-28: "you are using too big dropdowns in the
   studio, they don't fit, always sm"). Every call site passes `size="md"`,
   which is too tall for the mixer's 24px rows — overridden here rather than in
   29 identical places. This is also the DS's own size law (sm at every
   viewport unless a consumer insists); md was mirror's carry-over. */
const Dropdown = (props) => {
  const clean = Object.fromEntries(Object.entries(props).filter(([k]) => !DROPPED.includes(k)))
  return (
    <DSDropdown
      {...clean}
      variant="primary"
      size="sm"
      rowHeight={props.rowHeight ?? 24}
    />
  )
}

export default Dropdown
