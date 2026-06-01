'use client'

import {
  AlertTriangle,
  CreditCard,
  Package,
  RotateCcw,
  Truck
} from 'lucide-react'
import { SelectCheckbox } from '@/shared/ui/select-checkbox'
import { CrmMoneyPair } from '@/shared/ui/crm-money-pair'
import { cn } from '@/shared/lib/cn'
import type { CRMOrder } from '../model/orders-types'
import {
  OrderDeliveryStatusBadge,
  OrderPaymentStatusBadge,
  OrderProductionStatusBadge,
  OrderStatusBadge
} from './order-badges'
import { OrderRowActionsMenu } from './order-row-actions-menu'

type OrdersCardGridProps = {
  orders: CRMOrder[]
  selectedOrderIds: string[]
  onSelect: (orderId: string) => void
  onToggleOrder: (orderId: string) => void
}

export function OrdersCardGrid({
  orders,
  selectedOrderIds,
  onSelect,
  onToggleOrder
}: OrdersCardGridProps) {
  if (orders.length === 0) {
    return (
      <section className="cf-panel flex min-h-80 items-center justify-center text-[12px] text-(--cf-text-muted)">
        Orders not found
      </section>
    )
  }

  return (
    <section className="grid grid-cols-3 gap-3 pb-4 2xl:grid-cols-4">
      {orders.map(order => {
        const checked = selectedOrderIds.includes(order.id)

        return (
          <article
            key={order.id}
            onClick={() => onSelect(order.id)}
            className={cn(
              'cf-panel cursor-pointer p-3 transition-[background-color,border-color,box-shadow,transform,translate] duration-200 hover:-translate-y-1 hover:bg-(--cf-element)',
              checked &&
                'border-(--cf-blue) bg-[rgba(8,183,239,0.09)] shadow-[0_0_0_1px_var(--cf-blue)]'
            )}
          >
            <div className="mb-3 flex items-start justify-between gap-2">
              <div className='flex items-start gap-2 '>
                <div
                  className="flex shrink-0 items-center gap-1"
                  onClick={event => event.stopPropagation()}
                  onPointerDown={event => event.stopPropagation()}
                >
                  <SelectCheckbox
                    checked={checked}
                    onCheckedChange={() => onToggleOrder(order.id)}
                  />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-[13px] font-semibold text-(--cf-text)">
                    {order.orderNumber}
                  </div>

                  <div className="mt-0.5 truncate text-[11px] text-(--cf-text-muted)">
                    {order.clientName}
                  </div>
                </div>
              </div>

              <div
                className="flex shrink-0 items-center gap-1 [&_svg]:text-primary"
                onClick={event => event.stopPropagation()}
                onPointerDown={event => event.stopPropagation()}
              >
                <OrderRowActionsMenu
                  order={order}
                  onOpen={() => onSelect(order.id)}
                />
              </div>
            </div>

            <div className="mb-3 flex flex-wrap gap-1.5">
              <OrderStatusBadge status={order.status} />
              <OrderPaymentStatusBadge status={order.paymentStatus} />
            </div>

            <div className="mb-3 grid grid-cols-2 gap-2">
              <Metric label="Total" value={order.total} />
              <Metric label="Paid" value={order.paidAmount} />
              <Metric label="Remaining" value={order.remainingAmount} />
              <Metric label="Loss" value={order.lossAmount} danger />
            </div>

            <div className="mb-3 grid grid-cols-2 gap-2 text-[11px]">
              <Info icon={<Package className="h-3.5 w-3.5" />} label="Items">
                {order.items.length}
              </Info>

              <Info
                icon={<CreditCard className="h-3.5 w-3.5" />}
                label="Payments"
              >
                {order.payments.length}
              </Info>

              <Info icon={<Truck className="h-3.5 w-3.5" />} label="Delivery">
                {order.deliveryStatus}
              </Info>

              <Info
                icon={<RotateCcw className="h-3.5 w-3.5" />}
                label="Returns"
              >
                {order.returnRequests.length}
              </Info>
            </div>

            <div className="mb-3 flex flex-wrap gap-1.5">
              <OrderProductionStatusBadge status={order.productionStatus} />
              <OrderDeliveryStatusBadge status={order.deliveryStatus} />
            </div>

            <div className="rounded-md border border-(--cf-border) bg-(--cf-element) p-2">
              <div className="truncate text-[11px] text-(--cf-text)">
                {order.managerName}
              </div>

              <div className="mt-0.5 truncate text-[10px] text-(--cf-text-muted)">
                {order.channel} · {order.city ?? order.deliveryCity ?? '—'}
              </div>
            </div>

            {order.lossAmount.rub > 0 || order.delayIncidents.length > 0 ? (
              <div className="mt-2 flex items-center gap-1 rounded-md border border-[rgba(239,23,72,0.28)] bg-[rgba(239,23,72,0.08)] px-2 py-1 text-[10px] text-(--cf-red)">
                <AlertTriangle className="h-3.5 w-3.5" />
                Loss / delay exists
              </div>
            ) : null}
          </article>
        )
      })}
    </section>
  )
}

function Metric({
  label,
  value,
  danger
}: {
  label: string
  value: CRMOrder['total']
  danger?: boolean
}) {
  return (
    <div className="rounded-md border border-(--cf-border) bg-(--cf-element) p-2">
      <div className="text-[10px] text-(--cf-text-muted)">{label}</div>

      <div
        className={cn(
          'mt-1 text-[11px] font-medium text-(--cf-text)',
          danger && value.rub > 0 && 'text-(--cf-red)'
        )}
      >
        <CrmMoneyPair value={value} displayMode="dual" />
      </div>
    </div>
  )
}

function Info({
  icon,
  label,
  children
}: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-(--cf-border) bg-(--cf-element) px-2 py-1.5 text-(--cf-text-muted)">
      {icon}

      <span className="min-w-0 truncate">
        {label}: <span className="text-(--cf-text)">{children}</span>
      </span>
    </div>
  )
}
