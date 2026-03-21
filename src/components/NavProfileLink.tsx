import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase-server'

export default async function NavProfileLink({ userId }: { userId: string }) {
  let pendingCount = 0
  try {
    const admin = createAdminClient()
    const { count } = await admin
      .from('rental_requests')
      .select('id', { count: 'exact', head: true })
      .eq('owner_id', userId)
      .eq('status', 'pending')
    pendingCount = count ?? 0
  } catch {
    // Admin key not configured — badge unavailable
  }

  return (
    <Link
      href="/profile"
      className="relative px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
    >
      My profile
      {pendingCount > 0 && (
        <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full">
          {pendingCount > 9 ? '9+' : pendingCount}
        </span>
      )}
    </Link>
  )
}
