import { MutableRefObject } from 'react'
import { RealtimeEvent } from '../model/chat.types'

export function normalizeTranscript(text: string) {
  return text.replace(/\s+/g, ' ').trim()
}

export function extractTranscriptFromResponse(event: RealtimeEvent) {
  return normalizeTranscript(
    event.response?.output
      ?.flatMap(item => item.content ?? [])
      .map(content => content.transcript || content.text || '')
      .filter(Boolean)
      .join(' ') || ''
  )
}

export function shouldSkipRecentRealtimeText({
  text,
  lastTextRef,
  lastTextAtRef,
  windowMs = 5000
}: {
  text: string
  lastTextRef: MutableRefObject<string>
  lastTextAtRef: MutableRefObject<number>
  windowMs?: number
}) {
  const normalizedText = normalizeTranscript(text)
  const now = Date.now()

  if (
    normalizedText &&
    normalizedText === lastTextRef.current &&
    now - lastTextAtRef.current < windowMs
  ) {
    return true
  }

  lastTextRef.current = normalizedText
  lastTextAtRef.current = now

  return false
}


