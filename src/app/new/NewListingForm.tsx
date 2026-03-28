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
  const [category, setCategory] = useState('Other')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
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

      let imageUrl: string | null = null

      if (imageFile) {
        const ext = imageFile.name.split('.').pop()
        if (!ext || ext.length === 0) throw new Error('File must have a valid extension')
        const filename = `${userId}/${Date.now()}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('listing-image')
          .upload(filename, imageFile)
        if (uploadError) throw new Error(`Image upload failed: ${uploadError.message}`)

        const { data: { publicUrl } } = supabase.storage
          .from('listing-image')
          .getPublicUrl(filename)
        imageUrl = publicUrl
      }

      const { data, error: insertError } = await supabase
        .from('listings')
        .insert({
          owner_id: userId,
          title,
          description: description || null,
          daily_price: price,
          image_url: imageUrl,
          category,
        })
        .select('id')
        .single()

      if (insertError) throw new Error(insertError.message)

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

      {/* Daily price */}
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
              <span>✦</span> Suggest price
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

      {/* Image upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Photo
        </label>
        {imagePreview ? (
          <div className="relative w-full aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => { setImageFile(null); setImagePreview(null) }}
              className="absolute top-2 right-2 bg-black/60 hover:bg-black text-white text-xs px-2 py-1 rounded-md transition-colors"
            >
              Remove
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full aspect-[4/3] border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors bg-white">
            <svg className="w-8 h-8 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm text-gray-400">Click to upload</span>
            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
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
