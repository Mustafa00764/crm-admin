import { NextResponse } from 'next/server'

type SpeechRequestBody = {
  text: string
  model?: string
  voice?: string
  instructions?: string
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { error: 'OPENAI_API_KEY is not configured' },
      { status: 500 }
    )
  }

  const body = (await request.json()) as SpeechRequestBody

  if (!body.text.trim()) {
    return NextResponse.json({ error: 'Text is required' }, { status: 400 })
  }

  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: body.model || process.env.OPENAI_TTS_MODEL || 'gpt-4o-mini-tts',
      input: body.text,
      voice: body.voice || process.env.OPENAI_TTS_VOICE || 'marin',
      instructions:
        body.instructions ||
        'Говори спокойно, естественно, уверенно и без лишней эмоциональности.',
      response_format: 'mp3'
    })
  })

  if (!response.ok) {
    const errorText = await response.text()

    return NextResponse.json(
      { error: errorText || 'Speech generation failed' },
      { status: response.status }
    )
  }

  const audio = await response.arrayBuffer()

  return new Response(audio, {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'no-store'
    }
  })
}