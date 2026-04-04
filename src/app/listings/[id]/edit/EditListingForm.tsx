'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase'
import Spinner from '@/components/Spinner'

const CATEGORIES = ['Cameras', 'Gaming', 'Audio', 'Sports', 'Electronics', 'Other']

type Listing = {
  id: string
  title: string
  description: string | null
  daily_price: number
  min_days: number
  image_url: string | null
  image_urls: string[]
  owner_id: string
  category: string
}

export default function EditListingForm({ listing }: { listing: Listing }) {
  const router = useRouter()
  const [title, setTitle] = useState(listing.title)
  const [description, setDescription] = useState(listing.description ?? '')
  const [dailyPrice, setDailyPrice] = useState(String(listing.daily_price))
  const [minDays, setMinDays] = useState(listing.min_days ?? 1)
  const [category, setCategory] = useState(listing.category ?? 'Other')

  // Existing saved URLs (from DB), new files to upload
  const [savedUrls, setSavedUrls] = useState<string[]>(
    listing.image_urls?.length ? listing.image_urls : listing.image_url ? [listing.image_url] : []
  )
  const [newFiles, setNewFiles] = useState<File[]>([])
  const [newPreviews, setNewPreviews] = useState<string[]>([])

  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const totalCount = savedUrls.length + newFiles.length

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return
    const combined = [...newFiles, ...files].slice(0, 5 - savedUrls.length)
    setNewFiles(combined)
    setNewPreviews(combined.map(f => URL.createObjectURL(f)))
    e.target.value = ''
  }

  function removeSaved(index: number) {
    setSavedUrls(savedUrls.filter((_, i) => i !== index))
  }

  function removeNew(index: number) {
    const next = newFiles.filter((_, i) => i !== index)
    setNewFiles(next)
    setNewPreviews(next.map(f => URL.createObjectURL(f)))
  }

  async function handleDelete() {
    if (!confirm('Delete this listing? This cannot be undone.')) return
    setDeleting(true)
    const supabase = createClient()

    // Remove all images from storage
    const allUrls = listing.image_urls?.length ? listing.image_urls : listing.image_url ? [listing.image_url] : []
    for (const url of allUrls) {
      const path = url.split('/object/public/listing-image/')[1]
      if (path) await supabase.storage.from('listing-image').remove([decodeURIComponent(path)])
    }

    const { data: deleted, error: deleteError } = await supabase.from('listings').delete().eq('id', listing.id).select('id')
    if (deleteError) {
      setError(deleteError.message)
      setDeleting(false)
      return
    }
    if (!deleted || deleted.length === 0) {
      setError('Delete failed — you may not have permission. Check Supabase RLS policies.')
      setDeleting(false)
      return
    }
    router.refresh()
    router.push('/profile')
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const price = parseFloat(dailyPrice)
      if (isNaN(price) || price <= 0) throw new Error('Please enter a valid daily price greater than $0.')

      const supabase = createClient()

      // Upload new files
      const uploadedUrls: string[] = []
      for (const file of newFiles) {
        const ext = file.name.split('.').pop()
        const filename = `${listing.owner_id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { error: uploadError } = await supabase.storage.from('listing-image').upload(filename, file)
        if (uploadError) throw new Error(`Image upload failed: ${uploadError.message}`)
        const { data: { publicUrl } } = supabase.storage.from('listing-image').getPublicUrl(filename)
        uploadedUrls.push(publicUrl)
      }

      const allUrls = [...savedUrls, ...uploadedUrls]

      const { data: updated, error: updateError } = await supabase
        .from('listings')
        .update({
          title,
          description: description || null,
          daily_price: price,
          min_days: minDays,
          image_url: allUrls[0] ?? null,
          image_urls: allUrls,
          category,
        })
        .eq('id', listing.id)
        .select('id')
        .single()

      if (updateError || !updated) throw new Error('Failed to update listing. Please try again.')

      router.push(`/listings/${listing.id}`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-xl border border-gray-200 p-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none"
        />
      </div>

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
                  ? 'bg-black text-white'
                  : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Daily price (SGD) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm select-none">$</span>
            <input
              type="number"
              value={dailyPrice}
              onChange={(e) => setDailyPrice(e.target.value)}
              min="0"
              step="0.01"
              required
              className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          />
          <p className="text-xs text-gray-400 mt-1">
            {minDays === 1 ? 'Any duration' : minDays >= 7 ? `~${Math.round(minDays/7)}wk min` : `${minDays} days min`}
          </p>
        </div>
      </div>

      {/* Photos */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Photos <span className="text-gray-400 font-normal">(up to 5)</span>
        </label>
        {(savedUrls.length > 0 || newPreviews.length > 0) && (
          <div className="grid grid-cols-3 gap-2 mb-2">
            {savedUrls.map((url, i) => (
              <div key={`saved-${i}`} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <Image src={url} alt={`Photo ${i + 1}`} fill className="object-cover" sizes="200px" />
                <button
                  type="button"
                  onClick={() => removeSaved(i)}
                  className="absolute top-1 right-1 bg-black/60 hover:bg-black text-white text-xs w-5 h-5 rounded-full flex items-center justify-center transition-colors"
                >
                  ×
                </button>
                {i === 0 && savedUrls.length + newFiles.length > 1 && (
                  <span className="absolute bottom-1 left-1 text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded">Cover</span>
                )}
              </div>
            ))}
            {newPreviews.map((src, i) => (
              <div key={`new-${i}`} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={`New photo ${i + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeNew(i)}
                  className="absolute top-1 right-1 bg-black/60 hover:bg-black text-white text-xs w-5 h-5 rounded-full flex items-center justify-center transition-colors"
                >
                  ×
                </button>
                <span className="absolute bottom-1 left-1 text-[10px] bg-violet-600 text-white px-1.5 py-0.5 rounded">New</span>
              </div>
            ))}
          </div>
        )}
        {totalCount < 5 && (
          <label className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors bg-white text-sm text-gray-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
            </svg>
            {totalCount === 0 ? 'Add photos' : 'Add more'}
            <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
          </label>
        )}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={loading || deleting}
        className="w-full py-2.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? <span className="flex items-center justify-center gap-2"><Spinner className="w-4 h-4" />Saving…</span> : 'Save changes'}
      </button>

      <button
        type="button"
        onClick={handleDelete}
        disabled={loading || deleting}
        className="w-full py-2.5 border border-red-200 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {deleting ? <span className="flex items-center justify-center gap-2"><Spinner className="w-4 h-4" />Deleting…</span> : 'Delete listing'}
      </button>
    </form>
  )
}
