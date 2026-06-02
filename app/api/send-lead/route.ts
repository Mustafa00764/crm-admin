// app/api/send-lead/route.ts

import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const phone = body.phone;

    if (!phone) {
      return NextResponse.json(
        { error: "Телефон обязателен" },
        { status: 400 }
      );
    }

    await resend.emails.send({
      from: "Заявки сайта profnastilvtashkente.uz",
      to: "eshchanov9@gmail.com",
      subject: "Новая заявка с сайта profnastilvtashkente",
      html: `
        <h2>Новая заявка</h2>
        <p><b>Телефон:</b> ${phone}</p>
        <p><b>Товар:</b> ${body.product || "Не указан"}</p>
        <p><b>Комментарий:</b> ${body.comment || "Не указан"}</p>
        <p><b>Город:</b> ${body.deliveryCity || "Не указан"}</p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Ошибка отправки заявки" },
      { status: 500 }
    );
  }
}