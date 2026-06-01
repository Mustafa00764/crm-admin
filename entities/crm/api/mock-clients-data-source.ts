import type {
  CRMClient,
  ClientsFilters
} from '@/features/clients/model/clients-types'

function uid(prefix: string) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}_${crypto.randomUUID()}`
  }

  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`
}

const emptyMoney = { rub: 0, uzs: 0 }

const initialClients: CRMClient[] = [
  {
    id: 'client_001',
    fullName: 'Андрей Мельников',
    companyName: 'ООО СеверСтрой',
    phone: '+7 921 000-12-44',
    email: 'melnikov@example.ru',
    telegramUsername: '@melnikov_build',
    whatsappPhone: '+7 921 000-12-44',
    city: 'Гатчина',
    region: 'Ленинградская область',
    deliveryAddress: 'Гатчина, Индустриальная зона, 4',
    source: 'telegram_bot',
    channel: 'telegram',
    websiteId: 'site_001',
    websiteDomain: 'sandwichpanelsvspb.ru',
    botId: 'bot_001',
    botName: 'Telegram Sales Bot',
    firstPageUrl: '/sendvich-paneli/stenovye',
    lastPageUrl: '/sendvich-paneli/pir',
    utmSource: 'telegram',
    utmMedium: 'bot',
    utmCampaign: 'pir-panels',
    status: 'calculation',
    assignedSellerId: 'u_001',
    assignedSellerName: 'Максим Орлов',
    productInterest: 'Стеновые PIR панели',
    objectType: 'склад',
    requiredVolume: 420,
    requiredUnit: 'm2',
    budget: { rub: 1250000, uzs: 172500000 },
    aiSummary:
      'Клиенту нужен расчёт стеновых PIR-панелей 100 мм на склад. Доставка в Гатчину, интересует быстрый срок.',
    aiLeadScore: 86,
    aiDetectedIntent: 'calculation_request',
    aiMissingFields: ['точный адрес', 'доборные элементы', 'тип замка'],
    managerHistory: [
      {
        id: 'mh_001',
        managerId: 'u_001',
        managerName: 'Максим Орлов',
        role: 'owner',
        reason: 'manual_reassign',
        startedAt: '2026-05-30 10:20',
        isCurrent: true,
        comment: 'Текущий ответственный по расчёту'
      },
      {
        id: 'mh_002',
        managerId: 'u_002',
        managerName: 'Анна Смирнова',
        role: 'seller',
        reason: 'conversation_takeover',
        startedAt: '2026-05-24 14:10',
        endedAt: '2026-05-30 10:20',
        isCurrent: false,
        comment: 'Первичная консультация в WhatsApp'
      },
      {
        id: 'mh_003',
        managerId: 'u_003',
        managerName: 'Игорь Ким',
        role: 'logistics',
        reason: 'order_support',
        startedAt: '2026-05-25 09:40',
        endedAt: '2026-05-25 18:00',
        isCurrent: false,
        comment: 'Уточнял доставку'
      }
    ],
    deals: [
      {
        id: 'deal_001',
        dealNumber: 'D-1001',
        title: 'Стеновые PIR панели для склада',
        description:
          'Клиент запросил расчёт PIR-панелей 100 мм, доборных элементов и доставки в Гатчину.',
        status: 'calculation',
        priority: 'high',
        amount: { rub: 1251600, uzs: 172720800 },
        probability: 72,
        productInterest: 'Стеновые PIR панели 100 мм',
        objectType: 'склад',
        requiredVolume: 420,
        requiredUnit: 'm2',
        managerId: 'u_001',
        managerName: 'Максим Орлов',
        source: 'telegram_bot',
        channel: 'telegram',
        relatedConversationId: 'conv_001',
        nextStep: 'Подготовить спецификацию и уточнить доборные элементы',
        nextContactAt: '2026-05-30 15:00',
        createdAt: '2026-05-30 04:20',
        updatedAt: '2026-05-30 04:28'
      },
      {
        id: 'deal_001_old',
        dealNumber: 'D-0844',
        title: 'Профнастил для временного ограждения',
        status: 'won',
        priority: 'normal',
        amount: { rub: 380000, uzs: 52440000 },
        probability: 100,
        productInterest: 'Профнастил С8',
        requiredVolume: 300,
        requiredUnit: 'm2',
        managerId: 'u_002',
        managerName: 'Анна Смирнова',
        source: 'website_chat',
        channel: 'website_chat',
        relatedOrderId: 'order_0844',
        createdAt: '2026-05-12 11:40',
        updatedAt: '2026-05-14 16:10',
        closedAt: '2026-05-14 16:10'
      }
    ],
    orderedProducts: [
      {
        id: 'op_001',
        productId: 'prod_001',
        productName: 'Стеновая PIR панель 100 мм RAL 9003',
        categoryName: 'Сэндвич-панели',
        quantity: 420,
        unit: 'm2',
        price: { rub: 2980, uzs: 411240 },
        total: { rub: 1251600, uzs: 172720800 },
        lastOrderedAt: '2026-05-26'
      }
    ],
    statistics: {
      totalConversations: 6,
      openConversations: 1,
      totalDeals: 4,
      activeDeals: 1,
      wonDeals: 2,
      lostDeals: 1,
      totalOrders: 4,
      completedOrders: 3,
      cancelledOrders: 0,
      returnedOrders: 1,
      totalRevenue: { rub: 3840000, uzs: 529920000 },
      totalPaid: { rub: 2910000, uzs: 401580000 },
      totalDebt: { rub: 930000, uzs: 128340000 },
      averageOrderValue: { rub: 960000, uzs: 132480000 },
      salesConversionRate: 67
    },
    notes: [
      {
        id: 'note_001',
        type: 'important',
        authorName: 'Максим Орлов',
        text: 'Повторный клиент. Просит быстро подготовить расчёт и спецификацию.',
        pinned: true,
        createdAt: '2026-05-30 04:15'
      }
    ],
    activitySessions: [
      {
        id: 'sess_001',
        clientId: 'client_001',
        visitorId: 'visitor_001',
        sessionId: 'web_001',
        websiteId: 'site_001',
        websiteDomain: 'sandwichpanelsvspb.ru',
        channel: 'website',
        source: 'organic',
        firstPageUrl: '/sendvich-paneli/stenovye',
        lastPageUrl: '/sendvich-paneli/pir',
        referrer: 'yandex.ru',
        utmSource: 'yandex',
        utmMedium: 'organic',
        utmCampaign: 'none',
        deviceType: 'desktop',
        browser: 'Chrome',
        os: 'macOS',
        ip: '178.000.000.10',
        location: 'Гатчина',
        startedAt: '2026-05-30 03:58',
        lastActivityAt: '2026-05-30 04:21',
        durationSec: 740,
        pageViews: 8,
        productViews: 4,
        categoryViews: 3,
        formSubmits: 0,
        chatOpens: 1,
        chatMessages: 3,
        phoneClicks: 0,
        telegramClicks: 1,
        whatsappClicks: 0,
        quoteRequests: 1,
        calculatorUses: 1,
        viewedProductIds: ['prod_001'],
        viewedCategoryIds: ['cat_panels'],
        relatedConversationId: 'conv_001',
        relatedDealId: 'deal_001',
        status: 'converted_to_lead'
      }
    ],
    createdAt: '2026-05-12',
    updatedAt: '2026-05-30',
    lastContactAt: '2026-05-30 04:28'
  },
  {
    id: 'client_002',
    fullName: 'Елена Петрова',
    phone: '+7 911 222-33-44',
    whatsappPhone: '+7 911 222-33-44',
    city: 'Всеволожск',
    region: 'Ленинградская область',
    source: 'whatsapp_bot',
    channel: 'whatsapp',
    botId: 'bot_002',
    botName: 'WhatsApp Lead Bot',
    utmSource: 'whatsapp',
    utmMedium: 'bot',
    status: 'ai_active',
    assignedSellerId: 'u_002',
    assignedSellerName: 'Анна Смирнова',
    productInterest: 'Профнастил НС35',
    requiredVolume: 180,
    requiredUnit: 'm2',
    aiSummary:
      'Запрос цены на профнастил НС35 для забора. Не хватает толщины, цвета и высоты листа.',
    aiLeadScore: 64,
    aiDetectedIntent: 'price_request',
    aiMissingFields: ['толщина металла', 'цвет RAL', 'высота листа'],
    managerHistory: [
      {
        id: 'mh_001',
        managerId: 'u_001',
        managerName: 'Максим Орлов',
        role: 'owner',
        reason: 'manual_reassign',
        startedAt: '2026-05-30 10:20',
        isCurrent: true,
        comment: 'Текущий ответственный по расчёту'
      },
      {
        id: 'mh_002',
        managerId: 'u_002',
        managerName: 'Анна Смирнова',
        role: 'seller',
        reason: 'conversation_takeover',
        startedAt: '2026-05-24 14:10',
        endedAt: '2026-05-30 10:20',
        isCurrent: false,
        comment: 'Первичная консультация в WhatsApp'
      }
    ],
    deals: [
      {
        id: 'deal_002',
        dealNumber: 'D-1002',
        title: 'Профнастил НС35 для забора',
        description:
          'Клиент уточняет цену, толщину металла, цвет RAL и высоту листа.',
        status: 'qualification',
        priority: 'normal',
        amount: { rub: 260000, uzs: 35880000 },
        probability: 35,
        productInterest: 'Профнастил НС35',
        objectType: 'забор',
        requiredVolume: 180,
        requiredUnit: 'm2',
        managerId: 'u_002',
        managerName: 'Анна Смирнова',
        source: 'whatsapp_bot',
        channel: 'whatsapp',
        relatedConversationId: 'conv_002',
        nextStep: 'Уточнить толщину металла, цвет и высоту листа',
        nextContactAt: '2026-05-30 17:00',
        createdAt: '2026-05-30 04:12',
        updatedAt: '2026-05-30 04:12'
      }
    ],
    orderedProducts: [],
    statistics: {
      totalConversations: 1,
      openConversations: 1,
      totalDeals: 0,
      activeDeals: 0,
      wonDeals: 0,
      lostDeals: 0,
      totalOrders: 0,
      completedOrders: 0,
      cancelledOrders: 0,
      returnedOrders: 0,
      totalRevenue: emptyMoney,
      totalPaid: emptyMoney,
      totalDebt: emptyMoney,
      averageOrderValue: emptyMoney,
      salesConversionRate: 0
    },
    notes: [],
    activitySessions: [],
    createdAt: '2026-05-30',
    updatedAt: '2026-05-30',
    lastContactAt: '2026-05-30 04:12'
  },
  {
    id: 'client_003',
    fullName: 'Игорь Савельев',
    companyName: 'ИП Савельев',
    phone: '+7 921 555-44-88',
    email: 'saveliev@example.ru',
    city: 'Санкт-Петербург',
    region: 'СПб',
    source: 'site_widget',
    channel: 'website_chat',
    websiteId: 'site_002',
    websiteDomain: 'profnastilvspb.ru',
    firstPageUrl: '/profnastil/ns35',
    lastPageUrl: '/profnastil/s8',
    utmSource: 'yandex',
    utmMedium: 'cpc',
    utmCampaign: 'zabor-prof',
    status: 'waiting_payment',
    assignedSellerId: 'u_001',
    assignedSellerName: 'Максим Орлов',
    productInterest: 'Профнастил для забора',
    objectType: 'забор',
    requiredVolume: 240,
    requiredUnit: 'm2',
    budget: { rub: 410000, uzs: 56580000 },
    aiSummary: 'Клиент получил расчёт, ожидает счёт и оплату.',
    aiLeadScore: 79,
    aiDetectedIntent: 'order_ready',
    aiMissingFields: [],
    managerHistory: [
      {
        id: 'mh_002',
        managerId: 'u_002',
        managerName: 'Анна Смирнова',
        role: 'seller',
        reason: 'conversation_takeover',
        startedAt: '2026-05-24 14:10',
        endedAt: '2026-05-30 10:20',
        isCurrent: true,
        comment: 'Первичная консультация в WhatsApp'
      },
      {
        id: 'mh_003',
        managerId: 'u_003',
        managerName: 'Игорь Ким',
        role: 'logistics',
        reason: 'order_support',
        startedAt: '2026-05-25 09:40',
        endedAt: '2026-05-25 18:00',
        isCurrent: false,
        comment: 'Уточнял доставку'
      }
    ],
    deals: [
      {
        id: 'deal_003',
        dealNumber: 'D-1003',
        title: 'Профнастил НС35 0.5 RAL 6005',
        description:
          'Сделка почти перешла в заказ. Клиент получил расчёт и ожидает счёт.',
        status: 'won',
        priority: 'high',
        amount: { rub: 410000, uzs: 56580000 },
        probability: 100,
        productInterest: 'Профнастил для забора',
        objectType: 'забор',
        requiredVolume: 240,
        requiredUnit: 'm2',
        managerId: 'u_001',
        managerName: 'Максим Орлов',
        source: 'site_widget',
        channel: 'website_chat',
        relatedConversationId: 'conv_003',
        relatedOrderId: 'order_1452',
        createdAt: '2026-05-28 13:20',
        updatedAt: '2026-05-29 18:35',
        closedAt: '2026-05-29 18:35'
      },
      {
        id: 'deal_003_lost',
        dealNumber: 'D-0918',
        title: 'Доборные элементы для кровли',
        status: 'lost',
        priority: 'low',
        amount: { rub: 85000, uzs: 11730000 },
        probability: 0,
        productInterest: 'Доборные элементы',
        managerId: 'u_003',
        managerName: 'Игорь Ким',
        source: 'phone',
        channel: 'phone',
        lostReason: 'Клиент выбрал другого поставщика из-за срока',
        createdAt: '2026-05-18 10:00',
        updatedAt: '2026-05-19 12:30',
        closedAt: '2026-05-19 12:30'
      }
    ],
    orderedProducts: [
      {
        id: 'op_002',
        productId: 'prod_010',
        productName: 'Профнастил НС35 0.5 RAL 6005',
        categoryName: 'Профнастил',
        quantity: 240,
        unit: 'm2',
        price: { rub: 1120, uzs: 154560 },
        total: { rub: 268800, uzs: 37094400 },
        lastOrderedAt: '2026-05-28'
      }
    ],
    statistics: {
      totalConversations: 3,
      openConversations: 1,
      totalDeals: 2,
      activeDeals: 1,
      wonDeals: 1,
      lostDeals: 0,
      totalOrders: 1,
      completedOrders: 0,
      cancelledOrders: 0,
      returnedOrders: 0,
      totalRevenue: { rub: 410000, uzs: 56580000 },
      totalPaid: { rub: 120000, uzs: 16560000 },
      totalDebt: { rub: 290000, uzs: 40020000 },
      averageOrderValue: { rub: 410000, uzs: 56580000 },
      salesConversionRate: 50
    },
    notes: [
      {
        id: 'note_002',
        type: 'payment',
        authorName: 'Максим Орлов',
        text: 'Нужно напомнить об оплате счёта до конца дня.',
        pinned: false,
        createdAt: '2026-05-29 18:10'
      }
    ],
    activitySessions: [
      {
        id: 'sess_003',
        clientId: 'client_003',
        visitorId: 'visitor_003',
        sessionId: 'web_003',
        websiteId: 'site_002',
        websiteDomain: 'profnastilvspb.ru',
        channel: 'website',
        source: 'cpc',
        firstPageUrl: '/profnastil/ns35',
        lastPageUrl: '/profnastil/s8',
        utmSource: 'yandex',
        utmMedium: 'cpc',
        utmCampaign: 'zabor-prof',
        deviceType: 'mobile',
        browser: 'Chrome',
        os: 'Android',
        startedAt: '2026-05-29 17:30',
        lastActivityAt: '2026-05-29 17:48',
        durationSec: 1080,
        pageViews: 5,
        productViews: 3,
        categoryViews: 2,
        formSubmits: 1,
        chatOpens: 1,
        chatMessages: 2,
        phoneClicks: 1,
        telegramClicks: 0,
        whatsappClicks: 1,
        quoteRequests: 1,
        calculatorUses: 0,
        viewedProductIds: ['prod_010'],
        viewedCategoryIds: ['cat_profnastil'],
        relatedConversationId: 'conv_003',
        status: 'converted_to_client'
      }
    ],
    createdAt: '2026-05-28',
    updatedAt: '2026-05-30',
    lastContactAt: '2026-05-29 18:35'
  }
]

let clients = [...initialClients]

function applyClientFilters(items: CRMClient[], filters: ClientsFilters) {
  return items.filter(client => {
    const search = filters.search.trim().toLowerCase()

    const matchesSearch =
      !search ||
      client.fullName.toLowerCase().includes(search) ||
      client.companyName?.toLowerCase().includes(search) ||
      client.phone?.toLowerCase().includes(search) ||
      client.email?.toLowerCase().includes(search) ||
      client.telegramUsername?.toLowerCase().includes(search)

    const matchesStatus =
      filters.status === 'all' || client.status === filters.status

    const matchesManager =
      filters.managerId === 'all' ||
      client.assignedSellerId === filters.managerId

    const matchesChannel =
      filters.channel === 'all' || client.channel === filters.channel

    const matchesWebsite =
      filters.websiteId === 'all' || client.websiteId === filters.websiteId

    const matchesBot = filters.botId === 'all' || client.botId === filters.botId

    const matchesUtm =
      filters.utmSource === 'all' || client.utmSource === filters.utmSource

    const matchesCity =
      filters.city === 'all' || client.city?.toLowerCase() === filters.city

    const hasDebt = client.statistics.totalDebt.rub > 0
    const hasReturns = client.statistics.returnedOrders > 0
    const hasSessions = client.activitySessions.length > 0

    const matchesDebt =
      filters.hasDebt === 'all' ||
      (filters.hasDebt === 'yes' && hasDebt) ||
      (filters.hasDebt === 'no' && !hasDebt)

    const matchesReturn =
      filters.hasReturn === 'all' ||
      (filters.hasReturn === 'yes' && hasReturns) ||
      (filters.hasReturn === 'no' && !hasReturns)

    const matchesActivity =
      filters.hasActivitySessions === 'all' ||
      (filters.hasActivitySessions === 'yes' && hasSessions) ||
      (filters.hasActivitySessions === 'no' && !hasSessions)

    return (
      matchesSearch &&
      matchesStatus &&
      matchesManager &&
      matchesChannel &&
      matchesWebsite &&
      matchesBot &&
      matchesUtm &&
      matchesCity &&
      matchesDebt &&
      matchesReturn &&
      matchesActivity
    )
  })
}

export const mockClientsDataSource = {
  async getClients(filters: ClientsFilters) {
    await new Promise(resolve => setTimeout(resolve, 180))
    return applyClientFilters(clients, filters)
  },

  async getClientById(id: string) {
    await new Promise(resolve => setTimeout(resolve, 100))
    return clients.find(client => client.id === id) ?? null
  },

  async createClient(
    payload: Omit<
      CRMClient,
      | 'id'
      | 'orderedProducts'
      | 'statistics'
      | 'notes'
      | 'activitySessions'
      | 'createdAt'
      | 'updatedAt'
    >
  ) {
    const client: CRMClient = {
      ...payload,
      id: uid('client'),
      orderedProducts: [],
      deals: [],
      statistics: {
        totalConversations: 0,
        openConversations: 0,
        totalDeals: 0,
        activeDeals: 0,
        wonDeals: 0,
        lostDeals: 0,
        totalOrders: 0,
        completedOrders: 0,
        cancelledOrders: 0,
        returnedOrders: 0,
        totalRevenue: emptyMoney,
        totalPaid: emptyMoney,
        totalDebt: emptyMoney,
        averageOrderValue: emptyMoney,
        salesConversionRate: 0
      },
      notes: [],
      activitySessions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    clients = [client, ...clients]
    return client
  },

  async updateClient(clientId: string, payload: Partial<CRMClient>) {
    const existing = clients.find(client => client.id === clientId)

    if (!existing) {
      throw new Error('Client not found')
    }

    const updated: CRMClient = {
      ...existing,
      ...payload,
      updatedAt: new Date().toISOString()
    }

    clients = clients.map(client => (client.id === clientId ? updated : client))

    return updated
  },

  async deleteClient(clientId: string) {
    clients = clients.filter(client => client.id !== clientId)
  }
}
