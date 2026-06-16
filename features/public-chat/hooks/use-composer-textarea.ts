import { type RefObject, useLayoutEffect, useMemo } from 'react'

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
    return input.length > 20 || input.includes('\n')
  }, [input])

  return {
    isComposerExpanded
  }
}
