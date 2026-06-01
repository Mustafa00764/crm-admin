'use client'

import { Search } from 'lucide-react'
import { useCRMStore } from '@/entities/crm/model/crm-store'
import type {
  AIAgentContextFlag,
  AIAgentProvider,
  AIAgentRole,
  AIAgentStatus
} from '../model/ai-agents-types'
import {
  aiAgentContextFlags,
  aiAgentProviders,
  aiAgentRoles,
  aiAgentStatuses
} from '../model/ai-agents-types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/shared/ui/select'

export function AIAgentsFilters({ onChange }: { onChange?: () => void }) {
  const { aiAgentFilters, updateAiAgentFilters } = useCRMStore()

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <SmallSelect
          value={aiAgentFilters.status}
          className="w-[135px]"
          onValueChange={value => {
            updateAiAgentFilters({ status: value as AIAgentStatus | 'all' })
            onChange?.()
          }}
          items={[
            ['all', 'All statuses'],
            ...aiAgentStatuses.map(item => [item.value, item.label] as const)
          ]}
        />

        <SmallSelect
          value={aiAgentFilters.provider}
          className="w-[180px]"
          onValueChange={value => {
            updateAiAgentFilters({
              provider: value as AIAgentProvider | 'all'
            })
            onChange?.()
          }}
          items={[
            ['all', 'All providers'],
            ...aiAgentProviders.map(item => [item.value, item.label] as const)
          ]}
        />

        <SmallSelect
          value={aiAgentFilters.role}
          className="w-[170px]"
          onValueChange={value => {
            updateAiAgentFilters({ role: value as AIAgentRole | 'all' })
            onChange?.()
          }}
          items={[
            ['all', 'All roles'],
            ...aiAgentRoles.map(item => [item.value, item.label] as const)
          ]}
        />

        <SmallSelect
          value={aiAgentFilters.supportsTools}
          className="w-[140px]"
          onValueChange={value => {
            updateAiAgentFilters({
              supportsTools: value as 'all' | 'yes' | 'no'
            })
            onChange?.()
          }}
          items={[
            ['all', 'Tools'],
            ['yes', 'Tools yes'],
            ['no', 'Tools no']
          ]}
        />

        <SmallSelect
          value={aiAgentFilters.supportsFiles}
          className="w-[140px]"
          onValueChange={value => {
            updateAiAgentFilters({
              supportsFiles: value as 'all' | 'yes' | 'no'
            })
            onChange?.()
          }}
          items={[
            ['all', 'Files'],
            ['yes', 'Files yes'],
            ['no', 'Files no']
          ]}
        />

        <SmallSelect
          value={aiAgentFilters.supportsImages}
          className="w-[140px]"
          onValueChange={value => {
            updateAiAgentFilters({
              supportsImages: value as 'all' | 'yes' | 'no'
            })
            onChange?.()
          }}
          items={[
            ['all', 'Images'],
            ['yes', 'Images yes'],
            ['no', 'Images no']
          ]}
        />

        <SmallSelect
          value={aiAgentFilters.fallbackToManager}
          className="w-[150px]"
          onValueChange={value => {
            updateAiAgentFilters({
              fallbackToManager: value as 'all' | 'yes' | 'no'
            })
            onChange?.()
          }}
          items={[
            ['all', 'Fallback'],
            ['yes', 'Fallback yes'],
            ['no', 'Fallback no']
          ]}
        />

        <SmallSelect
          value={aiAgentFilters.contextFlag}
          className="w-[190px]"
          onValueChange={value => {
            updateAiAgentFilters({
              contextFlag: value as AIAgentContextFlag | 'all'
            })
            onChange?.()
          }}
          items={[
            ['all', 'All context'],
            ...aiAgentContextFlags.map(
              item => [item.value, item.label] as const
            )
          ]}
        />
      </div>

      <div className="relative w-full max-w-[460px]">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--cf-icon)]" />

        <input
          className="cf-control w-full pl-9 pr-3 outline-none placeholder:text-[var(--cf-text-muted)]"
          placeholder="Search agent, prompt, model..."
          value={aiAgentFilters.search}
          onChange={event => {
            updateAiAgentFilters({ search: event.target.value })
            onChange?.()
          }}
        />
      </div>
    </section>
  )
}

function SmallSelect({
  value,
  items,
  onValueChange,
  className
}: {
  value: string
  items: ReadonlyArray<readonly [string, string]>
  onValueChange: (value: string) => void
  className: string
}) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={`cf-control ${className} px-3 shadow-none`}>
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