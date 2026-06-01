'use client'

import * as React from 'react'
import { useCRMStore } from '@/entities/crm/model/crm-store'
import { cn } from '@/shared/lib/cn'
import {
  aiAgentStatuses,
  type AIAgent,
  type AIAgentStatus
} from '../model/ai-agents-types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/shared/ui/select'

const statusDotColors: Record<AIAgentStatus, string> = {
  active: '#22c55e',
  disabled: '#64748b',
  error: '#ef1748'
}

export function AIAgentStatusSelect({
  agent,
  variant = 'default'
}: {
  agent: AIAgent
  variant?: 'default' | 'table'
}) {
  const { updateAiAgentStatus } = useCRMStore()
  const [pending, setPending] = React.useState(false)

  const isTable = variant === 'table'

  const handleChange = async (nextStatus: AIAgentStatus) => {
    if (pending) return
    if (nextStatus === agent.status) return

    setPending(true)

    try {
      await updateAiAgentStatus(agent.id, nextStatus)
    } finally {
      setPending(false)
    }
  }

  return (
    <div
      onClick={event => event.stopPropagation()}
      onPointerDown={event => event.stopPropagation()}
    >
      <Select
        value={agent.status}
        disabled={pending}
        onValueChange={value => void handleChange(value as AIAgentStatus)}
      >
        <SelectTrigger
          className={cn(
            'h-7 w-full border px-2 text-[11px] outline-none focus:ring-0 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-60',
            isTable
              ? 'border-(--cf-table-text)/15 bg-[rgba(255,255,255,0.24)] text-(--cf-table-text) hover:bg-[rgba(255,255,255,0.34)] [&_svg]:text-(--cf-table-text)/80'
              : 'border-(--cf-border) bg-(--cf-bg) text-primary [&_svg]:text-auto'
          )}
        >
          <span className="flex min-w-0 items-center gap-2">
            {/* <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: statusDotColors[agent.status] }}
            /> */}
            <span className="min-w-0 truncate">
              <SelectValue placeholder="AI status" />
            </span>
          </span>
        </SelectTrigger>

        <SelectContent className="border border-[var(--cf-border)] bg-[var(--cf-bg)] text-[var(--cf-text)]">
          {aiAgentStatuses.map(status => (
            <SelectItem
              key={status.value}
              value={status.value}
              textValue={status.label}
              className="text-[11px] focus:bg-[var(--cf-element-hover)] focus:text-[var(--cf-text)]"
            >
              <span className="flex items-center gap-2">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: statusDotColors[status.value] }}
                />
                <span>{status.label}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}