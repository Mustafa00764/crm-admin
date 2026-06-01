"use client"

import * as React from "react"
import {
  Bot,
  Check,
  ChevronRight,
  Cpu,
  PauseCircle,
  PlayCircle,
  ShieldCheck,
  UserRoundCheck,
  XCircle,
} from "lucide-react"
import type { Conversation } from "../model/conversations-types"
import { useCRMStore } from "@/entities/crm/model/crm-store"
import { Button } from "@/shared/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu"

type ConversationActionsProps = {
  conversation: Conversation
}

export function ConversationActions({ conversation }: ConversationActionsProps) {
  const {
    aiAgents,
    loadAiAgents,
    changeConversationAIAgent,
    takeOverConversation,
    returnConversationToAI,
    disableAIForConversation,
    enableAIForConversation,
    closeConversation,
    markConversationAsSpam,
  } = useCRMStore()

  React.useEffect(() => {
    void loadAiAgents()
  }, [loadAiAgents])

  const currentAgentId = conversation.aiSettings.aiAgentId

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className="cf-icon-button"
          title="AI assistant"
        >
          <Bot className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="cf-panel w-[260px] p-1">
        <DropdownMenuLabel className="px-2 py-2">
          <div className="text-[12px] font-semibold text-[var(--cf-text)]">
            AI Assistant
          </div>
          <div className="mt-1 text-[10px] font-normal text-[var(--cf-text-muted)]">
            {conversation.aiSettings.aiAgentName ?? "AI agent не выбран"}
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-[var(--cf-border)]" />

        <DropdownMenuItem
          className="cursor-pointer text-[12px]"
          onClick={() => void takeOverConversation(conversation.id)}
        >
          <UserRoundCheck className="mr-2 h-4 w-4 text-[var(--cf-icon)]" />
          Take Over
        </DropdownMenuItem>

        <DropdownMenuItem
          className="cursor-pointer text-[12px]"
          onClick={() => void returnConversationToAI(conversation.id)}
        >
          <PlayCircle className="mr-2 h-4 w-4 text-[var(--cf-icon)]" />
          Return to AI
        </DropdownMenuItem>

        {conversation.aiSettings.enabled ? (
          <DropdownMenuItem
            className="cursor-pointer text-[12px]"
            onClick={() => void disableAIForConversation(conversation.id)}
          >
            <PauseCircle className="mr-2 h-4 w-4 text-[var(--cf-icon)]" />
            Disable AI
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            className="cursor-pointer text-[12px]"
            onClick={() => void enableAIForConversation(conversation.id)}
          >
            <PlayCircle className="mr-2 h-4 w-4 text-[var(--cf-icon)]" />
            Enable AI
          </DropdownMenuItem>
        )}

        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="cursor-pointer text-[12px]">
            <Cpu className="mr-2 h-4 w-4 text-[var(--cf-icon)]" />
            <span className="flex-1">Change AI Agent</span>
            {/* <ChevronRight className="ml-2 h-4 w-4 text-[var(--cf-icon)]" /> */}
          </DropdownMenuSubTrigger>

          <DropdownMenuSubContent className="cf-panel w-[300px] p-1">
            <DropdownMenuLabel className="px-2 py-2">
              <div className="text-[12px] font-semibold text-[var(--cf-text)]">
                Select AI version
              </div>
              <div className="mt-1 text-[10px] font-normal text-[var(--cf-text-muted)]">
                Этот ассистент будет отвечать клиенту в выбранном чате
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator className="bg-[var(--cf-border)]" />

            {aiAgents.map((agent) => {
              const isSelected = agent.id === currentAgentId
              const isDisabled = agent.status !== "active"

              return (
                <DropdownMenuItem
                  key={agent.id}
                  disabled={isDisabled}
                  className="cursor-pointer px-2 py-2 text-[12px]"
                  onClick={() =>
                    void changeConversationAIAgent(conversation.id, agent.id)
                  }
                >
                  <div className="mr-2 flex h-5 w-5 items-center justify-center">
                    {isSelected ? (
                      <Check className="h-4 w-4 text-[var(--cf-green)]" />
                    ) : (
                      <Bot className="h-4 w-4 text-[var(--cf-icon)]" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[12px] font-medium text-[var(--cf-text)]">
                      {agent.name}
                    </div>

                    <div className="mt-0.5 truncate text-[10px] text-[var(--cf-text-muted)]">
                      {agent.provider} · {agent.model} · {agent.mode}
                    </div>
                  </div>

                  {isDisabled ? (
                    <XCircle className="ml-2 h-4 w-4 text-[var(--cf-red)]" />
                  ) : (
                    <ShieldCheck className="ml-2 h-4 w-4 text-[var(--cf-icon)]" />
                  )}
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator className="bg-[var(--cf-border)]" />

        <DropdownMenuItem className="cursor-pointer text-[12px]">
          Create Deal
        </DropdownMenuItem>

        <DropdownMenuItem className="cursor-pointer text-[12px]">
          Create Order
        </DropdownMenuItem>

        <DropdownMenuItem className="cursor-pointer text-[12px]">
          Create Task
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-[var(--cf-border)]" />

        <DropdownMenuItem
          className="cursor-pointer text-[12px]"
          onClick={() => void closeConversation(conversation.id)}
        >
          Close Conversation
        </DropdownMenuItem>

        <DropdownMenuItem
          className="cursor-pointer text-[12px] text-[var(--cf-red)]"
          onClick={() => void markConversationAsSpam(conversation.id)}
        >
          Mark as Spam
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}