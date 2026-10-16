import { useState } from 'react'
import Console from '../../components/mirror/Console'

/**
 * /dev › Console — the console SKIN proposal, off the live studio (user
 * 2026-10-15: *"there is a dev tab in the rail right? put it there, that is
 * literally what its there for?"*). The real `Console` with the desk's default
 * rows, each module drawn as its captured preview, inside `.console-skin`
 * (walnut cheeks, rails, row numbers — `components.css`). Rows, width and the
 * drag all work here; nothing is saved.
 */
const ROWS = [['channel', 'master', 'routing'], ['playback', 'generator-module', 'expressions', 'patch', 'monitor', 'tape']]
const H = 300

export default function ConsoleSkin() {
  const [state, setState] = useState({ rows: ROWS, width: 0 })
  return (
    <div className="console-skin p-8" style={{ zoom: 0.75 }}>
      <Console
        rows={state.rows}
        width={state.width}
        onRows={(rows) => setState((s) => ({ ...s, rows }))}
        onWidth={(width) => setState((s) => ({ ...s, width }))}
        rowHeight={H}
      >
        {ROWS.flat().map((id) => (
          <div key={id} data-console={id} className="shrink-0 pr-4" style={{ height: H }}>
            <img src={`/previews/modules/${id}.png`} alt={id} style={{ height: '100%', width: 'auto', display: 'block' }} />
          </div>
        ))}
      </Console>
    </div>
  )
}
