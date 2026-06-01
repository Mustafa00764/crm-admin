'use client'

import * as React from 'react'
import { Pencil, RotateCcw, Trash2, X } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { CrmMoneyPair } from '@/shared/ui/crm-money-pair'
import { useCRMStore } from '@/entities/crm/model/crm-store'
import type {
  CostResponsibleParty,
  CreateOrderReturnPayload,
  CRMOrder,
  OrderReturnReason,
  OrderReturnResolution,
  OrderReturnStatus
} from '../model/orders-types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/shared/ui/select'

const parties: CostResponsibleParty[] = [
  'company',
  'client',
  'supplier',
  'carrier',
  'manufacturer'
]

const reasons: OrderReturnReason[] = [
  'defect',
  'wrong_item',
  'wrong_size',
  'client_refusal',
  'delivery_damage',
  'over_ordered',
  'other'
]

const resolutions: OrderReturnResolution[] = [
  'refund',
  'replacement',
  'partial_replacement',
  'repair',
  'discount',
  'refund_and_replacement',
  'reject'
]

const RUB_TO_UZS_RATE = 138

function money(rub: number) {
  return {
    rub,
    uzs: Math.round(rub * RUB_TO_UZS_RATE)
  }
}

function parseNumber(value: string) {
  const parsed = Number(value.replace(/\s/g, '').replace(',', '.'))

  return Number.isNaN(parsed) ? 0 : parsed
}

export function OrderReturnPanel({ order }: { order: CRMOrder }) {
  const { createOrderReturn, updateOrderReturn, deleteOrderReturn } =
    useCRMStore()

  const firstAvailableItem =
    order.items.find(item => item.qty - item.returnedQty > 0) ?? order.items[0]

  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [pending, setPending] = React.useState(false)

  const [orderItemId, setOrderItemId] = React.useState(
    firstAvailableItem?.id ?? ''
  )
  const [qty, setQty] = React.useState('1')
  const [reason, setReason] = React.useState<OrderReturnReason>('defect')
  const [resolution, setResolution] =
    React.useState<OrderReturnResolution>('replacement')
  const [responsibleParty, setResponsibleParty] =
    React.useState<CostResponsibleParty>('supplier')
  const [refundPercent, setRefundPercent] = React.useState('0')
  const [writeOffPercent, setWriteOffPercent] = React.useState('60')
  const [replacementCostPercent, setReplacementCostPercent] =
    React.useState('70')
  const [returnDeliveryRub, setReturnDeliveryRub] = React.useState('0')
  const [replacementDeliveryRub, setReplacementDeliveryRub] =
    React.useState('0')
  const [expectedCompensationRub, setExpectedCompensationRub] =
    React.useState('0')
  const [claimReason, setClaimReason] = React.useState('')

  const selectedItem =
    order.items.find(item => item.id === orderItemId) ?? order.items[0] ?? null

  const editingRequest = editingId
    ? (order.returnRequests.find(request => request.id === editingId) ?? null)
    : null

  const editingQtyForSelectedItem =
    editingRequest && selectedItem
      ? editingRequest.items
          .filter(item => item.orderItemId === selectedItem.id)
          .reduce((sum, item) => sum + item.approvedQty, 0)
      : 0

  const availableQty = selectedItem
    ? selectedItem.qty - selectedItem.returnedQty + editingQtyForSelectedItem
    : 0

  const qtyValue = parseNumber(qty)
  const approvedQty = Math.min(qtyValue, availableQty)

  const resetForm = () => {
    const nextFirstItem =
      order.items.find(item => item.qty - item.returnedQty > 0) ??
      order.items[0]

    setEditingId(null)
    setOrderItemId(nextFirstItem?.id ?? '')
    setQty('1')
    setReason('defect')
    setResolution('replacement')
    setResponsibleParty('supplier')
    setRefundPercent('0')
    setWriteOffPercent('60')
    setReplacementCostPercent('70')
    setReturnDeliveryRub('0')
    setReplacementDeliveryRub('0')
    setExpectedCompensationRub('0')
    setClaimReason('')
  }

  const startEdit = (request: CRMOrder['returnRequests'][number]) => {
    const firstItem = request.items[0]

    if (!firstItem) return

    setEditingId(request.id)
    setOrderItemId(firstItem.orderItemId)
    setQty(String(firstItem.approvedQty))
    setReason(firstItem.reason)
    setResolution(request.resolution)
    setResponsibleParty(request.responsibleParty)

    setRefundPercent('0')
    setWriteOffPercent('60')
    setReplacementCostPercent('70')

    setReturnDeliveryRub(String(request.returnDeliveryCost.amount.rub))
    setReplacementDeliveryRub(
      String(request.replacementDeliveryCost.amount.rub)
    )
    setExpectedCompensationRub(String(request.expectedCompensationAmount.rub))
    setClaimReason(request.reason ?? '')
  }

  const resolutionLabels: Record<OrderReturnResolution, string> = {
    refund: 'Refund',
    replacement: 'Replacement',
    partial_replacement: 'Partial replacement',
    repair: 'Repair',
    discount: 'Discount',
    refund_and_replacement: 'Refund + replacement',
    reject: 'Rejected decision'
  }

  const statusLabels: Record<OrderReturnStatus, string> = {
    requested: 'Requested',
    approved: 'Approved',
    received: 'Received',
    partially_refunded: 'Partially refunded',
    refunded: 'Refunded',
    replacement_sent: 'Replacement sent',
    rejected: 'Rejected',
    closed: 'Closed'
  }

  const saveReturn = async () => {
    if (!selectedItem) return
    if (approvedQty <= 0) return

    const returnDeliveryRubValue = parseNumber(returnDeliveryRub)
    const replacementDeliveryRubValue = parseNumber(replacementDeliveryRub)

    const shouldReplace =
      resolution === 'replacement' ||
      resolution === 'partial_replacement' ||
      resolution === 'refund_and_replacement'

    const deliveryPayer: CostResponsibleParty =
      responsibleParty === 'client' ? 'client' : 'company'

    const payload: CreateOrderReturnPayload = {
      reason: claimReason.trim() || 'Return / claim',
      resolution,
      responsibleParty,
      expectedCompensationAmount: money(parseNumber(expectedCompensationRub)),
      receivedCompensationAmount: money(0),
      returnDeliveryCost: {
        required: returnDeliveryRubValue > 0,
        payer: deliveryPayer,
        paidByCompany: responsibleParty !== 'client',
        amount: money(returnDeliveryRubValue)
      },
      replacementDeliveryCost: {
        required: replacementDeliveryRubValue > 0,
        payer: deliveryPayer,
        paidByCompany: responsibleParty !== 'client',
        amount: money(replacementDeliveryRubValue)
      },
      items: [
        {
          orderItemId: selectedItem.id,
          requestedQty: approvedQty,
          approvedQty,
          reason,
          condition: reason === 'defect' ? 'defective' : 'other',
          refundPercent: parseNumber(refundPercent),
          writeOffPercent: parseNumber(writeOffPercent),
          shouldReplace,
          replacementQty: shouldReplace ? approvedQty : 0,
          replacementProductId: shouldReplace
            ? selectedItem.productId
            : undefined,
          replacementProductName: shouldReplace ? selectedItem.name : undefined,
          replacementCostPercent: shouldReplace
            ? parseNumber(replacementCostPercent)
            : 0
        }
      ]
    }

    setPending(true)

    try {
      if (editingId) {
        await updateOrderReturn(order.id, editingId, payload)
      } else {
        await createOrderReturn(order.id, payload)
      }

      resetForm()
    } finally {
      setPending(false)
    }
  }

  return (
    <section className="rounded-md border border-[var(--cf-border)] bg-[var(--cf-element)] p-3">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-[13px] font-semibold text-[var(--cf-text)]">
            Returns / Claims
          </h3>

          <p className="mt-0.5 text-[10px] text-[var(--cf-text-muted)]">
            {editingId
              ? 'Редактирование возврата / претензии'
              : 'Создание возврата / претензии'}
          </p>
        </div>

        <div className="text-right text-[11px] text-[var(--cf-text-muted)]">
          Loss: <CrmMoneyPair value={order.lossAmount} displayMode="dual" />
        </div>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2">
        <Select value={orderItemId} onValueChange={setOrderItemId}>
          <SelectTrigger className="w-full h-8 border border-[var(--cf-border)] bg-[var(--cf-bg)] px-2 text-[11px] text-[var(--cf-text)] focus:ring-0 focus:ring-offset-0">
            <SelectValue placeholder="Order item" />
          </SelectTrigger>

          <SelectContent className="cf-panel">
            {order.items.map(item => (
              <SelectItem key={item.id} value={item.id}>
                {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <input
          value={qty}
          onChange={event => setQty(event.target.value)}
          placeholder={`Return qty · available ${availableQty}`}
          className="cf-control h-8 px-2 text-[11px] outline-none"
        />

        <Select
          value={reason}
          onValueChange={value => setReason(value as OrderReturnReason)}
        >
          <SelectTrigger className="w-full h-8 border border-[var(--cf-border)] bg-[var(--cf-bg)] px-2 text-[11px] text-[var(--cf-text)] focus:ring-0 focus:ring-offset-0">
            <SelectValue />
          </SelectTrigger>

          <SelectContent className="cf-panel">
            {reasons.map(item => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={resolution}
          onValueChange={value => setResolution(value as OrderReturnResolution)}
        >
          <SelectTrigger className="w-full h-8 border border-[var(--cf-border)] bg-[var(--cf-bg)] px-2 text-[11px] text-[var(--cf-text)] focus:ring-0 focus:ring-offset-0">
            <SelectValue />
          </SelectTrigger>

          <SelectContent className="cf-panel">
            {resolutions.map(item => (
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
            <SelectValue />
          </SelectTrigger>

          <SelectContent className="cf-panel">
            {parties.map(item => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <input
          value={expectedCompensationRub}
          onChange={event => setExpectedCompensationRub(event.target.value)}
          placeholder="Expected compensation RUB"
          className="cf-control h-8 px-2 text-[11px] outline-none"
        />

        <input
          value={refundPercent}
          onChange={event => setRefundPercent(event.target.value)}
          placeholder="Refund %"
          className="cf-control h-8 px-2 text-[11px] outline-none"
        />

        <input
          value={writeOffPercent}
          onChange={event => setWriteOffPercent(event.target.value)}
          placeholder="Write-off %"
          className="cf-control h-8 px-2 text-[11px] outline-none"
        />

        <input
          value={replacementCostPercent}
          onChange={event => setReplacementCostPercent(event.target.value)}
          placeholder="Replacement cost %"
          className="cf-control h-8 px-2 text-[11px] outline-none"
        />

        <input
          value={returnDeliveryRub}
          onChange={event => setReturnDeliveryRub(event.target.value)}
          placeholder="Return delivery RUB"
          className="cf-control h-8 px-2 text-[11px] outline-none"
        />

        <input
          value={replacementDeliveryRub}
          onChange={event => setReplacementDeliveryRub(event.target.value)}
          placeholder="Replacement delivery RUB"
          className="cf-control h-8 px-2 text-[11px] outline-none"
        />

        <input
          value={claimReason}
          onChange={event => setClaimReason(event.target.value)}
          placeholder="Claim reason"
          className="cf-control h-8 px-2 text-[11px] outline-none"
        />
      </div>

      {qtyValue > availableQty ? (
        <div className="mb-3 rounded-md border border-[rgba(239,23,72,0.25)] bg-[rgba(239,23,72,0.08)] px-3 py-2 text-[11px] text-[var(--cf-red)]">
          Количество больше доступного. Будет использовано: {approvedQty}.
        </div>
      ) : null}

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          disabled={pending || approvedQty <= 0}
          className="h-8 rounded-md bg-[var(--cf-button)] px-3 text-[11px] text-[var(--cf-text)] disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => void saveReturn()}
        >
          <RotateCcw className="mr-1 h-3.5 w-3.5" />
          {editingId ? 'Save return / claim' : 'Create return / claim'}
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

      <div className="mt-3 space-y-2">
        {order.returnRequests.map(request => (
          <div
            key={request.id}
            className="rounded-md border border-[var(--cf-border)] bg-[var(--cf-bg)] p-2"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="truncate text-[12px] font-semibold text-[var(--cf-text)]">
                  {resolutionLabels[request.resolution]} ·{' '}
                  {statusLabels[request.status]}
                </div>

                <div className="mt-0.5 text-[10px] text-[var(--cf-text-muted)]">
                  responsible: {request.responsibleParty}
                </div>

                <div className="mt-1 text-[11px] text-[var(--cf-text-muted)]">
                  Reason: {request.reason}
                </div>
              </div>

              <div className="flex shrink-0 items-start gap-2">
                <div className="text-right text-[11px] text-[var(--cf-text)]">
                  Net loss:{' '}
                  <CrmMoneyPair
                    value={request.netLossAmount}
                    displayMode="dual"
                  />
                </div>

                <button
                  type="button"
                  className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--cf-button)] text-[var(--cf-text)] hover:bg-[var(--cf-element-hover)]"
                  onClick={event => {
                    event.stopPropagation()
                    startEdit(request)
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
                      'Удалить этот возврат / претензию? returnedQty и убытки будут пересчитаны.'
                    )

                    if (!confirmed) return

                    if (editingId === request.id) {
                      resetForm()
                    }

                    void deleteOrderReturn(order.id, request.id)
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="mt-2 space-y-1">
              {request.items.map(item => (
                <div
                  key={item.id}
                  className="text-[11px] text-[var(--cf-text-muted)]"
                >
                  {item.name} · {item.approvedQty} {item.unit} · {item.reason}
                </div>
              ))}
            </div>
          </div>
        ))}

        {order.returnRequests.length === 0 ? (
          <div className="text-[11px] text-[var(--cf-text-muted)]">
            Возвратов и претензий пока нет
          </div>
        ) : null}
      </div>
    </section>
  )
}
