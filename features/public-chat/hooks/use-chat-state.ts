import { useMemo, useState } from 'react'
import type {
  PublicChatAttachment,
  PublicChatMessage
} from '../model/chat.types'
import { getDefaultMessages } from '../lib/storage'
import { REQUIRED_FORM_AFTER_USER_MESSAGES } from '../config/public-chat-config'

type UseChatStateParams = {
  leadFormSubmitted: boolean
  pageUrl: string
}

export function useChatState({ leadFormSubmitted, pageUrl }: UseChatStateParams) {
  const [input, setInput] = useState('')
  const [pending, setPending] = useState(false)

  const [messages, setMessages] = useState<PublicChatMessage[]>(() =>
    getDefaultMessages(pageUrl)
  )

  const [attachments, setAttachments] = useState<PublicChatAttachment[]>([])
  const [emojiOpen, setEmojiOpen] = useState(false)
  const [hasHydrated, setHasHydrated] = useState(false)

  const userMessagesCount = useMemo(
    () => messages.filter(message => message.role === 'user').length,
    [messages]
  )

  const shouldBlockChat =
    userMessagesCount >= REQUIRED_FORM_AFTER_USER_MESSAGES && !leadFormSubmitted

  return {
    input,
    setInput,

    pending,
    setPending,

    messages,
    setMessages,

    attachments,
    setAttachments,

    emojiOpen,
    setEmojiOpen,

    hasHydrated,
    setHasHydrated,

    userMessagesCount,
    shouldBlockChat
  }
}
