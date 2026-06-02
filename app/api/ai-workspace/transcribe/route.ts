import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { error: 'OPENAI_API_KEY is not configured' },
      { status: 500 }
    )
  }

  const formData = await request.formData()
  const file = formData.get('file')

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Audio file is required' }, { status: 400 })
  }

  const model =
    String(formData.get('model') || '') ||
    process.env.OPENAI_TRANSCRIBE_MODEL ||
    'gpt-4o-mini-transcribe'

  const openAIFormData = new FormData()
  openAIFormData.set('file', file)
  openAIFormData.set('model', model)

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`
    },
    body: openAIFormData
  })

  if (!response.ok) {
    const errorText = await response.text()

    return NextResponse.json(
      { error: errorText || 'Transcription failed' },
      { status: response.status }
    )
  }

  const data = (await response.json()) as { text?: string }

  return NextResponse.json({
    text: data.text ?? '',
    model
  })
}