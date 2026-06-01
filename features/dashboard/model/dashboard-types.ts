import type {
  ChannelType,
  CurrencyDisplayMode,
  MoneyPair,
} from "@/entities/crm/types"

export type DashboardDateRange =
  | "today"
  | "yesterday"
  | "7d"
  | "30d"
  | "month"
  | "quarter"
  | "year"

export type DashboardFilters = {
  dateRange: DashboardDateRange
  websiteId: string
  botId: string
  channel: ChannelType | "all"
  managerId: string
  productCategoryId: string
  orderStatus: string
  paymentStatus: string
  currencyDisplay: CurrencyDisplayMode
}

export type DashboardKpi = {
  revenue: MoneyPair
  paid: MoneyPair
  debt: MoneyPair
  activeDeals: number
  activeOrders: number
  newLeads: number
  waitingManagerChats: number
  productionDelays: number
  deliveryDelays: number
  returns: number
  losses: MoneyPair
  overdueTasks: number
}

export type DashboardSalesPoint = {
  date: string
  revenue: MoneyPair
  paid: MoneyPair
  debt: MoneyPair
  losses: MoneyPair
}

export type DashboardOrderPoint = {
  date: string
  newOrders: number
  paidOrders: number
  delayedOrders: number
  returnedOrders: number
}

export type DashboardChannelItem = {
  channel: ChannelType
  label: string
  leads: number
  orders: number
  conversionPercent: number
  revenue: MoneyPair
}

export type DashboardWebsiteItem = {
  id: string
  domain: string
  visits: number
  leads: number
  orders: number
  revenue: MoneyPair
  conversionPercent: number
  status: "active" | "warning" | "error"
}

export type DashboardBotItem = {
  id: string
  name: string
  channel: ChannelType
  incomingMessages: number
  outgoingMessages: number
  aiReplies: number
  manualReplies: number
  errors: number
  revenue: MoneyPair
  status: "active" | "warning" | "error"
}

export type DashboardManagerRow = {
  id: string
  fullName: string
  role: string
  clients: number
  chats: number
  deals: number
  orders: number
  revenue: MoneyPair
  paid: MoneyPair
  debt: MoneyPair
  conversionPercent: number
  averageReplyTimeSec: number
}

export type DashboardAiAgentItem = {
  id: string
  name: string
  mode: "manual" | "ai_suggest" | "ai_auto" | "hybrid"
  replies: number
  suggestions: number
  fallbackToManager: number
  averageConfidence: number
  ordersAfterAi: number
  revenueAfterAi: MoneyPair
  status: "active" | "warning" | "error"
}

export type DashboardCriticalEvent = {
  id: string
  title: string
  description: string
  entityType:
    | "conversation"
    | "order"
    | "task"
    | "bot"
    | "website"
    | "client"
    | "ai_agent"
  severity: "info" | "success" | "warning" | "error"
  createdAt: string
}

export type DashboardRecentActivity = {
  id: string
  actorName: string
  action: string
  description: string
  createdAt: string
}

export type DashboardData = {
  generatedAt: string
  kpi: DashboardKpi
  salesChart: DashboardSalesPoint[]
  ordersChart: DashboardOrderPoint[]
  leadsByChannel: DashboardChannelItem[]
  revenueByWebsite: DashboardWebsiteItem[]
  revenueByBot: DashboardBotItem[]
  managerLeaderboard: DashboardManagerRow[]
  aiPerformance: DashboardAiAgentItem[]
  criticalEvents: DashboardCriticalEvent[]
  recentActivity: DashboardRecentActivity[]
}