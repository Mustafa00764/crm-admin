'use client'

import * as React from 'react'
import { useCRMStore } from '@/entities/crm/model/crm-store'
import { cn } from '@/shared/lib/cn'
import type { PaymentRow, PaymentStatus } from '../model/payments-types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/shared/ui/select'

const statusOptions: Array<[PaymentStatus, string]> = [
  ['pending', 'Pending'],
  ['confirmed', 'Confirmed'],
  ['cancelled', 'Cancelled'],
  ['refunded', 'Refunded']
]

const dotColors: Record<string, string> = {
  pending: '#eab308',
  confirmed: '#22c55e',
  cancelled: '#64748b',
  refunded: '#ec4899'
}

export function PaymentStatusSelect({
  row,
  variant = 'default'
}: {
  row: PaymentRow
  variant?: 'default' | 'table'
}) {
  const { updateOrderPaymentStatus } = useCRMStore()
  const [pending, setPending] = React.useState(false)

  const isTable = variant === 'table'

  const handleChange = async (value: string) => {
    const nextStatus = value as PaymentStatus

    if (pending) return
    if (nextStatus === row.payment.status) return

    setPending(true)

    try {
      await updateOrderPaymentStatus(row.orderId, row.payment.id, nextStatus)
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
        value={row.payment.status}
        disabled={pending}
        onValueChange={value => void handleChange(value as PaymentStatus)}
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
                  style={{ backgroundColor: dotColors[row.payment.status] }}
                /> */}

            <span className="min-w-0 truncate">
              <SelectValue placeholder="Payment status" />
            </span>
          </span>
        </SelectTrigger>

        <SelectContent className="border border-[var(--cf-border)] bg-[var(--cf-bg)] text-[var(--cf-text)]">
          {statusOptions.map(([value, label]) => (
            <SelectItem
              key={value}
              value={value}
              textValue={label}
              className="text-[11px] focus:bg-[var(--cf-element-hover)] focus:text-[var(--cf-text)]"
            >
              <span className="flex items-center gap-2">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: dotColors[value] }}
                />

                <span>{label}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
