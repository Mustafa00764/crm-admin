import type { ChannelType, MoneyPair } from '@/entities/crm/types'

export type UnitType = 'm2' | 'pcs' | 'lm' | 'kg' | 'ton' | 'set'

export type ClientStatus =
  | 'new'
  | 'ai_active'
  | 'manager_active'
  | 'qualified'
  | 'calculation'
  | 'deal_created'
  | 'order_created'
  | 'waiting_payment'
  | 'customer'
  | 'repeat_customer'
  | 'lost'
  | 'spam'
  | 'archived'

export type ActivitySessionChannel =
  | 'website'
  | 'telegram'
  | 'whatsapp'
  | 'email'
  | 'phone'
  | 'manual'
  | 'custom'

export type ClientsViewMode = 'table' | 'cards'

export type ClientsFilters = {
  search: string
  status: ClientStatus | 'all'
  managerId: string
  channel: ChannelType | 'all'
  websiteId: string
  botId: string
  utmSource: string
  city: string
  hasDebt: 'all' | 'yes' | 'no'
  hasReturn: 'all' | 'yes' | 'no'
  hasActivitySessions: 'all' | 'yes' | 'no'
}

export type ClientOrderedProduct = {
  id: string
  productId: string
  productName: string
  categoryName: string
  quantity: number
  unit: UnitType
  price: MoneyPair
  total: MoneyPair
  lastOrderedAt: string
}

export type ClientStatistics = {
  totalConversations: number
  openConversations: number
  totalDeals: number
  activeDeals: number
  wonDeals: number
  lostDeals: number
  totalOrders: number
  completedOrders: number
  cancelledOrders: number
  returnedOrders: number
  totalRevenue: MoneyPair
  totalPaid: MoneyPair
  totalDebt: MoneyPair
  averageOrderValue: MoneyPair
  salesConversionRate: number
}

export type ClientNote = {
  id: string
  type:
    | 'general'
    | 'important'
    | 'payment'
    | 'delivery'
    | 'return'
    | 'order'
    | 'manager_private'
  authorName: string
  text: string
  pinned: boolean
  createdAt: string
  updatedAt?: string
}

export type ClientManagerHistoryItem = {
  id: string
  managerId: string
  managerName: string
  role: 'owner' | 'seller' | 'support' | 'logistics' | 'accountant'
  reason:
    | 'created'
    | 'manual_reassign'
    | 'auto_reassign'
    | 'conversation_takeover'
    | 'deal_transfer'
    | 'order_support'
  startedAt: string
  endedAt?: string
  isCurrent: boolean
  comment?: string
}

export type ClientActivitySession = {
  id: string
  clientId?: string

  visitorId: string
  sessionId: string

  websiteId?: string
  websiteDomain?: string

  channel: ActivitySessionChannel
  source?: string

  firstPageUrl?: string
  lastPageUrl?: string
  referrer?: string

  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmContent?: string
  utmTerm?: string

  deviceType?: 'desktop' | 'mobile' | 'tablet'
  browser?: string
  os?: string
  ip?: string
  location?: string

  startedAt: string
  endedAt?: string
  lastActivityAt: string
  durationSec?: number

  pageViews: number
  productViews: number
  categoryViews: number

  formSubmits: number
  chatOpens: number
  chatMessages: number
  phoneClicks: number
  telegramClicks: number
  whatsappClicks: number
  quoteRequests: number
  calculatorUses: number

  viewedProductIds: string[]
  viewedCategoryIds: string[]

  relatedConversationId?: string
  relatedDealId?: string
  relatedOrderId?: string

  status:
    | 'anonymous'
    | 'identified'
    | 'converted_to_lead'
    | 'converted_to_client'
    | 'converted_to_order'
}

export type ClientDealStatus =
  | 'new'
  | 'qualification'
  | 'calculation'
  | 'proposal_sent'
  | 'negotiation'
  | 'waiting_decision'
  | 'won'
  | 'lost'
  | 'cancelled'

export type ClientDealPriority = 'low' | 'normal' | 'high' | 'urgent'

export type ClientDealSummary = {
  id: string
  dealNumber: string

  title: string
  description?: string

  status: ClientDealStatus
  priority: ClientDealPriority

  amount: MoneyPair
  probability: number

  productInterest: string
  objectType?: string
  requiredVolume?: number
  requiredUnit?: UnitType

  managerId?: string
  managerName?: string

  source: string
  channel: ChannelType

  relatedConversationId?: string
  relatedOrderId?: string

  nextStep?: string
  nextContactAt?: string

  lostReason?: string

  createdAt: string
  updatedAt: string
  closedAt?: string
}

export type CRMClient = {
  id: string
  fullName: string
  companyName?: string

  phone?: string
  email?: string
  postalAddress?: string

  telegramUsername?: string
  telegramUserId?: string
  telegramChatId?: string
  whatsappPhone?: string

  city?: string
  region?: string
  deliveryAddress?: string

  source: string
  channel: ChannelType

  websiteId?: string
  websiteDomain?: string
  botId?: string
  botName?: string

  firstPageUrl?: string
  lastPageUrl?: string

  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmContent?: string
  utmTerm?: string

  status: ClientStatus

  assignedSellerId?: string
  assignedSellerName?: string

  managerHistory: ClientManagerHistoryItem[]
  lastManagerChangedAt?: string

  productInterest?: string
  objectType?: string
  requiredVolume?: number
  requiredUnit?: UnitType
  budget?: MoneyPair

  aiSummary?: string
  aiLeadScore?: number
  aiDetectedIntent?: string
  aiMissingFields?: string[]

  deals: ClientDealSummary[]
  orderedProducts: ClientOrderedProduct[]
  statistics: ClientStatistics
  notes: ClientNote[]
  activitySessions: ClientActivitySession[]

  createdAt: string
  updatedAt: string
  lastContactAt?: string
}
