import type { ChannelType, MoneyPair } from '@/entities/crm/types'
import type { UnitType } from '@/features/clients/model/clients-types'

export type DealStage =
  | 'new'
  | 'qualification'
  | 'calculation'
  | 'proposal_sent'
  | 'negotiation'
  | 'waiting_decision'
  | 'won'
  | 'lost'
  | 'cancelled'

export type DealPriority = 'low' | 'normal' | 'high' | 'urgent'

export type DealStatus = 'open' | 'won' | 'lost' | 'cancelled'

export type DealsViewMode = 'table' | 'kanban'

export type DealsFilters = {
  search: string
  stage: DealStage | 'all'
  managerId: string
  source: string
  channel: ChannelType | 'all'
  priority: DealPriority | 'all'
  amountFrom: string
  amountTo: string
  hasOrder: 'all' | 'yes' | 'no'
}

export type DealProductLine = {
  id: string
  productId: string
  productName: string
  categoryName: string
  quantity: number
  unit: UnitType
  price: MoneyPair
  total: MoneyPair
}

export type DealHistoryItem = {
  id: string
  type:
    | 'created'
    | 'stage_changed'
    | 'manager_changed'
    | 'quote_sent'
    | 'order_created'
    | 'note_added'
    | 'lost'
    | 'won'

  title: string
  description?: string

  fromStage?: DealStage
  toStage?: DealStage

  userId?: string
  userName?: string

  createdAt: string
}

export type DealNoteType =
  | 'general'
  | 'important'
  | 'payment'
  | 'delivery'
  | 'production'
  | 'discount'
  | 'manager_private'

export type DealNote = {
  id: string
  type: DealNoteType
  text: string
  authorId?: string
  authorName: string
  pinned: boolean
  createdAt: string
  updatedAt?: string
}

export type CRMDeal = {
  id: string
  dealNumber: string

  clientId: string
  clientName: string
  companyName?: string

  phone?: string
  email?: string
  city?: string

  title: string
  description?: string

  stage: DealStage
  status: DealStatus
  priority: DealPriority
  sortOrder: number

  amount: MoneyPair
  discountAmount: MoneyPair
  finalAmount: MoneyPair
  expectedMargin?: MoneyPair

  probability: number

  productInterest: string
  objectType?: string
  requiredVolume?: number
  requiredUnit?: UnitType

  productLines: DealProductLine[]

  managerId?: string
  managerName?: string

  source: string
  channel: ChannelType

  websiteId?: string
  websiteDomain?: string
  botId?: string
  botName?: string

  relatedConversationId?: string
  relatedOrderId?: string
  relatedQuoteId?: string

  aiCreated?: boolean
  aiSummary?: string
  aiConfidence?: number

  nextStep?: string
  nextContactAt?: string

  lostReason?: string

  history: DealHistoryItem[]
  notes: DealNote[]

  createdAt: string
  updatedAt: string
  closedAt?: string
}

export type CreateDealPayload = Omit<
  CRMDeal,
  | 'id'
  | 'dealNumber'
  | 'status'
  | 'history'
  | 'notes'
  | 'createdAt'
  | 'updatedAt'
  | 'closedAt'
>

export type UpdateDealPayload = Partial<
  Omit<CRMDeal, 'id' | 'dealNumber' | 'createdAt'>
>

export const dealStages: Array<{
  value: DealStage
  label: string
}> = [
  { value: 'new', label: 'New' },
  { value: 'qualification', label: 'Qualification' },
  { value: 'calculation', label: 'Calculation' },
  { value: 'proposal_sent', label: 'Proposal sent' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'waiting_decision', label: 'Waiting decision' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
  { value: 'cancelled', label: 'Cancelled' }
]
