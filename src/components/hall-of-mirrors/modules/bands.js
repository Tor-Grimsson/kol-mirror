/* THE U (plan 13 § 3.1, user 2026-10-24: *"they are all different height? all parts should be standardized, same
   height"*). One constant, as monitor's `eurorack.js` `ROW_HEIGHT` is — Channel's height when it was measured, now
   the measure every module in a desk row is cut to. Each DeskModule FILLS its slot (`fill` defaults on): the body
   grows, the footer and jacks sit on the foot, so a row's tops and bottoms line up. */
export const DESK_U = 530

/* THE BANDS (plan 14 § 2.1, user 2026-10-25: *"SAME FUCKING LAYOUT SECTIONS!!! OF THE FUCKING!! MODUELS!!!!"*).
   Every module draws every band at these heights, empty when it has nothing for one, so across a row each seam —
   header / plate, the plate's text-button row, footer tabs, footer rows, jacks — lands on the same line. The plate
   takes what is left of the U. */
export const BAND = { head: 29, actions: 33, footer: 124, tabs: 33, jacks: 40 }
