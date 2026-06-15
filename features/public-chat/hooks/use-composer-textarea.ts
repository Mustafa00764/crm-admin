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

    const nextHeight = Math.min(textarea.scrollHeight, 112)

    textarea.style.height = `${nextHeight}px`
  }, [textareaRef, input, liveUserTranscript, liveAssistantTranscript])

  /**
   * Получение и отслеживание ширины textarea.
   */
  useLayoutEffect(() => {
    const textarea = textareaRef.current

    if (!textarea) return

    let animationFrameId: number | null = null

    const updateSize = () => {
      const nextSize = Math.round(textarea.offsetWidth)

      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId)
      }

      animationFrameId = requestAnimationFrame(() => {
        setSize(currentSize => {
          if (currentSize === nextSize) {
            return currentSize
          }

          return nextSize
        })
      })
    }

    // Первоначальное измерение.
    updateSize()

    const resizeObserver = new ResizeObserver(() => {
      updateSize()
    })

    resizeObserver.observe(textarea)

    return () => {
      resizeObserver.disconnect()

      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [textareaRef])

  /**
   * Пока ширина ещё не измерена,
   * используем минимальное значение 12.
   */
  const charactersPerLine = size > 0 ? Math.max(12, Math.round(size / 8)) : 12

  const isComposerExpanded =
    input.length > charactersPerLine || input.includes('\n')

  return {
    size,
    isComposerExpanded
  }
}
