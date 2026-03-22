import { NextRequest, NextResponse } from 'next/server'

const RESEND_API_KEY = process.env.RESEND_API_KEY!
const FROM_EMAIL = process.env.FROM_EMAIL ?? 'Borlo <noreply@borlo.app>'
const FEEDBACK_TO = process.env.FEEDBACK_EMAIL ?? 'hello@borlo.app'

export async function POST(req: NextRequest) {
  const { type, message, email, name } = await req.json()

  if (!message?.trim()) {
    return NextResponse.json({ error: 'Message is required.' }, { status: 400 })
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: FEEDBACK_TO,
      reply_to: email || undefined,
      subject: `[Borlo Feedback] ${type ?? 'General'}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
          <h2 style="color:#7C3AED;margin-bottom:4px">New feedback on Borlo</h2>
          <p style="color:#888;font-size:14px;margin-top:0">Submitted via borlo.app</p>
          <hr style="border:none;border-top:1px solid #eee;margin:20px 0"/>
          <table style="font-size:14px;color:#333;width:100%;border-collapse:collapse">
            <tr><td style="padding:6px 0;color:#888;width:100px">Type</td><td style="padding:6px 0;font-weight:600">${type ?? '—'}</td></tr>
            <tr><td style="padding:6px 0;color:#888">Name</td><td style="padding:6px 0">${name || '—'}</td></tr>
            <tr><td style="padding:6px 0;color:#888">Email</td><td style="padding:6px 0">${email || '—'}</td></tr>
          </table>
          <hr style="border:none;border-top:1px solid #eee;margin:20px 0"/>
          <p style="font-size:14px;color:#333;white-space:pre-wrap;line-height:1.6">${message.trim()}</p>
        </div>
      `,
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    console.error('Resend error:', res.status, body)
    return NextResponse.json({ error: 'Failed to send.', detail: body }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
