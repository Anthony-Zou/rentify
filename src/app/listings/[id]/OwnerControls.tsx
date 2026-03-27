'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

type Props = {
  listingId: string
  isAvailable: boolean
}

export default function OwnerControls({ listingId, isAvailable: initial }: Props) {
  const router = useRouter()
  const [isAvailable, setIsAvailable] = useState(initial)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function toggleAvailability() {
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error: toggleError } = await supabase
      .from('listings')
      .update({ is_available: !isAvailable })
      .eq('id', listingId)

    if (!toggleError) {
      setIsAvailable(!isAvailable)
      router.refresh()
    } else {
      setError('Failed to update. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-center justify-between gap-4 flex-wrap">
      <div>
        <p className="text-sm font-medium text-amber-800">Your listing</p>
        {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={toggleAvailability}
          disabled={loading}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors disabled:opacity-50 ${
            isAvailable
              ? 'bg-green-100 text-green-700 hover:bg-green-200'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {loading ? '…' : isAvailable ? 'Available' : 'Rented out'}
        </button>
        <Link
          href={`/listings/${listingId}/edit`}
          className="px-3 py-1.5 bg-white border border-gray-300 rounded-full text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Edit
        </Link>
      </div>
    </div>
  )
}
