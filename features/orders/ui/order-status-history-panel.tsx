import { History } from 'lucide-react'
import type { CRMOrder } from '../model/orders-types'

export function OrderStatusHistoryPanel({ order }: { order: CRMOrder }) {
  return (
    <section className="rounded-md border border-[var(--cf-border)] bg-[var(--cf-element)] p-3">
      <div className="mb-3 flex items-center gap-2">
        <History className="h-4 w-4 text-[var(--cf-icon)]" />
        <h3 className="text-[13px] font-semibold text-[var(--cf-text)]">
          Status history
        </h3>
      </div>

      <div className="space-y-2">
        {order.statusHistory.map(item => (
          <div
            key={item.id}
            className="rounded-md border border-[var(--cf-border)] bg-[var(--cf-bg)] p-2"
          >
            <div className="text-[12px] text-[var(--cf-text)]">
              {item.fromStatus ? `${item.fromStatus} → ` : ''}
              {item.toStatus}
            </div>

            {item.comment ? (
              <div className="mt-1 text-[11px] text-[var(--cf-text-muted)]">
                {item.comment}
              </div>
            ) : null}

            <div className="mt-1 text-[10px] text-[var(--cf-text-muted)]">
              {item.changedByUserName} · {item.changedAt}
            </div>
          </div>
        ))}

        {order.statusHistory.length === 0 ? (
          <div className="text-[11px] text-[var(--cf-text-muted)]">
            Истории статусов пока нет
          </div>
        ) : null}
      </div>
    </section>
  )
}