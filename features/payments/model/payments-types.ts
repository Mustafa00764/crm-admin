import type { CRMOrder, OrderPayment } from '@/features/orders/model/orders-types'

export type PaymentViewMode = 'table' | 'cards'

export type PaymentStatus = OrderPayment['status']
export type PaymentMethod = OrderPayment['method']

export type PaymentFilters = {
  search: string
  status: PaymentStatus | 'all'
  method: PaymentMethod | 'all'
  managerId: string
  channel: string
  amountFrom: string
  amountTo: string
}

export type PaymentRow = {
  id: string
  orderId: string
  orderNumber: string
  clientName: string
  companyName?: string
  phone?: string
  email?: string
  city?: string
  managerId: string
  managerName: string
  source: string
  channel: string
  orderTotal: CRMOrder['total']
  orderPaidAmount: CRMOrder['paidAmount']
  orderRemainingAmount: CRMOrder['remainingAmount']
  orderPaymentStatus: CRMOrder['paymentStatus']
  payment: OrderPayment
  order: CRMOrder
}

export const initialPaymentFilters: PaymentFilters = {
  search: '',
  status: 'all',
  method: 'all',
  managerId: 'all',
  channel: 'all',
  amountFrom: '',
  amountTo: ''
}

export function buildPaymentRows(orders: CRMOrder[]): PaymentRow[] {
  return orders.flatMap(order =>
    order.payments.map(payment => ({
      id: payment.id,
      orderId: order.id,
      orderNumber: order.orderNumber,
      clientName: order.clientName,
      companyName: order.companyName,
      phone: order.phone,
      email: order.email,
      city: order.city,
      managerId: order.managerId,
      managerName: order.managerName,
      source: order.source,
      channel: order.channel,
      orderTotal: order.total,
      orderPaidAmount: order.paidAmount,
      orderRemainingAmount: order.remainingAmount,
      orderPaymentStatus: order.paymentStatus,
      payment,
      order
    }))
  )
}