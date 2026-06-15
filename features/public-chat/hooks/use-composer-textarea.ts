import { type RefObject, useLayoutEffect, useMemo, useState } from 'react'

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
  /**
   * Здесь хранится актуальная ширина textarea.
   *
   * Начальное значение 0 используется до того,
   * как textarea появится в DOM.
   */
  const [size, setSize] = useState(0)

  /**
   * Изменяем высоту textarea в зависимости
   * от количества введённого текста.
   */
  useLayoutEffect(() => {
    const textarea = textareaRef.current

    if (!textarea) return

    // Сбрасываем высоту, чтобы textarea могла
    // не только увеличиваться, но и уменьшаться.
    textarea.style.height = 'auto'

    if (!input && !liveUserTranscript && !liveAssistantTranscript) {
      return
    }

    textarea.style.height = `${Math.min(textarea.scrollHeight, 112)}px`
  }, [textareaRef, input, liveUserTranscript, liveAssistantTranscript])

  /**
   * Измеряем ширину textarea.
   *
   * ResizeObserver нужен, потому что ширина может
   * измениться после изменения размера окна чата.
   */
  useLayoutEffect(() => {
    const textarea = textareaRef.current

    if (!textarea) return

    const updateSize = () => {
      const nextSize = textarea.offsetWidth

      // Не вызываем лишний рендер,
      // если ширина осталась прежней.
      setSize(currentSize => {
        return currentSize === nextSize ? currentSize : nextSize
      })
    }

    // Получаем первоначальную ширину.
    updateSize()

    // Следим за дальнейшими изменениями ширины.
    const resizeObserver = new ResizeObserver(updateSize)

    resizeObserver.observe(textarea)

    if (!textarea) return

    setSize(textarea.offsetWidth)
    console.log(textarea.offsetWidth)

    return () => {
      resizeObserver.disconnect()
    }
  }, [textareaRef, size, setSize])

  const isComposerExpanded = useMemo(() => {
    const num = Math.round(size / 8)
    return input.length > num || input.includes('\n')
  }, [input, size])

  return {
    size,
    isComposerExpanded
  }
}
