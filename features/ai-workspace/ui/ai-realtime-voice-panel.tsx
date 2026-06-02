'use client'

import * as React from 'react'
import { Mic, MicOff, Phone, PhoneOff, Radio, Volume2 } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { cn } from '@/shared/lib/cn'
import type { AIAgent } from '@/features/ai-agents/model/ai-agents-types'
import type { AIWorkspaceMessage } from '../model/ai-workspace-types'

type RealtimeStatus =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'muted'
  | 'error'

type RealtimeServerEvent = {
  type: string
  transcript?: string
  delta?: string
  text?: string
  error?: {
    message?: string
  }
}

type AIRealtimeVoicePanelProps = {
  agent: AIAgent | null
  ensureChat: () => string
  appendMessage: (message: AIWorkspaceMessage) => void
}

function uid(prefix: string) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}_${crypto.randomUUID()}`
  }

  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`
}

function now() {
  return new Date().toISOString()
}

function buildAgentInstructions(agent: AIAgent | null) {
  if (!agent) {
    return 'Ты AI-ассистент CRM. Веди живой голосовой диалог. Отвечай кратко, естественно и по делу.'
  }

  return [
    `Ты AI agent: ${agent.name}.`,
    agent.systemPrompt,
    agent.salesPrompt ? `Sales prompt:\n${agent.salesPrompt}` : '',
    agent.qualificationPrompt
      ? `Qualification prompt:\n${agent.qualificationPrompt}`
      : '',
    'Формат поведения для голосового режима:',
    '- отвечай естественно, как в живом разговоре;',
    '- не говори слишком длинно;',
    '- если данных мало, задай один уточняющий вопрос;',
    '- если вопрос вне зоны уверенности, скажи что нужно подключить менеджера;',
    '- не выдумывай цены, сроки и наличие.'
  ]
    .filter(Boolean)
    .join('\n\n')
}

function getEphemeralKey(data: unknown) {
  const record = data as {
    value?: string
    client_secret?: {
      value?: string
    }
  }

  return record.value ?? record.client_secret?.value ?? ''
}

export function AIRealtimeVoicePanel({
  agent,
  ensureChat,
  appendMessage
}: AIRealtimeVoicePanelProps) {
  const [status, setStatus] = React.useState<RealtimeStatus>('idle')
  const [error, setError] = React.useState<string | null>(null)
  const [liveUserText, setLiveUserText] = React.useState('')
  const [liveAssistantText, setLiveAssistantText] = React.useState('')

  const peerConnectionRef = React.useRef<RTCPeerConnection | null>(null)
  const dataChannelRef = React.useRef<RTCDataChannel | null>(null)
  const mediaStreamRef = React.useRef<MediaStream | null>(null)
  const remoteAudioRef = React.useRef<HTMLAudioElement | null>(null)

  const chatIdRef = React.useRef<string | null>(null)
  const assistantTextRef = React.useRef('')
  const userTextRef = React.useRef('')

  const connected = status === 'connected' || status === 'muted'
  const muted = status === 'muted'

  const appendUserTranscript = React.useCallback(
    (transcript: string) => {
      const cleanTranscript = transcript.trim()

      if (!cleanTranscript) return

      const chatId = chatIdRef.current ?? ensureChat()
      chatIdRef.current = chatId

      appendMessage({
        id: uid('msg'),
        chatId,
        role: 'user',
        content: cleanTranscript,
        attachments: [],
        transcript: cleanTranscript,
        createdAt: now()
      })

      userTextRef.current = ''
      setLiveUserText('')
    },
    [appendMessage, ensureChat]
  )

  const appendAssistantAnswer = React.useCallback(() => {
    const cleanText = assistantTextRef.current.trim()

    if (!cleanText) return

    const chatId = chatIdRef.current ?? ensureChat()
    chatIdRef.current = chatId

    appendMessage({
      id: uid('msg'),
      chatId,
      role: 'assistant',
      content: cleanText,
      attachments: [],
      model: agent?.model,
      createdAt: now()
    })

    assistantTextRef.current = ''
    setLiveAssistantText('')
  }, [appendMessage, ensureChat, agent?.model])

  const handleRealtimeEvent = React.useCallback(
    (event: RealtimeServerEvent) => {
      if (event.type === 'error') {
        setError(event.error?.message ?? 'Realtime API error')
        setStatus('error')
        return
      }

      if (
        event.type ===
          'conversation.item.input_audio_transcription.completed' &&
        event.transcript
      ) {
        appendUserTranscript(event.transcript)
        return
      }

      if (
        event.type ===
          'conversation.item.input_audio_transcription.delta' &&
        event.delta
      ) {
        userTextRef.current += event.delta
        setLiveUserText(userTextRef.current)
        return
      }

      if (
        event.type === 'response.output_audio_transcript.delta' &&
        event.delta
      ) {
        assistantTextRef.current += event.delta
        setLiveAssistantText(assistantTextRef.current)
        return
      }

      if (event.type === 'response.output_text.delta' && event.delta) {
        assistantTextRef.current += event.delta
        setLiveAssistantText(assistantTextRef.current)
        return
      }

      if (
        event.type === 'response.output_audio_transcript.done' ||
        event.type === 'response.output_text.done' ||
        event.type === 'response.done'
      ) {
        appendAssistantAnswer()
      }
    },
    [appendUserTranscript, appendAssistantAnswer]
  )

  const disconnect = React.useCallback(() => {
    dataChannelRef.current?.close()
    peerConnectionRef.current?.close()

    mediaStreamRef.current?.getTracks().forEach(track => {
      track.stop()
    })

    dataChannelRef.current = null
    peerConnectionRef.current = null
    mediaStreamRef.current = null
    chatIdRef.current = null
    assistantTextRef.current = ''
    userTextRef.current = ''

    setLiveAssistantText('')
    setLiveUserText('')
    setStatus('idle')
  }, [])

  const connect = React.useCallback(async () => {
    if (connected || status === 'connecting') return

    setError(null)
    setStatus('connecting')

    try {
      const chatId = ensureChat()
      chatIdRef.current = chatId

      const tokenResponse = await fetch('/api/ai-workspace/realtime-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: process.env.NEXT_PUBLIC_OPENAI_REALTIME_MODEL,
          voice: agent?.voiceSettings.ttsVoice ?? 'marin',
          transcribeModel:
            agent?.voiceSettings.transcribeModel ?? 'gpt-4o-mini-transcribe',
          temperature: agent?.temperature ?? 0.35,
          instructions: buildAgentInstructions(agent)
        })
      })

      const tokenData = await tokenResponse.json()

      if (!tokenResponse.ok) {
        throw new Error(tokenData.error ?? 'Failed to create realtime token')
      }

      const ephemeralKey = getEphemeralKey(tokenData)

      if (!ephemeralKey) {
        throw new Error('Realtime ephemeral key is empty')
      }

      const peerConnection = new RTCPeerConnection()
      const remoteAudio = new Audio()

      remoteAudio.autoplay = true
      remoteAudioRef.current = remoteAudio

      peerConnection.ontrack = event => {
        const [stream] = event.streams
        remoteAudio.srcObject = stream
        void remoteAudio.play().catch(() => undefined)
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })

      mediaStreamRef.current = mediaStream

      mediaStream.getAudioTracks().forEach(track => {
        peerConnection.addTrack(track, mediaStream)
      })

      const dataChannel = peerConnection.createDataChannel('oai-events')

      dataChannel.onopen = () => {
        setStatus('connected')
      }

      dataChannel.onmessage = messageEvent => {
        try {
          const parsedEvent = JSON.parse(
            messageEvent.data
          ) as RealtimeServerEvent

          handleRealtimeEvent(parsedEvent)
        } catch {
          // ignore malformed realtime events
        }
      }

      dataChannel.onerror = () => {
        setError('Realtime data channel error')
        setStatus('error')
      }

      dataChannelRef.current = dataChannel
      peerConnectionRef.current = peerConnection

      const offer = await peerConnection.createOffer()
      await peerConnection.setLocalDescription(offer)

      const sdpResponse = await fetch(
        'https://api.openai.com/v1/realtime/calls',
        {
          method: 'POST',
          body: offer.sdp,
          headers: {
            Authorization: `Bearer ${ephemeralKey}`,
            'Content-Type': 'application/sdp'
          }
        }
      )

      if (!sdpResponse.ok) {
        const errorText = await sdpResponse.text()
        throw new Error(errorText || 'Realtime WebRTC connection failed')
      }

      const answerSdp = await sdpResponse.text()

      await peerConnection.setRemoteDescription({
        type: 'answer',
        sdp: answerSdp
      })
    } catch (connectError) {
      disconnect()

      setError(
        connectError instanceof Error
          ? connectError.message
          : 'Realtime connection failed'
      )
      setStatus('error')
    }
  }, [agent, connected, status, ensureChat, disconnect, handleRealtimeEvent])

  const toggleMute = React.useCallback(() => {
    const stream = mediaStreamRef.current

    if (!stream) return

    const nextMuted = status !== 'muted'

    stream.getAudioTracks().forEach(track => {
      track.enabled = !nextMuted
    })

    setStatus(nextMuted ? 'muted' : 'connected')
  }, [status])

  return (
    <section className="rounded-md border border-[var(--cf-border)] bg-[var(--cf-bg)] p-3">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[12px] font-semibold text-[var(--cf-text)]">
            <Radio className="h-4 w-4 text-[var(--cf-icon)]" />
            Live voice agent
          </div>

          <div className="mt-0.5 text-[10px] text-[var(--cf-text-muted)]">
            WebRTC разговор: говоришь в микрофон — агент отвечает голосом.
          </div>
        </div>

        <span
          className={cn(
            'rounded-md px-2 py-1 text-[10px]',
            status === 'connected' &&
              'bg-[rgba(34,197,94,0.14)] text-emerald-400',
            status === 'muted' &&
              'bg-[rgba(245,158,11,0.14)] text-amber-400',
            status === 'connecting' &&
              'bg-[rgba(8,183,239,0.14)] text-[var(--cf-blue)]',
            status === 'idle' &&
              'bg-[var(--cf-element)] text-[var(--cf-text-muted)]',
            status === 'error' &&
              'bg-[rgba(239,23,72,0.16)] text-[var(--cf-red)]'
          )}
        >
          {status}
        </span>
      </div>

      <div className="mb-3 grid grid-cols-3 gap-2">
        <Button
          type="button"
          variant="ghost"
          disabled={status === 'connecting'}
          className={cn(
            'h-9 rounded-md px-3 text-[11px]',
            connected
              ? 'bg-[rgba(239,23,72,0.16)] text-[var(--cf-red)]'
              : 'bg-[var(--cf-button)] text-[var(--cf-text)]'
          )}
          onClick={() => {
            if (connected) {
              disconnect()
            } else {
              void connect()
            }
          }}
        >
          {connected ? (
            <>
              <PhoneOff className="mr-1.5 h-3.5 w-3.5" />
              End call
            </>
          ) : (
            <>
              <Phone className="mr-1.5 h-3.5 w-3.5" />
              Start call
            </>
          )}
        </Button>

        <Button
          type="button"
          variant="ghost"
          disabled={!connected}
          className="h-9 rounded-md bg-[var(--cf-button)] px-3 text-[11px] text-[var(--cf-text)] disabled:cursor-not-allowed disabled:opacity-50"
          onClick={toggleMute}
        >
          {muted ? (
            <>
              <MicOff className="mr-1.5 h-3.5 w-3.5" />
              Unmute
            </>
          ) : (
            <>
              <Mic className="mr-1.5 h-3.5 w-3.5" />
              Mute
            </>
          )}
        </Button>

        <div className="flex h-9 items-center rounded-md border border-[var(--cf-border)] bg-[var(--cf-element)] px-3 text-[11px] text-[var(--cf-text-muted)]">
          <Volume2 className="mr-1.5 h-3.5 w-3.5" />
          {agent?.voiceSettings.ttsVoice ?? 'marin'}
        </div>
      </div>

      {liveUserText ? (
        <div className="mb-2 rounded-md border border-[var(--cf-border)] bg-[var(--cf-element)] px-3 py-2 text-[11px] text-[var(--cf-text-muted)]">
          <span className="text-[var(--cf-blue)]">You:</span> {liveUserText}
        </div>
      ) : null}

      {liveAssistantText ? (
        <div className="rounded-md border border-[var(--cf-border)] bg-[var(--cf-element)] px-3 py-2 text-[11px] text-[var(--cf-text-muted)]">
          <span className="text-emerald-400">Assistant:</span>{' '}
          {liveAssistantText}
        </div>
      ) : null}

      {error ? (
        <div className="mt-2 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-[11px] text-red-400">
          {error}
        </div>
      ) : null}
    </section>
  )
}