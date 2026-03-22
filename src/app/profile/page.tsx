import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerClient, createAdminClient } from '@/lib/supabase-server'
import ProfileForm from './ProfileForm'
import MyListings from './MyListings'
import RequestActions from './RequestActions'
import Header from '@/components/Header'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?next=/profile')
  }

  const [profileResult, listingsResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('full_name, telegram_handle, university_name')
      .eq('id', user.id)
      .single(),
    supabase
      .from('listings')
      .select('id, title, daily_price, image_url, is_available, created_at')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false }),
  ])

  const profile = profileResult.data
  const listings = listingsResult.data ?? []

  const { data: myRequests } = await supabase
    .from('rental_requests')
    .select('id, listing_id, start_date, end_date, status, listing:listings(title)')
    .eq('renter_id', user.id)
    .order('created_at', { ascending: false })

  let incomingRequests: {
    id: string
    start_date: string
    end_date: string
    message: string | null
    created_at: string
    listing: { title: string; image_url: string | null } | null
    renter: { full_name: string | null; telegram_handle: string | null } | null
  }[] = []
  try {
    const admin = createAdminClient()
    const { data } = await admin
      .from('rental_requests')
      .select('id, start_date, end_date, message, created_at, listing:listings(title, image_url), renter:profiles!renter_id(full_name, telegram_handle)')
      .eq('owner_id', user.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
    incomingRequests = (data ?? []) as unknown as typeof incomingRequests
  } catch {
    // Admin key not configured
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} showLogout />

      <main className="max-w-2xl mx-auto px-4 py-10 space-y-10">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-800 inline-block">
          ← Back to listings
        </Link>

        <section>
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">My profile</h1>
          <ProfileForm
            userId={user.id}
            userEmail={user.email ?? ''}
            initialFullName={profile?.full_name ?? ''}
            initialTelegram={profile?.telegram_handle ?? ''}
            initialUniversity={profile?.university_name ?? ''}
          />
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">My listings</h2>
          <MyListings listings={listings} />
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Incoming requests</h2>
          <RequestActions requests={incomingRequests} />
        </section>

        {myRequests && myRequests.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">My rental requests</h2>
            <div className="space-y-2">
              {myRequests.map((req) => {
                const statusStyles: Record<string, string> = {
                  pending: 'bg-amber-50 text-amber-700',
                  accepted: 'bg-green-50 text-green-700',
                  declined: 'bg-gray-100 text-gray-500',
                }
                const listing = req.listing as unknown as { title: string } | null
                return (
                  <a
                    key={req.id}
                    href={`/listings/${req.listing_id}`}
                    className="flex items-center justify-between bg-white rounded-xl border border-gray-200 px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{listing?.title ?? 'Listing'}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{req.start_date} → {req.end_date}</p>
                    </div>
                    <span className={`ml-4 shrink-0 text-xs font-medium px-2.5 py-1 rounded-full capitalize ${statusStyles[req.status] ?? 'bg-gray-100 text-gray-500'}`}>
                      {req.status}
                    </span>
                  </a>
                )
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
