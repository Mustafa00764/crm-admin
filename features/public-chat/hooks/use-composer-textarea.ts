import {
  type RefObject,
  useLayoutEffect,
  useMemo,
  useState,
  useEffect,
  useRef
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
  const [fontSize, setFontSize] = useState(14)

  // Храним предыдущие значения для сравнения
  const prevMetricsRef = useRef({ width: 0, fontSize: 0 })

  // Отслеживаем ширину и размер шрифта – обновляем только при реальном изменении
  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    const updateMetrics = () => {
      const newWidth = textarea.clientWidth
      const computedStyle = window.getComputedStyle(textarea)
      const newFontSize = parseFloat(computedStyle.fontSize) || 14

      const prev = prevMetricsRef.current
      if (newWidth !== prev.width) {
        prev.width = newWidth
        setTextareaWidth(newWidth)
      }
      if (newFontSize !== prev.fontSize) {
        prev.fontSize = newFontSize
        setFontSize(newFontSize)
      }
    }

    updateMetrics() // начальное значение

    const resizeObserver = new ResizeObserver(() => {
      // Группируем частые вызовы в один кадр, чтобы избежать лишних перерендеров
      requestAnimationFrame(updateMetrics)
    })
    resizeObserver.observe(textarea)

    return () => {
      resizeObserver.disconnect()
    }
  }, [textareaRef]) // зависимость только от ref

  // Автоматическая регулировка высоты – только по содержимому, без зависимости от ширины
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
    const charWidth = fontSize * 0.6
    const threshold = Math.max(10, Math.floor(textareaWidth / charWidth))
    return input.length > threshold || input.includes('\n')
  }, [input, textareaWidth, fontSize])

  return {
    isComposerExpanded
  }
}
