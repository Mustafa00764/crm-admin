import { Badge } from '@/shared/ui/badge'
import type { PaymentStatus } from '../model/payments-types'

const statusClasses: Record<string, string> = {
  pending: 'bg-[rgba(234,179,8,0.16)] text-[var(--cf-yellow)]',
  confirmed: 'bg-[rgba(34,197,94,0.16)] text-[var(--cf-green)]',
  cancelled: 'bg-[rgba(100,116,139,0.16)] text-slate-400',
  refunded: 'bg-[rgba(236,72,153,0.16)] text-pink-400'
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <Badge
      className={`whitespace-nowrap text-[10px] ${
        statusClasses[status] ?? 'bg-(--cf-button) text-(--cf-text)'
      }`}
    >
      {status}
    </Badge>
  )
}