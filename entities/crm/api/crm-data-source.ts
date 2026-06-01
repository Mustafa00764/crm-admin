import type {
  AIAgentOption,
  Conversation,
  ConversationFilters,
  CRMMessage,
  SendMessagePayload
} from '@/features/conversations/model/conversations-types'
import {
  DashboardData,
  DashboardFilters
} from '@/features/dashboard/model/dashboard-types'
import type { ClientNoteSummary } from '@/features/conversations/model/conversations-types'
import type {
  CRMClient,
  ClientsFilters
} from '@/features/clients/model/clients-types'

import type {
  CRMDeal,
  CreateDealPayload,
  DealNote,
  DealStage,
  DealsFilters,
  UpdateDealPayload
} from '@/features/deals/model/deals-types'

import type {
  AddOrderDelayPayload,
  AddOrderExtraCostPayload,
  AddOrderNotePayload,
  AddOrderPaymentPayload,
  CRMOrder,
  CreateOrderReturnPayload,
  OrderFilters,
  OrderPayment,
  OrderStatus,
  UpdateOrderDelayPayload,
  UpdateOrderExtraCostPayload,
  UpdateOrderNotePayload,
  UpdateOrderPaymentPayload,
  UpdateOrderReturnPayload
} from '@/features/orders/model/orders-types'

import type {
  CreateProductCategoryPayload,
  CreateProductPayload,
  CRMProduct,
  ProductCategory,
  ProductCategoryFilters,
  ProductCategoryStatus,
  ProductFilters,
  ProductStatus,
  UpdateProductCategoryPayload,
  UpdateProductPayload
} from '@/features/products/model/products-types'

import type {
  AIAgent,
  AIAgentFilters,
  AIAgentStatus,
  CreateAIAgentPayload,
  UpdateAIAgentPayload
} from '@/features/ai-agents/model/ai-agents-types'

export type CRMDataSource = {
  getDashboardData(filters: DashboardFilters): Promise<DashboardData>

  getConversations(filters: ConversationFilters): Promise<Conversation[]>
  getConversationById(id: string): Promise<Conversation | null>

  getAiAgents(): Promise<AIAgentOption[]>
  changeConversationAIAgent(
    conversationId: string,
    aiAgentId: string
  ): Promise<Conversation>

  sendMessage(
    conversationId: string,
    payload: SendMessagePayload
  ): Promise<CRMMessage>

  updateMessage(
    conversationId: string,
    messageId: string,
    text: string
  ): Promise<CRMMessage>

  addConversationNote(
    conversationId: string,
    payload: {
      type: ClientNoteSummary['type']
      text: string
      pinned?: boolean
    }
  ): Promise<ClientNoteSummary>

  updateConversationNote(
    conversationId: string,
    noteId: string,
    payload: {
      type?: ClientNoteSummary['type']
      text?: string
      pinned?: boolean
    }
  ): Promise<ClientNoteSummary>

  deleteConversationNote(conversationId: string, noteId: string): Promise<void>

  deleteMessage(conversationId: string, messageId: string): Promise<void>

  takeOverConversation(conversationId: string): Promise<Conversation>
  returnConversationToAI(conversationId: string): Promise<Conversation>
  disableAIForConversation(conversationId: string): Promise<Conversation>
  enableAIForConversation(conversationId: string): Promise<Conversation>

  saveConversation(conversationId: string): Promise<Conversation>
  unsaveConversation(conversationId: string): Promise<Conversation>
  closeConversation(conversationId: string): Promise<Conversation>
  markConversationAsSpam(conversationId: string): Promise<Conversation>

  /** Clients **/
  getClients(filters: ClientsFilters): Promise<CRMClient[]>
  getClientById(id: string): Promise<CRMClient | null>

  createClient(
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
  ): Promise<CRMClient>

  updateClient(
    clientId: string,
    payload: Partial<CRMClient>
  ): Promise<CRMClient>

  deleteClient(clientId: string): Promise<void>

  /** Deals **/
  getDeals(filters: DealsFilters): Promise<CRMDeal[]>
  getDealById(id: string): Promise<CRMDeal | null>

  createDeal(payload: CreateDealPayload): Promise<CRMDeal>

  updateDeal(dealId: string, payload: UpdateDealPayload): Promise<CRMDeal>

  updateDealStage(dealId: string, stage: DealStage): Promise<CRMDeal>

  deleteDeal(dealId: string): Promise<void>

  createOrderFromDeal(dealId: string): Promise<CRMDeal>

  addDealNote(
    dealId: string,
    payload: {
      type: DealNote['type']
      text: string
      pinned?: boolean
    }
  ): Promise<CRMDeal>

  updateDealNote(
    dealId: string,
    noteId: string,
    payload: {
      type?: DealNote['type']
      text?: string
      pinned?: boolean
    }
  ): Promise<CRMDeal>

  moveDeal(
    dealId: string,
    targetStage: DealStage,
    targetIndex: number
  ): Promise<CRMDeal[]>

  deleteDealNote(dealId: string, noteId: string): Promise<CRMDeal>

  /** ORDERS **/
  getOrders(filters: OrderFilters): Promise<CRMOrder[]>

  getOrderById(orderId: string): Promise<CRMOrder | null>

  updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    comment?: string
  ): Promise<CRMOrder>

  addOrderPayment(
    orderId: string,
    payload: AddOrderPaymentPayload
  ): Promise<CRMOrder>

  addOrderDelay(
    orderId: string,
    payload: AddOrderDelayPayload
  ): Promise<CRMOrder>

  addOrderExtraCost(
    orderId: string,
    payload: AddOrderExtraCostPayload
  ): Promise<CRMOrder>

  createOrderReturn(
    orderId: string,
    payload: CreateOrderReturnPayload
  ): Promise<CRMOrder>

  addOrderNote(orderId: string, payload: AddOrderNotePayload): Promise<CRMOrder>

  updateOrderPayment(
    orderId: string,
    paymentId: string,
    payload: UpdateOrderPaymentPayload
  ): Promise<CRMOrder>

  updateOrderPaymentStatus(
    orderId: string,
    paymentId: string,
    status: OrderPayment['status']
  ): Promise<CRMOrder>

  updateOrderReturn(
    orderId: string,
    returnId: string,
    payload: UpdateOrderReturnPayload
  ): Promise<CRMOrder>

  updateOrderDelay(
    orderId: string,
    delayId: string,
    payload: UpdateOrderDelayPayload
  ): Promise<CRMOrder>

  updateOrderExtraCost(
    orderId: string,
    extraCostId: string,
    payload: UpdateOrderExtraCostPayload
  ): Promise<CRMOrder>

  updateOrderNote(
    orderId: string,
    noteId: string,
    payload: UpdateOrderNotePayload
  ): Promise<CRMOrder>

  deleteOrder(orderId: string): Promise<void>

  deleteOrderReturn(orderId: string, returnId: string): Promise<CRMOrder>

  deleteOrderDelay(orderId: string, delayId: string): Promise<CRMOrder>

  deleteOrderExtraCost(orderId: string, extraCostId: string): Promise<CRMOrder>

  deleteOrderPayment(orderId: string, paymentId: string): Promise<CRMOrder>

  deleteOrderNote(orderId: string, noteId: string): Promise<CRMOrder>

  /** PRODUCTS **/

  getProducts(filters?: ProductFilters): Promise<CRMProduct[]>
  getProductCategories(): Promise<ProductCategory[]>
  createProduct(payload: CreateProductPayload): Promise<CRMProduct>
  updateProduct(
    productId: string,
    payload: UpdateProductPayload
  ): Promise<CRMProduct>
  updateProductStatus(
    productId: string,
    status: ProductStatus
  ): Promise<CRMProduct>
  duplicateProduct(productId: string): Promise<CRMProduct>
  deleteProduct(productId: string): Promise<void>

  getProductCategories(
    filters?: ProductCategoryFilters
  ): Promise<ProductCategory[]>

  createProductCategory(
    payload: CreateProductCategoryPayload
  ): Promise<ProductCategory>

  updateProductCategory(
    categoryId: string,
    payload: UpdateProductCategoryPayload
  ): Promise<ProductCategory>

  updateProductCategoryStatus(
    categoryId: string,
    status: ProductCategoryStatus
  ): Promise<ProductCategory>

  duplicateProductCategory(categoryId: string): Promise<ProductCategory>

  deleteProductCategory(categoryId: string): Promise<void>

  /** AI AGENTS **/

  getAiAgentRecords(filters?: AIAgentFilters): Promise<AIAgent[]>

  createAiAgentRecord(payload: CreateAIAgentPayload): Promise<AIAgent>

  updateAiAgentRecord(
    agentId: string,
    payload: UpdateAIAgentPayload
  ): Promise<AIAgent>

  updateAiAgentRecordStatus(
    agentId: string,
    status: AIAgentStatus
  ): Promise<AIAgent>

  duplicateAiAgentRecord(agentId: string): Promise<AIAgent>

  deleteAiAgentRecord(agentId: string): Promise<void>
}
