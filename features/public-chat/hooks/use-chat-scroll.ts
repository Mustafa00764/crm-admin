import { type RefObject, useCallback, useEffect, useLayoutEffect } from 'react'

type UseChatScrollParams = {
  messagesEndRef: RefObject<HTMLDivElement | null>
  messagesLength: number
  pending: boolean
  liveUserTranscript: string
  liveAssistantTranscript: string
}

export function useChatScroll({
  messagesEndRef,
  messagesLength,
  pending,
  liveUserTranscript,
  liveAssistantTranscript
}: UseChatScrollParams) {
  const scrollToBottom = useCallback(() => {
    const el = messagesEndRef.current

    if (!el) return

    el.scrollTop = el.scrollHeight
  }, [messagesEndRef])

  useEffect(() => {
    requestAnimationFrame(scrollToBottom)
  }, [messagesLength, pending, scrollToBottom])

  useLayoutEffect(() => {
    scrollToBottom()
  }, [liveUserTranscript, liveAssistantTranscript, scrollToBottom])
}