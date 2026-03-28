import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-server'
import {
  postListingToChannel,
  notifyOwnerNewRequest,
  notifyRenterAccepted,
  notifyOwnerRenterContact,
  notifyRenterDeclined,
} from '@/lib/telegram'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { type } = body
  const admin = createAdminClient()

  try {
    if (type === 'new_listing') {
      const { listingId, title, dailyPrice, category, school } = body
      await postListingToChannel({ listingId, title, dailyPrice, category, school })
      return NextResponse.json({ ok: true })
    }

    if (type === 'new_request') {
      const { requestId } = body
      // Fetch request + owner chat_id + renter name
      const { data: req_ } = await admin
        .from('rental_requests')
        .select('listing_id, start_date, end_date, owner_id, renter_id, listing:listings(title), renter:profiles!renter_id(full_name, telegram_handle)')
        .eq('id', requestId)
        .single()
      if (!req_) return NextResponse.json({ ok: true })

      const { data: ownerProfile } = await admin
        .from('profiles')
        .select('telegram_chat_id')
        .eq('id', req_.owner_id)
        .single()

      if (ownerProfile?.telegram_chat_id) {
        const listing = req_.listing as unknown as { title: string } | null
        const renter = req_.renter as unknown as { full_name: string | null; telegram_handle: string | null } | null
        await notifyOwnerNewRequest({
          ownerChatId: ownerProfile.telegram_chat_id,
          renterName: renter?.full_name ?? renter?.telegram_handle ?? 'Someone',
          listingTitle: listing?.title ?? 'your item',
          startDate: req_.start_date,
          endDate: req_.end_date,
          listingId: req_.listing_id,
        })
      }
      return NextResponse.json({ ok: true })
    }

    if (type === 'accepted') {
      const { requestId } = body
      const { data: req_ } = await admin
        .from('rental_requests')
        .select('listing_id, start_date, end_date, renter_id, owner_id, listing:listings(title), renter:profiles!renter_id(telegram_handle), owner:profiles!owner_id(telegram_handle)')
        .eq('id', requestId)
        .single()
      if (!req_) return NextResponse.json({ ok: true })

      const { data: renterProfile } = await admin
        .from('profiles')
        .select('telegram_chat_id, full_name, telegram_handle')
        .eq('id', req_.renter_id)
        .single()

      const { data: ownerProfile } = await admin
        .from('profiles')
        .select('telegram_chat_id, telegram_handle')
        .eq('id', req_.owner_id)
        .single()

      const listing = req_.listing as unknown as { title: string } | null
      const title = listing?.title ?? 'the item'

      // Notify renter + share owner's Telegram
      if (renterProfile?.telegram_chat_id) {
        await notifyRenterAccepted({
          renterChatId: renterProfile.telegram_chat_id,
          ownerTelegram: ownerProfile?.telegram_handle ?? null,
          listingTitle: title,
          startDate: req_.start_date,
          endDate: req_.end_date,
          listingId: req_.listing_id,
        })
      }

      // Notify owner + share renter's Telegram (auto-connect)
      if (ownerProfile?.telegram_chat_id) {
        await notifyOwnerRenterContact({
          ownerChatId: ownerProfile.telegram_chat_id,
          renterTelegram: renterProfile?.telegram_handle ?? null,
          renterName: renterProfile?.full_name ?? renterProfile?.telegram_handle ?? 'Renter',
          listingTitle: title,
          startDate: req_.start_date,
          endDate: req_.end_date,
        })
      }
      return NextResponse.json({ ok: true })
    }

    if (type === 'declined') {
      const { requestId } = body
      const { data: req_ } = await admin
        .from('rental_requests')
        .select('listing_id, renter_id, listing:listings(title)')
        .eq('id', requestId)
        .single()
      if (!req_) return NextResponse.json({ ok: true })

      const { data: renterProfile } = await admin
        .from('profiles')
        .select('telegram_chat_id')
        .eq('id', req_.renter_id)
        .single()

      if (renterProfile?.telegram_chat_id) {
        const listing = req_.listing as unknown as { title: string } | null
        await notifyRenterDeclined({
          renterChatId: renterProfile.telegram_chat_id,
          listingTitle: listing?.title ?? 'the item',
          listingId: req_.listing_id,
        })
      }
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[telegram/notify] error:', err)
    return NextResponse.json({ ok: true }) // never fail the main flow
  }
}
