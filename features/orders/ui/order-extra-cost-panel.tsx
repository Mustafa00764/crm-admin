'use client'

import * as React from 'react'
import { Pencil, Plus, ReceiptText, Trash2 } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { CrmMoneyPair } from '@/shared/ui/crm-money-pair'
import { useCRMStore } from '@/entities/crm/model/crm-store'
import type {
  CostResponsibleParty,
  CRMOrder,
  MoneyPair,
  OrderExtraCostType
} from '../model/orders-types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/shared/ui/select'

const rate = 138

const costTypes: OrderExtraCostType[] = [
  'delivery',
  'storage',
  'production',
  'replacement',
  'return',
  'penalty',
  'other'
]

const responsibleParties: CostResponsibleParty[] = [
  'company',
  'client',
  'supplier',
  'carrier',
  'manufacturer'
]

function createMoney(rub: number): MoneyPair {
  return {
    rub,
    uzs: Math.round(rub * rate)
  }
}

export function OrderExtraCostPanel({ order }: { order: CRMOrder }) {
  const { addOrderExtraCost, deleteOrderExtraCost } = useCRMStore()
  
  const [type, setType] = React.useState<OrderExtraCostType>('delivery')
  const [responsibleParty, setResponsibleParty] =
    React.useState<CostResponsibleParty>('company')
  const [title, setTitle] = React.useState('')
  const [amountRub, setAmountRub] = React.useState('0')
  const [comment, setComment] = React.useState('')
  const [pending, setPending] = React.useState(false)
  const [editingId, setEditingId] = React.useState<string | null>(null)

  const saveExtraCost = async () => {
    const titleValue = title.trim()
    const rub = Number(amountRub)

    if (!titleValue) return
    if (Number.isNaN(rub) || rub <= 0) return

    setPending(true)

    try {
      await addOrderExtraCost(order.id, {
        type,
        title: titleValue,
        amount: createMoney(rub),
        responsibleParty,
        comment: comment.trim() || undefined
      })

      setTitle('')
      setAmountRub('0')
      setComment('')
    } finally {
      setPending(false)
    }
  }

  return (
    <section className="rounded-md border border-[var(--cf-border)] bg-[var(--cf-element)] p-3">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-[13px] font-semibold text-[var(--cf-text)]">
            Extra costs
          </h3>
          <p className="mt-0.5 text-[10px] text-[var(--cf-text-muted)]">
            Дополнительные расходы: хранение, штрафы, замены, возвраты
          </p>
        </div>

        <div className="text-right text-[11px] text-[var(--cf-text-muted)]">
          Total:{' '}
          <CrmMoneyPair value={order.extraCostsAmount} displayMode="dual" />
        </div>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2">
        <Select
          value={type}
          onValueChange={value => setType(value as OrderExtraCostType)}
        >
          <SelectTrigger className="w-full h-8 border border-[var(--cf-border)] bg-[var(--cf-bg)] px-2 text-[11px] text-[var(--cf-text)] focus:ring-0 focus:ring-offset-0">
            <SelectValue placeholder="Cost type" />
          </SelectTrigger>

          <SelectContent className="border border-[var(--cf-border)] bg-[var(--cf-bg)] text-[var(--cf-text)]">
            {costTypes.map(item => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={responsibleParty}
          onValueChange={value =>
            setResponsibleParty(value as CostResponsibleParty)
          }
        >
          <SelectTrigger className="w-full h-8 border border-[var(--cf-border)] bg-[var(--cf-bg)] px-2 text-[11px] text-[var(--cf-text)] focus:ring-0 focus:ring-offset-0">
            <SelectValue placeholder="Responsible" />
          </SelectTrigger>

          <SelectContent className="border border-[var(--cf-border)] bg-[var(--cf-bg)] text-[var(--cf-text)]">
            {responsibleParties.map(item => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <input
          value={title}
          onChange={event => setTitle(event.target.value)}
          placeholder="Cost title"
          className="cf-control h-8 px-2 text-[11px] outline-none"
        />

        <input
          value={amountRub}
          onChange={event => setAmountRub(event.target.value)}
          placeholder="Amount RUB"
          className="cf-control h-8 px-2 text-[11px] outline-none"
        />

        <input
          value={comment}
          onChange={event => setComment(event.target.value)}
          placeholder="Comment"
          className="cf-control col-span-2 h-8 px-2 text-[11px] outline-none"
        />
      </div>

      <Button
        type="button"
        variant="ghost"
        disabled={pending}
        className="h-8 rounded-md bg-[var(--cf-button)] px-3 text-[11px] text-[var(--cf-text)] disabled:opacity-60"
        onClick={() => void saveExtraCost()}
      >
        <Plus className="mr-1 h-3.5 w-3.5" />
        Add cost
      </Button>

      <div className="mt-3 space-y-2">
        {order.extraCosts.map(cost => (
          <div
            key={cost.id}
            className="rounded-md border border-[var(--cf-border)] bg-[var(--cf-bg)] p-2"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-1 text-[12px] font-medium text-[var(--cf-text)]">
                  <ReceiptText className="h-3.5 w-3.5 text-[var(--cf-blue)]" />
                  {cost.title}
                </div>

                <div className="mt-1 text-[10px] text-[var(--cf-text-muted)]">
                  {cost.type} · responsible: {cost.responsibleParty} ·{' '}
                  {cost.createdAt}
                </div>

                {cost.comment ? (
                  <div className="mt-1 text-[11px] text-[var(--cf-text-muted)]">
                    {cost.comment}
                  </div>
                ) : null}
              </div>
              <div className="flex items-start gap-2">
                <div className="text-right text-[11px] text-[var(--cf-text)]">
                  <CrmMoneyPair value={cost.amount} displayMode="dual" />
                </div>

                <button
                  type="button"
                  className="flex h-7 w-7 items-center justify-center rounded-md bg-[rgba(239,23,72,0.12)] text-[var(--cf-red)] hover:bg-[rgba(239,23,72,0.2)]"
                  onClick={event => {
                    event.stopPropagation()

                    const confirmed = window.confirm(
                      'Удалить этот extra cost? Убытки будут пересчитаны.'
                    )

                    if (!confirmed) return

                    void deleteOrderExtraCost(order.id, cost.id)
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>

              </div>
            </div>
          </div>
        ))}

        {order.extraCosts.length === 0 ? (
          <div className="text-[11px] text-[var(--cf-text-muted)]">
            Дополнительных расходов нет
          </div>
        ) : null}
      </div>
    </section>
  )
}
