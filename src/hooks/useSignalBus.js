import { useRef, useCallback } from 'react'

const INITIAL = { lfo1: 0, lfo2: 0, seq1: 0, gate1: 0, env1: 0, sh1: 0, mult1_a: 0, mult1_b: 0, mult1_c: 0 }

export default function useSignalBus() {
  const busRef = useRef({ ...INITIAL })

  const publish = useCallback((key, value) => {
    busRef.current[key] = value
  }, [])

  const reset = useCallback(() => {
    Object.assign(busRef.current, INITIAL)
  }, [])

  return { busRef, publish, reset }
}
