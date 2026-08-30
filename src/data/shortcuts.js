/**
 * KEYBOARD_SHORTCUTS — the single source for both consumers: the overlay on
 * `S` (kol-shell's ShortcutsOverlay) and the Settings page list (kol-shell's
 * SettingsShortcuts). Sectioned since ShellHomeSystemAdoption (2026-08-27);
 * every label and combo is verbatim from the flat list this replaces.
 *
 * Both DS consumers read `combo` since kol-shell 0.9.0 — one array, no map.
 */
export const KEYBOARD_SHORTCUTS = [
  {
    section: 'Studio',
    items: [
      { id: 'shortcuts', label: 'Shortcuts', combo: 'S' },
      { id: 'palette', label: 'Search modules', combo: '⌘K' },
      { id: 'shelf', label: 'Module shelf', combo: 'E' },
      { id: 'play', label: 'Play / pause timeline', combo: 'Space' },
      { id: 'fps', label: 'Frame rate', combo: 'F' },
      { id: 'sidebar', label: 'Sidebar', combo: 'H' },
      { id: 'rail', label: 'Show / hide rail', combo: '\\' },
      { id: 'nav', label: 'Jump to rail item', combo: '⌥1–9' },
      { id: 'theme', label: 'Theme light / dark', combo: 'T' },
      { id: 'mixer', label: 'Mixer show / hide', combo: 'M' },
      { id: 'reload', label: 'Reload randomizer', combo: 'R' },
      { id: 'flip-channel', label: 'Flip channel to patch bay', combo: '1–3' },
      { id: 'flip-desk', label: 'Flip whole desk', combo: 'P' },
      { id: 'undo', label: 'Undo / redo', combo: '⌘Z / ⌘⇧Z' },
    ],
  },
  {
    /* The desk's canvas — pan, zoom and the lock (2026-08-28). Space is the
       transport's everywhere EXCEPT over the desk, where it grabs the surface;
       the desk takes it in the capture phase so a grab cannot start the clock. */
    section: 'Desk canvas',
    items: [
      { id: 'pan-space', label: 'Grab and pan the desk', combo: 'Space + drag' },
      { id: 'pan-mouse', label: 'Pan the desk', combo: 'Middle-drag / ⌥ drag' },
      { id: 'zoom', label: 'Zoom to cursor', combo: '⌥ scroll' },
      { id: 'zoom-reset', label: 'Reset pan and zoom', combo: '⌥0' },
      { id: 'view-lock', label: 'Lock the view', combo: 'L' },
      { id: 'dot-grid', label: 'Dot grid', combo: 'G' },
    ],
  },
  {
    section: 'Recording',
    items: [
      { id: 'mark', label: 'Mark in / out (rec)', combo: 'I / O' },
      { id: 'frame-step', label: 'Frame step (rec)', combo: '← / →' },
      { id: 'jump-10', label: 'Jump ×10 (rec)', combo: '⇧ ← / →' },
      { id: 'jump-in-out', label: 'Jump to in / out (rec)', combo: '↑ / ↓' },
    ],
  },
]
