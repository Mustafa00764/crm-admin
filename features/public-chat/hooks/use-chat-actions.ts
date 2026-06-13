import {
  type Dispatch,
  type RefObject,
  type SetStateAction,
  useCallback
} from 'react'
import { uid } from '../lib/uid'
import { extractPhone } from '../lib/phone'
import { fileToDataUrl } from '../lib/attachments'
import { MAX_FILES, MAX_FILE_SIZE } from '../config/public-chat-config'
import type {
  PublicChatAttachment,
  PublicChatMessage
} from '../model/chat.types'

type UseChatActionsParams = {
  input: string
  attachments: PublicChatAttachment[]
  pending: boolean
  siteId: string
  pageUrl: string
  messages: PublicChatMessage[]
  shouldBlockChat: boolean

  textareaRef: RefObject<HTMLTextAreaElement | null>
  messagesEndRef: RefObject<HTMLDivElement | null>
  fileInputRef: RefObject<HTMLInputElement | null>

  setInput: Dispatch<SetStateAction<string>>
  setAttachments: Dispatch<SetStateAction<PublicChatAttachment[]>>
  setEmojiOpen: Dispatch<SetStateAction<boolean>>
  setPending: Dispatch<SetStateAction<boolean>>
  setMessages: Dispatch<SetStateAction<PublicChatMessage[]>>
  setLeadFormOpen: Dispatch<SetStateAction<boolean>>
  setFormState: Dispatch<SetStateAction<'open' | 'close'>>
}

export function useChatActions({
  input,
  attachments,
  pending,
  siteId,
  pageUrl,
  messages,
  shouldBlockChat,
  textareaRef,
  fileInputRef,
  setInput,
  setAttachments,
  setEmojiOpen,
  setPending,
  setMessages,
  setLeadFormOpen,
  setFormState
}: UseChatActionsParams) {
  const notifyParent = useCallback((type: 'open' | 'close') => {
    window.parent.postMessage(
      {
        source: 'omni-crm-widget',
        type
      },
      '*'
    )
  }, [])

  const addEmoji = useCallback(
    (emoji: string) => {
      setInput(current => `${current}${emoji}`)
      setEmojiOpen(false)
    },
    [setInput, setEmojiOpen]
  )


  const openFileDialog = useCallback(() => {
    fileInputRef.current?.click()
  }, [fileInputRef])

  const removeAttachment = useCallback(
    (id: string) => {
      setAttachments(current => current.filter(file => file.id !== id))
    },
    [setAttachments]
  )

  const handleFilesChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.currentTarget.files ?? [])

      if (!files.length) return

      const limitedFiles = files.slice(0, MAX_FILES)
      const validFiles = limitedFiles.filter(file => file.size <= MAX_FILE_SIZE)

      if (validFiles.length !== limitedFiles.length) {
        alert(
          'Некоторые файлы слишком большие. Максимальный размер одного файла — 1 MB.'
        )
      }

      if (!validFiles.length) {
        event.currentTarget.value = ''
        return
      }

      try {
        const preparedFiles = await Promise.all(
          validFiles.map(async file => {
            const dataUrl = await fileToDataUrl(file)

            return {
              id: uid(),
              name: file.name,
              type: file.type || 'application/octet-stream',
              size: file.size,
              dataUrl
            }
          })
        )

        setAttachments(current =>
          [...current, ...preparedFiles].slice(0, MAX_FILES)
        )
      } catch (error) {
        console.error('File reading error:', error)
        alert('Не удалось прочитать файл. Попробуйте выбрать другой файл.')
      } finally {
        event.currentTarget.value = ''
      }
    },
    [setAttachments]
  )

  const sendMessage = useCallback(async () => {
    const text = input.trim()

    if (shouldBlockChat) {
      setLeadFormOpen(true)
      setFormState('open')

      setMessages(current => {
        const alreadyHasBlockMessage = current.some(
          message =>
            message.role === 'assistant' &&
            message.content.includes('Чтобы продолжить консультацию')
        )

        if (alreadyHasBlockMessage) return current

        return [
          ...current,
          {
            id: uid(),
            role: 'assistant',
            content:
              'Чтобы продолжить консультацию, пожалуйста, заполните короткую форму. Менеджер сможет точнее рассчитать заказ и связаться с вами.'
          }
        ]
      })

      return
    }

    if ((!text && attachments.length === 0) || pending) return

    const currentAttachments = attachments

    const userMessage: PublicChatMessage = {
      id: uid(),
      role: 'user',
      content: text,
      attachments: currentAttachments
    }

    setInput('')

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }

    setAttachments([])
    setEmojiOpen(false)
    setMessages(current => [...current, userMessage])
    setPending(true)

    try {
      const response = await fetch('/api/public-chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          siteId,
          pageUrl,
          messages: [...messages, userMessage].map(message => ({
            role: message.role,
            content: message.content,
            attachments: message.attachments?.map(file => ({
              name: file.name,
              type: file.type,
              size: file.size,
              dataUrl: file.dataUrl
            }))
          }))
        })
      })

      let data: {
        text?: string
        error?: string
      }

      try {
        data = await response.json()
      } catch {
        data = {
          error: 'API вернул не JSON. Проверь /api/public-chat/message.'
        }
      }

      if (!response.ok) {
        console.error('Public chat API error:', data.error)

        setMessages(current => [
          ...current,
          {
            id: uid(),
            role: 'assistant',
            content: `Ошибка API: ${data.error || 'Неизвестная ошибка'}`
          }
        ])

        return
      }

      const answer =
        data.text ||
        'Сейчас не удалось получить ответ. Оставьте телефон, менеджер свяжется с вами.'

      setMessages(current => [
        ...current,
        {
          id: uid(),
          role: 'assistant',
          content: answer
        }
      ])

      const phone = extractPhone(text)

      if (phone) {
        try {
          await fetch('/api/send-lead', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              phone,
              messages,
              comment: {
                text,
                pageUrl,
                siteId,
                attachments: currentAttachments.map(file => ({
                  name: file.name,
                  type: file.type,
                  size: file.size
                }))
              }
            })
          })
        } catch (leadError) {
          console.error('Send lead error:', leadError)
        }
      }
    } catch (error) {
      console.error('Public chat request failed:', error)

      setMessages(current => [
        ...current,
        {
          id: uid(),
          role: 'assistant',
          content:
            'Не удалось соединиться с сервером чата. Проверьте /api/public-chat/message и OPENAI_API_KEY.'
        }
      ])
    } finally {
      setPending(false)
    }
  }, [
    input,
    attachments,
    pending,
    siteId,
    pageUrl,
    messages,
    shouldBlockChat,
    textareaRef,
    setInput,
    setAttachments,
    setEmojiOpen,
    setPending,
    setMessages,
    setLeadFormOpen,
    setFormState
  ])

  return {
    notifyParent,
    addEmoji,
    openFileDialog,
    handleFilesChange,
    removeAttachment,
    sendMessage
  }
}
