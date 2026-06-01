'use client'

import { Bot, Brain, FileText, ImageIcon, Wrench } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { SelectCheckbox } from '@/shared/ui/select-checkbox'
import type { AIAgent } from '../model/ai-agents-types'
import { AIAgentStatusSelect } from './ai-agent-status-select'
import { AIAgentRowActionsMenu } from './ai-agent-row-actions-menu'

export function AIAgentsTable({
  agents,
  selectedAgentId,
  selectedAgentIds,
  onSelect,
  onToggleAgent,
  onToggleAll
}: {
  agents: AIAgent[]
  selectedAgentId: string | null
  selectedAgentIds: string[]
  onSelect: (agentId: string) => void
  onToggleAgent: (agentId: string) => void
  onToggleAll: () => void
}) {
  const allSelected =
    agents.length > 0 &&
    agents.every(agent => selectedAgentIds.includes(agent.id))

  return (
    <section className="cf-panel min-h-0 overflow-hidden">
      <div className="h-[calc(100vh-230px)] overflow-auto">
        <table className="w-max min-w-[1680px] border-separate border-spacing-0">
          <thead>
            <tr>
              <th className="sticky left-0 top-0 z-50 h-9 w-[52px] min-w-[52px] bg-[var(--cf-panel-soft)] px-3 text-left">
                <SelectCheckbox
                  checked={allSelected}
                  onCheckedChange={onToggleAll}
                />
              </th>

              <th className="sticky left-[52px] top-0 z-50 h-9 w-[56px] min-w-[56px] bg-[var(--cf-panel-soft)] px-3 text-left text-[11px] text-[var(--cf-text-muted)] shadow-[2px_0_2px_rgba(0,0,0,0.05)]">
                #
              </th>

              <Head className="min-w-[250px]">agent</Head>
              <Head className="min-w-[140px]">role</Head>
              <Head className="min-w-[170px]">provider</Head>
              <Head className="min-w-[180px]">model</Head>
              <Head className="min-w-[140px]">status</Head>
              <Head className="min-w-[150px]">capabilities</Head>
              <Head className="min-w-[210px]">context</Head>
              <Head className="min-w-[110px]">fallback</Head>
              <Head className="min-w-[130px]">confidence</Head>
              <Head className="min-w-[110px]">temp</Head>
              <Head className="min-w-[110px]">tokens</Head>
              <Head className="min-w-[170px]">updated</Head>

              <th className="sticky right-0 top-0 z-50 h-9 w-[74px] min-w-[74px] bg-[var(--cf-panel-soft)] px-3 text-center text-[11px] text-[var(--cf-text-muted)] shadow-[-2px_0_2px_rgba(0,0,0,0.05)]">
                options
              </th>
            </tr>
          </thead>

          <tbody>
            {agents.map((agent, index) => {
              const checked = selectedAgentIds.includes(agent.id)

              return (
                <tr
                  key={agent.id}
                  onClick={() => onSelect(agent.id)}
                  className={cn(
                    'group cursor-pointer',
                    selectedAgentId === agent.id && 'is-selected'
                  )}
                >
                  <Cell className="sticky left-0 z-30 w-[52px] min-w-[52px] group-hover:bg-[var(--cf-table-row-hover)]">
                    <div
                      onClick={event => event.stopPropagation()}
                      onPointerDown={event => event.stopPropagation()}
                    >
                      <SelectCheckbox
                        checked={checked}
                        onCheckedChange={() => onToggleAgent(agent.id)}
                      />
                    </div>
                  </Cell>

                  <Cell className="sticky left-[52px] z-30 w-[56px] min-w-[56px] shadow-[2px_0_2px_rgba(0,0,0,0.05)] group-hover:bg-[var(--cf-table-row-hover)]">
                    {index + 1}
                  </Cell>

                  <Cell className="min-w-[250px] max-w-[250px]">
                    <div className="flex items-center gap-2">
                      <Brain className="h-4 w-4 shrink-0 opacity-70" />
                      <div className="min-w-0">
                        <div className="truncate font-medium">
                          {agent.name}
                        </div>
                        <div className="truncate text-[10px] opacity-60">
                          {agent.version} · {agent.id}
                        </div>
                      </div>
                    </div>
                  </Cell>

                  <Cell className="min-w-[140px]">{agent.role}</Cell>
                  <Cell className="min-w-[170px]">{agent.provider}</Cell>
                  <Cell className="min-w-[180px]">{agent.model}</Cell>

                  <Cell className="min-w-[140px]">
                    <AIAgentStatusSelect agent={agent} variant="table" />
                  </Cell>

                  <Cell className="min-w-[150px]">
                    <div className="flex items-center gap-1.5">
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
                  </Cell>

                  <Cell className="min-w-[210px] max-w-[210px]">
                    <div className="truncate">
                      {getContextLabels(agent).join(', ') || '—'}
                    </div>
                  </Cell>

                  <Cell className="min-w-[110px]">
                    {agent.fallbackToManager ? 'yes' : 'no'}
                  </Cell>

                  <Cell className="min-w-[130px]">
                    {agent.minConfidenceToAutoReply}%
                  </Cell>

                  <Cell className="min-w-[110px]">{agent.temperature}</Cell>
                  <Cell className="min-w-[110px]">
                    {agent.maxTokens ?? '—'}
                  </Cell>

                  <Cell className="min-w-[170px]">{agent.updatedAt}</Cell>

                  <Cell className="sticky right-0 z-30 w-[74px] min-w-[74px] text-center shadow-[-2px_0_2px_rgba(0,0,0,0.05)] group-hover:bg-[var(--cf-table-row-hover)]">
                    <AIAgentRowActionsMenu
                      agent={agent}
                      onOpen={() => onSelect(agent.id)}
                    />
                  </Cell>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function getContextLabels(agent: AIAgent) {
  return [
    agent.useClientContext ? 'client' : '',
    agent.useProductCatalog ? 'products' : '',
    agent.useConversationHistory ? 'history' : '',
    agent.useWebsiteEvents ? 'events' : '',
    agent.useDealsContext ? 'deals' : '',
    agent.useOrdersContext ? 'orders' : ''
  ].filter(Boolean)
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
      className={cn(
        'flex h-6 w-6 items-center justify-center rounded-md border',
        active
          ? 'border-[var(--cf-blue)] bg-[rgba(8,183,239,0.12)] text-[var(--cf-blue)]'
          : 'border-[var(--cf-border)] bg-[var(--cf-bg)] opacity-45'
      )}
    >
      {children}
    </span>
  )
}

function Head({
  children,
  className
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <th
      className={cn(
        'sticky top-0 z-40 h-9 bg-[var(--cf-panel-soft)] px-3 text-left text-[11px] font-medium text-[var(--cf-text-muted)]',
        className
      )}
    >
      {children}
    </th>
  )
}

function Cell({
  children,
  className
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <td
      className={cn(
        'h-[42px] border-b border-[rgba(255,255,255,0.06)] bg-[var(--cf-table-row)] px-3 text-[12px] text-[var(--cf-table-text)] transition group-even:bg-[var(--cf-table-row-alt)] group-hover:bg-[var(--cf-table-row-hover)]',
        className
      )}
    >
      {children}
    </td>
  )
}