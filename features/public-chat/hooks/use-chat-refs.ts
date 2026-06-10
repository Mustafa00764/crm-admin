import { useRef } from 'react'

export function useChatRefs() {
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  return {
    messagesEndRef,
    fileInputRef,
    textareaRef
  }
}