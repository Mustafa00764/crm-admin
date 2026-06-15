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
  const [size, setSize] = useState(0)

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

    textarea.style.height = `${Math.min(textarea.scrollHeight, 112)}px`
  }, [textareaRef, input, liveUserTranscript, liveAssistantTranscript])

  /**
   * Измерение ширины textarea.
   *
   * Важно:
   * - size отсутствует в зависимостях;
   * - setSize отсутствует в зависимостях;
   * - нет повторного setSize после создания observer.
   */
  useLayoutEffect(() => {
    const textarea = textareaRef.current

    if (!textarea) return

    const saveSize = (nextSize: number) => {
      const roundedSize = Math.round(nextSize)

      setSize(currentSize => {
        // Если размер не изменился,
        // React не выполняет лишний рендер.
        if (currentSize === roundedSize) {
          return currentSize
        }

        return roundedSize
      })
    }

    // Первоначальное измерение.
    saveSize(textarea.offsetWidth)

    const resizeObserver = new ResizeObserver(entries => {
      const entry = entries[0]

      if (!entry) return

      // contentRect содержит размер элемента,
      // переданный самим ResizeObserver.
      saveSize(entry.contentRect.width)
    })

    resizeObserver.observe(textarea)

    return () => {
      resizeObserver.disconnect()
    }
  }, [textareaRef])

  const charactersPerLine = Math.floor(size / 8)

  const isComposerExpanded =
    input.length > charactersPerLine || input.includes('\n')

  return {
    size,
    isComposerExpanded
  }
}
