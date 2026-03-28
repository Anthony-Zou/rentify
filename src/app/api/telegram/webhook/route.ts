import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-server'
import { sendTelegramMessage } from '@/lib/telegram'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const message = body?.message
  if (!message) return NextResponse.json({ ok: true })

  const chatId = message.chat?.id
  const text: string = message.text ?? ''

  // Handle /start {userId} — user is linking their Telegram to Borlo
  if (text.startsWith('/start')) {
    const parts = text.trim().split(' ')
    const userId = parts[1] // the Borlo user ID passed as deep link param

    if (userId) {
      const admin = createAdminClient()
      const { error } = await admin
        .from('profiles')
        .update({ telegram_chat_id: String(chatId) })
        .eq('id', userId)

      if (!error) {
        await sendTelegramMessage(
          chatId,
          `✅ <b>Connected!</b>\n\nYour Telegram is now linked to Borlo. You'll get instant notifications for rental requests, acceptances, and declines.\n\n🔗 <a href="https://borlo.app">Open Borlo →</a>`
        )
      } else {
        await sendTelegramMessage(
          chatId,
          `⚠️ Something went wrong linking your account. Please try again from your Borlo profile.`
        )
      }
    } else {
      // /start with no payload — generic welcome
      await sendTelegramMessage(
        chatId,
        `👋 Hi! I'm the Borlo Butler.\n\nTo link your Telegram account for notifications, go to your <a href="https://borlo.app/profile">Borlo profile</a> and click "Connect Telegram".`
      )
    }
  }

  return NextResponse.json({ ok: true })
}
