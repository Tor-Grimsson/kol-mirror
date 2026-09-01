import DSSlider from '@kolkrabbi/kol-component/molecules/Slider'

/**
 * Slider — thin adapter over the DS Slider (@kolkrabbi/kol-component), the same
 * shape `molecules/Dropdown.jsx` uses.
 *
 * Replaces mirror's hand-built slider (SliderDualThumbAndPlayhead, filed from
 * here 2026-08-30 and closed the same day as kol-component 0.133.0 + kol-theme
 * 0.97.0). The local one was a VERBATIM copy of DS CSS kept alive by one
 * feature the DS did not have: `.mirror-slider-minimal` was `.control-slider`
 * declaration for declaration, `.mirror-slider-track` was `.slider-black` down
 * to the thumb's `margin-top: -5px`, and the third rule was the bordered pill
 * the DS retired 2026-07-08 — dead here too, no call site ever passed it.
 * Original at `_tmp/2026-08-30-slider-upstream/Slider-local.jsx` (183 lines),
 * its skin beside it as `components-slider-block.css` (157 lines).
 *
 * `variant="dual"`, `playhead` / `onPlayheadChange`, `readout` and
 * `defaultValue` + alt-click reset are all the DS's now — forwarded untouched,
 * which is why all 18 call sites needed no edit.
 *
 * TWO REPO-WIDE PINS, the reason this file exists rather than a direct import
 * at 10 sites. First, `readout="value"`. The DS default is an editable filled <Input>,
 * and the mixer runs 17 faders in 24px rows inside a ~300px shelf — an input
 * chip on every one is a different control. `value` is RotaryDial's own
 * display-only readout and renders the exact span the local component had.
 * Overridable per call site: pass `readout` and it wins.
 *
 * The track ink is the second pin: mirror's faders run full ink, not the DS's
 * dim `fg-64`. It rides `style` — the documented seam, which only became real
 * in kol-theme 0.98.0 + kol-component 0.134.0 (`SliderTrackVariableNotForwarded`,
 * filed from here while adopting the dual slider and closed the same day). It
 * had never worked: `style` was forwarded nowhere and `.slider-black` declared
 * the variable on itself, so inheritance was dead too. A call site's own `style`
 * spreads after and wins.
 */
const Slider = ({ readout = 'value', style, ...rest }) => (
  <DSSlider
    {...rest}
    readout={readout}
    style={{ '--kol-slider-track': 'var(--kol-surface-on-primary)', ...style }}
  />
)

export default Slider
