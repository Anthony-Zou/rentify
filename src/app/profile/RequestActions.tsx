'use client'

import { useState } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase'

type RentalRequest = {
  id: string
  listing_id: string
  start_date: string
  end_date: string
  message: string | null
  created_at: string
  listing: { title: string; image_url: string | null } | null
  renter: { full_name: string | null; telegram_handle: string | null } | null
}

export default function RequestActions({ requests: initial }: { requests: RentalRequest[] }) {
  const [requests, setRequests] = useState(initial)
  const [processing, setProcessing] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleAccept(id: string) {
    setProcessing(id)
    setError(null)
    const supabase = createClient()
    const { error: rpcError } = await supabase.rpc('accept_rental_request', { request_id: id })
    if (!rpcError) {
      fetch('/api/telegram/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'accepted', requestId: id }),
      }).catch(() => {})
      // Dates are blocked via the calendar (accepted rental_requests),
      // so we do NOT set is_available=false — other date ranges remain rentable.
      const accepted = requests.find((r) => r.id === id)
      setRequests((prev) =>
        prev.filter((r) => {
          if (r.id === id) return false
          if (!accepted) return true
          // Remove auto-declined overlapping requests too
          return !(r.start_date <= accepted.end_date && r.end_date >= accepted.start_date)
        })
      )
    } else {
      setError('Failed to accept request. Please try again.')
    }
    setProcessing(null)
  }

  async function handleDecline(id: string) {
    setProcessing(id)
    setError(null)
    const supabase = createClient()
    const { error } = await supabase
      .from('rental_requests')
      .update({ status: 'declined' })
      .eq('id', id)
      .eq('status', 'pending')
    if (!error) {
      fetch('/api/telegram/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'declined', requestId: id }),
      }).catch(() => {})
      setRequests((prev) => prev.filter((r) => r.id !== id))
    } else {
      setError('Failed to decline request. Please try again.')
    }
    setProcessing(null)
  }

  if (requests.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <p className="text-sm text-gray-500">No pending requests.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {error && <p className="text-sm text-red-500 px-1">{error}</p>}
      {requests.map((req) => {
        const renterName = req.renter?.full_name ?? req.renter?.telegram_handle ?? 'Someone'
        const isProcessing = processing === req.id

        return (
          <div key={req.id} className="bg-white rounded-xl border border-gray-200 p-4 flex gap-4">
            {/* Listing thumbnail */}
            <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
              {req.listing?.image_url ? (
                <Image
                  src={req.listing.image_url}
                  alt={req.listing.title ?? ''}
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

            {/* Details */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{req.listing?.title}</p>
              <p className="text-sm text-gray-500 mt-0.5">
                <span className="font-medium text-gray-700">{renterName}</span>
                {' wants to rent · '}
                {req.start_date} → {req.end_date}
              </p>
              {req.message && (
                <p className="text-sm text-gray-400 mt-1 italic truncate">&ldquo;{req.message}&rdquo;</p>
              )}

              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleAccept(req.id)}
                  disabled={isProcessing}
                  className="px-3 py-1.5 bg-violet-600 text-white text-xs font-medium rounded-lg hover:bg-violet-700 disabled:opacity-50 transition-colors"
                >
                  {isProcessing ? '…' : 'Accept'}
                </button>
                <button
                  onClick={() => handleDecline(req.id)}
                  disabled={isProcessing}
                  className="px-3 py-1.5 border border-gray-300 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  {isProcessing ? '…' : 'Decline'}
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
