import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

type RealtimeTokenBody = {
  agentName?: string
  instructions?: string
  model?: string
  voice?: string
  transcribeModel?: string
  temperature?: number
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { error: 'OPENAI_API_KEY is not configured' },
      { status: 500 }
    )
  }

  const body = (await request.json()) as RealtimeTokenBody

  const model =
    body.model || process.env.OPENAI_REALTIME_MODEL || 'gpt-realtime-2'

  const voice = body.voice || process.env.OPENAI_REALTIME_VOICE || 'marin'

  const instructions =
    body.instructions ||
    'Ты AI-ассистент CRM. Отвечай кратко, точно и естественно. Если пользователь говорит голосом, отвечай голосом.'

  const response = await fetch(
    'https://api.openai.com/v1/realtime/client_secrets',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        session: {
          type: 'realtime',
          model,
          instructions,
          audio: {
            output: {
              voice
            },
            input: {
              transcription: {
                model: body.transcribeModel || 'gpt-4o-mini-transcribe'
              }
            }
          },
          generation: {
            temperature: body.temperature ?? 0.35
          }
        }
      })
    }
  )

  if (!response.ok) {
    const errorText = await response.text()

    return NextResponse.json(
      { error: errorText || 'Failed to create realtime token' },
      { status: response.status }
    )
  }

  const data = await response.json()

  return NextResponse.json(data)
}