import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createServerClient, createAdminClient } from '@/lib/supabase-server'
import OwnerControls from './OwnerControls'
import ShareButtons from './ShareButtons'
import RequestForm from './RequestForm'
import AvailabilityCalendar from './AvailabilityCalendar'
import Header from '@/components/Header'

export const dynamic = 'force-dynamic'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://borlo.app'

export default async function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const supabase = await createServerClient()

  const [listingResult, userResult] = await Promise.all([
    supabase
      .from('listings')
      .select('id, title, description, daily_price, min_days, image_url, image_urls, owner_id, is_available, category')
      .eq('id', id)
      .single(),
    supabase.auth.getUser(),
  ])

  if (listingResult.error || !listingResult.data) notFound()

  const listing = listingResult.data
  const user = userResult.data.user
  const isOwner = user?.id === listing.owner_id

  let owner: { full_name: string | null; telegram_handle: string | null; university_name: string | null } | null = null
  let blockedRanges: { start_date: string; end_date: string }[] = []
  try {
    const admin = createAdminClient()
    const [ownerResult, blockedResult] = await Promise.all([
      admin.from('profiles').select('full_name, telegram_handle, university_name').eq('id', listing.owner_id).single(),
      admin.from('rental_requests').select('start_date, end_date').eq('listing_id', id).eq('status', 'accepted'),
    ])
    owner = ownerResult.data
    blockedRanges = blockedResult.data ?? []
  } catch {
    // Admin key not configured — owner info and calendar unavailable
  }

  let existingRequest: { id: string; status: string } | null = null
  if (user && !isOwner) {
    const { data } = await supabase
      .from('rental_requests')
      .select('id, status')
      .eq('listing_id', id)
      .eq('renter_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    existingRequest = data
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} />

      <main className="max-w-3xl mx-auto px-4 py-10">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-800 mb-6 inline-block">
          ← All listings
        </Link>

        {/* Owner controls — only visible to the listing owner */}
        {isOwner && (
          <OwnerControls
            listingId={listing.id}
            isAvailable={listing.is_available}
          />
        )}

        {(() => {
          const imgs: string[] = listing.image_urls?.length ? listing.image_urls : listing.image_url ? [listing.image_url] : []
          if (imgs.length === 0) return null
          if (imgs.length === 1) return (
            <div className="relative w-full aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden mb-6">
              <Image src={imgs[0]} alt={listing.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 672px" priority />
            </div>
          )
          return (
            <div className="mb-6 space-y-2">
              <div className="relative w-full aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden">
                <Image src={imgs[0]} alt={listing.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 672px" priority />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {imgs.slice(1).map((url, i) => (
                  <div key={i} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <Image src={url} alt={`${listing.title} ${i + 2}`} fill className="object-cover" sizes="168px" />
                  </div>
                ))}
              </div>
            </div>
          )
        })()}

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{listing.title}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="text-xs font-semibold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">
                  {listing.category}
                </span>
                {!listing.is_available && (
                  <span className="text-xs font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                    Currently rented out
                  </span>
                )}
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-2xl font-bold text-violet-600">${listing.daily_price}</span>
              <span className="text-sm text-gray-500 ml-1">/day</span>
              {listing.min_days > 1 && (
                <p className="text-xs text-gray-400 mt-0.5">{listing.min_days}-day minimum</p>
              )}
            </div>
          </div>

          {listing.description && (
            <p className="text-gray-600 text-sm leading-relaxed mb-6 whitespace-pre-line">
              {listing.description}
            </p>
          )}

          {owner?.full_name && (
            <p className="text-sm text-gray-500 mb-6">
              Posted by{' '}
              <span className="font-medium text-gray-700">{owner.full_name}</span>
              {owner.university_name && (
                <span className="text-gray-400"> · {owner.university_name}</span>
              )}
            </p>
          )}

          <hr className="border-gray-100 mb-6" />

          <div className="mb-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Availability</h2>
            <AvailabilityCalendar blockedRanges={blockedRanges} />
          </div>

          <hr className="border-gray-100 mb-6" />

          <div>
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Request to rent</h2>

            {isOwner ? (
              <p className="text-sm text-gray-400">This is your listing.</p>
            ) : !user ? (
              <Link
                href={`/login?next=/listings/${listing.id}`}
                className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Login to request rental
              </Link>
            ) : existingRequest?.status === 'accepted' ? (
              owner?.telegram_handle ? (
                <a
                  href={`https://t.me/${owner.telegram_handle.replace(/^@/, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-lg hover:bg-violet-700 transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.941z" />
                  </svg>
                  Owner accepted! Contact @{owner.telegram_handle.replace(/^@/, '')}
                </a>
              ) : (
                <p className="text-sm text-green-700 bg-green-50 px-4 py-3 rounded-lg">
                  Owner accepted your request! Ask them to add a Telegram handle to their profile.
                </p>
              )
            ) : existingRequest?.status === 'pending' ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-4 py-3 rounded-lg">
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Request sent — waiting for owner to respond
                </div>
                <div className="flex gap-4">
                  <form action={async () => {
                    'use server'
                    const supabase = await createServerClient()
                    await supabase.from('rental_requests').delete().eq('id', existingRequest!.id).eq('renter_id', user!.id)
                    const { redirect } = await import('next/navigation')
                    redirect(`/listings/${listing.id}?change=1`)
                  }}>
                    <button type="submit" className="text-xs text-violet-500 hover:text-violet-700 transition-colors">
                      Change dates
                    </button>
                  </form>
                  <form action={async () => {
                    'use server'
                    const supabase = await createServerClient()
                    await supabase.from('rental_requests').delete().eq('id', existingRequest!.id).eq('renter_id', user!.id)
                    const { redirect } = await import('next/navigation')
                    redirect(`/listings/${listing.id}`)
                  }}>
                    <button type="submit" className="text-xs text-gray-400 hover:text-red-500 transition-colors">
                      Cancel request
                    </button>
                  </form>
                </div>
              </div>
            ) : existingRequest?.status === 'declined' ? (
              <>
                <p className="text-sm text-amber-700 bg-amber-50 px-4 py-3 rounded-lg mb-4">
                  Your previous request was declined. You can request different dates below.
                </p>
                <RequestForm
                  listingId={listing.id}
                  ownerId={listing.owner_id}
                  renterId={user.id}
                  dailyPrice={listing.daily_price}
                  minDays={listing.min_days ?? 1}
                  blockedRanges={blockedRanges}
                />
              </>
            ) : (
              <RequestForm
                listingId={listing.id}
                ownerId={listing.owner_id}
                renterId={user.id}
                dailyPrice={listing.daily_price}
                minDays={listing.min_days ?? 1}
                blockedRanges={blockedRanges}
              />
            )}
          </div>

          <ShareButtons
            title={listing.title}
            dailyPrice={listing.daily_price}
            listingUrl={`${SITE_URL}/listings/${listing.id}`}
          />
        </div>
      </main>
    </div>
  )
}
