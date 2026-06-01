'use client'

import * as React from 'react'
import { Bot, Star, UserRound } from 'lucide-react'
import type { Conversation, CRMMessage } from '../model/conversations-types'
import { useCRMStore } from '@/entities/crm/model/crm-store'
import { ConversationMessageBubble } from './conversation-message-bubble'
import { ConversationComposer } from './conversation-composer'
import { ConversationActions } from './conversation-actions'
import { ScrollArea } from '@/shared/ui/scroll-area'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { ConversationCallButton } from './conversation-call-button'
import { ConversationMoreMenu } from './conversation-more-menu'

type ConversationChatProps = {
  conversation: Conversation | null
}

export function ConversationChat({ conversation }: ConversationChatProps) {
  if (!conversation) {
    return (
      <section className="cf-panel flex items-center justify-center text-[12px] text-[var(--cf-text-muted)]">
        Выберите диалог
      </section>
    )
  }

  return (
    <ConversationChatInner key={conversation.id} conversation={conversation} />
  )
}

function ConversationChatInner({
  conversation
}: {
  conversation: Conversation
}) {
  const [replyTo, setReplyTo] = React.useState<CRMMessage | null>(null)
  const [editingMessage, setEditingMessage] = React.useState<CRMMessage | null>(
    null
  )

  const { saveConversation, unsaveConversation } = useCRMStore()

  return (
    <section className="cf-panel flex min-h-0 flex-col overflow-hidden">
      <div className="flex min-h-[58px] items-center justify-between gap-3 border-b border-[var(--cf-border)] px-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--cf-button)] text-[11px] font-semibold">
            {conversation.clientName
              .split(' ')
              .slice(0, 2)
              .map(part => part[0])
              .join('')}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="truncate text-[13px] font-semibold text-[var(--cf-text)]">
                {conversation.clientName}
              </div>

              <Badge className="bg-[var(--cf-button)] text-[var(--cf-text)]">
                {conversation.channel}
              </Badge>
            </div>

            <div className="mt-1 flex items-center gap-2 text-[11px] text-[var(--cf-text-muted)]">
              {conversation.aiSettings.enabled ? (
                <Bot className="h-3.5 w-3.5 text-[var(--cf-blue)]" />
              ) : (
                <UserRound className="h-3.5 w-3.5" />
              )}

              <span>{conversation.status}</span>
              <span>·</span>
              <span>{conversation.assignedSellerName ?? 'no manager'}</span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <ConversationActions conversation={conversation} />

          <Button
            type="button"
            variant="ghost"
            className="cf-icon-button"
            onClick={() =>
              conversation.isSavedByCurrentUser
                ? void unsaveConversation(conversation.id)
                : void saveConversation(conversation.id)
            }
          >
            <Star
              className={
                conversation.isSavedByCurrentUser
                  ? 'h-4 w-4 fill-[var(--cf-yellow)] text-[var(--cf-yellow)]'
                  : 'h-4 w-4'
              }
            />
          </Button>

          <ConversationCallButton conversation={conversation} />
          <ConversationMoreMenu conversation={conversation} />
        </div>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className="space-y-2 p-4">
          {conversation.messages.map(message => (
            <ConversationMessageBubble
              key={message.id}
              message={message}
              onReply={() => {
                setReplyTo(message)
                setEditingMessage(null)
              }}
              onEdit={() => {
                setEditingMessage(message)
                setReplyTo(null)
              }}
            />
          ))}

          {conversation.status === 'ai_answering' ? (
            <div className="flex items-center gap-2 text-[11px] text-[var(--cf-text-muted)]">
              <Bot className="h-3.5 w-3.5 text-[var(--cf-blue)]" />
              AI thinking...
            </div>
          ) : null}
        </div>
      </ScrollArea>

      <ConversationComposer
        key={editingMessage ? `edit-${editingMessage.id}` : 'new-message'}
        conversation={conversation}
        replyTo={replyTo}
        editingMessage={editingMessage}
        onCancelReply={() => setReplyTo(null)}
        onCancelEdit={() => setEditingMessage(null)}
      />
    </section>
  )
}
