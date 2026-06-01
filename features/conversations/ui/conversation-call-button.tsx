"use client"

import { Phone, Send, MessageCircle } from "lucide-react"
import type { Conversation } from "../model/conversations-types"
import { Button } from "@/shared/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu"

type ConversationCallButtonProps = {
  conversation: Conversation
}

export function ConversationCallButton({
  conversation,
}: ConversationCallButtonProps) {
  const phone =
    conversation.client.phone ??
    conversation.client.whatsappPhone ??
    ""

  const telegramUsername = conversation.client.telegramUsername

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="ghost" className="cf-icon-button">
          <Phone className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="cf-panel w-56">
        <DropdownMenuLabel className="text-[12px]">
          Связь с клиентом
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-[var(--cf-border)]" />

        <DropdownMenuItem
          disabled={!phone}
          onClick={() => {
            if (!phone) return
            window.location.href = `tel:${phone}`
          }}
        >
          <Phone className="mr-2 h-4 w-4 text-[var(--cf-icon)]" />
          Позвонить
        </DropdownMenuItem>

        <DropdownMenuItem
          disabled={!phone}
          onClick={() => {
            if (!phone) return
            const normalized = phone.replace(/[^\d]/g, "")
            window.open(`https://wa.me/${normalized}`, "_blank")
          }}
        >
          <MessageCircle className="mr-2 h-4 w-4 text-[var(--cf-icon)]" />
          Открыть WhatsApp
        </DropdownMenuItem>

        <DropdownMenuItem
          disabled={!telegramUsername}
          onClick={() => {
            if (!telegramUsername) return
            window.open(
              `https://t.me/${telegramUsername.replace("@", "")}`,
              "_blank"
            )
          }}
        >
          <Send className="mr-2 h-4 w-4 text-[var(--cf-icon)]" />
          Открыть Telegram
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}