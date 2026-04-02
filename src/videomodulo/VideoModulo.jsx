import Case, { RackRow, HP } from './modules/utility/Case.jsx'
import BlankPanel from './modules/utility/BlankPanel.jsx'

export default function VideoModulo() {
  return (
    <div className="min-h-screen bg-surface-primary flex items-center justify-center">
      <Case>
        <RackRow height="1u">
          <div style={HP(8)}><BlankPanel variant="1u" /></div>
        </RackRow>
        <RackRow height="3u">
          <div style={HP(8)}><BlankPanel variant="3u" /></div>
        </RackRow>
        <RackRow height="3u">
          <div style={HP(8)}><BlankPanel variant="3u" /></div>
        </RackRow>
      </Case>
    </div>
  )
}
