/**
 * FloatingFrame — the monitor as a window over the desk (the float arrangement, 2026-10-03).
 *
 * User: *"what about making the frame overlay the mixer? and just give the entire view the mixer
 * … the frame overlay can be draggable, that way its not taking space but can be small or large
 * or hidden based on what operation user is doing"*. It takes `InfiniteCanvas`'s place in
 * `SymphonyViewport`, so the monitor's own tree is the same in both arrangements.
 *
 * Drag it by its body, scale it from the corner grip — `useFloating`, kol-monitor's Stage hook.
 * HIDDEN IS NOT UNMOUNTED: the channel canvases inside are what the frame buffer captures, so the
 * window fades out and stops taking the pointer, the way monitor's dock does.
 *
 * @param {Object}  frame   `useFloating()`'s return — `box { x, y }`, `onDrag`, `onResize`
 * @param {boolean} hidden
 */
export default function FloatingFrame({ frame, hidden, children }) {
  return (
    <div
      onPointerDown={frame.onDrag}
      className={`absolute cursor-grab transition-opacity duration-200 ${hidden ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      style={{ left: frame.box.x, top: frame.box.y, zIndex: 20 }}
    >
      {children}
      <span
        onPointerDown={frame.onResize}
        title="Drag to resize"
        className="absolute"
        style={{ right: 0, bottom: 0, width: 16, height: 16, cursor: 'nwse-resize' }}
      />
    </div>
  )
}
