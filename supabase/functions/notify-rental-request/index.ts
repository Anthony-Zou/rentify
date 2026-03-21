import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const SITE_URL = Deno.env.get('SITE_URL') ?? 'https://borlo.app'
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') ?? 'Borlo <noreply@borlo.app>'

type RequestRecord = {
  id: string
  listing_id: string
  renter_id: string
  owner_id: string
  start_date: string
  end_date: string
  message: string | null
  status: string
}

async function sendEmail(to: string, subject: string, html: string) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Resend error: ${err}`)
  }
}

// ── INSERT: notify owner of new rental request ────────────────────────────────
async function handleNewRequest(record: RequestRecord) {
  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  const [ownerAuthResult, listingResult, renterResult] = await Promise.all([
    admin.auth.admin.getUserById(record.owner_id),
    admin.from('listings').select('title').eq('id', record.listing_id).single(),
    admin.from('profiles').select('full_name, telegram_handle').eq('id', record.renter_id).single(),
  ])

  const ownerEmail = ownerAuthResult.data.user?.email
  if (!ownerEmail) throw new Error('Owner email not found')

  const listingTitle = listingResult.data?.title ?? 'your listing'
  const renterName = renterResult.data?.full_name ?? renterResult.data?.telegram_handle ?? 'Someone'
  const listingUrl = `${SITE_URL}/listings/${record.listing_id}`
  const profileUrl = `${SITE_URL}/profile`

  const html = `
<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; color: #111; max-width: 520px; margin: 0 auto; padding: 24px;">
  <h2 style="margin: 0 0 8px;">New rental request</h2>
  <p style="color: #555; margin: 0 0 24px;">${renterName} wants to rent <strong>${listingTitle}</strong></p>
  <table style="border: 1px solid #e5e7eb; border-radius: 8px; width: 100%; border-collapse: collapse; margin-bottom: 24px;">
    <tr>
      <td style="padding: 12px 16px; border-bottom: 1px solid #f3f4f6; color: #6b7280; font-size: 13px;">Dates</td>
      <td style="padding: 12px 16px; border-bottom: 1px solid #f3f4f6; font-weight: 500;">${record.start_date} → ${record.end_date}</td>
    </tr>
    <tr>
      <td style="padding: 12px 16px; color: #6b7280; font-size: 13px;">Message</td>
      <td style="padding: 12px 16px; font-style: italic;">${record.message ?? '(no message)'}</td>
    </tr>
  </table>
  <a href="${profileUrl}" style="display: inline-block; background: #000; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-size: 14px; font-weight: 500;">
    Accept or decline →
  </a>
  <p style="margin-top: 24px; font-size: 12px; color: #9ca3af;">
    <a href="${listingUrl}" style="color: #9ca3af;">View listing</a>
  </p>
</body>
</html>`

  await sendEmail(ownerEmail, `${renterName} wants to rent "${listingTitle}"`, html)
}

// ── UPDATE: notify renter when owner accepts ──────────────────────────────────
async function handleRequestAccepted(record: RequestRecord) {
  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  const [renterAuthResult, listingResult, ownerResult] = await Promise.all([
    admin.auth.admin.getUserById(record.renter_id),
    admin.from('listings').select('title').eq('id', record.listing_id).single(),
    admin.from('profiles').select('full_name, telegram_handle').eq('id', record.owner_id).single(),
  ])

  const renterEmail = renterAuthResult.data.user?.email
  if (!renterEmail) throw new Error('Renter email not found')

  const listingTitle = listingResult.data?.title ?? 'the listing'
  const ownerName = ownerResult.data?.full_name ?? 'The owner'
  const ownerTelegram = ownerResult.data?.telegram_handle?.replace(/^@/, '') ?? null
  const listingUrl = `${SITE_URL}/listings/${record.listing_id}`

  const contactLine = ownerTelegram
    ? `You can now contact the owner directly on Telegram: <a href="https://t.me/${ownerTelegram}" style="color: #000; font-weight: 500;">@${ownerTelegram}</a>`
    : `The owner hasn't added a Telegram handle yet — they'll reach out to you directly.`

  const html = `
<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; color: #111; max-width: 520px; margin: 0 auto; padding: 24px;">
  <h2 style="margin: 0 0 8px;">Your request was accepted!</h2>
  <p style="color: #555; margin: 0 0 24px;">Good news! <strong>${ownerName}</strong> has accepted your request to rent:</p>
  <table style="border: 1px solid #e5e7eb; border-radius: 8px; width: 100%; border-collapse: collapse; margin-bottom: 24px;">
    <tr>
      <td style="padding: 12px 16px; border-bottom: 1px solid #f3f4f6; color: #6b7280; font-size: 13px;">Item</td>
      <td style="padding: 12px 16px; border-bottom: 1px solid #f3f4f6; font-weight: 500;">${listingTitle}</td>
    </tr>
    <tr>
      <td style="padding: 12px 16px; color: #6b7280; font-size: 13px;">Dates</td>
      <td style="padding: 12px 16px; font-weight: 500;">${record.start_date} → ${record.end_date}</td>
    </tr>
  </table>
  <p style="margin-bottom: 24px; font-size: 14px; line-height: 1.6;">${contactLine}</p>
  <a href="${listingUrl}" style="display: inline-block; background: #000; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-size: 14px; font-weight: 500;">
    View your request →
  </a>
  <p style="margin-top: 32px; font-size: 12px; color: #9ca3af;">— Borlo Team</p>
</body>
</html>`

  await sendEmail(renterEmail, `Your rental request was accepted — Borlo`, html)
}

// ── Main handler ──────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  let body: { type?: string; record?: Record<string, unknown>; old_record?: Record<string, unknown> }
  try {
    body = await req.json()
  } catch {
    return new Response('Invalid JSON', { status: 400 })
  }

  const { type, record, old_record } = body
  if (!record) return new Response('No record', { status: 400 })

  const req_record = record as unknown as RequestRecord

  try {
    if (type === 'INSERT') {
      await handleNewRequest(req_record)
    } else if (
      type === 'UPDATE' &&
      req_record.status === 'accepted' &&
      (old_record as RequestRecord | undefined)?.status === 'pending'
    ) {
      await handleRequestAccepted(req_record)
    }
    // All other UPDATE events (e.g. pending→declined) are intentionally ignored
  } catch (err) {
    console.error(err)
    return new Response(String(err), { status: 500 })
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
