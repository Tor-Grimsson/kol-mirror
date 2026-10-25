/**
 * KEYBOARD_SHORTCUTS — the single source for both consumers: the overlay on
 * `S` (kol-shell's ShortcutsOverlay) and the Settings page list (kol-shell's
 * SettingsShortcuts). Sectioned since ShellHomeSystemAdoption (2026-08-27);
 * every label and combo is verbatim from the flat list this replaces.
 *
 * Both DS consumers read `combo` since kol-shell 0.9.0 — one array, no map.
 */
import { CANVAS_KEYS } from '@kolkrabbi/kol-component'

/* THE MAP (plan 13 § 1.3, user 2026-10-25: *"read monitor and see what shortcuts they have set as convention and
   reuse those"*). The canvas keys are the KOL's `CANVAS_KEYS` — ⌘ is the canvas modifier by ruling — and every
   other key means what it means on kol-monitor's rack (`src/data/shortcuts.js` Rack · Cables). A mirror-only
   action takes a key neither uses. The previous list: `_tmp/2026-10-25-plan-13/before/shortcuts.js`. */
export const KEYBOARD_SHORTCUTS = [
  {
    section: 'Studio',
    items: [
      { id: 'shortcuts', label: 'Shortcuts', combo: 'S' },
      { id: 'sidebar', label: 'Sidebar', combo: 'H' },
      { id: 'palette', label: 'Search modules', combo: '⌘K' },
      { id: 'edit', label: 'Edit mode', combo: 'E' },
      { id: 'mute', label: 'Mute all', combo: 'M' },
      { id: 'mixer', label: 'Mixer show / hide', combo: 'D' },
      { id: 'patch-table', label: 'Patch table', combo: 'P' },
      { id: 'flip-desk', label: 'Flip whole desk', combo: '⇧P' },
      { id: 'cables', label: 'Cable visibility', combo: 'O' },
      { id: 'play', label: 'Play / pause timeline', combo: 'Space' },
      { id: 'head-start', label: 'Head to start', combo: '↑' },
      { id: 'head-end', label: 'Head to end', combo: '↓' },
      { id: 'timeline', label: 'Timeline show / hide', combo: 'B' },
      { id: 'theme', label: 'Theme light / dark', combo: 'T' },
      { id: 'reload', label: 'Reload randomizer', combo: 'R' },
      { id: 'rail', label: 'Show / hide rail', combo: '\\' },
      { id: 'nav', label: 'Jump to rail item', combo: '⌥1–9' },
      { id: 'undo', label: 'Undo / redo', combo: '⌘Z / ⌘⇧Z' },
    ],
  },
  /* the desk's canvas — the KOL's own table, so a change there lands here */
  { section: 'Desk canvas', items: CANVAS_KEYS.filter((k) => k.surface !== 'editor') },
  {
    section: 'Recording',
    items: [
      { id: 'mark', label: 'Mark in / out (rec)', combo: '[ / ]' },
      { id: 'frame-step', label: 'Frame step (rec)', combo: '← / →' },
      { id: 'jump-10', label: 'Jump ×10 (rec)', combo: '⇧ ← / →' },
      { id: 'jump-in-out', label: 'Jump to in / out (while a take is selected)', combo: '↑ / ↓' },
    ],
  },
]
