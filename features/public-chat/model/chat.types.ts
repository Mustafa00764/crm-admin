export type PublicChatAttachment = {
  id: string
  name: string
  type: string
  size: number
  dataUrl: string
}

export type PublicChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  attachments?: PublicChatAttachment[]
}

export type LeadFormData = {
  name: string
  phone: string
  city: string
  comment: string
}

export type RealtimeEvent = {
  type?: string
  delta?: string
  transcript?: string
  text?: string
  item_id?: string
  response_id?: string
  response?: {
    id?: string
    output?: Array<{
      content?: Array<{
        transcript?: string
        text?: string
      }>
    }>
  }
  error?: {
    message?: string
    code?: string
  }
}

export type VoiceMode = 'idle' | 'assistant' | 'dictation'

export type DictationLanguage = 'ru' | 'uz' | 'en' | 'auto'
