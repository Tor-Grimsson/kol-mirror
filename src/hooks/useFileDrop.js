import { useCallback, useRef, useState } from 'react'
import processImageUpload from '../utils/processImageUpload'

/**
 * useFileDrop — drop an image or a video straight onto a channel.
 *
 * The quickest path from "I have a file" to "it is in the mixer": no dialog, no
 * Source tab, no browser. It resolves the two kinds differently because they
 * are different things downstream — a still becomes the channel's media, a
 * video becomes the live-input source pointed at an object URL, since a video
 * is a frame stream rather than a picture.
 *
 * `dragCounter` rather than a boolean: dragenter/dragleave fire for every child
 * element the pointer crosses, so a plain flag flickers off the moment the
 * cursor moves over anything inside the drop zone. Counting enters and leaves
 * is the standard fix and the reason this is a hook rather than four inline
 * handlers.
 *
 * Object URLs are revoked when they are replaced, not on unmount: the channel
 * keeps playing the video after this component has re-rendered, so revoking on
 * teardown would kill a live source.
 */
export function useFileDrop(onMediaChange) {
  const [dragging, setDragging] = useState(false)
  const counter = useRef(0)
  const lastUrl = useRef(null)

  const accept = useCallback(async (file) => {
    if (!file) return
    if (file.type.startsWith('video/')) {
      if (lastUrl.current) URL.revokeObjectURL(lastUrl.current)
      const url = URL.createObjectURL(file)
      lastUrl.current = url
      onMediaChange({
        variantId: 'gen-live',
        params: { source: 'file', fileUrl: url, mirrored: 0, animate: true },
        customImageName: file.name,
      })
      return
    }
    if (!file.type.startsWith('image/')) return
    try {
      // Same path as the Source tab's upload, so an SVG is rasterised at the
      // configured scale rather than by a second, divergent implementation.
      const { imageSrc, rasterSrc } = await processImageUpload(file)
      onMediaChange({ customImageSrc: imageSrc, customRasterSrc: rasterSrc, customImageName: file.name })
    } catch { /* not a readable image — leave the channel alone */ }
  }, [onMediaChange])

  const handlers = {
    onDragEnter: (e) => {
      if (!e.dataTransfer?.types?.includes('Files')) return
      e.preventDefault()
      counter.current += 1
      setDragging(true)
    },
    onDragOver: (e) => {
      if (!e.dataTransfer?.types?.includes('Files')) return
      e.preventDefault()
      e.dataTransfer.dropEffect = 'copy'
    },
    onDragLeave: () => {
      counter.current = Math.max(0, counter.current - 1)
      if (counter.current === 0) setDragging(false)
    },
    onDrop: (e) => {
      if (!e.dataTransfer?.files?.length) return
      e.preventDefault()
      counter.current = 0
      setDragging(false)
      accept(e.dataTransfer.files[0])
    },
  }

  return { dragging, handlers, acceptFile: accept }
}

export default useFileDrop
