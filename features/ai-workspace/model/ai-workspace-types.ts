export type AIWorkspaceAttachmentType = 'image' | 'video' | 'file' | 'audio'

export type AIWorkspaceAttachment = {
  id: string
  name: string
  type: AIWorkspaceAttachmentType
  mimeType: string
  sizeBytes: number
  dataUrl?: string
  objectUrl?: string
  createdAt: string
}

export type AIWorkspaceMessageRole = 'user' | 'assistant' | 'system'

export type AIWorkspaceMessage = {
  id: string
  chatId: string
  role: AIWorkspaceMessageRole
  content: string
  attachments: AIWorkspaceAttachment[]
  model?: string
  audioUrl?: string
  transcript?: string
  createdAt: string
}

export type AIWorkspaceChat = {
  id: string
  title: string
  agentId: string | null
  model: string
  createdAt: string
  updatedAt: string
}