import type { ChannelType, MoneyPair } from "@/entities/crm/types"

export type UnitType = "m2" | "pcs" | "lm" | "kg" | "ton" | "set"

export type ConversationStatus =
  | "open"
  | "ai_answering"
  | "waiting_manager"
  | "waiting_client"
  | "manager_took_over"
  | "deal_created"
  | "order_created"
  | "closed"
  | "spam"

export type ConversationFilterStatus = ConversationStatus | "all"

export type ConversationAiMode = "manual" | "ai_suggest" | "ai_auto" | "hybrid"

export type ConversationFilters = {
  search: string
  channel: ChannelType | "all"
  status: ConversationFilterStatus
  aiMode: ConversationAiMode | "all"
  saved: "all" | "saved" | "not_saved"
}

export type UIAttachment = {
  id: string
  kind: "image" | "document" | "video" | "audio" | "sticker" | "voice" | "other"
  name: string
  url?: string
  previewUrl?: string
  size?: number
  mimeType?: string
  downloadable: boolean
  telegramFileId?: string
  telegramFileUniqueId?: string
  stickerSetName?: string
  emoji?: string
  isAnimated?: boolean
  isVideo?: boolean
  createdAt: string
}

export type MessageReadReceipt = {
  userId: string
  userName: string
  readAt: string
}

export type CRMMessageReplyRef = {
  messageId: string
  senderName: string
  text?: string
}

export type ChannelMessageMeta = {
  externalMessageUrl?: string
  deliveredAt?: string
  readAt?: string
  rawStatus?: string
}

export type CRMMessage = {
  id: string
  conversationId: string
  author: "client" | "manager" | "ai" | "system"
  senderId?: string
  senderName: string
  text?: string
  attachments: UIAttachment[]
  replyTo?: CRMMessageReplyRef
  channel?: ChannelType
  channelMeta?: ChannelMessageMeta
  externalMessageId?: string
  status: "draft" | "sending" | "sent" | "delivered" | "read" | "failed" | "unsupported"
  readBy: MessageReadReceipt[]
  isAiGenerated?: boolean
  aiAgentId?: string
  aiAgentName?: string
  aiConfidence?: number
  aiWasEditedByManager?: boolean
  createdAt: string
  updatedAt?: string
}

export type AILeadExtraction = {
  conversationId: string
  clientId: string
  productCategory?: string
  productName?: string
  objectType?: string
  materialType?: string
  panelType?: "wall" | "roof" | "corner" | "cold_room" | "arched"
  insulation?: "PIR" | "PUR" | "mineral_wool" | "EPS"
  thickness?: string
  metalThickness?: string
  profileMark?: string
  coating?: string
  ralColor?: string
  volume?: number
  unit?: UnitType
  city?: string
  deliveryAddress?: string
  deliveryNeeded?: boolean
  installationNeeded?: boolean
  urgency?: "today" | "this_week" | "this_month" | "no_urgency"
  budget?: MoneyPair
  detectedIntent:
    | "price_request"
    | "calculation_request"
    | "delivery_question"
    | "technical_question"
    | "order_ready"
    | "complaint"
    | "return_request"
    | "unknown"
  missingFields: string[]
  leadScore: number
  confidence: number
  summary: string
  suggestedNextQuestion: string
  suggestedReply?: string
  recommendedManagerAction:
    | "ask_clarification"
    | "create_deal"
    | "create_order"
    | "send_quote"
    | "take_over"
    | "wait"
  updatedAt: string
}

export type ConversationAISettings = {
  enabled: boolean
  mode: ConversationAiMode
  aiAgentId?: string
  aiAgentName?: string
  allowAutoReply: boolean
  requireManagerApproval: boolean
  minConfidenceToAutoReply: number
  fallbackToManager: boolean
  disabledByUserId?: string
  disabledAt?: string
  changedByUserId?: string
  changedAt?: string
  lastAiReplyAt?: string
}

export type ClientOrderSummary = {
  id: string
  number: string
  status: string
  paymentStatus: string
  total: MoneyPair
  paid: MoneyPair
  debt: MoneyPair
  createdAt: string
}

export type ClientActivitySessionSummary = {
  id: string
  channel: "website" | "telegram" | "whatsapp" | "email" | "phone" | "manual" | "custom"
  websiteDomain?: string
  firstPageUrl?: string
  lastPageUrl?: string
  pageViews: number
  productViews: number
  chatMessages: number
  telegramClicks: number
  whatsappClicks: number
  durationSec?: number
  status: "anonymous" | "identified" | "converted_to_lead" | "converted_to_client" | "converted_to_order"
  startedAt: string
}

export type ClientNoteSummary = {
  id: string
  type: "general" | "important" | "payment" | "delivery" | "return" | "order" | "manager_private"
  authorName: string
  text: string
  pinned: boolean
  createdAt: string
}

export type ConversationClientInfo = {
  id: string
  fullName: string
  companyName?: string
  phone?: string
  email?: string
  telegramUsername?: string
  whatsappPhone?: string
  city?: string
  region?: string
  source: string
  channel: ChannelType
  websiteDomain?: string
  botName?: string
  assignedSellerName?: string
  productInterest?: string
  status: string
  totalOrders: number
  activeOrders: number
  paidOrders: number
  unpaidOrders: number
  totalOrderedAmount: MoneyPair
  totalPaidAmount: MoneyPair
  totalDebtAmount: MoneyPair
}

export type ActiveDealSummary = {
  id: string
  number: string
  title: string
  stage: string
  amount: MoneyPair
  finalAmount: MoneyPair
  probability: number
}

export type Conversation = {
  id: string
  clientId: string
  clientName: string
  channel: ChannelType
  source: string
  websiteId?: string
  websiteDomain?: string
  botId?: string
  botName?: string
  externalChatId?: string
  externalUserId?: string
  assignedSellerId?: string
  assignedSellerName?: string
  status: ConversationStatus
  aiSettings: ConversationAISettings
  aiCollectedInfo?: AILeadExtraction
  unreadCount: number
  unreadByUserIds: string[]
  isSavedByCurrentUser?: boolean
  lastMessage: string
  lastMessageAt: string
  messages: CRMMessage[]
  client: ConversationClientInfo
  activeDeal?: ActiveDealSummary
  clientOrders: ClientOrderSummary[]
  activitySessions: ClientActivitySessionSummary[]
  notes: ClientNoteSummary[]
  createdAt: string
  updatedAt: string
}

export type SendMessagePayload = {
  text: string
  attachments?: UIAttachment[]
  replyTo?: CRMMessageReplyRef
}

export type AIAgentOption = {
  id: string
  name: string
  provider: "OpenAI" | "Anthropic" | "OpenAI Compatible" | "Custom"
  model: string
  status: "active" | "disabled" | "error"
  mode: "manual" | "ai_suggest" | "ai_auto" | "hybrid"
  minConfidenceToAutoReply: number
}

export type MessageContextAction =
  | "copy"
  | "reply"
  | "edit"
  | "delete"
  | "download"