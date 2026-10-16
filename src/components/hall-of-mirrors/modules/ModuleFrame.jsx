/* THE DESK'S MODULE FRAME — one shape for every module on the desk (user
   2026-10-16: *"the fucking system doesnt work if modules dont adhere to the
   same system"*; 2026-10-15 on Input: *"we have established format"*). It was
   copied inline into each module and drifted — half the desk still carried the
   older flat header. Now there is one.

     ModuleTab    the 29px title tab — name left, state right
     ModuleFrame  the tab over the panel, at the desk's height

   A flipping module (Transport, Master, Routing, Generator, Channel) takes
   ModuleTab alone and puts its flip scene under it, so the tab never turns. */
export function ModuleTab({ children, style }) {
  return (
    <div
      className="flex items-center justify-between kol-helper-12 mx-2 px-3 border border-fg-08 border-b-0 shrink-0 bg-surface-tertiary"
      style={{ borderRadius: '4px 4px 0 0', height: 29, ...style }}
    >
      {children}
    </div>
  )
}

export default function ModuleFrame({ head, width, className = '', children }) {
  return (
    <div className="flex flex-col shrink-0" style={{ height: '100%', maxHeight: '100%', width }}>
      <ModuleTab>{head}</ModuleTab>
      <div className={`flex flex-col flex-1 bg-surface-secondary border border-fg-08 ${className}`} style={{ borderRadius: 4, minHeight: 0 }}>
        {children}
      </div>
    </div>
  )
}
