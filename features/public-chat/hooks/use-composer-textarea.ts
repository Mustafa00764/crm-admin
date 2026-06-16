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

  /**
   * Следим за шириной textarea через ResizeObserver.
   * Textarea не мигает потому что высоту мы не трогаем здесь.
   */
  useLayoutEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    const updateCharactersPerLine = (width: number) => {
      if (width > 0) {
        setCharactersPerLine(Math.round(width / 8))
      }
    }

    // Начальное значение
    updateCharactersPerLine(textarea.offsetWidth)

    const observer = new ResizeObserver(entries => {
      const width = entries[0]?.contentRect.width
      if (width) updateCharactersPerLine(width)
    })

    observer.observe(textarea)

    return () => observer.disconnect()
  }, [textareaRef])

  /**
   * Автоматическое изменение высоты textarea.
   */
  useLayoutEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    textarea.style.height = 'auto'

    if (!input && !liveUserTranscript && !liveAssistantTranscript) {
      return
    }

    const nextHeight = Math.min(textarea.scrollHeight, 112)
    textarea.style.height = `${nextHeight}px`
  }, [textareaRef, input, liveUserTranscript, liveAssistantTranscript])

  const isComposerExpanded =
    input.length > charactersPerLine || input.includes('\n')

  return {
    isComposerExpanded
  }
}
