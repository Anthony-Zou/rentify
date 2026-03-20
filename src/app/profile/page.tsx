import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerClient, createAdminClient } from '@/lib/supabase-server'
import ProfileForm from './ProfileForm'
import MyListings from './MyListings'
import LogoutButton from './LogoutButton'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?next=/profile')
  }

  const admin = createAdminClient()

  const [profileResult, listingsResult] = await Promise.all([
    admin
      .from('profiles')
      .select('full_name, telegram_handle, university_name')
      .eq('id', user.id)
      .single(),
    admin
      .from('listings')
      .select('id, title, daily_price, image_url, is_available, created_at')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false }),
  ])

  const profile = profileResult.data
  const listings = listingsResult.data ?? []

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-gray-900 tracking-tight">
            Rentify
          </Link>
          <LogoutButton />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-10 space-y-10">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-800 inline-block">
          ← Back to listings
        </Link>

        {/* Profile form */}
        <section>
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">My profile</h1>
          <ProfileForm
            userId={user.id}
            initialFullName={profile?.full_name ?? ''}
            initialTelegram={profile?.telegram_handle ?? ''}
            initialUniversity={profile?.university_name ?? ''}
          />
        </section>

        {/* My listings */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">My listings</h2>
          <MyListings listings={listings} />
        </section>
      </main>
    </div>
  )
}
