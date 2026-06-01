'use client'

import * as React from 'react'
import { Pencil, Plus, Trash2, X } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { CrmMoneyPair } from '@/shared/ui/crm-money-pair'
import { useCRMStore } from '@/entities/crm/model/crm-store'
import type { CRMOrder, MoneyPair, OrderPayment } from '../model/orders-types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/shared/ui/select'

const RUB_TO_UZS_RATE = 138

function createMoney(rub: number): MoneyPair {
  return {
    rub,
    uzs: Math.round(rub * RUB_TO_UZS_RATE)
  }
}

function parseMoneyInput(value: string) {
  const normalized = value
    .replace(/\s/g, '')
    .replace(',', '.')
    .replace(/[^\d.]/g, '')

  const parsed = Number(normalized)

  return Number.isNaN(parsed) ? 0 : parsed
}

export function OrderPaymentPanel({ order }: { order: CRMOrder }) {
  const { addOrderPayment, updateOrderPayment, deleteOrderPayment } =
    useCRMStore()

  const [editingId, setEditingId] = React.useState<string | null>(null)

  const [amountRub, setAmountRub] = React.useState('')
  const [method, setMethod] =
    React.useState<OrderPayment['method']>('bank_transfer')
  const [comment, setComment] = React.useState('')
  const [pending, setPending] = React.useState(false)

  const parsedAmount = parseMoneyInput(amountRub)
  const canSave = parsedAmount > 0 && !pending

  const resetForm = () => {
    setEditingId(null)
    setAmountRub('')
    setMethod('bank_transfer')
    setComment('')
  }

  const startEdit = (payment: OrderPayment) => {
    setEditingId(payment.id)
    setAmountRub(String(payment.amount.rub))
    setMethod(payment.method)
    setComment(payment.comment ?? '')
  }

  const savePayment = async () => {
    if (!canSave) return

    const payload = {
      amount: createMoney(parsedAmount),
      method,
      comment: comment.trim() || undefined
    }

    setPending(true)

    try {
      if (editingId) {
        await updateOrderPayment(order.id, editingId, payload)
      } else {
        await addOrderPayment(order.id, payload)
      }

      resetForm()
    } finally {
      setPending(false)
    }
  }

  return (
    <section className="rounded-md border border-[var(--cf-border)] bg-[var(--cf-element)] p-3">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-[13px] font-semibold text-[var(--cf-text)]">
            Payments
          </h3>

          <p className="mt-0.5 text-[10px] text-[var(--cf-text-muted)]">
            {editingId ? 'Редактирование оплаты' : 'Добавление оплат по заказу'}
          </p>
        </div>

        <div className="text-right text-[11px] text-[var(--cf-text-muted)]">
          <div>
            Paid: <CrmMoneyPair value={order.paidAmount} displayMode="dual" />
          </div>

          <div className="mt-1">
            Remaining:{' '}
            <CrmMoneyPair value={order.remainingAmount} displayMode="dual" />
          </div>
        </div>
      </div>

      <div className="mb-3 grid grid-cols-[1fr_150px_1fr_auto_auto] gap-2">
        <input
          value={amountRub}
          onChange={event => setAmountRub(event.target.value)}
          placeholder="Amount RUB"
          inputMode="decimal"
          className="cf-control h-8 px-2 text-[11px] outline-none"
        />

        <Select
          value={method}
          onValueChange={value => setMethod(value as OrderPayment['method'])}
        >
          <SelectTrigger className="h-8 border border-[var(--cf-border)] bg-[var(--cf-bg)] px-2 text-[11px] text-[var(--cf-text)] focus:ring-0 focus:ring-offset-0">
            <SelectValue />
          </SelectTrigger>

          <SelectContent className="cf-panel">
            <SelectItem value="bank_transfer">Bank transfer</SelectItem>
            <SelectItem value="cash">Cash</SelectItem>
            <SelectItem value="card">Card</SelectItem>
            <SelectItem value="online">Online</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>

        <input
          value={comment}
          onChange={event => setComment(event.target.value)}
          placeholder="Comment"
          className="cf-control h-8 px-2 text-[11px] outline-none"
        />

        <Button
          type="button"
          variant="ghost"
          disabled={!canSave}
          className="h-8 rounded-md bg-[var(--cf-button)] px-3 text-[11px] text-[var(--cf-text)] disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => void savePayment()}
        >
          <Plus className="mr-1 h-3.5 w-3.5" />
          {editingId ? 'Save' : 'Add'}
        </Button>

        {editingId ? (
          <Button
            type="button"
            variant="ghost"
            disabled={pending}
            className="h-8 rounded-md bg-[var(--cf-button)] px-3 text-[11px] text-[var(--cf-text)] hover:bg-[var(--cf-element-hover)]"
            onClick={resetForm}
          >
            <X className="mr-1 h-3.5 w-3.5" />
            Cancel
          </Button>
        ) : null}
      </div>

      {amountRub && parsedAmount <= 0 ? (
        <div className="mb-3 rounded-md border border-[rgba(239,23,72,0.25)] bg-[rgba(239,23,72,0.08)] px-3 py-2 text-[11px] text-[var(--cf-red)]">
          Введите сумму больше 0. Можно писать так: 100000, 100 000 или
          100000.50
        </div>
      ) : null}

      <div className="space-y-2">
        {order.payments.map(payment => (
          <div
            key={payment.id}
            className="grid grid-cols-[1fr_auto] gap-2 rounded-md border border-[var(--cf-border)] bg-[var(--cf-bg)] p-2"
          >
            <div>
              <div className="text-[12px] text-[var(--cf-text)]">
                {payment.method} · {payment.status}
              </div>

              <div className="mt-0.5 text-[10px] text-[var(--cf-text-muted)]">
                {payment.paidAt}
              </div>

              {payment.comment ? (
                <div className="mt-1 text-[11px] text-[var(--cf-text-muted)]">
                  {payment.comment}
                </div>
              ) : null}
            </div>

            <div className="flex items-start gap-2">
              <div className="text-right text-[11px] text-[var(--cf-text)]">
                <CrmMoneyPair value={payment.amount} displayMode="dual" />
              </div>
              <div className='flex flex-col gap-1'>
                <button
                  type="button"
                  className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--cf-button)] text-[var(--cf-text)] hover:bg-[var(--cf-element-hover)]"
                  onClick={event => {
                    event.stopPropagation()
                    startEdit(payment)
                  }}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>

                <button
                  type="button"
                  className="flex h-7 w-7 items-center justify-center rounded-md bg-[rgba(239,23,72,0.12)] text-[var(--cf-red)] hover:bg-[rgba(239,23,72,0.2)]"
                  onClick={event => {
                    event.stopPropagation()

                    const confirmed = window.confirm(
                      'Удалить эту оплату? paidAmount, remainingAmount и paymentStatus будут пересчитаны.'
                    )

                    if (!confirmed) return

                    void deleteOrderPayment(order.id, payment.id)
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {order.payments.length === 0 ? (
          <div className="text-[11px] text-[var(--cf-text-muted)]">
            Оплат пока нет
          </div>
        ) : null}
      </div>
    </section>
  )
}
