import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase-server'
import NewListingForm from './NewListingForm'
import Header from '@/components/Header'

export default async function NewListingPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?next=/new')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, telegram_handle')
    .eq('id', user.id)
    .single()

  const isProfileComplete = !!profile?.telegram_handle

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} />

      <main className="max-w-2xl mx-auto px-4 py-10">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-800 mb-6 inline-block">
          ← Back
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900 mb-8">Post an item</h1>

        {isProfileComplete ? (
          <NewListingForm userId={user.id} />
        ) : (
          <div className="bg-white rounded-2xl border border-amber-200 p-8 text-center">
            <div className="text-4xl mb-4">👤</div>
            <h2 className="text-base font-semibold text-gray-900 mb-2">Complete your profile first</h2>
            <p className="text-sm text-gray-500 leading-relaxed mb-2 max-w-sm mx-auto">
              You need a <span className="font-semibold text-gray-700">Telegram handle</span> on your profile before posting. Renters use it to contact you once a request is accepted.
            </p>
            <p className="text-xs text-gray-400 mb-6">Takes 30 seconds — then come straight back here.</p>
            <Link
              href="/profile?next=/new"
              className="inline-block px-5 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-lg hover:bg-violet-700 transition-colors"
            >
              Set up profile →
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
