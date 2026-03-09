/**
 * Icons Index
 *
 * Export Icon component and icon registry
 * Usage: <Icon name="arrow-up" size={16} />
 */

export { default as Icon } from './Icon.jsx'

// Icon Registry - Complete list of all 221 icons
export const ICONS = {
  // Navigation (22)
  navigation: [
    'arrow-down',
    'arrow-up',
    'arrow-left',
    'arrow-right',
    'arrow-expand',
    'arrow-downright',
    'arrow-cross',
    'chevron-down',
    'chevron-left',
    'chevron-right',
    'chevron-up',
    'caret-down',
    'caret-left',
    'caret-right',
    'caret-up',
    'external-link',
    'menu',
    'x',
    'control-arrow-back',
    'control-arrow-end',
    'control-arrow-forward',
    'control-arrow-start',
  ],

  // Actions & Controls (27)
  actions: [
    'check',
    'copy',
    'cross',
    'download',
    'edit',
    'filter',
    'maximize',
    'minimize',
    'minus',
    'move',
    'plus',
    'redo',
    'refresh',
    'rotate',
    'rotate-left',
    'rotate-right',
    'save',
    'search',
    'settings-01',
    'settings-02',
    'share',
    'snap',
    'trash',
    'undo',
    'upload',
    'zoom-in',
    'zoom-out',
  ],

  // Files & Documents (16)
  files: [
    'add-file',
    'attachment',
    'book-open',
    'bookmark',
    'clipboard-1',
    'clipboard-2',
    'file',
    'file-image',
    'file-text',
    'file-video',
    'folder-01',
    'folder-02',
    'folder-open',
    'journal',
    'manual-empty',
    'page',
  ],

  // Communication (9)
  communication: [
    'alarm-bell',
    'dual-opponent',
    'in-going',
    'interactive',
    'mail',
    'message-circle',
    'message-square',
    'phone',
    'send',
  ],

  // User & Authentication (16)
  user: [
    'flag',
    'heart-1',
    'heart-2',
    'key',
    'lock',
    'log-in',
    'log-out',
    'shield',
    'social-facebook',
    'social-linkedin',
    'social-twitter',
    'star',
    'unlock',
    'user',
    'user-plus',
    'users',
  ],

  // Status & Feedback (9)
  status: [
    'alert-circle',
    'alert-triangle',
    'check-circle',
    'eye-off',
    'eye-on',
    'help-circle',
    'info',
    'loader',
    'x-circle',
  ],

  // Media (21)
  media: [
    'camera',
    'camera-off',
    'control-pause',
    'control-play',
    'fast-forward',
    'image',
    'mic',
    'mic-off',
    'repeat',
    'repeat-1',
    'rewind',
    'shuffle',
    'skip-back',
    'skip-forward',
    'stop',
    'video',
    'video-off',
    'volume',
    'volume-1',
    'volume-2',
    'volume-x',
  ],

  // Time & Calendar (9)
  time: [
    'calendar',
    'calendar-check',
    'calendar-days',
    'clock',
    'clock-alert',
    'clock-rotate-left',
    'history',
    'stopwatch',
    'timer',
  ],

  // Layout & UI (21)
  layout: [
    'columns',
    'component',
    'grid-01',
    'grid-02',
    'grid-03',
    'grid-04',
    'grid-05',
    'grid-06',
    'layers',
    'layout',
    'layout-01',
    'layout-02',
    'layout-03',
    'list-01',
    'list-02',
    'more-horizontal',
    'more-vertical',
    'panel-left',
    'panel-right',
    'row',
    'sidebar',
  ],

  // Editing & Content (18)
  editing: [
    'align-center',
    'align-left',
    'align-right',
    'bold',
    'brush',
    'color',
    'flip-y',
    'italic',
    'list-ordered',
    'list-unordered',
    'pen',
    'pencil',
    'text-01',
    'text-02',
    'type-01',
    'type-02',
    'type-03',
    'underline',
  ],

  // System & Tools (15)
  system: [
    'atomic-atom',
    'atomic-lifeform',
    'atomic-molecule',
    'atomic-organism',
    'battery',
    'code',
    'database',
    'frequency',
    'library',
    'power',
    'roadmap',
    'server',
    'terminal',
    'wifi',
    'wifi-off',
  ],

  // Theme & Display (5)
  theme: [
    'contrast',
    'monitor',
    'moon',
    'sun',
    'theme-toggle',
  ],

  // E-commerce & Shopping (8)
  ecommerce: [
    'credit-card',
    'dollar-sign',
    'gift',
    'package',
    'receipt',
    'shopping-bag',
    'shopping-cart',
    'tag',
  ],

  // Stats & Data Visualization (15)
  stats: [
    'stat-abacus',
    'stat-chart-a',
    'stat-chart-b',
    'stat-chart-c',
    'stat-crown',
    'stat-cycle',
    'stat-donut',
    'stat-medalion',
    'stat-pie',
    'stat-pie-c',
    'stat-rocket',
    'stat-stat',
    'stat-winner',
    'trending-down',
    'trending-up',
  ],

  // Shapes & Geometric (6)
  shapes: [
    'circle',
    'cone',
    'diamond',
    'triangle',
    'wave',
    'wheel',
  ],

  // Miscellaneous (9)
  misc: [
    'align-auto',
    'bolt',
    'bucket',
    'foundation',
    'home-1',
    'home-2',
    'instance',
    'location',
    'pills',
  ],
}

// Flat array of all icon names
export const ALL_ICONS = Object.values(ICONS).flat()

// Helper to check if an icon exists
export const hasIcon = (name) => ALL_ICONS.includes(name)

// Get category for an icon
export const getCategory = (name) => {
  for (const [category, icons] of Object.entries(ICONS)) {
    if (icons.includes(name)) {
      return category
    }
  }
  return null
}
