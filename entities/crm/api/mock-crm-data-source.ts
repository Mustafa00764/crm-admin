import type {
  DashboardData,
  DashboardFilters
} from '@/features/dashboard/model/dashboard-types'
import { mockClientsDataSource } from './mock-clients-data-source'
import { mockConversationsDataSource } from './mock-conversations-data-source'
import { mockDealsDataSource } from './mock-deals-data-source'
import { mockOrdersDataSource } from './mock-orders-data-source'
import { mockProductsDataSource } from './mock-products-data-source'
import { mockAIAgentsDataSource } from './mock-ai-agents-data-source'

const dashboardData: DashboardData = {
  generatedAt: new Date().toISOString(),
  kpi: {
    revenue: { rub: 12840000, uzs: 1773920000 },
    paid: { rub: 9360000, uzs: 1293120000 },
    debt: { rub: 3480000, uzs: 480960000 },
    activeDeals: 47,
    activeOrders: 32,
    newLeads: 86,
    waitingManagerChats: 12,
    productionDelays: 5,
    deliveryDelays: 7,
    returns: 4,
    losses: { rub: 286000, uzs: 39538000 },
    overdueTasks: 9
  },
  salesChart: [
    {
      date: '01.05',
      revenue: { rub: 380000, uzs: 52540000 },
      paid: { rub: 250000, uzs: 34500000 },
      debt: { rub: 130000, uzs: 17940000 },
      losses: { rub: 12000, uzs: 1656000 }
    },
    {
      date: '05.05',
      revenue: { rub: 520000, uzs: 71760000 },
      paid: { rub: 410000, uzs: 56580000 },
      debt: { rub: 110000, uzs: 15180000 },
      losses: { rub: 7000, uzs: 966000 }
    },
    {
      date: '10.05',
      revenue: { rub: 820000, uzs: 113160000 },
      paid: { rub: 720000, uzs: 99360000 },
      debt: { rub: 100000, uzs: 13800000 },
      losses: { rub: 14000, uzs: 1932000 }
    },
    {
      date: '15.05',
      revenue: { rub: 920000, uzs: 126960000 },
      paid: { rub: 760000, uzs: 104880000 },
      debt: { rub: 160000, uzs: 22080000 },
      losses: { rub: 22000, uzs: 3036000 }
    },
    {
      date: '20.05',
      revenue: { rub: 1180000, uzs: 162840000 },
      paid: { rub: 900000, uzs: 124200000 },
      debt: { rub: 280000, uzs: 38640000 },
      losses: { rub: 27000, uzs: 3726000 }
    },
    {
      date: '25.05',
      revenue: { rub: 1260000, uzs: 173880000 },
      paid: { rub: 920000, uzs: 126960000 },
      debt: { rub: 340000, uzs: 46920000 },
      losses: { rub: 42000, uzs: 5796000 }
    }
  ],
  ordersChart: [
    {
      date: '01.05',
      newOrders: 8,
      paidOrders: 5,
      delayedOrders: 1,
      returnedOrders: 0
    },
    {
      date: '05.05',
      newOrders: 11,
      paidOrders: 7,
      delayedOrders: 2,
      returnedOrders: 1
    },
    {
      date: '10.05',
      newOrders: 15,
      paidOrders: 12,
      delayedOrders: 2,
      returnedOrders: 1
    },
    {
      date: '15.05',
      newOrders: 17,
      paidOrders: 14,
      delayedOrders: 1,
      returnedOrders: 1
    },
    {
      date: '20.05',
      newOrders: 21,
      paidOrders: 16,
      delayedOrders: 3,
      returnedOrders: 1
    },
    {
      date: '25.05',
      newOrders: 24,
      paidOrders: 17,
      delayedOrders: 4,
      returnedOrders: 1
    }
  ],
  leadsByChannel: [
    {
      channel: 'website_chat',
      label: 'Сайт / чат',
      leads: 34,
      orders: 13,
      conversionPercent: 38,
      revenue: { rub: 3210000, uzs: 443943000 }
    },
    {
      channel: 'telegram',
      label: 'Telegram',
      leads: 27,
      orders: 11,
      conversionPercent: 41,
      revenue: { rub: 2860000, uzs: 395380000 }
    },
    {
      channel: 'whatsapp',
      label: 'WhatsApp',
      leads: 18,
      orders: 7,
      conversionPercent: 39,
      revenue: { rub: 2040000, uzs: 282132000 }
    }
  ],
  revenueByWebsite: [
    {
      id: 'site_001',
      domain: 'sandwichpanelsvspb.ru',
      visits: 18420,
      leads: 312,
      orders: 74,
      revenue: { rub: 4860000, uzs: 672138000 },
      conversionPercent: 23.7,
      status: 'active'
    },
    {
      id: 'site_002',
      domain: 'profnastilvspb.ru',
      visits: 14680,
      leads: 264,
      orders: 61,
      revenue: { rub: 3920000, uzs: 542136000 },
      conversionPercent: 23.1,
      status: 'active'
    }
  ],
  revenueByBot: [
    {
      id: 'bot_001',
      name: 'Telegram Sales Bot',
      channel: 'telegram',
      incomingMessages: 1284,
      outgoingMessages: 1176,
      aiReplies: 842,
      manualReplies: 334,
      errors: 2,
      revenue: { rub: 3180000, uzs: 439794000 },
      status: 'active'
    },
    {
      id: 'bot_002',
      name: 'WhatsApp Lead Bot',
      channel: 'whatsapp',
      incomingMessages: 864,
      outgoingMessages: 792,
      aiReplies: 488,
      manualReplies: 304,
      errors: 5,
      revenue: { rub: 2140000, uzs: 295962000 },
      status: 'warning'
    }
  ],
  managerLeaderboard: [
    {
      id: 'u_001',
      fullName: 'Максим Орлов',
      role: 'Senior Sales',
      clients: 74,
      chats: 312,
      deals: 44,
      orders: 31,
      revenue: { rub: 4120000, uzs: 569796000 },
      paid: { rub: 3260000, uzs: 450858000 },
      debt: { rub: 860000, uzs: 118938000 },
      conversionPercent: 42,
      averageReplyTimeSec: 96
    },
    {
      id: 'u_002',
      fullName: 'Анна Смирнова',
      role: 'Sales Manager',
      clients: 62,
      chats: 245,
      deals: 35,
      orders: 26,
      revenue: { rub: 3460000, uzs: 478518000 },
      paid: { rub: 2410000, uzs: 333303000 },
      debt: { rub: 1050000, uzs: 145215000 },
      conversionPercent: 39,
      averageReplyTimeSec: 124
    }
  ],
  aiPerformance: [
    {
      id: 'ai_001',
      name: 'AI Sales Consultant',
      mode: 'hybrid',
      replies: 842,
      suggestions: 420,
      fallbackToManager: 68,
      averageConfidence: 86,
      ordersAfterAi: 41,
      revenueAfterAi: { rub: 4210000, uzs: 582243000 },
      status: 'active'
    },
    {
      id: 'ai_002',
      name: 'AI Calculator Assistant',
      mode: 'ai_suggest',
      replies: 416,
      suggestions: 388,
      fallbackToManager: 94,
      averageConfidence: 78,
      ordersAfterAi: 24,
      revenueAfterAi: { rub: 2260000, uzs: 312558000 },
      status: 'warning'
    }
  ],
  criticalEvents: [
    {
      id: 'ce_001',
      title: '12 чатов ждут менеджера',
      description:
        'AI передал диалоги из-за низкой уверенности или запроса расчёта.',
      entityType: 'conversation',
      severity: 'warning',
      createdAt: '2 минуты назад'
    },
    {
      id: 'ce_002',
      title: 'Задержка доставки ORD-1048',
      description: 'Транспорт задержан, возможен убыток по разгрузке.',
      entityType: 'order',
      severity: 'error',
      createdAt: '18 минут назад'
    }
  ],
  recentActivity: [
    {
      id: 'ra_001',
      actorName: 'Анна Смирнова',
      action: 'добавила оплату',
      description: 'ORD-1042 · 480 000 ₽ / 66 240 000 сум',
      createdAt: '5 минут назад'
    },
    {
      id: 'ra_002',
      actorName: 'AI Agent',
      action: 'передал чат менеджеру',
      description: 'Клиент интересуется стеновыми сэндвич-панелями PIR',
      createdAt: '12 минут назад'
    }
  ]
}

export const mockCrmDataSource = {
  async getDashboardData(filters: DashboardFilters): Promise<DashboardData> {
    console.log('dashboard filters', filters)

    await new Promise(resolve => setTimeout(resolve, 300))

    return dashboardData
  },

  ...mockConversationsDataSource,
  ...mockClientsDataSource,
  ...mockDealsDataSource,
  ...mockOrdersDataSource,
  ...mockProductsDataSource,
  ...mockAIAgentsDataSource
}
