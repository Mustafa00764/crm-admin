import {
  defaultAIAgentVoiceSettings,
  type AIAgent,
  type AIAgentContextFlag,
  type AIAgentFilters,
  type AIAgentStatus,
  type CreateAIAgentPayload,
  type UpdateAIAgentPayload
} from '@/features/ai-agents/model/ai-agents-types'

const AI_AGENTS_STORAGE_KEY = 'crm.mock.ai-agents'

const AI_AGENTS_PROMPT = `
Ты — AI-ассистент отдела продаж строительных материалов.

Твоя задача:
- консультировать клиентов по товарам сайта;
- помогать подобрать подходящий материал;
- уточнять параметры заказа;
- рекомендовать релевантные товары;
- мягко просить номер телефона, чтобы менеджер мог связаться с клиентом.

Главное правило:
Отвечай только на основе данных сайта, CRM, базы товаров или переданного контекста. Не выдумывай цены, наличие, сроки, характеристики и условия доставки.

Если точных данных нет:
- не обещай наличие;
- не называй точную цену;
- не говори точные сроки;
- объясни, что менеджер уточнит информацию.

Стиль общения:
- вежливо;
- коротко;
- по делу;
- без давления;
- без рекламной воды;
- без фраз вроде "лучший выбор", "идеальное решение", "самое выгодное предложение".

Как вести диалог:
1. Сначала пойми задачу клиента.
2. Уточни назначение материала: кровля, забор, фасад, ангар, перегородка, склад, навес или другое.
3. Уточни параметры:
   - размеры;
   - толщину;
   - покрытие;
   - цвет RAL;
   - объем;
   - город доставки;
   - нужны ли доборы, крепеж или комплектующие.
4. После этого предложи 1–3 подходящих варианта.
5. Объясни, почему они подходят.
6. После полезной консультации попроси номер телефона для связи с менеджером.

Как просить телефон:
Используй мягкие формулировки:

"Оставьте, пожалуйста, номер телефона — менеджер уточнит детали и рассчитает стоимость под ваш объект."

"Могу передать заявку менеджеру. Напишите номер телефона, и с вами свяжутся для расчета."

"Для точного расчета нужны параметры заказа. Оставьте телефон — менеджер уточнит детали и подготовит предложение."

Не начинай диалог сразу с требования телефона.

Если клиент не хочет оставлять номер:
Ответь спокойно:
"Хорошо, можем сначала подобрать вариант здесь. Напишите, пожалуйста, назначение материала, размеры и город доставки."

Если клиент спрашивает цену:
- если цена есть в данных — назови ее и уточни, что итоговая стоимость зависит от параметров заказа;
- если цены нет — не выдумывай.

Ответ:
"Точная стоимость зависит от толщины, покрытия, длины, объема и доставки. Оставьте, пожалуйста, номер телефона — менеджер подготовит расчет."

Если клиент спрашивает наличие:
Ответ:
"Наличие зависит от конкретной позиции, толщины, цвета и объема. Менеджер сможет проверить актуальную информацию. Оставьте, пожалуйста, номер телефона для связи."

Если клиент спрашивает доставку:
Ответ:
"Доставка рассчитывается по адресу, объему и габаритам груза. Напишите город или район доставки. Для точного расчета можно оставить номер телефона — менеджер свяжется и уточнит детали."

После получения телефона:
Ответь:
"Спасибо. Передам заявку менеджеру. Он свяжется с вами, уточнит параметры и подготовит расчет."

Данные заявки собирай в таком виде:
Имя:
Телефон:
Интересующий товар:
Назначение:
Размеры/объем:
Город доставки:
Комментарий клиента:

Ограничения:
- не оформляй заказ самостоятельно;
- не обещай точную цену без данных;
- не обещай наличие без подтверждения;
- не обещай сроки без подтверждения;
- не собирай лишние персональные данные;
- не отвечай на темы, не связанные со строительными материалами и заказом.
`

function uid(prefix: string) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}_${crypto.randomUUID()}`
  }

  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`
}

function now() {
  return new Date().toISOString()
}

function readFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback

  try {
    const value = window.localStorage.getItem(key)
    return value ? (JSON.parse(value) as T) : fallback
  } catch {
    return fallback
  }
}

function saveToStorage<T>(key: string, value: T) {
  if (typeof window === 'undefined') return

  window.localStorage.setItem(key, JSON.stringify(value))
}

const seedAIAgents: AIAgent[] = [
  {
    id: 'ai_agent_sales_001',
    name: 'Sales Assistant',
    description:
      'Помогает менеджеру отвечать клиентам и вести первичный расчёт.',
    role: 'sales',
    version: 'v1.0',
    provider: 'OpenAI',
    model: 'gpt-4.1-mini',
    apiTokenMasked: 'sk-••••••••••••1234',
    systemPrompt: AI_AGENTS_PROMPT,
    salesPrompt:
      'Выяви потребность клиента, уточни объём, город, сроки, материал, толщину, покрытие и необходимость доставки.',
    qualificationPrompt:
      'Оцени готовность клиента к покупке, бюджет, срочность, объект и полноту данных для расчёта.',
    temperature: 0.35,
    maxTokens: 1600,
    status: 'active',
    supportsImages: true,
    supportsFiles: true,
    supportsTools: true,
    useClientContext: true,
    useProductCatalog: true,
    useConversationHistory: true,
    useWebsiteEvents: true,
    useDealsContext: true,
    useOrdersContext: true,
    fallbackToManager: true,
    minConfidenceToAutoReply: 82,
    voiceSettings: defaultAIAgentVoiceSettings,
    createdAt: '2026-05-30T09:00:00.000Z',
    updatedAt: '2026-05-30T09:00:00.000Z'
  },
  {
    id: 'ai_agent_qualification_001',
    name: 'Lead Qualification Agent',
    description: 'Квалифицирует заявки и собирает недостающие данные.',
    role: 'qualification',
    version: 'v1.2',
    provider: 'OpenAI',
    model: 'gpt-4.1-mini',
    apiTokenMasked: 'sk-••••••••••••9821',
    systemPrompt: AI_AGENTS_PROMPT,
    salesPrompt:
      'После сбора данных передай менеджеру краткое резюме: объект, материал, объём, сроки, география.',
    qualificationPrompt:
      'Обязательные поля: город, тип объекта, товар, количество, срок, контакт, способ связи.',
    temperature: 0.25,
    maxTokens: 1200,
    status: 'active',
    supportsImages: false,
    supportsFiles: true,
    supportsTools: true,
    useClientContext: true,
    useProductCatalog: true,
    useConversationHistory: true,
    useWebsiteEvents: true,
    useDealsContext: false,
    useOrdersContext: false,
    fallbackToManager: true,
    minConfidenceToAutoReply: 88,
    voiceSettings: defaultAIAgentVoiceSettings,
    createdAt: '2026-05-30T09:15:00.000Z',
    updatedAt: '2026-05-30T09:15:00.000Z'
  },
  {
    id: 'ai_agent_support_001',
    name: 'Support Agent',
    description: 'Обрабатывает вопросы по заказам, доставке и документам.',
    role: 'support',
    version: 'v1.0',
    provider: 'OpenAI Compatible',
    model: 'llama-3.1-70b',
    baseUrl: 'https://api.example-ai.local/v1',
    apiTokenMasked: 'tok-••••••••••••4410',
    systemPrompt: AI_AGENTS_PROMPT,
    salesPrompt:
      'Если вопрос связан с новой покупкой, передай менеджеру и предложи собрать параметры.',
    qualificationPrompt:
      'Определи: это поддержка текущего заказа, рекламация, доставка, документы или новая заявка.',
    temperature: 0.2,
    maxTokens: 1400,
    status: 'disabled',
    supportsImages: true,
    supportsFiles: true,
    supportsTools: false,
    useClientContext: true,
    useProductCatalog: false,
    useConversationHistory: true,
    useWebsiteEvents: false,
    useDealsContext: false,
    useOrdersContext: true,
    fallbackToManager: true,
    minConfidenceToAutoReply: 90,
    voiceSettings: defaultAIAgentVoiceSettings,
    createdAt: '2026-05-30T09:30:00.000Z',
    updatedAt: '2026-05-30T09:30:00.000Z'
  },
  {
    id: 'ai_agent_product_001',
    name: 'Product Expert',
    description: 'Помогает подобрать товар по техническим параметрам.',
    role: 'product_expert',
    version: 'v2.0',
    provider: 'Anthropic',
    model: 'claude-3-5-sonnet',
    apiTokenMasked: 'ant-••••••••••••7742',
    systemPrompt: AI_AGENTS_PROMPT,
    salesPrompt:
      'Подбери категорию товара, толщину, покрытие, комплектующие и вопросы для расчёта.',
    qualificationPrompt:
      'Проверь, хватает ли данных: объект, нагрузка, регион, покрытие, геометрия, объём.',
    temperature: 0.3,
    maxTokens: 1800,
    status: 'active',
    supportsImages: true,
    supportsFiles: true,
    supportsTools: true,
    useClientContext: true,
    useProductCatalog: true,
    useConversationHistory: true,
    useWebsiteEvents: false,
    useDealsContext: true,
    useOrdersContext: false,
    fallbackToManager: true,
    minConfidenceToAutoReply: 80,
    voiceSettings: defaultAIAgentVoiceSettings,
    createdAt: '2026-05-30T09:45:00.000Z',
    updatedAt: '2026-05-30T09:45:00.000Z'
  }
]

let aiAgents: AIAgent[] = readFromStorage(AI_AGENTS_STORAGE_KEY, seedAIAgents)

function normalizeAIAgent(agent: AIAgent): AIAgent {
  return {
    ...agent,
    role: agent.role ?? 'custom',
    version: agent.version ?? 'v1.0',
    temperature: clamp(agent.temperature, 0, 2),
    minConfidenceToAutoReply: clamp(agent.minConfidenceToAutoReply, 0, 100),
    supportsImages: Boolean(agent.supportsImages),
    supportsFiles: Boolean(agent.supportsFiles),
    supportsTools: Boolean(agent.supportsTools),
    useClientContext: Boolean(agent.useClientContext),
    useProductCatalog: Boolean(agent.useProductCatalog),
    useConversationHistory: Boolean(agent.useConversationHistory),
    useWebsiteEvents: Boolean(agent.useWebsiteEvents),
    useDealsContext: Boolean(agent.useDealsContext),
    useOrdersContext: Boolean(agent.useOrdersContext),
    fallbackToManager: Boolean(agent.fallbackToManager),
    voiceSettings: {
      ...defaultAIAgentVoiceSettings,
      ...(agent.voiceSettings ?? {})
    }
  }
}

function clamp(value: number, min: number, max: number) {
  if (Number.isNaN(value)) return min
  return Math.min(max, Math.max(min, value))
}

function hasContextFlag(agent: AIAgent, flag: AIAgentContextFlag) {
  const map: Record<AIAgentContextFlag, boolean> = {
    client_context: agent.useClientContext,
    product_catalog: agent.useProductCatalog,
    conversation_history: agent.useConversationHistory,
    website_events: agent.useWebsiteEvents,
    deals_context: agent.useDealsContext,
    orders_context: agent.useOrdersContext
  }

  return map[flag]
}

function applyAIAgentFilters(items: AIAgent[], filters?: AIAgentFilters) {
  if (!filters) return items

  return items.filter(agent => {
    const search = filters.search.trim().toLowerCase()

    if (search) {
      const haystack = [
        agent.name,
        agent.description,
        agent.role,
        agent.version,
        agent.provider,
        agent.model,
        agent.status,
        agent.systemPrompt,
        agent.salesPrompt,
        agent.qualificationPrompt
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      if (!haystack.includes(search)) return false
    }

    if (filters.provider !== 'all' && agent.provider !== filters.provider) {
      return false
    }

    if (filters.status !== 'all' && agent.status !== filters.status) {
      return false
    }

    if (filters.role !== 'all' && agent.role !== filters.role) {
      return false
    }

    if (
      filters.supportsImages !== 'all' &&
      agent.supportsImages !== (filters.supportsImages === 'yes')
    ) {
      return false
    }

    if (
      filters.supportsFiles !== 'all' &&
      agent.supportsFiles !== (filters.supportsFiles === 'yes')
    ) {
      return false
    }

    if (
      filters.supportsTools !== 'all' &&
      agent.supportsTools !== (filters.supportsTools === 'yes')
    ) {
      return false
    }

    if (
      filters.fallbackToManager !== 'all' &&
      agent.fallbackToManager !== (filters.fallbackToManager === 'yes')
    ) {
      return false
    }

    if (
      filters.contextFlag !== 'all' &&
      !hasContextFlag(agent, filters.contextFlag)
    ) {
      return false
    }

    return true
  })
}

function replaceAIAgent(updatedAgent: AIAgent) {
  aiAgents = aiAgents.map(agent =>
    agent.id === updatedAgent.id ? updatedAgent : agent
  )

  saveToStorage(AI_AGENTS_STORAGE_KEY, aiAgents)

  return updatedAgent
}

export const mockAIAgentsDataSource = {
  async getAiAgentRecords(filters?: AIAgentFilters) {
    await new Promise(resolve => setTimeout(resolve, 80))

    aiAgents = aiAgents.map(normalizeAIAgent)

    return applyAIAgentFilters(
      [...aiAgents].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
      filters
    )
  },

  async createAiAgentRecord(payload: CreateAIAgentPayload) {
    const createdAt = now()

    const agent: AIAgent = normalizeAIAgent({
      id: uid('ai_agent'),
      ...payload,
      createdAt,
      updatedAt: createdAt
    })

    aiAgents = [agent, ...aiAgents]
    saveToStorage(AI_AGENTS_STORAGE_KEY, aiAgents)

    return agent
  },

  async updateAiAgentRecord(agentId: string, payload: UpdateAIAgentPayload) {
    const agent = aiAgents.find(item => item.id === agentId)

    if (!agent) {
      throw new Error('AI agent not found')
    }

    const updatedAgent = normalizeAIAgent({
      ...agent,
      ...payload,
      updatedAt: now()
    })

    return replaceAIAgent(updatedAgent)
  },

  async updateAiAgentRecordStatus(agentId: string, status: AIAgentStatus) {
    const agent = aiAgents.find(item => item.id === agentId)

    if (!agent) {
      throw new Error('AI agent not found')
    }

    return replaceAIAgent({
      ...agent,
      status,
      updatedAt: now()
    })
  },

  async duplicateAiAgentRecord(agentId: string) {
    const agent = aiAgents.find(item => item.id === agentId)

    if (!agent) {
      throw new Error('AI agent not found')
    }

    const createdAt = now()

    const duplicatedAgent: AIAgent = {
      ...agent,
      id: uid('ai_agent'),
      name: `${agent.name} copy`,
      version: incrementCopyVersion(agent.version),
      status: 'disabled',
      createdAt,
      updatedAt: createdAt
    }

    aiAgents = [duplicatedAgent, ...aiAgents]
    saveToStorage(AI_AGENTS_STORAGE_KEY, aiAgents)

    return duplicatedAgent
  },

  async deleteAiAgentRecord(agentId: string) {
    aiAgents = aiAgents.filter(agent => agent.id !== agentId)
    saveToStorage(AI_AGENTS_STORAGE_KEY, aiAgents)
  }
}
function incrementCopyVersion(version: string) {
  if (!version.trim()) return 'v1.0-copy'

  return `${version}-copy`
}
