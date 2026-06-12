// app/api/send-lead/route.ts

import { NextResponse } from 'next/server'
import { Resend } from 'resend'

export const runtime = 'nodejs'

type SendLeadBody = {
  clientName?: string
  phone?: string
  product?: string
  deliveryCity?: string
  messages?: Array<{
    id: string
    content: string
    role: 'user' | 'assistant'
  }>
  comment?:
    | string
    | {
        text?: string
        pageUrl?: string
        siteId?: string
        attachments?: Array<{
          name: string
          type: string
          size: number
        }>
      }
}

type SiteConfig = {
  email: string
  apiKey: string
  from: string
}

const sites: Record<string, SiteConfig> = {
  profnastilvtashkente: {
    email: 'profnastilvtashkente@gmail.com',
    apiKey:
      process.env.RESEND_API_KEY_PROFNASTILVTASHKENTE ||
      're_2ZQ6c12d_61Egbri6Gf1JbGcsBpcwjXcJ',
    from: 'onboarding@resend.dev'
  },

  evroshtaketnikmoskva: {
    email: 'evroshtaketnikmoskvachat@gmail.com',
    apiKey:
      process.env.RESEND_API_KEY_EVROSHTAKETNIKMOSKVA ||
      're_R6pEraTb_8m7SDT3ywTmKujrwAmnx7hXa',
    from: 'onboarding@resend.dev'
  }
}

function escapeHtml(value: unknown) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function formatFileSize(size: number) {
  if (!Number.isFinite(size)) return 'не указан'

  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`

  return `${(size / 1024 / 1024).toFixed(1)} MB`
}

function formatComment(comment: SendLeadBody['comment']) {
  if (!comment) {
    return {
      text: 'Не указан',
      pageUrl: '',
      siteId: 'evroshtaketnikmoskva',
      attachmentsHtml: 'Нет'
    }
  }

  if (typeof comment === 'string') {
    return {
      text: comment,
      pageUrl: '',
      siteId: 'evroshtaketnikmoskva',
      attachmentsHtml: 'Нет'
    }
  }

  const attachments = comment.attachments ?? []

  const attachmentsHtml = attachments.length
    ? `
      <ul>
        ${attachments
          .map(
            file => `
              <li>
                ${escapeHtml(file.name)}
                — ${escapeHtml(file.type || 'тип не указан')},
                ${escapeHtml(formatFileSize(file.size))}
              </li>
            `
          )
          .join('')}
      </ul>
    `
    : 'Нет'

  return {
    text: comment.text || 'Не указан',
    pageUrl: comment.pageUrl || '',
    siteId: comment.siteId || 'evroshtaketnikmoskva',
    attachmentsHtml
  }
}

function formatChatMessages(messages?: SendLeadBody['messages']) {
  if (!messages?.length) return '<p>Нет сообщений</p>'

  return messages
    .map(message => {
      const isAssistant = message.role === 'assistant'

      return `
        <div style="
          width: 100%;
          margin-bottom: 12px;
          display: flex;
        ">
          <div style="
            max-width: 80%;
            padding: 8px 12px;
            font-size: 14px;
            line-height: 20px;
            border-radius: 11px;
            color: ${isAssistant ? '#111827' : '#ffffff'};
            background-color: ${isAssistant ? '#f1f5f9' : '#08b7ef'};
            margin-left: ${isAssistant ? '0' : 'auto'}
          ">
            ${escapeHtml(message.content)}
          </div>
        </div>
      `
    })
    .join('')
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as SendLeadBody

    const phone = body.phone?.trim()

    if (!phone) {
      return NextResponse.json({ error: 'Телефон обязателен' }, { status: 400 })
    }

    const formattedComment = formatComment(body.comment)
    const siteId = formattedComment.siteId

    const site = sites[siteId]

    if (!site.apiKey) {
      return NextResponse.json(
        { error: 'Не указан RESEND API KEY для сайта' },
        { status: 500 }
      )
    }

    const resend = new Resend(site.apiKey)

    const chatMessages = formatChatMessages(body.messages)

    const { data, error } = await resend.emails.send({
      from: site.from,
      to: [site.email],
      subject: `Новая заявка с сайта ${siteId}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111827;">
          <h2>Новая заявка с сайта ${escapeHtml(siteId)}</h2>

          <p><b>Телефон:</b> ${escapeHtml(phone)}</p>

          <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 16px 0;" />

          <p><b>Комментарий клиента:</b></p>
          <p>${escapeHtml(formattedComment.text)}</p>

          <p><b>Site ID:</b> ${escapeHtml(siteId)}</p>

          <p><b>Страница:</b> ${
            formattedComment.pageUrl
              ? `<a href="${escapeHtml(formattedComment.pageUrl)}">${escapeHtml(
                  formattedComment.pageUrl
                )}</a>`
              : 'Не указана'
          }</p>

          <p><b>Прикрепленные файлы:</b></p>
          ${formattedComment.attachmentsHtml}

          <p><b>Чат с клиентом:</b></p>
          <div style="max-width: 400px; width: 100%; background-color: rgba(8,183,239,0.04); padding: 12px; border-radius: 16px;">
            ${chatMessages}
          </div>

        </div>
      `
    })

    if (error) {
      console.error('Resend error:', error)

      return NextResponse.json(
        { error: error.message || 'Ошибка отправки письма' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data
    })
  } catch (error) {
    console.error('Send lead route error:', error)

    return NextResponse.json(
      { error: 'Ошибка отправки заявки' },
      { status: 500 }
    )
  }
}
