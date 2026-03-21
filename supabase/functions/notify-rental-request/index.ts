import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const SITE_URL = Deno.env.get('SITE_URL') ?? 'https://borlo.app'
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') ?? 'Borlo <noreply@borlo.app>'

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  let body: { record?: Record<string, unknown> }
  try {
    body = await req.json()
  } catch {
    return new Response('Invalid JSON', { status: 400 })
  }

  const record = body.record
  if (!record) return new Response('No record', { status: 400 })

  const { id, listing_id, renter_id, owner_id, start_date, end_date, message } = record as {
    id: string
    listing_id: string
    renter_id: string
    owner_id: string
    start_date: string
    end_date: string
    message: string | null
  }

  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  // Fetch owner email, listing title, and renter name in parallel
  const [ownerAuthResult, listingResult, renterResult] = await Promise.all([
    admin.auth.admin.getUserById(owner_id),
    admin.from('listings').select('title').eq('id', listing_id).single(),
    admin.from('profiles').select('full_name, telegram_handle').eq('id', renter_id).single(),
  ])

  const ownerEmail = ownerAuthResult.data.user?.email
  if (!ownerEmail) {
    return new Response('Owner email not found', { status: 404 })
  }

  const listingTitle = listingResult.data?.title ?? 'your listing'
  const renterName =
    renterResult.data?.full_name ??
    renterResult.data?.telegram_handle ??
    'Someone'

  const listingUrl = `${SITE_URL}/listings/${listing_id}`
  const profileUrl = `${SITE_URL}/profile`

  const emailBody = `
<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; color: #111; max-width: 520px; margin: 0 auto; padding: 24px;">
  <h2 style="margin: 0 0 8px;">New rental request</h2>
  <p style="color: #555; margin: 0 0 24px;">${renterName} wants to rent <strong>${listingTitle}</strong></p>

  <table style="border: 1px solid #e5e7eb; border-radius: 8px; width: 100%; border-collapse: collapse; margin-bottom: 24px;">
    <tr>
      <td style="padding: 12px 16px; border-bottom: 1px solid #f3f4f6; color: #6b7280; font-size: 13px;">Dates</td>
      <td style="padding: 12px 16px; border-bottom: 1px solid #f3f4f6; font-weight: 500;">${start_date} → ${end_date}</td>
    </tr>
    <tr>
      <td style="padding: 12px 16px; color: #6b7280; font-size: 13px;">Message</td>
      <td style="padding: 12px 16px; font-style: italic;">${message ?? '(no message)'}</td>
    </tr>
  </table>

  <a href="${profileUrl}" style="display: inline-block; background: #000; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-size: 14px; font-weight: 500;">
    Accept or decline →
  </a>

  <p style="margin-top: 24px; font-size: 12px; color: #9ca3af;">
    <a href="${listingUrl}" style="color: #9ca3af;">View listing</a>
  </p>
</body>
</html>
`

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: ownerEmail,
      subject: `${renterName} wants to rent "${listingTitle}"`,
      html: emailBody,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error('Resend error:', err)
    return new Response(`Email send failed: ${err}`, { status: 500 })
  }

  return new Response(JSON.stringify({ ok: true, requestId: id }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
