// Patch cable routing — purely structural connections, no config mutation
// Adapted from arc-case/case-03, port-based instead of busKey/configKey

import { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react'

const PatchRoutingContext = createContext(null)

export function PatchRoutingProvider({ initialConnections, children }) {
  const [pendingOutput, setPendingOutput] = useState(null)
  const [connections, setConnections] = useState(initialConnections || [])
  const connectionsRef = useRef([])
  const jackRefs = useRef({})
  const pendingRef = useRef(null)
  const dragActive = useRef(false)

  // Keep refs in sync with state
  useEffect(() => { pendingRef.current = pendingOutput }, [pendingOutput])
  useEffect(() => { connectionsRef.current = connections }, [connections])

  // ESC to cancel
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') { setPendingOutput(null); dragActive.current = false }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  // Global pointerup — find nearest input jack, create connection
  useEffect(() => {
    const handleUp = (e) => {
      if (!dragActive.current || !pendingRef.current) return
      dragActive.current = false

      let closest = null
      let closestDist = 24
      for (const [jackId, el] of Object.entries(jackRefs.current)) {
        if (!jackId.includes(':in:')) continue
        const rect = el.getBoundingClientRect()
        const cx = rect.left + rect.width / 2
        const cy = rect.top + rect.height / 2
        const dist = Math.sqrt((e.clientX - cx) ** 2 + (e.clientY - cy) ** 2)
        if (dist < closestDist) {
          closestDist = dist
          closest = jackId
        }
      }

      if (closest) {
        // Parse jack ID: {moduleId}:in:{port}
        const parts = closest.split(':in:')
        if (parts.length === 2) {
          const toModuleId = parts[0]
          const toPort = parts[1]
          const pending = pendingRef.current

          setConnections(conns => {
            // Toggle: if already connected to this input, disconnect
            const existing = conns.findIndex(
              c => c.toModuleId === toModuleId && c.toPort === toPort
            )
            if (existing >= 0) {
              return conns.filter((_, i) => i !== existing)
            }
            return [...conns, {
              fromModuleId: pending.moduleId,
              fromPort: pending.port,
              toModuleId,
              toPort,
            }]
          })
        }
      }
      setPendingOutput(null)
    }
    window.addEventListener('pointerup', handleUp)
    return () => window.removeEventListener('pointerup', handleUp)
  }, [])

  const registerJack = useCallback((id, element) => {
    if (element) {
      jackRefs.current[id] = element
      element.dataset.jackId = id
    } else {
      delete jackRefs.current[id]
    }
  }, [])

  const selectOutput = useCallback((moduleId, port) => {
    setPendingOutput({ moduleId, port })
    dragActive.current = true
  }, [])

  const removeConnection = useCallback((toModuleId, toPort) => {
    setConnections(prev => prev.filter(
      c => !(c.toModuleId === toModuleId && c.toPort === toPort)
    ))
  }, [])

  const loadPatch = useCallback((connections) => {
    setConnections(connections)
    setPendingOutput(null)
  }, [])

  const value = {
    pendingOutput,
    connections,
    connectionsRef,
    jackRefs,
    registerJack,
    selectOutput,
    removeConnection,
    loadPatch,
  }

  return (
    <PatchRoutingContext.Provider value={value}>
      {children}
    </PatchRoutingContext.Provider>
  )
}

export function usePatchRouting() {
  return useContext(PatchRoutingContext)
}
