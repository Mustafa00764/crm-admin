import type {
  AIAgentOption,
  Conversation,
  ConversationFilters,
  CRMMessage,
  SendMessagePayload
} from '@/features/conversations/model/conversations-types'
import type { ClientNoteSummary } from '@/features/conversations/model/conversations-types'

const now = '2026-05-30T04:40:00+05:00'

function uid(prefix: string) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}_${crypto.randomUUID()}`
  }

  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`
}

const aiAgents: AIAgentOption[] = [
  {
    id: 'ai_gpt_5_sales',
    name: 'ChatGPT 5 Sales',
    provider: 'OpenAI',
    model: 'gpt-5',
    status: 'active',
    mode: 'hybrid',
    minConfidenceToAutoReply: 82
  },
  {
    id: 'ai_gpt_5_mini_fast',
    name: 'ChatGPT 5 Mini Fast',
    provider: 'OpenAI',
    model: 'gpt-5-mini',
    status: 'active',
    mode: 'ai_auto',
    minConfidenceToAutoReply: 88
  },
  {
    id: 'ai_gpt_5_technical',
    name: 'ChatGPT 5 Technical Consultant',
    provider: 'OpenAI',
    model: 'gpt-5',
    status: 'active',
    mode: 'ai_suggest',
    minConfidenceToAutoReply: 90
  },
  {
    id: 'ai_claude_sonnet_sales',
    name: 'Claude Sonnet Sales',
    provider: 'Anthropic',
    model: 'claude-sonnet',
    status: 'active',
    mode: 'hybrid',
    minConfidenceToAutoReply: 84
  },
  {
    id: 'ai_cloud_custom_calc',
    name: 'Cloud Custom Calculator',
    provider: 'Custom',
    model: 'cloud-calculator-v1',
    status: 'active',
    mode: 'ai_suggest',
    minConfidenceToAutoReply: 86
  },
  {
    id: 'ai_support_safe',
    name: 'Support Safe Mode',
    provider: 'OpenAI Compatible',
    model: 'support-safe-v1',
    status: 'active',
    mode: 'manual',
    minConfidenceToAutoReply: 95
  }
]

const initialConversations: Conversation[] = [
  {
    id: 'conv_001',
    clientId: 'client_001',
    clientName: 'Андрей Мельников',
    channel: 'telegram',
    source: 'Telegram Bot',
    websiteId: 'site_001',
    websiteDomain: 'sandwichpanelsvspb.ru',
    botId: 'bot_001',
    botName: 'Telegram Sales Bot',
    externalChatId: 'tg_845102',
    externalUserId: 'tg_user_845102',
    assignedSellerId: 'u_001',
    assignedSellerName: 'Максим Орлов',
    status: 'waiting_manager',
    unreadCount: 3,
    unreadByUserIds: ['u_001'],
    isSavedByCurrentUser: true,
    lastMessage:
      'Нужно посчитать 420 м² стеновых PIR панелей, доставка в Гатчину.',
    lastMessageAt: '04:28',
    createdAt: now,
    updatedAt: now,
    aiSettings: {
      enabled: true,
      mode: 'hybrid',
      aiAgentId: 'ai_001',
      aiAgentName: 'AI Sales Consultant',
      allowAutoReply: true,
      requireManagerApproval: false,
      minConfidenceToAutoReply: 82,
      fallbackToManager: true,
      lastAiReplyAt: '04:24'
    },
    aiCollectedInfo: {
      conversationId: 'conv_001',
      clientId: 'client_001',
      productCategory: 'Сэндвич-панели',
      productName: 'Стеновые PIR панели',
      objectType: 'складское помещение',
      panelType: 'wall',
      insulation: 'PIR',
      thickness: '100 мм',
      metalThickness: '0.5/0.5',
      coating: 'Полиэстер',
      ralColor: 'RAL 9003',
      volume: 420,
      unit: 'm2',
      city: 'Гатчина',
      deliveryNeeded: true,
      urgency: 'this_week',
      budget: { rub: 1250000, uzs: 172500000 },
      detectedIntent: 'calculation_request',
      missingFields: ['точный адрес доставки', 'тип замка', 'нужны ли доборы'],
      leadScore: 86,
      confidence: 78,
      summary:
        'Клиенту нужен расчёт стеновых PIR-панелей 100 мм для склада. Объём около 420 м², доставка в Гатчину, интересует быстрый срок.',
      suggestedNextQuestion:
        'Уточните, пожалуйста, точный адрес доставки и нужны ли доборные элементы для углов, цоколя и примыканий.',
      suggestedReply:
        'Андрей, для расчёта стеновых PIR-панелей 100 мм на 420 м² уточните точный адрес доставки в Гатчине, цвет RAL и нужны ли доборные элементы. После этого подготовим спецификацию и ориентировочную сумму.',
      recommendedManagerAction: 'take_over',
      updatedAt: now
    },
    client: {
      id: 'client_001',
      fullName: 'Андрей Мельников',
      companyName: 'ООО СеверСтрой',
      phone: '+7 921 000-12-44',
      email: 'melnikov@example.ru',
      telegramUsername: '@melnikov_build',
      city: 'Гатчина',
      region: 'Ленинградская область',
      source: 'telegram',
      channel: 'telegram',
      websiteDomain: 'sandwichpanelsvspb.ru',
      botName: 'Telegram Sales Bot',
      assignedSellerName: 'Максим Орлов',
      productInterest: 'Стеновые PIR панели',
      status: 'calculation',
      totalOrders: 4,
      activeOrders: 1,
      paidOrders: 3,
      unpaidOrders: 1,
      totalOrderedAmount: { rub: 3840000, uzs: 529920000 },
      totalPaidAmount: { rub: 2910000, uzs: 401580000 },
      totalDebtAmount: { rub: 930000, uzs: 128340000 }
    },
    activeDeal: {
      id: 'deal_001',
      number: 'DL-1042',
      title: 'Стеновые PIR панели 420 м²',
      stage: 'need_calculation',
      amount: { rub: 1250000, uzs: 172500000 },
      finalAmount: { rub: 1190000, uzs: 164220000 },
      probability: 72
    },
    clientOrders: [
      {
        id: 'ord_1040',
        number: 'ORD-1040',
        status: 'completed',
        paymentStatus: 'paid',
        total: { rub: 980000, uzs: 135240000 },
        paid: { rub: 980000, uzs: 135240000 },
        debt: { rub: 0, uzs: 0 },
        createdAt: '2026-05-12'
      },
      {
        id: 'ord_1048',
        number: 'ORD-1048',
        status: 'delivery_delayed',
        paymentStatus: 'partially_paid',
        total: { rub: 1260000, uzs: 173880000 },
        paid: { rub: 620000, uzs: 85560000 },
        debt: { rub: 640000, uzs: 88320000 },
        createdAt: '2026-05-26'
      }
    ],
    activitySessions: [
      {
        id: 'sess_001',
        channel: 'website',
        websiteDomain: 'sandwichpanelsvspb.ru',
        firstPageUrl: '/sendvich-paneli/stenovye',
        lastPageUrl: '/sendvich-paneli/pir',
        pageViews: 8,
        productViews: 4,
        chatMessages: 2,
        telegramClicks: 1,
        whatsappClicks: 0,
        durationSec: 740,
        status: 'converted_to_lead',
        startedAt: '2026-05-30 03:58'
      }
    ],
    notes: [
      {
        id: 'note_001',
        type: 'important',
        authorName: 'Максим Орлов',
        text: 'Клиент уже покупал панели. Просит быстрый расчёт и доставку до конца недели.',
        pinned: true,
        createdAt: '2026-05-30 04:15'
      }
    ],
    messages: [
      {
        id: 'msg_001',
        conversationId: 'conv_001',
        author: 'client',
        senderName: 'Андрей Мельников',
        text: 'Здравствуйте. Нужно посчитать стеновые PIR панели примерно 420 квадратов.',
        attachments: [],
        status: 'read',
        readBy: [],
        channel: 'telegram',
        createdAt: '04:18'
      },
      {
        id: 'msg_002',
        conversationId: 'conv_001',
        author: 'ai',
        senderName: 'AI Sales Consultant',
        text: 'Здравствуйте. Уточните толщину панели, цвет RAL и город доставки.',
        attachments: [],
        status: 'delivered',
        readBy: [],
        isAiGenerated: true,
        aiAgentId: 'ai_001',
        aiAgentName: 'AI Sales Consultant',
        aiConfidence: 91,
        channel: 'telegram',
        createdAt: '04:19'
      },
      {
        id: 'msg_003',
        conversationId: 'conv_001',
        author: 'client',
        senderName: 'Андрей Мельников',
        text: 'Толщина 100 мм, цвет белый, доставка в Гатчину. Нужны сроки и цена.',
        attachments: [
          {
            id: 'att_001',
            kind: 'document',
            name: 'plan-sklad.pdf',
            size: 248000,
            downloadable: true,
            createdAt: '04:21'
          }
        ],
        status: 'read',
        readBy: [],
        channel: 'telegram',
        createdAt: '04:21'
      }
    ]
  },
  {
    id: 'conv_002',
    clientId: 'client_002',
    clientName: 'Елена Петрова',
    channel: 'whatsapp',
    source: 'WhatsApp Bot',
    botId: 'bot_002',
    botName: 'WhatsApp Lead Bot',
    assignedSellerId: 'u_002',
    assignedSellerName: 'Анна Смирнова',
    status: 'ai_answering',
    unreadCount: 0,
    unreadByUserIds: [],
    isSavedByCurrentUser: false,
    lastMessage: 'Можно цену на профнастил НС35 для забора?',
    lastMessageAt: '04:12',
    createdAt: now,
    updatedAt: now,
    aiSettings: {
      enabled: true,
      mode: 'ai_suggest',
      aiAgentId: 'ai_002',
      aiAgentName: 'AI Calculator Assistant',
      allowAutoReply: false,
      requireManagerApproval: true,
      minConfidenceToAutoReply: 88,
      fallbackToManager: true
    },
    aiCollectedInfo: {
      conversationId: 'conv_002',
      clientId: 'client_002',
      productCategory: 'Профнастил',
      productName: 'НС35 для забора',
      profileMark: 'НС35',
      volume: 180,
      unit: 'm2',
      city: 'Всеволожск',
      deliveryNeeded: true,
      detectedIntent: 'price_request',
      missingFields: ['толщина металла', 'цвет RAL', 'высота листа'],
      leadScore: 64,
      confidence: 74,
      summary:
        'Запрос цены на профнастил НС35 для забора. Не хватает толщины, цвета и размеров.',
      suggestedNextQuestion:
        'Уточните толщину металла, цвет RAL и высоту листа.',
      suggestedReply:
        'Елена, для точного расчёта профнастила НС35 уточните толщину металла, цвет RAL и высоту листа. Также напишите, нужна ли доставка во Всеволожск.',
      recommendedManagerAction: 'ask_clarification',
      updatedAt: now
    },
    client: {
      id: 'client_002',
      fullName: 'Елена Петрова',
      phone: '+7 911 222-33-44',
      whatsappPhone: '+7 911 222-33-44',
      city: 'Всеволожск',
      region: 'Ленинградская область',
      source: 'whatsapp',
      channel: 'whatsapp',
      botName: 'WhatsApp Lead Bot',
      assignedSellerName: 'Анна Смирнова',
      productInterest: 'Профнастил НС35',
      status: 'ai_active',
      totalOrders: 0,
      activeOrders: 0,
      paidOrders: 0,
      unpaidOrders: 0,
      totalOrderedAmount: { rub: 0, uzs: 0 },
      totalPaidAmount: { rub: 0, uzs: 0 },
      totalDebtAmount: { rub: 0, uzs: 0 }
    },
    clientOrders: [],
    activitySessions: [],
    notes: [],
    messages: [
      {
        id: 'msg_010',
        conversationId: 'conv_002',
        author: 'client',
        senderName: 'Елена Петрова',
        text: 'Можно цену на профнастил НС35 для забора?',
        attachments: [],
        status: 'read',
        readBy: [],
        channel: 'whatsapp',
        createdAt: '04:12'
      }
    ]
  }
]

let conversations = [...initialConversations]

function getConversationOrThrow(conversationId: string) {
  const conversation = conversations.find(item => item.id === conversationId)

  if (!conversation) {
    throw new Error('Conversation not found')
  }

  return conversation
}

function applyFilters(items: Conversation[], filters: ConversationFilters) {
  return items.filter(item => {
    const search = filters.search.trim().toLowerCase()

    const matchesSearch =
      search.length === 0 ||
      item.clientName.toLowerCase().includes(search) ||
      item.lastMessage.toLowerCase().includes(search) ||
      item.client.phone?.toLowerCase().includes(search) ||
      item.client.email?.toLowerCase().includes(search)

    const matchesChannel =
      filters.channel === 'all' || item.channel === filters.channel
    const matchesStatus =
      filters.status === 'all' || item.status === filters.status
    const matchesAi =
      filters.aiMode === 'all' || item.aiSettings.mode === filters.aiMode

    const matchesSaved =
      filters.saved === 'all' ||
      (filters.saved === 'saved' && item.isSavedByCurrentUser) ||
      (filters.saved === 'not_saved' && !item.isSavedByCurrentUser)

    return (
      matchesSearch &&
      matchesChannel &&
      matchesStatus &&
      matchesAi &&
      matchesSaved
    )
  })
}

function updateConversation(id: string, patch: Partial<Conversation>) {
  const existing = conversations.find(item => item.id === id)

  if (!existing) {
    throw new Error('Conversation not found')
  }

  const updated: Conversation = {
    ...existing,
    ...patch,
    updatedAt: new Date().toISOString()
  }

  conversations = conversations.map(item => (item.id === id ? updated : item))
  return updated
}

export const mockConversationsDataSource = {
  async getConversations(filters: ConversationFilters) {
    await new Promise(resolve => setTimeout(resolve, 180))
    return applyFilters(conversations, filters)
  },

  async getConversationById(id: string) {
    await new Promise(resolve => setTimeout(resolve, 120))
    return conversations.find(item => item.id === id) ?? null
  },

  async sendMessage(conversationId: string, payload: SendMessagePayload) {
    const conversation = getConversationOrThrow(conversationId)

    const message: CRMMessage = {
      id: uid('msg'),
      conversationId,
      author: 'manager',
      senderId: 'u_current',
      senderName: 'Manager',
      text: payload.text,
      attachments: payload.attachments ?? [],
      replyTo: payload.replyTo,
      status: 'sent',
      readBy: [],
      channel: conversation.channel,
      createdAt: new Date().toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    updateConversation(conversationId, {
      messages: [...conversation.messages, message],
      lastMessage:
        payload.text ||
        payload.attachments?.map(item => item.name).join(', ') ||
        'attachment',
      lastMessageAt: message.createdAt,
      status: 'waiting_client',
      unreadCount: 0
    })

    return message
  },

  async takeOverConversation(conversationId: string) {
    const conversation = conversations.find(item => item.id === conversationId)
    return updateConversation(conversationId, {
      status: 'manager_took_over',
      aiSettings: conversation
        ? {
            ...conversation.aiSettings,
            mode: 'manual',
            enabled: false,
            disabledByUserId: 'u_current',
            disabledAt: new Date().toISOString()
          }
        : undefined
    })
  },

  async returnConversationToAI(conversationId: string) {
    const conversation = conversations.find(item => item.id === conversationId)
    return updateConversation(conversationId, {
      status: 'ai_answering',
      aiSettings: conversation
        ? {
            ...conversation.aiSettings,
            mode: 'hybrid',
            enabled: true,
            changedByUserId: 'u_current',
            changedAt: new Date().toISOString()
          }
        : undefined
    })
  },

  async disableAIForConversation(conversationId: string) {
    const conversation = conversations.find(item => item.id === conversationId)
    return updateConversation(conversationId, {
      aiSettings: conversation
        ? {
            ...conversation.aiSettings,
            enabled: false,
            mode: 'manual',
            disabledByUserId: 'u_current',
            disabledAt: new Date().toISOString()
          }
        : undefined
    })
  },

  async enableAIForConversation(conversationId: string) {
    const conversation = conversations.find(item => item.id === conversationId)
    return updateConversation(conversationId, {
      aiSettings: conversation
        ? {
            ...conversation.aiSettings,
            enabled: true,
            mode: 'hybrid',
            changedByUserId: 'u_current',
            changedAt: new Date().toISOString()
          }
        : undefined
    })
  },

  async saveConversation(conversationId: string) {
    return updateConversation(conversationId, { isSavedByCurrentUser: true })
  },

  async unsaveConversation(conversationId: string) {
    return updateConversation(conversationId, { isSavedByCurrentUser: false })
  },

  async closeConversation(conversationId: string) {
    return updateConversation(conversationId, { status: 'closed' })
  },

  async markConversationAsSpam(conversationId: string) {
    return updateConversation(conversationId, { status: 'spam' })
  },

  async getAiAgents() {
    await new Promise(resolve => setTimeout(resolve, 100))
    return aiAgents
  },

  async changeConversationAIAgent(conversationId: string, aiAgentId: string) {
    const conversation = getConversationOrThrow(conversationId)
    const agent = aiAgents.find(item => item.id === aiAgentId)

    if (!agent) {
      throw new Error('AI agent not found')
    }

    return updateConversation(conversationId, {
      aiSettings: {
        ...conversation.aiSettings,
        aiAgentId: agent.id,
        aiAgentName: agent.name,
        mode: agent.mode,
        minConfidenceToAutoReply: agent.minConfidenceToAutoReply,
        changedByUserId: 'u_current',
        changedAt: new Date().toISOString()
      }
    })
  },

  async updateMessage(conversationId: string, messageId: string, text: string) {
    const conversation = getConversationOrThrow(conversationId)
    const message = conversation.messages.find(item => item.id === messageId)

    if (!message) {
      throw new Error('Message not found')
    }

    const updatedMessage: CRMMessage = {
      ...message,
      text,
      updatedAt: new Date().toISOString()
    }

    updateConversation(conversationId, {
      messages: conversation.messages.map(item =>
        item.id === messageId ? updatedMessage : item
      ),
      lastMessage:
        conversation.messages.at(-1)?.id === messageId
          ? text
          : conversation.lastMessage
    })

    return updatedMessage
  },

  async deleteMessage(conversationId: string, messageId: string) {
    const conversation = getConversationOrThrow(conversationId)

    updateConversation(conversationId, {
      messages: conversation.messages.filter(item => item.id !== messageId)
    })
  },

  async addConversationNote(
    conversationId: string,
    payload: {
      type: ClientNoteSummary['type']
      text: string
      pinned?: boolean
    }
  ) {
    const conversation = getConversationOrThrow(conversationId)

    const note: ClientNoteSummary = {
      id: uid('note'),
      type: payload.type,
      authorName: 'Manager',
      text: payload.text,
      pinned: payload.pinned ?? false,
      createdAt: new Date().toLocaleString('ru-RU')
    }

    updateConversation(conversationId, {
      notes: [note, ...conversation.notes]
    })

    return note
  },

  async updateConversationNote(
    conversationId: string,
    noteId: string,
    payload: {
      type?: ClientNoteSummary['type']
      text?: string
      pinned?: boolean
    }
  ) {
    const conversation = getConversationOrThrow(conversationId)
    const note = conversation.notes.find(item => item.id === noteId)

    if (!note) {
      throw new Error('Note not found')
    }

    const updatedNote: ClientNoteSummary = {
      ...note,
      ...payload
    }

    updateConversation(conversationId, {
      notes: conversation.notes.map(item =>
        item.id === noteId ? updatedNote : item
      )
    })

    return updatedNote
  },

  async deleteConversationNote(conversationId: string, noteId: string) {
    const conversation = getConversationOrThrow(conversationId)

    updateConversation(conversationId, {
      notes: conversation.notes.filter(item => item.id !== noteId)
    })
  }
}
