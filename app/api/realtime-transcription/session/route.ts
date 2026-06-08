import { createHash } from 'crypto'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

function getSafetyIdentifier(siteId?: string | null, pageUrl?: string | null) {
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

    const url = new URL(request.url)
    const siteId = url.searchParams.get('siteId') || 'default'
    const pageUrl = url.searchParams.get('pageUrl') || 'unknown'
    const requestedLanguage = url.searchParams.get('language') || ''
    const language = ['ru', 'uz', 'en'].includes(requestedLanguage)
      ? requestedLanguage
      : undefined
    const sdp = await request.text()

    if (!sdp.trim()) {
      return NextResponse.json({ error: 'Missing SDP body' }, { status: 400 })
    }

    const formData = new FormData()

    formData.set('sdp', sdp)
    formData.set(
      'session',
      JSON.stringify({
        type: 'transcription',
        audio: {
          input: {
            transcription: {
              model:
                process.env.OPENAI_REALTIME_WHISPER_MODEL ||
                'gpt-realtime-whisper',
              ...(language ? { language } : {}),
              delay: 'low'
            },
            turn_detection: null
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
      console.error('Realtime transcription session error:', answerSdp)
      return NextResponse.json(
        {
          error:
            answerSdp ||
            `OpenAI realtime transcription failed with status ${response.status}`
        },
        { status: response.status }
      )
    }

    return new NextResponse(answerSdp, {
      status: 200,
      headers: {
        'Content-Type': 'application/sdp',
        'Cache-Control': 'no-store'
      }
    })
  } catch (error) {
    console.error('Realtime transcription route error:', error)

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Realtime transcription session error'
      },
      { status: 500 }
    )
  }
}
