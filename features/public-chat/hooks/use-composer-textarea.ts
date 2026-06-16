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
  const [size, setSize] = useState<number>(0)

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

  /**
   * Получение и отслеживание ширины textarea.
   */
  useLayoutEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    setSize(textarea.offsetWidth)
  }, [textareaRef, input])

  /**
   * Пока ширина ещё не измерена,
   * используем минимальное значение 8.
   */
  const charactersPerLine = Math.max(8, Math.round(size / 12))

  const isComposerExpanded =
    input.length > charactersPerLine || input.includes('\n')

  return {
    size,
    isComposerExpanded
  }
}
