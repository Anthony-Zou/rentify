import Link from 'next/link'
import { createServerClient } from '@/lib/supabase-server'
import ListingsGrid from './ListingsGrid'
import NavProfileLink from '@/components/NavProfileLink'

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
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-gray-900 tracking-tight">
            Borlo
          </Link>
          <nav className="flex items-center gap-3">
            <Link
              href="/new"
              className="px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
            >
              Post your item
            </Link>
            {user ? (
              <NavProfileLink userId={user.id} />
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Login
              </Link>
            )}
          </nav>
        </div>
      </header>

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
