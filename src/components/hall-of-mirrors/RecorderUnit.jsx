import { useState } from 'react'
import Divider from '../atoms/Divider'
import Slider from '../atoms/Slider'
import Dropdown from '../molecules/Dropdown'
import { Icon } from '../icons'

/**
 * RecorderUnit — the channel's tape machine.
 *
 * Extracted from the channel card (2026-08-27). The card had grown to ~1030
 * lines and 65 props by doing four unrelated jobs at once — a source, a
 * processor, a tape machine and a mix strip — and this is the most
 * self-contained of them: nothing about arming, capturing or trimming a clip
 * belongs to what a channel HOLDS.
 *
 * Its own transport settings (loop length, framerate, real-time, which slot's
 * info is expanded) live here rather than in the parent, because nothing
 * outside the recorder reads them.
 */
export default function RecorderUnit({
  recState,
  recPaused,
  recSlots = [],
  activeRecSlot,
  playhead,
  onSeek,
  onRecPauseToggle,
  onArmRecording,
  onStartRecording,
  onStopRecording,
  onDisarmRecording,
  onSaveRecToSlot,
  onClearRecorder,
  onSetActiveRecSlot,
  onClearActiveRecSlot,
  onRemoveRecSlot,
  onAddRecSlot,
  onUploadRecSlot,
  onUpdateRecSlotTrim,
}) {
  const [recLoopLength, setRecLoopLength] = useState(10)
  const [recFps, setRecFps] = useState(60)
  const [recRealTime, setRecRealTime] = useState(true)
  const [recInfoOpen, setRecInfoOpen] = useState(new Set())

  return (
    <div className="flex flex-col gap-2" style={{ flex: '1 1 0', minHeight: 0 }}>
      <div className="flex items-center justify-between gap-4 kol-helper-12" style={{ height: '24px' }}>
        <span className="text-fg-96">Duration</span>
        <Dropdown
          options={[10, 20, 40, 80, 160].map(s => ({ value: s, label: `${s}s` }))}
          value={recLoopLength}
          onChange={setRecLoopLength}
          variant="minimal"
          size="md"
        />
      </div>
      <div className="flex items-center justify-between gap-4 kol-helper-12" style={{ height: '24px' }}>
        <span className="text-fg-96">Framerate</span>
        <Dropdown
          options={[30, 60].map(f => ({ value: f, label: `${f}fps` }))}
          value={recFps}
          onChange={setRecFps}
          variant="minimal"
          size="md"
        />
      </div>
      <div className="flex items-center justify-between gap-4 kol-helper-12" style={{ height: '24px' }}>
        <span className="text-fg-96">Real-time</span>
        <span className="cursor-pointer select-none text-fg-96" onClick={() => setRecRealTime(!recRealTime)}>[{recRealTime ? 'ON' : 'OFF'}]</span>
      </div>
      <div className="flex items-center justify-between gap-4 kol-helper-12" style={{ height: '24px' }}>
        <span className="flex items-center gap-2 cursor-pointer select-none" onClick={() => { if (!recState || recState?.status === 'idle') onArmRecording?.(recLoopLength, recFps); else if (recState?.status === 'armed' || recState?.status === 'recording') onDisarmRecording?.() }}>
          <span className="text-fg-96">Record</span>
          <span className="block rounded-full transition-all" style={{ width: 8, height: 8, backgroundColor: (recState?.status === 'armed' || recState?.status === 'recording') ? '#e74c3c' : '#6b2828' }} />
        </span>
        <div className="flex items-center gap-2">
          {(!recState || recState?.status === 'idle') && (
            <>
              <span className="text-fg-16">[Start]</span>
              <span className="text-fg-16">[Cancel]</span>
            </>
          )}
          {recState?.status === 'armed' && (
            <>
              <span className="text-fg-96 cursor-pointer select-none" onClick={() => onStartRecording?.()}>[Start]</span>
              <span className="text-fg-96 cursor-pointer select-none" onClick={() => onDisarmRecording?.()}>[Cancel]</span>
            </>
          )}
          {recState?.status === 'recording' && (
            <>
              <span className="text-[#e74c3c] cursor-pointer select-none" onClick={() => onStopRecording?.()}>[Stop]</span>
              <span className="text-fg-96 cursor-pointer select-none" onClick={() => onDisarmRecording?.()}>[Cancel]</span>
            </>
          )}
        </div>
      </div>

      {recState?.status === 'armed' && (
        <div className="kol-helper-12 text-fg-32" style={{ height: '24px', lineHeight: '24px' }}>Standby — ready to record</div>
      )}

      {recState?.status === 'recording' && (
        <>
          <div className="w-full bg-fg-08 overflow-hidden" style={{ height: '2px', borderRadius: '1px' }}>
            <div className="h-full bg-[#e74c3c]" style={{ width: `${(recState.elapsed / recLoopLength) * 100}%`, transition: 'width 100ms' }} />
          </div>
          <div className="flex items-center justify-between kol-helper-12 text-fg-32" style={{ height: '24px' }}>
            <span className="text-[#e74c3c]">Frame {Math.floor(recState.elapsed * recFps)}</span>
            <span>{recState.elapsed.toFixed(1)}s / {recLoopLength}s</span>
          </div>
        </>
      )}

      {recState?.status === 'done' && recState?.blobUrl && (
        <div className="flex items-center justify-between kol-helper-12 border border-fg-16 px-2" style={{ height: '24px', borderRadius: '3px' }}>
          <span className="text-fg-64">{recState.blobSize ? (recState.blobSize / (1024 * 1024)).toFixed(2) + ' MB' : ''} · {recLoopLength}s</span>
          <div className="flex items-center gap-2">
            <span className="text-fg-48 hover:text-fg-96 cursor-pointer select-none" onClick={() => onSaveRecToSlot?.({ blobUrl: recState.blobUrl, blobSize: recState.blobSize, loopLength: recLoopLength, fps: recFps, frozenParams: recState.frozenParams })}>[Save]</span>
            <span className="text-fg-32 hover:text-fg-64 cursor-pointer select-none" onClick={() => onClearRecorder?.()}>[Discard]</span>
          </div>
        </div>
      )}

      <Divider className="my-1" />

      <div className="flex flex-col gap-2" style={{ overflowY: 'auto', overflowX: 'hidden', flex: '1 1 0', minHeight: 0, scrollbarWidth: 'none' }}>
        {recSlots.map((slot, si) => {
          const isActive = activeRecSlot === si
          if (!slot) return (
            <div key={si} className="flex items-center justify-between kol-helper-12" style={{ height: '24px', opacity: 0.5 }}>
              <span className="text-fg-32">{si + 1}. empty</span>
              <div className="flex items-center gap-2">
                <label className="text-fg-32 hover:text-fg-64 cursor-pointer select-none">
                  [Upload]<input type="file" accept="video/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onUploadRecSlot(si, f); e.target.value = '' }} />
                </label>
                <span className="text-fg-32 hover:text-fg-64 cursor-pointer select-none" onClick={() => onRemoveRecSlot(si)}><Icon name="x" size={12} /></span>
              </div>
            </div>
          )
          const slotDuration = slot.duration || recLoopLength
          const infoOpen = recInfoOpen.has(si)
          const toggleInfo = () => setRecInfoOpen(prev => { const next = new Set(prev); next.has(si) ? next.delete(si) : next.add(si); return next })
          return (
            <div key={si} className="flex flex-col gap-1">
              <div className="flex items-center justify-between gap-4 kol-helper-12" style={{ height: '24px' }}>
                <span className={isActive ? 'text-fg-96' : 'text-fg-64'}>
                  rec-{String(si + 1).padStart(2, '0')}{isActive && <span className="text-[#e74c3c] ml-2">ACTIVE</span>}
                </span>
                <span className="text-fg-32 hover:text-fg-64 cursor-pointer select-none" onClick={toggleInfo}>[Info]</span>
              </div>
              {infoOpen && (
                <div className="kol-helper-12 text-fg-32" style={{ height: '24px', lineHeight: '24px' }}>
                  {(slot.size / (1024 * 1024)).toFixed(2)}MB · {slot.duration?.toFixed(1)}s · {slot.resolution} · {slot.fps}fps
                </div>
              )}
              <Slider variant="dual" min={0} max={slotDuration} step={0.1} value={slot.mark1 ?? 0} value2={slot.mark2 ?? slotDuration} onChange={(v) => onUpdateRecSlotTrim(si, v, slot.mark2)} onChange2={(v) => onUpdateRecSlotTrim(si, slot.mark1, v)} playhead={isActive ? playhead : undefined} onPlayheadChange={isActive ? onSeek : undefined} />
              <div className="flex items-center justify-between gap-4 kol-helper-12" style={{ height: '24px' }}>
                <div className="flex items-center" style={{ gap: '2px' }}>
                  {isActive ? (
                    <div className="flex items-center" style={{ gap: '2px' }}>
                      <span className="cursor-pointer select-none" style={{ color: '#2dd4bf' }} onClick={() => onRecPauseToggle && onRecPauseToggle()}>
                        <Icon name={recPaused ? 'control-play' : 'control-pause'} size={16} />
                      </span>
                      <span className="cursor-pointer select-none" style={{ color: '#2dd4bf' }} onClick={() => onClearActiveRecSlot()}>
                        <Icon name="control-stop" size={16} />
                      </span>
                    </div>
                  ) : (
                    <span className="cursor-pointer select-none" style={{ color: '#2dd4bf' }} onClick={() => onSetActiveRecSlot(si)}>
                      <Icon name="control-play" size={16} />
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-fg-32 hover:text-fg-64 cursor-pointer select-none" onClick={() => { const a = document.createElement('a'); a.href = slot.blobUrl; a.download = slot.fileName; a.click() }}>[Download]</span>
                  <span className="text-fg-32 hover:text-fg-64 cursor-pointer select-none" onClick={() => onRemoveRecSlot(si)}><Icon name="x" size={12} /></span>
                </div>
              </div>
              <Divider />
            </div>
          )
        })}
        {recSlots.length < 8 && (
          <div className="kol-helper-12 text-fg-32 hover:text-fg-64 cursor-pointer select-none" style={{ height: '24px', lineHeight: '24px' }} onClick={() => onAddRecSlot()}>[+ Add Slot]</div>
        )}
      </div>
    </div>
  )
}
