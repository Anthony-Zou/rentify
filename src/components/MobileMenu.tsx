'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function MobileMenu({
  isLoggedIn,
  pendingCount,
}: {
  isLoggedIn: boolean
  pendingCount: number
}) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  async function handleSignOut() {
    setOpen(false)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <div className="md:hidden">
      {/* Hamburger / close button */}
      <button
        onClick={() => setOpen(!open)}
        className="p-2 -mr-2 text-gray-700 hover:text-gray-900 transition-colors"
        aria-label={open ? 'Close menu' : 'Open menu'}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          {open ? (
            <>
              <rect x="4" y="11" width="16" height="2" rx="1" fill="currentColor" transform="rotate(45 12 12)" />
              <rect x="4" y="11" width="16" height="2" rx="1" fill="currentColor" transform="rotate(-45 12 12)" />
            </>
          ) : (
            <>
              <rect y="4" width="24" height="2" rx="1" fill="currentColor" />
              <rect y="11" width="24" height="2" rx="1" fill="currentColor" />
              <rect y="18" width="24" height="2" rx="1" fill="currentColor" />
            </>
          )}
        </svg>
      </button>

      {open && (
        <>
          {/* Backdrop — absolute relative to sticky header, covers page below */}
          <div
            className="absolute top-full left-0 w-full bg-black/20 z-40"
            style={{ height: '200vh' }}
            onClick={() => setOpen(false)}
          />

          {/* Dropdown panel */}
          <div className="absolute top-full left-0 w-full bg-white border-t border-gray-200 shadow-sm z-50 transition-all duration-200 opacity-100 translate-y-0">
            <nav className="px-4 py-2 flex flex-col">
              <Link
                href="/pool"
                onClick={() => setOpen(false)}
                className="h-12 flex items-center gap-2 text-base text-gray-900 hover:text-gray-600 transition-colors"
              >
                Borlo Pool
                <span className="text-[9px] font-bold text-amber-500 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full leading-none">Soon</span>
              </Link>

              <Link
                href="/new"
                onClick={() => setOpen(false)}
                className="h-12 flex items-center text-base text-gray-900 hover:text-gray-600 transition-colors"
              >
                Post your item
              </Link>

              {isLoggedIn ? (
                <>
                  <Link
                    href="/profile"
                    onClick={() => setOpen(false)}
                    className="h-12 flex items-center gap-2 text-base text-gray-900 hover:text-gray-600 transition-colors"
                  >
                    My profile
                    {pendingCount > 0 && (
                      <span className="flex items-center justify-center w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full">
                        {pendingCount > 9 ? '9+' : pendingCount}
                      </span>
                    )}
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="h-12 flex items-center text-base text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="h-12 flex items-center text-base text-gray-900 hover:text-gray-600 transition-colors"
                >
                  Login
                </Link>
              )}
            </nav>
          </div>
        </>
      )}
    </div>
  )
}
