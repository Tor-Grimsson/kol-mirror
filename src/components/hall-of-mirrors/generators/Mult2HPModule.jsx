import JackSocket from './JackSocket'

/**
 * Mult2HP — 2HP passive mult. Dual: 1 in + 4 out, 1 in + 4 out.
 */
export default function Mult2HPModule({ id = 'pm1', busRef }) {
  return (
    <div className="flex flex-col h-full items-center justify-center gap-1 bg-surface-secondary border-r border-fg-08 py-2">
      {/* Mult A: 1 in, 4 out */}
      <JackSocket type="in" moduleId={id} configKey="a_in" busRef={busRef} size="sm" />
      <JackSocket type="out" busKey={`${id}_a1`} moduleId={id} busRef={busRef} size="sm" />
      <JackSocket type="out" busKey={`${id}_a2`} moduleId={id} busRef={busRef} size="sm" />
      <JackSocket type="out" busKey={`${id}_a3`} moduleId={id} busRef={busRef} size="sm" />
      <JackSocket type="out" busKey={`${id}_a4`} moduleId={id} busRef={busRef} size="sm" />
      {/* Divider */}
      <div style={{ width: '60%', height: '1px', backgroundColor: 'rgba(255,255,255,0.06)', margin: '2px 0' }} />
      {/* Mult B: 1 in, 4 out */}
      <JackSocket type="in" moduleId={id} configKey="b_in" busRef={busRef} size="sm" />
      <JackSocket type="out" busKey={`${id}_b1`} moduleId={id} busRef={busRef} size="sm" />
      <JackSocket type="out" busKey={`${id}_b2`} moduleId={id} busRef={busRef} size="sm" />
      <JackSocket type="out" busKey={`${id}_b3`} moduleId={id} busRef={busRef} size="sm" />
      <JackSocket type="out" busKey={`${id}_b4`} moduleId={id} busRef={busRef} size="sm" />
    </div>
  )
}
