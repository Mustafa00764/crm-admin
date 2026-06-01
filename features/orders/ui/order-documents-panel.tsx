import { FileText } from 'lucide-react'
import { Badge } from '@/shared/ui/badge'
import type { CRMOrder } from '../model/orders-types'

export function OrderDocumentsPanel({ order }: { order: CRMOrder }) {
  return (
    <section className="rounded-md border border-[var(--cf-border)] bg-[var(--cf-element)] p-3">
      <div className="mb-3 flex items-center gap-2">
        <FileText className="h-4 w-4 text-[var(--cf-icon)]" />
        <h3 className="text-[13px] font-semibold text-[var(--cf-text)]">
          Documents
        </h3>
      </div>

      <div className="space-y-2">
        {order.documents.map(document => (
          <div
            key={document.id}
            className="flex items-center justify-between gap-2 rounded-md border border-[var(--cf-border)] bg-[var(--cf-bg)] p-2"
          >
            <div>
              <div className="text-[12px] text-[var(--cf-text)]">
                {document.title}
              </div>

              <div className="mt-1 text-[10px] text-[var(--cf-text-muted)]">
                {document.createdAt}
              </div>
            </div>

            <Badge className="bg-[var(--cf-button)] text-[10px] text-[var(--cf-text)]">
              {document.type}
            </Badge>
          </div>
        ))}

        {order.documents.length === 0 ? (
          <div className="text-[11px] text-[var(--cf-text-muted)]">
            Документов пока нет
          </div>
        ) : null}
      </div>
    </section>
  )
}