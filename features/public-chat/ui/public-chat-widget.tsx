'use client'

import {
  X,
  Paperclip,
  Smile,
  Mic,
  AudioLines,
  Keyboard,
  Plus,
  ArrowUp,
  ClipboardList
} from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import Image from 'next/image'
import { Button } from '@/shared/ui/button'
import { useComposerTextarea } from '../hooks/use-composer-textarea'
import { useChatRefs } from '../hooks/use-chat-refs'
import { useChatActions } from '../hooks/use-chat-actions'
import { useChatScroll } from '../hooks/use-chat-scroll'
import { useLeadForm } from '../hooks/use-lead-form'
import { useChatState } from '../hooks/use-chat-state'
import { useChatStorage } from '../hooks/use-chat-storage'
import { useRealtimeVoice } from '../hooks/use-realtime-voice'
import {
  formatPhone,
  getPhoneCountryByValue,
  isValidPhone,
  sendLeadFromRealtimeTranscript
} from '../lib/phone'
import { useCallback } from 'react'
import { isImageFile } from '../lib/attachments'
import { submitLeadForm } from '../lib/lead-form'
import { DICTATION_LANGUAGES, QUICK_EMOJIS } from '../config/public-chat-config'

export function PublicChatWidget({
  siteId,
  theme,
  pageUrl
}: {
  siteId: string
  theme: string
  pageUrl: string
}) {
  const {
    phoneError,
    setPhoneError,
    leadFormOpen,
    setLeadFormOpen,
    formState,
    setFormState,
    leadFormSubmitted,
    setLeadFormSubmitted,
    leadForm,
    setLeadForm,
    isPending,
    setIsPending
  } = useLeadForm()

  const {
    input,
    setInput,
    pending,
    setPending,
    messages,
    setMessages,
    attachments,
    setAttachments,
    emojiOpen,
    setEmojiOpen,
    hasHydrated,
    setHasHydrated,
    shouldBlockChat
  } = useChatState({
    leadFormSubmitted,
    siteId
  })

  const { messagesEndRef, fileInputRef, textareaRef } = useChatRefs()

  useChatStorage({
    siteId,
    messages,
    leadForm,
    leadFormSubmitted,
    hasHydrated,
    setMessages,
    setLeadForm,
    setLeadFormSubmitted,
    setHasHydrated
  })

  const {
    notifyParent,
    addEmoji,
    openFileDialog,
    handleFilesChange,
    removeAttachment,
    sendMessage
  } = useChatActions({
    input,
    attachments,
    pending,
    siteId,
    pageUrl,
    messages,
    shouldBlockChat,
    textareaRef,
    messagesEndRef,
    fileInputRef,
    setInput,
    setAttachments,
    setEmojiOpen,
    setPending,
    setMessages,
    setLeadFormOpen,
    setFormState
  })

  const sendLeadFromRealtimeTranscriptHandler = useCallback(
    async (text: string) => {
      await sendLeadFromRealtimeTranscript(text, pageUrl, siteId)
    },
    [pageUrl, siteId]
  )

  const {
    voiceMode,
    voiceConnecting,
    voiceStatus,
    voiceError,
    liveUserTranscript,
    liveAssistantTranscript,
    dictationText,
    dictationLanguage,
    setDictationLanguage,
    startVoiceAssistant,
    startDictation,
    stopVoiceMode
  } = useRealtimeVoice({
    siteId,
    pageUrl,
    pending,
    shouldBlockChat,
    setInput,
    setMessages,
    sendLeadFromRealtimeTranscript: sendLeadFromRealtimeTranscriptHandler
  })

  const { isComposerExpanded } = useComposerTextarea({
    textareaRef,
    input,
    liveUserTranscript,
    liveAssistantTranscript
  })

  useChatScroll({
    messagesEndRef,
    messagesLength: messages.length,
    pending,
    liveUserTranscript,
    liveAssistantTranscript
  })

  useChatStorage({
    siteId,
    messages,
    leadForm,
    leadFormSubmitted,
    hasHydrated,
    setMessages,
    setLeadForm,
    setLeadFormSubmitted,
    setHasHydrated
  })

  const realtimePanelOpen = voiceMode !== 'idle' || voiceConnecting

  const composerClass = cn(
    'rounded-[32px] border px-3 py-2 shadow-sm transition-colors',
    theme === 'light'
      ? 'border-black/10 bg-[#fff] text-white'
      : 'border-white/10 bg-[#202124] text-white'
  )



  const composerHint =
    voiceMode === 'assistant'
      ? liveAssistantTranscript ||
        liveUserTranscript ||
        voiceStatus ||
        'Говорите с Анной…'
      : dictationText || voiceStatus || 'Говорите, я распознаю речь…'

  return (
    <div
      className={cn(
        'max-w-120 min-h-0 fixed top-0 left-0 max-h-full flex h-full w-full flex-col overflow-hidden pointer-events-auto',
        theme === 'light'
          ? 'bg-white text-slate-950'
          : 'bg-[#090b10] text-white'
      )}
    >
      <div
        className={cn(
          'flex h-14 items-center justify-between border-b px-4',
          theme === 'light' ? 'border-black/10' : 'border-white/10'
        )}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center rounded-full w-10 h-10 bg-[#08b7ef] text-white">
            <Mic className="h-6 w-6" />
          </div>

          <div className="flex flex-col gap-1">
            <div className="text-[14px] leading-4 opacity-100 font-semibold"></div>

            <div className="text-xs opacity-60 leading-3">
              Онлайн-консультант
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => notifyParent('close')}
          className="rounded-md p-2 opacity-70 hover:bg-white/10 hover:opacity-100"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div
        ref={messagesEndRef}
        className={cn(
          'min-h-0 w-full transition-all flex-1 space-y-3 overflow-x-hidden p-3 scrollbar-thin scrollbar-thumb-rounded scrollbar-track-transparent',
          theme === 'light'
            ? 'scrollbar-thumb-black/10'
            : 'scrollbar-thumb-white/20'
        )}
      >
        {messages.map(message => (
          <div
            key={message.id}
            className={cn(
              'flex',
              message.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            <div
              className={cn(
                'max-w-[82%] rounded-2xl px-3 py-2 text-sm leading-5 text-wrap',
                message.role === 'user'
                  ? 'bg-[#08b7ef] text-white'
                  : theme === 'light'
                    ? 'bg-slate-100 text-slate-900'
                    : 'bg-white/10 text-white'
              )}
            >
              {message.attachments?.length ? (
                <div className="mt-2 grid gap-2">
                  {message.attachments.map(file =>
                    isImageFile(file) ? (
                      <Image
                        unoptimized
                        width={60}
                        height={60}
                        key={file.id}
                        src={file.dataUrl}
                        alt={file.name}
                        className="max-h-40 rounded-xl object-cover"
                      />
                    ) : (
                      <div
                        key={file.id}
                        className="rounded-lg bg-black/10 px-2 py-1 text-xs"
                      >
                        📎 {file.name}
                      </div>
                    )
                  )}
                </div>
              ) : null}

              {message.content ? <div>{message.content}</div> : null}
            </div>
          </div>
        ))}

        {pending ? (
          <div
            className={cn(
              'text-xs w-[50%] flex items-end',
              theme === 'light' ? ' text-slate-900/60' : ' text-white/60'
            )}
          >
            <p>Печатает</p>

            <svg
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              className="h-2.5 ml-0.5"
            >
              <circle cx="4" cy="12" r="3">
                <animate
                  id="spinner_qFRN"
                  begin="0;spinner_OcgL.end+0.25s"
                  attributeName="cy"
                  calcMode="spline"
                  dur="0.6s"
                  values="12;6;12"
                  keySplines=".33,.66,.66,1;.33,0,.66,.33"
                />
              </circle>
              <circle cx="12" cy="12" r="3">
                <animate
                  begin="spinner_qFRN.begin+0.1s"
                  attributeName="cy"
                  calcMode="spline"
                  dur="0.6s"
                  values="12;6;12"
                  keySplines=".33,.66,.66,1;.33,0,.66,.33"
                />
              </circle>
              <circle cx="20" cy="12" r="3">
                <animate
                  id="spinner_OcgL"
                  begin="spinner_qFRN.begin+0.2s"
                  attributeName="cy"
                  calcMode="spline"
                  dur="0.6s"
                  values="12;6;12"
                  keySplines=".33,.66,.66,1;.33,0,.66,.33"
                />
              </circle>
            </svg>
          </div>
        ) : null}

        {realtimePanelOpen ? (
          <div
            className={cn(
              'rounded-2xl border px-3 py-2 text-xs leading-4',
              theme === 'light'
                ? 'border-slate-200 bg-slate-50 text-slate-600'
                : 'border-white/10 bg-white/5 text-white/70'
            )}
          >
            <div className="font-medium">
              {voiceConnecting
                ? 'Подключение...'
                : voiceMode === 'assistant'
                  ? voiceStatus || 'Голосовой разговор активен'
                  : voiceStatus || 'Диктовка активна'}
            </div>

            {liveUserTranscript ? (
              <div className="mt-1">Вы: {liveUserTranscript}</div>
            ) : null}

            {liveAssistantTranscript ? (
              <div className="mt-1">Анна: {liveAssistantTranscript}</div>
            ) : null}

            {dictationText ? (
              <div className="mt-1 whitespace-pre-wrap">{dictationText}</div>
            ) : null}
          </div>
        ) : null}
      </div>

      {leadFormOpen || shouldBlockChat ? (
        <div
          className={cn(
            'border-t p-3',
            theme === 'light'
              ? 'border-black/10 bg-slate-50'
              : 'border-white/10 bg-white/5',
            formState === 'open' ? '' : 'hidden'
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <h3 className="mb-2 text-sm font-semibold">
              Заполните форму, чтобы продолжить консультацию
            </h3>
            <Button
              variant={'ghost'}
              size={'lg'}
              onClick={() => setFormState('close')}
              className="w-9 h-9 rounded-full text-slate-900/80 hover:text-slate-900 hover:bg-black/10!"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>

          <div
            className={cn(
              'mb-3 text-xs leading-4',
              theme === 'light' ? 'text-slate-500' : 'text-white/60'
            )}
          >
            Номер телефона обязателен. Остальные поля можно заполнить по
            желанию.
          </div>

          <div className="grid gap-2">
            <div className="grid gap-1">
              <input
                value={leadForm.phone}
                inputMode="tel"
                autoComplete="tel"
                maxLength={18}
                onChange={event => {
                  const rawValue = event.target.value
                  const country = getPhoneCountryByValue(rawValue, siteId)
                  const formattedPhone = formatPhone(rawValue, country)

                  setLeadForm(current => ({
                    ...current,
                    phone: formattedPhone
                  }))

                  if (phoneError) {
                    setPhoneError('')
                  }
                }}
                onBlur={() => {
                  const country = getPhoneCountryByValue(leadForm.phone, siteId)

                  if (
                    leadForm.phone &&
                    !isValidPhone(leadForm.phone, country)
                  ) {
                    setPhoneError(
                      country === 'ru'
                        ? 'Введите номер в формате +7 XXX XXX XX XX'
                        : 'Введите номер в формате +998 XX XXX XX XX'
                    )
                  }
                }}
                placeholder={
                  siteId === 'profnastilvtashkente'
                    ? '+998 90 123 45 67'
                    : '+7 999 123 45 67'
                }
                className={cn(
                  'h-10 rounded-xl border px-3 text-sm outline-none transition',
                  phoneError
                    ? 'border-red-500 bg-red-50 text-red-900'
                    : theme === 'light'
                      ? 'border-slate-200 bg-white text-slate-950'
                      : 'border-white/10 bg-[#090b10] text-white'
                )}
              />

              {!!phoneError ? (
                <p className="px-1 text-xs text-red-500">{phoneError}</p>
              ) : null}
            </div>

            <textarea
              value={leadForm.comment}
              rows={2}
              onChange={event =>
                setLeadForm(current => ({
                  ...current,
                  comment: event.target.value
                }))
              }
              placeholder="Комментарий к заявке"
              className={cn(
                'resize-none rounded-xl border px-3 py-2 text-sm outline-none',
                theme === 'light'
                  ? 'border-slate-200 bg-white text-slate-950'
                  : 'border-white/10 bg-[#090b10] text-white'
              )}
            />

            <button
              type="button"
              onClick={() =>
                void submitLeadForm({
                  leadForm,
                  pageUrl,
                  siteId,
                  messages,
                  setPhoneError,
                  setLeadFormSubmitted,
                  setLeadFormOpen,
                  setFormState,
                  setMessages,
                  isPending,
                  setIsPending
                })
              }
              disabled={isPending}
              className="h-10 flex items-center justify-center gap-3 rounded-xl bg-[#08b7ef] text-sm font-semibold text-white disabled:bg-[#08b7ef]/50 "
            >
              {isPending ? (
                <span>
                  <svg
                    fill="white"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    className="size-6"
                  >
                    <path
                      d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z"
                      opacity=".25"
                    />
                    <path d="M10.72,19.9a8,8,0,0,1-6.5-9.79A7.77,7.77,0,0,1,10.4,4.16a8,8,0,0,1,9.49,6.52A1.54,1.54,0,0,0,21.38,12h.13a1.37,1.37,0,0,0,1.38-1.54,11,11,0,1,0-12.7,12.39A1.54,1.54,0,0,0,12,21.34h0A1.47,1.47,0,0,0,10.72,19.9Z">
                      <animateTransform
                        attributeName="transform"
                        type="rotate"
                        dur="0.75s"
                        values="0 12 12;360 12 12"
                        repeatCount="indefinite"
                      />
                    </path>
                  </svg>
                </span>
              ) : null}
              Отправить и продолжить
            </button>
          </div>
        </div>
      ) : null}

      <div
        className={cn(
          'border-t p-2 pb-4',
          theme === 'light' ? 'border-black/10' : 'border-white/10'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
          onChange={handleFilesChange}
          className="hidden"
        />

        {attachments.length ? (
          <div className="mb-2 flex gap-2 overflow-x-auto py-1.5">
            {attachments.map(file => (
              <div
                key={file.id}
                className={cn(
                  'relative flex min-w-16 max-w-28 flex-col gap-1 rounded-xl border p-1 text-xs',
                  theme === 'light'
                    ? 'border-slate-200 bg-slate-50'
                    : 'border-white/10 bg-white/5'
                )}
              >
                <button
                  type="button"
                  onClick={() => removeAttachment(file.id)}
                  className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white"
                >
                  <X className="h-3 w-3" />
                </button>

                {isImageFile(file) ? (
                  <Image
                    unoptimized
                    width={56}
                    height={56}
                    src={file.dataUrl}
                    alt={file.name}
                    className="h-14 w-14 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-14 w-20 items-center justify-center rounded-lg bg-black/10">
                    <Paperclip className="h-5 w-5 opacity-70" />
                  </div>
                )}

                <div className="truncate">{file.name}</div>
              </div>
            ))}
          </div>
        ) : null}

        {emojiOpen ? (
          <div
            className={cn(
              'mb-2 flex flex-wrap gap-1 rounded-xl border p-2',
              theme === 'light'
                ? 'border-slate-200 bg-slate-50'
                : 'border-white/10 bg-white/5'
            )}
          >
            {QUICK_EMOJIS.map(emoji => (
              <button
                key={emoji}
                type="button"
                onClick={() => addEmoji(emoji)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-lg hover:bg-black/10"
              >
                {emoji}
              </button>
            ))}
          </div>
        ) : null}

        <div className="w-full max-h-8 h-auto flex items-center gap-2 mb-1.5">
          {!realtimePanelOpen && siteId === 'profnastilvtashkente' ? (
            <div
              className={cn(
                'flex max-h-8 h-8 items-center gap-2 px-1 text-[11px]',
                theme === 'light' ? 'text-slate-500' : 'text-white/45'
              )}
            >
              <Keyboard className="h-3 w-3" />
              <span>Язык диктовки:</span>

              <div className="flex h-full overflow-y-hidden rounded-full border border-current/15">
                {DICTATION_LANGUAGES.map(language => (
                  <button
                    key={language.value}
                    type="button"
                    onClick={() => setDictationLanguage(language.value)}
                    className={cn(
                      'h-full px-3 text-[11px] transition font-medium',
                      dictationLanguage === language.value
                        ? 'bg-[#08b7ef] text-white'
                        : 'hover:bg-current/10'
                    )}
                  >
                    {language.label}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {(leadFormOpen || shouldBlockChat) && formState === 'close' ? (
            <Button
              variant={'ghost'}
              size={'lg'}
              onClick={() => setFormState('open')}
              className="w-8 h-8 rounded-full border-none text-white bg-[#08b7ef]/80 hover:bg-[#08b7ef]! ml-auto"
            >
              <ClipboardList className="w-6 h-6" />
            </Button>
          ) : null}
        </div>

        {voiceError ? (
          <div className="mb-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-500">
            {voiceError}
          </div>
        ) : null}

        {realtimePanelOpen ? (
          <div className={cn('flex items-center gap-2', composerClass)}>
            <button
              type="button"
              disabled
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-900/80 opacity-60"
              title="Прикрепить файл"
            >
              <Plus className="h-6 w-6" strokeWidth={2} />
            </button>

            <div className="min-w-0 flex-1">
              <div className="truncate text-[16px] font-medium text-slate-900">
                {voiceConnecting ? 'Подключение...' : composerHint}
              </div>

              <div className="mt-0.5 truncate text-xs text-slate-900/45">
                {voiceMode === 'assistant'
                  ? 'Голосовой разговор с AI ассистентом'
                  : 'Диктовка в текст'}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black/5 text-slate-900">
                {voiceMode === 'assistant' ? (
                  <AudioLines className="h-5 w-5" />
                ) : (
                  <Mic className="h-5 w-5" />
                )}
              </div>

              <button
                type="button"
                onClick={stopVoiceMode}
                disabled={voiceConnecting}
                className="flex h-9 items-center gap-2 rounded-full bg-[#08b7ef] px-5 text-[14px] font-semibold text-s transition hover:bg-[#16c3fb] disabled:opacity-60"
              >
                <span className="flex items-end gap-0.75">
                  <span className="h-2.5 w-1 rounded-full bg-white animate-pulse" />
                  <span className="h-4 w-1 rounded-full bg-white animate-pulse" />
                  <span className="h-2 w-1 rounded-full bg-white animate-pulse" />
                  <span className="h-1.5 w-1 rounded-full bg-white/80" />
                </span>

                {voiceConnecting ? 'Подключение...' : 'Завершить'}
              </button>
            </div>
          </div>
        ) : (
          <div
            className={cn(
              'transition-all duration-200',
              composerClass,
              isComposerExpanded
                ? 'grid grid-cols-1 gap-1'
                : 'grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2'
            )}
          >
            {!isComposerExpanded ? (
              <button
                type="button"
                onClick={openFileDialog}
                disabled={pending || shouldBlockChat}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-900/85 transition hover:bg-black/5 disabled:opacity-50 disabled:pointer-events-none"
                title="Прикрепить файл"
              >
                <Plus className="h-6 w-6" strokeWidth={2} />
              </button>
            ) : null}

            <div className="min-w-0 flex items-center">
              <textarea
                ref={textareaRef}
                value={input}
                rows={1}
                disabled={shouldBlockChat}
                onChange={event => {
                  setInput(event.target.value)

                  event.currentTarget.style.height = 'auto'
                  event.currentTarget.style.height = `${Math.min(
                    event.currentTarget.scrollHeight,
                    112
                  )}px`
                }}
                onKeyDown={event => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault()
                    void sendMessage()
                  }
                }}
                placeholder={
                  shouldBlockChat
                    ? 'Заполните форму...'
                    : 'Введите...'
                }
                className="min-h-9 w-full max-h-45 resize-none overflow-y-auto border-0 bg-transparent px-1 py-2 text-[14px] leading-5 text-slate-900 outline-none placeholder:text-black/45 disabled:opacity-60"
              />
            </div>

            <div
              className={cn(
                'flex shrink-0 items-center gap-1',
                isComposerExpanded ? 'justify-between' : 'self-center'
              )}
            >
              {isComposerExpanded ? (
                <button
                  type="button"
                  onClick={openFileDialog}
                  disabled={pending || shouldBlockChat}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-900/85 transition hover:bg-black/5 disabled:opacity-50 disabled:pointer-events-none"
                  title="Прикрепить файл"
                >
                  <Plus className="h-6 w-6" strokeWidth={2} />
                </button>
              ) : null}

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setEmojiOpen(current => !current)}
                  disabled={pending || shouldBlockChat}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-slate-900/75 transition hover:bg-black/5 hover:text-slate-900 disabled:opacity-50 disabled:pointer-events-none"
                  title="Смайлики"
                >
                  <Smile className="h-5 w-5" />
                </button>

                <button
                  type="button"
                  onClick={() => void startDictation()}
                  disabled={pending || shouldBlockChat}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-slate-900/80 transition hover:bg-black/5 hover:text-slate-900 disabled:opacity-50 disabled:pointer-events-none"
                  title="Диктовка: распознать речь в текст"
                >
                  <Mic className="h-6 w-6" />
                </button>

                {input.trim() || attachments.length ? (
                  <button
                    type="button"
                    disabled={pending || shouldBlockChat}
                    onClick={() => void sendMessage()}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-[#08b7ef] text-white transition hover:scale-[1.02] hover:bg-[#16c3fb] disabled:opacity-50 disabled:pointer-events-none"
                    title="Отправить"
                  >
                    <ArrowUp className="h-6 w-6" strokeWidth={2.4} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => void startVoiceAssistant()}
                    disabled={pending || shouldBlockChat}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-[#08b7ef] text-white transition hover:scale-[1.02] hover:bg-[#16c3fb] disabled:opacity-50 disabled:pointer-events-none"
                    title="Говорить с AI ассистентом"
                  >
                    <AudioLines className="h-6 w-6" strokeWidth={2.2} />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
