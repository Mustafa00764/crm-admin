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
  const [stableExpanded, setStableExpanded] = useState(false)
  const prevStableRef = useRef(stableExpanded)

  // Отслеживаем ширину и размер шрифта через ResizeObserver с защитой от мелких изменений
  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    let prevWidth = 0
    let prevFontSize = 0

    const updateMetrics = () => {
      const newWidth = textarea.clientWidth
      const computedStyle = window.getComputedStyle(textarea)
      const newFontSize = parseFloat(computedStyle.fontSize) || 14

      if (Math.abs(newWidth - prevWidth) >= 5) {
        prevWidth = newWidth
        setTextareaWidth(newWidth)
      }
      if (Math.abs(newFontSize - prevFontSize) >= 1) {
        prevFontSize = newFontSize
        setFontSize(newFontSize)
      }
    }

    updateMetrics()

    const resizeObserver = new ResizeObserver(() => {
      updateMetrics()
    })
    resizeObserver.observe(textarea)

    return () => {
      resizeObserver.disconnect()
    }
  }, [textareaRef])

  // Автоматическая регулировка высоты (не зависит от ширины)
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

  // Вычисляем текущее состояние expanded без гистерезиса (только порог)
  const currentExpanded = useMemo(() => {
    if (textareaWidth === 0) {
      return input.length > 20 || input.includes('\n')
    }
    const charWidth = fontSize * 0.6
    const threshold = Math.max(10, Math.floor(textareaWidth / charWidth))
    return input.length > threshold || input.includes('\n')
  }, [input, textareaWidth, fontSize])

  // Применяем гистерезис и обновляем stableExpanded только при реальном изменении
  useEffect(() => {
    const prev = prevStableRef.current
    if (currentExpanded === prev) {
      // Состояние не изменилось, ничего не делаем
      return
    }

    // Вычисляем отступ от порога для принятия решения
    const charWidth = fontSize * 0.6
    const threshold = Math.max(10, Math.floor(textareaWidth / charWidth))
    const diff = input.length - threshold

    let newValue: boolean | null = null
    if (currentExpanded && diff > 5) {
      newValue = true
    } else if (!currentExpanded && diff < -5) {
      newValue = false
    }

    if (newValue !== null && newValue !== prev) {
      setStableExpanded(newValue)
      prevStableRef.current = newValue
    }
  }, [currentExpanded, input, fontSize, textareaWidth])

  return {
    isComposerExpanded: stableExpanded
  }
}
