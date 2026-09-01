# ShellSettingsPairRetired — kol-shell's `SettingsSection` / `LabelRow` are gone

**Staged:** 2026-08-30 · from **kol-ds-ui**
**Nature:** breaking change already shipped. Your settings page needs a two-import swap on the next bump.

## What happened

User ruling 2026-08-30: *"dont ship duplicate components"*. kol-shell was
shipping its own `SettingsSection` + `LabelRow`, a second implementation of
kol-component's `LabeledControlSection` + `SettingsRow` — same job, two
versions. **kol-component's are the survivors** (`LabeledControlSection` is the
user's chosen name). Shell's pair is retired to
`kol-ds-ui/_tmp/2026-08-30-shell-settings-duplicates/`, not deleted.

Shipped in **kol-shell 0.21.0**. `SettingsScaffold` itself is unchanged and
still exported — only the two body blocks left.

## The swap — `src/pages/SettingsPage.jsx`

You are the only two repos that imported them (kol-fxr already moved off).

```diff
- import { SettingsScaffold, SettingsSection, LabelRow, SettingsShortcuts, SettingsLinks, SettingsColophon } from '@kolkrabbi/kol-shell'
+ import { SettingsScaffold, SettingsShortcuts, SettingsLinks, SettingsColophon } from '@kolkrabbi/kol-shell'
+ import { LabeledControlSection, SettingsRow } from '@kolkrabbi/kol-component'
```

Then, in the body:

| was | now | note |
|---|---|---|
| `<SettingsSection title="…">` | `<LabeledControlSection label="…">` | prop is `label`, not `title` |
| `<LabelRow label="…">` | `<SettingsRow label="…">` | same 160px column |

**Two renders change, deliberately:**

1. **The section header becomes an EYEBROW.** Shell's was an `h2`
   (`kol-helper-14 text-fg-96`); `LabeledControlSection` uses
   `kol-eyebrow text-fg-80`. The KOL law is that a section label is an eyebrow —
   this is the fix, not a regression. kol-fxr's `/settings` is the approved
   reference render.
2. **`SettingsRow` UPPERCASES its label** and right-aligns the value by
   default. Pass `align="fill"` for a left-aligned value cell (that is what
   `LabelRow`'s baseline row did).

`LabeledControlSection` also takes `divided` (a hairline above) and
`rowGap` (1 for switch rows, 2 for dropdown rows) — shell's had neither.

## Not urgent

Nothing breaks until you bump kol-shell past 0.20.0. But there is no alias and
no deprecation window: the exports are simply gone, so the bump and the swap
are one move.

---

## 🟠 ADDRESSED — 2026-09-01, kol-mirror

**The swap was already done**, in the 2026-08-30 session that took kol-shell to
0.26.0 — the barrel drop is what forced it, and the build caught it at 0.21.0.
`src/pages/SettingsPage.jsx:1,9` reads exactly the diff this ticket specifies:

```jsx
import { SettingsScaffold, SettingsShortcuts, SettingsLinks, SettingsColophon } from '@kolkrabbi/kol-shell'
import { LabeledControlSection, SettingsRow } from '@kolkrabbi/kol-component'
```

Both renamed props took: `label` for the section, and `align="fill"` on the four
prose rows (Memory ×2, Adaptive → Currently) that read as sentences rather than
values. Re-confirmed green on **kol-shell 0.31.0** today, five releases past the
0.20.0 line where the exports vanish.

`divided` and `rowGap` are available and not taken — no row here has asked for
either yet.

**NOT verified on screen**, same as the ticket above: the two deliberate render
changes — the section header becoming an eyebrow, and `SettingsRow` uppercasing
its label — have never been looked at in this repo. 🔴 **Needs the user's
screen.**
