import type {
  AddOrderDelayPayload,
  AddOrderExtraCostPayload,
  AddOrderNotePayload,
  AddOrderPaymentPayload,
  CRMOrder,
  CreateOrderReturnPayload,
  MoneyPair,
  OrderDelayIncident,
  OrderExtraCost,
  OrderFilters,
  OrderItem,
  OrderNote,
  OrderPayment,
  OrderPaymentStatus,
  OrderReturnItem,
  OrderReturnRequest,
  OrderReturnStatus,
  OrderStatus,
  OrderStatusHistoryItem,
  ReturnLogisticsCost,
  UpdateOrderDelayPayload,
  UpdateOrderExtraCostPayload,
  UpdateOrderNotePayload,
  UpdateOrderPaymentPayload,
  UpdateOrderReturnPayload
} from '@/features/orders/model/orders-types'
import { initialOrderFilters } from '@/features/orders/model/orders-types'

const ORDERS_STORAGE_KEY = 'crm.mock.orders'
const RUB_TO_UZS_RATE = 138
const RATE_ID = 'rate_2026_05_30'

function uid(prefix: string) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}_${crypto.randomUUID()}`
  }

  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`
}

function money(rub: number): MoneyPair {
  return {
    rub,
    uzs: Math.round(rub * RUB_TO_UZS_RATE),
    rateId: RATE_ID,
    convertedAt: '2026-05-30T00:00:00.000Z'
  }
}

function zeroMoney(): MoneyPair {
  return money(0)
}

function addMoney(...values: MoneyPair[]) {
  return values.reduce(
    (acc, item) => ({
      rub: acc.rub + item.rub,
      uzs: acc.uzs + item.uzs,
      rateId: item.rateId ?? acc.rateId,
      convertedAt: item.convertedAt ?? acc.convertedAt
    }),
    zeroMoney()
  )
}

function subMoney(left: MoneyPair, right: MoneyPair) {
  return {
    rub: left.rub - right.rub,
    uzs: left.uzs - right.uzs,
    rateId: left.rateId,
    convertedAt: left.convertedAt
  }
}

function maxMoney(value: MoneyPair, min = 0) {
  return {
    ...value,
    rub: Math.max(value.rub, min),
    uzs: Math.max(value.uzs, Math.round(min * RUB_TO_UZS_RATE))
  }
}

function multiplyMoney(value: MoneyPair, multiplier: number) {
  return {
    ...value,
    rub: Math.round(value.rub * multiplier),
    uzs: Math.round(value.uzs * multiplier)
  }
}

function sumMoney(values: MoneyPair[]) {
  return addMoney(...values)
}

function createCurrencySnapshot() {
  return {
    rateId: RATE_ID,
    rubToUzsRate: RUB_TO_UZS_RATE,
    capturedAt: '2026-05-30T00:00:00.000Z'
  }
}

function createItem(input: {
  id: string
  productId: string
  sku: string
  name: string
  categoryId: string
  categoryName: string
  qty: number
  returnedQty?: number
  unit: OrderItem['unit']
  priceRub: number
  discountPercent?: number
}) {
  const price = money(input.priceRub)
  const baseTotal = multiplyMoney(price, input.qty)
  const discountPercent = input.discountPercent ?? 0
  const discountAmount = multiplyMoney(baseTotal, discountPercent / 100)
  const finalTotal = subMoney(baseTotal, discountAmount)

  return {
    id: input.id,
    productId: input.productId,
    sku: input.sku,
    name: input.name,
    categoryId: input.categoryId,
    categoryName: input.categoryName,
    qty: input.qty,
    returnedQty: input.returnedQty ?? 0,
    unit: input.unit,
    price,
    baseTotal,
    discountPercent,
    discountAmount,
    finalTotal
  } satisfies OrderItem
}

function createDefaultLogisticsCost(
  payload?: Partial<ReturnLogisticsCost>
): ReturnLogisticsCost {
  return {
    required: payload?.required ?? false,
    payer: payload?.payer ?? 'company',
    paidByCompany: payload?.paidByCompany ?? false,
    amount: payload?.amount ?? zeroMoney(),
    carrierName: payload?.carrierName,
    trackingNumber: payload?.trackingNumber,
    expectedCompensationAmount:
      payload?.expectedCompensationAmount ?? zeroMoney(),
    receivedCompensationAmount:
      payload?.receivedCompensationAmount ?? zeroMoney(),
    comment: payload?.comment
  }
}

function getPaymentStatus(
  total: MoneyPair,
  paid: MoneyPair
): OrderPaymentStatus {
  if (paid.rub <= 0) return 'not_paid'
  if (paid.rub < total.rub) return 'partially_paid'
  if (paid.rub === total.rub) return 'paid'
  return 'overpaid'
}

function getOrderOrThrow(orderId: string) {
  const order = orders.find(item => item.id === orderId)

  if (!order) {
    throw new Error('Order not found')
  }

  return order
}

function getCompanyLogisticsLoss(cost: ReturnLogisticsCost) {
  if (!cost.required) return zeroMoney()
  if (!cost.paidByCompany && cost.payer !== 'company') return zeroMoney()

  return cost.amount
}

function getReturnRequestLoss(request: OrderReturnRequest) {
  return request.netLossAmount
}

function recalculateOrder(order: CRMOrder): CRMOrder {
  const subtotal = sumMoney(order.items.map(item => item.finalTotal))
  const discountAmount = sumMoney(order.items.map(item => item.discountAmount))
  const confirmedPayments = order.payments.filter(
    payment => payment.status === 'confirmed'
  )
  const paidAmount = sumMoney(confirmedPayments.map(payment => payment.amount))
  const returnAmount = sumMoney(
    order.returnRequests.map(request => request.refundAmount)
  )
  const extraCostsAmount = sumMoney(order.extraCosts.map(cost => cost.amount))
  const returnLossAmount = sumMoney(
    order.returnRequests.map(request => getReturnRequestLoss(request))
  )
  const delayLossAmount = sumMoney(
    order.delayIncidents.map(incident => incident.lossAmount)
  )
  const companyExtraCostsAmount = sumMoney(
    order.extraCosts
      .filter(cost => cost.responsibleParty === 'company')
      .map(cost => cost.amount)
  )

  const total = addMoney(subtotal, order.deliveryPrice)
  const netTotal = maxMoney(subMoney(total, returnAmount))
  const remainingAmount = maxMoney(subMoney(netTotal, paidAmount))
  const lossAmount = addMoney(
    returnLossAmount,
    delayLossAmount,
    companyExtraCostsAmount
  )

  const totalQty = order.items.reduce((sum, item) => sum + item.qty, 0)
  const returnedQty = order.items.reduce(
    (sum, item) => sum + item.returnedQty,
    0
  )

  let status = order.status

  if (returnedQty > 0 && returnedQty < totalQty && status !== 'refunded') {
    status = 'partially_returned'
  }

  if (returnedQty >= totalQty && totalQty > 0 && status !== 'refunded') {
    status = 'returned'
  }

  return {
    ...order,
    status,
    subtotal,
    discountAmount,
    extraCostsAmount,
    returnAmount,
    paidAmount,
    remainingAmount,
    lossAmount,
    total,
    paymentStatus: getPaymentStatus(netTotal, paidAmount),
    updatedAt: new Date().toISOString()
  }
}

function replaceOrder(updatedOrder: CRMOrder) {
  const recalculated = recalculateOrder(updatedOrder)

  orders = orders.map(order =>
    order.id === recalculated.id ? recalculated : order
  )

  saveOrdersToStorage(orders)

  return recalculated
}

function readOrdersFromStorage(seedOrders: CRMOrder[]) {
  if (typeof window === 'undefined') {
    return seedOrders
  }

  try {
    const raw = window.localStorage.getItem(ORDERS_STORAGE_KEY)

    if (!raw) {
      return seedOrders
    }

    const parsed = JSON.parse(raw) as CRMOrder[]

    if (!Array.isArray(parsed)) {
      return seedOrders
    }

    return parsed
  } catch {
    return seedOrders
  }
}

function saveOrdersToStorage(nextOrders: CRMOrder[]) {
  if (typeof window === 'undefined') return

  window.localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(nextOrders))
}

function createHistoryItem(
  orderId: string,
  fromStatus: OrderStatus | undefined,
  toStatus: OrderStatus,
  comment?: string
): OrderStatusHistoryItem {
  return {
    id: uid('osh'),
    orderId,
    fromStatus,
    toStatus,
    changedByUserId: 'u_current',
    changedByUserName: 'Manager',
    comment,
    changedAt: new Date().toLocaleString('ru-RU')
  }
}

function applyOrderFilters(items: CRMOrder[], filters: OrderFilters) {
  return items.filter(order => {
    const search = filters.search.trim().toLowerCase()

    const matchesSearch =
      !search ||
      [
        order.orderNumber,
        order.clientName,
        order.companyName,
        order.phone,
        order.email,
        order.city,
        order.managerName
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(search)

    const matchesStatus =
      filters.status === 'all' || order.status === filters.status

    const matchesPayment =
      filters.paymentStatus === 'all' ||
      order.paymentStatus === filters.paymentStatus

    const matchesProduction =
      filters.productionStatus === 'all' ||
      order.productionStatus === filters.productionStatus

    const matchesDelivery =
      filters.deliveryStatus === 'all' ||
      order.deliveryStatus === filters.deliveryStatus

    const matchesManager =
      filters.managerId === 'all' || order.managerId === filters.managerId

    const matchesChannel =
      filters.channel === 'all' || order.channel === filters.channel

    const hasDebt = order.remainingAmount.rub > 0
    const hasReturn = order.returnRequests.length > 0
    const hasDelay = order.delayIncidents.length > 0
    const hasLoss = order.lossAmount.rub > 0

    const matchesDebt =
      filters.hasDebt === 'all' ||
      (filters.hasDebt === 'yes' && hasDebt) ||
      (filters.hasDebt === 'no' && !hasDebt)

    const matchesReturn =
      filters.hasReturn === 'all' ||
      (filters.hasReturn === 'yes' && hasReturn) ||
      (filters.hasReturn === 'no' && !hasReturn)

    const matchesDelay =
      filters.hasDelay === 'all' ||
      (filters.hasDelay === 'yes' && hasDelay) ||
      (filters.hasDelay === 'no' && !hasDelay)

    const matchesLoss =
      filters.hasLoss === 'all' ||
      (filters.hasLoss === 'yes' && hasLoss) ||
      (filters.hasLoss === 'no' && !hasLoss)

    return (
      matchesSearch &&
      matchesStatus &&
      matchesPayment &&
      matchesProduction &&
      matchesDelivery &&
      matchesManager &&
      matchesChannel &&
      matchesDebt &&
      matchesReturn &&
      matchesDelay &&
      matchesLoss
    )
  })
}

const seedOrders: CRMOrder[] = [
  recalculateOrder({
    id: 'order_001',
    orderNumber: 'O-1001',
    clientId: 'client_001',
    clientName: 'Андрей Мельников',
    companyName: 'ООО СеверСтрой',
    phone: '+7 921 000-12-44',
    email: 'melnikov@example.ru',
    city: 'Гатчина',
    dealId: 'deal_001',
    conversationId: 'conv_001',
    managerId: 'u_001',
    managerName: 'Максим Орлов',
    source: 'telegram_bot',
    channel: 'telegram',
    websiteId: 'site_001',
    websiteDomain: 'sandwichpanelsvspb.ru',
    botId: 'bot_001',
    botName: 'Telegram Sales Bot',
    status: 'partially_paid',
    paymentStatus: 'partially_paid',
    productionStatus: 'planned',
    deliveryStatus: 'not_scheduled',
    items: [
      createItem({
        id: 'order_item_001',
        productId: 'prod_001',
        sku: 'PIR-100-RAL9003',
        name: 'Стеновая PIR панель 100 мм RAL 9003',
        categoryId: 'cat_panels',
        categoryName: 'Сэндвич-панели',
        qty: 420,
        unit: 'm2',
        priceRub: 2980
      }),
      createItem({
        id: 'order_item_002',
        productId: 'prod_002',
        sku: 'DOBOR-PLAN-9003',
        name: 'Доборные элементы RAL 9003',
        categoryId: 'cat_accessories',
        categoryName: 'Доборные элементы',
        qty: 38,
        unit: 'pcs',
        priceRub: 850
      })
    ],
    subtotal: zeroMoney(),
    discountAmount: zeroMoney(),
    deliveryPrice: money(18000),
    extraCostsAmount: zeroMoney(),
    returnAmount: zeroMoney(),
    lossAmount: zeroMoney(),
    total: zeroMoney(),
    paidAmount: zeroMoney(),
    remainingAmount: zeroMoney(),
    deliveryCity: 'Гатчина',
    deliveryAddress: 'Ленинградская область, Гатчина',
    deliveryComment: 'Разгрузка силами заказчика',
    confirmedAt: '2026-05-30 11:20',
    invoiceSentAt: '2026-05-30 12:10',
    productionPlannedAt: '2026-05-31 09:00',
    currencySnapshot: createCurrencySnapshot(),
    payments: [
      {
        id: 'payment_001',
        orderId: 'order_001',
        amount: money(500000),
        method: 'bank_transfer',
        status: 'confirmed',
        comment: 'Аванс по счёту',
        paidAt: '2026-05-30 13:40',
        createdAt: '2026-05-30 13:40'
      }
    ],
    delayIncidents: [],
    returnRequests: [],
    extraCosts: [],
    statusHistory: [
      createHistoryItem(
        'order_001',
        undefined,
        'confirmed',
        'Created from deal'
      )
    ],
    notes: [
      {
        id: 'order_note_001',
        orderId: 'order_001',
        authorId: 'u_001',
        authorName: 'Максим Орлов',
        type: 'payment',
        text: 'Клиент оплатил аванс, остаток после финального подтверждения спецификации.',
        pinned: true,
        createdAt: '2026-05-30 13:45'
      }
    ],
    documents: [
      {
        id: 'doc_001',
        orderId: 'order_001',
        title: 'Счёт O-1001',
        type: 'invoice',
        createdAt: '2026-05-30 12:10'
      }
    ],
    createdAt: '2026-05-30 11:20',
    updatedAt: '2026-05-30 13:45'
  }),
  recalculateOrder({
    id: 'order_002',
    orderNumber: 'O-1002',
    clientId: 'client_003',
    clientName: 'Игорь Савельев',
    companyName: 'ИП Савельев',
    phone: '+7 921 555-44-88',
    email: 'saveliev@example.ru',
    city: 'Санкт-Петербург',
    dealId: 'deal_003',
    conversationId: 'conv_003',
    managerId: 'u_001',
    managerName: 'Максим Орлов',
    source: 'site_widget',
    channel: 'website_chat',
    websiteId: 'site_002',
    websiteDomain: 'profnastilvspb.ru',
    status: 'delivery_delayed',
    paymentStatus: 'paid',
    productionStatus: 'completed',
    deliveryStatus: 'delayed',
    items: [
      createItem({
        id: 'order_item_003',
        productId: 'prod_010',
        sku: 'NS35-05-RAL6005',
        name: 'Профнастил НС35 0.5 RAL 6005',
        categoryId: 'cat_profnastil',
        categoryName: 'Профнастил',
        qty: 240,
        unit: 'm2',
        priceRub: 1120
      })
    ],
    subtotal: zeroMoney(),
    discountAmount: zeroMoney(),
    deliveryPrice: money(12000),
    extraCostsAmount: zeroMoney(),
    returnAmount: zeroMoney(),
    lossAmount: zeroMoney(),
    total: zeroMoney(),
    paidAmount: zeroMoney(),
    remainingAmount: zeroMoney(),
    deliveryCity: 'Санкт-Петербург',
    deliveryAddress: 'СПб, Колпинский район',
    confirmedAt: '2026-05-28 15:30',
    invoiceSentAt: '2026-05-28 16:10',
    firstPaymentAt: '2026-05-29 10:00',
    fullyPaidAt: '2026-05-29 10:00',
    productionStartedAt: '2026-05-29 12:00',
    productionCompletedAt: '2026-05-30 14:00',
    deliveryScheduledAt: '2026-05-30 18:00',
    currencySnapshot: createCurrencySnapshot(),
    payments: [
      {
        id: 'payment_002',
        orderId: 'order_002',
        amount: money(280800),
        method: 'bank_transfer',
        status: 'confirmed',
        paidAt: '2026-05-29 10:00',
        createdAt: '2026-05-29 10:00'
      }
    ],
    delayIncidents: [
      {
        id: 'delay_001',
        orderId: 'order_002',
        type: 'delivery',
        title: 'Задержка транспорта',
        description:
          'Машина задержалась на предыдущей разгрузке, доставка перенесена на следующий слот.',
        responsibleParty: 'carrier',
        lossAmount: money(4500),
        startedAt: '2026-05-30 18:00',
        createdAt: '2026-05-30 18:20'
      }
    ],
    returnRequests: [],
    extraCosts: [],
    statusHistory: [
      createHistoryItem('order_002', undefined, 'confirmed'),
      createHistoryItem('order_002', 'in_delivery', 'delivery_delayed')
    ],
    notes: [],
    documents: [],
    createdAt: '2026-05-28 15:30',
    updatedAt: '2026-05-30 18:20'
  }),
  recalculateOrder({
    id: 'order_003',
    orderNumber: 'O-1003',
    clientId: 'client_004',
    clientName: 'Сергей Иванов',
    companyName: 'ООО МонтажПроф',
    phone: '+7 911 770-45-11',
    city: 'Всеволожск',
    managerId: 'u_002',
    managerName: 'Анна Смирнова',
    source: 'whatsapp_bot',
    channel: 'whatsapp',
    status: 'partially_returned',
    paymentStatus: 'paid',
    productionStatus: 'completed',
    deliveryStatus: 'delivered',
    items: [
      createItem({
        id: 'order_item_004',
        productId: 'prod_020',
        sku: 'PIR-80-RAL7024',
        name: 'Стеновая PIR панель 80 мм RAL 7024',
        categoryId: 'cat_panels',
        categoryName: 'Сэндвич-панели',
        qty: 160,
        returnedQty: 12,
        unit: 'm2',
        priceRub: 2740
      })
    ],
    subtotal: zeroMoney(),
    discountAmount: zeroMoney(),
    deliveryPrice: money(15000),
    extraCostsAmount: zeroMoney(),
    returnAmount: zeroMoney(),
    lossAmount: zeroMoney(),
    total: zeroMoney(),
    paidAmount: zeroMoney(),
    remainingAmount: zeroMoney(),
    deliveryCity: 'Всеволожск',
    deliveryAddress: 'Ленинградская область, Всеволожск',
    confirmedAt: '2026-05-20 10:00',
    fullyPaidAt: '2026-05-21 10:30',
    productionCompletedAt: '2026-05-24 16:00',
    deliveryCompletedAt: '2026-05-25 14:00',
    currencySnapshot: createCurrencySnapshot(),
    payments: [
      {
        id: 'payment_003',
        orderId: 'order_003',
        amount: money(453400),
        method: 'bank_transfer',
        status: 'confirmed',
        paidAt: '2026-05-21 10:30',
        createdAt: '2026-05-21 10:30'
      }
    ],
    delayIncidents: [],
    returnRequests: [
      {
        id: 'return_001',
        orderId: 'order_003',
        status: 'replacement_sent',
        reason: 'Часть панелей пришла с дефектом покрытия',
        resolution: 'replacement',
        responsibleParty: 'supplier',
        items: [
          {
            id: 'return_item_001',
            orderItemId: 'order_item_004',
            productId: 'prod_020',
            sku: 'PIR-80-RAL7024',
            name: 'Стеновая PIR панель 80 мм RAL 7024',
            requestedQty: 12,
            approvedQty: 12,
            unit: 'm2',
            unitPrice: money(2740),
            refundAmount: zeroMoney(),
            reason: 'defect',
            condition: 'defective',
            shouldReplace: true,
            replacementQty: 12,
            replacementProductId: 'prod_020',
            replacementProductName: 'Стеновая PIR панель 80 мм RAL 7024',
            writeOffAmount: money(19728),
            repairCostAmount: zeroMoney(),
            replacementCostAmount: money(23016),
            lossAmount: money(42744)
          }
        ],
        requestedAmount: money(32880),
        refundAmount: zeroMoney(),
        returnDeliveryCost: {
          required: true,
          payer: 'company',
          paidByCompany: true,
          amount: money(4000),
          carrierName: 'Локальная доставка',
          expectedCompensationAmount: zeroMoney(),
          receivedCompensationAmount: zeroMoney()
        },
        replacementDeliveryCost: {
          required: true,
          payer: 'company',
          paidByCompany: true,
          amount: money(5000),
          carrierName: 'Локальная доставка',
          expectedCompensationAmount: zeroMoney(),
          receivedCompensationAmount: zeroMoney()
        },
        replacementShipmentId: 'ship_replace_001',
        companyLossAmount: money(51744),
        expectedCompensationAmount: money(20000),
        receivedCompensationAmount: zeroMoney(),
        netLossAmount: money(51744),
        createdByUserId: 'u_002',
        createdByUserName: 'Анна Смирнова',
        createdAt: '2026-05-26 11:00'
      }
    ],
    extraCosts: [],
    statusHistory: [
      createHistoryItem('order_003', undefined, 'confirmed'),
      createHistoryItem('order_003', 'completed', 'partially_returned')
    ],
    notes: [
      {
        id: 'order_note_002',
        orderId: 'order_003',
        authorId: 'u_002',
        authorName: 'Анна Смирнова',
        type: 'return',
        text: 'Замена отправлена за счёт компании. Ожидаем компенсацию от поставщика.',
        pinned: true,
        createdAt: '2026-05-26 11:10'
      }
    ],
    documents: [
      {
        id: 'doc_002',
        orderId: 'order_003',
        title: 'Акт возврата по браку',
        type: 'return_act',
        createdAt: '2026-05-26 11:05'
      }
    ],
    createdAt: '2026-05-20 10:00',
    updatedAt: '2026-05-26 11:10'
  })
]

let orders: CRMOrder[] = readOrdersFromStorage(seedOrders)

export const mockOrdersDataSource = {
  async getOrders(filters: OrderFilters = initialOrderFilters) {
    await new Promise(resolve => setTimeout(resolve, 160))

    return applyOrderFilters(orders, filters)
  },

  async getOrderById(orderId: string) {
    await new Promise(resolve => setTimeout(resolve, 80))

    return orders.find(order => order.id === orderId) ?? null
  },

  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    comment?: string
  ) {
    const order = getOrderOrThrow(orderId)

    return replaceOrder({
      ...order,
      status,
      statusHistory: [
        createHistoryItem(order.id, order.status, status, comment),
        ...order.statusHistory
      ],
      updatedAt: new Date().toISOString()
    })
  },

  async addOrderPayment(orderId: string, payload: AddOrderPaymentPayload) {
    const order = getOrderOrThrow(orderId)

    const status = payload.status ?? 'confirmed'
    const now = new Date().toLocaleString('ru-RU')

    const payment: OrderPayment = {
      id: uid('payment'),
      orderId,
      amount: payload.amount,
      method: payload.method,
      status,
      comment: payload.comment,
      paidAt: status === 'confirmed' ? now : '',
      createdAt: new Date().toISOString()
    }

    return replaceOrder({
      ...order,
      payments: [payment, ...order.payments],
      firstPaymentAt:
        order.firstPaymentAt ??
        (payment.status === 'confirmed' ? payment.paidAt : undefined),
      updatedAt: new Date().toISOString()
    })
  },

  async addOrderDelay(orderId: string, payload: AddOrderDelayPayload) {
    const order = getOrderOrThrow(orderId)

    const delay: OrderDelayIncident = {
      id: uid('delay'),
      orderId,
      type: payload.type,
      title: payload.title,
      description: payload.description,
      responsibleParty: payload.responsibleParty,
      lossAmount: payload.lossAmount,
      startedAt: payload.startedAt ?? new Date().toLocaleString('ru-RU'),
      createdAt: new Date().toISOString()
    }

    const nextStatus: OrderStatus =
      payload.type === 'production'
        ? 'production_delayed'
        : payload.type === 'delivery'
          ? 'delivery_delayed'
          : order.status

    return replaceOrder({
      ...order,
      status: nextStatus,
      productionStatus:
        payload.type === 'production' ? 'delayed' : order.productionStatus,
      deliveryStatus:
        payload.type === 'delivery' ? 'delayed' : order.deliveryStatus,
      delayIncidents: [delay, ...order.delayIncidents],
      statusHistory:
        nextStatus !== order.status
          ? [
              createHistoryItem(
                order.id,
                order.status,
                nextStatus,
                delay.title
              ),
              ...order.statusHistory
            ]
          : order.statusHistory,
      updatedAt: new Date().toISOString()
    })
  },

  async addOrderExtraCost(orderId: string, payload: AddOrderExtraCostPayload) {
    const order = getOrderOrThrow(orderId)

    const extraCost: OrderExtraCost = {
      id: uid('extra_cost'),
      orderId,
      type: payload.type,
      title: payload.title,
      amount: payload.amount,
      responsibleParty: payload.responsibleParty,
      comment: payload.comment,
      createdAt: new Date().toISOString()
    }

    return replaceOrder({
      ...order,
      extraCosts: [extraCost, ...order.extraCosts],
      updatedAt: new Date().toISOString()
    })
  },

  async createOrderReturn(orderId: string, payload: CreateOrderReturnPayload) {
    const order = getOrderOrThrow(orderId)

    const isRejected = payload.resolution === 'reject'

    const returnStatus: OrderReturnStatus = isRejected
      ? 'rejected'
      : (payload.status ?? 'approved')

    const returnItems: OrderReturnItem[] = payload.items.map(itemPayload => {
      const orderItem = order.items.find(
        item => item.id === itemPayload.orderItemId
      )

      if (!orderItem) {
        throw new Error('Order item not found')
      }

      const availableQty = orderItem.qty - orderItem.returnedQty
      const approvedQty = isRejected ? 0 : itemPayload.approvedQty

      if (!isRejected && approvedQty > availableQty) {
        throw new Error(
          `Cannot return ${approvedQty}. Available qty is ${availableQty}`
        )
      }

      const refundAmount = isRejected
        ? zeroMoney()
        : multiplyMoney(
            multiplyMoney(orderItem.price, approvedQty),
            itemPayload.refundPercent / 100
          )

      const writeOffAmount = isRejected
        ? zeroMoney()
        : multiplyMoney(
            multiplyMoney(orderItem.price, approvedQty),
            itemPayload.writeOffPercent / 100
          )

      const repairCostAmount = isRejected
        ? zeroMoney()
        : (itemPayload.repairCostAmount ?? zeroMoney())

      const replacementCostAmount =
        !isRejected && itemPayload.shouldReplace
          ? multiplyMoney(
              multiplyMoney(orderItem.price, itemPayload.replacementQty),
              itemPayload.replacementCostPercent / 100
            )
          : zeroMoney()

      const lossAmount = isRejected
        ? zeroMoney()
        : addMoney(
            refundAmount,
            writeOffAmount,
            repairCostAmount,
            replacementCostAmount
          )

      return {
        id: uid('return_item'),
        orderItemId: orderItem.id,
        productId: orderItem.productId,
        sku: orderItem.sku,
        name: orderItem.name,
        requestedQty: itemPayload.requestedQty,
        approvedQty,
        unit: orderItem.unit,
        unitPrice: orderItem.price,
        refundAmount,
        reason: itemPayload.reason,
        condition: itemPayload.condition,
        shouldReplace: isRejected ? false : itemPayload.shouldReplace,
        replacementQty: isRejected ? 0 : itemPayload.replacementQty,
        replacementProductId: isRejected
          ? undefined
          : itemPayload.replacementProductId,
        replacementProductName: isRejected
          ? undefined
          : itemPayload.replacementProductName,
        writeOffAmount,
        repairCostAmount,
        replacementCostAmount,
        lossAmount
      }
    })

    const requestedAmount = sumMoney(
      returnItems.map(item => multiplyMoney(item.unitPrice, item.requestedQty))
    )

    const refundAmount = isRejected
      ? zeroMoney()
      : sumMoney(returnItems.map(item => item.refundAmount))

    const itemsLossAmount = isRejected
      ? zeroMoney()
      : sumMoney(returnItems.map(item => item.lossAmount))

    const returnDeliveryCost = isRejected
      ? createDefaultLogisticsCost()
      : createDefaultLogisticsCost(payload.returnDeliveryCost)

    const replacementDeliveryCost = isRejected
      ? createDefaultLogisticsCost()
      : createDefaultLogisticsCost(payload.replacementDeliveryCost)

    const logisticsLossAmount = isRejected
      ? zeroMoney()
      : addMoney(
          getCompanyLogisticsLoss(returnDeliveryCost),
          getCompanyLogisticsLoss(replacementDeliveryCost)
        )

    const companyLossAmount = isRejected
      ? zeroMoney()
      : addMoney(itemsLossAmount, logisticsLossAmount)

    const expectedCompensationAmount = isRejected
      ? zeroMoney()
      : (payload.expectedCompensationAmount ?? zeroMoney())

    const receivedCompensationAmount = isRejected
      ? zeroMoney()
      : (payload.receivedCompensationAmount ?? zeroMoney())

    const netLossAmount = isRejected
      ? zeroMoney()
      : maxMoney(subMoney(companyLossAmount, receivedCompensationAmount))

    const shouldCreateReplacementShipment =
      !isRejected &&
      (payload.resolution === 'replacement' ||
        payload.resolution === 'partial_replacement' ||
        payload.resolution === 'refund_and_replacement')

    const returnRequest: OrderReturnRequest = {
      id: uid('return'),
      orderId,
      status: returnStatus,
      reason: payload.reason,
      resolution: payload.resolution,
      responsibleParty: payload.responsibleParty,
      items: returnItems,
      requestedAmount,
      refundAmount,
      returnDeliveryCost,
      replacementDeliveryCost,
      replacementShipmentId: shouldCreateReplacementShipment
        ? uid('replacement_ship')
        : undefined,
      companyLossAmount,
      expectedCompensationAmount,
      receivedCompensationAmount,
      netLossAmount,
      createdByUserId: 'u_current',
      createdByUserName: 'Manager',
      createdAt: new Date().toLocaleString('ru-RU')
    }

    const updatedItems = isRejected
      ? order.items
      : order.items.map(orderItem => {
          const returned = returnItems
            .filter(returnItem => returnItem.orderItemId === orderItem.id)
            .reduce((sum, returnItem) => sum + returnItem.approvedQty, 0)

          if (returned <= 0) {
            return orderItem
          }

          return {
            ...orderItem,
            returnedQty: orderItem.returnedQty + returned
          }
        })

    const nextStatus: OrderStatus = isRejected
      ? order.status
      : 'partially_returned'

    const nextDeliveryStatus =
      !isRejected &&
      (returnDeliveryCost.required || replacementDeliveryCost.required)
        ? 'returned'
        : order.deliveryStatus

    return replaceOrder({
      ...order,
      status: nextStatus,
      deliveryStatus: nextDeliveryStatus,
      items: updatedItems,
      returnRequests: [returnRequest, ...order.returnRequests],
      statusHistory:
        nextStatus !== order.status
          ? [
              createHistoryItem(
                order.id,
                order.status,
                nextStatus,
                payload.reason
              ),
              ...order.statusHistory
            ]
          : order.statusHistory,
      updatedAt: new Date().toISOString()
    })
  },

  async addOrderNote(orderId: string, payload: AddOrderNotePayload) {
    const order = getOrderOrThrow(orderId)

    const note: OrderNote = {
      id: uid('order_note'),
      orderId,
      authorId: 'u_current',
      authorName: 'Manager',
      type: payload.type,
      text: payload.text,
      pinned: payload.pinned ?? false,
      createdAt: new Date().toLocaleString('ru-RU')
    }

    return replaceOrder({
      ...order,
      notes: [note, ...order.notes],
      updatedAt: new Date().toISOString()
    })
  },

  async deleteOrder(orderId: string) {
    orders = orders.filter(order => order.id !== orderId)
    saveOrdersToStorage(orders)
  },

  resetOrdersStorage() {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(ORDERS_STORAGE_KEY)
    }

    orders = seedOrders
    saveOrdersToStorage(orders)

    return orders
  },

  async updateOrderPayment(
    orderId: string,
    paymentId: string,
    payload: UpdateOrderPaymentPayload
  ) {
    const order = getOrderOrThrow(orderId)

    const exists = order.payments.some(payment => payment.id === paymentId)

    if (!exists) {
      throw new Error('Payment not found')
    }

    return replaceOrder({
      ...order,
      payments: order.payments.map(payment =>
        payment.id === paymentId
          ? {
              ...payment,
              amount: payload.amount,
              method: payload.method,
              comment: payload.comment
            }
          : payment
      ),
      updatedAt: new Date().toISOString()
    })
  },

  async updateOrderPaymentStatus(
    orderId: string,
    paymentId: string,
    status: OrderPayment['status']
  ) {
    const order = getOrderOrThrow(orderId)

    const exists = order.payments.some(payment => payment.id === paymentId)

    if (!exists) {
      throw new Error('Payment not found')
    }

    return replaceOrder({
      ...order,
      payments: order.payments.map(payment =>
        payment.id === paymentId
          ? {
              ...payment,
              status,
              paidAt:
                status === 'confirmed'
                  ? (payment.paidAt ?? new Date().toLocaleString('ru-RU'))
                  : payment.paidAt
            }
          : payment
      ),
      updatedAt: new Date().toISOString()
    })
  },

  async updateOrderDelay(
    orderId: string,
    delayId: string,
    payload: UpdateOrderDelayPayload
  ) {
    const order = getOrderOrThrow(orderId)

    const exists = order.delayIncidents.some(delay => delay.id === delayId)

    if (!exists) {
      throw new Error('Delay incident not found')
    }

    return replaceOrder({
      ...order,
      delayIncidents: order.delayIncidents.map(delay =>
        delay.id === delayId
          ? {
              ...delay,
              type: payload.type,
              title: payload.title,
              description: payload.description,
              responsibleParty: payload.responsibleParty,
              lossAmount: payload.lossAmount
            }
          : delay
      ),
      updatedAt: new Date().toISOString()
    })
  },

  async updateOrderExtraCost(
    orderId: string,
    extraCostId: string,
    payload: UpdateOrderExtraCostPayload
  ) {
    const order = getOrderOrThrow(orderId)

    const exists = order.extraCosts.some(cost => cost.id === extraCostId)

    if (!exists) {
      throw new Error('Extra cost not found')
    }

    return replaceOrder({
      ...order,
      extraCosts: order.extraCosts.map(cost =>
        cost.id === extraCostId
          ? {
              ...cost,
              type: payload.type,
              title: payload.title,
              amount: payload.amount,
              responsibleParty: payload.responsibleParty,
              comment: payload.comment
            }
          : cost
      ),
      updatedAt: new Date().toISOString()
    })
  },

  async updateOrderNote(
    orderId: string,
    noteId: string,
    payload: UpdateOrderNotePayload
  ) {
    const order = getOrderOrThrow(orderId)

    const exists = order.notes.some(note => note.id === noteId)

    if (!exists) {
      throw new Error('Order note not found')
    }

    return replaceOrder({
      ...order,
      notes: order.notes.map(note =>
        note.id === noteId
          ? {
              ...note,
              type: payload.type,
              text: payload.text,
              pinned: payload.pinned ?? note.pinned ?? false,
              updatedAt: new Date().toISOString()
            }
          : note
      ),
      updatedAt: new Date().toISOString()
    })
  },

  async deleteOrderReturn(orderId: string, returnId: string) {
    const order = getOrderOrThrow(orderId)

    const returnRequest = order.returnRequests.find(
      item => item.id === returnId
    )

    if (!returnRequest) {
      throw new Error('Return request not found')
    }

    const updatedItems = order.items.map(orderItem => {
      const returnedQtyToRemove = returnRequest.items
        .filter(returnItem => returnItem.orderItemId === orderItem.id)
        .reduce((sum, returnItem) => sum + returnItem.approvedQty, 0)

      if (returnedQtyToRemove <= 0) {
        return orderItem
      }

      return {
        ...orderItem,
        returnedQty: Math.max(0, orderItem.returnedQty - returnedQtyToRemove)
      }
    })

    const updatedReturnRequests = order.returnRequests.filter(
      item => item.id !== returnId
    )

    const returnedQtyAfterDelete = updatedItems.reduce(
      (sum, item) => sum + item.returnedQty,
      0
    )

    const nextStatus: OrderStatus =
      returnedQtyAfterDelete > 0
        ? 'partially_returned'
        : order.deliveryStatus === 'delivered'
          ? 'delivered'
          : order.productionStatus === 'completed'
            ? 'production_completed'
            : order.status === 'partially_returned' ||
                order.status === 'returned'
              ? 'completed'
              : order.status

    return replaceOrder({
      ...order,
      items: updatedItems,
      returnRequests: updatedReturnRequests,
      status: nextStatus,
      statusHistory: [
        createHistoryItem(
          order.id,
          order.status,
          nextStatus,
          'Return / claim deleted'
        ),
        ...order.statusHistory
      ],
      updatedAt: new Date().toISOString()
    })
  },

  async deleteOrderDelay(orderId: string, delayId: string) {
    const order = getOrderOrThrow(orderId)

    const delay = order.delayIncidents.find(item => item.id === delayId)

    if (!delay) {
      throw new Error('Delay incident not found')
    }

    const updatedDelayIncidents = order.delayIncidents.filter(
      item => item.id !== delayId
    )

    const hasProductionDelay = updatedDelayIncidents.some(
      item => item.type === 'production'
    )

    const hasDeliveryDelay = updatedDelayIncidents.some(
      item => item.type === 'delivery'
    )

    const nextProductionStatus =
      delay.type === 'production' && !hasProductionDelay
        ? order.productionStatus === 'delayed'
          ? 'in_progress'
          : order.productionStatus
        : order.productionStatus

    const nextDeliveryStatus =
      delay.type === 'delivery' && !hasDeliveryDelay
        ? order.deliveryStatus === 'delayed'
          ? 'scheduled'
          : order.deliveryStatus
        : order.deliveryStatus

    const nextStatus: OrderStatus =
      order.status === 'production_delayed' && !hasProductionDelay
        ? 'in_production'
        : order.status === 'delivery_delayed' && !hasDeliveryDelay
          ? 'delivery_scheduled'
          : order.status

    return replaceOrder({
      ...order,
      delayIncidents: updatedDelayIncidents,
      productionStatus: nextProductionStatus,
      deliveryStatus: nextDeliveryStatus,
      status: nextStatus,
      statusHistory: [
        createHistoryItem(
          order.id,
          order.status,
          nextStatus,
          'Delay incident deleted'
        ),
        ...order.statusHistory
      ],
      updatedAt: new Date().toISOString()
    })
  },

  async updateOrderReturn(
    orderId: string,
    returnId: string,
    payload: UpdateOrderReturnPayload
  ) {
    const order = getOrderOrThrow(orderId)
    const snapshot = JSON.parse(JSON.stringify(order)) as CRMOrder

    try {
      await mockOrdersDataSource.deleteOrderReturn(orderId, returnId)

      return await mockOrdersDataSource.createOrderReturn(orderId, payload)
    } catch (error) {
      replaceOrder(snapshot)

      throw error
    }
  },

  async deleteOrderExtraCost(orderId: string, extraCostId: string) {
    const order = getOrderOrThrow(orderId)

    const exists = order.extraCosts.some(item => item.id === extraCostId)

    if (!exists) {
      throw new Error('Extra cost not found')
    }

    return replaceOrder({
      ...order,
      extraCosts: order.extraCosts.filter(item => item.id !== extraCostId),
      updatedAt: new Date().toISOString()
    })
  },

  async deleteOrderPayment(orderId: string, paymentId: string) {
    const order = getOrderOrThrow(orderId)

    const exists = order.payments.some(payment => payment.id === paymentId)

    if (!exists) {
      throw new Error('Payment not found')
    }

    return replaceOrder({
      ...order,
      payments: order.payments.filter(payment => payment.id !== paymentId),
      updatedAt: new Date().toISOString()
    })
  },

  async deleteOrderNote(orderId: string, noteId: string) {
    const order = getOrderOrThrow(orderId)

    const exists = order.notes.some(note => note.id === noteId)

    if (!exists) {
      throw new Error('Order note not found')
    }

    return replaceOrder({
      ...order,
      notes: order.notes.filter(note => note.id !== noteId),
      updatedAt: new Date().toISOString()
    })
  }
}
