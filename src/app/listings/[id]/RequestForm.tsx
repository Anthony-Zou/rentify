'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { calcDays, findOverlap, type BlockedRange } from '@/lib/rental-utils'

export default function RequestForm({
  listingId,
  ownerId,
  renterId,
  dailyPrice,
  minDays,
  blockedRanges,
}: {
  listingId: string
  ownerId: string
  renterId: string
  dailyPrice: number
  minDays: number
  blockedRanges: BlockedRange[]
}) {
  const today = new Date().toISOString().split('T')[0]
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    if (endDate < startDate) {
      setError('End date must be on or after start date.')
      return
    }

    const days = calcDays(startDate, endDate)
    if (days < minDays) {
      setError(`This listing requires a minimum of ${minDays} day${minDays > 1 ? 's' : ''}.`)
      return
    }

    const conflict = findOverlap(startDate, endDate, blockedRanges)
    if (conflict) {
      setError(`These dates overlap with an existing booking (${conflict.start_date} → ${conflict.end_date}). Please choose different dates.`)
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { data: inserted, error: insertError } = await supabase.from('rental_requests').insert({
      listing_id: listingId,
      renter_id: renterId,
      owner_id: ownerId,
      start_date: startDate,
      end_date: endDate,
      message: message || null,
    }).select('id').single()
    const insertedId = inserted?.id

    if (insertError) {
      setError('Failed to send request. Please try again.')
      setLoading(false)
      return
    }

    // Notify owner via Telegram (fire-and-forget)
    fetch('/api/telegram/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'new_request', requestId: insertedId }),
    }).catch(() => {})

    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-4 py-3 rounded-lg">
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        Request sent — waiting for owner to respond
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Start date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            min={today}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">End date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={startDate || today}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          />
        </div>
      </div>

      {startDate && endDate && calcDays(startDate, endDate) > 0 && (
        <div className="flex items-center justify-between bg-violet-50 border border-violet-100 rounded-lg px-4 py-3 text-sm">
          <span className="text-gray-500">{calcDays(startDate, endDate)} day{calcDays(startDate, endDate) > 1 ? 's' : ''} × ${dailyPrice}/day</span>
          <span className="font-bold text-violet-600">${calcDays(startDate, endDate) * dailyPrice} total</span>
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Message to owner <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Hi, I'd like to rent this for…"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none"
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <p className="text-xs text-gray-400 leading-relaxed">
        By requesting, you agree that all arrangements are directly between you and the owner. Borlo is a matching platform only and is not liable for any loss, damage, or disputes.
      </p>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Sending…' : 'Request to Rent →'}
      </button>
    </form>
  )
}
