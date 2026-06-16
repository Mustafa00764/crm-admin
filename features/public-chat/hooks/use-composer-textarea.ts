import {
  type RefObject,
  useLayoutEffect,
  useMemo,
  useState,
  useEffect
} from 'react'

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
  const [textareaWidth, setTextareaWidth] = useState(0)
  const [fontSize, setFontSize] = useState(14) // значение по умолчанию

  // Отслеживаем изменение ширины и размера шрифта textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    const updateMetrics = () => {
      setTextareaWidth(textarea.clientWidth)
      const computedStyle = window.getComputedStyle(textarea)
      const size = parseFloat(computedStyle.fontSize) || 14
      setFontSize(size)
    }

    updateMetrics() // начальное значение

    const resizeObserver = new ResizeObserver(() => {
      updateMetrics()
    })
    resizeObserver.observe(textarea)

    return () => {
      resizeObserver.disconnect()
    }
  }, [textareaRef]) // зависимость только от ref

  // Автоматическая регулировка высоты – только по содержимому
  useLayoutEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    if (!input && !liveUserTranscript && !liveAssistantTranscript) {
      textarea.style.height = 'auto'
      return
    }

    textarea.style.height = 'auto'
    textarea.style.height = `${Math.min(textarea.scrollHeight, 112)}px`
  }, [textareaRef, input, liveUserTranscript, liveAssistantTranscript])

  const isComposerExpanded = useMemo(() => {
    // Вычисляем порог на основе ширины и размера шрифта (без обращения к рефу)
    const charWidth = fontSize * 0.6
    const threshold = Math.max(10, Math.floor(textareaWidth / charWidth))
    return input.length > threshold || input.includes('\n')
  }, [input, textareaWidth, fontSize])

  return {
    isComposerExpanded
  }
}
