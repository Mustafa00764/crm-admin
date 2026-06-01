import {
  dealStages,
  type CRMDeal,
  type CreateDealPayload,
  type DealNote,
  type DealStage,
  type DealsFilters,
  type UpdateDealPayload
} from '@/features/deals/model/deals-types'

function uid(prefix: string) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}_${crypto.randomUUID()}`
  }

  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`
}

function createDealNumber() {
  return `D-${Math.floor(1000 + Math.random() * 9000)}`
}

const zeroMoney = { rub: 0, uzs: 0 }

const seedDeals: CRMDeal[] = [
  {
    id: 'deal_001',
    dealNumber: 'D-1001',
    clientId: 'client_001',
    clientName: 'Андрей Мельников',
    companyName: 'ООО СеверСтрой',
    phone: '+7 921 000-12-44',
    email: 'melnikov@example.ru',
    city: 'Гатчина',

    title: 'Стеновые PIR панели для склада',
    description:
      'Клиент запросил расчёт PIR-панелей 100 мм, доборных элементов и доставки в Гатчину.',

    stage: 'calculation',
    status: 'open',
    priority: 'high',
    sortOrder: 0,

    amount: { rub: 1251600, uzs: 172720800 },
    discountAmount: { rub: 25000, uzs: 3450000 },
    finalAmount: { rub: 1226600, uzs: 169270800 },
    expectedMargin: { rub: 184000, uzs: 25392000 },

    probability: 72,

    productInterest: 'Стеновые PIR панели 100 мм',
    objectType: 'склад',
    requiredVolume: 420,
    requiredUnit: 'm2',

    productLines: [
      {
        id: 'line_001',
        productId: 'prod_001',
        productName: 'Стеновая PIR панель 100 мм RAL 9003',
        categoryName: 'Сэндвич-панели',
        quantity: 420,
        unit: 'm2',
        price: { rub: 2980, uzs: 411240 },
        total: { rub: 1251600, uzs: 172720800 }
      }
    ],

    managerId: 'u_001',
    managerName: 'Максим Орлов',

    source: 'telegram_bot',
    channel: 'telegram',

    websiteId: 'site_001',
    websiteDomain: 'sandwichpanelsvspb.ru',
    botId: 'bot_001',
    botName: 'Telegram Sales Bot',

    relatedConversationId: 'conv_001',

    aiCreated: true,
    aiSummary:
      'AI определил запрос на расчёт стеновых PIR-панелей. Не хватает точного адреса и доборных элементов.',
    aiConfidence: 86,

    nextStep: 'Подготовить спецификацию и уточнить доборные элементы',
    nextContactAt: '2026-05-30 15:00',

    history: [
      {
        id: 'dh_001',
        type: 'created',
        title: 'Deal created from Telegram conversation',
        userId: 'u_001',
        userName: 'Максим Орлов',
        createdAt: '2026-05-30 04:20'
      },
      {
        id: 'dh_002',
        type: 'stage_changed',
        title: 'Moved to calculation',
        fromStage: 'qualification',
        toStage: 'calculation',
        userId: 'u_001',
        userName: 'Максим Орлов',
        createdAt: '2026-05-30 04:28'
      }
    ],
    notes: [
      {
        id: 'dn_001',
        type: 'important',
        text: 'Клиент ждёт расчёт сегодня. Нужно уточнить доборные элементы и адрес доставки.',
        authorId: 'u_001',
        authorName: 'Максим Орлов',
        pinned: true,
        createdAt: '2026-05-30 10:40'
      }
    ],
    createdAt: '2026-05-30 04:20',
    updatedAt: '2026-05-30 04:28'
  },
  {
    id: 'deal_002',
    dealNumber: 'D-1002',
    clientId: 'client_002',
    clientName: 'Елена Петрова',
    phone: '+7 911 222-33-44',
    city: 'Всеволожск',

    title: 'Профнастил НС35 для забора',
    description:
      'Клиент уточняет цену, толщину металла, цвет RAL и высоту листа.',

    stage: 'qualification',
    status: 'open',
    priority: 'normal',
    sortOrder: 1,

    amount: { rub: 260000, uzs: 35880000 },
    discountAmount: zeroMoney,
    finalAmount: { rub: 260000, uzs: 35880000 },

    probability: 35,

    productInterest: 'Профнастил НС35',
    objectType: 'забор',
    requiredVolume: 180,
    requiredUnit: 'm2',

    productLines: [],

    managerId: 'u_002',
    managerName: 'Анна Смирнова',

    source: 'whatsapp_bot',
    channel: 'whatsapp',

    botId: 'bot_002',
    botName: 'WhatsApp Lead Bot',

    relatedConversationId: 'conv_002',

    aiCreated: true,
    aiSummary:
      'AI собрал первичный запрос, но не хватает толщины металла, цвета RAL и высоты листа.',
    aiConfidence: 64,

    nextStep: 'Уточнить толщину металла, цвет и высоту листа',
    nextContactAt: '2026-05-30 17:00',

    history: [
      {
        id: 'dh_003',
        type: 'created',
        title: 'Deal created from WhatsApp bot',
        userId: 'u_002',
        userName: 'Анна Смирнова',
        createdAt: '2026-05-30 04:12'
      }
    ],
    notes: [
      {
        id: 'dn_001',
        type: 'important',
        text: 'Клиент ждёт расчёт сегодня. Нужно уточнить доборные элементы и адрес доставки.',
        authorId: 'u_001',
        authorName: 'Максим Орлов',
        pinned: true,
        createdAt: '2026-05-30 10:40'
      }
    ],
    createdAt: '2026-05-30 04:12',
    updatedAt: '2026-05-30 04:12'
  },
  {
    id: 'deal_003',
    dealNumber: 'D-1003',
    clientId: 'client_003',
    clientName: 'Игорь Савельев',
    companyName: 'ИП Савельев',
    phone: '+7 921 555-44-88',
    email: 'saveliev@example.ru',
    city: 'Санкт-Петербург',

    title: 'Профнастил НС35 0.5 RAL 6005',
    description:
      'Клиент получил расчёт, ожидает счёт и финальное подтверждение оплаты.',

    stage: 'proposal_sent',
    status: 'open',
    priority: 'high',
    sortOrder: 0,

    amount: { rub: 410000, uzs: 56580000 },
    discountAmount: { rub: 10000, uzs: 1380000 },
    finalAmount: { rub: 400000, uzs: 55200000 },
    expectedMargin: { rub: 62000, uzs: 8556000 },

    probability: 84,

    productInterest: 'Профнастил для забора',
    objectType: 'забор',
    requiredVolume: 240,
    requiredUnit: 'm2',

    productLines: [
      {
        id: 'line_002',
        productId: 'prod_010',
        productName: 'Профнастил НС35 0.5 RAL 6005',
        categoryName: 'Профнастил',
        quantity: 240,
        unit: 'm2',
        price: { rub: 1120, uzs: 154560 },
        total: { rub: 268800, uzs: 37094400 }
      }
    ],

    managerId: 'u_001',
    managerName: 'Максим Орлов',

    source: 'site_widget',
    channel: 'website_chat',

    websiteId: 'site_002',
    websiteDomain: 'profnastilvspb.ru',

    relatedConversationId: 'conv_003',
    relatedQuoteId: 'quote_003',

    nextStep: 'Отправить счёт и напомнить об оплате',
    nextContactAt: '2026-05-30 18:00',

    history: [
      {
        id: 'dh_004',
        type: 'created',
        title: 'Deal created from website chat',
        userId: 'u_001',
        userName: 'Максим Орлов',
        createdAt: '2026-05-28 13:20'
      },
      {
        id: 'dh_005',
        type: 'quote_sent',
        title: 'Quote sent',
        description: 'КП отправлено клиенту',
        userId: 'u_001',
        userName: 'Максим Орлов',
        createdAt: '2026-05-29 18:35'
      }
    ],
    notes: [],
    createdAt: '2026-05-28 13:20',
    updatedAt: '2026-05-29 18:35'
  },
  {
    id: 'deal_004',
    dealNumber: 'D-0918',
    clientId: 'client_003',
    clientName: 'Игорь Савельев',
    companyName: 'ИП Савельев',
    phone: '+7 921 555-44-88',
    city: 'Санкт-Петербург',

    title: 'Доборные элементы для кровли',
    stage: 'lost',
    status: 'lost',
    priority: 'low',
    sortOrder: 0,

    amount: { rub: 85000, uzs: 11730000 },
    discountAmount: zeroMoney,
    finalAmount: { rub: 85000, uzs: 11730000 },

    probability: 0,

    productInterest: 'Доборные элементы',
    productLines: [],

    managerId: 'u_003',
    managerName: 'Игорь Ким',

    source: 'phone',
    channel: 'phone',

    lostReason: 'Клиент выбрал другого поставщика из-за срока',

    history: [
      {
        id: 'dh_006',
        type: 'created',
        title: 'Deal created from phone call',
        userId: 'u_003',
        userName: 'Игорь Ким',
        createdAt: '2026-05-18 10:00'
      },
      {
        id: 'dh_007',
        type: 'lost',
        title: 'Deal lost',
        description: 'Клиент выбрал другого поставщика из-за срока',
        userId: 'u_003',
        userName: 'Игорь Ким',
        createdAt: '2026-05-19 12:30'
      }
    ],

    notes: [
      {
        id: 'dn_001',
        type: 'important',
        text: 'Клиент ждёт расчёт сегодня. Нужно уточнить доборные элементы и адрес доставки.',
        authorId: 'u_001',
        authorName: 'Максим Орлов',
        pinned: true,
        createdAt: '2026-05-30 10:40'
      },
      {
        id: 'dn_002',
        type: 'important',
        text: 'Клиент ждёт расчёт сегодня. Нужно уточнить доборные элементы и адрес доставки.',
        authorId: 'u_001',
        authorName: 'Максим',
        pinned: false,
        createdAt: '2026-05-30 10:40'
      }
    ],

    createdAt: '2026-05-18 10:00',
    updatedAt: '2026-05-19 12:30',
    closedAt: '2026-05-19 12:30'
  }
]

function getDealStatusByStage(stage: DealStage) {
  if (stage === 'won') return 'won'
  if (stage === 'lost') return 'lost'
  if (stage === 'cancelled') return 'cancelled'
  return 'open'
}

function applyDealsFilters(items: CRMDeal[], filters: DealsFilters) {
  return items.filter(deal => {
    const search = filters.search.trim().toLowerCase()

    const matchesSearch =
      !search ||
      deal.dealNumber.toLowerCase().includes(search) ||
      deal.title.toLowerCase().includes(search) ||
      deal.clientName.toLowerCase().includes(search) ||
      deal.companyName?.toLowerCase().includes(search) ||
      deal.phone?.toLowerCase().includes(search)

    const matchesStage = filters.stage === 'all' || deal.stage === filters.stage

    const matchesManager =
      filters.managerId === 'all' || deal.managerId === filters.managerId

    const matchesSource =
      filters.source === 'all' || deal.source === filters.source

    const matchesChannel =
      filters.channel === 'all' || deal.channel === filters.channel

    const matchesPriority =
      filters.priority === 'all' || deal.priority === filters.priority

    const amountFrom = Number(filters.amountFrom)
    const amountTo = Number(filters.amountTo)

    const matchesAmountFrom =
      !filters.amountFrom || deal.finalAmount.rub >= amountFrom

    const matchesAmountTo =
      !filters.amountTo || deal.finalAmount.rub <= amountTo

    const hasOrder = Boolean(deal.relatedOrderId)

    const matchesOrder =
      filters.hasOrder === 'all' ||
      (filters.hasOrder === 'yes' && hasOrder) ||
      (filters.hasOrder === 'no' && !hasOrder)

    return (
      matchesSearch &&
      matchesStage &&
      matchesManager &&
      matchesSource &&
      matchesChannel &&
      matchesPriority &&
      matchesAmountFrom &&
      matchesAmountTo &&
      matchesOrder
    )
  })
}

function getDealOrThrow(dealId: string) {
  const deal = deals.find(item => item.id === dealId)

  if (!deal) {
    throw new Error('Deal not found')
  }

  return deal
}

function replaceDeal(updatedDeal: CRMDeal) {
  deals = deals.map(deal => (deal.id === updatedDeal.id ? updatedDeal : deal))
  saveDealsToStorage(deals)

  return updatedDeal
}

const DEALS_STORAGE_KEY = 'crm.mock.deals'

function readDealsFromStorage(seedDeals: CRMDeal[]) {
  if (typeof window === 'undefined') {
    return seedDeals
  }

  try {
    const raw = window.localStorage.getItem(DEALS_STORAGE_KEY)

    if (!raw) {
      return seedDeals
    }

    const parsed = JSON.parse(raw) as CRMDeal[]

    if (!Array.isArray(parsed)) {
      return seedDeals
    }

    return parsed
  } catch {
    return seedDeals
  }
}

function saveDealsToStorage(nextDeals: CRMDeal[]) {
  if (typeof window === 'undefined') return

  window.localStorage.setItem(DEALS_STORAGE_KEY, JSON.stringify(nextDeals))
}

let deals: CRMDeal[] = readDealsFromStorage(seedDeals)

export const mockDealsDataSource = {
  async getDeals(filters: DealsFilters) {
    await new Promise(resolve => setTimeout(resolve, 160))
    return applyDealsFilters(deals, filters)
  },

  async getDealById(id: string) {
    await new Promise(resolve => setTimeout(resolve, 80))
    return deals.find(deal => deal.id === id) ?? null
  },

  async createDeal(payload: CreateDealPayload) {
    const deal: CRMDeal = {
      ...payload,
      id: uid('deal'),
      dealNumber: createDealNumber(),
      status: getDealStatusByStage(payload.stage),
      sortOrder: deals.filter(item => item.stage === payload.stage).length,
      history: [
        {
          id: uid('dh'),
          type: 'created',
          title: payload.aiCreated
            ? 'Deal created from AI data'
            : 'Deal created manually',
          userName: payload.managerName,
          userId: payload.managerId,
          createdAt: new Date().toLocaleString('ru-RU')
        }
      ],
      notes: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    deals = [deal, ...deals]
    saveDealsToStorage(deals)

    return deal
  },

  async updateDeal(dealId: string, payload: UpdateDealPayload) {
    const existing = deals.find(deal => deal.id === dealId)

    if (!existing) {
      throw new Error('Deal not found')
    }

    const updated: CRMDeal = {
      ...existing,
      ...payload,
      status: payload.stage
        ? getDealStatusByStage(payload.stage)
        : existing.status,
      updatedAt: new Date().toISOString()
    }

    deals = deals.map(deal => (deal.id === dealId ? updated : deal))
    saveDealsToStorage(deals)

    return updated
  },

  async updateDealStage(dealId: string, stage: DealStage) {
    const existing = deals.find(deal => deal.id === dealId)

    if (!existing) {
      throw new Error('Deal not found')
    }

    const updated: CRMDeal = {
      ...existing,
      stage,
      status: getDealStatusByStage(stage),
      probability:
        stage === 'won'
          ? 100
          : stage === 'lost' || stage === 'cancelled'
            ? 0
            : existing.probability,
      closedAt:
        stage === 'won' || stage === 'lost' || stage === 'cancelled'
          ? new Date().toISOString()
          : undefined,
      updatedAt: new Date().toISOString(),
      history: [
        {
          id: uid('dh'),
          type: 'stage_changed',
          title: `Moved from ${existing.stage} to ${stage}`,
          fromStage: existing.stage,
          toStage: stage,
          userId: existing.managerId,
          userName: existing.managerName,
          createdAt: new Date().toLocaleString('ru-RU')
        },
        ...existing.history
      ]
    }

    deals = deals.map(deal => (deal.id === dealId ? updated : deal))
    saveDealsToStorage(deals)

    return updated
  },

  async deleteDeal(dealId: string) {
    deals = deals.filter(deal => deal.id !== dealId)
    saveDealsToStorage(deals)
  },

  async createOrderFromDeal(dealId: string) {
    const existing = deals.find(deal => deal.id === dealId)

    if (!existing) {
      throw new Error('Deal not found')
    }

    const updated: CRMDeal = {
      ...existing,
      stage: 'won',
      status: 'won',
      probability: 100,
      relatedOrderId: existing.relatedOrderId ?? uid('order'),
      closedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      history: [
        {
          id: uid('dh'),
          type: 'order_created',
          title: 'Order created from deal',
          userId: existing.managerId,
          userName: existing.managerName,
          createdAt: new Date().toLocaleString('ru-RU')
        },
        ...existing.history
      ]
    }

    deals = deals.map(deal => (deal.id === dealId ? updated : deal))
    saveDealsToStorage(deals)

    return updated
  },

  async addDealNote(
    dealId: string,
    payload: {
      type: DealNote['type']
      text: string
      pinned?: boolean
    }
  ) {
    const deal = getDealOrThrow(dealId)

    const note: DealNote = {
      id: uid('dn'),
      type: payload.type,
      text: payload.text,
      pinned: payload.pinned ?? false,
      authorId: 'u_current',
      authorName: 'Manager',
      createdAt: new Date().toLocaleString('ru-RU')
    }

    return replaceDeal({
      ...deal,
      notes: [note, ...deal.notes],
      updatedAt: new Date().toISOString()
    })
  },

  async updateDealNote(
    dealId: string,
    noteId: string,
    payload: {
      type?: DealNote['type']
      text?: string
      pinned?: boolean
    }
  ) {
    const deal = getDealOrThrow(dealId)

    return replaceDeal({
      ...deal,
      notes: deal.notes.map(note =>
        note.id === noteId
          ? {
              ...note,
              ...payload,
              updatedAt: new Date().toISOString()
            }
          : note
      ),
      updatedAt: new Date().toISOString()
    })
  },

  async moveDeal(dealId: string, targetStage: DealStage, targetIndex: number) {
    const current = deals.find(deal => deal.id === dealId)

    if (!current) {
      throw new Error('Deal not found')
    }

    const movedDeal: CRMDeal = {
      ...current,
      stage: targetStage,
      status: getDealStatusByStage(targetStage),
      updatedAt: new Date().toISOString(),
      history:
        current.stage === targetStage
          ? current.history
          : [
              {
                id: uid('dh'),
                type: 'stage_changed',
                title: `Moved from ${current.stage} to ${targetStage}`,
                fromStage: current.stage,
                toStage: targetStage,
                userId: current.managerId,
                userName: current.managerName,
                createdAt: new Date().toLocaleString('ru-RU')
              },
              ...current.history
            ]
    }

    const withoutMoved = deals.filter(deal => deal.id !== dealId)

    const nextDeals: CRMDeal[] = []

    for (const stage of dealStages) {
      const stageDeals = withoutMoved
        .filter(deal => deal.stage === stage.value)
        .sort((a, b) => a.sortOrder - b.sortOrder)

      if (stage.value === targetStage) {
        stageDeals.splice(targetIndex, 0, movedDeal)
      }

      stageDeals.forEach((deal, index) => {
        nextDeals.push({
          ...deal,
          sortOrder: index
        })
      })
    }

    deals = nextDeals
    saveDealsToStorage(deals)

    return deals
  },

  async deleteDealNote(dealId: string, noteId: string) {
    const deal = getDealOrThrow(dealId)

    return replaceDeal({
      ...deal,
      notes: deal.notes.filter(note => note.id !== noteId),
      updatedAt: new Date().toISOString()
    })
  }
}
