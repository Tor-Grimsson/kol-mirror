// ModuloSidebar — tabbed: Case, Presets, Modules

import { useState } from 'react'
import { CATEGORIES, getModulesByCategory } from './moduleRegistry'
import { patches } from './patches'

const TABS = ['Presets', 'Case', 'Modules']

const CATEGORY_LABELS = {
  control: 'Control',
  math: 'Math',
  generators: 'Generators',
  display: 'Display',
  utility: 'Utility',
}

const labelStyle = { fontSize: '10px', fontFamily: 'var(--kol-font-mono)', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', marginBottom: 8 }
const rowStyle = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  height: 22, paddingLeft: 8, fontSize: '10px', fontFamily: 'var(--kol-font-mono)',
  color: 'rgba(255,255,255,0.6)', cursor: 'pointer', borderRadius: 2,
}

function hoverBg(e) { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)' }
function clearBg(e) { e.currentTarget.style.backgroundColor = 'transparent' }

export default function ModuloSidebar({ rack, routing, onClose }) {
  const [tab, setTab] = useState('Presets')
  const [openCats, setOpenCats] = useState(() => new Set(CATEGORIES))

  const toggleCat = (cat) => {
    setOpenCats(prev => {
      const next = new Set(prev)
      next.has(cat) ? next.delete(cat) : next.add(cat)
      return next
    })
  }

  const findRowWithSpace = (hp, u) => {
    const targetHeight = u === 1 ? '1u' : '3u'
    for (const row of rack.rows) {
      if (row.height !== targetHeight) continue
      const used = row.modules.reduce((sum, m) => sum + m.hp, 0)
      if (used + hp <= 104) return row.id
    }
    return null
  }

  return (
    <div className="flex flex-col h-full w-full overflow-hidden" style={{ userSelect: 'none' }}>
      {/* Tab bar */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
        {TABS.map(t => (
          <div
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1, textAlign: 'center', padding: '8px 0',
              fontSize: '10px', fontFamily: 'var(--kol-font-mono)', textTransform: 'uppercase',
              color: tab === t ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.3)',
              borderBottom: tab === t ? '1px solid rgba(255,255,255,0.4)' : '1px solid transparent',
              cursor: 'pointer',
            }}
          >
            {t}
          </div>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>

        {/* CASE TAB */}
        {tab === 'Case' && (
          <>
            <div style={labelStyle}>Rows</div>
            {rack.rows.map((row, i) => (
              <div key={row.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                height: 24, fontSize: '10px', fontFamily: 'var(--kol-font-mono)', color: 'rgba(255,255,255,0.6)',
              }}>
                <span>Row {i + 1}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span
                    onClick={() => rack.setRowHeight(row.id, row.height === '1u' ? '3u' : '1u')}
                    style={{ cursor: 'pointer', color: 'rgba(255,255,255,0.5)' }}
                  >
                    [{row.height.toUpperCase()}]
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '9px' }}>
                    {row.modules.reduce((s, m) => s + m.hp, 0)}hp
                  </span>
                  {rack.rows.length > 1 && (
                    <span
                      onClick={() => rack.removeRow(row.id)}
                      style={{ cursor: 'pointer', color: 'rgba(255,255,255,0.25)', fontSize: '9px' }}
                    >x</span>
                  )}
                </div>
              </div>
            ))}
            <div
              onClick={() => rack.addRow('3u')}
              style={{ fontSize: '10px', fontFamily: 'var(--kol-font-mono)', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', marginTop: 4 }}
            >
              + add row
            </div>

          </>
        )}

        {/* PRESETS TAB */}
        {tab === 'Presets' && (
          <>
            <div style={labelStyle}>Patches</div>
            {Object.keys(patches).map(name => {
              const p = patches[name]
              const count = p.connections ? p.connections.length : 0
              return (
                <div
                  key={name}
                  onClick={() => {
                    if (p.rows) rack.loadPreset(p)
                    routing?.loadPatch(p.connections || [])
                  }}
                  style={rowStyle}
                  onMouseEnter={hoverBg}
                  onMouseLeave={clearBg}
                >
                  <span>{name}</span>
                  <span style={{ color: 'rgba(255,255,255,0.25)' }}>{count}</span>
                </div>
              )
            })}
          </>
        )}

        {/* MODULES TAB */}
        {tab === 'Modules' && (
          <>
            {CATEGORIES.map(cat => {
              const modules = getModulesByCategory(cat)
              const isOpen = openCats.has(cat)
              return (
                <div key={cat} style={{ marginBottom: 8 }}>
                  <div
                    onClick={() => toggleCat(cat)}
                    style={{
                      ...labelStyle, cursor: 'pointer', marginBottom: 4, userSelect: 'none',
                    }}
                  >
                    {isOpen ? '\u25BE' : '\u25B8'} {CATEGORY_LABELS[cat]}
                  </div>
                  {isOpen && modules.map(mod => (
                    <div
                      key={mod.type}
                      onClick={() => {
                        const rowId = findRowWithSpace(mod.hp, mod.u)
                        if (rowId) rack.addModule(mod.type, rowId)
                      }}
                      style={rowStyle}
                      onMouseEnter={hoverBg}
                      onMouseLeave={clearBg}
                    >
                      <span>{mod.label}</span>
                      <span style={{ color: 'rgba(255,255,255,0.25)' }}>{mod.u === 1 ? '1u' : '3u'} {mod.hp}hp</span>
                    </div>
                  ))}
                </div>
              )
            })}

            {/* Parked */}
            {rack.parked.length > 0 && (
              <>
                <div style={{ ...labelStyle, marginTop: 12 }}>Parked</div>
                {rack.parked.map(mod => (
                  <div key={mod.id} style={{ ...rowStyle, color: 'rgba(255,255,255,0.4)' }}>
                    <span
                      onClick={() => {
                        const rowId = rack.rows[rack.rows.length - 1]?.id
                        if (rowId) rack.unparkModule(mod.id, rowId)
                      }}
                      onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
                      style={{ cursor: 'pointer' }}
                    >
                      {mod.type}
                    </span>
                    <span
                      onClick={() => rack.deleteModule(mod.id)}
                      style={{ cursor: 'pointer', color: 'rgba(255,255,255,0.2)' }}
                    >x</span>
                  </div>
                ))}
              </>
            )}
          </>
        )}
      </div>

      {/* Always visible footer — edit mode toggle */}
      <div style={{
        flexShrink: 0, borderTop: '1px solid rgba(255,255,255,0.08)', padding: '8px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span
          onClick={() => rack.setEditMode(!rack.editMode)}
          style={{
            fontSize: '10px', fontFamily: 'var(--kol-font-mono)', cursor: 'pointer',
            color: rack.editMode ? '#e74c3c' : 'rgba(255,255,255,0.35)',
          }}
        >
          {rack.editMode ? 'Editing' : 'Locked'}
        </span>
        <span
          onClick={() => rack.setEditMode(!rack.editMode)}
          style={{
            fontSize: '10px', fontFamily: 'var(--kol-font-mono)', cursor: 'pointer',
            color: rack.editMode ? '#e74c3c' : 'rgba(255,255,255,0.35)',
          }}
        >
          [{rack.editMode ? 'ON' : 'OFF'}]
        </span>
      </div>
    </div>
  )
}
