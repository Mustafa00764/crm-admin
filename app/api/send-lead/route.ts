// app/api/send-lead/route.ts

import { NextResponse } from 'next/server'
import { Resend } from 'resend'

export const runtime = 'nodejs'

// Лучше хранить ключ в .env.local:
// RESEND_API_KEY=re_xxxxxxxxxxxxxxxxx

type SendLeadBody = {
  clientName?: string
  phone?: string
  product?: string
  deliveryCity?: string
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

type EmailType = {
  email: string
  key: string
}

const profnastilvtashkente: EmailType = {
  email: 'profnastilvtashkente@gmail.com',
  key: 're_2ZQ6c12d_61Egbri6Gf1JbGcsBpcwjXcJ'
}

const evroshtaketnikmoskva: EmailType = {
  email: 'evroshtaketnikmoskvachat@gmail.com',
  key: 're_R6pEraTb_8m7SDT3ywTmKujrwAmnx7hXa'
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

  if (size < 1024) {
    return `${size} B`
  }

  if (size < 1024 * 1024) {
    return `${Math.round(size / 1024)} KB`
  }

  return `${(size / 1024 / 1024).toFixed(1)} MB`
}

function formatComment(comment: SendLeadBody['comment']) {
  if (!comment) {
    return {
      text: 'Не указан',
      pageUrl: '',
      siteId: '',
      attachmentsHtml: ''
    }
  }

  if (typeof comment === 'string') {
    return {
      text: comment,
      pageUrl: '',
      siteId: '',
      attachmentsHtml: ''
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
    siteId: comment.siteId || '',
    attachmentsHtml
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as SendLeadBody

    const phone = body.phone?.trim()

    if (!phone) {
      return NextResponse.json({ error: 'Телефон обязателен' }, { status: 400 })
    }

    const formattedComment = formatComment(body.comment)

    console.log('formattedComment', formattedComment)
    console.log('body', body)

    const site =
      formattedComment.siteId === 'profnastilvtashkente'
        ? profnastilvtashkente
        : evroshtaketnikmoskva

    const resend = new Resend(site.key)

    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: site.email,
      subject: 'Новая заявка с сайта profnastilvtashkente',
      html: `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111827;">
      <h2>Новая заявка с сайта ${formattedComment.siteId}</h2>

      <p><b>Телефон:</b> ${escapeHtml(phone)}</p>

      <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 16px 0;" />

      <p><b>Комментарий клиента:</b></p>
      <p>${escapeHtml(formattedComment.text)}</p>

      <p><b>Site ID:</b> ${escapeHtml(formattedComment.siteId || 'Не указан')}</p>

      <p><b>Страница:</b> ${
        formattedComment.pageUrl
          ? `<a href="${escapeHtml(formattedComment.pageUrl)}">${escapeHtml(
              formattedComment.pageUrl
            )}</a>`
          : 'Не указана'
      }</p>

      <p><b>Прикрепленные файлы:</b></p>
      ${formattedComment.attachmentsHtml}
    </div>
  `
    })

    console.log('Resend data:', data)
    console.log('Resend error:', error)

    if (error) {
      console.error('Resend error:', error)

      return NextResponse.json(
        { error: error.message || 'Ошибка отправки письма' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true
    })
  } catch (error) {
    console.error('Send lead route error:', error)

    return NextResponse.json(
      { error: 'Ошибка отправки заявки' },
      { status: 500 }
    )
  }
}
