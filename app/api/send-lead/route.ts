// app/api/send-lead/route.ts

import { NextResponse } from 'next/server'
import { Resend } from 'resend'

export const runtime = 'nodejs'

const resend = new Resend('re_cck4yn6G_BVzYCkYppPjEKYNcq8QacY8Z')

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

function escapeHtml(value: unknown) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function formatComment(comment: SendLeadBody['comment']) {
  if (!comment) {
    return {
      text: 'Не указан',
      pageUrl: '',
      siteId: '',
      attachmentsHtml: 'Нет'
    }
  }

  if (typeof comment === 'string') {
    return {
      text: comment,
      pageUrl: '',
      siteId: '',
      attachmentsHtml: 'Нет'
    }
  }

  const attachments = comment.attachments ?? []

  return {
    text: comment.text || 'Не указан',
    pageUrl: comment.pageUrl || '',
    siteId: comment.siteId || '',
    attachmentsHtml: attachments.length
      ? `<ul>${attachments
          .map(
            file =>
              `<li>${escapeHtml(file.name)} — ${escapeHtml(file.type)}, ${escapeHtml(file.size)} bytes</li>`
          )
          .join('')}</ul>`
      : 'Нет'
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

    const result = await resend.emails.send({
      // ВАЖНО: пока домен не подтверждён, используй onboarding@resend.dev
      from: 'onboarding@resend.dev',

      // Если на доменную почту не уходит, временно проверь на Gmail
      to: 'info@profnastilvtashkente.uz',

      subject: 'Новая заявка с сайта profnastilvtashkente',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111827;">
          <h2>Новая заявка с сайта profnastilvtashkente.uz</h2>

          <p><b>Телефон:</b> ${escapeHtml(phone)}</p>
          <p><b>Имя:</b> ${escapeHtml(body.clientName || 'Не указано')}</p>
          <p><b>Товар:</b> ${escapeHtml(body.product || 'Не указан')}</p>
          <p><b>Город:</b> ${escapeHtml(body.deliveryCity || 'Не указан')}</p>

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

    console.log('Resend result:', result)

    if (result.error) {
      console.error('Resend error:', result.error)

      return NextResponse.json(
        {
          error:
            result.error.message ||
            JSON.stringify(result.error) ||
            'Ошибка отправки письма через Resend'
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data
    })
  } catch (error) {
    console.error('Send lead route error:', error)

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Ошибка отправки заявки'
      },
      { status: 500 }
    )
  }
}
