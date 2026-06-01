'use client'

import { AlertTriangle, RotateCcw } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { CrmMoneyPair } from '@/shared/ui/crm-money-pair'
import { SelectCheckbox } from '@/shared/ui/select-checkbox'
import type { CRMOrder } from '../model/orders-types'
import {
  OrderDeliveryStatusBadge,
  OrderPaymentStatusBadge,
  OrderProductionStatusBadge
} from './order-badges'
import { OrderRowActionsMenu } from './order-row-actions-menu'
import { OrderStatusSelect } from './order-status-select'

type OrdersTableProps = {
  orders: CRMOrder[]
  selectedOrderId: string | null
  selectedOrderIds: string[]
  onSelect: (orderId: string) => void
  onToggleOrder: (orderId: string) => void
  onToggleAll: () => void
}

export function OrdersTable({
  orders,
  selectedOrderId,
  selectedOrderIds,
  onSelect,
  onToggleOrder,
  onToggleAll
}: OrdersTableProps) {
const allSelected =
  orders.length > 0 &&
  orders.every(order => selectedOrderIds.includes(order.id))

  return (
    <section className="cf-panel flex-1 min-h-0 overflow-hidden">
      <div className="h-full overflow-auto">
        <table className="w-max min-w-[1740px] border-separate border-spacing-0">
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

              <Head className="min-w-[120px]">number</Head>
              <Head className="min-w-[260px]">order</Head>
              <Head className="min-w-[190px]">client</Head>
              <Head className="min-w-[150px]">phone</Head>
              <Head className="min-w-[160px]">manager</Head>
              <Head className="min-w-[170px]">status</Head>
              <Head className="min-w-[140px]">payment</Head>
              <Head className="min-w-[150px]">production</Head>
              <Head className="min-w-[140px]">delivery</Head>
              <Head className="min-w-[160px]">total</Head>
              <Head className="min-w-[160px]">paid</Head>
              <Head className="min-w-[160px]">remaining</Head>
              <Head className="min-w-[150px]">loss</Head>
              <Head className="min-w-[110px]">returns</Head>
              <Head className="min-w-[130px]">channel</Head>

              <th className="sticky right-0 top-0 z-50 h-9 w-[74px] min-w-[74px] bg-[var(--cf-panel-soft)] px-3 text-center text-[11px] text-[var(--cf-text-muted)] shadow-[-2px_0_2px_rgba(0,0,0,0.05)]">
                options
              </th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order, index) => {
              const checked = selectedOrderIds.includes(order.id)

              return (
                <tr
                  key={order.id}
                  onClick={() => onSelect(order.id)}
                  className={cn(
                    'group cursor-pointer',
                    selectedOrderId === order.id && 'is-selected'
                  )}
                >
                  <Cell className="sticky left-0 z-30 w-[52px] min-w-[52px] group-hover:bg-[var(--cf-table-row-hover)]">
                    <div
                      onClick={event => event.stopPropagation()}
                      onPointerDown={event => event.stopPropagation()}
                    >
                      <SelectCheckbox
                        checked={checked}
                        onCheckedChange={() => onToggleOrder(order.id)}
                      />
                    </div>
                  </Cell>

                  <Cell className="sticky left-[52px] z-30 w-[56px] min-w-[56px] shadow-[2px_0_2px_rgba(0,0,0,0.05)] group-hover:bg-[var(--cf-table-row-hover)]">
                    {index + 1}
                  </Cell>

                  <Cell className="min-w-[120px]">{order.orderNumber}</Cell>

                  <Cell className="min-w-[260px] max-w-[260px]">
                    <div className="truncate font-medium">
                      {getOrderMainTitle(order)}
                    </div>

                    <div className="truncate text-[10px] opacity-60">
                      {getOrderSubtitle(order)}
                    </div>
                  </Cell>

                  <Cell className="min-w-[190px] max-w-[190px]">
                    <div className="truncate font-medium">
                      {order.clientName}
                    </div>

                    <div className="truncate text-[10px] opacity-60">
                      {order.companyName ?? order.city ?? '—'}
                    </div>
                  </Cell>

                  <Cell className="min-w-[150px]">{order.phone ?? '—'}</Cell>

                  <Cell className="min-w-[160px]">
                    {order.managerName ?? '—'}
                  </Cell>

                  <Cell className="min-w-[170px]">
                    <OrderStatusSelect order={order} variant="table" />
                  </Cell>

                  <Cell className="min-w-[140px]">
                    <OrderPaymentStatusBadge status={order.paymentStatus} />
                  </Cell>

                  <Cell className="min-w-[150px]">
                    <OrderProductionStatusBadge
                      status={order.productionStatus}
                    />
                  </Cell>

                  <Cell className="min-w-[140px]">
                    <OrderDeliveryStatusBadge status={order.deliveryStatus} />
                  </Cell>

                  <Cell className="min-w-[160px]">
                    <CrmMoneyPair value={order.total} displayMode="dual" />
                  </Cell>

                  <Cell className="min-w-[160px]">
                    <CrmMoneyPair value={order.paidAmount} displayMode="dual" />
                  </Cell>

                  <Cell className="min-w-[160px]">
                    <CrmMoneyPair
                      value={order.remainingAmount}
                      displayMode="dual"
                    />
                  </Cell>

                  <Cell className="min-w-[150px]">
                    <div
                      className={cn(
                        'flex items-center gap-1',
                        order.lossAmount.rub > 0 && 'text-[var(--cf-red)]'
                      )}
                    >
                      {order.lossAmount.rub > 0 ? (
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                      ) : null}

                      <CrmMoneyPair
                        value={order.lossAmount}
                        displayMode="dual"
                      />
                    </div>
                  </Cell>

                  <Cell className="min-w-[110px]">
                    <div className="flex items-center gap-1">
                      {order.returnRequests.length > 0 ? (
                        <RotateCcw className="h-3.5 w-3.5 shrink-0 text-[var(--cf-red)]" />
                      ) : null}

                      {order.returnRequests.length}
                    </div>
                  </Cell>

                  <Cell className="min-w-[130px]">{order.channel}</Cell>

                  <Cell className="sticky right-0 z-30 w-[74px] min-w-[74px] text-center shadow-[-2px_0_2px_rgba(0,0,0,0.05)] group-hover:bg-[var(--cf-table-row-hover)]">
                    <OrderRowActionsMenu
                      order={order}
                      onOpen={() => onSelect(order.id)}
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

function getOrderMainTitle(order: CRMOrder) {
  const firstItem = order.items[0]

  if (!firstItem) {
    return order.orderNumber
  }

  return firstItem.name
}

function getOrderSubtitle(order: CRMOrder) {
  const firstItem = order.items[0]

  if (!firstItem) {
    return order.status
  }

  if (order.items.length === 1) {
    return firstItem.categoryName
  }

  return `${firstItem.categoryName} + ещё ${order.items.length - 1}`
}
