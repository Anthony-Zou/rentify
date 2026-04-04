'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import AIComingSoon from '@/components/AIComingSoon'

const CATEGORIES = ['Cameras', 'Gaming', 'Audio', 'Sports', 'Electronics', 'Other']

export default function NewListingForm({ userId }: { userId: string }) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dailyPrice, setDailyPrice] = useState('')
  const [minDays, setMinDays] = useState(1)
  const [category, setCategory] = useState('Other')
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return
    const combined = [...imageFiles, ...files].slice(0, 5) // max 5 photos
    setImageFiles(combined)
    setImagePreviews(combined.map(f => URL.createObjectURL(f)))
    e.target.value = ''
  }

  function removeImage(index: number) {
    const next = imageFiles.filter((_, i) => i !== index)
    setImageFiles(next)
    setImagePreviews(next.map(f => URL.createObjectURL(f)))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const price = parseFloat(dailyPrice)
      if (isNaN(price) || price <= 0) throw new Error('Please enter a valid daily price greater than $0.')

      const supabase = createClient()

      // Ensure a profile row exists before inserting listing (FK constraint)
      await supabase.from('profiles').upsert({ id: userId }, { onConflict: 'id', ignoreDuplicates: true })

      const urls: string[] = []
      for (const file of imageFiles) {
        const ext = file.name.split('.').pop()
        if (!ext) throw new Error('File must have a valid extension')
        const filename = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('listing-image')
          .upload(filename, file)
        if (uploadError) throw new Error(`Image upload failed: ${uploadError.message}`)
        const { data: { publicUrl } } = supabase.storage.from('listing-image').getPublicUrl(filename)
        urls.push(publicUrl)
      }

      const { data, error: insertError } = await supabase
        .from('listings')
        .insert({
          owner_id: userId,
          title,
          description: description || null,
          daily_price: price,
          min_days: minDays,
          image_url: urls[0] ?? null,
          image_urls: urls,
          category,
        })
        .select('id')
        .single()

      if (insertError) throw new Error(insertError.message)

      // Post to Telegram channel (fire-and-forget, don't block navigation)
      fetch('/api/telegram/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'new_listing',
          listingId: data.id,
          title,
          dailyPrice: price,
          category,
          school: null,
        }),
      }).catch(() => {})

      router.refresh()
      router.push(`/listings/${data.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-xl border border-gray-200 p-6">

      {/* ── AI: Generate listing from photo ─────────────────────────── */}
      <AIComingSoon
        label="Generate listing with AI"
        description="Snap a photo and AI will write the title, description, category, and suggest a price — list in under 30 seconds."
      >
        <div className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-violet-300 bg-violet-50 hover:bg-violet-100 transition-colors">
          <span className="flex-shrink-0 w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center text-white text-base">✦</span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-violet-700">Generate listing with AI</p>
            <p className="text-xs text-violet-400">Take a photo — AI fills everything in for you</p>
          </div>
          <span className="ml-auto shrink-0 text-[10px] font-bold text-violet-400 bg-violet-100 border border-violet-200 px-2 py-0.5 rounded-full">Soon</span>
        </div>
      </AIComingSoon>

      <div className="flex items-center gap-3">
        <span className="flex-1 h-px bg-gray-100" />
        <span className="text-xs text-gray-400">or fill in manually</span>
        <span className="flex-1 h-px bg-gray-100" />
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Sony A7III Camera"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Condition, accessories included, any restrictions…"
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category <span className="text-red-500">*</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
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

      {/* Daily price + min days */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700">
              Daily price (SGD) <span className="text-red-500">*</span>
            </label>
            <AIComingSoon
              label="AI price suggestion"
              description="Based on similar items on Borlo, AI will recommend a competitive daily price to maximise your bookings."
            >
              <span className="text-xs font-semibold text-violet-500 hover:text-violet-700 cursor-pointer flex items-center gap-1">
                <span>✦</span> Suggest
              </span>
            </AIComingSoon>
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm select-none">$</span>
            <input
              type="number"
              value={dailyPrice}
              onChange={(e) => setDailyPrice(e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
              required
              className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Minimum days
          </label>
          <input
            type="number"
            value={minDays}
            onChange={(e) => setMinDays(Math.max(1, parseInt(e.target.value) || 1))}
            min="1"
            max="90"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-400 mt-1">
            {minDays === 1 ? 'Any duration' : minDays >= 30 ? `${minDays} days (~${Math.round(minDays/30)}mo)` : minDays >= 7 ? `${minDays} days (~${Math.round(minDays/7)}wk)` : `${minDays} days min`}
          </p>
        </div>
      </div>

      {/* Photos */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Photos <span className="text-gray-400 font-normal">(up to 5)</span>
        </label>
        {imagePreviews.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-2">
            {imagePreviews.map((src, i) => (
              <div key={i} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 bg-black/60 hover:bg-black text-white text-xs w-5 h-5 rounded-full flex items-center justify-center transition-colors"
                >
                  ×
                </button>
                {i === 0 && (
                  <span className="absolute bottom-1 left-1 text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded">Cover</span>
                )}
              </div>
            ))}
          </div>
        )}
        {imageFiles.length < 5 && (
          <label className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors bg-white text-sm text-gray-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
            </svg>
            {imageFiles.length === 0 ? 'Add photos' : 'Add more'}
            <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
          </label>
        )}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Posting…' : 'Post item'}
      </button>
    </form>
  )
}
