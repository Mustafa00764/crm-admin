import { Badge } from '@/shared/ui/badge'
import type {
  OrderDeliveryStatus,
  OrderPaymentStatus,
  OrderProductionStatus,
  OrderStatus
} from '../model/orders-types'

const statusMap: Record<OrderStatus, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-slate-500/15 text-slate-50' },
  confirmed: { label: 'Confirmed', className: 'bg-blue-500/15 text-blue-500' },
  invoice_sent: {
    label: 'Invoice sent',
    className: 'bg-indigo-500/15 text-indigo-500'
  },
  waiting_payment: {
    label: 'Waiting payment',
    className: 'bg-yellow-500/15 text-yellow-500'
  },
  partially_paid: {
    label: 'Partially paid',
    className: 'bg-amber-500/15 text-amber-500'
  },
  paid: { label: 'Paid', className: 'bg-green-500/15 text-green-500' },
  production_planned: {
    label: 'Production planned',
    className: 'bg-cyan-500/15 text-cyan-500'
  },
  in_production: {
    label: 'In production',
    className: 'bg-sky-500/15 text-sky-500'
  },
  production_completed: {
    label: 'Production done',
    className: 'bg-emerald-500/15 text-emerald-500'
  },
  ready_for_delivery: {
    label: 'Ready delivery',
    className: 'bg-teal-500/15 text-teal-500'
  },
  delivery_scheduled: {
    label: 'Delivery scheduled',
    className: 'bg-purple-500/15 text-purple-500'
  },
  in_delivery: {
    label: 'In delivery',
    className: 'bg-violet-500/15 text-violet-500'
  },
  delivered: {
    label: 'Delivered',
    className: 'bg-green-500/15 text-green-500'
  },
  completed: {
    label: 'Completed',
    className: 'bg-emerald-500/15 text-emerald-500'
  },
  production_delayed: {
    label: 'Production delayed',
    className: 'bg-orange-500/15 text-orange-500'
  },
  delivery_delayed: {
    label: 'Delivery delayed',
    className: 'bg-orange-500/15 text-orange-500'
  },
  return_requested: {
    label: 'Return requested',
    className: 'bg-rose-500/15 text-rose-500'
  },
  partially_returned: {
    label: 'Partial return',
    className: 'bg-red-500/15 text-red-500'
  },
  returned: { label: 'Returned', className: 'bg-red-500/15 text-red-500' },
  refunded: { label: 'Refunded', className: 'bg-pink-500/15 text-pink-500' },
  cancelled: { label: 'Cancelled', className: 'bg-slate-500/15 text-slate-500' }
}

const paymentMap: Record<
  OrderPaymentStatus,
  { label: string; className: string }
> = {
  not_paid: { label: 'Not paid', className: 'bg-red-500/15 text-red-500' },
  partially_paid: {
    label: 'Partial',
    className: 'bg-amber-500/15 text-amber-500'
  },
  paid: { label: 'Paid', className: 'bg-green-500/15 text-green-500' },
  overpaid: { label: 'Overpaid', className: 'bg-blue-500/15 text-blue-500' },
  partially_refunded: {
    label: 'Partial refund',
    className: 'bg-orange-500/15 text-orange-300'
  },
  refunded: { label: 'Refunded', className: 'bg-pink-500/15 text-pink-500' }
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const config = statusMap[status]

  return (
    <Badge className={`whitespace-nowrap text-[10px] ${config.className}`}>
      {config.label}
    </Badge>
  )
}

export function OrderPaymentStatusBadge({
  status
}: {
  status: OrderPaymentStatus
}) {
  const config = paymentMap[status]

  return (
    <Badge className={`whitespace-nowrap text-[10px] ${config.className}`}>
      {config.label}
    </Badge>
  )
}

export function OrderProductionStatusBadge({
  status
}: {
  status: OrderProductionStatus
}) {
  return (
    <Badge className="whitespace-nowrap bg-(--cf-table-text)/30 dark:bg-(--cf-table-text)/50 text-[10px] text-primary">
      {status}
    </Badge>
  )
}

export function OrderDeliveryStatusBadge({
  status
}: {
  status: OrderDeliveryStatus
}) {
  return (
    <Badge className="whitespace-nowrap bg-(--cf-table-text)/30 dark:bg-(--cf-table-text)/50 text-[10px] text-primary">
      {status}
    </Badge>
  )
}
