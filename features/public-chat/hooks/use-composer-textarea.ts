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
   * Считаем ширину один раз при маунте.
   */
  useLayoutEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    const width = textarea.offsetWidth
    if (width > 0) {
      setCharactersPerLine(Math.round(width / 8))
    }
  }, [textareaRef]) // только при маунте, зависимостей больше нет

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
