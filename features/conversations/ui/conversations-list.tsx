"use client"

import { Search, Star, MessageSquare, Bot, UserRound } from "lucide-react"
import type {
  Conversation,
  ConversationAiMode,
  ConversationFilterStatus,
} from "../model/conversations-types"
import type { ChannelType } from "@/entities/crm/types"
import { cn } from "@/shared/lib/cn"
import { useCRMStore } from "@/entities/crm/model/crm-store"
import { Badge } from "@/shared/ui/badge"
import { ScrollArea } from "@/shared/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select"

type ConversationsListProps = {
  conversations: Conversation[]
  selectedConversationId: string | null
  onSelect: (id: string) => void
  loading: boolean
  error: string | null
}

export function ConversationsList({
  conversations,
  selectedConversationId,
  onSelect,
  loading,
  error,
}: ConversationsListProps) {
  const { conversationsFilters, updateConversationFilters } = useCRMStore()

  return (
    <section className="cf-panel flex min-h-0 flex-col overflow-hidden">
      <div className="border-b border-[var(--cf-border)] p-3">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-[13px] font-semibold text-[var(--cf-text)]">
            Диалоги
          </div>
          <Badge className="bg-[var(--cf-button)] text-[var(--cf-text)]">
            {conversations.length}
          </Badge>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--cf-icon)]" />
          <input
            className="cf-control w-full pl-9 pr-3"
            placeholder="Search"
            value={conversationsFilters.search}
            onChange={(event) =>
              updateConversationFilters({ search: event.target.value })
            }
          />
        </div>

        <div className="mt-2 grid grid-cols-2 gap-2">
          <SmallSelect
            value={conversationsFilters.channel}
            onValueChange={(value) =>
              updateConversationFilters({ channel: value as ChannelType | "all" })
            }
            items={[
              ["all", "Все каналы"],
              ["telegram", "Telegram"],
              ["whatsapp", "WhatsApp"],
              ["website_chat", "Website chat"],
              ["website_form", "Form"],
              ["phone", "Phone"],
            ]}
          />

          <SmallSelect
            value={conversationsFilters.status}
            onValueChange={(value) =>
              updateConversationFilters({ status: value as ConversationFilterStatus })
            }
            items={[
              ["all", "Все статусы"],
              ["open", "Open"],
              ["ai_answering", "AI"],
              ["waiting_manager", "Waiting manager"],
              ["waiting_client", "Waiting client"],
              ["manager_took_over", "Taken over"],
              ["closed", "Closed"],
              ["spam", "Spam"],
            ]}
          />

          <SmallSelect
            value={conversationsFilters.aiMode}
            onValueChange={(value) =>
              updateConversationFilters({ aiMode: value as ConversationAiMode | "all" })
            }
            items={[
              ["all", "AI mode"],
              ["manual", "Manual"],
              ["ai_suggest", "AI suggest"],
              ["ai_auto", "AI auto"],
              ["hybrid", "Hybrid"],
            ]}
          />

          <SmallSelect
            value={conversationsFilters.saved}
            onValueChange={(value) =>
              updateConversationFilters({
                saved: value as "all" | "saved" | "not_saved",
              })
            }
            items={[
              ["all", "All"],
              ["saved", "Saved"],
              ["not_saved", "Not saved"],
            ]}
          />
        </div>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        {error ? (
          <div className="p-3 text-[12px] text-[var(--cf-red)]">{error}</div>
        ) : null}

        {!loading && conversations.length === 0 ? (
          <div className="p-6 text-center text-[12px] text-[var(--cf-text-muted)]">
            Диалоги не найдены
          </div>
        ) : null}

        <div className="space-y-1 p-2">
          {conversations.map((conversation) => (
            <button
              key={conversation.id}
              type="button"
              onClick={() => onSelect(conversation.id)}
              className={cn(
                "w-full rounded-md border border-transparent p-3 text-left transition hover:bg-[var(--cf-element-hover)]",
                selectedConversationId === conversation.id &&
                  "border-[var(--cf-border)] bg-[var(--cf-element)]"
              )}
            >
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--cf-button)] text-[11px] font-semibold text-[var(--cf-text)]">
                  {conversation.clientName
                    .split(" ")
                    .slice(0, 2)
                    .map((part) => part[0])
                    .join("")}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="truncate text-[12px] font-semibold text-[var(--cf-text)]">
                      {conversation.clientName}
                    </div>
                    <div className="shrink-0 text-[10px] text-[var(--cf-text-muted)]">
                      {conversation.lastMessageAt}
                    </div>
                  </div>

                  <div className="mt-1 flex items-center gap-1.5">
                    <ChannelBadge channel={conversation.channel} />
                    <StatusBadge status={conversation.status} />
                    {conversation.isSavedByCurrentUser ? (
                      <Star className="h-3.5 w-3.5 text-[var(--cf-yellow)]" />
                    ) : null}
                  </div>

                  <div className="mt-2 line-clamp-2 text-[11px] leading-4 text-[var(--cf-text-muted)]">
                    {conversation.lastMessage}
                  </div>
                </div>

                {conversation.unreadCount > 0 ? (
                  <div className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--cf-red)] px-1.5 text-[10px] font-semibold text-white">
                    {conversation.unreadCount}
                  </div>
                ) : null}
              </div>

              <div className="mt-2 flex items-center gap-2 text-[10px] text-[var(--cf-text-muted)]">
                {conversation.aiSettings.enabled ? (
                  <Bot className="h-3.5 w-3.5 text-[var(--cf-blue)]" />
                ) : (
                  <UserRound className="h-3.5 w-3.5" />
                )}
                <span>{conversation.aiSettings.mode}</span>
                <span>·</span>
                <span>{conversation.assignedSellerName ?? "no manager"}</span>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </section>
  )
}

function SmallSelect({
  value,
  items,
  onValueChange,
}: {
  value: string
  items: Array<[string, string]>
  onValueChange: (value: string) => void
}) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="cf-control w-full px-2 text-[11px] shadow-none">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="cf-panel">
        {items.map(([itemValue, label]) => (
          <SelectItem key={itemValue} value={itemValue}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function ChannelBadge({ channel }: { channel: ChannelType }) {
  return (
    <Badge className="bg-[var(--cf-button)] px-1.5 py-0 text-[10px] text-[var(--cf-text)]">
      {channel}
    </Badge>
  )
}

function StatusBadge({ status }: { status: string }) {
  const className =
    status === "waiting_manager"
      ? "bg-[var(--cf-yellow)] text-black"
      : status === "ai_answering"
        ? "bg-[var(--cf-blue)] text-black"
        : status === "closed"
          ? "bg-[var(--cf-button)] text-[var(--cf-text)]"
          : status === "spam"
            ? "bg-[var(--cf-red)] text-white"
            : "bg-[var(--cf-green)] text-black"

  return <Badge className={`${className} px-1.5 py-0 text-[10px]`}>{status}</Badge>
}