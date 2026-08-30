import { createContext, useContext } from 'react'

// Jack DOM-node registry + the drag in flight — jacks register by id (with a
// drop handler when they accept cables), PatchCableOverlay anchors cables to
// them and draws the cable being dragged. Own file so component files keep
// fast refresh.
export const PatchJacksContext = createContext(null)

// The cable in flight — one desk, one drag. Module-level on purpose: the
// source jack writes it per pointer move and the overlay reads it per frame;
// a hook-owned value would be flagged as mutated (react-hooks/immutability).
export const patchDrag = { current: null }

export function usePatchJacks() {
  return useContext(PatchJacksContext)
}
