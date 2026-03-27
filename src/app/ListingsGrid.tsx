'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import AIComingSoon from '@/components/AIComingSoon'

const CATEGORIES = ['All', 'Cameras', 'Gaming', 'Audio', 'Sports', 'Electronics', 'Other']
const DATE_OPTIONS = [
  { label: 'Any time', value: 0 },
  { label: 'Past 1 day', value: 1 },
  { label: 'Past 3 days', value: 3 },
  { label: 'Past 5 days', value: 5 },
  { label: 'Past 7 days', value: 7 },
]

type Listing = {
  id: string
  title: string
  daily_price: number
  image_url: string | null
  is_available: boolean
  category: string
  owner_university: string | null
  owner_id: string
  created_at: string
}

export default function ListingsGrid({ listings, userId }: { listings: Listing[], userId?: string | null }) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [school, setSchool] = useState('All')
  const [days, setDays] = useState(0)
  const [hideOwn, setHideOwn] = useState(false)

  const schools = useMemo(() => {
    const names = listings.map((l) => l.owner_university).filter(Boolean) as string[]
    return ['All', ...Array.from(new Set(names)).sort()]
  }, [listings])

  const filtered = useMemo(() => {
    const cutoff = days > 0 ? new Date(Date.now() - days * 86400_000) : null
    return listings.filter((l) => {
      if (hideOwn && userId && l.owner_id === userId) return false
      if (cutoff && new Date(l.created_at) < cutoff) return false
      if (!l.title.toLowerCase().includes(search.toLowerCase())) return false
      if (category !== 'All' && l.category !== category) return false
      if (school !== 'All' && l.owner_university !== school) return false
      return true
    })
  }, [listings, search, category, school, days, hideOwn, userId])

  return (
    <div>
      {/* Search + filter bar */}
      <div className="flex flex-col gap-3 mb-6">
        {/* Row 1: search + dropdowns */}
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            placeholder="Search items…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-48 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white"
          />

          {/* School dropdown */}
          <select
            value={school}
            onChange={(e) => setSchool(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          >
            <option value="All">🎓 All schools</option>
            {schools.filter((s) => s !== 'All').map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* Posted date dropdown */}
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          >
            {DATE_OPTIONS.map(({ label, value }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>

          {/* Hide my items toggle — only shown when logged in */}
          {userId && (
            <button
              type="button"
              onClick={() => setHideOwn(!hideOwn)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold transition-colors ${
                hideOwn
                  ? 'bg-gray-800 text-white border-gray-800'
                  : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {hideOwn ? '👁 Showing others only' : 'Hide my items'}
            </button>
          )}

          <AIComingSoon
            label="Smart search"
            description="Describe what you need in plain English — e.g. 'something to film a short movie this weekend' — and AI will find the right items for you."
          >
            <button
              type="button"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-dashed border-violet-300 text-xs font-semibold text-violet-500 hover:bg-violet-50 transition-colors whitespace-nowrap"
            >
              <span>✦</span> Smart search
            </button>
          </AIComingSoon>
        </div>

        {/* Row 2: category pills */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                category === c
                  ? 'bg-violet-600 text-white shadow-sm shadow-violet-200'
                  : 'bg-white border border-gray-300 text-gray-600 hover:bg-violet-50 hover:border-violet-200 hover:text-violet-700'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <p className="text-sm text-gray-500">
          {listings.length === 0
            ? 'No items yet. Be the first to post!'
            : 'No items match your search.'}
        </p>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {filtered.map((listing) => (
          <Link
            key={listing.id}
            href={`/listings/${listing.id}`}
            className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg hover:shadow-violet-100 hover:border-violet-200 transition-all duration-200"
          >
            <div className="relative aspect-[4/3] bg-gray-100">
              {listing.image_url ? (
                <Image
                  src={listing.image_url}
                  alt={listing.title}
                  fill
                  className={`object-cover transition-transform duration-300 ${listing.is_available ? 'group-hover:scale-105' : 'opacity-50'}`}
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
              {!listing.is_available && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="bg-black/70 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                    Rented out
                  </span>
                </div>
              )}
              {/* Category pill on image */}
              <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-gray-600 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                {listing.category}
              </span>
            </div>
            <div className="p-4">
              <h2 className="text-sm font-semibold text-gray-900 truncate mb-1">{listing.title}</h2>
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm text-gray-400">
                  <span className="font-bold text-violet-600 text-base">${listing.daily_price}</span>
                  <span className="text-xs"> /day</span>
                </p>
                {listing.owner_university && (
                  <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                    {listing.owner_university}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
