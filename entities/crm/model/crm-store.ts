'use client'

import { create } from 'zustand'

import { mockCrmDataSource } from '@/entities/crm/api/mock-crm-data-source'

import type {
  DashboardData,
  DashboardFilters
} from '@/features/dashboard/model/dashboard-types'

import type {
  AIAgentOption,
  Conversation,
  ConversationFilters,
  SendMessagePayload
} from '@/features/conversations/model/conversations-types'
import type { ClientNoteSummary } from '@/features/conversations/model/conversations-types'

import type {
  CRMClient,
  ClientsFilters,
  ClientsViewMode
} from '@/features/clients/model/clients-types'

import type {
  CRMDeal,
  CreateDealPayload,
  DealNote,
  DealStage,
  DealsFilters,
  DealsViewMode,
  UpdateDealPayload
} from '@/features/deals/model/deals-types'

import type {
  AddOrderDelayPayload,
  AddOrderExtraCostPayload,
  AddOrderNotePayload,
  AddOrderPaymentPayload,
  CRMOrder,
  OrdersViewMode,
  CreateOrderReturnPayload,
  OrderFilters,
  OrderStatus,
  UpdateOrderPaymentPayload,
  UpdateOrderReturnPayload,
  UpdateOrderDelayPayload,
  UpdateOrderExtraCostPayload,
  UpdateOrderNotePayload,
  OrderPayment
} from '@/features/orders/model/orders-types'
import { initialOrderFilters } from '@/features/orders/model/orders-types'

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
import {
  initialProductCategoryFilters,
  initialProductFilters
} from '@/features/products/model/products-types'
import type {
  AIAgent,
  AIAgentFilters,
  AIAgentStatus,
  CreateAIAgentPayload,
  UpdateAIAgentPayload
} from '@/features/ai-agents/model/ai-agents-types'
import { initialAIAgentFilters } from '@/features/ai-agents/model/ai-agents-types'

const defaultDealsFilters: DealsFilters = {
  search: '',
  stage: 'all',
  managerId: 'all',
  source: 'all',
  channel: 'all',
  priority: 'all',
  amountFrom: '',
  amountTo: '',
  hasOrder: 'all'
}

type CRMStore = {
  /**
   * DASHBOARD
   */
  dashboardData: DashboardData | null
  dashboardFilters: DashboardFilters
  dashboardLoading: boolean
  dashboardError: string | null

  loadDashboard: () => Promise<void>
  updateDashboardFilters: (payload: Partial<DashboardFilters>) => void
  resetDashboardFilters: () => void

  /**
   * CONVERSATIONS
   */
  conversations: Conversation[]
  selectedConversationId: string | null
  conversationsFilters: ConversationFilters
  conversationsLoading: boolean
  conversationsError: string | null
  aiAgents: AIAgentOption[]

  loadAiAgents: () => Promise<void>

  changeConversationAIAgent: (
    conversationId: string,
    aiAgentId: string
  ) => Promise<void>

  updateConversationMessage: (
    conversationId: string,
    messageId: string,
    text: string
  ) => Promise<void>

  deleteConversationMessage: (
    conversationId: string,
    messageId: string
  ) => Promise<void>

  loadConversations: () => Promise<void>
  selectConversation: (id: string) => void
  updateConversationFilters: (payload: Partial<ConversationFilters>) => void

  sendConversationMessage: (
    conversationId: string,
    payload: SendMessagePayload
  ) => Promise<void>

  takeOverConversation: (conversationId: string) => Promise<void>
  returnConversationToAI: (conversationId: string) => Promise<void>
  disableAIForConversation: (conversationId: string) => Promise<void>
  enableAIForConversation: (conversationId: string) => Promise<void>

  saveConversation: (conversationId: string) => Promise<void>
  unsaveConversation: (conversationId: string) => Promise<void>
  closeConversation: (conversationId: string) => Promise<void>
  markConversationAsSpam: (conversationId: string) => Promise<void>

  addConversationNote: (
    conversationId: string,
    payload: {
      type: ClientNoteSummary['type']
      text: string
      pinned?: boolean
    }
  ) => Promise<void>

  updateConversationNote: (
    conversationId: string,
    noteId: string,
    payload: {
      type?: ClientNoteSummary['type']
      text?: string
      pinned?: boolean
    }
  ) => Promise<void>

  deleteConversationNote: (
    conversationId: string,
    noteId: string
  ) => Promise<void>

  /** CLIENTS **/
  clients: CRMClient[]
  selectedClientId: string | null
  clientsFilters: ClientsFilters
  clientsViewMode: ClientsViewMode
  clientsLoading: boolean
  clientsError: string | null

  loadClients: () => Promise<void>
  selectClient: (clientId: string) => void
  updateClientsFilters: (payload: Partial<ClientsFilters>) => void
  setClientsViewMode: (viewMode: ClientsViewMode) => void
  createClient: Parameters<
    typeof mockCrmDataSource.createClient
  >[0] extends infer P
    ? (payload: P) => Promise<void>
    : never
  updateClient: (clientId: string, payload: Partial<CRMClient>) => Promise<void>
  deleteClient: (clientId: string) => Promise<void>

  /** DEALS **/
  deals: CRMDeal[]
  selectedDealId: string | null
  dealsFilters: DealsFilters
  dealsViewMode: DealsViewMode
  dealsLoading: boolean
  dealsError: string | null

  loadDeals: () => Promise<void>
  selectDeal: (dealId: string) => void
  updateDealsFilters: (payload: Partial<DealsFilters>) => void
  setDealsViewMode: (viewMode: DealsViewMode) => void
  createDeal: (payload: CreateDealPayload) => Promise<void>
  updateDeal: (dealId: string, payload: UpdateDealPayload) => Promise<void>
  updateDealStage: (dealId: string, stage: DealStage) => Promise<void>
  deleteDeal: (dealId: string) => Promise<void>
  createOrderFromDeal: (dealId: string) => Promise<void>
  addDealNote: (
    dealId: string,
    payload: {
      type: DealNote['type']
      text: string
      pinned?: boolean
    }
  ) => Promise<void>

  updateDealNote: (
    dealId: string,
    noteId: string,
    payload: {
      type?: DealNote['type']
      text?: string
      pinned?: boolean
    }
  ) => Promise<void>

  deleteDealNote: (dealId: string, noteId: string) => Promise<void>

  moveDeal: (
    dealId: string,
    targetStage: DealStage,
    targetIndex: number
  ) => Promise<void>

  /** ORDERS **/
  orders: CRMOrder[]
  selectedOrderId: string | null
  ordersFilters: OrderFilters
  ordersLoading: boolean
  ordersError: string | null
  ordersViewMode: OrdersViewMode

  setOrdersViewMode: (viewMode: OrdersViewMode) => void

  loadOrders: () => Promise<void>
  selectOrder: (orderId: string | null) => void
  updateOrdersFilters: (payload: Partial<OrderFilters>) => void

  updateOrderStatus: (
    orderId: string,
    status: OrderStatus,
    comment?: string
  ) => Promise<void>

  addOrderPayment: (
    orderId: string,
    payload: AddOrderPaymentPayload
  ) => Promise<void>

  addOrderDelay: (
    orderId: string,
    payload: AddOrderDelayPayload
  ) => Promise<void>

  addOrderExtraCost: (
    orderId: string,
    payload: AddOrderExtraCostPayload
  ) => Promise<void>

  createOrderReturn: (
    orderId: string,
    payload: CreateOrderReturnPayload
  ) => Promise<void>

  updateOrderPayment: (
    orderId: string,
    paymentId: string,
    payload: UpdateOrderPaymentPayload
  ) => Promise<void>

  updateOrderPaymentStatus: (
    orderId: string,
    paymentId: string,
    status: OrderPayment['status']
  ) => Promise<void>

  updateOrderReturn: (
    orderId: string,
    returnId: string,
    payload: UpdateOrderReturnPayload
  ) => Promise<void>

  updateOrderDelay: (
    orderId: string,
    delayId: string,
    payload: UpdateOrderDelayPayload
  ) => Promise<void>

  updateOrderExtraCost: (
    orderId: string,
    extraCostId: string,
    payload: UpdateOrderExtraCostPayload
  ) => Promise<void>

  updateOrderNote: (
    orderId: string,
    noteId: string,
    payload: UpdateOrderNotePayload
  ) => Promise<void>

  addOrderNote: (orderId: string, payload: AddOrderNotePayload) => Promise<void>

  deleteOrder: (orderId: string) => Promise<void>

  deleteOrderReturn: (orderId: string, returnId: string) => Promise<void>

  deleteOrderDelay: (orderId: string, delayId: string) => Promise<void>

  deleteOrderExtraCost: (orderId: string, extraCostId: string) => Promise<void>

  deleteOrderPayment: (orderId: string, paymentId: string) => Promise<void>

  deleteOrderNote: (orderId: string, noteId: string) => Promise<void>

  /* PRODUCTS */

  products: CRMProduct[]
  productCategories: ProductCategory[]
  selectedProductId: string | null
  productsFilters: ProductFilters
  productsLoading: boolean
  productsError: string | null

  loadProducts: () => Promise<void>
  selectProduct: (productId: string | null) => void
  updateProductsFilters: (payload: Partial<ProductFilters>) => void
  createProduct: (payload: CreateProductPayload) => Promise<void>
  updateProduct: (
    productId: string,
    payload: UpdateProductPayload
  ) => Promise<void>
  updateProductStatus: (
    productId: string,
    status: ProductStatus
  ) => Promise<void>
  duplicateProduct: (productId: string) => Promise<void>
  deleteProduct: (productId: string) => Promise<void>

  /* PRODUCT CATEGORIES */

  productCategoryFilters: ProductCategoryFilters
  selectedProductCategoryId: string | null
  productCategoriesLoading: boolean
  productCategoriesError: string | null

  loadProductCategories: () => Promise<void>
  selectProductCategory: (categoryId: string | null) => void
  updateProductCategoryFilters: (
    payload: Partial<ProductCategoryFilters>
  ) => void
  createProductCategory: (
    payload: CreateProductCategoryPayload
  ) => Promise<void>
  updateProductCategory: (
    categoryId: string,
    payload: UpdateProductCategoryPayload
  ) => Promise<void>
  updateProductCategoryStatus: (
    categoryId: string,
    status: ProductCategoryStatus
  ) => Promise<void>
  duplicateProductCategory: (categoryId: string) => Promise<void>
  deleteProductCategory: (categoryId: string) => Promise<void>

  /* AI AGENTS */

  aiAgentRecords: AIAgent[]
  aiAgentFilters: AIAgentFilters
  selectedAiAgentId: string | null
  aiAgentsLoading: boolean
  aiAgentsError: string | null

  loadAiAgentRecords: () => Promise<void>
  selectAiAgent: (agentId: string | null) => void
  updateAiAgentFilters: (payload: Partial<AIAgentFilters>) => void
  createAiAgent: (payload: CreateAIAgentPayload) => Promise<void>
  updateAiAgent: (
    agentId: string,
    payload: UpdateAIAgentPayload
  ) => Promise<void>
  updateAiAgentStatus: (agentId: string, status: AIAgentStatus) => Promise<void>
  duplicateAiAgent: (agentId: string) => Promise<void>
  deleteAiAgent: (agentId: string) => Promise<void>
}

const defaultDashboardFilters: DashboardFilters = {
  dateRange: '30d',
  websiteId: 'all',
  botId: 'all',
  channel: 'all',
  managerId: 'all',
  productCategoryId: 'all',
  orderStatus: 'all',
  paymentStatus: 'all',
  currencyDisplay: 'dual'
}

const defaultConversationFilters: ConversationFilters = {
  search: '',
  channel: 'all',
  status: 'all',
  aiMode: 'all',
  saved: 'all'
}

const defaultClientsFilters: ClientsFilters = {
  search: '',
  status: 'all',
  managerId: 'all',
  channel: 'all',
  websiteId: 'all',
  botId: 'all',
  utmSource: 'all',
  city: 'all',
  hasDebt: 'all',
  hasReturn: 'all',
  hasActivitySessions: 'all'
}

const CLIENTS_VIEW_MODE_STORAGE_KEY = 'crm.clients.viewMode'

function getInitialClientsViewMode(): ClientsViewMode {
  if (typeof window === 'undefined') return 'table'

  const saved = window.localStorage.getItem(CLIENTS_VIEW_MODE_STORAGE_KEY)

  if (saved === 'table' || saved === 'cards') {
    return saved
  }

  return 'table'
}

function saveClientsViewMode(viewMode: ClientsViewMode) {
  if (typeof window === 'undefined') return

  window.localStorage.setItem(CLIENTS_VIEW_MODE_STORAGE_KEY, viewMode)
}

const DEALS_VIEW_MODE_STORAGE_KEY = 'crm.deals.viewMode'

function getInitialDealsViewMode(): DealsViewMode {
  if (typeof window === 'undefined') {
    return 'table'
  }

  const saved = window.localStorage.getItem(DEALS_VIEW_MODE_STORAGE_KEY)

  if (saved === 'table' || saved === 'kanban') {
    return saved
  }

  return 'table'
}

function saveDealsViewMode(viewMode: DealsViewMode) {
  if (typeof window === 'undefined') return

  window.localStorage.setItem(DEALS_VIEW_MODE_STORAGE_KEY, viewMode)
}

/** ORDERS **/
const ORDERS_VIEW_MODE_STORAGE_KEY = 'crm.orders.viewMode'

function getInitialOrdersViewMode(): OrdersViewMode {
  if (typeof window === 'undefined') {
    return 'cards'
  }

  const saved = window.localStorage.getItem(ORDERS_VIEW_MODE_STORAGE_KEY)

  if (saved === 'table' || saved === 'cards') {
    return saved
  }

  return 'table'
}

function saveOrdersViewMode(viewMode: OrdersViewMode) {
  if (typeof window === 'undefined') return

  window.localStorage.setItem(ORDERS_VIEW_MODE_STORAGE_KEY, viewMode)
}

export const useCRMStore = create<CRMStore>((set, get) => ({
  /**
   * DASHBOARD STATE
   */
  dashboardData: null,
  dashboardFilters: defaultDashboardFilters,
  dashboardLoading: false,
  dashboardError: null,

  async loadDashboard() {
    set({
      dashboardLoading: true,
      dashboardError: null
    })

    try {
      const data = await mockCrmDataSource.getDashboardData(
        get().dashboardFilters
      )

      set({
        dashboardData: data,
        dashboardLoading: false
      })
    } catch {
      set({
        dashboardError: 'Не удалось загрузить Dashboard',
        dashboardLoading: false
      })
    }
  },

  updateDashboardFilters(payload) {
    set(state => ({
      dashboardFilters: {
        ...state.dashboardFilters,
        ...payload
      }
    }))

    void get().loadDashboard()
  },

  resetDashboardFilters() {
    set({
      dashboardFilters: defaultDashboardFilters
    })

    void get().loadDashboard()
  },

  /**
   * CONVERSATIONS STATE
   */
  conversations: [],
  selectedConversationId: null,
  conversationsFilters: defaultConversationFilters,
  conversationsLoading: false,
  conversationsError: null,
  aiAgents: [],

  async loadAiAgents() {
    const aiAgents = await mockCrmDataSource.getAiAgents()
    set({ aiAgents })
  },

  async changeConversationAIAgent(conversationId, aiAgentId) {
    await mockCrmDataSource.changeConversationAIAgent(conversationId, aiAgentId)
    await get().loadConversations()

    set({
      selectedConversationId: conversationId
    })
  },

  async updateConversationMessage(conversationId, messageId, text) {
    await mockCrmDataSource.updateMessage(conversationId, messageId, text)
    await get().loadConversations()
    set({ selectedConversationId: conversationId })
  },

  async deleteConversationMessage(conversationId, messageId) {
    await mockCrmDataSource.deleteMessage(conversationId, messageId)
    await get().loadConversations()
    set({ selectedConversationId: conversationId })
  },

  async loadConversations() {
    set({
      conversationsLoading: true,
      conversationsError: null
    })

    try {
      const conversations = await mockCrmDataSource.getConversations(
        get().conversationsFilters
      )

      set(state => ({
        conversations,
        selectedConversationId:
          state.selectedConversationId ?? conversations[0]?.id ?? null,
        conversationsLoading: false
      }))
    } catch {
      set({
        conversationsError: 'Не удалось загрузить диалоги',
        conversationsLoading: false
      })
    }
  },

  selectConversation(id) {
    set({
      selectedConversationId: id
    })
  },

  updateConversationFilters(payload) {
    set(state => ({
      conversationsFilters: {
        ...state.conversationsFilters,
        ...payload
      },
      selectedConversationId: null
    }))

    void get().loadConversations()
  },

  async sendConversationMessage(conversationId, payload) {
    await mockCrmDataSource.sendMessage(conversationId, payload)
    await get().loadConversations()

    set({
      selectedConversationId: conversationId
    })
  },

  async takeOverConversation(conversationId) {
    await mockCrmDataSource.takeOverConversation(conversationId)
    await get().loadConversations()

    set({
      selectedConversationId: conversationId
    })
  },

  async returnConversationToAI(conversationId) {
    await mockCrmDataSource.returnConversationToAI(conversationId)
    await get().loadConversations()

    set({
      selectedConversationId: conversationId
    })
  },

  async disableAIForConversation(conversationId) {
    await mockCrmDataSource.disableAIForConversation(conversationId)
    await get().loadConversations()

    set({
      selectedConversationId: conversationId
    })
  },

  async enableAIForConversation(conversationId) {
    await mockCrmDataSource.enableAIForConversation(conversationId)
    await get().loadConversations()

    set({
      selectedConversationId: conversationId
    })
  },

  async saveConversation(conversationId) {
    await mockCrmDataSource.saveConversation(conversationId)
    await get().loadConversations()

    set({
      selectedConversationId: conversationId
    })
  },

  async unsaveConversation(conversationId) {
    await mockCrmDataSource.unsaveConversation(conversationId)
    await get().loadConversations()

    set({
      selectedConversationId: conversationId
    })
  },

  async closeConversation(conversationId) {
    await mockCrmDataSource.closeConversation(conversationId)
    await get().loadConversations()
  },

  async markConversationAsSpam(conversationId) {
    await mockCrmDataSource.markConversationAsSpam(conversationId)
    await get().loadConversations()
  },
  async addConversationNote(conversationId, payload) {
    await mockCrmDataSource.addConversationNote(conversationId, payload)
    await get().loadConversations()

    set({
      selectedConversationId: conversationId
    })
  },

  async updateConversationNote(conversationId, noteId, payload) {
    await mockCrmDataSource.updateConversationNote(
      conversationId,
      noteId,
      payload
    )

    await get().loadConversations()

    set({
      selectedConversationId: conversationId
    })
  },

  async deleteConversationNote(conversationId, noteId) {
    await mockCrmDataSource.deleteConversationNote(conversationId, noteId)
    await get().loadConversations()

    set({
      selectedConversationId: conversationId
    })
  },

  /** CLIENTS **/

  clients: [],
  selectedClientId: null,
  clientsFilters: defaultClientsFilters,
  clientsViewMode: getInitialClientsViewMode(),
  clientsLoading: false,
  clientsError: null,

  async loadClients() {
    set({
      clientsLoading: true,
      clientsError: null
    })

    try {
      const clients = await mockCrmDataSource.getClients(get().clientsFilters)

      set(state => ({
        clients,
        selectedClientId: state.selectedClientId ?? clients[0]?.id ?? null,
        clientsLoading: false
      }))
    } catch {
      set({
        clientsError: 'Не удалось загрузить клиентов',
        clientsLoading: false
      })
    }
  },

  selectClient(clientId) {
    set({
      selectedClientId: clientId
    })
  },

  updateClientsFilters(payload) {
    set(state => ({
      clientsFilters: {
        ...state.clientsFilters,
        ...payload
      },
      selectedClientId: null
    }))

    void get().loadClients()
  },

  setClientsViewMode(viewMode) {
    saveClientsViewMode(viewMode)

    set({
      clientsViewMode: viewMode
    })
  },

  async createClient(payload) {
    await mockCrmDataSource.createClient(payload)
    await get().loadClients()
  },

  async updateClient(clientId, payload) {
    const updatedClient = await mockCrmDataSource.updateClient(
      clientId,
      payload
    )

    set(state => ({
      clients: state.clients.map(client =>
        client.id === clientId ? updatedClient : client
      ),
      selectedClientId: clientId
    }))
  },

  async deleteClient(clientId) {
    await mockCrmDataSource.deleteClient(clientId)

    set(state => {
      const nextClients = state.clients.filter(client => client.id !== clientId)

      return {
        clients: nextClients,
        selectedClientId:
          state.selectedClientId === clientId
            ? (nextClients[0]?.id ?? null)
            : state.selectedClientId
      }
    })
  },

  /** DEALS **/
  deals: [],
  selectedDealId: null,
  dealsFilters: defaultDealsFilters,
  dealsViewMode: getInitialDealsViewMode(),
  dealsLoading: false,
  dealsError: null,

  async loadDeals() {
    set({
      dealsLoading: true,
      dealsError: null
    })

    try {
      const deals = await mockCrmDataSource.getDeals(get().dealsFilters)

      set(state => ({
        deals,
        selectedDealId: state.selectedDealId ?? deals[0]?.id ?? null,
        dealsLoading: false
      }))
    } catch {
      set({
        dealsError: 'Не удалось загрузить сделки',
        dealsLoading: false
      })
    }
  },

  selectDeal(dealId) {
    set({
      selectedDealId: dealId
    })
  },

  updateDealsFilters(payload) {
    set(state => ({
      dealsFilters: {
        ...state.dealsFilters,
        ...payload
      },
      selectedDealId: null
    }))

    void get().loadDeals()
  },

  setDealsViewMode(viewMode) {
    saveDealsViewMode(viewMode)

    set({
      dealsViewMode: viewMode
    })
  },

  async createDeal(payload) {
    const deal = await mockCrmDataSource.createDeal(payload)

    set(state => ({
      deals: [deal, ...state.deals],
      selectedDealId: deal.id
    }))
  },

  async updateDeal(dealId, payload) {
    const updatedDeal = await mockCrmDataSource.updateDeal(dealId, payload)

    set(state => ({
      deals: state.deals.map(deal => (deal.id === dealId ? updatedDeal : deal)),
      selectedDealId: dealId
    }))
  },

  async updateDealStage(dealId, stage) {
    const updatedDeal = await mockCrmDataSource.updateDealStage(dealId, stage)

    set(state => ({
      deals: state.deals.map(deal => (deal.id === dealId ? updatedDeal : deal)),
      selectedDealId: dealId
    }))
  },

  async deleteDeal(dealId) {
    await mockCrmDataSource.deleteDeal(dealId)

    set(state => {
      const nextDeals = state.deals.filter(deal => deal.id !== dealId)

      return {
        deals: nextDeals,
        selectedDealId:
          state.selectedDealId === dealId
            ? (nextDeals[0]?.id ?? null)
            : state.selectedDealId
      }
    })
  },

  async createOrderFromDeal(dealId) {
    const updatedDeal = await mockCrmDataSource.createOrderFromDeal(dealId)

    set(state => ({
      deals: state.deals.map(deal => (deal.id === dealId ? updatedDeal : deal)),
      selectedDealId: dealId
    }))
  },

  async addDealNote(dealId, payload) {
    const updatedDeal = await mockCrmDataSource.addDealNote(dealId, payload)

    set(state => ({
      deals: state.deals.map(deal => (deal.id === dealId ? updatedDeal : deal)),
      selectedDealId: dealId
    }))
  },

  async updateDealNote(dealId, noteId, payload) {
    const updatedDeal = await mockCrmDataSource.updateDealNote(
      dealId,
      noteId,
      payload
    )

    set(state => ({
      deals: state.deals.map(deal => (deal.id === dealId ? updatedDeal : deal)),
      selectedDealId: dealId
    }))
  },

  async deleteDealNote(dealId, noteId) {
    const updatedDeal = await mockCrmDataSource.deleteDealNote(dealId, noteId)

    set(state => ({
      deals: state.deals.map(deal => (deal.id === dealId ? updatedDeal : deal)),
      selectedDealId: dealId
    }))
  },

  async moveDeal(dealId, targetStage, targetIndex) {
    const updatedDeals = await mockCrmDataSource.moveDeal(
      dealId,
      targetStage,
      targetIndex
    )

    set({
      deals: updatedDeals,
      selectedDealId: dealId
    })
  },

  /** ORDERS **/
  orders: [],
  selectedOrderId: null,
  ordersFilters: initialOrderFilters,
  ordersLoading: false,
  ordersError: null,
  ordersViewMode: getInitialOrdersViewMode(),

  setOrdersViewMode(viewMode) {
    saveOrdersViewMode(viewMode)

    set({
      ordersViewMode: viewMode
    })
  },

  async loadOrders() {
    set({ ordersLoading: true, ordersError: null })

    try {
      const orders = await mockCrmDataSource.getOrders(initialOrderFilters)

      set({
        orders,
        ordersLoading: false
      })
    } catch (error) {
      set({
        ordersError:
          error instanceof Error ? error.message : 'Failed to load orders',
        ordersLoading: false
      })
    }
  },

  updateOrdersFilters(payload) {
    set(state => ({
      ordersFilters: {
        ...state.ordersFilters,
        ...payload
      }
    }))
  },

  selectOrder(orderId) {
    set({
      selectedOrderId: orderId
    })
  },

  async updateOrderStatus(orderId, status, comment) {
    const updatedOrder = await mockCrmDataSource.updateOrderStatus(
      orderId,
      status,
      comment
    )

    set(state => ({
      orders: state.orders.map(order =>
        order.id === orderId ? updatedOrder : order
      ),
      selectedOrderId: orderId
    }))
  },

  async addOrderPayment(orderId, payload) {
    const updatedOrder = await mockCrmDataSource.addOrderPayment(
      orderId,
      payload
    )

    set(state => ({
      orders: state.orders.map(order =>
        order.id === orderId ? updatedOrder : order
      ),
      selectedOrderId: orderId
    }))
  },

  async addOrderDelay(orderId, payload) {
    const updatedOrder = await mockCrmDataSource.addOrderDelay(orderId, payload)

    set(state => ({
      orders: state.orders.map(order =>
        order.id === orderId ? updatedOrder : order
      ),
      selectedOrderId: orderId
    }))
  },

  async addOrderExtraCost(orderId, payload) {
    const updatedOrder = await mockCrmDataSource.addOrderExtraCost(
      orderId,
      payload
    )

    set(state => ({
      orders: state.orders.map(order =>
        order.id === orderId ? updatedOrder : order
      ),
      selectedOrderId: orderId
    }))
  },

  async createOrderReturn(orderId, payload) {
    const updatedOrder = await mockCrmDataSource.createOrderReturn(
      orderId,
      payload
    )

    set(state => ({
      orders: state.orders.map(order =>
        order.id === orderId ? updatedOrder : order
      ),
      selectedOrderId: orderId
    }))
  },

  async addOrderNote(orderId, payload) {
    const updatedOrder = await mockCrmDataSource.addOrderNote(orderId, payload)

    set(state => ({
      orders: state.orders.map(order =>
        order.id === orderId ? updatedOrder : order
      ),
      selectedOrderId: orderId
    }))
  },

  async updateOrderPayment(orderId, paymentId, payload) {
    const updatedOrder = await mockCrmDataSource.updateOrderPayment(
      orderId,
      paymentId,
      payload
    )

    set(state => ({
      orders: state.orders.map(order =>
        order.id === orderId ? updatedOrder : order
      ),
      selectedOrderId: orderId
    }))
  },

  async updateOrderPaymentStatus(orderId, paymentId, status) {
    const updatedOrder = await mockCrmDataSource.updateOrderPaymentStatus(
      orderId,
      paymentId,
      status
    )

    set(state => ({
      orders: state.orders.map(order =>
        order.id === orderId ? updatedOrder : order
      ),
      selectedOrderId: orderId
    }))
  },

  async updateOrderReturn(orderId, returnId, payload) {
    const updatedOrder = await mockCrmDataSource.updateOrderReturn(
      orderId,
      returnId,
      payload
    )

    set(state => ({
      orders: state.orders.map(order =>
        order.id === orderId ? updatedOrder : order
      ),
      selectedOrderId: orderId
    }))
  },

  async updateOrderDelay(orderId, delayId, payload) {
    const updatedOrder = await mockCrmDataSource.updateOrderDelay(
      orderId,
      delayId,
      payload
    )

    set(state => ({
      orders: state.orders.map(order =>
        order.id === orderId ? updatedOrder : order
      ),
      selectedOrderId: orderId
    }))
  },

  async updateOrderExtraCost(orderId, extraCostId, payload) {
    const updatedOrder = await mockCrmDataSource.updateOrderExtraCost(
      orderId,
      extraCostId,
      payload
    )

    set(state => ({
      orders: state.orders.map(order =>
        order.id === orderId ? updatedOrder : order
      ),
      selectedOrderId: orderId
    }))
  },

  async updateOrderNote(orderId, noteId, payload) {
    const updatedOrder = await mockCrmDataSource.updateOrderNote(
      orderId,
      noteId,
      payload
    )

    set(state => ({
      orders: state.orders.map(order =>
        order.id === orderId ? updatedOrder : order
      ),
      selectedOrderId: orderId
    }))
  },

  async deleteOrder(orderId) {
    await mockCrmDataSource.deleteOrder(orderId)

    set(state => ({
      orders: state.orders.filter(order => order.id !== orderId),
      selectedOrderId:
        state.selectedOrderId === orderId ? null : state.selectedOrderId
    }))
  },

  async deleteOrderReturn(orderId, returnId) {
    const updatedOrder = await mockCrmDataSource.deleteOrderReturn(
      orderId,
      returnId
    )

    set(state => ({
      orders: state.orders.map(order =>
        order.id === orderId ? updatedOrder : order
      ),
      selectedOrderId: orderId
    }))
  },

  async deleteOrderDelay(orderId, delayId) {
    const updatedOrder = await mockCrmDataSource.deleteOrderDelay(
      orderId,
      delayId
    )

    set(state => ({
      orders: state.orders.map(order =>
        order.id === orderId ? updatedOrder : order
      ),
      selectedOrderId: orderId
    }))
  },

  async deleteOrderExtraCost(orderId, extraCostId) {
    const updatedOrder = await mockCrmDataSource.deleteOrderExtraCost(
      orderId,
      extraCostId
    )

    set(state => ({
      orders: state.orders.map(order =>
        order.id === orderId ? updatedOrder : order
      ),
      selectedOrderId: orderId
    }))
  },

  async deleteOrderPayment(orderId, paymentId) {
    const updatedOrder = await mockCrmDataSource.deleteOrderPayment(
      orderId,
      paymentId
    )

    set(state => ({
      orders: state.orders.map(order =>
        order.id === orderId ? updatedOrder : order
      ),
      selectedOrderId: orderId
    }))
  },

  async deleteOrderNote(orderId, noteId) {
    const updatedOrder = await mockCrmDataSource.deleteOrderNote(
      orderId,
      noteId
    )

    set(state => ({
      orders: state.orders.map(order =>
        order.id === orderId ? updatedOrder : order
      ),
      selectedOrderId: orderId
    }))
  },

  /* PRODUCTS */

  products: [],
  productCategories: [],
  selectedProductId: null,
  productsFilters: initialProductFilters,
  productsLoading: false,
  productsError: null,

  async loadProducts() {
    set({ productsLoading: true, productsError: null })

    try {
      const [products, productCategories] = await Promise.all([
        mockCrmDataSource.getProducts(initialProductFilters),
        mockCrmDataSource.getProductCategories()
      ])

      set({
        products,
        productCategories,
        productsLoading: false
      })
    } catch (error) {
      set({
        productsError:
          error instanceof Error ? error.message : 'Failed to load products',
        productsLoading: false
      })
    }
  },

  selectProduct(productId) {
    set({
      selectedProductId: productId
    })
  },

  updateProductsFilters(payload) {
    set(state => ({
      productsFilters: {
        ...state.productsFilters,
        ...payload
      }
    }))
  },

  async createProduct(payload) {
    const product = await mockCrmDataSource.createProduct(payload)

    set(state => ({
      products: [product, ...state.products],
      selectedProductId: product.id
    }))
  },

  async updateProduct(productId, payload) {
    const updatedProduct = await mockCrmDataSource.updateProduct(
      productId,
      payload
    )

    set(state => ({
      products: state.products.map(product =>
        product.id === productId ? updatedProduct : product
      ),
      selectedProductId: productId
    }))
  },

  async updateProductStatus(productId, status) {
    const updatedProduct = await mockCrmDataSource.updateProductStatus(
      productId,
      status
    )

    set(state => ({
      products: state.products.map(product =>
        product.id === productId ? updatedProduct : product
      ),
      selectedProductId: productId
    }))
  },

  async duplicateProduct(productId) {
    const product = await mockCrmDataSource.duplicateProduct(productId)

    set(state => ({
      products: [product, ...state.products],
      selectedProductId: product.id
    }))
  },

  async deleteProduct(productId) {
    await mockCrmDataSource.deleteProduct(productId)

    set(state => ({
      products: state.products.filter(product => product.id !== productId),
      selectedProductId:
        state.selectedProductId === productId ? null : state.selectedProductId
    }))
  },

  /* PRODUCT CATEGORIES */
  productCategoryFilters: initialProductCategoryFilters,
  selectedProductCategoryId: null,
  productCategoriesLoading: false,
  productCategoriesError: null,

  async loadProductCategories() {
    set({ productCategoriesLoading: true, productCategoriesError: null })

    try {
      const categories = await mockCrmDataSource.getProductCategories()

      set({
        productCategories: categories,
        productCategoriesLoading: false
      })
    } catch (error) {
      set({
        productCategoriesError:
          error instanceof Error
            ? error.message
            : 'Failed to load product categories',
        productCategoriesLoading: false
      })
    }
  },

  selectProductCategory(categoryId) {
    set({
      selectedProductCategoryId: categoryId
    })
  },

  updateProductCategoryFilters(payload) {
    set(state => ({
      productCategoryFilters: {
        ...state.productCategoryFilters,
        ...payload
      }
    }))
  },

  async createProductCategory(payload) {
    const category = await mockCrmDataSource.createProductCategory(payload)

    set(state => ({
      productCategories: [category, ...state.productCategories],
      selectedProductCategoryId: category.id
    }))
  },

  async updateProductCategory(categoryId, payload) {
    const updatedCategory = await mockCrmDataSource.updateProductCategory(
      categoryId,
      payload
    )

    set(state => ({
      productCategories: state.productCategories.map(category =>
        category.id === categoryId ? updatedCategory : category
      ),
      products: state.products.map(product =>
        product.categoryId === categoryId
          ? {
              ...product,
              categoryName: updatedCategory.name
            }
          : product
      ),
      selectedProductCategoryId: categoryId
    }))
  },

  async updateProductCategoryStatus(categoryId, status) {
    const updatedCategory = await mockCrmDataSource.updateProductCategoryStatus(
      categoryId,
      status
    )

    set(state => ({
      productCategories: state.productCategories.map(category =>
        category.id === categoryId ? updatedCategory : category
      ),
      selectedProductCategoryId: categoryId
    }))
  },

  async duplicateProductCategory(categoryId) {
    const category =
      await mockCrmDataSource.duplicateProductCategory(categoryId)

    set(state => ({
      productCategories: [category, ...state.productCategories],
      selectedProductCategoryId: category.id
    }))
  },

  async deleteProductCategory(categoryId) {
    await mockCrmDataSource.deleteProductCategory(categoryId)

    set(state => ({
      productCategories: state.productCategories.filter(
        category => category.id !== categoryId
      ),
      selectedProductCategoryId:
        state.selectedProductCategoryId === categoryId
          ? null
          : state.selectedProductCategoryId
    }))
  },

  /* AI AGENTS */

  aiAgentRecords: [],
  aiAgentFilters: initialAIAgentFilters,
  selectedAiAgentId: null,
  aiAgentsLoading: false,
  aiAgentsError: null,

  async loadAiAgentRecords() {
    set({
      aiAgentsLoading: true,
      aiAgentsError: null
    })

    try {
      const aiAgentRecords = await mockCrmDataSource.getAiAgentRecords()

      set({
        aiAgentRecords,
        aiAgentsLoading: false
      })
    } catch (error) {
      set({
        aiAgentsError:
          error instanceof Error ? error.message : 'Failed to load AI agents',
        aiAgentsLoading: false
      })
    }
  },

  selectAiAgent(agentId) {
    set({
      selectedAiAgentId: agentId
    })
  },

  updateAiAgentFilters(payload) {
    set(state => ({
      aiAgentFilters: {
        ...state.aiAgentFilters,
        ...payload
      }
    }))
  },

  async createAiAgent(payload) {
    const agent = await mockCrmDataSource.createAiAgentRecord(payload)

    set(state => ({
      aiAgentRecords: [agent, ...state.aiAgentRecords],
      selectedAiAgentId: agent.id
    }))
  },

  async updateAiAgent(agentId, payload) {
    const updatedAgent = await mockCrmDataSource.updateAiAgentRecord(
      agentId,
      payload
    )

    set(state => ({
      aiAgentRecords: state.aiAgentRecords.map(agent =>
        agent.id === agentId ? updatedAgent : agent
      ),
      selectedAiAgentId: agentId
    }))
  },

  async updateAiAgentStatus(agentId, status) {
    const updatedAgent = await mockCrmDataSource.updateAiAgentRecordStatus(
      agentId,
      status
    )

    set(state => ({
      aiAgentRecords: state.aiAgentRecords.map(agent =>
        agent.id === agentId ? updatedAgent : agent
      ),
      selectedAiAgentId: agentId
    }))
  },

  async duplicateAiAgent(agentId) {
    const agent = await mockCrmDataSource.duplicateAiAgentRecord(agentId)

    set(state => ({
      aiAgentRecords: [agent, ...state.aiAgentRecords],
      selectedAiAgentId: agent.id
    }))
  },

  async deleteAiAgent(agentId) {
    await mockCrmDataSource.deleteAiAgentRecord(agentId)

    set(state => ({
      aiAgentRecords: state.aiAgentRecords.filter(
        agent => agent.id !== agentId
      ),
      selectedAiAgentId:
        state.selectedAiAgentId === agentId ? null : state.selectedAiAgentId
    }))
  }
}))
