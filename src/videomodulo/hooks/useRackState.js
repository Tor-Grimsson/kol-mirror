// Rack state — manages rows, modules with HP offsets, parked modules, edit mode

import { useState, useCallback } from 'react'
import { MODULE_DEFS } from '../moduleRegistry'
import { TOTAL_HP } from '../modules/utility/eurorack'

let nextId = 1
function uid(type) { return `${type}_${nextId++}` }

// Pack modules left-to-right, calculating offsets
function packModules(modules) {
  let offset = 0
  return modules.map(m => {
    const mod = { ...m, offset }
    offset += m.hp
    return mod
  })
}

const DEFAULT_ROWS = [
  {
    id: 'row1', height: '1u', modules: packModules([
      { type: 'mult', id: 'mult1', hp: 8 },
      { type: 'noise', id: 'noise1', hp: 8 },
      { type: 'attenuator', id: 'atten1', hp: 8 },
      { type: 'vca', id: 'vca1', hp: 8 },
    ]),
  },
  {
    id: 'row2', height: '3u', modules: packModules([
      { type: 'patch', id: 'patch1', hp: 6 },
      { type: 'clock', id: 'clk1', hp: 4 },
      { type: 'clockDiv', id: 'div1', hp: 4 },
      { type: 'lfo', id: 'lfo1', hp: 6 },
      { type: 'envelope', id: 'env1', hp: 6 },
      { type: 'sequencer', id: 'seq1', hp: 12 },
      { type: 'sampleHold', id: 'sh1', hp: 6 },
      { type: 'logic', id: 'logic1', hp: 4 },
      { type: 'comparator', id: 'comp1', hp: 4 },
      { type: 'constant', id: 'const1', hp: 4 },
      { type: 'pen', id: 'pen1', hp: 6 },
      { type: 'switch', id: 'sw1', hp: 4 },
      { type: 'quantizer', id: 'quant1', hp: 4 },
      { type: 'scaleOfs', id: 'scl1', hp: 4 },
      { type: 'maths', id: 'maths1', hp: 8 },
      { type: 'mixer', id: 'mix1', hp: 8 },
    ]),
  },
  {
    id: 'row3', height: '3u', modules: packModules([
      { type: 'waveform', id: 'wave1', hp: 6 },
      { type: 'rgb', id: 'rgb1', hp: 8 },
      { type: 'wireframe', id: 'wire1', hp: 8 },
      { type: 'ramp', id: 'ramp1', hp: 6 },
      { type: 'smx3', id: 'smx1', hp: 12 },
      { type: 'lineGen', id: 'line1', hp: 8 },
      { type: 'ringMod', id: 'ring1', hp: 6 },
      { type: 'waveshaper', id: 'wshp1', hp: 6 },
      { type: 'delay', id: 'delay1', hp: 6 },
      { type: 'reverb', id: 'verb1', hp: 6 },
      { type: 'monitor', id: 'mon1', hp: 12 },
      { type: 'output', id: 'out1', hp: 16 },
    ]),
  },
]

let rowCounter = 4

// Find first gap in a row that fits the given HP width
function findFreeOffset(modules, hp) {
  const sorted = [...modules].sort((a, b) => a.offset - b.offset)
  let pos = 0
  for (const m of sorted) {
    if (pos + hp <= m.offset) return pos
    pos = m.offset + m.hp
  }
  return pos + hp <= TOTAL_HP ? pos : null
}

// Check if placing a module at offset overlaps any existing module
function hasOverlap(modules, offset, hp, excludeId) {
  const end = offset + hp
  return modules.some(m => {
    if (m.id === excludeId) return false
    return offset < m.offset + m.hp && end > m.offset
  })
}

export function useRackState() {
  const [rows, setRows] = useState(DEFAULT_ROWS)
  const [parked, setParked] = useState([])
  const [editMode, setEditMode] = useState(false)

  const addModule = useCallback((type, rowId) => {
    const def = MODULE_DEFS[type]
    if (!def) return
    setRows(prev => prev.map(row => {
      if (row.id !== rowId) return row
      const offset = findFreeOffset(row.modules, def.hp)
      if (offset === null) return row
      const mod = { type, id: uid(type), hp: def.hp, offset }
      return { ...row, modules: [...row.modules, mod] }
    }))
  }, [])

  // Park a module at specific page coordinates with rendered height
  const removeModule = useCallback((moduleId, x = 100, y = 100, parkedHeight = 300) => {
    // Find the module first from current rows
    let found = null
    for (const row of rows) {
      const mod = row.modules.find(m => m.id === moduleId)
      if (mod) { found = mod; break }
    }
    if (!found) return
    setRows(prev => prev.map(row => ({
      ...row,
      modules: row.modules.filter(m => m.id !== moduleId),
    })))
    setParked(prev => [...prev, { ...found, x, y, parkedHeight }])
  }, [rows])

  const unparkModule = useCallback((moduleId, rowId, targetOffset) => {
    setParked(prev => {
      const mod = prev.find(m => m.id === moduleId)
      if (!mod) return prev
      setRows(r => r.map(row => {
        if (row.id !== rowId) return row
        const offset = targetOffset != null ? targetOffset : findFreeOffset(row.modules, mod.hp)
        if (offset === null) return row
        if (hasOverlap(row.modules, offset, mod.hp, mod.id)) return row
        return { ...row, modules: [...row.modules, { ...mod, offset, x: undefined, y: undefined }] }
      }))
      return prev.filter(m => m.id !== moduleId)
    })
  }, [])

  const deleteModule = useCallback((moduleId) => {
    setParked(prev => prev.filter(m => m.id !== moduleId))
  }, [])

  const moveParked = useCallback((moduleId, x, y) => {
    setParked(prev => prev.map(m => m.id === moduleId ? { ...m, x, y } : m))
  }, [])

  // Move module to a specific HP offset in a target row
  const moveModule = useCallback((moduleId, targetRowId, targetOffset) => {
    setRows(prev => {
      let mod = null
      const without = prev.map(row => {
        const m = row.modules.find(m => m.id === moduleId)
        if (!m) return row
        mod = m
        return { ...row, modules: row.modules.filter(m => m.id !== moduleId) }
      })
      if (!mod) return prev
      const clamped = Math.max(0, Math.min(TOTAL_HP - mod.hp, targetOffset))
      return without.map(row => {
        if (row.id !== targetRowId) return row
        if (hasOverlap(row.modules, clamped, mod.hp, mod.id)) return row
        return { ...row, modules: [...row.modules, { ...mod, offset: clamped }] }
      })
    })
  }, [])

  const addRow = useCallback((height = '3u') => {
    const id = `row${rowCounter++}`
    setRows(prev => [...prev, { id, height, modules: [] }])
  }, [])

  const removeRow = useCallback((rowId) => {
    setRows(prev => {
      const row = prev.find(r => r.id === rowId)
      if (row && row.modules.length > 0) {
        setParked(p => [...p, ...row.modules])
      }
      return prev.filter(r => r.id !== rowId)
    })
  }, [])

  const setRowHeight = useCallback((rowId, height) => {
    setRows(prev => prev.map(row =>
      row.id === rowId ? { ...row, height } : row
    ))
  }, [])

  // Load a preset: keeps existing rows, replaces modules within them
  const loadPreset = useCallback((preset) => {
    if (!preset || !preset.rows) return
    // Collect all preset modules, assign HP from registry
    const allMods = preset.rows.flatMap(r => r.modules.map(m => {
      const def = MODULE_DEFS[m.type]
      return { type: m.type, id: m.id, hp: def?.hp || 4, u: def?.u || 3, state: m.state }
    }))
    // Distribute into existing rows: 1U modules into 1U rows, 3U into 3U rows
    setRows(prev => {
      const rows1u = prev.filter(r => r.height === '1u')
      const rows3u = prev.filter(r => r.height === '3u')
      const mods1u = allMods.filter(m => m.u === 1)
      const mods3u = allMods.filter(m => m.u === 3)
      // Clear all rows then fill
      const cleared = prev.map(r => ({ ...r, modules: [] }))
      // Pack 1U modules into 1U rows
      let r1i = 0
      for (const mod of mods1u) {
        const row = cleared.find(r => r.height === '1u' && r.modules.reduce((s, m) => s + m.hp, 0) + mod.hp <= TOTAL_HP)
        if (row) {
          const offset = row.modules.reduce((s, m) => s + m.hp, 0)
          row.modules.push({ ...mod, offset })
        }
      }
      // Pack 3U modules into 3U rows
      for (const mod of mods3u) {
        const row = cleared.find(r => r.height === '3u' && r.modules.reduce((s, m) => s + m.hp, 0) + mod.hp <= TOTAL_HP)
        if (row) {
          const offset = row.modules.reduce((s, m) => s + m.hp, 0)
          row.modules.push({ ...mod, offset })
        }
      }
      return cleared
    })
    setParked([])
  }, [])

  return {
    rows,
    parked,
    editMode,
    setEditMode,
    loadPreset,
    addModule,
    removeModule,
    unparkModule,
    deleteModule,
    moveModule,
    moveParked,
    addRow,
    removeRow,
    setRowHeight,
  }
}
