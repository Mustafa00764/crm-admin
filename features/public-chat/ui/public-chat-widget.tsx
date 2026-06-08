'use client'

import * as React from 'react'
import {
  Send,
  X,
  Paperclip,
  Smile,
  ImageIcon,
  Mic,
  MicOff,
  Languages
} from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import Image from 'next/image'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/shared/ui/select'

type PublicChatAttachment = {
  id: string
  name: string
  type: string
  size: number
  dataUrl: string
}

type PublicChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  attachments?: PublicChatAttachment[]
}

type LeadFormData = {
  name: string
  phone: string
  city: string
  comment: string
}

type RealtimeTranslateTokenResponse = {
  value?: string
  error?: string
}

type RealtimeTranslationEvent = {
  type?: string
  delta?: string
  error?: {
    message?: string
  }
}

function uid() {
  return `msg_${Date.now()}_${Math.random().toString(16).slice(2)}`
}

const MAX_FILES = 5
const MAX_FILE_SIZE = 1 * 1024 * 1024 // 1 MB
const REQUIRED_FORM_AFTER_USER_MESSAGES = 4

const TRANSLATION_TARGET_LANGUAGES = [
  { value: 'ru', label: 'Русский' },
  { value: 'en', label: 'English' },
  { value: 'uz', label: 'Uzbek' }
] as const

const DEFAULT_LEAD_FORM: LeadFormData = {
  name: '',
  phone: '',
  city: '',
  comment: ''
}

function getChatStorageKey(siteId: string) {
  return `public-chat-${siteId}-messages`
}

function getLeadFormStorageKey(siteId: string) {
  return `public-chat-${siteId}-lead-form`
}

function getLeadFormSubmittedKey(siteId: string) {
  return `public-chat-${siteId}-lead-form-submitted`
}

function getDefaultMessages(): PublicChatMessage[] {
  return [
    {
      id: uid(),
      role: 'assistant',
      content:
        'Assalomu alaykum! Men Anna 😊 Sizga rus tilida gaplashish qulaymi yoki o‘zbek tilidami? Здравствуйте! Я Анна 😊 Вам удобнее общаться на русском или на узбекском?'
    }
  ]
}

const QUICK_EMOJIS = [
  '😊',
  '🙂',
  '😄',
  '😉',
  '🤝',
  '👍',
  '👌',
  '🙏',
  '✅',
  '☑️',
  '⭐',
  '🔥',
  '💬',
  '📞',
  '📲',
  '📩',
  '📝',
  '📦',
  '🚚',
  '📍',
  '🏠',
  '🏡',
  '🏢',
  '🏗️',
  '🔧',
  '🛠️',
  '🔩',
  '🧱',
  '📐',
  '📏',
  '💰',
  '💳',
  '⏱️',
  '🎨',
  '🇺🇿'
]

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => resolve(String(reader.result))
    reader.onerror = reject

    reader.readAsDataURL(file)
  })
}

function isImageFile(file: PublicChatAttachment) {
  return file.type.startsWith('image/')
}

export function PublicChatWidget({
  siteId,
  theme,
  pageUrl
}: {
  siteId: string
  theme: string
  pageUrl: string
}) {
  const [input, setInput] = React.useState('')
  const [pending, setPending] = React.useState(false)

  const [phoneError, setPhoneError] = React.useState('')

  const [leadFormOpen, setLeadFormOpen] = React.useState(false)

  const [leadFormSubmitted, setLeadFormSubmitted] = React.useState(() => {
    if (typeof window === 'undefined') return false

    try {
      return sessionStorage.getItem(getLeadFormSubmittedKey(siteId)) === 'true'
    } catch {
      return false
    }
  })

  const [leadForm, setLeadForm] = React.useState<LeadFormData>(() => {
    if (typeof window === 'undefined') return DEFAULT_LEAD_FORM

    try {
      const saved = sessionStorage.getItem(getLeadFormStorageKey(siteId))

      if (!saved) return DEFAULT_LEAD_FORM

      return {
        ...DEFAULT_LEAD_FORM,
        ...JSON.parse(saved)
      }
    } catch {
      return DEFAULT_LEAD_FORM
    }
  })

  const [emojiOpen, setEmojiOpen] = React.useState(false)
  const [translationTargetLanguage, setTranslationTargetLanguage] =
    React.useState('ru')
  const [translationActive, setTranslationActive] = React.useState(false)
  const [translationConnecting, setTranslationConnecting] =
    React.useState(false)
  const [translationTranscript, setTranslationTranscript] = React.useState('')
  const [translationError, setTranslationError] = React.useState('')

  const [attachments, setAttachments] = React.useState<PublicChatAttachment[]>(
    []
  )

  const messagesEndRef = React.useRef<HTMLDivElement>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const translationPeerRef = React.useRef<RTCPeerConnection | null>(null)
  const translationChannelRef = React.useRef<RTCDataChannel | null>(null)
  const translationStreamRef = React.useRef<MediaStream | null>(null)
  const translationAudioRef = React.useRef<HTMLAudioElement | null>(null)
  const translationTranscriptRef = React.useRef('')

  const [messages, setMessages] = React.useState<PublicChatMessage[]>(() => {
    const defaultMessages = getDefaultMessages()

    if (typeof window === 'undefined') return defaultMessages

    try {
      const saved = sessionStorage.getItem(getChatStorageKey(siteId))

      if (!saved) return defaultMessages

      const parsed = JSON.parse(saved) as PublicChatMessage[]

      if (!Array.isArray(parsed) || parsed.length === 0) {
        return defaultMessages
      }

      return parsed
    } catch {
      return defaultMessages
    }
  })

  const userMessagesCount = messages.filter(
    message => message.role === 'user'
  ).length

  const shouldBlockChat =
    userMessagesCount >= REQUIRED_FORM_AFTER_USER_MESSAGES && !leadFormSubmitted

  React.useEffect(() => {
    try {
      sessionStorage.setItem(
        getChatStorageKey(siteId),
        JSON.stringify(messages)
      )
    } catch (error) {
      console.error('Local chat save error:', error)
    }
  }, [messages, siteId])

  React.useEffect(() => {
    try {
      sessionStorage.setItem(
        getLeadFormStorageKey(siteId),
        JSON.stringify(leadForm)
      )
    } catch (error) {
      console.error('Lead form save error:', error)
    }
  }, [leadForm, siteId])

  React.useEffect(() => {
    try {
      sessionStorage.setItem(
        getLeadFormSubmittedKey(siteId),
        String(leadFormSubmitted)
      )
    } catch (error) {
      console.error('Lead form submitted save error:', error)
    }
  }, [leadFormSubmitted, siteId])

  async function submitLeadForm() {
    const phone = leadForm.phone.trim()

    if (!phone) {
      setPhoneError('Укажите номер телефона')
      return
    }

    if (!isValidUzPhone(phone)) {
      setPhoneError('Введите номер в формате +998 XX XXX XX XX')
      return
    }

    try {
      await fetch('/api/send-lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phone,
          clientName: leadForm.name,
          deliveryCity: leadForm.city,
          comment: {
            text:
              leadForm.comment ||
              'Форма заполнена после нескольких сообщений в чате',
            pageUrl,
            siteId,
            attachments: []
          }
        })
      })
    } catch (error) {
      console.error('Lead form send error:', error)
    }

    setLeadFormSubmitted(true)
    setLeadFormOpen(false)

    setMessages(current => [
      ...current,
      {
        id: uid(),
        role: 'assistant',
        content:
          'Спасибо, заявку передала менеджеру. Можете продолжать писать здесь — я помогу сориентироваться дальше.'
      }
    ])
  }

  function notifyParent(type: 'open' | 'close') {
    window.parent.postMessage(
      {
        source: 'omni-crm-widget',
        type
      },
      '*'
    )
  }

  function extractPhone(text: string): string | null {
    const phoneRegex =
      /(?:\+?\s*998[\s\-()]*)?(?:\d{2}[\s\-()]*\d{3}[\s\-()]*\d{2}[\s\-()]*\d{2})/

    const match = text.match(phoneRegex)

    if (!match) return null

    const digits = match[0].replace(/\D/g, '')

    if (digits.startsWith('998') && digits.length === 12) {
      return `+${digits}`
    }

    if (digits.length === 9) {
      return `+998${digits}`
    }

    return null
  }

  function openFileDialog() {
    fileInputRef.current?.click()
  }

  async function handleFilesChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || [])

    if (!files.length) return

    const limitedFiles = files.slice(0, MAX_FILES)
    const validFiles = limitedFiles.filter(file => file.size <= MAX_FILE_SIZE)

    if (validFiles.length !== limitedFiles.length) {
      alert(
        'Некоторые файлы слишком большие. Максимальный размер одного файла — 1 MB.'
      )
    }

    if (!validFiles.length) {
      event.target.value = ''
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
      event.target.value = ''
    }
  }

  function removeAttachment(id: string) {
    setAttachments(current => current.filter(file => file.id !== id))
  }

  function addEmoji(emoji: string) {
    setInput(current => `${current}${emoji}`)
    setEmojiOpen(false)
  }

  function appendTranslationDelta(delta: string) {
    setTranslationTranscript(current => {
      const next = `${current}${delta}`
      translationTranscriptRef.current = next
      return next
    })
  }

  function cleanupRealtimeTranslation(commitTranscript = true) {
    translationChannelRef.current?.close()
    translationPeerRef.current?.close()

    translationStreamRef.current?.getTracks().forEach(track => track.stop())

    if (translationAudioRef.current) {
      translationAudioRef.current.pause()
      translationAudioRef.current.srcObject = null
    }

    translationChannelRef.current = null
    translationPeerRef.current = null
    translationStreamRef.current = null
    translationAudioRef.current = null

    setTranslationActive(false)
    setTranslationConnecting(false)

    const translatedText = translationTranscriptRef.current.trim()

    if (commitTranscript && translatedText) {
      setInput(
        current => `${current}${current.trim() ? '\n' : ''}${translatedText}`
      )
    }
  }

  async function startRealtimeTranslation() {
    if (pending || shouldBlockChat || translationConnecting) return

    setTranslationError('')
    setTranslationTranscript('')
    translationTranscriptRef.current = ''
    setTranslationConnecting(true)

    try {
      const tokenResponse = await fetch('/api/realtime-translate/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          siteId,
          pageUrl,
          targetLanguage: translationTargetLanguage
        })
      })

      const tokenData =
        (await tokenResponse.json()) as RealtimeTranslateTokenResponse

      if (!tokenResponse.ok || !tokenData.value) {
        throw new Error(
          tokenData.error || 'Не удалось получить realtime client secret'
        )
      }

      const sourceStream = await navigator.mediaDevices.getUserMedia({
        audio: true
      })

      const peerConnection = new RTCPeerConnection()
      const sourceTrack = sourceStream.getAudioTracks()[0]

      if (!sourceTrack) {
        throw new Error('Микрофон не вернул аудиодорожку')
      }

      peerConnection.addTrack(sourceTrack, sourceStream)

      const translatedAudio = new Audio()
      translatedAudio.autoplay = true

      peerConnection.ontrack = ({ streams }) => {
        translatedAudio.srcObject = streams[0]
        void translatedAudio.play().catch(() => {
          setTranslationError(
            'Браузер заблокировал автозапуск звука. Нажмите на страницу и попробуйте ещё раз.'
          )
        })
      }

      const events = peerConnection.createDataChannel('oai-events')

      events.onmessage = ({ data }) => {
        try {
          const event = JSON.parse(String(data)) as RealtimeTranslationEvent

          if (
            event.type === 'session.output_transcript.delta' &&
            typeof event.delta === 'string'
          ) {
            appendTranslationDelta(event.delta)
          }

          if (event.type === 'error') {
            setTranslationError(
              event.error?.message || 'Realtime translation error'
            )
          }
        } catch (error) {
          console.error('Realtime translation event parse error:', error)
        }
      }

      translationPeerRef.current = peerConnection
      translationChannelRef.current = events
      translationStreamRef.current = sourceStream
      translationAudioRef.current = translatedAudio

      const offer = await peerConnection.createOffer()
      await peerConnection.setLocalDescription(offer)

      const sdpResponse = await fetch(
        'https://api.openai.com/v1/realtime/translations/calls',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${tokenData.value}`,
            'Content-Type': 'application/sdp'
          },
          body: offer.sdp || ''
        }
      )

      if (!sdpResponse.ok) {
        throw new Error(await sdpResponse.text())
      }

      await peerConnection.setRemoteDescription({
        type: 'answer',
        sdp: await sdpResponse.text()
      })

      setTranslationActive(true)
    } catch (error) {
      console.error('Realtime translation start error:', error)

      cleanupRealtimeTranslation(false)

      setTranslationError(
        error instanceof Error
          ? error.message
          : 'Не удалось запустить голосовой перевод'
      )
    } finally {
      setTranslationConnecting(false)
    }
  }

  function toggleRealtimeTranslation() {
    if (translationActive || translationConnecting) {
      cleanupRealtimeTranslation(true)
      return
    }

    void startRealtimeTranslation()
  }

  const sendMessage = React.useCallback(async () => {
    const text = input.trim()

    if (shouldBlockChat) {
      setLeadFormOpen(true)

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

        setPending(false)
        return
      }

      const answer =
        data.text ||
        'Сейчас не удалось получить ответ. Оставьте телефон, менеджер свяжется с вами.'

      setTimeout(
        () => {
          setMessages(current => [
            ...current,
            {
              id: uid(),
              role: 'assistant',
              content: answer
            }
          ])

          setPending(false)
        },
        Math.floor(answer.length * 80) + 500
      )

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

      setPending(false)
    }
  }, [input, attachments, pending, siteId, pageUrl, messages, shouldBlockChat])

  const scrollToBottom = () => {
    const el = messagesEndRef.current

    if (!el) return

    el.scrollTop = el.scrollHeight
  }

  React.useEffect(() => {
    requestAnimationFrame(scrollToBottom)
  }, [messages, pending])

  React.useEffect(() => {
    return () => {
      cleanupRealtimeTranslation(false)
    }
  }, [])

  function formatUzPhone(value: string) {
    let digits = value.replace(/\D/g, '')

    if (digits.startsWith('998')) {
      digits = digits.slice(3)
    }

    digits = digits.slice(0, 9)

    const operator = digits.slice(0, 2)
    const part1 = digits.slice(2, 5)
    const part2 = digits.slice(5, 7)
    const part3 = digits.slice(7, 9)

    let result = '+998'

    if (operator) result += ` ${operator}`
    if (part1) result += ` ${part1}`
    if (part2) result += ` ${part2}`
    if (part3) result += ` ${part3}`

    return result
  }

  function isValidUzPhone(value: string) {
    const digits = value.replace(/\D/g, '')
    return digits.startsWith('998') && digits.length === 12
  }

  return (
    <div
      className={cn(
        'max-w-120 min-h-155 max-h-155 flex h-full w-full flex-col overflow-hidden rounded-[17.5px] border pointer-events-auto',
        theme === 'light'
          ? 'bg-white text-slate-950 border-black/10'
          : 'bg-[#090b10] text-white border-white/10'
      )}
    >
      <div
        className={cn(
          'flex h-14 items-center justify-between border-b px-4',
          theme === 'light' ? 'border-black/10' : 'border-white/10'
        )}
      >
        <div className="flex items-center gap-3">
          <Image
            unoptimized
            width={40}
            height={40}
            src="/images/assistant-2.png"
            alt="assistant"
            className="w-10 h-10 object-cover object-top rounded-full"
          />

          <div className="flex flex-col gap-1">
            <div className="text-[14px] leading-4 opacity-100 font-semibold">
              Анна
            </div>

            <div className="text-xs opacity-60 leading-3">
              Онлайн-консультант
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => notifyParent('close')}
          className="rounded-md p-2 opacity-70 hover:bg-white/10 hover:opacity-100"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div
        ref={messagesEndRef}
        className={cn(
          'min-h-0 transition-all flex-1 space-y-3 overflow-auto p-3 scrollbar-thin scrollbar-thumb-rounded scrollbar-track-transparent',
          theme === 'light'
            ? 'scrollbar-thumb-black/10'
            : 'scrollbar-thumb-white/20'
        )}
      >
        {messages.map(message => (
          <div
            key={message.id}
            className={cn(
              'flex',
              message.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            <div
              className={cn(
                'max-w-[82%] rounded-2xl px-3 py-2 text-sm leading-5',
                message.role === 'user'
                  ? 'bg-[#08b7ef] text-white'
                  : theme === 'light'
                    ? 'bg-slate-100 text-slate-900'
                    : 'bg-white/10 text-white'
              )}
            >
              {message.attachments?.length ? (
                <div className="mt-2 grid gap-2">
                  {message.attachments.map(file =>
                    isImageFile(file) ? (
                      <Image
                        unoptimized
                        width={60}
                        height={60}
                        key={file.id}
                        src={file.dataUrl}
                        alt={file.name}
                        className="max-h-40 rounded-xl object-cover"
                      />
                    ) : (
                      <div
                        key={file.id}
                        className="rounded-lg bg-black/10 px-2 py-1 text-xs"
                      >
                        📎 {file.name}
                      </div>
                    )
                  )}
                </div>
              ) : null}

              {message.content ? <div>{message.content}</div> : null}
            </div>
          </div>
        ))}

        {pending ? (
          <div
            className={cn(
              'text-xs w-[50%] flex items-end',
              theme === 'light' ? ' text-slate-900/60' : ' text-white/60'
            )}
          >
            <p>Анна печатает</p>

            <svg
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              className="h-2.5 ml-0.5"
            >
              <circle cx="4" cy="12" r="3">
                <animate
                  id="spinner_qFRN"
                  begin="0;spinner_OcgL.end+0.25s"
                  attributeName="cy"
                  calcMode="spline"
                  dur="0.6s"
                  values="12;6;12"
                  keySplines=".33,.66,.66,1;.33,0,.66,.33"
                />
              </circle>
              <circle cx="12" cy="12" r="3">
                <animate
                  begin="spinner_qFRN.begin+0.1s"
                  attributeName="cy"
                  calcMode="spline"
                  dur="0.6s"
                  values="12;6;12"
                  keySplines=".33,.66,.66,1;.33,0,.66,.33"
                />
              </circle>
              <circle cx="20" cy="12" r="3">
                <animate
                  id="spinner_OcgL"
                  begin="spinner_qFRN.begin+0.2s"
                  attributeName="cy"
                  calcMode="spline"
                  dur="0.6s"
                  values="12;6;12"
                  keySplines=".33,.66,.66,1;.33,0,.66,.33"
                />
              </circle>
            </svg>
          </div>
        ) : null}
      </div>

      {leadFormOpen || shouldBlockChat ? (
        <div
          className={cn(
            'border-t p-3',
            theme === 'light'
              ? 'border-black/10 bg-slate-50'
              : 'border-white/10 bg-white/5'
          )}
        >
          <div className="mb-2 text-sm font-semibold">
            Заполните форму, чтобы продолжить консультацию
          </div>

          <div
            className={cn(
              'mb-3 text-xs leading-4',
              theme === 'light' ? 'text-slate-500' : 'text-white/60'
            )}
          >
            Номер телефона обязателен. Остальные поля можно заполнить по
            желанию.
          </div>

          <div className="grid gap-2">
            <div className="grid gap-1">
              <input
                value={leadForm.phone}
                inputMode="tel"
                autoComplete="tel"
                maxLength={17}
                onChange={event => {
                  const formattedPhone = formatUzPhone(event.target.value)

                  setLeadForm(current => ({
                    ...current,
                    phone: formattedPhone
                  }))

                  if (phoneError) {
                    setPhoneError('')
                  }
                }}
                onBlur={() => {
                  if (leadForm.phone && !isValidUzPhone(leadForm.phone)) {
                    setPhoneError('Введите номер в формате +998 XX XXX XX XX')
                  }
                }}
                placeholder="+998 90 123 45 67"
                className={cn(
                  'h-10 rounded-xl border px-3 text-sm outline-none transition',
                  phoneError
                    ? 'border-red-500 bg-red-50 text-red-900'
                    : theme === 'light'
                      ? 'border-slate-200 bg-white text-slate-950'
                      : 'border-white/10 bg-[#090b10] text-white'
                )}
              />

              {phoneError ? (
                <p className="px-1 text-xs text-red-500">{phoneError}</p>
              ) : null}
            </div>

            <textarea
              value={leadForm.comment}
              rows={2}
              onChange={event =>
                setLeadForm(current => ({
                  ...current,
                  comment: event.target.value
                }))
              }
              placeholder="Комментарий к заявке"
              className={cn(
                'resize-none rounded-xl border px-3 py-2 text-sm outline-none',
                theme === 'light'
                  ? 'border-slate-200 bg-white text-slate-950'
                  : 'border-white/10 bg-[#090b10] text-white'
              )}
            />

            <button
              type="button"
              onClick={() => void submitLeadForm()}
              className="h-10 rounded-xl bg-[#08b7ef] text-sm font-semibold text-white"
            >
              Отправить и продолжить
            </button>
          </div>
        </div>
      ) : null}

      <div
        className={cn(
          'border-t p-3',
          theme === 'light' ? 'border-black/10' : 'border-white/10'
        )}
      >
        {attachments.length ? (
          <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
            {attachments.map(file => (
              <div
                key={file.id}
                className={cn(
                  'relative flex min-w-16 max-w-28 flex-col gap-1 rounded-xl border p-1 text-xs',
                  theme === 'light'
                    ? 'border-slate-200 bg-slate-50'
                    : 'border-white/10 bg-white/5'
                )}
              >
                <button
                  type="button"
                  onClick={() => removeAttachment(file.id)}
                  className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white"
                >
                  <X className="h-3 w-3" />
                </button>

                {isImageFile(file) ? (
                  <Image
                    unoptimized
                    width={56}
                    height={56}
                    src={file.dataUrl}
                    alt={file.name}
                    className="h-14 w-14 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-14 w-20 items-center justify-center rounded-lg bg-black/10">
                    <Paperclip className="h-5 w-5 opacity-70" />
                  </div>
                )}

                <div className="truncate">{file.name}</div>
              </div>
            ))}
          </div>
        ) : null}

        {emojiOpen ? (
          <div
            className={cn(
              'mb-2 flex flex-wrap gap-1 rounded-xl border p-2',
              theme === 'light'
                ? 'border-slate-200 bg-slate-50'
                : 'border-white/10 bg-white/5'
            )}
          >
            {QUICK_EMOJIS.map(emoji => (
              <button
                key={emoji}
                type="button"
                onClick={() => addEmoji(emoji)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-lg hover:bg-black/10"
              >
                {emoji}
              </button>
            ))}
          </div>
        ) : null}

        <div
          className={cn(
            'mb-2 flex items-center gap-2 text-xs',
            theme === 'light' ? 'text-slate-500' : 'text-white/50'
          )}
        >
          <Languages className="h-3.5 w-3.5" />
          <span>Голосовой перевод в:</span>

          <Select
            value={translationTargetLanguage}
            disabled={translationActive || translationConnecting}
            onValueChange={setTranslationTargetLanguage}
          >
            <SelectTrigger
              className={cn(
                'h-10 w-[150px] border px-3 text-sm outline-none focus:ring-0 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-60',
                theme === 'light'
                  ? 'border-slate-200 bg-white text-slate-950 hover:bg-slate-50 [&_svg]:text-slate-500'
                  : 'border-white/10 bg-white/5 text-white hover:bg-white/10 [&_svg]:text-white/70'
              )}
            >
              <span className="flex min-w-0 items-center gap-2">
                <span className="min-w-0 truncate">
                  <SelectValue placeholder="Язык" />
                </span>
              </span>
            </SelectTrigger>

            <SelectContent
              className={cn(
                'border ',
                theme === 'light'
                  ? 'border-slate-200 bg-white text-slate-950'
                  : 'border-white/10 bg-[#090b10] text-white'
              )}
            >
              {TRANSLATION_TARGET_LANGUAGES.map(language => (
                <SelectItem
                  key={language.value}
                  value={language.value}
                  textValue={language.label}
                  className={cn(
                    'text-sm',
                    theme === 'light'
                      ? 'text-slate-950 focus:bg-slate-100 focus:text-slate-950 data-[highlighted]:bg-slate-100 data-[highlighted]:text-slate-950'
                      : 'text-white focus:bg-white/10 focus:text-white data-[highlighted]:bg-white/10 data-[highlighted]:text-white'
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span>{language.label}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {translationTranscript || translationError || translationActive ? (
          <div
            className={cn(
              'mb-2 rounded-xl border px-3 py-2 text-xs leading-4',
              theme === 'light'
                ? 'border-slate-200 bg-slate-50 text-slate-600'
                : 'border-white/10 bg-white/5 text-white/70'
            )}
          >
            {translationActive || translationConnecting ? (
              <div className="font-medium">
                {translationConnecting
                  ? 'Подключаю голосовой перевод...'
                  : 'Голосовой перевод активен. Нажмите микрофон ещё раз, чтобы остановить.'}
              </div>
            ) : null}

            {translationTranscript ? (
              <div className="mt-1 whitespace-pre-wrap">
                {translationTranscript}
              </div>
            ) : null}

            {translationError ? (
              <div className="mt-1 text-red-500">{translationError}</div>
            ) : null}
          </div>
        ) : null}

        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
            onChange={handleFilesChange}
            className="hidden"
          />

          <button
            type="button"
            onClick={openFileDialog}
            disabled={pending || shouldBlockChat}
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-xl border disabled:opacity-50',
              theme === 'light'
                ? 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                : 'border-white/10 bg-white/5 text-white hover:bg-white/10'
            )}
            title="Прикрепить файл"
          >
            <Paperclip className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => setEmojiOpen(current => !current)}
            disabled={pending || shouldBlockChat}
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-xl border disabled:opacity-50',
              theme === 'light'
                ? 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                : 'border-white/10 bg-white/5 text-white hover:bg-white/10'
            )}
            title="Смайлики"
          >
            <Smile className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={toggleRealtimeTranslation}
            disabled={pending || shouldBlockChat}
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-xl border disabled:opacity-50',
              translationActive || translationConnecting
                ? 'border-red-500 bg-red-500 text-white'
                : theme === 'light'
                  ? 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  : 'border-white/10 bg-white/5 text-white hover:bg-white/10'
            )}
            title={
              translationActive || translationConnecting
                ? 'Остановить голосовой перевод'
                : 'Голосовой перевод через gpt-realtime-translate'
            }
          >
            {translationActive || translationConnecting ? (
              <MicOff className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </button>

          <textarea
            value={input}
            rows={1}
            disabled={shouldBlockChat}
            onChange={event => setInput(event.target.value)}
            onKeyDown={event => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                void sendMessage()
              }
            }}
            placeholder={
              shouldBlockChat
                ? 'Заполните форму, чтобы продолжить...'
                : 'Введите сообщение...'
            }
            className={cn(
              'min-h-10 flex-1 resize-none rounded-xl border px-3 py-2 text-sm outline-none disabled:opacity-60',
              theme === 'light'
                ? 'border-slate-200 bg-white text-slate-950'
                : 'border-white/10 bg-white/5 text-white'
            )}
          />

          <button
            type="button"
            disabled={
              pending ||
              shouldBlockChat ||
              (!input.trim() && attachments.length === 0)
            }
            onClick={() => void sendMessage()}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#08b7ef] text-white disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>

        <div
          className={cn(
            'mt-1 flex items-center gap-1 text-[11px]',
            theme === 'light' ? 'text-slate-400' : 'text-white/35'
          )}
        >
          <ImageIcon className="h-3 w-3" />
          <span>Можно прикрепить фото, PDF, документы или таблицы</span>
        </div>
      </div>
    </div>
  )
}
