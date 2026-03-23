import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerClient, createAdminClient } from '@/lib/supabase-server'
import ProfileForm from './ProfileForm'
import MyListings from './MyListings'
import RequestActions from './RequestActions'
import ProfileTabs from './ProfileTabs'
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
      .select('id, listing_id, start_date, end_date, message, created_at, listing:listings(title, image_url), renter:profiles!renter_id(full_name, telegram_handle)')
      .eq('owner_id', user.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
    incomingRequests = (data ?? []) as unknown as typeof incomingRequests
  } catch {
    // Admin key not configured
  }

  let acceptedRequests: {
    id: string
    listing_id: string
    start_date: string
    end_date: string
    listing: { title: string } | null
    renter: { full_name: string | null; telegram_handle: string | null } | null
  }[] = []
  try {
    const admin = createAdminClient()
    const { data } = await admin
      .from('rental_requests')
      .select('id, listing_id, start_date, end_date, listing:listings(title), renter:profiles!renter_id(full_name, telegram_handle)')
      .eq('owner_id', user.id)
      .eq('status', 'accepted')
      .order('created_at', { ascending: false })
    acceptedRequests = (data ?? []) as unknown as typeof acceptedRequests
  } catch {
    // Admin key not configured
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} showLogout />

      <main className="max-w-2xl mx-auto px-4 py-10">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-800 inline-block mb-8">
          ← Back to listings
        </Link>

        <h1 className="text-2xl font-semibold text-gray-900 mb-6">My profile</h1>

        <ProfileTabs
          counts={[null, listings.length, incomingRequests.length, myRequests?.length ?? 0, acceptedRequests.length]}
          tabs={[
            {
              label: 'Profile',
              content: (
                <ProfileForm
                  userId={user.id}
                  userEmail={user.email ?? ''}
                  initialFullName={profile?.full_name ?? ''}
                  initialTelegram={profile?.telegram_handle ?? ''}
                  initialUniversity={profile?.university_name ?? ''}
                />
              ),
            },
            {
              label: 'My listings',
              content: <MyListings listings={listings} />,
            },
            {
              label: 'Requests in',
              content: <RequestActions requests={incomingRequests} />,
            },
            {
              label: 'My requests',
              content: (
                <div className="space-y-2">
                  {(myRequests ?? []).length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                      <p className="text-sm text-gray-500">No requests sent yet.</p>
                    </div>
                  ) : (myRequests ?? []).map((req) => {
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
              ),
            },
            {
              label: 'Rented out',
              content: (
                <div className="space-y-2">
                  {acceptedRequests.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                      <p className="text-sm text-gray-500">No accepted rentals yet.</p>
                    </div>
                  ) : acceptedRequests.map((req) => {
                    const renterName = req.renter?.full_name ?? req.renter?.telegram_handle ?? 'Someone'
                    return (
                      <a
                        key={req.id}
                        href={`/listings/${req.listing_id}`}
                        className="flex items-center justify-between bg-white rounded-xl border border-gray-200 px-4 py-3 hover:bg-gray-50 transition-colors"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{(req.listing as unknown as { title: string } | null)?.title ?? 'Listing'}</p>
                          <p className="text-xs text-gray-500 mt-0.5">Rented by <span className="font-medium text-gray-700">{renterName}</span> · {req.start_date} → {req.end_date}</p>
                        </div>
                        <span className="ml-4 shrink-0 text-xs font-medium px-2.5 py-1 rounded-full bg-green-50 text-green-700">
                          Accepted
                        </span>
                      </a>
                    )
                  })}
                </div>
              ),
            },
          ]}
        />
      </main>
    </div>
  )
}
