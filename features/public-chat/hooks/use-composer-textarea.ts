import { type RefObject, useLayoutEffect, useState } from 'react'

type UseComposerTextareaParams = {
  textareaRef: RefObject<HTMLTextAreaElement | null>
  input: string
  liveUserTranscript: string
  liveAssistantTranscript: string
}

export function useComposerTextarea({
  textareaRef,
  input,
  liveUserTranscript,
  liveAssistantTranscript
}: UseComposerTextareaParams) {
  const [charactersPerLine, setCharactersPerLine] = useState<number>(30)

  useLayoutEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    const update = (width: number) => {
      if (width > 0) setCharactersPerLine(Math.round(width / 8))
    }

    update(textarea.offsetWidth)

    const observer = new ResizeObserver(entries => {
      const width = entries[0]?.contentRect.width
      if (width) update(width)
    })

    observer.observe(textarea)
    return () => observer.disconnect()
  }, [textareaRef])

  useLayoutEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    textarea.style.height = 'auto'
    if (!input && !liveUserTranscript && !liveAssistantTranscript) return
    textarea.style.height = `${Math.min(textarea.scrollHeight, 112)}px`
  }, [textareaRef, input, liveUserTranscript, liveAssistantTranscript])

  // Просто вычисляем — без state, без ref, без эффектов
  const isComposerExpanded =
    input.includes('\n') || input.length > charactersPerLine

  return { isComposerExpanded }
}
