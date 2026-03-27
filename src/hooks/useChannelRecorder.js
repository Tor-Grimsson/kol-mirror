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
  const [status, setStatus] = useState('idle') // 'idle' | 'recording' | 'done'
  const [elapsed, setElapsed] = useState(0)
  const [mark1, setMark1State] = useState(null)
  const [mark2, setMark2State] = useState(null)
  const [blobUrl, setBlobUrl] = useState(null)
  const [blobSize, setBlobSize] = useState(0)
  const [frozenParams, setFrozenParams] = useState(null)
  const [loopLength, setLoopLength] = useState(20)

  const recorderRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)
  const stopTimeoutRef = useRef(null)
  const startTimeRef = useRef(0)
  const blobUrlRef = useRef(null)

  const cleanup = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
    if (stopTimeoutRef.current) { clearTimeout(stopTimeoutRef.current); stopTimeoutRef.current = null }
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      try { recorderRef.current.stop() } catch (_) {}
    }
    recorderRef.current = null
    chunksRef.current = []
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup()
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current)
    }
  }, [cleanup])

  const arm = useCallback((canvasEl, duration, currentParams) => {
    cleanup()
    if (blobUrlRef.current) { URL.revokeObjectURL(blobUrlRef.current); blobUrlRef.current = null }

    setFrozenParams({ ...currentParams })
    setLoopLength(duration)
    setMark1State(null)
    setMark2State(null)
    setBlobUrl(null)
    setElapsed(0)

    const stream = canvasEl.captureStream(30)
    const mime = getSupportedMime()
    const recorder = new MediaRecorder(stream, { mimeType: mime })
    recorderRef.current = recorder
    chunksRef.current = []

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunksRef.current.push(e.data)
    }

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mime })
      const url = URL.createObjectURL(blob)
      blobUrlRef.current = url
      setBlobUrl(url)
      setBlobSize(blob.size)
      setStatus('done')
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
    }

    recorder.start(100) // collect data every 100ms
    startTimeRef.current = performance.now()
    setStatus('recording')

    // Elapsed timer
    timerRef.current = setInterval(() => {
      setElapsed((performance.now() - startTimeRef.current) / 1000)
    }, 100)

    // Auto-stop
    stopTimeoutRef.current = setTimeout(() => {
      if (recorderRef.current && recorderRef.current.state !== 'inactive') {
        recorderRef.current.stop()
      }
    }, duration * 1000)
  }, [cleanup])

  const disarm = useCallback(() => {
    cleanup()
    setStatus('idle')
    setElapsed(0)
    setMark1State(null)
    setMark2State(null)
    setFrozenParams(null)
    if (blobUrlRef.current) { URL.revokeObjectURL(blobUrlRef.current); blobUrlRef.current = null }
    setBlobUrl(null)
  }, [cleanup])

  const setMark1 = useCallback((value) => {
    if (typeof value === 'number') {
      setMark1State(value)
    } else if (status === 'recording') {
      setMark1State((performance.now() - startTimeRef.current) / 1000)
    }
  }, [status])

  const setMark2 = useCallback((value) => {
    if (typeof value === 'number') {
      setMark2State(value)
    } else if (status === 'recording') {
      setMark2State((performance.now() - startTimeRef.current) / 1000)
    }
  }, [status])

  const clear = useCallback(() => {
    cleanup()
    if (blobUrlRef.current) { URL.revokeObjectURL(blobUrlRef.current); blobUrlRef.current = null }
    setBlobUrl(null)
    setStatus('idle')
    setElapsed(0)
    setMark1State(null)
    setMark2State(null)
    setFrozenParams(null)
  }, [cleanup])

  return {
    status, elapsed, mark1, mark2, blobUrl, blobSize, frozenParams, loopLength,
    arm, disarm, setMark1, setMark2, clear,
  }
}
