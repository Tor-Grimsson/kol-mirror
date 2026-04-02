import JackSocket from './JackSocket'

/**
 * ModuleIO — compact jack socket row at bottom of module panel.
 * Outputs on left, inputs on right. Just sockets, minimal text.
 */
export default function ModuleIO({ moduleId, inputs = [], outputs = [], onEnable, busRef }) {
  if (!inputs.length && !outputs.length) return null

  return (
    <div className="flex items-center justify-between px-2 py-2" style={{ minHeight: '28px' }}>
      {/* Outputs */}
      <div className="flex items-center gap-1.5">
        {outputs.map(key => (
          <JackSocket
            key={key}
            type="out"
            busKey={key}
            moduleId={moduleId}
            onEnable={onEnable}
            busRef={busRef}
            size="sm"
            label={key.replace(`${moduleId}_`, '').replace(moduleId, '○')}
          />
        ))}
      </div>
      {/* Inputs */}
      <div className="flex items-center gap-1.5">
        {inputs.map(inp => (
          <JackSocket
            key={inp.configKey || inp.label}
            type="in"
            moduleId={moduleId}
            configKey={inp.configKey}
            onExprChange={inp.onExprChange}
            busRef={busRef}
            active={inp.active}
            size="sm"
            label={inp.label}
          />
        ))}
      </div>
    </div>
  )
}
