'use client'

import * as React from 'react'
import {
  Send,
  X,
  Paperclip,
  Smile,
  ImageIcon,
  Mic,
  AudioLines,
  Keyboard,
  Square
} from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import Image from 'next/image'

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

type RealtimeEvent = {
  type?: string
  delta?: string
  transcript?: string
  text?: string
  item_id?: string
  response?: {
    id?: string
    output?: Array<{
      content?: Array<{
        transcript?: string
        text?: string
      }>
    }>
  }
  error?: {
    message?: string
    code?: string
  }
}

type VoiceMode = 'idle' | 'assistant' | 'dictation'

type DictationLanguage = 'ru' | 'uz' | 'en' | 'auto'

function uid() {
  return `msg_${Date.now()}_${Math.random().toString(16).slice(2)}`
}

const MAX_FILES = 5
const MAX_FILE_SIZE = 1 * 1024 * 1024 // 1 MB
const REQUIRED_FORM_AFTER_USER_MESSAGES = 4

const DICTATION_LANGUAGES: Array<{ value: DictationLanguage; label: string }> =
  [
    { value: 'auto', label: 'Авто' },
    { value: 'ru', label: 'RU' },
    { value: 'uz', label: 'UZ' },
    { value: 'en', label: 'EN' }
  ]

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

function normalizeTranscript(text: string) {
  return text.replace(/\s+/g, ' ').trim()
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
  const [voiceMode, setVoiceMode] = React.useState<VoiceMode>('idle')
  const [voiceConnecting, setVoiceConnecting] = React.useState(false)
  const [voiceStatus, setVoiceStatus] = React.useState('')
  const [voiceError, setVoiceError] = React.useState('')
  const [liveUserTranscript, setLiveUserTranscript] = React.useState('')
  const [liveAssistantTranscript, setLiveAssistantTranscript] =
    React.useState('')
  const [dictationText, setDictationText] = React.useState('')
  const [dictationLanguage, setDictationLanguage] =
    React.useState<DictationLanguage>('auto')

  const [attachments, setAttachments] = React.useState<PublicChatAttachment[]>(
    []
  )

  const messagesEndRef = React.useRef<HTMLDivElement>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const voicePeerRef = React.useRef<RTCPeerConnection | null>(null)
  const voiceChannelRef = React.useRef<RTCDataChannel | null>(null)
  const voiceStreamRef = React.useRef<MediaStream | null>(null)
  const voiceAudioRef = React.useRef<HTMLAudioElement | null>(null)
  const assistantTranscriptRef = React.useRef('')
  const dictationTranscriptRef = React.useRef('')
  const committedUserItemsRef = React.useRef(new Set<string>())
  const voiceModeRef = React.useRef<VoiceMode>('idle')
  const dictationStoppingRef = React.useRef(false)
  const dictationStopTimeoutRef = React.useRef<number | null>(null)

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
    voiceModeRef.current = voiceMode
  }, [voiceMode])

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
    const files = Array.from(event.currentTarget.files ?? []) as File[]

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
  }

  function removeAttachment(id: string) {
    setAttachments(current => current.filter(file => file.id !== id))
  }

  function addEmoji(emoji: string) {
    setInput(current => `${current}${emoji}`)
    setEmojiOpen(false)
  }

  async function sendLeadFromRealtimeTranscript(text: string) {
    const phone = extractPhone(text)

    if (!phone) return

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
            source: 'realtime-voice',
            attachments: []
          }
        })
      })
    } catch (error) {
      console.error('Realtime lead send error:', error)
    }
  }

  function cleanupRealtime(commitDictation = true) {
    const mode = voiceModeRef.current

    if (dictationStopTimeoutRef.current) {
      window.clearTimeout(dictationStopTimeoutRef.current)
      dictationStopTimeoutRef.current = null
    }

    if (mode === 'dictation' && commitDictation) {
      const text = normalizeTranscript(dictationTranscriptRef.current)

      if (text) {
        setInput(current => `${current}${current.trim() ? ' ' : ''}${text}`)
      }
    }

    try {
      voiceChannelRef.current?.close()
    } catch {
      // already closed
    }

    try {
      voicePeerRef.current?.getSenders().forEach(sender => sender.track?.stop())
      voicePeerRef.current?.close()
    } catch {
      // already closed
    }

    voiceStreamRef.current?.getTracks().forEach(track => track.stop())

    if (voiceAudioRef.current) {
      voiceAudioRef.current.pause()
      voiceAudioRef.current.srcObject = null
    }

    voicePeerRef.current = null
    voiceChannelRef.current = null
    voiceStreamRef.current = null
    voiceAudioRef.current = null
    assistantTranscriptRef.current = ''
    dictationTranscriptRef.current = ''
    dictationStoppingRef.current = false
    committedUserItemsRef.current.clear()
    voiceModeRef.current = 'idle'

    setVoiceMode('idle')
    setVoiceConnecting(false)
    setVoiceStatus('')
    setLiveUserTranscript('')
    setLiveAssistantTranscript('')
    setDictationText('')
  }

  function extractTranscriptFromResponse(event: RealtimeEvent) {
    return normalizeTranscript(
      event.response?.output
        ?.flatMap(item => item.content ?? [])
        .map(content => content.transcript || content.text || '')
        .filter(Boolean)
        .join(' ') || ''
    )
  }

  function handleVoiceAssistantEvent(event: RealtimeEvent) {
    if (event.type === 'error') {
      setVoiceError(event.error?.message || 'Realtime voice error')
      return
    }

    if (event.type === 'input_audio_buffer.speech_started') {
      setVoiceStatus('Слушаю...')
      return
    }

    if (event.type === 'input_audio_buffer.speech_stopped') {
      setVoiceStatus('Анна отвечает...')
      return
    }

    if (event.type === 'conversation.item.input_audio_transcription.failed') {
      setVoiceStatus('Не удалось распознать фразу, попробуйте ещё раз')
      return
    }

    if (
      event.type === 'conversation.item.input_audio_transcription.completed' &&
      event.transcript
    ) {
      const itemId = event.item_id || uid()

      if (committedUserItemsRef.current.has(itemId)) return

      committedUserItemsRef.current.add(itemId)
      const text = normalizeTranscript(event.transcript)

      if (!text) return

      setLiveUserTranscript(text)
      setMessages(current => [
        ...current,
        {
          id: uid(),
          role: 'user',
          content: text
        }
      ])

      void sendLeadFromRealtimeTranscript(text)
      return
    }

    const isAssistantDelta =
      event.type === 'response.output_audio_transcript.delta' ||
      event.type === 'response.output_text.delta'

    if (isAssistantDelta && typeof event.delta === 'string') {
      assistantTranscriptRef.current += event.delta
      setLiveAssistantTranscript(assistantTranscriptRef.current)
      return
    }

    const isAssistantDone =
      event.type === 'response.output_audio_transcript.done' ||
      event.type === 'response.output_text.done'

    if (isAssistantDone) {
      const text = normalizeTranscript(
        event.transcript || event.text || assistantTranscriptRef.current
      )

      if (text) {
        setMessages(current => [
          ...current,
          {
            id: uid(),
            role: 'assistant',
            content: text
          }
        ])
      }

      assistantTranscriptRef.current = ''
      setLiveAssistantTranscript('')
      setVoiceStatus('Готова слушать')
      return
    }

    if (event.type === 'response.done') {
      const text = extractTranscriptFromResponse(event)

      if (text && !assistantTranscriptRef.current) {
        setMessages(current => [
          ...current,
          {
            id: uid(),
            role: 'assistant',
            content: text
          }
        ])
      }

      assistantTranscriptRef.current = ''
      setLiveAssistantTranscript('')
      setVoiceStatus('Готова слушать')
    }
  }

  function handleDictationEvent(event: RealtimeEvent) {
    if (event.type === 'error') {
      setVoiceError(event.error?.message || 'Realtime transcription error')
      return
    }

    if (event.type === 'conversation.item.input_audio_transcription.failed') {
      setVoiceError('Не удалось распознать речь. Попробуйте сказать ещё раз.')
      return
    }

    if (
      event.type === 'conversation.item.input_audio_transcription.delta' &&
      typeof event.delta === 'string'
    ) {
      dictationTranscriptRef.current += event.delta
      setDictationText(dictationTranscriptRef.current)
      return
    }

    if (
      event.type === 'conversation.item.input_audio_transcription.completed' &&
      typeof event.transcript === 'string'
    ) {
      const text = normalizeTranscript(event.transcript)
      dictationTranscriptRef.current = text
      setDictationText(text)

      if (dictationStoppingRef.current) {
        cleanupRealtime(true)
      }
    }
  }

  async function createRealtimePeerConnection({
    mode,
    endpoint
  }: {
    mode: Exclude<VoiceMode, 'idle'>
    endpoint: string
  }) {
    if (
      typeof window === 'undefined' ||
      !navigator.mediaDevices?.getUserMedia
    ) {
      throw new Error('Браузер не поддерживает доступ к микрофону')
    }

    const sourceStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    })

    const peerConnection = new RTCPeerConnection()

    peerConnection.onconnectionstatechange = () => {
      if (peerConnection.connectionState === 'failed') {
        setVoiceError('Соединение с голосовым режимом прервано')
        cleanupRealtime(false)
      }
    }

    const sourceTrack = sourceStream.getAudioTracks()[0]

    if (!sourceTrack) {
      throw new Error('Микрофон не вернул аудиодорожку')
    }

    peerConnection.addTrack(sourceTrack, sourceStream)

    if (mode === 'assistant') {
      const remoteAudio = new Audio()
      remoteAudio.autoplay = true

      peerConnection.ontrack = ({ streams }) => {
        remoteAudio.srcObject = streams[0]
        void remoteAudio.play().catch(() => {
          setVoiceError(
            'Браузер заблокировал звук. Нажмите на страницу и попробуйте ещё раз.'
          )
        })
      }

      voiceAudioRef.current = remoteAudio
    }

    const events = peerConnection.createDataChannel('oai-events')

    events.onopen = () => {
      setVoiceStatus(mode === 'assistant' ? 'Готова слушать' : 'Говорите...')
    }

    events.onmessage = ({ data }) => {
      try {
        const event = JSON.parse(String(data)) as RealtimeEvent

        if (mode === 'assistant') {
          handleVoiceAssistantEvent(event)
        } else {
          handleDictationEvent(event)
        }
      } catch (error) {
        console.error('Realtime event parse error:', error)
      }
    }

    events.onerror = () => {
      setVoiceError('Ошибка realtime-канала')
    }

    events.onclose = () => {
      if (voiceModeRef.current !== 'idle') {
        setVoiceStatus('Соединение завершено')
      }
    }

    voicePeerRef.current = peerConnection
    voiceChannelRef.current = events
    voiceStreamRef.current = sourceStream

    const offer = await peerConnection.createOffer()
    await peerConnection.setLocalDescription(offer)

    const sdpResponse = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/sdp'
      },
      body: offer.sdp || ''
    })

    if (!sdpResponse.ok) {
      let message = await sdpResponse.text()

      try {
        const json = JSON.parse(message) as { error?: string }
        message = json.error || message
      } catch {
        // keep raw message
      }

      throw new Error(message || 'Не удалось создать realtime-сессию')
    }

    await peerConnection.setRemoteDescription({
      type: 'answer',
      sdp: await sdpResponse.text()
    })
  }

  async function startVoiceAssistant() {
    if (pending || shouldBlockChat || voiceConnecting || voiceMode !== 'idle') {
      return
    }

    voiceModeRef.current = 'assistant'
    setVoiceConnecting(true)
    setVoiceError('')
    setVoiceStatus('Подключаю Анну...')
    setVoiceMode('assistant')
    assistantTranscriptRef.current = ''
    committedUserItemsRef.current.clear()

    try {
      await createRealtimePeerConnection({
        mode: 'assistant',
        endpoint: `/api/realtime/session?siteId=${encodeURIComponent(
          siteId
        )}&pageUrl=${encodeURIComponent(pageUrl)}`
      })
    } catch (error) {
      console.error('Voice assistant start error:', error)
      cleanupRealtime(false)
      setVoiceError(
        error instanceof Error
          ? error.message
          : 'Не удалось запустить голосовой режим'
      )
    } finally {
      setVoiceConnecting(false)
    }
  }

  async function startDictation() {
    if (pending || shouldBlockChat || voiceConnecting || voiceMode !== 'idle') {
      return
    }

    voiceModeRef.current = 'dictation'
    setVoiceConnecting(true)
    setVoiceError('')
    setVoiceStatus('Подключаю диктовку...')
    setVoiceMode('dictation')
    setDictationText('')
    dictationTranscriptRef.current = ''

    const languageQuery =
      dictationLanguage === 'auto' ? '' : `&language=${dictationLanguage}`

    try {
      await createRealtimePeerConnection({
        mode: 'dictation',
        endpoint: `/api/realtime-transcription/session?siteId=${encodeURIComponent(
          siteId
        )}&pageUrl=${encodeURIComponent(pageUrl)}${languageQuery}`
      })
    } catch (error) {
      console.error('Dictation start error:', error)
      cleanupRealtime(false)
      setVoiceError(
        error instanceof Error
          ? error.message
          : 'Не удалось запустить распознавание речи'
      )
    } finally {
      setVoiceConnecting(false)
    }
  }

  function stopDictationAndCommit() {
    dictationStoppingRef.current = true
    setVoiceStatus('Завершаю диктовку...')

    try {
      if (voiceChannelRef.current?.readyState === 'open') {
        voiceChannelRef.current.send(
          JSON.stringify({
            type: 'input_audio_buffer.commit'
          })
        )
      }
    } catch (error) {
      console.error('Dictation commit error:', error)
    }

    dictationStopTimeoutRef.current = window.setTimeout(() => {
      cleanupRealtime(true)
    }, 1800)
  }

  function stopVoiceMode() {
    if (voiceMode === 'dictation') {
      stopDictationAndCommit()
      return
    }

    cleanupRealtime(false)
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
      cleanupRealtime(false)
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

  const realtimePanelOpen = voiceMode !== 'idle' || voiceConnecting

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

        {realtimePanelOpen ? (
          <div
            className={cn(
              'rounded-2xl border px-3 py-2 text-xs leading-4',
              theme === 'light'
                ? 'border-slate-200 bg-slate-50 text-slate-600'
                : 'border-white/10 bg-white/5 text-white/70'
            )}
          >
            <div className="font-medium">
              {voiceConnecting
                ? 'Подключение...'
                : voiceMode === 'assistant'
                  ? voiceStatus || 'Голосовой разговор активен'
                  : voiceStatus || 'Диктовка активна'}
            </div>

            {liveUserTranscript ? (
              <div className="mt-1">Вы: {liveUserTranscript}</div>
            ) : null}

            {liveAssistantTranscript ? (
              <div className="mt-1">Анна: {liveAssistantTranscript}</div>
            ) : null}

            {dictationText ? (
              <div className="mt-1 whitespace-pre-wrap">{dictationText}</div>
            ) : null}
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

        {!realtimePanelOpen ? (
          <div
            className={cn(
              'mb-2 flex items-center gap-2 text-[11px]',
              theme === 'light' ? 'text-slate-500' : 'text-white/45'
            )}
          >
            <Keyboard className="h-3 w-3" />
            <span>Язык диктовки:</span>

            <div className="flex overflow-hidden rounded-lg border border-current/15">
              {DICTATION_LANGUAGES.map(language => (
                <button
                  key={language.value}
                  type="button"
                  onClick={() => setDictationLanguage(language.value)}
                  className={cn(
                    'h-7 px-2 text-[11px] transition',
                    dictationLanguage === language.value
                      ? 'bg-[#08b7ef] text-white'
                      : 'hover:bg-current/10'
                  )}
                >
                  {language.label}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {voiceError ? (
          <div className="mb-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-500">
            {voiceError}
          </div>
        ) : null}

        {realtimePanelOpen ? (
          <div className="mb-2 flex justify-center">
            <div className="flex h-[72px] w-full max-w-[620px] items-center justify-center gap-5 rounded-[32px] bg-[#1f1f1f] px-6 text-white shadow-2xl">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-white">
                {voiceMode === 'assistant' ? (
                  <AudioLines className="h-6 w-6" />
                ) : (
                  <Mic className="h-6 w-6" />
                )}
              </div>

              <button
                type="button"
                onClick={stopVoiceMode}
                disabled={voiceConnecting}
                className="flex h-12 items-center gap-2 rounded-[24px] bg-[#0A84FF] px-6 text-[17px] font-semibold text-white disabled:opacity-60"
              >
                <span className="flex items-end gap-[3px]">
                  <span className="h-3 w-1 rounded-full bg-white animate-pulse" />
                  <span className="h-4 w-1 rounded-full bg-white animate-pulse delay-75" />
                  <span className="h-2 w-1 rounded-full bg-white animate-pulse delay-150" />
                  <span className="h-1.5 w-1 rounded-full bg-white/80" />
                </span>

                {voiceConnecting ? 'Подключение...' : 'Завершить'}
              </button>
            </div>
          </div>
        ) : null}

        <div className="grid grid-cols-[auto_auto_auto_auto_minmax(0,1fr)_auto] gap-2">
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
            disabled={pending || shouldBlockChat || realtimePanelOpen}
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
            disabled={pending || shouldBlockChat || realtimePanelOpen}
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

          {/* <button
            type="button"
            onClick={() => void startDictation()}
            disabled={pending || shouldBlockChat || realtimePanelOpen}
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-xl border disabled:opacity-50',
              theme === 'light'
                ? 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                : 'border-white/10 bg-white/5 text-white hover:bg-white/10'
            )}
            title="Диктовка: распознать речь в текст"
          >
            <Mic className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => void startVoiceAssistant()}
            disabled={pending || shouldBlockChat || realtimePanelOpen}
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-xl border disabled:opacity-50',
              theme === 'light'
                ? 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                : 'border-white/10 bg-white/5 text-white hover:bg-white/10'
            )}
            title="Говорить с AI ассистентом"
          >
            <AudioLines className="h-4 w-4" />
          </button> */}

          <textarea
            value={input}
            rows={1}
            disabled={shouldBlockChat || realtimePanelOpen}
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
                : realtimePanelOpen
                  ? 'Голосовой режим активен...'
                  : 'Введите сообщение...'
            }
            className={cn(
              'min-h-10 resize-none rounded-xl border px-3 py-2 text-sm outline-none disabled:opacity-60',
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
              realtimePanelOpen ||
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
