'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase'

type Listing = {
  id: string
  title: string
  daily_price: number
  image_url: string | null
  is_available: boolean
  created_at: string
}

export default function MyListings({ listings: initial }: { listings: Listing[] }) {
  const [listings, setListings] = useState(initial)
  const [toggling, setToggling] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  async function toggleAvailability(id: string, current: boolean) {
    setToggling(id)
    const supabase = createClient()
    const { error } = await supabase
      .from('listings')
      .update({ is_available: !current })
      .eq('id', id)

    if (!error) {
      setListings((prev) =>
        prev.map((l) => (l.id === id ? { ...l, is_available: !current } : l))
      )
    }
    setToggling(null)
  }

  async function deleteListing(id: string) {
    if (!confirm('Delete this listing? This cannot be undone.')) return
    setDeleting(id)
    const supabase = createClient()

    // Delete image from storage first
    const listing = listings.find((l) => l.id === id)
    if (listing?.image_url) {
      const oldPath = listing.image_url.split('/object/public/listing-image/')[1]
      if (oldPath) await supabase.storage.from('listing-image').remove([decodeURIComponent(oldPath)])
    }

    const { data: deleted, error } = await supabase.from('listings').delete().eq('id', id).select('id')
    if (!error && deleted && deleted.length > 0) {
      setListings((prev) => prev.filter((l) => l.id !== id))
    } else if (!error) {
      alert('Delete failed — you may not have permission. Check Supabase RLS policies.')
    }
    setDeleting(null)
  }

  if (listings.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <p className="text-sm text-gray-500 mb-4">You haven&apos;t posted anything yet.</p>
        <Link
          href="/new"
          className="inline-block px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
        >
          Post your first item
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {listings.map((listing) => (
        <div
          key={listing.id}
          className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4"
        >
          {/* Thumbnail */}
          <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
            {listing.image_url ? (
              <Image
                src={listing.image_url}
                alt={listing.title}
                fill
                className="object-cover"
                sizes="64px"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <Link
              href={`/listings/${listing.id}`}
              className="text-sm font-medium text-gray-900 hover:underline truncate block"
            >
              {listing.title}
            </Link>
            <p className="text-sm text-gray-500">${listing.daily_price}/day</p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => toggleAvailability(listing.id, listing.is_available)}
              disabled={toggling === listing.id || deleting === listing.id}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors disabled:opacity-50 ${
                listing.is_available
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {toggling === listing.id ? '…' : listing.is_available ? 'Available' : 'Unavailable'}
            </button>

            <button
              onClick={() => deleteListing(listing.id)}
              disabled={deleting === listing.id || toggling === listing.id}
              className="p-1.5 text-gray-400 hover:text-red-500 disabled:opacity-50 transition-colors"
              title="Delete listing"
            >
              {deleting === listing.id ? (
                <span className="text-xs">…</span>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
