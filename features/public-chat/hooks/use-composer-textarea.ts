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
  const [fontSize, setFontSize] = useState(14)

  // Измеряем ширину и шрифт только при монтировании и при изменении размера окна
  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    const measure = () => {
      const width = textarea.clientWidth
      const computedStyle = window.getComputedStyle(textarea)
      const size = parseFloat(computedStyle.fontSize) || 14
      setTextareaWidth(width)
      setFontSize(size)
    }

    measure()

    const handleResize = () => {
      measure()
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [textareaRef]) // Зависимость только от ref – выполняется один раз при монтировании

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
    // Если ширина ещё не измерена – используем запасной порог 20 символов
    if (textareaWidth === 0) {
      return input.length > 20 || input.includes('\n')
    }
    const charWidth = fontSize * 0.6
    const threshold = Math.max(10, Math.floor(textareaWidth / charWidth))
    return input.length > threshold || input.includes('\n')
  }, [input, textareaWidth, fontSize])

  return {
    isComposerExpanded
  }
}
