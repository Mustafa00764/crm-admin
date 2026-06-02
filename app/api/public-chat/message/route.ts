import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

type PublicChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

type PublicChatRequest = {
  siteId: string
  pageUrl: string
  messages: PublicChatMessage[]
}

type OpenAITextPart = {
  type?: string
  text?: string
}

type OpenAIOutputItem = {
  type?: string
  content?: OpenAITextPart[]
}

type OpenAIResponseBody = {
  output_text?: string
  output?: OpenAIOutputItem[]
  error?: {
    message?: string
  }
}

const SITE_PROMPTS: Record<string, string> = {
  pkmm:
    'Ты AI-консультант сайта строительных материалов. Помогай с сэндвич-панелями, профнастилом, фасадными и кровельными материалами. Уточняй город, объём, размеры, покрытие, цвет RAL и телефон для связи.',
  profnastilmoskva:
    'Ты AI-консультант сайта по профнастилу и металлоизделиям в Москве и Московской области. Помогай подобрать материал, но не выдумывай цены и наличие. Проси телефон для связи с менеджером.',
  default:
    'Ты AI-консультант компании. Отвечай кратко, помогай подобрать товар и проси номер телефона для связи с менеджером.'
}

function getSystemPrompt(siteId: string, pageUrl: string) {
  return [
    SITE_PROMPTS[siteId] ?? SITE_PROMPTS.default,
    `Site ID: ${siteId}`,
    `Page URL: ${pageUrl}`,
    'Правила:',
    '- отвечай на русском языке;',
    '- не выдумывай точное наличие;',
    '- не называй точную цену, если её нет в данных;',
    '- уточняй город, объём, размеры и назначение материала;',
    '- после 1-2 уточняющих вопросов попроси номер телефона;',
    '- если нужен расчёт, предложи передать заявку менеджеру.'
  ].join('\n')
}

function extractOpenAIText(data: OpenAIResponseBody) {
  if (typeof data.output_text === 'string' && data.output_text.trim()) {
    return data.output_text.trim()
  }

  const outputText =
    data.output
      ?.flatMap(item => item.content ?? [])
      .map(part => part.text)
      .filter((text): text is string => Boolean(text?.trim()))
      .join('\n')
      .trim() ?? ''

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

  const body = (await request.json()) as PublicChatRequest

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: process.env.OPENAI_DEFAULT_CHAT_MODEL || 'gpt-4.1',
      input: [
        {
          role: 'system',
          content: getSystemPrompt(body.siteId, body.pageUrl)
        },
        ...body.messages.slice(-12).map(message => ({
          role: message.role === 'assistant' ? 'assistant' : 'user',
          content: message.content
        }))
      ],
      max_output_tokens: 800
    })
  })

  const data = (await response.json()) as OpenAIResponseBody

  if (!response.ok) {
    return NextResponse.json(
      {
        error:
          data.error?.message ||
          `OpenAI request failed with status ${response.status}`
      },
      { status: response.status }
    )
  }

  const text = extractOpenAIText(data)

  if (!text) {
    return NextResponse.json(
      {
        error: 'OpenAI returned empty text response'
      },
      { status: 502 }
    )
  }

  return NextResponse.json({
    text
  })
}