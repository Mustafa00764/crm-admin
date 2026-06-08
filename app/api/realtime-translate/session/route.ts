import { createHash } from 'crypto'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

const ALLOWED_TARGET_LANGUAGES = new Set([
  'en',
  'ru',
  'uz'
])

type RealtimeTranslateSessionRequest = {
  siteId?: string
  pageUrl?: string
  targetLanguage?: string
}

function getSafetyIdentifier(siteId?: string, pageUrl?: string) {
  const raw = `${siteId || 'default'}:${pageUrl || 'unknown'}`

  return createHash('sha256').update(raw).digest('hex')
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

    let body: RealtimeTranslateSessionRequest

    try {
      body = (await request.json()) as RealtimeTranslateSessionRequest
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const targetLanguage = body.targetLanguage || 'ru'

    if (!ALLOWED_TARGET_LANGUAGES.has(targetLanguage)) {
      return NextResponse.json(
        {
          error:
            'Unsupported targetLanguage. Use one of: en, ru, uz.'
        },
        { status: 400 }
      )
    }

    const response = await fetch(
      'https://api.openai.com/v1/realtime/translations/client_secrets',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'OpenAI-Safety-Identifier': getSafetyIdentifier(
            body.siteId,
            body.pageUrl
          )
        },
        body: JSON.stringify({
          session: {
            model: 'gpt-realtime-translate',
            audio: {
              output: {
                language: targetLanguage
              }
            }
          }
        })
      }
    )

    const data = await response.json()

    if (!response.ok) {
      console.error('Realtime translate client secret error:', data)

      return NextResponse.json(
        {
          error:
            data?.error?.message ||
            `OpenAI realtime translate failed with status ${response.status}`
        },
        { status: response.status }
      )
    }

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Realtime translate session route error:', error)

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Realtime translate session error'
      },
      { status: 500 }
    )
  }
}
