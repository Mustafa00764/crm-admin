import { NextResponse } from 'next/server'

type ChatAttachment = {
  id: string
  name: string
  type: 'image' | 'video' | 'file' | 'audio'
  mimeType: string
  dataUrl?: string
}

type ChatMessage = {
  role: 'user' | 'assistant' | 'system'
  content: string
}

type ChatRequestBody = {
  model?: string
  systemPrompt: string
  salesPrompt?: string
  qualificationPrompt?: string
  temperature?: number
  maxTokens?: number
  messages: ChatMessage[]
  attachments?: ChatAttachment[]
}

function extractOutputText(data: unknown) {
  const record = data as {
    output_text?: string
    output?: Array<{
      content?: Array<{
        text?: string
      }>
    }>
  }

  if (typeof record.output_text === 'string') {
    return record.output_text
  }

  const outputText =
    record.output
      ?.flatMap(item => item.content ?? [])
      .map(item => item.text)
      .filter(Boolean)
      .join('\n') ?? ''

  return outputText
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { error: 'OPENAI_API_KEY is not configured' },
      { status: 500 }
    )
  }

  const body = (await request.json()) as ChatRequestBody

  const model = body.model || process.env.OPENAI_DEFAULT_CHAT_MODEL || 'gpt-5.4-mini'

  const lastUserMessage = [...body.messages]
    .reverse()
    .find(message => message.role === 'user')

  const imageInputs =
    body.attachments
      ?.filter(
        attachment =>
          attachment.type === 'image' &&
          attachment.dataUrl &&
          attachment.mimeType.startsWith('image/')
      )
      .slice(0, 4)
      .map(attachment => ({
        type: 'input_image',
        image_url: attachment.dataUrl
      })) ?? []

  const input = [
    {
      role: 'system',
      content: [
        {
          type: 'input_text',
          text: [
            body.systemPrompt,
            body.salesPrompt ? `Sales prompt:\n${body.salesPrompt}` : '',
            body.qualificationPrompt
              ? `Qualification prompt:\n${body.qualificationPrompt}`
              : ''
          ]
            .filter(Boolean)
            .join('\n\n')
        }
      ]
    },
    ...body.messages.slice(-16).map(message => ({
      role: message.role === 'assistant' ? 'assistant' : 'user',
      content: [
        {
          type: message.role === 'assistant' ? 'output_text' : 'input_text',
          text: message.content
        }
      ]
    })),
    ...(imageInputs.length > 0 && lastUserMessage
      ? [
          {
            role: 'user',
            content: [
              {
                type: 'input_text',
                text:
                  'Пользователь также приложил изображения. Проанализируй их, если это важно для ответа.'
              },
              ...imageInputs
            ]
          }
        ]
      : [])
  ]

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      input,
      temperature: body.temperature ?? 0.35,
      max_output_tokens: body.maxTokens ?? 1800
    })
  })

  if (!response.ok) {
    const errorText = await response.text()

    return NextResponse.json(
      { error: errorText || 'OpenAI request failed' },
      { status: response.status }
    )
  }

  const data = await response.json()
  const text = extractOutputText(data)

  return NextResponse.json({
    text: text || 'Пустой ответ модели.',
    model
  })
}