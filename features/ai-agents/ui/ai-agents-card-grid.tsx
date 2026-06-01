'use client'

import { Brain, FileText, ImageIcon, ShieldAlert, Wrench } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { SelectCheckbox } from '@/shared/ui/select-checkbox'
import type { AIAgent } from '../model/ai-agents-types'
import { AIAgentRowActionsMenu } from './ai-agent-row-actions-menu'

export function AIAgentsCardGrid({
  agents,
  selectedAgentIds,
  onSelect,
  onToggleAgent
}: {
  agents: AIAgent[]
  selectedAgentIds: string[]
  onSelect: (agentId: string) => void
  onToggleAgent: (agentId: string) => void
}) {
  if (agents.length === 0) {
    return (
      <section className="cf-panel flex min-h-[320px] items-center justify-center text-[12px] text-[var(--cf-text-muted)]">
        AI agents not found
      </section>
    )
  }

  return (
    <section className="grid grid-cols-3 gap-3 pb-4 2xl:grid-cols-4">
      {agents.map(agent => {
        const checked = selectedAgentIds.includes(agent.id)

        return (
          <article
            key={agent.id}
            onClick={() => onSelect(agent.id)}
            className={cn(
              'cf-panel cursor-pointer p-3 transition-[background-color,border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:bg-[var(--cf-element)]',
              checked &&
                'border-[var(--cf-blue)] bg-[rgba(8,183,239,0.09)] shadow-[0_0_0_1px_var(--cf-blue)]'
            )}
          >
            <div className="mb-3 flex items-start justify-between gap-2">
              <div className="flex items-start gap-2">
                <div
                  className="flex shrink-0 items-center gap-1"
                  onClick={event => event.stopPropagation()}
                  onPointerDown={event => event.stopPropagation()}
                >
                  <SelectCheckbox
                    checked={checked}
                    onCheckedChange={() => onToggleAgent(agent.id)}
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 truncate text-[13px] font-semibold text-[var(--cf-text)]">
                    <Brain className="h-4 w-4 shrink-0 text-[var(--cf-icon)]" />
                    <span className="truncate">{agent.name}</span>
                  </div>

                  <div className="mt-0.5 truncate text-[11px] text-[var(--cf-text-muted)]">
                    {agent.provider} · {agent.model}
                  </div>
                </div>
              </div>

              <div
                className="flex shrink-0 items-center gap-1 [&_svg]:text-primary"
                onClick={event => event.stopPropagation()}
                onPointerDown={event => event.stopPropagation()}
              >
                <AIAgentRowActionsMenu
                  agent={agent}
                  onOpen={() => onSelect(agent.id)}
                />
              </div>
            </div>

            <div className="mb-3 flex flex-wrap gap-1.5">
              <Chip>{agent.status}</Chip>
              <Chip>{agent.role}</Chip>
              <Chip>{agent.version}</Chip>
            </div>

            <div className="mb-3 min-h-[42px] line-clamp-2 text-[12px] leading-5 text-[var(--cf-text-muted)]">
              {agent.description ?? 'No description'}
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <Info label="Confidence">{agent.minConfidenceToAutoReply}%</Info>

              <Info label="Temperature">{agent.temperature}</Info>

              <Info label="Max tokens">{agent.maxTokens ?? '—'}</Info>

              <Info label="Fallback">
                <span className="inline-flex items-center gap-1">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  {agent.fallbackToManager ? 'yes' : 'no'}
                </span>
              </Info>
            </div>

            <div className="mt-3 flex items-center gap-1.5">
              <Capability active={agent.supportsTools}>
                <Wrench className="h-3.5 w-3.5" />
              </Capability>

              <Capability active={agent.supportsFiles}>
                <FileText className="h-3.5 w-3.5" />
              </Capability>

              <Capability active={agent.supportsImages}>
                <ImageIcon className="h-3.5 w-3.5" />
              </Capability>
            </div>
          </article>
        )
      })}
    </section>
  )
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-md bg-[var(--cf-button)] px-2 py-1 text-[10px] text-[var(--cf-text)]">
      {children}
    </span>
  )
}

function Info({
  label,
  children
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-md border border-(--cf-border) bg-(--cf-element) p-2">
      <div className="text-[10px] text-(--cf-text-muted)">{label}</div>

      <div className="mt-1 text-[12px] font-semibold text-(--cf-text)">
        {children}
      </div>
    </div>
  )
}

function Capability({
  active,
  children
}: {
  active: boolean
  children: React.ReactNode
}) {
  return (
    <span
      className={
        active
          ? 'flex h-7 w-7 items-center justify-center rounded-md border border-[var(--cf-blue)] bg-[rgba(8,183,239,0.12)] text-[var(--cf-blue)]'
          : 'flex h-7 w-7 items-center justify-center rounded-md border border-[var(--cf-border)] bg-[var(--cf-bg)] text-[var(--cf-text-muted)] opacity-50'
      }
    >
      {children}
    </span>
  )
}
