'use client'

import * as React from 'react'
import {
  Bot,
  FileText,
  ImageIcon,
  Mic,
  MicOff,
  Paperclip,
  Plus,
  Send,
  Trash2,
  Volume2,
  X
} from 'lucide-react'
import { AdminPageHeader } from '@/widgets/admin-shell/ui/admin-page-header'
import { ThemeToggle } from '@/shared/ui/theme-toggle'
import { Button } from '@/shared/ui/button'
import { cn } from '@/shared/lib/cn'
import { useCRMStore } from '@/entities/crm/model/crm-store'
import type { AIAgent } from '@/features/ai-agents/model/ai-agents-types'
import type {
  AIWorkspaceAttachment,
  AIWorkspaceChat,
  AIWorkspaceMessage
} from '../model/ai-workspace-types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/shared/ui/select'
import { AIRealtimeVoicePanel } from './ai-realtime-voice-panel'
import Image from 'next/image'

const CHATS_STORAGE_KEY = 'crm.aiWorkspace.chats'
const MESSAGES_STORAGE_KEY = 'crm.aiWorkspace.messages'

const DEFAULT_VOICE_SETTINGS = {
  supportsVoiceInput: true,
  supportsVoiceOutput: true,
  voiceReplyMode: 'both',
  transcribeModel: 'gpt-4o-mini-transcribe',
  ttsModel: 'gpt-4o-mini-tts',
  ttsVoice: 'marin',
  ttsInstructions:
    'Говори спокойно, уверенно и естественно. Не ускоряй речь. Используй деловой тон.'
} as const

function uid(prefix: string) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}_${crypto.randomUUID()}`
  }

  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`
}

function now() {
  return new Date().toISOString()
}

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback

  try {
    const value = window.localStorage.getItem(key)
    return value ? (JSON.parse(value) as T) : fallback
  } catch {
    return fallback
  }
}

function saveStorage<T>(key: string, value: T) {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // В localStorage не сохраняем тяжёлые данные, чтобы не ломать UI.
  }
}

function subscribeHydration(onStoreChange: () => void) {
  const timeoutId = window.setTimeout(onStoreChange, 0)

  return () => window.clearTimeout(timeoutId)
}

function getClientHydrationSnapshot() {
  return true
}

function getServerHydrationSnapshot() {
  return false
}

function useIsHydrated() {
  return React.useSyncExternalStore(
    subscribeHydration,
    getClientHydrationSnapshot,
    getServerHydrationSnapshot
  )
}

function sanitizeAttachment(
  attachment: AIWorkspaceAttachment
): AIWorkspaceAttachment {
  const { objectUrl: _objectUrl, ...cleanAttachment } = attachment

  return cleanAttachment
}

function sanitizeMessage(message: AIWorkspaceMessage): AIWorkspaceMessage {
  const { audioUrl: _audioUrl, ...cleanMessage } = message

  return {
    ...cleanMessage,
    attachments: cleanMessage.attachments.map(sanitizeAttachment)
  }
}

function sanitizeMessagesRecord(
  value: Record<string, AIWorkspaceMessage[]>
): Record<string, AIWorkspaceMessage[]> {
  return Object.fromEntries(
    Object.entries(value).map(([chatId, chatMessages]) => [
      chatId,
      chatMessages.map(sanitizeMessage)
    ])
  )
}

function readMessagesStorage() {
  return sanitizeMessagesRecord(
    readStorage<Record<string, AIWorkspaceMessage[]>>(MESSAGES_STORAGE_KEY, {})
  )
}

function saveMessagesStorage(value: Record<string, AIWorkspaceMessage[]>) {
  saveStorage(MESSAGES_STORAGE_KEY, sanitizeMessagesRecord(value))
}

function getAgentVoiceSettings(agent: AIAgent | null) {
  return {
    ...DEFAULT_VOICE_SETTINGS,
    ...(agent?.voiceSettings ?? {})
  }
}

async function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
        return
      }

      reject(new Error('File read error'))
    }

    reader.onerror = () => reject(new Error('File read error'))
    reader.readAsDataURL(file)
  })
}

function getAttachmentType(file: File): AIWorkspaceAttachment['type'] {
  if (file.type.startsWith('image/')) return 'image'
  if (file.type.startsWith('video/')) return 'video'
  if (file.type.startsWith('audio/')) return 'audio'

  return 'file'
}

async function fileToAttachment(file: File): Promise<AIWorkspaceAttachment> {
  const type = getAttachmentType(file)
  const shouldStoreDataUrl = type === 'image' && file.size <= 1_500_000

  return {
    id: uid('attachment'),
    name: file.name,
    type,
    mimeType: file.type || 'application/octet-stream',
    sizeBytes: file.size,
    ...(shouldStoreDataUrl ? { dataUrl: await readFileAsDataUrl(file) } : {}),
    ...(type === 'video' || type === 'audio'
      ? { objectUrl: URL.createObjectURL(file) }
      : {}),
    createdAt: now()
  }
}

export function AIWorkspacePage() {
  const {
    aiAgentRecords,
    selectedAiAgentId,
    loadAiAgentRecords,
    selectAiAgent
  } = useCRMStore()

  const [chats, setChats] = React.useState<AIWorkspaceChat[]>(() =>
    readStorage(CHATS_STORAGE_KEY, [])
  )
  const [messages, setMessages] = React.useState<
    Record<string, AIWorkspaceMessage[]>
  >(() => readMessagesStorage())
  const isHydrated = useIsHydrated()
  const [selectedChatId, setSelectedChatId] = React.useState<string | null>(
    () => readStorage<AIWorkspaceChat[]>(CHATS_STORAGE_KEY, [])[0]?.id ?? null
  )
  const [input, setInput] = React.useState('')
  const [attachments, setAttachments] = React.useState<AIWorkspaceAttachment[]>(
    []
  )
  const [pending, setPending] = React.useState(false)
  const [voiceReplyEnabled, setVoiceReplyEnabled] = React.useState(true)
  const [recording, setRecording] = React.useState(false)
  const [transcribing, setTranscribing] = React.useState(false)

  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null)
  const audioChunksRef = React.useRef<Blob[]>([])
  const messagesScrollRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    void loadAiAgentRecords()
  }, [loadAiAgentRecords])

  React.useEffect(() => {
    saveStorage(CHATS_STORAGE_KEY, chats)
  }, [chats])

  React.useEffect(() => {
    saveMessagesStorage(messages)
  }, [messages])

  const selectedAgent = React.useMemo(() => {
    return (
      aiAgentRecords.find(agent => agent.id === selectedAiAgentId) ??
      aiAgentRecords[0] ??
      null
    )
  }, [aiAgentRecords, selectedAiAgentId])

  const selectedVoiceSettings = React.useMemo(() => {
    return getAgentVoiceSettings(selectedAgent)
  }, [selectedAgent])

  const selectedChat = React.useMemo(() => {
    return chats.find(chat => chat.id === selectedChatId) ?? null
  }, [chats, selectedChatId])

  const chatMessages = selectedChatId ? (messages[selectedChatId] ?? []) : []

  const createChat = React.useCallback(() => {
    const agent = selectedAgent
    const createdAt = now()

    const chat: AIWorkspaceChat = {
      id: uid('ai_chat'),
      title: 'New AI chat',
      agentId: agent?.id ?? null,
      model: agent?.model ?? 'gpt-5.4-mini',
      createdAt,
      updatedAt: createdAt
    }

    setChats(current => [chat, ...current])
    setMessages(current => ({
      ...current,
      [chat.id]: []
    }))
    setSelectedChatId(chat.id)
  }, [selectedAgent])

  const deleteChat = React.useCallback((chatId: string) => {
    setChats(current => {
      const nextChats = current.filter(chat => chat.id !== chatId)

      setSelectedChatId(currentSelectedChatId => {
        if (currentSelectedChatId !== chatId) return currentSelectedChatId

        return nextChats[0]?.id ?? null
      })

      return nextChats
    })

    setMessages(current => {
      const next = { ...current }
      delete next[chatId]

      return next
    })
  }, [])

  const ensureChat = React.useCallback(() => {
    if (selectedChatId) return selectedChatId

    const agent = selectedAgent
    const createdAt = now()

    const chat: AIWorkspaceChat = {
      id: uid('ai_chat'),
      title: 'New AI chat',
      agentId: agent?.id ?? null,
      model: agent?.model ?? 'gpt-5.4-mini',
      createdAt,
      updatedAt: createdAt
    }

    setChats(current => [chat, ...current])
    setMessages(current => ({
      ...current,
      [chat.id]: []
    }))
    setSelectedChatId(chat.id)

    return chat.id
  }, [selectedChatId, selectedAgent])

  const appendMessage = React.useCallback((message: AIWorkspaceMessage) => {
    setMessages(current => ({
      ...current,
      [message.chatId]: [...(current[message.chatId] ?? []), message]
    }))

    setChats(current =>
      current.map(chat =>
        chat.id === message.chatId
          ? {
              ...chat,
              title:
                chat.title === 'New AI chat' && message.role === 'user'
                  ? message.content.slice(0, 42) || chat.title
                  : chat.title,
              updatedAt: now()
            }
          : chat
      )
    )
  }, [])

  const generateVoice = React.useCallback(
    async (text: string, agent: AIAgent | null) => {
      if (!text.trim()) return undefined

      const voiceSettings = getAgentVoiceSettings(agent)

      if (!voiceSettings.supportsVoiceOutput) {
        return undefined
      }

      const response = await fetch('/api/ai-workspace/speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          model: voiceSettings.ttsModel,
          voice: voiceSettings.ttsVoice,
          instructions: voiceSettings.ttsInstructions
        })
      })

      if (!response.ok) {
        return undefined
      }

      const blob = await response.blob()

      return URL.createObjectURL(blob)
    },
    []
  )

  const sendMessageWithText = React.useCallback(
    async (
      rawText: string,
      messageAttachments: AIWorkspaceAttachment[] = []
    ) => {
      const text = rawText.trim()
      const agent = selectedAgent

      if ((!text && messageAttachments.length === 0) || pending) return

      const chatId = ensureChat()
      const currentMessages = messages[chatId] ?? []

      const userMessage: AIWorkspaceMessage = {
        id: uid('msg'),
        chatId,
        role: 'user',
        content: text,
        attachments: messageAttachments,
        createdAt: now()
      }

      appendMessage(userMessage)
      setPending(true)

      try {
        const response = await fetch('/api/ai-workspace/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'gpt-4.1-mini', // agent?.model ?? 'gpt-5.4-mini,
            systemPrompt:
              agent?.systemPrompt ??
              'Ты AI-ассистент CRM. Отвечай полезно и кратко.',
            salesPrompt: agent?.salesPrompt,
            qualificationPrompt: agent?.qualificationPrompt,
            temperature: agent?.temperature ?? 0.35,
            maxTokens: agent?.maxTokens ?? 1800,
            messages: [...currentMessages, userMessage].map(message => ({
              role: message.role,
              content: message.content
            })),
            attachments: messageAttachments
          })
        })

        const data = (await response.json()) as {
          text?: string
          model?: string
          error?: string
        }

        if (!response.ok) {
          throw new Error(data.error ?? 'AI request failed')
        }

        const answerText = data.text ?? ''
        const voiceSettings = getAgentVoiceSettings(agent)

        const shouldCreateVoice =
          voiceReplyEnabled &&
          voiceSettings.supportsVoiceOutput &&
          voiceSettings.voiceReplyMode !== 'text'

        const audioUrl = shouldCreateVoice
          ? await generateVoice(answerText, agent)
          : undefined

        appendMessage({
          id: uid('msg'),
          chatId,
          role: 'assistant',
          content: answerText,
          attachments: [],
          model: data.model,
          audioUrl,
          createdAt: now()
        })
      } catch (error) {
        appendMessage({
          id: uid('msg'),
          chatId,
          role: 'assistant',
          content:
            error instanceof Error
              ? `Ошибка AI: ${error.message}`
              : 'Ошибка AI-запроса.',
          attachments: [],
          createdAt: now()
        })
      } finally {
        setPending(false)
      }
    },
    [
      selectedAgent,
      pending,
      ensureChat,
      appendMessage,
      voiceReplyEnabled,
      generateVoice,
      messages
    ]
  )

  const sendMessage = React.useCallback(async () => {
    const text = input.trim()
    const currentAttachments = attachments

    if ((!text && currentAttachments.length === 0) || pending) return

    setInput('')
    setAttachments([])

    await sendMessageWithText(text, currentAttachments)
  }, [input, attachments, pending, sendMessageWithText])

  const addFiles = React.useCallback(async (fileList: FileList | null) => {
    if (!fileList?.length) return

    const files = Array.from(fileList).slice(0, 8)
    const nextAttachments = await Promise.all(files.map(fileToAttachment))

    setAttachments(current => [...current, ...nextAttachments])
  }, [])

  const startRecording = React.useCallback(async () => {
    if (recording || pending || transcribing) return

    const voiceSettings = getAgentVoiceSettings(selectedAgent)

    if (!voiceSettings.supportsVoiceInput) {
      appendMessage({
        id: uid('msg'),
        chatId: ensureChat(),
        role: 'assistant',
        content: 'У выбранного AI agent выключен voice input.',
        attachments: [],
        createdAt: now()
      })
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })

      const recorder = new MediaRecorder(stream)

      audioChunksRef.current = []

      recorder.ondataavailable = event => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      recorder.onerror = () => {
        stream.getTracks().forEach(track => track.stop())
        setRecording(false)
        setTranscribing(false)
      }

      recorder.onstop = async () => {
        setRecording(false)
        setTranscribing(true)

        try {
          const blob = new Blob(audioChunksRef.current, {
            type: 'audio/webm'
          })

          if (blob.size === 0) {
            return
          }

          const file = new File([blob], 'voice-message.webm', {
            type: 'audio/webm'
          })

          const formData = new FormData()
          formData.set('file', file)
          formData.set('model', voiceSettings.transcribeModel)

          const response = await fetch('/api/ai-workspace/transcribe', {
            method: 'POST',
            body: formData
          })

          const data = (await response.json()) as {
            text?: string
            error?: string
          }

          if (!response.ok) {
            throw new Error(data.error ?? 'Transcription failed')
          }

          const transcript = data.text?.trim() ?? ''

          if (!transcript) {
            appendMessage({
              id: uid('msg'),
              chatId: ensureChat(),
              role: 'assistant',
              content:
                'Не удалось распознать голос. Попробуй записать ещё раз.',
              attachments: [],
              createdAt: now()
            })
            return
          }

          await sendMessageWithText(transcript, [])
        } catch (error) {
          appendMessage({
            id: uid('msg'),
            chatId: ensureChat(),
            role: 'assistant',
            content:
              error instanceof Error
                ? `Ошибка распознавания голоса: ${error.message}`
                : 'Ошибка распознавания голоса.',
            attachments: [],
            createdAt: now()
          })
        } finally {
          stream.getTracks().forEach(track => track.stop())
          setTranscribing(false)
        }
      }

      mediaRecorderRef.current = recorder
      recorder.start()
      setRecording(true)
    } catch (error) {
      appendMessage({
        id: uid('msg'),
        chatId: ensureChat(),
        role: 'assistant',
        content:
          error instanceof Error
            ? `Не удалось включить микрофон: ${error.message}`
            : 'Не удалось включить микрофон.',
        attachments: [],
        createdAt: now()
      })
      setRecording(false)
      setTranscribing(false)
    }
  }, [
    recording,
    pending,
    transcribing,
    selectedAgent,
    appendMessage,
    ensureChat,
    sendMessageWithText
  ])

  const stopRecording = React.useCallback(() => {
    const recorder = mediaRecorderRef.current

    if (!recorder) return

    if (recorder.state !== 'inactive') {
      recorder.stop()
    }
  }, [])

  const removeAttachment = React.useCallback((attachmentId: string) => {
    setAttachments(current => current.filter(item => item.id !== attachmentId))
  }, [])

  const scrollToBottom = () => {
    const el = messagesScrollRef.current

    if (!el) return

    el.scrollTop = el.scrollHeight
  }

  React.useEffect(() => {
    requestAnimationFrame(scrollToBottom)
  }, [messages])

  if (!isHydrated) {
    return (
      <div className="cf-page min-h-screen">
        <AdminPageHeader
          title="Dashboard - AI Workspace"
          actions={
            <>
              <ThemeToggle />
            </>
          }
        />

        <div className="grid h-[calc(100vh-52px)] grid-cols-[280px_1fr_310px] gap-3 p-3">
          <aside className="cf-panel flex min-h-0 flex-col">
            <div className="border-b border-[var(--cf-border)] p-3">
              <div className="h-9 rounded-md bg-[var(--cf-button)]" />
            </div>

            <div className="p-4 text-[12px] text-[var(--cf-text-muted)]">
              Loading chats...
            </div>
          </aside>

          <main className="cf-panel flex min-h-0 items-center justify-center">
            <div className="text-[12px] text-[var(--cf-text-muted)]">
              Loading AI Workspace...
            </div>
          </main>

          <aside className="cf-panel min-h-0 p-3">
            <div className="text-[13px] font-semibold text-[var(--cf-text)]">
              Agent settings
            </div>
          </aside>
        </div>
      </div>
    )
  }

  return (
    <div className="cf-page min-h-screen ">
      <AdminPageHeader
        title="Dashboard - AI Workspace"
        actions={
          <>
            <ThemeToggle />

            <Button
              type="button"
              variant="ghost"
              className="cf-icon-button"
              onClick={createChat}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </>
        }
      />

      <div className="grid h-auto lg:h-[calc(100vh-52px)] grid-cols-1 lg:grid-cols-[280px_1fr_310px] gap-3 p-3">
        <aside className="cf-panel flex min-h-0 flex-col">
          <div className="border-b border-[var(--cf-border)] p-3">
            <Button
              type="button"
              variant="ghost"
              className="h-9 w-full justify-start rounded-md bg-[var(--cf-button)] px-3 text-[12px] text-[var(--cf-text)]"
              onClick={createChat}
            >
              <Plus className="mr-2 h-4 w-4" />
              New chat
            </Button>
          </div>

          <div className="min-h-0 flex-1 overflow-auto p-2">
            {chats.length === 0 ? (
              <div className="p-4 text-[12px] text-[var(--cf-text-muted)]">
                No chats yet
              </div>
            ) : null}

            {chats.map(chat => (
              <button
                key={chat.id}
                type="button"
                className={cn(
                  'mb-1 flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-[12px]',
                  chat.id === selectedChatId
                    ? 'bg-[var(--cf-button)] text-[var(--cf-text)]'
                    : 'text-[var(--cf-text-muted)] hover:bg-[var(--cf-element-hover)]'
                )}
                onClick={() => setSelectedChatId(chat.id)}
              >
                <span className="min-w-0 truncate">{chat.title}</span>

                <span
                  role="button"
                  tabIndex={0}
                  className="shrink-0 rounded p-1 hover:bg-[rgba(239,23,72,0.16)] hover:text-[var(--cf-red)]"
                  onClick={event => {
                    event.stopPropagation()
                    deleteChat(chat.id)
                  }}
                  onKeyDown={event => {
                    event.stopPropagation()

                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      deleteChat(chat.id)
                    }
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </span>
              </button>
            ))}
          </div>
        </aside>

        <main className="cf-panel flex min-h-[70vh] flex-col max-h-[70vh] lg:max-h-full">
          <div className="flex items-center justify-between gap-3 border-b border-[var(--cf-border)] p-3">
            <div className="min-w-0">
              <div className="truncate text-[13px] font-semibold text-[var(--cf-text)]">
                {selectedChat?.title ?? 'AI Workspace'}
              </div>

              <div className="mt-0.5 truncate text-[11px] text-[var(--cf-text-muted)]">
                {selectedAgent
                  ? `${selectedAgent.name} · ${selectedAgent.model}`
                  : 'Select AI agent'}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Select
                value={selectedAgent?.id ?? ''}
                onValueChange={value => selectAiAgent(value)}
              >
                <SelectTrigger className="cf-control h-8 w-[250px] px-3 text-[12px] text-primary shadow-none">
                  <SelectValue placeholder="Select agent" />
                </SelectTrigger>

                <SelectContent className="cf-panel">
                  {aiAgentRecords.map(agent => {
                    if (agent.id !== 'ai_agent_sales_001') return
                    return (
                      <SelectItem key={agent.id} value={agent.id}>
                        {agent.name} · {agent.model}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>

              <Button
                type="button"
                variant="ghost"
                className={cn(
                  'h-8 rounded-md px-3 text-[11px]',
                  voiceReplyEnabled
                    ? 'bg-[rgba(8,183,239,0.14)] text-[var(--cf-blue)]'
                    : 'bg-[var(--cf-button)] text-[var(--cf-text)]'
                )}
                onClick={() => setVoiceReplyEnabled(current => !current)}
              >
                <Volume2 className="mr-1.5 h-3.5 w-3.5" />
                Voice reply
              </Button>
            </div>
          </div>

          <div
            ref={messagesScrollRef}
            className="min-h-0 flex-1 space-y-3 overflow-auto p-4"
          >
            {chatMessages.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <Bot className="mx-auto h-9 w-9 text-[var(--cf-icon)]" />
                  <div className="mt-3 text-[14px] font-semibold text-[var(--cf-text)]">
                    Start AI chat
                  </div>
                  <div className="mt-1 text-[12px] text-[var(--cf-text-muted)]">
                    Напиши сообщение, приложи файл или отправь голос.
                  </div>
                </div>
              </div>
            ) : null}

            {chatMessages.map(message => (
              <div
                key={message.id}
                className={cn(
                  'flex',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-[78%] rounded-2xl border px-3 py-2 text-[13px] leading-6',
                    message.role === 'user'
                      ? 'border-[var(--cf-blue)] bg-[rgba(8,183,239,0.14)] text-[var(--cf-text)]'
                      : 'border-[var(--cf-border)] bg-[var(--cf-element)] text-[var(--cf-text)]'
                  )}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>

                  {message.attachments.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {message.attachments.map(attachment => (
                        <AttachmentBadge
                          key={attachment.id}
                          attachment={attachment}
                        />
                      ))}
                    </div>
                  ) : null}

                  {message.audioUrl ? (
                    <audio
                      controls
                      src={message.audioUrl}
                      className="mt-2 w-full"
                    />
                  ) : null}

                  <div className="mt-1 text-[10px] text-[var(--cf-text-muted)]">
                    {message.model ? `${message.model} · ` : ''}
                    {new Date(message.createdAt).toLocaleTimeString('ru-RU')}
                  </div>
                </div>
              </div>
            ))}

            {pending ? (
              <div className="text-[12px] text-[var(--cf-text-muted)]">
                AI думает...
              </div>
            ) : null}

            {transcribing ? (
              <div className="text-[12px] text-[var(--cf-text-muted)]">
                Распознаю голос...
              </div>
            ) : null}
          </div>

          <div className="border-t border-[var(--cf-border)] p-3">
            {attachments.length > 0 ? (
              <div className="mb-2 flex flex-wrap gap-2">
                {attachments.map(attachment => (
                  <div
                    key={attachment.id}
                    className="flex items-center gap-2 rounded-md border border-[var(--cf-border)] bg-[var(--cf-element)] px-2 py-1 text-[11px] text-[var(--cf-text)]"
                  >
                    <AttachmentIcon attachment={attachment} />
                    <span className="max-w-[160px] truncate">
                      {attachment.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeAttachment(attachment.id)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="grid grid-cols-[auto_auto_1fr_auto] gap-2">
              <label className="cf-icon-button flex cursor-pointer items-center justify-center">
                <Paperclip className="h-4 w-4" />
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                  className="hidden"
                  onChange={event => {
                    void addFiles(event.target.files)
                    event.target.value = ''
                  }}
                />
              </label>

              <Button
                type="button"
                variant="ghost"
                disabled={pending || transcribing}
                className={cn(
                  'cf-icon-button',
                  recording && 'bg-[rgba(239,23,72,0.16)] text-[var(--cf-red)]',
                  (pending || transcribing) && 'cursor-not-allowed opacity-50'
                )}
                onClick={() => {
                  if (recording) {
                    stopRecording()
                  } else {
                    void startRecording()
                  }
                }}
              >
                {recording ? (
                  <MicOff className="h-4 w-4" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </Button>

              <textarea
                value={input}
                onChange={event => setInput(event.target.value)}
                onKeyDown={event => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault()
                    void sendMessage()
                  }
                }}
                placeholder={
                  recording
                    ? 'Recording voice...'
                    : transcribing
                      ? 'Transcribing voice...'
                      : 'Message AI agent...'
                }
                className="min-h-[44px] max-h-[150px] resize-none rounded-md border border-[var(--cf-border)] bg-[var(--cf-element)] px-3 py-2 text-[13px] text-[var(--cf-text)] outline-none placeholder:text-[var(--cf-text-muted)]"
              />

              <Button
                type="button"
                variant="ghost"
                disabled={
                  pending ||
                  transcribing ||
                  (!input.trim() && attachments.length === 0)
                }
                className="h-[44px] rounded-md bg-[var(--cf-button)] px-4 text-[12px] text-[var(--cf-text)] disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => void sendMessage()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </main>

        <aside className="cf-panel min-h-0 overflow-auto p-3">
          <div className="text-[13px] font-semibold text-[var(--cf-text)]">
            Agent settings
          </div>

          <div className="mt-3">
            <AIRealtimeVoicePanel
              agent={selectedAgent}
              ensureChat={ensureChat}
              appendMessage={appendMessage}
            />
          </div>

          {selectedAgent ? (
            <div className="mt-3 space-y-3">
              <Setting label="Name" value={selectedAgent.name} />
              <Setting label="Provider" value={selectedAgent.provider} />
              <Setting label="Model" value={selectedAgent.model} />
              <Setting label="Status" value={selectedAgent.status} />
              <Setting label="Temperature" value={selectedAgent.temperature} />
              <Setting
                label="Max tokens"
                value={selectedAgent.maxTokens ?? '—'}
              />
              <Setting
                label="Min confidence"
                value={`${selectedAgent.minConfidenceToAutoReply}%`}
              />
              <Setting
                label="Voice input"
                value={selectedVoiceSettings.supportsVoiceInput ? 'yes' : 'no'}
              />
              <Setting
                label="Voice output"
                value={selectedVoiceSettings.supportsVoiceOutput ? 'yes' : 'no'}
              />
              <Setting label="Voice" value={selectedVoiceSettings.ttsVoice} />
              <Setting
                label="TTS model"
                value={selectedVoiceSettings.ttsModel}
              />
              <Setting
                label="STT model"
                value={selectedVoiceSettings.transcribeModel}
              />

              <div className="rounded-md border border-[var(--cf-border)] bg-[var(--cf-bg)] p-3">
                <div className="text-[11px] font-semibold text-[var(--cf-text)]">
                  System prompt
                </div>
                <div className="mt-2 max-h-[180px] overflow-auto whitespace-pre-wrap text-[11px] leading-5 text-[var(--cf-text-muted)]">
                  {selectedAgent.systemPrompt}
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-3 text-[12px] text-[var(--cf-text-muted)]">
              No agent selected
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}

function Setting({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-md border border-[var(--cf-border)] bg-[var(--cf-bg)] p-2">
      <div className="text-[10px] text-[var(--cf-text-muted)]">{label}</div>
      <div className="mt-1 text-[12px] font-semibold text-[var(--cf-text)]">
        {value}
      </div>
    </div>
  )
}

function AttachmentIcon({ attachment }: { attachment: AIWorkspaceAttachment }) {
  if (attachment.type === 'image') return <ImageIcon className="h-3.5 w-3.5" />

  return <FileText className="h-3.5 w-3.5" />
}

function AttachmentBadge({
  attachment
}: {
  attachment: AIWorkspaceAttachment
}) {
  if (attachment.type === 'image' && attachment.dataUrl) {
    return (
      <Image
        unoptimized
        width={80}
        height={80}
        src={attachment.dataUrl}
        alt={attachment.name}
        className="h-20 w-20 rounded-md border border-[var(--cf-border)] object-cover"
      />
    )
  }

  if (attachment.type === 'video' && attachment.objectUrl) {
    return (
      <video
        controls
        src={attachment.objectUrl}
        className="h-28 w-40 rounded-md border border-[var(--cf-border)] object-cover"
      />
    )
  }

  if (attachment.type === 'audio' && attachment.objectUrl) {
    return <audio controls src={attachment.objectUrl} className="w-[240px]" />
  }

  return (
    <div className="flex items-center gap-2 rounded-md border border-[var(--cf-border)] bg-[var(--cf-bg)] px-2 py-1 text-[11px] text-[var(--cf-text-muted)]">
      <AttachmentIcon attachment={attachment} />
      <span className="max-w-[160px] truncate">{attachment.name}</span>
    </div>
  )
}
