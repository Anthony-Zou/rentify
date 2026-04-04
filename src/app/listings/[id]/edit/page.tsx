import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase-server'
import EditListingForm from './EditListingForm'
import Header from '@/components/Header'

export const dynamic = 'force-dynamic'

export default async function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: listing, error } = await supabase
    .from('listings')
    .select('id, title, description, daily_price, min_days, image_url, image_urls, owner_id, category')
    .eq('id', id)
    .single()

  if (error || !listing) notFound()
  if (listing.owner_id !== user.id) notFound()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} />

      <main className="max-w-2xl mx-auto px-4 py-10">
        <Link href={`/listings/${id}`} className="text-sm text-gray-500 hover:text-gray-800 mb-6 inline-block">
          ← Back to listing
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900 mb-8">Edit listing</h1>
        <EditListingForm listing={listing} />
      </main>
    </div>
  )
}
