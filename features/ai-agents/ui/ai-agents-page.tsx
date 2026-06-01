'use client'

import * as React from 'react'
import {
  Download,
  LayoutGrid,
  List,
  Plus,
  RefreshCw,
  Trash2,
  X
} from 'lucide-react'
import { AdminPageHeader } from '@/widgets/admin-shell/ui/admin-page-header'
import { ThemeToggle } from '@/shared/ui/theme-toggle'
import { Button } from '@/shared/ui/button'
import { useCRMStore } from '@/entities/crm/model/crm-store'
import { usePersistedViewMode } from '@/shared/hooks/use-persisted-view-mode'
import { usePaginatedList } from '@/shared/hooks/use-paginated-list'
import { ListPagination } from '@/shared/ui/list-pagination'
import type {
  AIAgent,
  AIAgentContextFlag,
  AIAgentFilters
} from '../model/ai-agents-types'
import { AIAgentsFilters } from './ai-agents-filters'
import { AIAgentsTable } from './ai-agents-table'
import { AIAgentsCardGrid } from './ai-agents-card-grid'
import { AIAgentDetailsDrawer } from './ai-agent-details-drawer'

export function AIAgentsPage() {
  const {
    aiAgentRecords,
    aiAgentFilters,
    selectedAiAgentId,
    aiAgentsLoading,
    aiAgentsError,
    loadAiAgentRecords,
    selectAiAgent,
    deleteAiAgent
  } = useCRMStore()

  const [viewMode, setViewMode] = usePersistedViewMode(
    'crm.aiAgents.viewMode',
    'table'
  )
  const [selectedAgentIds, setSelectedAgentIds] = React.useState<string[]>([])
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false)

  React.useEffect(() => {
    void loadAiAgentRecords()
  }, [loadAiAgentRecords])

  const filteredAgents = React.useMemo<AIAgent[]>(() => {
    return applyAIAgentFilters(aiAgentRecords, aiAgentFilters)
  }, [aiAgentRecords, aiAgentFilters])

  const {
    page,
    pageSize,
    total,
    totalPages,
    paginatedItems: paginatedAgents,
    setPage,
    setPageSize,
    resetPage
  } = usePaginatedList<AIAgent>({
    items: filteredAgents,
    storageKey: 'crm.aiAgents.pageSize',
    defaultPageSize: 20
  })

  const selectedAgent = React.useMemo(() => {
    return aiAgentRecords.find(agent => agent.id === selectedAiAgentId) ?? null
  }, [aiAgentRecords, selectedAiAgentId])

  const selectedFilteredAgentIds = React.useMemo<string[]>(() => {
    const filteredIds = new Set(filteredAgents.map(agent => agent.id))

    return selectedAgentIds.filter(agentId => filteredIds.has(agentId))
  }, [selectedAgentIds, filteredAgents])

  const openAgent = React.useCallback(
    (agentId: string) => {
      selectAiAgent(agentId)
      setIsDrawerOpen(true)
    },
    [selectAiAgent]
  )

  const openCreateAgent = React.useCallback(() => {
    selectAiAgent(null)
    setIsDrawerOpen(true)
  }, [selectAiAgent])

  const toggleAgent = React.useCallback((agentId: string) => {
    setSelectedAgentIds(current =>
      current.includes(agentId)
        ? current.filter(id => id !== agentId)
        : [...current, agentId]
    )
  }, [])

  const toggleAll = React.useCallback(() => {
    setSelectedAgentIds(current => {
      const visibleIds = paginatedAgents.map(agent => agent.id)

      if (visibleIds.length === 0) return current

      const allSelected = visibleIds.every(id => current.includes(id))

      if (allSelected) {
        return current.filter(id => !visibleIds.includes(id))
      }

      return Array.from(new Set([...current, ...visibleIds]))
    })
  }, [paginatedAgents])

  const deleteSelected = React.useCallback(async () => {
    await Promise.all(selectedAgentIds.map(agentId => deleteAiAgent(agentId)))
    setSelectedAgentIds([])
  }, [selectedAgentIds, deleteAiAgent])

  return (
    <div className="cf-page min-h-screen">
      <AdminPageHeader
        title="Dashboard - AI Agents"
        actions={
          <>
            <ThemeToggle />

            <Button
              type="button"
              variant="ghost"
              className="cf-icon-button"
              disabled={aiAgentsLoading}
              onClick={() => void loadAiAgentRecords()}
            >
              <RefreshCw
                className={aiAgentsLoading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'}
              />
            </Button>

            <Button type="button" variant="ghost" className="cf-icon-button">
              <Download className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              className={
                viewMode === 'table'
                  ? 'cf-icon-button bg-[var(--cf-button)] text-[var(--cf-text)]'
                  : 'cf-icon-button'
              }
              onClick={() => setViewMode('table')}
            >
              <List className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              className={
                viewMode === 'cards'
                  ? 'cf-icon-button bg-[var(--cf-button)] text-[var(--cf-text)]'
                  : 'cf-icon-button'
              }
              onClick={() => setViewMode('cards')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="cf-icon-button"
              onClick={openCreateAgent}
            >
              <Plus className="h-5 w-5" />
            </Button>
          </>
        }
      />

      <div className="h-[calc(100vh-52px)] px-5 py-3">
        <main className="flex min-w-0 flex-col gap-3">
          <AIAgentsFilters onChange={resetPage} />

          {selectedFilteredAgentIds.length > 0 ? (
            <div className="cf-panel flex items-center justify-between gap-3 px-3 py-2">
              <div className="text-[12px] text-[var(--cf-text)]">
                Выбрано AI agents:{' '}
                <span className="font-semibold">
                  {selectedFilteredAgentIds.length}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  className="h-8 rounded-md bg-[var(--cf-button)] px-3 text-[11px] text-[var(--cf-text)] hover:bg-[var(--cf-element-hover)]"
                  onClick={() => setSelectedAgentIds([])}
                >
                  <X className="mr-1 h-3.5 w-3.5" />
                  Снять выбор
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="h-8 rounded-md bg-[rgba(239,23,72,0.16)] px-3 text-[11px] text-[var(--cf-red)] hover:bg-[rgba(239,23,72,0.22)]"
                  onClick={() => void deleteSelected()}
                >
                  <Trash2 className="mr-1 h-3.5 w-3.5" />
                  Удалить
                </Button>
              </div>
            </div>
          ) : null}

          {aiAgentsError ? (
            <div className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-[12px] text-red-400">
              {aiAgentsError}
            </div>
          ) : null}

          {aiAgentsLoading ? (
            <section className="cf-panel flex min-h-[320px] items-center justify-center text-[12px] text-[var(--cf-text-muted)]">
              Loading AI agents...
            </section>
          ) : (
            <>
              {viewMode === 'table' ? (
                <AIAgentsTable
                  agents={paginatedAgents}
                  selectedAgentId={selectedAiAgentId}
                  selectedAgentIds={selectedFilteredAgentIds}
                  onSelect={openAgent}
                  onToggleAgent={toggleAgent}
                  onToggleAll={toggleAll}
                />
              ) : (
                <AIAgentsCardGrid
                  agents={paginatedAgents}
                  selectedAgentIds={selectedFilteredAgentIds}
                  onSelect={openAgent}
                  onToggleAgent={toggleAgent}
                />
              )}

              <ListPagination
                page={page}
                pageSize={pageSize}
                total={total}
                totalPages={totalPages}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
              />
            </>
          )}
        </main>
      </div>

      <AIAgentDetailsDrawer
        open={isDrawerOpen}
        agent={selectedAgent}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  )
}

function applyAIAgentFilters(agents: AIAgent[], filters: AIAgentFilters) {
  return agents.filter(agent => {
    const search = filters.search.trim().toLowerCase()

    if (search) {
      const haystack = [
        agent.name,
        agent.description,
        agent.role,
        agent.version,
        agent.provider,
        agent.model,
        agent.status,
        agent.systemPrompt,
        agent.salesPrompt,
        agent.qualificationPrompt
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      if (!haystack.includes(search)) return false
    }

    if (filters.provider !== 'all' && agent.provider !== filters.provider) {
      return false
    }

    if (filters.status !== 'all' && agent.status !== filters.status) {
      return false
    }

    if (filters.role !== 'all' && agent.role !== filters.role) {
      return false
    }

    if (
      filters.supportsImages !== 'all' &&
      agent.supportsImages !== (filters.supportsImages === 'yes')
    ) {
      return false
    }

    if (
      filters.supportsFiles !== 'all' &&
      agent.supportsFiles !== (filters.supportsFiles === 'yes')
    ) {
      return false
    }

    if (
      filters.supportsTools !== 'all' &&
      agent.supportsTools !== (filters.supportsTools === 'yes')
    ) {
      return false
    }

    if (
      filters.fallbackToManager !== 'all' &&
      agent.fallbackToManager !== (filters.fallbackToManager === 'yes')
    ) {
      return false
    }

    if (
      filters.contextFlag !== 'all' &&
      !hasContextFlag(agent, filters.contextFlag)
    ) {
      return false
    }

    return true
  })
}

function hasContextFlag(agent: AIAgent, flag: AIAgentContextFlag) {
  const map: Record<AIAgentContextFlag, boolean> = {
    client_context: agent.useClientContext,
    product_catalog: agent.useProductCatalog,
    conversation_history: agent.useConversationHistory,
    website_events: agent.useWebsiteEvents,
    deals_context: agent.useDealsContext,
    orders_context: agent.useOrdersContext
  }

  return map[flag]
}
