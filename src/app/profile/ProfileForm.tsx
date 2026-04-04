'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Spinner from '@/components/Spinner'

import { detectUniversity } from '@/lib/rental-utils'

type Props = {
  userId: string
  userEmail: string
  initialFullName: string
  initialTelegram: string
  initialUniversity: string
  telegramConnected: boolean
}

export default function ProfileForm({ userId, userEmail, initialFullName, initialTelegram, initialUniversity, telegramConnected }: Props) {
  const [fullName, setFullName] = useState(initialFullName)
  const [telegram, setTelegram] = useState(initialTelegram)
  const detectedUniversity = detectUniversity(userEmail)
  const [university, setUniversity] = useState(initialUniversity || detectedUniversity)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Refresh when user returns from Telegram (to show Connected badge)
  useEffect(() => {
    if (telegramConnected) return
    function onFocus() { router.refresh() }
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [telegramConnected, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSaved(false)
    setLoading(true)

    const supabase = createClient()
    const { error: upsertError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        full_name: fullName,
        telegram_handle: telegram.replace(/^@/, ''),
        university_name: university,
      })

    setLoading(false)

    if (upsertError) {
      setError(upsertError.message)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      // Redirect back if came from posting flow
      const next = new URLSearchParams(window.location.search).get('next')
      if (next) { router.refresh(); router.push(next) }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Your name"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Telegram handle <span className="text-red-500">*</span>
          <span className="ml-1 font-normal text-gray-400">(renters use this to contact you)</span>
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm select-none">@</span>
          <input
            type="text"
            value={telegram}
            onChange={(e) => setTelegram(e.target.value.replace(/^@/, ''))}
            placeholder="yourusername"
            required
            className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">University</label>
        {detectedUniversity ? (
          <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
            {university || detectedUniversity}
          </div>
        ) : (
          <input
            type="text"
            value={university}
            onChange={(e) => setUniversity(e.target.value)}
            placeholder="Your university"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          />
        )}
      </div>

      {/* Telegram notifications */}
      <div className="pt-1 border-t border-gray-100">
        <label className="block text-sm font-medium text-gray-700 mb-2">Telegram notifications</label>
        {telegramConnected ? (
          <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">
            <span>✅</span>
            <span>Connected — you'll get instant notifications via Bot</span>
          </div>
        ) : (
          <a
            href={`https://t.me/brolo_butler_bot?start=${userId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#229ED9] text-white text-sm font-semibold rounded-lg hover:bg-[#1a8bbf] transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.941z"/>
            </svg>
            Connect Telegram
          </a>
        )}
        <p className="text-xs text-gray-400 mt-1.5">Get notified instantly when you receive or get a response to a rental request.</p>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2 bg-violet-600 text-white text-sm font-semibold rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? <span className="flex items-center justify-center gap-2"><Spinner className="w-4 h-4" />Saving…</span> : 'Save profile'}
        </button>
        {saved && <span className="text-sm text-green-600">Saved!</span>}
      </div>
    </form>
  )
}
