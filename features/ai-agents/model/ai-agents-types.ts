export type AIAgentProvider =
  | 'OpenAI'
  | 'Anthropic'
  | 'OpenAI Compatible'
  | 'Custom'

export type AIAgentStatus = 'active' | 'disabled' | 'error'

export type AIAgentRole =
  | 'sales'
  | 'qualification'
  | 'support'
  | 'product_expert'
  | 'manager_assistant'
  | 'custom'

export type AIAgentContextFlag =
  | 'client_context'
  | 'product_catalog'
  | 'conversation_history'
  | 'website_events'
  | 'deals_context'
  | 'orders_context'

export type AIAgent = {
  id: string
  name: string
  description?: string

  role: AIAgentRole
  version: string

  provider: AIAgentProvider
  model: string
  baseUrl?: string
  apiTokenMasked?: string
  apiTokenEncrypted?: string

  systemPrompt: string
  salesPrompt: string
  qualificationPrompt: string

  temperature: number
  maxTokens?: number

  status: AIAgentStatus

  supportsImages: boolean
  supportsFiles: boolean
  supportsTools: boolean

  useClientContext: boolean
  useProductCatalog: boolean
  useConversationHistory: boolean
  useWebsiteEvents: boolean
  useDealsContext: boolean
  useOrdersContext: boolean

  fallbackToManager: boolean
  minConfidenceToAutoReply: number

  createdAt: string
  updatedAt: string
}

export type AIAgentFilters = {
  search: string
  provider: AIAgentProvider | 'all'
  status: AIAgentStatus | 'all'
  role: AIAgentRole | 'all'
  supportsImages: 'all' | 'yes' | 'no'
  supportsFiles: 'all' | 'yes' | 'no'
  supportsTools: 'all' | 'yes' | 'no'
  fallbackToManager: 'all' | 'yes' | 'no'
  contextFlag: AIAgentContextFlag | 'all'
}

export type CreateAIAgentPayload = {
  name: string
  description?: string

  role: AIAgentRole
  version: string

  provider: AIAgentProvider
  model: string
  baseUrl?: string
  apiTokenMasked?: string

  systemPrompt: string
  salesPrompt: string
  qualificationPrompt: string

  temperature: number
  maxTokens?: number

  status: AIAgentStatus

  supportsImages: boolean
  supportsFiles: boolean
  supportsTools: boolean

  useClientContext: boolean
  useProductCatalog: boolean
  useConversationHistory: boolean
  useWebsiteEvents: boolean
  useDealsContext: boolean
  useOrdersContext: boolean

  fallbackToManager: boolean
  minConfidenceToAutoReply: number
}

export type UpdateAIAgentPayload = Partial<CreateAIAgentPayload>

export const aiAgentProviders: Array<{
  value: AIAgentProvider
  label: string
}> = [
  { value: 'OpenAI', label: 'OpenAI' },
  { value: 'Anthropic', label: 'Anthropic' },
  { value: 'OpenAI Compatible', label: 'OpenAI Compatible' },
  { value: 'Custom', label: 'Custom' }
]

export const aiAgentStatuses: Array<{
  value: AIAgentStatus
  label: string
}> = [
  { value: 'active', label: 'Active' },
  { value: 'disabled', label: 'Disabled' },
  { value: 'error', label: 'Error' }
]

export const aiAgentRoles: Array<{
  value: AIAgentRole
  label: string
}> = [
  { value: 'sales', label: 'Sales' },
  { value: 'qualification', label: 'Qualification' },
  { value: 'support', label: 'Support' },
  { value: 'product_expert', label: 'Product expert' },
  { value: 'manager_assistant', label: 'Manager assistant' },
  { value: 'custom', label: 'Custom' }
]

export const aiAgentContextFlags: Array<{
  value: AIAgentContextFlag
  label: string
}> = [
  { value: 'client_context', label: 'Client context' },
  { value: 'product_catalog', label: 'Product catalog' },
  { value: 'conversation_history', label: 'Conversation history' },
  { value: 'website_events', label: 'Website events' },
  { value: 'deals_context', label: 'Deals context' },
  { value: 'orders_context', label: 'Orders context' }
]

export const initialAIAgentFilters: AIAgentFilters = {
  search: '',
  provider: 'all',
  status: 'all',
  role: 'all',
  supportsImages: 'all',
  supportsFiles: 'all',
  supportsTools: 'all',
  fallbackToManager: 'all',
  contextFlag: 'all'
}