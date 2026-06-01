'use client'

import * as React from 'react'
import { Mic, Paperclip, Send, Smile, Square, X } from 'lucide-react'
import type {
  Conversation,
  CRMMessage,
  UIAttachment
} from '../model/conversations-types'
import { useCRMStore } from '@/entities/crm/model/crm-store'
import { Button } from '@/shared/ui/button'
import { Textarea } from '@/shared/ui/textarea'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'

type ConversationComposerProps = {
  conversation: Conversation
  replyTo: CRMMessage | null
  editingMessage: CRMMessage | null
  onCancelReply: () => void
  onCancelEdit: () => void
}

const emojis = [
  '👍',
  '👌',
  '🙏',
  '🙂',
  '🔥',
  '✅',
  '❗',
  '📌',
  '🚚',
  '💰',
  '📐',
  '🏗️'
]

export function ConversationComposer({
  conversation,
  replyTo,
  editingMessage,
  onCancelReply,
  onCancelEdit
}: ConversationComposerProps) {
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null)
  const audioChunksRef = React.useRef<Blob[]>([])

  const [text, setText] = React.useState(() => editingMessage?.text ?? '')
  const [attachments, setAttachments] = React.useState<UIAttachment[]>([])
  const [isRecording, setIsRecording] = React.useState(false)

  const { sendConversationMessage, updateConversationMessage } = useCRMStore()

  const pickFiles = () => {
    fileInputRef.current?.click()
  }

  const onFilesSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    const nextAttachments = files.map(fileToAttachment)

    setAttachments(current => [...current, ...nextAttachments])

    event.target.value = ''
  }

  const send = async () => {
    const normalizedText = text.trim()

    if (editingMessage) {
      if (!normalizedText) return

      await updateConversationMessage(
        conversation.id,
        editingMessage.id,
        normalizedText
      )

      setText('')
      setAttachments([])
      onCancelEdit()
      return
    }

    if (!normalizedText && attachments.length === 0) return

    await sendConversationMessage(conversation.id, {
      text: normalizedText,
      attachments,
      replyTo: replyTo
        ? {
            messageId: replyTo.id,
            senderName: replyTo.senderName,
            text: replyTo.text
          }
        : undefined
    })

    setText('')
    setAttachments([])
    onCancelReply()
  }

  const startVoiceRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia) return

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const recorder = new MediaRecorder(stream)

    audioChunksRef.current = []

    recorder.ondataavailable = event => {
      if (event.data.size > 0) {
        audioChunksRef.current.push(event.data)
      }
    }

    recorder.onstop = () => {
      const blob = new Blob(audioChunksRef.current, {
        type: 'audio/webm'
      })

      const url = URL.createObjectURL(blob)

      const attachment: UIAttachment = {
        id: createId('voice'),
        kind: 'voice',
        name: `voice-${Date.now()}.webm`,
        url,
        size: blob.size,
        mimeType: 'audio/webm',
        downloadable: true,
        createdAt: new Date().toISOString()
      }

      setAttachments(current => [...current, attachment])
      stream.getTracks().forEach(track => track.stop())
    }

    mediaRecorderRef.current = recorder
    recorder.start()
    setIsRecording(true)
  }

  const stopVoiceRecording = () => {
    mediaRecorderRef.current?.stop()
    setIsRecording(false)
  }

  const cancelEdit = () => {
    setText('')
    setAttachments([])
    onCancelEdit()
  }

  return (
    <div className="border-t border-[var(--cf-border)] p-3">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={onFilesSelected}
      />

      {replyTo ? (
        <ComposerStateBar
          title="Ответ"
          text={replyTo.text ?? 'Вложение'}
          onClose={onCancelReply}
        />
      ) : null}

      {editingMessage ? (
        <ComposerStateBar
          title="Редактирование"
          text={editingMessage.text ?? ''}
          onClose={cancelEdit}
        />
      ) : null}

      {attachments.length > 0 ? (
        <div className="mb-2 flex flex-wrap gap-2">
          {attachments.map(attachment => (
            <div
              key={attachment.id}
              className="flex items-center gap-2 rounded-md border border-[var(--cf-border)] bg-[var(--cf-element)] px-2 py-1"
            >
              <span className="max-w-[180px] truncate text-[11px] text-[var(--cf-text)]">
                {attachment.name}
              </span>

              <button
                type="button"
                className="text-[var(--cf-icon)] hover:text-[var(--cf-text)]"
                onClick={() =>
                  setAttachments(current =>
                    current.filter(item => item.id !== attachment.id)
                  )
                }
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      ) : null}

      <div className="mb-2 flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          className="cf-icon-button"
          onClick={pickFiles}
          title="Прикрепить файл"
        >
          <Paperclip className="h-4 w-4" />
        </Button>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              className="cf-icon-button"
              title="Emoji"
            >
              <Smile className="h-4 w-4" />
            </Button>
          </PopoverTrigger>

          <PopoverContent className="cf-panel w-[220px] p-2">
            <div className="grid grid-cols-6 gap-1">
              {emojis.map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  className="h-8 rounded-md text-lg hover:bg-[var(--cf-element-hover)]"
                  onClick={() => setText(current => `${current}${emoji}`)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <Button
          type="button"
          variant="ghost"
          className="cf-icon-button"
          onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
          title={isRecording ? 'Остановить запись' : 'Записать голосовое'}
        >
          {isRecording ? (
            <Square className="h-4 w-4 text-[var(--cf-red)]" />
          ) : (
            <Mic className="h-4 w-4" />
          )}
        </Button>

        <div className="ml-auto text-[11px] text-[var(--cf-text-muted)]">
          {conversation.channel} ·{' '}
          {conversation.aiSettings.enabled ? 'AI ON' : 'AI OFF'}
        </div>
      </div>

      <div className="flex items-end gap-2">
        <Textarea
          value={text}
          onChange={event => setText(event.target.value)}
          placeholder={
            editingMessage ? 'Изменить сообщение...' : 'Написать сообщение...'
          }
          className="min-h-[58px] max-h-[140px] resize-none border-[var(--cf-border)] bg-[var(--cf-element)] text-[12px] text-[var(--cf-text)] placeholder:text-[var(--cf-text-muted)]"
          onKeyDown={event => {
            if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
              event.preventDefault()
              void send()
            }
          }}
        />

        <Button
          type="button"
          onClick={() => void send()}
          className="h-[58px] rounded-md bg-[var(--cf-button)] px-4 text-[var(--cf-text)] hover:bg-[var(--cf-element-hover)]"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

function ComposerStateBar({
  title,
  text,
  onClose
}: {
  title: string
  text: string
  onClose: () => void
}) {
  return (
    <div className="mb-2 flex items-start gap-2 rounded-md border border-[var(--cf-border)] bg-[var(--cf-element)] px-3 py-2">
      <div className="min-w-0 flex-1">
        <div className="text-[10px] font-semibold text-[var(--cf-blue)]">
          {title}
        </div>

        <div className="line-clamp-1 text-[11px] text-[var(--cf-text-muted)]">
          {text}
        </div>
      </div>

      <button
        type="button"
        className="text-[var(--cf-icon)] hover:text-[var(--cf-text)]"
        onClick={onClose}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

function fileToAttachment(file: File): UIAttachment {
  const url = URL.createObjectURL(file)
  const kind = detectAttachmentKind(file)

  return {
    id: createId('att'),
    kind,
    name: file.name,
    url,
    previewUrl: kind === 'image' ? url : undefined,
    size: file.size,
    mimeType: file.type,
    downloadable: true,
    createdAt: new Date().toISOString()
  }
}

function detectAttachmentKind(file: File): UIAttachment['kind'] {
  if (file.type.startsWith('image/')) return 'image'
  if (file.type.startsWith('video/')) return 'video'
  if (file.type.startsWith('audio/')) return 'audio'

  const extension = file.name.split('.').pop()?.toLowerCase()

  if (extension === 'webm' || extension === 'ogg' || extension === 'mp3') {
    return 'audio'
  }

  return 'document'
}

function createId(prefix: string) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}_${crypto.randomUUID()}`
  }

  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`
}
