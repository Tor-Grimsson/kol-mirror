import { useRef, useCallback } from 'react'

export default function useSignalBus() {
  const busRef = useRef({})
  const keysRef = useRef(new Set())

  const publish = useCallback((key, value) => {
    busRef.current[key] = value
  }, [])

  const register = useCallback((key) => {
    keysRef.current.add(key)
    if (!(key in busRef.current)) busRef.current[key] = 0
  }, [])

  const unregister = useCallback((key) => {
    keysRef.current.delete(key)
    delete busRef.current[key]
  }, [])

  const getKeys = useCallback(() => [...keysRef.current], [])

  const reset = useCallback(() => {
    for (const key of keysRef.current) busRef.current[key] = 0
  }, [])

  return { busRef, publish, register, unregister, getKeys, reset }
}
