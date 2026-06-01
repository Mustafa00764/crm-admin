'use client'

import {
  CheckCheck,
  Clock3,
  Copy,
  Download,
  Edit3,
  FileText,
  ImageIcon,
  Reply,
  Trash2
} from 'lucide-react'
import type { CRMMessage, UIAttachment } from '../model/conversations-types'
import { cn } from '@/shared/lib/cn'
import { useCRMStore } from '@/entities/crm/model/crm-store'
import { Badge } from '@/shared/ui/badge'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger
} from '@/shared/ui/context-menu'
import Image from 'next/image'

type ConversationMessageBubbleProps = {
  message: CRMMessage
  onReply: () => void
  onEdit: () => void
}

export function ConversationMessageBubble({
  message,
  onReply,
  onEdit
}: ConversationMessageBubbleProps) {
  const { deleteConversationMessage } = useCRMStore()

  const isOwn = message.author === 'manager' || message.author === 'ai'
  const isAi = message.author === 'ai'

  const canEdit = message.author === 'manager'
  const canDelete = message.author === 'manager' || message.author === 'ai'
  const hasAttachments = message.attachments.length > 0

  const copyMessage = async () => {
    const textForCopy =
      message.text?.trim() ||
      message.attachments.map(attachment => attachment.name).join('\n') ||
      ''

    if (!textForCopy) return

    await navigator.clipboard.writeText(textForCopy)
  }

  const deleteMessage = async () => {
    await deleteConversationMessage(message.conversationId, message.id)
  }

  const downloadAllAttachments = () => {
    message.attachments.forEach(attachment => {
      downloadAttachment(attachment)
    })
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}>
          <div
            className={cn(
              'max-w-[72%] rounded-lg border p-3',
              isOwn
                ? 'border-[var(--cf-border)] bg-[var(--cf-element)]'
                : 'border-[var(--cf-border)] bg-[var(--cf-panel-soft)]',
              isAi && 'border-[rgba(8,183,239,0.3)] bg-[rgba(8,183,239,0.08)]'
            )}
          >
            <div className="mb-1 flex items-center gap-2">
              <span className="text-[11px] font-semibold text-[var(--cf-text)]">
                {message.senderName}
              </span>

              {isAi ? (
                <Badge className="bg-[var(--cf-blue)] px-1.5 py-0 text-[10px] text-black">
                  AI {message.aiConfidence ?? 0}%
                </Badge>
              ) : null}
            </div>

            {message.replyTo ? (
              <div className="mb-2 rounded-md border-l-2 border-[var(--cf-blue)] bg-[var(--cf-element)] px-2 py-1">
                <div className="text-[10px] text-[var(--cf-text-muted)]">
                  {message.replyTo.senderName}
                </div>

                <div className="line-clamp-1 text-[11px] text-[var(--cf-text)]">
                  {message.replyTo.text ?? 'Вложение'}
                </div>
              </div>
            ) : null}

            {hasAttachments ? (
              <div className="mt-2 space-y-1">
                {message.attachments.map(attachment => (
                  <AttachmentPreview
                    key={attachment.id}
                    attachment={attachment}
                  />
                ))}
              </div>
            ) : null}

            {message.text ? (
              <div className="whitespace-pre-wrap text-[12px] leading-5 text-[var(--cf-text)] mt-1">
                {message.text}
              </div>
            ) : null}

            <div className="mt-2 flex items-center justify-end gap-1 text-[10px] text-[var(--cf-text-muted)]">
              <span>{message.createdAt}</span>

              {message.status === 'sent' ? (
                <Clock3 className="h-3 w-3" />
              ) : null}

              {message.status === 'delivered' || message.status === 'read' ? (
                <CheckCheck
                  className={cn(
                    'h-3 w-3',
                    message.status === 'read' && 'text-[var(--cf-blue)]'
                  )}
                />
              ) : null}
            </div>
          </div>
        </div>
      </ContextMenuTrigger>

      <ContextMenuContent className="cf-panel w-52">
        <ContextMenuItem onClick={() => void copyMessage()}>
          <Copy className="mr-2 h-4 w-4" />
          Копировать
        </ContextMenuItem>

        <ContextMenuItem onClick={onReply}>
          <Reply className="mr-2 h-4 w-4" />
          Ответить
        </ContextMenuItem>

        {canEdit ? (
          <ContextMenuItem onClick={onEdit}>
            <Edit3 className="mr-2 h-4 w-4" />
            Изменить
          </ContextMenuItem>
        ) : null}

        {hasAttachments ? (
          <>
            <ContextMenuSeparator />

            {message.attachments.length === 1 ? (
              <ContextMenuItem
                onClick={() => downloadAttachment(message.attachments[0])}
              >
                <Download className="mr-2 h-4 w-4" />
                Скачать файл
              </ContextMenuItem>
            ) : (
              <>
                <ContextMenuItem onClick={downloadAllAttachments}>
                  <Download className="mr-2 h-4 w-4" />
                  Скачать все
                </ContextMenuItem>

                <ContextMenuSub>
                  <ContextMenuSubTrigger>
                    <Download className="mr-2 h-4 w-4" />
                    Скачать отдельно
                  </ContextMenuSubTrigger>

                  <ContextMenuSubContent className="cf-panel w-64">
                    {message.attachments.map(attachment => (
                      <ContextMenuItem
                        key={attachment.id}
                        onClick={() => downloadAttachment(attachment)}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        <span className="truncate">{attachment.name}</span>
                      </ContextMenuItem>
                    ))}
                  </ContextMenuSubContent>
                </ContextMenuSub>
              </>
            )}
          </>
        ) : null}

        {canDelete ? (
          <>
            <ContextMenuSeparator />

            <ContextMenuItem
              className="text-[var(--cf-red)]"
              onClick={() => void deleteMessage()}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Удалить
            </ContextMenuItem>
          </>
        ) : null}
      </ContextMenuContent>
    </ContextMenu>
  )
}

function AttachmentPreview({ attachment }: { attachment: UIAttachment }) {
  return (
    <div className="overflow-hidden rounded-md border border-[var(--cf-border)] bg-[var(--cf-element)]">
      {attachment.kind === 'image' && attachment.previewUrl ? (
        <Image
          width={92}
          height={70}
          unoptimized
          src={attachment.previewUrl}
          alt={attachment.name}
          className="max-h-56 w-full object-cover"
        />
      ) : null}

      {attachment.kind === 'video' && attachment.url ? (
        <video
          src={attachment.url}
          controls
          className="max-h-56 w-full bg-black"
        />
      ) : null}

      {(attachment.kind === 'audio' || attachment.kind === 'voice') &&
      attachment.url ? (
        <div className="px-2 py-2">
          <audio src={attachment.url} controls className="w-full" />
        </div>
      ) : null}

      <div className="flex items-center gap-2 px-2 py-1.5">
        {attachment.kind === 'image' ? (
          <ImageIcon className="h-4 w-4 text-[var(--cf-icon)]" />
        ) : (
          <FileText className="h-4 w-4 text-[var(--cf-icon)]" />
        )}

        <span className="min-w-0 flex-1 truncate text-[11px] text-[var(--cf-text)]">
          {attachment.name}
        </span>
      </div>
    </div>
  )
}

function downloadAttachment(attachment: UIAttachment) {
  if (!attachment.url || !attachment.downloadable) return

  const link = document.createElement('a')
  link.href = attachment.url
  link.download = attachment.name
  link.rel = 'noopener noreferrer'
  document.body.appendChild(link)
  link.click()
  link.remove()
}
