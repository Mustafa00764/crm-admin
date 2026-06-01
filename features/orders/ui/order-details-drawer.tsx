'use client'

import { X } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { CrmMoneyPair } from '@/shared/ui/crm-money-pair'
import type { CRMOrder } from '../model/orders-types'
import {
  OrderDeliveryStatusBadge,
  OrderPaymentStatusBadge,
  OrderProductionStatusBadge,
  OrderStatusBadge
} from './order-badges'
import { OrderPaymentPanel } from './order-payment-panel'
import { OrderReturnPanel } from './order-return-panel'
import { OrderStatusSelect } from './order-status-select'
import { OrderDelayPanel } from './order-delay-panel'
import { OrderExtraCostPanel } from './order-extra-cost-panel'
import { OrderNotesPanel } from './order-notes-panel'
import { OrderStatusHistoryPanel } from './order-status-history-panel'
import { OrderDocumentsPanel } from './order-documents-panel'
import { cn } from '@/shared/lib/utils'
import { useCloseOnEscape } from '@/shared/hooks/use-close-on-escape'

export function OrderDetailsDrawer({
  open,
  order,
  onClose
}: {
  open: boolean
  order: CRMOrder | null
  onClose: () => void
}) {
  useCloseOnEscape({
    open,
    onClose
  })

  if (!order) return null

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
          'absolute right-0 top-0 h-full w-full max-w-[820px] overflow-y-auto border-l border-[var(--cf-border)] bg-[var(--cf-bg)] p-4 shadow-2xl',
          'transition-all duration-200 ease-out will-change-transform',
          open ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-wide text-[var(--cf-text-muted)]">
              Order details
            </div>

            <h2 className="mt-1 text-[18px] font-semibold text-[var(--cf-text)]">
              {order.orderNumber}
            </h2>

            <p className="mt-1 text-[12px] text-[var(--cf-text-muted)]">
              {order.clientName} · {order.companyName ?? order.phone ?? '—'}
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

        <div className="mb-3 grid grid-cols-4 gap-2">
          <Metric
            label="Total"
            value={<CrmMoneyPair value={order.total} displayMode="dual" />}
          />

          <Metric
            label="Paid"
            value={<CrmMoneyPair value={order.paidAmount} displayMode="dual" />}
          />

          <Metric
            label="Remaining"
            value={
              <CrmMoneyPair value={order.remainingAmount} displayMode="dual" />
            }
          />

          <Metric
            label="Loss"
            value={<CrmMoneyPair value={order.lossAmount} displayMode="dual" />}
          />
        </div>

        <section className="mb-3 rounded-md border border-[var(--cf-border)] bg-[var(--cf-element)] p-3">
          <div className="mb-3 grid grid-cols-[1fr_220px] gap-3">
            <div className="flex flex-wrap gap-2">
              <OrderStatusBadge status={order.status} />
              <OrderPaymentStatusBadge status={order.paymentStatus} />
              <OrderProductionStatusBadge status={order.productionStatus} />
              <OrderDeliveryStatusBadge status={order.deliveryStatus} />
            </div>

            <OrderStatusSelect order={order} />
          </div>

          <div className="grid grid-cols-2 gap-3 text-[11px]">
            <Info label="Manager" value={order.managerName} />
            <Info label="Channel" value={order.channel} />
            <Info label="Source" value={order.source} />
            <Info label="City" value={order.city ?? '—'} />
            <Info label="Delivery city" value={order.deliveryCity ?? '—'} />
            <Info
              label="Delivery address"
              value={order.deliveryAddress ?? '—'}
            />
          </div>
        </section>

        <section className="mb-3 rounded-md border border-[var(--cf-border)] bg-[var(--cf-element)] p-3">
          <h3 className="mb-3 text-[13px] font-semibold text-[var(--cf-text)]">
            Order items
          </h3>

          <div className="space-y-2">
            {order.items.map(item => (
              <div
                key={item.id}
                className="grid grid-cols-[1fr_auto] gap-3 rounded-md border border-[var(--cf-border)] bg-[var(--cf-bg)] p-2"
              >
                <div>
                  <div className="text-[12px] text-[var(--cf-text)]">
                    {item.name}
                  </div>

                  <div className="mt-0.5 text-[10px] text-[var(--cf-text-muted)]">
                    {item.sku} · {item.qty} {item.unit} · returned:{' '}
                    {item.returnedQty} {item.unit}
                  </div>
                </div>

                <div className="text-right text-[11px] text-[var(--cf-text)]">
                  <CrmMoneyPair value={item.finalTotal} displayMode="dual" />
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="mb-3">
          <OrderPaymentPanel order={order} />
        </div>

        <div className="mb-3">
          <OrderReturnPanel order={order} />
        </div>

        <div className="mb-3">
          <OrderDelayPanel order={order} />
        </div>

        <div className="mb-3">
          <OrderExtraCostPanel order={order} />
        </div>

        <div className="mb-3">
          <OrderNotesPanel order={order} />
        </div>

        <div className="mb-3">
          <OrderDocumentsPanel order={order} />
        </div>

        <div className="mb-3">
          <OrderStatusHistoryPanel order={order} />
        </div>
      </aside>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-md border border-[var(--cf-border)] bg-[var(--cf-element)] p-3">
      <div className="text-[10px] uppercase tracking-wide text-[var(--cf-text-muted)]">
        {label}
      </div>

      <div className="mt-1 text-[13px] font-semibold text-[var(--cf-text)]">
        {value}
      </div>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-[var(--cf-text-muted)]">
        {label}
      </div>

      <div className="mt-0.5 text-[12px] text-[var(--cf-text)]">{value}</div>
    </div>
  )
}
