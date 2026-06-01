'use client'

import * as React from 'react'
import {
  Download,
  Grid2X2,
  List,
  Plus,
  RefreshCw,
  Trash2,
  X
} from 'lucide-react'
import { useCRMStore } from '@/entities/crm/model/crm-store'
import { AdminPageHeader } from '@/widgets/admin-shell/ui/admin-page-header'
import { ThemeToggle } from '@/shared/ui/theme-toggle'
import { ClientsFilters } from './clients-filters'
import { ClientsTable } from './clients-table'
import { ClientsCardGrid } from './clients-card-grid'
import type { CRMClient } from '../model/clients-types'
import { ClientDetailsDrawer } from './client-details-drawer'
import { Button } from '@/shared/ui/button'
import { ClientsTableSkeleton } from './clients-table-skeleton'
import { ClientsCardSkeleton } from './clients-card-skeleton'
import { usePaginatedList } from '@/shared/hooks/use-paginated-list'
import { ListPagination } from '@/shared/ui/list-pagination'
export function ClientsPage() {
  const {
    clients,
    selectedClientId,
    clientsViewMode,
    clientsLoading,
    clientsFilters,
    clientsError,
    loadClients,
    selectClient,
    setClientsViewMode,
    deleteClient
  } = useCRMStore()

  const [selectedClientIds, setSelectedClientIds] = React.useState<string[]>([])
  const [isClientDrawerOpen, setIsClientDrawerOpen] = React.useState(false)

  React.useEffect(() => {
    void loadClients()
  }, [loadClients])

  const selectedClient =
    clients.find(client => client.id === selectedClientId) ?? null

  const filteredClients = React.useMemo<CRMClient[]>(() => {
    return applyClientFilters(clients, clientsFilters)
  }, [clients, clientsFilters])

  const {
    page,
    pageSize,
    total,
    totalPages,
    paginatedItems: paginatedClients,
    setPage,
    setPageSize,
    resetPage
  } = usePaginatedList<CRMClient>({
    items: filteredClients,
    storageKey: 'crm.clients.pageSize',
    defaultPageSize: 20
  })

  const selectedFilteredClientIds = React.useMemo<string[]>(() => {
    const filteredClientIds = new Set(filteredClients.map(client => client.id))

    return selectedClientIds.filter(clientId => filteredClientIds.has(clientId))
  }, [selectedClientIds, filteredClients])

  const openClient = (clientId: string) => {
    selectClient(clientId)
    setIsClientDrawerOpen(true)
  }

  const toggleClient = (clientId: string) => {
    setSelectedClientIds(current =>
      current.includes(clientId)
        ? current.filter(id => id !== clientId)
        : [...current, clientId]
    )
  }

  const toggleAll = React.useCallback(() => {
    setSelectedClientIds(current => {
      const visibleIds = paginatedClients.map(client => client.id)

      if (visibleIds.length === 0) return current

      const allSelected = visibleIds.every(id => current.includes(id))

      if (allSelected) {
        return current.filter(id => !visibleIds.includes(id))
      }

      return Array.from(new Set([...current, ...visibleIds]))
    })
  }, [paginatedClients])

  const deleteSelected = async () => {
    await Promise.all(selectedClientIds.map(clientId => deleteClient(clientId)))
    setSelectedClientIds([])
  }

  return (
    <div className="cf-page flex flex-col min-h-screen">
      <AdminPageHeader
        title="Dashboard - Clients"
        actions={
          <>
            <ThemeToggle />

            <Button
              type="button"
              variant="ghost"
              className="cf-icon-button"
              onClick={() => void loadClients()}
              disabled={clientsLoading}
            >
              <RefreshCw
                className={clientsLoading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'}
              />
            </Button>

            <Button type="button" variant="ghost" className="cf-icon-button">
              <Download className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              className={
                clientsViewMode === 'table'
                  ? 'cf-icon-button bg-[var(--cf-button)] text-[var(--cf-text)]'
                  : 'cf-icon-button'
              }
              onClick={() => setClientsViewMode('table')}
            >
              <List className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              className={
                clientsViewMode === 'cards'
                  ? 'cf-icon-button bg-[var(--cf-button)] text-[var(--cf-text)]'
                  : 'cf-icon-button'
              }
              onClick={() => setClientsViewMode('cards')}
            >
              <Grid2X2 className="h-4 w-4" />
            </Button>

            <Button type="button" variant="ghost" className="cf-icon-button">
              <Plus className="h-5 w-5" />
            </Button>
          </>
        }
      />

      <div className="h-full flex-1 flex flex-col px-5 py-3">
        <main className="flex min-w-0 flex-col flex-1 gap-3">
          <ClientsFilters />

          {selectedClientIds.length > 0 ? (
            <div className="cf-panel flex items-center justify-between gap-3 px-3 py-2">
              <div className="text-[12px] text-[var(--cf-text)]">
                Выбрано клиентов:{' '}
                <span className="font-semibold">
                  {selectedClientIds.length}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  className="h-8 rounded-md bg-[var(--cf-button)] px-3 text-[11px] text-[var(--cf-text)] hover:bg-[var(--cf-element-hover)]"
                  onClick={() => setSelectedClientIds([])}
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
                  Удалить выбранных
                </Button>
              </div>
            </div>
          ) : null}

          {clientsError ? (
            <div className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-[12px] text-red-400">
              {clientsError}
            </div>
          ) : null}

          {clientsLoading ? (
            <section className="cf-panel flex min-h-[320px] items-center justify-center text-[12px] text-[var(--cf-text-muted)]">
              Loading clients...
            </section>
          ) : (
            <>
              {clientsViewMode === 'table' ? (
                <ClientsTable
                  clients={paginatedClients}
                  selectedClientId={selectedClientId}
                  selectedClientIds={selectedFilteredClientIds}
                  onSelect={openClient}
                  onToggleClient={toggleClient}
                  onToggleAll={toggleAll}
                />
              ) : (
                <ClientsCardGrid
                  clients={paginatedClients}
                  selectedClientIds={selectedFilteredClientIds}
                  onSelect={openClient}
                  onToggleClient={toggleClient}
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

      <ClientDetailsDrawer
        open={isClientDrawerOpen}
        client={selectedClient}
        onClose={() => setIsClientDrawerOpen(false)}
      />
    </div>
  )
}

type ClientFilterValue = string | number | boolean | undefined | null

type ClientFiltersLike = Record<string, ClientFilterValue>

function getFilterValue(filters: ClientFiltersLike, key: string) {
  const value = filters[key]

  if (value === undefined || value === null) {
    return ''
  }

  return String(value)
}

function isActiveFilter(value: string) {
  return value.trim().length > 0 && value !== 'all'
}

function textIncludes(value: string | undefined, search: string) {
  return value?.toLowerCase().includes(search) ?? false
}

function applyClientFilters(
  clients: CRMClient[],
  filters: ClientFiltersLike
): CRMClient[] {
  const search = getFilterValue(filters, 'search').trim().toLowerCase()
  const status = getFilterValue(filters, 'status')
  const managerId =
    getFilterValue(filters, 'managerId') ||
    getFilterValue(filters, 'assignedSellerId')
  const source = getFilterValue(filters, 'source')
  const channel = getFilterValue(filters, 'channel')
  const city = getFilterValue(filters, 'city')
  const region = getFilterValue(filters, 'region')
  const hasOrders = getFilterValue(filters, 'hasOrders')
  const hasDeals = getFilterValue(filters, 'hasDeals')

  return clients.filter(client => {
    if (search) {
      const matchesSearch =
        textIncludes(client.fullName, search) ||
        textIncludes(client.companyName, search) ||
        textIncludes(client.phone, search) ||
        textIncludes(client.email, search) ||
        textIncludes(client.telegramUsername, search) ||
        textIncludes(client.whatsappPhone, search) ||
        textIncludes(client.city, search) ||
        textIncludes(client.region, search) ||
        textIncludes(client.source, search) ||
        textIncludes(client.channel, search) ||
        textIncludes(client.productInterest, search) ||
        textIncludes(client.objectType, search) ||
        textIncludes(client.aiSummary, search)

      if (!matchesSearch) return false
    }

    if (isActiveFilter(status) && client.status !== status) {
      return false
    }

    if (isActiveFilter(managerId) && client.assignedSellerId !== managerId) {
      return false
    }

    if (isActiveFilter(source) && client.source !== source) {
      return false
    }

    if (isActiveFilter(channel) && client.channel !== channel) {
      return false
    }

    if (isActiveFilter(city) && client.city !== city) {
      return false
    }

    if (isActiveFilter(region) && client.region !== region) {
      return false
    }

    if (isActiveFilter(hasOrders)) {
      const totalOrders =
        client.statistics?.totalOrders ?? client.orderedProducts?.length ?? 0

      if (hasOrders === 'yes' && totalOrders <= 0) {
        return false
      }

      if (hasOrders === 'no' && totalOrders > 0) {
        return false
      }
    }

    if (isActiveFilter(hasDeals)) {
      const totalDeals = client.statistics?.totalDeals ?? 0

      if (hasDeals === 'yes' && totalDeals <= 0) {
        return false
      }

      if (hasDeals === 'no' && totalDeals > 0) {
        return false
      }
    }

    return true
  })
}
