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
import {
  buildPaymentRows,
  initialPaymentFilters,
  type PaymentFilters,
  type PaymentRow,
  type PaymentViewMode
} from '../model/payments-types'
import { PaymentsFilters } from './payments-filters'
import { PaymentsTable } from './payments-table'
import { PaymentsCardGrid } from './payments-card-grid'
import { PaymentDetailsDrawer } from './payment-details-drawer'
import { usePersistedViewMode } from '@/shared/hooks/use-persisted-view-mode'
import { usePaginatedList } from '@/shared/hooks/use-paginated-list'
import { ListPagination } from '@/shared/ui/list-pagination'

export function PaymentsPage() {
  const { orders, ordersLoading, ordersError, loadOrders, deleteOrderPayment } =
    useCRMStore()
  const [filters, setFilters] = React.useState<PaymentFilters>(
    initialPaymentFilters
  )
  const [viewMode, setViewMode] = usePersistedViewMode(
    'crm.payments.viewMode',
    'cards'
  )
  const [selectedPaymentId, setSelectedPaymentId] = React.useState<
    string | null
  >(null)
  const [selectedPaymentIds, setSelectedPaymentIds] = React.useState<string[]>(
    []
  )
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false)

  React.useEffect(() => {
    void loadOrders()
  }, [loadOrders])

  const paymentRows = React.useMemo(() => {
    return buildPaymentRows(orders)
  }, [orders])

  const filteredPayments = React.useMemo(() => {
    return applyPaymentFilters(paymentRows, filters)
  }, [paymentRows, filters])

  const {
    page,
    pageSize,
    total,
    totalPages,
    paginatedItems: paginatedPayments,
    setPage,
    setPageSize
  } = usePaginatedList({
    items: filteredPayments,
    storageKey: 'crm.payments.pageSize',
    defaultPageSize: 20
  })

  const selectedPayment = React.useMemo(() => {
    return paymentRows.find(row => row.id === selectedPaymentId) ?? null
  }, [paymentRows, selectedPaymentId])

  const selectedFilteredPaymentIds = React.useMemo(() => {
    return selectedPaymentIds.filter(paymentId =>
      filteredPayments.some(row => row.id === paymentId)
    )
  }, [selectedPaymentIds, filteredPayments])

  const openPayment = React.useCallback((paymentId: string) => {
    setSelectedPaymentId(paymentId)
    setIsDrawerOpen(true)
  }, [])

  const togglePayment = React.useCallback((paymentId: string) => {
    setSelectedPaymentIds(current =>
      current.includes(paymentId)
        ? current.filter(id => id !== paymentId)
        : [...current, paymentId]
    )
  }, [])

  const toggleAll = React.useCallback(() => {
    setSelectedPaymentIds(current => {
      const visibleIds = paginatedPayments.map(row => row.id)

      if (visibleIds.length === 0) return current

      const allSelected = visibleIds.every(id => current.includes(id))

      if (allSelected) {
        return current.filter(id => !visibleIds.includes(id))
      }

      return Array.from(new Set([...current, ...visibleIds]))
    })
  }, [paginatedPayments])

  const deleteSelected = React.useCallback(async () => {
    const selectedRows = paymentRows.filter(row =>
      selectedPaymentIds.includes(row.id)
    )

    await Promise.all(
      selectedRows.map(row => deleteOrderPayment(row.orderId, row.payment.id))
    )

    setSelectedPaymentIds([])
  }, [paymentRows, selectedPaymentIds, deleteOrderPayment])

  return (
    <div className="cf-page flex flex-col min-h-screen">
      <AdminPageHeader
        title="Dashboard - Payments"
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

            <Button type="button" variant="ghost" className="cf-icon-button">
              <Plus className="h-5 w-5" />
            </Button>
          </>
        }
      />

      <div className="h-full flex flex-col flex-1 px-5 py-3">
        <main className="h-full flex-1 relative flex min-w-0 flex-col gap-3">
          <PaymentsFilters
            filters={filters}
            onChange={payload =>
              setFilters(current => ({
                ...current,
                ...payload
              }))
            }
          />

          {selectedFilteredPaymentIds.length > 0 ? (
            <div className="cf-panel h-full flex items-center justify-between gap-3 px-3 py-2">
              <div className="text-[12px] text-[var(--cf-text)]">
                Выбрано оплат:{' '}
                <span className="font-semibold">
                  {selectedFilteredPaymentIds.length}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  className="h-8 rounded-md bg-[var(--cf-button)] px-3 text-[11px] text-[var(--cf-text)] hover:bg-[var(--cf-element-hover)]"
                  onClick={() => setSelectedPaymentIds([])}
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
              Loading payments...
            </section>
          ) : (
            <>
              {viewMode === 'table' ? (
                <PaymentsTable
                  payments={paginatedPayments}
                  selectedPaymentId={selectedPaymentId}
                  selectedPaymentIds={selectedFilteredPaymentIds}
                  onSelect={openPayment}
                  onTogglePayment={togglePayment}
                  onToggleAll={toggleAll}
                />
              ) : (
                <PaymentsCardGrid
                  payments={paginatedPayments}
                  selectedPaymentIds={selectedFilteredPaymentIds}
                  onSelect={openPayment}
                  onTogglePayment={togglePayment}
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

      <PaymentDetailsDrawer
        open={isDrawerOpen}
        row={selectedPayment}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  )
}

function applyPaymentFilters(payments: PaymentRow[], filters: PaymentFilters) {
  return payments.filter(row => {
    const search = filters.search.trim().toLowerCase()

    if (search) {
      const haystack = [
        row.payment.id,
        row.orderNumber,
        row.clientName,
        row.companyName,
        row.phone,
        row.email,
        row.city,
        row.managerName,
        row.channel,
        row.source,
        row.payment.method,
        row.payment.status,
        row.payment.comment
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      if (!haystack.includes(search)) {
        return false
      }
    }

    if (filters.status !== 'all' && row.payment.status !== filters.status) {
      return false
    }

    if (filters.method !== 'all' && row.payment.method !== filters.method) {
      return false
    }

    if (filters.managerId !== 'all' && row.managerId !== filters.managerId) {
      return false
    }

    if (filters.channel !== 'all' && row.channel !== filters.channel) {
      return false
    }

    const amountFrom = Number(filters.amountFrom)
    const amountTo = Number(filters.amountTo)

    if (
      !Number.isNaN(amountFrom) &&
      filters.amountFrom &&
      row.payment.amount.rub < amountFrom
    ) {
      return false
    }

    if (
      !Number.isNaN(amountTo) &&
      filters.amountTo &&
      row.payment.amount.rub > amountTo
    ) {
      return false
    }

    return true
  })
}
