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

const SITE_PROMPTS: Record<string, string> = {
  pkmm:
    'Ты AI-консультант сайта строительных материалов. Помогай с сэндвич-панелями, профнастилом, фасадными и кровельными материалами. Всегда уточняй город, объём, размеры, покрытие, цвет RAL и телефон для связи.',
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
    '- не обещай точное наличие, если его нет в данных;',
    '- не называй точную цену, если её не передали;',
    '- после 1-2 уточняющих вопросов попроси телефон;',
    '- если клиент спрашивает сложный расчёт, предложи передать менеджеру;',
    '- отвечай на русском языке.'
  ].join('\n')
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
      model: process.env.OPENAI_DEFAULT_CHAT_MODEL ?? 'gpt-4.1-mini',
      input: [
        {
          role: 'system',
          content: [
            {
              type: 'input_text',
              text: getSystemPrompt(body.siteId, body.pageUrl)
            }
          ]
        },
        ...body.messages.slice(-12).map(message => ({
          role: message.role === 'assistant' ? 'assistant' : 'user',
          content: [
            {
              type: message.role === 'assistant' ? 'output_text' : 'input_text',
              text: message.content
            }
          ]
        }))
      ],
      max_output_tokens: 800
    })
  })

  const data = await response.json()

  if (!response.ok) {
    return NextResponse.json(
      {
        error:
          data.error?.message ??
          `OpenAI request failed with status ${response.status}`
      },
      { status: response.status }
    )
  }

  return NextResponse.json({
    text: data.output_text ?? 'Не удалось сформировать ответ.'
  })
}