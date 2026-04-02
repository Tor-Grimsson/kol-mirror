import { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react'

const PatchRoutingContext = createContext(null)

export function PatchRoutingProvider({ children }) {
  const [pendingOutput, setPendingOutput] = useState(null)
  const [connections, setConnections] = useState([])
  const jackRefs = useRef({})
  const inputCallbacks = useRef({})
  const pendingRef = useRef(null)
  const dragActive = useRef(false)

  // Keep ref in sync
  useEffect(() => { pendingRef.current = pendingOutput }, [pendingOutput])

  // ESC to cancel
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') { setPendingOutput(null); dragActive.current = false }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  // Global pointerup — only acts when drag is active
  useEffect(() => {
    const handleUp = (e) => {
      if (!dragActive.current || !pendingRef.current) return
      dragActive.current = false

      // Find nearest input jack within 24px
      let closest = null
      let closestDist = 14
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
        const cb = inputCallbacks.current[closest]
        if (cb) {
          const pending = pendingRef.current
          // Direct connection — don't go through setState callback
          setConnections(conns => {
            const existing = conns.findIndex(c => c.toModuleId === cb.moduleId && c.toConfigKey === cb.configKey)
            if (existing >= 0) {
              cb.onExprChange('')
              return conns.filter((_, i) => i !== existing)
            }
            cb.onExprChange(pending.busKey)
            return [...conns, { fromBusKey: pending.busKey, fromModuleId: pending.moduleId, toModuleId: cb.moduleId, toConfigKey: cb.configKey }]
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

  const registerInputCallback = useCallback((jackId, moduleId, configKey, onExprChange) => {
    inputCallbacks.current[jackId] = { moduleId, configKey, onExprChange }
    return () => { delete inputCallbacks.current[jackId] }
  }, [])

  const selectOutput = useCallback((busKey, moduleId) => {
    setPendingOutput({ busKey, moduleId })
    dragActive.current = true
  }, [])

  const selectInput = useCallback((moduleId, configKey, onExprChange) => {
    // Fallback for click-based connection
    const pending = pendingRef.current
    if (!pending) return
    setConnections(conns => {
      const existing = conns.findIndex(c => c.toModuleId === moduleId && c.toConfigKey === configKey)
      if (existing >= 0) {
        onExprChange('')
        return conns.filter((_, i) => i !== existing)
      }
      onExprChange(pending.busKey)
      return [...conns, { fromBusKey: pending.busKey, fromModuleId: pending.moduleId, toModuleId: moduleId, toConfigKey: configKey }]
    })
    setPendingOutput(null)
    dragActive.current = false
  }, [])

  const removeConnection = useCallback((fromBusKey, toModuleId, toConfigKey, onExprChange) => {
    onExprChange?.('')
    setConnections(prev => prev.filter(c => {
      if (c.toModuleId !== toModuleId || c.toConfigKey !== toConfigKey) return true
      if (fromBusKey && c.fromBusKey !== fromBusKey) return true
      return false
    }))
  }, [])

  const value = { pendingOutput, connections, jackRefs, registerJack, registerInputCallback, selectOutput, selectInput, removeConnection }

  return (
    <PatchRoutingContext.Provider value={value}>
      {children}
    </PatchRoutingContext.Provider>
  )
}

export function usePatchRouting() {
  return useContext(PatchRoutingContext)
}
