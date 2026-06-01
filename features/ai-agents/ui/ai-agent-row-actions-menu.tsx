'use client'

import {
  Copy,
  MoreVertical,
  Pencil,
  Power,
  PowerOff,
  Trash2
} from 'lucide-react'
import { useCRMStore } from '@/entities/crm/model/crm-store'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/shared/ui/dropdown-menu'
import type { AIAgent } from '../model/ai-agents-types'

export function AIAgentRowActionsMenu({
  agent,
  onOpen
}: {
  agent: AIAgent
  onOpen: () => void
}) {
  const { updateAiAgentStatus, duplicateAiAgent, deleteAiAgent } = useCRMStore()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-(--cf-table-text) hover:bg-(--cf-table-text)/15 hover:text-(--cf-table-text) dark:hover:bg-(--cf-table-text)/15 aria-expanded:text-(--cf-table-text) aria-expanded:bg-(--cf-table-text)/15"
          onClick={event => event.stopPropagation()}
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="cf-panel w-56"
        onClick={event => event.stopPropagation()}
      >
        <DropdownMenuItem onClick={onOpen}>
          <Pencil className="mr-2 h-4 w-4 text-[var(--cf-icon)]" />
          Редактировать
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => void duplicateAiAgent(agent.id)}>
          <Copy className="mr-2 h-4 w-4 text-[var(--cf-icon)]" />
          Дублировать
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-[var(--cf-border)]" />

        <DropdownMenuItem
          onClick={() => void updateAiAgentStatus(agent.id, 'active')}
        >
          <Power className="mr-2 h-4 w-4 text-[var(--cf-icon)]" />
          Enable
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => void updateAiAgentStatus(agent.id, 'disabled')}
        >
          <PowerOff className="mr-2 h-4 w-4 text-[var(--cf-icon)]" />
          Disable
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-[var(--cf-border)]" />

        <DropdownMenuItem
          className="text-[var(--cf-red)]"
          onClick={() => {
            const confirmed = window.confirm('Удалить AI agent?')

            if (!confirmed) return

            void deleteAiAgent(agent.id)
          }}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Удалить
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}