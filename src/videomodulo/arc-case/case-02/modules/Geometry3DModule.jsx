import { useEffect, useRef, useCallback } from 'react'
import * as THREE from 'three'
import RotaryDial from './RotaryDial'
import Divider from './Divider'
import ModuleIO from './ModuleIO'

const GEOMETRIES = ['ico', 'box', 'tor', 'oct', 'sph', 'cyl']
const RENDER_MODES = ['wire', 'solid', 'point']
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
    enabled = false, preview = true,
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

  return (
    <div className="flex flex-col shrink-0 bg-surface-secondary border border-fg-08" style={{ width: '280px', borderRadius: '4px' }}>
      {/* Header */}
      <div className="flex items-center justify-between kol-helper-xs px-3 border-b border-fg-08" style={{ height: '29px' }}>
        <span className="flex items-center gap-3">
          <span className="cursor-pointer select-none" onClick={() => update('enabled', !enabled)}>
            <div className={`w-2 h-2 rounded-full ${enabled ? 'bg-[#e74c3c]' : 'bg-fg-24'}`} />
          </span>
          <span className={enabled ? 'text-fg-96' : 'text-fg-32'}>{label}</span>
        </span>
        <span className="flex items-center gap-2">
          <span
            className={`cursor-pointer select-none kol-helper-xxs ${preview ? 'text-fg-32' : 'text-fg-16'}`}
            onClick={() => update('preview', !preview)}
          >
            {preview ? '◉' : '◎'}
          </span>
          <span className="text-fg-32 kol-helper-xxs">{id}</span>
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-2 p-3">
        {/* Canvas */}
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          style={{ width: '100%', height: preview ? `${H}px` : '6px', borderRadius: '3px', backgroundColor: 'var(--kol-surface-tertiary)', display: 'block', overflow: 'hidden', transition: 'height 0.15s' }}
        />

        {/* Geometry buttons */}
        <div className="flex items-center gap-1">
          {GEOMETRIES.map(g => (
            <button
              key={g}
              className={`flex-1 kol-helper-xxs py-0.5 rounded-sm cursor-pointer border uppercase ${
                geometry === g
                  ? 'bg-fg-96 text-surface-primary border-fg-96'
                  : 'bg-transparent text-fg-32 border-fg-08 hover:text-fg-64'
              }`}
              style={{ fontSize: '8px' }}
              onClick={() => update('geometry', g)}
            >
              {g}
            </button>
          ))}
        </div>

        {/* Render mode */}
        <div className="flex items-center gap-1">
          {RENDER_MODES.map(m => (
            <button
              key={m}
              className={`flex-1 kol-helper-xxs py-0.5 rounded-sm cursor-pointer border uppercase ${
                renderMode === m
                  ? 'bg-[#e74c3c] text-fg-96 border-[#e74c3c]'
                  : 'bg-transparent text-fg-32 border-fg-08 hover:text-fg-64'
              }`}
              style={{ fontSize: '8px' }}
              onClick={() => update('renderMode', m)}
            >
              {m}
            </button>
          ))}
        </div>

        <Divider />

        {/* Knobs row 1 */}
        <div className="flex items-center justify-around">
          <RotaryDial label="Detail" value={Math.round(detail / 4 * 100)} onChange={(v) => update('detail', Math.round(v / 100 * 4))} size={36} defaultValue={25} busRef={busRef} />
          <RotaryDial label="Scale" value={scale} onChange={(v) => update('scale', v)} size={36} defaultValue={50} busRef={busRef} />
        </div>

        {/* Knobs row 2 — rotation */}
        <div className="flex items-center justify-around">
          <RotaryDial label="RotX" value={Math.round((rotateX + 5) / 10 * 100)} onChange={(v) => update('rotateX', Math.round((v / 100 * 10 - 5) * 100) / 100)} size={36} defaultValue={60} busRef={busRef} />
          <RotaryDial label="RotY" value={Math.round((rotateY + 5) / 10 * 100)} onChange={(v) => update('rotateY', Math.round((v / 100 * 10 - 5) * 100) / 100)} size={36} defaultValue={55} busRef={busRef} />
          <RotaryDial label="RotZ" value={Math.round((rotateZ + 5) / 10 * 100)} onChange={(v) => update('rotateZ', Math.round((v / 100 * 10 - 5) * 100) / 100)} size={36} defaultValue={50} busRef={busRef} />
        </div>

        <Divider />

        {/* Output */}
        <div className="flex items-center justify-between kol-helper-xs">
          <span className="text-fg-32">Phase</span>
          <span ref={valRef} className="text-fg-64" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {enabled ? '0' : '—'}
          </span>
        </div>
      </div>

      <ModuleIO
        moduleId={id}
        onEnable={() => update('enabled', true)}
        busRef={busRef}
        outputs={[id, `${id}_phase`]}
        inputs={[
          { label: 'detail', active: false },
          { label: 'scale', active: false },
          { label: 'rotX', active: false },
          { label: 'rotY', active: false },
          { label: 'rotZ', active: false },
        ]}
      />
    </div>
  )
}
