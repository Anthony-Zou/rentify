import Link from 'next/link'
import { createServerClient, createAdminClient } from '@/lib/supabase-server'
import ListingsGrid from './ListingsGrid'
import Landing from './Landing'
import Header from '@/components/Header'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const supabase = await createServerClient()
  const admin = createAdminClient()

  const [{ data: listings, error }, { data: { user } }, { count: listingCount }, { count: studentCount }] = await Promise.all([
    supabase
      .from('listings')
      .select('id, title, daily_price, image_url, is_available, category, owner_id, created_at, profiles!owner_id(university_name)')
      .order('is_available', { ascending: false })
      .order('created_at', { ascending: false }),
    supabase.auth.getUser(),
    supabase.from('listings').select('*', { count: 'exact', head: true }),
    admin.from('profiles').select('*', { count: 'exact', head: true }),
  ])

  const listingData = (listings ?? []).map((l) => {
    const profileData = Array.isArray(l.profiles) ? l.profiles[0] : l.profiles
    const raw = (profileData as any)?.university_name ?? null
    const university = raw && typeof raw === 'string' ? raw.split('—')[0].trim() : raw
    return { ...l, owner_university: university, owner_id: l.owner_id, created_at: l.created_at }
  })

  // Fallback: listings missing university_name (e.g. seed data) — fetch via admin
  const missingOwnerIds = Array.from(new Set(
    listingData.filter(l => !l.owner_university).map(l => l.owner_id)
  ))
  if (missingOwnerIds.length > 0) {
    const { data: ownerProfiles } = await admin
      .from('profiles')
      .select('id, university_name')
      .in('id', missingOwnerIds)
    if (ownerProfiles && ownerProfiles.length > 0) {
      const uniMap = Object.fromEntries(ownerProfiles.map(p => [p.id, p.university_name]))
      listingData.forEach(l => {
        if (!l.owner_university && uniMap[l.owner_id]) l.owner_university = uniMap[l.owner_id]
      })
    }
  }

  let profileIncomplete = false
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('telegram_handle')
      .eq('id', user.id)
      .single()
    profileIncomplete = !profile?.telegram_handle
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} showPostButton />

      {/* Profile incomplete banner */}
      {user && profileIncomplete && (
        <div className="bg-amber-50 border-b border-amber-200">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
            <p className="text-sm text-amber-800">
              <span className="font-semibold">Profile incomplete —</span> add your Telegram handle so renters can reach you after a booking is accepted.
            </p>
            <Link
              href="/profile"
              className="shrink-0 text-xs font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              Complete profile →
            </Link>
          </div>
        </div>
      )}

      <Landing isLoggedIn={!!user} listingCount={listingCount ?? 0} studentCount={studentCount ?? 0} />


      {error ? (
        <main className="max-w-6xl mx-auto px-4 py-10">
          <p className="text-red-500 text-sm">Failed to load listings. Please try again later.</p>
        </main>
      ) : (
        <section id="listings" className="max-w-6xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-semibold text-gray-900">Available now</h2>
            {!user && (
              <a href="/login" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                Sign up to request →
              </a>
            )}
          </div>
          <ListingsGrid listings={listingData} userId={user?.id ?? null} />
        </section>
      )}
    </div>
  )
}
