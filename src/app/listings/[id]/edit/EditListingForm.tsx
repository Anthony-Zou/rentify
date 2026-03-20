'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase'

type Listing = {
  id: string
  title: string
  description: string | null
  daily_price: number
  image_url: string | null
  owner_id: string
}

export default function EditListingForm({ listing }: { listing: Listing }) {
  const router = useRouter()
  const [title, setTitle] = useState(listing.title)
  const [description, setDescription] = useState(listing.description ?? '')
  const [dailyPrice, setDailyPrice] = useState(String(listing.daily_price))
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete() {
    if (!confirm('Delete this listing? This cannot be undone.')) return
    setDeleting(true)
    const supabase = createClient()

    if (listing.image_url) {
      const oldPath = listing.image_url.split('/object/public/listing-image/')[1]
      if (oldPath) await supabase.storage.from('listing-image').remove([decodeURIComponent(oldPath)])
    }

    const { error: deleteError } = await supabase.from('listings').delete().eq('id', listing.id)
    if (deleteError) {
      setError(deleteError.message)
      setDeleting(false)
      return
    }
    router.push('/profile')
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const supabase = createClient()
      let imageUrl = listing.image_url

      if (imageFile) {
        // Delete old image from storage before uploading the new one
        if (listing.image_url) {
          const oldPath = listing.image_url.split('/object/public/listing-image/')[1]
          if (oldPath) await supabase.storage.from('listing-image').remove([decodeURIComponent(oldPath)])
        }

        const ext = imageFile.name.split('.').pop()
        const filename = `${listing.owner_id}/${Date.now()}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('listing-image')
          .upload(filename, imageFile)
        if (uploadError) throw new Error(`Image upload failed: ${uploadError.message}`)

        const { data: { publicUrl } } = supabase.storage
          .from('listing-image')
          .getPublicUrl(filename)
        imageUrl = publicUrl
      }

      const { data: updated, error: updateError } = await supabase
        .from('listings')
        .update({
          title,
          description: description || null,
          daily_price: parseFloat(dailyPrice),
          image_url: imageUrl,
        })
        .eq('id', listing.id)
        .select('id')
        .single()

      if (updateError) throw new Error(updateError.message)
      if (!updated) throw new Error('Update failed — check that you have permission to edit this listing.')

      router.push(`/listings/${listing.id}`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
      setLoading(false)
    }
  }

  const currentImage = imagePreview ?? listing.image_url

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
        <label className="block text-sm font-medium text-gray-700 mb-1">Photo</label>
        {currentImage ? (
          <div className="relative w-full aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden">
            {imagePreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <Image src={currentImage} alt={title} fill className="object-cover" sizes="672px" />
            )}
            <button
              type="button"
              onClick={() => { setImageFile(null); setImagePreview(null) }}
              className="absolute top-2 right-2 bg-black/60 hover:bg-black text-white text-xs px-2 py-1 rounded-md transition-colors"
            >
              {imagePreview ? 'Remove new' : 'Replace'}
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
        disabled={loading || deleting}
        className="w-full py-2.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Saving…' : 'Save changes'}
      </button>

      <button
        type="button"
        onClick={handleDelete}
        disabled={loading || deleting}
        className="w-full py-2.5 border border-red-200 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {deleting ? 'Deleting…' : 'Delete listing'}
      </button>
    </form>
  )
}
