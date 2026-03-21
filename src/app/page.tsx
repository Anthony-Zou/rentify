import { createServerClient } from '@/lib/supabase-server'
import ListingsGrid from './ListingsGrid'
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} showPostButton />

      <main className="max-w-6xl mx-auto px-4 py-10">
        {error ? (
          <p className="text-red-500 text-sm">Failed to load listings. Please try again later.</p>
        ) : (
          <ListingsGrid listings={listings ?? []} />
        )}
      </main>
    </div>
  )
}
