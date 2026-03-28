const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://borlo.app'
const BOT_USERNAME = 'brolo_butler_bot'

const apiBase = () => `https://api.telegram.org/bot${BOT_TOKEN}`

/** Send a message to any chat (user DM or channel) */
export async function sendTelegramMessage(chatId: string | number, text: string): Promise<boolean> {
  if (!BOT_TOKEN) return false
  try {
    const res = await fetch(`${apiBase()}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
    })
    if (!res.ok) {
      const body = await res.text()
      console.error('[telegram] sendMessage failed:', res.status, body)
      return false
    }
    return true
  } catch (err) {
    console.error('[telegram] sendMessage error:', err)
    return false
  }
}

/** Post a new listing to the Borlo channel */
export async function postListingToChannel({
  title,
  dailyPrice,
  category,
  school,
  listingId,
}: {
  title: string
  dailyPrice: number
  category: string
  school: string | null
  listingId: string
}): Promise<boolean> {
  if (!BOT_TOKEN || !CHANNEL_ID) return false
  const schoolTag = school ? ` · ${school}` : ''
  const text =
    `📦 <b>${escapeHtml(title)}</b>\n` +
    `💰 $${dailyPrice}/day${schoolTag}\n` +
    `🏷 ${escapeHtml(category)}\n` +
    `🔗 ${SITE_URL}/listings/${listingId}`
  return sendTelegramMessage(CHANNEL_ID, text)
}

/** Notify owner that a new rental request came in */
export async function notifyOwnerNewRequest({
  ownerChatId,
  renterName,
  listingTitle,
  startDate,
  endDate,
  listingId,
}: {
  ownerChatId: string
  renterName: string
  listingTitle: string
  startDate: string
  endDate: string
  listingId: string
}): Promise<boolean> {
  const text =
    `🔔 <b>New rental request!</b>\n\n` +
    `<b>${escapeHtml(renterName)}</b> wants to rent your <b>${escapeHtml(listingTitle)}</b>\n` +
    `📅 ${startDate} → ${endDate}\n\n` +
    `👉 <a href="${SITE_URL}/profile">Review request →</a>`
  return sendTelegramMessage(ownerChatId, text)
}

/** Notify renter their request was accepted, share owner's Telegram */
export async function notifyRenterAccepted({
  renterChatId,
  ownerTelegram,
  listingTitle,
  startDate,
  endDate,
  listingId,
}: {
  renterChatId: string
  ownerTelegram: string | null
  listingTitle: string
  startDate: string
  endDate: string
  listingId: string
}): Promise<boolean> {
  const contactLine = ownerTelegram
    ? `📱 Contact the owner: <a href="https://t.me/${ownerTelegram.replace(/^@/, '')}">@${ownerTelegram.replace(/^@/, '')}</a>`
    : `📱 The owner will contact you via Telegram.`
  const text =
    `✅ <b>Request accepted!</b>\n\n` +
    `<b>${escapeHtml(listingTitle)}</b>\n` +
    `📅 ${startDate} → ${endDate}\n\n` +
    contactLine + `\n\n` +
    `📍 Meet at a campus CCTV location (library, SSC, or faculty lobby) and verify identity at handover.\n\n` +
    `🔗 <a href="${SITE_URL}/listings/${listingId}">View listing →</a>`
  return sendTelegramMessage(renterChatId, text)
}

/** Notify owner of new renter's Telegram after acceptance (auto-connect) */
export async function notifyOwnerRenterContact({
  ownerChatId,
  renterTelegram,
  renterName,
  listingTitle,
  startDate,
  endDate,
}: {
  ownerChatId: string
  renterTelegram: string | null
  renterName: string
  listingTitle: string
  startDate: string
  endDate: string
}): Promise<boolean> {
  const contactLine = renterTelegram
    ? `📱 Reach them at: <a href="https://t.me/${renterTelegram.replace(/^@/, '')}">@${renterTelegram.replace(/^@/, '')}</a>`
    : `📱 Renter does not have a Telegram handle set — check their profile.`
  const text =
    `🤝 <b>You accepted a request!</b>\n\n` +
    `<b>${escapeHtml(renterName)}</b> is renting <b>${escapeHtml(listingTitle)}</b>\n` +
    `📅 ${startDate} → ${endDate}\n\n` +
    contactLine + `\n\n` +
    `📍 Arrange a campus CCTV handover location.`
  return sendTelegramMessage(ownerChatId, text)
}

/** Notify renter their request was declined */
export async function notifyRenterDeclined({
  renterChatId,
  listingTitle,
  listingId,
}: {
  renterChatId: string
  listingTitle: string
  listingId: string
}): Promise<boolean> {
  const text =
    `❌ <b>Request declined</b>\n\n` +
    `Your request for <b>${escapeHtml(listingTitle)}</b> was declined by the owner.\n\n` +
    `🔗 <a href="${SITE_URL}/listings/${listingId}">Try different dates →</a>`
  return sendTelegramMessage(renterChatId, text)
}

/** Generate deep link for connecting a user's Telegram account to Borlo */
export function getTelegramConnectLink(userId: string): string {
  return `https://t.me/${BOT_USERNAME}?start=${userId}`
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}
