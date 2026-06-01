'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
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
import { OrdersFilters } from './orders-filters'
import { OrdersTable } from './orders-table'
import { OrdersCardGrid } from './orders-card-grid'
import { OrderDetailsDrawer } from './order-details-drawer'
import { OrdersTableSkeleton } from './orders-table-skeleton'
import type { CRMOrder, OrderFilters } from '../model/orders-types'
import { usePaginatedList } from '@/shared/hooks/use-paginated-list'
import { ListPagination } from '@/shared/ui/list-pagination'

export function OrdersPage() {
  const {
    orders,
    selectedOrderId,
    ordersFilters,
    ordersViewMode,
    ordersLoading,
    ordersError,
    loadOrders,
    selectOrder,
    setOrdersViewMode,
    deleteOrder
  } = useCRMStore()

  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([])
  const [isOrderDrawerOpen, setIsOrderDrawerOpen] = useState(false)

  useEffect(() => {
    void loadOrders()
  }, [loadOrders])

  const filteredOrders = useMemo(() => {
    return applyOrdersFilters(orders, ordersFilters)
  }, [orders, ordersFilters])

  const {
    page,
    pageSize,
    total,
    totalPages,
    paginatedItems: paginatedOrders,
    setPage,
    setPageSize
  } = usePaginatedList({
    items: filteredOrders,
    storageKey: 'crm.orders.pageSize',
    defaultPageSize: 20
  })

  const selectedOrder = useMemo(() => {
    return orders.find(order => order.id === selectedOrderId) ?? null
  }, [orders, selectedOrderId])

  const selectedFilteredOrderIds = useMemo(() => {
    return selectedOrderIds.filter(orderId =>
      filteredOrders.some(order => order.id === orderId)
    )
  }, [selectedOrderIds, filteredOrders])

  const openOrder = useCallback(
    (orderId: string) => {
      selectOrder(orderId)
      setIsOrderDrawerOpen(true)
    },
    [selectOrder]
  )

  const toggleOrder = useCallback((orderId: string) => {
    setSelectedOrderIds(current =>
      current.includes(orderId)
        ? current.filter(id => id !== orderId)
        : [...current, orderId]
    )
  }, [])

  const toggleAll = useCallback(() => {
    setSelectedOrderIds(current => {
      const visibleIds = paginatedOrders.map(order => order.id)

      if (visibleIds.length === 0) return current

      const allSelected = visibleIds.every(id => current.includes(id))

      if (allSelected) {
        return current.filter(id => !visibleIds.includes(id))
      }

      return Array.from(new Set([...current, ...visibleIds]))
    })
  }, [paginatedOrders])

  const deleteSelected = useCallback(async () => {
    await Promise.all(selectedOrderIds.map(orderId => deleteOrder(orderId)))
    setSelectedOrderIds([])
  }, [selectedOrderIds, deleteOrder])

  return (
    <div className="cf-page flex flex-col min-h-screen">
      <AdminPageHeader
        title="Dashboard - Orders"
        actions={
          <>
            <ThemeToggle />

            <Button
              type="button"
              variant="ghost"
              className="cf-icon-button"
              disabled={ordersLoading}
              onClick={() => void loadOrders()}
            >
              <RefreshCw
                className={ordersLoading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'}
              />
            </Button>

            <Button type="button" variant="ghost" className="cf-icon-button">
              <Download className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              className={
                ordersViewMode === 'table'
                  ? 'cf-icon-button bg-(--cf-button) text-(--cf-text)'
                  : 'cf-icon-button'
              }
              onClick={() => setOrdersViewMode('table')}
            >
              <List className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              className={
                ordersViewMode === 'cards'
                  ? 'cf-icon-button bg-(--cf-button) text-(--cf-text)'
                  : 'cf-icon-button'
              }
              onClick={() => setOrdersViewMode('cards')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>

            <Button type="button" variant="ghost" className="cf-icon-button">
              <Plus className="h-5 w-5" />
            </Button>
          </>
        }
      />

      <div className="h-full flex-1 flex flex-col px-5 py-3">
        <main className="flex flex-1 min-w-0 flex-col gap-3">
          <OrdersFilters />

          {selectedFilteredOrderIds.length > 0 ? (
            <div className="cf-panel flex items-center justify-between transition-all gap-3 px-3 py-2">
              <div className="text-[12px] text-(--cf-text)">
                Выбрано заказов:{' '}
                <span className="font-semibold">
                  {selectedFilteredOrderIds.length}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  className="h-8 rounded-md bg-(--cf-button) px-3 text-[11px] text-(--cf-text) hover:bg-(--cf-element-hover)"
                  onClick={() => setSelectedOrderIds([])}
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

          {ordersError ? (
            <div className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-[12px] text-red-400">
              {ordersError}
            </div>
          ) : null}

          {ordersLoading ? (
            <section className="cf-panel flex min-h-[320px] items-center justify-center text-[12px] text-[var(--cf-text-muted)]">
              Loading orders...
            </section>
          ) : (
            <>
              {ordersViewMode === 'table' ? (
                <OrdersTable
                  orders={paginatedOrders}
                  selectedOrderId={selectedOrderId}
                  selectedOrderIds={selectedFilteredOrderIds}
                  onSelect={openOrder}
                  onToggleOrder={toggleOrder}
                  onToggleAll={toggleAll}
                />
              ) : (
                <OrdersCardGrid
                  orders={paginatedOrders}
                  selectedOrderIds={selectedFilteredOrderIds}
                  onSelect={openOrder}
                  onToggleOrder={toggleOrder}
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

      <OrderDetailsDrawer
        open={isOrderDrawerOpen}
        order={selectedOrder}
        onClose={() => setIsOrderDrawerOpen(false)}
      />
    </div>
  )
}

function applyOrdersFilters(orders: CRMOrder[], filters: OrderFilters) {
  return orders.filter(order => {
    const search = filters.search.trim().toLowerCase()

    if (search) {
      const haystack = [
        order.orderNumber,
        order.clientName,
        order.companyName,
        order.phone,
        order.email,
        order.city,
        order.managerName,
        order.websiteDomain,
        order.botName
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      if (!haystack.includes(search)) {
        return false
      }
    }

    if (filters.status !== 'all' && order.status !== filters.status) {
      return false
    }

    if (
      filters.paymentStatus !== 'all' &&
      order.paymentStatus !== filters.paymentStatus
    ) {
      return false
    }

    if (
      filters.productionStatus !== 'all' &&
      order.productionStatus !== filters.productionStatus
    ) {
      return false
    }

    if (
      filters.deliveryStatus !== 'all' &&
      order.deliveryStatus !== filters.deliveryStatus
    ) {
      return false
    }

    if (filters.managerId !== 'all' && order.managerId !== filters.managerId) {
      return false
    }

    if (filters.channel !== 'all' && order.channel !== filters.channel) {
      return false
    }

    if (filters.hasDebt === 'yes' && order.remainingAmount.rub <= 0) {
      return false
    }

    if (filters.hasDebt === 'no' && order.remainingAmount.rub > 0) {
      return false
    }

    if (filters.hasReturn === 'yes' && order.returnRequests.length === 0) {
      return false
    }

    if (filters.hasReturn === 'no' && order.returnRequests.length > 0) {
      return false
    }

    if (filters.hasDelay === 'yes' && order.delayIncidents.length === 0) {
      return false
    }

    if (filters.hasDelay === 'no' && order.delayIncidents.length > 0) {
      return false
    }

    if (filters.hasLoss === 'yes' && order.lossAmount.rub <= 0) {
      return false
    }

    if (filters.hasLoss === 'no' && order.lossAmount.rub > 0) {
      return false
    }

    return true
  })
}
