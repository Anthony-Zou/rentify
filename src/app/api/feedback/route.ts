import { NextRequest, NextResponse } from 'next/server'

const RESEND_API_KEY = process.env.RESEND_API_KEY!
const FROM_EMAIL = process.env.FROM_EMAIL ?? 'Borlo <noreply@borlo.app>'
const FEEDBACK_TO = process.env.FEEDBACK_EMAIL ?? 'hello@borlo.app'

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const message: string = typeof body.message === 'string' ? body.message : ''
  const type: string = typeof body.type === 'string' ? body.type.slice(0, 50) : 'General'
  const name: string = typeof body.name === 'string' ? body.name.slice(0, 100) : ''
  const email: string = typeof body.email === 'string' ? body.email.slice(0, 200) : ''

  if (!message.trim()) {
    return NextResponse.json({ error: 'Message is required.' }, { status: 400 })
  }
  if (message.length > 5000) {
    return NextResponse.json({ error: 'Message is too long (max 5000 characters).' }, { status: 400 })
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
      subject: `[Borlo Feedback] ${escapeHtml(type)}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
          <h2 style="color:#7C3AED;margin-bottom:4px">New feedback on Borlo</h2>
          <p style="color:#888;font-size:14px;margin-top:0">Submitted via borlo.app</p>
          <hr style="border:none;border-top:1px solid #eee;margin:20px 0"/>
          <table style="font-size:14px;color:#333;width:100%;border-collapse:collapse">
            <tr><td style="padding:6px 0;color:#888;width:100px">Type</td><td style="padding:6px 0;font-weight:600">${escapeHtml(type)}</td></tr>
            <tr><td style="padding:6px 0;color:#888">Name</td><td style="padding:6px 0">${escapeHtml(name) || '—'}</td></tr>
            <tr><td style="padding:6px 0;color:#888">Email</td><td style="padding:6px 0">${escapeHtml(email) || '—'}</td></tr>
          </table>
          <hr style="border:none;border-top:1px solid #eee;margin:20px 0"/>
          <p style="font-size:14px;color:#333;white-space:pre-wrap;line-height:1.6">${escapeHtml(message.trim())}</p>
        </div>
      `,
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    console.error('Resend error:', res.status, body)
    return NextResponse.json({ error: 'Failed to send feedback. Please try again.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
