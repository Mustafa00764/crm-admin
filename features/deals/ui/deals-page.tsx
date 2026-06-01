'use client'

import {
  Download,
  KanbanSquare,
  List,
  Plus,
  RefreshCw,
  Trash2,
  X
} from 'lucide-react'
import { AdminPageHeader } from '@/widgets/admin-shell/ui/admin-page-header'
import { ThemeToggle } from '@/shared/ui/theme-toggle'
import { useCRMStore } from '@/entities/crm/model/crm-store'
import { Button } from '@/shared/ui/button'
import { DealsFilters as DealsFiltersPanel } from './deals-filters'
import { DealsTable } from './deals-table'
import { DealsKanban } from './deals-kanban'
import { DealDetailsDrawer } from './deal-details-drawer'
import { DealsTableSkeleton } from './deals-table-skeleton'
import { DealsKanbanSkeleton } from './deals-kanban-skeleton'
import type {
  CRMDeal,
  DealsFilters as DealsFiltersState
} from '../model/deals-types'
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore
} from 'react'
import { usePaginatedList } from '@/shared/hooks/use-paginated-list'
import { ListPagination } from '@/shared/ui/list-pagination'

const DEALS_VIEW_MODE_STORAGE_KEY = 'crm.deals.viewMode'
const DEALS_VIEW_MODE_EVENT = 'crm.deals.viewMode.changed'

type DealsViewModeValue = 'table' | 'kanban'

function getStoredDealsViewMode(): DealsViewModeValue | null {
  if (typeof window === 'undefined') {
    return null
  }

  const saved = window.localStorage.getItem(DEALS_VIEW_MODE_STORAGE_KEY)

  if (saved === 'table' || saved === 'kanban') {
    return saved
  }

  return 'table'
}

function subscribeDealsViewMode(callback: () => void) {
  window.addEventListener('storage', callback)
  window.addEventListener(DEALS_VIEW_MODE_EVENT, callback)

  return () => {
    window.removeEventListener('storage', callback)
    window.removeEventListener(DEALS_VIEW_MODE_EVENT, callback)
  }
}

function useStoredDealsViewMode() {
  return useSyncExternalStore(
    subscribeDealsViewMode,
    getStoredDealsViewMode,
    () => null
  )
}

export function DealsPage() {
  const {
    deals,
    selectedDealId,
    dealsFilters,
    dealsViewMode,
    dealsLoading,
    dealsError,
    loadDeals,
    selectDeal,
    setDealsViewMode,
    deleteDeal
  } = useCRMStore()

  const [selectedDealIds, setSelectedDealIds] = useState<string[]>([])
  const [isDealDrawerOpen, setIsDealDrawerOpen] = useState(false)

  const storedDealsViewMode = useStoredDealsViewMode()
  const resolvedDealsViewMode = storedDealsViewMode ?? dealsViewMode
  const isDealsViewModeReady = storedDealsViewMode !== null

  useEffect(() => {
    void loadDeals()
  }, [loadDeals])

  const filteredDeals = useMemo(() => {
    return applyDealsFilters(deals, dealsFilters)
  }, [deals, dealsFilters])

  const {
    page,
    pageSize,
    total,
    totalPages,
    paginatedItems: paginatedDeals,
    setPage,
    setPageSize
  } = usePaginatedList({
    items: filteredDeals,
    storageKey: 'crm.deals.pageSize',
    defaultPageSize: 20
  })

  const selectedDeal = useMemo(() => {
    return deals.find(deal => deal.id === selectedDealId) ?? null
  }, [deals, selectedDealId])

  const selectedFilteredDealIds = useMemo(() => {
    return selectedDealIds.filter(dealId =>
      filteredDeals.some(deal => deal.id === dealId)
    )
  }, [selectedDealIds, filteredDeals])

  const openDeal = useCallback(
    (dealId: string) => {
      selectDeal(dealId)
      setIsDealDrawerOpen(true)
    },
    [selectDeal]
  )

  const toggleDeal = useCallback((dealId: string) => {
    setSelectedDealIds(current =>
      current.includes(dealId)
        ? current.filter(id => id !== dealId)
        : [...current, dealId]
    )
  }, [])

  const toggleAll = useCallback(() => {
    setSelectedDealIds(current => {
      const visibleIds =
        dealsViewMode === 'table'
          ? paginatedDeals.map(deal => deal.id)
          : filteredDeals.map(deal => deal.id)

      if (visibleIds.length === 0) return current

      const allSelected = visibleIds.every(id => current.includes(id))

      if (allSelected) {
        return current.filter(id => !visibleIds.includes(id))
      }

      return Array.from(new Set([...current, ...visibleIds]))
    })
  }, [dealsViewMode, paginatedDeals, filteredDeals])

  const deleteSelected = useCallback(async () => {
    await Promise.all(selectedDealIds.map(dealId => deleteDeal(dealId)))
    setSelectedDealIds([])
  }, [selectedDealIds, deleteDeal])

  const handleRefresh = useCallback(() => {
    void loadDeals()
  }, [loadDeals])

  const changeDealsViewMode = useCallback(
    (viewMode: DealsViewModeValue) => {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(DEALS_VIEW_MODE_STORAGE_KEY, viewMode)
        window.dispatchEvent(new Event(DEALS_VIEW_MODE_EVENT))
      }

      setDealsViewMode(viewMode)
    },
    [setDealsViewMode]
  )

  return (
    <div className="cf-page flex flex-col min-h-screen">
      <AdminPageHeader
        title="Dashboard - Deals"
        actions={
          <>
            <ThemeToggle />

            <Button
              type="button"
              variant="ghost"
              className="cf-icon-button"
              onClick={handleRefresh}
              disabled={dealsLoading}
            >
              <RefreshCw
                className={dealsLoading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'}
              />
            </Button>

            <Button type="button" variant="ghost" className="cf-icon-button">
              <Download className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              className={
                resolvedDealsViewMode === 'kanban'
                  ? 'cf-icon-button bg-(--cf-button) text-(--cf-text)'
                  : 'cf-icon-button'
              }
              onClick={() => setDealsViewMode('kanban')}
            >
              <KanbanSquare className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              className={
                resolvedDealsViewMode === 'table'
                  ? 'cf-icon-button bg-(--cf-button) text-(--cf-text)'
                  : 'cf-icon-button'
              }
              onClick={() => changeDealsViewMode('table')}
            >
              <List className="h-4 w-4" />
            </Button>

            <Button type="button" variant="ghost" className="cf-icon-button">
              <Plus className="h-5 w-5" />
            </Button>
          </>
        }
      />

      <div className="h-full flex-1 flex flex-col px-5 py-3">
        <main className="flex flex-1 min-w-0 flex-col gap-3">
          <DealsFiltersPanel />

          {selectedFilteredDealIds.length > 0 ? (
            <div className="cf-panel flex items-center justify-between gap-3 px-3 py-2">
              <div className="text-[12px] text-(--cf-text)">
                Выбрано сделок:{' '}
                <span className="font-semibold">
                  {selectedFilteredDealIds.length}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  className="h-8 rounded-md bg-(--cf-button) px-3 text-[11px] text-(--cf-text) hover:bg-(--cf-element-hover)"
                  onClick={() => setSelectedDealIds([])}
                >
                  <X className="mr-1 h-3.5 w-3.5" />
                  Снять выбор
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="h-8 rounded-md bg-[rgba(239,23,72,0.16)] px-3 text-[11px] text-(--cf-red) hover:bg-[rgba(239,23,72,0.22)]"
                  onClick={() => void deleteSelected()}
                >
                  <Trash2 className="mr-1 h-3.5 w-3.5" />
                  Удалить выбранные
                </Button>
              </div>
            </div>
          ) : null}

          {dealsError ? (
            <div className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-[12px] text-red-400">
              {dealsError}
            </div>
          ) : null}

          {!isDealsViewModeReady ? (
            <div className="cf-panel min-h-130" />
          ) : dealsLoading ? (
            dealsViewMode === 'table' ? (
              <DealsTableSkeleton />
            ) : (
              <DealsKanbanSkeleton />
            )
          ) : (
            <>
              {dealsViewMode === 'table' ? (
                <>
                  <DealsTable
                    deals={paginatedDeals}
                    allDeals={filteredDeals}
                    selectedDealId={selectedDealId}
                    selectedDealIds={selectedDealIds}
                    onSelect={openDeal}
                    onToggleDeal={toggleDeal}
                    onToggleAll={toggleAll}
                  />

                  <ListPagination
                    page={page}
                    pageSize={pageSize}
                    total={total}
                    totalPages={totalPages}
                    onPageChange={setPage}
                    onPageSizeChange={setPageSize}
                  />
                </>
              ) : (
                <DealsKanban
                  deals={filteredDeals}
                  selectedDealIds={selectedDealIds}
                  onSelect={openDeal}
                  onToggleDeal={toggleDeal}
                />
              )}
            </>
          )}
        </main>
      </div>

      <DealDetailsDrawer
        open={isDealDrawerOpen}
        deal={selectedDeal}
        onClose={() => setIsDealDrawerOpen(false)}
      />
    </div>
  )
}

function applyDealsFilters(deals: CRMDeal[], filters: DealsFiltersState) {
  return deals.filter(deal => {
    if (
      filters.stage &&
      filters.stage !== 'all' &&
      deal.stage !== filters.stage
    ) {
      return false
    }

    if (
      filters.priority &&
      filters.priority !== 'all' &&
      deal.priority !== filters.priority
    ) {
      return false
    }

    if (
      filters.managerId &&
      filters.managerId !== 'all' &&
      deal.managerId !== filters.managerId
    ) {
      return false
    }

    if (
      filters.source &&
      filters.source !== 'all' &&
      deal.source !== filters.source
    ) {
      return false
    }

    if (
      filters.channel &&
      filters.channel !== 'all' &&
      deal.channel !== filters.channel
    ) {
      return false
    }

    if (filters.hasOrder === 'yes' && !deal.relatedOrderId) {
      return false
    }

    if (filters.hasOrder === 'no' && deal.relatedOrderId) {
      return false
    }

    if (filters.amountFrom) {
      const amountFrom = Number(filters.amountFrom)

      if (!Number.isNaN(amountFrom) && deal.finalAmount.rub < amountFrom) {
        return false
      }
    }

    if (filters.amountTo) {
      const amountTo = Number(filters.amountTo)

      if (!Number.isNaN(amountTo) && deal.finalAmount.rub > amountTo) {
        return false
      }
    }

    const search = filters.search?.trim().toLowerCase()

    if (search) {
      const haystack = [
        deal.dealNumber,
        deal.title,
        deal.clientName,
        deal.companyName,
        deal.phone,
        deal.email,
        deal.city,
        deal.productInterest,
        deal.managerName
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      if (!haystack.includes(search)) {
        return false
      }
    }

    return true
  })
}
