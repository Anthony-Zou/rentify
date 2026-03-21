import { createServerClient } from '@/lib/supabase-server'
import ListingsGrid from './ListingsGrid'
import Landing from './Landing'
import Header from '@/components/Header'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const supabase = await createServerClient()

  const [{ data: listings, error }, { data: { user } }] = await Promise.all([
    supabase
      .from('listings')
      .select('id, title, daily_price, image_url, is_available, category')
      .order('is_available', { ascending: false })
      .order('id', { ascending: false }),
    supabase.auth.getUser(),
  ])

  const listingData = listings ?? []

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} showPostButton />

      {error ? (
        <main className="max-w-6xl mx-auto px-4 py-10">
          <p className="text-red-500 text-sm">Failed to load listings. Please try again later.</p>
        </main>
      ) : user ? (
        // Logged-in: straight to listings grid
        <main className="max-w-6xl mx-auto px-4 py-10">
          <ListingsGrid listings={listingData} />
        </main>
      ) : (
        // Guest: landing page sections + listings below
        <>
          <Landing />
          <section id="listings" className="max-w-6xl mx-auto px-4 py-12">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg font-semibold text-gray-900">Available now</h2>
              <a href="/login" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                Sign up to request →
              </a>
            </div>
            <ListingsGrid listings={listingData} />
          </section>
        </>
      )}
    </div>
  )
}
