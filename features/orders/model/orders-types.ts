export type MoneyPair = {
  rub: number
  uzs: number
  rateId?: string
  convertedAt?: string
}

export type UnitType = 'm2' | 'pcs' | 'lm' | 'kg' | 'set'

export type OrdersViewMode = 'table' | 'cards'

export type OrderStatus =
  | 'draft'
  | 'confirmed'
  | 'invoice_sent'
  | 'waiting_payment'
  | 'partially_paid'
  | 'paid'
  | 'production_planned'
  | 'in_production'
  | 'production_completed'
  | 'ready_for_delivery'
  | 'delivery_scheduled'
  | 'in_delivery'
  | 'delivered'
  | 'completed'
  | 'production_delayed'
  | 'delivery_delayed'
  | 'return_requested'
  | 'partially_returned'
  | 'returned'
  | 'refunded'
  | 'cancelled'

export type OrderPaymentStatus =
  | 'not_paid'
  | 'partially_paid'
  | 'paid'
  | 'overpaid'
  | 'partially_refunded'
  | 'refunded'

export type OrderProductionStatus =
  | 'not_required'
  | 'not_started'
  | 'planned'
  | 'in_progress'
  | 'delayed'
  | 'completed'

export type OrderDeliveryStatus =
  | 'not_required'
  | 'not_scheduled'
  | 'scheduled'
  | 'in_transit'
  | 'delayed'
  | 'delivered'
  | 'failed'
  | 'returned'

export type OrderDelayType = 'production' | 'delivery' | 'payment' | 'other'

export type CostResponsibleParty =
  | 'company'
  | 'client'
  | 'supplier'
  | 'carrier'
  | 'manufacturer'

export type OrderReturnReason =
  | 'defect'
  | 'wrong_item'
  | 'wrong_size'
  | 'client_refusal'
  | 'delivery_damage'
  | 'over_ordered'
  | 'other'

export type OrderReturnResolution =
  | 'refund'
  | 'replacement'
  | 'partial_replacement'
  | 'repair'
  | 'discount'
  | 'refund_and_replacement'
  | 'reject'

export type OrderReturnStatus =
  | 'requested'
  | 'approved'
  | 'received'
  | 'partially_refunded'
  | 'refunded'
  | 'replacement_sent'
  | 'rejected'
  | 'closed'

export type OrderExtraCostType =
  | 'delivery'
  | 'storage'
  | 'production'
  | 'replacement'
  | 'return'
  | 'penalty'
  | 'other'

export type OrderNoteType =
  | 'general'
  | 'payment'
  | 'production'
  | 'delivery'
  | 'return'
  | 'loss'
  | 'internal'

export type OrderFilters = {
  search: string
  status: OrderStatus | 'all'
  paymentStatus: OrderPaymentStatus | 'all'
  productionStatus: OrderProductionStatus | 'all'
  deliveryStatus: OrderDeliveryStatus | 'all'
  managerId: string
  channel: string
  hasDebt: 'all' | 'yes' | 'no'
  hasReturn: 'all' | 'yes' | 'no'
  hasDelay: 'all' | 'yes' | 'no'
  hasLoss: 'all' | 'yes' | 'no'
}

export type OrderItem = {
  id: string
  productId: string
  sku: string
  name: string
  categoryId: string
  categoryName: string
  qty: number
  returnedQty: number
  unit: UnitType
  price: MoneyPair
  baseTotal: MoneyPair
  discountPercent: number
  discountAmount: MoneyPair
  finalTotal: MoneyPair
}

export type OrderPayment = {
  id: string
  orderId: string
  amount: MoneyPair
  method: 'cash' | 'bank_transfer' | 'card' | 'online' | 'other'
  status: 'pending' | 'confirmed' | 'cancelled' | 'refunded'
  comment?: string
  paidAt: string
  createdAt: string
}

export type OrderDelayIncident = {
  id: string
  orderId: string
  type: OrderDelayType
  title: string
  description?: string
  responsibleParty: CostResponsibleParty
  lossAmount: MoneyPair
  startedAt: string
  resolvedAt?: string
  createdAt: string
}

export type ReturnLogisticsCost = {
  required: boolean
  payer: CostResponsibleParty
  paidByCompany: boolean
  amount: MoneyPair
  carrierName?: string
  trackingNumber?: string
  expectedCompensationAmount: MoneyPair
  receivedCompensationAmount: MoneyPair
  comment?: string
}

export type OrderReturnItem = {
  id: string
  orderItemId: string
  productId: string
  sku: string
  name: string

  requestedQty: number
  approvedQty: number
  unit: UnitType

  unitPrice: MoneyPair
  refundAmount: MoneyPair

  reason: OrderReturnReason
  condition: 'new' | 'damaged' | 'defective' | 'used' | 'wrong_item' | 'other'

  shouldReplace: boolean
  replacementQty: number
  replacementProductId?: string
  replacementProductName?: string

  writeOffAmount: MoneyPair
  repairCostAmount: MoneyPair
  replacementCostAmount: MoneyPair
  lossAmount: MoneyPair
}

export type OrderReturnRequest = {
  id: string
  orderId: string

  status: OrderReturnStatus
  reason: string
  resolution: OrderReturnResolution
  responsibleParty: CostResponsibleParty

  items: OrderReturnItem[]

  requestedAmount: MoneyPair
  refundAmount: MoneyPair

  returnDeliveryCost: ReturnLogisticsCost
  replacementDeliveryCost: ReturnLogisticsCost

  replacementOrderId?: string
  replacementShipmentId?: string

  companyLossAmount: MoneyPair
  expectedCompensationAmount: MoneyPair
  receivedCompensationAmount: MoneyPair
  netLossAmount: MoneyPair

  createdByUserId: string
  createdByUserName: string
  createdAt: string
  updatedAt?: string
}

export type OrderExtraCost = {
  id: string
  orderId: string
  type: OrderExtraCostType
  title: string
  amount: MoneyPair
  responsibleParty: CostResponsibleParty
  comment?: string
  createdAt: string
}

export type OrderStatusHistoryItem = {
  id: string
  orderId: string
  fromStatus?: OrderStatus
  toStatus: OrderStatus
  changedByUserId: string
  changedByUserName: string
  comment?: string
  changedAt: string
}

export type OrderNote = {
  id: string
  orderId: string
  authorId: string
  authorName: string
  type: OrderNoteType
  text: string
  pinned: boolean
  createdAt: string
  updatedAt?: string
}

export type OrderDocument = {
  id: string
  orderId: string
  title: string
  type:
    | 'invoice'
    | 'contract'
    | 'act'
    | 'specification'
    | 'return_act'
    | 'other'
  url?: string
  createdAt: string
}

export type CurrencySnapshot = {
  rateId: string
  rubToUzsRate: number
  capturedAt: string
}

export type CRMOrder = {
  id: string
  orderNumber: string

  clientId: string
  clientName: string
  companyName?: string
  phone?: string
  email?: string
  city?: string

  dealId?: string
  conversationId?: string

  managerId: string
  managerName: string

  source: string
  channel: string
  websiteId?: string
  websiteDomain?: string
  botId?: string
  botName?: string

  status: OrderStatus
  paymentStatus: OrderPaymentStatus
  productionStatus: OrderProductionStatus
  deliveryStatus: OrderDeliveryStatus

  items: OrderItem[]

  subtotal: MoneyPair
  discountAmount: MoneyPair
  deliveryPrice: MoneyPair
  extraCostsAmount: MoneyPair
  returnAmount: MoneyPair
  lossAmount: MoneyPair
  total: MoneyPair
  paidAmount: MoneyPair
  remainingAmount: MoneyPair

  deliveryCity?: string
  deliveryAddress?: string
  deliveryComment?: string

  confirmedAt?: string
  invoiceSentAt?: string
  firstPaymentAt?: string
  fullyPaidAt?: string

  productionStartedAt?: string
  productionPlannedAt?: string
  productionCompletedAt?: string

  deliveryScheduledAt?: string
  deliveryStartedAt?: string
  deliveryCompletedAt?: string

  completedAt?: string
  cancelledAt?: string
  returnedAt?: string

  currencySnapshot: CurrencySnapshot

  payments: OrderPayment[]
  delayIncidents: OrderDelayIncident[]
  returnRequests: OrderReturnRequest[]
  extraCosts: OrderExtraCost[]
  statusHistory: OrderStatusHistoryItem[]
  notes: OrderNote[]
  documents: OrderDocument[]

  createdAt: string
  updatedAt: string
}

export type AddOrderPaymentPayload = {
  amount: MoneyPair
  method: OrderPayment['method']
  status?: OrderPayment['status']
  comment?: string
}

export type AddOrderDelayPayload = {
  type: OrderDelayType
  title: string
  description?: string
  responsibleParty: CostResponsibleParty
  lossAmount: MoneyPair
  startedAt?: string
}

export type AddOrderExtraCostPayload = {
  type: OrderExtraCostType
  title: string
  amount: MoneyPair
  responsibleParty: CostResponsibleParty
  comment?: string
}

export type CreateOrderReturnPayload = {
  reason: string
  resolution: OrderReturnResolution
  responsibleParty: CostResponsibleParty
  status?: OrderReturnStatus

  returnDeliveryCost?: Partial<ReturnLogisticsCost>
  replacementDeliveryCost?: Partial<ReturnLogisticsCost>

  expectedCompensationAmount?: MoneyPair
  receivedCompensationAmount?: MoneyPair

  items: Array<{
    orderItemId: string
    requestedQty: number
    approvedQty: number

    reason: OrderReturnReason
    condition: OrderReturnItem['condition']

    refundPercent: number
    writeOffPercent: number
    repairCostAmount?: MoneyPair

    shouldReplace: boolean
    replacementQty: number
    replacementProductId?: string
    replacementProductName?: string
    replacementCostPercent: number
  }>
}

export type AddOrderNotePayload = {
  type: OrderNoteType
  text: string
  pinned?: boolean
}

export type UpdateOrderPaymentPayload = AddOrderPaymentPayload

export type UpdateOrderDelayPayload = AddOrderDelayPayload

export type UpdateOrderExtraCostPayload = AddOrderExtraCostPayload

export type UpdateOrderNotePayload = AddOrderNotePayload

export type UpdateOrderReturnPayload = CreateOrderReturnPayload

export const initialOrderFilters: OrderFilters = {
  search: '',
  status: 'all',
  paymentStatus: 'all',
  productionStatus: 'all',
  deliveryStatus: 'all',
  managerId: 'all',
  channel: 'all',
  hasDebt: 'all',
  hasReturn: 'all',
  hasDelay: 'all',
  hasLoss: 'all'
}

export const orderStatuses: Array<{ value: OrderStatus; label: string }> = [
  { value: 'draft', label: 'Draft' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'invoice_sent', label: 'Invoice sent' },
  { value: 'waiting_payment', label: 'Waiting payment' },
  { value: 'partially_paid', label: 'Partially paid' },
  { value: 'paid', label: 'Paid' },
  { value: 'production_planned', label: 'Production planned' },
  { value: 'in_production', label: 'In production' },
  { value: 'production_completed', label: 'Production completed' },
  { value: 'ready_for_delivery', label: 'Ready for delivery' },
  { value: 'delivery_scheduled', label: 'Delivery scheduled' },
  { value: 'in_delivery', label: 'In delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'completed', label: 'Completed' },
  { value: 'production_delayed', label: 'Production delayed' },
  { value: 'delivery_delayed', label: 'Delivery delayed' },
  { value: 'return_requested', label: 'Return requested' },
  { value: 'partially_returned', label: 'Partially returned' },
  { value: 'returned', label: 'Returned' },
  { value: 'refunded', label: 'Refunded' },
  { value: 'cancelled', label: 'Cancelled' }
]
