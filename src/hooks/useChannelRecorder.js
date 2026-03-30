import { useState, useRef, useCallback, useEffect } from 'react'

const MIME_CANDIDATES = [
  'video/webm;codecs=vp9',
  'video/webm;codecs=vp8',
  'video/webm',
]

function getSupportedMime() {
  for (const mime of MIME_CANDIDATES) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(mime)) return mime
  }
  return 'video/webm'
}

export default function useChannelRecorder() {
  const [status, setStatus] = useState('idle') // 'idle' | 'armed' | 'recording' | 'done'
  const [elapsed, setElapsed] = useState(0)
  const [blobUrl, setBlobUrl] = useState(null)
  const [blobSize, setBlobSize] = useState(0)
  const [frozenParams, setFrozenParams] = useState(null)
  const [loopLength, setLoopLength] = useState(20)
  const [fps, setFpsState] = useState(30)

  const recorderRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)
  const stopTimeoutRef = useRef(null)
  const startTimeRef = useRef(0)
  const blobUrlRef = useRef(null)
  const mimeRef = useRef('video/webm')

  const cleanupTimers = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
    if (stopTimeoutRef.current) { clearTimeout(stopTimeoutRef.current); stopTimeoutRef.current = null }
  }, [])

  const cleanupAll = useCallback(() => {
    cleanupTimers()
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      try { recorderRef.current.stop() } catch (_) {}
    }
    recorderRef.current = null
    chunksRef.current = []
  }, [cleanupTimers])

  useEffect(() => {
    return () => {
      cleanupAll()
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current)
    }
  }, [cleanupAll])

  // Arm — standby: sets up stream + MediaRecorder but does not start capture
  const arm = useCallback((canvasEl, duration, currentParams, capturesFps = 30) => {
    cleanupAll()
    if (blobUrlRef.current) { URL.revokeObjectURL(blobUrlRef.current); blobUrlRef.current = null }

    setFrozenParams({ ...currentParams })
    setLoopLength(duration)
    setFpsState(capturesFps)
    setBlobUrl(null)
    setBlobSize(0)
    setElapsed(0)

    const stream = canvasEl.captureStream(capturesFps)
    const mime = getSupportedMime()
    mimeRef.current = mime
    const recorder = new MediaRecorder(stream, { mimeType: mime })
    recorderRef.current = recorder
    chunksRef.current = []

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunksRef.current.push(e.data)
    }

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeRef.current })
      const url = URL.createObjectURL(blob)
      blobUrlRef.current = url
      setBlobUrl(url)
      setBlobSize(blob.size)
      setStatus('done')
      cleanupTimers()
    }

    setStatus('armed')
  }, [cleanupAll, cleanupTimers])

  // Start — begin recording from armed state
  const start = useCallback((duration) => {
    if (!recorderRef.current || recorderRef.current.state !== 'inactive') return

    const dur = duration ?? loopLength
    recorderRef.current.start(100)
    startTimeRef.current = performance.now()
    setElapsed(0)
    setStatus('recording')

    timerRef.current = setInterval(() => {
      setElapsed((performance.now() - startTimeRef.current) / 1000)
    }, 100)

    stopTimeoutRef.current = setTimeout(() => {
      if (recorderRef.current && recorderRef.current.state !== 'inactive') {
        recorderRef.current.stop()
      }
    }, dur * 1000)
  }, [loopLength])

  // Stop — finalize recording early (triggers onstop → 'done')
  const stop = useCallback(() => {
    cleanupTimers()
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop()
    }
  }, [cleanupTimers])

  // Disarm — cancel everything, back to idle
  const disarm = useCallback(() => {
    cleanupAll()
    setStatus('idle')
    setElapsed(0)
    setFrozenParams(null)
    if (blobUrlRef.current) { URL.revokeObjectURL(blobUrlRef.current); blobUrlRef.current = null }
    setBlobUrl(null)
    setBlobSize(0)
  }, [cleanupAll])

  // Clear — same as disarm (alias for post-save cleanup)
  const clear = disarm

  return {
    status, elapsed, blobUrl, blobSize, frozenParams, loopLength, fps,
    arm, start, stop, disarm, clear,
  }
}
