/* The Generator's OUT keys (plan 16 W8). Slot 1 keeps the pre-W8 key, so a saved channel cabled to the Generator
   stays cabled; `gen:mix` is the stack as a picture, registered as a frame source. */
export const GEN_KEY = 'gen:desk'
export const genSlotKey = (i) => (i === 0 ? GEN_KEY : `${GEN_KEY}:${i + 1}`)
export const GEN_MIX_KEY = 'gen:mix'
