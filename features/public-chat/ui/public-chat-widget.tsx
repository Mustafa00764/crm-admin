'use client'

import * as React from 'react'
import { Bot, Send, X } from 'lucide-react'
import { cn } from '@/shared/lib/cn'

type PublicChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

function uid() {
  return `msg_${Date.now()}_${Math.random().toString(16).slice(2)}`
}

export function PublicChatWidget({
  siteId,
  theme,
  pageUrl
}: {
  siteId: string
  theme: string
  pageUrl: string
}) {
  const [opened, setOpened] = React.useState(false)
  const [input, setInput] = React.useState('')
  const [pending, setPending] = React.useState(false)
  const messagesEndRef = React.useRef<HTMLDivElement>(null)
  const [messages, setMessages] = React.useState<PublicChatMessage[]>([
    {
      id: uid(),
      role: 'assistant',
      content:
        'Здравствуйте. Напишите, какой материал нужен, город доставки и примерный объём. Я помогу сориентироваться.'
    }
  ])

  function notifyParent(type: 'open' | 'close') {
    window.parent.postMessage(
      {
        source: 'omni-crm-widget',
        type
      },
      '*'
    )
  }

  function extractPhone(text: string): string | null {
    const phoneRegex =
      /(?:\+?\s*998[\s\-()]*)?(?:\d{2}[\s\-()]*\d{3}[\s\-()]*\d{2}[\s\-()]*\d{2})/

    const match = text.match(phoneRegex)

    if (!match) {
      return null
    }

    const digits = match[0].replace(/\D/g, '')

    // Формат: +998901234567
    if (digits.startsWith('998') && digits.length === 12) {
      return `+${digits}`
    }

    // Формат: 901234567 или 90 123 45 67
    if (digits.length === 9) {
      return `+998${digits}`
    }

    return null
  }

  const sendMessage = React.useCallback(async () => {
    const text = input.trim()

    if (!text || pending) return

    const userMessage: PublicChatMessage = {
      id: uid(),
      role: 'user',
      content: text
    }

    setInput('')
    setMessages(current => [...current, userMessage])
    setPending(true)

    try {
      const response = await fetch('/api/public-chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          siteId,
          pageUrl,
          messages: [...messages, userMessage].map(message => ({
            role: message.role,
            content: message.content
          }))
        })
      })
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })

      if (response.ok) {
        const phone = extractPhone(text)

        if (phone) {
          await fetch('/api/send-lead', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              phone,
              comment: userMessage
            })
          })
        }
      }

      const data = (await response.json()) as {
        text?: string
        error?: string
      }

      if (!response.ok) {
        throw new Error(data.error ?? 'AI request failed')
      }

      setMessages(current => [
        ...current,
        {
          id: uid(),
          role: 'assistant',
          content: data.text ?? 'Не удалось получить ответ.'
        }
      ])
    } catch {
      setMessages(current => [
        ...current,
        {
          id: uid(),
          role: 'assistant',
          content:
            'Сейчас не удалось получить ответ. Оставьте телефон, менеджер свяжется с вами.'
        }
      ])
    } finally {
      setPending(false)
    }
  }, [input, pending, siteId, pageUrl, messages])

  if (!opened) {
    return (
      <button
        type="button"
        onClick={() => {
          setOpened(true)
          notifyParent('open')
        }}
        className="fixed bottom-0 right-0 flex h-14 w-14 items-center justify-center rounded-full bg-[#08b7ef] text-white shadow-xl"
      >
        <Bot className="h-6 w-6" />
      </button>
    )
  }

  return (
    <div
      className={cn(
        'max-w-120 min-h-155 max-h-155 flex h-full w-full flex-col overflow-hidden rounded-[18px] border',
        theme === 'light'
          ? 'bg-white text-slate-950 border-black/10'
          : 'bg-[#090b10] text-white border-white/10'
      )}
    >
      <div
        className={cn(
          'flex h-14 items-center justify-between border-b border-white/10 px-4',
          theme === 'light' ? 'border-black/10' : 'border-white/10'
        )}
      >
        <div>
          <div className="text-sm font-semibold">AI Assistant</div>
          <div className="text-xs opacity-60">Онлайн-консультант</div>
        </div>

        <button
          type="button"
          onClick={() => {
            setOpened(false)
            notifyParent('close')
          }}
          className="rounded-md p-2 opacity-70 hover:bg-white/10 hover:opacity-100"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div ref={messagesEndRef} className="min-h-0 flex-1 space-y-3 overflow-auto p-3">
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
                'max-w-[82%] rounded-2xl px-3 py-2 text-sm leading-5',
                message.role === 'user'
                  ? 'bg-[#08b7ef] text-white'
                  : theme === 'light'
                    ? 'bg-slate-100 text-slate-900'
                    : 'bg-white/10 text-white'
              )}
            >
              {message.content}
            </div>
          </div>
        ))}

        {pending ? (
          <div className="text-xs opacity-60">AI печатает...</div>
        ) : null}
      </div>

      <div className="border-t border-white/10 p-3">
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <textarea
            value={input}
            rows={1}
            onChange={event => setInput(event.target.value)}
            onKeyDown={event => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                void sendMessage()
              }
            }}
            placeholder="Введите сообщение..."
            className={cn(
              'min-h-10 resize-none rounded-xl border px-3 py-2 text-sm outline-none',
              theme === 'light'
                ? 'border-slate-200 bg-white text-slate-950'
                : 'border-white/10 bg-white/5 text-white'
            )}
          />

          <button
            type="button"
            disabled={pending || !input.trim()}
            onClick={() => void sendMessage()}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#08b7ef] text-white disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
