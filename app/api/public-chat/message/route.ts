import { NextResponse } from 'next/server'
import {
  PROMPT_EVROSHTAKETNIK_MOSKVA,
  PROMPT_PROFNASTIL_MOSKVA,
  PROMPT_PROFNASTIL_V_TASHKENTE,
  PROMPT_PROFNASTIL_V_SPB,
  PROMPT_PROFNASTIL_SANDWICHPANELSVSPB,
  PROMPT_PROFNASTIL_PKMM,
  PROMPT_PROFNASTIL_SANDVICHPANEL,
  PROMPT_PROFNASTIL_CHERNYJMETALL
} from './prompt.data'

export const runtime = 'nodejs'

// Первое сообщение:
// "Assalomu alaykum! Men Anna 😊 Sizga rus tilida gaplashish qulaymi yoki o‘zbek tilidami?
// Здравствуйте! Я Анна 😊 Вам удобнее общаться на русском или на узбекском?"

type PublicChatAttachment = {
  id?: string
  name: string
  type: string
  size: number
  dataUrl?: string
}

type PublicChatMessage = {
  role: 'user' | 'assistant'
  content: string
  attachments?: PublicChatAttachment[]
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

type OpenAIInputContent =
  | {
      type: 'input_text'
      text: string
    }
  | {
      type: 'input_image'
      image_url: string
      detail: 'low' | 'high' | 'auto'
    }

const SITE_PROMPTS: Record<string, string> = {
  evroshtaketnikmoskva: PROMPT_EVROSHTAKETNIK_MOSKVA,

  profnastilmoskva: PROMPT_PROFNASTIL_MOSKVA,

  profnastilvtashkente: PROMPT_PROFNASTIL_V_TASHKENTE,

  profnastilvspb: PROMPT_PROFNASTIL_V_SPB,

  sandwichpanelsvspb: PROMPT_PROFNASTIL_SANDWICHPANELSVSPB,

  pkmm: PROMPT_PROFNASTIL_PKMM,

  sendvichpanel: PROMPT_PROFNASTIL_SANDVICHPANEL,

  chernyjmetall: PROMPT_PROFNASTIL_CHERNYJMETALL,

  default:
    'Ты онлайн-консультант компании. Отвечай кратко, помогай подобрать товар и проси номер телефона для связи с менеджером.'
}

function getSystemPrompt(siteId: string, pageUrl: string) {
  return [
    SITE_PROMPTS[siteId] ?? SITE_PROMPTS.default,
    '',
    `Site ID: ${siteId}`,
    `Page URL: ${pageUrl}`,
    '',
    'Дополнительные правила:',
    '- отвечай на языке, который выбрал клиент;',
    '- если клиент просит сменить язык, сразу переходи на новый язык;',
    '- если клиент пишет на русском, отвечай на русском;',
    '- если клиент пишет на узбекском, отвечай на узбекском;',
    '- не смешивай русский и узбекский, кроме первого сообщения с выбором языка;',
    '- отвечай живо, понятно и по-человечески;',
    '- не выдумывай точное наличие;',
    '- не называй точную цену, если её нет в данных;',
    '- если клиент прикрепил картинку, фото или файл, обязательно учитывай это в ответе;',
    '- если клиент прикрепил фото объекта, можешь описать, что видно на фото, и уточнить нужные параметры;',
    '- если по файлу нельзя понять точные размеры, попроси клиента уточнить размеры, количество или назначение;',
    '- если клиент отправил только файл без текста, уточни, что именно нужно рассчитать или подобрать;',
    '- уточняй город, объём, размеры и назначение материала;',
    '- после 1-2 уточняющих вопросов мягко попроси номер телефона;',
    '- если нужен расчёт, предложи передать заявку менеджеру;',
    '- не обрывай предложения ради краткости;',
    '- отвечай коротко, но только законченными фразами.'
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

function isImageAttachment(file: PublicChatAttachment) {
  return file.type?.startsWith('image/') && Boolean(file.dataUrl)
}

function isAllowedImageSize(file: PublicChatAttachment) {
  const maxSize = 3 * 1024 * 1024 // 3 MB

  return file.size <= maxSize
}

function formatFileInfo(file: PublicChatAttachment) {
  const sizeKb = Math.round(file.size / 1024)

  return `- ${file.name} (${file.type || 'тип не указан'}, ${sizeKb} KB)`
}

function mapMessageToOpenAI(message: PublicChatMessage) {
  const role = message.role === 'assistant' ? 'assistant' : 'user'
  const attachments = message.attachments ?? []

  if (role === 'assistant') {
    return {
      role,
      content: message.content || ''
    }
  }

  if (!attachments.length) {
    return {
      role,
      content: message.content || ''
    }
  }

  const textParts: string[] = []

  if (message.content?.trim()) {
    textParts.push(message.content.trim())
  }

  const imageFiles = attachments.filter(file => isImageAttachment(file))
  const allowedImages = imageFiles.filter(file => isAllowedImageSize(file))
  const skippedImages = imageFiles.filter(file => !isAllowedImageSize(file))
  const otherFiles = attachments.filter(file => !isImageAttachment(file))

  if (otherFiles.length) {
    textParts.push(
      ['Клиент прикрепил файлы:', ...otherFiles.map(formatFileInfo)].join('\n')
    )
  }

  if (skippedImages.length) {
    textParts.push(
      [
        'Некоторые изображения не были переданы на анализ, потому что они слишком большие:',
        ...skippedImages.map(formatFileInfo)
      ].join('\n')
    )
  }

  if (allowedImages.length) {
    textParts.push(
      `Клиент прикрепил изображений: ${allowedImages.length}. Учитывай их при ответе.`
    )
  }

  const content: OpenAIInputContent[] = []

  content.push({
    type: 'input_text',
    text:
      textParts.join('\n\n') ||
      'Клиент отправил вложение без текстового комментария.'
  })

  allowedImages.forEach(file => {
    if (!file.dataUrl) return

    content.push({
      type: 'input_image',
      image_url: file.dataUrl,
      detail: 'low'
    })
  })

  return {
    role,
    content
  }
}

function validateBody(body: Partial<PublicChatRequest>) {
  if (!body || typeof body !== 'object') {
    return 'Invalid request body'
  }

  if (!body.siteId || typeof body.siteId !== 'string') {
    return 'Invalid siteId'
  }

  if (!body.pageUrl || typeof body.pageUrl !== 'string') {
    return 'Invalid pageUrl'
  }

  if (!Array.isArray(body.messages)) {
    return 'Invalid messages'
  }

  return null
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: 'OPENAI_API_KEY is not configured' },
        { status: 500 }
      )
    }

    let body: PublicChatRequest

    try {
      body = (await request.json()) as PublicChatRequest
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const bodyError = validateBody(body)

    if (bodyError) {
      return NextResponse.json({ error: bodyError }, { status: 400 })
    }

    const lastMessages = body.messages.slice(-8)

    let response: Response

    try {
      response = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: process.env.OPENAI_DEFAULT_CHAT_MODEL || 'gpt-4.1-mini',

          instructions: getSystemPrompt(body.siteId, body.pageUrl),

          input: lastMessages.map(mapMessageToOpenAI),

          max_output_tokens: 800
        })
      })
    } catch (error) {
      console.error('OpenAI fetch failed:', error)

      return NextResponse.json(
        { error: 'Failed to connect to OpenAI' },
        { status: 502 }
      )
    }

    let data: OpenAIResponseBody

    try {
      data = (await response.json()) as OpenAIResponseBody
    } catch {
      return NextResponse.json(
        {
          error: 'OpenAI вернул не JSON. Проверь ключ, модель или лимиты API.'
        },
        { status: 502 }
      )
    }

    if (!response.ok) {
      console.error('OpenAI error:', {
        status: response.status,
        data
      })

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
      console.error('OpenAI returned empty text:', data)

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
  } catch (error) {
    console.error('Public chat route error:', error)

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Ошибка сервера public-chat/message'
      },
      { status: 500 }
    )
  }
}
