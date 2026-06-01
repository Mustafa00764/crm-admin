'use client'

import * as React from 'react'
import {
  orderStatuses,
  type CRMOrder,
  type OrderStatus
} from '../model/orders-types'
import { useCRMStore } from '@/entities/crm/model/crm-store'
import { cn } from '@/shared/lib/cn'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/shared/ui/select'

const statusDotColors: Record<OrderStatus, string> = {
  draft: '#64748b',
  confirmed: '#38bdf8',
  invoice_sent: '#818cf8',
  waiting_payment: '#eab308',
  partially_paid: '#f59e0b',
  paid: '#22c55e',
  production_planned: '#06b6d4',
  in_production: '#0ea5e9',
  production_completed: '#10b981',
  ready_for_delivery: '#14b8a6',
  delivery_scheduled: '#a78bfa',
  in_delivery: '#8b5cf6',
  delivered: '#22c55e',
  completed: '#16a34a',
  production_delayed: '#f97316',
  delivery_delayed: '#f97316',
  return_requested: '#fb7185',
  partially_returned: '#ef4444',
  returned: '#dc2626',
  refunded: '#ec4899',
  cancelled: '#64748b'
}

export function OrderStatusSelect({
  order,
  variant = 'default'
}: {
  order: CRMOrder
  variant?: 'default' | 'table'
}) {
  const { updateOrderStatus } = useCRMStore()
  const [pending, setPending] = React.useState(false)

  const isTable = variant === 'table'

  const handleChange = async (nextStatus: OrderStatus) => {
    if (pending) return
    if (nextStatus === order.status) return

    setPending(true)

    try {
      await updateOrderStatus(order.id, nextStatus)
    } finally {
      setPending(false)
    }
  }

  return (
    <div
      onClick={event => event.stopPropagation()}
      onPointerDown={event => event.stopPropagation()}
    >
      <Select
        value={order.status}
        disabled={pending}
        onValueChange={value => void handleChange(value as OrderStatus)}
      >
        <SelectTrigger
          className={cn(
            'h-7 w-full border px-2 text-[11px] outline-none focus:ring-0 focus:ring-offset-0 focus-visible:border-(--cf-table-text)/30 disabled:cursor-not-allowed disabled:opacity-60 ',
            isTable
              ? 'border-(--cf-table-text)/15 bg-[rgba(255,255,255,0.24)] text-(--cf-table-text) hover:bg-[rgba(255,255,255,0.34)] [&_svg]:text-(--cf-table-text)/80'
              : 'border-(--cf-border) bg-(--cf-bg) text-primary [&_svg]:text-auto'
          )}
        >
          <span className="flex min-w-0 items-center gap-2">
            {/* <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: statusDotColors[order.status] }}
            /> */}

            <span className="min-w-0 truncate">
              <SelectValue placeholder="Order status" />
            </span>
          </span>
        </SelectTrigger>

        <SelectContent className="border border-[var(--cf-border)] bg-[var(--cf-bg)] text-[var(--cf-text)]">
          {orderStatuses.map(status => (
            <SelectItem
              key={status.value}
              value={status.value}
              textValue={status.label}
              className="text-[11px] focus:bg-[var(--cf-element-hover)] focus:text-[var(--cf-text)]"
            >
              <span className="flex items-center gap-2">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: statusDotColors[status.value] }}
                />

                <span>{status.label}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
