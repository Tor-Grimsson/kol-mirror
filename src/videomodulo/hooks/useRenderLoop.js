// Centralized render loop — single RAF, topological sort, module evaluation

import { useRef, useEffect, useCallback } from 'react'

// Kahn's algorithm — returns sorted IDs and a set of cycle-delayed IDs
function topoSort(modulesMap, connections) {
  const ids = [...modulesMap.keys()]
  const inDegree = new Map(ids.map(id => [id, 0]))
  const adjacency = new Map(ids.map(id => [id, []]))

  for (const conn of connections) {
    if (!modulesMap.has(conn.fromModuleId) || !modulesMap.has(conn.toModuleId)) continue
    adjacency.get(conn.fromModuleId).push(conn.toModuleId)
    inDegree.set(conn.toModuleId, (inDegree.get(conn.toModuleId) || 0) + 1)
  }

  const queue = []
  for (const [id, deg] of inDegree) {
    if (deg === 0) queue.push(id)
  }

  const sorted = []
  while (queue.length > 0) {
    const id = queue.shift()
    sorted.push(id)
    for (const downstream of adjacency.get(id)) {
      const newDeg = inDegree.get(downstream) - 1
      inDegree.set(downstream, newDeg)
      if (newDeg === 0) queue.push(downstream)
    }
  }

  // Modules not in sorted list are in cycles — use 1-frame delay
  const delayed = new Set()
  if (sorted.length < ids.length) {
    for (const id of ids) {
      if (!sorted.includes(id)) {
        sorted.push(id)
        delayed.add(id)
      }
    }
  }

  return { sorted, delayed }
}

export function useRenderLoop(modulesRef, connectionsRef) {
  const rafRef = useRef(null)
  const outputsRef = useRef(new Map())
  const prevOutputsRef = useRef(new Map())
  const startTimeRef = useRef(0)
  const lastFrameRef = useRef(0)
  const timingRef = useRef({ evalMs: 0, frameCount: 0 })

  // Sort cache
  const sortCacheRef = useRef(null)
  const cachedModuleCount = useRef(0)
  const cachedConnections = useRef(null)

  const tick = useCallback((now) => {
    if (!startTimeRef.current) startTimeRef.current = now
    const t = (now - startTimeRef.current) / 1000
    const dt = lastFrameRef.current ? (now - lastFrameRef.current) / 1000 : 1 / 60
    lastFrameRef.current = now

    const modules = modulesRef.current
    const connections = connectionsRef.current

    // Invalidate sort cache if graph changed
    if (
      modules.size !== cachedModuleCount.current ||
      connections !== cachedConnections.current
    ) {
      sortCacheRef.current = topoSort(modules, connections)
      cachedModuleCount.current = modules.size
      cachedConnections.current = connections
    }

    const { sorted, delayed } = sortCacheRef.current

    // Evaluate modules in sorted order
    const evalStart = performance.now()

    for (const id of sorted) {
      const mod = modules.get(id)
      if (!mod) continue

      // Gather inputs from connected upstream outputs
      const inputs = {}
      for (const portName of Object.keys(mod.inputs)) {
        inputs[portName] = null
      }

      for (const conn of connections) {
        if (conn.toModuleId !== id) continue
        // Use previous frame's output for delayed (cycled) modules that haven't run yet
        const source = delayed.has(conn.fromModuleId) && !outputsRef.current.has(conn.fromModuleId)
          ? prevOutputsRef.current.get(conn.fromModuleId)
          : outputsRef.current.get(conn.fromModuleId)

        if (source && conn.toPort in inputs) {
          inputs[conn.toPort] = source[conn.fromPort] || null
        }
      }

      // Call process and store outputs
      const result = mod.process(inputs, dt, t)
      if (result) {
        outputsRef.current.set(id, result)
      }
    }

    const evalMs = performance.now() - evalStart
    timingRef.current.evalMs = evalMs
    timingRef.current.frameCount++
    if (timingRef.current.frameCount % 60 === 0) {
      console.debug(`[VM] eval: ${evalMs.toFixed(2)}ms (${sorted.length} modules)`)
    }

    // Swap: current becomes previous for next frame's cycle lookups
    prevOutputsRef.current = new Map(outputsRef.current)

    rafRef.current = requestAnimationFrame(tick)
  }, [modulesRef, connectionsRef])

  useEffect(() => {
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [tick])

  return { outputsRef, timingRef }
}
