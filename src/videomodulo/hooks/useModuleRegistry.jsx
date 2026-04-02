// Module registration context — ref-based Map, no React re-renders

import { createContext, useContext, useRef, useEffect, useMemo } from 'react'

const ModuleRegistryContext = createContext(null)

export function ModuleRegistryProvider({ children }) {
  const modulesRef = useRef(new Map())

  const value = useMemo(() => ({
    modulesRef,
    register(descriptor) {
      modulesRef.current.set(descriptor.id, descriptor)
    },
    unregister(id) {
      modulesRef.current.delete(id)
    },
    updateProcess(id, fn) {
      const desc = modulesRef.current.get(id)
      if (desc) desc.process = fn
    },
  }), [])

  return (
    <ModuleRegistryContext.Provider value={value}>
      {children}
    </ModuleRegistryContext.Provider>
  )
}

export function useModuleRegistry() {
  return useContext(ModuleRegistryContext)
}

// Convenience hook for modules — register on mount, unregister on unmount
export function useModule({ id, inputs, outputs, process }) {
  const registry = useModuleRegistry()
  const processRef = useRef(process)
  processRef.current = process

  useEffect(() => {
    const descriptor = {
      id,
      inputs,
      outputs,
      process: (...args) => processRef.current(...args),
    }
    registry.register(descriptor)
    return () => registry.unregister(id)
  }, [id, registry])
}
