/**
 * JackStrip — the front's bottom strip: a module's most-used patch points (plan 11 § 3.1, user 2026-10-24:
 * *"we could use the bottom part design as location for most frequent patch points. while backside would
 * expose more"*). The bottom part is the Channel card's FX rack (`FxUnit`): inset under the plate, tertiary
 * ground, no top border, rounded below. Everything else a module patches lives on its back.
 *
 *   <JackStrip>
 *     <StripPort label="IN">{<Jack … />}</StripPort>
 *     <StripPort label="OUT" end>{<Jack … />}</StripPort>
 *   </JackStrip>
 *
 * @param {number} width   the plate's width — the strip insets 8px each side, as the FX rack does
 * @param {boolean} under  another strip (the FX rack) sits above it: square top corners, a rule between
 */
export function JackStrip({ width, under = false, children }) {
  return (
    <div
      className={`flex items-center gap-4 mx-2 px-4 border border-fg-08 border-t-0 kol-helper-12 shrink-0 bg-surface-tertiary ${under ? 'border-t border-t-fg-08' : ''}`}
      style={{ borderRadius: '0 0 4px 4px', height: 40, width: width ? width - 16 : undefined }}
    >
      {children}
    </div>
  )
}

/** One port on the strip: the jack and its label; `end` pushes it (and what follows) to the right edge. */
export function StripPort({ label, end = false, children }) {
  return (
    <span className={`flex items-center gap-2 ${end ? 'ml-auto' : ''}`}>
      {end && <span className="text-fg-64">{label}</span>}
      {children}
      {!end && <span className="text-fg-64">{label}</span>}
    </span>
  )
}
