"use client"

import {
  Archive,
  Ban,
  ClipboardList,
  FileText,
  MoreVertical,
  PackagePlus,
  Save,
  Trash2,
} from "lucide-react"
import type { Conversation } from "../model/conversations-types"
import { useCRMStore } from "@/entities/crm/model/crm-store"
import { Button } from "@/shared/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu"

type ConversationMoreMenuProps = {
  conversation: Conversation
}

export function ConversationMoreMenu({
  conversation,
}: ConversationMoreMenuProps) {
  const {
    saveConversation,
    unsaveConversation,
    closeConversation,
    markConversationAsSpam,
  } = useCRMStore()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="ghost" className="cf-icon-button">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="cf-panel w-56">
        <DropdownMenuItem>
          <FileText className="mr-2 h-4 w-4 text-[var(--cf-icon)]" />
          Create Deal
        </DropdownMenuItem>

        <DropdownMenuItem>
          <PackagePlus className="mr-2 h-4 w-4 text-[var(--cf-icon)]" />
          Create Order
        </DropdownMenuItem>

        <DropdownMenuItem>
          <ClipboardList className="mr-2 h-4 w-4 text-[var(--cf-icon)]" />
          Create Task
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-[var(--cf-border)]" />

        {conversation.isSavedByCurrentUser ? (
          <DropdownMenuItem
            onClick={() => void unsaveConversation(conversation.id)}
          >
            <Save className="mr-2 h-4 w-4 text-[var(--cf-icon)]" />
            Remove from saved
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            onClick={() => void saveConversation(conversation.id)}
          >
            <Save className="mr-2 h-4 w-4 text-[var(--cf-icon)]" />
            Save conversation
          </DropdownMenuItem>
        )}

        <DropdownMenuItem
          onClick={() => void closeConversation(conversation.id)}
        >
          <Archive className="mr-2 h-4 w-4 text-[var(--cf-icon)]" />
          Close conversation
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-[var(--cf-border)]" />

        <DropdownMenuItem
          className="text-[var(--cf-red)]"
          onClick={() => void markConversationAsSpam(conversation.id)}
        >
          <Ban className="mr-2 h-4 w-4" />
          Mark as spam
        </DropdownMenuItem>

        <DropdownMenuItem className="text-[var(--cf-red)]">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete conversation
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}