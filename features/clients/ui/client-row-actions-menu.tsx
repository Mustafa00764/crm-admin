"use client"

import { ExternalLink, MessageSquare, MoreVertical, Send, Trash2, UserRound } from "lucide-react"
import { useRouter } from "next/navigation"
import type { CRMClient } from "../model/clients-types"
import { useCRMStore } from "@/entities/crm/model/crm-store"
import { Button } from "@/shared/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu"

type ClientRowActionsMenuProps = {
  client: CRMClient
}

export function ClientRowActionsMenu({ client }: ClientRowActionsMenuProps) {
  const router = useRouter()
  const { deleteClient } = useCRMStore()

  const telegramUsername = client.telegramUsername?.replace("@", "")

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-(--cf-table-text) hover:text-(--cf-table-text) dark:hover:bg-(--cf-table-text)/15 hover:bg-(--cf-table-text)/15 aria-expanded:text-(--cf-table-text) aria-expanded:bg-(--cf-table-text)/15"
          onClick={(event) => event.stopPropagation()}
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="cf-panel w-60 ring-0"
        onClick={(event) => event.stopPropagation()}
      >
        <DropdownMenuItem
          disabled={!telegramUsername}
          onClick={() => {
            if (!telegramUsername) return
            window.open(`https://t.me/${telegramUsername}`, "_blank")
          }}
        >
          <UserRound className="mr-2 h-4 w-4 text-[var(--cf-icon)]" />
          Просмотреть профиль в Telegram
        </DropdownMenuItem>

        <DropdownMenuItem
          disabled={!telegramUsername}
          onClick={() => {
            if (!telegramUsername) return
            window.open(`https://t.me/${telegramUsername}`, "_blank")
          }}
        >
          <Send className="mr-2 h-4 w-4 text-[var(--cf-icon)]" />
          Написать в Telegram
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => {
            router.push(`/conversations?clientId=${client.id}`)
          }}
        >
          <MessageSquare className="mr-2 h-4 w-4 text-[var(--cf-icon)]" />
          Написать в чате админки
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-[var(--cf-border)]" />

        <DropdownMenuItem
          onClick={() => {
            router.push(`/clients/${client.id}`)
          }}
        >
          <ExternalLink className="mr-2 h-4 w-4 text-[var(--cf-icon)]" />
          Открыть карточку клиента
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-[var(--cf-border)]" />

        <DropdownMenuItem
          className="text-[var(--cf-red)]"
          onClick={() => void deleteClient(client.id)}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Удалить клиента
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}