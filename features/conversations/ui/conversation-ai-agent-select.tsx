"use client"

import * as React from "react"
import type { Conversation } from "../model/conversations-types"
import { useCRMStore } from "@/entities/crm/model/crm-store"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select"
import { Badge } from "@/shared/ui/badge"

type ConversationAIAgentSelectProps = {
  conversation: Conversation
}

export function ConversationAIAgentSelect({
  conversation,
}: ConversationAIAgentSelectProps) {
  const {
    aiAgents,
    loadAiAgents,
    changeConversationAIAgent,
  } = useCRMStore()

  React.useEffect(() => {
    void loadAiAgents()
  }, [loadAiAgents])

  return (
    <div className="flex items-center gap-2">
      <Select
        value={conversation.aiSettings.aiAgentId ?? ""}
        onValueChange={(aiAgentId) =>
          void changeConversationAIAgent(conversation.id, aiAgentId)
        }
      >
        <SelectTrigger className="cf-control w-[210px] px-3 text-[11px] shadow-none">
          <SelectValue placeholder="Выбрать AI agent" />
        </SelectTrigger>

        <SelectContent className="cf-panel">
          {aiAgents.map((agent) => (
            <SelectItem
              key={agent.id}
              value={agent.id}
              disabled={agent.status !== "active"}
            >
              {agent.name} · {agent.mode}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Badge className="bg-[var(--cf-button)] text-[var(--cf-text)]">
        {conversation.aiSettings.mode}
      </Badge>
    </div>
  )
}