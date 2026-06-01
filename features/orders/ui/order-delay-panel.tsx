'use client'

import * as React from 'react'
import { AlertTriangle, Pencil, Plus, Trash2, X } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { CrmMoneyPair } from '@/shared/ui/crm-money-pair'
import { useCRMStore } from '@/entities/crm/model/crm-store'
import type {
  CostResponsibleParty,
  CRMOrder,
  MoneyPair,
  OrderDelayType
} from '../model/orders-types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/shared/ui/select'

const rate = 138

const delayTypes: OrderDelayType[] = [
  'production',
  'delivery',
  'payment',
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

export function OrderDelayPanel({ order }: { order: CRMOrder }) {
  const { addOrderDelay, updateOrderDelay, deleteOrderDelay } = useCRMStore()

  const [type, setType] = React.useState<OrderDelayType>('delivery')
  const [responsibleParty, setResponsibleParty] =
    React.useState<CostResponsibleParty>('carrier')
  const [title, setTitle] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [lossRub, setLossRub] = React.useState('0')
  const [pending, setPending] = React.useState(false)
  const [editingId, setEditingId] = React.useState<string | null>(null)

  const saveDelay = async () => {
    const titleValue = title.trim()
    const rub = Number(lossRub)

    if (!titleValue) return
    if (Number.isNaN(rub) || rub < 0) return

    const payload = {
      type,
      title: titleValue,
      description: description.trim() || undefined,
      responsibleParty,
      lossAmount: createMoney(rub)
    }

    setPending(true)

    try {
      if (editingId) {
        await updateOrderDelay(order.id, editingId, payload)
      } else {
        await addOrderDelay(order.id, payload)
      }

      resetForm()
    } finally {
      setPending(false)
    }
  }

  const resetForm = () => {
    setEditingId(null)
    setType('delivery')
    setResponsibleParty('carrier')
    setTitle('')
    setDescription('')
    setLossRub('0')
  }

  const startEdit = (delay: CRMOrder['delayIncidents'][number]) => {
    setEditingId(delay.id)
    setType(delay.type)
    setResponsibleParty(delay.responsibleParty)
    setTitle(delay.title)
    setDescription(delay.description ?? '')
    setLossRub(String(delay.lossAmount.rub))
  }

  return (
    <section className="rounded-md border border-[var(--cf-border)] bg-[var(--cf-element)] p-3">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-[13px] font-semibold text-[var(--cf-text)]">
            Delay incidents
          </h3>
          <p className="mt-0.5 text-[10px] text-[var(--cf-text-muted)]">
            Производственные, логистические и платежные задержки
          </p>
        </div>

        <div className="text-right text-[11px] text-[var(--cf-text-muted)]">
          Total delay loss:{' '}
          <CrmMoneyPair
            value={order.delayIncidents.reduce(
              (acc, item) => ({
                rub: acc.rub + item.lossAmount.rub,
                uzs: acc.uzs + item.lossAmount.uzs
              }),
              { rub: 0, uzs: 0 }
            )}
            displayMode="dual"
          />
        </div>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2">
        <Select
          value={type}
          onValueChange={value => setType(value as OrderDelayType)}
        >
          <SelectTrigger className="w-full h-8 border border-[var(--cf-border)] bg-[var(--cf-bg)] px-2 text-[11px] text-[var(--cf-text)] focus:ring-0 focus:ring-offset-0">
            <SelectValue placeholder="Delay type" />
          </SelectTrigger>

          <SelectContent className="border border-[var(--cf-border)] bg-[var(--cf-bg)] text-[var(--cf-text)]">
            {delayTypes.map(item => (
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
          placeholder="Delay title"
          className="cf-control h-8 px-2 text-[11px] outline-none"
        />

        <input
          value={lossRub}
          onChange={event => setLossRub(event.target.value)}
          placeholder="Loss RUB"
          className="cf-control h-8 px-2 text-[11px] outline-none"
        />

        <input
          value={description}
          onChange={event => setDescription(event.target.value)}
          placeholder="Description"
          className="cf-control col-span-2 h-8 px-2 text-[11px] outline-none"
        />
      </div>

      <Button
        type="button"
        variant="ghost"
        disabled={pending}
        className="h-8 rounded-md bg-[var(--cf-button)] px-3 text-[11px] text-[var(--cf-text)] disabled:opacity-60"
        onClick={() => void saveDelay()}
      >
        <Plus className="mr-1 h-3.5 w-3.5" />
        {editingId ? 'Save' : 'Add delay'}
      </Button>

      {editingId ? (
        <Button
          type="button"
          variant="ghost"
          disabled={pending}
          className="ml-2 h-8 rounded-md bg-[var(--cf-button)] px-3 text-[11px] text-[var(--cf-text)] hover:bg-[var(--cf-element-hover)]"
          onClick={resetForm}
        >
          <X className="mr-1 h-3.5 w-3.5" />
          Cancel
        </Button>
      ) : null}

      <div className="mt-3 space-y-2">
        {order.delayIncidents.map(delay => (
          <div
            key={delay.id}
            className="rounded-md border border-[var(--cf-border)] bg-[var(--cf-bg)] p-2"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-1 text-[12px] font-medium text-[var(--cf-text)]">
                  <AlertTriangle className="h-3.5 w-3.5 text-[var(--cf-yellow)]" />
                  {delay.title}
                </div>

                <div className="mt-1 text-[10px] text-[var(--cf-text-muted)]">
                  {delay.type} · responsible: {delay.responsibleParty} ·{' '}
                  {delay.startedAt}
                </div>

                {delay.description ? (
                  <div className="mt-1 text-[11px] leading-5 text-[var(--cf-text-muted)]">
                    {delay.description}
                  </div>
                ) : null}
              </div>

              <div className="flex items-start gap-2">
                <div className="text-right text-[11px] text-[var(--cf-text)]">
                  <CrmMoneyPair value={delay.lossAmount} displayMode="dual" />
                </div>

                <div className='flex flex-col gap-1'>
                  <button
                    type="button"
                    className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--cf-button)] text-[var(--cf-text)] hover:bg-[var(--cf-element-hover)]"
                    onClick={event => {
                      event.stopPropagation()
                      startEdit(delay)
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
                        'Удалить этот delay incident? Убыток и статус заказа будут пересчитаны.'
                      )

                      if (!confirmed) return

                      void deleteOrderDelay(order.id, delay.id)
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {order.delayIncidents.length === 0 ? (
          <div className="text-[11px] text-[var(--cf-text-muted)]">
            Задержек нет
          </div>
        ) : null}
      </div>
    </section>
  )
}
