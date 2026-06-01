'use client'

import * as React from 'react'
import { X } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { CrmMoneyPair } from '@/shared/ui/crm-money-pair'
import { cn } from '@/shared/lib/cn'
import { useCRMStore } from '@/entities/crm/model/crm-store'
import { useCloseOnEscape } from '@/shared/hooks/use-close-on-escape'
import type {
  MoneyPair,
  OrderPayment
} from '@/features/orders/model/orders-types'
import type { PaymentRow, PaymentStatus } from '../model/payments-types'
import { PaymentStatusBadge } from './payment-badges'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/shared/ui/select'

const RUB_TO_UZS_RATE = 138

function money(rub: number): MoneyPair {
  return {
    rub,
    uzs: Math.round(rub * RUB_TO_UZS_RATE)
  }
}

function parseMoneyInput(value: string) {
  const parsed = Number(
    value
      .replace(/\s/g, '')
      .replace(',', '.')
      .replace(/[^\d.]/g, '')
  )

  return Number.isNaN(parsed) ? 0 : parsed
}

export function PaymentDetailsDrawer({
  open,
  row,
  onClose
}: {
  open: boolean
  row: PaymentRow | null
  onClose: () => void
}) {
  useCloseOnEscape({ open, onClose })

  if (!row) return null

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 transition-[visibility] duration-300',
        open ? 'visible' : 'invisible'
      )}
      aria-hidden={!open}
    >
      <div
        className={cn(
          'absolute inset-0 bg-black/45 transition-opacity duration-200 ease-out',
          open ? 'opacity-100' : 'opacity-0'
        )}
        onClick={onClose}
      />

      <aside
        className={cn(
          'absolute right-0 top-0 h-full w-full max-w-155 overflow-y-auto border-l border-(--cf-border) bg-(--cf-bg) p-4 shadow-2xl',
          'transition-all duration-200 ease-out will-change-transform',
          open ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        )}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-wide text-(--cf-text-muted)">
              Payment details
            </div>

            <h2 className="mt-1 text-[18px] font-semibold text-(--cf-text)">
              {row.payment.id}
            </h2>

            <p className="mt-1 text-[12px] text-(--cf-text-muted)">
              {row.orderNumber} · {row.clientName}
            </p>
          </div>

          <Button
            type="button"
            variant="ghost"
            className="cf-icon-button"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="mb-3 grid grid-cols-3 gap-2">
          <Metric
            label="Payment"
            value={
              <CrmMoneyPair value={row.payment.amount} displayMode="dual" />
            }
          />
          <Metric
            label="Order paid"
            value={
              <CrmMoneyPair value={row.orderPaidAmount} displayMode="dual" />
            }
          />
          <Metric
            label="Remaining"
            value={
              <CrmMoneyPair
                value={row.orderRemainingAmount}
                displayMode="dual"
              />
            }
          />
        </div>

        <section className="mb-3 rounded-md border border-(--cf-border) bg-(--cf-element) p-3">
          <div className="mb-3 flex flex-wrap gap-2">
            <PaymentStatusBadge status={row.payment.status} />

            <span className="rounded-md bg-(--cf-button) px-2 py-1 text-[10px] text-(--cf-text)">
              {row.payment.method}
            </span>

            <span className="rounded-md bg-(--cf-button) px-2 py-1 text-[10px] text-(--cf-text)">
              {row.channel}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-[11px]">
            <Info label="Client" value={row.clientName} />
            <Info label="Phone" value={row.phone ?? '—'} />
            <Info label="Company" value={row.companyName ?? '—'} />
            <Info label="Manager" value={row.managerName} />
            <Info label="Paid at" value={row.payment.paidAt ?? '—'} />
            <Info label="Created at" value={row.payment.createdAt} />
          </div>
        </section>

        <PaymentEditForm key={row.id} row={row} />
      </aside>
    </div>
  )
}

function PaymentEditForm({ row }: { row: PaymentRow }) {
  const { updateOrderPayment, updateOrderPaymentStatus, deleteOrderPayment } =
    useCRMStore()

  const [amountRub, setAmountRub] = React.useState(
    String(row.payment.amount.rub)
  )
  const [method, setMethod] = React.useState<OrderPayment['method']>(
    row.payment.method
  )
  const [status, setStatus] = React.useState<PaymentStatus>(row.payment.status)
  const [comment, setComment] = React.useState(row.payment.comment ?? '')
  const [pending, setPending] = React.useState(false)

  const amountValue = parseMoneyInput(amountRub)
  const canSave = amountValue > 0 && !pending

  const save = async () => {
    if (!canSave) return

    setPending(true)

    try {
      await updateOrderPayment(row.orderId, row.payment.id, {
        amount: money(amountValue),
        method,
        comment: comment.trim() || undefined
      })

      if (status !== row.payment.status) {
        await updateOrderPaymentStatus(row.orderId, row.payment.id, status)
      }
    } finally {
      setPending(false)
    }
  }

  return (
    <section className="rounded-md border border-(--cf-border) bg-(--cf-element) p-3">
      <h3 className="mb-3 text-[13px] font-semibold text-(--cf-text)">
        Edit payment
      </h3>

      <div className="grid grid-cols-2 gap-2">
        <input
          value={amountRub}
          onChange={event => setAmountRub(event.target.value)}
          placeholder="Amount RUB"
          className="cf-control h-8 px-2 text-[11px] outline-none"
        />

        <Select
          value={method}
          onValueChange={value => setMethod(value as OrderPayment['method'])}
        >
          <SelectTrigger className="cf-control w-full px-3 shadow-none ">
            <SelectValue />
          </SelectTrigger>

          <SelectContent className="cf-panel">
            <SelectItem value="cash">Cash</SelectItem>
            <SelectItem value="bank_transfer">Bank transfer</SelectItem>
            <SelectItem value="card">Card</SelectItem>
            <SelectItem value="online">Online</SelectItem>
            <SelectItem value="invoice">Invoice</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={status}
          onValueChange={value => setStatus(value as PaymentStatus)}
        >
          <SelectTrigger className="cf-control w-full px-3 shadow-none col-span-2">
            <SelectValue />
          </SelectTrigger>

          <SelectContent className="cf-panel">
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className='w-full mt-2'>
        <textarea
          value={comment}
          onChange={event => setComment(event.target.value)}
          placeholder="Comment"
          className="cf-control min-h-20 w-full px-2 py-1.5 text-[11px] outline-none"
        />
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        <Button
          type="button"
          variant="ghost"
          disabled={!canSave}
          className="h-8 rounded-md bg-(--cf-button) px-3 text-[11px] text-(--cf-text) disabled:opacity-50"
          onClick={() => void save()}
        >
          Save payment
        </Button>

        <Button
          type="button"
          variant="ghost"
          className="h-8 rounded-md bg-[rgba(239,23,72,0.12)] px-3 text-[11px] text-(--cf-red) hover:bg-[rgba(239,23,72,0.2)]"
          onClick={() => {
            const confirmed = window.confirm('Удалить оплату?')

            if (!confirmed) return

            void deleteOrderPayment(row.orderId, row.payment.id)
          }}
        >
          Delete payment
        </Button>
      </div>
    </section>
  )
}

function Metric({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-md border border-(--cf-border) bg-(--cf-element) p-3">
      <div className="text-[10px] uppercase tracking-wide text-(--cf-text-muted)">
        {label}
      </div>
      <div className="mt-1 text-[13px] font-semibold text-(--cf-text)">
        {value}
      </div>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-(--cf-text-muted)">
        {label}
      </div>
      <div className="mt-0.5 text-[12px] text-(--cf-text)">
        {value}
      </div>
    </div>
  )
}
