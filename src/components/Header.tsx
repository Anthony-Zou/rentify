import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase-server'
import MobileMenu from './MobileMenu'
import LogoutButton from './LogoutButton'

type HeaderProps = {
  user: { id: string } | null
  /** Show "Post your item" CTA — homepage only */
  showPostButton?: boolean
  /** Show logout button instead of profile link — profile page only */
  showLogout?: boolean
}

export default async function Header({ user, showPostButton = false, showLogout = false }: HeaderProps) {
  let pendingCount = 0
  if (user) {
    try {
      const admin = createAdminClient()
      const { count } = await admin
        .from('rental_requests')
        .select('id', { count: 'exact', head: true })
        .eq('owner_id', user.id)
        .eq('status', 'pending')
      pendingCount = count ?? 0
    } catch {
      // Admin key not configured
    }
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10 relative">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-black text-violet-600 tracking-tight hover:text-violet-700 transition-colors">
          Borlo
        </Link>

        {/* ── Desktop nav (hidden on mobile) ─────────────────────────── */}
        <nav className="hidden md:flex items-center gap-3">
          {showLogout ? (
            <LogoutButton />
          ) : (
            <>
              {showPostButton && (
                <Link
                  href="/new"
                  className="px-4 py-2 bg-violet-600 text-white text-sm font-semibold rounded-lg hover:bg-violet-700 transition-colors"
                >
                  Post your item
                </Link>
              )}
              {user ? (
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
              ) : (
                <Link
                  href="/login"
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Login
                </Link>
              )}
            </>
          )}
        </nav>

        {/* ── Mobile hamburger (hidden on desktop) ───────────────────── */}
        <MobileMenu isLoggedIn={!!user} pendingCount={pendingCount} />
      </div>
    </header>
  )
}
