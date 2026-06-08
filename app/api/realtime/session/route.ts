import { createHash } from 'crypto'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

function getSafetyIdentifier(siteId?: string | null, pageUrl?: string | null) {
  const raw = `${siteId || 'default'}:${pageUrl || 'unknown'}`
  return createHash('sha256').update(raw).digest('hex')
}

function getRealtimeInstructions(siteId: string, pageUrl: string) {
  return [
    'Ты — Анна, голосовой онлайн-консультант сайта по продаже профнастила, металлочерепицы, металлоизделий и комплектующих в Ташкенте и по Узбекистану.',
    '',
    'Говори как молодая девушка-консультант: дружелюбно, легко, понятно, без канцелярита.',
    'Отвечай коротко: обычно 1–3 предложения. Не называй точные цены, наличие и сроки без проверки менеджером.',
    'Если клиент говорит на русском — отвечай на русском. Если клиент говорит на узбекском — отвечай на узбекском. Не смешивай языки без необходимости.',
    'Помогай подобрать материал для крыши, забора, навеса или фасада. Уточняй назначение, размеры, толщину, цвет, город доставки.',
    'Когда задача понятна, мягко попроси номер телефона для точного расчёта менеджером.',
    'Если клиент оставил номер телефона, скажи, что заявку передашь менеджеру. Не говори, что ты бот или искусственный интеллект.',
    '',
    `Site ID: ${siteId}`,
    `Page URL: ${pageUrl}`
  ].join('\n')
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

    const url = new URL(request.url)
    const siteId = url.searchParams.get('siteId') || 'default'
    const pageUrl = url.searchParams.get('pageUrl') || 'unknown'
    const sdp = await request.text()

    if (!sdp.trim()) {
      return NextResponse.json({ error: 'Missing SDP body' }, { status: 400 })
    }

    const formData = new FormData()

    formData.set('sdp', sdp)
    formData.set(
      'session',
      JSON.stringify({
        type: 'realtime',
        model: process.env.OPENAI_REALTIME_MODEL || 'gpt-realtime-2',
        instructions: getRealtimeInstructions(siteId, pageUrl),
        audio: {
          input: {
            transcription: {
              model:
                process.env.OPENAI_REALTIME_TRANSCRIBE_MODEL ||
                'gpt-4o-mini-transcribe'
            },
            turn_detection: {
              type: 'server_vad',
              threshold: 0.5,
              prefix_padding_ms: 300,
              silence_duration_ms: 650
            }
          },
          output: {
            voice: process.env.OPENAI_REALTIME_VOICE || 'marin'
          }
        }
      })
    )

    const response = await fetch('https://api.openai.com/v1/realtime/calls', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'OpenAI-Safety-Identifier': getSafetyIdentifier(siteId, pageUrl)
      },
      body: formData
    })

    const answerSdp = await response.text()

    if (!response.ok) {
      console.error('Realtime voice session error:', answerSdp)
      return NextResponse.json(
        {
          error:
            answerSdp || `OpenAI realtime failed with status ${response.status}`
        },
        { status: response.status }
      )
    }

    return new NextResponse(answerSdp, {
      status: 200,
      headers: {
        'Content-Type': 'application/sdp'
      }
    })
  } catch (error) {
    console.error('Realtime voice route error:', error)

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Realtime voice session error'
      },
      { status: 500 }
    )
  }
}
