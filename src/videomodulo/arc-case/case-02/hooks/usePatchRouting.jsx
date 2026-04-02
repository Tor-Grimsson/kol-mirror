import { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react'

const PatchRoutingContext = createContext(null)

export function PatchRoutingProvider({ children }) {
  const [pendingOutput, setPendingOutput] = useState(null) // { busKey, moduleId }
  const [connections, setConnections] = useState([])        // [{ fromBusKey, fromModuleId, toModuleId, toConfigKey }]
  const jackRefs = useRef({})                               // "moduleId:out:busKey" or "moduleId:in:configKey" → element

  // ESC to cancel pending cable
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') setPendingOutput(null)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  const registerJack = useCallback((id, element) => {
    if (element) jackRefs.current[id] = element
    else delete jackRefs.current[id]
  }, [])

  const selectOutput = useCallback((busKey, moduleId) => {
    setPendingOutput(prev => {
      if (prev && prev.busKey === busKey && prev.moduleId === moduleId) return null
      return { busKey, moduleId }
    })
  }, [])

  const selectInput = useCallback((moduleId, configKey, onExprChange) => {
    setPendingOutput(prev => {
      if (!prev) return prev
      // Check if already connected — toggle off
      setConnections(conns => {
        const existing = conns.findIndex(c => c.toModuleId === moduleId && c.toConfigKey === configKey)
        if (existing >= 0) {
          onExprChange('')
          return conns.filter((_, i) => i !== existing)
        }
        // Create connection
        onExprChange(prev.busKey)
        return [...conns, { fromBusKey: prev.busKey, fromModuleId: prev.moduleId, toModuleId: moduleId, toConfigKey: configKey }]
      })
      return null
    })
  }, [])

  const removeConnection = useCallback((fromBusKey, toModuleId, toConfigKey, onExprChange) => {
    onExprChange?.('')
    setConnections(prev => prev.filter(c => !(c.fromBusKey === fromBusKey && c.toModuleId === toModuleId && c.toConfigKey === toConfigKey)))
  }, [])

  const value = { pendingOutput, connections, jackRefs, registerJack, selectOutput, selectInput, removeConnection }

  return (
    <PatchRoutingContext.Provider value={value}>
      {children}
    </PatchRoutingContext.Provider>
  )
}

export function usePatchRouting() {
  return useContext(PatchRoutingContext)
}
