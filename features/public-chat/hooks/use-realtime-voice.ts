import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react'
import {
  DictationLanguage,
  PublicChatMessage,
  RealtimeEvent,
  VoiceMode
} from '../model/chat.types'
import {
  extractTranscriptFromResponse,
  normalizeTranscript,
  shouldSkipRecentRealtimeText
} from '../lib/transcript'
import { uid } from '../lib/uid'

type UseRealtimeVoiceParams = {
  siteId: string
  pageUrl: string
  pending: boolean
  shouldBlockChat: boolean
  setInput: Dispatch<SetStateAction<string>>
  setMessages: Dispatch<SetStateAction<PublicChatMessage[]>>
  sendLeadFromRealtimeTranscript: (text: string) => Promise<void>
}

export function useRealtimeVoice({
  siteId,
  pageUrl,
  pending,
  shouldBlockChat,
  setInput,
  setMessages,
  sendLeadFromRealtimeTranscript
}: UseRealtimeVoiceParams) {
  const [voiceMode, setVoiceMode] = useState<VoiceMode>('idle')
  const [voiceConnecting, setVoiceConnecting] = useState(false)
  const [voiceStatus, setVoiceStatus] = useState('')
  const [voiceError, setVoiceError] = useState('')
  const [liveUserTranscript, setLiveUserTranscript] = useState('')
  const [liveAssistantTranscript, setLiveAssistantTranscript] = useState('')
  const [dictationText, setDictationText] = useState('')
  const [dictationLanguage, setDictationLanguage] =
    useState<DictationLanguage>('auto')

  const voicePeerRef = useRef<RTCPeerConnection | null>(null)
  const voiceChannelRef = useRef<RTCDataChannel | null>(null)
  const voiceStreamRef = useRef<MediaStream | null>(null)
  const voiceAudioRef = useRef<HTMLAudioElement | null>(null)
  const assistantTranscriptRef = useRef('')
  const dictationTranscriptRef = useRef('')
  const committedUserItemsRef = useRef(new Set<string>())
  const committedAssistantResponsesRef = useRef(new Set<string>())
  const lastRealtimeUserTextRef = useRef('')
  const lastRealtimeUserTextAtRef = useRef(0)
  const lastRealtimeAssistantTextRef = useRef('')
  const lastRealtimeAssistantTextAtRef = useRef(0)
  const voiceModeRef = useRef<VoiceMode>('idle')
  const dictationStoppingRef = useRef(false)
  const dictationStopTimeoutRef = useRef<number | null>(null)
  const activeResponseRef = useRef(false)
  const createResponseTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    voiceModeRef.current = voiceMode
  }, [voiceMode])

  const cleanupRealtime = useCallback(
    (commitDictation = true) => {
      const mode = voiceModeRef.current

      if (createResponseTimeoutRef.current) {
        window.clearTimeout(createResponseTimeoutRef.current)
        createResponseTimeoutRef.current = null
      }

      activeResponseRef.current = false

      if (dictationStopTimeoutRef.current) {
        window.clearTimeout(dictationStopTimeoutRef.current)
        dictationStopTimeoutRef.current = null
      }

      if (mode === 'dictation' && commitDictation) {
        const text = normalizeTranscript(dictationTranscriptRef.current)

        if (text) {
          setInput(current => `${current}${current.trim() ? ' ' : ''}${text}`)
        }
      }

      try {
        voiceChannelRef.current?.close()
      } catch {
        // already closed
      }

      try {
        voicePeerRef.current
          ?.getSenders()
          .forEach(sender => sender.track?.stop())
        voicePeerRef.current?.close()
      } catch {
        // already closed
      }

      voiceStreamRef.current?.getTracks().forEach(track => track.stop())

      if (voiceAudioRef.current) {
        voiceAudioRef.current.pause()
        voiceAudioRef.current.srcObject = null
      }

      voicePeerRef.current = null
      voiceChannelRef.current = null
      voiceStreamRef.current = null
      voiceAudioRef.current = null
      assistantTranscriptRef.current = ''
      dictationTranscriptRef.current = ''
      dictationStoppingRef.current = false
      committedUserItemsRef.current.clear()
      committedAssistantResponsesRef.current.clear()
      voiceModeRef.current = 'idle'

      setVoiceMode('idle')
      setVoiceConnecting(false)
      setVoiceStatus('')
      setLiveUserTranscript('')
      setLiveAssistantTranscript('')
      setDictationText('')
    },
    [setInput]
  )

  function safelyCreateRealtimeResponse() {
    if (voiceModeRef.current !== 'assistant') return

    const channel = voiceChannelRef.current

    if (!channel || channel.readyState !== 'open') return
    if (activeResponseRef.current) return

    if (createResponseTimeoutRef.current) {
      window.clearTimeout(createResponseTimeoutRef.current)
      createResponseTimeoutRef.current = null
    }

    createResponseTimeoutRef.current = window.setTimeout(() => {
      const currentChannel = voiceChannelRef.current

      if (!currentChannel || currentChannel.readyState !== 'open') return
      if (activeResponseRef.current) return

      currentChannel.send(
        JSON.stringify({
          type: 'response.create'
        })
      )

      activeResponseRef.current = true
      createResponseTimeoutRef.current = null
    }, 180)
  }

  function handleVoiceAssistantEvent(event: RealtimeEvent) {
    if (event.type === 'error') {
      const message = event.error?.message || 'Realtime voice error'

      activeResponseRef.current = false

      if (
        message.includes('active response in progress') ||
        message.includes('already has an active response')
      ) {
        setVoiceStatus('Анна ещё отвечает...')
        return
      }

      setVoiceError(message)
      return
    }

    if (event.type === 'response.created') {
      activeResponseRef.current = true
      return
    }

    if (
      event.type === 'response.done' ||
      event.type === 'response.cancelled' ||
      event.type === 'response.failed' ||
      event.type === 'response.incomplete'
    ) {
      activeResponseRef.current = false
    }

    if (event.type === 'input_audio_buffer.speech_started') {
      setVoiceStatus('Слушаю...')
      return
    }

    if (event.type === 'input_audio_buffer.speech_stopped') {
      setVoiceStatus('Анна отвечает...')
      return
    }

    if (event.type === 'conversation.item.input_audio_transcription.failed') {
      setVoiceStatus('Не удалось распознать фразу, попробуйте ещё раз')
      return
    }

    if (
      event.type === 'conversation.item.input_audio_transcription.completed' &&
      event.transcript
    ) {
      const itemId = event.item_id || uid()

      if (committedUserItemsRef.current.has(itemId)) return

      committedUserItemsRef.current.add(itemId)
      const text = normalizeTranscript(event.transcript)

      if (!text) return

      appendRealtimeUserMessage(text)
      safelyCreateRealtimeResponse()
      return
    }

    const isAssistantDelta =
      event.type === 'response.output_audio_transcript.delta' ||
      event.type === 'response.output_text.delta'

    if (isAssistantDelta && typeof event.delta === 'string') {
      assistantTranscriptRef.current += event.delta
      setLiveAssistantTranscript(assistantTranscriptRef.current)
      return
    }

    const isAssistantDone =
      event.type === 'response.output_audio_transcript.done' ||
      event.type === 'response.output_text.done'

    if (isAssistantDone) {
      const text = normalizeTranscript(
        event.transcript || event.text || assistantTranscriptRef.current
      )

      appendRealtimeAssistantMessage(
        text,
        event.response?.id || event.response_id
      )

      assistantTranscriptRef.current = ''
      setLiveAssistantTranscript('')
      setVoiceStatus('Готова слушать')
      return
    }

    if (event.type === 'response.done') {
      const text = extractTranscriptFromResponse(event)

      if (text) {
        appendRealtimeAssistantMessage(
          text,
          event.response?.id || event.response_id
        )
      }

      assistantTranscriptRef.current = ''
      setLiveAssistantTranscript('')
      setVoiceStatus('Готова слушать')
    }
  }

  function handleDictationEvent(event: RealtimeEvent) {
    if (event.type === 'error') {
      setVoiceError(event.error?.message || 'Realtime transcription error')
      return
    }

    if (event.type === 'conversation.item.input_audio_transcription.failed') {
      setVoiceError('Не удалось распознать речь. Попробуйте сказать ещё раз.')
      return
    }

    if (
      event.type === 'conversation.item.input_audio_transcription.delta' &&
      typeof event.delta === 'string'
    ) {
      dictationTranscriptRef.current += event.delta
      setDictationText(dictationTranscriptRef.current)
      return
    }

    if (
      event.type === 'conversation.item.input_audio_transcription.completed' &&
      typeof event.transcript === 'string'
    ) {
      const text = normalizeTranscript(event.transcript)
      dictationTranscriptRef.current = text
      setDictationText(text)

      if (dictationStoppingRef.current) {
        cleanupRealtime(true)
      }
    }
  }

  async function createRealtimePeerConnection({
    mode,
    endpoint
  }: {
    mode: Exclude<VoiceMode, 'idle'>
    endpoint: string
  }) {
    if (
      typeof window === 'undefined' ||
      !navigator.mediaDevices?.getUserMedia
    ) {
      throw new Error('Браузер не поддерживает доступ к микрофону')
    }

    let sourceStream: MediaStream

    try {
      sourceStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })
    } catch (error) {
      const message =
        error instanceof DOMException &&
        (error.name === 'NotAllowedError' ||
          error.name === 'PermissionDeniedError')
          ? 'Разрешите доступ к микрофону в браузере'
          : 'Не удалось получить доступ к микрофону'

      throw new Error(message)
    }

    const peerConnection = new RTCPeerConnection()

    peerConnection.onconnectionstatechange = () => {
      if (peerConnection.connectionState === 'failed') {
        setVoiceError('Соединение с голосовым режимом прервано')
        cleanupRealtime(false)
      }
    }

    const sourceTrack = sourceStream.getAudioTracks()[0]

    if (!sourceTrack) {
      throw new Error('Микрофон не вернул аудиодорожку')
    }

    peerConnection.addTrack(sourceTrack, sourceStream)

    if (mode === 'assistant') {
      const remoteAudio = document.createElement('audio')

      remoteAudio.autoplay = true
      remoteAudio.muted = false
      remoteAudio.volume = 1

      /*
       * Важно: без recvonly-трансивера браузер часто не добавляет
       * отдельный audio m-line для входящего звука ассистента в SDP.
       * В итоге текстовые события приходят, но голос Анны не слышно.
       */
      peerConnection.addTransceiver('audio', {
        direction: 'recvonly'
      })

      peerConnection.ontrack = event => {
        const [remoteStream] = event.streams

        if (remoteStream) {
          remoteAudio.srcObject = remoteStream
        } else {
          const fallbackStream = new MediaStream([event.track])
          remoteAudio.srcObject = fallbackStream
        }

        void remoteAudio.play().catch(() => {
          setVoiceError(
            'Браузер заблокировал звук. Нажмите на страницу и попробуйте ещё раз.'
          )
        })
      }

      voiceAudioRef.current = remoteAudio
    }

    const events = peerConnection.createDataChannel('oai-events')

    events.onopen = () => {
      setVoiceStatus(mode === 'assistant' ? 'Готова слушать' : 'Говорите...')
    }

    events.onmessage = ({ data }) => {
      try {
        const event = JSON.parse(String(data)) as RealtimeEvent

        if (mode === 'assistant') {
          handleVoiceAssistantEvent(event)
        } else {
          handleDictationEvent(event)
        }
      } catch (error) {
        console.error('Realtime event parse error:', error)
      }
    }

    events.onerror = () => {
      setVoiceError('Ошибка realtime-канала')
    }

    events.onclose = () => {
      if (voiceModeRef.current !== 'idle') {
        setVoiceStatus('Соединение завершено')
      }
    }

    voicePeerRef.current = peerConnection
    voiceChannelRef.current = events
    voiceStreamRef.current = sourceStream

    const offer = await peerConnection.createOffer()
    await peerConnection.setLocalDescription(offer)

    const sdpResponse = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/sdp'
      },
      body: offer.sdp || ''
    })

    if (!sdpResponse.ok) {
      let message = await sdpResponse.text()

      try {
        const json = JSON.parse(message) as { error?: string }
        message = json.error || message
      } catch {
        // keep raw message
      }

      throw new Error(message || 'Не удалось создать realtime-сессию')
    }

    await peerConnection.setRemoteDescription({
      type: 'answer',
      sdp: await sdpResponse.text()
    })
  }

  async function startVoiceAssistant() {
    if (pending || shouldBlockChat || voiceConnecting || voiceMode !== 'idle') {
      return
    }

    voiceModeRef.current = 'assistant'
    setVoiceConnecting(true)
    setVoiceError('')
    setVoiceStatus('Подключаю Анну...')
    setVoiceMode('assistant')
    assistantTranscriptRef.current = ''
    committedUserItemsRef.current.clear()
    committedAssistantResponsesRef.current.clear()
    lastRealtimeUserTextRef.current = ''
    lastRealtimeUserTextAtRef.current = 0
    lastRealtimeAssistantTextRef.current = ''
    lastRealtimeAssistantTextAtRef.current = 0
    activeResponseRef.current = false

    if (createResponseTimeoutRef.current) {
      window.clearTimeout(createResponseTimeoutRef.current)
      createResponseTimeoutRef.current = null
    }

    /*
     * Запуск происходит по клику пользователя, поэтому здесь можно безопасно
     * подготовить audio playback до прихода удалённой дорожки.
     */
    try {
      voiceAudioRef.current?.load()
    } catch {
      // audio is not created yet
    }

    try {
      await createRealtimePeerConnection({
        mode: 'assistant',
        endpoint: `/api/realtime/session?siteId=${encodeURIComponent(
          siteId
        )}&pageUrl=${encodeURIComponent(pageUrl)}`
      })
    } catch (error) {
      console.error('Voice assistant start error:', error)
      cleanupRealtime(false)
      setVoiceError(
        error instanceof Error
          ? error.message
          : 'Не удалось запустить голосовой режим'
      )
    } finally {
      setVoiceConnecting(false)
    }
  }

  async function startDictation() {
    if (pending || shouldBlockChat || voiceConnecting || voiceMode !== 'idle') {
      return
    }

    voiceModeRef.current = 'dictation'
    setVoiceConnecting(true)
    setVoiceError('')
    setVoiceStatus('Подключаю диктовку...')
    setVoiceMode('dictation')
    setDictationText('')
    dictationTranscriptRef.current = ''

    const languageQuery =
      dictationLanguage === 'auto' ? '' : `&language=${dictationLanguage}`

    try {
      await createRealtimePeerConnection({
        mode: 'dictation',
        endpoint: `/api/realtime-transcription/session?siteId=${encodeURIComponent(
          siteId
        )}&pageUrl=${encodeURIComponent(pageUrl)}${languageQuery}`
      })
    } catch (error) {
      console.error('Dictation start error:', error)
      cleanupRealtime(false)
      setVoiceError(
        error instanceof Error
          ? error.message
          : 'Не удалось запустить распознавание речи'
      )
    } finally {
      setVoiceConnecting(false)
    }
  }

  function stopDictationAndCommit() {
    dictationStoppingRef.current = true
    setVoiceStatus('Завершаю диктовку...')

    try {
      if (voiceChannelRef.current?.readyState === 'open') {
        voiceChannelRef.current.send(
          JSON.stringify({
            type: 'input_audio_buffer.commit'
          })
        )
      }
    } catch (error) {
      console.error('Dictation commit error:', error)
    }

    dictationStopTimeoutRef.current = window.setTimeout(() => {
      cleanupRealtime(true)
    }, 1800)
  }

  function stopVoiceMode() {
    if (voiceMode === 'dictation') {
      stopDictationAndCommit()
      return
    }

    cleanupRealtime(false)
  }

  function appendRealtimeUserMessage(text: string) {
    const normalizedText = normalizeTranscript(text)

    if (!normalizedText) return

    if (
      shouldSkipRecentRealtimeText({
        text: normalizedText,
        lastTextRef: lastRealtimeUserTextRef,
        lastTextAtRef: lastRealtimeUserTextAtRef
      })
    ) {
      return
    }

    setLiveUserTranscript(normalizedText)
    setMessages(current => [
      ...current,
      {
        id: uid(),
        role: 'user',
        content: normalizedText
      }
    ])

    void sendLeadFromRealtimeTranscript(normalizedText)
  }

  function appendRealtimeAssistantMessage(text: string, responseId?: string) {
    const normalizedText = normalizeTranscript(text)

    if (!normalizedText) return

    if (responseId) {
      if (committedAssistantResponsesRef.current.has(responseId)) return
      committedAssistantResponsesRef.current.add(responseId)
    }

    if (
      shouldSkipRecentRealtimeText({
        text: normalizedText,
        lastTextRef: lastRealtimeAssistantTextRef,
        lastTextAtRef: lastRealtimeAssistantTextAtRef
      })
    ) {
      return
    }

    setMessages(current => [
      ...current,
      {
        id: uid(),
        role: 'assistant',
        content: normalizedText
      }
    ])
  }

  useEffect(() => {
    setTimeout(()=>{
      setVoiceError('')
    }, 4000)
    return () => {
      cleanupRealtime(false)
    }
  }, [cleanupRealtime,voiceError])

  return {
    voiceMode,
    setVoiceMode,

    voiceConnecting,
    setVoiceConnecting,

    voiceStatus,
    setVoiceStatus,

    voiceError,
    setVoiceError,

    liveUserTranscript,
    setLiveUserTranscript,

    liveAssistantTranscript,
    setLiveAssistantTranscript,

    dictationText,
    setDictationText,

    dictationLanguage,
    setDictationLanguage,

    voicePeerRef,
    voiceChannelRef,
    voiceStreamRef,
    voiceAudioRef,
    assistantTranscriptRef,
    dictationTranscriptRef,
    committedUserItemsRef,
    committedAssistantResponsesRef,
    lastRealtimeUserTextRef,
    lastRealtimeUserTextAtRef,
    lastRealtimeAssistantTextRef,
    lastRealtimeAssistantTextAtRef,
    voiceModeRef,
    dictationStoppingRef,
    dictationStopTimeoutRef,
    activeResponseRef,
    createResponseTimeoutRef,

    startVoiceAssistant,
    startDictation,
    stopVoiceMode,
    cleanupRealtime,
    appendRealtimeUserMessage,
    appendRealtimeAssistantMessage
  }
}