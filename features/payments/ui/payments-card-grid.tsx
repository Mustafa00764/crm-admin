'use client'

import { CreditCard, ReceiptText } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { CrmMoneyPair } from '@/shared/ui/crm-money-pair'
import { SelectCheckbox } from '@/shared/ui/select-checkbox'
import type { PaymentRow } from '../model/payments-types'
import { PaymentStatusBadge } from './payment-badges'
import { PaymentRowActionsMenu } from './payment-row-actions-menu'

export function PaymentsCardGrid({
  payments,
  selectedPaymentIds,
  onSelect,
  onTogglePayment
}: {
  payments: PaymentRow[]
  selectedPaymentIds: string[]
  onSelect: (paymentId: string) => void
  onTogglePayment: (paymentId: string) => void
}) {
  if (payments.length === 0) {
    return (
      <section className="cf-panel flex min-h-[320px] items-center justify-center text-[12px] text-[var(--cf-text-muted)]">
        Payments not found
      </section>
    )
  }

  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 pb-4 2xl:grid-cols-4">
      {payments.map(row => {
        const checked = selectedPaymentIds.includes(row.id)

        return (
          <article
            key={row.id}
            onClick={() => onSelect(row.id)}
            className={cn(
              'cf-panel cursor-pointer p-3 transition-[background-color,border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:bg-[var(--cf-element)]',
              checked &&
                'border-(--cf-blue) bg-[rgba(8,183,239,0.09)] shadow-[0_0_0_1px_var(--cf-blue)]'
            )}
          >
            <div className="mb-3 flex items-start justify-between gap-2">
              <div className="min-w-0 flex items-start gap-2">
                <div
                  className="flex shrink-0 items-center gap-1"
                  onClick={event => event.stopPropagation()}
                  onPointerDown={event => event.stopPropagation()}
                >
                  <SelectCheckbox
                    checked={checked}
                    onCheckedChange={() => onTogglePayment(row.id)}
                  />
                </div>

                <div className='min-w-0'>
                  <div className="truncate text-[13px] font-semibold text-[var(--cf-text)]">
                    {row.orderNumber}
                  </div>

                  <div className="mt-0.5 truncate text-[11px] text-[var(--cf-text-muted)]">
                    {row.clientName}
                  </div>
                </div>
              </div>

              <div
                className="flex shrink-0 items-center gap-1 [&_svg]:text-primary"
                onClick={event => event.stopPropagation()}
                onPointerDown={event => event.stopPropagation()}
              >

                <PaymentRowActionsMenu
                  row={row}
                  onOpen={() => onSelect(row.id)}
                />
              </div>
            </div>

            <div className="mb-3 flex flex-wrap gap-1.5">
              <PaymentStatusBadge status={row.payment.status} />
              <span className="rounded-md bg-[var(--cf-button)] px-2 py-1 text-[10px] text-[var(--cf-text)]">
                {row.payment.method}
              </span>
            </div>

            <div className="mb-3 rounded-md border border-[var(--cf-border)] bg-[var(--cf-bg)] p-3">
              <div className="mb-1 flex items-center gap-2 text-[10px] text-[var(--cf-text-muted)]">
                <CreditCard className="h-3.5 w-3.5" />
                Payment amount
              </div>

              <div className="text-[13px] font-semibold text-[var(--cf-text)]">
                <CrmMoneyPair value={row.payment.amount} displayMode="dual" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <Info label="Order paid">
                <CrmMoneyPair value={row.orderPaidAmount} displayMode="dual" />
              </Info>

              <Info label="Remaining">
                <CrmMoneyPair
                  value={row.orderRemainingAmount}
                  displayMode="dual"
                />
              </Info>
            </div>

            <div className="mt-3 rounded-md border border-[var(--cf-border)] bg-[var(--cf-bg)] p-2">
              <div className="flex items-center gap-2 text-[11px] text-[var(--cf-text)]">
                <ReceiptText className="h-3.5 w-3.5 text-[var(--cf-icon)]" />
                {row.managerName}
              </div>

              <div className="mt-0.5 truncate text-[10px] text-[var(--cf-text-muted)]">
                {row.channel} · {row.payment.paidAt ?? row.payment.createdAt}
              </div>
            </div>
          </article>
        )
      })}
    </section>
  )
}

function Info({
  label,
  children
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-md border border-[var(--cf-border)] bg-[var(--cf-bg)] p-2">
      <div className="text-[10px] text-[var(--cf-text-muted)]">{label}</div>
      <div className="mt-1 text-[11px] font-medium text-[var(--cf-text)]">
        {children}
      </div>
    </div>
  )
}
