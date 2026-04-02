import { useEffect, useRef, useState } from 'react'
import RotaryDial from './RotaryDial'
import Dropdown from './Dropdown'
import Divider from './Divider'
import ModuleIO from './ModuleIO'

const PREVIEW_W = 252
const PREVIEW_H = 120

export default function VisualGeneratorModule({ id, label, GenComponent, defaultParams, onLoadToChannel, busRef }) {
  const [params, setParams] = useState({ ...defaultParams, animate: true })
  const [enabled, setEnabled] = useState(true)
  const previewCanvasRef = useRef(null)

  const update = (key, val) => setParams(prev => ({ ...prev, [key]: val }))

  return (
    <div className="flex flex-col shrink-0 bg-surface-secondary border border-fg-08" style={{ width: '280px', borderRadius: '4px' }}>
      {/* Header */}
      <div className="flex items-center justify-between kol-helper-xs px-3 border-b border-fg-08" style={{ height: '29px' }}>
        <span className="flex items-center gap-3">
          <span className="cursor-pointer select-none" onClick={() => setEnabled(v => !v)}>
            <div className={`w-2 h-2 rounded-full ${enabled ? 'bg-[#e74c3c]' : 'bg-fg-24'}`} />
          </span>
          <span className={enabled ? 'text-fg-96' : 'text-fg-32'}>{label}</span>
        </span>
        <span
          className="text-fg-96 cursor-pointer select-none kol-helper-xxs hover:text-accent-primary"
          onClick={() => onLoadToChannel?.(`gen-${id}`, params)}
        >
          [Load]
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-3 p-3">
        {/* Preview canvas */}
        <div className="relative" style={{ width: '100%', height: `${PREVIEW_H}px`, borderRadius: '3px', overflow: 'hidden', backgroundColor: 'var(--kol-surface-tertiary)' }}>
          {enabled && (
            <GenComponent
              width={PREVIEW_W}
              height={PREVIEW_H}
              {...params}
              animate={params.animate}
              onCanvasReady={() => {}}
            />
          )}
        </div>

        {/* Controls — varies by generator type */}
        {id === 'noise' && (
          <div className="flex items-center justify-around">
            <RotaryDial label="Scale" value={Math.round(params.scale / 100 * 100)} onChange={(v) => update('scale', Math.round(v / 100 * 100))} size={36} busRef={busRef} defaultValue={20} />
            <RotaryDial label="Speed" value={Math.round(params.speed / 10 * 100)} onChange={(v) => update('speed', Math.round(v / 100 * 10 * 10) / 10)} size={36} busRef={busRef} defaultValue={10} />
            <RotaryDial label="Oct" value={Math.round((params.octaves - 1) / 5 * 100)} onChange={(v) => update('octaves', Math.round(v / 100 * 5) + 1)} size={36} busRef={busRef} defaultValue={33} />
          </div>
        )}

        {id === 'gradient' && (
          <>
            <div className="flex items-center justify-between kol-helper-xs" style={{ height: '24px' }}>
              <span className="text-fg-64">Type</span>
              <Dropdown
                options={[{ value: 'linear', label: 'Linear' }, { value: 'radial', label: 'Radial' }, { value: 'conic', label: 'Conic' }]}
                value={params.type || 'linear'}
                onChange={(v) => update('type', v)}
                variant="minimal"
                size="md"
              />
            </div>
            <div className="flex items-center justify-around">
              <RotaryDial label="Angle" value={Math.round(params.angle / 360 * 100)} onChange={(v) => update('angle', Math.round(v / 100 * 360))} size={36} busRef={busRef} defaultValue={0} />
              <RotaryDial label="Speed" value={Math.round(params.speed / 10 * 100)} onChange={(v) => update('speed', Math.round(v / 100 * 10 * 10) / 10)} size={36} busRef={busRef} defaultValue={10} />
            </div>
          </>
        )}

        {id === 'pattern' && (
          <>
            <div className="flex items-center justify-between kol-helper-xs" style={{ height: '24px' }}>
              <span className="text-fg-64">Pattern</span>
              <Dropdown
                options={[{ value: 'stripes', label: 'Stripes' }, { value: 'dots', label: 'Dots' }, { value: 'checker', label: 'Checker' }]}
                value={params.pattern || 'stripes'}
                onChange={(v) => update('pattern', v)}
                variant="minimal"
                size="md"
              />
            </div>
            <div className="flex items-center justify-around">
              <RotaryDial label="Space" value={Math.round(params.spacing / 100 * 100)} onChange={(v) => update('spacing', Math.max(4, Math.round(v / 100 * 100)))} size={36} busRef={busRef} defaultValue={20} />
              <RotaryDial label="Angle" value={Math.round(params.angle / 360 * 100)} onChange={(v) => update('angle', Math.round(v / 100 * 360))} size={36} busRef={busRef} defaultValue={0} />
              <RotaryDial label="Duty" value={Math.round(params.duty * 100)} onChange={(v) => update('duty', Math.round(v) / 100)} size={36} busRef={busRef} defaultValue={50} />
            </div>
          </>
        )}

        {id === 'color-field' && (
          <div className="flex items-center justify-between kol-helper-xs" style={{ height: '24px' }}>
            <span className="text-fg-64">Animate</span>
            <span
              className={`cursor-pointer select-none ${params.animate ? 'text-fg-96' : 'text-fg-32'}`}
              onClick={() => update('animate', !params.animate)}
            >
              {params.animate ? 'ON' : 'OFF'}
            </span>
          </div>
        )}
      </div>

      <ModuleIO
        moduleId={`gen-${id}`}
        outputs={[`gen_${id}`]}
        inputs={
          id === 'noise' ? [
            { label: 'scale', active: false },
            { label: 'speed', active: false },
            { label: 'octaves', active: false },
          ] : id === 'gradient' ? [
            { label: 'angle', active: false },
            { label: 'speed', active: false },
          ] : id === 'pattern' ? [
            { label: 'spacing', active: false },
            { label: 'angle', active: false },
            { label: 'duty', active: false },
          ] : id === 'color-field' ? [
            { label: 'color', active: false },
          ] : []
        }
      />
    </div>
  )
}
