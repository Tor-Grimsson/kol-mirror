import { useEffect, useRef, useCallback } from 'react'
import * as THREE from 'three'
import RotaryDial from './RotaryDial'
import ModuleIO from './ModuleIO'
import JackSocket from './JackSocket'

const GEOMETRIES = ['ico', 'box', 'tor', 'oct', 'sph', 'cyl']
const GEO_LABELS = { ico: 'ICO', box: 'BOX', tor: 'TOR', oct: 'OCT', sph: 'SPH', cyl: 'CYL' }
const RENDER_MODES = ['wire', 'solid', 'point']
const RMODE_LABELS = { wire: 'WIRE', solid: 'SOLID', point: 'POINT' }
const W = 252, H = 200

function createGeometry(type, radius, detail) {
  const d = Math.max(0, Math.min(4, detail))
  switch (type) {
    case 'ico': return new THREE.IcosahedronGeometry(radius, d)
    case 'box': return new THREE.BoxGeometry(radius * 1.6, radius * 1.6, radius * 1.6, d + 1, d + 1, d + 1)
    case 'tor': return new THREE.TorusGeometry(radius, radius * 0.35, 8 * (d + 1), 6 * (d + 1))
    case 'oct': return new THREE.OctahedronGeometry(radius, d)
    case 'sph': return new THREE.SphereGeometry(radius, 8 * (d + 1), 6 * (d + 1))
    case 'cyl': return new THREE.CylinderGeometry(radius, radius, radius * 2, 8 * (d + 1))
    default: return new THREE.IcosahedronGeometry(radius, d)
  }
}

export default function Geometry3DModule({ id = 'geo1', label = 'GEO 3D', config, onChange, busRef }) {
  const {
    geometry = 'ico', renderMode = 'wire', detail = 1,
    rotateX = 1, rotateY = 0.5, rotateZ = 0,
    scale = 50, color = '#ffffff', bgColor = '#111111',
    enabled = false,
  } = config || {}

  const canvasRef = useRef(null)
  const threeRef = useRef(null) // { renderer, scene, camera, mesh }
  const rafRef = useRef(null)
  const valRef = useRef(null)
  const rotRef = useRef({ x: 0, y: 0, z: 0 })

  // Init Three.js
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || threeRef.current) return

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
    renderer.setSize(W, H)
    renderer.setPixelRatio(1)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100)
    camera.position.z = 4

    threeRef.current = { renderer, scene, camera, mesh: null }

    return () => {
      renderer.dispose()
      threeRef.current = null
    }
  }, [])

  // Update geometry/material when params change
  useEffect(() => {
    const t = threeRef.current
    if (!t) return

    // Remove old mesh
    if (t.mesh) {
      t.mesh.geometry.dispose()
      t.mesh.material.dispose()
      t.scene.remove(t.mesh)
    }

    const radius = (scale / 100) * 1.5 + 0.3
    const geo = createGeometry(geometry, radius, detail)

    let mesh
    if (renderMode === 'point') {
      const mat = new THREE.PointsMaterial({ color, size: 0.05 })
      mesh = new THREE.Points(geo, mat)
    } else {
      const mat = new THREE.MeshBasicMaterial({
        color,
        wireframe: renderMode === 'wire',
      })
      mesh = new THREE.Mesh(geo, mat)
    }

    t.scene.add(mesh)
    t.mesh = mesh
  }, [geometry, renderMode, detail, scale, color])

  // Update background
  useEffect(() => {
    const t = threeRef.current
    if (!t) return
    t.renderer.setClearColor(bgColor)
  }, [bgColor])

  // Animation loop
  useEffect(() => {
    if (!enabled) {
      if (busRef?.current) { busRef.current[`${id}_phase`] = 0; busRef.current[id] = 0 }
      if (valRef.current) valRef.current.textContent = '—'
      // Clear canvas
      const t = threeRef.current
      if (t) {
        t.renderer.setClearColor(bgColor)
        t.renderer.clear()
      }
      return
    }

    if (busRef?.current) {
      if (!(id in busRef.current)) busRef.current[id] = 0
      if (!(`${id}_phase` in busRef.current)) busRef.current[`${id}_phase`] = 0
    }

    const tick = () => {
      const t = threeRef.current
      if (!t || !t.mesh) { rafRef.current = requestAnimationFrame(tick); return }

      rotRef.current.x += rotateX * 0.01
      rotRef.current.y += rotateY * 0.01
      rotRef.current.z += rotateZ * 0.01

      t.mesh.rotation.x = rotRef.current.x
      t.mesh.rotation.y = rotRef.current.y
      t.mesh.rotation.z = rotRef.current.z

      t.renderer.render(t.scene, t.camera)

      // Signal outputs
      const phase = ((rotRef.current.y % (Math.PI * 2)) / (Math.PI * 2) * 100 + 100) % 100
      if (busRef?.current) {
        busRef.current[`${id}_phase`] = Math.round(phase)
        busRef.current[id] = 100
      }

      if (valRef.current) valRef.current.textContent = Math.round(phase)

      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [enabled, rotateX, rotateY, rotateZ, id, busRef, bgColor])

  const update = useCallback((key, val) => onChange?.({ ...config, [key]: val }), [config, onChange])

  // Geometry selector
  const geoIdx = GEOMETRIES.indexOf(geometry)
  const cycleGeo = (dir) => {
    const next = (geoIdx + dir + GEOMETRIES.length) % GEOMETRIES.length
    update('geometry', GEOMETRIES[next])
  }

  // Render mode selector
  const rmIdx = RENDER_MODES.indexOf(renderMode)
  const cycleRM = (dir) => {
    const next = (rmIdx + dir + RENDER_MODES.length) % RENDER_MODES.length
    update('renderMode', RENDER_MODES[next])
  }

  return (
    <div className="flex flex-col h-full border-r border-fg-08">
      {/* Header -- 20px */}
      <div className="flex items-center justify-between px-2 border-b border-fg-08 shrink-0" style={{ height: '20px', fontFamily: 'monospace', fontSize: '9px' }}>
        <span className="flex items-center gap-1.5">
          <span className="cursor-pointer select-none" onClick={() => update('enabled', !enabled)}>
            <div className={`rounded-full ${enabled ? 'bg-[#e74c3c]' : 'bg-fg-24'}`} style={{ width: '6px', height: '6px' }} />
          </span>
          <span className="text-fg-96">{label}</span>
        </span>
        <span ref={valRef} className="text-fg-32" style={{ fontVariantNumeric: 'tabular-nums' }}>
          {enabled ? '0' : '—'}
        </span>
      </div>

      {/* Three.js canvas */}
      <div style={{ width: '100%', flexShrink: 0, padding: '2px' }}>
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '2px' }}
        />
      </div>

      {/* Controls -- flex-1 */}
      <div className="flex-1 flex flex-col p-2 gap-2 overflow-hidden">
        {/* Geometry selector */}
        <div className="flex items-center justify-between" style={{ fontFamily: 'monospace', fontSize: '9px' }}>
          <span className="text-fg-32">GEO</span>
          <span className="flex items-center gap-1">
            <span className="cursor-pointer select-none text-fg-32 hover:text-fg-64" onClick={() => cycleGeo(-1)}>{'\u2039'}</span>
            <span className="text-fg-96" style={{ minWidth: '28px', textAlign: 'center' }}>{GEO_LABELS[geometry] || geometry}</span>
            <span className="cursor-pointer select-none text-fg-32 hover:text-fg-64" onClick={() => cycleGeo(1)}>{'\u203a'}</span>
          </span>
        </div>

        {/* Render mode selector */}
        <div className="flex items-center justify-between" style={{ fontFamily: 'monospace', fontSize: '9px' }}>
          <span className="text-fg-32">REND</span>
          <span className="flex items-center gap-1">
            <span className="cursor-pointer select-none text-fg-32 hover:text-fg-64" onClick={() => cycleRM(-1)}>{'\u2039'}</span>
            <span className="text-fg-96" style={{ minWidth: '36px', textAlign: 'center' }}>{RMODE_LABELS[renderMode] || renderMode}</span>
            <span className="cursor-pointer select-none text-fg-32 hover:text-fg-64" onClick={() => cycleRM(1)}>{'\u203a'}</span>
          </span>
        </div>

        {/* Knobs -- vertical stack */}
        <div className="flex-1 flex flex-col items-center justify-center gap-1">
          <RotaryDial label="Detail" value={Math.round(detail / 4 * 100)} onChange={(v) => update('detail', Math.round(v / 100 * 4))} size={32} defaultValue={25} busRef={busRef} />
          <RotaryDial label="Scale" value={scale} onChange={(v) => update('scale', v)} size={32} defaultValue={50} busRef={busRef} />
          <div className="flex items-center justify-around w-full">
            <RotaryDial label="RotX" value={Math.round((rotateX + 5) / 10 * 100)} onChange={(v) => update('rotateX', Math.round((v / 100 * 10 - 5) * 100) / 100)} size={32} defaultValue={60} busRef={busRef} />
            <RotaryDial label="RotY" value={Math.round((rotateY + 5) / 10 * 100)} onChange={(v) => update('rotateY', Math.round((v / 100 * 10 - 5) * 100) / 100)} size={32} defaultValue={55} busRef={busRef} />
            <RotaryDial label="RotZ" value={Math.round((rotateZ + 5) / 10 * 100)} onChange={(v) => update('rotateZ', Math.round((v / 100 * 10 - 5) * 100) / 100)} size={32} defaultValue={50} busRef={busRef} />
          </div>
        </div>
      </div>

      {/* Outputs */}
      <div className="flex items-center justify-center gap-3 py-2">
        <JackSocket type="out" busKey={id} moduleId={id} onEnable={() => update('enabled', true)} busRef={busRef} label="OUT" size="md" />
        <JackSocket type="out" busKey={`${id}_phase`} moduleId={id} onEnable={() => update('enabled', true)} busRef={busRef} label="PHASE" size="md" />
      </div>

      <ModuleIO
        moduleId={id}
        onEnable={() => update('enabled', true)}
        busRef={busRef}
        outputs={[]}
        inputs={[]}
      />
    </div>
  )
}
