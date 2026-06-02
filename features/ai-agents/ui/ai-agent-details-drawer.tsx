'use client'

import * as React from 'react'
import { X } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { cn } from '@/shared/lib/cn'
import { useCloseOnEscape } from '@/shared/hooks/use-close-on-escape'
import { useCRMStore } from '@/entities/crm/model/crm-store'
import type {
  AIAgent,
  AIAgentProvider,
  AIAgentRole,
  AIAgentStatus,
  CreateAIAgentPayload
} from '../model/ai-agents-types'
import {
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

function clamp(value: number, min: number, max: number) {
  if (Number.isNaN(value)) return min
  return Math.min(max, Math.max(min, value))
}

function numberValue(value: string, fallback: number) {
  const parsed = Number(value.replace(',', '.'))
  return Number.isNaN(parsed) ? fallback : parsed
}

function optionalNumber(value: string) {
  const parsed = Number(value)

  if (!value.trim()) return undefined
  if (Number.isNaN(parsed)) return undefined

  return Math.max(1, Math.round(parsed))
}

export function AIAgentDetailsDrawer({
  open,
  agent,
  onClose
}: {
  open: boolean
  agent: AIAgent | null
  onClose: () => void
}) {
  useCloseOnEscape({ open, onClose })

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 transition-[visibility] duration-200',
        open ? 'visible' : 'invisible'
      )}
      aria-hidden={!open}
    >
      <div
        className={cn(
          'absolute inset-0 bg-black/45 backdrop-blur-sm transition-opacity duration-200 ease-out',
          open ? 'opacity-100' : 'opacity-0'
        )}
        onClick={onClose}
      />

      <aside
        className={cn(
          'absolute right-0 top-0 h-full w-full max-w-[860px] overflow-y-auto border-l border-[var(--cf-border)] bg-[var(--cf-bg)] p-4 shadow-2xl',
          'transition-all duration-200 ease-out will-change-transform',
          open ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        )}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-wide text-[var(--cf-text-muted)]">
              AI Agent
            </div>

            <h2 className="mt-1 text-[18px] font-semibold text-[var(--cf-text)]">
              {agent ? agent.name : 'Create AI agent'}
            </h2>

            <p className="mt-1 text-[12px] text-[var(--cf-text-muted)]">
              {agent ? `${agent.provider} · ${agent.model}` : 'Новый AI agent'}
            </p>
          </div>

          <Button
            type="button"
            variant="ghost"
            className="cf-icon-button"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {agent ? (
          <div className="mb-3 grid grid-cols-4 gap-2">
            <Metric label="Status" value={agent.status} />
            <Metric label="Role" value={agent.role} />
            <Metric label="Version" value={agent.version} />
            <Metric
              label="Confidence"
              value={`${agent.minConfidenceToAutoReply}%`}
            />
          </div>
        ) : null}

        <AIAgentFormPanel
          key={agent?.id ?? 'create-ai-agent'}
          agent={agent}
          onSaved={onClose}
        />
      </aside>
    </div>
  )
}

function AIAgentFormPanel({
  agent,
  onSaved
}: {
  agent: AIAgent | null
  onSaved: () => void
}) {
  const { createAiAgent, updateAiAgent } = useCRMStore()

  const [name, setName] = React.useState(agent?.name ?? '')
  const [description, setDescription] = React.useState(agent?.description ?? '')
  const [role, setRole] = React.useState<AIAgentRole>(agent?.role ?? 'sales')
  const [version, setVersion] = React.useState(agent?.version ?? 'v1.0')
  const [provider, setProvider] = React.useState<AIAgentProvider>(
    agent?.provider ?? 'OpenAI'
  )
  const [model, setModel] = React.useState(agent?.model ?? 'gpt-4.1-mini')
  const [baseUrl, setBaseUrl] = React.useState(agent?.baseUrl ?? '')
  const [apiTokenMasked, setApiTokenMasked] = React.useState(
    agent?.apiTokenMasked ?? ''
  )
  const [status, setStatus] = React.useState<AIAgentStatus>(
    agent?.status ?? 'disabled'
  )

  const [systemPrompt, setSystemPrompt] = React.useState(
    agent?.systemPrompt ??
      'Ты AI-ассистент CRM. Отвечай точно и используй только доступный контекст.'
  )
  const [salesPrompt, setSalesPrompt] = React.useState(
    agent?.salesPrompt ??
      'Собери параметры заявки, уточни товар, объём, город, сроки и передай менеджеру.'
  )
  const [qualificationPrompt, setQualificationPrompt] = React.useState(
    agent?.qualificationPrompt ??
      'Определи качество лида, срочность, бюджет, потребность и недостающие данные.'
  )

  const [temperature, setTemperature] = React.useState(
    String(agent?.temperature ?? 0.35)
  )
  const [maxTokens, setMaxTokens] = React.useState(
    agent?.maxTokens ? String(agent.maxTokens) : '1600'
  )
  const [minConfidenceToAutoReply, setMinConfidenceToAutoReply] =
    React.useState(String(agent?.minConfidenceToAutoReply ?? 85))

  const [supportsImages, setSupportsImages] = React.useState(
    agent?.supportsImages ?? true
  )
  const [supportsFiles, setSupportsFiles] = React.useState(
    agent?.supportsFiles ?? true
  )
  const [supportsTools, setSupportsTools] = React.useState(
    agent?.supportsTools ?? true
  )

  const [useClientContext, setUseClientContext] = React.useState(
    agent?.useClientContext ?? true
  )
  const [useProductCatalog, setUseProductCatalog] = React.useState(
    agent?.useProductCatalog ?? true
  )
  const [useConversationHistory, setUseConversationHistory] = React.useState(
    agent?.useConversationHistory ?? true
  )
  const [useWebsiteEvents, setUseWebsiteEvents] = React.useState(
    agent?.useWebsiteEvents ?? true
  )
  const [useDealsContext, setUseDealsContext] = React.useState(
    agent?.useDealsContext ?? true
  )
  const [useOrdersContext, setUseOrdersContext] = React.useState(
    agent?.useOrdersContext ?? true
  )

  const [fallbackToManager, setFallbackToManager] = React.useState(
    agent?.fallbackToManager ?? true
  )

  const [pending, setPending] = React.useState(false)

  const canSave =
    name.trim().length > 0 &&
    model.trim().length > 0 &&
    systemPrompt.trim().length > 0 &&
    !pending

  const save = async () => {
    if (!canSave) return

    const payload: CreateAIAgentPayload = {
      name: name.trim(),
      role,
      version: version.trim() || 'v1.0',
      provider,
      model: model.trim(),
      status,
      systemPrompt: systemPrompt.trim(),
      salesPrompt: salesPrompt.trim(),
      qualificationPrompt: qualificationPrompt.trim(),
      temperature: clamp(numberValue(temperature, 0.35), 0, 2),
      supportsImages,
      supportsFiles,
      supportsTools,
      useClientContext,
      useProductCatalog,
      useConversationHistory,
      useWebsiteEvents,
      useDealsContext,
      useOrdersContext,
      fallbackToManager,
      voiceSettings: agent?.voiceSettings ?? {
        supportsVoiceInput: true,
        supportsVoiceOutput: true,
        voiceReplyMode: 'both',
        transcribeModel: 'gpt-4o-mini-transcribe',
        ttsModel: 'gpt-4o-mini-tts',
        ttsVoice: 'marin',
        ttsInstructions:
          'Говори спокойно, уверенно и естественно. Не ускоряй речь. Используй деловой тон.'
      },
      minConfidenceToAutoReply: clamp(
        Math.round(numberValue(minConfidenceToAutoReply, 85)),
        0,
        100
      ),
      ...(description.trim() ? { description: description.trim() } : {}),
      ...(baseUrl.trim() ? { baseUrl: baseUrl.trim() } : {}),
      ...(apiTokenMasked.trim()
        ? { apiTokenMasked: apiTokenMasked.trim() }
        : {}),
      ...(optionalNumber(maxTokens)
        ? { maxTokens: optionalNumber(maxTokens) }
        : {})
    }

    setPending(true)

    try {
      if (agent) {
        await updateAiAgent(agent.id, payload)
      } else {
        await createAiAgent(payload)
      }

      onSaved()
    } finally {
      setPending(false)
    }
  }

  return (
    <section className="rounded-md border border-[var(--cf-border)] bg-[var(--cf-element)] p-3">
      <h3 className="mb-3 text-[13px] font-semibold text-[var(--cf-text)]">
        {agent ? 'Edit AI agent' : 'Create AI agent'}
      </h3>

      <div className="grid grid-cols-2 gap-2">
        <input
          value={name}
          onChange={event => setName(event.target.value)}
          placeholder="Agent name"
          className="cf-control h-8 px-2 text-[11px] outline-none"
        />

        <input
          value={version}
          onChange={event => setVersion(event.target.value)}
          placeholder="Version"
          className="cf-control h-8 px-2 text-[11px] outline-none"
        />

        <Select
          value={role}
          onValueChange={value => setRole(value as AIAgentRole)}
        >
          <SelectTrigger className="cf-control w-full px-3 shadow-none">
            <SelectValue placeholder="Role" />
          </SelectTrigger>

          <SelectContent className="cf-panel">
            {aiAgentRoles.map(item => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={status}
          onValueChange={value => setStatus(value as AIAgentStatus)}
        >
          <SelectTrigger className="cf-control w-full px-3 shadow-none">
            <SelectValue placeholder="Status" />
          </SelectTrigger>

          <SelectContent className="cf-panel">
            {aiAgentStatuses.map(item => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={provider}
          onValueChange={value => setProvider(value as AIAgentProvider)}
        >
          <SelectTrigger className="cf-control w-full px-3 shadow-none">
            <SelectValue placeholder="Provider" />
          </SelectTrigger>

          <SelectContent className="cf-panel">
            {aiAgentProviders.map(item => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <input
          value={model}
          onChange={event => setModel(event.target.value)}
          placeholder="Model"
          className="cf-control h-8 px-2 text-[11px] outline-none"
        />

        <input
          value={baseUrl}
          onChange={event => setBaseUrl(event.target.value)}
          placeholder="Base URL for compatible/custom provider"
          className="cf-control h-8 px-2 text-[11px] outline-none"
        />

        <input
          value={apiTokenMasked}
          onChange={event => setApiTokenMasked(event.target.value)}
          placeholder="Masked token only, e.g. sk-••••1234"
          className="cf-control h-8 px-2 text-[11px] outline-none"
        />

        <input
          value={temperature}
          onChange={event => setTemperature(event.target.value)}
          placeholder="Temperature 0-2"
          className="cf-control h-8 px-2 text-[11px] outline-none"
        />

        <input
          value={maxTokens}
          onChange={event => setMaxTokens(event.target.value)}
          placeholder="Max tokens"
          className="cf-control h-8 px-2 text-[11px] outline-none"
        />

        <input
          value={minConfidenceToAutoReply}
          onChange={event => setMinConfidenceToAutoReply(event.target.value)}
          placeholder="Min confidence %"
          className="col-span-2 cf-control h-8 px-2 text-[11px] outline-none"
        />

        <textarea
          value={description}
          onChange={event => setDescription(event.target.value)}
          placeholder="Description"
          className="col-span-2 min-h-[80px] resize-none rounded-md border border-(--cf-border) bg-(--cf-element) px-3 py-2 text-[12px] text-(--cf-text) outline-none placeholder:text-(--cf-text-muted)"
        />

        <textarea
          value={systemPrompt}
          onChange={event => setSystemPrompt(event.target.value)}
          placeholder="System prompt"
          className="col-span-2 min-h-[130px] resize-none rounded-md border border-(--cf-border) bg-(--cf-element) px-3 py-2 text-[12px] text-(--cf-text) outline-none placeholder:text-(--cf-text-muted)"
        />

        <textarea
          value={salesPrompt}
          onChange={event => setSalesPrompt(event.target.value)}
          placeholder="Sales prompt"
          className="min-h-[120px] resize-none rounded-md border border-(--cf-border) bg-(--cf-element) px-3 py-2 text-[12px] text-(--cf-text) outline-none placeholder:text-(--cf-text-muted)"
        />

        <textarea
          value={qualificationPrompt}
          onChange={event => setQualificationPrompt(event.target.value)}
          placeholder="Qualification prompt"
          className=" min-h-[120px] resize-none rounded-md border border-(--cf-border) bg-(--cf-element) px-3 py-2 text-[12px] text-(--cf-text) outline-none placeholder:text-(--cf-text-muted)"
        />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <ToggleCard
          title="Capabilities"
          items={[
            ['Supports tools', supportsTools, setSupportsTools],
            ['Supports files', supportsFiles, setSupportsFiles],
            ['Supports images', supportsImages, setSupportsImages]
          ]}
        />

        <ToggleCard
          title="Context"
          items={[
            ['Client context', useClientContext, setUseClientContext],
            ['Product catalog', useProductCatalog, setUseProductCatalog],
            [
              'Conversation history',
              useConversationHistory,
              setUseConversationHistory
            ],
            ['Website events', useWebsiteEvents, setUseWebsiteEvents],
            ['Deals context', useDealsContext, setUseDealsContext],
            ['Orders context', useOrdersContext, setUseOrdersContext]
          ]}
        />

        <ToggleCard
          title="Fallback"
          items={[
            ['Fallback to manager', fallbackToManager, setFallbackToManager]
          ]}
        />
      </div>

      <div className="mt-3 flex justify-end">
        <Button
          type="button"
          variant="ghost"
          disabled={!canSave}
          className="h-8 rounded-md bg-[var(--cf-button)] px-3 text-[11px] text-[var(--cf-text)] disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => void save()}
        >
          {agent ? 'Save AI agent' : 'Create AI agent'}
        </Button>
      </div>
    </section>
  )
}

function ToggleCard({
  title,
  items
}: {
  title: string
  items: Array<[string, boolean, React.Dispatch<React.SetStateAction<boolean>>]>
}) {
  return (
    <div className="rounded-md border border-[var(--cf-border)] bg-[var(--cf-element)] p-3">
      <div className="mb-2 text-[12px] font-semibold text-[var(--cf-text)]">
        {title}
      </div>

      <div className="space-y-2">
        {items.map(([label, checked, setChecked]) => (
          <label
            key={label}
            className="flex cursor-pointer items-center justify-between gap-3 rounded-md border border-[var(--cf-border)] bg-[var(--cf-element)] px-2 py-1.5 text-[11px] text-[var(--cf-text)]"
          >
            <span>{label}</span>

            <input
              type="checkbox"
              checked={checked}
              onChange={event => setChecked(event.target.checked)}
            />
          </label>
        ))}
      </div>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-md border border-[var(--cf-border)] bg-[var(--cf-element)] p-3">
      <div className="text-[10px] uppercase tracking-wide text-[var(--cf-text-muted)]">
        {label}
      </div>

      <div className="mt-1 truncate text-[13px] font-semibold text-[var(--cf-text)]">
        {value}
      </div>
    </div>
  )
}
