import { useRef, useState, useCallback, useEffect } from 'react'
import { ModuleRegistryProvider, useModuleRegistry } from './hooks/useModuleRegistry.jsx'
import { PatchRoutingProvider, usePatchRouting } from './hooks/usePatchRouting.jsx'
import { useRenderLoop } from './hooks/useRenderLoop'
import { useRackState } from './hooks/useRackState'
import { MODULE_DEFS } from './moduleRegistry'
import { TOTAL_HP } from './modules/utility/eurorack'
import Case, { RackRow, HP } from './modules/utility/Case.jsx'
import PatchCableOverlay from './modules/utility/PatchCableOverlay.jsx'
import ModuloSidebar from './ModuloSidebar.jsx'
import { patches } from './patches.js'

function VideoModuloInner() {
  const { modulesRef } = useModuleRegistry()
  const { connectionsRef } = usePatchRouting()
  const rackRef = useRef(null)
  const rowRefs = useRef({})
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const rack = useRackState()

  const [dragging, _setDragging] = useState(null)
  const draggingRef = useRef(null)
  const setDragging = (v) => { draggingRef.current = typeof v === 'function' ? v(draggingRef.current) : v; _setDragging(v) }

  useRenderLoop(modulesRef, connectionsRef)

  // Drag: track pointer, calculate HP offset, commit on release
  const handleDragStart = useCallback((moduleId, rowId, hp, e) => {
    if (!rack.editMode) return
    e.preventDefault()
    const rowEl = rowRefs.current[rowId]
    if (!rowEl) return

    // Capture grab offset so module doesn't jump
    const modEl = e.currentTarget.parentElement
    const modRect = modEl.getBoundingClientRect()
    const grabX = e.clientX - modRect.left
    const grabY = e.clientY - modRect.top

    const startX = e.clientX
    const startY = e.clientY
    let started = false

    const handleMove = (e) => {
      if (!started) {
        const dx = e.clientX - startX
        const dy = e.clientY - startY
        if (dx * dx + dy * dy < 25) return  // 5px threshold
        started = true
        setDragging({ moduleId, rowId, hp, ghostOffset: null, pointerX: e.clientX, pointerY: e.clientY, overRow: rowId, grabX, grabY, width: modRect.width, height: modRect.height })
      }
      let overRow = null
      let ghostOffset = null
      for (const [rid, el] of Object.entries(rowRefs.current)) {
        const rect = el.getBoundingClientRect()
        if (e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) {
          overRow = rid
          const x = e.clientX - rect.left
          const hpPos = Math.round((x / rect.width) * TOTAL_HP - hp / 2)
          ghostOffset = Math.max(0, Math.min(TOTAL_HP - hp, hpPos))
          break
        }
      }
      setDragging(prev => prev ? { ...prev, ghostOffset, overRow, pointerX: e.clientX, pointerY: e.clientY } : null)
    }

    const handleUp = (e) => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)

      if (!started) { setDragging(null); return }

      let targetRowId = null
      for (const [rid, el] of Object.entries(rowRefs.current)) {
        const rect = el.getBoundingClientRect()
        if (e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) {
          targetRowId = rid
          break
        }
      }

      // Read drag state before clearing it
      const prev = draggingRef.current
      setDragging(null)
      if (!prev) return
      if (targetRowId && prev.ghostOffset !== null) {
        rack.moveModule(prev.moduleId, targetRowId, prev.ghostOffset)
      } else {
        rack.removeModule(prev.moduleId, e.clientX - prev.grabX, e.clientY - prev.grabY, prev.height)
      }
    }

    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)
  }, [rack])

  return (
    <div className="min-h-screen bg-surface-primary flex relative" style={{ overflow: 'hidden' }}>
      {sidebarOpen && (
        <div style={{
          width: 240,
          flexShrink: 0,
          height: '100vh',
          position: 'sticky',
          top: 0,
          borderRight: '1px solid rgba(255,255,255,0.08)',
          backgroundColor: 'var(--kol-bg-surface-primary, #0a0a0a)',
          overflowY: 'auto',
        }}>
          <ModuloSidebar rack={rack} routing={usePatchRouting()} onClose={() => setSidebarOpen(false)} />
        </div>
      )}

      <div ref={rackRef} className="flex-1 flex items-center justify-center relative" style={{ minHeight: '100vh' }}>
        <PatchCableOverlay containerRef={rackRef} />

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            position: 'fixed',
            top: 8,
            left: sidebarOpen ? 248 : 8,
            zIndex: 100,
            width: 28,
            height: 28,
            borderRadius: 4,
            border: '1px solid rgba(255,255,255,0.08)',
            backgroundColor: 'rgba(20,20,20,0.9)',
            color: 'rgba(255,255,255,0.5)',
            cursor: 'pointer',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'left 0.15s',
          }}
        >
          {sidebarOpen ? '\u2190' : '\u2261'}
        </button>

        <Case>
          {rack.rows.map(row => (
            <RackRow key={row.id} height={row.height}>
              <div
                ref={el => { if (el) rowRefs.current[row.id] = el }}
                style={{ display: 'flex', width: '100%', height: '100%', gap: 2, alignItems: 'flex-start' }}
              >
                {[...row.modules].sort((a, b) => a.offset - b.offset).map(mod => {
                  const def = MODULE_DEFS[mod.type]
                  if (!def) return null
                  const Comp = def.component
                  const isDragging = dragging?.moduleId === mod.id
                  const u = def.u || 3
                  const aspectDiv = u === 1 ? 12 : 4  // 1U = 12:1, 3U = 4:1
                  return (
                    <div
                      key={mod.id}
                      style={{
                        width: `${(mod.hp / TOTAL_HP) * 100}%`,
                        aspectRatio: `${mod.hp * aspectDiv} / ${TOTAL_HP}`,
                        flexShrink: 0,
                        overflow: 'hidden',
                        opacity: isDragging ? 0 : 1,
                        position: 'relative',
                      }}
                    >
                      {rack.editMode && (
                        <div
                          onPointerDown={(e) => handleDragStart(mod.id, row.id, mod.hp, e)}
                          style={{
                            position: 'absolute', top: 0, left: 0, right: 0, height: 12,
                            zIndex: 15, cursor: 'grab',
                          }}
                        />
                      )}
                      <Comp id={mod.id} init={mod.state} />
                    </div>
                  )
                })}

              </div>
            </RackRow>
          ))}
        </Case>

        {/* Dragged module follows pointer */}
        {dragging && (() => {
          const def = MODULE_DEFS[rack.rows.flatMap(r => r.modules).find(m => m.id === dragging.moduleId)?.type]
          if (!def) return null
          const Comp = def.component
          return (
            <div style={{
              position: 'fixed',
              left: dragging.pointerX - dragging.grabX,
              top: dragging.pointerY - dragging.grabY,
              width: dragging.width,
              height: dragging.height,
              zIndex: 200,
              pointerEvents: 'none',
              opacity: 0.85,
              boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
            }}>
              <Comp id={dragging.moduleId} />
            </div>
          )
        })()}

        {/* Parked modules — floating at drop coordinates */}
        {rack.parked.map(mod => {
          const def = MODULE_DEFS[mod.type]
          if (!def) return null
          const Comp = def.component
          // Width based on HP relative to case (approximate: 1HP ≈ 13.5px at 1400px case)
          // Get row dimensions for sizing reference
          const anyRow = Object.values(rowRefs.current)[0]
          const rowRect = anyRow?.getBoundingClientRect()
          const rowW = rowRect?.width || 1300
          const rowH = rowRect?.height || 300
          const modW = (mod.hp / TOTAL_HP) * rowW
          const modH = mod.parkedHeight || rowH
          return (
            <div
              key={mod.id}
              style={{
                position: 'fixed',
                left: mod.x,
                top: mod.y,
                width: modW,
                height: modH,
                opacity: 0.5,
                zIndex: 50,
                pointerEvents: rack.editMode ? 'auto' : 'none',
                cursor: rack.editMode ? 'grab' : 'default',
              }}
              onPointerDown={rack.editMode ? (e) => {
                e.preventDefault()
                const startX = e.clientX - mod.x
                const startY = e.clientY - mod.y

                const handleMove = (e) => {
                  rack.moveParked(mod.id, e.clientX - startX, e.clientY - startY)
                }

                const handleUp = (e) => {
                  window.removeEventListener('pointermove', handleMove)
                  window.removeEventListener('pointerup', handleUp)

                  // Check if dropped on a rack row — unpark into it
                  for (const [rid, el] of Object.entries(rowRefs.current)) {
                    const rect = el.getBoundingClientRect()
                    if (e.clientY >= rect.top && e.clientY <= rect.bottom) {
                      const x = e.clientX - rect.left
                      const hpPos = Math.round((x / rect.width) * TOTAL_HP - mod.hp / 2)
                      const clamped = Math.max(0, Math.min(TOTAL_HP - mod.hp, hpPos))
                      rack.unparkModule(mod.id, rid, clamped)
                      return
                    }
                  }
                }

                window.addEventListener('pointermove', handleMove)
                window.addEventListener('pointerup', handleUp)
              } : undefined}
            >
              <Comp id={mod.id} />
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function VideoModulo() {
  return (
    <ModuleRegistryProvider>
      <PatchRoutingProvider initialConnections={patches.ref}>
        <VideoModuloInner />
      </PatchRoutingProvider>
    </ModuleRegistryProvider>
  )
}
