import Link from 'next/link'
import { createServerClient } from '@/lib/supabase-server'
import ListingsGrid from './ListingsGrid'
import Landing from './Landing'
import Header from '@/components/Header'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const supabase = await createServerClient()

  const [{ data: listings, error }, { data: { user } }, { count: listingCount }, { count: studentCount }] = await Promise.all([
    supabase
      .from('listings')
      .select('id, title, daily_price, image_url, is_available, category, profiles!owner_id(university_name)')
      .order('is_available', { ascending: false })
      .order('id', { ascending: false }),
    supabase.auth.getUser(),
    supabase.from('listings').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
  ])

  const listingData = (listings ?? []).map((l) => {
    const raw = (l.profiles as unknown as { university_name: string | null }[] | null)?.[0]?.university_name ?? null
    return { ...l, owner_university: raw ? raw.split('—')[0].trim() : null }
  })

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
          <ListingsGrid listings={listingData} />
        </section>
      )}
    </div>
  )
}
