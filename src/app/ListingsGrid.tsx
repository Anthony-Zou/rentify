'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'

const CATEGORIES = ['All', 'Cameras', 'Gaming', 'Audio', 'Sports', 'Electronics', 'Other']

type Listing = {
  id: string
  title: string
  daily_price: number
  image_url: string | null
  is_available: boolean
  category: string
}

export default function ListingsGrid({ listings }: { listings: Listing[] }) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')

  const filtered = useMemo(() => {
    return listings.filter((l) => {
      const matchesSearch = l.title.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = category === 'All' || l.category === category
      return matchesSearch && matchesCategory
    })
  }, [listings, search, category])

  return (
    <div>
      {/* Search + filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Search items…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:max-w-xs px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white"
        />
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                category === c
                  ? 'bg-black text-white'
                  : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filtered.map((listing) => (
          <Link
            key={listing.id}
            href={`/listings/${listing.id}`}
            className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
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
                  <span className="bg-black/70 text-white text-xs font-medium px-2.5 py-1 rounded-full">
                    Rented out
                  </span>
                </div>
              )}
            </div>
            <div className="p-4">
              <h2 className="text-sm font-medium text-gray-900 truncate">{listing.title}</h2>
              <div className="mt-1 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  <span className="font-semibold text-gray-900">${listing.daily_price}</span>
                  {' '}/day
                </p>
                <span className="text-xs text-gray-400">{listing.category}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
